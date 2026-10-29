const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createStore}=require('../server/store.cjs'),{verify}=require('../server/bridge.cjs');
test('AI daily budget is atomic, persists across restarts, and resets next day',()=>{
  const filename=path.join(os.tmpdir(),'travel-quota-'+crypto.randomUUID()+'.sqlite');let store=createStore(filename);const now=Date.now();
  const limits=[{key:'all',max:3},{key:'user:a',max:1}];store.consumeAI(limits,now);
  assert.throws(()=>store.consumeAI(limits,now),e=>e.code==='AI_DAILY_LIMIT');
  assert.equal(store.db.prepare('SELECT count FROM ai_usage WHERE scope=?').get('all').count,1);
  store.close();store=createStore(filename);assert.throws(()=>store.consumeAI(limits,now),e=>e.code==='AI_DAILY_LIMIT');
  store.consumeAI(limits,now+86400000);store.close();for(const suffix of ['','-wal','-shm'])fs.rmSync(filename+suffix,{force:true});
});
test('Native bridge accepts signed identity, refuses alteration and replay',()=>{
  const previous=process.env.TRAVEL_BRIDGE_KEY;process.env.TRAVEL_BRIDGE_KEY=crypto.randomBytes(32).toString('hex');
  try{const headers={'x-travel-identity':'test-app:test-user','x-travel-time':String(Date.now()),'x-travel-nonce':crypto.randomBytes(16).toString('hex')},body={text:'旅行想法'},route='/api/extract';
    headers['x-travel-signature']=crypto.createHmac('sha256',process.env.TRAVEL_BRIDGE_KEY).update(['POST',route,headers['x-travel-time'],headers['x-travel-nonce'],headers['x-travel-identity'],JSON.stringify(body)].join('\n')).digest('hex');
    assert.throws(()=>verify({method:'POST',headers},route,{text:'changed'}),e=>e.code==='AUTH_INVALID');
    const user=verify({method:'POST',headers},route,body);assert.match(user.uid,/^wx-/);assert.equal(user.token,null);
    assert.throws(()=>verify({method:'POST',headers},route,body),e=>e.code==='REPLAY');
  }finally{if(previous===undefined)delete process.env.TRAVEL_BRIDGE_KEY;else process.env.TRAVEL_BRIDGE_KEY=previous;}
});
