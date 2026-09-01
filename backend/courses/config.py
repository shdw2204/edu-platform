import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL")
    REDIS_URL = os.getenv("REDIS_URL")
    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_key_in_production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")