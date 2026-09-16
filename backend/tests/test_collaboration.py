import uuid

import pytest
from fastapi import HTTPException

from app.api.routes.diagrams import _get_accessible_diagram, add_collaborator, list_children
from app.models.collaborator import CollaboratorRole
from app.repositories.diagram_repository import DiagramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.diagram import CollaboratorAddRequest
from app.services.diagram_service import DiagramService


def _make_user(db_session, username: str, email: str):
    return UserRepository(db_session).create(
        username=username, email=email, hashed_password="x"
    )


def _make_diagram(
    diagrams: DiagramRepository, owner_id, title="Заказы", notation="erd.crows_foot.logical"
):
    return diagrams.create(user_id=owner_id, title=title, notation=notation)


def test_owner_has_access(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    assert service.has_access(diagram=diagram, user_id=owner.id) is True
    assert service.is_owner(diagram=diagram, user_id=owner.id) is True


def test_collaborator_editor_has_access(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    collaborator = _make_user(db_session, "collab", "collab@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    service.add_collaborator(diagram=diagram, user_id=collaborator.id, role=CollaboratorRole.EDITOR)

    assert service.has_access(diagram=diagram, user_id=collaborator.id) is True
    assert service.is_owner(diagram=diagram, user_id=collaborator.id) is False


def test_stranger_has_no_access(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    stranger = _make_user(db_session, "stranger", "stranger@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    assert service.has_access(diagram=diagram, user_id=stranger.id) is False


def test_stranger_gets_404_not_403(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    stranger = _make_user(db_session, "stranger", "stranger@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    with pytest.raises(HTTPException) as exc_info:
        _get_accessible_diagram(diagram.id, stranger, diagrams, service)

    assert exc_info.value.status_code == 404


def test_nonexistent_diagram_gets_404(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")

    with pytest.raises(HTTPException) as exc_info:
        _get_accessible_diagram(uuid.uuid4(), owner, diagrams, service)

    assert exc_info.value.status_code == 404


def test_owner_can_add_collaborator_by_email(db_session):
    diagrams = DiagramRepository(db_session)
    users = UserRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    invitee = _make_user(db_session, "invitee", "invitee@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    response = add_collaborator(
        diagram.id,
        CollaboratorAddRequest(identifier="invitee@example.com", role="editor"),
        owner,
        diagrams,
        users,
        service,
    )

    assert response.user_id == invitee.id
    assert response.role == "editor"
    assert service.has_access(diagram=diagram, user_id=invitee.id) is True


def test_owner_can_add_collaborator_by_username(db_session):
    diagrams = DiagramRepository(db_session)
    users = UserRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    invitee = _make_user(db_session, "invitee", "invitee@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    response = add_collaborator(
        diagram.id,
        CollaboratorAddRequest(identifier="invitee", role="editor"),
        owner,
        diagrams,
        users,
        service,
    )

    assert response.user_id == invitee.id


def test_non_owner_cannot_add_collaborator(db_session):
    diagrams = DiagramRepository(db_session)
    users = UserRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    collaborator = _make_user(db_session, "collab", "collab@example.com")
    _make_user(db_session, "other", "other@example.com")
    diagram = _make_diagram(diagrams, owner.id)
    service.add_collaborator(diagram=diagram, user_id=collaborator.id, role=CollaboratorRole.EDITOR)

    with pytest.raises(HTTPException) as exc_info:
        add_collaborator(
            diagram.id,
            CollaboratorAddRequest(identifier="other@example.com", role="editor"),
            collaborator,
            diagrams,
            users,
            service,
        )

    assert exc_info.value.status_code == 403


def test_add_unknown_identifier_returns_404(db_session):
    diagrams = DiagramRepository(db_session)
    users = UserRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    with pytest.raises(HTTPException) as exc_info:
        add_collaborator(
            diagram.id,
            CollaboratorAddRequest(identifier="ghost@example.com", role="editor"),
            owner,
            diagrams,
            users,
            service,
        )

    assert exc_info.value.status_code == 404


def test_decomposition_links_parent_and_child(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    parent = _make_diagram(diagrams, owner.id, title="Контекст", notation="idef0")

    child = service.create_decomposition(
        parent=parent, decomposed_node_id="a1", title="Декомпозиция A1", notation="idef0"
    )

    assert child.parent_diagram_id == parent.id
    assert child.decomposed_node_id == "a1"


def test_list_children_returns_created_decompositions(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    parent = _make_diagram(diagrams, owner.id, title="Контекст", notation="idef0")
    child = service.create_decomposition(
        parent=parent, decomposed_node_id="a1", title="Декомпозиция A1", notation="idef0"
    )

    children = list_children(parent.id, owner, diagrams, service)

    assert [c.id for c in children] == [child.id]


def test_diagram_without_parent_has_empty_children(db_session):
    diagrams = DiagramRepository(db_session)
    service = DiagramService(diagrams)
    owner = _make_user(db_session, "owner", "owner@example.com")
    diagram = _make_diagram(diagrams, owner.id)

    children = list_children(diagram.id, owner, diagrams, service)

    assert children == []
