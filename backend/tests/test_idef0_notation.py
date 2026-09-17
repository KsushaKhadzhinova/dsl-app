from app.dsl.parser import parse
from app.notations.idef0 import Idef0ContextDecompositionProfile

PROFILE = Idef0ContextDecompositionProfile()

VALID = (
    'diagram idef0.context_decomposition "Обработка заказа" {\n'
    '  terminal order "Заказ" \n'
    '  terminal rule "Регламент" \n'
    '  terminal system "Информационная система" \n'
    '  activity a1 "Обработать заказ" no=A1\n'
    '  order -["input"]-> a1\n'
    '  rule -["control"]-> a1\n'
    '  system -["mechanism"]-> a1\n'
    '  a1 -["output"]-> result\n'
    '  terminal result "Обработанный заказ" \n'
    "}"
)


def test_valid_diagram_has_no_errors():
    model = parse(VALID)
    issues = PROFILE.validate(model)
    assert not any(i.severity == "error" for i in issues)


def test_no_icom_connections_is_warning_not_error():
    model = parse(
        'diagram idef0.context_decomposition "Диаграмма" {\n'
        '  activity a1 "Изолированный блок"\n'
        "}"
    )
    issues = PROFILE.validate(model)
    assert any("ICOM-связи" in i.message for i in issues if i.severity == "warning")
    assert not any(i.severity == "error" for i in issues)


def test_missing_control_is_warning_not_error():
    model = parse(
        'diagram idef0.context_decomposition "Диаграмма" {\n'
        '  terminal order "Заказ"\n'
        '  activity a1 "Блок"\n'
        '  order -["input"]-> a1\n'
        "}"
    )
    issues = PROFILE.validate(model)
    assert any("Control" in i.message for i in issues if i.severity == "warning")
    assert not any(i.severity == "error" for i in issues)


def test_wrong_node_kind_is_error():
    model = parse('diagram idef0.context_decomposition "Диаграмма" {\n  entity x "Не IDEF0"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "Недопустимый тип узла" in i.message for i in issues)


def test_no_activity_at_all_is_error():
    model = parse('diagram idef0.context_decomposition "Диаграмма" {\n  terminal t1 "Терминатор"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "функциональный блок" in i.message for i in issues)


def test_edge_to_nonexistent_box_is_error():
    model = parse(
        'diagram idef0.context_decomposition "Диаграмма" {\n'
        '  activity a1 "Блок"\n'
        '  a1 -["output"]-> ghost\n'
        "}"
    )
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "несуществующий блок" in i.message for i in issues)


def test_unrecognized_icom_label_is_error():
    model = parse(
        'diagram idef0.context_decomposition "Диаграмма" {\n'
        '  terminal t1 "Терминатор"\n'
        '  activity a1 "Блок"\n'
        '  t1 -["something"]-> a1\n'
        "}"
    )
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "ICOM-связи" in i.message for i in issues)


def test_plain_arrow_without_icom_label_is_error():
    model = parse(
        'diagram idef0.context_decomposition "Диаграмма" {\n'
        '  terminal t1 "Терминатор"\n'
        '  activity a1 "Блок"\n'
        '  t1 -> a1\n'
        "}"
    )
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "ICOM-связи" in i.message for i in issues)


def test_render_produces_box_and_positions_for_all_nodes():
    model = parse(VALID)
    result = PROFILE.render(model)
    assert result.svg.startswith("<svg")
    assert "Обработать заказ" in result.svg
    assert "A1" in result.svg
    assert len(result.node_positions) == len(model.nodes)


def test_render_places_control_above_and_input_left_of_activity():
    model = parse(VALID)
    result = PROFILE.render(model)
    ax, ay = result.node_positions["a1"]
    ix, iy = result.node_positions["order"]
    cx, cy = result.node_positions["rule"]
    mx, my = result.node_positions["system"]
    ox, oy = result.node_positions["result"]

    assert ix < ax
    assert cy < ay
    assert my > ay
    assert ox > ax


def test_profile_is_registered():
    from app.notations import get, load_all

    load_all()
    profile = get("idef0.context_decomposition")
    assert profile.key == "idef0.context_decomposition"
