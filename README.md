# Traffic-Incident-Prediction-and-Analysis

## Overview
This project is a **Traffic Incident Predictor** using **Machine Learning and Flask**. It predicts **injury collisions** based on past traffic data and user input. The project includes a **Flask API** for predictions and a **web interface** for input submission.

## Features
- **Predict Traffic Collisions** based on historical data.
- **Flask API** for machine learning predictions.
- **Frontend UI** for users to submit data.
- **CORS-enabled API** for frontend-backend communication.
- **Trained Machine Learning Model (Random Forest)**
- **GeoJSON-based Data Handling**

## Folder Structure
```
Traffic_Predictor/
│── backend/
│   ├── app.py  # Flask API for predictions
│   ├── model.pkl  # Saved machine learning model
│   ├── requirements.txt  # Required dependencies
│── frontend/
│   ├── index.html  # Web UI
│   ├── script.js  # Handles API calls
│   ├── styles.css  # UI styling
│── data/
│   ├── Traffic_Collisions_Open_Data.geojson  # GeoJSON dataset
│── README.md  # Project documentation
```

## Installation & Setup

### **1️⃣ Install Dependencies**
Make sure you have **Python 3.6+** installed.
```bash
pip install -r backend/requirements.txt
```

### **2️⃣ Run the Backend (Flask API)**
```bash
cd backend
python app.py
```
The API will start at: `http://127.0.0.1:5000`

### **3️⃣ Open the Web Interface**
- Open `frontend/index.html` in a browser.
- Fill out the form and submit for predictions.

## API Endpoints

### **1️⃣ Predict Traffic Collisions**
#### **POST** `/predict`
**Request:**
```json
{
    "OCC_HOUR": 15,
    "OCC_DOW": 3,
    "OCC_MONTH": 6,
    "AUTOMOBILE": 1,
    "MOTORCYCLE": 0,
    "PASSENGER": 1,
    "BICYCLE": 0,
    "PEDESTRIAN": 0
}
```
**Response:**
```json
{
    "predicted_injury_collisions": 2
}
```

## Technologies Used
- **Python 3**
- **Flask** (Backend API)
- **Scikit-Learn** (Machine Learning Model)
- **GeoPandas** (GeoJSON Data Handling)
- **HTML, CSS, JavaScript** (Frontend UI)

## Future Improvements
- **Add Interactive Map for Traffic Data Visualization**
- **Optimize Routes Based on Predicted Traffic**
- **Real-Time Traffic Data Integration**
