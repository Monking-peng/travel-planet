const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{EventEmitter}=require('node:events');
const {verify}=require('../server/bridge.cjs');
function relay({context={OPENID:'relay-user',APPID:'relay-app'},secret='relay-test-key',apiBase='https://example.test/travel',respond=res=>{res.emit('data',Buffer.from('{"ok":true}'));res.emit('end');},status=200}={}){
  const captured=[],timers=new Map();let timerId=0;
  const https={request(url,options,callback){const req=new EventEmitter(),entry={url,options,body:'',destroyed:false};captured.push(entry);req.write=data=>{entry.body+=data;};req.destroy=()=>{entry.destroyed=true;queueMicrotask(()=>req.emit('error',new Error('internal socket detail')));};req.end=()=>queueMicrotask(()=>{const res=new EventEmitter();res.statusCode=status;callback(res);respond(res,req);});return req;}};
  const sandbox={exports:{},require:n=>n==='wx-server-sdk'?{DYNAMIC_CURRENT_ENV:'test',init(){},getWXContext:()=>context}:n==='https'?https:require(n),process:{env:{TRAVEL_BRIDGE_KEY:secret,TRAVEL_API_BASE_URL:apiBase}},Buffer,setTimeout(fn,ms){timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id)};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../cloudfunctions/travelApi/index.js'),'utf8'),sandbox);
  return {invoke:sandbox.exports.main,captured,timers};
}
const settles=promise=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Relay never settled')),100))]);
test('Cloud relay signs GET and POST with trusted WeChat identity, not caller identity',async()=>{
  const previous=process.env.TRAVEL_BRIDGE_KEY;process.env.TRAVEL_BRIDGE_KEY='relay-test-key';
  try{for(const [route,body] of [['/status',undefined],['/rooms',{nickname:'湖边验收',days:2,OPENID:'spoof'}]]){const h=relay();await h.invoke({path:route,method:body?'POST':'GET',body,OPENID:'attacker'});const wire=h.captured[0],headers=Object.fromEntries(Object.entries(wire.options.headers).map(([k,v])=>[k.toLowerCase(),v]));const user=verify({method:wire.options.method,headers},'/api'+route,body||{});assert.equal(user.uid,'wx-'+crypto.createHash('sha256').update('relay-app:relay-user').digest('hex').slice(0,40));assert.equal(wire.body,body?JSON.stringify(body):'');assert.equal(h.timers.size,0);}}
  finally{if(previous===undefined)delete process.env.TRAVEL_BRIDGE_KEY;else process.env.TRAVEL_BRIDGE_KEY=previous;}
});
test('Cloud relay rejects invalid methods and body shapes before contacting the server',async()=>{
  for(const event of [{path:'/status',method:'DELETE'},{path:'/rooms',method:'POST',body:[]},{path:'/rooms',method:'POST',body:'text'},{path:'https://unrelated.invalid',method:'GET'}]){const h=relay();assert.ok((await h.invoke(event)).error);assert.equal(h.captured.length,0);}
  assert.equal((await relay({context:{}}).invoke({path:'/status'})).error.code,'LOGIN_REQUIRED');assert.equal((await relay({secret:''}).invoke({path:'/status'})).error.code,'SERVICE_NOT_READY');
});
test('Cloud relay resolves aborted, oversized and malformed responses with a usable error',async()=>{
  for(const respond of [res=>res.emit('aborted'),res=>res.emit('error',new Error('TLS internal')),res=>{res.emit('data',Buffer.alloc(300001,65));res.emit('end');},res=>{res.emit('data',Buffer.from('null'));res.emit('end');},res=>{res.emit('data',Buffer.from('[1,2]'));res.emit('end');}]){const h=relay({respond});const result=await settles(h.invoke({path:'/status'}));assert.ok(result?.error?.code);assert.equal(h.timers.size,0);}
});
test('Cloud relay has an overall deadline and does not return raw gateway output',async()=>{
  const h=relay({respond(){}}),pending=h.invoke({path:'/rooms/test/generate',method:'POST',body:{mode:'ai'}});await new Promise(setImmediate);const deadlines=[...h.timers.values()];assert.equal(deadlines.length,1);assert.ok(deadlines[0].ms<=58000);deadlines[0].fn();const result=await settles(pending);assert.equal(result.error.code,'SERVICE_TIMEOUT');assert.ok(h.captured[0].destroyed);assert.equal(h.timers.size,0);
  const bad=relay({status:502,respond:res=>{res.emit('data',Buffer.from('{"ok":true}'));res.emit('end');}});assert.equal((await bad.invoke({path:'/status'})).error.code,'SERVICE_ERROR');
});
function nativeClient(call){const sandbox={module:{exports:{}},getApp:()=>({globalData:{cloudReady:true}}),wx:{cloud:{callFunction:call}}};vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../miniprogram/utils/api.js'),'utf8'),sandbox);return sandbox.module.exports.request;}
test('Native client turns platform failures into clear service and network messages',async()=>{
  for(const [error,code,pattern] of [[{code:'EIO',message:'socket secret trace'},'SERVICE_UNAVAILABLE',/连接/],[{errCode:-501000,errMsg:'FunctionName parameter could not be found'},'SERVICE_NOT_READY',/准备/],[{errMsg:'cloud.callFunction:fail timeout'},'SERVICE_TIMEOUT',/超时/]]){await assert.rejects(nativeClient(()=>Promise.reject(error))('/status'),e=>e.code===code&&pattern.test(e.message)&&!e.message.includes('secret'));}
});
test('Native client rejects malformed envelopes and preserves application error details',async()=>{
  for(const result of [null,[],42])await assert.rejects(nativeClient(()=>Promise.resolve({result}))('/status'),e=>/信息不完整/.test(e.message));
  await assert.rejects(nativeClient(()=>Promise.resolve({result:{error:{code:'PREFERENCE_CONFLICT',message:'想去与不去的地点有冲突。'}}}))('/rooms/x/generate',{}),e=>e.code==='PREFERENCE_CONFLICT'&&e.message==='想去与不去的地点有冲突。');
});


test('Cloud relay requires an explicit HTTPS target and does not default to a production server',async()=>{
  for(const apiBase of ['', 'http://example.test', 'https://example.test/?token=value']){const h=relay({apiBase});assert.equal((await h.invoke({path:'/status'})).error.code,'SERVICE_NOT_READY');assert.equal(h.captured.length,0);}
  const h=relay({apiBase:'https://example.test/custom/'});await h.invoke({path:'/status'});assert.equal(h.captured[0].url,'https://example.test/custom/api/status');
});
