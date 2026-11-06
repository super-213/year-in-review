import { useEffect, useMemo, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { translate } from './i18n.js';
import { createSharePoster, POSTER_THEMES, svgDataUrl, svgToPng } from './sharePoster.js';

export default function ShareCard({ deployment }) {
  const [theme, setTheme] = useState(deployment.theme);
  const [png, setPng] = useState(null);
  const [status, setStatus] = useState('');
  const tr = (key, params) => translate(deployment.language, key, params);
  const poster = useMemo(() => {
    try { return createSharePoster({ ...deployment, theme }); }
    catch { return null; }
  }, [deployment, theme]);
  useEffect(() => {
    if (!poster) return;
    let cancelled = false;
    let url;
    svgToPng(poster.svg).then(blob => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      setPng({ source: poster.svg, url, blob });
    }).catch(() => {
      if (!cancelled) setStatus('宣传卡生成失败，请重试。');
    });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [poster]);
  const ready = png?.source === poster?.svg ? png : null;
  const filename = `year-in-review-${theme}-${new URL(deployment.url).pathname.split('/').pop()}.png`;
  const save = () => {
    if (!ready) return;
    const anchor = document.createElement('a');
    anchor.href = ready.url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setStatus('宣传卡已下载，也可以长按图片保存。');
  };
  const share = async () => {
    if (!ready) return;
    try {
      const file = new File([ready.blob], filename, { type: 'image/png' });
      await navigator.share({ files: [file], title: deployment.title });
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('请保存图片后分享。');
    }
  };
  const canShare = ready && typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([ready.blob], filename, { type: 'image/png' })] });
  return <section className="share-card" aria-label={tr('二维码宣传卡')}>
    <div className="share-card-heading">
      <div><h3>{tr('二维码宣传卡')}</h3><p>{tr('扫码看作品，保存图片即可分享。')}</p></div>
      <label>{tr('卡片风格')}<select value={theme} onChange={event => { setTheme(event.target.value); setStatus(''); }}>
        {Object.entries(POSTER_THEMES).map(([id, style]) => <option key={id} value={id}>{tr(style.name)}</option>)}
      </select></label>
    </div>
    {poster ? <img className="share-card-image" src={ready?.url || svgDataUrl(poster.svg)} width="1080" height="1440" alt={tr('扫码打开「{title}」', { title: deployment.title.slice(0, 100) })} /> : <p role="alert">{tr('宣传卡生成失败，请重试。')}</p>}
    <div className="share-card-actions">
      <button type="button" onClick={save} disabled={!ready}><Download size={18} />{tr(ready ? '保存宣传卡 PNG' : '正在生成宣传卡…')}</button>
      {canShare && <button type="button" onClick={share}><Share2 size={18} />{tr('分享卡片')}</button>}
    </div>
    <p className="share-card-note">{tr('1080 × 1440 高清图片，可长按保存。二维码与作品同时过期。')}</p>
    <p className="share-card-note" role="status">{tr(status)}</p>
  </section>;
}
