import { ARCHIVE_CATEGORIES, loadWinners } from './data.js';
import { initShell, loading, errorState, demoNotice, winnerCard, el } from './ui.js';
import { createPdfModal } from './modal.js';
import { paginate, pageNumbers } from './pagination.js';

initShell('archive'); const open = createPdfModal();
const target = document.querySelector('[data-archive]');
const search = document.querySelector('#search');
const year = document.querySelector('#year');
const count = document.querySelector('[data-count]');
const pagination = document.querySelector('[data-pagination]');
const params = new URLSearchParams(location.search);
let selected = ARCHIVE_CATEGORIES.some(a => a.key === params.get('award')) ? params.get('award') : 'all';
let winners = [];
let currentPage = params.get('page') || 1;
search.value = params.get('q') || '';
const filters = document.querySelector('[data-filters]');
[{ key: 'all', name: '전체' }, ...ARCHIVE_CATEGORIES].forEach(award => {
  const button = el('button', 'filter-button', award.name); button.dataset.award = award.key;
  button.onclick = () => { selected = award.key; currentPage = 1; render(); }; filters.append(button);
});
function render({ push = false, syncUrl = true, moveToResults = false } = {}) {
  const query = search.value.trim().toLocaleLowerCase();
  const filtered = winners.filter(w => (selected === 'all' || w.award === selected) && (year.value === 'all' || String(w.year) === year.value) && [w.title, w.name, w.department, w.summary, ...w.tags].join(' ').toLocaleLowerCase().includes(query));
  filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.award === selected)));
  const page = paginate(filtered, currentPage); currentPage = page.page;
  count.textContent = `${filtered.length}개의 연구 작품${filtered.length ? ` · ${page.start + 1}–${page.end}` : ''}`;
  target.replaceChildren();
  const next = new URLSearchParams(); if (query) next.set('q', search.value.trim()); if (selected !== 'all') next.set('award', selected); if (year.value !== 'all') next.set('year', year.value);
  if (currentPage > 1) next.set('page', currentPage);
  if (syncUrl) history[push ? 'pushState' : 'replaceState'](null, '', `${location.pathname}${next.size ? '?' + next : ''}`);
  if (!filtered.length) {
    const empty = el('div', 'state'); empty.append(el('h2', '', winners.length ? '검색 결과가 없습니다' : '수상작 공개를 준비하고 있습니다'), el('p', '', winners.length ? '다른 검색어 또는 시상 부문을 선택해 주세요.' : '공개된 연구동향분석 포스터를 연도와 시상 부문별로 확인할 수 있습니다.'));
    if (winners.length) { const reset = el('button', 'pill-button', '검색 초기화 ↻'); reset.onclick = () => { search.value = ''; year.value = 'all'; selected = 'all'; currentPage = 1; render(); }; empty.append(reset); }
    target.append(empty);
  } else page.items.forEach(w => target.append(winnerCard(w, { onOpen: open })));
  pagination.replaceChildren(); pagination.hidden = page.pages <= 1;
  if (!pagination.hidden) {
    const addButton = (label, destination, ariaLabel) => {
      const button = el('button', 'page-button', label); button.type = 'button';
      button.setAttribute('aria-label', ariaLabel);
      if (destination === currentPage && /^\d+$/.test(label)) button.setAttribute('aria-current', 'page');
      button.disabled = destination < 1 || destination > page.pages;
      button.onclick = () => {
        if (destination === currentPage) return;
        currentPage = destination; render({ push: true, moveToResults: true });
      };
      pagination.append(button);
    };
    addButton('←', currentPage - 1, '이전 페이지');
    pageNumbers(currentPage, page.pages).forEach(number => {
      if (number === null) { const dots = el('span', 'page-ellipsis', '…'); dots.setAttribute('aria-hidden', 'true'); pagination.append(dots); }
      else addButton(String(number), number, `${number}페이지`);
    });
    addButton('→', currentPage + 1, '다음 페이지');
    const status = el('p', 'page-status', `${currentPage} / ${page.pages} 페이지`);
    status.setAttribute('role', 'status'); pagination.append(status);
  }
  window.reveal(target);
  if (moveToResults) {
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
}
async function init() {
  loading(target); pagination.hidden = true; search.disabled = true; year.disabled = true; filters.querySelectorAll('button').forEach(b => b.disabled = true);
  try {
    const data = await loadWinners({ refresh: true }); winners = data.winners; demoNotice(data.demo);
    year.replaceChildren(new Option('전체 연도', 'all'));
    [...new Set(winners.map(w => w.year))].sort((a, b) => b - a).forEach(y => year.add(new Option(`${y}년`, String(y))));
    if ([...year.options].some(o => o.value === params.get('year'))) year.value = params.get('year');
    search.disabled = false; year.disabled = false; filters.querySelectorAll('button').forEach(b => b.disabled = false); render();
  } catch (error) { count.textContent = ''; errorState(target, error.message, init); }
}
const resetPage = () => { currentPage = 1; render(); };
search.addEventListener('input', resetPage); year.addEventListener('change', resetPage);
window.addEventListener('popstate', () => {
  if (search.disabled) return;
  const state = new URLSearchParams(location.search);
  selected = ARCHIVE_CATEGORIES.some(a => a.key === state.get('award')) ? state.get('award') : 'all';
  search.value = state.get('q') || '';
  year.value = [...year.options].some(o => o.value === state.get('year')) ? state.get('year') : 'all';
  currentPage = state.get('page') || 1;
  render({ syncUrl: false, moveToResults: true });
});
init();
