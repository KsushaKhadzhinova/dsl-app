from app.dsl.parser import parse
from app.notations.bpmn import BpmnProcessProfile

PROFILE = BpmnProcessProfile()


def test_valid_process_has_no_errors():
    model = parse(
        'diagram bpmn.process "Обработка заявки" {\n'
        '  start_event s1 "Заявка подана"\n'
        '  task t1 "Проверить заявку"\n'
        '  end_event e1 "Заявка обработана"\n'
        "  s1 -> t1 -> e1\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert not any(i.severity == "error" for i in issues)


def test_missing_start_event_is_error():
    model = parse(
        'diagram bpmn.process "Процесс" {\n'
        '  task t1 "Шаг"\n'
        '  end_event e1 "Конец"\n'
        "  t1 -> e1\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert any("start event" in i.message for i in issues if i.severity == "error")


def test_missing_end_event_is_error():
    model = parse(
        'diagram bpmn.process "Процесс" {\n'
        '  start_event s1 "Начало"\n'
        '  task t1 "Шаг"\n'
        "  s1 -> t1\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert any("end event" in i.message for i in issues if i.severity == "error")


def test_wrong_node_kind_is_error():
    model = parse('diagram bpmn.process "Процесс" {\n  entity x "Не BPMN"\n}')
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "Недопустимый тип узла" in i.message for i in issues)


def test_edge_to_nonexistent_node_is_error():
    model = parse(
        'diagram bpmn.process "Процесс" {\n'
        '  start_event s1 "Начало"\n'
        '  end_event e1 "Конец"\n'
        "  s1 -> ghost\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert any(i.severity == "error" and "несуществующий узел" in i.message for i in issues)


def test_disconnected_node_is_warning_not_error():
    model = parse(
        'diagram bpmn.process "Процесс" {\n'
        '  start_event s1 "Начало"\n'
        '  task t1 "Изолированный шаг"\n'
        '  end_event e1 "Конец"\n'
        "  s1 -> e1\n"
        "}"
    )
    issues = PROFILE.validate(model)
    assert any(i.severity == "warning" for i in issues)
    assert not any(i.severity == "error" for i in issues)


def test_render_produces_svg_with_shapes_per_node():
    model = parse(
        'diagram bpmn.process "Процесс" {\n'
        '  start_event s1 "Начало"\n'
        '  task t1 "Шаг"\n'
        '  end_event e1 "Конец"\n'
        "  s1 -> t1 -> e1\n"
        "}"
    )
    result = PROFILE.render(model)
    assert result.svg.startswith("<svg")
    assert result.svg.count("<circle") == 2
    assert result.svg.count("<rect") == 1
    assert "Начало" in result.svg
    assert "Шаг" in result.svg
    assert "Конец" in result.svg
    assert len(result.node_positions) == 3


def test_profile_is_registered():
    from app.notations import get, load_all

    load_all()
    profile = get("bpmn.process")
    assert profile.key == "bpmn.process"
