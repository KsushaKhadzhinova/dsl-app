export const navItems = [
  { label: 'Возможности', href: '#features' },
  { label: 'Нотации', href: '#notations' },
  { label: 'О проекте', href: '#about' },
];

export const hero = {
  title: 'Диаграммы как код',
  subtitle:
    'Пишешь текстовое описание на собственном DSL — получаешь визуальную диаграмму: ' +
    'UML, BPMN, ERD, сети Петри, IDEF0/IDEF3, DFD. С версионированием, ИИ-генерацией ' +
    'и сохранением в GitHub, Google Drive или локально.',
};

export const features = [
  {
    id: 'editor',
    title: 'Редактор в стиле VS Code',
    text: 'Подсветка синтаксиса собственного DSL, автодополнение, проверка ошибок в реальном времени.',
  },
  {
    id: 'renderer',
    title: 'Рендер в стиле draw.io',
    text: 'Визуальный холст с масштабированием, экспортом в SVG/PNG и в форматы самих нотаций.',
  },
  {
    id: 'ai',
    title: 'Генерация диаграмм ИИ',
    text: 'Описание задачи текстом или изображение макета — на выходе готовый DSL-код диаграммы.',
  },
  {
    id: 'history',
    title: 'История версий',
    text: 'Git-подобное версионирование: коммиты, дифф между версиями, откат к прошлым состояниям.',
  },
  {
    id: 'notations',
    title: 'Несколько нотаций',
    text: 'UML, BPMN, ERD, сети Петри, IDEF0, IDEF3, DFD — одна и та же диаграмма разными языками описания.',
  },
];

export const notations = ['UML', 'BPMN', 'ERD', 'Сети Петри', 'IDEF0', 'IDEF3', 'DFD', 'Без нотации'];

export const repoStats = {
  stars: 5,
  forks: 2,
  openIssues: 1,
  updatedAt: '15.01.2026',
};

export const organization = {
  name: 'DiagramCode',
  description:
    'Учебный и портфолио-проект: веб-сервис для описания и визуализации диаграмм ' +
    'на собственном предметно-ориентированном языке (DSL), с поддержкой нескольких ' +
    'нотаций, историей версий и интеграциями с внешними хранилищами.',
  url: 'https://github.com/KsushaKhadzhinova/dsl-app',
};

export const author = {
  name: 'Ксения Хаджинова',
  jobTitle: 'Студентка, разработчик',
  affiliation: 'БГУИР',
  sameAs: 'https://github.com/KsushaKhadzhinova',
};

export const footer = {
  year: 2026,
  repoUrl: 'https://github.com/KsushaKhadzhinova/dsl-app',
};
