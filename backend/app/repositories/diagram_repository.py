import hashlib
import uuid

from sqlalchemy.orm import Session

from app.models.collaborator import CollaboratorRole, DiagramCollaborator
from app.models.diagram import Diagram
from app.models.version import Blob, Commit


class DiagramRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get(self, diagram_id: uuid.UUID) -> Diagram | None:
        return self._db.query(Diagram).filter(Diagram.id == diagram_id).first()

    def list_for_user(self, user_id: uuid.UUID) -> list[Diagram]:
        return self._db.query(Diagram).filter(Diagram.user_id == user_id).all()

    def create(
        self,
        *,
        user_id: uuid.UUID,
        title: str,
        notation: str,
        parent_diagram_id: uuid.UUID | None = None,
        decomposed_node_id: str | None = None,
    ) -> Diagram:
        diagram = Diagram(
            user_id=user_id,
            title=title,
            notation=notation,
            parent_diagram_id=parent_diagram_id,
            decomposed_node_id=decomposed_node_id,
        )
        self._db.add(diagram)
        self._db.commit()
        self._db.refresh(diagram)
        return diagram

    def list_children(self, parent_diagram_id: uuid.UUID) -> list[Diagram]:
        return (
            self._db.query(Diagram)
            .filter(Diagram.parent_diagram_id == parent_diagram_id)
            .order_by(Diagram.created_at)
            .all()
        )

    def get_collaborator(
        self, *, diagram_id: uuid.UUID, user_id: uuid.UUID
    ) -> DiagramCollaborator | None:
        return (
            self._db.query(DiagramCollaborator)
            .filter(
                DiagramCollaborator.diagram_id == diagram_id,
                DiagramCollaborator.user_id == user_id,
            )
            .first()
        )

    def list_collaborators(self, diagram_id: uuid.UUID) -> list[DiagramCollaborator]:
        return (
            self._db.query(DiagramCollaborator)
            .filter(DiagramCollaborator.diagram_id == diagram_id)
            .all()
        )

    def add_collaborator(
        self, *, diagram_id: uuid.UUID, user_id: uuid.UUID, role: str = CollaboratorRole.EDITOR
    ) -> DiagramCollaborator:
        existing = self.get_collaborator(diagram_id=diagram_id, user_id=user_id)
        if existing is not None:
            existing.role = role
            self._db.commit()
            self._db.refresh(existing)
            return existing

        collaborator = DiagramCollaborator(diagram_id=diagram_id, user_id=user_id, role=role)
        self._db.add(collaborator)
        self._db.commit()
        self._db.refresh(collaborator)
        return collaborator

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

    def get_current_content(self, diagram: Diagram) -> str | None:
        if diagram.current_commit_id is None:
            return None
        commit = self._db.query(Commit).filter(Commit.id == diagram.current_commit_id).first()
        if commit is None:
            return None
        blob = self._db.query(Blob).filter(Blob.id == commit.blob_id).first()
        return blob.dsl_content if blob else None

    def list_versions(self, diagram_id: uuid.UUID) -> list[Commit]:
        return (
            self._db.query(Commit)
            .filter(Commit.diagram_id == diagram_id)
            .order_by(Commit.created_at.desc())
            .all()
        )
