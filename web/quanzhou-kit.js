import * as THREE from 'three';
import {hip} from './chongqing-kit.js';
import {skin,glow} from './shenzhen-forms.js';
import {minnanRoof,railing,granite,sea} from './xiamen-kit.js';
export {site,disc,paving,steps,grove,sign} from './chengdu-kit.js';
export {archWall,lattice,balcony} from './shunde-kit.js';
export {finish} from './suzhou-kit.js';
export {skin,hip,minnanRoof,railing,granite,sea};
export const TAU=Math.PI*2;
export function palette(k){return {wall:k.mat('#cdad7e',.94),pale:k.mat('#d6cfb8',.94),stone:k.mat('#9c9b88',.98),brick:k.mat('#ab5c41',.93),red:k.mat('#8e4637',.9),wood:k.mat('#473c31',.94),tile:k.mat('#7c7861',.89),gold:k.mat('#b39b63',.67,.1),leaf:k.mat('#4e704a',.98),water:k.mat('#668b85',.57,.06),warm:glow(k,'#efbe7c',.68,.43,.7)};}
export function lit(k,color,intensity=.28){const m=k.mat(color,.9);m.userData.night={color:new THREE.Color('#f1cc96'),intensity};return m;}
export function lantern(k,g,p,x,y,z,r=.012){const m=lit(k,'#ae4d30',.8);m.userData.pulse={speed:.8,phase:x*13};const o=k.ball(g,r,m,x,y,z);o.scale.y=.82;k.cyl(g,r*.53,r*.53,.0025,p.gold,x,y+r*.83,z,12);k.beam(g,[x,y+r,z],[x,y+r*1.9,z],.001,p.wood);k.beam(g,[x,y-r,z],[x,y-r*1.9,z],.0015,p.red);}
export function dragon(k,g,p,x,y,z,side=1,scale=1){
 const child=new THREE.Group();child.position.set(x,y,z);child.scale.setScalar(scale);g.add(child);
 const a=[[0,0,0],[side*.012,.016,0],[side*.042,.026,0],[side*.053,.052,0],[side*.037,.066,0],[side*.025,.057,0]];
 k.line(child,a,.004,p.tile);k.line(child,a.map(q=>[q[0],q[1]+.002,q[2]+.003]),.0014,p.pale);
 const head=k.ball(child,.008,p.tile,side*.025,.060,0);head.scale.set(1.4,.8,.75);k.beam(child,[side*.020,.065,0],[side*.014,.080,-.002],.0018,p.pale);
 for(let i=0;i<4;i++){const q=a[i+1];k.beam(child,[q[0],q[1]+.004,q[2]],[q[0]+side*.004,q[1]+.015,q[2]],.0014,p.pale);}
}
export function hall(k,g,p,{x=0,z=0,y=.045,w=.42,d=.24,h=.15,double=false,ornate=false}={}){
 k.box(g,w+.030,.025,d+.030,p.stone,x,y-.0125,z);k.box(g,w*.90,h,d*.74,p.wall,x,y+h/2,z);
 const bays=Math.max(3,Math.round(w/.075)),pane=lit(k,'#473c2f',.22);
 for(const side of [-1,1]){
  for(let i=0;i<bays;i++){const xx=x+((i+.5)/bays-.5)*w*.88;const zz=z+side*d*.376;k.box(g,w*.75/bays,h*.79,.004,p.red,xx,y+h*.43,zz);if(Math.abs(xx-x)<w*.1){k.box(g,w*.65/bays,h*.81,.005,pane,xx,y+h*.415,zz+side*.003);}else{k.box(g,w*.59/bays,h*.40,.004,pane,xx,y+h*.57,zz+side*.003);for(let j=0;j<5;j++)k.box(g,.0008,h*.40,.005,p.red,xx+(j/4-.5)*w*.59/bays,y+h*.57,zz+side*.006);for(let j=0;j<3;j++)k.box(g,w*.59/bays,.0009,.005,p.red,xx,y+h*(.40+j*.16),zz+side*.006);}}
  for(let i=0;i<=bays;i++){const xx=x+(i/bays-.5)*w;k.cyl(g,.004,.0055,h,p.stone,xx,y+h/2,z+side*d*.46,10);k.box(g,.021,.007,.020,p.wood,xx,y+h-.012,z+side*d*.46);k.box(g,.029,.006,.027,p.red,xx,y+h-.005,z+side*d*.46);if(ornate&&i%2===1)k.line(g,Array.from({length:24},(_,j)=>{const t=j/23;return [xx+.0058*Math.sin(t*TAU*2),y+.025+t*(h-.045),z+side*d*.46+.0058*Math.cos(t*TAU*2)];}),.0016,p.pale);}
  k.box(g,w,.012,.012,p.wood,x,y+h-.005,z+side*d*.46);
 }
 minnanRoof(k,g,p,w*1.17,d*1.23,h*.36,y+h,x,z);
 let ry=y+h+h*.36;
 if(double){k.box(g,w*.73,.037,d*.66,p.red,x,ry+.016,z);minnanRoof(k,g,p,w*.97,d*.99,h*.34,ry+.036,x,z);ry+=.036+h*.34;}
 if(ornate){for(const side of [-1,1])dragon(k,g,p,x+side*w*.17,ry,z,side,.70);k.ball(g,.009,p.gold,x,ry+.023,z);}
}
// A pointed arch is an actual empty opening, not a dark rectangle pasted on stone.
export function pointedPortal(k,g,p,{x=0,z=0,y=.025,w=.30,h=.45,d=.07,r=.087,spring=.23}={}){
 const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
 const hole=new THREE.Path();hole.moveTo(-r,.001);hole.lineTo(-r,spring);hole.quadraticCurveTo(-r*.91,spring+.055,0,spring+.145);hole.quadraticCurveTo(r*.91,spring+.055,r,spring);hole.lineTo(r,.001);hole.closePath();shape.holes.push(hole);
 const mat=p.stone.clone();k.materials.push(mat);mat.userData.pointedPortal=true;
 k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:24}),mat,x,y,z-d/2);
 for(const side of [-1,1]){const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push([x+side*r*(1-t*t),y+spring+.145*t,z+d/2+.001]);}k.line(g,pts,.004,p.pale);}
 k.box(g,w+.016,.013,d+.020,p.pale,x,y+h+.006,z);
 for(let i=0;i<9;i++)k.box(g,w/13,.018,d*.88,p.stone,x+(i/8-.5)*w*.94,y+h+.021,z);
 for(let j=1;j<18;j++){const yy=y+j*.024,cut=yy<y+spring?r:yy<y+spring+.145?r*Math.sqrt(Math.max(0,1-(yy-y-spring)/.145)):0;for(const side of [-1,1]){const len=w/2-cut-.008;if(len>0)k.box(g,len,.0007,.001,p.wood,x+side*(cut+.008+len/2),yy,z+d/2+.001);}}
}
