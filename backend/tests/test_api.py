import pytest
from fastapi.testclient import TestClient
import sys
import os

# Append the parent directory to system path to import main app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "gemini_api_configured" in data

def test_chat_endpoint_validation():
    # Empty message should trigger 422 validation error
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422

    # Sanitized message should succeed (fallback to mock)
    response = client.post("/api/chat", json={"message": "Make a plan for marketing"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "tasks" in data
    assert "suggested_schedule" in data
    assert "is_mock" in data

def test_planner_endpoint_validation():
    # Too long request or invalid parameter constraints
    response = client.post("/api/planner", json={"prompt": "", "tasks": []})
    assert response.status_code == 422

    response = client.post("/api/planner", json={"prompt": "I have 3 hours today", "tasks": ["Task A", "Task B"]})
    assert response.status_code == 200
    data = response.json()
    assert "schedule" in data
    assert "productivity_tips" in data
    assert len(data["schedule"]) > 0

def test_email_endpoint():
    response = client.post("/api/email", json={"prompt": "Congratulate the team on milestone"})
    assert response.status_code == 200
    data = response.json()
    assert "subject" in data
    assert "body" in data

def test_summarize_endpoint():
    response = client.post("/api/summarize", json={"text": "FlowMind is a productivity app that solves context switching."})
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "key_points" in data
    assert "action_items" in data
