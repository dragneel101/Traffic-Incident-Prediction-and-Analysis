"""Add traffic columns to prediction_logs

Revision ID: 003
Revises: 002
Create Date: 2026-04-08

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("prediction_logs", sa.Column("congestion_level", sa.Float(), nullable=True))
    op.add_column("prediction_logs", sa.Column("incident_count", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("prediction_logs", "incident_count")
    op.drop_column("prediction_logs", "congestion_level")
