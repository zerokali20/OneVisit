"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-06

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Tables are auto-created by SQLAlchemy Base.metadata.create_all(bind=engine)
    pass

def downgrade() -> None:
    pass
