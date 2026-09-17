export function Toast({ toast }) {
  if (!toast) {
    return null;
  }
  return (
    <div className={`toast${toast.type !== 'ok' ? ` ${toast.type}` : ''}`}>
      <span>{toast.label}</span>
      <div>{toast.message}</div>
    </div>
  );
}
