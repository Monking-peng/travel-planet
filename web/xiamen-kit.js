import * as THREE from 'three';
import {hip} from './chongqing-kit.js';
import {skin,glow} from './shenzhen-forms.js';
export {site,disc,paving,steps,grove,sign} from './chengdu-kit.js';
export {archWall,balcony,lattice} from './shunde-kit.js';
export {finish} from './suzhou-kit.js';
export {hip,skin};
export const TAU=Math.PI*2;
export function palette(k){return {wall:k.mat('#d9d2b6',.9),pale:k.mat('#e2ddc9',.9),stone:k.mat('#b2b1a2',.97),brick:k.mat('#ac5748',.92),red:k.mat('#813d30',.88),wood:k.mat('#493b31',.92),tile:k.mat('#437264',.74),gold:k.mat('#b59b5b',.53,.18),leaf:k.mat('#486d4c',.96),water:k.mat('#5f9690',.35,.12),warm:glow(k,'#f0cd91',.72,.35,.4)};}
export function edge(k,base,color='#efce99',intensity=.55){const m=k.mat(base,.8);m.userData.night={color:new THREE.Color(color),intensity};return m;}
export function window(k,g,p,x,y,z,w,h,{round=false}={}){
 const m=edge(k,'#434b49','#f1ce97',.28);k.box(g,w+.008,h+.008,.006,p.pale,x,y,z);k.box(g,w,h,.008,p.red,x,y,z+.002);
 k.box(g,w*.65,h*.78,.003,m,x,y,z+.007);k.box(g,.002,h*.78,.004,p.red,x,y,z+.010);k.box(g,w*.65,.002,.004,p.red,x,y+h*.10,z+.010);
 if(round){const ring=k.mesh(g,new THREE.TorusGeometry(w*.42,.0025,5,24),p.stone,x,y+h*.22,z+.010);ring.scale.y=.8;}
 else for(let i=0;i<6;i++)for(const s of [-1,1])k.box(g,w*.16,.0014,.003,p.wood,x+s*w*.41,y-h*.35+i*h*.13,z+.007);
}
export function minnanRoof(k,g,p,w,d,h,y,x=0,z=0){
 hip(k,g,w,d,h,y,p.tile,edge(k,p.tile.color),x,z);
 // Paired swallow-tail ridges rise beyond the main ridge, as on the Xiamen halls.
 const ridge=Math.max(0,(w-d)*.48);for(const side of [-1,1]){const points=[[x+side*ridge,y+h,z],[x+side*(ridge+.025),y+h+.006,z],[x+side*(ridge+.052),y+h+.035,z]];k.line(g,points,.0025,p.pale);k.line(g,points.map(q=>[q[0],q[1]+.002,q[2]]),.0012,p.red);}
 for(const sx of [-1,1])for(const sz of [-1,1])k.line(g,[[x+sx*w*.42,y+.012,z+sz*d*.42],[x+sx*w*.50,y+.029,z+sz*d*.50],[x+sx*w*.53,y+.052,z+sz*d*.53]],.0025,p.pale);
}
export function hall(k,g,p,{x=0,z=0,y=.04,w=.4,d=.23,h=.15,double=false}={}){
 k.box(g,w+.025,.018,d+.035,p.stone,x,y-.009,z);k.box(g,w*.87,h,d*.68,p.wall,x,y+h/2,z);
 const bays=Math.max(3,Math.round(w/.075));for(const s of [-1,1]){
  for(let i=0;i<=bays;i++){const xx=x+(i/bays-.5)*w;k.cyl(g,.004,.005,h,p.red,xx,y+h/2,z+s*d*.47,8);k.box(g,.020,.008,.022,p.gold,xx,y+h-.015,z+s*d*.47);}
  for(let i=0;i<bays;i++){const xx=x+((i+.5)/bays-.5)*w;window(k,g,p,xx,y+h*.45,z+s*d*.345,w*.58/bays,h*.64);}
  k.box(g,w,.009,.012,p.red,x,y+h-.007,z+s*d*.47);
 }
 minnanRoof(k,g,p,w*1.19,d*1.24,h*.36,y+h,x,z);
 if(double){k.box(g,w*.66,.042,d*.65,p.red,x,y+h+.07,z);minnanRoof(k,g,p,w*.94,d*.96,h*.32,y+h+.092,x,z);}
}
export function railing(k,g,p,points,height=.037){
 for(let i=1;i<points.length;i++){const a=new THREE.Vector3(...points[i-1]),b=new THREE.Vector3(...points[i]),n=Math.max(1,Math.ceil(a.distanceTo(b)/.035));k.beam(g,[a.x,a.y+height,a.z],[b.x,b.y+height,b.z],.0024,p.pale);
  for(let j=0;j<n;j++){const q=a.clone().lerp(b,j/n);k.box(g,.005,height,.005,p.pale,q.x,q.y+height/2,q.z);}}
 const q=points.at(-1);k.box(g,.005,height,.005,p.pale,q[0],q[1]+height/2,q[2]);
}
export function palm(k,g,p,x,y,z,h=.20){
 const top=[x+.012,y+h,z+.006];k.beam(g,[x,y,z],top,.006,p.wood,9);
 for(let i=0;i<9;i++){const a=i/9*TAU;skin(k,g,(u,v)=>{const t=u,r=.115*t,spread=.022*Math.sin(t*Math.PI)*(v-.5);return [top[0]+Math.sin(a)*r+Math.cos(a)*spread,top[1]+.028*Math.sin(t*Math.PI)-.04*t*t,top[2]+Math.cos(a)*r-Math.sin(a)*spread];},4,16,p.leaf);}
}
export function granite(k,g,p,{x=0,y=0,z=0,rx=.14,ry=.18,rz=.12,seed=1}={}){
 const geo=new THREE.SphereGeometry(1,40,28),a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i),zz=a.getZ(i),n=1+.036*Math.sin(xx*6+zz*4+seed)+.021*Math.cos(yy*8+seed);a.setXYZ(i,xx*rx*n,(yy+1)*ry*.5,zz*rz*n);}
 geo.computeVertexNormals();return k.mesh(g,geo,p.stone,x,y,z);
}
export function sea(k,g,p,rx,rz,x=0,z=0){const geo=new THREE.CircleGeometry(1,96);geo.rotateX(-Math.PI/2);geo.scale(rx,1,rz);p.water.userData.water=true;p.water.userData.landscape=true;return k.mesh(g,geo,p.water,x,.026,z);}
