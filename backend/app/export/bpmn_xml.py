"""Экспорт в BPMN 2.0 XML (FR-STORE-06) — только для нотаций bpmn.*, из уже
распарсенной DiagramModel (не из текста DSL). Покрывает элементы профиля
`bpmn.process` (app/notations/bpmn.py): start/end event, task, sequence flow."""

import xml.etree.ElementTree as ET

from app.domain.graph import DiagramModel

_BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL"
_NODE_TAG = {
    "start_event": "startEvent",
    "end_event": "endEvent",
    "task": "task",
}

ET.register_namespace("bpmn", _BPMN_NS)


def to_bpmn_xml(model: DiagramModel) -> str:
    definitions = ET.Element(
        f"{{{_BPMN_NS}}}definitions",
        {
            "id": "Definitions_1",
            "targetNamespace": "http://diagramcode.dev/bpmn",
        },
    )
    process = ET.SubElement(
        definitions,
        f"{{{_BPMN_NS}}}process",
        {"id": "Process_1", "name": model.title, "isExecutable": "false"},
    )

    for node in model.nodes:
        tag = _NODE_TAG.get(node.kind, "task")
        ET.SubElement(process, f"{{{_BPMN_NS}}}{tag}", {"id": node.id, "name": node.label})

    for edge in model.edges:
        attributes = {
            "id": f"Flow_{edge.id}",
            "sourceRef": edge.source_id,
            "targetRef": edge.target_id,
        }
        if edge.label:
            attributes["name"] = edge.label
        ET.SubElement(process, f"{{{_BPMN_NS}}}sequenceFlow", attributes)

    ET.indent(definitions, space="  ")
    xml_body = ET.tostring(definitions, encoding="unicode")
    return f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_body}\n'
