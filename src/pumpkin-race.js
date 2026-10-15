import {PUMPKIN_RACE as race} from './config.js';

export function pumpkinPosition(time,index,count=4){
  const cycle=time/race.cycleSeconds+index/count;
  const lap=Math.floor(cycle);
  const fraction=cycle-lap;
  if(fraction>=race.rollingFraction)return {visible:false,lap};
  const t=fraction/race.rollingFraction;
  const u=1-t;
  const [a,b,c,d]=race.path;
  const coordinate=axis=>u*u*u*a[axis]+3*u*u*t*b[axis]+3*u*t*t*c[axis]+t*t*t*d[axis];
  return {
    visible:true,lap,t,
    x:coordinate(0),
    y:coordinate(1)-Math.abs(Math.sin(t*Math.PI*7))*.6,
    size:race.startSize+(race.endSize-race.startSize)*t,
    angle:t*-430,
    opacity:Math.min(1,t/.07,(1-t)/.1)
  };
}

export function movePumpkin(button,position){
  button.hidden=!position.visible;
  button.dataset.lap=position.lap;
  if(!position.visible)return;
  button.style.left=`${position.x}%`;
  button.style.top=`${position.y}%`;
  button.style.width=`${position.size}%`;
  button.style.height='auto';
  button.style.opacity=position.opacity;
  button.style.zIndex=String(2+Math.floor(position.t*10));
  button.style.setProperty('--roll-angle',`${position.angle}deg`);
}
