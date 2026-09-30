import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safeUrl, driveId, pdfPreview, profileUrl, normalizeRows, AWARDS } from '../assets/js/data.js';

test('URLs reject executable protocols and spoofed Google Drive hosts', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///C:/private', 'http://evil.example/a']) assert.equal(safeUrl(url), '');
  assert.equal(safeUrl('blob:http://localhost/id', true), '');
  assert.equal(driveId('https://drive.google.com.evil.example/file/d/abc/view'), '');
  assert.equal(pdfPreview('https://drive.google.com/file/d/FILE_123/view?usp=sharing'), 'https://drive.google.com/file/d/FILE_123/preview');
  assert.equal(profileUrl('https://drive.google.com/open?id=FILE_123'), 'https://drive.google.com/thumbnail?id=FILE_123&sz=w1000');
  assert.equal(safeUrl('./assets/media/sample-work.pdf', true), 'http://localhost/assets/media/sample-work.pdf');
});

test('Only public, valid, uniquely identified rows reach the gallery', () => {
  const row = { id: 'a', year: 2026, award: '총장상', name: '공개팀', title: '<img src=x onerror=alert(1)>', published: true };
  const rows = normalizeRows([row, { ...row }, { ...row, id: 'b', published: false }, { ...row, id: 'c', award: '없는 상' }, { ...row, id: '', title: 'No ID' }]);
  assert.equal(rows.length, 1); assert.equal(rows[0].award, 'president');
  assert.equal(rows[0].title, '<img src=x onerror=alert(1)>'); // Rendering uses textContent.
});

test('Preview dataset has precisely 1/2/3/5 teams and no unmarked identities', () => {
  const { winners } = JSON.parse(readFileSync(new URL('../assets/data/demo.json', import.meta.url)));
  const rows = normalizeRows(winners);
  assert.equal(rows.length, 11);
  AWARDS.forEach(a => assert.equal(rows.filter(w => w.award === a.key).length, a.count));
  rows.forEach(w => { assert.match(w.name, /샘플/); assert.match(w.profile, /sample/); });
});

test('Explicit non-winners are retained after award tiers; blank, unknown and private rows stay out', () => {
  const row = { id: 'p', year: 2026, award: '미수상', name: '참가팀', title: '참가 포스터', published: true };
  const result = normalizeRows([row, { ...row, id: 'winner', award: '장려상' },
    { ...row, id: 'blank', award: '' }, { ...row, id: 'typo', award: '미수상팀' },
    { ...row, id: 'private', published: false }, { ...row, id: 'p2', award: ' 미수상 ', order: 2 }]);
  assert.deepEqual(result.map(r => [r.id, r.award]), [['winner', 'merit'], ['p', 'participant'], ['p2', 'participant']]);
  assert.equal(AWARDS.length, 4);
});
