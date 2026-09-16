# DiagramCode — фронтенд

Предметная область: диаграммы как код — визуальный редактор диаграмм (UML, BPMN, ERD, сети
Петри, IDEF0/IDEF3, DFD) на основе собственного текстового DSL. Это продуктовый фронтенд
курсового проекта DiagramCode; данный React-проект — витрина/лендинг части продукта,
пройденная через прогрессию лаб Части 1 ИТиВП (vanilla HTML/CSS/JS → React, лабы 1–8).

## Запуск

```bash
npm install
npm run dev       # dev-сервер Vite, http://localhost:5173
npm run build     # продакшн-сборка в dist/
npm run preview   # локальный просмотр собранной версии
npm test          # Jest + React Testing Library, с отчётом покрытия
```

## Компоненты

- `components/layout/` — каркас страницы: `Header`, `Footer`.
- `components/ui/` — базовые переиспользуемые компоненты: `Card` (визуальная карточка-обёртка).
- `components/features/` — предметные компоненты: `Hero`, `FeatureCard`/`FeatureList`
  (возможности продукта), `NotationsList` (список поддерживаемых нотаций), `RepoStatsCard`
  (статистика GitHub-репозитория), `AboutSection`/`AuthorCard` (о проекте, микроразметка
  Schema.org Organization + Person).
- `data/mockData.js` — статичные мок-данные, которыми наполняются компоненты через props
  (без `useState`/`useEffect` — таково условие Lab 7).
- `utils/` — чистые функции: `pluralizeRu` (русское склонение числительных), `stripProtocol`
  (обрезка `http(s)://` из ссылки).
- `pages/` — заготовка под будущую маршрутизацию (`react-router-dom` установлен, но пока
  не используется — понадобится в следующем семестре).

## Тесты

`npm test` — Jest + `@testing-library/react`, порог покрытия из `package.json`
(`statements/lines/functions ≥ 70%`, `branches ≥ 60%`). Отчёт в `coverage/lcov-report/index.html`
после прогона.
