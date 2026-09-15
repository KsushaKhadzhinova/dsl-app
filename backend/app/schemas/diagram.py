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
    created_at: datetime
    updated_at: datetime

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
