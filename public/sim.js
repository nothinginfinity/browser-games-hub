// Neon Lanes deterministic, renderer-independent game simulation.
// All simulation distances are game units, never pixels.
export const LANES = 3;
export const UPGRADES = Object.freeze({
  damage: { label: "POWER", desc: "More damage per hit", base: 45 },
  fireRate: { label: "RAPID", desc: "Shoot faster", base: 55 },
  multishot: { label: "SPLIT", desc: "Cover more lanes", base: 100 },
  pierce: { label: "PIERCE", desc: "Shots pass through targets", base: 80 },
  splash: { label: "BLAST", desc: "Explosive damage to nearby targets", base: 90 }
});
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function random(state) {
  let n=state.seed|0;
  n^=n<<13;n^=n>>>17;n^=n<<5;
  state.seed=n|0;
  return (n>>>0)/4294967296;
}
export function createGame(seed=Date.now()) {
 return {seed:(seed|0)||123456, mode:"ready",time:0,wave:1,score:0,coins:0,kills:0,
  health:5,maxHealth:5,player:1,target:1,combo:0,comboUntil:0,
  nextEnemy:0.7,nextGate:10.5,nextShot:0.2,sequence:0,
  stats:{damage:1,fireRate:1,multishot:1,pierce:0,splash:0},
  levels:{damage:0,fireRate:0,multishot:0,pierce:0,splash:0},
  enemies:[],gates:[],shots:[],events:[]};
}
export function begin(game){if(game.mode==="ready"||game.mode==="paused")game.mode="running";return game}
export function togglePause(game){if(game.mode==="running")game.mode="paused";else if(game.mode==="paused")game.mode="running"}
export function setLane(game,lane){game.target=clamp(Math.round(lane),0,LANES-1)}
export function upgradeCost(game,key){return UPGRADES[key]?Math.round(UPGRADES[key].base*Math.pow(1.58,game.levels[key])):Infinity}
export function purchase(game,key){
 if(!UPGRADES[key]||game.mode==="over")return false;
 if(key==="multishot"&&game.stats.multishot>=3)return false;
 if(key==="pierce"&&game.stats.pierce>=4)return false;
 if(key==="splash"&&game.stats.splash>=3)return false;
 const cost=upgradeCost(game,key);
 if(game.coins<cost)return false;
 game.coins-=cost;game.levels[key]++;
 if(key==="damage")game.stats.damage+=0.65;
 if(key==="fireRate")game.stats.fireRate=Math.min(5,game.stats.fireRate+0.28);
 if(key==="multishot")game.stats.multishot++;
 if(key==="pierce")game.stats.pierce++;
 if(key==="splash")game.stats.splash++;
 game.events.push({type:"upgrade",label:UPGRADES[key].label});
 return true;
}
export function spawnEnemy(game,custom={}) {
 const lane=custom.lane??Math.floor(random(game)*LANES);
 const type=custom.type??(game.wave>=3&&random(game)<0.16?"tank":random(game)<0.27?"fast":"basic");
 const hp=custom.hp??Math.ceil((type==="tank"?4:type==="fast"?1:2)+(game.wave-1)*0.63);
 const enemy={id:++game.sequence,lane,z:custom.z??100,hp,maxHp:hp,type,
  speed:custom.speed??(type==="fast"?18:type==="tank"?9:12)+Math.min(game.wave*0.55,7),hitAt:-1};
 game.enemies.push(enemy);return enemy;
}
export function spawnGate(game,custom={}) {
 const boosts=["damage","fireRate","multishot","coins","heal"];
 const kind=custom.kind??boosts[Math.floor(random(game)*boosts.length)];
 const gate={id:++game.sequence,lane:custom.lane??Math.floor(random(game)*LANES),z:custom.z??97,kind,speed:13};
 game.gates.push(gate);return gate;
}
function shoot(game){
 const primary=Math.round(game.player), count=game.stats.multishot;
 let lanes=count===1?[primary]:count===3?[0,1,2]:[primary,primary===2?1:primary+1];
 for(const lane of new Set(lanes)){
   game.shots.push({id:++game.sequence,lane,z:7,damage:game.stats.damage,pierce:game.stats.pierce,
     splash:game.stats.splash});
 }
 game.events.push({type:"shoot",lane:primary});
}
function destroy(game,enemy){
 game.enemies.splice(game.enemies.indexOf(enemy),1);
 game.kills++;game.combo=game.time<=game.comboUntil?game.combo+1:1;
 game.comboUntil=game.time+3;
 const earned=(enemy.type==="tank"?26:enemy.type==="fast"?15:12)+Math.min(game.combo,10)*2;
 game.coins+=earned;game.score+=Math.round(earned*(1+Math.min(game.combo,15)*0.12));
 game.events.push({type:"destroy",lane:enemy.lane,z:enemy.z,earned,combo:game.combo});
}
function gateBonus(game,kind){
 if(kind==="damage")game.stats.damage+=0.5;
 if(kind==="fireRate")game.stats.fireRate=Math.min(5,game.stats.fireRate+0.28);
 if(kind==="multishot")game.stats.multishot=Math.min(3,game.stats.multishot+1);
 if(kind==="coins")game.coins+=85;
 if(kind==="heal")game.health=Math.min(game.maxHealth,game.health+1);
 game.events.push({type:"gate",label:kind.toUpperCase()});
}
export function tick(game,rawDt){
 if(game.mode!=="running")return game;
 const dt=clamp(rawDt,0,0.05);
 game.events.length=0;
 game.time+=dt;
 const wave=1+Math.floor(game.time/24);
 if(wave>game.wave){game.wave=wave;game.coins+=35;game.events.push({type:"wave",wave})}
 game.player+=(game.target-game.player)*Math.min(1,dt*18);
 game.nextEnemy-=dt;game.nextGate-=dt;game.nextShot-=dt;
 if(game.nextEnemy<=0){
   spawnEnemy(game);
   game.nextEnemy=Math.max(0.46,1.65-game.wave*0.095)+(random(game)*0.42);
 }
 if(game.nextGate<=0){
   spawnGate(game);
   game.nextGate=11+random(game)*5;
 }
 if(game.nextShot<=0){
   shoot(game);
   game.nextShot=Math.max(.10,.52/game.stats.fireRate);
 }
 for(const e of [...game.enemies]){
  e.z-=e.speed*dt;
  if(e.z<=3){
    game.enemies.splice(game.enemies.indexOf(e),1);
    game.health--;game.combo=0;
    game.events.push({type:"damage",lane:e.lane});
  }
 }
 for(const g of [...game.gates]){
  g.z-=g.speed*dt;
  if(g.z<=6){
   if(Math.round(game.player)===g.lane)gateBonus(game,g.kind);
   game.gates.splice(game.gates.indexOf(g),1);
  }
 }
 for(const shot of [...game.shots]){
  const oldZ=shot.z;shot.z+=82*dt;
  for(const enemy of [...game.enemies]){
   if(enemy.lane!==shot.lane||enemy.z<oldZ-3||enemy.z>shot.z+3||enemy.hitAt===shot.id)continue;
   enemy.hitAt=shot.id;enemy.hp-=shot.damage;
   game.events.push({type:"hit",lane:enemy.lane,z:enemy.z});
   if(shot.splash>0){
    for(const other of [...game.enemies])if(other!==enemy&&Math.abs(other.z-enemy.z)<11&&Math.abs(other.lane-enemy.lane)<=1)other.hp-=shot.damage*(0.18+shot.splash*0.12);
   }
   for(const fallen of [...game.enemies])if(fallen.hp<=0)destroy(game,fallen);
   if(shot.pierce<=0){game.shots.splice(game.shots.indexOf(shot),1);break}
   shot.pierce--;
  }
  if(shot.z>104){const i=game.shots.indexOf(shot);if(i>=0)game.shots.splice(i,1)}
 }
 if(game.health<=0){game.health=0;game.mode="over";game.events.push({type:"over",score:game.score})}
 return game;
}
