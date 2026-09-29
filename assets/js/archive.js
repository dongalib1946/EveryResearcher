import { AWARDS, loadWinners } from './data.js';
import { initShell, loading, errorState, demoNotice, winnerCard, el } from './ui.js';
import { createPdfModal } from './modal.js';

initShell('archive'); const open = createPdfModal();
const target = document.querySelector('[data-archive]');
const search = document.querySelector('#search');
const year = document.querySelector('#year');
const count = document.querySelector('[data-count]');
const params = new URLSearchParams(location.search);
let selected = AWARDS.some(a => a.key === params.get('award')) ? params.get('award') : 'all';
let winners = [];
search.value = params.get('q') || '';
const filters = document.querySelector('[data-filters]');
[{ key: 'all', name: '전체' }, ...AWARDS].forEach(award => {
  const button = el('button', 'filter-button', award.name); button.dataset.award = award.key;
  button.onclick = () => { selected = award.key; render(); }; filters.append(button);
});
function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const filtered = winners.filter(w => (selected === 'all' || w.award === selected) && (year.value === 'all' || String(w.year) === year.value) && [w.title, w.name, w.department, w.summary, ...w.tags].join(' ').toLocaleLowerCase().includes(query));
  filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.award === selected)));
  count.textContent = `${filtered.length}개의 연구 작품`;
  target.replaceChildren();
  const next = new URLSearchParams(); if (query) next.set('q', search.value.trim()); if (selected !== 'all') next.set('award', selected); if (year.value !== 'all') next.set('year', year.value);
  history.replaceState(null, '', `${location.pathname}${next.size ? '?' + next : ''}`);
  if (!filtered.length) {
    const empty = el('div', 'state'); empty.append(el('h2', '', winners.length ? '검색 결과가 없습니다' : '수상작 공개를 준비하고 있습니다'), el('p', '', winners.length ? '다른 검색어 또는 시상 부문을 선택해 주세요.' : '공개된 연구동향분석 포스터를 연도와 시상 부문별로 확인할 수 있습니다.'));
    if (winners.length) { const reset = el('button', 'pill-button', '검색 초기화 ↻'); reset.onclick = () => { search.value = ''; year.value = 'all'; selected = 'all'; render(); }; empty.append(reset); }
    target.append(empty);
  } else filtered.forEach(w => target.append(winnerCard(w, { onOpen: open })));
  window.reveal(target);
}
async function init() {
  loading(target); search.disabled = true; year.disabled = true; filters.querySelectorAll('button').forEach(b => b.disabled = true);
  try {
    const data = await loadWinners({ refresh: true }); winners = data.winners; demoNotice(data.demo);
    year.replaceChildren(new Option('전체 연도', 'all'));
    [...new Set(winners.map(w => w.year))].sort((a, b) => b - a).forEach(y => year.add(new Option(`${y}년`, String(y))));
    if ([...year.options].some(o => o.value === params.get('year'))) year.value = params.get('year');
    search.disabled = false; year.disabled = false; filters.querySelectorAll('button').forEach(b => b.disabled = false); render();
  } catch (error) { count.textContent = ''; errorState(target, error.message, init); }
}
search.addEventListener('input', render); year.addEventListener('change', render); init();
