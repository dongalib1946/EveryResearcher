import { ARCHIVE_CATEGORIES } from './data.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function awardEmblem(award) {
  const badge = el('span', 'award-emblem');
  badge.setAttribute('aria-hidden', 'true');
  // Original vector laurel; inherits the award's own palette from CSS.
  const branch = '<path d="M44 84C15 73 12 39 31 18" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M30 21C22 19 22 11 28 7C32 11 33 16 30 21ZM23 33C13 31 11 24 14 18C21 20 25 25 23 33ZM19 46C9 43 6 36 8 30C16 33 20 38 19 46ZM21 59C9 58 4 51 5 45C14 47 20 52 21 59ZM27 72C16 74 9 68 8 61C17 60 23 64 27 72ZM38 82C28 88 20 85 17 79C24 75 31 77 38 82ZM24 36C24 25 30 22 37 23C35 31 31 35 24 36ZM21 50C21 39 27 35 33 36C32 44 27 48 21 50ZM24 64C22 53 27 48 33 47C35 55 30 61 24 64ZM32 77C27 67 30 60 36 58C40 66 36 72 32 77Z" fill="currentColor"/>';
  badge.innerHTML = `<svg viewBox="0 0 100 100" focusable="false"><g class="laurel-leaves">${branch}<g transform="translate(100 0) scale(-1 1)">${branch}</g></g><path class="medal-ribbon" d="M36 61L32 91L43 85L50 94L57 85L68 91L64 61Z"/><circle class="medal-face" cx="50" cy="46" r="25"/><circle class="medal-ring" cx="50" cy="46" r="20"/><path class="medal-star" d="M50 29L51.7 32.8L56 33.3L52.8 36.2L53.7 40.5L50 38.3L46.3 40.5L47.2 36.2L44 33.3L48.3 32.8Z"/><text x="50" y="59" text-anchor="middle">${award.number}</text></svg>`;
  return badge;
}

