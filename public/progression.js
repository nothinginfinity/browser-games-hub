// R1 same-origin prototype progress. LOCAL/UNVERIFIED: never use for competitive authority.
export const LEVELS=Object.freeze({
 "001":Object.freeze({id:"001",manifestVersion:1,rulesetId:"neon-lanes-r1",scorePolicy:"per-level-reset/career-cumulative",verificationPolicy:"local-unverified",allowedItems:["damage","fireRate","multishot","pierce","splash"],version:"1.0.0",creatorId:"browser-games-hub",title:"Neon Lanes",subtitle:"Core Defense",url:"/",difficulty:Object.freeze({enemyHealth:0,speedMultiplier:1,spawnIntervalMultiplier:1}),caps:Object.freeze({damage:32,fireRate:32,multishot:2,pierce:4,splash:3})}),
 "002":Object.freeze({id:"002",manifestVersion:1,rulesetId:"neon-lanes-r1-overdrive",scorePolicy:"per-level-reset/career-cumulative",verificationPolicy:"local-unverified",allowedItems:["damage","fireRate","multishot","pierce","splash"],version:"1.0.0",creatorId:"browser-games-hub",title:"Neon Lanes: Overdrive",subtitle:"The Gauntlet",url:"/levels/002/",difficulty:Object.freeze({enemyHealth:2,speedMultiplier:1.18,spawnIntervalMultiplier:0.78}),caps:Object.freeze({damage:5,fireRate:6,multishot:2,pierce:2,splash:1})})
});
export const SNAPSHOT_KEY="neon-lanes-run-snapshot-v1", PORTAL_KEY="neon-lanes-portal-v1";
const KEYS=["damage","fireRate","multishot","pierce","splash"];
const limits={damage:32,fireRate:32,multishot:2,pierce:4,splash:3};
const integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
export function freshSnapshot(levelId="001",now=Date.now()){
 return {schema:"RunSnapshotV1",levelId,levelVersion:LEVELS[levelId].version,runId:"local-"+now+"-"+Math.random().toString(36).slice(2),careerScore:0,levelScore:0,creditedScore:0,coins:0,levels:{damage:0,fireRate:0,multishot:0,pierce:0,splash:0},updatedAt:now};
}
export function validSnapshot(s,now=Date.now()){
 return !!s&&typeof s==="object"&&!Array.isArray(s)&&s.schema==="RunSnapshotV1"&&!!LEVELS[s.levelId]&&s.levelVersion===LEVELS[s.levelId].version&&typeof s.runId==="string"&&/^local-[a-zA-Z0-9.-]{3,110}$/.test(s.runId)&&integer(s.careerScore,1e9)&&integer(s.levelScore,1e8)&&integer(s.creditedScore,s.levelScore)&&s.careerScore>=s.creditedScore&&integer(s.coins,1e7)&&!!s.levels&&typeof s.levels==="object"&&KEYS.every(k=>integer(s.levels[k],limits[k]))&&integer(s.updatedAt,9e15)&&s.updatedAt<=now+60000;
}
export function loadSnapshot(storage,now=Date.now()){
 try {const raw=storage.getItem(SNAPSHOT_KEY);if(raw===null)return {status:"empty",snapshot:null};const value=JSON.parse(raw);return validSnapshot(value,now)?{status:"ok",snapshot:value}:{status:"invalid",snapshot:null}}catch{return {status:"invalid",snapshot:null}}
}
export function saveSnapshot(storage,snapshot,now=Date.now()){
 if(!validSnapshot(snapshot,now))return false;
 try{storage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshot));return true}catch{return false}
}
export function applyLoadout(game,levels,levelId){
 const caps=LEVELS[levelId].caps;
 for(const k of KEYS)game.levels[k]=Math.min(levels[k]||0,caps[k]);
 game.stats.damage=1+0.65*game.levels.damage;
 game.stats.fireRate=Math.min(5,1+0.28*game.levels.fireRate);
 game.stats.multishot=1+game.levels.multishot;
 game.stats.pierce=game.levels.pierce;
 game.stats.splash=game.levels.splash;
 game.difficulty=LEVELS[levelId].difficulty;
 return game;
}
export function syncProgress(snapshot,game,levelId,now=Date.now()){
 if(!validSnapshot(snapshot,now)||!LEVELS[levelId]||snapshot.levelId!==levelId)return null;
 const score=Math.floor(game.score),coins=Math.floor(game.coins);
 if(!integer(score,1e8)||!integer(coins,1e7))return null;
 const delta=Math.max(0,score-snapshot.creditedScore);
 if(snapshot.careerScore+delta>1e9)return null;
 const levels={...snapshot.levels};
 for(const k of KEYS){const n=Math.floor(game.levels[k]);if(!integer(n,limits[k]))return null;levels[k]=Math.max(levels[k],n)}
 return {...snapshot,careerScore:snapshot.careerScore+delta,levelScore:score,creditedScore:Math.max(snapshot.creditedScore,score),coins,levels,updatedAt:now};
}
export function enterLevel(snapshot,levelId,now=Date.now()){
 if(!LEVELS[levelId])throw new Error("unknown_level");
 if(!snapshot)return freshSnapshot(levelId,now);
 if(!validSnapshot(snapshot,now))throw new Error("invalid_progress");
 if(snapshot.levelId===levelId)return snapshot;
 return {...snapshot,levelId,levelVersion:LEVELS[levelId].version,runId:"local-"+now+"-"+Math.random().toString(36).slice(2),levelScore:0,creditedScore:0,updatedAt:now};
}
export function restartLevel(snapshot,levelId,now=Date.now()){
 if(!validSnapshot(snapshot,now)||snapshot.levelId!==levelId)return freshSnapshot(levelId,now);
 return {...snapshot,runId:"local-"+now+"-"+Math.random().toString(36).slice(2),levelScore:0,creditedScore:0,updatedAt:now};
}
export function createPortal(storage,snapshot,toLevelId,now=Date.now()){
 if(!validSnapshot(snapshot,now)||!LEVELS[toLevelId]||snapshot.levelId===toLevelId)return null;
 const id="p-"+now+"-"+Math.random().toString(36).slice(2);
 const ticket={schema:"LocalPortalV1",id,from:snapshot.levelId,to:toLevelId,issuedAt:now,expiresAt:now+5*60*1000,snapshot};
 try{storage.setItem(PORTAL_KEY,JSON.stringify(ticket));return id}catch{return null}
}
export function redeemPortal(storage,id,toLevelId,now=Date.now()){
 let raw=null;try{raw=storage.getItem(PORTAL_KEY);storage.removeItem(PORTAL_KEY)}catch{return {ok:false,error:"storage_unavailable"}}
 if(!raw)return {ok:false,error:"missing_or_replayed"};
 let p;try{p=JSON.parse(raw)}catch{return {ok:false,error:"invalid_ticket"}}
 if(!p||p.schema!=="LocalPortalV1"||typeof id!=="string"||id.length>128||p.id!==id||p.to!==toLevelId||!LEVELS[p.from]||p.from===p.to||!integer(p.issuedAt,9e15)||!integer(p.expiresAt,9e15)||p.expiresAt!==p.issuedAt+300000||p.issuedAt>now+60000||p.expiresAt<now||!validSnapshot(p.snapshot,now)||p.snapshot.levelId!==p.from||p.snapshot.updatedAt>p.issuedAt)return {ok:false,error:"invalid_or_expired"};
 return {ok:true,snapshot:enterLevel(p.snapshot,toLevelId,now)};
}
