@echo off
echo === Starting React frontend ===
cd /d C:\live\Traffic-Incident-Prediction-and-Analysis\frontend\dist
npx serve -s . -l 4173 >> ..\logs\frontend.log 2>&1
