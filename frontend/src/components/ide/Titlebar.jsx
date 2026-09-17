import { useRef, useState } from 'react';
import { BrandLogo } from '../shared/BrandLogo.jsx';

export function Titlebar({
  t,
  theme,
  onToggleTheme,
  notationKey,
  onNotationChange,
  enabledTemplates,
  title,
  onTitleChange,
  onRun,
  onSave,
  onExport,
  onImportFile,
  running,
  saving,
  canExport,
  userInitials,
  onLogout,
}) {
  const importInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleImportClick() {
    importInputRef.current?.click();
  }

  function handleImportChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      onImportFile(file);
    }
    event.target.value = '';
  }

  return (
    <div className="titlebar">
      <div className="brand">
        <BrandLogo size={18} />
        DiagramCode
      </div>
      <div className="selectors">
        <div className="dd">
          {t('engineLabel')}: <b>Graphviz</b>
        </div>
        <div className="dd">
          {t('notationLabel')}:{' '}
          <select value={notationKey} onChange={(event) => onNotationChange(event.target.value)}>
            {enabledTemplates.map((tpl) => (
              <option key={tpl.key} value={tpl.key}>
                {tpl.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="filepath">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        workspace / diagrams /
        <input value={title} onChange={(event) => onTitleChange(event.target.value)} aria-label="file-title" />
      </div>
      <div className="actions">
        <button type="button" className="btn btn-run" onClick={onRun} disabled={running}>
          {t('run')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onSave} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onExport} disabled={!canExport}>
          {t('export')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleImportClick}>
          {t('import')}
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".dsl,.txt"
          style={{ display: 'none' }}
          onChange={handleImportChange}
          aria-label="import-file"
        />
        <div className="btn btn-ai" title={t('soon')}>
          {t('ai')}
        </div>
        <button type="button" className="btn btn-ghost" style={{ width: 28, padding: 0, justifyContent: 'center' }} title={t('soon')} disabled>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: 28, padding: 0, justifyContent: 'center' }}
          onClick={onToggleTheme}
          aria-label="toggle-theme"
        >
          {theme === 'dark' ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5l-1.4 1.4M6.9 17.1L5.5 18.5m0-13l1.4 1.4M17.1 17.1l1.4 1.4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          )}
        </button>
        <div className="avatar" onClick={() => setMenuOpen((open) => !open)}>
          {userInitials}
          {menuOpen ? (
            <div className="avatar-menu">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                {t('logout')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
