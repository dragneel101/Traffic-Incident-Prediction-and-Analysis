@echo off
echo Starting React Frontend Server...

cd /d C:\live\Traffic-Incident-Prediction-and-Analysis\frontend

REM Optional: Build once if you haven’t already (skip if built elsewhere)
npm run build

REM Start production server
serve -s dist -l tcp://0.0.0.0:4173
