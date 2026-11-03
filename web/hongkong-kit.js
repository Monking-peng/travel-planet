import * as THREE from 'three';
import {skin,siteHeight,disc} from './chengdu-kit.js';
import {tree} from './wuhan-architecture.js';
export {skin,siteHeight,disc,sign,steps} from './chengdu-kit.js';
export {finish} from './suzhou-kit.js';
export {roof} from './dali-kit.js';
export {railing} from './xiamen-kit.js';
export const TAU=Math.PI*2;
export function lit(k,color,strength=.3,phase=null,emission=color){const m=k.mat(color,.65,.12);m.userData.night={color:new THREE.Color(emission),intensity:strength};if(phase!==null)m.userData.pulse={phase,speed:.45};return m;}
export function palette(k){const p={stone:k.mat('#999e99',.96),pale:k.mat('#d6d6ca',.9),dark:k.mat('#263a3e',.82),steel:k.mat('#abb9b8',.5,.28),glass:k.mat('#557a84',.37,.25),wood:k.mat('#654535',.91),tile:k.mat('#4c5553',.88),brick:k.mat('#a0664c',.91),gold:k.mat('#b69b68',.64,.19),water:k.mat('#528e94',.5,.08),warm:lit(k,'#ebc697',.5),cool:lit(k,'#bdced0',.38)};return p;}
export function site(k,g,p,rx=.72,rz=.62){const mat=k.mat('#94a28a',.99);mat.userData.landscape=true;disc(k,g,rx,rz,(x,z)=>siteHeight(x,z,rx,rz),mat);const paving=k.mat('#999e99',.96);paving.userData.landscape=true;disc(k,g,rx*.84,rz*.8,(x,z)=>siteHeight(x,z,rx,rz)+.003,paving);return (x,z)=>siteHeight(x,z,rx,rz);}
export function ellipsoid(k,g,m,x,y,z,a,b,c){const o=k.mesh(g,new THREE.SphereGeometry(1,32,20),m,x,y,z);o.scale.set(a,b,c);return o;}
export function polygon(k,g,points,mat){const p=[],idx=[];for(const q of points)p.push(...q);for(let i=1;i<points.length-1;i++)idx.push(0,i,i+1);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();mat.side=THREE.DoubleSide;return k.mesh(g,geo,mat);}
export function prism(k,g,points,tops,mat,y=.03){const n=points.length;polygon(k,g,points.map(([x,z],i)=>[x,tops[i],z]),mat);for(let i=0;i<n;i++){const j=(i+1)%n;polygon(k,g,[[...points[i].slice(0,1),y,points[i][1]],[points[j][0],y,points[j][1]],[points[j][0],tops[j],points[j][1]],[points[i][0],tops[i],points[i][1]]],mat);}}
export function frame(k,g,point,rows,cols,mat,r=.0012){for(let j=0;j<=rows;j++)k.line(g,Array.from({length:cols+1},(_,i)=>point(i/cols,j/rows)),r,mat);for(let i=0;i<cols;i++)k.line(g,Array.from({length:rows+1},(_,j)=>point(i/cols,j/rows)),r,mat);}
export function hill(k,g,p,{height=.28,x=0,z=0,rx=.69,rz=.59,flat=.22,cut=null}={}){const mat=k.mat('#668366',.99);mat.userData.landscape=true;const h=(a,b)=>{const q=Math.hypot((a-x)/rx,(b-z)/rz),edge=1-THREE.MathUtils.smoothstep(q,flat,1),top=siteHeight(a,b,.72,.62)+height*edge;return cut?Math.min(top,cut(a,b,top)):top;};disc(k,g,rx,rz,(a,b)=>h(a+x,b+z),mat,x,z);return h;}
export function woodland(k,g,height,points){for(const [x,z,s=.12]of points)tree(k,g,x,height(x,z),z,s);}
export function windowGlass(k,color='#63838c',seed=17,light='#d8e3e0'){const m=k.glass(color,light,seed);m.userData.night.intensity=.62;const compile=m.onBeforeCompile;m.onBeforeCompile=s=>{compile(s);s.vertexShader='varying vec3 vHKNormal;\n'+s.vertexShader.replace('vCity = position;','vCity = position;vHKNormal=normal;');s.fragmentShader='varying vec3 vHKNormal;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('(vCity.x+vCity.z)*100.0,vCity.y*106.0','(abs(vHKNormal.x)>abs(vHKNormal.z)?vCity.z:vCity.x)*78.0,vCity.y*74.0').replace('cityTime*1.5','cityTime*.75').replace('cityTime*1.65','cityTime*.65').replace('(.50+.50*occupied)','(.12+.48*occupied)');};m.customProgramCacheKey=()=>`hongkong-windows-${seed}`;return m;}
export function perimeter(k,g,rx,rz,y,m){k.line(g,Array.from({length:96},(_,i)=>{const a=i/96*TAU;return [Math.cos(a)*rx,y,Math.sin(a)*rz];}),.002,m,true);}
