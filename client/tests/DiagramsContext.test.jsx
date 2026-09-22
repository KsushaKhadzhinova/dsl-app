import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagramsProvider, useDiagrams } from '../src/context/DiagramsContext.jsx';

function Consumer() {
  const { diagrams, loading, error, addDiagram, removeDiagram, setLastViewedId, lastViewedId } =
    useDiagrams();
  return (
    <div>
      {loading && <span>loading</span>}
      {error && <span>error: {error}</span>}
      <span>count: {diagrams.length}</span>
      <span>lastViewed: {String(lastViewedId)}</span>
      <button onClick={() => addDiagram({ title: 'New', notation: 'uml', dslContent: '' })}>
        add
      </button>
      <button onClick={() => removeDiagram(diagrams[0]?.id)}>remove</button>
      <button onClick={() => setLastViewedId('9')}>set-last-viewed</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

test('loads diagrams on mount and exposes them once fetch resolves', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify([{ id: 1, title: 'Diagram 1' }]),
  });

  render(
    <DiagramsProvider>
      <Consumer />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/diagrams'),
    expect.objectContaining({ method: 'GET' }),
  );
});

test('stores a fetch error message when the initial load fails', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    text: async () => JSON.stringify({ error: 'Ошибка сервера' }),
  });

  render(
    <DiagramsProvider>
      <Consumer />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText('error: Ошибка сервера')).toBeInTheDocument());
});

test('addDiagram dispatches ADD_DIAGRAM after a successful create call', async () => {
  const user = userEvent.setup();
  global.fetch
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify([]) })
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ id: 2, title: 'New' }) });

  render(
    <DiagramsProvider>
      <Consumer />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText('count: 0')).toBeInTheDocument());
  await user.click(screen.getByText('add'));
  await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());
});

test('setLastViewedId updates state and persists to localStorage', async () => {
  const user = userEvent.setup();
  global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify([]) });

  render(
    <DiagramsProvider>
      <Consumer />
    </DiagramsProvider>,
  );

  await waitFor(() => expect(screen.getByText('count: 0')).toBeInTheDocument());
  await user.click(screen.getByText('set-last-viewed'));
  expect(screen.getByText('lastViewed: 9')).toBeInTheDocument();
  expect(localStorage.getItem('lastViewedDiagramId')).toBe('9');
});
