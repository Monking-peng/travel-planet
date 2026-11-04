import * as THREE from 'three';
import {TAU,palette,site,paving,steps,hip,skin,glow,sign,finish,facade,prism,grove} from './chongqing-kit.js';
export {greatHall} from "./chongqing-hall.js";
export function monument(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.58,.53);paving(k,g,p,.49,.44);const wall=k.mat('#d9ceab',.9),accent=k.mat('#b89858',.58,.24),dark=k.mat('#4c625d',.7);
 k.cyl(g,.18,.20,.025,p.stone,0,.035,0,64);k.cyl(g,.104,.133,.075,wall,0,.078,0,8);k.cyl(g,.072,.099,.48,wall,0,.35,0,8);k.cyl(g,.084,.078,.042,wall,0,.61,0,8);k.cyl(g,.105,.105,.018,p.pale,0,.639,0,8);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.box(g,.007,.41,.007,accent,.089*Math.sin(a),.35,.089*Math.cos(a));}
 for(let i=0;i<4;i++){const a=i/4*TAU,face=new THREE.Group();g.add(face);face.rotation.y=a;
  const clock=k.mesh(face,new THREE.CircleGeometry(.025,40),p.pale,0,.611,.083);clock.material.side=THREE.DoubleSide;for(let j=0;j<12;j++){const t=j/12*TAU;const tick=k.box(face,.002,.005,.001,dark,Math.sin(t)*.020,.611+Math.cos(t)*.020,.085);tick.rotation.z=-t;}k.beam(face,[0,.611,.086],[.014,.617,.086],.0017,dark);k.beam(face,[0,.611,.086],[-.003,.627,.086],.0013,dark);
 }
 // Open observation crown and a small helmet top, not a pagoda roof.
 for(let i=0;i<8;i++){const a=i/8*TAU;k.cyl(g,.004,.005,.054,wall,.076*Math.sin(a),.674,.076*Math.cos(a),6);}k.cyl(g,.085,.091,.012,wall,0,.704,0,8);k.mesh(g,new THREE.SphereGeometry(.086,32,14,0,TAU,0,Math.PI/2),wall,0,.705,0).scale.y=.42;k.beam(g,[0,.74,0],[0,.825,0],.002,dark);k.beam(g,[-.022,.805,0],[.022,.805,0],.0017,dark);
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=128;c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle='#d9ceab';ctx.fillRect(0,0,128,1024);ctx.fillStyle='#8f6033';ctx.font='bold 94px Microsoft YaHei';ctx.textAlign='center';'人民解放纪念碑'.split('').forEach((s,i)=>ctx.fillText(s,64,110+i*120));const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#fff');m.map=map;k.mesh(g,new THREE.PlaneGeometry(.039,.37),m,0,.35,.095);}
 for(let i=0;i<24;i++){const a=i/24*TAU;k.ball(g,.017,k.mat(i%3?'#6e8352':'#bf975d',.95),.19*Math.sin(a),.051,.19*Math.cos(a));}
 return finish(k,g,{lamps:[[-.3,-.20],[.3,-.20],[-.3,.20],[.3,.20]],visitors:[[.25,.20],[-.22,.28],[.1,.31],[-.25,-.16],[.28,-.12]]});
}
export {theatre} from "./chongqing-theatre.js";
