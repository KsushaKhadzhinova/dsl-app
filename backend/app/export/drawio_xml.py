"""Экспорт в draw.io (mxGraphModel), FR-STORE-06 — работает для любой нотации,
т.к. использует только универсальную графовую модель Node/Edge, без учёта
нотационно-специфичных деталей рендера."""

import xml.etree.ElementTree as ET

from app.domain.graph import DiagramModel

_NODE_WIDTH = 160.0
_NODE_HEIGHT = 60.0
_NODE_GAP = 220.0
_START_X = 40.0
_START_Y = 40.0


def to_drawio_xml(model: DiagramModel) -> str:
    graph_model = ET.Element("mxGraphModel")
    root = ET.SubElement(graph_model, "root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})

    cell_id_by_node = {node.id: f"node-{node.id}" for node in model.nodes}

    x = _START_X
    for node in model.nodes:
        cell = ET.SubElement(
            root,
            "mxCell",
            {
                "id": cell_id_by_node[node.id],
                "value": node.label,
                "style": "rounded=0;whiteSpace=wrap;html=1;",
                "vertex": "1",
                "parent": "1",
            },
        )
        ET.SubElement(
            cell,
            "mxGeometry",
            {
                "x": str(x),
                "y": str(_START_Y),
                "width": str(_NODE_WIDTH),
                "height": str(_NODE_HEIGHT),
                "as": "geometry",
            },
        )
        x += _NODE_GAP

    for index, edge in enumerate(model.edges):
        cell = ET.SubElement(
            root,
            "mxCell",
            {
                "id": f"edge-{edge.id}-{index}",
                "value": edge.label,
                "style": "edgeStyle=orthogonalEdgeStyle;html=1;",
                "edge": "1",
                "parent": "1",
                "source": cell_id_by_node.get(edge.source_id, ""),
                "target": cell_id_by_node.get(edge.target_id, ""),
            },
        )
        ET.SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})

    ET.indent(graph_model, space="  ")
    xml_body = ET.tostring(graph_model, encoding="unicode")
    return f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_body}\n'
