# 🚦 Traffic Collision Risk Predictor

A real-time web application that predicts the risk of traffic collisions based on location, live traffic, and contextual factors like weather and time.

## 🌐 Features

- Predict collision risk between two locations.
- Context-aware predictions using:
  - Live weather data (OpenWeather)
  - Traffic routes (OpenRouteService)
- Route-based heatmap visualization.
- Dashboard showing prediction history and usage stats.

---

## ⚙️ Tech Stack

- **Backend:** FastAPI
- **Machine Learning:** scikit-learn
- **APIs:** OpenWeather, OpenRouteService
- **Data Sources:** Meteostat, Historical Collision Data
- **Frontend:** (Not included here, assumed separately hosted or integrated)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/traffic-collision-risk-predictor.git
cd traffic-collision-risk-predictor
```

### 2. Create a Virtual Environment (Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables

Create a `.env` file in the project root (if not already there) and add your API keys and model path:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
ORS_API_KEY=your_openrouteservice_api_key
MODEL_PATH=./data/model.pkl
```

> Replace with your actual keys. You can get free keys from:
> - [OpenWeather API](https://openweathermap.org/api)
> - [OpenRouteService](https://openrouteservice.org/dev/#/signup)

### 5. Run the App

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` to test the API via Swagger UI.

---

## 📁 Project Structure

```
.
├── main.py                 # FastAPI entry point
├── .env                   # Environment variables
├── requirements.txt       # Python dependencies
├── data/
│   └── model.pkl          # Trained ML model
└── utils/                 # Helper scripts (API, preprocessing, etc.)
```

---

## 📊 Dashboard

Prediction statistics, usage metrics, and past queries are visualized in the dashboard (frontend implementation assumed separately).

---

## ✨ Future Features

- User login and trip history
- Model monitoring and auto-retraining
- Integration with map-based route risk overlays
- Admin analytics panel

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 💬 Contact

For issues, reach out to [your-email@example.com] or create an issue on GitHub.
