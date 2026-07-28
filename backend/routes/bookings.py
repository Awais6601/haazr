from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter()

class BookingData(BaseModel):
    customer_id: str
    worker_id: int
    service: str
    address: str
    scheduled_at: str
    price: Optional[float] = None

class ReviewData(BaseModel):
    booking_id: int
    customer_id: str
    worker_id: int
    rating: int
    comment: Optional[str] = None

@router.post("/")
def create_booking(data: BookingData):
    try:
        result = supabase.table("bookings").insert({
            "customer_id": data.customer_id,
            "worker_id": data.worker_id,
            "service": data.service,
            "address": data.address,
            "scheduled_at": data.scheduled_at,
            "price": data.price,
            "status": "pending"
        }).execute()
        return {"message": "Booking created!", "booking": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
def get_all_bookings():
    try:
        result = supabase.table("bookings").select(
            "*, workers(*, profiles(*)), profiles(*)"
        ).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/customer/{customer_id}")
def get_customer_bookings(customer_id: str):
    try:
        result = supabase.table("bookings").select(
            "*, workers(*, profiles(*), categories(*))"
        ).eq("customer_id", customer_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/worker/{worker_id}")
def get_worker_bookings(worker_id: int):
    try:
        result = supabase.table("bookings").select(
            "*, profiles(*)"
        ).eq("worker_id", worker_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{booking_id}/status")
def update_status(booking_id: int, status: str):
    valid = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail="Invalid status")
    try:
        result = supabase.table("bookings").update(
            {"status": status}
        ).eq("id", booking_id).execute()

        # If completed — update worker rating
        if status == "completed":
            booking = result.data[0]
            worker_id = booking["worker_id"]
            reviews = supabase.table("reviews").select("rating").eq("worker_id", worker_id).execute()
            if reviews.data:
                avg = sum(r["rating"] for r in reviews.data) / len(reviews.data)
                supabase.table("workers").update({
                    "rating": round(avg, 1),
                    "total_reviews": len(reviews.data)
                }).eq("id", worker_id).execute()

        return {"message": "Status updated!", "booking": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/review")
def submit_review(data: ReviewData):
    try:
        # Insert review
        supabase.table("reviews").insert({
            "booking_id": data.booking_id,
            "customer_id": data.customer_id,
            "worker_id": data.worker_id,
            "rating": data.rating,
            "comment": data.comment or ""
        }).execute()

        # Update booking status to reviewed
        supabase.table("bookings").update(
            {"status": "completed"}
        ).eq("id", data.booking_id).execute()

        # Recalculate worker rating
        reviews = supabase.table("reviews").select("rating").eq("worker_id", data.worker_id).execute()
        if reviews.data:
            avg = sum(r["rating"] for r in reviews.data) / len(reviews.data)
            supabase.table("workers").update({
                "rating": round(avg, 1),
                "total_reviews": len(reviews.data)
            }).eq("id", data.worker_id).execute()

        return {"message": "Review submitted!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reviews/customer/{customer_id}")
async def get_customer_reviews(customer_id: str):
    try:
        res = supabase.table("reviews").select("*").eq("customer_id", customer_id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/review/{review_id}")
async def update_review(review_id: int, data: dict):
    try:
        res = supabase.table("reviews").update({
            "rating": data.get("rating"),
            "comment": data.get("comment"),
            "image_url": data.get("image_url"),
            "updated_at": "now()"
        }).eq("id", review_id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/review/{review_id}")
async def delete_review(review_id: int):
    try:
        supabase.table("reviews").delete().eq("id", review_id).execute()
        return {"message": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import os, uuid
from fastapi import UploadFile, File

@router.post("/review")
def submit_review(data: ReviewData):
    try:
        # Check duplicate - ek booking ka sirf ek review
        existing = supabase.table("reviews").select("id").eq("booking_id", data.booking_id).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Review already submitted for this booking")

        # Insert review
        supabase.table("reviews").insert({
            "booking_id": data.booking_id,
            "customer_id": data.customer_id,
            "worker_id": data.worker_id,
            "rating": data.rating,
            "comment": data.comment or "",
            "image_url": None
        }).execute()

        # Recalculate worker rating
        reviews = supabase.table("reviews").select("rating").eq("worker_id", data.worker_id).execute()
        if reviews.data:
            avg = sum(r["rating"] for r in reviews.data) / len(reviews.data)
            supabase.table("workers").update({
                "rating": round(avg, 1),
                "total_reviews": len(reviews.data)
            }).eq("id", data.worker_id).execute()

        return {"message": "Review submitted!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{booking_id}/proof")
async def save_proof(booking_id: int, data: dict):
    try:
        supabase.table("bookings").update({
            "proof_image": data.get("proof_image")
        }).eq("id", booking_id).execute()
        return {"message": "Proof saved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))