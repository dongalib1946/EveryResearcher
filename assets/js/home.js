import { CONFIG } from './config.js';
import { AWARDS, loadWinners } from './data.js';
import { initShell, loading, errorState, demoNotice, winnerCard, awardEmblem, el } from './ui.js';
import { createPdfModal } from './modal.js';
import { initIntro } from './intro.js';

initShell('home'); initIntro();
const open = createPdfModal();
const target = document.querySelector('[data-winners]');
async function render() {
  loading(target);
  try {
    const data = await loadWinners({ refresh: true }); demoNotice(data.demo);
    const winners = data.winners.filter(w => w.year === CONFIG.edition);
    target.replaceChildren();
    if (!winners.length) {
      const empty = el('div', 'state'); empty.append(el('span', 'eyebrow', 'COMING SOON'), el('h3', '', '수상작 포스터 공개를 준비하고 있습니다'), el('p', '', '수상작 선정 후 연구동향분석 포스터를 이곳에 공개합니다.')); target.append(empty);
    }
    AWARDS.forEach(award => {
      const rows = winners.filter(w => w.award === award.key);
      if (!rows.length) return;
      const section = el('section', `award-section award-${award.key}`); section.id = award.key;
      const heading = el('div', 'award-heading reveal');
      const left = el('div', 'award-heading-title');
      const label = el('div', 'award-label');
      label.append(el('h2', '', award.name), el('span', 'award-english', award.en));
      left.append(awardEmblem(award), label);
      const right = el('div', 'award-heading-detail'); right.append(el('span', '', `${rows.length} TEAM${rows.length > 1 ? 'S' : ''}`), el('span', '', `상금 ${award.prize}`));
      heading.append(left, right);
      const grid = el('div', `winner-grid grid-${award.key}`);
      rows.forEach(w => grid.append(winnerCard(w, { featured: award.key === 'president', compact: award.key === 'merit', onOpen: open })));
      section.append(heading, grid); target.append(section);
    });
    window.reveal(target);
  } catch (error) { errorState(target, error.message, render); }
}
render();
