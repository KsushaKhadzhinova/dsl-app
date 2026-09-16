"""Базовая схема: users, diagrams, blobs, commits, ai_requests.

Revision ID: 0001
Revises:
Create Date: 2026-09-17

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("theme_preference", sa.String(length=10), nullable=False, server_default="dark"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "diagrams",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("notation", sa.String(length=50), nullable=False),
        sa.Column("current_commit_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_diagrams_user_id", "diagrams", ["user_id"])

    op.create_table(
        "blobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("dsl_content", sa.Text(), nullable=False),
    )
    op.create_index("ix_blobs_content_hash", "blobs", ["content_hash"], unique=True)

    op.create_table(
        "commits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("diagram_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("diagrams.id"), nullable=False),
        sa.Column("blob_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("blobs.id"), nullable=False),
        sa.Column("author", sa.String(length=10), nullable=False),
        sa.Column("message", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_commits_diagram_id", "commits", ["diagram_id"])

    op.create_foreign_key(
        "fk_diagrams_current_commit_id_commits",
        "diagrams",
        "commits",
        ["current_commit_id"],
        ["id"],
    )

    op.create_table(
        "ai_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("diagram_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("diagrams.id"), nullable=True),
        sa.Column("mode", sa.String(length=20), nullable=False),
        sa.Column("prompt_text", sa.Text(), nullable=False),
        sa.Column("generated_dsl", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ai_requests")
    op.drop_constraint("fk_diagrams_current_commit_id_commits", "diagrams", type_="foreignkey")
    op.drop_index("ix_commits_diagram_id", table_name="commits")
    op.drop_table("commits")
    op.drop_index("ix_blobs_content_hash", table_name="blobs")
    op.drop_table("blobs")
    op.drop_index("ix_diagrams_user_id", table_name="diagrams")
    op.drop_table("diagrams")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
