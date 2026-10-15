// The SVG points upward: pivot = (100,169), muzzle = (100,41), viewBox 200x200.
export function aimGeometry(pivot,target,muzzleDistance){
 const dx=target.x-pivot.x,dy=target.y-pivot.y;
 const distance=Math.hypot(dx,dy);
 const ux=distance?dx/distance:0,uy=distance?dy/distance:-1;
 const reach=Math.min(muzzleDistance,distance);
 return {
  angle:Math.atan2(ux,-uy)*180/Math.PI,
  muzzle:{x:pivot.x+ux*reach,y:pivot.y+uy*reach},
  beamAngle:Math.atan2(uy,ux),
  beamLength:Math.max(0,distance-reach)
 };
}

export function pointBlaster(gun,x,y){
 const board=gun.offsetParent;
 const r=board.getBoundingClientRect();
 const sx=r.width/board.offsetWidth,sy=r.height/board.offsetHeight;
 // Read the fixed layout coordinates, never the bounding box of the rotated gun.
 const pivot={x:r.left+(gun.offsetLeft+gun.offsetWidth*.5)*sx,y:r.top+(gun.offsetTop+gun.offsetHeight*.845)*sy};
 const geometry=aimGeometry(pivot,{x,y},gun.offsetHeight*.64*sy);
 gun.style.rotate=`${geometry.angle}deg`;
 return geometry;
}
