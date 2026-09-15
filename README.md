# DiagramCode

Веб-сервис визуального моделирования структур и процессов на основе собственного языка диаграмм (DSL) — «diagram as code» для UML, ERD, IDEF0/IDEF1X/IDEF3, DFD, BPMN и сетей Петри, с хранением, версионированием и AI-генерацией диаграмм по тексту и изображению.

## Структура репозитория

```
backend/     — FastAPI-приложение (парсер DSL, валидаторы нотаций, рендеринг, API)
frontend/    — React/Vite PWA (редактор кода + канвас, в стиле VS Code / draw.io)
design/      — мудборды, мокапы интерфейса
docs/
├── architecture/   — архитектурные решения и обоснования
├── literature/      — библиография
├── requirements/    — функциональные и нефункциональные требования
└── labs/            — привязка лабораторных работ ИТиВП к этому проекту
```

## Архитектура

См. [`docs/architecture/00-system-architecture.md`](docs/architecture/00-system-architecture.md) — обоснование стека, распределённой топологии (API + очередь + воркер-пул) и реестра плагинов нотаций.

## Стек

- **Backend:** Python, FastAPI, PostgreSQL, Redis (очередь + кэш), Lark (парсер DSL)
- **Frontend:** React, Vite, Monaco Editor
- **Инфраструктура:** Docker Compose (локально), GitHub Actions (CI/CD), Render + Netlify (деплой)

## Локальный запуск

```bash
docker compose up --build
```

Backend поднимется на `http://localhost:8000` (документация API — `/docs`), frontend — на `http://localhost:5173`.

## Разработка без Docker

```bash
# backend
cd backend
python -m venv .venv && .venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```
