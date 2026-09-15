from app.dsl.parser import parse
from app.notations.erd import ErdCrowsFootLogicalProfile

PROFILE = ErdCrowsFootLogicalProfile()


def test_valid_diagram_has_no_errors():
    model = parse(
        'diagram erd "Заказы" {\n'
        '  entity customer "Клиент" pk=id\n'
        '  entity order "Заказ" pk=id\n'
        "  customer -> order\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert not any(i.severity == "error" for i in issues)


def test_missing_pk_is_warning_not_error():
    model = parse('diagram erd "Заказы" {\n  entity customer "Клиент"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "warning" for i in issues)
    assert not any(i.severity == "error" for i in issues)


def test_wrong_node_kind_is_error():
    model = parse('diagram erd "Заказы" {\n  task customer "Клиент"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" for i in issues)


def test_render_produces_svg_per_node():
    model = parse(
        'diagram erd "Заказы" {\n'
        '  entity customer "Клиент" pk=id\n'
        '  entity order "Заказ" pk=id\n'
        "  customer -> order\n"
        "}"
    )
    result = PROFILE.render(model)
    assert result.svg.startswith("<svg")
    assert "Клиент" in result.svg
    assert "Заказ" in result.svg
