import {ASSETS,ITEMS,COLORS,NUMBERS,MISSIONS,POSITIONS,LINES} from './config.js';
import {KEY,fresh,restore,shuffle,award,progress,enterMission} from './state.js';
import {Sound} from './audio.js';
import {pointBlaster} from './blaster.js';
import {registerVisit,registerCompletion} from './registration.js';
import {lobbyHTML,finaleHTML,rewardHTML,paintReward} from './screens.js';
import {pumpkinPosition,movePumpkin} from './pumpkin-race.js';
const app=document.querySelector('#app'),fx=document.querySelector('#effects'),sound=new Sound();
const preview=new URLSearchParams(location.search).get('preview');
let storageOK=true;function read(){try{return localStorage.getItem(KEY);}catch{storageOK=false;return null;}}
let state=restore(read()),busy=false,errors=0,timers=[],frame=0,last=performance.now(),phase=0,lastAction=performance.now();
if(preview){state=fresh();const i=['room','ghosts','pumpkins'].indexOf(preview);if(i>=0){state.scene='game';state.mission=i;state.earned=Array.from({length:i*5},(_,n)=>`${Math.floor(n/5)}:${n%5}`);}else if(preview==='complete'){state.scene='complete';state.round=5;state.earned=Array.from({length:5},(_,n)=>`0:${n}`);}else if(['final','card'].includes(preview)){state.scene=preview;state.mission=2;state.round=5;state.earned=Array.from({length:15},(_,n)=>`${Math.floor(n/5)}:${n%5}`);state.card='B1-000000';} }
if(!read())state.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function save(){if(preview)return;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}}
function later(fn,ms){timers.push(setTimeout(fn,ms));}
function img(name,cls='',alt=''){return `<img class="${cls}" src="${ASSETS[name]}" alt="${alt}" draggable="false">`;}
function target(){return state.orders[state.mission][state.round];}
function prompt(){if(state.scene==='game'){const t=target();return state.mission===0?`Find a ${t}!`:state.mission===1?`Shoot the ${t} ghost!`:`Catch number ${NUMBERS[t-1]}!`;}return state.scene==='home'?LINES.welcome:state.scene==='complete'?`Great job! You have ${state.earned.length} chocolate coins! Choose your next mission!`:state.scene==='final'?LINES.fifteen:LINES.finish;}
function promptKey(){return state.scene==='game'?`${['find','shoot','catch'][state.mission]}-${target()}`:state.scene;}
function speakPrompt(){return sound.say(prompt(),promptKey());}
let visitStats=null;
if(!preview)registerVisit().then(stats=>visitStats=stats).catch(()=>{});
function render(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(frame);busy=false;errors=0;sound.muted=state.muted;document.body.classList.toggle('reduced',state.reduced);
document.body.dataset.scene=state.scene;
const backdrop=state.scene==='home'?'home-map':state.scene==='game'?['room','courtyard','garden'][state.mission]:'garden';
app.style.setProperty('--scene-art',`url("${new URL(ASSETS[backdrop],document.baseURI).href}")`);
app.innerHTML=`<header class="game-hud"><a class="brand" href="./" aria-label="Peakway home"><span class="brand-mark">&#10022;</span> peakway<span class="brand-small">ENGLISH STUDIO</span></a><div id="counter" class="counter">${img('coin')}<span>Chocolate Coins: <b>${state.earned.length} / 15</b></span></div><div class="tools"><button id="sound" class="icon-button" aria-label="${state.muted?'Enable':'Mute'} sound" aria-pressed="${state.muted}">${state.muted?'&#9835;&#824;':'&#9835;'}</button><button id="motion" class="icon-button" aria-label="Reduce animation" aria-pressed="${state.reduced}">&#10023;</button><button id="fullscreen" class="icon-button" aria-label="Fullscreen">&#9974;</button></div></header><main><section id="stage" class="stage ${state.scene==='home'?'home':''}"></section></main>${preview?'<p class="preview-label">SCENE PREVIEW</p>':''}${!storageOK?'<p class="storage-note">Progress cannot be saved in this browser.</p>':''}`;
document.querySelector('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{});};
document.querySelector('#sound').onclick=()=>{state.muted=!state.muted;sound.muted=state.muted;sound.stop();save();document.querySelector('#sound').setAttribute('aria-pressed',state.muted);document.querySelector('#sound').setAttribute('aria-label',state.muted?'Enable sound':'Mute sound');document.querySelector('#sound').textContent=state.muted?'♫̸':'♫';if(!state.muted){sound.unlock();speakPrompt();}};
document.querySelector('#motion').onclick=()=>{state.reduced=!state.reduced;document.body.classList.toggle('reduced',state.reduced);document.querySelector('#motion').setAttribute('aria-pressed',state.reduced);save();};
const stage=document.querySelector('#stage');
if(state.scene==='home')home(stage);else if(state.scene==='game')game(stage);else if(state.scene==='complete')complete(stage);else if(state.scene==='final')finale(stage);else card(stage);
}
function goHome(){if(busy)return;sound.stop();state.scene='home';save();render();}
async function openMission(m,hello=false){
 if(busy||progress(state,m)===5)return;
 busy=true;sound.unlock();
 document.querySelectorAll('.mission-card,.map-hotspot,#start').forEach(b=>b.disabled=true);
 if(hello)await sound.say(LINES.welcome,'welcome');else sound.stop();
 enterMission(state,m);save();render();speakPrompt();
}
function home(el){
 el.innerHTML=lobbyHTML(state);
 el.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>openMission(Number(b.dataset.mission),state.earned.length===0));
 document.querySelector('#start').onclick=()=>{const m=[0,1,2].find(i=>progress(state,i)<5);if(m===undefined){state.scene='card';save();render();}else openMission(m,state.earned.length===0);};
 document.querySelector('#old-card')?.addEventListener('click',()=>{state.scene='card';save();render();});
}
function game(el){const m=state.mission;el.innerHTML=`<div class="mission-heading"><button id="back-missions" class="back-missions" aria-label="Back to missions">&larr; <span>MISSIONS</span></button><div><span class="eyebrow">MISSION 0${m+1} <span class="round">${state.round+1} OF 5</span></span><h2>${MISSIONS[m]}</h2></div><button id="repeat" class="repeat" aria-label="Repeat instruction">♫ <span>LISTEN AGAIN</span></button></div><div class="speech">${img('boo')}<div><span>BOO SAYS</span><p id="instruction" aria-live="polite">${prompt()}</p></div><div class="round-dots">${[0,1,2,3,4].map(i=>`<img class="round-medal ${i<state.round?'filled':''}" src="${ASSETS.coin}" alt="${i<state.round?'Collected medal':'Medal to collect'}">`).join('')}</div></div><div class="board ${['room','courtyard','garden'][m]}" id="board">${img(['room','courtyard','garden'][m],'landscape')}<div id="objects"></div>${m===1?img('blaster','blaster'):''}${m===2?'<span class="leaf l1">❧</span><span class="leaf l2">❧</span>':''}</div><div class="game-caption">${['Look around the room. Tap what Boo asks for.','Aim a little magic. Tap the right color!','Catch the number Boo says as the pumpkins roll down the hill!'][m]} <span>No rush. You can always try again.</span></div>`;
document.querySelector('#back-missions').onclick=goHome;document.querySelector('#repeat').onclick=()=>{sound.unlock();speakPrompt();};const objects=document.querySelector('#objects');
let choices=m===0?ITEMS:m===1?Object.keys(COLORS):shuffle([target(),...shuffle([1,2,3,4,5,6,7,8,9,10].filter(n=>n!==target())).slice(0,3)]);
objects.innerHTML=choices.map((v,i)=>{const found=m===0&&state.orders[0].slice(0,state.round).includes(v);const p=m===0?POSITIONS[v]:[8+i*(m===1?18:23),m===1?22+(i%2)*20:53+(i%2)*6,m===1?14:17,m===1?28:32];return `<button class="object ${found?'found':''} ${m===2?'pumpkin':''}" data-value="${v}" data-index="${i}" style="left:${p[0]}%;top:${p[1]}%;width:${p[2]}%;height:${p[3]}%" aria-label="${m===2?'Number '+v:v}" ${found?'disabled':''}>${m===0?`<svg viewBox="${p[0]*16.72} ${p[1]*9.41} ${p[2]*16.72} ${p[3]*9.41}" preserveAspectRatio="none" aria-hidden="true"><image width="1672" height="941" href="${ASSETS.room}"/></svg>`:img(m===1?'ghost-'+v:'pumpkin')}${m===2?`<strong>${v}</strong>`:''}${found?'<span class="found-check">✓</span>':''}</button>`;}).join('');
objects.querySelectorAll('button').forEach(b=>b.onclick=e=>answer(m===2?Number(b.dataset.value):b.dataset.value,b,e));
document.querySelector('#board').onclick=e=>{if(m===0&&e.target.classList.contains('landscape'))wrong(null);};
if(m===1)document.querySelector('#board').onpointermove=e=>{const ghost=e.target.closest('.object');if(ghost){const r=ghost.getBoundingClientRect();aim(r.left+r.width/2,r.top+r.height/2);}else aim(e.clientX,e.clientY);};
last=performance.now();lastAction=last;phase=0;animate();}
function animate(now=performance.now()){
 const delta=Math.min((now-last)/1000,.05);last=now;
 if(!busy)phase+=delta*(now-lastAction>6500?.45:1)*(state.mission===2?1+state.round*.06:1);
 const buttons=document.querySelectorAll('.object');
 buttons.forEach((button,i)=>{
  if(button.classList.contains('shot-target'))return;
  if(state.mission===0)return;
  if(state.mission===2){
   // Reduced motion keeps four large, stationary choices available.
   if(state.reduced){button.hidden=false;button.style.cssText=`left:${8+i*23}%;top:${56+(i%2)*7}%;width:17%;height:auto;opacity:1`;return;}
   movePumpkin(button,pumpkinPosition(phase,i,buttons.length));
   return;
  }
  if(state.reduced)return;
  button.style.translate=`${Math.sin(phase*.55+i*1.6)*12}% ${Math.sin(phase*.8+i*1.7)*12}%`;
 });
 frame=requestAnimationFrame(animate);
}
let activeShot=null;
function aim(x,y){const gun=document.querySelector('.blaster');if(gun&&!activeShot)pointBlaster(gun,x,y);}
function shot(ghost){
 activeShot?.stop();
 const gun=document.querySelector('.blaster');
 ghost.classList.add('shot-target');
 const beam=document.createElement('div');beam.className='beam';
 beam.dataset.target=ghost.dataset.value;fx.append(beam);
 let animation=0,finished=false;
 const current={stop(){if(finished)return;finished=true;cancelAnimationFrame(animation);beam.remove();ghost.classList.remove('shot-target');if(activeShot===current)activeShot=null;}};
 activeShot=current;
 const track=()=>{
  if(!ghost.isConnected||!gun.isConnected){current.stop();return;}
  const r=ghost.getBoundingClientRect();
  const g=pointBlaster(gun,r.left+r.width/2,r.top+r.height/2);
  beam.style.cssText=`left:${g.muzzle.x}px;top:${g.muzzle.y}px;width:${g.beamLength}px;transform:translateY(-50%) rotate(${g.beamAngle}rad)`;
  animation=requestAnimationFrame(track);
 };
 track();setTimeout(()=>current.stop(),350);sound.tone('shot');
}
function wrong(b){if(busy)return;errors++;lastAction=performance.now();sound.tone('wrong');sound.say(state.mission===1?LINES.wrongGhost:LINES.wrong,'wrong');if(b){b.classList.remove('wiggle');void b.offsetWidth;b.classList.add('wiggle');}if(errors>=2)document.querySelector(`[data-value="${target()}"]`)?.classList.add('hint');document.querySelector('#instruction').textContent='Try again! '+prompt();}
function burst(x,y,n=12){for(let i=0;i<n;i++){const s=document.createElement('span');s.className='spark';s.textContent='✦';s.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(i/n*Math.PI*2)*(60+Math.random()*60)}px;--dy:${Math.sin(i/n*Math.PI*2)*(60+Math.random()*60)}px;--spin:${i*63}deg`;fx.append(s);setTimeout(()=>s.remove(),1000);}}
function flyCoin(b){const r=b.getBoundingClientRect(),c=document.querySelector('#counter').getBoundingClientRect();const coin=document.createElement('img');coin.src=ASSETS.coin;coin.className='flying-coin';coin.style.cssText=`left:${r.left+r.width/2-30}px;top:${r.top+r.height/2-30}px;--dx:${c.left+c.width/2-r.left-r.width/2}px;--dy:${c.top-r.top-r.height/2}px`;fx.append(coin);setTimeout(()=>{coin.remove();sound.tone();},800);burst(r.left+r.width/2,r.top+r.height/2);}
function answer(v,b){if(busy)return;sound.unlock();lastAction=performance.now();if(state.mission===1)shot(b);if(v!==target()){wrong(b);return;}busy=true;const finalHit=state.earned.length===14;b.classList.add('correct');if(finalHit)b.classList.add('golden');if(!award(state,v)){busy=false;return;}save();flyCoin(b);document.querySelector('#counter b').textContent=`${state.earned.length} / 15`;document.querySelector('#instruction').textContent='Great job!';sound.tone();sound.say(finalHit?LINES.fifteen:LINES.good,finalHit?'fifteen':'good').catch(()=>{});later(()=>{render();if(state.scene!=='final')speakPrompt();},650);}
function complete(el){el.innerHTML=`<div class="completion">${img('room','landscape')}<div class="open-door"><div></div></div><div class="completion-content">${img('boo','complete-boo')}<div class="eyebrow">A LITTLE MORE MAGIC, UNLOCKED</div><h2>MISSION ${state.mission+1} COMPLETED!</h2><p>${state.earned.length} / 15 CHOCOLATE COINS!</p><div class="five-coins">${Array.from({length:5},()=>img('coin')).join('')}</div><button class="primary" id="next">NEXT MISSION →</button><button class="secondary" id="choose-mission">CHOOSE MISSION</button></div></div>`;document.querySelector('#next').onclick=()=>{sound.stop();enterMission(state,[0,1,2].find(i=>progress(state,i)<5));save();render();speakPrompt();};document.querySelector('#choose-mission').onclick=goHome;}
function finale(el){
 el.innerHTML=finaleHTML();
 const currentRun=state.runId;
 let animationDone=false,numberReady=Boolean(state.card),chestOpened=false,finishing=false;
 const openChest=()=>{
  if(!animationDone||chestOpened||state.runId!==currentRun||state.scene!=='final')return;
  chestOpened=true;el.classList.add('opened');
  const r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,24);
 };
 const reveal=()=>{
  if(!animationDone||!numberReady||finishing||state.runId!==currentRun||state.scene!=='final')return;
  finishing=true;
  openChest();el.classList.add('card-ready');
  sound.say(LINES.finish,'finish');
  const canvas=document.querySelector('#rising-reward');
  paintReward(canvas,state.card).catch(()=>{
   const ctx=canvas?.getContext('2d');
   if(ctx){ctx.fillStyle='#35134c';ctx.strokeStyle='#ffc34f';ctx.lineWidth=12;ctx.beginPath();ctx.roundRect(70,70,1114,1114,100);ctx.fill();ctx.stroke();ctx.fillStyle='#fff0c6';ctx.textAlign='center';ctx.font='bold 56px Georgia';ctx.fillText('YOUR REWARD CARD',627,460);ctx.fillStyle='#ffd66c';ctx.font='bold 76px Georgia';ctx.fillText(state.card,627,620);}
  });
  later(()=>{if(state.scene==='final'&&state.runId===currentRun){state.scene='card';save();render();}},2600);
 };
 const register=async()=>{
  const retry=document.querySelector('#retry-card');retry.hidden=true;
  try{
   if(!state.card){const result=await registerCompletion(state);if(state.runId!==currentRun)return;if(typeof result?.card!=='string'||!/^B1-\\d{6,12}$/.test(result.card))throw Error('Invalid reward number');state.card=result.card;visitStats=result;save();}
   numberReady=true;reveal();
  }catch{
   if(state.scene!=='final')return;
   document.querySelector('.final-status').textContent='Your card number could not be reached. The chest is open; try again to reveal your card.';
   retry.hidden=false;
  }
 };
 document.querySelector('#retry-card').onclick=register;
 for(let i=0;i<15;i++)later(()=>sound.tone(),i*140);
 later(()=>{animationDone=true;openChest();reveal();},1800);
 register();
}
function card(el){
 el.innerHTML=rewardHTML(state);drawCard();
 document.querySelector('#download').onclick=download;
 document.querySelector('#again').onclick=()=>restart(false);
 document.querySelector('#new-card').onclick=()=>restart(true);
 document.querySelector('#parents').onclick=()=>{
  const dialog=document.querySelector('#parents-dialog');dialog.showModal();
  document.querySelector('#parent-stats').textContent=visitStats?`?????? ? ?????????: ${visitStats.visited}. ??????????? ???????????: ${visitStats.completed}.`:'';
 };
 document.querySelector('#close-parents').onclick=()=>document.querySelector('#parents-dialog').close();
}
function restart(newCard){sound.stop();const {card,muted,reduced}=state;state=fresh(newCard?null:card);state.muted=muted;state.reduced=reduced;save();render();}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
let drawing;
function drawCard(){
 drawing=paintReward(document.querySelector('#reward'),state.card);
 drawing.catch(()=>{document.querySelector('#export-status').textContent='Card image could not be loaded. Please refresh.';});
}
async function download(){const status=document.querySelector('#export-status');try{await drawing;const c=document.querySelector('#reward');const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error()),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Boo-Magic-Helper-${state.card}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Your card is ready!';}catch{status.textContent='Не удалось сохранить PNG. Сделайте скриншот карточки.';}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)sound.stop();last=performance.now();});
render();
// Browser audio needs a gesture after restoring a session; the repeat button is always available.
