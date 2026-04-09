#!/bin/sh
set -e

python - <<'EOF'
import os, boto3
from botocore.client import Config

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["SEAWEED_ENDPOINT_URL"],
    aws_access_key_id=os.environ["SEAWEED_ACCESS_KEY"],
    aws_secret_access_key=os.environ["SEAWEED_SECRET_KEY"],
    config=Config(signature_version="s3v4"),
)
os.makedirs("app/models", exist_ok=True)
print("Downloading model from S3...")
s3.download_file("tipa-models", "collision_risk_model.pkl", "app/models/collision_risk_model.pkl")
print("Model downloaded successfully.")
EOF

alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
