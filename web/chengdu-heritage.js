import * as THREE from 'three';
import {TAU,palette,site,pond,paving,steps,grove,bamboo,roof,plaque,skin,lattice,balcony,glow,finish} from './chengdu-kit.js';

export {wuhou} from "./chengdu-wuhou.js";
export function dufu(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.68,.57);pond(k,g,p,.36,.15,0,.30);k.box(g,.82,.018,.41,p.stone,0,.029,-.10);
 const earth=k.mat('#b6a77e',.99),thatch=k.mat('#6e6b48',.99),straw=k.mat('#9b9165',.98);
 k.box(g,.68,.16,.235,earth,0,.118,-.12);
 for(const side of [-1,1])for(let i=0;i<8;i++){const x=-.33+i*.66/7;k.box(g,.006,.16,.008,p.wood,x,.12,-.12+side*.122);if(i<7)lattice(k,g,x+.043,.12,-.12+side*.123,.062,.11,p.wood);}
 k.box(g,.096,.151,.008,p.wood,.04,.115,.004);
 for(let i=0;i<8;i++){const x=-.38+i*.76/7;k.cyl(g,.004,.005,.18,p.wood,x,.13,.055,8);k.box(g,.022,.005,.025,p.wood,x,.217,.055);}
 // A thick, low thatch hip roof, with rough irregular straw strands and a small gable.
 function roofPoint(u,v){const a=u*TAU,r=.035+.965*v,c=Math.cos(a),s=Math.sin(a),norm=Math.max(Math.abs(c),Math.abs(s)),edgeX=c/norm*.455,x=edgeX*r+THREE.MathUtils.clamp(edgeX,-.22,.22)*(1-r),z=s/norm*.225*r;return [x,.225+.105*(1-r)**1.25,-.12+z];}
 skin(k,g,roofPoint,20,128,thatch);
 for(let i=0;i<160;i++){const u=i/160;const pts=[];for(let j=0;j<8;j++){const q=roofPoint(u,.15+.85*j/7);q[1]+=.003+.002*Math.sin(i*4+j);pts.push(q);}k.line(g,pts,.0012,i%3?thatch:straw);}
 for(const side of [-1,1])k.box(g,.78,.011,.016,thatch,0,.226,-.12+side*.224);
 k.beam(g,[-.23,.333,-.12],[.23,.333,-.12],.011,thatch,8);roof(k,g,.16,.15,.042,.310,thatch,thatch,.01,-.12);plaque(k,g,'茅屋故居',.14,.025,.04,.18,.011);
 thatch.onBeforeCompile=s=>{s.vertexShader='varying vec3 vStraw;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStraw=position;');s.fragmentShader='varying vec3 vStraw;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=fract(sin(dot(floor(vStraw.xz*1800.0),vec2(17.3,63.1)))*43758.5453);diffuseColor.rgb*=.78+.30*grain;');};thatch.customProgramCacheKey=()=> 'chengdu-thatch-v1';
 for(let j=0;j<4;j++){const x=-.32+j*.20;k.box(g,.11,.003,.047,p.pale,x,.025,.12);}
 for(const [x,z,h]of [[-.46,-.19,.31],[-.40,-.37,.30],[.40,-.34,.31],[.48,-.10,.30],[.44,.15,.28],[-.46,.12,.28]])bamboo(k,g,x,z,h);
 grove(k,g,height,[[-.18,-.43,.22],[.18,-.44,.24],[-.51,-.25,.21],[.52,-.23,.19]]);
 for(let i=0;i<13;i++){const a=i/12*Math.PI;const stone=k.mesh(g,new THREE.IcosahedronGeometry(.018,1),p.stone,Math.cos(a)*.38,.030,.30+Math.sin(a)*.16);stone.scale.y=.55;}
 return finish(k,g,{lamps:[[-.30,.10],[.30,.10]],visitors:[[-.20,.10],[.23,.08]]});
}

export {anshun} from './chengdu-anshun.js';
