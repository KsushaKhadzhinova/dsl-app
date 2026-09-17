export function Sidebar({
  templates,
  templatesFilter,
  onTemplatesFilterChange,
  selectedTemplateKey,
  onSelectTemplate,
  onInsertTemplate,
  files,
  filesFilter,
  onFilesFilterChange,
  onSelectFile,
  activeDiagramId,
  t,
}) {
  const visibleTemplates = templates.filter((tpl) =>
    tpl.label.toLowerCase().includes(templatesFilter.trim().toLowerCase()),
  );
  const visibleFiles = files.filter((file) =>
    file.title.toLowerCase().includes(filesFilter.trim().toLowerCase()),
  );
  const selectedTemplate = templates.find((tpl) => tpl.key === selectedTemplateKey);

  return (
    <div className="sidebar">
      <div className="sb-head">{t('templatesHeader')}</div>
      <div className="sb-search">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <input
          value={templatesFilter}
          onChange={(event) => onTemplatesFilterChange(event.target.value)}
          placeholder={t('searchTemplatePlaceholder')}
          aria-label={t('searchTemplatePlaceholder')}
        />
      </div>
      {visibleTemplates.map((tpl) => (
        <button
          type="button"
          key={tpl.key}
          className={`tpl-item${selectedTemplateKey === tpl.key ? ' active' : ''}`}
          disabled={!tpl.enabled}
          title={tpl.enabled ? tpl.label : `${tpl.label} — ${t('soon')}`}
          onClick={() => onSelectTemplate(tpl.key)}
        >
          <span className="tpl-dot" style={{ background: tpl.color }} />
          {tpl.label}
        </button>
      ))}
      <button
        type="button"
        className="insert-btn"
        disabled={!selectedTemplate || !selectedTemplate.enabled}
        onClick={onInsertTemplate}
      >
        {t('insertTemplate')}
      </button>

      <div className="sb-head">{t('filesHeader')}</div>
      <div className="sb-search">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <input
          value={filesFilter}
          onChange={(event) => onFilesFilterChange(event.target.value)}
          placeholder={t('searchFilesPlaceholder')}
          aria-label={t('searchFilesPlaceholder')}
        />
      </div>
      {visibleFiles.length === 0 ? (
        <div className="tpl-item">{t('noFiles')}</div>
      ) : (
        visibleFiles.map((file) => (
          <button
            type="button"
            key={file.id}
            className={`tpl-item${activeDiagramId === file.id ? ' active' : ''}`}
            onClick={() => onSelectFile(file)}
          >
            📄 {file.title}.dsl
          </button>
        ))
      )}
    </div>
  );
}
