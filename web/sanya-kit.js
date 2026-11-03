import * as THREE from 'three';
import {skin,siteHeight,disc} from './chengdu-kit.js';
import {noise} from './guilin-kit.js';
export {skin,siteHeight,disc,steps,sign} from './chengdu-kit.js';
export {finish,polygonRoof} from './suzhou-kit.js';
export {railing} from './xiamen-kit.js';
export {roof} from './dali-kit.js';
export const TAU=Math.PI*2;
export function lit(k,color,intensity=.35,phase=null,light=color){const m=k.mat(color,.69,.08);m.userData.night={color:new THREE.Color(light),intensity};if(phase!==null)m.userData.pulse={phase,speed:.55};return m;}
export function palette(k){const p={pale:k.mat('#e4e0cf',.9),white:k.mat('#e9e6dc',.86),stone:k.mat('#9c9b88',.99),sand:k.mat('#ccbea0',.99),wood:k.mat('#6d4934',.95),red:k.mat('#87422e',.87),tile:k.mat('#514a40',.95),leaf:k.mat('#3e7053',.98),gold:lit(k,'#c29a4c',.28,null,'#e2b259'),water:k.mat('#479795',.82,.015),glass:k.mat('#4f7a81',.35,.24),warm:lit(k,'#e3bd7e',.65),paving:k.mat('#c6c5b2',.98)};p.paving.userData.landscape=true;p.sand.userData.landscape=true;return p;}
export function site(k,g,p,{sea=false}={}){const land=k.mat(sea?'#b9b698':'#90a485',.98);land.userData.landscape=true;disc(k,g,.79,.65,(x,z)=>siteHeight(x,z,.79,.65),land);if(sea){p.water.userData.landscape=true;p.water.userData.water=true;disc(k,g,.755,.605,(x,z)=>siteHeight(x,z,.79,.65)+.006,p.water);}return (x,z)=>siteHeight(x,z,.79,.65);}
export function ellipse(k,g,mat,x,y,z,rx,ry,rz){const m=k.mesh(g,new THREE.SphereGeometry(1,32,20),mat,x,y,z);m.scale.set(rx,ry,rz);return m;}
export function smoothRock(k,g,p,{x=0,y=.02,z=0,rx=.2,ry=.2,rz=.18,seed=1}={}){
 const geo=new THREE.SphereGeometry(1,64,40),a=geo.attributes.position,colors=[];for(let i=0;i<a.count;i++){const X=a.getX(i),Y=a.getY(i),Z=a.getZ(i),v=.92+.13*noise(X*3+seed,Y*4,Z*3),pow=t=>Math.sign(t)*Math.abs(t)**.65;const xx=x+pow(X)*rx*v,yy=Math.max(y,y+ry+pow(Y)*ry*v),zz=z+pow(Z)*rz*v;a.setXYZ(i,xx,yy,zz);const c=new THREE.Color('#7d7e77').lerp(new THREE.Color('#b5b3a5'),noise(xx*24,yy*9,zz*22)*.55);colors.push(c.r,c.g,c.b);}geo.computeVertexNormals();geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const m=texturedStone(k,'#ffffff');m.vertexColors=true;m.userData.landscape=true;return k.mesh(g,geo,m);
}
export function palm(k,g,p,x,y,z,h=.22,lean=.025){
 const end=[x+lean,y+h,z];k.line(g,[[x,y,z],[x+lean*.25,y+h*.48,z],end],.007,p.wood);
 for(let j=1;j<10;j++){const t=j/10;k.cyl(g,.0078,.0078,.002,p.stone,x+lean*t*t,y+h*t,z,10);}
 const leafMat=p.leaf;leafMat.userData.landscape=true;
 for(let i=0;i<9;i++){const a=i/9*TAU,L=h*(.60+.06*(i%3)),point=t=>[end[0]+Math.cos(a)*L*t,end[1]+h*.25*Math.sin(Math.PI*t)-h*.23*t*t,z+Math.sin(a)*L*t];k.line(g,Array.from({length:13},(_,j)=>point(j/12)),.0015,leafMat);
  for(let j=1;j<13;j++){const t=j/13,q=point(t),length=L*.18*Math.sin(t*Math.PI);for(const side of [-1,1]){const v=[q[0],q[1],q[2],q[0]+Math.cos(a+side*.9)*length,q[1]-.009,q[2]+Math.sin(a+side*.9)*length,q[0]+Math.cos(a)*.015,q[1]-.002,q[2]+Math.sin(a)*.015];const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(v,3));ge.computeVertexNormals();leafMat.side=THREE.DoubleSide;k.mesh(g,ge,leafMat);}}
 }
}
export function palms(k,g,p,height,points){for(const [x,z,h=.22]of points)palm(k,g,p,x,height(x,z)+.012,z,h);}
export function texturedStone(k,color='#d1cbb8'){
 const m=k.mat(color,.98,.01);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vSanyaStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSanyaStone=position;');s.fragmentShader='varying vec3 vSanyaStone;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=fract(sin(dot(floor(vSanyaStone*900.),vec3(12.9898,78.233,35.42)))*43758.5453);diffuseColor.rgb*=.94+.12*grain;');};m.customProgramCacheKey=()=> 'sanya-fine-stone';return m;
}
export function band(k,g,fn,mat,r=.0022){k.line(g,Array.from({length:80},(_,i)=>fn(i/80*TAU)),r,mat,true);}
export function label(k,g,text,w,h,x,y,z){
 if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d');ctx.clearRect(0,0,256,512);ctx.font='bold 180px "KaiTi",serif';ctx.fillStyle='#b34635';ctx.textAlign='center';ctx.textBaseline='middle';[...text].forEach((v,i)=>ctx.fillText(v,128,120+i*230,235));const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff');m.map=tex;m.transparent=true;m.depthWrite=false;k.mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);
}
