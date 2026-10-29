const {test}=require('node:test'),assert=require('node:assert/strict');
const d=require('../shared/domain.cjs'),planner=require('../shared/planner.cjs'),{getCatalog}=require('../shared/catalog.cjs');
const {dateAt}=require('../shared/visit-rules.cjs');
function room(extra={},prefs={}){const r=d.create('a',{city:'上海',startDate:'2026-11-08',days:1,...extra});d.apply(r,'a','preferences',{tags:[],wants:[],must:[],avoid:[],budget:2000,maxWalk:12,startHour:8,...prefs});return r;}
test('All 17 miniature modules have valid scoped travel destinations; adding a choice preserves drafts and private limits',async()=>{
  const {SHANGHAI_PLACE_LINKS:links}=await import('../web/shanghai-place-links.js');
  const {LANDMARKS}=await import('../web/shanghai-landmarks.js');
  assert.deepEqual(Object.keys(links).sort(),LANDMARKS.map(p=>p.id).sort());
  for(const id of Object.values(links))assert.ok(getCatalog('上海').byId[id]);
  const {selectPlace}=await import('../web/travel-place-selection.js');
  const before={text:'保留原话',budget:1234,startHour:10,wants:['sh-bund'],must:['sh-bund'],avoid:['sh-disney','sh-jingan'],diet:'不吃辣'};
  const after=selectPlace(before,'sh-disney');assert.equal(after.text,before.text);assert.equal(after.budget,1234);assert.equal(after.startHour,10);assert.equal(after.diet,'不吃辣');assert.deepEqual(after.must,before.must);assert.deepEqual(after.wants,['sh-bund','sh-disney']);assert.deepEqual(after.avoid,['sh-jingan']);assert.deepEqual(before.avoid,['sh-disney','sh-jingan']);assert.deepEqual(selectPlace(after,'sh-disney'),after);
});
test('Disney gets a full day, realistic reserves, lunch and return time; copy keeps admission caveats',()=>{
  const r=room({}, {must:['sh-disney']});const plans=planner.generateRules(r);
  for(const p of plans){assert.deepEqual(d.validatePlan(r,p),[]);assert.deepEqual(p.included,['sh-disney']);assert.equal(p.days[0].stops.length,1);assert.equal(p.days[0].endTime,'18:00');assert.equal(p.budget,1130);assert.equal(p.days[0].walk,9.6);assert.ok(p.visitNotes.some(n=>n.text.includes('不是实际票价')));}
  assert.match(plans[1].title,/同一安排/);
  d.commitPlans(r,'a',plans,r.inputRevision,'basic');const p=r.proposals[0];d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'accept'});d.apply(r,'a','finalize',{proposalId:p.id});assert.match(d.view(r,'a').final.copyText,/出发前核验/);assert.match(d.view(r,'a').final.copyText,/含午休/);
});
test('Hard limits never silently stretch for a mandatory full-day destination',()=>{
  for(const prefs of [{budget:1120},{maxWalk:8},{startHour:9}])assert.throws(()=>planner.generateRules(room({}, {must:['sh-disney'],...prefs})),e=>e.code==='NO_FEASIBLE_PLAN');
  assert.throws(()=>planner.generateRules(room({}, {must:['sh-disney','sh-astronomy']})),e=>e.code==='NO_FEASIBLE_PLAN');
  const p=planner.generateRules(room({}, {wants:['sh-disney'],budget:250,maxWalk:5}))[0];assert.ok(!p.included.includes('sh-disney'));assert.match(p.omissionReasons['sh-disney'],/单独一天/);
});
test('Monday closure changes the actual date assignment and rejects impossible mandatory visits',()=>{
  for(const id of ['sh-astronomy','sh-garden','sh-art-museum']){
    assert.throws(()=>planner.generateRules(room({startDate:'2026-11-09'}, {must:[id]})),e=>e.code==='PLACE_CLOSED');
    const r=room({startDate:'2026-11-09',days:2},{must:[id]});
    for(const p of planner.generateRules(r)){assert.deepEqual(d.validatePlan(r,p),[]);const day=p.days.find(day=>day.stops.some(s=>s.placeId===id));assert.equal(dateAt(r.startDate,day.day-1),'2026-11-10');}
  }
});
test('Regular indoor visits respect opening, last entry and closing times',()=>{
  const r=room({}, {must:['sh-garden','sh-art-museum'],startHour:8});
  for(const p of planner.generateRules(r)){assert.deepEqual(d.validatePlan(r,p),[]);for(const day of p.days)for(const stop of day.stops){const place=getCatalog('上海').byId[stop.placeId];assert.ok(stop.startMinute>=(place.openMinute||0));assert.ok(stop.endMinute<=(place.closeMinute||1080));}}
});
test('Validation rejects forged ticket costs, nested breaks, closed dates and missing return transport',()=>{
  const r=room({}, {must:['sh-disney']}),good=planner.generateRules(r)[0];
  for(const mutate of [p=>{p.budget=p.days[0].budget=70;},p=>{p.days[0].breaks.find(b=>b.withinPlaceId).startMinute=1;},p=>{p.days[0].breaks=p.days[0].breaks.filter(b=>!b.withinPlaceId);},p=>{p.days[0].endMinute=1030;},p=>{p.days[0].walk=1;}]){const p=structuredClone(good);mutate(p);assert.ok(d.validatePlan(r,p).length);}
  const ordinary=room({}, {must:['sh-bund']}),p=planner.generateRules(ordinary)[0];p.days[0].breaks[0].withinPlaceId=p.days[0].stops[0].placeId;assert.ok(d.validatePlan(ordinary,p).length);
});

test('New interests survive evidence-based extraction without inventing unmentioned interests',()=>{
  const {sanitize}=require('../server/extraction.cjs');const result=sanitize({tags:['乐园','科普','艺术']},'去迪士尼乐园，喜欢天文科普，不想看艺术展','上海');assert.deepEqual(result.tags,['乐园','科普']);
});
