import { translate } from './i18n.js';
import { CHART_TYPES, DEFAULT_CHART } from './charts.js';

const palettes = {
  retro: ['#064e3b', '#059669', '#047857', '#34d399'], swiss: ['#dc2626', '#171717', '#737373', '#ef4444'],
  lofi: ['#85664b', '#a68b70', '#66806a', '#b36e55'], neon: ['#e879f9', '#22d3ee', '#a78bfa', '#f472b6'],
  minimal: ['#0f172a', '#64748b', '#475569', '#94a3b8'], journal: ['#92400e', '#15803d', '#b45309', '#0369a1'],
  glass: ['#fff', '#c4b5fd', '#a5f3fc', '#fbcfe8'], brutal: ['#000', '#e11d48', '#2563eb', '#7c3aed'],
  vapor: ['#d946ef', '#06b6d4', '#8b5cf6', '#ec4899'], academia: ['#d4b483', '#a8a29e', '#c29568', '#8eaa8b'],
  pop: ['#e11d48', '#2563eb', '#7c3aed', '#171717'], blueprint: ['#fff', '#93c5fd', '#67e8f9', '#bfdbfe'],
};
const formatter = language => value => new Intl.NumberFormat(language, { maximumFractionDigits: 2, notation: value >= 100000 ? 'compact' : 'standard' }).format(value);
const point = (angle, radius) => [180 + Math.sin(angle) * radius, 155 - Math.cos(angle) * radius];

function ChartGraphic({ chart, colors, language }) {
  const tr = (key, params) => translate(language, key, params);
  const format = formatter(language);
  const { type, items, max } = chart;
  const color = i => colors[i % colors.length];
  const ceiling = Math.max(...items.map(item => item.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const xy = i => [48 + i * 268 / (items.length - 1), 264 - items[i].value / ceiling * 208];
  let graphic;
  if (type === 'bar' || type === 'line') {
    graphic = <>
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => <g key={ratio}>
        <line x1="42" x2="330" y1={264 - ratio * 208} y2={264 - ratio * 208} stroke="currentColor" opacity=".15" />
        <text fill="currentColor" x="35" y={268 - ratio * 208} textAnchor="end" fontSize="10">{format(ceiling * ratio)}</text>
      </g>)}
      {type === 'line' && <polyline points={items.map((_, i) => xy(i).join(',')).join(' ')} fill="none" stroke={color(0)} strokeWidth="3" strokeLinejoin="round" />}
      {items.map((item, i) => {
        const step = 288 / items.length;
        const [x, y] = type === 'line' ? xy(i) : [42 + step * (i + .5), 264 - item.value / ceiling * 208];
        return <g key={i}><title>{item.label}: {item.value}{chart.unit}</title>
          {type === 'bar' ? <rect x={x - step * .3} y={y} width={step * .6} height={264 - y} fill={color(i)} /> : <circle cx={x} cy={y} r="4" fill={color(0)} />}
          <text fill="currentColor" x={x} y={y - 10} textAnchor="middle" fontSize="11">{format(item.value)}</text>
          <text fill="currentColor" x={x} y="285" textAnchor="middle" fontSize="11">{i + 1}</text>
        </g>;
      })}
    </>;
  } else if (type === 'donut') {
    graphic = total === 0 ? <><circle cx="180" cy="155" r="100" fill="none" stroke="currentColor" strokeWidth="35" opacity=".12" /><text fill="currentColor" x="180" y="160" textAnchor="middle">{tr('暂无非零数据')}</text></> : <>
      {items.map((item, i) => {
        const start = items.slice(0, i).reduce((sum, entry) => sum + entry.value, 0) / total * 100; const percentage = item.value / total * 100;
        return <circle key={i} cx="180" cy="155" r="100" fill="none" stroke={color(i)} strokeWidth="35" pathLength="100" strokeDasharray={`${percentage} ${100 - percentage}`} strokeDashoffset={-start} transform="rotate(-90 180 155)"><title>{item.label}: {format(percentage)}%</title></circle>;
      })}
      <text fill="currentColor" x="180" y="152" textAnchor="middle" fontSize="28" fontWeight="bold">{format(total)}</text>
      <text fill="currentColor" x="180" y="178" textAnchor="middle" fontSize="12">{tr('合计')} {chart.unit}</text>
    </>;
  } else if (type === 'track') {
    graphic = <>{items.map((item, i) => {
      const radius = 126 - i * (94 / items.length); const progress = Math.min(item.value / max, 1) * 100;
      return <g key={i} transform="rotate(-90 180 155)"><title>{item.label}: {format(item.value / max * 100)}%</title>
        <circle cx="180" cy="155" r={radius} fill="none" stroke={color(i)} strokeWidth="9" opacity=".16" />
        <circle cx="180" cy="155" r={radius} fill="none" stroke={color(i)} strokeWidth="9" strokeLinecap={progress ? 'round' : 'butt'} pathLength="100" strokeDasharray={`${progress} ${100 - progress}`} />
      </g>;
    })}<text fill="currentColor" x="180" y="151" textAnchor="middle" fontSize="12">{tr('目标')}</text><text fill="currentColor" x="180" y="174" textAnchor="middle" fontSize="20" fontWeight="bold">{format(max)}</text></>;
  } else {
    const vertices = radius => items.map((_, i) => point(i * Math.PI * 2 / items.length, radius).join(',')).join(' ');
    graphic = <>
      {[.25, .5, .75, 1].map(ratio => <polygon key={ratio} points={vertices(105 * ratio)} fill="none" stroke="currentColor" opacity=".2" />)}
      {items.map((_, i) => { const [x, y] = point(i * Math.PI * 2 / items.length, 105); const [tx, ty] = point(i * Math.PI * 2 / items.length, 127); return <g key={i}><line x1="180" y1="155" x2={x} y2={y} stroke="currentColor" opacity=".2" /><text fill="currentColor" x={tx} y={ty + 4} textAnchor="middle" fontSize="12">{i + 1}</text></g>; })}
      <polygon points={items.map((item, i) => point(i * Math.PI * 2 / items.length, Math.min(item.value / max, 1) * 105).join(',')).join(' ')} fill={color(0)} fillOpacity=".23" stroke={color(0)} strokeWidth="3" />
      <text fill="currentColor" x="180" y="309" textAnchor="middle" fontSize="11">{tr('刻度上限')} {format(max)}{chart.unit}</text>
    </>;
  }
  return <svg viewBox="0 0 360 325" className="chart-graphic" role="img" aria-label={`${chart.title}，${tr(CHART_TYPES[type])}。${items.map(item => `${item.label} ${item.value}${chart.unit}`).join('，')}`}><title>{chart.title}</title>{graphic}</svg>;
}

