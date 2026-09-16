import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CollaboratorRole:
    """Роли участников диаграммы (FR-AUTH-08, решено —
    docs/requirements/00-overview.md §5, п. 1). Единственный источник этих значений,
    чтобы не разбрасывать строки "owner"/"editor" по коду (NFR-MAINT-04)."""

    OWNER = "owner"
    EDITOR = "editor"


class DiagramCollaborator(Base):
    """Соавтор диаграммы сверх единственного владельца (Diagram.user_id).
    Владелец не имеет отдельной записи здесь — его права проверяются напрямую
    через Diagram.user_id."""

    __tablename__ = "diagram_collaborators"
    __table_args__ = (UniqueConstraint("diagram_id", "user_id", name="uq_diagram_collaborator"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagram_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("diagrams.id"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(20), default=CollaboratorRole.EDITOR)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    diagram: Mapped["Diagram"] = relationship(back_populates="collaborators")
    user: Mapped["User"] = relationship()
