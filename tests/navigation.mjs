import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peakway-boo-v1')));
  for(const [m,asset] of [[1,'attic-art.png'],[2,'garden-art.png'],[0,'room-art.png']]){
   const card=page.locator(`.mission-card[data-mission="${m}"]`);
   if(mobile)await card.tap();else await card.click();
   await page.locator('#board').waitFor();
   assert.ok((await page.locator('#board>.landscape').getAttribute('src')).endsWith(asset));
   assert.equal((await state()).mission,m);
   const s=await state();const right=page.locator(`[data-value="${s.orders[m][0]}"]`);
   if(mobile)await right.tap({force:true});else await right.click({force:true});
   await page.waitForTimeout(850);
   assert.equal((await state()).round,1);
   await page.screenshot({path:`test-results/art-${mobile?'mobile':'desktop'}-mission-${m+1}.png`,fullPage:true});
   await page.getByRole('button',{name:'Back to missions',exact:true}).click();
  }
  assert.equal((await state()).earned.length,3);
  await page.reload();
  assert.equal((await state()).earned.length,3);
  await page.screenshot({path:`test-results/art-${mobile?'mobile':'desktop'}-menu.png`,fullPage:true});
  await page.locator('.mission-card[data-mission="1"]').click();
  assert.equal((await state()).round,1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Artwork navigation passed on desktop and mobile: all three cards, backgrounds, answers, return, reload, resume.');
}finally{await browser.close();}
