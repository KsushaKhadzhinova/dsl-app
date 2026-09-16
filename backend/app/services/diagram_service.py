import uuid

from app.domain.interfaces import RenderResult, ValidationIssue
from app.dsl.errors import DslSyntaxError
from app.dsl.parser import parse
from app.models.collaborator import CollaboratorRole, DiagramCollaborator
from app.models.diagram import Diagram
from app.models.version import Commit
from app.notations import get as get_notation
from app.repositories.diagram_repository import DiagramRepository


class DiagramService:
    """Оркестрирует парсинг → валидацию → рендер и сохранение версий.
    Ничего не знает про HTTP — вызывается из app/api/routes/diagrams.py."""

    def __init__(self, diagrams: DiagramRepository) -> None:
        self._diagrams = diagrams

    def create(self, *, user_id: uuid.UUID, title: str, notation: str) -> Diagram:
        return self._diagrams.create(user_id=user_id, title=title, notation=notation)

    def create_decomposition(
        self,
        *,
        parent: Diagram,
        decomposed_node_id: str,
        title: str,
        notation: str,
    ) -> Diagram:
        return self._diagrams.create(
            user_id=parent.user_id,
            title=title,
            notation=notation,
            parent_diagram_id=parent.id,
            decomposed_node_id=decomposed_node_id,
        )

    def list_children(self, *, parent_diagram_id: uuid.UUID) -> list[Diagram]:
        return self._diagrams.list_children(parent_diagram_id)

    def has_access(self, *, diagram: Diagram, user_id: uuid.UUID) -> bool:
        if diagram.user_id == user_id:
            return True
        return self._diagrams.get_collaborator(diagram_id=diagram.id, user_id=user_id) is not None

    def is_owner(self, *, diagram: Diagram, user_id: uuid.UUID) -> bool:
        return diagram.user_id == user_id

    def add_collaborator(
        self, *, diagram: Diagram, user_id: uuid.UUID, role: str = CollaboratorRole.EDITOR
    ) -> DiagramCollaborator:
        return self._diagrams.add_collaborator(diagram_id=diagram.id, user_id=user_id, role=role)

    def render(self, *, dsl_content: str) -> tuple[RenderResult | None, list[ValidationIssue]]:
        try:
            model = parse(dsl_content)
        except DslSyntaxError as exc:
            return None, [ValidationIssue(severity="error", message=exc.message)]

        profile = get_notation(model.notation)
        issues = profile.validate(model)
        if any(issue.severity == "error" for issue in issues):
            return None, issues

        return profile.render(model), issues

    def get_current_content(self, *, diagram: Diagram) -> str | None:
        return self._diagrams.get_current_content(diagram)

    def save_version(
        self, *, diagram: Diagram, dsl_content: str, author: str, message: str = ""
    ) -> Commit:
        return self._diagrams.commit_version(
            diagram=diagram, dsl_content=dsl_content, author=author, message=message
        )
