from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter()

class SignupData(BaseModel):
    email: str
    password: str
    name: str
    phone: str
    role: str = "customer"
    category_id: Optional[int] = None
    bio: Optional[str] = None

class LoginData(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

@router.post("/signup")
def signup(data: SignupData):
    try:
        res = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
        })
        user = res.user
        if not user:
            raise HTTPException(status_code=400, detail="Signup failed")

        user_id = str(user.id)

        supabase.table("profiles").insert({
            "id": user_id,
            "name": data.name,
            "phone": data.phone,
            "role": data.role,
            "city": "Okara"
        }).execute()

        if data.role == "worker":
            supabase.table("workers").insert({
                "user_id": user_id,
                "category_id": data.category_id or 1,
                "bio": data.bio or "",
                "rating": 0,
                "total_reviews": 0,
                "is_available": False,
                "is_verified": False,
                "status": "pending",
            }).execute()

        return {"message": "Signup successful!", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(data: LoginData):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
        user = res.user
        session = res.session

        if not user or not session:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        profile = supabase.table("profiles").select("*").eq("id", str(user.id)).single().execute()

        if not profile.data:
            raise HTTPException(status_code=400, detail="Profile not found")

        if profile.data.get('role') == 'worker':
            worker = supabase.table("workers").select("status").eq("user_id", str(user.id)).single().execute()
            if worker.data and worker.data.get('status') != 'approved':
                raise HTTPException(status_code=403, detail="Your account is pending admin approval. Please wait for verification.")

        return {
            "access_token": session.access_token,
            "user": profile.data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/profile/{user_id}")
def update_profile(user_id: str, data: ProfileUpdate):
    try:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        result = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        return {"message": "Profile updated!", "profile": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile/{user_id}")
def get_profile(user_id: str):
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/profile/{user_id}")
async def update_profile(user_id: str, data: dict):
    try:
        update = {}
        if data.get("name"):  update["name"]  = data["name"]
        if data.get("phone"): update["phone"] = data["phone"]
        supabase.table("profiles").update(update).eq("id", user_id).execute()
        return {"message": "Profile updated!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))