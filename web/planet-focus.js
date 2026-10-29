// Turn at an overview scale before approaching the selected miniature.
// Keep the rendered pose as the starting point so a repeated selection is continuous.
const ease=q=>1-(1-Math.max(0,Math.min(1,q)))**3;
const mix=(a,b,q)=>a+(b-a)*q;
export function createFocusTransition(from,to,time){
  const turnMs=Math.max(...['x','y','z'].map(axis=>Math.abs(to[axis]-from[axis])))>.04?240:0;
  const viaZoom=turnMs?Math.min(from.zoom,to.zoom,1.4):from.zoom;
  const outMs=turnMs&&from.zoom>viaZoom+.01?120:0;
  return {from:{...from},to:{...to},time,viaZoom,outMs,turnMs,inMs:180};
}
export function sampleFocusTransition(f,time){
  const elapsed=Math.max(0,time-f.time);
  if(elapsed>=f.outMs+f.turnMs+f.inMs)return {...f.to,done:true};
  const turn=ease((elapsed-f.outMs)/(f.turnMs||1)),approach=ease((elapsed-f.outMs-f.turnMs)/f.inMs);
  const rotation=f.turnMs?turn:approach,view={};
  for(const axis of ['x','y','z','offsetY'])view[axis]=mix(f.from[axis],f.to[axis],rotation);
  view.zoom=elapsed<f.outMs?mix(f.from.zoom,f.viaZoom,ease(elapsed/f.outMs)):mix(f.viaZoom,f.to.zoom,approach);
  view.done=false;
  return view;
}
