import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Blob(Base):
    """Содержимое DSL-кода, адресуемое по хэшу — как git-blob (docs/literature §7, [25]).
    Одинаковый код между версиями не дублируется: несколько Commit могут
    ссылаться на один и тот же Blob."""

    __tablename__ = "blobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    dsl_content: Mapped[str] = mapped_column(Text)


class Commit(Base):
    __tablename__ = "commits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagram_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("diagrams.id"), index=True)
    blob_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("blobs.id"))
    author: Mapped[str] = mapped_column(String(10))  # "user" | "ai"
    message: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    diagram: Mapped["Diagram"] = relationship(back_populates="commits", foreign_keys=[diagram_id])
    blob: Mapped["Blob"] = relationship()


class AIRequest(Base):
    """История запросов к AI-ассистенту — отдельно от commits, чтобы можно было
    анализировать качество генерации независимо от истории версий."""

    __tablename__ = "ai_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagram_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("diagrams.id"), nullable=True)
    mode: Mapped[str] = mapped_column(String(20))  # "write" | "fix_code" | "fix_error" | "docs"
    prompt_text: Mapped[str] = mapped_column(Text)
    generated_dsl: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
