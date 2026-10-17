export const ITEMS=['pen','rubber','book','chair','pencil'];
export const COLORS={red:'#f16a73',blue:'#62b5f4',green:'#88d798',yellow:'#ffe277',pink:'#f6a4ce'};
export const NUMBERS=['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN'];
export const PUMPKIN_RACE={
  cycleSeconds:13,
  rollingFraction:.86,
  // Percent coordinates follow the garden path from the distant gate downhill.
  path:[[69,52],[65,63],[48,82],[27,112]],
  startSize:8,
  endSize:24
};
export const MISSIONS=['Mystery Castle Room','Ghost Color Blaster','Number Pumpkin Race'];
export const POSITIONS={pen:[5.5,60.8,13.3,5.4],rubber:[33,65.1,7.1,5.2],book:[20.1,48.3,16.1,8],chair:[76.6,42.7,13.6,40.5],pencil:[40.2,48.7,5.2,12.7]};
export const AUDIO={}; // e.g. 'find-pen': 'public/assets/audio/find-pen.mp3'
export const ASSETS=Object.fromEntries(['boo','castle','room','garden','courtyard','pen','rubber','book','chair','pencil','coin','blaster','pumpkin','chest','chest-open','reward-background',...Object.keys(COLORS).map(c=>'ghost-'+c)].map(n=>[n,`public/assets/${n}.svg`]));
export const LINES={welcome:"Hello, my friend! I'm Boo! Let's find my chocolate coins! Are you ready?",good:'Great job!',wrong:'Try again!',wrongGhost:'Oops! Try again!',next:"Fantastic! Let's find the last five coins!",fifteen:'You did it! We have fifteen chocolate coins!',finish:'Congratulations! You are a Magic Helper!'};

Object.assign(ASSETS, { 'home-map':'public/assets/home-map.png', room:'public/assets/room-art.png', courtyard:'public/assets/attic-art.png', garden:'public/assets/garden-art.png', 'mission-1':'public/assets/mission-1.png', 'mission-2':'public/assets/mission-2.png', 'mission-3':'public/assets/mission-3.png' });


const githubPagesOrigin=globalThis.location?.hostname==='krisplisik-png.github.io'&&globalThis.location.pathname.startsWith('/boo-chocolate-castle/')?'https://boos-chocolate-castle-2026.cozy-coati-7988.chatgpt.site':'';
export const COUNTER_API=githubPagesOrigin; // GitHub Pages uses the shared public D1 counter.
Object.assign(ASSETS,{coin:'public/assets/medal-art.png',chest:'public/assets/chest-cutout.png','chest-open':'public/assets/chest-cutout.png','reward-background':'public/assets/reward-art.png'});
