import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const viewport of [{width:1366,height:768},{width:390,height:844},{width:844,height:390}]){
  const mobile=viewport.width<800||viewport.height<500;
  const page=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-10-15T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-15T00:00:01Z'));
  await page.goto('http://127.0.0.1:4173/?preview=ghosts');
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  for(const index of [0,4,1,3,2,0,4]){
   await page.clock.runFor(450);
   let ghost=page.locator(`.object[data-index="${index}"]`);
   const target=(await page.locator("#instruction").innerText()).match(/Shoot the ([a-z]+) ghost/)[1];
   if(index===4)ghost=page.locator(`.object[data-value="${target}"]`);
   else if(await ghost.getAttribute("data-value")===target)ghost=page.locator(`.object[data-index="${(index+1)%5}"]`);
   if(mobile)await ghost.tap({force:true});else await ghost.click({force:true});
   await page.clock.runFor(35);
   const check=async()=>page.evaluate(()=>{
    const beam=document.querySelector('.beam'),gun=document.querySelector('.blaster');
    const ghost=document.querySelector(`.object[data-value="${beam.dataset.target}"]`);
    const target=ghost.getBoundingClientRect(),board=gun.offsetParent,r=board.getBoundingClientRect();
    const sx=r.width/board.offsetWidth,sy=r.height/board.offsetHeight;
    const pivot={x:r.left+(gun.offsetLeft+gun.offsetWidth*.5)*sx,y:r.top+(gun.offsetTop+gun.offsetHeight*.845)*sy};
    const rotation=parseFloat(getComputedStyle(gun).rotate)*Math.PI/180;
    const expectedMuzzle={x:pivot.x+Math.sin(rotation)*gun.offsetHeight*.64*sy,y:pivot.y-Math.cos(rotation)*gun.offsetHeight*.64*sy};
    const x=parseFloat(beam.style.left),y=parseFloat(beam.style.top),length=parseFloat(beam.style.width);
    const angle=parseFloat(beam.style.transform.match(/rotate\(([^r]+)rad/)[1]);
    return {muzzleError:Math.hypot(x-expectedMuzzle.x,y-expectedMuzzle.y),targetError:Math.hypot(x+Math.cos(angle)*length-target.left-target.width/2,y+Math.sin(angle)*length-target.top-target.height/2)};
   });
   let result=await check();assert.ok(result.muzzleError<1&&result.targetError<2,JSON.stringify(result));
   await page.clock.runFor(100);result=await check();assert.ok(result.muzzleError<1&&result.targetError<2,JSON.stringify(result));
   if(index===4)await page.screenshot({path:`test-results/blaster-aim-${viewport.width}x${viewport.height}.png`});
   await page.clock.runFor(950);
  }
  assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: repeated left/right shots leave the muzzle and track the selected ghost.`);
  await page.close();
 }
}finally{await browser.close();}
