import * as THREE from 'three';
import {palette,site,paving,grove,finish,hip,skin,sign,lit,TAU} from './tianjin-kit.js';
import {lattice} from './shunde-kit.js';

function rectangle(w,h,x=0,y=0,Type=THREE.Shape){const s=new Type();s.moveTo(x-w/2,y);s.lineTo(x+w/2,y);s.lineTo(x+w/2,y+h);s.lineTo(x-w/2,y+h);s.closePath();return s;}
function wall(k,g,p,w,h,holes=[]){const s=rectangle(w,h);for(const o of holes)s.holes.push(rectangle(o.w,o.h,o.x,o.y,THREE.Path));return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.013,bevelEnabled:false}),p.red,0,0,-.013);}
function bracket(k,g,p,x,y,z,angle=0,scale=1){
 const b=new THREE.Group();b.position.set(x,y,z);b.rotation.y=angle;b.scale.setScalar(scale);g.add(b);
 k.box(b,.021,.012,.025,p.timber,0,.006,0);
 for(let j=0;j<4;j++){
  const w=.041+j*.016,yy=.016+j*.012,zz=.004+j*.008;
  // Bowed gong arms narrow at the heel and end in raised bearing blocks.
  const s=new THREE.Shape();s.moveTo(-w/2,.007);s.lineTo(-w/2+.003,.007);s.quadraticCurveTo(-w*.24,-.006,0,-.004);s.quadraticCurveTo(w*.24,-.006,w/2-.003,.007);s.lineTo(w/2,.007);s.lineTo(w/2,.013);s.lineTo(-w/2,.013);s.closePath();
  k.mesh(b,new THREE.ExtrudeGeometry(s,{depth:.007,bevelEnabled:false,curveSegments:5}),j%2?p.timber:p.aged,0,yy,zz-.0035);
  for(const side of [-1,1])k.box(b,.008,.008,.014,p.aged,side*(w/2-.006),yy+.014,zz);
  k.box(b,.008,.006,.035+j*.011,p.timber,0,yy+.009,zz+.007);
  k.box(b,.013,.006,.013,p.aged,0,yy+.015,zz+.022+j*.004);
 }
 k.box(b,.093,.006,.012,p.timber,0,.071,.034);
}
function bracketRing(k,g,p,w,d,y,z=-.06,scale=1){
 for(const side of [-1,1]){for(let i=0;i<7;i++)bracket(k,g,p,(i-3)*w/6,y,z+side*d/2,side===1?0:Math.PI,scale);for(let i=1;i<4;i++)bracket(k,g,p,side*w/2,y,z+(i-2)*d/4,side*Math.PI/2,scale);}
}
function apron(k,g,p,{w,d,iw,id,y,h,z=-.06}){
 const edge=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),n=Math.max(Math.abs(c),Math.abs(s)),xx=c/n,zz=s/n;return [xx*(iw+(w-iw)*v)/2,y+h*(1-v)**1.5+.011*v**6*(Math.min(Math.abs(c),Math.abs(s))/.7071)**8,z+zz*(id+(d-id)*v)/2];};
 skin(k,g,edge,9,96,p.tile);k.line(g,Array.from({length:97},(_,i)=>edge(i/96,1)),.0027,p.ridge);
 for(let i=0;i<128;i++){
  const u=i/128,pts=Array.from({length:9},(_,j)=>{const q=edge(u,j/8);q[1]+=.0012;return q;});k.line(g,pts,.00165,p.tileTop);
  const end=edge(u,1);k.ball(g,.0025,p.ridge,...end).scale.y=.75;
  const a=edge(u,.80),b=edge(u,.98);a[1]-=.005;b[1]-=.005;k.beam(g,a,b,.0019,p.timber,6);
 }
}
function roof(k,g,p){
 const y=.595,w=.87,d=.59,iw=.565,id=.235,z=-.06,waist=.039,h=.112;
 apron(k,g,p,{w,d,iw,id,y,h:waist,z});
 for(const side of [-1,1]){
  const point=(u,v)=>[(u-.5)*iw,y+waist+(h-waist)*(1-v)**1.35,z+side*id/2*v];skin(k,g,point,10,60,p.tile);
  for(let i=0;i<=60;i++)k.line(g,Array.from({length:11},(_,j)=>{const q=point(i/60,j/10);q[1]+=.0012;return q;}),.00155,p.tileTop);
 }
 for(const side of [-1,1]){
  const end=new THREE.Group();end.position.set(side*iw/2,0,z);end.rotation.y=side*Math.PI/2;g.add(end);const s=new THREE.Shape();s.moveTo(-id/2,y+waist-.004);s.lineTo(0,y+h-.004);s.lineTo(id/2,y+waist-.004);s.closePath();k.mesh(end,new THREE.ShapeGeometry(s),p.aged,0,0,0);
  k.line(end,[[-id/2-.004,y+waist,.002],[0,y+h+.002,.002],[id/2+.004,y+waist,.002]],.004,p.ridge);
  for(let i=-5;i<=5;i++){const xx=i*id/12,high=(h-waist)*(1-Math.abs(xx)/(id/2));k.box(end,.003,Math.max(.005,high),.003,p.timber,xx,y+waist+high/2,.002);}
 }
 k.box(g,iw+.025,.009,.012,p.ridge,0,y+h+.006,z);
 for(const side of [-1,1]){k.line(g,[[side*(iw/2-.004),y+h+.009,z],[side*(iw/2+.015),y+h+.012,z],[side*(iw/2+.025),y+h+.041,z],[side*(iw/2+.018),y+h+.045,z]],.005,p.ridge);for(let i=0;i<5;i++){const x=side*(iw/2+.017+i*.027),t=(i+1)/6;k.ball(g,.0038,p.ridge,x,y+waist*(1-t)+.016,z+side*id*.5*t);}}
}
function balcony(k,g,p){
 const w=.735,d=.46,z=-.06,y=.384;k.box(g,w,.012,d,p.wood,0,y-.006,z);k.box(g,w+.010,.005,d+.01,p.red,0,y,z);
 for(const side of [-1,1]){
  for(let i=0;i<=18;i++){const x=(i/18-.5)*w;k.box(g,.0033,.050,.0035,p.red,x,y+.027,z+side*d/2);k.box(g,.007,.005,.007,p.timber,x,y+.052,z+side*d/2);}
  for(const h of [.014,.050])k.box(g,w,.004,.006,p.red,0,y+h,z+side*d/2);
  for(let i=0;i<=10;i++){const zz=z+(i/10-.5)*d;k.box(g,.0035,.050,.0035,p.red,side*w/2,y+.027,zz);}for(const h of [.014,.050])k.box(g,.006,.004,d,p.red,side*w/2,y+h,z);
 }
 for(const x of [-w/2,w/2])for(const zz of [z-d/2,z+d/2])k.cyl(g,.0033,.0048,.204,p.red,x,.489,zz,10);
}
function censer(k,g,p){
 const c=new THREE.Group();c.position.set(0,.026,.43);g.add(c);const iron=k.mat('#4c4c43',.88,.15);
 k.box(c,.132,.010,.085,iron,0,.006,0);for(const x of [-.048,.048])for(const z of [-.026,.026]){k.box(c,.008,.025,.008,iron,x,.020,z);k.box(c,.006,.070,.006,iron,x,.065,z);}
 for(const side of [-1,1]){const zz=side*.032;k.box(c,.11,.007,.005,iron,0,.036,zz);k.box(c,.11,.007,.005,iron,0,.093,zz);lattice(k,c,0,.064,zz,.103,.048,iron);const ring=k.mesh(c,new THREE.TorusGeometry(.022,.0017,5,36),iron,0,.065,zz+side*.001);ring.name='censer-medallion';}
 hip(k,c,.155,.105,.036,.105,p.tile,p.ridge);for(const x of [-.061,.061])k.line(c,[[x,.120,0],[x,.147,0],[x*.93,.153,0]],.003,iron);k.ball(c,.006,iron,0,.150,0);
}
export function dule(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.66,.62);paving(k,g,p,.56,.52);
 p.red=lit(k,'#904c40',.035);p.red.userData.duleWall=true;p.wood=k.mat('#604f3d',.96);p.timber=lit(k,'#82745a',.065);p.aged=k.mat('#a09476',.98);p.tile=lit(k,'#777c75',.025);p.tileTop=k.mat('#96988b',.98);p.ridge=k.mat('#a7a795',.96);p.dark=lit(k,'#373d34',.025);p.stone.userData.dulePaving=true;
 p.red.onBeforeCompile=s=>{s.vertexShader='varying vec3 vDule;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvDule=position;');s.fragmentShader='varying vec3 vDule;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grain=sin(vDule.x*760.+sin(vDule.y*370.))*sin(vDule.z*620.+vDule.y*490.);diffuseColor.rgb*=.97+.035*grain;`);};p.red.customProgramCacheKey=()=> 'dule-weathered-red-239';
 k.box(g,.705,.030,.43,p.stone,0,.043,-.06);
 // Ten shallow rises connect courtyard to the plinth; no floating first step.
 for(let i=0;i<10;i++){const z=.345-i*.020,top=.022+(i+1)*.0036;k.box(g,.55,top-.016,.022,p.stone,0,(top+.016)/2,z);}
 for(const [y,w,d,h]of [[.058,.65,.36,.154],[.391,.62,.34,.121]]){
  for(const side of [-1,1]){
   const front=new THREE.Group();front.position.set(0,y,-.06+side*d/2);front.rotation.y=side===1?0:Math.PI;g.add(front);const upper=y>.3,holes=upper?[-.19,0,.19].map(x=>({x,y:.014,w:.132,h:.065})):[{x:0,y:0,w:.193,h:.126}];wall(k,front,p,w,h,holes);
   for(const o of holes){k.box(front,o.w+.010,.005,.016,p.timber,o.x,o.y+o.h+.002,.003);k.box(front,.005,o.h,.016,p.timber,o.x-o.w/2-.002,o.y+o.h/2,.003);k.box(front,.005,o.h,.016,p.timber,o.x+o.w/2+.002,o.y+o.h/2,.003);if(upper){k.box(front,o.w,o.h,.003,p.dark,o.x,o.y+o.h/2,-.006);lattice(k,front,o.x,o.y+o.h/2,-.002,o.w,o.h,p.wood);}else{for(const s of [-1,1]){const leaf=k.box(front,.058,.113,.006,p.red,s*.081,.0565,-.035);leaf.rotation.y=s*.82;}lattice(k,front,0,.139,.001,.19,.021,p.wood);}}
   for(const x of [-w*.48,-w*.16,w*.16,w*.48])k.cyl(front,.0045,.0058,h+.007,p.red,x,h/2,.005,10);
   k.box(front,w,.011,.025,p.timber,0,h-.004,.006);
   const end=new THREE.Group();end.position.set(side*w/2,y,-.06);end.rotation.y=side*Math.PI/2;g.add(end);wall(k,end,p,d,h);for(const x of [-d*.44,0,d*.44])k.cyl(end,.0048,.006,h,p.red,x,h/2,.005,10);k.box(end,d,.011,.020,p.timber,0,h-.003,.005);
  }
 }
 bracketRing(k,g,p,.65,.36,.211);apron(k,g,p,{w:.91,d:.63,iw:.63,id:.32,y:.281,h:.049});
 bracketRing(k,g,p,.62,.34,.321,-.06,.76);balcony(k,g,p);bracketRing(k,g,p,.62,.34,.513);roof(k,g,p);
 sign(k,g,'观音之阁',.094,.040,0,.540,.149,{background:'#667066',color:'#d1c7a8'});sign(k,g,'具足圆成',.10,.027,0,.227,.178,{background:'#77736a',color:'#252e28'});
 censer(k,g,p);for(const x of [-.285,.285]){k.cyl(g,.020,.016,.028,p.stone,x,.035,.39,24);for(let j=0;j<9;j++){const a=j*TAU/9;k.line(g,[[x,.05,.39],[x+Math.sin(a)*.025,.095,.39+Math.cos(a)*.025],[x+Math.sin(a)*.035,.087,.39+Math.cos(a)*.035]],.0025,p.leaf);}}
 grove(k,g,height,[[-.51,-.27,.15],[.53,-.30,.16]]);return finish(k,g,{lamps:[[-.39,.024,.35],[.39,.024,.35]],visitors:[[.20,.023,.43],[-.37,.023,.42]]});
}
