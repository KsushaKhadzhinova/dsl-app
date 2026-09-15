from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_user_repository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthError, AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _service(users: Annotated[UserRepository, Depends(get_user_repository)]) -> AuthService:
    return AuthService(users)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, service: Annotated[AuthService, Depends(_service)]) -> dict[str, str]:
    try:
        user = service.register(username=body.username, email=body.email, password=body.password)
    except AuthError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    return {"id": str(user.id)}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, service: Annotated[AuthService, Depends(_service)]) -> TokenResponse:
    try:
        token = service.login(email=body.email, password=body.password)
    except AuthError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc
    return TokenResponse(access_token=token)
