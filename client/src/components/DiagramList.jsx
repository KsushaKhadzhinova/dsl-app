import { useDiagrams } from '../context/DiagramsContext.jsx';

export function DiagramList({ onSelect, onCreate }) {
  const { diagrams, loading, error, removeDiagram } = useDiagrams();

  async function handleDelete(id) {
    await removeDiagram(id);
  }

  return (
    <div>
      <button type="button" onClick={onCreate}>
        Новая диаграмма
      </button>
      {loading && <p className="loading-message">Загрузка...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && diagrams.length === 0 && <p>Диаграмм пока нет</p>}
      <ul className="diagram-list">
        {diagrams.map((diagram) => (
          <li key={diagram.id}>
            <span onClick={() => onSelect(diagram.id)} role="button" tabIndex={0}>
              {diagram.title} ({diagram.notation})
            </span>
            <button type="button" onClick={() => handleDelete(diagram.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
