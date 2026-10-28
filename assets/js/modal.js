import { thumbnailSources } from './thumbnails.js?v=20261028-4';
import { pdfPreview } from './data.js';
import { el } from './ui.js?v=20261028-3';

export function createPdfModal() {
  const dialog = el('dialog', 'pdf-dialog');
  dialog.setAttribute('aria-labelledby', 'pdf-title');
  dialog.innerHTML = `<div class="modal-header"><div><span class="eyebrow">RESEARCH ARCHIVE</span><h2 id="pdf-title"></h2><p class="modal-author"></p></div><button class="close-modal" aria-label="작품 창 닫기" type="button"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div><div class="pdf-body"></div><div class="modal-footer"><p>미리보기가 표시되지 않으면 원본 PDF를 열어주세요.</p><a class="pill-button" target="_blank" rel="noopener noreferrer">원본 PDF 열기 ↗</a></div>`;
  document.body.append(dialog);
  const body = dialog.querySelector('.pdf-body');
  let opener, timer, scrollTop = 0, mobileHistory = false, closing = false, generation = 0;
  const close = () => { if (dialog.open) { closing = true; dialog.close(); } };
  window.addEventListener('popstate', event => {
    if (!mobileHistory) return;
    // This history entry only represents the preview, not an archive filter.
    event.stopImmediatePropagation();
    mobileHistory = false;
    close();
  });
  const closeButton = dialog.querySelector('.close-modal');
  closeButton.onclick = close;
  // Handle the touch itself; do not depend on a delayed compatibility click
  // after interacting with an embedded PDF in iOS browsers.
  closeButton.addEventListener('touchend', event => {
    event.preventDefault(); event.stopPropagation(); close();
  }, { passive: false });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    generation++;
    clearTimeout(timer); body.replaceChildren(); document.body.classList.remove('modal-open');
    document.body.style.removeProperty('--modal-scroll-top');
    window.scrollTo({ top: scrollTop, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
    closing = false;
    if (mobileHistory) history.back();
  });
  return winner => {
    if (dialog.open || closing || mobileHistory) return;
    const request = ++generation;
    opener = document.activeElement;
    scrollTop = window.scrollY;
    dialog.querySelector('h2').textContent = winner.title;
    dialog.querySelector('.modal-author').textContent = `${winner.name} · ${winner.year}`;
    body.replaceChildren(); clearTimeout(timer);
    const mobile = matchMedia('(max-width: 700px), (hover: none) and (pointer: coarse)').matches;
    body.classList.toggle('poster-preview', mobile);
    const link = dialog.querySelector('.modal-footer a');
    link.hidden = !winner.pdf;
    const footerText = dialog.querySelector('.modal-footer p');
    footerText.textContent = winner.pdf ? '미리보기가 표시되지 않으면 원본 PDF를 열어주세요.' : '작품이 등록되면 이곳에서 PDF를 확인할 수 있습니다.';
    if (!winner.pdf) {
      const empty = el('div', 'state'); empty.append(el('span', 'empty-icon', '↗'), el('h3', '', '작품 공개를 준비하고 있습니다'), el('p', '', 'PDF 작품이 아직 등록되지 않았습니다.'));
      body.append(empty); link.removeAttribute('href');
    } else if (mobile) {
      link.href = winner.pdf;
      footerText.textContent = '포스터 미리보기입니다. PDF는 원본 열기로 확인하세요.';
      const image = el('img', 'poster-preview-image');
      const thumbnail = thumbnailSources(winner.profile);
      image.alt = `${winner.title} 작품 포스터`;
      image.decoding = 'async';
      const state = el('div', 'pdf-loading'); state.setAttribute('role', 'status');
      state.append(el('span', 'spinner'), el('p', '', '포스터를 불러오고 있습니다'));
      image.onload = () => { if (request !== generation) return; clearTimeout(timer); state.remove(); };
      image.onerror = () => {
        if (request !== generation) return;
        clearTimeout(timer); image.remove();
        state.replaceChildren(el('p', '', '포스터를 불러오지 못했습니다. 아래 원본 PDF 열기를 이용해 주세요.'));
      };
      body.append(image, state);
      if (thumbnail || winner.profile) image.src = thumbnail?.previewSrc || winner.profile;
      else image.onerror();
      timer = setTimeout(() => { if (request !== generation) return; state.replaceChildren(el('p', '', '포스터 로딩이 지연되고 있습니다. 원본 PDF 열기를 이용하실 수 있습니다.')); }, 12000);
    } else {
      link.href = winner.pdf;
      const state = el('div', 'pdf-loading'); state.setAttribute('role', 'status');
      state.append(el('span', 'spinner'), el('p', '', '연구 작품을 열고 있습니다'));
      const frame = el('iframe'); frame.title = `${winner.title} PDF 미리보기`;
      frame.referrerPolicy = 'no-referrer';
      frame.setAttribute('allow', 'fullscreen');
      frame.onload = () => { if (request !== generation) return; clearTimeout(timer); state.remove(); };
      frame.onerror = () => { if (request !== generation) return; clearTimeout(timer); state.replaceChildren(el('p', '', '미리보기를 불러오지 못했습니다. 아래 원본 PDF 열기를 이용해 주세요.')); };
      frame.src = pdfPreview(winner.pdf);
      body.append(frame, state);
      timer = setTimeout(() => { if (request !== generation) return; state.replaceChildren(el('p', '', '미리보기가 지연되고 있습니다. 아래 원본 PDF 열기를 이용해 주세요.')); }, 12000);
    }
    if (mobile) {
      history.pushState({ ...history.state, researchPreview: true }, '');
      mobileHistory = true;
    }
    document.body.style.setProperty('--modal-scroll-top', `-${scrollTop}px`);
    document.body.classList.add('modal-open'); dialog.showModal();
  };
}
