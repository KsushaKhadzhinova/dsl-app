import uuid
from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse

from app.api.deps import CurrentUser, get_diagram_repository, get_user_repository
from app.integrations.storage.local_provider import LocalDownloadProvider
from app.repositories.diagram_repository import DiagramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.diagram import (
    CollaboratorAddRequest,
    CollaboratorResponse,
    DecompositionCreateRequest,
    DiagramCreateRequest,
    DiagramDetailResponse,
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


def _get_accessible_diagram(
    diagram_id: uuid.UUID,
    user: CurrentUser,
    diagrams: DiagramRepository,
    service: DiagramService,
):
    diagram = diagrams.get(diagram_id)
    if diagram is None or not service.has_access(diagram=diagram, user_id=user.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Диаграмма не найдена.")
    return diagram


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


@router.get("/{diagram_id}", response_model=DiagramDetailResponse)
def get_diagram(
    diagram_id: uuid.UUID,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> DiagramDetailResponse:
    diagram = _get_accessible_diagram(diagram_id, user, diagrams, service)
    content = service.get_current_content(diagram=diagram)
    return DiagramDetailResponse(
        **DiagramResponse.model_validate(diagram).model_dump(), current_dsl_content=content
    )


@router.get("/{diagram_id}/export")
async def export_diagram(
    diagram_id: uuid.UUID,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> PlainTextResponse:
    diagram = _get_accessible_diagram(diagram_id, user, diagrams, service)
    content = service.get_current_content(diagram=diagram) or ""
    provider = LocalDownloadProvider()
    filename = await provider.save(path=f"{diagram.title}.dsl", content=content, token=None)
    disposition = f"attachment; filename=\"diagram.dsl\"; filename*=UTF-8''{quote(filename)}"
    return PlainTextResponse(
        content,
        media_type="text/plain",
        headers={"Content-Disposition": disposition},
    )


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
    diagram = _get_accessible_diagram(diagram_id, user, diagrams, service)
    commit = service.save_version(
        diagram=diagram, dsl_content=body.dsl_content, author="user", message=body.message
    )
    return VersionResponse.model_validate(commit)


@router.get("/{diagram_id}/versions", response_model=list[VersionResponse])
def list_versions(
    diagram_id: uuid.UUID,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> list[VersionResponse]:
    diagram = _get_accessible_diagram(diagram_id, user, diagrams, service)
    return [VersionResponse.model_validate(c) for c in diagrams.list_versions(diagram.id)]


@router.post(
    "/{diagram_id}/collaborators",
    response_model=CollaboratorResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_collaborator(
    diagram_id: uuid.UUID,
    body: CollaboratorAddRequest,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    users: Annotated[UserRepository, Depends(get_user_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> CollaboratorResponse:
    diagram = _get_accessible_diagram(diagram_id, user, diagrams, service)
    if not service.is_owner(diagram=diagram, user_id=user.id):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Только владелец диаграммы может добавлять соавторов."
        )

    target = users.get_by_email(body.identifier) or users.get_by_username(body.identifier)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Пользователь не найден.")

    collaborator = service.add_collaborator(diagram=diagram, user_id=target.id, role=body.role)
    return CollaboratorResponse.model_validate(collaborator)


@router.get("/{diagram_id}/children", response_model=list[DiagramResponse])
def list_children(
    diagram_id: uuid.UUID,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> list[DiagramResponse]:
    diagram = _get_accessible_diagram(diagram_id, user, diagrams, service)
    children = service.list_children(parent_diagram_id=diagram.id)
    return [DiagramResponse.model_validate(d) for d in children]


@router.post(
    "/{diagram_id}/decompositions",
    response_model=DiagramResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_decomposition(
    diagram_id: uuid.UUID,
    body: DecompositionCreateRequest,
    user: CurrentUser,
    diagrams: Annotated[DiagramRepository, Depends(get_diagram_repository)],
    service: Annotated[DiagramService, Depends(_service)],
) -> DiagramResponse:
    parent = _get_accessible_diagram(diagram_id, user, diagrams, service)
    child = service.create_decomposition(
        parent=parent,
        decomposed_node_id=body.decomposed_node_id,
        title=body.title,
        notation=body.notation,
    )
    return DiagramResponse.model_validate(child)
