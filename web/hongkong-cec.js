import * as THREE from 'three';
import {palette,site,skin,lit,finish,disc} from './hongkong-kit.js';
import {palm} from './shenzhen-forms.js';
export const CEC_WINGS=[{x:-.025,z:-.12,w:1.12,d:.67,base:.21,rise:.31},{x:.13,z:.19,w:.62,d:.68,base:.20,rise:.23}];
export function cecRoof(u,v,index=0){const w=CEC_WINGS[index],cross=Math.pow(Math.max(0,Math.sin(Math.PI*u)),index?.68:.78),taper=index?.77+.23*v:1-.10*Math.sin(Math.PI*v),x=w.x+(u-.5)*w.w*taper,y=w.base+w.rise*cross*(1-.15*v)+.025*Math.sin(Math.PI*v),z=w.z+(v-.5)*w.d+(index?.065*Math.sin(Math.PI*u)*(2*v-1):-.26*v*Math.sin(Math.PI*u)**2);return [x,y,z];}
export function cec(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,p,.78,.66),glass=lit(k,'#467e87',.16,1,'#92b5b4'),roof=k.mat('#bec8c7',.60,.23),soffit=k.mat('#829a9e',.72,.16),edge=lit(k,'#d3dcd7',.25),floor=lit(k,'#cbd0c6',.12),ground=k.mat('#b6b7a9',.98),mullion=k.mat('#8caaa9',.52,.22);roof.userData.cecRoof=true;glass.userData.cecGlass=true;ground.userData.cecWalk=true;
 skin(k,g,(u,v)=>{const a=u*Math.PI*2;return[Math.cos(a)*.70*v,.027,Math.min(.565,Math.sin(a)*.61)*v];},30,100,ground);skin(k,g,(u,v)=>{const a=u*Math.PI*2,x=Math.cos(a)*.70,z=Math.min(.565,Math.sin(a)*.61);return[x,THREE.MathUtils.lerp(height(x,z)+.003,.027,v),z];},6,100,p.pale);
 // Unequal swept roofs are staggered front to rear; the lower tongue projects toward the harbour.
 for(let index=0;index<2;index++){
  const fn=(u,v)=>cecRoof(u,v,index),inner=(u,v)=>fn(.07+.86*u,.10+.80*v);
  skin(k,g,fn,46,80,roof);skin(k,g,(u,v)=>{const q=fn(u,v);q[1]-=.008;return q;},30,64,soffit);
  for(const v of [0,1]){const curve=Array.from({length:81},(_,i)=>fn(i/80,v));k.line(g,curve,.0035,edge);for(let i=2;i<15;i++){const u=i/16,q=fn(u,v),b=fn(u,v? .965:.035);k.beam(g,q,b,.0017,mullion);}}
  for(const u of [0,1])k.line(g,Array.from({length:50},(_,i)=>fn(u,i/49)),.0028,edge);
  for(let i=1;i<27;i++)k.line(g,Array.from({length:65},(_,j)=>{const q=fn(j/64,i/27);q[1]+=.0005;return q;}),.0006,soffit);
  // Glazing is set back from every roof edge, exposing the broad underside.
  for(const v of [0,1]){
   skin(k,g,(u,t)=>{const q=inner(u,v);return[q[0],.034+t*(q[1]-.047),q[2]];},20,60,glass);
   for(let j=0;j<=27;j++){const q=inner(j/27,v);k.beam(g,[q[0],.034,q[2]],[q[0],q[1]-.013,q[2]],j%5===0?.0024:.0010,mullion);}
   for(let level=1;level<=16;level++){const y=.034+level*.024;k.line(g,Array.from({length:61},(_,j)=>{const q=inner(j/60,v);return[q[0],Math.min(y,q[1]-.014),q[2]];}),.0011,mullion);}
  }
  for(const u of [0,1]){skin(k,g,(v,t)=>{const q=inner(u,v);return[q[0],.034+t*(q[1]-.047),q[2]];},16,48,glass);for(let j=0;j<=25;j++){const q=inner(u,j/25);k.beam(g,[q[0],.034,q[2]],[q[0],q[1]-.013,q[2]],.0012,mullion);}}
  // The occupied terraces wrap the curved front, with thin balustrades on top.
  for(const y of [.085,.145,.205]){
   const fascia=(u,t)=>{const q=inner(u,1);return[q[0],y+t*.012,q[2]+.017];};skin(k,g,fascia,2,48,floor);
   skin(k,g,(u,v)=>{const q=inner(u,1);return[q[0],y+.012,q[2]+v*.017];},3,48,floor);
   const rail=Array.from({length:49},(_,j)=>{const q=inner(j/48,1);return[q[0],y+.022,q[2]+.016];});k.line(g,rail,.0010,mullion);
   for(let j=0;j<24;j++){const q=inner(j/23,1);k.beam(g,[q[0],y+.012,q[2]+.016],[q[0],y+.022,q[2]+.016],.0007,mullion);}
  }
 }
 // A recessed waterfront doorway and low canopy keep the public approach legible.
 k.box(g,.16,.048,.004,glass,.13,.056,.517);for(const x of [.055,.13,.205])k.box(g,.002,.045,.005,mullion,x,.056,.521);
 k.box(g,.21,.006,.075,floor,.13,.083,.54);for(const x of [.035,.225])k.cyl(g,.002,.002,.053,mullion,x,.0535,.56,8);
 // A broad stone apron is level; ten supported treads join its edge to the spherical waterfront.
 for(let i=0;i<10;i++){
  const z0=.565+i*.0075,z1=z0+.0075,top=x=>THREE.MathUtils.lerp(.027,height(x,.640)+.003,i/10),next=x=>THREE.MathUtils.lerp(.027,height(x,.640)+.003,(i+1)/10);
  skin(k,g,(u,v)=>{const x=.13+(u-.5)*.24;return[x,top(x),THREE.MathUtils.lerp(z0,z1,v)];},2,18,ground);
  skin(k,g,(u,v)=>{const x=.13+(u-.5)*.24;return[x,THREE.MathUtils.lerp(next(x),top(x),v),z1];},2,18,p.pale);
 }

 for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*(.37+i*.085),z=.38-i*.10;palm(k,g,x,.027,z,.105);}
 for(const x of [-.52,-.47,-.42]){k.beam(g,[x,.028,.46],[x,.135,.46],.0014,p.steel);k.box(g,.024,.014,.001,p.pale,x+.012,.123,.46);}
 return finish(k,g,{lamps:[[-.32,.027,.46],[.37,.027,.46]],visitors:[[-.21,.027,.44],[.14,.027,.535],[.27,.027,.43]]});
}
