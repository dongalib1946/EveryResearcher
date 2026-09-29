import { pdfPreview } from './data.js';
import { el } from './ui.js';

export function createPdfModal() {
  const dialog = el('dialog', 'pdf-dialog');
  dialog.setAttribute('aria-labelledby', 'pdf-title');
  dialog.innerHTML = `<div class="modal-header"><div><span class="eyebrow">RESEARCH ARCHIVE</span><h2 id="pdf-title"></h2><p class="modal-author"></p></div><button class="close-modal" aria-label="작품 창 닫기">×</button></div><div class="pdf-body"></div><div class="modal-footer"><p>미리보기가 표시되지 않으면 원본 PDF를 열어주세요.</p><a class="pill-button" target="_blank" rel="noopener noreferrer">원본 PDF 열기 ↗</a></div>`;
  document.body.append(dialog);
  const body = dialog.querySelector('.pdf-body');
  let opener, timer;
  const close = () => dialog.close();
  dialog.querySelector('.close-modal').onclick = close;
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    clearTimeout(timer); body.replaceChildren(); document.body.classList.remove('modal-open');
    opener?.focus();
  });
  return winner => {
    opener = document.activeElement;
    dialog.querySelector('h2').textContent = winner.title;
    dialog.querySelector('.modal-author').textContent = `${winner.name} · ${winner.year}`;
    body.replaceChildren(); clearTimeout(timer);
    const link = dialog.querySelector('.modal-footer a');
    link.hidden = !winner.pdf;
    const footerText = dialog.querySelector('.modal-footer p');
    footerText.textContent = winner.pdf ? '미리보기가 표시되지 않으면 원본 PDF를 열어주세요.' : '작품이 등록되면 이곳에서 PDF를 확인할 수 있습니다.';
    if (!winner.pdf) {
      const empty = el('div', 'state'); empty.append(el('span', 'empty-icon', '↗'), el('h3', '', '작품 공개를 준비하고 있습니다'), el('p', '', 'PDF 작품이 아직 등록되지 않았습니다.'));
      body.append(empty); link.removeAttribute('href');
    } else {
      link.href = winner.pdf;
      const state = el('div', 'pdf-loading'); state.setAttribute('role', 'status');
      state.append(el('span', 'spinner'), el('p', '', '연구 작품을 열고 있습니다'));
      const frame = el('iframe'); frame.title = `${winner.title} PDF 미리보기`;
      frame.referrerPolicy = 'no-referrer';
      frame.setAttribute('allow', 'fullscreen');
      frame.onload = () => { clearTimeout(timer); state.remove(); };
      frame.onerror = () => { clearTimeout(timer); state.replaceChildren(el('p', '', '미리보기를 불러오지 못했습니다. 아래 원본 PDF 열기를 이용해 주세요.')); };
      frame.src = pdfPreview(winner.pdf);
      body.append(frame, state);
      timer = setTimeout(() => { state.replaceChildren(el('p', '', '미리보기가 지연되고 있습니다. 아래 원본 PDF 열기를 이용해 주세요.')); }, 12000);
    }
    document.body.classList.add('modal-open'); dialog.showModal();
  };
}
