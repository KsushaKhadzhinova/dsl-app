import { render, screen, fireEvent } from '@testing-library/react';
import { Titlebar } from '../src/components/ide/Titlebar.jsx';
import { NOTATION_TEMPLATES } from '../src/dsl/notations.js';
import { STRINGS } from '../src/i18n/strings.js';

const t = (key) => STRINGS.ru[key] ?? key;
const enabledTemplates = NOTATION_TEMPLATES.filter((tpl) => tpl.enabled && tpl.key !== 'none');

function renderTitlebar(overrides = {}) {
  const props = {
    t,
    theme: 'dark',
    onToggleTheme: jest.fn(),
    notationKey: 'erd.crows_foot.logical',
    onNotationChange: jest.fn(),
    enabledTemplates,
    title: 'Untitled.dsl',
    onTitleChange: jest.fn(),
    onRun: jest.fn(),
    onSave: jest.fn(),
    onExport: jest.fn(),
    onImportFile: jest.fn(),
    running: false,
    saving: false,
    canExport: false,
    userInitials: 'КХ',
    onLogout: jest.fn(),
    ...overrides,
  };
  render(<Titlebar {...props} />);
  return props;
}

test('run and save buttons call their handlers', () => {
  const onRun = jest.fn();
  const onSave = jest.fn();
  renderTitlebar({ onRun, onSave });
  fireEvent.click(screen.getByText('Run'));
  fireEvent.click(screen.getByText('Save'));
  expect(onRun).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledTimes(1);
});

test('export is disabled until the diagram has been saved once', () => {
  renderTitlebar({ canExport: false });
  expect(screen.getByText('Export')).toBeDisabled();
});

test('export is enabled and callable once a diagram id exists', () => {
  const onExport = jest.fn();
  renderTitlebar({ canExport: true, onExport });
  fireEvent.click(screen.getByText('Export'));
  expect(onExport).toHaveBeenCalledTimes(1);
});

test('changing the notation dropdown calls the handler', () => {
  const onNotationChange = jest.fn();
  renderTitlebar({ onNotationChange });
  fireEvent.change(screen.getByDisplayValue('ERD'), { target: { value: 'bpmn.process' } });
  expect(onNotationChange).toHaveBeenCalledWith('bpmn.process');
});

test('editing the title input calls onTitleChange', () => {
  const onTitleChange = jest.fn();
  renderTitlebar({ onTitleChange });
  fireEvent.change(screen.getByLabelText('file-title'), { target: { value: 'process.dsl' } });
  expect(onTitleChange).toHaveBeenCalledWith('process.dsl');
});

test('theme toggle button calls the handler', () => {
  const onToggleTheme = jest.fn();
  renderTitlebar({ onToggleTheme });
  fireEvent.click(screen.getByLabelText('toggle-theme'));
  expect(onToggleTheme).toHaveBeenCalledTimes(1);
});

test('clicking the avatar opens a menu with a working logout action', () => {
  const onLogout = jest.fn();
  renderTitlebar({ onLogout });
  expect(screen.queryByText('Выйти')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('КХ'));
  const logoutButton = screen.getByText('Выйти');
  expect(logoutButton).toBeInTheDocument();

  fireEvent.click(logoutButton);
  expect(onLogout).toHaveBeenCalledTimes(1);
});

test('importing a file reads it and forwards it to onImportFile', () => {
  const onImportFile = jest.fn();
  renderTitlebar({ onImportFile });
  const file = new File(['diagram erd.crows_foot.logical "x" {}'], 'process.dsl', { type: 'text/plain' });
  fireEvent.change(screen.getByLabelText('import-file'), { target: { files: [file] } });
  expect(onImportFile).toHaveBeenCalledWith(file);
});

test('run and save buttons reflect pending state', () => {
  renderTitlebar({ running: true, saving: true });
  expect(screen.getByText('Run')).toBeDisabled();
  expect(screen.getByText('Сохранение...')).toBeDisabled();
});
