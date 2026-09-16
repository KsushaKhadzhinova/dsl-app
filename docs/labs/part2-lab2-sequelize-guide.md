# Часть 2 (текущий семестр), Lab 2 — Sequelize ORM над PostgreSQL: полный гайд

Это отдельная лаба от Части 1 (там Lab 2 — про настройку окружения, `docs/labs/02-part1-lab2-environment-setup.md`).
Эта — про базы данных, код лежит на ветке **`lab12`**, запушена на GitHub:
https://github.com/KsushaKhadzhinova/dsl-app/tree/lab12

## 0. Какую папку и какую ветку открывать

Один и тот же проект на диске — **`E:\VisualDSL-Platform`**. Отдельной папки под эту лабу нет,
это ветка git внутри той же папки. Открываешь в VS Code `E:\VisualDSL-Platform`, в терминале:

```bash
git checkout lab12
```

После этого в корне папки появится содержимое именно этой лабы (`server.js`, `models/`,
`migrations/` и т.д.) — так и должно быть, ветка полностью заменяет файлы в рабочей директории
на снимок этой ветки, других папок открывать не нужно.

## 1. Какие папки/файлы появились именно в этой лабе (не были в Lab 1)

Сравнила напрямую (`git diff lab21 lab12`) — вот что реально новое по сравнению с Lab 1 (`lab21`):

| Папка/файл | Новое? | Что там |
|---|---|---|
| `config/` | ✅ новая папка | `config.js` — три профиля подключения к БД (dev/test/prod) |
| `migrations/` | ✅ новая папка | 2 файла — история изменений схемы таблицы `Diagrams` |
| `seeders/` | ✅ новая папка | 1 файл — тестовые данные для наполнения таблицы |
| `.sequelizerc` | ✅ новый файл | конфиг для утилиты `sequelize-cli` |
| `.env.example` | ✅ новый файл | шаблон переменных окружения (реальный `.env` не в git) |
| `models/` | папка была и в Lab 1, но содержимое **полностью заменено** | было `diagramStore.js` (массив в памяти) → стало `db.js` (подключение) + `Diagram.js` (модель таблицы) |
| `tests/setup.js`, `tests/db.test.js` | ✅ новые файлы | настройка тестовой БД, тесты самого подключения |
| `controllers/diagramController.js` | не новый файл, но код внутри переписан | было — работа с массивом, стало — вызовы Sequelize |
| `server.js` | не новый, но изменена одна строка | добавлена проверка `sequelize.authenticate()` перед стартом |
| `routes/`, `middleware/`, `app.js` | не менялись вообще | это специально: задание требует не трогать маршруты |

## 2. Что вообще нужно было сделать (условие лабы своими словами)

В Lab 1 данные диаграмм жили в обычном JS-массиве в памяти процесса — перезапустил сервер,
всё исчезло. Задача Lab 2: подключить настоящую базу данных PostgreSQL через ORM Sequelize,
**не трогая сами HTTP-маршруты** (`GET/POST/PUT/DELETE /diagrams`) — снаружи API выглядит так
же, просто внутри контроллер теперь работает с базой, а не с массивом. Плюс: миграция (версия
схемы), сиды (тестовые данные), CRUD через модель.

## 3. Теория

**ORM (Object-Relational Mapping)** — прослойка между JS-объектами и SQL-таблицами. Пишешь
`Diagram.findByPk(5)` вместо `SELECT * FROM "Diagrams" WHERE id = 5` — Sequelize сам строит SQL,
шлёт через драйвер `pg`, оборачивает результат в объект с методами (`.update()`, `.destroy()`).

Плюсы: не пишешь сырой SQL руками, защита от SQL-инъекций из коробки (параметризованные
запросы), валидация на уровне модели ещё до похода в базу, **миграции** как контролируемая,
воспроизводимая история изменений схемы (файл с `up`/`down`, коммитится в git, применяется
командой — а не руками через SQL-консоль).

