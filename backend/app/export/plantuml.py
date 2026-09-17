"""Мэппинг DiagramModel -> PlantUML (FR-STORE-06). ERD использует нативный
entity-relation синтаксис PlantUML; BPMN аппроксимируется activity-диаграммой,
так как у PlantUML нет собственной BPMN-нотации — см. docs/architecture/06-export-formats.md."""

from app.domain.graph import DiagramModel, Node
from app.export.errors import UnsupportedExportError


def to_plantuml(model: DiagramModel) -> str:
    if model.notation.startswith("erd"):
        return _erd_to_plantuml(model)
    if model.notation.startswith("bpmn"):
        return _bpmn_to_plantuml(model)
    raise UnsupportedExportError(f'Экспорт в PlantUML не поддерживается для нотации "{model.notation}".')


def _erd_to_plantuml(model: DiagramModel) -> str:
    lines = ["@startuml"]
    for node in model.nodes:
        lines.append(f'entity "{node.label}" as {node.id} {{')
        for key, value in node.attributes.items():
            marker = "*" if key == "pk" else " "
            lines.append(f"  {marker} {value} : {key}")
        lines.append("}")
    for edge in model.edges:
        lines.append(f"{edge.source_id} ||--o{{ {edge.target_id}")
    lines.append("@enduml")
    return "\n".join(lines) + "\n"


def _bpmn_to_plantuml(model: DiagramModel) -> str:
    lines = ["@startuml"]
    for node in _walk_order(model):
        if node.kind == "start_event":
            lines.append("start")
        elif node.kind == "end_event":
            lines.append("stop")
        else:
            lines.append(f":{node.label};")
    lines.append("@enduml")
    return "\n".join(lines) + "\n"


def _walk_order(model: DiagramModel) -> list[Node]:
    by_id = {n.id: n for n in model.nodes}
    next_of = {e.source_id: e.target_id for e in model.edges}
    start_nodes = [n for n in model.nodes if n.kind == "start_event"]

    visited: set[str] = set()
    ordered: list[Node] = []
    for start in start_nodes:
        current: str | None = start.id
        while current is not None and current not in visited:
            visited.add(current)
            node = by_id.get(current)
            if node is not None:
                ordered.append(node)
            current = next_of.get(current)

    for node in model.nodes:
        if node.id not in visited:
            ordered.append(node)

    return ordered
