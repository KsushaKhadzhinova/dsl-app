import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { IdePage } from '../src/pages/IdePage.jsx';
import { AuthProvider } from '../src/auth/AuthContext.jsx';
import { ThemeProvider } from '../src/theme/ThemeContext.jsx';
import { LocaleProvider } from '../src/i18n/LocaleContext.jsx';
import * as diagramsApi from '../src/api/diagramsApi.js';
import { ApiError } from '../src/api/client.js';

jest.mock('../src/api/diagramsApi.js');

function renderIdePage() {
  window.localStorage.setItem('diagramcode.token', 'test-token');
  return render(
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/login" element={<div>Login page</div>} />
              <Route path="/" element={<IdePage />} />
            </Routes>
          </MemoryRouter>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  diagramsApi.listDiagrams.mockResolvedValue([]);
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
});

test('loads the default ERD template and lists saved files on mount', async () => {
  diagramsApi.listDiagrams.mockResolvedValue([{ id: 'd1', title: 'process', notation: 'erd.crows_foot.logical' }]);
  renderIdePage();

  expect(screen.getByTestId('mock-monaco-editor').value).toEqual(
    expect.stringContaining('diagram erd.crows_foot.logical'),
  );
  expect(await screen.findByText('📄 process.dsl')).toBeInTheDocument();
});

test('Run renders the returned svg and logs success with no issues', async () => {
  diagramsApi.renderDsl.mockResolvedValue({ svg: '<svg data-testid="rendered"></svg>', issues: [] });
  renderIdePage();

  fireEvent.click(screen.getByText('Run'));

  expect(await screen.findByTestId('rendered')).toBeInTheDocument();
  expect(diagramsApi.renderDsl).toHaveBeenCalledWith(expect.stringContaining('diagram erd'), 'test-token');
  expect(screen.getByText('Synced')).toBeInTheDocument();
});

test('Run surfaces validation errors in the Problems tab and shows an error toast', async () => {
  diagramsApi.renderDsl.mockResolvedValue({
    svg: '',
    issues: [{ severity: 'error', message: 'Недопустимый тип узла', node_id: 'n1' }],
  });
  renderIdePage();

  fireEvent.click(screen.getByText('Run'));

  expect(await screen.findByText('Недопустимый тип узла')).toBeInTheDocument();
  expect(screen.getByText(/error\(s\) found/)).toBeInTheDocument();
});

test('Run shows a network error toast when the backend is unreachable', async () => {
  diagramsApi.renderDsl.mockRejectedValue(new ApiError('Не удалось соединиться с сервером.', 0, null));
  renderIdePage();

  fireEvent.click(screen.getByText('Run'));

  expect(await screen.findByText('Не удалось соединиться с сервером.')).toBeInTheDocument();
});

test('Save creates a diagram then a version on first save, and enables Export', async () => {
  diagramsApi.createDiagram.mockResolvedValue({ id: 'new-diagram-id' });
  diagramsApi.saveVersion.mockResolvedValue({ id: 'commit-1', author: 'user', message: '', created_at: '2026-01-01T00:00:00Z' });
  renderIdePage();

  expect(screen.getByText('Export')).toBeDisabled();
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => expect(screen.getByText('Export')).not.toBeDisabled());
  expect(diagramsApi.createDiagram).toHaveBeenCalledWith('Untitled', 'erd.crows_foot.logical', 'test-token');
  expect(diagramsApi.saveVersion).toHaveBeenCalledWith('new-diagram-id', expect.any(String), '', 'test-token');
  expect(screen.getByText('Synced')).toBeInTheDocument();
});

test('Save failure shows the sync error state and an error toast', async () => {
  diagramsApi.createDiagram.mockRejectedValue(new ApiError('Ошибка сервера.', 500, null));
  renderIdePage();

  fireEvent.click(screen.getByText('Save'));

  expect(await screen.findByText('Ошибка сохранения')).toBeInTheDocument();
  expect(screen.getByText('Ошибка сервера.')).toBeInTheDocument();
});

test('an expired token (401) logs the user out and redirects to /login', async () => {
  diagramsApi.renderDsl.mockRejectedValue(new ApiError('Недействительный токен.', 401, null));
  renderIdePage();

  fireEvent.click(screen.getByText('Run'));

  expect(await screen.findByText('Login page')).toBeInTheDocument();
  expect(window.localStorage.getItem('diagramcode.token')).toBeNull();
});

test('Export downloads the file returned by the backend once a diagram exists', async () => {
  diagramsApi.createDiagram.mockResolvedValue({ id: 'new-diagram-id' });
  diagramsApi.saveVersion.mockResolvedValue({ id: 'commit-1', author: 'user', created_at: '2026-01-01T00:00:00Z' });
  diagramsApi.exportDiagram.mockResolvedValue({ filename: 'process.dsl', content: 'diagram erd.crows_foot.logical "x" {}' });
  renderIdePage();

  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(screen.getByText('Export')).not.toBeDisabled());

  fireEvent.click(screen.getByText('Export'));

  await waitFor(() => expect(diagramsApi.exportDiagram).toHaveBeenCalledWith('new-diagram-id', 'test-token'));
});

