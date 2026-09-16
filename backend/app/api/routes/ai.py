"""Эндпоинт AI-ассистента, режим «Написать код» (FR-AI-03), защищённый дневной
квотой на пользователя (FR-AI-12 / NFR-SEC-07, решено см.
docs/requirements/00-overview.md §5, п. 5)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, get_ai_provider_dep, get_ai_quota_limiter
from app.core.rate_limit import AiQuotaExceeded, AiQuotaLimiter
from app.domain.interfaces import AIProvider
from app.schemas.ai import GenerateDslRequest, GenerateDslResponse

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/generate", response_model=GenerateDslResponse)
async def generate_dsl(
    body: GenerateDslRequest,
    user: CurrentUser,
    provider: Annotated[AIProvider, Depends(get_ai_provider_dep)],
    limiter: Annotated[AiQuotaLimiter, Depends(get_ai_quota_limiter)],
) -> GenerateDslResponse:
    try:
        limiter.check_and_increment(str(user.id))
    except AiQuotaExceeded as exc:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, str(exc)) from exc

    dsl_code = await provider.generate_dsl_from_text(prompt=body.prompt, notation=body.notation)
    return GenerateDslResponse(dsl_code=dsl_code)
