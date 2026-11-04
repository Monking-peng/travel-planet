import * as THREE from 'three';
import {TAU,palette,site,pond,roof,plaque,glow,finish} from './chengdu-kit.js';

function pointed(x,r,spring,rise,n=40){
 const left=new THREE.QuadraticBezierCurve(new THREE.Vector2(x-r,spring),new THREE.Vector2(x-r*.65,spring+rise*.68),new THREE.Vector2(x,spring+rise));
 const right=new THREE.QuadraticBezierCurve(new THREE.Vector2(x,spring+rise),new THREE.Vector2(x+r*.65,spring+rise*.68),new THREE.Vector2(x+r,spring));
 return [...left.getPoints(n/2),...right.getPoints(n/2).slice(1)];
}
function stoneMaterial(k){
 const m=k.mat('#a8aaa0',.96);m.userData.bridgeMasonry=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vBridgeStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBridgeStone=position;');s.fragmentShader='varying vec3 vBridgeStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vBridgeStone.xy/vec2(.058,.022);float row=floor(q.y);q.x+=mod(row,2.)*.5;vec2 cell=fract(q);float mortar=max(1.-smoothstep(.025,.065,cell.x),1.-smoothstep(.035,.085,cell.y));float grain=fract(sin(dot(floor(vBridgeStone.xy*900.),vec2(39.3,17.7)))*43758.5453);diffuseColor.rgb*=mix(.88+.14*grain,.60,mortar*.48);`);};m.customProgramCacheKey=()=> 'anshun-stone-courses-v1';return m;
}
function railing(k,g,p,x,z,w,y){
 const N=Math.max(3,Math.round(w/.055)),dx=w/N,shadow=k.mat('#7b8176',.95);
 k.box(g,w,.006,.010,p.stone,x,y+.006,z);k.box(g,w,.004,.009,p.pale,x,y+.043,z);
 for(let i=0;i<=N;i++){const xx=x-w/2+i*dx;k.box(g,.007,.054,.011,p.stone,xx,y+.028,z);k.box(g,.011,.005,.015,p.pale,xx,y+.056,z);k.ball(g,.0035,p.stone,xx,y+.061,z);}
 for(let i=0;i<N;i++){const xx=x-w/2+(i+.5)*dx;k.box(g,dx-.008,.026,.006,p.stone,xx,y+.025,z);for(const side of [-1,1]){k.box(g,dx-.018,.016,.0008,shadow,xx,y+.025,z+side*.0035);k.line(g,[[xx-dx*.23,y+.025,z+side*.004],[xx,y+.031,z+side*.004],[xx+dx*.23,y+.025,z+side*.004],[xx,y+.019,z+side*.004]],.001,p.pale,true);}}
}
function window(k,g,p,x,y,z,w,h,m){
 k.box(g,w,h,.003,m,x,y,z);
 for(const sx of [-1,1])k.box(g,.0023,h+.005,.005,p.wood,x+sx*w/2,y,z+.002);
 for(const yy of [-h/2,h*.12,h/2])k.box(g,w+.004,.0025,.005,p.wood,x,y+yy,z+.002);
 for(const xx of [-.27,0,.27])k.box(g,.0015,h,.004,p.gold,x+xx*w,y,z+.002);
}
function detailedRoof(k,g,p,x,y,w,d,h,edge){
 roof(k,g,w,d,h,y,p.tile,edge,x,0);const ridge=Math.max(.008,(w-d)*.42),rib=p.roofRib;
 k.box(g,w*.91,.008,d*.89,p.red,x,y-.006,0);
 // A tiled hip-gable roof with ceramic ridges and distinct upturned tips.

 for(const side of [-1,1]){
  k.line(g,[[x+side*ridge,y+h+.002,0],[x+side*(ridge+.018),y+h+.009,0],[x+side*(ridge+.025),y+h+.032,0]],.0028,rib);
  for(const sz of [-1,1]){k.line(g,[[x+side*w*.28,y+.025,sz*d*.28],[x+side*w*.46,y+.018,sz*d*.46],[x+side*w*.51,y+.033,sz*d*.51]],.0024,rib);for(let j=0;j<3;j++)k.ball(g,.0024,rib,x+side*w*(.30+j*.05),y+.026,sz*d*(.30+j*.05));}
 }
 k.box(g,ridge*2,.006,.010,p.tile,x,y+h+.005,0);
}
function storey(k,g,p,{x=0,w,d,y,h,bays,edge,upper=false}){
 const room=k.mat('#9f9b85',.93),glass=glow(k,'#3b443e',.20,1.1+y,.35);glass.userData.night.color.set('#ffe3af');
 k.box(g,w+.028,.010,d+.07,p.stone,x,y,0);k.box(g,w*.90,h-.009,d*.65,room,x,y+h/2,0);
 for(const side of [-1,1]){
  const f=new THREE.Group();f.position.set(x,y,side*d*.327);if(side<0)f.rotation.y=Math.PI;g.add(f);
  for(let i=0;i<bays;i++)window(k,f,p,(i-(bays-1)/2)*w/bays,h*.44,.001,w/bays*.73,h*.64,glass);
  const z=side*(d/2+.018);railing(k,g,p,x,z,w+.025,y+.008);
  for(let i=0;i<=bays;i++){const xx=x-w/2+i*w/bays;k.cyl(g,.0035,.0045,h-.003,p.red,xx,y+h/2,z,10);for(let j=0;j<3;j++){k.box(g,.012+j*.006,.003,.016+j*.006,p.red,xx,y+h-.013+j*.004,z);k.box(g,.005,.006,.008,p.gold,xx,y+h-.011+j*.004,z+.003);}}
  k.box(g,w+.02,.007,.018,p.red,x,y+h-.004,z);k.box(g,w-.01,.002,.003,edge,x,y+h-.008,z+.003*side);
 }
 for(const side of [-1,1]){const f=new THREE.Group();f.position.set(x+side*w*.451,y,0);f.rotation.y=side*Math.PI/2;g.add(f);window(k,f,p,0,h*.44,.001,d*.48,h*.64,glass);}

}
export function anshun(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.76,.58);pond(k,g,p,.69,.49);p.water.roughness=.75;
 p.stone=k.mat('#b2b2a4',.96);p.pale=k.mat('#c1c1af',.94);p.tile=k.mat('#4c5750',.90);p.roofRib=k.mat('#59675c',.90);p.red=k.mat('#763c31',.88);p.gold=k.mat('#9d8b5e',.76,.12);
 p.tile.onBeforeCompile=s=>{s.vertexShader='varying vec3 vAnshunTile;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvAnshunTile=position;');s.fragmentShader='varying vec3 vAnshunTile;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vAnshunTile.xz/vec2(.010,.012);vec2 f=fract(q);float joint=max(1.-smoothstep(.02,.075,f.x),1.-smoothstep(.02,.075,f.y));diffuseColor.rgb*=1.-.15*joint;`);};p.tile.customProgramCacheKey=()=> 'anshun-small-roof-tiles-v1';p.tile.userData.night={color:new THREE.Color('#ffd896'),intensity:.035};
 const stair=k.mat('#b2b2a4',.96);stair.userData.anshunSteps=true;
 const s=new THREE.Shape();s.moveTo(-.56,0);s.lineTo(.56,0);s.lineTo(.56,.25);s.lineTo(.34,.29);s.lineTo(-.34,.29);s.lineTo(-.56,.25);s.closePath();
 const arches=[{x:0,r:.195,spring:.028,rise:.207},{x:-.405,r:.137,spring:.023,rise:.139},{x:.405,r:.137,spring:.023,rise:.139}];
 const edge=glow(k,'#bda56a',.72,.5,.36),archLight=glow(k,'#a99f7d',.40);edge.userData.night.color.set('#ffcb72');archLight.userData.night.color.set('#ffd69a');
 for(const a of arches){const h=new THREE.Path(),pts=pointed(a.x,a.r,a.spring,a.rise);h.moveTo(a.x-a.r,.001);pts.forEach(p=>h.lineTo(p.x,p.y));h.lineTo(a.x+a.r,.001);h.closePath();s.holes.push(h);
  for(const z of [-.108,.108]){
   for(let i=0;i<pts.length-1;i++){const p1=pts[i],p2=pts[i+1],t=p2.clone().sub(p1).normalize(),n=new THREE.Vector2(-t.y,t.x),gap=.00065,inner1=p1.clone().addScaledVector(t,gap),inner2=p2.clone().addScaledVector(t,-gap);const band=new THREE.Shape([inner1,inner2,inner2.clone().addScaledVector(n,.012),inner1.clone().addScaledVector(n,.012)]);k.mesh(g,new THREE.ShapeGeometry(band),i%3?p.stone:p.pale,0,0,z);}
   k.line(g,pts.map(v=>[v.x,v.y,z]),.0018,edge);
  }
  // Warm soffit illumination occupies the arch surface rather than a floating line.
  const v=[],ind=[];for(const pt of pts)v.push(pt.x,pt.y-.0005,-.103,pt.x,pt.y-.0005,.103);for(let i=0;i<pts.length-1;i++)ind.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ind);geo.computeVertexNormals();archLight.side=THREE.DoubleSide;k.mesh(g,geo,archLight);
 }
 for(const x of [-.24,.24]){const h=new THREE.Path();h.absarc(x,.166,.039,0,TAU,true);s.holes.push(h);for(const z of [-.108,.108]){k.mesh(g,new THREE.TorusGeometry(.041,.0035,6,48),p.stone,x,.166,z);k.mesh(g,new THREE.TorusGeometry(.0392,.0012,6,48),edge,x,.166,z+.001*Math.sign(z));}}
 p.stone.side=THREE.DoubleSide;p.pale.side=THREE.DoubleSide;
 for(const x of [-.24,.24]){const o=k.mesh(g,new THREE.CylinderGeometry(.0388,.0388,.208,48,1,true),archLight,x,.166,0);o.rotation.x=Math.PI/2;}
 k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.21,bevelEnabled:false,curveSegments:40}),stoneMaterial(k),0,0,-.105);
 for(const x of [-.24,.24])for(const z of [-.13,.13]){
  k.cyl(g,.030,.035,.083,p.stone,x,.059,z,12);k.cyl(g,.034,.034,.007,p.pale,x,.104,z,12);const body=k.ball(g,.011,p.stone,x,.116,z);body.scale.set(1.6,.7,.72);k.ball(g,.0075,p.stone,x-.013,.129,z);k.cyl(g,.002,.003,.013,p.stone,x-.010,.121,z,6);
 }
 k.box(g,.69,.013,.30,p.stone,0,.292,0);
 storey(k,g,p,{w:.64,d:.23,y:.302,h:.112,bays:8,edge});detailedRoof(k,g,p,0,.422,.77,.35,.073,edge);
 storey(k,g,p,{w:.54,d:.19,y:.484,h:.077,bays:6,edge,upper:true});detailedRoof(k,g,p,0,.565,.66,.29,.071,edge);
 plaque(k,g,'安顺廊桥',.135,.029,0,.540,.066);
 for(const x of [-.455,.455]){
  storey(k,g,p,{x,w:.24,d:.22,y:.266,h:.089,bays:3,edge});detailedRoof(k,g,p,x,.363,.33,.32,.060,edge);
  storey(k,g,p,{x,w:.17,d:.16,y:.405,h:.061,bays:2,edge,upper:true});detailedRoof(k,g,p,x,.468,.25,.24,.058,edge);
 }
 for(const side of [-1,1]){
  for(let i=0;i<9;i++){const h=.021+(i+1)/9*.229,x=side*(.735-i*.021);k.box(g,.021,h,.28,stair,x,h/2,0);for(const sz of [-1,1]){k.box(g,.008,.040,.009,p.stone,x,h+.021,sz*.145);k.ball(g,.003,p.pale,x,h+.043,sz*.145);}}
  for(const sz of [-1,1])k.beam(g,[side*.735,.089,sz*.145],[side*.567,.293,sz*.145],.004,p.pale);
 }
 return finish(k,g,{lamps:[[-.68,-.20],[.68,-.20],[-.68,.20],[.68,.20]]});
}
