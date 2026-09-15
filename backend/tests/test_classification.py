import numpy as np
from app.classification import classify_waste, RECOMMENDATIONS


def test_classify_waste_returns_known_category():
    frame = np.full((100, 100, 3), (200, 200, 200), dtype=np.uint8)  # low-saturation, bright -> metal-ish
    result = classify_waste(frame)
    assert result["category"] in RECOMMENDATIONS
    assert 0 <= result["confidence"] <= 1


def test_classify_waste_returns_valid_category_for_green_frame():
    # A trained CNN's output on a flat synthetic colour block isn't a meaningful
    # correctness check the way the old colour heuristic was - it was trained on
    # real photos, not solid colour swatches. This just checks the model path runs
    # end-to-end and returns one of the six real categories.
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[:] = (40, 140, 40)  # BGR green
    result = classify_waste(frame)
    assert result["category"] in RECOMMENDATIONS
    assert 0 <= result["confidence"] <= 1


def test_recommendation_present_for_every_category():
    for cat, rec in RECOMMENDATIONS.items():
        assert isinstance(rec, str) and len(rec) > 0
