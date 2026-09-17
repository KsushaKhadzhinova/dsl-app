import pytest

from app.dsl.parser import parse
from app.export import UnsupportedExportError, export_model

ERD_DSL = (
    'diagram erd.crows_foot.logical "Заказы" {\n'
    '  entity customer "Клиент" pk=id\n'
    '  entity order "Заказ" pk=id\n'
    "  customer -> order\n"
    "}"
)

BPMN_DSL = (
    'diagram bpmn.process "Обработка заявки" {\n'
    '  start_event s1 "Заявка подана"\n'
    '  task t1 "Проверить заявку"\n'
    '  end_event e1 "Заявка обработана"\n'
    "  s1 -> t1 -> e1\n"
    "}"
)


def test_erd_mermaid_export_contains_erdiagram_and_entities():
    model = parse(ERD_DSL)

    result = export_model(model, "mermaid")

    assert result.media_type == "text/plain"
    assert result.file_extension == "mmd"
    assert result.content.startswith("erDiagram")
    assert "CUSTOMER" in result.content
    assert "ORDER" in result.content
    assert "Клиент" in result.content
    assert "PK" in result.content


def test_bpmn_mermaid_export_contains_flowchart_and_nodes():
    model = parse(BPMN_DSL)

    result = export_model(model, "mermaid")

    assert result.content.startswith("flowchart TD")
    assert "Заявка подана" in result.content
    assert "Проверить заявку" in result.content
    assert "s1 --> t1" in result.content


def test_erd_plantuml_export_contains_entity_blocks():
    model = parse(ERD_DSL)

    result = export_model(model, "plantuml")

    assert result.media_type == "text/plain"
    assert result.file_extension == "puml"
    assert result.content.startswith("@startuml")
    assert result.content.rstrip().endswith("@enduml")
    assert 'entity "Клиент" as customer' in result.content
    assert 'entity "Заказ" as order' in result.content


def test_bpmn_plantuml_export_contains_activity_markers():
    model = parse(BPMN_DSL)

    result = export_model(model, "plantuml")

    assert result.content.startswith("@startuml")
    assert "start" in result.content
    assert "stop" in result.content
    assert ":Проверить заявку;" in result.content


def test_bpmn_xml_export_contains_schema_elements():
    model = parse(BPMN_DSL)

    result = export_model(model, "bpmn_xml")

    assert result.media_type == "application/xml"
    assert result.file_extension == "bpmn"
    assert "<bpmn:definitions" in result.content
    assert "<bpmn:process" in result.content
    assert '<bpmn:startEvent id="s1" name="Заявка подана"' in result.content
    assert '<bpmn:task id="t1" name="Проверить заявку"' in result.content
    assert '<bpmn:endEvent id="e1" name="Заявка обработана"' in result.content
    assert result.content.count("<bpmn:sequenceFlow") == 2


def test_bpmn_xml_export_rejected_for_non_bpmn_notation():
    model = parse(ERD_DSL)

    with pytest.raises(UnsupportedExportError, match="bpmn"):
        export_model(model, "bpmn_xml")


def test_drawio_export_contains_mxcell_per_node_and_edge():
    model = parse(ERD_DSL)

    result = export_model(model, "drawio_xml")

    assert result.media_type == "application/xml"
    assert result.file_extension == "drawio"
    assert "<mxGraphModel" in result.content
    assert result.content.count("<mxCell") == 2 + len(model.nodes) + len(model.edges)
    assert 'value="Клиент"' in result.content
    assert 'value="Заказ"' in result.content


def test_drawio_export_works_for_bpmn_notation_too():
    model = parse(BPMN_DSL)

    result = export_model(model, "drawio_xml")

    assert result.content.count("<mxCell") == 2 + len(model.nodes) + len(model.edges)


def test_unknown_format_raises_unsupported_export_error():
    model = parse(ERD_DSL)

    with pytest.raises(UnsupportedExportError):
        export_model(model, "docx")
