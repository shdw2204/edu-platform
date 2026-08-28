from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from auth import router as auth_router

app = FastAPI(title="Edu Platform API", version="1.0.0")

# CORS для будущего фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])