# Диаграммы последовательностей ключевых сценариев

**Статус:** актуально
**Связанные документы:** [`00-system-architecture.md`](00-system-architecture.md) (компоненты), [`../requirements/03-use-cases.md`](../requirements/03-use-cases.md) (сценарии текстом).

Нотация — Mermaid `sequenceDiagram` (рендерится нативно в GitHub/GitLab). Здесь фиксируется то, что не видно из FR-таблиц: точный порядок вызовов между компонентами и где именно проходит асинхронная граница (воркер-пул, WebSocket).

## 1. Вход в систему (UC-02)

```mermaid
sequenceDiagram
    actor U as Пользователь
    participant FE as React IDE
    participant API as FastAPI (auth router)
    participant SVC as auth_service
    participant DB as PostgreSQL

    U->>FE: вводит email + пароль
    FE->>API: POST /api/v1/auth/login
    API->>SVC: login(email, password)
    SVC->>DB: SELECT user WHERE email=?
    DB-->>SVC: User (password_hash)
    SVC->>SVC: bcrypt.verify(password, password_hash)
    alt пароль верный
        SVC-->>API: access_token (JWT)
        API-->>FE: 200 {access_token}
        FE->>FE: сохранить токен, перейти на "/"
    else пароль неверный / пользователь не найден
        SVC-->>API: AuthError
        API-->>FE: 401 {detail}
        FE->>FE: показать ошибку формы
    end
```

## 2. Написание кода → рендер (UC-04), включая асинхронную ветку

```mermaid
sequenceDiagram
    actor U as Пользователь
    participant FE as React IDE (Monaco + канвас)
    participant API as FastAPI (diagrams router)
    participant DSL as dsl/parser.py
    participant NOT as NotationProfile (напр. erd.py)
    participant Q as Redis (очередь RQ)
    participant W as Worker pool
    participant WS as WebSocket pub/sub

    U->>FE: пишет DSL-код, нажимает Run
    FE->>API: POST /diagrams/{id}/render {dsl_code, notation}
    API->>DSL: parse(dsl_code)
    alt синтаксическая ошибка
        DSL-->>API: DslSyntaxError(line, col, message)
        API-->>FE: 400 {errors:[...]}
        FE->>FE: подсветить строку, вкладка Problems
    else разбор успешен
        DSL-->>API: DiagramModel
        API->>NOT: validate(model)
        NOT-->>API: [ValidationIssue...]
        alt есть issue уровня error
            API-->>FE: 200 {issues, svg=null}
            FE->>FE: показать Problems, канвас не обновляется
        else диаграмма маленькая
            API->>NOT: render(model)
            NOT-->>API: RenderResult (SVG)
            API-->>FE: 200 {svg, issues:[warnings?]}
            FE->>FE: отрисовать SVG на канвасе
        else диаграмма большая (FR-REN-04)
            API->>Q: enqueue(render_diagram_job)
            API-->>FE: 202 {job_id}
            Q->>W: забрать задачу
            W->>NOT: render(model)
            W->>WS: publish(job_id, result)
            WS-->>FE: {job_id, svg}
            FE->>FE: отрисовать SVG, когда придёт уведомление
        end
    end
```

## 3. Сохранение версии (UC-06)

```mermaid
sequenceDiagram
    actor U as Пользователь
    participant FE as React IDE
    participant API as FastAPI (diagrams router)
    participant SVC as diagram_service
    participant REPO as diagram_repository
    participant DB as PostgreSQL

    U->>FE: нажимает Save (+ опционально комментарий)
    FE->>API: POST /diagrams/{id}/versions {dsl_code, comment}
    API->>SVC: save_version(diagram_id, dsl_code, comment, author="user")
    SVC->>SVC: sha256(dsl_code)
    SVC->>REPO: get_blob_by_hash(hash)
    alt Blob уже существует
        REPO-->>SVC: existing Blob
    else новый текст
        SVC->>REPO: create_blob(dsl_code, hash)
        REPO->>DB: INSERT INTO blobs
        REPO-->>SVC: new Blob
    end
    SVC->>REPO: create_commit(diagram_id, blob_id, author, comment)
    REPO->>DB: INSERT INTO commits
    REPO-->>SVC: Commit
    SVC-->>API: CommitDTO
    API-->>FE: 201 {commit}
    FE->>FE: тост "Сохранено", обновить историю версий
```

## 4. Генерация DSL через AI (UC-08), с проверкой квоты

```mermaid
sequenceDiagram
    actor U as Пользователь
    participant FE as React IDE (AI-модалка)
    participant API as FastAPI (ai router)
    participant RL as rate_limit.py (Redis token bucket)
    participant SVC as ai_service
    participant PROV as AIProvider (Stub / OpenAI / Anthropic)
    participant DB as PostgreSQL (AIRequest)

    U->>FE: режим "Написать код", вводит промпт + нотацию
    FE->>API: POST /ai/generate {mode:"write", prompt, notation}
    API->>RL: check_and_consume(user_id, "ai_daily_quota")
    alt квота исчерпана
        RL-->>API: QuotaExceeded
        API-->>FE: 429 {detail:"Дневной лимит AI-запросов исчерпан"}
        FE->>FE: показать сообщение, не открывать редактор
    else квота есть
        RL-->>API: OK (остаток N запросов)
        API->>SVC: generate_dsl_from_text(prompt, notation)
        SVC->>PROV: generate_dsl_from_text(prompt, notation)
        PROV-->>SVC: dsl_code
        SVC->>DB: INSERT INTO ai_requests (mode, prompt, dsl_code, ts)
        SVC-->>API: dsl_code
        API-->>FE: 200 {dsl_code}
        FE->>FE: вставить код с атрибуцией "AI ✦ …", вызвать Run (сценарий №2)
    end
```

## 5. Совместное редактирование — синхронизация через WebSocket (UC-16, Волна 2)

```mermaid
sequenceDiagram
    actor U1 as Пользователь А (владелец)
    actor U2 as Пользователь Б (соавтор)
    participant FE1 as Клиент А
    participant FE2 as Клиент Б
    participant WS as WebSocket-канал diagram:{id}
    participant API as FastAPI

    U1->>FE1: открывает диаграмму
    FE1->>WS: connect(diagram_id, token)
    U2->>FE2: открывает ту же диаграмму
    FE2->>WS: connect(diagram_id, token)
    API->>API: проверить DiagramCollaborator(user=Б, diagram=id, role>=viewer)
    U1->>FE1: редактирует код
    FE1->>WS: publish {type:"patch", range, text}
    WS-->>FE2: {type:"patch", range, text}
    FE2->>FE2: применить патч к локальному Monaco-буферу
    Note over FE1,FE2: Конфликты одновременного редактирования одной и той же строки —<br/>вне охвата MVP-реализации, требуют отдельного решения (см. архитектурный аудит, п. про concurrency)
```
