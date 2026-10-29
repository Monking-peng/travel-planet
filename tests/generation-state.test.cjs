const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),{spawn}=require('node:child_process'),{once}=require('node:events'),path=require('node:path');
test('members can observe generation without exposing it to outsiders; edits invalidate work and every terminal outcome clears the status',async()=>{
  const held=[];const mock=http.createServer((req,res)=>{req.resume();req.on('end',()=>held.push(res));});
  await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
  const child=spawn(process.execPath,['server/index.cjs'],{cwd:path.resolve(__dirname,'..'),windowsHide:true,env:{...process.env,PORT:'0',HOST:'127.0.0.1',TRAVEL_DB:':memory:',TRAVEL_AI_BASE_URL:'http://127.0.0.1:'+mock.address().port,TRAVEL_AI_KEY:'test-only',TRAVEL_AI_MODEL:'controlled',TRAVEL_AI_DAILY_LIMIT:'20',COOKIE_SECURE:'false',COOKIE_PATH:'/',TRUST_PROXY:'false'},stdio:['ignore','pipe','pipe']});
  let pending;
  try{
    const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('startup timeout')),10000);child.stdout.on('data',buf=>{const m=buf.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});child.once('error',reject);});
    const client=()=>{let cookie='';return async(route,body)=>{const r=await fetch(base+'/api'+route,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};};};
    const host=client(),guest=client(),outsider=client();
    const room=(await host('/rooms',{nickname:'主持','startDate':'2026-12-31',days:1})).data.room,route='/rooms/'+room.id;
    await guest(route+'/join',{nickname:'旅伴',token:room.inviteToken});
    const prefs={budget:800,maxWalk:8,startHour:9,wants:['duanqiao'],tags:[],must:[],avoid:[]};
    await host(route+'/preferences',prefs);await guest(route+'/preferences',prefs);
    const wait=async()=>{const until=Date.now()+6000;while(!held.length&&Date.now()<until)await new Promise(r=>setTimeout(r,10));assert.ok(held.length);};
    const finish=(ok=true)=>{const res=held.shift();res.writeHead(ok?200:503,{'Content-Type':'application/json'});res.end(JSON.stringify(ok?{choices:[{message:{content:JSON.stringify({plans:[{title:'湖边慢逛',placeIds:['duanqiao','gushan']},{title:'看看湖山',placeIds:['leifeng','qianwang']}]})}}]}:{}));};
    pending=host(route+'/generate',{mode:'ai'});await wait();
    const visible=(await guest(route)).data.room;
    assert.ok(visible.generation?.startedAt);assert.equal(visible.generation.inputRevision,visible.inputRevision);
    assert.equal((await outsider(route)).status,403);
    assert.equal((await host(route+'/generate',{mode:'ai'})).data.error.code,'GENERATING');
    const edited=(await guest(route+'/preferences',{...prefs,text:'现在想晚一点出发'})).data.room;
    assert.ok(edited.generation);assert.notEqual(edited.generation.inputRevision,edited.inputRevision);
    finish();const stale=await pending;assert.equal(stale.data.error.code,'INPUT_CHANGED');
    const after=(await guest(route)).data.room;assert.equal(after.generation,null);assert.equal(after.proposals.length,0);
    pending=host(route+'/generate',{mode:'ai'});await wait();finish(false);assert.equal((await pending).status,502);assert.equal((await guest(route)).data.room.generation,null);
    pending=host(route+'/generate',{mode:'ai'});await wait();finish();const done=await pending;
    assert.equal(done.status,200);assert.equal(done.data.room.generation,null);assert.equal(done.data.room.proposals.length,2);
    assert.equal((await guest(route)).data.room.generation,null);
  }finally{
    for(const res of held){res.writeHead(503);res.end();}
    await pending?.catch(()=>{});
    const exited=once(child,'exit');child.kill();await exited;mock.closeAllConnections();await new Promise(resolve=>mock.close(resolve));
  }
});
