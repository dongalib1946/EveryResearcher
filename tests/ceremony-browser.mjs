import { chromium, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
for (const engine of [chromium, webkit]) {
 const browser = await engine.launch(engine === chromium ? {channel:'chrome',headless:true} : {headless:true});
 for (const width of [390,1440]) {
  const page = await browser.newPage({viewport:{width,height:900},isMobile:width<700,hasTouch:width<700,reducedMotion:'reduce'});
  await page.route('https://script.google.com/macros/s/**',r=>r.fulfill({json:{ok:true,winners:[]}}));
  await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'YouTube player test fixture'}));
  for (const path of ['index.html','archive.html','about.html']) {
   await page.goto(`${base}/${path}`);
   const trigger=page.getByRole('button',{name:'시상식 영상 보기'});
   const a=await trigger.boundingBox(),b=await page.locator('.library-shortcut').boundingBox();
   assert.ok(a.y+a.height<b.y); assert.equal(a.width,b.width);
   assert.equal(await page.locator('#ceremony-dialog iframe').count(),0);
   for(const method of width<700?['tap','back']:['click','escape']) {
    await trigger.click();
    const frame=page.locator('#ceremony-dialog iframe');
    assert.match(await frame.getAttribute('src'),/embed\/6EDPt3yVd4E/);
    assert.equal(await page.getByRole('link',{name:'YouTube에서 보기 ↗'}).getAttribute('href'),'https://www.youtube.com/watch?v=6EDPt3yVd4E');
    if(method==='tap')await page.getByRole('button',{name:'시상식 영상 닫기'}).tap();
    if(method==='click')await page.getByRole('button',{name:'시상식 영상 닫기'}).click();
    if(method==='back')await page.goBack();
    if(method==='escape')await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#ceremony-dialog').open&&!document.body.classList.contains('modal-open')&&!history.state?.ceremonyVideo);
    assert.equal(await frame.count(),0);
   }
  }
  await page.close();
 }
 console.log(`PASS ${engine.name()}: all pages, desktop/mobile, placement, lazy player, close/reopen/back and player removal`);
 await browser.close();
}
