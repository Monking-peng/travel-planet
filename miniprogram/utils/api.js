const serviceError=(code,message)=>{const error=new Error(message);error.code=code;return error;};
async function request(path,body){
  if(!getApp().globalData.cloudReady)throw serviceError('SERVICE_UNAVAILABLE','当前微信版本不支持旅行服务，请升级微信。');
  let response;
  try{response=await wx.cloud.callFunction({name:'travelApi',data:{path,method:body===undefined?'GET':'POST',body:body===undefined?{}:body}});}
  catch(error){
    const detail=[error?.errMsg,error?.message,error?.code,error?.errCode].filter(Boolean).join(' ');
    if(/FUNCTION_NOT_FOUND|-501000|FunctionName.*(?:not.*found|不存在)/i.test(detail))throw serviceError('SERVICE_NOT_READY','旅行服务正在准备中，稍后再试。');
    if(/timeout|timed out|超时/i.test(detail))throw serviceError('SERVICE_TIMEOUT','响应超时，请先重新进入旅行查看结果。');
    throw serviceError('SERVICE_UNAVAILABLE','暂时连接不上旅行服务，请稍后重试。');
  }
  const result=response?.result;
  if(!result||typeof result!=='object'||Array.isArray(result))throw serviceError('SERVICE_ERROR','旅行服务返回的信息不完整，请稍后重试。');
  if(result.error)throw serviceError(result.error.code||'SERVICE_ERROR',result.error.message||'操作没有完成，请稍后重试。');
  return result;
}
module.exports={request};
