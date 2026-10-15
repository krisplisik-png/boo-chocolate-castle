import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const viewport of [{width:1366,height:768},{width:390,height:844},{width:844,height:390},{width:360,height:640}]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const scene of ['home','room','ghosts','pumpkins','complete','final','card']){
   await page.goto(`${base}/?preview=${scene}`);
   await page.waitForTimeout(scene==='final'?3100:250);
   const size=await page.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,bw:document.body.scrollWidth,bh:document.body.scrollHeight}));
   assert.ok(size.sw<=size.w&&size.bw<=size.w,`${scene} horizontal overflow: ${JSON.stringify(size)}`);
   assert.ok(size.sh<=size.h&&size.bh<=size.h,`${scene} vertical overflow: ${JSON.stringify(size)}`);
   for(const selector of scene==='home'?['.mission-card','#start']:scene==='card'?['#reward','#download','#again']:scene==='final'?['.magic-chest']:scene==='complete'?['#next','#choose-mission']:['#board','#repeat','#back-missions','.speech']){
    for(const node of await page.locator(selector).all()){
     const box=await node.boundingBox();assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,`${scene} ${selector} outside screen at ${viewport.width}x${viewport.height}: ${JSON.stringify(box)}`);
    }
   }
   if(['room','ghosts','pumpkins'].includes(scene)){
    assert.equal(await page.locator('.round-medal').count(),5);
    assert.ok((await page.locator('.round-medal').first().getAttribute('src')).endsWith('medal-art.png'));
   }
   await page.screenshot({path:`test-results/fullscreen-${viewport.width}x${viewport.height}-${scene}.png`});
  }
  assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: lobby, all missions, opening chest and reward fit without scroll.`);
  await page.close();
 }
}finally{await browser.close();}
