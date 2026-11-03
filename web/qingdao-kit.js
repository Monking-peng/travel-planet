import * as THREE from 'three';
import {skin,glow} from './shenzhen-forms.js';
export {site,disc,paving,steps,grove,sign} from './chengdu-kit.js';
export {finish,polygonRoof,hall} from './suzhou-kit.js';
export {hip} from './chongqing-kit.js';
export {sea,granite,railing} from './xiamen-kit.js';
export {skin};
export const TAU=Math.PI*2;
export function palette(k){return {wall:k.mat('#ccb990',.94),pale:k.mat('#d6cdb8',.92),stone:k.mat('#98998d',.98),wood:k.mat('#483b32',.94),red:k.mat('#954737',.87),tile:k.mat('#a54e39',.91),leaf:k.mat('#527454',.97),blue:k.mat('#417976',.67),water:k.mat('#4c8b9b',.56,.08),gold:k.mat('#b89b62',.64,.14),warm:glow(k,'#f0cb92',.70,.40,.3)};}
export function lit(k,color,strength=.22){const m=k.mat(color,.85);m.userData.night={color:new THREE.Color('#f0d4a8'),intensity:strength};return m;}
export function archPane(k,g,p,x,y,z,w,h,{door=false}={}){
 const make=(w,h)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;};
 k.mesh(g,new THREE.ShapeGeometry(make(w+.010,h+.009),20),p.pale,x,y-.003,z);
 k.mesh(g,new THREE.ShapeGeometry(make(w,h),20),lit(k,door?'#493d31':'#485e61',door?.025:.075),x,y,z+.002);
 k.box(g,.002,h-w*.4,.003,p.pale,x,y+(h-w*.4)/2,z+.004);if(!door)for(let j=1;j<3;j++)k.box(g,w,.002,.003,p.pale,x,y+(h-w*.5)*j/3,z+.005);
}
export function gable(k,g,p,w,d,h,y,x=0,z=0,tile=p.tile){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),tile,x,y,z-d/2);
 for(let i=0;i<=Math.ceil(d/.018);i++){const zz=z-d/2+i*d/Math.ceil(d/.018);k.line(g,[[x-w/2,y+.001,zz],[x,y+h+.001,zz],[x+w/2,y+.001,zz]],.0007,p.red);}k.box(g,.004,.005,d+.012,p.red,x,y+h,z);
}
export function pyramid(k,g,p,w,h,y,x,z){const o=k.cyl(g,0,w/Math.SQRT2,h,p.tile,x,y+h/2,z,4);o.rotation.y=Math.PI/4;for(const sx of [-1,1])for(const sz of [-1,1])k.beam(g,[x+sx*w/2,y,z+sz*w/2],[x,y+h,z],.0018,p.red);}
export function cross(k,g,p,x,y,z,size=.04){k.box(g,.003,size,.003,p.wood,x,y,z);k.box(g,size*.57,.003,.003,p.wood,x,y+size*.13,z);}
export function masonry(k,g,p,w,h,d,x,y,z){
 const dark=k.mat('#8d897c',.98);for(let row=1;row<h/.022;row++){const yy=y+row*.022;k.box(g,w,.0007,.001,dark,x,yy,z+d/2+.001);for(const side of [-1,1])k.box(g,.001,.0007,d,dark,x+side*(w/2+.001),yy,z);for(let col=0;col<w/.052;col++){const xx=x-w/2+(col+.35+(row%2)*.5)*.052;if(xx<x+w/2)k.box(g,.0006,.022,.001,dark,xx,yy-.011,z+d/2+.001);}}
}
export function clockFace(k,g,p,x,y,z,r){const dark=lit(k,'#3b4648',.015);k.mesh(g,new THREE.CircleGeometry(r,48),dark,x,y,z);k.mesh(g,new THREE.TorusGeometry(r,.0024,5,48),p.pale,x,y,z+.001);for(let i=0;i<12;i++){const a=i/12*TAU;k.beam(g,[x+Math.sin(a)*r*.78,y+Math.cos(a)*r*.78,z+.004],[x+Math.sin(a)*r*.94,y+Math.cos(a)*r*.94,z+.004],.0009,p.pale);}k.beam(g,[x,y,z+.006],[x-r*.40,y+r*.40,z+.006],.0013,p.pale);k.beam(g,[x,y,z+.006],[x+r*.53,y+r*.25,z+.006],.001,p.pale);}
