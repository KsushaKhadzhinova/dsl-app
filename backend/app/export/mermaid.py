"""Мэппинг DiagramModel -> Mermaid (FR-STORE-06). Выбор синтаксиса на нотацию
и обоснование аппроксимации BPMN через flowchart — docs/architecture/06-export-formats.md."""

from app.domain.graph import DiagramModel
from app.export.errors import UnsupportedExportError

_ERD_ATTRIBUTE_MODIFIER = {"pk": "PK", "fk": "FK", "uk": "UK"}


def to_mermaid(model: DiagramModel) -> str:
    if model.notation.startswith("erd"):
        return _erd_to_mermaid(model)
    if model.notation.startswith("bpmn"):
        return _bpmn_to_mermaid(model)
    raise UnsupportedExportError(f'Экспорт в Mermaid не поддерживается для нотации "{model.notation}".')


def _erd_to_mermaid(model: DiagramModel) -> str:
    lines = ["erDiagram"]
    for node in model.nodes:
        entity_id = node.id.upper()
        lines.append(f'    {entity_id}["{node.label}"] {{')
        if node.attributes:
            for key, value in node.attributes.items():
                modifier = _ERD_ATTRIBUTE_MODIFIER.get(key)
                if modifier:
                    lines.append(f"        string {value} {modifier}")
                else:
                    lines.append(f'        string {key} "{value}"')
        lines.append("    }")
    for edge in model.edges:
        source = edge.source_id.upper()
        target = edge.target_id.upper()
        label = edge.label or "relates to"
        lines.append(f'    {source} ||--o{{ {target} : "{label}"')
    return "\n".join(lines) + "\n"


def _bpmn_to_mermaid(model: DiagramModel) -> str:
    lines = ["flowchart TD"]
    for node in model.nodes:
        if node.kind == "start_event":
            lines.append(f'    {node.id}(("{node.label}"))')
        elif node.kind == "end_event":
            lines.append(f'    {node.id}((("{node.label}")))')
        else:
            lines.append(f'    {node.id}["{node.label}"]')
    for edge in model.edges:
        if edge.label:
            lines.append(f'    {edge.source_id} -- "{edge.label}" --> {edge.target_id}')
        else:
            lines.append(f"    {edge.source_id} --> {edge.target_id}")
    return "\n".join(lines) + "\n"
