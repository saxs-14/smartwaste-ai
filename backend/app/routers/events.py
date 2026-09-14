import csv
import glob
import io
import os
import random
import cv2
import numpy as np
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import WasteEvent
from app.schemas import WasteEventOut, DashboardSummary
from app.config import settings
from app.classification import classify_waste

router = APIRouter(prefix="/api", tags=["events"])

DEMO_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "demo")
CATEGORIES = ["plastic", "paper", "metal", "glass", "organic", "general"]


def _persist(db, filename, result):
    event = WasteEvent(
        source_filename=filename, category=result["category"],
        confidence=result["confidence"], recommendation=result["recommendation"],
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.post("/classify", response_model=WasteEventOut)
async def classify(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    if len(contents) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    img_array = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    result = classify_waste(frame)
    return _persist(db, file.filename, result)


@router.post("/classify/demo", response_model=WasteEventOut)
def classify_demo(db: Session = Depends(get_db)):
    samples = glob.glob(os.path.join(DEMO_DIR, "*.jpg")) + glob.glob(os.path.join(DEMO_DIR, "*.png"))
    if not samples:
        raise HTTPException(status_code=404, detail="No demo images found on server")
    path = random.choice(samples)
    frame = cv2.imread(path)
    result = classify_waste(frame)
    return _persist(db, os.path.basename(path), result)


@router.get("/events", response_model=List[WasteEventOut])
def list_events(limit: int = 200, db: Session = Depends(get_db)):
    return db.query(WasteEvent).order_by(WasteEvent.created_at.desc()).limit(limit).all()


@router.get("/events/export")
def export_events(db: Session = Depends(get_db)):
    events = db.query(WasteEvent).order_by(WasteEvent.created_at.desc()).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "filename", "category", "confidence", "recommendation", "created_at"])
    for e in events:
        writer.writerow([e.id, e.source_filename, e.category, e.confidence, e.recommendation, e.created_at])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartwaste_events.csv"},
    )


@router.get("/dashboard/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(WasteEvent.id)).scalar() or 0
    counts = {}
    for cat in CATEGORIES:
        counts[cat] = db.query(func.count(WasteEvent.id)).filter(WasteEvent.category == cat).scalar() or 0
    avg_conf = db.query(func.avg(WasteEvent.confidence)).scalar() or 0.0
    return DashboardSummary(total_classified=total, category_counts=counts, avg_confidence=round(avg_conf, 2))
