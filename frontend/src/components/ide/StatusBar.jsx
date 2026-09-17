export function StatusBar({ syncStatus, notationLabel, cursorPosition, locale, onToggleLocale, t }) {
  const syncLabel =
    syncStatus === 'error' ? t('saveErrorStatus') : syncStatus === 'unsaved' ? t('notSaved') : t('synced');

  return (
    <div className="statusbar">
      <div className="grp">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12a8 8 0 0113.6-5.7M20 12a8 8 0 01-13.6 5.7M4 4v5h5M20 20v-5h-5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        {syncLabel}
      </div>
      <div className="grp">{notationLabel}</div>
      <div className="spacer" />
      <div className="grp">
        {t('ln')} {cursorPosition.line}, {t('col')} {cursorPosition.column}
      </div>
      <div className="grp">{t('spaces')}: 2</div>
      <div className="grp">{t('encoding')}</div>
      <div className="grp">
        <button type="button" onClick={onToggleLocale} aria-label="toggle-locale">
          {t('langButton')}
        </button>
      </div>
    </div>
  );
}
