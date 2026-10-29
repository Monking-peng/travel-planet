const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createStore}=require('./store.cjs');
const domain=require('../shared/domain.cjs'),catalog=require('../shared/catalog.cjs'),ai=require('./ai.cjs');
const bridge=require('./bridge.cjs');
const root=path.resolve(__dirname,'..'),port=Number(process.env.PORT||4178),host=process.env.HOST||'127.0.0.1';
const db=createStore(process.env.TRAVEL_DB||path.join(root,'.local/travel.sqlite'));
const jobs=new Map(),limits=new Map();
function roomView(room,uid,generation=jobs.get(room.id)||null){return {...domain.view(room,uid),generation};}
const release=process.env.TRAVEL_RELEASE||'development';
const version=require('../package.json').version;
const positiveLimit=(value,fallback)=>Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):fallback;
function reserveAI(user,ip,roomId){if(!ai.available())domain.fail('AI_UNAVAILABLE','AI 暂未连接，可以先手动填写或使用基础排程。',503);const scopes=[{key:'all',max:positiveLimit(process.env.TRAVEL_AI_DAILY_LIMIT,200)},{key:'user:'+user.uid,max:24}];if(user.token)scopes.push({key:'ip:'+ip,max:60});if(roomId)scopes.push({key:'room:'+roomId,max:24});db.consumeAI(scopes);}
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
function rate(key,max=30){const now=Date.now(),prev=limits.get(key)||[];const recent=prev.filter(t=>now-t<60000);if(recent.length>=max)domain.fail('TOO_FAST','操作有点频繁，稍等一会儿再试。',429);recent.push(now);limits.set(key,recent);if(limits.size>5000)for(const [k,v] of limits)if(v.at(-1)<now-60000)limits.delete(k);}
async function body(req){let b='';for await(const c of req){b+=c;if(Buffer.byteLength(b)>16000)domain.fail('BODY_TOO_LARGE','内容太长，请缩短一点。',413);}let value;try{value=b?JSON.parse(b):{};}catch{domain.fail('INVALID_JSON','提交内容格式不正确。');}if(!value||typeof value!=='object'||Array.isArray(value))domain.fail('INVALID_JSON','提交内容格式不正确。');return value;}
function session(req,res){const token=/\btp_session=([a-f0-9]{48})\b/.exec(req.headers.cookie||'')?.[1];let user=token&&db.session(token);if(user)return {...user,token};const t=crypto.randomBytes(24).toString('hex'),uid=crypto.randomUUID();user=db.createSession(t,uid);const secure=process.env.COOKIE_SECURE==='true'?'; Secure':'';res.setHeader('Set-Cookie',`tp_session=${t}; HttpOnly; Path=${process.env.COOKIE_PATH||'/'}; SameSite=Lax; Max-Age=2592000${secure}`);return {...user,token:t};}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.wav':'audio/wav','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  try{
    if(url.pathname==='/health'&&req.method==='GET')return json(res,200,{ok:true,service:'travel-planet',release});
    if(url.pathname.startsWith('/api/')){
      const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)domain.fail('ORIGIN','请在当前小程序或页面内操作。',403);
      const local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);const ip=local&&process.env.TRUST_PROXY==='true'?req.headers['x-real-ip']:req.socket.remoteAddress;
      rate('ip:'+(ip||'local'),150);
      const input=req.method==='POST'?await body(req):{};const user=bridge.verify(req,url.pathname+url.search,input)||session(req,res);
      if(url.pathname==='/api/status')return json(res,200,{ok:true,ai:ai.available(),user:{id:user.uid,nickname:user.nickname},version,release});
      if(url.pathname==='/api/catalog'){const c=catalog.getCatalog(url.searchParams.get('city')??undefined);if(!c)domain.fail('CITY_UNSUPPORTED','目前支持杭州、上海和武汉。');return json(res,200,{city:c.city,places:c.places,tags:c.tags});}
      if(url.pathname==='/api/rooms'&&req.method==='GET')return json(res,200,{rooms:db.list(user.uid)});
      if(url.pathname==='/api/rooms'&&req.method==='POST'){
        rate('create:'+user.uid,6);const room=domain.create(user.uid,input);db.insert(room);if(user.token)db.nickname(user.token,domain.text(input.nickname,16));return json(res,201,{room:roomView(room,user.uid)});
      }
      if(url.pathname==='/api/extract'&&req.method==='POST'){rate('ai:'+user.uid,6);const text=domain.text(input.text,1000);if(!text)domain.fail('EMPTY','先写一点你对旅行的想法。');let context={city:input.city??'杭州'};if(input.roomId){const r=db.get(String(input.roomId));domain.member(r,user.uid);context={city:r.city,startDate:r.startDate,days:r.days};}if(!catalog.getCatalog(context.city))domain.fail('CITY_UNSUPPORTED','目前支持杭州、上海和武汉。');reserveAI(user,ip,input.roomId);return json(res,200,{extraction:await ai.extract(text,context)});}
      const match=url.pathname.match(/^\/api\/rooms\/([a-z0-9-]+)(?:\/([a-zA-Z]+))?$/);
      if(match){const [,id,action]=match,room=db.get(id);
        if(action==='invite'&&req.method==='GET'){
          if(room.closed||room.inviteToken!==url.searchParams.get('token'))domain.fail('INVITE_INVALID','邀请已失效，请联系发起人。',403);
          return json(res,200,{invite:{id,city:room.city||'杭州',title:room.title,startDate:room.startDate,days:room.days,members:room.members.map(m=>({nickname:m.nickname,color:m.color})),final:Boolean(room.final),joined:room.members.some(m=>m.id===user.uid)}});
        }
        if(!action&&req.method==='GET')return json(res,200,{room:roomView(room,user.uid)});
        if(action==='generate'&&req.method==='POST'){
          domain.host(room,user.uid);domain.editable(room);rate('ai:'+user.uid,6);if(jobs.has(id))domain.fail('GENERATING','这次旅行正在整理方案，请稍候。',409);
          const summary=domain.summary(room);if(summary.missing.length)domain.fail('PREFERENCES_MISSING','等每位旅伴提交想法后再生成。',409);if(summary.conflicts.length)domain.fail('PREFERENCE_CONFLICT',summary.conflicts[0].detail,422);if(input.mode!=='basic')reserveAI(user,ip,id);
          jobs.set(id,{startedAt:Date.now(),inputRevision:room.inputRevision});try{const result=await ai.plans(room,input.mode==='basic'?'basic':'ai',input.feedback);const updated=db.update(id,r=>domain.commitPlans(r,user.uid,result.plans,room.inputRevision,result.mode));return json(res,200,{room:roomView(updated,user.uid,null)});}finally{jobs.delete(id);}
        }
        if(action&&req.method==='POST'){rate('mutation:'+user.uid,40);const updated=db.update(id,r=>domain.apply(r,user.uid,action,input));if(action==='leave')return json(res,200,{ok:true});return json(res,200,{room:roomView(updated,user.uid)});}
      }
      domain.fail('NOT_FOUND','没有找到这个操作。',404);
    }
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
    let file;
    if(url.pathname.startsWith('/vendor/three/'))file=path.join(root,'node_modules/three',url.pathname.slice('/vendor/three/'.length));
    else file=path.join(root,'web',url.pathname==='/'?'index.html':decodeURIComponent(url.pathname));
    const safeWeb=path.join(root,'web')+path.sep,safeVendor=path.join(root,'node_modules/three')+path.sep;
    if(!file.startsWith(safeWeb)&&!file.startsWith(safeVendor))domain.fail('NOT_FOUND','找不到这个页面。',404);
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory())domain.fail('NOT_FOUND','找不到这个页面。',404);
    const stat=fs.statSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':file.endsWith('.glb')||file.endsWith('.mp3')?'public, max-age=3600':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; frame-ancestors 'none'"});
    if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
  }catch(e){if(res.headersSent){res.end();return;}const status=e instanceof domain.AppError?e.status:500;json(res,status,{error:{code:e.code||'SERVER_ERROR',message:e instanceof domain.AppError?e.message:'服务暂时没有完成操作，已保存的内容不会丢失。'}});if(status===500)console.error('request-failed',e.name,e.code||'internal');}
});
server.listen(port,host,()=>console.log(`旅行星球已启动 http://${host}:${server.address().port}`));
process.on('SIGTERM',()=>server.close(()=>{db.close();process.exit(0);}));
