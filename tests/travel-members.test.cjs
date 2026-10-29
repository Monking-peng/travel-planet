const {test}=require('node:test'),assert=require('node:assert/strict');
const room=()=>({inputRevision:3,proposals:[{id:'a',version:2,inputRevision:3,title:'湖边散步'},{id:'b',version:2,inputRevision:3,title:'西山看景'}],votes:{m:{}},members:[]});
const member=()=>({id:'m',preferences:{text:'',wants:[],must:[],tags:[],startHour:11,maxWalk:3,budget:8765}});

test('Member labels use submitted opinions without inferring motives or exposing private numeric limits',async()=>{
  const {memberSummary}=await import('../web/travel-members.js'),r={...room(),proposals:[]},m=member();
  assert.equal(memberSummary(r,m).text,'想法已提交');
  m.preferences.text='下午有事，晚点出门';assert.equal(memberSummary(r,m).text,m.preferences.text);
  m.preferences.wants=['missing'];assert.equal(memberSummary(r,m).text,m.preferences.text);
  m.preferences.must=['bridge'];assert.equal(memberSummary(r,m,id=>id==='bridge'?'断桥':null).text,'必去断桥');
  assert.equal(memberSummary(r,{id:'m',preferences:null}).text,'还没写想法');
});

test('Orbit feedback distinguishes preference, acceptance, changes and unanswered proposals',async()=>{
  const {memberSummary,memberResponses}=await import('../web/travel-members.js'),r=room(),m=member();
  r.votes.m.a={version:2,value:'prefer'};assert.equal(memberSummary(r,m).kind,'prefer');assert.match(memberSummary(r,m).text,/未接受/);
  assert.equal(memberResponses(r,m)[1].label,'还没有回应');
  r.votes.m.a.value='accept';r.votes.m.b={version:2,value:'change',reason:'第二天想晚点出门'};
  assert.equal(memberSummary(r,m).text,'接受 A · B 想改');assert.match(memberSummary(r,m).detail,/第二天想晚点出门/);
  r.votes.m.b.value='accept';assert.equal(memberSummary(r,m).text,'两份都能接受');assert.equal(memberResponses(r,m)[1].reason,'');
});

test('Stale feedback cannot appear as current agreement on a member badge',async()=>{
  const {memberSummary,memberResponses}=await import('../web/travel-members.js'),r=room(),m=member();
  r.votes.m.a={version:1,value:'accept'};assert.equal(memberSummary(r,m).text,'还没回应方案');
  r.votes.m.a.version=2;r.inputRevision=4;assert.equal(memberSummary(r,m).text,'等待新方案');assert.deepEqual(memberResponses(r,m),[]);
});

test('Historical finalization and closed rooms do not imply fresh individual acceptance',async()=>{
  const {memberSummary,memberResponses}=await import('../web/travel-members.js'),r=room(),m=member();
  r.final={acceptanceVerified:false};assert.equal(memberSummary(r,m).text,'历史定稿待复核');assert.deepEqual(memberResponses(r,m),[]);
  r.final.acceptanceVerified=true;assert.equal(memberSummary(r,m).text,'已一起决定');
  r.closed=true;assert.equal(memberSummary(r,m).text,'旅行已关闭');
});
