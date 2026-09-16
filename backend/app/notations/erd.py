"""Профиль ERD, нотация «Crow's Foot», логический уровень — первая реализация
из волны 1 (docs/architecture/00-system-architecture.md, §5). Уровни concept/physical
и нотации Chen/UML-class — отдельные профили (`erd.crows_foot.concept`, `erd.chen.logical`, ...),
добавляются волной 3 без изменения этого файла."""

from app.domain.graph import DiagramModel
from app.domain.interfaces import RenderResult, ValidationIssue
from app.notations import register

ALLOWED_NODE_KINDS = {"entity"}
ALLOWED_EDGE_KINDS = {"flow"}


class ErdCrowsFootLogicalProfile:
    key = "erd.crows_foot.logical"
    display_name = "ERD — Crow's Foot (логический уровень)"

    def validate(self, model: DiagramModel) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        node_ids = {n.id for n in model.nodes}

        for node in model.nodes:
            if node.kind not in ALLOWED_NODE_KINDS:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=f'Недопустимый тип узла "{node.kind}" для ERD — ожидается "entity".',
                        node_id=node.id,
                    )
                )
            if "pk" not in node.attributes:
                issues.append(
                    ValidationIssue(
                        severity="warning",
                        message=f'Сущность "{node.label}" не имеет первичного ключа (pk=...).',
                        node_id=node.id,
                    )
                )

        for edge in model.edges:
            if edge.source_id not in node_ids or edge.target_id not in node_ids:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message="Связь ссылается на несуществующую сущность.",
                        edge_id=edge.id,
                    )
                )

        return issues

    def render(self, model: DiagramModel) -> RenderResult:
        positions: dict[str, tuple[float, float]] = {}
        x, y = 40.0, 40.0
        for node in model.nodes:
            positions[node.id] = (x, y)
            x += 220.0

        svg_parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{max(x, 200)}" height="200">']
        for node in model.nodes:
            nx, ny = positions[node.id]
            pk = node.attributes.get("pk", "")
            svg_parts.append(
                f'<g><rect x="{nx}" y="{ny}" width="180" height="70" '
                f'fill="none" stroke="#8a8a8d" stroke-width="1.5"/>'
                f'<text x="{nx + 10}" y="{ny + 20}" font-family="Inter" font-weight="600">'
                f"{node.label}</text>"
                f'<line x1="{nx}" y1="{ny + 30}" x2="{nx + 180}" y2="{ny + 30}" stroke="#8a8a8d"/>'
                f'<text x="{nx + 10}" y="{ny + 48}" font-family="Source Code Pro" font-size="12">'
                f"PK {pk}</text></g>"
            )
        for edge in model.edges:
            sx, sy = positions.get(edge.source_id, (0, 0))
            tx, ty = positions.get(edge.target_id, (0, 0))
            svg_parts.append(
                f'<line x1="{sx + 180}" y1="{sy + 35}" x2="{tx}" y2="{ty + 35}" '
                f'stroke="#5b8def" stroke-width="1.5"/>'
            )
        svg_parts.append("</svg>")

        return RenderResult(svg="".join(svg_parts), node_positions=positions)


register(ErdCrowsFootLogicalProfile())
