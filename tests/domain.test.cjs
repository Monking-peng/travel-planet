const {test}=require('node:test'),assert=require('node:assert/strict');
const d=require('../shared/domain.cjs'),{generateRules}=require('../shared/planner.cjs'),{createStore}=require('../server/store.cjs');
const pref=(extra={})=>({text:'想看湖，不想太赶',tags:['湖景','安静'],wants:['duanqiao','gushan'],must:[],avoid:[],budget:600,maxWalk:5,startHour:9,pace:'relaxed',...extra});
function ready(){const r=d.create('a',{nickname:'发起人',startDate:'2026-11-07',days:2});d.apply(r,'b','join',{nickname:'旅伴',token:r.inviteToken});d.apply(r,'a','preferences',pref());d.apply(r,'b','preferences',pref({startHour:10,maxWalk:3,budget:400}));return r;}
test('Invalid dates, duration and conflicting self preferences are rejected',()=>{
  assert.throws(()=>d.create('a',{startDate:'2026-02-30',days:2}),/有效/);assert.throws(()=>d.create('a',{startDate:'2026-11-07',days:5}),/1—3/);
  const r=ready();assert.throws(()=>d.apply(r,'a','preferences',pref({must:['duanqiao'],avoid:['duanqiao']})),/同时/);
});
test('Invite is required and outsiders cannot read rooms or alter members',()=>{
  const r=ready();assert.throws(()=>d.apply(r,'c','join',{token:'wrong'}),/邀请/);assert.throws(()=>d.view(r,'c'),/只有/);assert.throws(()=>d.apply(r,'b','rotateInvite'),/发起人/);
});
test('Group limits take strictest values without exposing individual budgets',()=>{
  const r=ready(),s=d.summary(r);assert.equal(s.budget,400);assert.equal(s.maxWalk,3);assert.equal(s.startHour,10);
  for(const viewer of r.members){
    const v=d.view(r,viewer.id);assert.equal(v.members.find(m=>m.id===viewer.id).preferences.budget,viewer.preferences.budget);
    assert.equal(v.members.find(m=>m.id!==viewer.id).preferences.budget,undefined);
    assert.equal(Object.hasOwn(v.summary,'budget'),false,'A group minimum reveals another member\'s exact budget');
  }
  assert.equal(d.summary(r).budget,400,'Privacy filtering must not alter the stored planning constraint');
});
test('Conflicting hard preferences cannot be silently compromised',()=>{
  const r=ready();d.apply(r,'a','preferences',pref({must:['duanqiao']}));d.apply(r,'b','preferences',pref({avoid:['duanqiao']}));assert.equal(d.summary(r).conflicts.length,1);assert.throws(()=>generateRules(r),/调整/);
});
test('Generated plans respect all structured bounds and mandatory places',()=>{
  const r=ready();d.apply(r,'a','preferences',pref({must:['leifeng'],wants:['leifeng']}));const plans=generateRules(r);
  for(const p of plans){assert.deepEqual(d.validatePlan(r,p),[]);assert.ok(p.included.includes('leifeng'));assert.ok(p.budget<=400);assert.ok(p.days.every(day=>day.walk<=3&&day.startHour>=10));}
});
test('Only the host can finalize after every member accepts the exact version',()=>{
  const r=ready();d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const p=r.proposals[0];
  assert.throws(()=>d.apply(r,'a','finalize',{proposalId:p.id}),/尚未/);d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'prefer'});
  assert.throws(()=>d.apply(r,'a','finalize',{proposalId:p.id}),/尚未/);assert.throws(()=>d.apply(r,'b','vote',{proposalId:p.id,version:p.version-1,value:'accept'}),/更新/);
  d.apply(r,'b','vote',{proposalId:p.id,version:p.version,value:'accept'});assert.throws(()=>d.apply(r,'b','finalize',{proposalId:p.id}),/发起人/);
  assert.equal(d.view(r,'a').proposals[0].accepted,1);
  assert.throws(()=>d.apply(r,'a','finalize',{proposalId:p.id}),/尚未/);
  d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'accept'});
  d.apply(r,'a','finalize',{proposalId:p.id});assert.equal(r.final.memberIds.length,2);assert.throws(()=>d.apply(r,'b','preferences',pref()),/定稿/);
});
test('A preference or an acceptance from another version cannot authorize finalization',()=>{
  const r=ready();d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const p=r.proposals[0];
  for(const uid of ['a','b'])d.apply(r,uid,'vote',{proposalId:p.id,version:p.version,value:'prefer'});
  assert.equal(d.view(r,'a').proposals[0].accepted,0);assert.equal(d.canFinalize(r,p.id).ok,false);
  for(const uid of ['a','b'])d.apply(r,uid,'vote',{proposalId:p.id,version:p.version,value:'accept'});
  r.votes.b[p.id].version=p.version-1;
  assert.equal(d.view(r,'a').proposals[0].accepted,1);assert.equal(d.canFinalize(r,p.id).ok,false);
});
test('Changed preferences and joining members invalidate previous acceptance',()=>{
  const r=ready();d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const p=r.proposals[0];d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'accept'});
  d.apply(r,'b','preferences',pref({startHour:11}));assert.deepEqual(r.votes,{});assert.equal(d.canFinalize(r,p.id).ok,false);assert.throws(()=>d.apply(r,'a','vote',{proposalId:p.id,version:p.version,value:'accept'}),/更新/);
  d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');d.apply(r,'c','join',{token:r.inviteToken,nickname:'新旅伴'});assert.equal(d.canFinalize(r,r.proposals[0].id).ok,false);
});
test('Generation snapshots cannot overwrite newer member input',()=>{
  const r=ready(),snapshot=r.inputRevision,plans=generateRules(r);d.apply(r,'b','preferences',pref({wants:['gushan']}));assert.throws(()=>d.commitPlans(r,'a',plans,snapshot,'basic'),/新的意见/);
});
test('Reopening retains final history and cannot inherit prior agreement',()=>{
  const r=ready();d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const p=r.proposals[0];for(const id of ['a','b'])d.apply(r,id,'vote',{proposalId:p.id,version:p.version,value:'accept'});d.apply(r,'a','finalize',{proposalId:p.id});d.apply(r,'a','reopen');assert.equal(r.final,null);assert.equal(r.history.length,1);assert.deepEqual(r.votes,{});assert.equal(d.canFinalize(r,p.id).ok,false);
});
test('Database mutations are atomic and rejected operations leave no changes',()=>{
  const store=createStore(':memory:'),r=ready();store.insert(r);assert.throws(()=>store.update(r.id,x=>{x.title='broken';throw new Error('stop');}));assert.equal(store.get(r.id).title,r.title);store.update(r.id,x=>d.apply(x,'b','comment',{text:'想吃完饭再出门'}));assert.equal(store.get(r.id).comments.length,1);store.close();
});
test('Unknown POI, repeated POI and insufficient budget fail validation',()=>{
  const r=ready(),p=generateRules(r)[0];p.days[0].stops.push({placeId:'made-up-place'});p.budget=99999;assert.ok(d.validatePlan(r,p).length>=2);
});
test('Revoked invitations cannot add new members; host cannot leave accidentally',()=>{
  const r=ready(),old=r.inviteToken;d.apply(r,'a','rotateInvite');assert.throws(()=>d.apply(r,'c','join',{token:old}),/邀请/);assert.throws(()=>d.apply(r,'a','leave'),/转交/);d.apply(r,'a','transfer',{memberId:'b'});d.apply(r,'a','leave');assert.equal(r.members.length,1);assert.equal(r.hostId,'b');
});
test('A plan that overlaps activities or finishes beyond the day is rejected',()=>{
  const r=ready(),p=generateRules(r)[0];p.days[0].stops[1].startMinute=p.days[0].stops[0].startMinute;p.days[0].endMinute=20*60;
  assert.ok(d.validatePlan(r,p).some(e=>/重叠|时间/.test(e)));
});
test('Every generated day has substantive visits and a scheduled lunch',()=>{
  for(const days of [1,2,3])for(const maxWalk of [3,5]){
    const r=d.create('a',{startDate:'2026-11-07',days});d.apply(r,'a','preferences',pref({budget:days*400,maxWalk,startHour:11}));
    // After counting access walks and island boats, these tight limits cannot fill three distinct days.
    if(days===3&&maxWalk===3){assert.throws(()=>generateRules(r),e=>e.code==='NO_FEASIBLE_PLAN');continue;}
    for(const plan of generateRules(r))for(const day of plan.days){
      assert.ok(day.stops.length>=2);assert.ok(day.activityMinutes>=120);const meals=day.breaks.filter(b=>!b.kind);assert.equal(meals.length,1);assert.equal(meals[0].minutes,60);assert.ok(day.endMinute<=18*60);
      const intervals=[...day.stops.map(s=>[s.startMinute,s.endMinute]),...day.breaks.map(b=>[b.startMinute,b.startMinute+b.minutes])].sort((a,b)=>a[0]-b[0]);
      for(let i=1;i<intervals.length;i++)assert.ok(intervals[i][0]>=intervals[i-1][1]);
      assert.ok(day.walk<=maxWalk);
    }
  }
});
