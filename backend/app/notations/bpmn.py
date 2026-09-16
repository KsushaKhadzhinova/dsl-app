"""Профиль BPMN, вид «Process» — первый профиль BPMN в реестре (волна 4,
docs/architecture/00-system-architecture.md, §5). Покрывает минимальный работающий
набор элементов: start event, end event, task и sequence flow между ними.
Остальные виды BPMN (collaboration/choreography/conversation) и элементы
(gateway, intermediate event, подпроцессы) — отдельные профили/расширения этого
файла добавляются позже, без изменения этого модуля (Open/Closed Principle)."""

from app.domain.graph import DiagramModel
from app.domain.interfaces import RenderResult, ValidationIssue
from app.notations import register

ALLOWED_NODE_KINDS = {"start_event", "end_event", "task"}
ALLOWED_EDGE_KINDS = {"flow"}

_SHAPE_STYLE = {
    "start_event": {"shape": "circle", "stroke_width": "1.5"},
    "end_event": {"shape": "circle", "stroke_width": "3"},
    "task": {"shape": "rect", "stroke_width": "1.5"},
}


class BpmnProcessProfile:
    key = "bpmn.process"
    display_name = "BPMN — Process"

    def validate(self, model: DiagramModel) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        node_ids = {n.id for n in model.nodes}

        for node in model.nodes:
            if node.kind not in ALLOWED_NODE_KINDS:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=(
                            f'Недопустимый тип узла "{node.kind}" для BPMN — ожидается один из '
                            f"{sorted(ALLOWED_NODE_KINDS)}."
                        ),
                        node_id=node.id,
                    )
                )

        if not any(n.kind == "start_event" for n in model.nodes):
            issues.append(
                ValidationIssue(
                    severity="error",
                    message="Процесс BPMN должен содержать хотя бы один start event.",
                )
            )
        if not any(n.kind == "end_event" for n in model.nodes):
            issues.append(
                ValidationIssue(
                    severity="error",
                    message="Процесс BPMN должен содержать хотя бы один end event.",
                )
            )

        for edge in model.edges:
            if edge.source_id not in node_ids or edge.target_id not in node_ids:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message="Sequence flow ссылается на несуществующий узел.",
                        edge_id=edge.id,
                    )
                )

        connected_ids = {e.source_id for e in model.edges} | {e.target_id for e in model.edges}
        if len(model.nodes) > 1:
            for node in model.nodes:
                if node.id not in connected_ids:
                    issues.append(
                        ValidationIssue(
                            severity="warning",
                            message=f'Узел "{node.label}" не связан ни одним sequence flow.',
                            node_id=node.id,
                        )
                    )

        return issues

    def render(self, model: DiagramModel) -> RenderResult:
        positions: dict[str, tuple[float, float]] = {}
        x, y = 40.0, 60.0
        for node in model.nodes:
            positions[node.id] = (x, y)
            x += 180.0

        svg_parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{max(x, 200)}" height="200">']
        for node in model.nodes:
            nx, ny = positions[node.id]
            style = _SHAPE_STYLE.get(node.kind, {"shape": "rect", "stroke_width": "1.5"})
            if style["shape"] == "circle":
                svg_parts.append(
                    f'<g><circle cx="{nx + 25}" cy="{ny}" r="25" fill="none" '
                    f'stroke="#8a8a8d" stroke-width="{style["stroke_width"]}"/>'
                    f'<text x="{nx}" y="{ny + 40}" font-family="Inter" font-size="12">'
                    f"{node.label}</text></g>"
                )
            else:
                svg_parts.append(
                    f'<g><rect x="{nx}" y="{ny - 25}" width="140" height="50" rx="8" '
                    f'fill="none" stroke="#8a8a8d" stroke-width="{style["stroke_width"]}"/>'
                    f'<text x="{nx + 10}" y="{ny + 5}" font-family="Inter" font-weight="600">'
                    f"{node.label}</text></g>"
                )
        for edge in model.edges:
            sx, sy = positions.get(edge.source_id, (0, 0))
            tx, ty = positions.get(edge.target_id, (0, 0))
            svg_parts.append(
                f'<line x1="{sx + 50}" y1="{sy}" x2="{tx}" y2="{ty}" '
                f'stroke="#5b8def" stroke-width="1.5" marker-end="url(#arrow)"/>'
            )
        svg_parts.append("</svg>")

        return RenderResult(svg="".join(svg_parts), node_positions=positions)


register(BpmnProcessProfile())
