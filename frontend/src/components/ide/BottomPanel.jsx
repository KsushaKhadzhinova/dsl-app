export function BottomPanel({ activeTab, onSelectTab, terminalLines, issues, t }) {
  return (
    <div className="bottom-panel">
      <div className="bp-tabs">
        <button
          type="button"
          className={`bp-tab${activeTab === 'terminal' ? ' active' : ''}`}
          onClick={() => onSelectTab('terminal')}
        >
          {t('terminalTab')}
        </button>
        <button
          type="button"
          className={`bp-tab${activeTab === 'problems' ? ' active' : ''}`}
          onClick={() => onSelectTab('problems')}
        >
          {t('problemsTab')} {issues.length > 0 ? `(${issues.length})` : ''}
        </button>
      </div>
      <div className="bp-body">
        {activeTab === 'terminal' ? (
          terminalLines.length === 0 ? (
            <div>&gt; _</div>
          ) : (
            terminalLines.map((line) => (
              <div key={line.id} className={line.kind}>
                {line.text}
              </div>
            ))
          )
        ) : issues.length === 0 ? (
          <div className="ok">{t('noIssues')}</div>
        ) : (
          issues.map((issue, index) => (
            <div className="issue-row" key={`${issue.severity}-${index}`}>
              <span className={issue.severity === 'error' ? 'err' : 'warn'}>
                {issue.severity === 'error' ? '✗' : '⚠'}
              </span>
              <span>{issue.message}</span>
              {issue.node_id ? <span>[{issue.node_id}]</span> : null}
              {issue.edge_id ? <span>[{issue.edge_id}]</span> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
