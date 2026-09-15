import pytest

from app.dsl.errors import DslSyntaxError
from app.dsl.parser import parse

VALID_ERD = """
diagram erd "Заказы" {
  entity customer "Клиент" pk=id
  entity order "Заказ" pk=id
  customer -> order
}
"""


def test_parses_notation_and_title():
    model = parse(VALID_ERD)
    assert model.notation == "erd"
    assert model.title == "Заказы"


def test_parses_nodes_with_attributes():
    model = parse(VALID_ERD)
    customer = model.node_by_id("customer")
    assert customer is not None
    assert customer.kind == "entity"
    assert customer.label == "Клиент"
    assert customer.attributes == {"pk": "id"}


def test_parses_edges():
    model = parse(VALID_ERD)
    assert len(model.edges) == 1
    assert model.edges[0].source_id == "customer"
    assert model.edges[0].target_id == "order"


def test_parses_conditional_edge_chain():
    model = parse(
        'diagram bpmn "P" { task t1 "T1"\ngateway g1 "G1"\ntask t2 "T2"\n'
        't1 -> g1 -["да"]-> t2 }'
    )
    labels = [e.label for e in model.edges]
    assert "да" in labels


def test_raises_on_invalid_syntax():
    with pytest.raises(DslSyntaxError):
        parse('diagram erd "Заказы" { entity }')
