# API-справочник DiagramCode (FastAPI)

**Статус:** актуально (сгенерировано из живой OpenAPI-схемы `backend/app/main.py:app`, 2026-09-23)
**Источник:** `docs/api/openapi.json` — точный экспорт `app.openapi()`, тот же контракт, что отдаёт `/openapi.json` при живом сервере и Swagger UI на `/docs`. Этот файл — читаемая версия того же контракта, а не отдельное описание "как должно быть".

Отличие от `docs/labs/part2-pz2-report.md`: тот документ описывает лабораторный Node.js/Express API (учебный, отдельный от продукта). Этот — реальный API продукта DiagramCode на FastAPI.

---

## 1. Аутентификация

Все защищённые эндпоинты ожидают заголовок `Authorization: Bearer <jwt>`. Токен выдаётся `/api/v1/auth/login`. При отсутствии/недействительности токена `app/api/deps.py` возвращает 401 с телом `{"detail": "Требуется аутентификация."}` или `{"detail": "Недействительный токен."}` до того, как запрос доходит до обработчика маршрута — стандартный механизм `HTTPException` FastAPI, не кастомный формат ошибок (в отличие от лабораторного Node-API, где формат ошибок унифицирован под `{"error": ...}`).

## 2. Справочник эндпоинтов

| Метод | Путь | Auth | Успешный код | Тело запроса | Тело ответа |
|---|---|---|---|---|---|
| GET | `/health` | нет | 200 | — | `{"status": "..."}` |
| POST | `/api/v1/auth/register` | нет | 201 | `RegisterRequest` (`username`, `email`, `password`) | `{"id": ..., "email": ...}` |
| POST | `/api/v1/auth/login` | нет | 200 | `LoginRequest` (`email`, `password`) | `TokenResponse` (`access_token`, `token_type`) |
| GET | `/api/v1/diagrams` | да | 200 | — | `list[DiagramResponse]` |
| POST | `/api/v1/diagrams` | да | 201 | `DiagramCreateRequest` (`title`, `notation`) | `DiagramResponse` |
| GET | `/api/v1/diagrams/{diagram_id}` | да | 200 / 404 | — | `DiagramDetailResponse` (включает `current_dsl_content`) |
| GET | `/api/v1/diagrams/{diagram_id}/export` | да | 200 | query-параметр формата | файл экспорта (SVG/PNG/PlantUML/Mermaid/BPMN XML — см. `docs/architecture/06-export-formats.md`) |
| POST | `/api/v1/diagrams/render` | **нет** | 200 | `SaveVersionRequest` (`dsl_content`, `message?`) | `RenderResponse` (`svg`, `issues`) |
| POST | `/api/v1/diagrams/{diagram_id}/versions` | да | 201 | `SaveVersionRequest` | `VersionResponse` (`id`, `author`, `message`, `created_at`) |
| GET | `/api/v1/diagrams/{diagram_id}/versions` | да | 200 | — | `list[VersionResponse]` |
| POST | `/api/v1/diagrams/{diagram_id}/collaborators` | да | 201 | `{user_id, role}` | `CollaboratorResponse` |
| GET | `/api/v1/diagrams/{diagram_id}/children` | да | 200 | — | `list[DiagramResponse]` (декомпозиции узлов, FR-NOT-06a) |
| POST | `/api/v1/diagrams/{diagram_id}/decompositions` | да | 201 | `{node_id, title}` | `DiagramResponse` (новая дочерняя диаграмма) |
| POST | `/api/v1/ai/generate` | да | 200 | режим + описание/изображение | `GenerateDslResponse` (`dsl_code`) |

Все параметризованные маршруты (`{diagram_id}`) дополнительно возвращают 422 при невалидном UUID/типе параметра — стандартная Pydantic-валидация FastAPI, отражена в `docs/api/openapi.json`.

**Важно, не пропустить при защите:** `POST /api/v1/diagrams/render` — единственный эндпоинт диаграмм без аутентификации. Это осознанное решение: рендер по тексту не требует владения диаграммой (нет побочных эффектов, ничего не сохраняется), что позволяет пробовать DSL до регистрации. Сохранение результата (`POST .../versions`) уже требует токен.

## 3. Соответствие функциональным требованиям

- `/auth/*` — FR-AUTH-01…05.
- `/diagrams`, `/diagrams/{id}` — FR-DSL-01…06 (CRUD над диаграммой как сущностью).
- `/diagrams/render` — FR-REN-01…03.
- `/diagrams/{id}/versions` — FR-VER-01…04, FR-VER-07 (git-подобное версионирование, см. `docs/architecture/00-system-architecture.md`).
- `/diagrams/{id}/collaborators` — FR-AUTH-08 (совместное редактирование).
- `/diagrams/{id}/children`, `/diagrams/{id}/decompositions` — FR-NOT-06a, FR-NOT-11 (декомпозиция IDEF0/DFD, US-09/UC-17).
- `/diagrams/{id}/export` — FR-STORE-01, FR-STORE-04…06.
- `/ai/generate` — FR-AI-01…12.

## 4. Как обновить этот документ

Схема генерируется прямо из кода, руки не трогают JSON:

```bash
cd backend
python -c "import json; from app.main import app; json.dump(app.openapi(), open('../docs/api/openapi.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)"
```

Таблицу в разделе 2 нужно перепроверять вручную при добавлении/изменении маршрутов — она читаемая проекция схемы, а не она сама.
