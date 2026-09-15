import hashlib
import uuid

from sqlalchemy.orm import Session

from app.models.diagram import Diagram
from app.models.version import Blob, Commit


class DiagramRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get(self, diagram_id: uuid.UUID) -> Diagram | None:
        return self._db.query(Diagram).filter(Diagram.id == diagram_id).first()

    def list_for_user(self, user_id: uuid.UUID) -> list[Diagram]:
        return self._db.query(Diagram).filter(Diagram.user_id == user_id).all()

    def create(self, *, user_id: uuid.UUID, title: str, notation: str) -> Diagram:
        diagram = Diagram(user_id=user_id, title=title, notation=notation)
        self._db.add(diagram)
        self._db.commit()
        self._db.refresh(diagram)
        return diagram

    def commit_version(
        self, *, diagram: Diagram, dsl_content: str, author: str, message: str = ""
    ) -> Commit:
        """Сохраняет новую версию: блоб дедуплицируется по хэшу содержимого,
        как git-объект (см. docs/architecture/00-system-architecture.md, §6)."""
        content_hash = hashlib.sha256(dsl_content.encode("utf-8")).hexdigest()
        blob = self._db.query(Blob).filter(Blob.content_hash == content_hash).first()
        if blob is None:
            blob = Blob(content_hash=content_hash, dsl_content=dsl_content)
            self._db.add(blob)
            self._db.flush()

        commit = Commit(diagram_id=diagram.id, blob_id=blob.id, author=author, message=message)
        self._db.add(commit)
        self._db.flush()

        diagram.current_commit_id = commit.id
        self._db.commit()
        self._db.refresh(commit)
        return commit

    def list_versions(self, diagram_id: uuid.UUID) -> list[Commit]:
        return (
            self._db.query(Commit)
            .filter(Commit.diagram_id == diagram_id)
            .order_by(Commit.created_at.desc())
            .all()
        )
