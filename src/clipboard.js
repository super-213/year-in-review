export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; }
    catch { /* HTTP deployments and some webviews need the selection fallback. */ }
  }
  const focused = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px;';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, text.length);
  try {
    if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
  } finally {
    field.remove();
    focused?.focus({ preventScroll: true });
    selection?.removeAllRanges();
    for (const range of ranges) selection?.addRange(range);
  }
}
