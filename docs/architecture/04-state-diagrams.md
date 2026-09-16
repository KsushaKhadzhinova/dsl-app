# Диаграммы состояний ключевых сущностей

**Статус:** актуально
**Связанные документы:** [`00-system-architecture.md`](00-system-architecture.md), [`03-sequence-diagrams.md`](03-sequence-diagrams.md).

## 1. Жизненный цикл задачи рендера (worker job, FR-REN-04)

```mermaid
stateDiagram-v2
    [*] --> queued: API поставил задачу в Redis (RQ)
    queued --> running: воркер забрал задачу из очереди
    running --> done: рендер успешен
    running --> failed: исключение в NotationProfile.render / таймаут
    done --> [*]: результат опубликован в WebSocket, закэширован по hash(dsl+notation)
    failed --> [*]: ошибка опубликована в WebSocket + залогирована в GlitchTip (NFR-OBS-02)
```

## 2. Жизненный цикл AI-запроса (FR-AI-*, включая rate limit)

```mermaid
stateDiagram-v2
    [*] --> quota_check: пользователь отправил запрос AI
    quota_check --> rejected_quota: лимит (AI_DAILY_QUOTA) исчерпан
    quota_check --> generating: квота есть, токен списан
    generating --> completed: AIProvider вернул DSL-код
    generating --> failed: таймаут/ошибка внешнего провайдера (NFR-REL-02, circuit breaker)
    completed --> [*]: AIRequest сохранён, код вставлен в редактор
    failed --> [*]: AIRequest сохранён с generated_dsl=null, показана ошибка
    rejected_quota --> [*]: запрос не логируется как AIRequest, к провайдеру не уходит
```

## 3. Жизненный цикл диаграммы (владение и версии)

```mermaid
stateDiagram-v2
    [*] --> draft: создана (Diagram без ни одного Commit)
    draft --> saved: первое сохранение (Commit создан)
    saved --> saved: повторные Save (новый Commit, тот же или новый Blob)
    saved --> decomposed: узел IDEF0/DFD раскрыт в дочернюю Diagram (FR-NOT-06a)
    saved --> shared: владелец добавил соавтора (DiagramCollaborator, Волна 2)
    shared --> saved: последний соавтор удалён
    decomposed --> decomposed
    saved --> [*]: диаграмма не удаляется физически в MVP — удаление вне текущего охвата FR
```

## 4. Аутентификация клиента (фронтенд, FR-AUTH-02/05)

```mermaid
stateDiagram-v2
    [*] --> anonymous: нет токена в localStorage
    anonymous --> authenticating: отправлена форма login/register
    authenticating --> authenticated: 200 + access_token сохранён
    authenticating --> anonymous: 401/400, показана ошибка формы
    authenticated --> anonymous: logout ИЛИ ответ API 401 (токен истёк/невалиден)
    anonymous --> [*]: редирект на /login при попытке открыть "/"
    authenticated --> [*]: доступ к IDE открыт
```
