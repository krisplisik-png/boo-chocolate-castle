import {ASSETS,MISSIONS} from './config.js';
import {progress} from './state.js';
const art=(key,cls='',alt='')=>`<img src="${ASSETS[key]}" class="${cls}" alt="${alt}" draggable="false">`;

export function lobbyHTML(state){
 return `<h1 class="sr-only">Boo’s Chocolate Castle Adventure</h1><div class="lobby-map">${art('home-map','map-art','Boo’s Chocolate Castle Adventure — choose a mission')}${MISSIONS.map((m,i)=>`<button class="mission-card map-hotspot map-mission map-mission-${i}" data-mission="${i}" aria-label="Play mission ${i+1}: ${m}" ${progress(state,i)===5?'disabled':''}>${progress(state,i)>0?`<span class="map-badge">${progress(state,i)===5?'✓ COMPLETED':`${progress(state,i)} / 5`}</span>`:''}</button>`).join('')}<button id="start" class="map-hotspot lobby-start" aria-label="START ADVENTURE"><span class="sr-only">START ADVENTURE</span></button></div>${state.card?'<button class="secondary lobby-old-card" id="old-card">View my reward card</button>':''}`;
}

export function finaleHTML(){
 return `<div class="finale"><div class="final-title"><span class="eyebrow">15 MAGIC CHOCOLATE COINS</span><h2>Boo’s Magic Chest</h2></div><div class="chest-glow"></div><div class="magic-chest"><div class="chest-aura"></div><canvas id="rising-reward" class="rising-reward" width="1254" height="1254" aria-label="Your numbered reward card"></canvas>${art('chest','chest-piece chest-bottom')}${art('chest','chest-piece chest-lid')}</div><div class="chest-coins">${Array.from({length:15},(_,i)=>`<img src="${ASSETS.coin}" style="--i:${i}" alt="">`).join('')}</div><p class="final-status" role="status">Your magic surprise is almost ready…</p><button class="secondary retry-card" id="retry-card" hidden>Повторить получение номера</button></div>`;
}

export function rewardHTML(state){
 return `<div class="reward-scene"><div class="reward-display"><canvas id="reward" width="1254" height="1254" role="img" aria-label="Peakway Autumn Magic Fest 2026. Boo's Magic Helper. Reward card ${state.card}"></canvas></div><div class="reward-panel"><span class="eyebrow">PEAKWAY · AUTUMN MAGIC FEST 2026</span><h2>You’re a Magic Helper!</h2><p class="reward-number">REWARD № ${state.card}</p><p class="reward-count">15 / 15 CHOCOLATE COINS</p><div class="reward-actions"><button class="primary" id="download">SAVE MY CARD ↓</button><button class="secondary" id="again">PLAY AGAIN ↻</button><button class="text-button" id="parents">Для родителей · ВК и новая карточка</button></div><p id="export-status" role="status"></p></div></div><dialog id="parents-dialog"><button class="dialog-close" id="close-parents" aria-label="Close parent information">×</button><div class="parents" lang="ru"><b>Маленькое приключение — большая победа!</b><p>Поздравляем! Сделайте скриншот или сохраните карточку. Прикрепите её в комментариях к конкурсному посту нашей группы ВК, чтобы получить звезду в Magic Passport!</p><a href="https://vk.ru/owlenglish" target="_blank" rel="noopener noreferrer">Группа Peakway ВКонтакте ↗</a><p>Обычная повторная игра сохраняет номер вашей награды.</p><button class="secondary" id="new-card">Начать новое приключение и получить новую карточку</button><p id="parent-stats"></p></div></dialog>`;
}

export async function paintReward(canvas,card){
 const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=ASSETS['reward-background'];});
 const ctx=canvas.getContext('2d');
 ctx.drawImage(image,0,0,1254,1254);
 // Cover only the blank number line; keep the supplied artwork intact.
 ctx.fillStyle='#fff0cd';ctx.fillRect(593,1110,145,48);
 ctx.fillStyle='#57216e';ctx.textAlign='center';ctx.font='bold 25px Georgia';
 ctx.fillText(card,660,1145,164);
 ctx.fillStyle='#fff3d7';ctx.font='bold 15px Georgia';
 ctx.shadowColor='#3a1453';ctx.shadowBlur=5;
 ctx.fillText('PEAKWAY ENGLISH STUDIO · AUTUMN MAGIC FEST 2026',627,1212,740);
 ctx.shadowBlur=0;
}
