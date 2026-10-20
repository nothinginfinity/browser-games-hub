// R2 Attacker Lab: local, deterministic, renderer-independent adversarial mode.
// No ranking authority, remote player, or creator-controlled executable code.
import {begin,createGame,setLane,spawnEnemy,tick} from './sim.js';

export const ATTACK_RULES = Object.freeze({
  schema:'AttackerLabR2A', ruleset:'neon-lanes-attacker-lab-r2a-v1',
  ticksPerSecond:30, roundTicks:1800, startEnergy:65, energyCap:120,
  regenPerSecond:8, activeEnemyCap:12, maxSpawns:55,
  defenderShields:5, startLane:1
});
export const ATTACK_UNITS = Object.freeze({
  basic:Object.freeze({id:'basic',name:'SCOUT',cost:18,cooldownTicks:21,hp:2,speed:13,glyph:'●',color:'#55cfff'}),
  fast:Object.freeze({id:'fast',name:'RAIDER',cost:32,cooldownTicks:42,hp:2,speed:24,glyph:'◆',color:'#ff80ad'}),
  tank:Object.freeze({id:'tank',name:'BRUISER',cost:50,cooldownTicks:66,hp:9,speed:9,glyph:'⬡',color:'#ffca75'})
});
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
const finiteInt=v=>Number.isSafeInteger(v);
export function createAttackMatch(seed=271828){
 if(!finiteInt(seed)||seed===0||seed>2147483647||seed< -2147483648)throw new Error('invalid_seed');
 const defender=createGame(seed);
 defender.health=ATTACK_RULES.defenderShields;
 defender.maxHealth=ATTACK_RULES.defenderShields;
 defender.nextEnemy=Infinity;defender.nextGate=Infinity;
 defender.nextShot=0.14;defender.player=ATTACK_RULES.startLane;defender.target=ATTACK_RULES.startLane;
 defender.stats.damage=1.65;defender.stats.fireRate=1.75;
 return {schema:ATTACK_RULES.schema,seed,phase:'ready',tick:0,energy:ATTACK_RULES.startEnergy,
  defender,commands:[],lastSpawn:{basic:-10000,fast:-10000,tank:-10000},
  outcome:null,lastError:null};
}
export function beginAttack(match){
 if(match.phase==='ready'){match.phase='running';begin(match.defender)}
 return match;
}
function orderTarget(game){
 let threat=null;
 for(const enemy of game.enemies){
  if(!threat||enemy.z<threat.z||(enemy.z===threat.z&&enemy.id<threat.id))threat=enemy;
 }
 return threat?threat.lane:ATTACK_RULES.startLane;
}
export function dispatchAttack(match,unitId,lane){
 const fail=error=>({ok:false,error});
 if(!match||match.schema!==ATTACK_RULES.schema||match.phase!=='running')return fail('not_running');
 if(typeof unitId!=='string'||!own(ATTACK_UNITS,unitId))return fail('invalid_unit');
 if(!finiteInt(lane)||lane<0||lane>2)return fail('invalid_lane');
 const unit=ATTACK_UNITS[unitId];
 if(match.commands.length>=ATTACK_RULES.maxSpawns)return fail('spawn_quota');
 if(match.defender.enemies.length>=ATTACK_RULES.activeEnemyCap)return fail('active_cap');
 if(match.tick-match.lastSpawn[unitId]<unit.cooldownTicks)return fail('cooldown');
 if(match.energy+1e-8<unit.cost)return fail('not_enough_energy');
 match.energy=Math.max(0,match.energy-unit.cost);
 match.lastSpawn[unitId]=match.tick;
 // All combat attributes come exclusively from the fixed catalog.
 spawnEnemy(match.defender,{type:unit.id,lane,hp:unit.hp,speed:unit.speed,z:100});
 match.commands.push({tick:match.tick,unit:unitId,lane});
 match.lastError=null;
 return {ok:true,tick:match.tick,unit:unitId,lane};
}
export function stepAttack(match,steps=1){
 if(!finiteInt(steps)||steps<0||steps>300)throw new Error('invalid_steps');
 for(let i=0;i<steps&&match.phase==='running';i++){
  setLane(match.defender,orderTarget(match.defender));
  match.energy=Math.min(ATTACK_RULES.energyCap,match.energy+ATTACK_RULES.regenPerSecond/ATTACK_RULES.ticksPerSecond);
  tick(match.defender,1/ATTACK_RULES.ticksPerSecond);
  match.tick++;
  if(match.defender.health<=0){
   match.phase='complete';match.outcome='attacker';match.defender.mode='over';
  }else if(match.tick>=ATTACK_RULES.roundTicks){
   match.phase='complete';match.outcome='defender';match.defender.mode='over';
  }
 }
 return match;
}
export function attackSummary(match){
 return {phase:match.phase,outcome:match.outcome,seed:match.seed,ticks:match.tick,
  shields:match.defender.health,breaches:ATTACK_RULES.defenderShields-match.defender.health,
  defenderKills:match.defender.kills,spawns:match.commands.length,
  energy:Math.round(match.energy*1000)/1000,
  activeEnemies:match.defender.enemies.length};
}
export function exportAttackPlan(match){
 if(!match||match.schema!==ATTACK_RULES.schema)throw new Error('invalid_match');
 return {schema:'AttackPlanV1',ruleset:ATTACK_RULES.ruleset,
  seed:match.seed,commands:match.commands.map(({tick,unit,lane})=>({tick,unit,lane}))};
}
export function validateAttackPlan(plan){
 if(!plan||typeof plan!=='object'||Array.isArray(plan)||plan.schema!=='AttackPlanV1'||plan.ruleset!==ATTACK_RULES.ruleset
  ||!finiteInt(plan.seed)||plan.seed===0||plan.seed>2147483647||plan.seed< -2147483648
  ||!Array.isArray(plan.commands)||plan.commands.length>ATTACK_RULES.maxSpawns)return false;
 let lastTick=-1;
 for(const c of plan.commands){
  if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).length!==3||!own(c,'tick')||!own(c,'unit')||!own(c,'lane')||!finiteInt(c.tick)
    ||c.tick<lastTick||c.tick<0||c.tick>=ATTACK_RULES.roundTicks
    ||typeof c.unit!=='string'||!own(ATTACK_UNITS,c.unit)||!finiteInt(c.lane)||c.lane<0||c.lane>2)return false;
  lastTick=c.tick;
 }
 return true;
}
// Replays only legal, catalog-bound commands. Nothing from a plan can set health,
// energy, points, cooldowns, unit stats, or a result.
export function replayAttackPlan(plan){
 if(!validateAttackPlan(plan))throw new Error('invalid_plan');
 const match=createAttackMatch(plan.seed);beginAttack(match);
 let index=0;
 while(match.phase==='running'){
  while(index<plan.commands.length&&plan.commands[index].tick===match.tick){
   const c=plan.commands[index++];
   const receipt=dispatchAttack(match,c.unit,c.lane);
   if(!receipt.ok)throw new Error('illegal_plan_'+receipt.error);
  }
  stepAttack(match);
 }
 if(index!==plan.commands.length)throw new Error('actions_after_result');
 return match;
}
