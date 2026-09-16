import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Diagram(Base):
    """Метаданные диаграммы. Сам DSL-код живёт в Blob, привязанном к Commit —
    см. app/models/version.py и docs/architecture/00-system-architecture.md, §6."""

    __tablename__ = "diagrams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    notation: Mapped[str] = mapped_column(String(50))  # напр. "erd.crows_foot.logical"
    current_commit_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("commits.id", use_alter=True), nullable=True
    )
    parent_diagram_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("diagrams.id", use_alter=True), nullable=True, index=True
    )
    decomposed_node_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="diagrams")
    commits: Mapped[list["Commit"]] = relationship(
        back_populates="diagram", foreign_keys="Commit.diagram_id"
    )
    collaborators: Mapped[list["DiagramCollaborator"]] = relationship(back_populates="diagram")
    parent: Mapped["Diagram | None"] = relationship(
        remote_side=[id], back_populates="children", foreign_keys=[parent_diagram_id]
    )
    children: Mapped[list["Diagram"]] = relationship(
        back_populates="parent", foreign_keys=[parent_diagram_id]
    )
