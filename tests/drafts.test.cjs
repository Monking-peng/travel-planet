const test=require('node:test'),assert=require('node:assert/strict');
async function setup(){
  const {createDraftStore}=await import('../web/travel-drafts.js'),data=new Map();
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
  return {createDraftStore,storage,data,store:createDraftStore(()=>storage)};
}
test('saved draft snapshots survive a new store and never alias form objects',async()=>{
  const {createDraftStore,store,storage}=await setup(),draft={text:'湖边散步',wants:['gushan'],budget:'400'};
  assert.equal(store.write('a',draft),'saved');draft.wants.push('leifeng');
  const restored=createDraftStore(()=>storage).read('a');assert.equal(restored.status,'saved');assert.deepEqual(restored.data.wants,['gushan']);
  restored.data.wants.length=0;assert.deepEqual(store.read('a').data.wants,['gushan']);
});
test('failed writes remain isolated per room in this document and retry persists the latest data',async()=>{
  const {createDraftStore,store,storage}=await setup();store.write('a',{text:'old'});const write=storage.setItem;
  storage.setItem=()=>{throw new Error('full');};
  assert.equal(store.write('a',{text:'new'}),'session');store.write('b',{text:'other'});
  assert.deepEqual(store.read('a'),{data:{text:'new'},status:'session'});assert.equal(store.read('b').data.text,'other');
  assert.equal(createDraftStore(()=>storage).read('a').data.text,'old');
  storage.setItem=write;assert.equal(store.write('a',store.read('a').data),'saved');
  assert.equal(createDraftStore(()=>storage).read('a').data.text,'new');
});
test('failed cleanup cannot resurrect an already submitted draft during this document',async()=>{
  const {store,storage,data}=await setup();store.write('a',{text:'old'});const remove=storage.removeItem;
  storage.removeItem=()=>{throw new Error('blocked');};assert.equal(store.clear('a'),false);
  assert.deepEqual(store.read('a'),{data:null,status:'clear-failed'});
  storage.removeItem=remove;assert.deepEqual(store.read('a'),{data:null,status:'empty'});assert.equal(data.has('a'),false);
});
test('unavailable and malformed storage never crashes the form or silently becomes a saved draft',async()=>{
  const {createDraftStore,storage,data}=await setup();const denied=createDraftStore(()=>{throw new Error('denied');});
  assert.deepEqual(denied.read('a'),{data:null,status:'unavailable'});assert.equal(denied.write('a',{text:'retained'}),'session');assert.equal(denied.read('a').data.text,'retained');
  for(const raw of ['{broken','[]','2','{"wants":"gushan"}','{"budget":{}}']){
    data.set('a',raw);assert.deepEqual(createDraftStore(()=>storage).read('a'),{data:null,status:'unavailable'});
  }
});
