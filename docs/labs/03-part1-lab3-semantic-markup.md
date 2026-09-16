# ИТиВП, Часть 1 — Лабораторная работа 3: Семантическая вёрстка

Ветка: `feature/semantic-markup` (создана от `main`, будет влита обратно в `main`).

## Вариант 13: Person + Organization

В `frontend/index.html`:
- `itemscope itemtype="https://schema.org/Organization"` — секция `#about` (само DiagramCode: `name`, `description`, `url`, `logo`).
- `itemscope itemtype="https://schema.org/Person"` — вложенный `<article id="author">` (`founder` организации): `name`, `jobTitle`, `affiliation` (вложенный `CollegeOrUniversity`), `image`, `sameAs`.

## Использованные семантические теги (более 8)

`header`, `nav`, `main`, `section` (×4: hero, features, notations, about), `article` (×5: 4 feature-card + author), `aside` (notations__aside), `footer`.

## Иерархия заголовков

`h1` (заголовок страницы, один) → `h2` (заголовки секций: Возможности / Нотации / DiagramCode) → `h3` (заголовки карточек фич, заголовок блока "Почему это удобно", заголовок "Автор проекта") — без пропуска уровней.

## Доступность

- `skip-link` в начале `body`, ведёт на `#main-content`.
- У всех содержательных `img` заполнен `alt`; у декоративных иконок карточек — `alt=""` (принято намеренно, чтобы скринридер их пропускал).
- `aria-label` на `nav` и на `aside`, `aria-labelledby` на каждой `section`, привязанный к id её заголовка.

## БЭМ

Блоки: `site-header`, `site-nav`, `hero`, `features`, `feature-card`, `notations`, `about`, `author`, `site-footer`. Элементы через `__`, модификаторов в этой лабе не потребовалось (нет вариативных состояний).

## Проверка микроразметки

Проверить после пуша через Google Rich Results Test (`https://search.google.com/test/rich-results`) — вставить URL страницы на GitHub Pages или сырой HTML.

## Тесты

Ретроактивно покрыто в рамках Lab 5 (когда в проект добавился Jest): `frontend/tests/markup.test.js`
парсит реальный `index.html` через `jsdom` и проверяет семантические теги, иерархию заголовков,
`alt` у всех изображений, skip-link и обе микроразметки Schema.org (Organization + Person).
Запуск вместе со всеми фронтенд-тестами: `npm test` в `frontend/`.

## Что нужно сделать тебе лично

Сделать скриншот прогона страницы через валидатор W3C (`https://validator.w3.org/#validate_by_upload`) и через Rich Results Test для отчёта.
