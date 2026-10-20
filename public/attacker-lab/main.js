import {ATTACK_RULES,ATTACK_UNITS,createAttackMatch,beginAttack,dispatchAttack,stepAttack,attackSummary,exportAttackPlan,validateAttackPlan} from '../attacker.js';

const el=id=>document.getElementById(id);
const canvas=el('battlefield'),ctx=canvas.getContext('2d',{alpha:false});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const TICK=1/ATTACK_RULES.ticksPerSecond, ORDER=['basic','fast','tank'];
let match=createAttackMatch(),chosenUnit='basic',chosenLane=1,playback=null,playbackCursor=0,previousPlan=null;
let W=700,H=480,last=0,accumulator=0,paused=false,lastNote='';
function message(text){lastNote=text;el('feedback').textContent=text}
function showOverlay(title,description,button){
 el('overlayTitle').textContent=title;el('overlayText').textContent=description;
 el('start').textContent=button;el('overlay').hidden=false;
}
function launch(replay=false){
 const plan=replay&&previousPlan&&validateAttackPlan(previousPlan)?previousPlan:null;
 playback=plan;playbackCursor=0;match=createAttackMatch(plan?.seed??271828);
 beginAttack(match);paused=false;accumulator=0;last=0;
 el('overlay').hidden=true;el('pause').disabled=false;el('pause').textContent='PAUSE Ⅱ';
 message(plan?'REPLAYING SAVED ATTACK COMMANDS':'SELECT A LANE AND DEPLOY AN ENEMY');
}
function complete(){
 const s=attackSummary(match);
 if(!playback)previousPlan=exportAttackPlan(match);
 el('pause').disabled=true;
 message(s.outcome==='attacker'?'CORE BREACHED — ATTACKER VICTORY':'CORE SURVIVED — DEFENDER VICTORY');
 showOverlay(s.outcome==='attacker'?'CORE BREACHED.':'CORE HELD.',
  s.breaches+' / 5 shields breached · '+s.spawns+' enemies deployed · '+s.defenderKills+' defender eliminations. '+(playback?'Replay complete.':'Use Replay This Attack to reproduce your orders.'),
  'START NEW ATTACK');
}
function deploy(){
 if(playback){message('REPLAY MODE — MANUAL DEPLOYMENTS DISABLED');return}
 const receipt=dispatchAttack(match,chosenUnit,chosenLane);
 if(!receipt.ok){
  const reasons={not_running:'START THE MATCH FIRST',invalid_unit:'UNIT NOT AVAILABLE',invalid_lane:'INVALID LANE',not_enough_energy:'INSUFFICIENT ENERGY',cooldown:'UNIT COOLING DOWN',active_cap:'ACTIVE ENEMY CAP REACHED',spawn_quota:'ROUND SPAWN QUOTA REACHED'};
  message(reasons[receipt.error]||receipt.error);return;
 }
 message(ATTACK_UNITS[receipt.unit].name+' DEPLOYED — LANE 0'+(receipt.lane+1));
}
el('start').addEventListener('click',()=>launch());
el('restart').addEventListener('click',()=>launch());
el('replay').addEventListener('click',()=>{if(previousPlan)launch(true)});
el('deploy').addEventListener('click',deploy);
el('pause').addEventListener('click',()=>{if(match.phase!=='running')return;paused=!paused;el('pause').textContent=paused?'RESUME ▶':'PAUSE Ⅱ';message(paused?'ROUND PAUSED':'ATTACK RESUMED')});
for(const button of document.querySelectorAll('[data-unit]')){
 button.addEventListener('click',()=>{chosenUnit=button.dataset.unit;updateChoices()})
}
for(const button of document.querySelectorAll('[data-lane]')){
 button.addEventListener('click',()=>{chosenLane=Number(button.dataset.lane);updateChoices()})
}
canvas.addEventListener('pointerdown',e=>{
 const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)/b.width;
 chosenLane=clamp(Math.round((x-.2)/.3),0,2);updateChoices();
});
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('button,a,input,textarea'))return;
 if('123'.includes(e.key)){chosenLane=Number(e.key)-1;updateChoices()}
 if('qwe'.includes(e.key.toLowerCase())){chosenUnit=ORDER['qwe'.indexOf(e.key.toLowerCase())];updateChoices()}
 if(e.key===' '&&match.phase==='running'){e.preventDefault();deploy()}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&match.phase==='running'&&!paused){paused=true;el('pause').textContent='RESUME ▶';message('PAUSED IN BACKGROUND')}});
