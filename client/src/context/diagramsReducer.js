export const DIAGRAMS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  ADD_DIAGRAM: 'ADD_DIAGRAM',
  UPDATE_DIAGRAM: 'UPDATE_DIAGRAM',
  REMOVE_DIAGRAM: 'REMOVE_DIAGRAM',
  SET_LAST_VIEWED_ID: 'SET_LAST_VIEWED_ID',
};

export function createInitialDiagramsState(lastViewedId) {
  return {
    diagrams: [],
    loading: false,
    error: null,
    lastViewedId: lastViewedId ?? null,
  };
}

export function diagramsReducer(state, action) {
  switch (action.type) {
    case DIAGRAMS_ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case DIAGRAMS_ACTIONS.FETCH_SUCCESS:
      return { ...state, loading: false, diagrams: action.payload };
    case DIAGRAMS_ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case DIAGRAMS_ACTIONS.ADD_DIAGRAM:
      return { ...state, diagrams: [...state.diagrams, action.payload] };
    case DIAGRAMS_ACTIONS.UPDATE_DIAGRAM:
      return {
        ...state,
        diagrams: state.diagrams.map((d) =>
          d.id === action.payload.id ? action.payload : d,
        ),
      };
    case DIAGRAMS_ACTIONS.REMOVE_DIAGRAM:
      return {
        ...state,
        diagrams: state.diagrams.filter((d) => d.id !== action.payload),
      };
    case DIAGRAMS_ACTIONS.SET_LAST_VIEWED_ID:
      return { ...state, lastViewedId: action.payload };
    default:
      return state;
  }
}
