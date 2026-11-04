export function initCeremonyVideo() {
  const trigger = document.createElement('button');
  trigger.type = 'button'; trigger.className = 'ceremony-shortcut';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'ceremony-dialog');
  trigger.innerHTML = '<span class="ceremony-play" aria-hidden="true">▶</span><span>시상식 영상 보기</span>';
  const dialog = document.createElement('dialog');
  dialog.id = 'ceremony-dialog'; dialog.className = 'ceremony-dialog';
  dialog.setAttribute('aria-labelledby', 'ceremony-title');
  dialog.innerHTML = `<header class="modal-header"><div><span class="eyebrow">AWARDS CEREMONY</span><h2 id="ceremony-title">누구나 연구자 시상식 영상</h2></div><button class="close-modal" type="button" aria-label="시상식 영상 닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header><div class="ceremony-player"></div><footer class="modal-footer"><p>재생되지 않으면 YouTube에서 시청해 주세요.</p><a class="pill-button" href="https://www.youtube.com/watch?v=6EDPt3yVd4E" target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a></footer>`;
  document.body.append(trigger, dialog);
  const player = dialog.querySelector('.ceremony-player');
  let scrollTop = 0, historyEntry = false, closing = false;
  const close = () => {
    if (!dialog.open) return;
    closing = true;
    // Removing the iframe immediately stops playback, including during loading.
    player.replaceChildren(); dialog.close();
  };
  const closeButton = dialog.querySelector('.close-modal');
  closeButton.onclick = close;
  closeButton.addEventListener('touchend', event => {
    event.preventDefault(); event.stopPropagation(); close();
  }, { passive: false });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  window.addEventListener('popstate', event => {
    if (!historyEntry) return;
    event.stopImmediatePropagation(); historyEntry = false; close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('--modal-scroll-top');
    window.scrollTo({ top: scrollTop, behavior: 'instant' });
    trigger.focus({ preventScroll: true }); closing = false;
    if (historyEntry) history.back();
  });
  trigger.onclick = () => {
    if (dialog.open || closing || historyEntry || document.querySelector('dialog[open]')) return;
    scrollTop = window.scrollY;
    const frame = document.createElement('iframe');
    frame.title = '누구나 연구자 시상식 YouTube 영상';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.src = 'https://www.youtube-nocookie.com/embed/6EDPt3yVd4E?autoplay=1&playsinline=1&rel=0';
    player.replaceChildren(frame);
    if (matchMedia('(max-width:700px), (hover:none) and (pointer:coarse)').matches) {
      history.pushState({ ...history.state, ceremonyVideo: true }, ''); historyEntry = true;
    }
    document.body.style.setProperty('--modal-scroll-top', `-${scrollTop}px`);
    document.body.classList.add('modal-open'); dialog.showModal();
  };
}
