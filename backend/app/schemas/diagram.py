import uuid
from datetime import datetime

from pydantic import BaseModel


class DiagramCreateRequest(BaseModel):
    title: str
    notation: str


class DiagramResponse(BaseModel):
    id: uuid.UUID
    title: str
    notation: str
    parent_diagram_id: uuid.UUID | None = None
    decomposed_node_id: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DiagramDetailResponse(DiagramResponse):
    current_dsl_content: str | None = None


class DecompositionCreateRequest(BaseModel):
    decomposed_node_id: str
    title: str
    notation: str


class CollaboratorAddRequest(BaseModel):
    identifier: str
    role: str = "editor"


class CollaboratorResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SaveVersionRequest(BaseModel):
    dsl_content: str
    message: str = ""


class ValidationIssueResponse(BaseModel):
    severity: str
    message: str
    node_id: str | None = None
    edge_id: str | None = None


class RenderResponse(BaseModel):
    svg: str
    issues: list[ValidationIssueResponse]


class VersionResponse(BaseModel):
    id: uuid.UUID
    author: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}
