import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { createDiagram, deleteDiagram, listDiagrams, updateDiagram } from '../api/diagramsApi.js';
import { getToken } from '../auth/token.js';
import {
  DIAGRAMS_ACTIONS,
  createInitialDiagramsState,
  diagramsReducer,
} from './diagramsReducer.js';

const LAST_VIEWED_KEY = 'lastViewedDiagramId';

const DiagramsContext = createContext(null);

export function DiagramsProvider({ children }) {
  const [state, dispatch] = useReducer(
    diagramsReducer,
    localStorage.getItem(LAST_VIEWED_KEY),
    createInitialDiagramsState,
  );

  const refresh = useCallback(async () => {
    dispatch({ type: DIAGRAMS_ACTIONS.FETCH_START });
    try {
      const diagrams = await listDiagrams(getToken());
      dispatch({ type: DIAGRAMS_ACTIONS.FETCH_SUCCESS, payload: diagrams });
    } catch (err) {
      dispatch({ type: DIAGRAMS_ACTIONS.FETCH_ERROR, payload: err.message });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (state.lastViewedId === null) {
      localStorage.removeItem(LAST_VIEWED_KEY);
    } else {
      localStorage.setItem(LAST_VIEWED_KEY, state.lastViewedId);
    }
  }, [state.lastViewedId]);

  const addDiagram = useCallback(async (values) => {
    const diagram = await createDiagram(values, getToken());
    dispatch({ type: DIAGRAMS_ACTIONS.ADD_DIAGRAM, payload: diagram });
    return diagram;
  }, []);

  const editDiagram = useCallback(async (id, values) => {
    const diagram = await updateDiagram(id, values, getToken());
    dispatch({ type: DIAGRAMS_ACTIONS.UPDATE_DIAGRAM, payload: diagram });
    return diagram;
  }, []);

  const removeDiagram = useCallback(async (id) => {
    await deleteDiagram(id, getToken());
    dispatch({ type: DIAGRAMS_ACTIONS.REMOVE_DIAGRAM, payload: id });
  }, []);

  const setLastViewedId = useCallback((id) => {
    dispatch({ type: DIAGRAMS_ACTIONS.SET_LAST_VIEWED_ID, payload: id });
  }, []);

  const value = {
    diagrams: state.diagrams,
    loading: state.loading,
    error: state.error,
    lastViewedId: state.lastViewedId,
    refresh,
    addDiagram,
    editDiagram,
    removeDiagram,
    setLastViewedId,
  };

  return <DiagramsContext.Provider value={value}>{children}</DiagramsContext.Provider>;
}

export function useDiagrams() {
  const context = useContext(DiagramsContext);
  if (!context) {
    throw new Error('useDiagrams must be used within a DiagramsProvider');
  }
  return context;
}
