export function CanvasPane({ svg, zoomPercent, onZoomIn, onZoomOut, onFit, emptyLabel }) {
  return (
    <div className="canvas">
      <div className="canvas-toolbar">
        <button type="button" className="ctbtn" onClick={onZoomIn} aria-label="zoom-in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <button type="button" className="ctbtn" onClick={onZoomOut} aria-label="zoom-out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 11h6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <button type="button" className="ctbtn" onClick={onFit} aria-label="zoom-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>
      {svg ? (
        <div
          className="canvas-svg-wrap"
          style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: 'top left' }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="canvas-empty">{emptyLabel}</div>
      )}
      <div className="zoom">{zoomPercent}%</div>
    </div>
  );
}
