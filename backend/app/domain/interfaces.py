"""Порты (в терминах Clean Architecture) — интерфейсы, которые реализуют
конкретные адаптеры в app/notations и app/integrations. Слой services/
зависит только от этих Protocol, никогда от конкретных реализаций напрямую
(Dependency Inversion Principle) — конкретную реализацию подставляет DI в app/core.
"""

from dataclasses import dataclass
from typing import Protocol

from app.domain.graph import DiagramModel


@dataclass(frozen=True, slots=True)
class ValidationIssue:
    severity: str  # "error" | "warning"
    message: str
    node_id: str | None = None
    edge_id: str | None = None


@dataclass(frozen=True, slots=True)
class RenderResult:
    svg: str
    node_positions: dict[str, tuple[float, float]]


class NotationProfile(Protocol):
    """Один плагин нотации = одна реализация этого протокола.
    Регистрируется в app.notations.registry."""

    key: str
    display_name: str

    def validate(self, model: DiagramModel) -> list[ValidationIssue]: ...
    def render(self, model: DiagramModel) -> RenderResult: ...


class StorageProvider(Protocol):
    """Strategy для внешнего хранения (GitHub, Google Drive, локальный файл)."""

    key: str

    async def save(self, *, path: str, content: str, token: str | None) -> str:
        """Возвращает ссылку/идентификатор сохранённого объекта."""
        ...


class AIProvider(Protocol):
    """Единый контракт для любого LLM/VLM-провайдера — см.
    docs/architecture/01-ai-provider-setup.md."""

    key: str

    async def generate_dsl_from_text(self, *, prompt: str, notation: str) -> str: ...
    async def fix_dsl(self, *, dsl_code: str, error_message: str) -> str: ...
