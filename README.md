# Traffic Incident Prediction and Analysis (TIPA)

A full-stack web application that predicts collision risk along driving routes using real-time weather, live HERE traffic data, and a machine learning model trained on historical collision data.

**Live:** [traffic.khaitu.ca](https://traffic.khaitu.ca)

---

## Features

- Enter two addresses and get up to 3 driving routes (recommended, shortest, avoid tollways)
- ML-predicted collision risk per route, weighted with live congestion and incident counts
- Safest route highlighted on an interactive map; all routes color-coded by risk level
- Live traffic incident markers on the map with popups
- Route sidebar showing risk score, distance, duration, and incident count per route
- User accounts with JWT auth (access + refresh tokens), password reset via email
- Dashboard with prediction history, usage stats, and frequent locations
- Rate limiting, structured JSON logging, and database-backed prediction logs

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Python 3.11, SQLAlchemy ORM, PostgreSQL, Alembic |
| ML | scikit-learn RandomForestClassifier (`.pkl` via joblib) |
| External APIs | OpenWeatherMap, OpenRouteService, OpenCage, HERE Traffic |
| Caching | `cachetools` TTLCache (weather 10 min, geocoding 24 h, traffic 5 min) |
| Auth | JWT access tokens (1 hr) + refresh tokens (7 days), bcrypt |
| Frontend | React 19, Vite 6, Tailwind CSS, Leaflet, Recharts, Axios |
| Deployment | Coolify + Nixpacks |

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── auth/           # JWT handler, dependencies, utils
│   │   ├── models/         # SQLAlchemy models (User, PredictionLog, RefreshToken)
│   │   ├── routes/         # API routers (auth, route_risk, stats, traffic, user, ...)
│   │   ├── services/       # Weather, routing, geocoding, traffic, predictor, features
│   │   ├── tests/          # pytest integration tests
│   │   ├── cache.py        # TTLCache instances
│   │   ├── limiter.py      # slowapi rate limiter
│   │   ├── logging_config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── alembic/            # Database migrations
│   ├── data/
│   │   ├── raw/            # Source collision CSVs (Toronto, Ottawa, Hamilton, ...)
│   │   ├── processed/      # Cleaned and enriched training data
│   │   ├── scripts/        # Data preprocessing and model visualization scripts
│   │   └── visualise/      # Model evaluation plots (v4/)
│   ├── requirements.txt
│   └── requirements-dev.txt
└── frontend/
    ├── src/
    │   ├── api/            # Axios client + predict/traffic helpers
    │   ├── components/     # MapView, RoutePlanner, RouteList, Navbar, ...
    │   ├── context/        # AuthContext (token memory + silent refresh)
    │   ├── pages/          # Dashboard, LandingPage, Login, SignUp, Profile, ...
    │   └── utils/          # Error message helpers
    ├── package.json
    └── vite.config.js
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 22+
- PostgreSQL

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env      # fill in your API keys and DATABASE_URL

alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:8000

npm run frontend           # dev server on :4173
# or
npm run dev                # starts both frontend and backend concurrently
```

### Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret for signing JWTs |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `OPENCAGE_API_KEY` | OpenCage geocoding API key |
| `ORS_API_KEY` | OpenRouteService API key |
| `HERE_API_KEY` | HERE Traffic API key |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |
| `MAIL_FROM` | Sender address |
| `MAIL_SERVER` | SMTP host |
| `MAIL_PORT` | SMTP port |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:8000`) |

---

## Deployment

Deployed on **Coolify** using **Nixpacks** (no Dockerfile).

- **Backend** — root `/backend`, start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Frontend** — root `/frontend`, build `npm run build`, publish dir `dist`, env `VITE_API_URL=https://trafficapi.khaitu.ca`

---

## License

[MIT](LICENSE)
