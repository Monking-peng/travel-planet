const cloud=require('wx-server-sdk'),crypto=require('crypto'),https=require('https');
cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});
const failure=(code,message)=>({error:{code,message}});
exports.main=async(event={})=>{
  const ctx=cloud.getWXContext();if(!ctx.OPENID||!ctx.APPID)return failure('LOGIN_REQUIRED','请从微信小程序中打开。');
  const secret=process.env.TRAVEL_BRIDGE_KEY,apiBase=(process.env.TRAVEL_API_BASE_URL||'').replace(/\/+$/,'');if(!secret||!/^https:\/\/[^/?#\s]+(?:\/[^?#\s]*)?$/.test(apiBase))return failure('SERVICE_NOT_READY','旅行服务正在准备中，请稍后再试。');
  if(!event||typeof event!=='object'||Array.isArray(event))return failure('INVALID_REQUEST','提交内容格式不正确。');
  const path=String(event.path||'');if(!/^\/(status|catalog|rooms(?:\/[a-z0-9-]+(?:\/[a-zA-Z]+)?(?:\?token=[\w-]+)?)?|extract)$/.test(path))return failure('INVALID_PATH','操作不支持。');
  const method=event.method===undefined?'GET':event.method;if(method!=='GET'&&method!=='POST')return failure('INVALID_METHOD','操作方式不支持。');
  const data=method==='POST'?(event.body===undefined?{}:event.body):{};
  if(!data||typeof data!=='object'||Array.isArray(data))return failure('INVALID_BODY','提交内容格式不正确。');
  let body;try{body=JSON.stringify(data);}catch{return failure('INVALID_BODY','提交内容格式不正确。');}
  if(Buffer.byteLength(body)>16000)return failure('TOO_LARGE','内容太长，请缩短一点。');
  const identity=ctx.APPID+':'+ctx.OPENID,stamp=String(Date.now()),nonce=crypto.randomBytes(16).toString('hex'),apiPath='/api'+path;
  const signature=crypto.createHmac('sha256',secret).update([method,apiPath,stamp,nonce,identity,body].join('\n')).digest('hex');
  return new Promise(resolve=>{
    let settled=false,req;
    const finish=value=>{if(settled)return;settled=true;clearTimeout(deadline);resolve(value);};
    const stop=(code='SERVICE_UNAVAILABLE',message='连接暂时中断，请重新进入旅行查看结果。')=>{finish(failure(code,message));req?.destroy();};
    const deadline=setTimeout(()=>stop('SERVICE_TIMEOUT','响应超时，请先重新进入旅行查看结果。'),58000);
    try{
      req=https.request(apiBase+apiPath,{method,headers:{'Content-Type':'application/json','X-Travel-Identity':identity,'X-Travel-Time':stamp,'X-Travel-Nonce':nonce,'X-Travel-Signature':signature},timeout:55000},res=>{
        const chunks=[];let bytes=0;
        res.on('data',chunk=>{if(settled)return;const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);bytes+=buffer.length;if(bytes>300000){stop('SERVICE_ERROR','旅行资料暂时无法完整加载，请稍后重试。');return;}chunks.push(buffer);});
        res.on('aborted',()=>stop());res.on('error',()=>stop());
        res.on('end',()=>{
          if(settled)return;let result;
          try{result=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{finish(failure('SERVICE_ERROR','旅行服务暂时没有正常响应，请稍后重试。'));return;}
          if(!result||typeof result!=='object'||Array.isArray(result)||((res.statusCode<200||res.statusCode>=300)&&!result.error)){finish(failure('SERVICE_ERROR','旅行服务暂时没有正常响应，请稍后重试。'));return;}
          finish(result);
        });
      });
      req.on('timeout',()=>stop('SERVICE_TIMEOUT','响应超时，请先重新进入旅行查看结果。'));req.on('error',()=>finish(failure('SERVICE_UNAVAILABLE','暂时连接不上旅行服务，请稍后重试。')));
      if(method==='POST')req.write(body);req.end();
    }catch{stop();}
  });
};
