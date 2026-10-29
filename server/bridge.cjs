const crypto=require('node:crypto');
const {fail}=require('../shared/domain.cjs');
const seen=new Map();
function verify(req,path,body){
  const signature=req.headers['x-travel-signature'];if(!signature)return null;
  const secret=process.env.TRAVEL_BRIDGE_KEY,identity=req.headers['x-travel-identity'],stamp=req.headers['x-travel-time'],nonce=req.headers['x-travel-nonce'];
  if(!secret||typeof identity!=='string'||identity.length>300||!/^\d+$/.test(stamp||'')||Math.abs(Date.now()-Number(stamp))>120000||!/^\w{16,64}$/.test(nonce||'')||!/^[a-f0-9]{64}$/.test(signature))fail('AUTH_INVALID','小程序身份验证失败，请重新进入。',401);
  const signed=[req.method,path,stamp,nonce,identity,JSON.stringify(body)].join('\n');const expected=crypto.createHmac('sha256',secret).update(signed).digest('hex');
  if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature)))fail('AUTH_INVALID','小程序身份验证失败。',401);
  if(seen.has(nonce))fail('REPLAY','请求已经处理，请刷新查看。',409);
  const now=Date.now();seen.set(nonce,now);for(const [key,at] of seen)if(now-at>120000)seen.delete(key);
  return {uid:'wx-'+crypto.createHash('sha256').update(identity).digest('hex').slice(0,40),nickname:'',token:null};
}
module.exports={verify};
