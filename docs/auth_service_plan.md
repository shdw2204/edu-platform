# 🔐 План микросервиса: Аутентификация (Auth Service)

**Назначение:** Управление входом, регистрацией и сессиями пользователей.

**Технологии:**
- Python 3.11+ / FastAPI
- JWT (JSON Web Tokens) для доступа
- PostgreSQL (хранение пользователей)
- Redis (хранение сессий и черный список токенов)

---

## Эндпоинты API

- POST /api/auth/register -> Регистрация нового пользователя
- POST /api/auth/login -> Вход, выдача JWT-токена
- POST /api/auth/logout -> Выход, добавление токена в черный список
- GET /api/auth/me -> Получение данных текущего пользователя

---

## Структура папок (в /backend/auth)

/backend/auth/
├── Dockerfile          # Инструкция для сборки контейнера
├── requirements.txt    # Зависимости Python
├── main.py             # Точка входа, создание приложения FastAPI
├── config.py           # Настройки (переменные окружения)
├── models.py           # SQLAlchemy-модели (User)
├── schemas.py          # Pydantic-схемы для валидации данных
├── database.py         # Подключение к PostgreSQL
├── auth.py             # Логика регистрации, логина, JWT
├── dependencies.py     # Зависимости для FastAPI (проверка токена)
└── redis_client.py     # Подключение к Redis

---

## Переменные окружения (.env)

DATABASE_URL=postgresql://edu_admin:edu_password@postgres:5432/edu_platform
REDIS_URL=redis://redis:6379/0
SECRET_KEY=ваш-секретный-ключ (сгенерировать случайно)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60