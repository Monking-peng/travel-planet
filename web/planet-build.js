// Share the exact geometry pipeline between exports and the interactive page.
// Yield to the event loop between bounded chunks so forms can respond while
// constructing the scene. Individual Three.js geometry operations stay atomic.
export function buildImmediately(steps){
  let step;do{step=steps.next();}while(!step.done);return step.value;
}
// A timer yields fairly to rendering, input and existing timers. Prioritized
// scheduler continuations can repeatedly jump ahead of those pending timers.
const nextTask=()=>new Promise(resolve=>setTimeout(resolve,0));
export async function buildResponsively(steps,{budget=12,yieldTask=nextTask}={}){
  let since=performance.now();
  while(true){
    const step=steps.next();if(step.done)return step.value;
    if(performance.now()-since>=budget){await yieldTask();since=performance.now();}
  }
}
