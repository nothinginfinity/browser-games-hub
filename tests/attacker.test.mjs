import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnEnemy} from '../public/sim.js';
import {ATTACK_RULES,ATTACK_UNITS,createAttackMatch,beginAttack,dispatchAttack,stepAttack,attackSummary,exportAttackPlan,replayAttackPlan,validateAttackPlan} from '../public/attacker.js';
test('Attacker Lab starts separate from R1 with a fixed clock and no automatic enemies or gates',()=>{
 const m=createAttackMatch(123);assert.equal(m.phase,'ready');assert.equal(m.energy,65);
 beginAttack(m);stepAttack(m,90);assert.equal(m.tick,90);
 assert.equal(m.defender.gates.length,0);assert.equal(m.defender.enemies.length,0);assert.equal(m.defender.health,5);
});
test('catalog-bounded deployment rejects illegal enemy types, lanes and unaffordable units',()=>{
 const m=createAttackMatch(50);beginAttack(m);
 const before=attackSummary(m);
 assert.equal(dispatchAttack(m,'boss',1).error,'invalid_unit');
 assert.equal(dispatchAttack(m,'basic',-1).error,'invalid_lane');
 assert.equal(dispatchAttack(m,'basic',1.5).error,'invalid_lane');
 assert.equal(dispatchAttack(m,'tank',2).ok,true);
 assert.equal(dispatchAttack(m,'fast',2).error,'not_enough_energy');
 assert.equal(m.commands.length,1);assert.equal(m.defender.enemies[0].hp,ATTACK_UNITS.tank.hp);
 assert.equal(m.defender.enemies[0].speed,ATTACK_UNITS.tank.speed);
 assert.equal(before.shields,m.defender.health);
});
test('per-unit cooldown, refill and spawn quota are enforced by the simulation',()=>{
 const m=createAttackMatch(9);beginAttack(m);
 assert.equal(dispatchAttack(m,'basic',0).ok,true);
 assert.equal(dispatchAttack(m,'basic',1).error,'cooldown');
 stepAttack(m,ATTACK_UNITS.basic.cooldownTicks-1);
 assert.equal(dispatchAttack(m,'basic',1).error,'cooldown');
 stepAttack(m);
 assert.equal(dispatchAttack(m,'basic',1).ok,true);
 assert.ok(m.energy<=ATTACK_RULES.energyCap);
 m.energy=ATTACK_RULES.energyCap;m.defender.enemies=Array.from({length:ATTACK_RULES.activeEnemyCap},(_,i)=>({id:i,lane:0,z:90,hp:1}));
 assert.equal(dispatchAttack(m,'fast',0).error,'active_cap');
});
test('round timer ends with defender victory when core survives',()=>{
 const m=createAttackMatch(88);beginAttack(m);stepAttack(m,300);
 for(let i=0;i<6;i++)stepAttack(m,300);
 assert.equal(m.phase,'complete');assert.equal(m.outcome,'defender');
 assert.equal(m.tick,ATTACK_RULES.roundTicks);
 assert.equal(dispatchAttack(m,'basic',0).error,'not_running');
});
test('core breach ends with attacker victory',()=>{
 const m=createAttackMatch(1);beginAttack(m);m.defender.health=1;
 spawnEnemy(m.defender,{lane:2,z:3.1,speed:20,hp:20});
 stepAttack(m);assert.equal(m.outcome,'attacker');assert.equal(m.defender.health,0);
});
test('same seed and ordered legal commands replay identical outcomes',()=>{
 const m=createAttackMatch(9876);beginAttack(m);
 for(let t=0;t<ATTACK_RULES.roundTicks&&m.phase==='running';t++){
  if(t%64===0){const unit=(t%192===0?'tank':t%128===0?'fast':'basic');dispatchAttack(m,unit,(t/64)%3)}
  stepAttack(m);
 }
 const plan=exportAttackPlan(m);
 assert.ok(validateAttackPlan(plan));
 const replay=replayAttackPlan(plan);
 assert.deepEqual(attackSummary(replay),attackSummary(m));
 assert.deepEqual(exportAttackPlan(replay),plan);
});
test('forged plan and overspending reject rather than create a winning replay',()=>{
 const base=createAttackMatch(2);beginAttack(base);
 const p=exportAttackPlan(base);
 assert.equal(validateAttackPlan({...p,commands:[{tick:0,unit:'boss',lane:0}]}),false);
 assert.equal(validateAttackPlan({...p,commands:[{tick:-1,unit:'basic',lane:0}]}),false);
 assert.equal(validateAttackPlan({...p,commands:[{tick:0,unit:'basic',lane:3}]}),false);
 assert.throws(()=>replayAttackPlan({...p,commands:[{tick:0,unit:'tank',lane:0},{tick:0,unit:'tank',lane:1}]}),/illegal_plan/);
 assert.throws(()=>replayAttackPlan({...p,commands:[{tick:ATTACK_RULES.roundTicks,unit:'basic',lane:0}]}),/invalid_plan/);
});
