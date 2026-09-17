"""Профиль UML **class diagram** — волна 1 (docs/architecture/00-system-architecture.md, §5),
закрывает FR-NOT-06. Узел `class` несёт атрибуты и методы через уже существующий
DSL-механизм `attr=value` (`node_decl` в grammar.lark) — без расширения грамматики:
поле класса кодируется парой `attr_<имя>=<тип>`, метод — парой `method_<имя>=<тип возврата>`,
по аналогии с тем, как `erd.py` кодирует `pk=<колонка>` через тот же механизм.

Тип связи (association / inheritance / realization) не требует нового поля `Edge.kind`
(парсер всегда даёт `kind="flow"`, см. `app/dsl/parser.py`) — он читается из уже
существующей условной подписи ребра `-["extends"]->` / `-["implements"]->`
(`COND_ARROW` в grammar.lark), ровно как просили: переиспользовать механизм подписи,
а не трогать `dsl/`. Пустая подпись — обычная ассоциация."""

from app.domain.graph import DiagramModel, Node
from app.domain.interfaces import RenderResult, ValidationIssue
from app.notations import register

ALLOWED_NODE_KINDS = {"class"}
ALLOWED_EDGE_KINDS = {"flow"}

ATTR_PREFIX = "attr_"
METHOD_PREFIX = "method_"

INHERITANCE_LABEL = "extends"
REALIZATION_LABEL = "implements"

_HEADER_HEIGHT = 34.0
_LINE_HEIGHT = 18.0
_COMPARTMENT_PADDING = 10.0
_BOX_WIDTH = 220.0
_BOX_GAP = 60.0


def _fields(node: Node) -> list[tuple[str, str]]:
    return [
        (key[len(ATTR_PREFIX) :], value)
        for key, value in node.attributes.items()
        if key.startswith(ATTR_PREFIX)
    ]


def _methods(node: Node) -> list[tuple[str, str]]:
    return [
        (key[len(METHOD_PREFIX) :], value)
        for key, value in node.attributes.items()
        if key.startswith(METHOD_PREFIX)
    ]


def _relationship_kind(label: str) -> str:
    if label == INHERITANCE_LABEL:
        return "inheritance"
    if label == REALIZATION_LABEL:
        return "realization"
    return "association"


def _box_height(node: Node) -> float:
    fields = _fields(node)
    methods = _methods(node)
    return (
        _HEADER_HEIGHT
        + _COMPARTMENT_PADDING + max(len(fields), 1) * _LINE_HEIGHT
        + _COMPARTMENT_PADDING + max(len(methods), 1) * _LINE_HEIGHT
    )


