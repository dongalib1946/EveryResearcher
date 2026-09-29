import { AWARDS } from './data.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
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
  const award = AWARDS.find(a => a.key === winner.award);
  const card = el('article', `winner-card reveal ${featured ? 'featured-card' : ''} ${compact ? 'compact-card' : ''}`);
  const button = el('button', 'card-open');
  button.setAttribute('aria-label', `${winner.name}, ${winner.title}, PDF 작품 보기`);
  const visual = el('div', 'card-visual');
  const img = el('img'); img.src = winner.profile || './assets/images/profile-placeholder.svg';
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
