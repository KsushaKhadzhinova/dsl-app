"""Трекинг необработанных ошибок через Sentry-SDK-совместимый бэкенд
(GlitchTip, см. NFR-OBS-02, NFR-REL-03 в docs/requirements/02-nonfunctional-requirements.md).
Включается только если задан GLITCHTIP_DSN — иначе полностью no-op, как AI_PROVIDER=stub
(NFR-REL-01): отсутствие конфигурации не должно менять поведение приложения."""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from app.core.config import Settings


def init_error_tracking(settings: Settings) -> None:
    if not settings.glitchtip_dsn:
        return

    sentry_sdk.init(
        dsn=settings.glitchtip_dsn,
        integrations=[StarletteIntegration(), FastApiIntegration()],
    )
