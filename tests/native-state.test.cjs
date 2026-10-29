const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),catalog=require('../shared/catalog.cjs'),d=require('../shared/domain.cjs');
function pageHarness(request){
  let config;const storage=new Map(),intervals=new Map(),clipboard=[];let counter=0;
  const sandbox={Page:c=>config=c,require:n=>n.includes('catalog')?catalog:n.includes('scenery')?require('../miniprogram/utils/scenery'):{request},Date,wx:{getStorageSync:k=>storage.get(k),setStorageSync:(k,v)=>storage.set(k,structuredClone(v)),removeStorageSync:k=>storage.delete(k),setClipboardData:({data})=>clipboard.push(data),showToast(){},getWindowInfo:()=>({statusBarHeight:24})},getApp:()=>({globalData:{musicPlaying:false}}),setInterval:fn=>{intervals.set(++counter,fn);return counter;},clearInterval:id=>intervals.delete(id)};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../miniprogram/pages/travel/index.js'),'utf8'),sandbox);
  const page={...config,data:structuredClone(config.data),visible:true,unloaded:false,loadSeq:0,setData(updates,callback){for(const [key,value] of Object.entries(updates)){const parts=key.split('.');let t=this.data;for(const part of parts.slice(0,-1))t=t[part]??={};t[parts.at(-1)]=value;}callback?.();}};return {page,storage,intervals,clipboard};
}
const room=id=>d.view({...d.create('a',{nickname:'小林',startDate:'2026-11-07',days:2}),id},'a');
function discussion(){const r=d.create('a',{nickname:'小林',startDate:'2026-11-07',days:2});d.apply(r,'b','join',{nickname:'小陈',token:r.inviteToken});for(const id of ['a','b'])d.apply(r,id,'preferences',{wants:['duanqiao'],budget:600,maxWalk:8});return r;}

test('Native open feedback updates with the current version and marks replaced proposals stale',()=>{
  const r=discussion(),{generateRules}=require('../shared/planner.cjs'),{page}=pageHarness(async()=>({}));d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const plan=r.proposals[0];page.applyRoom(d.view(r,'a'));page.responses({currentTarget:{dataset:{id:plan.id}}});
  d.apply(r,'b','vote',{proposalId:plan.id,version:plan.version,value:'accept'});page.applyRoom(d.view(r,'a'));assert.equal(page.data.responses.find(m=>m.id==='b').label,'可以接受');
  d.apply(r,'b','vote',{proposalId:plan.id,version:plan.version,value:'change',reason:'下午想早点休息'});page.applyRoom(d.view(r,'a'));assert.equal(page.data.responses.find(m=>m.id==='b').reason,'下午想早点休息');
  d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');page.applyRoom(d.view(r,'a'));assert.equal(page.data.responseStale,true);assert.equal(page.data.responses.length,0);assert.equal(page.data.panel,'responses');
});

test('Native main action leads to conflicts before generation and final confirmation after acceptance',()=>{
  const r=discussion(),{page}=pageHarness(async()=>({})),{generateRules}=require('../shared/planner.cjs');
  d.apply(r,'a','preferences',{must:['duanqiao'],budget:600,maxWalk:8});d.apply(r,'b','preferences',{avoid:['duanqiao'],budget:600,maxWalk:8});page.applyRoom(d.view(r,'a'));assert.equal(page.data.action,'opinions');assert.equal(page.data.actionLabel,'先商量一下分歧');
  page.adjustLimits();assert.equal(page.data.panel,'ideas');assert.equal(page.data.advanced,true);
  d.apply(r,'a','preferences',{wants:['gushan'],budget:600,maxWalk:8});d.commitPlans(r,'a',generateRules(r),r.inputRevision,'basic');const plan=r.proposals[0];for(const id of ['a','b'])d.apply(r,id,'vote',{proposalId:plan.id,version:plan.version,value:'accept'});page.applyRoom(d.view(r,'a'));assert.equal(page.data.actionLabel,'确认这份共同方案');
  page.applyRoom(d.view(r,'b'));assert.equal(page.data.note,'已达成一致，等发起人定稿。');
});

