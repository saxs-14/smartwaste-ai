from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200


def test_dashboard_summary_shape():
    r = client.get("/api/dashboard/summary")
    assert r.status_code == 200
    body = r.json()
    assert "total_classified" in body
    assert "category_counts" in body


def test_events_list_returns_array():
    r = client.get("/api/events")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_classify_demo_runs_end_to_end():
    r = client.post("/api/classify/demo")
    assert r.status_code in (200, 404)
    if r.status_code == 200:
        assert r.json()["category"] in ["plastic", "paper", "metal", "glass", "organic", "general"]
