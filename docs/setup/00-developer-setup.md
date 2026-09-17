# Развёртывание для разработки

**Статус:** актуально
**Для кого:** тот, кто будет запускать/дорабатывать код (в первую очередь — сама Ксения на другой машине, или другой агент/разработчик).

## 1. Важный нюанс на текущий момент: работа ведётся на нескольких ветках

На момент написания этого документа `main` не содержит последних изменений — они лежат на:
- `feature/notation-bpmn-and-collab` — весь бэкенд: BPMN-нотация, AI-квота, соавторство, декомпозиция, Alembic-миграции, вся документация `docs/`.
- `feature/real-ide-app` — весь новый фронтенд (реальный IDE вместо лендинга лаб).

Перед запуском выбери, что тебе нужно:
- Только посмотреть текущее состояние одной из частей — переключись на соответствующую ветку (`git checkout feature/notation-bpmn-and-collab` или `feature/real-ide-app`).
- Запустить систему целиком (бэкенд + новый фронтенд вместе) — ветки нужно смёржить в `main` (или друг в друга) один раз вручную; это ещё не сделано намеренно, до твоего подтверждения (см. пояснение в чате).

## 2. Предварительные требования

- **Python 3.11+** (бэкенд использует современный синтаксис тайп-хинтов `X | None`).
- **Node.js 18+** (фронтенд, Vite 5).
- **Docker + Docker Compose** — самый простой путь для Postgres/Redis, без ручной установки СУБД.
- Либо вручную: **PostgreSQL 16** и **Redis 7**, если не хочешь Docker.

## 3. Переменные окружения

```bash
cd backend
cp .env.example .env
```

Открой `.env` и как минимум:
- Смени `JWT_SECRET_KEY` на случайную строку (не оставляй значение из примера).
- Оставь `AI_PROVIDER=stub`, если нет ключа OpenAI/Anthropic — приложение полностью работает без него (`StubAIProvider`, см. `docs/architecture/01-ai-provider-setup.md`); если ключ есть — впиши его в `AI_API_KEY` и смени `AI_PROVIDER` на `openai` или `anthropic`.

## 4. Запуск через Docker Compose (рекомендуемый путь)

```bash
docker compose up --build
```

Поднимает: `postgres` (5432), `redis` (6379), `api` (FastAPI, 8000), `worker` (RQ-воркер для тяжёлого рендера/AI). Backend — `http://localhost:8000`, автодокументация API — `http://localhost:8000/docs` (NFR-OBS-03).

**После первого поднятия примени миграции** (Alembic-скелет появился на ветке `feature/notation-bpmn-and-collab` и ещё не проверялся против настоящего Postgres — см. заметку фонового агента):

```bash
docker compose exec api alembic upgrade head
```

Если это не сработает с первого раза — почти наверняка проблема в порядке миграций или в различии SQLAlchemy-моделей и уже накопленного состояния БД; смотри `backend/alembic/versions/` и `alembic history`/`alembic heads` для диагностики, это ожидаемо непроверенный участок (см. риск в отчёте бэкенд-агента).

## 5. Запуск без Docker (напрямую на машине)

```bash
# backend
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows; на Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head           # применить миграции к локальной БД, указанной в DATABASE_URL
uvicorn app.main:app --reload

# в отдельном терминале — воркер (нужен для AI/тяжёлого рендера, необязателен для базовой проверки)
cd backend
.venv/Scripts/activate
rq worker -u redis://localhost:6379/0

# frontend
cd frontend
npm install
npm run dev
```

Frontend — `http://localhost:5173`, ожидает backend на `http://localhost:8000` (см. `frontend/src/api/` за базовым URL — если backend поднят на другом адресе/порте, поменяй его там).

## 6. Тесты

```bash
# backend
cd backend
python -m pytest -q

# frontend
cd frontend
npm test
```

Оба набора должны быть зелёными перед тем, как считать ветку готовой к мержу — это уже стандартная практика в проекте (см. `docs/testing/00-test-plan.md`, критерии входа/выхода).

## 7. Как подключить реальную базу данных (Neon)

Backend написан против стандартного `DATABASE_URL` в формате SQLAlchemy — реальный Neon Postgres подключается без изменения кода:

1. В консоли Neon создай проект/БД, скопируй строку подключения (вида `postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname`).
2. Преобразуй под используемый в проекте драйвер: замени `postgresql://` на `postgresql+psycopg2://` (синхронный драйвер, как в `.env.example`) и добавь `?sslmode=require` в конец строки — Neon требует TLS.
3. Впиши получившуюся строку в `backend/.env` как `DATABASE_URL`.
4. Примени миграции: `alembic upgrade head` (пункт 4/5 выше) — это создаст все таблицы на реальной БД.
5. **Redis** Neon не предоставляет — для очереди/кэша/AI-квоты нужен отдельный бесплатный Redis (например Upstash) или локальный Redis для разработки; впиши его URL в `REDIS_URL`.

Мигрировать существующие локальные тестовые данные на Neon не нужно — это первое подключение к реальной, «боевой» для тебя базе.

## 8. Типичные проблемы

| Симптом | Вероятная причина |
|---|---|
| `ImportError` при старте `app.main` | Не установлен `pydantic[email]` (нужен для `EmailStr`) — проверь `requirements.txt` на ветке `feature/notation-bpmn-and-collab`, это было точечно исправлено бэкенд-агентом. |
| 401 на все запросы фронтенда сразу после логина | Не совпадает `JWT_SECRET_KEY` между перезапусками (если ты его меняла в `.env` после выдачи токена) — перелогинься. |
| Frontend не может достучаться до backend | Проверь `REDIS_URL`/`DATABASE_URL` в контейнере `api` (Docker Compose переопределяет их на адреса контейнеров `postgres`/`redis`, а не `localhost`) и CORS origin в `backend/app/core/config.py`/`main.py` (по умолчанию разрешён только `http://localhost:5173`, NFR-SEC-05). |
| AI-эндпоинт всегда отвечает одинаково | Ожидаемо при `AI_PROVIDER=stub` — это заглушка, не баг (NFR-REL-01). |
