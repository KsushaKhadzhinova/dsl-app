import datetime
import uuid
from types import SimpleNamespace
from unittest.mock import patch

import fakeredis
import pytest
from fastapi import HTTPException

from app.api.routes.ai import generate_dsl
from app.core.rate_limit import AiQuotaExceeded, AiQuotaLimiter
from app.integrations.ai.stub_provider import StubAIProvider
from app.schemas.ai import GenerateDslRequest


def _limiter(daily_quota: int) -> AiQuotaLimiter:
    return AiQuotaLimiter(fakeredis.FakeRedis(), daily_quota)


def test_under_quota_succeeds():
    limiter = _limiter(daily_quota=3)
    assert limiter.check_and_increment("user-1") == 1
    assert limiter.check_and_increment("user-1") == 2
    assert limiter.remaining("user-1") == 1


def test_at_quota_boundary_succeeds_then_next_request_is_rejected():
    limiter = _limiter(daily_quota=2)
    limiter.check_and_increment("user-1")
    limiter.check_and_increment("user-1")

    with pytest.raises(AiQuotaExceeded) as exc_info:
        limiter.check_and_increment("user-1")

    assert exc_info.value.limit == 2
    assert exc_info.value.used == 3


def test_quota_is_isolated_per_user():
    limiter = _limiter(daily_quota=1)
    limiter.check_and_increment("user-1")

    assert limiter.check_and_increment("user-2") == 1


def test_quota_resets_on_a_new_day():
    limiter = _limiter(daily_quota=1)
    with patch("app.core.rate_limit.date") as mock_date:
        mock_date.today.return_value = datetime.date(2026, 1, 1)
        limiter.check_and_increment("user-1")

        mock_date.today.return_value = datetime.date(2026, 1, 2)
        assert limiter.check_and_increment("user-1") == 1


async def test_generate_endpoint_succeeds_under_quota():
    limiter = _limiter(daily_quota=1)
    provider = StubAIProvider()
    user = SimpleNamespace(id=uuid.uuid4())

    body = GenerateDslRequest(prompt="сделай ERD", notation="erd.crows_foot.logical")
    response = await generate_dsl(body, user, provider, limiter)

    assert "diagram" in response.dsl_code


async def test_generate_endpoint_returns_429_over_quota():
    limiter = _limiter(daily_quota=1)
    provider = StubAIProvider()
    user = SimpleNamespace(id=uuid.uuid4())
    body = GenerateDslRequest(prompt="сделай ERD", notation="erd.crows_foot.logical")

    await generate_dsl(body, user, provider, limiter)

    with pytest.raises(HTTPException) as exc_info:
        await generate_dsl(body, user, provider, limiter)

    assert exc_info.value.status_code == 429
