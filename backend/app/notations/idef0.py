"""Профиль IDEF0 (контекст + декомпозиция, единый профиль на обе разновидности
диаграммы) — волна 1, закрывает FR-NOT-06. Функциональный блок — узел `activity`;
внешний терминатор ICOM-связи (источник/приёмник данных, ресурса, правила вне
самого блока) — узел `terminal`. Обе разновидности узлов используют один и тот же
граф `DiagramModel`, поэтому контекстная диаграмма (A-0) и любая декомпозиция —
это один и тот же профиль, различающийся только количеством блоков; связь с
родительской диаграммой (`Diagram.parent_diagram_id`/`decomposed_node_id`,
см. `app/models/diagram.py`) — забота слоя `services/`, не этого чистого профиля.

Тип ICOM-связи (Input/Control/Output/Mechanism) не требует нового поля `Edge.kind`
(парсер всегда даёт `kind="flow"`) — как и для UML, он читается из уже существующей
условной подписи ребра `-["input"]->` / `-["control"]->` / `-["output"]->` /
`-["mechanism"]->` (`COND_ARROW` в grammar.lark), без изменений в `dsl/`.

ICOM-полнота (FR-NOT-11) реализована как реальная, но заведомо упрощённая
локальная проверка: полная сверка с ICOM-связями родительской диаграммы не
подключена (это отдельная задача уровня `services/`, требующая доступа к БД,
а профиль нотации обязан оставаться тестируемым без БД и сети — NFR-REL-04);
здесь проверяется (а) что у блока вообще есть хоть одна ICOM-связь любого типа,
и (б) методологическое требование IDEF0 (FIPS PUB 183) о том, что у каждого
блока должна быть хотя бы одна входящая связь Control."""

from app.domain.graph import DiagramModel, Edge, Node
from app.domain.interfaces import RenderResult, ValidationIssue
from app.notations import register

ALLOWED_NODE_KINDS = {"activity", "terminal"}
ALLOWED_EDGE_KINDS = {"flow"}
ICOM_TYPES = {"input", "control", "output", "mechanism"}

_BOX_WIDTH = 160.0
_BOX_HEIGHT = 90.0
_BOX_GAP = 220.0
_TERMINAL_OFFSET = 90.0
_BASELINE_Y = 220.0


def _icom_type(edge: Edge) -> str | None:
    label = edge.label.strip().lower()
    return label if label in ICOM_TYPES else None


