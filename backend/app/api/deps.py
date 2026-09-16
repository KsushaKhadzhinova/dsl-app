import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.core.rate_limit import AiQuotaLimiter
from app.core.redis_client import get_redis_client
from app.core.security import decode_access_token
from app.domain.interfaces import AIProvider
from app.integrations.ai import get_ai_provider
from app.models.user import User
from app.repositories.diagram_repository import DiagramRepository
from app.repositories.user_repository import UserRepository

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_app_settings() -> Settings:
    return get_settings()


def get_ai_provider_dep(settings: Annotated[Settings, Depends(get_app_settings)]) -> AIProvider:
    return get_ai_provider(settings)


def get_ai_quota_limiter(
    settings: Annotated[Settings, Depends(get_app_settings)],
) -> AiQuotaLimiter:
    return AiQuotaLimiter(get_redis_client(), settings.ai_daily_quota)


def get_user_repository(db: DbSession) -> UserRepository:
    return UserRepository(db)


def get_diagram_repository(db: DbSession) -> DiagramRepository:
    return DiagramRepository(db)


def get_current_user(
    token: Annotated[str | None, Depends(_oauth2_scheme)],
    users: Annotated[UserRepository, Depends(get_user_repository)],
) -> User:
    if token is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Требуется аутентификация.")
    try:
        user_id = decode_access_token(token)
    except Exception as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Недействительный токен.") from exc

    user = users.get_by_id(uuid.UUID(user_id))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Пользователь не найден.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
