"""Экспорт диаграммы в нативные форматы (FR-STORE-06) — из уже распарсенной
DiagramModel, а не повторным разбором текста DSL. Выбор синтаксиса на нотацию
и обоснование аппроксимаций описаны в docs/architecture/06-export-formats.md."""

from dataclasses import dataclass

from app.domain.graph import DiagramModel
from app.export.bpmn_xml import to_bpmn_xml
from app.export.drawio_xml import to_drawio_xml
from app.export.errors import UnsupportedExportError
from app.export.mermaid import to_mermaid
from app.export.plantuml import to_plantuml

__all__ = ["ExportResult", "UnsupportedExportError", "SUPPORTED_FORMATS", "export_model"]

SUPPORTED_FORMATS = ("plantuml", "mermaid", "bpmn_xml", "drawio_xml")


@dataclass(frozen=True, slots=True)
class ExportResult:
    content: str
    media_type: str
    file_extension: str


def export_model(model: DiagramModel, fmt: str) -> ExportResult:
    if fmt == "plantuml":
        return ExportResult(to_plantuml(model), "text/plain", "puml")
    if fmt == "mermaid":
        return ExportResult(to_mermaid(model), "text/plain", "mmd")
    if fmt == "drawio_xml":
        return ExportResult(to_drawio_xml(model), "application/xml", "drawio")
    if fmt == "bpmn_xml":
        if not model.notation.startswith("bpmn"):
            raise UnsupportedExportError(
                f'Экспорт в BPMN XML недоступен для нотации "{model.notation}" — ожидается нотация bpmn.*.'
            )
        return ExportResult(to_bpmn_xml(model), "application/xml", "bpmn")

    raise UnsupportedExportError(f'Неизвестный формат экспорта: "{fmt}".')
