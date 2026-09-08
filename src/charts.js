export const CHART_TYPES = { bar: '柱状图', line: '折线图', track: '跑道图', donut: '圆环图', radar: '雷达图' };
export const DEFAULT_CHART = {
  type: 'bar', title: '年度轨迹', description: '用数据记录这一年的成长', unit: '', max: 100,
  items: [ { label: '阅读', value: 72 }, { label: '运动', value: 85 }, { label: '创作', value: 56 }, { label: '学习', value: 90 }, { label: '旅行', value: 40 } ],
};
export function validateChart(chart) {
  const fail = () => { throw new Error('图表数据无效：请使用 3–8 项非负数，目标值必须大于 0。'); };
  if (!chart || !Object.hasOwn(CHART_TYPES, chart.type)) fail();
  const result = { type: chart.type };
  for (const [field, max] of [['title', 40], ['description', 100], ['unit', 12]]) {
    if (typeof chart[field] !== 'string' || chart[field].length > max) fail();
    result[field] = chart[field];
  }
  if (!Number.isFinite(chart.max) || chart.max <= 0 || chart.max > 1e12) fail();
  result.max = chart.max;
  if (!Array.isArray(chart.items) || chart.items.length < 3 || chart.items.length > 8) fail();
  result.items = chart.items.map(item => {
    if (!item || typeof item.label !== 'string' || item.label.length > 16 || !Number.isFinite(item.value) || item.value < 0 || item.value > 1e12) fail();
    return { label: item.label, value: item.value };
  });
  return result;
}
