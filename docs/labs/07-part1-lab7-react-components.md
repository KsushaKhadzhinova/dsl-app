# ИТиВП, Часть 1 — Лабораторная работа 7: React-компоненты

Ветка: `feature/react-components` (от `main`, влита обратно в `main`).

## Замена ванильного фронтенда на Vite + React

По условию лабы Vite/React-приложение **заменяет** ванильный HTML/CSS/JS-фронтенд
(лабы 3–6). Старая реализация никуда не пропала — она осталась в истории git: коммиты
на `main` до этой лабы и оригинальные ветки `feature/semantic-markup`,
`feature/responsive-layout`, `feature/javascript-interactivity`, `feature/async-api-storage`
(`git log --all --oneline` или `git show feature/semantic-markup:frontend/index.html`).

Удалено из рабочего дерева: `frontend/index.html` (ванильный), `frontend/css/style.css`,
`frontend/js/{script.js,repoStats.js}`, `frontend/images/*`, старые тесты на них
(`markup.test.js`, `responsive.test.js`, `script.test.js`, `repoStats.test.js`) — все они
были написаны конкретно под vanilla-реализацию и стали неприменимы к React-дереву.

## Структура

```
frontend/
├── index.html          (Vite entry: <div id="root">)
├── vite.config.js
├── babel.config.cjs     (для Jest — сам Vite babel не использует)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── data/mockData.js
    └── components/
        ├── Header.jsx
        ├── Hero.jsx
        ├── FeatureCard.jsx
        ├── FeatureList.jsx
        ├── NotationsList.jsx
        ├── RepoStatsCard.jsx
        ├── AboutSection.jsx
        ├── AuthorCard.jsx
        └── Footer.jsx
```

## Требования лабы

- **≥5 компонентов** — 9 (`App` + 8 презентационных).
- **Только пропсы** — ни одного `useState`/`useEffect` во всём `src/`; все данные приходят
  сверху из `App.jsx`, который читает их из `src/data/mockData.js`.
- **Мок-данные** — `mockData.js` содержит статичные значения (в т.ч. фиксированные цифры
  для `RepoStatsCard`, которые в Lab 6 подгружались живым `fetch`; здесь это осознанно
  статика, так как хуки/сайд-эффекты в этой лабе запрещены).
- Структура и BEM-классы, семантика (`header`/`nav`/`main`/`section`/`article`/`footer`) и
  Schema.org-микроразметка (Organization + Person) из Lab 3 перенесены в JSX как есть
  (`itemScope`/`itemProp`/`itemType` вместо HTML-атрибутов `itemscope`/`itemprop`/`itemtype`).

## Инструменты

`vite` + `@vitejs/plugin-react` для дев-сервера и сборки; `npm run dev` / `npm run build` / `npm run preview`.

## Тесты (не дожидаясь Lab 8)

Раз ты просила покрывать тестами каждую лабу сразу, а не только в Lab 8 (который формально
про тестирование), компоненты уже покрыты сейчас: `@testing-library/react` +
`@testing-library/jest-dom`, 10 тестов на все 8 презентационных компонентов + `App.jsx`.
Прогон подтвердил **100% statements/branches/functions/lines** по всему `src/`
(кроме `src/main.jsx` — это просто точка монтирования в реальный DOM, которая не
выполняется в тестовой среде и осознанно исключена из `collectCoverageFrom`).

В Lab 8 добавится: собственные util-функции с тестами (в текущем `src/` их пока нет,
все компоненты чисто презентационные), настройка `coverageThreshold` под тот порог,
который требует сама лаба (70%/60%), и документация по Lighthouse-аудиту.

## Что нужно сделать тебе лично

`npm run dev` в `frontend/` и открыть `http://localhost:5173` вживую, чтобы увидеть
реальные стили (в отличие от статического превью файла в браузере, dev-сервер Vite
подключает CSS по-настоящему).
