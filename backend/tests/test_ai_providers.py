from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.config import Settings
from app.integrations.ai import get_ai_provider
from app.integrations.ai.anthropic_provider import AnthropicAIProvider
from app.integrations.ai.openai_provider import OpenAIProvider
from app.integrations.ai.stub_provider import StubAIProvider


def _anthropic_message(text: str) -> SimpleNamespace:
    return SimpleNamespace(content=[SimpleNamespace(text=text)])


def _openai_response(text: str) -> SimpleNamespace:
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=text))])


async def test_anthropic_provider_generates_dsl_from_prompt():
    provider = AnthropicAIProvider(api_key="sk-ant-test")
    provider._client.messages.create = AsyncMock(
        return_value=_anthropic_message('diagram erd.crows_foot.logical "X" {}')
    )

    result = await provider.generate_dsl_from_text(
        prompt="сделай ERD заказов", notation="erd.crows_foot.logical"
    )

    assert result == 'diagram erd.crows_foot.logical "X" {}'
    _, kwargs = provider._client.messages.create.call_args
    assert kwargs["model"] == AnthropicAIProvider.__dict__["__init__"].__defaults__[0]
    assert "сделай ERD заказов" in kwargs["messages"][0]["content"]
    assert "erd.crows_foot.logical" in kwargs["messages"][0]["content"]
    assert "DSL" in kwargs["system"]


async def test_anthropic_provider_fixes_dsl_with_error_context():
    provider = AnthropicAIProvider(api_key="sk-ant-test")
    provider._client.messages.create = AsyncMock(return_value=_anthropic_message("fixed code"))

    result = await provider.fix_dsl(dsl_code="entity a", error_message="строка 1: ожидался diagram")

    assert result == "fixed code"
    _, kwargs = provider._client.messages.create.call_args
    assert "entity a" in kwargs["messages"][0]["content"]
    assert "ожидался diagram" in kwargs["messages"][0]["content"]


async def test_openai_provider_generates_dsl_from_prompt():
    provider = OpenAIProvider(api_key="sk-test")
    provider._client.chat.completions.create = AsyncMock(
        return_value=_openai_response('diagram uml.class "X" {}')
    )

    result = await provider.generate_dsl_from_text(prompt="сделай UML class", notation="uml.class")

    assert result == 'diagram uml.class "X" {}'
    _, kwargs = provider._client.chat.completions.create.call_args
    assert kwargs["messages"][0]["role"] == "system"
    assert "сделай UML class" in kwargs["messages"][1]["content"]


async def test_openai_provider_fixes_dsl_with_error_context():
    provider = OpenAIProvider(api_key="sk-test")
    provider._client.chat.completions.create = AsyncMock(
        return_value=_openai_response("fixed code")
    )

    result = await provider.fix_dsl(dsl_code="entity a", error_message="missing diagram header")

    assert result == "fixed code"
    _, kwargs = provider._client.chat.completions.create.call_args
    assert "entity a" in kwargs["messages"][1]["content"]
    assert "missing diagram header" in kwargs["messages"][1]["content"]


def test_get_ai_provider_returns_stub_by_default():
    settings = Settings(ai_provider="stub", ai_api_key=None)
    assert isinstance(get_ai_provider(settings), StubAIProvider)


def test_get_ai_provider_returns_stub_when_no_api_key():
    settings = Settings(ai_provider="anthropic", ai_api_key=None)
    assert isinstance(get_ai_provider(settings), StubAIProvider)


def test_get_ai_provider_dispatches_to_anthropic():
    settings = Settings(ai_provider="anthropic", ai_api_key="sk-ant-test")
    assert isinstance(get_ai_provider(settings), AnthropicAIProvider)


def test_get_ai_provider_dispatches_to_openai():
    settings = Settings(ai_provider="openai", ai_api_key="sk-test")
    assert isinstance(get_ai_provider(settings), OpenAIProvider)


def test_get_ai_provider_raises_for_unknown_provider():
    settings = Settings(ai_provider="does-not-exist", ai_api_key="sk-test")
    with pytest.raises(ValueError):
        get_ai_provider(settings)
