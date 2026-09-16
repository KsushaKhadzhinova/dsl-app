from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "DiagramCode"
    database_url: str = "postgresql+psycopg2://diagramcode:diagramcode@localhost:5432/diagramcode"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "insecure-dev-key-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    ai_provider: str = "stub"
    ai_api_key: str | None = None
    ai_daily_quota: int = 20

    github_client_id: str | None = None
    github_client_secret: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
