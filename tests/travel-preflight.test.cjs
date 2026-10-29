const {test}=require('node:test'),assert=require('node:assert/strict');
const {getCatalog}=require('../shared/catalog.cjs');
const places=getCatalog('上海').places;
test('Selected destination warnings reveal own hard limits without changing private preferences',async()=>{
 const {preferenceWarnings}=await import('../web/travel-preflight.js');
 const p={wants:['sh-disney'],must:[],budget:500,maxWalk:5},before=JSON.stringify(p),r={days:2,startDate:'2026-11-08'};
 const warnings=preferenceWarnings(p,places,r);assert.equal(warnings.length,1);assert.match(warnings[0].text,/1130/);assert.match(warnings[0].text,/9.6 km/);assert.equal(JSON.stringify(p),before);
 assert.equal(preferenceWarnings({...p,budget:1200,maxWalk:12},places,r).length,0);
 assert.equal(preferenceWarnings({...p,wants:[]},places,r).length,0);
});
test('Preflight distinguishes all-closed dates from a usable date and catches too many mandatory full days',async()=>{
 const {preferenceWarnings}=await import('../web/travel-preflight.js');
 const p={must:['sh-garden'],budget:2000,maxWalk:12};
 assert.equal(preferenceWarnings(p,places,{days:1,startDate:'2026-11-09'})[0].target,'place');
 assert.equal(preferenceWarnings(p,places,{days:2,startDate:'2026-11-08'}).length,0);
 assert.equal(preferenceWarnings({...p,must:['sh-disney','sh-astronomy']},places,{days:1,startDate:'2026-11-08'})[0].target,'restrictions');
});
test('Reading a historical, stale, finalized or closed plan never enables a fresh response',async()=>{
 const {canRespondToPlan}=await import('../web/travel-preflight.js');
 const p={id:'plan-a',version:2,inputRevision:4,estimationVersion:2},r={inputRevision:4,proposals:[p]};
 assert.ok(canRespondToPlan(r,p));
 for(const room of [{...r,closed:true},{...r,final:{}},{...r,inputRevision:5},{...r,proposals:[]}])assert.equal(canRespondToPlan(room,p),false);
 assert.equal(canRespondToPlan(r,{...p,version:1}),false);assert.equal(canRespondToPlan(r,p,true),false);
});
