#!/bin/sh
set -e

mkdir -p app/models

AWS_ACCESS_KEY_ID="$SEAWEED_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$SEAWEED_SECRET_KEY" \
aws s3 cp s3://tipa-models/collision_risk_model.pkl app/models/collision_risk_model.pkl \
  --endpoint-url "$SEAWEED_ENDPOINT_URL"

alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
