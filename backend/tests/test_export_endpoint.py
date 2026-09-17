import pytest
from fastapi import HTTPException

from app.api.routes.diagrams import export_diagram, save_version
from app.repositories.diagram_repository import DiagramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.diagram import SaveVersionRequest
from app.services.diagram_service import DiagramService

ERD_DSL = (
    'diagram erd.crows_foot.logical "Заказы" {\n'
    '  entity customer "Клиент" pk=id\n'
    '  entity order "Заказ" pk=id\n'
    "  customer -> order\n"
    "}"
)

BPMN_DSL = (
    'diagram bpmn.process "Процесс" {\n'
    '  start_event s1 "Начало"\n'
    '  task t1 "Шаг"\n'
    '  end_event e1 "Конец"\n'
    "  s1 -> t1 -> e1\n"
    "}"
)


def _make_user(db_session):
    return UserRepository(db_session).create(
        username="owner", email="owner@example.com", hashed_password="x"
    )


def _make_diagram(diagrams: DiagramRepository, owner_id, notation="erd.crows_foot.logical"):
    return diagrams.create(user_id=owner_id, title="Заказы", notation=notation)


async def test_export_mermaid_returns_erdiagram_content(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)
    save_version(diagram.id, SaveVersionRequest(dsl_content=ERD_DSL), owner, diagrams, service)

    response = await export_diagram(diagram.id, owner, diagrams, service, "mermaid")

    assert response.media_type == "text/plain"
    assert response.body.decode("utf-8").startswith("erDiagram")
    assert response.headers["content-disposition"].startswith('attachment; filename="diagram.mmd"')


async def test_export_bpmn_xml_returns_xml_content(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id, notation="bpmn.process")
    save_version(diagram.id, SaveVersionRequest(dsl_content=BPMN_DSL), owner, diagrams, service)

    response = await export_diagram(diagram.id, owner, diagrams, service, "bpmn_xml")

    assert response.media_type == "application/xml"
    assert "<bpmn:startEvent" in response.body.decode("utf-8")
    assert response.headers["content-disposition"].startswith('attachment; filename="diagram.bpmn"')


async def test_export_drawio_returns_mxcell_content(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)
    save_version(diagram.id, SaveVersionRequest(dsl_content=ERD_DSL), owner, diagrams, service)

    response = await export_diagram(diagram.id, owner, diagrams, service, "drawio_xml")

    assert response.media_type == "application/xml"
    assert "<mxCell" in response.body.decode("utf-8")


async def test_export_bpmn_xml_rejected_for_erd_diagram(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)
    save_version(diagram.id, SaveVersionRequest(dsl_content=ERD_DSL), owner, diagrams, service)

    with pytest.raises(HTTPException) as exc_info:
        await export_diagram(diagram.id, owner, diagrams, service, "bpmn_xml")

    assert exc_info.value.status_code == 400


async def test_export_native_format_without_saved_version_returns_400(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)

    with pytest.raises(HTTPException) as exc_info:
        await export_diagram(diagram.id, owner, diagrams, service, "mermaid")

    assert exc_info.value.status_code == 400


async def test_export_without_format_still_returns_dsl_download(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)
    save_version(diagram.id, SaveVersionRequest(dsl_content=ERD_DSL), owner, diagrams, service)

    response = await export_diagram(diagram.id, owner, diagrams, service)

    assert response.body.decode("utf-8") == ERD_DSL
    assert response.media_type == "text/plain"
