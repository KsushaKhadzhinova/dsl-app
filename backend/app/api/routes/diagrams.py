import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, get_diagram_repository
from app.repositories.diagram_repository import DiagramRepository
from app.schemas.diagram import (
    DiagramCreateRequest,
    DiagramResponse,
    RenderResponse,
    SaveVersionRequest,
    ValidationIssueResponse,
    VersionResponse,
)
from app.services.diagram_service import DiagramService

router = APIRouter(prefix="/api/v1/diagrams", tags=["diagrams"])


def _service(diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)]) -> DiagramService:
    return DiagramService(diagrams)


@router.post("", response_model=DiagramResponse, status_code=status.HTTP_201_CREATED)
def create_diagram(
    body: DiagramCreateRequest, user: CurrentUser, service: Annotated[DiagramService, Depends(_service)]
) -> DiagramResponse:
    diagram = service.create(user_id=user.id, title=body.title, notation=body.notation)
    return DiagramResponse.model_validate(diagram)


@router.get("", response_model=list[DiagramResponse])
def list_diagrams(
    user: CurrentUser, diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)]
) -> list[DiagramResponse]:
    return [DiagramResponse.model_validate(d) for d in diagrams.list_for_user(user.id)]


@router.post("/render", response_model=RenderResponse)
def render_dsl(
    body: SaveVersionRequest, service: Annotated[DiagramService, Depends(_service)]
) -> RenderResponse:
    """Рендер без сохранения — соответствует кнопке Run в редакторе."""
    result, issues = service.render(dsl_content=body.dsl_content)
    return RenderResponse(
        svg=result.svg if result else "",
        issues=[ValidationIssueResponse(**vars(i)) for i in issues],
    )


@router.post("/{diagram_id}/versions", response_model=VersionResponse, status_code=status.HTTP_201_CREATED)
def save_version(
    diagram_id: uuid.UUID,
    body: SaveVersionRequest,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> VersionResponse:
    diagram = diagrams.get(diagram_id)
    if diagram is None or diagram.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Диаграмма не найдена.")
    commit = service.save_version(
        diagram=diagram, dsl_content=body.dsl_content, author="user", message=body.message
    )
    return VersionResponse.model_validate(commit)


@router.get("/{diagram_id}/versions", response_model=list[VersionResponse])
def list_versions(
    diagram_id: uuid.UUID,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
) -> list[VersionResponse]:
    diagram = diagrams.get(diagram_id)
    if diagram is None or diagram.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Диаграмма не найдена.")
    return [VersionResponse.model_validate(c) for c in diagrams.list_versions(diagram_id)]
