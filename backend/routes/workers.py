from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter()

class WorkerUpdate(BaseModel):
    bio: Optional[str] = None
    category_id: Optional[int] = None
    is_available: Optional[bool] = None

@router.get("/")
def get_workers(category_id: int = None):
    try:
        query = supabase.table("workers").select(
            "*, profiles(*), categories(*)"
        ).eq("is_available", True).eq("status", "approved")
        if category_id:
            query = query.eq("category_id", category_id)
        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
def get_all_workers():
    try:
        result = supabase.table("workers").select(
            "*, profiles(*), categories(*)"
        ).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/by-user/{user_id}")
def get_worker_by_user(user_id: str):
    try:
        result = supabase.table("workers").select(
            "*, profiles(*), categories(*)"
        ).eq("user_id", user_id).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{worker_id}")
def get_worker(worker_id: int):
    try:
        result = supabase.table("workers").select(
            "*, profiles(*), categories(*)"
        ).eq("id", worker_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Worker not found")
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}")
def update_worker(worker_id: int, data: WorkerUpdate):
    try:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        result = supabase.table("workers").update(update_data).eq("id", worker_id).execute()
        return {"message": "Updated!", "worker": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}/verify")
def verify_worker(worker_id: int):
    try:
        supabase.table("workers").update({
            "is_verified": True,
            "status": "approved",
            "is_available": True,
        }).eq("id", worker_id).execute()
        return {"message": "Worker verified!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}/approve")
def approve_worker(worker_id: int):
    try:
        supabase.table("workers").update({
            "status": "approved",
            "is_verified": True,
            "is_available": True,
        }).eq("id", worker_id).execute()
        return {"message": "Worker approved!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}/reject")
def reject_worker(worker_id: int):
    try:
        supabase.table("workers").update({
            "status": "rejected",
        }).eq("id", worker_id).execute()
        return {"message": "Worker rejected!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}/availability")
def toggle_availability(worker_id: int, is_available: bool):
    try:
        supabase.table("workers").update(
            {"is_available": is_available}
        ).eq("id", worker_id).execute()
        return {"message": "Availability updated!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class AdminWorkerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    category_id: Optional[int] = None
    password: Optional[str] = None

@router.patch("/{worker_id}/admin-edit")
def admin_edit_worker(worker_id: int, data: AdminWorkerUpdate):
    try:
        # Get worker's user_id
        worker = supabase.table("workers").select("*, profiles(*)").eq("id", worker_id).single().execute()
        if not worker.data:
            raise HTTPException(status_code=404, detail="Worker not found")
        
        user_id = worker.data["user_id"]
        
        # Update profile (name, phone)
        profile_update = {}
        if data.name: profile_update["name"] = data.name
        if data.phone: profile_update["phone"] = data.phone
        if profile_update:
            supabase.table("profiles").update(profile_update).eq("id", user_id).execute()
        
        # Update worker (bio, category)
        worker_update = {}
        if data.bio is not None: worker_update["bio"] = data.bio
        if data.category_id: worker_update["category_id"] = data.category_id
        if worker_update:
            supabase.table("workers").update(worker_update).eq("id", worker_id).execute()
        
        # Update password in Supabase Auth
        if data.password:
            supabase.auth.admin.update_user_by_id(user_id, {"password": data.password})
        
        return {"message": "Worker updated!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{worker_id}")
def delete_worker(worker_id: int):
    try:
        worker = supabase.table("workers").select("user_id").eq("id", worker_id).single().execute()
        if not worker.data:
            raise HTTPException(status_code=404, detail="Worker not found")
        user_id = worker.data["user_id"]
        supabase.table("reviews").delete().eq("worker_id", worker_id).execute()
        supabase.table("bookings").update({"status": "cancelled", "worker_id": None}).eq("worker_id", worker_id).execute()
        supabase.table("workers").delete().eq("id", worker_id).execute()
        supabase.table("profiles").delete().eq("id", user_id).execute()
        supabase.auth.admin.delete_user(user_id)
        return {"message": "Worker deleted!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))