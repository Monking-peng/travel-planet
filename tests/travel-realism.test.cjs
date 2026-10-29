const {test}=require('node:test'),assert=require('node:assert/strict');
const d=require('../shared/domain.cjs'),{generateRules,schedule}=require('../shared/planner.cjs');
const {byId}=require('../shared/catalog.cjs'),{distance,centers,transfer,access}=require('../shared/travel-estimates.cjs');
function room(p={},extra={}){const r=d.create('a',{city:'上海',days:1,startDate:'2026-11-08',...extra});d.apply(r,'a','preferences',{tags:[],wants:[],must:[],avoid:[],budget:2000,maxWalk:12,startHour:9,pace:'relaxed',...p});return r;}
test('Geographic estimates distinguish neighboring towers, crossing Huangpu and the remote Lingang district',()=>{
 assert.ok(distance(byId['sh-pearl'],byId['sh-lujiazui'])<1);
 assert.ok(distance(centers.上海,byId['sh-disney'])>19);
 assert.ok(distance(centers.上海,byId['sh-astronomy'])>50);
 const crossing=transfer(byId['sh-bund'],byId['sh-pearl']);assert.equal(crossing.mode,'公共交通过江');assert.ok(crossing.minutes>=45);assert.ok(crossing.walk>=1);
 const nearby=transfer(byId['sh-pearl'],byId['sh-lujiazui']);assert.equal(nearby.mode,'附近步行');assert.equal(nearby.cost,0);
 const boat=transfer(byId.sudi,byId.santan);assert.match(boat.mode,/乘船/);assert.ok(boat.minutes>=35);
});
test('A day accounts for initial access, all transfers, admission, full visits, lunch and the return with no invisible time gaps',()=>{
 const r=room({must:['sh-bund','sh-pearl','sh-lujiazui']});
 for(const p of generateRules(r)){assert.deepEqual(d.validatePlan(r,p),[]);const day=p.days[0];
  assert.equal(day.breaks.filter(b=>b.kind==='transport').length,day.stops.length+1);
  assert.ok(day.stops[0].startMinute>=9*60+access(byId[day.stops[0].placeId],'上海').minutes);
  const events=[...day.stops,...day.breaks.filter(b=>!b.withinPlaceId)].sort((a,b)=>a.startMinute-b.startMinute);let end=540;
  for(const e of events){assert.equal(e.startMinute,end);end=e.endMinute??e.startMinute+e.minutes;}
  assert.equal(end,day.endMinute);assert.ok(end<=1080);
  const lunch=day.breaks.find(b=>!b.kind);assert.ok(lunch.startMinute>=690&&lunch.startMinute<=810);assert.equal(lunch.minutes,60);
  const c=day.costBreakdown;assert.equal(c.total,c.tickets+c.meals+c.transport+c.contingency);assert.equal(c.total,day.budget);
  assert.equal(c.transport,day.breaks.filter(b=>b.transit).reduce((n,b)=>n+b.transit.cost,0));assert.ok(c.meals>=100&&c.contingency>=20);
  assert.ok(day.walk>day.stops.reduce((n,s)=>n+byId[s.placeId].walk,0));
  assert.ok(day.crossings<=2,'Route does not zigzag between banks');
 }
});
test('A lake island as the first or final stop includes a boat in initial or final access',()=>{
 for(const ids of [['santan','leifeng'],['leifeng','santan']]){const day=schedule(ids,{startHour:8,maxWalk:12});const leg=day.breaks.find(b=>b.leg===(ids[0]==='santan'?'outbound':'inbound'));assert.match(leg.transit.mode,/乘船/);assert.ok(leg.minutes>=70);}
 const r=room({must:['santan'],startHour:8},{city:'杭州'});for(const p of generateRules(r))assert.deepEqual(d.validatePlan(r,p),[]);
});
test('Full-day reserves are synchronized with preflight; late starts and small walking limits are rejected, never silently expanded',()=>{
 for(const id of ['sh-disney','sh-astronomy']){
  const place=byId[id],r=room({must:[id],startHour:8}),p=generateRules(r)[0],day=p.days[0];assert.deepEqual(d.validatePlan(r,p),[]);
  assert.equal(day.budget,place.dayBudget);assert.equal(day.walk,place.dayWalk);
  assert.ok(day.stops[0].startMinute>=480+place.accessMinutes+place.entryMinutes);
  assert.throws(()=>generateRules(room({must:[id],startHour:9})),e=>e.code==='NO_FEASIBLE_PLAN'&&e.message.includes('8:00'));
 }
 assert.throws(()=>generateRules(room({must:['sh-disney'],startHour:8,maxWalk:8})),e=>e.code==='NO_FEASIBLE_PLAN');
 const p=generateRules(room({must:['sh-disney'],startHour:8,budget:1200}))[0];assert.equal(p.budget,1130);assert.equal(p.walk,9.6);assert.equal(p.days[0].endTime,'18:00');
});
test('Recalculation rejects shortened travel, omitted access or return, shortened visits and fabricated totals',()=>{
 const r=room({must:['sh-bund','sh-pearl','sh-lujiazui']}),good=generateRules(r)[0];
 const changes=[p=>p.days[0].breaks.shift(),p=>p.days[0].breaks.pop(),p=>{p.days[0].stops[1].transit.minutes=0;},p=>{p.days[0].breaks.find(b=>b.leg==='between').transit.cost=0;},p=>{p.days[0].stops[0].minutes=10;},p=>{p.days[0].costBreakdown.transport=0;},p=>{p.days[0].walk=1;p.walk=1;},p=>{delete p.estimationVersion;}];
 for(const change of changes){const p=structuredClone(good);change(p);assert.ok(d.validatePlan(r,p).length);}
 const reordered=structuredClone(good);reordered.days[0].costBreakdown=Object.fromEntries(Object.entries(reordered.days[0].costBreakdown).reverse());assert.deepEqual(d.validatePlan(r,reordered),[]);
});
test('A journey that looks valid when transfers are ignored is too long once actual planning reserves are included',()=>{
 const limits={startHour:9,maxWalk:12},day=schedule(['sh-garden','sh-art-museum','sh-expo-arena'],limits);
 assert.ok(day.endMinute>1080);assert.ok(day.transitMinutes>=150);
 const r=room({must:['sh-garden','sh-art-museum','sh-expo-arena']});assert.throws(()=>generateRules(r),e=>e.code==='NO_FEASIBLE_PLAN');
 const two=room({must:['sh-garden','sh-art-museum','sh-expo-arena']},{days:2});for(const p of generateRules(two))assert.deepEqual(d.validatePlan(two,p),[]);
});
test('Old saved itineraries are preserved with a planning warning, while obsolete proposals cannot receive new consent',()=>{
 const r=room();d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const p=r.proposals[0];
 d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'accept'});d.apply(r,'a','finalize',{proposalId:p.id});delete r.final.proposal.estimationVersion;const before=structuredClone(r);
 const v=d.view(r,'a');assert.ok(v.final.planningReviewRequired);assert.match(v.final.copyText,/旧估算行程/);assert.deepEqual(r,before);
 r.final=null;delete r.proposals[0].estimationVersion;assert.throws(()=>d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'accept'}),e=>e.code==='STALE_PLAN');assert.equal(d.canFinalize(r,p.id).ok,false);
});
