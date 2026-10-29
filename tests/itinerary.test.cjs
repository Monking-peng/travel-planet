const {test}=require('node:test'),assert=require('node:assert/strict');
const domain=require('../shared/domain.cjs'),{generateRules}=require('../shared/planner.cjs'),{byId}=require('../shared/catalog.cjs');
function finalized(){
  const room=domain.create('a',{title:'跨年湖边走走',startDate:'2026-12-31',days:2});domain.apply(room,'b','join',{token:room.inviteToken});
  for(const uid of ['a','b'])domain.apply(room,uid,'preferences',{text:'PRIVATE NOTE',budget:600,maxWalk:5,startHour:9,tags:[],wants:['duanqiao','gushan'],must:[],avoid:[]});
  domain.commitPlans(room,'a',generateRules(room),room.inputRevision,'basic');const proposal=room.proposals[0];
  for(const uid of ['a','b'])domain.apply(room,uid,'vote',{proposalId:proposal.id,version:proposal.version,value:'accept'});
  domain.apply(room,'a','finalize',{proposalId:proposal.id});return room;
}
test('Final export includes dated chronological visits, meals, travel and end times',()=>{
  const room=finalized(),view=domain.view(room,'a'),text=view.final.copyText;
  assert.match(text,/2026-12-31 — 2027-01-01/);assert.match(text,/2027-01-01 · 第 2 天/);assert.equal(view.final.acceptanceVerified,true);
  for(const day of room.final.proposal.days){
    const section=text.split('第 '+day.day+' 天\n')[1].split('\n\n')[0];let position=-1;
    for(const event of [...day.stops,...day.breaks].sort((a,b)=>a.startMinute-b.startMinute)){
      const label=event.time+' '+(event.placeId?byId[event.placeId].name:event.title),current=section.indexOf(label);
      assert.ok(current>position,label);position=current;
      if(event.placeId&&event.transit)assert.ok(section.includes('从上一站'+event.transit.mode+'约 '+event.transit.minutes+' 分钟'));
    }
    assert.ok(section.includes(day.endTime+' 返回'+day.originAssumption));assert.ok(section.includes('当天步行约 '+day.walk+' 公里'));
  }
  assert.ok(text.endsWith(room.final.proposal.estimateNote));assert.ok(!text.includes('PRIVATE NOTE'));
  assert.equal(domain.view(room,'b').final.copyText,text);
});
test('Legacy final records stay intact and expose an honest acceptance warning',()=>{
  const room=finalized(),id=room.final.proposal.id;room.final.votes.b[id].value='prefer';const before=structuredClone(room);
  const view=domain.view(room,'a');assert.equal(view.final.acceptanceVerified,false);assert.match(view.final.copyText,/历史确认待复核/);assert.deepEqual(room,before);
});
