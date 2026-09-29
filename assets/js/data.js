import { CONFIG } from './config.js';

export const AWARDS = [
  { key: 'president', name: '총장상', en: 'PRESIDENT’S AWARD', count: 1, prize: '100만 원', number: '01' },
  { key: 'grand', name: '최우수상', en: 'GRAND PRIZE', count: 2, prize: '각 50만 원', number: '02' },
  { key: 'excellence', name: '우수상', en: 'EXCELLENCE AWARD', count: 3, prize: '각 30만 원', number: '03' },
  { key: 'merit', name: '장려상', en: 'MERIT AWARD', count: 5, prize: '각 20만 원', number: '04' },
];

export function safeUrl(value, allowLocal = false) {
  if (!value || typeof value !== 'string') return '';
  try {
    const base = typeof location === 'undefined' ? 'http://localhost/' : location.href;
    const url = new URL(value, base);
    if (url.protocol === 'https:') return url.href;
    if (allowLocal && url.protocol === 'http:' && url.origin === new URL(base).origin && !value.startsWith('//')) return url.href;
  } catch { /* Invalid or unsupported URL. */ }
  return '';
}

export function driveId(value) {
  try {
    const url = new URL(value);
    if (url.hostname !== 'drive.google.com') return '';
    const id = url.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] || url.searchParams.get('id') || '';
    return /^[\w-]+$/.test(id) ? id : '';
  } catch { return ''; }
}
export function pdfPreview(value) {
  const url = safeUrl(value, true);
  const id = driveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}
export function profileUrl(value) {
  const url = safeUrl(value, true);
  const id = driveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : url;
}

export function normalizeRows(rows) {
  if (!Array.isArray(rows)) throw new Error('수상작 데이터 형식이 올바르지 않습니다.');
  const used = new Set();
  return rows.filter(row => row && (row.published === true || String(row.published).toUpperCase() === 'TRUE'))
    .map((row, index) => {
      const award = AWARDS.find(a => a.key === row.award || a.name === row.award);
      const id = String(row.id || '').trim();
      if (!award || !id || used.has(id) || !String(row.name || '').trim() || !String(row.title || '').trim()) return null;
      used.add(id);
      return {
        id, award: award.key, year: Number(row.year) || CONFIG.edition,
        name: String(row.name).trim(), title: String(row.title).trim(),
        department: String(row.department || ''), summary: String(row.summary || ''),
        tags: String(row.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        profile: profileUrl(row.profileUrl), pdf: safeUrl(row.pdfUrl, true),
        order: Number(row.order) || index + 1,
      };
    }).filter(Boolean).sort((a, b) => b.year - a.year || AWARDS.findIndex(v => v.key === a.award) - AWARDS.findIndex(v => v.key === b.award) || a.order - b.order);
}

let pending;
export function loadWinners({ refresh = false } = {}) {
  if (pending && !refresh) return pending;
  pending = (async () => {
    if (!CONFIG.apiUrl && !CONFIG.demoMode) return { winners: [], demo: false };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.requestTimeout);
    try {
      const demoUrl = new URL('../data/demo.json', import.meta.url).href;
      const request = async url => {
        const res = await fetch(url, { signal: controller.signal, redirect: 'follow', credentials: 'omit', cache: 'no-store' });
        if (!res.ok) throw new Error('수상작 정보를 불러오지 못했습니다.');
        const payload = await res.json();
        if (!payload.ok || !Array.isArray(payload.winners)) throw new Error('수상작 데이터 연결을 확인해 주세요.');
        return payload;
      };
      const payload = await request(CONFIG.apiUrl || demoUrl);
      // Keep the explicitly requested preview only while a healthy API has no public rows.
      // API errors are never replaced with sample winners, and samples never mix with real rows.
      const preview = !CONFIG.apiUrl || (CONFIG.demoMode && payload.winners.length === 0);
      const selected = CONFIG.apiUrl && preview ? await request(demoUrl) : payload;
      return { winners: normalizeRows(selected.winners), demo: preview };
    } catch (error) {
      pending = null;
      throw new Error(error.name === 'AbortError' ? '연결 시간이 길어지고 있습니다. 잠시 후 다시 시도해 주세요.' : '수상작 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally { clearTimeout(timer); }
  })();
  return pending;
}
