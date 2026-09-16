"""Совместное редактирование (DiagramCollaborator) и иерархическая декомпозиция
IDEF0/DFD (parent_diagram_id, decomposed_node_id на Diagram) — FR-AUTH-08 и FR-NOT-06a,
решено см. docs/requirements/00-overview.md §5, пп. 1 и 2.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-17

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "diagrams",
        sa.Column("parent_diagram_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "diagrams",
        sa.Column("decomposed_node_id", sa.String(length=100), nullable=True),
    )
    op.create_index("ix_diagrams_parent_diagram_id", "diagrams", ["parent_diagram_id"])
    op.create_foreign_key(
        "fk_diagrams_parent_diagram_id_diagrams",
        "diagrams",
        "diagrams",
        ["parent_diagram_id"],
        ["id"],
    )

    op.create_table(
        "diagram_collaborators",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("diagram_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("diagrams.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False, server_default="editor"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("diagram_id", "user_id", name="uq_diagram_collaborator"),
    )
    op.create_index("ix_diagram_collaborators_diagram_id", "diagram_collaborators", ["diagram_id"])
    op.create_index("ix_diagram_collaborators_user_id", "diagram_collaborators", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_diagram_collaborators_user_id", table_name="diagram_collaborators")
    op.drop_index("ix_diagram_collaborators_diagram_id", table_name="diagram_collaborators")
    op.drop_table("diagram_collaborators")

    op.drop_constraint("fk_diagrams_parent_diagram_id_diagrams", "diagrams", type_="foreignkey")
    op.drop_index("ix_diagrams_parent_diagram_id", table_name="diagrams")
    op.drop_column("diagrams", "decomposed_node_id")
    op.drop_column("diagrams", "parent_diagram_id")