test('selecting a saved file loads its content into the editor', async () => {
  diagramsApi.listDiagrams.mockResolvedValue([{ id: 'd1', title: 'process', notation: 'bpmn.process' }]);
  diagramsApi.getDiagram.mockResolvedValue({
    id: 'd1',
    title: 'process',
    notation: 'bpmn.process',
    current_dsl_content: 'diagram bpmn.process "Loaded" {}',
  });
  renderIdePage();

  fireEvent.click(await screen.findByText('📄 process.dsl'));

  await waitFor(() => expect(screen.getByTestId('mock-monaco-editor')).toHaveValue('diagram bpmn.process "Loaded" {}'));
});

test('inserting the BPMN template replaces the editor content and resets the diagram id', async () => {
  renderIdePage();

  fireEvent.click(screen.getByRole('button', { name: 'BPMN' }));
  fireEvent.click(screen.getByText('Вставить шаблон'));

  expect(screen.getByTestId('mock-monaco-editor').value).toEqual(expect.stringContaining('diagram bpmn.process'));
  expect(screen.getByText('Export')).toBeDisabled();
});

test('editing the code marks the diagram as unsaved', () => {
  renderIdePage();
  expect(screen.getByText('Synced')).toBeInTheDocument();

  fireEvent.change(screen.getByTestId('mock-monaco-editor'), { target: { value: 'diagram erd.crows_foot.logical "x" {}' } });

  expect(screen.getByText('Не сохранено')).toBeInTheDocument();
});

test('importing a local file replaces the editor content and clears the diagram id', async () => {
  diagramsApi.createDiagram.mockResolvedValue({ id: 'new-diagram-id' });
  diagramsApi.saveVersion.mockResolvedValue({ id: 'commit-1', author: 'user' });
  renderIdePage();

  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(screen.getByText('Export')).not.toBeDisabled());

  const file = new File(['diagram bpmn.process "Imported" {}'], 'imported.dsl', { type: 'text/plain' });
  fireEvent.change(screen.getByLabelText('import-file'), { target: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByTestId('mock-monaco-editor')).toHaveValue('diagram bpmn.process "Imported" {}'),
  );
  expect(screen.getByText('Export')).toBeDisabled();
});

test('export stays disabled and unreachable until a diagram has been saved', () => {
  renderIdePage();
  expect(screen.getByText('Export')).toBeDisabled();
  fireEvent.click(screen.getByText('Export'));
  expect(diagramsApi.exportDiagram).not.toHaveBeenCalled();
});

test('a second save reuses the existing diagram id instead of creating a new diagram', async () => {
  diagramsApi.createDiagram.mockResolvedValue({ id: 'new-diagram-id' });
  diagramsApi.saveVersion.mockResolvedValue({ id: 'commit-1', author: 'user' });
  renderIdePage();

  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(screen.getByText('Export')).not.toBeDisabled());
  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(diagramsApi.saveVersion).toHaveBeenCalledTimes(2));

  expect(diagramsApi.createDiagram).toHaveBeenCalledTimes(1);
});

test('a saveVersion failure after the diagram already exists shows the error state', async () => {
  diagramsApi.createDiagram.mockResolvedValue({ id: 'new-diagram-id' });
  diagramsApi.saveVersion
    .mockResolvedValueOnce({ id: 'commit-1', author: 'user' })
    .mockRejectedValueOnce(new ApiError('Диаграмма не найдена.', 404, null));
  renderIdePage();

  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(screen.getByText('Export')).not.toBeDisabled());

  fireEvent.click(screen.getByText('Save'));

  expect(await screen.findByText('Ошибка сохранения')).toBeInTheDocument();
  expect(diagramsApi.createDiagram).toHaveBeenCalledTimes(1);
});

test('selecting a file that fails to load shows an error toast', async () => {
  diagramsApi.listDiagrams.mockResolvedValue([{ id: 'd1', title: 'process', notation: 'erd.crows_foot.logical' }]);
  diagramsApi.getDiagram.mockRejectedValue(new ApiError('Диаграмма не найдена.', 404, null));
  renderIdePage();

  fireEvent.click(await screen.findByText('📄 process.dsl'));

  expect(await screen.findByText('Диаграмма не найдена.')).toBeInTheDocument();
});

test('the zoom toolbar changes the displayed percentage within its bounds', () => {
  renderIdePage();
  expect(screen.getByText('100%')).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('zoom-in'));
  expect(screen.getByText('110%')).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('zoom-out'));
  fireEvent.click(screen.getByLabelText('zoom-out'));
  expect(screen.getByText('90%')).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('zoom-fit'));
  expect(screen.getByText('100%')).toBeInTheDocument();
});

test('logging out via the avatar menu clears the token and redirects to /login', async () => {
  renderIdePage();
  fireEvent.click(screen.getByText('ДК'));
  fireEvent.click(screen.getByText('Выйти'));

  expect(await screen.findByText('Login page')).toBeInTheDocument();
  expect(window.localStorage.getItem('diagramcode.token')).toBeNull();
});
