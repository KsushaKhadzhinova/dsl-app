import { useEffect } from 'react';
import { useDiagrams } from '../context/DiagramsContext.jsx';

export function DiagramDetail({ id, onEdit, onBack }) {
  const { diagrams, loading, error, setLastViewedId } = useDiagrams();
  const diagram = diagrams.find((d) => d.id === id);

  useEffect(() => {
    setLastViewedId(id);
  }, [id, setLastViewedId]);

  if (loading) {
    return <p className="loading-message">Загрузка...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!diagram) {
    return <p>Диаграмма не найдена</p>;
  }

  return (
    <div>
      <h2>{diagram.title}</h2>
      <p>Нотация: {diagram.notation}</p>
      <p>Статус: {diagram.status}</p>
      <pre>{diagram.dslContent}</pre>
      <button type="button" onClick={() => onEdit(diagram.id)}>
        Редактировать
      </button>
      <button type="button" onClick={onBack}>
        Назад
      </button>
    </div>
  );
}
