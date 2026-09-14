import numpy as np
from app.classification import classify_waste, RECOMMENDATIONS


def test_classify_waste_returns_known_category():
    frame = np.full((100, 100, 3), (200, 200, 200), dtype=np.uint8)  # low-saturation, bright -> metal-ish
    result = classify_waste(frame)
    assert result["category"] in RECOMMENDATIONS
    assert 0 <= result["confidence"] <= 1


def test_classify_waste_green_frame_leans_organic():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (40, 140, 40)  # BGR green
    result = classify_waste(frame)
    assert result["category"] == "organic"


def test_recommendation_present_for_every_category():
    for cat, rec in RECOMMENDATIONS.items():
        assert isinstance(rec, str) and len(rec) > 0
