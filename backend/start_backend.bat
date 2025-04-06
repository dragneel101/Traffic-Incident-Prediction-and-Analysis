@echo off
echo === Starting FastAPI backend ===
cd /d C:\live\Traffic-Incident-Prediction-and-Analysis\backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 >> logs\backend.log 2>&1

