"""Внутренняя графовая метамодель диаграммы — единственное представление,
через которое проходят все нотации (см. docs/architecture/00-system-architecture.md, §5).
Ничего в этом модуле не знает про FastAPI, SQLAlchemy или конкретную нотацию.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class Node:
    id: str
    kind: str  # напр. "task", "entity", "place", "class" — трактуется профилем нотации
    label: str
    attributes: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class Edge:
    id: str
    kind: str  # напр. "sequence_flow", "association", "arc"
    source_id: str
    target_id: str
    label: str = ""
    attributes: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class DiagramModel:
    """Результат парсинга DSL-кода: граф + метаданные нотации."""

    notation: str  # напр. "erd.crows_foot.logical", "uml.class"
    title: str
    nodes: tuple[Node, ...]
    edges: tuple[Edge, ...]

    def node_by_id(self, node_id: str) -> Node | None:
        return next((n for n in self.nodes if n.id == node_id), None)
