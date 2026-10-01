# App configuration, loaded from environment variables / .env
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    database_url: str = "sqlite:///./mypm.db"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        # Split the comma-separated CORS_ORIGINS env value into a list
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# Single shared settings instance used across the app
settings = Settings()
