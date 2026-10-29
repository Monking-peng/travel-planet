const {test}=require('node:test'),assert=require('node:assert/strict');
const {getCatalog,places,byId}=require('../shared/catalog.cjs'),d=require('../shared/domain.cjs'),planner=require('../shared/planner.cjs'),{sanitize}=require('../server/extraction.cjs'),{createStore}=require('../server/store.cjs');
const pref=(extra={})=>({tags:['建筑','江景'],wants:['sh-bund','sh-pearl'],must:[],avoid:[],budget:600,maxWalk:5,startHour:9,...extra});
const room=(days=2)=>d.create('host',{city:'上海',nickname:'甲',startDate:'2026-11-07',days});
test('Legacy catalog and rooms stay Hangzhou; unsupported city/prototype names are rejected',()=>{
  assert.equal(places.length,10);assert.equal(getCatalog().places,places);assert.equal(d.create('a',{startDate:'2026-11-07'}).city,'杭州');
  assert.equal(room().title,'一起去上海');assert.equal(getCatalog('上海').places.length,17);assert.ok(getCatalog('上海').places.every(p=>p.id.startsWith('sh-')&&!getCatalog('杭州').byId[p.id]));
  for(const city of ['北京','__proto__','constructor',null,{}])assert.throws(()=>d.create('a',{city,startDate:'2026-11-07'}),e=>e.code==='CITY_UNSUPPORTED');
  assert.equal(byId.constructor,undefined);
});
test('Preferences and committed plans cannot cross the room city boundary',()=>{
  const r=room();d.apply(r,'host','preferences',pref());
  for(const key of ['wants','must','avoid'])assert.throws(()=>d.apply(r,'host','preferences',pref({[key]:['duanqiao']})),e=>e.code==='PLACE_CITY_MISMATCH');
  const hz=d.create('h',{startDate:'2026-11-07'});assert.throws(()=>d.apply(hz,'h','preferences',pref()),e=>e.code==='PLACE_CITY_MISMATCH');
  const plans=planner.generateRules(r);plans[0].days[0].stops[0].placeId='duanqiao';
  assert.throws(()=>d.commitPlans(r,'host',plans,r.inputRevision,'basic'),e=>e.code==='PLAN_CONSTRAINT');assert.equal(r.planVersion,0);
  assert.throws(()=>planner.materializeAI(r,{plans:[{placeIds:['sh-bund','duanqiao']},{placeIds:['sh-pearl']}]}),e=>e.code==='AI_INVALID');
  d.apply(r,'host','comment',{text:'看看这个地点',placeId:'duanqiao'});assert.equal(r.comments[0].placeId,null);
});
test('Shanghai plans cover 1–3 days, honor constraints and keep all stops in Shanghai',()=>{
  for(const days of [1,2,3]){
    const r=room(days);d.apply(r,'host','preferences',pref({budget:days*300,must:['sh-bund'],avoid:['sh-jingan'],startHour:10}));
    for(const p of planner.generateRules(r)){assert.deepEqual(d.validatePlan(r,p),[]);assert.equal(p.days.length,days);assert.ok(p.included.includes('sh-bund'));assert.ok(!p.included.includes('sh-jingan'));assert.ok(p.included.every(id=>getCatalog('上海').byId[id]));assert.ok(!p.estimateNote.includes('杭州'));assert.ok(p.days.every(day=>day.stops.length>=2&&day.walk<=5));}
  }
});
test('Huangpu crossing is transit; legacy lake-side short trips remain walkable',()=>{
  const day=planner.schedule(['sh-bund','sh-pearl'],{startHour:9});assert.equal(day.stops[1].transit.mode,'公共交通过江');assert.ok(day.stops[1].transit.minutes>=25);
  assert.equal(planner.schedule(['qianwang','liulang'],{startHour:9}).stops[1].transit.mode,'附近步行');
});
test('Extraction uses city tags and removes foreign locations without inventing preferences',()=>{
  const result=sanitize({wants:['sh-bund','duanqiao'],must:[],avoid:[],tags:['建筑','江景','湖景','安静']},'想去外滩看江景和建筑','上海');
  assert.deepEqual(result.wants,['sh-bund']);assert.deepEqual(result.tags,['建筑','江景']);assert.match(result.summary,/外滩/);assert.ok(!result.summary.includes('断桥'));
});
test('Shanghai agreement, final copy and history work; mixed-city list retains city identity',()=>{
  const r=room();d.apply(r,'guest','join',{nickname:'乙',token:r.inviteToken});for(const uid of ['host','guest'])d.apply(r,uid,'preferences',pref());
  d.commitPlans(r,'host',planner.generateRules(r),r.inputRevision,'basic');const p=r.proposals[0];
  d.apply(r,'host','vote',{proposalId:p.id,version:p.version,value:'accept'});assert.throws(()=>d.apply(r,'host','finalize',{proposalId:p.id}),e=>e.code==='NOT_AGREED');
  d.apply(r,'guest','vote',{proposalId:p.id,version:p.version,value:'accept'});d.apply(r,'host','finalize',{proposalId:p.id});
  const view=d.view(r,'host');assert.equal(view.final.acceptanceVerified,true);assert.match(view.final.copyText,/上海/);assert.ok(!view.final.copyText.includes('杭州'));
  d.apply(r,'host','reopen');assert.equal(r.history.length,1);assert.deepEqual(r.votes,{});
  const store=createStore(':memory:');try{store.insert(r);const hz=d.create('host',{startDate:'2026-11-07'});delete hz.city;store.insert(hz);assert.deepEqual(new Set(store.list('host').map(r=>r.city)),new Set(['杭州','上海']));assert.equal(d.view(hz,'host').city,'杭州');}finally{store.close();}
});