function updateChoices(){
 for(const b of document.querySelectorAll('[data-unit]')){const active=b.dataset.unit===chosenUnit;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))}
 for(const b of document.querySelectorAll('[data-lane]')){const active=Number(b.dataset.lane)===chosenLane;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))}
 el('deploy').innerHTML='DEPLOY '+ATTACK_UNITS[chosenUnit].name+' <span>→</span>';
}
function hud(){
 const remain=Math.ceil(Math.max(0,(ATTACK_RULES.roundTicks-match.tick)/ATTACK_RULES.ticksPerSecond));
 el('clock').textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');
 el('shields').textContent='♥ '.repeat(match.defender.health).trim()||'EMPTY';
 el('breaches').textContent=(5-match.defender.health)+' / 5';
 el('kills').textContent=String(match.defender.kills);
 el('energy').textContent=String(Math.floor(match.energy));
 el('energyBar').style.width=(100*match.energy/ATTACK_RULES.energyCap).toFixed(1)+'%';
 el('energyMeter').setAttribute('aria-valuenow',String(Math.floor(match.energy)));
 el('spawns').textContent=match.commands.length+' / '+ATTACK_RULES.maxSpawns;
 el('active').textContent=match.defender.enemies.length+' / '+ATTACK_RULES.activeEnemyCap;
 el('phase').textContent=playback?'REPLAY / LOCAL':match.phase==='running'?(paused?'PAUSED':'LIVE / OFFLINE SIM'):match.phase==='complete'?'ROUND COMPLETE':'SYSTEM STANDBY';
 el('deploy').disabled=match.phase!=='running'||paused||!!playback;
 el('replay').disabled=!previousPlan;
 for(const unit of ORDER){
  const element=document.querySelector('[data-cooldown="'+unit+'"]');
  const wait=Math.max(0,ATTACK_UNITS[unit].cooldownTicks-(match.tick-match.lastSpawn[unit]));
  element.textContent=wait?Math.ceil(wait/ATTACK_RULES.ticksPerSecond*10)/10+'s COOLING':'READY';
  element.classList.toggle('wait',Boolean(wait));
 }
}
function resize(){
 const box=canvas.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);
 W=box.width;H=box.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);
 ctx.setTransform(d,0,0,d,0,0);
}
window.addEventListener('resize',resize);
if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);
resize();
const colors={basic:'#55cfff',fast:'#ff80ad',tank:'#ffca75'};
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+'48');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function poly(x,y,r,n,angle=0){ctx.beginPath();for(let i=0;i<n;i++){const a=angle+i*2*Math.PI/n;i?ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.closePath()}
function unit(enemy){
 const x=W*(.2+.3*enemy.lane),y=H*(.16+.72*(1-enemy.z/100));
 const r=enemy.type==='tank'?18:enemy.type==='fast'?13:14,col=colors[enemy.type];
 glow(x,y,r*3,col);ctx.lineWidth=2.5;ctx.strokeStyle=col;ctx.fillStyle='#0f2338';
 if(enemy.type==='basic'){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2)}
 else poly(x,y,r,enemy.type==='tank'?6:4,Math.PI/4+match.tick/200);
 ctx.fill();ctx.stroke();ctx.fillStyle=col;
 ctx.font='bold 12px DM Mono,monospace';ctx.textAlign='center';ctx.fillText(Math.max(0,Math.ceil(enemy.hp)),x,y+4);
 ctx.fillStyle='#141e34';ctx.fillRect(x-19,y-r-11,38,4);
 ctx.fillStyle=col;ctx.fillRect(x-19,y-r-11,38*clamp(enemy.hp/enemy.maxHp,0,1),4);
}
function render(){
 const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#10172c');bg.addColorStop(1,'#0b1a2b');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 for(let i=0;i<3;i++){
  const x=W*(.2+.3*i),width=W*.25;
  ctx.fillStyle=chosenLane===i?'#443042':'#132b3d';
  ctx.fillRect(x-width/2,H*.14,width,H*.77);
  ctx.strokeStyle=chosenLane===i?'#f9c27b':'#37526b';ctx.lineWidth=chosenLane===i?2:1;
  ctx.strokeRect(x-width/2,H*.14,width,H*.77);
  for(let j=0;j<=8;j++){const y=H*(.14+j*.096);ctx.strokeStyle='#6494ac38';ctx.beginPath();ctx.moveTo(x-width/2,y);ctx.lineTo(x+width/2,y);ctx.stroke()}
  ctx.fillStyle=chosenLane===i?'#ffd3a1':'#7494ae';ctx.textAlign='center';ctx.font='bold 11px DM Mono,monospace';ctx.fillText('LANE 0'+(i+1),x,H*.13);
  ctx.fillStyle='#a4b0c5';ctx.font='bold 9px DM Mono,monospace';ctx.fillText('DEPLOY ▲',x,H*.18);
 }
 // Spawn frontier and protected core.
 ctx.fillStyle='#ffbf75';ctx.fillRect(0,H*.14,W,2);
 const coreX=W*(.2+.3*match.defender.player),cy=H*.86;
 glow(coreX,cy,52,'#60f9dc');ctx.fillStyle='#15374b';ctx.strokeStyle='#6ffbe0';ctx.lineWidth=3;
 poly(coreX,cy,19,3,-Math.PI/2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#70ffdf';ctx.textAlign='center';ctx.font='bold 10px DM Mono,monospace';ctx.fillText('AUTO DEFENDER',coreX,Math.min(H-7,cy+32));
 for(const enemy of match.defender.enemies)unit(enemy);
 for(const shot of match.defender.shots){
  const x=W*(.2+.3*shot.lane),y=H*(.16+.72*(1-shot.z/100));
  ctx.strokeStyle='#7dffee';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+7);ctx.lineTo(x,y-7);ctx.stroke();
 }
 ctx.fillStyle='#c8ad97';ctx.font='10px DM Mono,monospace';ctx.textAlign='center';
 ctx.fillText('ATTACK FROM ABOVE  /  BREACH THE CORE BELOW',W/2,H*.97);
}
function frame(now){
 const elapsed=last?Math.min(.15,(now-last)/1000):0;last=now;
 if(match.phase==='running'&&!paused){
  accumulator+=elapsed;
  for(let loops=0;accumulator>=TICK&&loops<6&&match.phase==='running';loops++){
   if(playback){
    while(playbackCursor<playback.commands.length&&playback.commands[playbackCursor].tick===match.tick){
     const c=playback.commands[playbackCursor++],res=dispatchAttack(match,c.unit,c.lane);
     if(!res.ok){message('REPLAY INVALID: '+res.error);paused=true;break}
    }
   }
   if(!paused)stepAttack(match);
   accumulator-=TICK;
  }
  if(match.phase==='complete')complete();
 }
 hud();render();requestAnimationFrame(frame);
}
updateChoices();hud();requestAnimationFrame(frame);
