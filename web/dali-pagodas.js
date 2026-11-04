import * as THREE from 'three';
import {palette,site,disc,paving,steps,grove,sign,railing,finish,TAU} from './dali-kit.js';

function masonry(k){
 const m=k.mat('#c9bba1',.98,.01);m.userData.night={color:new THREE.Color('#dfd2b8'),intensity:.022};
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 pagodaStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npagodaStone=position;');s.fragmentShader='varying vec3 pagodaStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float row=floor(pagodaStone.y*250.);vec2 grid=vec2((pagodaStone.x+pagodaStone.z)*145.+mod(row,2.)*.5,pagodaStone.y*250.);vec2 f=fract(grid);
  float seam=step(.025,f.x)*step(.05,f.y);float grain=fract(sin(dot(floor(grid),vec2(12.9898,78.233)))*43758.5453);
  float weathering=.5+.5*sin(pagodaStone.x*31.+sin(pagodaStone.y*37.)+pagodaStone.z*43.);
  diffuseColor.rgb*=mix(.80,.94+grain*.10,seam)*(.94+.06*weathering);`);};m.customProgramCacheKey=()=> 'dali-weathered-brick-v1';return m;
}
function block(k,g,n,rt,rb,h,mat,y){const m=k.cyl(g,rt/Math.cos(Math.PI/n),rb/Math.cos(Math.PI/n),h,mat,0,y,0,n);m.rotation.y=Math.PI/n;return m;}
function faceGroup(g,a,r,y){const f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*r,y,Math.cos(a)*r);g.add(f);return f;}
function inclineFace(f,r,rt,h){f.updateMatrix();f.matrix.multiply(new THREE.Matrix4().set(1,0,0,0,0,1,0,0,0,(rt-r)/h,1,0,0,0,0,1));f.matrixAutoUpdate=false;}
function nicheWall(k,f,p,w,top,h,rise,opening,figure=false){
 const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(top/2,h);shape.lineTo(-top/2,h);shape.closePath();const radius=opening/2,bottom=.006,center=bottom+rise-radius;
 const hole=new THREE.Path();hole.moveTo(-radius,bottom);hole.lineTo(-radius,center);hole.absarc(0,center,radius,Math.PI,0,true);hole.lineTo(radius,bottom);hole.closePath();shape.holes.push(hole);
 k.mesh(f,new THREE.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:false,curveSegments:12}),p.wall,0,0,-.007);
 const contour=[[-radius,bottom,.001],[-radius,center,.001]];for(let i=0;i<=16;i++){const a=Math.PI-i/16*Math.PI;contour.push([Math.cos(a)*radius,center+Math.sin(a)*radius,.001]);}contour.push([radius,bottom,.001]);k.line(f,contour,.0011,p.trim);
 if(figure){k.box(f,opening*.99,rise,.002,p.recess,0,bottom+rise/2,-.008);const statue=new THREE.Group();f.add(statue);statue.position.set(0,bottom+.002,-.004);const hh=rise*.78;
  const body=k.mesh(statue,new THREE.LatheGeometry([new THREE.Vector2(hh*.20,0),new THREE.Vector2(hh*.19,hh*.18),new THREE.Vector2(hh*.12,hh*.56),new THREE.Vector2(hh*.09,hh*.64)],10),p.carving);body.scale.z=.60;
  k.ball(statue,hh*.095,p.carving,0,hh*.79,.001);k.ball(statue,hh*.045,p.carving,0,hh*.90,.001);
  const lap=k.ball(statue,hh*.21,p.carving,0,hh*.13,.002);lap.scale.set(1,.4,.5);
  for(const x of [-1,1])k.beam(statue,[x*hh*.11,hh*.54,0],[x*hh*.035,hh*.31,hh*.08],hh*.035,p.carving,6);
 }
}
function cornice(k,g,p,n,r,y){
 for(const [mult,h,dy]of [[1.05,.004,0],[1.12,.004,.004],[1.20,.004,.008],[1.22,.003,.011],[1.15,.003,.014]])block(k,g,n,r*mult,r*(mult+.015),h,p.trim,y+dy+h/2);
}
function crown(k,g,p,n,r,y,small){
 block(k,g,n,r*.83,r*1.18,.024,p.trim,y+.012);block(k,g,n,r*.64,r*.83,.014,p.wall,y+.031);
 const dark=p.metal;k.cyl(g,.002,.003,.069,dark,0,y+.071,0,12);
 for(let j=0;j<5;j++)k.cyl(g,.012-j*.0019,.012-j*.0019,.003,dark,0,y+.045+j*.008,0,12);
 k.ball(g,.006,p.gold,0,y+.091,0);k.cyl(g,0,.004,.013,p.gold,0,y+.103,0,10);
 // Miniature roof-mounted metal birds and anchoring wires, not neon outlines.
 if(!small)for(const s of [-1,1]){const bird=k.ball(g,.0035,dark,s*r*.70,y+.041,0);bird.scale.set(1.7,.70,.6);k.line(g,[[s*r*.70-.009,y+.044,0],[s*r*.70,y+.039,0],[s*r*.70+.009,y+.044,0]],.001,dark);}
 for(let i=0;i<n;i++){const a=(i+.5)/n*TAU;k.beam(g,[0,y+.082,0],[Math.sin(a)*r*1.30,y+.009,Math.cos(a)*r*1.30],.0006,dark,5);}
}
function mainPagoda(k,parent,p){
 const g=new THREE.Group();parent.add(g);g.position.set(0,.034,.03);
 for(const [r,y,h]of [[.112,.007,.014],[.105,.018,.009],[.098,.028,.010]])block(k,g,4,r,r,h,p.base,y);
 const base=.084,baseH=.179;block(k,g,4,base,base*1.015,baseH,p.wall,.033+baseH/2);
 sign(k,g,'永镇山川',.105,.035,0,.119,base+.003,{background:'#c6b99c',color:'#5d5746'});
 cornice(k,g,p,4,base,.212);let y=.229;
 // The tall lowest storey plus fifteen upper storeys form sixteen dense eaves.
 for(let j=1;j<16;j++){
  const f=(j-1)/15,next=j/15,r=base*(1-.68*f**1.5),rt=base*(1-.68*next**1.5),h=.050-.023*f;
  for(let side=0;side<4;side++){
   const face=faceGroup(g,side*TAU/4,r,y),figure=(side+j)%2!==0;
   nicheWall(k,face,p,2*r,2*rt,h,h*.74,.014*(1-.35*f),figure);
   if(j<7&&figure)for(const x of [-1,1]){const xx=x*r*.53;k.box(face,.011,h*.46,.002,p.recess,xx,h*.31,.0005);k.box(face,.009,.002,.003,p.trim,xx,h*.55,.001);k.mesh(face,new THREE.ConeGeometry(.008,.008,4),p.trim,xx,h*.63,.002).rotation.y=Math.PI/4;}
   inclineFace(face,r,rt,h);
  }
  cornice(k,g,p,4,rt,y+h);y+=h+.017;
 }
 crown(k,g,p,4,base*.32,y,false);
}
function lotusBand(k,g,p,r,y){
 block(k,g,8,r*1.12,r*1.14,.007,p.trim,y);
 for(let i=0;i<24;i++){const a=(i+.5)/24*TAU,petal=k.mesh(g,new THREE.SphereGeometry(.0048,8,6),p.carving,Math.sin(a)*r*1.12,y-.002,Math.cos(a)*r*1.12);petal.scale.set(.70,1.1,.38);petal.rotation.y=a;petal.rotation.z=.25;}
}
function bracket(k,f,p,x,y){for(let j=0;j<3;j++){k.box(f,.005+j*.004,.0025,.007+j*.004,p.trim,x,y+j*.003,.004+j*.002);k.box(f,.003,.004,.006,p.wall,x,y-.002+j*.003,.003+j*.002);}}
function sidePagoda(k,parent,p,x,z){
 const g=new THREE.Group();parent.add(g);g.position.set(x,.034,z);g.scale.setScalar(.88);const base=.067;
 for(const [r,y,h]of [[.096,.007,.014],[.088,.019,.010],[.079,.031,.014]])block(k,g,8,r,r,h,p.base,y);
 let y=.038;
 for(let level=0;level<10;level++){
  const f=level/9,r=base*(1-.60*f**1.45),rt=base*(1-.60*Math.min(1,(level+.55)/9)**1.45),h=level===0?.096:.045-.014*f,w=2*r*Math.tan(Math.PI/8),tw=2*rt*Math.tan(Math.PI/8);
  for(let side=0;side<8;side++){
   const face=faceGroup(g,side*TAU/8,r,y),figure=(level+side)%3!==0;
   nicheWall(k,face,p,w,tw,h,h*(level===0?.65:.77),Math.min(w*.44,h*.40),figure);
   for(const s of [-1,1])k.beam(face,[s*w*.48,.001,0],[s*tw*.48,h,.001],.0015,p.trim,7);
   if(level===3||level===5)for(const xx of [-w*.34,0,w*.34])bracket(k,face,p,xx,h-.002);
   else if(level>0){const peak=h*.91;k.beam(face,[-w*.23,peak-.004,.002],[0,peak+.002,.003],.0012,p.trim,5);k.beam(face,[0,peak+.002,.003],[w*.23,peak-.004,.002],.0012,p.trim,5);}
   inclineFace(face,r,rt,h);
  }
  if(level!==3&&level!==5)lotusBand(k,g,p,rt,y+h+.005);
  cornice(k,g,p,8,rt,y+h+.008);y+=h+.025;
 }
 crown(k,g,p,8,base*.40,y,true);return g;
}
export function pagodas(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.77,.65);paving(k,g,p,.61,.51);
 const stone={wall:masonry(k),trim:k.mat('#cfc1a5',.96,.01),base:k.mat('#a9a99b',.98),recess:k.mat('#8d826d',.99),carving:k.mat('#d7ccb4',.98),metal:k.mat('#6e6047',.75,.25),gold:k.mat('#a5966c',.7,.18)};
 mainPagoda(k,g,stone);sidePagoda(k,g,stone,-.31,-.21);sidePagoda(k,g,stone,.31,-.21);
 disc(k,g,.33,.15,.028,p.water,0,.35);
 for(let i=0;i<32;i++){const a=i/32*TAU,x=Math.sin(a)*.34,z=.35+Math.cos(a)*.16;const stone=k.mesh(g,new THREE.DodecahedronGeometry(.012,0),p.stone,x,.028,z);stone.scale.set(1.2,.40,.72);stone.rotation.y=a;}
 for(const s of [-1,1]){railing(k,g,p,[[s*.36,.025,.23],[s*.36,.025,.46]],.023);grove(k,g,height,[[s*.55,-.23,.20],[s*.51,.20,.16],[s*.34,-.43,.14]]);}
 finish(k,g,{lamps:[[-.18,.024,.17],[.18,.024,.17]],visitors:[[-.42,.025,.18],[.42,.025,.27]]});
 for(const [x,z,h,intensity]of [[0,.03,.48,.044],[-.31,-.21,.30,.022],[.31,-.21,.30,.022]]){const l=new THREE.SpotLight('#e5d3ad',0,1.3,.55,.90,2);l.position.set(x,h,z+.34);l.target.position.set(x,h,z);l.userData.nightIntensity=intensity;g.add(l,l.target);}
 return g;
}
