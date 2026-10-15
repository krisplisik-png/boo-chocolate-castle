import test from 'node:test';
import assert from 'node:assert/strict';
import {pumpkinPosition} from '../src/pumpkin-race.js';
import {PUMPKIN_RACE} from '../src/config.js';

test('pumpkins roll downhill, grow with perspective, disappear and return uphill',()=>{
 const start=pumpkinPosition(.4,0),middle=pumpkinPosition(5,0),end=pumpkinPosition(10.9,0);
 assert.ok(start.visible&&middle.visible&&end.visible);
 assert.ok(start.y<middle.y&&middle.y<end.y);
 assert.ok(start.size<middle.size&&middle.size<end.size);
 assert.ok(end.angle<start.angle);
 assert.equal(pumpkinPosition(12,0).visible,false);
 const returned=pumpkinPosition(PUMPKIN_RACE.cycleSeconds+.4,0);
 assert.equal(returned.lap,1);
 assert.ok(Math.abs(returned.y-start.y)<.001);
 assert.ok(Math.abs(returned.size-start.size)<.001);
});

test('all four numbered pumpkins return on every lap',()=>{
 for(let i=0;i<4;i++){
  let visible=false,hidden=false,returned=false;
  for(let t=0;t<28;t+=.1){const p=pumpkinPosition(t,i);if(p.visible)visible=true;else hidden=true;if(p.visible&&p.lap>0)returned=true;}
  assert.ok(visible&&hidden&&returned);
 }
});
