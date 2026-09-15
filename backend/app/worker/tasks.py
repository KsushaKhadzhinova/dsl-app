"""Задачи, выполняемые в отдельном воркер-пуле (RQ), а не в процессе API —
см. docs/architecture/00-system-architecture.md, §3, п.1–2. Каждая функция здесь
запускается через `rq worker` (см. docker-compose.yml, сервис `worker`)."""

from app.core.database import get_session_factory
from app.integrations.ai import get_ai_provider
from app.core.config import get_settings
from app.notations import load_all as load_all_notations
from app.repositories.diagram_repository import DiagramRepository
from app.services.diagram_service import DiagramService

load_all_notations()


def render_diagram_job(diagram_id: str, dsl_content: str) -> dict:
    """Асинхронный рендер: снимает нагрузку с HTTP-потока API для больших диаграмм."""
    db = get_session_factory()()
    try:
        service = DiagramService(DiagramRepository(db))
        result, issues = service.render(dsl_content=dsl_content)
        return {
            "diagram_id": diagram_id,
            "svg": result.svg if result else None,
            "issues": [vars(i) for i in issues],
        }
    finally:
        db.close()


async def generate_dsl_job(prompt: str, notation: str, mode: str = "write") -> str:
    """Асинхронный вызов AI-провайдера — изолирован от API-процесса, чтобы
    сетевые задержки/таймауты внешнего LLM не блокировали остальных пользователей."""
    settings = get_settings()
    provider = get_ai_provider(settings)
    if mode == "write":
        return await provider.generate_dsl_from_text(prompt=prompt, notation=notation)
    raise ValueError(f"Неизвестный режим AI: {mode}")
