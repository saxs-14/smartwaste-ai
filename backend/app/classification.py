"""
Waste category classification via dominant-colour + texture heuristic (no
trained model). Real recyclable-material classification (distinguishing e.g.
clear plastic from glass) genuinely requires a trained image classifier -
this is a deterministic, testable baseline that gets the easy cases right
(cardboard is beige, most produce/organics are green/brown) and is explicit
about where it's guessing. See README "Limitations".
"""
from typing import Tuple

import cv2
import numpy as np

RECOMMENDATIONS = {
    "plastic": "Rinse and place in the plastics recycling stream.",
    "paper": "Flatten and place in the paper/cardboard recycling stream.",
    "metal": "Rinse and place in the metal recycling stream.",
    "glass": "Place in the glass recycling stream - handle with care.",
    "organic": "Place in the organic/compost stream.",
    "general": "No confident recyclable match - place in general waste, or review manually.",
}


def _dominant_hsv(frame: np.ndarray) -> Tuple[float, float, float, float]:
    """Returns (hue, saturation, value, edge_density) of the dominant colour cluster."""
    small = cv2.resize(frame, (100, 100))
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV).reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    k = 3
    _, labels, centers = cv2.kmeans(hsv, k, None, criteria, 3, cv2.KMEANS_RANDOM_CENTERS)
    counts = np.bincount(labels.flatten(), minlength=k)
    dominant = centers[np.argmax(counts)]
    h, s, v = dominant

    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    edge_density = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    return float(h), float(s) / 255.0, float(v) / 255.0, edge_density


def classify_waste(frame: np.ndarray) -> dict:
    h, s, v, edge_density = _dominant_hsv(frame)

    category = "general"
    confidence = 0.35

    if s < 0.15 and v > 0.55:
        category, confidence = "metal", 0.55
    elif 35 <= h <= 90 and s > 0.25:
        category, confidence = "organic", 0.55
    elif s < 0.25 and v > 0.6 and 8 <= edge_density <= 400:
        category, confidence = "paper", 0.5
    elif 90 <= h <= 140 and s > 0.15:
        category, confidence = "glass", 0.4
    elif s > 0.35:
        category, confidence = "plastic", 0.45

    # more texture / colour variation nudges confidence up slightly (more "signal")
    confidence = min(confidence + min(edge_density, 200) / 2000, 0.85)

    return {
        "category": category,
        "confidence": round(confidence, 2),
        "recommendation": RECOMMENDATIONS[category],
    }