test('Native conditional and list templates bind expressions instead of literal strings',()=>{
  const root=path.resolve(__dirname,'../miniprogram');
  for(const name of fs.readdirSync(root,{recursive:true}).filter(n=>n.endsWith('.wxml'))){const source=fs.readFileSync(path.join(root,name),'utf8');for(const match of source.matchAll(/wx:(?:if|elif|for)="([^"]*)"/g))assert.match(match[1],/^\{\{[\s\S]+\}\}$/u,name+': '+match[0]);}
});

test('Native close viewing preserves the picker and rejects late layout callbacks after switching or closing',()=>{
  const {page}=pageHarness(async()=>({})),pending=[],focused=[];
  page.selectComponent=()=>({focusComponent:(id,size)=>focused.push({id,size})});
  page.createSelectorQuery=()=>{const q={select:()=>q,boundingClientRect:callback=>{pending.push(callback);return q;},exec(){}};return q;};
  page.sceneryPanel();page.sceneryFilter({currentTarget:{dataset:{category:'城市'}}});page.sceneryScrolled({detail:{scrollTop:260}});
  const selected=JSON.stringify(page.data.scenerySelected);page.sceneryInspect({currentTarget:{dataset:{id:'cafe'}}});assert.equal(page.data.sceneryInspectId,'cafe');
  page.sceneryBrowse({currentTarget:{dataset:{step:1}}});const next=page.data.sceneryInspectId;assert.notEqual(next,'cafe');pending.shift()({width:390,height:600});assert.equal(focused.length,0);
  pending.shift()({width:390,height:600});assert.equal(focused.at(-1).id,next);
  page.sceneryReturn();assert.equal(page.data.sceneryFilter,'城市');assert.equal(page.data.sceneryScrollTop,260);assert.equal(page.data.sceneryInspectId,'');assert.equal(JSON.stringify(page.data.scenerySelected),selected);
  page.sceneryInspect({currentTarget:{dataset:{id:'cafe'}}});page.closePanel();const count=focused.length;pending.shift()({width:390,height:600});assert.equal(focused.length,count);assert.equal(page.data.sceneryInspectId,'');
});
test('Native room loads cannot overwrite a newer selection or a disposed page',async()=>{
  const pending={};const {page,intervals}=pageHarness(route=>new Promise(resolve=>pending[route]=resolve));
  const old=page.loadRoom('old'),latest=page.loadRoom('latest');pending['/rooms/latest']({room:room('latest')});await latest;pending['/rooms/old']({room:room('old')});await old;assert.equal(page.data.room.id,'latest');assert.equal(intervals.size,1);
  const late=page.loadRoom('late');page.onUnload();pending['/rooms/late']({room:room('late')});await late;assert.equal(page.data.room.id,'latest');assert.equal(intervals.size,0);
});
test('Native extraction does not replace a newly reopened draft and draft persists',async()=>{
  let finish;const {page,storage}=pageHarness(()=>new Promise(resolve=>finish=resolve));page.applyRoom(room('a'));page.ideasPanel();page.data.draft.text='旧想法';const pending=page.extract();page.closePanel();page.ideasPanel();page.data.draft.text='重新想过，现在想去孤山';page.saveDraft();finish({extraction:{wants:['leifeng']}});await pending;
  assert.equal(page.data.draft.text,'重新想过，现在想去孤山');assert.equal(page.data.draft.wants.length,0);assert.equal(storage.get(page.draftKey()).text,page.data.draft.text);assert.equal(page.data.busy,false);
});

test('Native extraction preserves edits made while the same preference form remains open',async()=>{
  let finish;const {page,storage}=pageHarness(()=>new Promise(resolve=>finish=resolve));page.applyRoom(room('a'));page.ideasPanel();
  page.field({currentTarget:{dataset:{scope:'draft',key:'text'}},detail:{value:'想去雷峰塔'}});const pending=page.extract();
  page.field({currentTarget:{dataset:{scope:'draft',key:'text'}},detail:{value:'改成只在湖边散步'}});
  page.field({currentTarget:{dataset:{scope:'draft',key:'budget'}},detail:{value:'300'}});
  page.toggleChip({currentTarget:{dataset:{group:'wants',id:'gushan'}}});
  finish({extraction:{wants:['leifeng'],budget:600,summary:'安排登塔'}});await pending;
  assert.equal(page.data.draft.text,'改成只在湖边散步');assert.equal(page.data.draft.budget,'300');assert.deepEqual(Array.from(page.data.draft.wants),['gushan']);
  assert.match(page.data.extractionNotice,/已保留/);assert.equal(page.data.extraction,null);assert.equal(storage.get(page.draftKey()).budget,'300');
});

test('An unchanged native draft receives extraction and keeps it after reopening',async()=>{
  const {page,storage}=pageHarness(async()=>({extraction:{wants:['leifeng'],summary:'想登塔'}}));page.applyRoom(room('a'));page.ideasPanel();page.data.draft.text='想登塔';await page.extract();
  assert.deepEqual(Array.from(page.data.draft.wants),['leifeng']);assert.deepEqual(storage.get(page.draftKey()).wants,['leifeng']);page.closePanel();page.ideasPanel();assert.deepEqual(Array.from(page.data.draft.wants),['leifeng']);
});

test('Native submission preserves later edits and sends an immutable snapshot',async()=>{
  let finish,sent;const saved=room('submit');const {page,storage}=pageHarness((route,data)=>new Promise(resolve=>{finish=resolve;sent=data;}));page.applyRoom(saved);page.ideasPanel();
  page.field({currentTarget:{dataset:{scope:'draft',key:'text'}},detail:{value:'想去雷峰塔'}});page.submitPrefs();
  page.field({currentTarget:{dataset:{scope:'draft',key:'text'}},detail:{value:'改成在孤山散步'}});
  page.toggleChip({currentTarget:{dataset:{group:'wants',id:'gushan'}}});
  saved.members[0].preferences={...sent,text:'想去雷峰塔'};finish({room:saved});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(page.data.panel,'ideas');assert.equal(page.data.draft.text,'改成在孤山散步');assert.equal(sent.text,'想去雷峰塔');
  assert.deepEqual(Array.from(sent.wants),[]);assert.deepEqual(storage.get(page.draftKey()).wants,['gushan']);
  assert.match(page.data.submissionNotice,/还没提交/);assert.equal(page.data.busy,false);
  page.closePanel();page.ideasPanel();assert.equal(page.data.draft.text,'改成在孤山散步');
});

test('An unchanged native submission closes the form and removes only its saved draft',async()=>{
  const saved=room('submitted');const {page,storage}=pageHarness(async(route,data)=>{saved.members[0].preferences={...data};return {room:saved};});page.applyRoom(saved);page.ideasPanel();
  page.field({currentTarget:{dataset:{scope:'draft',key:'text'}},detail:{value:'沿湖散步'}});storage.set('travel-draft:unrelated',{text:'另一趟旅行'});page.submitPrefs();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(page.data.panel,'');assert.equal(storage.has(page.draftKey()),false);assert.equal(storage.get('travel-draft:unrelated').text,'另一趟旅行');assert.equal(page.data.room.members[0].preferences.text,'沿湖散步');
});

test('A failed native submission keeps the latest draft available for retry',async()=>{
  let reject;const {page,storage}=pageHarness(()=>new Promise((resolve,fail)=>reject=fail));page.applyRoom(room('retry'));page.ideasPanel();page.data.draft.text='旧想法';page.submitPrefs();
  page.field({currentTarget:{dataset:{scope:'draft',key:'text'}},detail:{value:'后来想去曲院风荷'}});reject(new Error('网络断开'));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(page.data.panel,'ideas');assert.equal(storage.get(page.draftKey()).text,'后来想去曲院风荷');assert.equal(page.data.error,'网络断开');assert.equal(page.data.busy,false);
});

test('Native copy uses the complete server export and refuses a stale displayed plan',()=>{
  const {page,clipboard}=pageHarness(async()=>({}));page.data.room={final:{proposal:{id:'current'},copyText:'完整行程\n12:00 午休\n17:00 结束'}};page.data.selectedPlan={id:'current'};page.copyPlan();
  assert.deepEqual(clipboard,['完整行程\n12:00 午休\n17:00 结束']);page.data.selectedPlan.id='previous';page.copyPlan();assert.equal(clipboard.length,1);
});
test('Native late mutation updates saved room but does not reopen a closed panel',async()=>{
  let finish;const {page}=pageHarness(()=>new Promise(resolve=>finish=resolve));page.applyRoom(room('a'));page.showPanel('plans','方案');const pending=page.mutate('vote',{});page.closePanel();const updated=room('a');updated.revision=7;finish({room:updated});await assert.rejects(pending,e=>e.code==='VIEW_CHANGED');assert.equal(page.data.room.revision,7);assert.equal(page.data.panel,'');
});
test('Native first connection failure exposes a retry and recovers with a valid identity',async()=>{
  let calls=0;const {page}=pageHarness(async()=>{if(!calls++)throw new Error('暂时连不上旅行服务');return {user:{id:'wx-test'},ai:true};});
  await page.initialize({});assert.equal(page.data.serviceReady,false);assert.equal(page.data.connecting,false);assert.match(page.data.serviceError,/连不上/);
  await page.action();assert.equal(page.data.serviceReady,true);assert.equal(page.data.serviceError,'');assert.equal(page.user.id,'wx-test');assert.equal(page.data.ai,true);
});
test('Native invitation initialization does not update an unloaded page',async()=>{
  let finish;const {page}=pageHarness(async route=>route==='/status'?{user:{id:'wx-test'},ai:false}:await new Promise(resolve=>finish=resolve));
  const pending=page.initialize({roomId:'invite-room',invite:'token'});await new Promise(resolve=>setImmediate(resolve));page.onUnload();finish({invite:{id:'invite-room',title:'旅行',startDate:'2026-11-07',days:2}});await pending;assert.equal(page.data.invite,null);assert.equal(page.data.panel,'');
});
