# TIPA — Claude Project Guide

## What This Project Is

**Traffic Incident Prediction and Analysis (TIPA)** — a full-stack web app where users enter two addresses, the system fetches multiple driving routes, predicts collision risk for each using a machine learning model + real-time weather + HERE traffic data, and highlights the safest route on an interactive map.

**Live domains:**
- Frontend: `https://traffic.khaitu.ca`
- Backend API: `https://trafficapi.khaitu.ca`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Python 3.11, SQLAlchemy ORM |
| Database | PostgreSQL (hosted on Coolify) |
| ML Model | scikit-learn RandomForestClassifier, trained on Toronto collision data |
| External APIs | OpenWeatherMap, OpenRouteService (ORS), OpenCage (geocoding), HERE Traffic API |
| Caching | `cachetools` TTLCache (in-memory, no Redis) |
| Auth | JWT access tokens (1hr) + refresh tokens (7 days), bcrypt passwords |
| Frontend | React 19, Vite 6, Tailwind CSS, Leaflet + react-leaflet, Recharts, Axios |
| Deployment | Coolify with Nixpacks (no Dockerfile needed) |

---

## Deployment — Coolify / Nixpacks

Both apps are **separate Coolify applications**, auto-detected by Nixpacks.

**Backend app:**
- Root directory: `/backend`
- Start command (set in Coolify dashboard): `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`

**Frontend app:**
- Root directory: `/frontend`
- Build command: `npm run build` | Publish directory: `dist`
- Env var to set: `VITE_API_URL=https://trafficapi.khaitu.ca`

**Required env vars (backend):** `DATABASE_URL`, `JWT_SECRET_KEY`, `OPENWEATHER_API_KEY`, `OPENCAGE_API_KEY`, `ORS_API_KEY`, `HERE_API_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_SERVER`, `MAIL_PORT`

See `backend/.env.example` and `frontend/.env.example` for full templates.

---

## Project Structure

```
backend/
├── app/
│   ├── auth/           # JWT handler, bcrypt utils, get_current_user dependency
│   ├── data/           # Data cleaning + weather enrichment scripts (for ML training)
│   ├── ml/             # train_model.py, visualize_model.py
│   ├── models/         # SQLAlchemy: User, PredictionLog, RefreshToken
│   ├── routes/         # FastAPI routers: auth, predict, route_risk, stats, user, password_reset, traffic(planned)
│   ├── services/       # weather, routing, geocoding, features, predictor, stats, distance, traffic(planned)
│   ├── tests/          # pytest tests (to be built out in Phase 6)
│   ├── cache.py        # TTLCache instances (weather 10min, geocode 24h, traffic 5min)
│   ├── limiter.py      # slowapi Limiter singleton (avoids circular import with main.py)
│   ├── logging_config.py  # JSON structured logging
│   ├── database.py     # SQLAlchemy engine, SessionLocal, Base, get_db()
│   └── main.py         # FastAPI app, CORS, middleware
├── alembic/            # DB migrations (env.py + versions/)
├── alembic.ini
├── nixpacks.toml       # Coolify start command
└── requirements.txt

frontend/
├── src/
│   ├── api/            # client.js (axios, token interceptor), predict.js
│   ├── components/     # MapView, RoutePlanner, AddressSearch, RouteList(planned), Navbar, etc.
│   ├── context/        # AuthContext.jsx (planned — Phase 5)
│   ├── pages/          # LandingPage, Login, SignUp, Dashboard, Profile, etc.
│   └── utils/          # apiClient.js (fetch-based — TO BE DELETED in Phase 5)
└── vite.config.js      # Minimal config — no hardcoded IPs or proxy blocks
```

---

## Database Migrations (Alembic)

Migrations live in `backend/alembic/versions/`. Always use `alembic` — never edit the DB directly.

| Migration | What it does |
|-----------|-------------|
| `001_initial_schema.py` | Creates `users` and `prediction_logs` tables |
| `002_refresh_tokens.py` | Creates `refresh_tokens` table for server-side token revocation |
| `003_add_traffic_columns.py` | (planned Phase 3) Adds `congestion_level`, `incident_count` to `prediction_logs` |

To create a new migration: `alembic revision -m "description"` then fill in `upgrade()`/`downgrade()`.

---

## ML Model

- **File:** `backend/app/models/collision_risk_model.pkl` (joblib)
- **Type:** RandomForestClassifier, binary classification (collision = 1)
- **Training data:** Toronto collision data, enriched with historical weather via Meteostat
- **Current features (FEATURE_ORDER in predictor.py):**
  ```
  hour, latitude, longitude, temp_c, precip_mm,
  AUTOMOBILE, MOTORCYCLE, PASSENGER, BICYCLE, PEDESTRIAN
  ```
- **Planned v2 features (Phase 3+7):** `congestion_level`, `jam_factor` from HERE Traffic API
- **Output:** `model.predict_proba()[0][1] * 100` → collision probability as percentage

