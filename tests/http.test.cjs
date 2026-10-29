const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),{spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),{once}=require('node:events');
test('HTTP rejects malformed requests, keeps identity, validates AI and enforces durable limits',async()=>{
  let calls=0;const mock=http.createServer((req,res)=>{req.resume();req.on('end',()=>{calls++;res.setHeader('Content-Type','application/json');res.end(calls===2?'not json':JSON.stringify({choices:[{message:{content:JSON.stringify({wants:['duanqiao','invented-place'],must:[],avoid:[],tags:['invented-tag'],budget:-1,maxWalk:999,startHour:4,pace:'made-up',summary:'想去断桥',questions:[]})}}]}));});});
  await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
  const file=path.join(os.tmpdir(),'travel-http-'+crypto.randomUUID()+'.sqlite'),cwd=path.resolve(__dirname,'..');
  const child=spawn(process.execPath,['server/index.cjs'],{cwd,env:{...process.env,PORT:'0',HOST:'127.0.0.1',TRAVEL_DB:file,TRAVEL_RELEASE:'test-release',TRAVEL_AI_BASE_URL:'http://127.0.0.1:'+mock.address().port,TRAVEL_AI_KEY:'test-only',TRAVEL_AI_MODEL:'mock',TRAVEL_AI_DAILY_LIMIT:'2',TRAVEL_BRIDGE_KEY:'test-bridge',COOKIE_SECURE:'false',COOKIE_PATH:'/',TRUST_PROXY:'false'},stdio:['ignore','pipe','pipe']});
  try{
    const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);child.stdout.on('data',buf=>{const m=buf.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});child.once('error',reject);child.once('exit',()=>reject(new Error('server exited before ready')));});
    let cookie='';const call=async(route,body,extra={})=>{const res=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,...(body===undefined?{}:{'Content-Type':'application/json'}),...extra},body:body===undefined?undefined:JSON.stringify(body)});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];return {status:res.status,data:await res.json()};};
    assert.equal((await call('/health')).data.release,'test-release');assert.equal(cookie,'');
    const first=await call('/api/status'),second=await call('/api/status');assert.equal(first.data.user.id,second.data.user.id);
    for(const value of [null,[],123,'text'])assert.equal((await call('/api/rooms',value)).status,400);
    assert.equal((await call('/api/status',undefined,{Origin:'https://other.invalid'})).status,403);
    assert.equal((await call('/api/status',undefined,{'x-travel-signature':'forged'})).status,401);
    assert.equal((await fetch(base+'/assets/does-not-exist.glb')).status,404);
    assert.equal((await fetch(base+'/%2e%2e%2fserver/index.cjs')).status,404);
    assert.equal((await call('/api/extract',{text:''})).status,400);assert.equal(calls,0);
    const extract=await call('/api/extract',{text:'想去断桥'});assert.equal(extract.status,200);assert.deepEqual(extract.data.extraction.wants,['duanqiao']);assert.deepEqual(extract.data.extraction.tags,[]);for(const k of ['budget','maxWalk','startHour','pace'])assert.equal(extract.data.extraction[k],null);
    const malformed=await call('/api/extract',{text:'想去雷峰塔'});assert.equal(malformed.status,502);assert.equal(malformed.data.error.code,'AI_INVALID');
    assert.equal((await call('/api/extract',{text:'想去孤山'})).status,429);assert.equal(calls,2);
    const r=(await call('/api/rooms',{nickname:'验收','startDate':'2026-11-07',days:1})).data.room;
    await call('/api/rooms/'+r.id+'/preferences',{budget:500,maxWalk:5,startHour:9,tags:[],wants:['duanqiao'],must:[],avoid:[]});
    const invitation='/api/rooms/'+r.id+'/invite?token='+r.inviteToken;
    assert.equal((await call(invitation)).data.invite.joined,true);
    assert.equal((await call('/api/rooms/'+r.id+'/invite?token=invalid')).status,403);
    const hostCookie=cookie;cookie='';await call('/api/status');
    const preview=(await call(invitation)).data.invite;assert.equal(preview.joined,false);assert.ok(preview.members.every(m=>!Object.hasOwn(m,'id')&&!Object.hasOwn(m,'preferences')));
    await call('/api/rooms/'+r.id+'/join',{nickname:'另一位旅伴',token:r.inviteToken});
    assert.equal((await call(invitation)).data.invite.joined,true);
    const guest=(await call('/api/rooms/'+r.id+'/preferences',{budget:400,maxWalk:5,startHour:9,tags:[],wants:['gushan'],must:[],avoid:[]})).data.room;
    assert.equal(Object.hasOwn(guest.summary,'budget'),false);const guestCookie=cookie;
    for(const identity of [hostCookie,guestCookie]){
      cookie=identity;const visible=(await call('/api/rooms/'+r.id)).data.room;
      assert.equal(Object.hasOwn(visible.summary,'budget'),false);
      assert.ok(visible.members.find(m=>m.id===visible.me).preferences.budget);
      assert.equal(visible.members.find(m=>m.id!==visible.me).preferences.budget,undefined);
    }
    cookie=hostCookie;const generated=await call('/api/rooms/'+r.id+'/generate',{mode:'basic'});
    assert.equal(generated.status,200);assert.equal(calls,2);assert.equal(Object.hasOwn(generated.data.room.summary,'budget'),false);
    assert.ok(generated.data.room.proposals.every(p=>p.budget<=400));
  }finally{const exited=once(child,'exit');child.kill();await exited;await new Promise(resolve=>mock.close(resolve));for(const suffix of ['','-wal','-shm'])fs.rmSync(file+suffix,{force:true});}
});
