"""
PulmoScan AI – Core Configuration
Settings loaded from environment variables via pydantic-settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "pulmoscan_db"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Gemini
    GEMINI_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