class UmlClassProfile:
    key = "uml.class"
    display_name = "UML — Class diagram"

    def validate(self, model: DiagramModel) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        node_ids = {n.id for n in model.nodes}

        for node in model.nodes:
            if node.kind not in ALLOWED_NODE_KINDS:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=(
                            f'Недопустимый тип узла "{node.kind}" для UML class diagram — '
                            f'ожидается "class".'
                        ),
                        node_id=node.id,
                    )
                )
                continue
            if not _fields(node) and not _methods(node):
                issues.append(
                    ValidationIssue(
                        severity="warning",
                        message=(
                            f'Класс "{node.label}" не имеет ни одного атрибута (attr_...=...), '
                            f"ни одного метода (method_...=...)."
                        ),
                        node_id=node.id,
                    )
                )

        for edge in model.edges:
            if edge.kind not in ALLOWED_EDGE_KINDS:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=f'Недопустимый тип связи "{edge.kind}" для UML class diagram.',
                        edge_id=edge.id,
                    )
                )
            if edge.source_id not in node_ids or edge.target_id not in node_ids:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message="Связь ссылается на несуществующий класс.",
                        edge_id=edge.id,
                    )
                )

        return issues

    def render(self, model: DiagramModel) -> RenderResult:
        positions: dict[str, tuple[float, float]] = {}
        heights: dict[str, float] = {}
        x, y = 40.0, 40.0
        for node in model.nodes:
            positions[node.id] = (x, y)
            heights[node.id] = _box_height(node)
            x += _BOX_WIDTH + _BOX_GAP

        canvas_height = max((heights.get(n.id, 0.0) for n in model.nodes), default=120.0) + 80.0
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{max(x, 240.0)}" '
            f'height="{canvas_height}">'
        ]

        for node in model.nodes:
            nx, ny = positions[node.id]
            box_height = heights[node.id]
            fields = _fields(node) or [("", "")]
            methods = _methods(node) or [("", "")]
            has_fields = bool(_fields(node))
            has_methods = bool(_methods(node))

            svg_parts.append(
                f'<g><rect x="{nx}" y="{ny}" width="{_BOX_WIDTH}" height="{box_height}" '
                f'fill="none" stroke="#8a8a8d" stroke-width="1.5"/>'
                f'<text x="{nx + _BOX_WIDTH / 2}" y="{ny + _HEADER_HEIGHT / 2 + 5}" '
                f'text-anchor="middle" font-family="Inter" font-weight="700">'
                f"{node.label}</text>"
                f'<line x1="{nx}" y1="{ny + _HEADER_HEIGHT}" x2="{nx + _BOX_WIDTH}" '
                f'y2="{ny + _HEADER_HEIGHT}" stroke="#8a8a8d"/>'
            )

            field_top = ny + _HEADER_HEIGHT + _COMPARTMENT_PADDING
            for i, (name, ftype) in enumerate(fields):
                text = f"{name}: {ftype}" if has_fields else ""
                svg_parts.append(
                    f'<text x="{nx + 10}" y="{field_top + i * _LINE_HEIGHT + 12}" '
                    f'font-family="Source Code Pro" font-size="12">{text}</text>'
                )

            methods_compartment_y = field_top + max(len(fields), 1) * _LINE_HEIGHT + _COMPARTMENT_PADDING
            svg_parts.append(
                f'<line x1="{nx}" y1="{methods_compartment_y - _COMPARTMENT_PADDING / 2}" '
                f'x2="{nx + _BOX_WIDTH}" y2="{methods_compartment_y - _COMPARTMENT_PADDING / 2}" '
                f'stroke="#8a8a8d"/>'
            )
            for i, (name, rtype) in enumerate(methods):
                text = f"{name}(): {rtype}" if has_methods else ""
                svg_parts.append(
                    f'<text x="{nx + 10}" y="{methods_compartment_y + i * _LINE_HEIGHT + 12}" '
                    f'font-family="Source Code Pro" font-size="12">{text}</text>'
                )
            svg_parts.append("</g>")

        for edge in model.edges:
            sx, sy = positions.get(edge.source_id, (0.0, 0.0))
            tx, ty = positions.get(edge.target_id, (0.0, 0.0))
            s_height = heights.get(edge.source_id, 120.0)
            t_height = heights.get(edge.target_id, 120.0)
            y1 = sy + s_height / 2
            y2 = ty + t_height / 2
            x1 = sx + _BOX_WIDTH if sx <= tx else sx
            x2 = tx if sx <= tx else tx + _BOX_WIDTH

            kind = _relationship_kind(edge.label)
            dash = ' stroke-dasharray="6,4"' if kind == "realization" else ""
            svg_parts.append(
                f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                f'stroke="#5b8def" stroke-width="1.5"{dash}/>'
            )
            if kind in ("inheritance", "realization"):
                import math

                angle = math.atan2(y2 - y1, x2 - x1)
                size = 14.0
                spread = math.radians(20)
                p1 = (x2, y2)
                p2 = (
                    x2 - size * math.cos(angle - spread),
                    y2 - size * math.sin(angle - spread),
                )
                p3 = (
                    x2 - size * math.cos(angle + spread),
                    y2 - size * math.sin(angle + spread),
                )
                svg_parts.append(
                    f'<polygon points="{p1[0]},{p1[1]} {p2[0]},{p2[1]} {p3[0]},{p3[1]}" '
                    f'fill="white" stroke="#5b8def" stroke-width="1.5"/>'
                )

        svg_parts.append("</svg>")
        return RenderResult(svg="".join(svg_parts), node_positions=positions)


register(UmlClassProfile())
