# DiagramCode — фронтенд (IDE)

Предметная область: диаграммы как код — визуальный редактор диаграмм (UML, BPMN, ERD, сети
Петри, IDEF0/IDEF3, DFD) на основе собственного текстового DSL. Эта версия фронтенда — реальный
продукт (не лендинг): полноценный редактор в стиле VS Code/draw.io поверх настоящего backend API.
Прежний лендинг-лендинг Части 1 ИТиВП (Header/Hero/FeatureList/...) сохранён в истории
git-веток `feature/*` (лабы 1–8) и на `main` — здесь он заменён на `/` реальным приложением.

## Запуск

```bash
npm install
npm run dev       # dev-сервер Vite, http://localhost:5173 — ожидает backend на http://localhost:8000
npm run build     # продакшн-сборка в dist/
npm run preview   # локальный просмотр собранной версии
npm test          # Jest + React Testing Library, с отчётом покрытия
```

Полная инструкция по запуску backend+frontend вместе — `../docs/setup/00-developer-setup.md`.
Руководство по использованию готового приложения — `../docs/setup/01-user-guide.md`.

## Структура

- `src/auth/` — контекст аутентификации (JWT в localStorage), защищённый роут (`ProtectedRoute`).
- `src/pages/` — `LoginPage`, `RegisterPage`, `IdePage`.
- `src/components/ide/` — оболочка редактора: титлбар, activity bar, сайдбар, канвас, нижняя панель, статус-бар.
- `src/components/shared/` — переиспользуемые UI-элементы оболочки.
- `src/dsl/` — регистрация кастомного языка DSL для Monaco (Monarch-токенайзер на основе `backend/app/dsl/grammar.lark`).
- `src/theme/` — контекст тёмной/светлой темы (`data-theme`, независимые наборы переменных, не инверсия).
- `src/i18n/` — контекст языка интерфейса (ru/en).
- `src/api/` — обёртка над реальными эндпоинтами backend (`/auth/*`, `/diagrams/*`).
- `src/styles/` — CSS, соответствующий классам/переменным из `design/mockups/IDE-Dark.dc.html` и `IDE-Light.dc.html`.

## Что реально подключено к backend (не заглушки)

Логин/регистрация, Run (рендер через `POST /diagrams/render`), Save (создание диаграммы +
версии), список диаграмм в сайдбаре, открытие существующей диаграммы, Export (скачивание
`.dsl`), Import (загрузка локального файла в редактор). Точный список эндпоинтов и то, что
пока сознательно не подключено (AI-модалка, история версий, OAuth-сохранение, resize панелей
перетаскиванием, realtime-совместное редактирование) — см. `../docs/requirements/04-traceability-matrix.md`.

## Тесты

`npm test` — Jest + `@testing-library/react`. Тестовые наборы: auth-контекст, тема, язык,
компоненты IDE-оболочки, регистрация Monaco-языка, цикл Run/Save с замоканным `fetch`,
защита роута `/`.
