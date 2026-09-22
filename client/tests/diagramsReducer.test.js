import {
  DIAGRAMS_ACTIONS,
  createInitialDiagramsState,
  diagramsReducer,
} from '../src/context/diagramsReducer.js';

describe('diagramsReducer', () => {
  it('creates initial state with the given last-viewed id', () => {
    expect(createInitialDiagramsState('5')).toEqual({
      diagrams: [],
      loading: false,
      error: null,
      lastViewedId: '5',
    });
  });

  it('creates initial state with null last-viewed id when none given', () => {
    expect(createInitialDiagramsState(null).lastViewedId).toBeNull();
  });

  it('handles FETCH_START by setting loading and clearing error', () => {
    const state = { diagrams: [], loading: false, error: 'oops', lastViewedId: null };
    const next = diagramsReducer(state, { type: DIAGRAMS_ACTIONS.FETCH_START });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles FETCH_SUCCESS by storing diagrams and clearing loading', () => {
    const state = { diagrams: [], loading: true, error: null, lastViewedId: null };
    const diagrams = [{ id: 1, title: 'A' }];
    const next = diagramsReducer(state, {
      type: DIAGRAMS_ACTIONS.FETCH_SUCCESS,
      payload: diagrams,
    });
    expect(next.loading).toBe(false);
    expect(next.diagrams).toBe(diagrams);
  });

  it('handles FETCH_ERROR by storing the error and clearing loading', () => {
    const state = { diagrams: [], loading: true, error: null, lastViewedId: null };
    const next = diagramsReducer(state, {
      type: DIAGRAMS_ACTIONS.FETCH_ERROR,
      payload: 'Ошибка сети',
    });
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Ошибка сети');
  });

  it('handles ADD_DIAGRAM by appending to the list', () => {
    const state = { diagrams: [{ id: 1 }], loading: false, error: null, lastViewedId: null };
    const next = diagramsReducer(state, {
      type: DIAGRAMS_ACTIONS.ADD_DIAGRAM,
      payload: { id: 2 },
    });
    expect(next.diagrams).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('handles UPDATE_DIAGRAM by replacing the matching diagram', () => {
    const state = {
      diagrams: [{ id: 1, title: 'Old' }, { id: 2, title: 'Keep' }],
      loading: false,
      error: null,
      lastViewedId: null,
    };
    const next = diagramsReducer(state, {
      type: DIAGRAMS_ACTIONS.UPDATE_DIAGRAM,
      payload: { id: 1, title: 'New' },
    });
    expect(next.diagrams).toEqual([{ id: 1, title: 'New' }, { id: 2, title: 'Keep' }]);
  });

  it('handles REMOVE_DIAGRAM by filtering it out', () => {
    const state = {
      diagrams: [{ id: 1 }, { id: 2 }],
      loading: false,
      error: null,
      lastViewedId: null,
    };
    const next = diagramsReducer(state, {
      type: DIAGRAMS_ACTIONS.REMOVE_DIAGRAM,
      payload: 1,
    });
    expect(next.diagrams).toEqual([{ id: 2 }]);
  });

  it('handles SET_LAST_VIEWED_ID', () => {
    const state = { diagrams: [], loading: false, error: null, lastViewedId: null };
    const next = diagramsReducer(state, {
      type: DIAGRAMS_ACTIONS.SET_LAST_VIEWED_ID,
      payload: '7',
    });
    expect(next.lastViewedId).toBe('7');
  });

  it('returns the same state for an unknown action', () => {
    const state = { diagrams: [], loading: false, error: null, lastViewedId: null };
    expect(diagramsReducer(state, { type: 'UNKNOWN' })).toBe(state);
  });
});
