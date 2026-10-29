import * as THREE from 'three';
import {sag,groundPatch} from './shanghai-heritage.js';

// Cable-stayed river crossing and the recognisable Puxi spiral approach.
export function nanpu(k){
  const g=new THREE.Group(),concrete=k.mat('#c4cdc7'),road=k.mat('#667476'),steel=k.mat('#8caaa9',.5,.35),paint=k.mat('#e5dfc7'),lights=k.mat('#d7ca9e',.5,.1,'#f8ce83'),cool=k.mat('#a8bcc2',.5,.2,'#a3cbec');
  lights.userData.night.intensity=1.05;cool.userData.night.intensity=.65;
  const deckY=.13;
  function ribbon(points,w,material,offset=0){
    const verts=[],idx=[];for(let i=0;i<points.length;i++){const [x,y,z]=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1;for(const side of [-1,1])verts.push(x+side*dz/len*w/2,y+offset,z-side*dx/len*w/2);if(i){const n=i*2;idx.push(n-2,n,n-1,n-1,n,n+1);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();return k.mesh(g,geo,material);
  }
  const main=Array.from({length:85},(_,i)=>{const x=-.64+i/84*1.28;return [x,deckY-.022*(x/.64)**2,0];});
  ribbon(main,.105,concrete,-.013);ribbon(main,.092,road);ribbon(main,.002,paint,.001);
  for(const side of [-1,1]){
    k.line(g,main.map(([x,y])=>[x,y+.009,side*.052]),.0018,lights);
    for(let x=-.63;x<.64;x+=.026){k.box(g,.015,.001,.0015,paint,x,deckY-.022*(x/.64)**2+.002,side*.022);k.beam(g,[x,deckY-.022*(x/.64)**2,side*.05],[x,deckY-.022*(x/.64)**2+.012,side*.05],.0007,steel);}
  }
  for(const x of [-.235,.235]){
    for(const side of [-1,1]){
      const z=side*.074;k.box(g,.043,.045,.045,concrete,x,sag(x,z)+.022,z);
      k.beam(g,[x,sag(x,z)+.035,side*.08],[x,.265,side*.061],.013,concrete,4);k.box(g,.025,.21,.027,concrete,x,.36,side*.061);
      for(const dir of [-1,1])for(let j=1;j<=12;j++){
        const end=x+dir*j*.029;if(Math.abs(end)>.60)continue;
        k.beam(g,[x,.455-j*.010,side*.061],[end,deckY-.022*(end/.64)**2+.006,side*.046],.00085,steel,5);
      }
      k.beam(g,[x,.27,z*.83],[x,.463,z*.83],.0019,cool);
    }
    k.box(g,.031,.031,.152,concrete,x,.264);k.box(g,.038,.02,.17,concrete,x,.087);
  }
  // Approach curls downward for one turn, with separated upper and lower roads.
  const loop=Array.from({length:161},(_,i)=>{const t=i/160,a=t*Math.PI*2+Math.PI/2,r=.215-.040*t;return [-.64+r*Math.cos(a),.108-.125*t,.215-r*Math.sin(a)];});
  ribbon(loop,.062,concrete,-.009);ribbon(loop,.052,road);ribbon(loop,.0015,paint,.001);
  for(const side of [-1,1]){
    const edge=loop.map(([x,y,z],i)=>{const a=i/160*Math.PI*2+Math.PI/2;return [x+side*.029*Math.cos(a),y+.007,z-side*.029*Math.sin(a)];});k.line(g,edge,.0014,lights);
  }
  for(let i=0;i<loop.length;i+=12){const [x,y,z]=loop[i],bottom=sag(x,z);k.box(g,.018,Math.max(.01,y-bottom-.01),.019,concrete,x,(y+bottom)/2-.006,z);}
  const exit=Array.from({length:33},(_,i)=>{const t=i/32,x=-.64+.28*t,z=.04-.15*t;return [x,THREE.MathUtils.lerp(-.017,sag(x,z)+.016,t),z];});ribbon(exit,.054,road);
  const east=Array.from({length:32},(_,i)=>{const t=i/31,x=.64+.18*t,z=-.15*t*t;return [x,THREE.MathUtils.lerp(.108,sag(x,z)+.017,t),z];});ribbon(east,.095,road);k.line(g,east.map(([x,y,z])=>[x,y+.005,z+.05]),.0014,lights);
  for(const x of [-.53,.53,.66]){const bottom=sag(x,0);k.box(g,.025,deckY-bottom-.025,.074,concrete,x,(deckY+bottom)/2-.013);}
  const lawn=Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;return [-.64+.15*Math.cos(a),.215+.14*Math.sin(a)];});groundPatch(k,g,lawn,k.mat('#849778'),.012);
  // Tiny vehicles make the crossing legible without adding unrelated structures.
  const bodies=[k.mat('#c6c8b8'),k.mat('#996451'),k.mat('#658d98')],windows=k.mat('#3e575f',.4,.25);
  for(let i=0;i<12;i++){const x=-.52+i*.091,z=(i%2?1:-1)*.027,y=deckY-.022*(x/.64)**2;k.box(g,.018,.007,.009,bodies[i%3],x,y+.004,z);k.box(g,.009,.004,.008,windows,x,y+.009,z);}
  return k.merge(g);
}
