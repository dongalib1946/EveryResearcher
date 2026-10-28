import { chromium, webkit } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const payload = JSON.parse(await readFile(new URL('../assets/data/demo.json', import.meta.url)));
payload.winners[0].title = '긴 작품 제목과 모바일 PDF 닫기 동작 확인 '.repeat(12);
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch(engine === chromium ? { channel: 'chrome', headless: true } : { headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await page.route('https://script.google.com/macros/s/**', r => r.fulfill({ json: payload }));
  await page.route('**/sample-work.pdf', r => r.fulfill({ contentType: 'text/html', body: '<p style="height:2000px">Scrollable PDF preview fixture</p>' }));
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['archive.html', 'index.html']) {
      await page.goto(`${base}/${path}`);
      const card = page.locator('.card-open').first();
      await card.scrollIntoViewIfNeeded();
      for (const action of ['touch', 'click', 'escape', 'back']) {
        const before = await page.evaluate(() => scrollY);
        await card.tap();
        const close = page.getByRole('button', { name: '작품 창 닫기' });
        const box = await close.boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44 && box.x >= 0 && box.x + box.width <= width);
        assert.equal(await page.evaluate(() => { const b = document.querySelector('.close-modal'); const r = b.getBoundingClientRect(); return b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }), true);
        if (action === 'touch') await close.tap();
        if (action === 'click') await close.click();
        assert.equal(await page.locator('dialog iframe').count(), 0);
        if (action === 'back') await page.goBack();
        if (action === 'escape') await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('dialog').open && !document.body.classList.contains('modal-open') && !history.state?.researchPreview);
        assert.equal(await page.locator('dialog iframe').count(), 0);
        await page.waitForFunction(y => Math.abs(scrollY-y)<=2, before);
      }
    }
  }
  const delayed = structuredClone(payload);
  delayed.winners.forEach(w => { w.profileUrl = '/slow-poster.svg'; });
  await page.route('https://script.google.com/macros/s/**', r => r.fulfill({ json: delayed }));
  await page.route('**/slow-poster.svg', async r => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><rect width="600" height="900" fill="navy"/></svg>' }).catch(() => {});
  });
  await page.goto(`${base}/archive.html`, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 4; i++) {
    await page.locator('.card-open').first().tap();
    assert.equal(await page.locator('dialog iframe').count(), 0);
    await page.getByRole('button', { name: '작품 창 닫기' }).tap();
    await page.waitForFunction(() => !document.body.classList.contains('modal-open') && !history.state?.researchPreview);
  }
  await page.route('**/slow-poster.svg', r => r.abort());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.card-open').first().tap();
  await page.getByText('포스터를 불러오지 못했습니다.', { exact: false }).waitFor();
  await page.goBack();
  await page.waitForFunction(() => !document.querySelector('dialog').open && !document.body.classList.contains('modal-open'));
  console.log(`PASS ${engine.name()}: home/archive, 320/390/430px, long titles, touch/click/Escape/back, scroll restoration, delayed/failed loads and repeated closing`);
  await browser.close();
}
