export function ActivityBar({ soonLabel }) {
  return (
    <div className="activity-bar">
      <div className="abtn active" title="Templates">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h6l2 2h8v12a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </div>
      <button type="button" className="abtn" title={soonLabel} disabled>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" className="abtn" title={soonLabel} disabled>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2v3m0 14v3m10-10h-3M5 12H2m15.5-7.5l-2.1 2.1M8.6 15.4l-2.1 2.1m0-11l2.1 2.1m6.8 6.8l2.1 2.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button type="button" className="abtn" title={soonLabel} disabled>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <button type="button" className="abtn push" title={soonLabel} disabled>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}
