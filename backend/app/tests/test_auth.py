from app.tests.conftest import register_user, get_tokens, auth_headers


def test_signup_creates_user(client):
    resp = client.post("/auth/signup", json={
        "email": "newuser@example.com",
        "password": "Password1!",
        "name": "New User",
    })
    assert resp.status_code == 201
    assert "user_id" in resp.json()


def test_signup_duplicate_email_rejected(client):
    register_user(client, email="dup@example.com")
    resp = client.post("/auth/signup", json={
        "email": "dup@example.com",
        "password": "Password1!",
    })
    assert resp.status_code == 400
    assert "already in use" in resp.json()["detail"].lower()


def test_signin_returns_both_tokens(client):
    register_user(client)
    resp = client.post("/auth/signin", json={
        "email": "test@example.com",
        "password": "Password1!",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_signin_wrong_password_rejected(client):
    register_user(client)
    resp = client.post("/auth/signin", json={
        "email": "test@example.com",
        "password": "WrongPassword99!",
    })
    assert resp.status_code == 401


def test_signin_unknown_email_rejected(client):
    resp = client.post("/auth/signin", json={
        "email": "nobody@example.com",
        "password": "Password1!",
    })
    assert resp.status_code == 401


def test_refresh_token_returns_new_access_token(client):
    register_user(client)
    tokens = get_tokens(client)
    resp = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    # New token should differ from the original
    assert body["access_token"] != tokens["access_token"]


def test_refresh_after_logout_is_rejected(client):
    register_user(client)
    tokens = get_tokens(client)

    client.post("/auth/logout", json={"refresh_token": tokens["refresh_token"]})

    resp = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 401


def test_logout_succeeds(client):
    register_user(client)
    tokens = get_tokens(client)
    resp = client.post("/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 200


def test_protected_route_without_token_is_rejected(client):
    resp = client.get("/api/stats/total")
    assert resp.status_code == 401


def test_protected_route_with_valid_token(client):
    register_user(client)
    tokens = get_tokens(client)
    resp = client.get("/api/stats/total", headers=auth_headers(tokens["access_token"]))
    assert resp.status_code == 200
