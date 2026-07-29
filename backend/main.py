from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Haazr API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://haazr-pi.vercel.app"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Haazr API is running! 🚀"}

from routes import auth, workers, bookings, categories
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(workers.router, prefix="/workers", tags=["Workers"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])