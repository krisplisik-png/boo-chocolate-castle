import test from 'node:test';
import assert from 'node:assert/strict';
import {aimGeometry} from '../src/blaster.js';

test('barrel and beam are collinear with targets in every direction',()=>{
 const pivot={x:500,y:650};
 for(const target of [{x:100,y:100},{x:900,y:100},{x:500,y:50},{x:20,y:700},{x:500,y:900}]){
  const g=aimGeometry(pivot,target,85);
  const end={x:g.muzzle.x+Math.cos(g.beamAngle)*g.beamLength,y:g.muzzle.y+Math.sin(g.beamAngle)*g.beamLength};
  assert.ok(Math.abs(end.x-target.x)<1e-8&&Math.abs(end.y-target.y)<1e-8);
  const angle=g.angle*Math.PI/180;
  assert.ok(Math.abs((g.muzzle.x-pivot.x)-Math.sin(angle)*85)<1e-8);
  assert.ok(Math.abs((g.muzzle.y-pivot.y)+Math.cos(angle)*85)<1e-8);
 }
});
test('nearby targets cannot reverse the beam',()=>{
 const g=aimGeometry({x:0,y:0},{x:0,y:-10},100);
 assert.equal(g.beamLength,0);
 assert.deepEqual(g.muzzle,{x:0,y:-10});
});
