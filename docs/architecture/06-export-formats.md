# Экспорт в нативные форматы (FR-STORE-06)

Реализация: `backend/app/export/` (`plantuml.py`, `mermaid.py`, `bpmn_xml.py`, `drawio_xml.py`, диспетчер в `__init__.py::export_model()`). Все четыре экспортёра строятся из уже распарсенной `DiagramModel` (`backend/app/domain/graph.py`), а не повторным разбором текста DSL — тот же принцип, что и у `NotationProfile.render()`. Эндпоинт — `GET /api/v1/diagrams/{id}/export?format=...` в `backend/app/api/routes/diagrams.py`, без `format` поведение не меняется (по-прежнему отдаёт `.dsl`, см. `LocalDownloadProvider`).

## Почему BPMN аппроксимируется, а не переводится дословно

У Mermaid нет собственной BPMN-нотации, у PlantUML — тоже. Для `bpmn.process` (`backend/app/notations/bpmn.py`, только start/end event, task, sequence flow) оба текстовых формата используют ближайший честный аналог:

- **Mermaid** — `flowchart TD`: `start_event`/`end_event` рисуются как `((...))`/`(((...)))` (двойной/тройной круг ближе к нотации BPMN-событий, чем прямоугольник), `task` — обычный `[...]`, sequence flow — `-->`.
- **PlantUML** — activity-диаграмма (`start` / `:task;` / `stop`), а не class/component-диаграмма — это единственный вид PlantUML, где линейная последовательность шагов читается естественно. Порядок элементов вычисляется обходом от `start_event` по sequence flow (`_walk_order` в `plantuml.py`); ветвления профилем `bpmn.process` пока не valid'ируются как отдельный кейс, поэтому обход берёт первый исходящий edge.

Раз это аппроксимация, а не факсимиле, `bpmn_xml` — единственный формат, который отдаёт *настоящий* BPMN 2.0 XML (`<bpmn:definitions>` → `<bpmn:process>` → `startEvent`/`task`/`endEvent`/`sequenceFlow`), поэтому он **доступен только для нотаций `bpmn.*`** — запрос `bpmn_xml` для `erd.*` возвращает 400, а не мусор.

## Почему у ERD и drawio нет такой аппроксимации

- **ERD → Mermaid** использует нативный `erDiagram` (не flowchart): сущности — блоки `ENTITY["Label"] { ... }`, атрибут с `pk=...` — строка `string <value> PK` (реальный модификатор Mermaid ERD, не выдуманный). Кардинальность связей в `DiagramModel` пока не хранится (только `source_id -> target_id` без множественности), поэтому все связи рендерятся с дефолтным `||--o{` — это единственное упрощение в ERD-экспорте, и оно того же рода, что и BPMN-аппроксимация: честный дефолт, а не гадание.
- **ERD → PlantUML** использует `entity "Label" as id { ... }` — то же самое native-ERD-подмножество PlantUML, атрибут с `pk` помечается `*`.
- **drawio (`mxGraphModel`)** не привязан к нотации вообще — он строится напрямую из `Node`/`Edge` (прямоугольник на узел, `mxCell`-ребро между ними, раскладка слева направо с фиксированным шагом, как в `render()` у профилей нотаций). Работает для любой будущей нотации без изменений в `drawio_xml.py`.
