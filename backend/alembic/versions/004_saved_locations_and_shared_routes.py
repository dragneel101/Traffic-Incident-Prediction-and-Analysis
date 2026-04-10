"""Add saved_locations and shared_routes tables

Revision ID: 004
Revises: 003
Create Date: 2026-04-09

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "saved_locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_saved_locations_user_id", "saved_locations", ["user_id"])

    op.create_table(
        "shared_routes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("token", sa.String(), nullable=False, unique=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("start_address", sa.String(), nullable=True),
        sa.Column("end_address", sa.String(), nullable=True),
        sa.Column("route_data", sa.JSON(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_shared_routes_token", "shared_routes", ["token"])


def downgrade() -> None:
    op.drop_index("ix_shared_routes_token", "shared_routes")
    op.drop_table("shared_routes")
    op.drop_index("ix_saved_locations_user_id", "saved_locations")
    op.drop_table("saved_locations")
