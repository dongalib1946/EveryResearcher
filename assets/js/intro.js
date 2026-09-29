import { CONFIG } from './config.js';

export function initIntro() {
  const opening = document.querySelector('.hero-video-opening');
  const ambient = document.querySelector('.hero-video-ambient');
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('[data-replay]');
  const progress = document.querySelector('.intro-progress span');
  const status = document.querySelector('[data-video-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  let active = opening, phase = 'opening', interacted = false, pausedByUser = false;
  let loadingTimer, spinnerTimer, resumeOnVisible = false;
  hero.dataset.videoPhase = phase;

  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => {
    window.addEventListener(type, () => { interacted = true; }, { once: true, passive: true });
  });
  const ready = () => { clearTimeout(loadingTimer); clearTimeout(spinnerTimer); hero.classList.add('video-ready'); toggle.hidden = false; };
  const loading = () => {
    clearTimeout(loadingTimer); clearTimeout(spinnerTimer);
    spinnerTimer = setTimeout(() => hero.classList.remove('video-ready'), 350);
    status.textContent = '영상을 불러오고 있습니다';
    loadingTimer = setTimeout(() => { ready(); status.textContent = '영상 연결이 지연되고 있습니다'; }, 8000);
  };
  const playActive = async () => {
    const requested = active;
    if (document.hidden || pausedByUser) return;
    loading();
    try { await requested.play(); }
    catch {
      if (requested !== active) return;
      ready(); toggle.textContent = '영상 재생 ↗';
      status.textContent = '재생 버튼을 눌러 영상을 감상해 주세요';
    }
  };
  const showAmbient = () => {
    if (phase === 'ambient') return;
    phase = 'ambient'; hero.dataset.videoPhase = phase;
    active = ambient; progress.style.width = '100%';
    // Retain the opening's last frame until the loop is actually playing.
    if (document.hidden) { resumeOnVisible = !pausedByUser; return; }
    playActive();
  };
  opening.addEventListener('ended', () => {
    showAmbient();
    if (CONFIG.autoScrollAfterIntro && !interacted && !reduced && !document.hidden && window.scrollY < 80 && !location.hash) {
      document.querySelector('#exhibition').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  opening.addEventListener('timeupdate', () => {
    if (phase === 'opening' && opening.duration) progress.style.width = `${opening.currentTime / opening.duration * 100}%`;
    if (phase === 'opening' && !saveData && ambient.preload === 'none') {
      ambient.preload = 'auto'; ambient.load();
    }
    if (phase === 'opening' && !opening.paused && opening.duration - opening.currentTime < 1.2 && ambient.readyState >= 3) showAmbient();
  });
  [opening, ambient].forEach(video => {
    video.addEventListener('playing', () => {
      if (video !== active) return;
      if (document.hidden || pausedByUser) { video.pause(); return; }
      ready(); toggle.textContent = '영상 일시정지 Ⅱ';
      status.textContent = phase === 'opening' ? '2026 누구나 연구자 경진대회' : '데이터로 연구의 흐름을 읽다';
      if (video === ambient) hero.classList.add('ambient-visible');
    });
    video.addEventListener('waiting', () => { if (video === active && !video.paused) loading(); });
    video.addEventListener('error', () => {
      if (video !== active) return;
      if (video === opening) { showAmbient(); return; }
      ready(); hero.classList.add('ambient-visible'); toggle.hidden = true;
      status.textContent = '2026 누구나 연구자 경진대회';
    });
  });
  toggle.onclick = () => {
    interacted = true;
    if (!active.paused) {
      pausedByUser = true; resumeOnVisible = false; opening.pause(); ambient.pause(); ready(); toggle.textContent = '영상 재생 ↗';
    } else { pausedByUser = false; playActive(); }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeOnVisible = !active.paused && !pausedByUser;
      opening.pause(); ambient.pause(); ready(); toggle.textContent = '영상 재생 ↗';
    } else if (resumeOnVisible && !pausedByUser) { resumeOnVisible = false; playActive(); }
  });
  if (reduced || saveData) {
    ready(); status.textContent = '2026 누구나 연구자 경진대회'; toggle.textContent = '영상 재생 ↗';
  } else playActive();
}
