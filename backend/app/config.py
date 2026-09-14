import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SmartWaste AI"
    database_url: str = "sqlite:///./smartwaste.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    upload_dir: str = "./uploads"
    max_upload_mb: int = 20
    api_key: str = "dev-local-key-change-me"

    class Config:
        env_file = ".env"


settings = Settings()
os.makedirs(settings.upload_dir, exist_ok=True)
