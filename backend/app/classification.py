"""
Waste category classification. A MobileNetV2 transfer-learning model
(frozen ImageNet backbone + trained classifier head) classifies
general/glass/metal/organic/paper/plastic, reaching 86.4% held-out
validation accuracy. Originally trained on TrashNet alone (83.8% accuracy,
no "organic" class at all - that category fell back to a colour heuristic).
Retrained with an MIT-licensed organic/biological-waste dataset added
(khoaliamle/Garbage_Classification_YOLO's "biological" class, 300 images)
so the model now covers all 6 categories directly - the colour heuristic
that used to run before the model for organic detection has been removed.
See README "Limitations".
"""
import os

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms

RECOMMENDATIONS = {
    "plastic": "Rinse and place in the plastics recycling stream.",
    "paper": "Flatten and place in the paper/cardboard recycling stream.",
    "metal": "Rinse and place in the metal recycling stream.",
    "glass": "Place in the glass recycling stream - handle with care.",
    "organic": "Place in the organic/compost stream.",
    "general": "No confident recyclable match - place in general waste, or review manually.",
}

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml_model", "smartwaste_classifier.pt")
_MODEL_CLASSES = ["general", "glass", "metal", "organic", "paper", "plastic"]
_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

_model = torch.jit.load(_MODEL_PATH, map_location="cpu")
_model.eval()


def classify_waste(frame: np.ndarray) -> dict:
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    tensor = _TRANSFORM(Image.fromarray(rgb)).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(_model(tensor), dim=1)[0]
    idx = int(torch.argmax(probs))
    category = _MODEL_CLASSES[idx]
    confidence = round(float(probs[idx]), 2)

    return {
        "category": category,
        "confidence": confidence,
        "recommendation": RECOMMENDATIONS[category],
    }