class Idef0ContextDecompositionProfile:
    key = "idef0.context_decomposition"
    display_name = "IDEF0 — контекст и декомпозиция"

    def validate(self, model: DiagramModel) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        node_ids = {n.id for n in model.nodes}
        activities = [n for n in model.nodes if n.kind == "activity"]

        for node in model.nodes:
            if node.kind not in ALLOWED_NODE_KINDS:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=(
                            f'Недопустимый тип узла "{node.kind}" для IDEF0 — ожидается '
                            f'один из {sorted(ALLOWED_NODE_KINDS)}.'
                        ),
                        node_id=node.id,
                    )
                )

        if not activities:
            issues.append(
                ValidationIssue(
                    severity="error",
                    message="Диаграмма IDEF0 должна содержать хотя бы один функциональный блок (activity).",
                )
            )

        for edge in model.edges:
            if edge.kind not in ALLOWED_EDGE_KINDS:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=f'Недопустимый тип связи "{edge.kind}" для IDEF0.',
                        edge_id=edge.id,
                    )
                )
            if edge.source_id not in node_ids or edge.target_id not in node_ids:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message="ICOM-связь ссылается на несуществующий блок.",
                        edge_id=edge.id,
                    )
                )
                continue
            if _icom_type(edge) is None:
                issues.append(
                    ValidationIssue(
                        severity="error",
                        message=(
                            f'Не удалось определить тип ICOM-связи (label="{edge.label}") — '
                            f'ожидается одна из подписей {sorted(ICOM_TYPES)}, '
                            f'например -["control"]->.'
                        ),
                        edge_id=edge.id,
                    )
                )

        incoming_by_type: dict[str, dict[str, list[Edge]]] = {t: {} for t in ICOM_TYPES}
        connected: set[str] = set()
        for edge in model.edges:
            icom = _icom_type(edge)
            if icom is None:
                continue
            connected.add(edge.source_id)
            connected.add(edge.target_id)
            incoming_by_type[icom].setdefault(edge.target_id, []).append(edge)

        for activity in activities:
            if activity.id not in connected:
                issues.append(
                    ValidationIssue(
                        severity="warning",
                        message=(
                            f'Блок "{activity.label}" не имеет ни одной ICOM-связи '
                            f"(input/control/output/mechanism)."
                        ),
                        node_id=activity.id,
                    )
                )
                continue
            if activity.id not in incoming_by_type["control"]:
                issues.append(
                    ValidationIssue(
                        severity="warning",
                        message=(
                            f'Блок "{activity.label}" не имеет входящей связи Control — '
                            f"по методологии IDEF0 (FIPS PUB 183) у каждого блока должна быть "
                            f"хотя бы одна связь управления."
                        ),
                        node_id=activity.id,
                    )
                )

        return issues

    def render(self, model: DiagramModel) -> RenderResult:
        positions: dict[str, tuple[float, float]] = {}
        x = 120.0
        for node in model.nodes:
            if node.kind == "activity":
                positions[node.id] = (x, _BASELINE_Y)
                x += _BOX_WIDTH + _BOX_GAP

        terminal_slot = 0
        for edge in model.edges:
            icom = _icom_type(edge)
            if icom is None:
                continue
            for node_id, is_source in ((edge.source_id, True), (edge.target_id, False)):
                node = model.node_by_id(node_id)
                if node is None or node.kind != "terminal" or node_id in positions:
                    continue
                anchor_id = edge.target_id if is_source else edge.source_id
                ax, ay = positions.get(anchor_id, (120.0 + terminal_slot * _BOX_GAP, _BASELINE_Y))
                if icom == "input":
                    positions[node_id] = (ax - _TERMINAL_OFFSET, ay + _BOX_HEIGHT / 2)
                elif icom == "control":
                    positions[node_id] = (ax + _BOX_WIDTH / 2, ay - _TERMINAL_OFFSET)
                elif icom == "mechanism":
                    positions[node_id] = (ax + _BOX_WIDTH / 2, ay + _BOX_HEIGHT + _TERMINAL_OFFSET)
                else:
                    positions[node_id] = (ax + _BOX_WIDTH + _TERMINAL_OFFSET, ay + _BOX_HEIGHT / 2)

        for node in model.nodes:
            if node.id not in positions:
                positions[node.id] = (120.0 + terminal_slot * 140.0, _BASELINE_Y + _BOX_HEIGHT + 160.0)
                terminal_slot += 1

        max_x = max((p[0] for p in positions.values()), default=200.0) + 160.0
        max_y = max((p[1] for p in positions.values()), default=200.0) + 100.0
        svg_parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{max_x}" height="{max_y}">']

        for node in model.nodes:
            nx, ny = positions[node.id]
            if node.kind == "activity":
                box_no = node.attributes.get("no", "")
                svg_parts.append(
                    f'<g><rect x="{nx}" y="{ny}" width="{_BOX_WIDTH}" height="{_BOX_HEIGHT}" '
                    f'fill="none" stroke="#8a8a8d" stroke-width="2"/>'
                    f'<text x="{nx + _BOX_WIDTH / 2}" y="{ny + _BOX_HEIGHT / 2 + 5}" '
                    f'text-anchor="middle" font-family="Inter" font-weight="600">'
                    f"{node.label}</text>"
                )
                if box_no:
                    svg_parts.append(
                        f'<text x="{nx + _BOX_WIDTH - 6}" y="{ny + _BOX_HEIGHT - 6}" '
                        f'text-anchor="end" font-family="Source Code Pro" font-size="11">'
                        f"{box_no}</text>"
                    )
                svg_parts.append("</g>")
            else:
                svg_parts.append(
                    f'<text x="{nx}" y="{ny}" text-anchor="middle" '
                    f'font-family="Inter" font-size="11">{node.label}</text>'
                )

        for edge in model.edges:
            icom = _icom_type(edge)
            if icom is None:
                continue
            source = model.node_by_id(edge.source_id)
            target = model.node_by_id(edge.target_id)
            x1, y1 = self._exit_point(source, positions[edge.source_id])
            x2, y2 = self._entry_point(target, positions[edge.target_id], icom)
            svg_parts.append(
                f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                f'stroke="#5b8def" stroke-width="1.5"/>'
                f'<polygon points="{x2 - 6},{y2 - 4} {x2},{y2} {x2 - 6},{y2 + 4}" '
                f'fill="#5b8def"/>'
            )

        svg_parts.append("</svg>")
        return RenderResult(svg="".join(svg_parts), node_positions=positions)

    @staticmethod
    def _exit_point(node: Node | None, position: tuple[float, float]) -> tuple[float, float]:
        nx, ny = position
        if node is not None and node.kind == "activity":
            return (nx + _BOX_WIDTH, ny + _BOX_HEIGHT / 2)
        return (nx, ny)

    @staticmethod
    def _entry_point(
        node: Node | None, position: tuple[float, float], icom: str
    ) -> tuple[float, float]:
        nx, ny = position
        if node is None or node.kind != "activity":
            return (nx, ny)
        if icom == "control":
            return (nx + _BOX_WIDTH / 2, ny)
        if icom == "mechanism":
            return (nx + _BOX_WIDTH / 2, ny + _BOX_HEIGHT)
        return (nx, ny + _BOX_HEIGHT / 2)


register(Idef0ContextDecompositionProfile())
