import * as THREE from 'three';
import {hip,skin} from './chongqing-kit.js';
import {lattice} from './shunde-kit.js';
import {lit} from './tianjin-kit.js';
export {site,siteHeight,disc,paving,steps,grove,sign} from './chengdu-kit.js';
export {finish} from './suzhou-kit.js';
export {archOpening} from './tianjin-kit.js';
export {sea,railing} from './xiamen-kit.js';
export {hip,lattice,lit};
export const TAU=Math.PI*2;
export function palette(k){return {stone:k.mat('#91998f',.98),pale:k.mat('#c7c7b3',.96),wall:k.mat('#deded0',.94),wood:k.mat('#4d3529',.92),red:k.mat('#91402e',.91),tile:k.mat('#485555',.94),blue:k.mat('#426a79',.82),gold:k.mat('#bba26b',.72,.1),leaf:k.mat('#4b7151',.98),water:k.mat('#4a8894',.46,.1),warm:lit(k,'#b8a07b',.32)};}
export function roof(k,g,p,w,d,h,y,x=0,z=0){
 const edge=lit(k,p.tile.color,.32),ridge=Math.max(0,(w-d)*.48);
 const point=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),norm=Math.max(Math.abs(c),Math.abs(s)),ex=c/norm*w/2,ez=s/norm*d/2,t=.001+.999*v,corner=(Math.min(Math.abs(c),Math.abs(s))/.70710678)**8;return [x+ex*t+THREE.MathUtils.clamp(ex,-ridge,ridge)*(1-t),y+h*(1-t)**1.55+Math.min(.042,w*.075)*t**5*corner,z+ez*t];};
 skin(k,g,point,18,128,p.tile);k.line(g,Array.from({length:128},(_,i)=>point(i/128,1)),.0022,edge,true);
 for(let i=0;i<96;i++)k.line(g,Array.from({length:10},(_,j)=>{const a=point(i/96,.04+.96*j/9);a[1]+=.001;return a;}),.0008,p.tile);
 k.beam(g,[x-ridge,y+h+.002,z],[x+ridge+.0001,y+h+.002,z],.003,p.pale);
 for(const s of [-1,1])k.line(g,[[x+s*ridge,y+h,z],[x+s*(ridge+.010),y+h+.013,z]],.0025,p.pale);
}
export function lantern(k,g,p,x,y,z,size=.012){const red=lit(k,'#a83c2b',.40,'#d86f35');red.userData.pulse={speed:.45,phase:x*17+z*13};const m=k.ball(g,size,red,x,y,z);m.scale.set(1,.85,1);k.cyl(g,size*.55,size*.55,.004,p.gold,x,y+size*.8,z,10);k.beam(g,[x,y-size,z],[x,y-size-.012,z],.001,p.red,5);}
export function story(k,g,p,{w=.7,d=.4,y=.10,h=.15,x=0,z=0,open=false,lanterns=false}={}){
 const bays=Math.max(3,Math.round(w/.095));
 if(!open)k.box(g,w*.90,h*.88,d*.72,p.wood,x,y+h*.44,z);
 for(const side of [-1,1]){
  for(let i=0;i<=bays;i++){const xx=x+(i/bays-.5)*w;k.cyl(g,.0045,.0055,h,p.red,xx,y+h/2,z+side*d*.46,8);for(let b=0;b<3;b++){k.box(g,.012+b*.010,.004,.032+b*.012,b%2?p.gold:p.blue,xx,y+h-.019+b*.005,z+side*d*.46);}}
  k.box(g,w,.014,.012,p.blue,x,y+h-.015,z+side*d*.46);k.box(g,w,.003,.014,p.gold,x,y+h-.022,z+side*d*.46);
  if(!open)for(let i=0;i<bays;i++){const xx=x+((i+.5)/bays-.5)*w,zz=z+side*d*.365;const pane=lit(k,'#403c32',.17);k.box(g,w*.70/bays,h*.60,.003,pane,xx,y+h*.46,zz);lattice(k,g,xx,y+h*.46,zz+side*.002,w*.70/bays,h*.60,p.wood);}
  if(lanterns)for(let i=0;i<bays;i++)lantern(k,g,p,x+((i+.5)/bays-.5)*w,y+h-.035,z+side*d*.49);
 }
 roof(k,g,p,w*1.20,d*1.26,h*.38,y+h,x,z);
}
export function wallPattern(k,g,p,w,h,d,x,y,z){
 for(let j=0;j<Math.floor(h/.027);j++){const yy=y-h/2+j*.027;k.box(g,w,.0008,.001,p.pale,x,yy,z+d/2+.0006);for(let i=0;i<Math.floor(w/.06);i++){const xx=x-w/2+((i+.5+(j%2)*.5)*.06);if(xx<x+w/2)k.box(g,.0007,.025,.001,p.pale,xx,yy+.012,z+d/2+.0006);}}
}
