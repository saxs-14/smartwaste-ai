from pydantic import BaseModel
from datetime import datetime


class WasteEventOut(BaseModel):
    id: int
    source_filename: str
    category: str
    confidence: float
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_classified: int
    category_counts: dict
    avg_confidence: float
