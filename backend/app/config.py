import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResQSync - Intelligent Emergency Response Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration (SQLite default, easy migration to Postgres)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resqsync.db")
    
    # SLA & Escalation Settings
    SLA_CRITICAL_UNASSIGNED_SECONDS: int = int(os.getenv("SLA_CRITICAL_UNASSIGNED_SECONDS", "90"))
    ESCALATION_CHECK_INTERVAL_SECONDS: int = int(os.getenv("ESCALATION_CHECK_INTERVAL_SECONDS", "5"))
    
    # Resource Matching Weights (Distance, Capability, Availability)
    WEIGHT_DISTANCE: float = float(os.getenv("WEIGHT_DISTANCE", "0.4"))
    WEIGHT_CAPABILITY: float = float(os.getenv("WEIGHT_CAPABILITY", "0.4"))
    WEIGHT_AVAILABILITY: float = float(os.getenv("WEIGHT_AVAILABILITY", "0.2"))
    
    # Default regional coordinates (e.g., Metro area center for synthetic seeding)
    DEFAULT_CENTER_LAT: float = 19.0760
    DEFAULT_CENTER_LON: float = 72.8777

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
