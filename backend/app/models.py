from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone
from app.database import Base


class WasteEvent(Base):
    __tablename__ = "waste_events"

    id = Column(Integer, primary_key=True)
    source_filename = Column(String)
    category = Column(String)  # plastic | paper | metal | glass | organic | general
    confidence = Column(Float)
    recommendation = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
