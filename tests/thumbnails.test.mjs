import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { THUMBNAILS } from '../assets/js/thumbnail-manifest.js';
import { thumbnailSources } from '../assets/js/thumbnails.js';

test('Every mapped poster has three existing responsive assets', () => {
  assert.equal(Object.keys(THUMBNAILS).length, 54);
  for (const [id, entry] of Object.entries(THUMBNAILS)) {
    assert.equal(entry.sources.length, 3);
    for (const source of entry.sources) {
      assert.ok(existsSync(new URL(`../assets/images/thumbnails/${source.file}`, import.meta.url)));
    }
    const result = thumbnailSources(`https://drive.google.com/thumbnail?id=${id}&sz=w1000`);
    assert.ok(result.src.endsWith(entry.sources[1].file));
    assert.equal(result.width, entry.width);
    assert.equal(result.srcset.split(', ').length, 3);
  }
});
test('Unmapped, sample and spoofed URLs keep their existing image source', () => {
  for (const value of ['', './assets/images/sample-01.svg', 'https://drive.google.com/thumbnail?id=NEW', `https://drive.google.com.evil.test/thumbnail?id=${Object.keys(THUMBNAILS)[0]}`]) {
    assert.equal(thumbnailSources(value), null);
  }
});
