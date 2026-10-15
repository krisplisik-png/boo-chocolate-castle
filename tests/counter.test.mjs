import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createCounter} from '../server/counter.mjs';

test('server assigns consecutive numbers; retries and visits are idempotent',()=>{
 const c=createCounter(':memory:');
 try{
  c.visit('browser-a');c.visit('browser-a');c.visit('browser-b');
  assert.deepEqual(c.stats(),{visited:2,completed:0});
  assert.equal(c.complete('run-a','browser-a').card,'B1-000001');
  assert.equal(c.complete('run-a','browser-a').card,'B1-000001');
  assert.equal(c.complete('run-b','browser-b').card,'B1-000002');
  assert.equal(c.complete('run-c','browser-a').card,'B1-000003');
  assert.deepEqual(c.stats(),{visited:2,completed:3});
 }finally{c.close();}
});
test('number sequence and previous completion survive a server restart',()=>{
 const filename=path.join(mkdtempSync(path.join(tmpdir(),'boo-counter-')),'players.sqlite');
 let c=createCounter(filename);c.complete('run-one','visitor-one');c.close();
 c=createCounter(filename);
 try{assert.equal(c.complete('run-one','visitor-one').number,1);assert.equal(c.complete('run-two','visitor-two').number,2);}finally{c.close();}
});
