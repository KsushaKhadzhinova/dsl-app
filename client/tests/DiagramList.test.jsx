import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagramList } from '../src/components/DiagramList.jsx';
import { DiagramsProvider } from '../src/context/DiagramsContext.jsx';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

test('renders loading, then the fetched diagrams', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    text: async () =>
      JSON.stringify([
        { id: 1, title: 'Order flow', notation: 'bpmn' },
        { id: 2, title: 'State chart', notation: 'uml' },
      ]),
  });

  render(
    <DiagramsProvider>
      <DiagramList onSelect={() => {}} onCreate={() => {}} />
    </DiagramsProvider>,
  );

  expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/Order flow/)).toBeInTheDocument());
  expect(screen.getByText(/State chart/)).toBeInTheDocument();
});

test('shows an empty-state message when there are no diagrams', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify([]) });

  render(
    <DiagramsProvider>
      <DiagramList onSelect={() => {}} onCreate={() => {}} />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText('Диаграмм пока нет')).toBeInTheDocument());
});

test('calls onSelect with the diagram id when a diagram is clicked', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  global.fetch.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify([{ id: 42, title: 'Order flow', notation: 'bpmn' }]),
  });

  render(
    <DiagramsProvider>
      <DiagramList onSelect={onSelect} onCreate={() => {}} />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText(/Order flow/)).toBeInTheDocument());
  await user.click(screen.getByText(/Order flow/));
  expect(onSelect).toHaveBeenCalledWith(42);
});

test('calls onCreate when the "new diagram" button is clicked', async () => {
  const user = userEvent.setup();
  const onCreate = jest.fn();
  global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify([]) });

  render(
    <DiagramsProvider>
      <DiagramList onSelect={() => {}} onCreate={onCreate} />
    </DiagramsProvider>,
  );

  await user.click(screen.getByText('Новая диаграмма'));
  expect(onCreate).toHaveBeenCalled();
});

test('removes a diagram from the list after a successful delete', async () => {
  const user = userEvent.setup();
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([{ id: 1, title: 'Order flow', notation: 'bpmn' }]),
    })
    .mockResolvedValueOnce({ ok: true, text: async () => '' });

  render(
    <DiagramsProvider>
      <DiagramList onSelect={() => {}} onCreate={() => {}} />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText(/Order flow/)).toBeInTheDocument());
  await user.click(screen.getByText('Удалить'));
  await waitFor(() => expect(screen.getByText('Диаграмм пока нет')).toBeInTheDocument());
});
