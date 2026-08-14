"""baseline — marks the schema as of the waitlist feature (registration_closed, is_waitlist already applied manually)

Revision ID: 0001_baseline
Revises:
Create Date: 2026-07-15

This migration is deliberately empty. It exists so Alembic has a starting
point that matches what's already running in production (the
registration_closed and is_waitlist columns were added by hand before
Alembic was introduced).

Do NOT run `alembic upgrade head` against production using this revision —
it would try to build from nothing. Instead, run:

    alembic stamp 0001_baseline

against production exactly once. This tells Alembic "the database is
already at this point," without executing any SQL. From here on, new
migrations layer on top of this one normally.

Fresh databases (e.g. a new local dev DB) don't need this at all — the
app's `models.Base.metadata.create_all(bind=engine)` call on startup
creates every table/column from the current models.py in one shot.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