export function ChartPage({ chart = DEFAULT_CHART, theme, year, watermark, language = 'zh' }) {
  const tr = key => translate(language, key);
  const format = formatter(language);
  const colors = palettes[theme] || palettes.retro;
  return <section className={`chart-page chart-theme-${theme}`}>
    <header><div className="chart-eyebrow">{year} / {tr(CHART_TYPES[chart.type])}</div><h3>{chart.title}</h3><p>{chart.description}</p></header>
    <ChartGraphic language={language} chart={chart} colors={colors} />
    <ol className="chart-legend">{chart.items.map((item, i) => <li key={i}><span className="chart-key" style={{ backgroundColor: colors[i % colors.length] }} /><span className="chart-label">{i + 1}. {item.label}</span><strong>{format(item.value)}{chart.unit}</strong></li>)}</ol>
    {(chart.type === 'track' || chart.type === 'radar') && chart.items.some(item => item.value > chart.max) && <p className="chart-note">{tr('超出目标的图形按上限显示，数值保留实际值。')}</p>}
    <footer>{watermark}</footer>
  </section>;
}

export function ChartEditor({ chart = DEFAULT_CHART, onChange, language = 'zh' }) {
  const tr = (key, params) => translate(language, key, params);
  const update = patch => onChange({ ...chart, ...patch });
  const updateItem = (index, patch) => update({ items: chart.items.map((item, i) => i === index ? { ...item, ...patch } : item) });
  const inputClass = 'w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-500';
  return <section className="space-y-4 mb-8" aria-label={tr('图表编辑')}>
    <h3 className="font-bold text-lg">{tr('图表可视化')}</h3>
    <fieldset><legend className="text-sm mb-2">{tr('图表类型 · 每页展示一种')}</legend><div className="flex flex-wrap gap-2">{Object.entries(CHART_TYPES).map(([type, label]) => <button key={type} aria-pressed={chart.type === type} onClick={() => update({ type })} className={`px-3 py-2 rounded-lg border text-sm transition-colors ${chart.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 hover:bg-indigo-50'}`}>{tr(label)}</button>)}</div></fieldset>
    {[['title', '标题', 40], ['description', '说明', 100], ['unit', '单位', 12]].map(([field, label, maxLength]) => <label key={field} className="block text-sm">{tr(label)}<input className={inputClass} value={chart[field]} maxLength={maxLength} onChange={event => update({ [field]: event.target.value })} /></label>)}
    {(chart.type === 'track' || chart.type === 'radar') && <label className="block text-sm">{chart.type === 'radar' ? tr('统一刻度上限') : tr('每条跑道的目标值')}<input type="number" min="0.01" max="1000000000000" step="any" className={inputClass} value={chart.max} onChange={event => { const value = event.target.valueAsNumber; if (Number.isFinite(value) && value > 0 && value <= 1e12) update({ max: value }); }} /></label>}
    <p className="text-xs text-slate-500">{tr('支持 3–8 项非负数。同一图表使用相同单位；切换类型会保留数据。')}</p>
    {chart.items.map((item, i) => <div key={i} className="flex gap-2 items-center"><span className="text-xs text-slate-400">{i + 1}</span><input aria-label={tr('第 {n} 项名称', { n: i + 1 })} className={inputClass} value={item.label} maxLength={16} onChange={event => updateItem(i, { label: event.target.value })} /><input aria-label={tr('第 {n} 项数值', { n: i + 1 })} type="number" min="0" max="1000000000000" step="any" className={inputClass} value={item.value} onChange={event => { const value = event.target.value === '' ? 0 : event.target.valueAsNumber; if (Number.isFinite(value) && value >= 0 && value <= 1e12) updateItem(i, { value }); }} /><button aria-label={tr('删除第 {n} 项', { n: i + 1 })} disabled={chart.items.length <= 3} onClick={() => update({ items: chart.items.filter((_, index) => index !== i) })} className="text-slate-400 hover:text-red-600 disabled:opacity-25 px-2">×</button></div>)}
    <button disabled={chart.items.length >= 8} className="text-sm text-indigo-600 disabled:opacity-30" onClick={() => update({ items: [...chart.items, { label: tr('项目 {n}', { n: chart.items.length + 1 }), value: 0 }] })}>{tr('＋ 添加数据项')}</button>
  </section>;
}
