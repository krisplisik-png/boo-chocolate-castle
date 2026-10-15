import {AUDIO} from './config.js';
export class Sound {
 constructor(){this.muted=false;this.token=0;this.active=null;this.ctx=null;}
 unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume();}catch{}}
 stop(){this.token++;window.speechSynthesis?.cancel();if(this.active){this.active.pause();this.active=null;}this.resolve?.();this.resolve=null;}
 async say(text,key){this.stop();if(this.muted)return;const token=this.token;
 if(AUDIO[key]){try{await new Promise((resolve,reject)=>{this.resolve=resolve;const a=this.active=new Audio(AUDIO[key]);a.onended=resolve;a.onerror=reject;a.play().catch(reject);});return;}catch{if(token!==this.token)return;}}
 if(!window.speechSynthesis)return;
 await new Promise(resolve=>{this.resolve=resolve;const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.83;u.pitch=1.15;u.voice=speechSynthesis.getVoices().find(v=>v.lang==='en-GB')||speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'))||null;u.onend=u.onerror=resolve;speechSynthesis.speak(u);setTimeout(resolve,Math.max(3500,text.length*100));});
 }
 tone(kind='coin'){if(this.muted||!this.ctx)return;const t=this.ctx.currentTime;const notes=kind==='shot'?[800,1200]:kind==='wrong'?[330,392]:[659,880,1318];notes.forEach((f,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+i*.09);g.gain.setValueAtTime(0,t+i*.09);g.gain.linearRampToValueAtTime(.07,t+i*.09+.01);g.gain.exponentialRampToValueAtTime(.001,t+i*.09+.22);o.connect(g);g.connect(this.ctx.destination);o.start(t+i*.09);o.stop(t+i*.09+.23);});}
}
