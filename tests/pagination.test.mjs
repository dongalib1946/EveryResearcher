import test from 'node:test';
import assert from 'node:assert/strict';
import {paginate, pageNumbers} from '../assets/js/pagination.js';

test('Archive pages have 12 items with no omissions or duplicates', () => {
  for (const size of [0,1,12,13,24,25,314]) {
    const rows=Array.from({length:size},(_,i)=>i), all=[];
    const total=Math.max(1,Math.ceil(size/12));
    for(let p=1;p<=total;p++) {
      const result=paginate(rows,p);
      assert.equal(result.page,p); assert.equal(result.pages,total);
      assert.ok(result.items.length<=12); all.push(...result.items);
    }
    assert.deepEqual(all,rows);
  }
});
test('Page state is clamped after filtering or malformed URL parameters', () => {
  const rows=Array.from({length:25},(_,i)=>i);
  assert.equal(paginate(rows,999).page,3);
  for(const value of [0,-1,'abc',1.5,Infinity,1e20]) assert.equal(paginate(rows,value).page,1);
  assert.equal(paginate([],999).page,1);
  assert.deepEqual(paginate(rows,'2').items,rows.slice(12,24));
});
test('Large page sets remain compact and expose first, last and current pages', () => {
  for(const total of [1,2,7,8,27,1000]) {
    for(let page=1;page<=total;page++) {
      const numbers=pageNumbers(page,total), values=numbers.filter(n=>n!==null);
      assert.ok(numbers.length<=7);
      assert.equal(values[0],1); assert.equal(values.at(-1),total);
      assert.ok(values.includes(page));
      assert.equal(new Set(values).size,values.length);
    }
  }
});
