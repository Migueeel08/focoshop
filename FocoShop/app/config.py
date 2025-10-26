# app/config.py
from pydantic_settings import BaseSettings
from datetime import timedelta

class Settings(BaseSettings):
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "0803"
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: str = "3306"
    MYSQL_DATABASE: str = "bd_focoshop"

    # 🔐 Configuración JWT
    SECRET_KEY: str = "super_secret_key_focoshop"  # cámbialo por algo más largo y seguro
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # duración del token en minutos

    class Config:
        env_file = ".env"

settings = Settings()
