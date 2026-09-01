from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from database import engine
from models import Base
from courses import router as courses_router
import uvicorn

# Создаём приложение с явной настройкой Swagger
app = FastAPI(
    title="Courses Service",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True
    },
    # Явно добавляем схему безопасности
    openapi_tags=[],
    docs_url="/docs",
    redoc_url="/redoc",
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

# Подключаем роутер
app.include_router(courses_router, prefix="/api", tags=["Courses"])

# Добавляем явное описание безопасности для Swagger
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Добавляем схему безопасности в OpenAPI
    openapi_schema["components"] = {
        "securitySchemes": {
            "OAuth2PasswordBearer": {
                "type": "oauth2",
                "flows": {
                    "password": {
                        "tokenUrl": "http://localhost:8000/api/auth/login",
                        "scopes": {}
                    }
                }
            }
        }
    }
    # Применяем безопасность ко всем эндпоинтам
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"OAuth2PasswordBearer": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi