// Keep the recovery extension from a healthy context: getExtension returns null
// while a context is lost. This module retains identity across renderer retries.
const contexts=new WeakMap();
export async function recoverContext(canvas){
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance'});
  if(!context)throw new Error('WebGL2 unavailable');
  if(context.isContextLost())await new Promise((resolve,reject)=>{
    const restored=()=>{clearTimeout(timer);canvas.removeEventListener('webglcontextrestored',restored);resolve();};
    const timer=setTimeout(()=>{canvas.removeEventListener('webglcontextrestored',restored);reject(new Error('WebGL recovery timed out'));},5000);
    canvas.addEventListener('webglcontextrestored',restored);
    contexts.get(canvas)?.restoreContext();
  });
  contexts.set(canvas,context.getExtension('WEBGL_lose_context'));
}
