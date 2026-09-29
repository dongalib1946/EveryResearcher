import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../apps-script/ResearchArchive.gs', import.meta.url), 'utf8');
const router = readFileSync(new URL('../apps-script/doGet-replacement.txt', import.meta.url), 'utf8');
const headers = ['id','year','award','name','department','title','summary','tags','profileUrl','pdfUrl','order','published'];
function run(rows, wrongHeaders = false, request = { parameter: { api: 'archive' } }, mode = 'archive') {
  const accessed = [];
  const sheet = { getRange: () => ({ getDisplayValues: () => [wrongHeaders ? ['unexpected'] : headers] }), getDataRange: () => ({ getValues: () => [headers, ...rows] }) };
  const html = { evaluate() { return this; }, setTitle() { return this; }, addMetaTag() { return this; }, setXFrameOptionsMode() { return { page: 'original-raffle' }; } };
  const context = vm.createContext({ request, CONFIG: { EVENT_TITLE: '기존 추첨' }, console: { error() {} },
    getSpreadsheet_: () => ({ getSheetByName: name => { accessed.push(name); return sheet; } }),
    HtmlService: { createTemplateFromFile: () => html, XFrameOptionsMode: { ALLOWALL: 'all' } },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) } });
  vm.runInContext(source.replace("webMode: 'archive'", `webMode: '${mode}'`) + '\n' + router, context);
  return { result: vm.runInContext('doGet(request)', context), accessed };
}
function row(id, published = true, award = '총장상') { return [id,2026,award,'공개 이름','학과','제목','요약','AI','','',1,published,'접수 시트의 비공개 정보']; }
test('API reads only archive tab, explicit public rows, and allowlisted columns', () => {
  const { result, accessed } = run([row('a'), row('private', false)]);
  assert.deepEqual(accessed, ['수상작_아카이브']); assert.equal(result.ok, true); assert.equal(result.winners.length, 1);
  assert.equal(Object.keys(result.winners[0]).length, 12);
  assert.ok(!JSON.stringify(result).includes('비공개 정보'));
});
test('New file has no duplicate entrypoint; public deployment never returns raffle HTML', () => {
  assert.doesNotMatch(source, /function doGet\s*\(/);
  assert.doesNotMatch(source, /const CONFIG\s*=/);
  for (const request of [undefined, {}, { parameter: {} }, { parameter: { api: 'participants' } }]) {
    const { result, accessed } = run([], false, request || {});
    assert.equal(result.error, 'ARCHIVE_API_ONLY'); assert.deepEqual(accessed, []);
  }
  assert.equal(run([], false, {}, 'raffle').result.page, 'original-raffle');
});
test('API fails closed for malformed headers, duplicates and excess awards', () => {
  assert.equal(run([row('a')], true).result.ok, false);
  assert.equal(run([row('a'), row('a')]).result.ok, false);
  assert.equal(run([row('a'), row('b')]).result.ok, false);
  assert.equal(run([row('a'), [...row('b')].map((v,i) => i === 1 ? 2027 : v)]).result.ok, true);
});
