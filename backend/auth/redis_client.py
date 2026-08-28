import redis
from config import Config

try:
    redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
    redis_client.ping()
    print("Connected to Redis")
except Exception as e:
    print(f"Redis connection error: {e}")
    redis_client = None