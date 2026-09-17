from app.dsl.parser import parse
from app.notations.uml_class import UmlClassProfile

PROFILE = UmlClassProfile()

VALID = (
    'diagram uml.class "Модель домена" {\n'
    '  class person "Person" attr_name=String attr_age=int method_greet=void\n'
    '  class student "Student" attr_group=String method_study=void\n'
    '  student -["extends"]-> person\n'
    "}"
)


def test_valid_diagram_has_no_errors():
    model = parse(VALID)
    issues = PROFILE.validate(model)
    assert not any(i.severity == "error" for i in issues)


def test_class_without_attributes_or_methods_is_warning_not_error():
    model = parse('diagram uml.class "Модель" {\n  class empty "Empty"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "warning" for i in issues)
    assert not any(i.severity == "error" for i in issues)


def test_wrong_node_kind_is_error():
    model = parse('diagram uml.class "Модель" {\n  entity x "Не класс"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "Недопустимый тип узла" in i.message for i in issues)


def test_edge_to_nonexistent_class_is_error():
    model = parse(
        'diagram uml.class "Модель" {\n'
        '  class person "Person"\n'
        "  person -> ghost\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "несуществующий класс" in i.message for i in issues)


def test_render_produces_class_box_with_compartments():
    model = parse(VALID)
    result = PROFILE.render(model)
    assert result.svg.startswith("<svg")
    assert "Person" in result.svg
    assert "name: String" in result.svg
    assert "age: int" in result.svg
    assert "greet(): void" in result.svg
    assert len(result.node_positions) == 2


def test_render_draws_inheritance_arrowhead():
    model = parse(VALID)
    result = PROFILE.render(model)
    assert "<polygon" in result.svg


def test_association_without_label_has_no_arrowhead_but_has_line():
    model = parse(
        'diagram uml.class "Модель" {\n'
        '  class a "A" attr_x=int\n'
        '  class b "B" attr_y=int\n'
        "  a -> b\n"
        "}"
    )
    result = PROFILE.render(model)
    assert "<line" in result.svg
    assert "<polygon" not in result.svg


def test_profile_is_registered():
    from app.notations import get, load_all

    load_all()
    profile = get("uml.class")
    assert profile.key == "uml.class"
