import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/ide/Sidebar.jsx';
import { NOTATION_TEMPLATES } from '../src/dsl/notations.js';
import { STRINGS } from '../src/i18n/strings.js';

const t = (key) => STRINGS.ru[key] ?? key;

function renderSidebar(overrides = {}) {
  const props = {
    templates: NOTATION_TEMPLATES,
    templatesFilter: '',
    onTemplatesFilterChange: jest.fn(),
    selectedTemplateKey: 'erd.crows_foot.logical',
    onSelectTemplate: jest.fn(),
    onInsertTemplate: jest.fn(),
    files: [
      { id: 'd1', title: 'process' },
      { id: 'd2', title: 'architecture' },
    ],
    filesFilter: '',
    onFilesFilterChange: jest.fn(),
    onSelectFile: jest.fn(),
    activeDiagramId: 'd1',
    t,
    ...overrides,
  };
  render(<Sidebar {...props} />);
  return props;
}

test('renders every notation template from the mockup and disables the unimplemented ones', () => {
  renderSidebar();
  expect(screen.getByText('UML')).toBeInTheDocument();
  expect(screen.getByText('BPMN')).toBeInTheDocument();
  expect(screen.getByText('ERD')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'UML' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'BPMN' })).not.toBeDisabled();
  expect(screen.getByRole('button', { name: 'ERD' })).not.toBeDisabled();
});

test('filters templates by the search box', () => {
  renderSidebar();
  fireEvent.change(screen.getByPlaceholderText('Найти шаблон...'), { target: { value: 'erd' } });
  expect(screen.queryByText('ERD')).toBeInTheDocument();
});

test('insert button is disabled until an enabled template is selected', () => {
  renderSidebar({ selectedTemplateKey: 'uml.class' });
  expect(screen.getByText('Вставить шаблон')).toBeDisabled();
});

test('insert button calls the handler for an enabled template', () => {
  const onInsertTemplate = jest.fn();
  renderSidebar({ onInsertTemplate });
  fireEvent.click(screen.getByText('Вставить шаблон'));
  expect(onInsertTemplate).toHaveBeenCalledTimes(1);
});

test('lists real files and highlights the active one', () => {
  renderSidebar();
  const activeFile = screen.getByRole('button', { name: '📄 process.dsl' });
  expect(activeFile).toHaveClass('active');
});

test('filters files by the files search box', () => {
  const onFilesFilterChange = jest.fn();
  renderSidebar({ onFilesFilterChange });
  fireEvent.change(screen.getByPlaceholderText('Поиск файлов...'), { target: { value: 'proc' } });
  expect(onFilesFilterChange).toHaveBeenCalledWith('proc');
});

test('selecting a file calls onSelectFile', () => {
  const onSelectFile = jest.fn();
  renderSidebar({ onSelectFile });
  fireEvent.click(screen.getByRole('button', { name: '📄 architecture.dsl' }));
  expect(onSelectFile).toHaveBeenCalledWith({ id: 'd2', title: 'architecture' });
});

test('shows a placeholder message when there are no files', () => {
  renderSidebar({ files: [] });
  expect(screen.getByText('Пока нет сохранённых файлов')).toBeInTheDocument();
});
