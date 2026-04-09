# TIPA — Claude Project Guide

## What This Project Is

Full-stack traffic collision risk app: users enter two addresses, get multiple driving routes with ML-predicted collision risk (weather + HERE traffic data), safest route highlighted on a map.

**Live domains:** frontend `https://traffic.khaitu.ca` | backend `https://trafficapi.khaitu.ca`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Python 3.11, SQLAlchemy ORM, PostgreSQL |
| ML | scikit-learn RandomForestClassifier (joblib .pkl) |
| External APIs | OpenWeatherMap, OpenRouteService, OpenCage, HERE Traffic |
| Caching | `cachetools` TTLCache — no Redis |
| Auth | JWT access tokens (1hr) + refresh tokens (7 days), bcrypt |
| Frontend | React 19, Vite 6, Tailwind CSS, Leaflet, Recharts, Axios |
| Deployment | Coolify + Nixpacks (no Dockerfile) |

---

## Deployment — Coolify / Nixpacks

**Backend:** root `/backend`, start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`

**Frontend:** root `/frontend`, build `npm run build`, publish `dist`, env `VITE_API_URL=https://trafficapi.khaitu.ca`

Required backend env vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `OPENWEATHER_API_KEY`, `OPENCAGE_API_KEY`, `ORS_API_KEY`, `HERE_API_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_SERVER`, `MAIL_PORT`

---

## Key Conventions

- **No git commits by Claude.** User stages and commits all changes manually.
- **No Dockerfiles.** Coolify uses Nixpacks.
- **No Redis.** Use `cachetools.TTLCache` for all caching.
- **Single Base.** All SQLAlchemy models import `Base` from `app.database` — never call `declarative_base()` again.
- **Limiter** lives in `app/limiter.py` (not `main.py`) to avoid circular imports.
- **Logging:** use `get_logger(__name__)` from `app.logging_config` — never `print()`.
- **Sessions:** always `Depends(get_db)` — never instantiate `SessionLocal()` manually in routes.
- **Auth:** `get_current_user` returns a full `User` object — use `current_user.id` for the integer PK.
- **Migrations:** every schema change needs an Alembic file in `backend/alembic/versions/`.
- **Commit messages:** conventional commits — `feat:`, `fix:`, `chore:`, `test:`, `refactor:`.
