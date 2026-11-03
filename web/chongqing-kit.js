import * as THREE from 'three';
export {site,disc,pond,paving,steps,grove,glow,skin,lattice,balcony,sign,finish} from './chengdu-kit.js';
import {skin,glow} from './shenzhen-forms.js';
export const TAU=Math.PI*2;
export function palette(k){return {stone:k.mat('#aaa997',.94),pale:k.mat('#d2d0b9',.9),wood:k.mat('#48382f',.89),red:k.mat('#a94630',.82),tile:k.mat('#535e52',.86),green:k.mat('#28766a',.59),gold:k.mat('#b89a58',.55,.35),warm:glow(k,'#edb66c',.95,.7,.45),water:k.mat('#5e8983',.32,.17)};}
export function hip(k,g,w,d,h,y,mat,edge,x=0,z=0){
 const ridge=Math.max(0,(w-d)*.48);
 const point=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),norm=Math.max(Math.abs(c),Math.abs(s)),ex=c/norm*w/2,ez=s/norm*d/2,r=.001+.999*v;return [x+ex*r+THREE.MathUtils.clamp(ex,-ridge,ridge)*(1-r),y+h*(1-r)**1.45+.014*r**6*(Math.min(Math.abs(c),Math.abs(s))/.7071)**8,z+ez*r];};
 skin(k,g,point,12,96,mat);k.line(g,Array.from({length:96},(_,i)=>point(i/96,1)),.002,edge,true);
 for(let i=0;i<64;i+=2)k.line(g,Array.from({length:9},(_,j)=>{const p=point(i/64,.10+.90*j/8);p[1]+=.001;return p;}),.00065,mat);
 k.beam(g,[x-ridge,y+h,z],[x+ridge+.0001,y+h,z],.003,edge);
}
export function facade(k,g,w,h,x,y,z,wall,trim,{bays=8,rows=6,lit=null}={}){
 const glass=lit||k.glass('#526c6d','#f0cb94',x*17+h*81+31);k.box(g,w,h,.005,glass,x,y,z);
 for(let i=0;i<=bays;i++)k.box(g,.004,h,.009,trim,x-w/2+i*w/bays,y,z+.003);
 for(let j=0;j<=rows;j++)k.box(g,w,.005,.011,wall,x,y-h/2+j*h/rows,z+.004);
}
export function quay(k,g,p,w=.9,z=.35){k.box(g,w,.034,.10,p.stone,0,.030,z);for(let i=0;i<=22;i++){const x=(i/22-.5)*w;k.box(g,.002,.038,.002,p.pale,x,.066,z+.043);}k.box(g,w,.002,.003,p.pale,0,.084,z+.043);k.box(g,w,.002,.002,p.warm,0,.043,z+.052);}
export function prism(k,g,points,mat){
 const idx=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];const source=new THREE.BufferGeometry();source.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));source.setIndex(idx);const geo=source.toNonIndexed();source.dispose();geo.computeVertexNormals();return k.mesh(g,geo,mat);
}
