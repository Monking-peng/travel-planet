import * as THREE from 'three';
import {hip} from './chongqing-kit.js';
import {glow} from './shenzhen-forms.js';
export {site,disc,pond,paving,steps,grove,sign,finish,skin,lattice,balcony} from './chengdu-kit.js';
export {hip,prism,facade} from './chongqing-kit.js';
export {archWall,bridge} from './shunde-kit.js';
export const TAU=Math.PI*2;
export function palette(k){return {stone:k.mat('#aaa896',.94),pale:k.mat('#d3d1bc',.9),red:k.mat('#9b3c2c',.84),wood:k.mat('#48362b',.88),tile:k.mat('#4f5650',.86),blue:k.mat('#274c82',.55),ochre:k.mat('#c08c32',.86),gold:k.mat('#bc9551',.52,.28),water:k.mat('#5c8a83',.32,.13),warm:glow(k,'#edc28b',.82,.5,.45)};}
export function cornice(k,g,x,y,z,w,d,mat){for(let i=0;i<=12;i++){const xx=x+(i/12-.5)*w;for(const side of [-1,1]){k.box(g,.014,.014,.038,mat,xx,y,z+side*d/2);k.box(g,.026,.007,.043,mat,xx,y+.009,z+side*d/2);}}}
export function hall(k,g,p,{x=0,z=0,y=.04,w=.44,d=.24,h=.16,roof=p.tile,roofEdge=roof,wall=p.pale,double=false}={}){
 k.box(g,w+.045,.022,d+.055,p.stone,x,y-.011,z);k.box(g,w*.90,h*.90,d*.70,wall,x,y+h*.45,z);
 const edge=k.mat(roofEdge.color,.7);edge.userData.night={color:new THREE.Color('#e8c48d'),intensity:.65};const pane=k.mat('#554b35',.86);pane.userData.night={color:new THREE.Color('#e7ba77'),intensity:.32};
 for(const side of [-1,1]){
  for(let i=0;i<=9;i++){const xx=x+(i/9-.5)*w*.94;k.cyl(g,.0045,.0055,h,p.red,xx,y+h/2,z+side*d*.46,8);}
  for(let i=0;i<9;i++){const xx=x+((i+.5)/9-.5)*w*.94,zz=z+side*d*.358;k.box(g,w*.087,h*.75,.003,p.wood,xx,y+h*.41,zz);k.box(g,w*.070,h*.43,.003,pane,xx,y+h*.53,zz+side*.002);for(let j=0;j<4;j++)k.box(g,.0015,h*.43,.002,p.wood,xx+(j-1.5)*w*.018,y+h*.53,zz+side*.004);for(let j=0;j<4;j++)k.box(g,w*.073,.0017,.002,p.wood,xx,y+h*(.34+j*.13),zz+side*.004);}
 }
 cornice(k,g,x,y+h,z,w,d*.96,p.wood);hip(k,g,w*1.16,d*1.18,h*.50,y+h+.023,roof,edge,x,z);
 if(double){k.box(g,w*.68,h*.23,d*.65,p.red,x,y+h*1.47,z);hip(k,g,w*.88,d*.95,h*.42,y+h*1.58,roof,edge,x,z);}
 for(const side of [-1,1])k.box(g,w*.98,.003,.003,p.warm,x,y+h+.016,z+side*d*.50);
}
export function octagonalRoof(k,g,r,y,h,mat,edge){
 const ring=(t,v)=>{const a=t*TAU,sector=TAU/8,local=((a+sector/2)%sector)-sector/2,rad=r*Math.cos(sector/2)/Math.cos(local),x=Math.sin(a)*rad*v,z=Math.cos(a)*rad*v;return [x,y+h*(1-v)**1.4+.012*v**7*(Math.abs(local)/(sector/2))**5,z];};
 const pos=[],idx=[],N=64,R=8;for(let j=0;j<=R;j++)for(let i=0;i<=N;i++)pos.push(...ring(i/N,.025+.975*j/R));for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,b,a+1,a+1,b,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,mat);k.line(g,Array.from({length:N},(_,i)=>ring(i/N,1)),.002,edge,true);
}
