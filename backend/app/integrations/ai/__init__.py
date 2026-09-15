"""Фабрика AI-провайдера — выбор реализации по настройке `AI_PROVIDER`.
Подробности и инструкция получения ключей: docs/architecture/01-ai-provider-setup.md."""

from app.core.config import Settings
from app.domain.interfaces import AIProvider
from app.integrations.ai.stub_provider import StubAIProvider


def get_ai_provider(settings: Settings) -> AIProvider:
    if settings.ai_provider == "stub" or not settings.ai_api_key:
        return StubAIProvider()

    if settings.ai_provider == "anthropic":
        from app.integrations.ai.anthropic_provider import AnthropicAIProvider

        return AnthropicAIProvider(api_key=settings.ai_api_key)

    if settings.ai_provider == "openai":
        from app.integrations.ai.openai_provider import OpenAIProvider

        return OpenAIProvider(api_key=settings.ai_api_key)

    raise ValueError(f"Неизвестный AI_PROVIDER: {settings.ai_provider}")
