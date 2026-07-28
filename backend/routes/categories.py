from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter()

class CategoryData(BaseModel):
    name: str
    icon: Optional[str] = None

@router.get("/")
def get_categories():
    result = supabase.table("categories").select("*").execute()
    return result.data

@router.post("/")
def create_category(data: CategoryData):
    try:
        result = supabase.table("categories").insert({
            "name": data.name,
            "icon": data.icon or ""
        }).execute()
        return {"message": "Category created!", "category": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{category_id}")
def update_category(category_id: int, data: CategoryData):
    try:
        update = {}
        if data.name: update["name"] = data.name
        if data.icon is not None: update["icon"] = data.icon
        result = supabase.table("categories").update(update).eq("id", category_id).execute()
        return {"message": "Category updated!", "category": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{category_id}")
def delete_category(category_id: int):
    try:
        workers = supabase.table("workers").select("id").eq("category_id", category_id).execute()
        if workers.data:
            raise HTTPException(status_code=400, detail=f"Cannot delete — {len(workers.data)} worker(s) use this category!")
        supabase.table("categories").delete().eq("id", category_id).execute()
        return {"message": "Category deleted!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))