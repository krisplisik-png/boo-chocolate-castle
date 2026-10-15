import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  await page.goto('http://127.0.0.1:4173/?preview=pumpkins');
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  const pumpkin=page.locator('.pumpkin[data-index="0"]');
  const sample=()=>pumpkin.evaluate(b=>({top:parseFloat(b.style.top),width:parseFloat(b.style.width),hidden:b.hidden,lap:Number(b.dataset.lap)}));
  await page.clock.runFor(1200);const start=await sample();
  await page.clock.runFor(3000);const downhill=await sample();
  assert.ok(downhill.top>start.top&&downhill.width>start.width);
  let disappeared=false,returned=false;
  for(let n=0;n<55;n++){
   await page.clock.runFor(500);const p=await sample();
   if(p.hidden)disappeared=true;
   if(disappeared&&!p.hidden&&p.lap>=1){returned=true;break;}
  }
  assert.ok(disappeared&&returned);
  assert.match(await page.locator('#counter').innerText(),/10 \/ 15/);
  // Verify catching the spoken target after a missed lap, on both mouse and touch.
  const number=(await page.locator('#instruction').innerText()).match(/number (\w+)/)[1];
  const names=['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN'];
  const right=page.locator(`[data-value="${names.indexOf(number)+1}"]`);
  for(let n=0;n<65;n++){const ready=await right.evaluate(b=>!b.hidden&&Number(b.style.opacity)>.8&&parseFloat(b.style.top)>65&&parseFloat(b.style.top)<85);if(ready)break;await page.clock.runFor(500);}
  if(mobile)await right.tap({force:true});else await right.click({force:true});
  await page.clock.runFor(850);
  assert.match(await page.locator('#counter').innerText(),/11 \/ 15/);
  await page.getByRole('button',{name:'Reduce animation',exact:true}).click();
  await page.clock.runFor(50);
  assert.equal(await page.locator('.pumpkin:visible').count(),4);
  const still=await sample();await page.clock.runFor(2000);assert.equal((await sample()).top,still.top);
  await page.getByRole('button',{name:'Reduce animation',exact:true}).click();
  await page.clock.runFor(3000);
  await page.locator('#board').screenshot({path:`test-results/pumpkin-hill-${mobile?'mobile':'desktop'}.png`});
  assert.deepEqual(errors,[]);
  console.log(`${mobile?'Mobile':'Desktop'}: downhill movement, rolling, disappearance, respawn, no lost coins, catch and reduced motion passed.`);
  await page.close();
 }
}finally{await browser.close();}
