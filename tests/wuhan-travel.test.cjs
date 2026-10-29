const {test}=require('node:test'),assert=require('node:assert/strict');
const d=require('../shared/domain.cjs'),planner=require('../shared/planner.cjs');
const {getCatalog}=require('../shared/catalog.cjs'),{transfer,access}=require('../shared/travel-estimates.cjs');
const local=getCatalog('武汉'),p=local.byId;
const prefs=(extra={})=>({budget:650,maxWalk:8,startHour:9,pace:'relaxed',wants:['wh-crane','wh-customs'],must:[],avoid:[],tags:['人文'],...extra});
function room(extra={},preferences={}){const r=d.create('a',{city:'武汉',startDate:'2026-11-07',days:2,...extra});d.apply(r,'a','preferences',prefs(preferences));return r;}
test('Wuhan has scoped destinations linked to its actual models, station remains a transport landmark',async()=>{
 const {WUHAN_PLACE_LINKS:links}=await import('../web/wuhan-place-links.js');
 const {LANDMARKS}=await import('../web/wuhan-landmarks.js');
 assert.equal(local.places.length,16);assert.equal(links.station,undefined);
 assert.deepEqual(Object.keys(links).sort(),LANDMARKS.filter(l=>l.id!=='station').map(l=>l.id).sort());
 for(const id of Object.values(links)){assert.ok(p[id]);assert.ok(p[id].source.startsWith('https://'));assert.ok(p[id].lat>30&&p[id].lat<31&&p[id].lng>114&&p[id].lng<115);}
 assert.match(p['wh-university'].visitNote,/无需预约/);assert.match(p['wh-museum'].visitNote,/实名预约/);
 assert.match(p['wh-eastlake'].description,/不是环游/);assert.match(p['wh-bridge'].description,/不安排步行横跨/);
});
test('Three-town geography includes both Yangtze and Han river crossings, including return access',()=>{
 for(const [a,b] of [['wh-customs','wh-qingchuan'],['wh-crane','wh-qingchuan'],['wh-crane','wh-customs']]){
  const t=transfer(p[a],p[b],20);assert.equal(t.crossing,true);assert.ok(t.minutes>=45);assert.notEqual(t.mode,'附近步行');assert.ok(t.cost>0);
 }
 assert.equal(transfer(p['wh-museum'],p['wh-eastlake'],20).crossing,false);
 assert.equal(access(p['wh-crane'],'武汉').crossing,true);assert.equal(access(p['wh-customs'],'武汉').crossing,false);
});
test('Wuhan itineraries use Wuhan origin, honest budgets, visit windows, lunch and return, for 1-3 days',()=>{
 for(const days of [1,2,3]){
  const r=room({days},{budget:1000,must:['wh-crane']});
  for(const plan of planner.generateRules(r)){
   assert.deepEqual(d.validatePlan(r,plan),[]);assert.ok(plan.included.every(id=>id.startsWith('wh-')));assert.ok(plan.included.includes('wh-crane'));
   for(const day of plan.days){assert.equal(day.originAssumption,'江汉路周边');assert.ok(day.endMinute<=1080&&day.walk<=8);assert.ok(day.breaks.some(b=>b.leg==='outbound'));assert.ok(day.breaks.some(b=>b.leg==='inbound'));assert.ok(day.breaks.some(b=>b.title.includes('午餐')));assert.equal(day.budget,Object.entries(day.costBreakdown).filter(([k])=>k!=='total').reduce((n,[,v])=>n+v,0));}
  }
 }
});
test('Wuhan cannot silently waive museum closure, an impossible budget or mandatory conflicts',()=>{
 assert.throws(()=>planner.generateRules(room({startDate:'2026-11-09',days:1},{must:['wh-museum']})),e=>e.code==='PLACE_CLOSED');
 assert.throws(()=>planner.generateRules(room({days:1},{budget:50,must:['wh-crane']})),e=>e.code==='NO_FEASIBLE_PLAN');
 const r=room({days:1},{must:['wh-crane']});d.apply(r,'b','join',{nickname:'乙',token:r.inviteToken});d.apply(r,'b','preferences',prefs({avoid:['wh-crane'],wants:[]}));
 assert.throws(()=>planner.generateRules(r),e=>e.code==='PREFERENCE_CONFLICT');
});
test('Wuhan admits no other city in preferences or AI plans; room identity and consent remain authoritative',()=>{
 const r=room({days:1});for(const id of ['sh-bund','duanqiao'])assert.throws(()=>d.apply(r,'a','preferences',prefs({wants:[id]})),e=>e.code==='PLACE_CITY_MISMATCH');
 assert.throws(()=>planner.materializeAI(r,{plans:[{placeIds:['sh-bund']},{placeIds:['wh-crane']}]}),e=>e.code==='AI_INVALID');
 d.apply(r,'b','join',{nickname:'乙',token:r.inviteToken});d.apply(r,'b','preferences',prefs({budget:800}));
 d.commitPlans(r,'a',planner.generateRules(r),r.inputRevision,'basic');let plan=r.proposals[0];
 const vote=(uid,value)=>d.apply(r,uid,'vote',{proposalId:plan.id,version:plan.version,value});
 vote('a','prefer');vote('b','accept');assert.equal(d.canFinalize(r,plan.id).ok,false);
 vote('a','accept');d.apply(r,'b','preferences',prefs({budget:800,text:'重新确认要求'}));assert.equal(d.canFinalize(r,plan.id).ok,false);
 d.commitPlans(r,'a',planner.generateRules(r),r.inputRevision,'basic');plan=r.proposals[0];vote('a','accept');vote('b','accept');
 assert.throws(()=>d.apply(r,'b','finalize',{proposalId:plan.id}),e=>e.code==='HOST_ONLY');d.apply(r,'a','finalize',{proposalId:plan.id});
 assert.ok(r.final);assert.equal(r.final.memberIds.length,2);assert.equal(d.view(r,'a').city,'武汉');assert.equal(d.view(r,'a').members[1].preferences.budget,undefined);
});
