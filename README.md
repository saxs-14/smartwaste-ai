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
                                     dominant-colour (k-means) + texture
                                     heuristic classifier (no trained model)
```

## Technology stack

Python, FastAPI, SQLAlchemy, SQLite, OpenCV; React, TypeScript, Vite, Tailwind CSS.

## Folder structure

```text
smartwaste-ai/
├── backend/
│   ├── app/          # FastAPI app, classification heuristic
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

- **Classification is a dominant-colour (k-means) + texture heuristic, not a trained image
  classifier.** It gets clear cases right (a green/brown organic item, a beige cardboard
  box) but will misclassify anything where colour doesn't strongly indicate material —
  e.g. a black plastic bottle vs a black metal can. Confidence scores are deliberately
  capped well below 1.0. A production system needs a model trained on a labeled waste
  dataset (e.g. TrashNet-style) for real sorting-line accuracy.
- Single-item photos only — no multi-object detection within one frame.

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
