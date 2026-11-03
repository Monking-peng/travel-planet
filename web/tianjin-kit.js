import * as THREE from 'three';
export {site,disc,paving,steps,grove,sign} from './chengdu-kit.js';
export {finish} from './suzhou-kit.js';
export {hip,skin} from './chongqing-kit.js';
export {sea,railing} from './xiamen-kit.js';
export {gable,archPane,cross} from './qingdao-kit.js';
export const TAU=Math.PI*2;
export function palette(k){return {wall:k.mat('#c9b58e',.92),pale:k.mat('#d8d2bd',.9),stone:k.mat('#98998f',.97),wood:k.mat('#4c3c31',.94),red:k.mat('#8c4436',.9),tile:k.mat('#945847',.9),leaf:k.mat('#567152',.98),blue:k.mat('#527981',.65),water:k.mat('#5d8a91',.49,.1),gold:k.mat('#b99b61',.65,.15),warm:lit(k,'#dec6a0',.45)};}
export function lit(k,color,intensity=.09,emission='#efca96'){const m=k.mat(color,.83);m.userData.night={color:new THREE.Color(emission),intensity};return m;}
export function archOpening(k,g,mat,{w=.12,h=.16,opening=.075,rise=.11,d=.06,x=0,y=0,z=0}={}){
 // Bottom-connected opening, not a dark panel painted onto a solid wall.
 const r=opening/2,s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-r,0);s.lineTo(-r,rise-r);s.absarc(0,rise-r,r,Math.PI,0,true);s.lineTo(r,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:16}),mat,x,y,z-d/2);
}
export function dome(k,g,p,r,h,y,x,z){
 const pts=[];for(let j=0;j<=28;j++){const a=j/28*Math.PI/2;pts.push(new THREE.Vector2(r*Math.cos(a),h*Math.sin(a)));}k.mesh(g,new THREE.LatheGeometry(pts,48),p,x,y,z);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.line(g,pts.map(v=>[x+Math.sin(a)*v.x,y+v.y,z+Math.cos(a)*v.x]),.0014,p);}
}
export function ceramic(k,color='#c4c1ab'){
 const m=k.mat(color,.65,.05);m.userData.ceramic=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vCeramic;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCeramic=position;');s.fragmentShader='varying vec3 vCeramic;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 cell=floor(vCeramic*180.);float h=fract(sin(dot(cell,vec3(12.9898,78.233,39.425)))*43758.5453);
 vec3 blue=vec3(.26,.38,.52);vec3 cream=vec3(.83,.81,.70);vec3 rust=vec3(.55,.30,.22);
 vec3 tile=mix(cream,blue,step(.63,h));tile=mix(tile,rust,step(.96,h));
 vec3 f=fract(vCeramic*180.);float seam=step(.08,min(min(f.x,f.y),f.z));diffuseColor.rgb*=mix(tile*.60,tile,seam)*1.25;`);};m.customProgramCacheKey=()=>`tianjin-ceramic-${color}`;return m;
}
export function vase(k,g,mat,x,y,z,h=.052,r=.014){const pts=[[0,0],[r*.6,0],[r*.85,h*.08],[r,h*.30],[r*.95,h*.60],[r*.48,h*.78],[r*.47,h*.94],[r*.65,h],[r*.30,h]];return k.mesh(g,new THREE.LatheGeometry(pts.map(a=>new THREE.Vector2(...a)),12),mat,x,y,z);}
