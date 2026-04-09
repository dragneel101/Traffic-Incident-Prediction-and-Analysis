import os
import pytest
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.testclient import TestClient

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://test:test@localhost:5432/tipa_test")

from app.database import Base, get_db  # noqa: E402 — must import after env var is set
from app.main import app               # noqa: E402

_engine = create_engine(DATABASE_URL)
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    """Create all tables once per test session, drop on teardown."""
    import app.models.user           # noqa: F401
    import app.models.analytics      # noqa: F401
    import app.models.refresh_token  # noqa: F401
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture()
def db(_create_tables):
    """
    Each test runs inside a transaction that is rolled back on teardown,
    keeping the DB clean without needing to truncate tables.
    """
    connection = _engine.connect()
    transaction = connection.begin()
    session = _TestingSession(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    """TestClient with DB and email sending mocked out."""
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db

    with patch("app.routes.auth.send_signup_email"):
        with TestClient(app, raise_server_exceptions=True) as c:
            yield c

    app.dependency_overrides.clear()


# ── Shared helpers ────────────────────────────────────────────────────────────

def register_user(client, email="test@example.com", password="Password1!", name="Test User"):
    resp = client.post("/auth/signup", json={"email": email, "password": password, "name": name})
    assert resp.status_code == 201, resp.text
    return resp.json()


def get_tokens(client, email="test@example.com", password="Password1!"):
    resp = client.post("/auth/signin", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()


def auth_headers(access_token: str) -> dict:
    return {"Authorization": f"Bearer {access_token}"}