Минусы: сложные джойны/агрегации ORM генерирует не всегда оптимально, лишняя абстракция поверх
самого SQL, которую тоже надо знать.

**Миграция** — файл с двумя функциями: `up` (применить изменение схемы), `down` (откатить).
Sequelize хранит служебную таблицу `SequelizeMeta` со списком уже применённых миграций, чтобы
не накатить одну и ту же дважды. Порядок применения — по timestamp-префиксу в имени файла.

**Сид (seed)** — разовое наполнение таблицы тестовыми/демонстрационными данными, тоже через
файл с `up`/`down`, но через `bulkInsert`/`bulkDelete`, а не через модель.

## 4. Что установить и как запустить — по шагам

### Шаг 1 — база данных

Не обязательно ставить PostgreSQL на компьютер. Проще: [neon.tech](https://neon.tech) →
регистрация → New Project → скопировать **Connection string** вида
`postgresql://user:password@host/dbname?sslmode=require`.

### Шаг 2 — переключиться на ветку и поставить зависимости

```bash
cd E:\VisualDSL-Platform
git checkout lab12
npm install
```

Установит (см. `package.json` этой ветки): `express`, `sequelize`, `pg` + `pg-hstore`
(драйвер PostgreSQL), `dotenv` (чтение `.env`) — как зависимости приложения; `sequelize-cli`
(команды `migrate`/`seed`), `sqlite3` (тестовая БД), `jest`+`supertest` (тесты), `nodemon`
(автоперезапуск в dev), `cross-env` (кросс-платформенная установка переменных окружения) —
как dev-зависимости.

### Шаг 3 — переменные окружения

```bash
cp .env.example .env
```
Открой `.env`, впиши свою строку из Neon:
```
DATABASE_URL=postgresql://...твоя строка...
PORT=3000
```
`.env` уже в `.gitignore`, в репозиторий не попадёт (там секрет).

### Шаг 4 — применить миграции

```bash
npm run migrate
```
Это алиас на `sequelize-cli db:migrate` (см. `package.json` → `"migrate": "sequelize-cli db:migrate"`).
Выполнит по порядку оба файла из `migrations/`: сначала создаст таблицу `Diagrams`, потом
добавит колонку `status`. Проверить: зайти в Neon → Tables → увидишь `Diagrams` с колонками
`id, title, notation, dslContent, status, createdAt, updatedAt`.

### Шаг 5 — засеять тестовыми данными

```bash
npm run seed
```
Алиас на `sequelize-cli db:seed:all`. Вставит 2 диаграммы (ERD «Заказы», BPMN «Оформление заявки»).

### Шаг 6 — запустить сервер

```bash
npm start
```
Алиас на `node server.js`. Внутри: сначала `sequelize.authenticate()` (проверка, что база
реально отвечает), только потом `app.listen(3000)`. Увидишь `Server running on port 3000` —
всё ок. Для разработки с автоперезапуском при изменении файлов — `npm run dev` (алиас на
`nodemon server.js`) вместо `npm start`.

### Шаг 7 — прогнать тесты (не трогая реальную базу)

```bash
npm test
```
Алиас на `cross-env NODE_ENV=test jest --coverage --runInBand`. `cross-env NODE_ENV=test`
выставляет переменную окружения (кросс-платформенно — одинаково работает и в PowerShell, и в
bash), из-за которой `config/config.js` подставляет **SQLite в памяти** вместо реального
PostgreSQL — тесты быстрые, ничего не ломают в реальной базе. `--runInBand` — тесты идут
последовательно, а не параллельно (важно, потому что все тесты используют одну и ту же
in-memory SQLite базу — при параллельном запуске они бы мешали друг другу).

### Шаг 8 — проверить вручную через Postman/curl

- `GET http://localhost:3000/diagrams` → массив с 2 засеянными диаграммами.
- `GET http://localhost:3000/diagrams/1` → одна диаграмма по id.
- `POST http://localhost:3000/diagrams`, тело `{"title":"Тест","notation":"uml","dslContent":"..."}` → `201`.
- `PUT http://localhost:3000/diagrams/1`, тело `{"status":"validated"}` → `200`.
- `DELETE http://localhost:3000/diagrams/3` → `204`.
- Специально сломай: `POST` с `title: ""` → `400` с текстом ошибки валидации.

## 5. Полный разбор каждого файла (что делает каждая строка)

### `.sequelizerc`
```js
const path = require("path");
module.exports = {
  config: path.resolve("config", "config.js"),
  "models-path": path.resolve("models"),
  "migrations-path": path.resolve("migrations"),
  "seeders-path": path.resolve("seeders"),
};
```
Конфиг не для самого приложения, а для утилиты `sequelize-cli` — говорит ей, где искать
конфиг подключения, модели, миграции и сиды (по умолчанию CLI ищет `config/config.json`,
у нас — `.js`, чтобы можно было читать `process.env`).

### `config/config.js`
```js
require("dotenv").config();
module.exports = {
  development: { use_env_variable: "DATABASE_URL", dialect: "postgres", dialectOptions: { ssl: {...} } },
  test: { dialect: "sqlite", storage: ":memory:", logging: false },
  production: { /* как development */ },
};
```
Три профиля подключения по имени `NODE_ENV`. `use_env_variable: "DATABASE_URL"` — брать
не отдельные хост/порт/пароль, а одну строку подключения из переменной окружения с этим
именем. `dialect` — какой SQL-диалект/драйвер использовать. `test` — отдельный, самый
важный профиль: SQLite прямо в оперативной памяти, без обращения к реальной базе.

### `models/db.js`
```js
const { Sequelize } = require("sequelize");
const config = require("../config/config")[process.env.NODE_ENV || "development"];
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config);
module.exports = sequelize;
```
Берёт нужный профиль по текущему окружению (по умолчанию `development`, если `NODE_ENV` не
задан) и создаёт единственный экземпляр подключения — либо строкой из `DATABASE_URL` (dev/prod),
либо просто объектом конфига (test, где `use_env_variable` не задан). Это подключение
переиспользуют модель и `server.js`.

### `models/Diagram.js`
Описание таблицы: `title`/`notation` — обязательные непустые строки, `dslContent` — текст
неограниченной длины (по умолчанию пустая строка), `status` — строка (по умолчанию `"draft"`).
`validate: { notEmpty: true }` — проверка ещё до похода в базу; при нарушении Sequelize кидает
`ValidationError`, которую отдельно ловит контроллер (`400`, а не `500`). Sequelize сам
добавляет `id`/`createdAt`/`updatedAt`.

### `migrations/20260101000000-create-diagrams.js`
`up` создаёt таблицу `Diagrams` через `queryInterface.createTable` с полями `id, title, notation,
dslContent, createdAt, updatedAt` (без `status` — она появится следующей миграцией). `down`
удаляет таблицу целиком (`dropTable`) — откат.

### `migrations/20260101000100-add-status-to-diagrams.js`
`up` добавляет колонку `status` к уже существующей таблице (`addColumn`), не трогая имеющиеся
данные. `down` убирает колонку (`removeColumn`).

### `seeders/20260101000200-demo-diagrams.js`
`up` вставляет сразу 2 строки одним запросом (`bulkInsert`) — тематические данные (ERD/BPMN
диаграммы DiagramCode), с вручную проставленными `createdAt`/`updatedAt` (сиды идут напрямую
через `queryInterface`, а не через модель, поэтому автоподстановки времени, как у `.create()`,
тут нет). `down` удаляет все строки таблицы (`bulkDelete`).

### `controllers/diagramController.js` — 5 функций, по одной на каждый HTTP-метод
- `getAll` — `Diagram.findAll()` = `SELECT * FROM "Diagrams"`.
- `getById` — `Diagram.findByPk(id)` = поиск по первичному ключу; если `null` → `404`.
- `create` — `Diagram.create(req.body)` = `INSERT`; при `ValidationError` → `400` с текстом всех
  нарушенных правил (`err.errors.map(e => e.message).join(", ")`), при любой другой ошибке →
  `next(err)` → общий обработчик → `500`.
- `update` — сначала `findByPk` (чтобы отличить «нет записи» от «плохие данные»), потом
  `diagram.update(req.body)` = `UPDATE ... WHERE id = ...`.
- `remove` — `Diagram.destroy({ where: { id } })` = `DELETE`, возвращает число удалённых строк;
  `0` → `404`; иначе `204 No Content` без тела ответа.

Каждая функция обёрнута в `try/catch` — ошибки не роняют процесс, а идут в Express через
`next(err)`.

### `routes/diagramRoutes.js`, `middleware/errorHandler.js`, `app.js`
Не менялись со времён Lab 1 — это специально: снаружи API идентичен, поменялась только
реализация внутри контроллера.

### `server.js`
```js
sequelize.authenticate().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
```
Единственное реальное отличие от Lab 1: сервер сначала проверяет живое подключение к базе
(`authenticate()` — просто пинг, без запроса данных) и только потом начинает слушать порт.
Если база недоступна — сервер вообще не поднимется, вместо того чтобы упасть на первом запросе.

## 6. Скрипты `package.json` — что каждый делает

| Скрипт | Команда | Что делает |
|---|---|---|
| `npm start` | `node server.js` | обычный запуск сервера (для прод/разового прогона) |
| `npm run dev` | `nodemon server.js` | то же самое, но перезапускает сервер при каждом изменении файла — удобно во время разработки |
| `npm test` | `cross-env NODE_ENV=test jest --coverage --runInBand` | прогон тестов против SQLite-в-памяти, с отчётом покрытия, последовательно (не параллельно) |
| `npm run migrate` | `sequelize-cli db:migrate` | применяет все ещё не применённые миграции к реальной базе |
| `npm run seed` | `sequelize-cli db:seed:all` | наполняет таблицу тестовыми данными |

## 7. Ответы на контрольные вопросы

1. **ORM, плюсы/минусы** — раздел 3.
2. **Имена таблиц** — camelCase-модель → PascalCase множественное число по умолчанию; здесь
   явно закреплено `tableName: "Diagrams"`.
3. **WHERE-запрос** — `Diagram.findAll({ where: { notation: "bpmn" } })`; в коде тот же принцип
   виден в `destroy({ where: { id } })`.
4. **Миграции** — раздел 3 и 5.
5. **Один-ко-многим** — в `lab12` не реализовано (одна таблица), но по аналогии:
   `Diagram.hasMany(Comment)` + `Comment.belongsTo(Diagram, { foreignKey: "diagramId" })`.
6. **Пагинация** — `Diagram.findAll({ limit: 10, offset: 20 })`.
7. **Уникальность** — `SequelizeUniqueConstraintError` (подкласс `ValidationError`), ловится
   тем же `err instanceof ValidationError`.
8. **`findByPk` vs `findOne`** — `findByPk` ищет только по первичному ключу (быстрее, есть
   индекс гарантированно); `findOne` — по любому условию `where`.
9. **Кастомный метод** — статический через `Diagram.someMethod = function() {...}` или метод
   экземпляра через второй аргумент `sequelize.define`.
10. **Типы связей** — `belongsTo` / `hasMany` / `belongsToMany`.

## 8. Что нужно сделать тебе лично (я не могу за тебя)

- Завести Neon-проект и вписать `DATABASE_URL` в свой `.env`.
- Прогнать шаги 4–8 у себя и убедиться, что реально работает.
- Скриншоты для отчёта: структура БД (Neon dashboard), Postman-запросы с ответами, результат
  миграции (колонка `status` в таблице до/после).
- **Запушить**, если ещё не запушено (я не пушу сама): ветка `lab12` в оба репозитория.
