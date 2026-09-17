export const NOTATION_TEMPLATES = [
  {
    key: 'uml.class',
    label: 'UML',
    color: '#5b8def',
    enabled: false,
    template: '',
  },
  {
    key: 'bpmn.process',
    label: 'BPMN',
    color: '#d9a441',
    enabled: true,
    template:
      'diagram bpmn.process "Новый процесс" {\n' +
      '  start_event s1 "Начало"\n' +
      '  task t1 "Выполнить задачу"\n' +
      '  end_event e1 "Конец"\n' +
      '  s1 -> t1 -> e1\n' +
      '}\n',
  },
  {
    key: 'erd.crows_foot.logical',
    label: 'ERD',
    color: '#4caf7d',
    enabled: true,
    template:
      'diagram erd.crows_foot.logical "Новая ERD-диаграмма" {\n' +
      '  entity customer "Клиент" pk=id\n' +
      '  entity order "Заказ" pk=id\n' +
      '  customer -> order\n' +
      '}\n',
  },
  {
    key: 'petri',
    label: 'Petri Nets',
    color: '#e2564c',
    enabled: false,
    template: '',
  },
  {
    key: 'idef0',
    label: 'IDEF0',
    color: '#b8a9d9',
    enabled: false,
    template: '',
  },
  {
    key: 'dfd',
    label: 'DFD',
    color: '#7dd3d8',
    enabled: false,
    template: '',
  },
  {
    key: 'none',
    label: 'None',
    color: '#6d6d70',
    enabled: true,
    template: '',
  },
];

export const DEFAULT_NOTATION_KEY = 'erd.crows_foot.logical';

export function findTemplate(key) {
  return NOTATION_TEMPLATES.find((tpl) => tpl.key === key) || null;
}
