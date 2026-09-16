from urllib.parse import quote

from app.api.routes.diagrams import export_diagram, get_diagram, save_version
from app.repositories.diagram_repository import DiagramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.diagram import SaveVersionRequest
from app.services.diagram_service import DiagramService


def _make_user(db_session):
    return UserRepository(db_session).create(
        username="owner", email="owner@example.com", hashed_password="x"
    )


def _make_diagram(diagrams: DiagramRepository, owner_id):
    return diagrams.create(user_id=owner_id, title="Заказы", notation="erd.crows_foot.logical")


async def test_get_diagram_has_no_content_before_first_version(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)

    detail = get_diagram(diagram.id, owner, diagrams, service)

    assert detail.current_dsl_content is None


async def test_get_diagram_returns_latest_saved_content(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)
    dsl_code = 'diagram erd.crows_foot.logical "Заказы" {\n  entity customer "Клиент" pk=id\n}'

    save_version(diagram.id, SaveVersionRequest(dsl_content=dsl_code), owner, diagrams, service)
    detail = get_diagram(diagram.id, owner, diagrams, service)

    assert detail.current_dsl_content == dsl_code


async def test_export_diagram_returns_downloadable_dsl(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)
    dsl_code = 'diagram erd.crows_foot.logical "Заказы" {\n  entity customer "Клиент" pk=id\n}'
    save_version(diagram.id, SaveVersionRequest(dsl_content=dsl_code), owner, diagrams, service)

    response = await export_diagram(diagram.id, owner, diagrams, service)

    assert response.body.decode("utf-8") == dsl_code
    assert response.headers["content-disposition"] == (
        'attachment; filename="diagram.dsl"; filename*=UTF-8\'\'' + quote("Заказы.dsl")
    )


async def test_export_diagram_without_saved_version_returns_empty_content(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session)
    diagram = _make_diagram(diagrams, owner.id)

    response = await export_diagram(diagram.id, owner, diagrams, service)

    assert response.body.decode("utf-8") == ""
