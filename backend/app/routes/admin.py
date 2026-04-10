import os
import subprocess
import sys

from fastapi import APIRouter, Header, HTTPException

from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Admin"])


def _verify_admin(x_admin_key: str = Header(...)):
    expected = os.getenv("ADMIN_KEY")
    if not expected or x_admin_key != expected:
        raise HTTPException(status_code=403, detail="Invalid admin key")


@router.post("/retrain")
def retrain_model(x_admin_key: str = Header(...)):
    _verify_admin(x_admin_key)

    train_script = os.path.join("app", "ml", "train_model.py")
    if not os.path.exists(train_script):
        raise HTTPException(status_code=500, detail="Training script not found")

    logger.info("Model retraining triggered via admin endpoint")
    try:
        result = subprocess.run(
            [sys.executable, train_script],
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0:
            logger.error("Retrain failed", extra={"stderr": result.stderr})
            raise HTTPException(status_code=500, detail=f"Training failed: {result.stderr[-500:]}")

        logger.info("Model retrain complete")
        return {"status": "success", "output": result.stdout[-1000:]}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Training timed out after 5 minutes")
