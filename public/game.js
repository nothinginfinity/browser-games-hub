import {createGame,begin,tick,setLane,togglePause,purchase,upgradeCost,UPGRADES} from './sim.js';
const el=id=>document.getElementById(id);
const canvas=el('arena'),ctx=canvas.getContext('2d',{alpha:false});
let game=createGame(),last=0,W=700,H=500,particles=[],bannerUntil=0,sound=false,audio=null;
const glyph={damage:'✦',fireRate:'↯',multishot:'⋈',pierce:'➶',splash:'◎'};
const palette={basic:'#48ceff',fast:'#ff6da9',tank:'#ffca68'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const best=()=>{try{return Number(localStorage.getItem('neon-lanes-best'))||0}catch{return 0}};
function saveBest(){try{if(game.score>best())localStorage.setItem('neon-lanes-best',String(game.score))}catch{}}
function overlay(title,description,action){
 el('overlayTitle').innerHTML=title;el('overlayDesc').textContent=description;
 el('play').innerHTML=action+' <span>↗</span>';
 el('best').textContent='PERSONAL BEST / '+String(best()).padStart(6,'0');
 el('overlay').hidden=false;
}
function notify(message){el('banner').textContent=message;el('banner').classList.add('show');bannerUntil=performance.now()+1100}
function tone(freq=520,duration=.07){
 if(!sound)return;
 try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();
 const osc=audio.createOscillator(),gain=audio.createGain();
 osc.type='triangle';osc.frequency.setValueAtTime(freq,audio.currentTime);
 osc.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);
 gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
 osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration)}catch{}
}
el('play').addEventListener('click',()=>{
 if(game.mode!=='paused'){game=createGame();particles=[]}
 begin(game);el('overlay').hidden=true;canvas.focus({preventScroll:true});hud();
});
el('pause').addEventListener('click',()=>{
 if(game.mode!=='running'&&game.mode!=='paused')return;
 togglePause(game);
 if(game.mode==='paused')overlay('SYSTEM <span>PAUSED.</span>','Your run is safely paused.','RESUME RUN');
 else el('overlay').hidden=true;
});
el('sound').addEventListener('click',()=>{sound=!sound;el('sound').textContent=sound?'♫':'♪';el('sound').setAttribute('aria-label',sound?'Mute':'Enable sound');tone(800,.12)});
function move(n){if(game.mode==='running')setLane(game,game.target+n)}
el('left').addEventListener('click',()=>move(-1));el('right').addEventListener('click',()=>move(1));
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(k==='arrowleft'||k==='a'){if(game.mode==='running')e.preventDefault();move(-1)}
 if(k==='arrowright'||k==='d'){if(game.mode==='running')e.preventDefault();move(1)}
 if((k===' '||k==='escape')&&(game.mode==='running'||game.mode==='paused')){e.preventDefault();el('pause').click()}
 if(k==='enter'&&game.mode!=='running')el('play').click();
});
function toLane(x){const b=canvas.getBoundingClientRect();return clamp(Math.round(((x-b.left)/b.width)*3-.5),0,2)}
let pointer=null;
canvas.addEventListener('pointerdown',e=>{if(game.mode!=='running')return;pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);setLane(game,toLane(e.clientX))});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer&&game.mode==='running')setLane(game,toLane(e.clientX))});
canvas.addEventListener('pointerup',e=>{if(e.pointerId===pointer)pointer=null});
canvas.addEventListener('pointercancel',()=>pointer=null);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.mode==='running')el('pause').click()});
const shop={};
for(const [key,data] of Object.entries(UPGRADES)){
 const b=document.createElement('button');b.type='button';b.className='upgrade';
 b.setAttribute('aria-label','Buy '+data.label+' upgrade');
 b.innerHTML='<span class="upgrade-icon">'+glyph[key]+'</span><span class="upgrade-title">'+data.label+'</span><span class="upgrade-desc">'+data.desc+'</span><span class="upgrade-cost"><span class="price"></span><span class="upgrade-level"></span></span>';
 b.addEventListener('click',()=>{if(purchase(game,key)){notify(data.label+' UPGRADED');tone(860,.16);hud()}});
 el('upgrades').appendChild(b);shop[key]=b;
}
function hud(){
 el('score').textContent=String(game.score).padStart(6,'0');
 el('wave').textContent=String(game.wave).padStart(2,'0');
 el('health').textContent='♥ '.repeat(game.health).trim()||'EMPTY';
 el('coins').textContent=game.coins.toLocaleString('en-US');el('wallet').textContent=game.coins.toLocaleString('en-US');
 el('streak').textContent=game.combo>1&&game.time<game.comboUntil?'✦ '+game.combo+'× COMBO':'NO COMBO';
 const s=Math.floor(game.time);el('seconds').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
 el('pause').textContent=game.mode==='paused'?'▶':'Ⅱ';
 for(const key of Object.keys(shop)){
  const b=shop[key],max=(key==='multishot'&&game.stats.multishot>=3)||(key==='pierce'&&game.stats.pierce>=4)||(key==='splash'&&game.stats.splash>=3);
  const cost=upgradeCost(game,key);
  b.querySelector('.price').textContent=max?'MAX':'◈ '+cost.toLocaleString('en-US');
  b.querySelector('.upgrade-level').textContent='LV '+String(game.levels[key]).padStart(2,'0');
  b.disabled=max||game.coins<cost||game.mode==='over';b.classList.toggle('ready',!b.disabled);
 }
}
function resize(){const b=canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);W=b.width;H=b.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);
if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);
resize();
const stars=Array.from({length:60},(_,i)=>({x:((i*61813+2371)%1000)/1000,y:((i*30467+711)%1000)/1000,r:i%5===0?1.5:.8}));
function project(lane,z){const depth=clamp(1-z/100,0,1);return{x:W/2+(lane-1)*W*(.075+.285*Math.pow(depth,1.08)),y:H*(.26+.68*Math.pow(depth,1.34)),scale:.25+depth*1.8,depth}}
function path(points,fill,stroke,lw=1){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
function line(a,b,color,lw=1,alpha=1){ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineWidth=lw;ctx.strokeStyle=color;ctx.stroke();ctx.globalAlpha=1}
function glow(x,y,r,color,alpha=.3){const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');ctx.globalAlpha=alpha;ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1}
function polygon(x,y,r,n,angle=0){ctx.beginPath();for(let i=0;i<n;i++){const a=angle+i*2*Math.PI/n,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)}ctx.closePath()}
function background(){
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#090e26');bg.addColorStop(.6,'#162741');bg.addColorStop(1,'#0d1729');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 for(const s of stars){ctx.globalAlpha=.3+.3*Math.sin(game.time+s.x*15)**2;ctx.fillStyle='#b7ecff';ctx.fillRect(s.x*W,s.y*H*.46,s.r,s.r)}ctx.globalAlpha=1;
 glow(W/2,H*.26,W*.42,'#35b5ff',.18);
 ctx.fillStyle='#182d4b';ctx.beginPath();ctx.moveTo(0,H*.27);for(let i=0;i<=16;i++)ctx.lineTo(i*W/16,H*.26-12-Math.sin(i*2.3)*10);ctx.lineTo(W,H*.31);ctx.lineTo(0,H*.31);ctx.fill();
 path([project(-.5,100),project(2.5,100),project(2.5,0),project(-.5,0)],'#102238','#36738a',1.3);
 const floor=ctx.createLinearGradient(0,H*.26,0,H);floor.addColorStop(0,'#1b364a');floor.addColorStop(1,'#0b1a2e');
 path([project(-.39,100),project(2.39,100),project(2.39,0),project(-.39,0)],floor);
 const offset=(game.time*14)%12;
 for(let z=-12;z<110;z+=12){const depth=z+offset;if(depth>=0&&depth<=100)line(project(-.5,depth),project(2.5,depth),'#5b96ae',.5+project(1,depth).depth*1.2,.23)}
 for(const lane of [.5,1.5]){ctx.setLineDash([6,13]);line(project(lane,100),project(lane,0),'#75aac6',1.4,.38);ctx.setLineDash([])}
 for(const lane of [-.5,2.5])line(project(lane,100),project(lane,0),'#65f9d7',2,.75);
}
function enemy(e){
 const p=project(e.lane,e.z),r=clamp(15*p.scale,4,34),col=palette[e.type],y=p.y-r*.2+Math.sin(game.time*3+e.id)*p.scale*2;
 glow(p.x,y,r*2.7,col,.23);ctx.fillStyle='#071321';ctx.strokeStyle=col;ctx.lineWidth=Math.max(1.5,2*p.scale);
 if(e.type==='basic'){ctx.beginPath();ctx.arc(p.x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(p.x,y,r*.55,0,Math.PI*2);ctx.stroke()}
 else {polygon(p.x,y,r,e.type==='tank'?6:4,game.time*(e.type==='fast'?1.1:.15)+Math.PI/4);ctx.fill();ctx.stroke();polygon(p.x,y,r*.6,e.type==='tank'?6:4,Math.PI/4);ctx.stroke()}
 ctx.fillStyle='#051020';ctx.fillRect(p.x-r,y-r-8*p.scale,r*2,3*p.scale);
 ctx.fillStyle=col;ctx.fillRect(p.x-r,y-r-8*p.scale,r*2*clamp(e.hp/Math.max(1,e.maxHp),0,1),3*p.scale);
 ctx.font='bold '+Math.max(9,11*p.scale)+'px monospace';ctx.textAlign='center';ctx.fillStyle=col;ctx.fillText(Math.ceil(e.hp),p.x,y+3*p.scale);
}
function gate(g){const p=project(g.lane,g.z),w=33*p.scale,h=46*p.scale,col=g.kind==='heal'?'#ff82a8':g.kind==='coins'?'#fbd17e':'#6af9d3';
 glow(p.x,p.y-h*.45,w*1.9,col,.28);
 ctx.fillStyle='#08252cd9';ctx.strokeStyle=col;ctx.lineWidth=2*p.scale;ctx.fillRect(p.x-w/2,p.y-h,w,h);ctx.strokeRect(p.x-w/2,p.y-h,w,h);
 const label={damage:'+DMG',fireRate:'+RATE',multishot:'+SHOT',coins:'+85',heal:'+LIFE'}[g.kind];
 ctx.fillStyle=col;ctx.textAlign='center';ctx.font='900 '+Math.max(10,12*p.scale)+'px "Barlow Condensed",sans-serif';ctx.fillText(label,p.x,p.y-h*.5);
 ctx.font='500 '+Math.max(7,7*p.scale)+'px monospace';ctx.fillText('GATE',p.x,p.y-h*.23);
}
function player(){const p=project(game.player,4),s=clamp(W*.057,18,39),y=p.y-13;
 glow(p.x,y,s*2.3,'#60fbe5',.32);
 ctx.save();ctx.translate(p.x,y+Math.sin(game.time*8)*1.7);
 path([{x:0,y:-s*1.5},{x:s*.85,y:s*.75},{x:0,y:s*.4},{x:-s*.85,y:s*.75}],'#092038','#6af9d3',2.4);
 path([{x:0,y:-s},{x:s*.3,y:s*.42},{x:0,y:s*.18},{x:-s*.3,y:s*.42}],'#4ff4d4');
 if(game.mode==='running'){
  const f=1.1+Math.sin(game.time*25)*.18;
  path([{x:-s*.5,y:s*.7},{x:-s*.14,y:s*f},{x:-s*.15,y:s*.65}],'#5cceff');
  path([{x:s*.5,y:s*.7},{x:s*.14,y:s*f},{x:s*.15,y:s*.65}],'#5cceff');
 }
 ctx.restore();ctx.textAlign='center';ctx.font='10px monospace';ctx.fillStyle='#76e8da';ctx.fillText('◈ LANE '+(Math.round(game.target)+1),p.x,Math.min(H-11,p.y+s*1.8));
}
function projectile(b){const p=project(b.lane,b.z),r=3*p.scale;glow(p.x,p.y,Math.max(10,17*p.scale),'#7dffe5',.52);line({x:p.x,y:p.y+r*3},{x:p.x,y:p.y-r*4},'#a2fff6',Math.max(2,r*1.6))}
function spark(x,y,col,n=9){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=25+Math.random()*100;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:.55+Math.random()*.4,color:col})}if(particles.length>190)particles=particles.slice(-190)}
function events(){
 for(const e of game.events){
  if(e.type==='destroy'){const p=project(e.lane,e.z);spark(p.x,p.y,'#7bffdc',14);tone(420+Math.min(220,e.combo*15));if(e.combo>=3&&e.combo%3===0)notify(e.combo+'× COMBO')}
  if(e.type==='hit'){const p=project(e.lane,e.z);spark(p.x,p.y,'#65d7ff',2)}
  if(e.type==='gate'){notify('BOOST // '+e.label);tone(900,.17)}
  if(e.type==='damage'){notify('CORE HIT!');tone(170,.23)}
  if(e.type==='wave'){notify('WAVE '+String(e.wave).padStart(2,'0'));tone(700,.2)}
  if(e.type==='over'){saveBest();tone(120,.35);overlay('CORE <span>BREACHED.</span>','Wave '+game.wave+' reached. '+game.kills+' enemies shattered. Final score: '+game.score.toLocaleString('en-US')+'.','RESTART RUN')}
 }
}
function draw(dt){
 background();
 const objects=[...game.enemies.map(v=>({z:v.z,draw:()=>enemy(v)})),...game.gates.map(v=>({z:v.z,draw:()=>gate(v)}))];
 if(game.mode==='ready'&&objects.length===0){
  for(const e of [{id:0,lane:0,z:68,hp:2,maxHp:2,type:'basic'},{id:1,lane:2,z:55,hp:3,maxHp:3,type:'fast'},{id:2,lane:1,z:83,hp:6,maxHp:6,type:'tank'}])objects.push({z:e.z,draw:()=>enemy(e)});
 }
 objects.sort((a,b)=>b.z-a.z);for(const o of objects)o.draw();
 for(const b of game.shots)projectile(b);player();
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=65*dt;p.t-=dt;ctx.globalAlpha=clamp(p.t,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)}
 ctx.globalAlpha=1;particles=particles.filter(p=>p.t>0);
 const vignette=ctx.createRadialGradient(W/2,H*.45,W*.1,W/2,H*.45,W*.75);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#020713ba');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
}
function frame(t){const dt=last?Math.min(.05,(t-last)/1000):0;last=t;
 if(game.mode==='running'){tick(game,dt);events()}
 if(t>=bannerUntil)el('banner').classList.remove('show');
 draw(game.mode==='running'?dt:0);hud();requestAnimationFrame(frame);
}
overlay('DEFEND THE <span>CORE.</span>','Move between three lanes. Your turret fires automatically. Shatter incoming shapes, collect credits, and upgrade your arsenal.','INITIALIZE RUN');
requestAnimationFrame(frame);