Retrain with: `cd backend && python -m app.ml.train_model`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Register; sends welcome email |
| POST | `/auth/signin` | No | Returns access_token + refresh_token |
| POST | `/auth/refresh` | No | Exchange refresh token for new access token |
| POST | `/auth/logout` | No | Revoke refresh token |
| GET | `/user/profile` | Yes | Get user info |
| PUT | `/user/profile` | Yes | Update name/phone |
| POST | `/password-reset/request` | No | Send reset email |
| POST | `/password-reset/confirm` | No | Set new password |
| POST | `/api/predict` | Yes | Single-point risk (rule-based) |
| POST | `/api/predict/route_risk` | Yes | Segment-by-segment risk for one route |
| POST | `/api/predict/multiple_route_risks` | Yes | 3 route alternatives as GeoJSON with risk scores |
| GET | `/api/stats/total` | Yes | Total prediction count for user |
| GET | `/api/stats/timeseries` | Yes | Daily counts, last 30 days |
| GET | `/api/stats/frequent` | Yes | Top 5 start/end locations |
| GET | `/api/stats/recent` | Yes | Last 5 predictions |
| GET | `/api/traffic/incidents` | No | (planned Phase 3) HERE incident markers |
| GET | `/api/traffic/flow` | No | (planned Phase 3) HERE congestion data |

Rate limits: prediction endpoints 30/min, auth endpoints 10/min (per IP via slowapi).

---

## Production Rewrite — Phase Status

A full production rewrite is in progress. The user commits all changes manually.

| Phase | Branch | Status | Description |
|-------|--------|--------|-------------|
| 1 | `feat/infrastructure` | **Done** | Alembic, nixpacks.toml, CI, cleaned vite config |
| 2 | `feat/backend-hardening` | **In progress** (files written, uncommitted) | Refresh tokens, caching, rate limiting, structured logging |
| 3 | `feat/here-traffic` | Not started | HERE Traffic API — flow + incidents |
| 4 | `feat/smarter-routing` | Not started | ORS route preferences, weighted risk score |
| 5 | `feat/frontend-rewrite` | Not started | AuthContext, route sidebar panel, incident markers |
| 6 | `feat/testing` | Not started | pytest backend + vitest frontend |
| 7 | `feat/ml-v2` | Not started | Retrain with traffic features, metrics endpoint |

Full plan details: `C:\Users\raish\.claude\plans\delegated-imagining-oasis.md`

### Phase 2 — files changed but not yet committed:
- `backend/app/auth/jwt_handler.py` — refresh token functions, type claim validation
- `backend/app/models/refresh_token.py` — new model
- `backend/alembic/versions/002_refresh_tokens.py` — migration
- `backend/app/routes/auth.py` — /refresh and /logout endpoints
- `backend/app/cache.py` — TTLCache instances
- `backend/app/limiter.py` — Limiter singleton
- `backend/app/logging_config.py` — JSON formatter
- `backend/app/main.py` — wires limiter + logging
- `backend/app/services/weather.py` — cache + timeout
- `backend/app/services/geocoding.py` — cache + logging
- `backend/app/routes/predict.py` — rate limit, logger, no print()
- `backend/app/routes/route_risk.py` — rate limit, logger, is_recommended flag

### Phase 3 — next up — key spec:
```python
# backend/app/services/traffic.py
def get_traffic_flow(lat, lon) -> {"congestion_level": 0-1, "speed_ratio": float, "jam_factor": 0-10}
def get_traffic_incidents(lat, lon, radius_km=5) -> list[dict]
```
```
GET /api/traffic/incidents?lat=&lon=&radius_km=5  → GeoJSON FeatureCollection
GET /api/traffic/flow?lat=&lon=                   → congestion data
```

### Phase 5 — route UI target layout:
```
┌────────────────────────┬─────────────────────┐
│                        │ [Start AddressSearch]│
│   [MapView 60%]        │ [End   AddressSearch]│
│                        │ [Predict Button]     │
│                        │ ─────────────────── │
│                        │ Route 1 ✓ Rec. 14m  │
│                        │ Risk: 12%  15.2km   │
│                        │ Route 2      12m     │
│                        │ Risk: 34%  13.1km   │
│                        │ Route 3      11m     │
│                        │ Risk: 61%  12.8km   │
│                        │ ─────────────────── │
│                        │ [RiskLegend]         │
└────────────────────────┴─────────────────────┘
```

---

## Key Conventions

- **No git commits by Claude.** The user stages and commits all changes manually.
- **No Dockerfiles.** Coolify uses Nixpacks to auto-detect the stack.
- **No Redis.** Use `cachetools.TTLCache` for all caching needs.
- **Single Base.** All SQLAlchemy models import `Base` from `app.database` — never create a new `declarative_base()`.
- **Limiter lives in `app/limiter.py`** (not main.py) to avoid circular imports — always import from there.
- **Logging:** use `get_logger(__name__)` from `app.logging_config`, never `print()`.
- **Sessions:** always use `Depends(get_db)` — never instantiate `SessionLocal()` manually in routes.
- **Auth:** `get_current_user` returns a full `User` object — use `current_user.id` for the integer ID.
- **Migrations:** every schema change needs an Alembic migration file in `backend/alembic/versions/`.
- **Commit messages follow conventional commits:** `feat:`, `fix:`, `chore:`, `test:`, `refactor:`.
