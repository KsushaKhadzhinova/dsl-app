import uuid

from app.domain.interfaces import RenderResult, ValidationIssue
from app.dsl.errors import DslSyntaxError
from app.dsl.parser import parse
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

    def save_version(
        self, *, diagram: Diagram, dsl_content: str, author: str, message: str = ""
    ) -> Commit:
        return self._diagrams.commit_version(
            diagram=diagram, dsl_content=dsl_content, author=author, message=message
        )
