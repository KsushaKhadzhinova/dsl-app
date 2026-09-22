import { useState } from 'react';

export function DiagramForm({ initialValues, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [notation, setNotation] = useState(initialValues?.notation ?? '');
  const [dslContent, setDslContent] = useState(initialValues?.dslContent ?? '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title, notation, dslContent });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="diagram-form" onSubmit={handleSubmit}>
      <label>
        Название
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        Нотация
        <input
          type="text"
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          required
        />
      </label>
      <label>
        Содержимое DSL
        <textarea
          value={dslContent}
          onChange={(e) => setDslContent(e.target.value)}
          rows={8}
        />
      </label>
      {error && <p className="error-message">{error}</p>}
      <div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
