import { useEffect, useLayoutEffect, useRef } from 'react';

export function EditorPreview({ pages, index, onIndexChange, renderPage, label, fit = false }) {
  const frameRef = useRef(null);
  const reported = useRef(index);
  const latest = useRef(index);
  useLayoutEffect(() => {
    latest.current = index;
    const frame = frameRef.current;
    if (frame && reported.current !== index) {
      reported.current = index;
      frame.scrollTo({ left: frame.clientWidth * index, behavior: 'instant' });
    }
  }, [index]);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const resize = () => {
      if (!frame.clientWidth) return;
      const scale = frame.clientWidth / 340;
      frame.style.setProperty('--preview-scale', String(scale));
      frame.style.setProperty('--preview-canvas-height', `${frame.clientHeight / scale}px`);
      frame.scrollTo({ left: latest.current * frame.clientWidth, behavior: 'instant' });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  return <div ref={frameRef} className={`editor-preview-carousel ${fit ? 'editor-preview-fit' : ''}`} role="region" aria-label={label} tabIndex={0}
    onScroll={event => {
      const frame = event.currentTarget;
      if (!frame.clientWidth) return;
      const next = Math.max(0, Math.min(pages.length - 1, Math.round(frame.scrollLeft / frame.clientWidth)));
      if (next !== reported.current) {
        reported.current = next;
        latest.current = next;
        onIndexChange(next);
      }
    }}
    onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      onIndexChange(Math.max(0, Math.min(pages.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1))));
    }}>
    {pages.map((page, i) => <div key={page.id} className="editor-preview-slide" role="group" aria-label={`${i + 1} / ${pages.length}`} aria-hidden={i !== index}>
      <div className="editor-slide-canvas">{Math.abs(i - index) <= 1 ? renderPage(i) : null}</div>
    </div>)}
  </div>;
}

export function PreviewDialog({ children, title, clean, onRestore, onClose, closeLabel, controls }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (clean) dialogRef.current?.focus();
    else closeRef.current?.focus();
  }, [clean]);
  return <div ref={dialogRef} className={`editor-fullscreen ${clean ? 'editor-fullscreen-clean' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
    onClick={clean ? onRestore : undefined}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const elements = [...event.currentTarget.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length);
      if (clean || !elements.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
    <div className="editor-fullscreen-controls" hidden={clean}>
      {controls}
      <button ref={closeRef} type="button" onClick={onClose} aria-label={closeLabel} className="editor-close-preview">×</button>
    </div>
    {children}
  </div>;
}