export function initShell(current) {
  const header = document.querySelector('[data-header]');
  header.innerHTML = `<a class="brand" href="./index.html" aria-label="동아대학교 도서관, 전시 홈"><span class="library-symbol"><img src="./assets/images/library-logo.png" alt=""></span><span>동아대학교 도서관<small>DONG-A UNIVERSITY LIBRARY</small></span></a><nav aria-label="주 메뉴"><a href="./index.html" ${current === 'home' ? 'aria-current="page"' : ''}>수상작 전시</a><a href="./archive.html" ${current === 'archive' ? 'aria-current="page"' : ''}>전체 아카이브</a><a href="./about.html" ${current === 'about' ? 'aria-current="page"' : ''}>대회 소개</a></nav><span class="anniversary"><img src="./assets/images/anniversary-80.png" alt="동아대학교 개교 80주년"></span>`;
  document.querySelector('[data-footer]').innerHTML = `<div class="footer-top"><a class="footer-title" href="./index.html">데이터를 읽고,<br>연구의 흐름을 발견하다.<span>↗</span></a><div class="footer-identity"><div class="footer-logos" role="group" aria-label="도서관, 개교 80주년, SciVal 로고"><span class="footer-library"><img src="./assets/images/library-logo-white.png" alt="동아대학교 도서관" width="1000" height="160"></span><span class="footer-anniversary"><img src="./assets/images/anniversary-80.png" alt="동아대학교 개교 80주년"></span><span class="scival-mark footer-scival"><img src="./assets/images/scival-logo.png" alt="Elsevier SciVal" width="512" height="256"></span></div><div class="footer-info"><p>누구나 연구자 경진대회</p><p>동아대학교 도서관 · 동아대학교 앵커사업추진단</p><a href="./about.html">대회 소개 보기 ↗</a></div></div></div>
    <section class="footer-contacts" aria-labelledby="contacts-title"><h2 id="contacts-title">담당자</h2><div class="contact-grid">
      <address><h3>김세훈</h3><p>각종 문의</p><a href="tel:0512006272">(051)200-6272</a><a href="mailto:sehkim@dau.ac.kr">sehkim@dau.ac.kr</a></address>
      <address><h3>서지현</h3><p>각종 문의</p><a href="tel:0512006275">(051)200-6275</a><a href="mailto:sjh7978@dau.ac.kr">sjh7978@dau.ac.kr</a></address>
      <address><h3>석재우</h3><p>각종 문의 · 홈페이지 관련 문의 · 아카이빙 문의</p><a href="tel:0512006275">(051)200-6275</a><a href="mailto:nicks3610@dau.ac.kr">nicks3610@dau.ac.kr</a></address>
    </div></section><div class="footer-bottom"><span>© 2026 DONG-A UNIVERSITY LIBRARY</span><span>누구나 연구자 · RESEARCH ARCHIVE</span></div>`;
  const backToTop = el('button', 'back-to-top');
  backToTop.type = 'button'; backToTop.setAttribute('aria-label', '맨 위로');
  backToTop.innerHTML = '<span aria-hidden="true">↑</span><span>맨 위로</span>';
  backToTop.hidden = true;
  document.body.append(backToTop);
  const updateTopButton = () => { backToTop.hidden = window.scrollY < 300; };
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  backToTop.onclick = () => {
    const brand = header.querySelector('.brand');
    brand.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  window.reveal = root => root.querySelectorAll('.reveal').forEach(n => observer.observe(n));
  window.reveal(document);
}

export function loading(target, text = '수상작을 불러오고 있습니다') {
  target.replaceChildren();
  const state = el('div', 'state'); state.setAttribute('role', 'status');
  state.append(el('span', 'spinner'), el('p', '', text)); target.append(state);
}
export function errorState(target, message, retry) {
  target.replaceChildren(); const state = el('div', 'state error-state');
  state.setAttribute('role', 'alert'); state.append(el('p', '', message));
  const button = el('button', 'pill-button', '다시 불러오기 ↻'); button.onclick = retry;
  state.append(button); target.append(state);
}
export function demoNotice(isDemo) {
  const node = document.querySelector('[data-demo]');
  if (node) node.hidden = !isDemo;
}

export function winnerCard(winner, { featured = false, compact = false, onOpen } = {}) {
  const award = ARCHIVE_CATEGORIES.find(a => a.key === winner.award);
  const card = el('article', `winner-card reveal ${featured ? 'featured-card' : ''} ${compact ? 'compact-card' : ''}`);
  const button = el('button', 'card-open');
  button.setAttribute('aria-label', `${winner.name}, ${winner.title}, PDF 작품 보기`);
  const visual = el('div', 'card-visual');
  const img = el('img'); img.src = winner.profile || './assets/images/profile-placeholder.svg';
  const imageUrl = new URL(img.src), sampleBase = new URL('../images/', import.meta.url);
  if (imageUrl.origin === sampleBase.origin && imageUrl.pathname.startsWith(sampleBase.pathname) && /\/sample-\d+\.svg$/.test(imageUrl.pathname)) {
    imageUrl.searchParams.set('v', 'no-numbers-20260930'); img.src = imageUrl.href;
  }
  img.alt = `${winner.name} 프로필`; img.loading = 'lazy';
  img.onerror = () => { img.onerror = null; img.src = './assets/images/profile-placeholder.svg'; };
  const visualLabel = el('span', 'visual-label', 'RESEARCHER');
  visual.append(img, visualLabel, el('span', 'image-arrow', '↗'));
  const copy = el('div', 'card-copy');
  const meta = el('div', 'card-meta'); meta.append(el('span', '', award.name), el('span', '', `${winner.year} · ${String(winner.order).padStart(2, '0')}`));
  copy.append(meta, el(featured ? 'h3' : 'h3', 'card-title', winner.title));
  if (featured && winner.summary) copy.append(el('p', 'card-summary', winner.summary));
  copy.append(el('p', 'researcher-name', winner.name), el('p', 'researcher-dept', winner.department));
  const tags = el('div', 'tags'); winner.tags.slice(0, 3).forEach(t => tags.append(el('span', '', t)));
  copy.append(tags, el('span', 'view-work', '연구 작품 보기 ↗'));
  button.append(visual, copy); button.onclick = () => onOpen(winner);
  card.append(button); return card;
}
