# SmartWaste AI

AI-assisted waste identification MVP: classifies a photographed item into a recycling
category and recommends the right stream.

## Problem statement

Incorrect waste separation reduces recycling efficiency and increases contamination in
recycling streams, often simply from not knowing which bin something belongs in.

## Solution

Upload (or demo) a photo of an item and SmartWaste AI classifies it — plastic, paper,
metal, glass, organic or general — with a confidence score and a recommendation, tracked
on a facility-level analytics dashboard.

## Features

- Single-photo waste classification into 6 categories
- Confidence score on every classification (never a false-certain label)
- Plain-language recycling recommendation
- Category-breakdown analytics dashboard
- CSV export
- Demo mode using bundled sample waste photos

## Architecture

```text
frontend (React/Vite/TS/Tailwind)  ->  backend (FastAPI)  ->  SQLite
                                              |
                                     MobileNetV2 transfer-learning classifier
                                     (plastic/paper/metal/glass/general/organic)
```

## Technology stack

Python, FastAPI, SQLAlchemy, SQLite, OpenCV, PyTorch/TorchVision; React, TypeScript, Vite,
Tailwind CSS.

## Folder structure

```text
smartwaste-ai/
├── backend/
│   ├── app/
│   │   └── ml_model/  # Trained TorchScript classifier (smartwaste_classifier.pt)
│   ├── demo/           # Bundled sample waste photos
│   └── tests/
├── frontend/
│   └── src/              # Landing page + dashboard
├── docker-compose.yml
└── README.md
```

## Installation

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

```bash
cd frontend && npm install
```

## Environment variables

`UPLOAD_DIR`, `MAX_UPLOAD_MB`, `CORS_ORIGINS` — see `backend/.env.example`.

## Running locally

```bash
# Terminal 1
cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173. Docker: `docker compose up --build`.

## Demo instructions

Click **Run demo sample** — classifies one of the bundled real waste-item photos
(Wikimedia Commons, CC-licensed). Upload your own photo to try other items.

## API documentation

Docs at `/docs`. Key endpoints: `POST /api/classify`, `POST /api/classify/demo`,
`GET /api/events`, `GET /api/events/export`, `GET /api/dashboard/summary`.

## Database

SQLite: `waste_events` (category, confidence, recommendation).

## Security considerations

- **API key required on every endpoint except `/api/health`.** Set `API_KEY` (backend
  `.env`) and `VITE_API_KEY` (frontend `.env`) to the same value before deploying anywhere
  reachable outside your own machine — the default (`dev-local-key-change-me`) is for
  local development only. Single-tenant "licensed instance" model, not per-user accounts.
- Rate limiting (30 req/60s/IP) on the API.
- Upload size/type validated server-side, CORS restricted, no secrets in source.

## Privacy considerations

Waste photos are not expected to contain personal data, but avoid photographing
identifiable documents/mail within frame before uploading.

## Limitations

- **All 6 categories (plastic/paper/metal/glass/general/organic) are now covered by a
  single trained model** — a MobileNetV2 transfer-learning classifier (frozen ImageNet
  backbone + trained classifier head), trained on TrashNet (5,527 images) plus an
  MIT-licensed organic/biological-waste dataset (khoaliamle/Garbage_Classification_YOLO,
  300 images) added for the "organic" class TrashNet never had. Training uses
  class-weighted loss to correct for the resulting imbalance (paper was ~35% of the
  combined dataset, organic ~11%). Reached **86.4% held-out validation accuracy**, up
  from 83.8% on the original 5-class model.
- **Live-tested against this project's own demo photos, not just the validation
  split** — a small 4-photo spot check surfaced two different findings. One demo photo
  (`food_organic_waste_compost_3.jpg`) turned out to be mislabeled: it showed a
  composting *bucket and bran product*, not loose food waste, so the model's "wrong"
  answer on it was reasonable — the photo has been replaced with a real food-scraps
  photo, which the model now classifies correctly (90% confidence). The other two errors
  are genuine: unusual, cluttered wide-angle scenes (a wire-mesh bin packed with hundreds
  of bottles; a street photo of a person loading a truck with bottle bales) are visually
  very different from the close-up single-item photos in the training data, and the
  model gets both wrong. This is a real, disclosed limitation, not one that's been
  papered over — a single, small transfer-learned classifier trained on ~6,000 close-up
  photos should not be expected to generalize to arbitrary real-world scene photos.
  83.8%/86.4% are not, and were never claimed to be, 100%.
- Single-item, reasonably-framed photos work best — no multi-object detection within one
  frame, and cluttered/wide scenes are out of the model's training distribution.

## Business model

**Target customers**: recycling companies, schools, municipalities, shopping centres,
waste-management companies.

**Revenue**: SaaS subscription, smart-bin hardware integration, analytics-only
subscription.

## Future improvements

- Train a real waste-classification model (e.g. on TrashNet or a custom labeled dataset)
- Multi-item detection per frame (object detection + per-object classification)
- Smart-bin integration (camera + servo sorting mechanism)

## Screenshots

Run locally (see "Running locally") and click **Run demo sample** on `/app`.
