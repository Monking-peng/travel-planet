import * as THREE from 'three';
import {palette,site,skin,sign,lattice,finish,lit} from './suzhou-kit.js';

function stone(k,color,scale=90){
 const m=k.mat(color,.98,.01);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 pjPoint;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npjPoint=position;');s.fragmentShader='varying vec3 pjPoint;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vec2((pjPoint.x+pjPoint.z)*${(scale*.43).toFixed(1)},pjPoint.y*${scale.toFixed(1)});q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),a=max(fwidth(q),vec2(.01));float join=max(1.0-smoothstep(.04-a.x*.5,.04+a.x*.5,min(f.x,1.0-f.x)),1.0-smoothstep(.06-a.y*.5,.06+a.y*.5,min(f.y,1.0-f.y)));float noise=fract(sin(dot(floor(q),vec2(11.27,4.35)))*721.3);diffuseColor.rgb*=mix(1.0,.86+.22*noise-.13*join,1.0-smoothstep(.5,.95,max(a.x,a.y)));`);};m.customProgramCacheKey=()=> 'pingjiang-stone-'+scale;return m;
}
function roofMaterial(k){
 const m=k.mat('#626765',.96),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;m.onBeforeCompile=s=>{s.vertexShader='varying vec2 pjTile;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npjTile=uv;');s.fragmentShader='varying vec2 pjTile;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(pjTile.x),.008),rib=1.0-smoothstep(.05,.05+aa,abs(fract(pjTile.x)-.5));diffuseColor.rgb*=mix(1.0,.8+.24*rib,1.0-smoothstep(.38,.9,aa))*mix(.9,1.0,smoothstep(.02,.02+max(fwidth(pjTile.y),.01),fract(pjTile.y)));`);};m.customProgramCacheKey=()=> 'pingjiang-tiles';return m;
}
function plaster(k){
 const m=k.mat('#d9dcd2',.98);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 pjWall;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npjWall=position;');s.fragmentShader='varying vec3 pjWall;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float streak=.5+.5*sin((pjWall.x+pjWall.z)*189.0+sin((pjWall.x-pjWall.z)*47.0));float base=(1.0-smoothstep(.11,.18,pjWall.y));diffuseColor.rgb*=1.0-.11*base*(.5+.5*streak)-.025*streak;`);};m.customProgramCacheKey=()=> 'pingjiang-aged-plaster';return m;
}
function gableRoof(k,g,p,w,d,y){
 for(const side of [-1,1]){
  const at=(u,v)=>[(u-.5)*w,y+.052*(1-v)**1.2,side*d/2*v],mesh=skin(k,g,at,12,40,p.tile),uv=[];
  for(let j=0;j<=12;j++)for(let i=0;i<=40;i++)uv.push(i/40*w*150,j/12*11);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  k.line(g,[[ -w/2,y,side*d/2],[w/2,y,side*d/2]],.002,p.ridge);
  for(let i=0;i<Math.round(w*150);i++)k.mesh(g,new THREE.SphereGeometry(.0017,6,4),p.ridge,((i+.5)/Math.round(w*150)-.5)*w,y-.001,side*d/2);
 }
 k.box(g,w,.007,.007,p.ridge,0,y+.054,0);
}
function streetHouse(k,g,p,{x,z,w,d,floors,rotate}){
 const h=floors*.142,base=.104,house=new THREE.Group();house.position.set(x,0,z);house.rotation.y=rotate;g.add(house);
 k.box(house,w+.010,.078,d+.012,p.masonry,0,base-.039,0);k.box(house,w,.010,d,p.wood,0,base+h,0);
 // Recessed openings sit in actual wall holes on both long faces.
 for(const side of [-1,1]){
  const frame=new THREE.Group();frame.rotation.y=side===1?0:Math.PI;house.add(frame);const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();const n=Math.max(3,Math.round(w/.068));
  for(let level=0;level<floors;level++)for(let i=0;i<n;i++){
   const xx=((i+.5)/n-.5)*w*.92,bottom=level*.142+(level?.033:.009),wh=level?.073:.105,ww=w*.70/n,hole=new THREE.Path();hole.moveTo(xx-ww/2,bottom);hole.lineTo(xx-ww/2,bottom+wh);hole.lineTo(xx+ww/2,bottom+wh);hole.lineTo(xx+ww/2,bottom);hole.closePath();shape.holes.push(hole);
   k.box(frame,ww+.005,wh+.005,.004,p.window,xx,base+bottom+wh/2,d/2-.020);lattice(k,frame,xx,base+bottom+wh/2,d/2-.015,ww,wh,p.wood);
   for(const edge of [-1,1])k.box(frame,.003,wh+.007,.009,p.wood,xx+edge*ww/2,base+bottom+wh/2,d/2+.002);
   for(const yy of [bottom,bottom+wh])k.box(frame,ww+.006,.003,.012,p.wood,xx,base+yy,d/2+.003);
  }
  k.mesh(frame,new THREE.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:false}),p.white,0,base,d/2-.009);
  if(floors>1)k.box(frame,w,.014,.012,p.wood,0,base+.14,d/2+.002);
 }
 for(const side of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-d/2,base);shape.lineTo(d/2,base);shape.lineTo(d/2,base+h);shape.lineTo(0,base+h+.050);shape.lineTo(-d/2,base+h);shape.closePath();
  if(floors>1){const hole=new THREE.Path();hole.moveTo(-.026,base+.180);hole.lineTo(-.026,base+.248);hole.lineTo(.026,base+.248);hole.lineTo(.026,base+.180);hole.closePath();shape.holes.push(hole);const frame=new THREE.Group();frame.position.x=side*(w/2-.018);frame.rotation.y=side*Math.PI/2;house.add(frame);k.box(frame,.052,.068,.004,p.window,0,base+.214,0);lattice(k,frame,0,base+.214,.003,.052,.068,p.wood);}
  const m=k.mesh(house,new THREE.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:false}),p.white,side*w/2,0,0);m.rotation.y=Math.PI/2;m.position.x-=.0045;
  k.line(house,[[side*(w/2+.001),base+h,-d/2],[side*(w/2+.001),base+h+.05,0],[side*(w/2+.001),base+h,d/2]],.0025,p.ridge);
 }
 gableRoof(k,house,p,w+.025,d+.030,base+h+.007);
 for(let i=0;i<3;i++){const xx=(i-1)*w*.28;k.box(house,.004,.02,.026,p.wood,xx,base+.13,d/2+.014);k.cyl(house,.009,.009,.025,p.lantern,xx,base+.105,d/2+.033,12);k.cyl(house,.008,.008,.004,p.wood,xx,base+.120,d/2+.033,8);}
}
const deck=x=>.103+.146*(1-Math.min(1,Math.max(0,(Math.abs(x)-.052)/.258)));
function bridge(k,g,p){
 const b=new THREE.Group();b.position.set(-.08,0,.02);g.add(b);const shape=new THREE.Shape();shape.moveTo(-.31,.027);shape.lineTo(.31,.027);shape.lineTo(.31,.103);shape.lineTo(.052,.249);shape.lineTo(-.052,.249);shape.lineTo(-.31,.103);shape.closePath();const hole=new THREE.Path();hole.moveTo(-.136,.028);hole.lineTo(-.136,.066);hole.absarc(0,.066,.136,Math.PI,0,true);hole.lineTo(.136,.028);hole.closePath();shape.holes.push(hole);
 k.mesh(b,new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:false,curveSegments:40}),p.masonry,0,0,-.08);
 for(const side of [-1,1]){
  const z=side*.083,profile=[[-.31,deck(-.31)],[-.052,.249],[.052,.249],[.31,deck(.31)]],rail=new THREE.Shape();rail.moveTo(profile[0][0],profile[0][1]+.006);for(const [x,y]of profile.slice(1))rail.lineTo(x,y+.006);for(const [x,y]of [...profile].reverse())rail.lineTo(x,y+.051);rail.closePath();k.mesh(b,new THREE.ExtrudeGeometry(rail,{depth:.013,bevelEnabled:false}),p.rail,0,0,z-.0065);
  k.line(b,profile.map(([x,y])=>[x,y+.053,z]),.003,p.rail);k.line(b,profile.map(([x,y])=>[x,y+.006,z]),.002,p.edge);
  for(const x of [-.31,-.21,-.11,0,.11,.21,.31]){k.box(b,.017,.064,.022,p.rail,x,deck(x)+.032,z);k.box(b,.022,.007,.026,p.rail,x,deck(x)+.067,z);}
  const arch=Array.from({length:49},(_,i)=>{const a=Math.PI*i/48;return [.141*Math.cos(a),.066+.141*Math.sin(a),z+side*.001];});k.line(b,arch,.005,p.rail);k.line(b,arch.map(([x,y,zz])=>[x*.975,.066+(y-.066)*.975,zz+side*.002]),.0016,p.light);
  for(let i=0;i<24;i++){const a=Math.PI*(i+.5)/24,m=k.box(b,.002,.028,.003,p.joint,.155*Math.cos(a),.066+.155*Math.sin(a),z+side*.001);m.rotation.z=a-Math.PI/2;}
 }
 k.box(b,.104,.009,.145,p.rail,0,.2535,0);
 for(const side of [-1,1]){const n=side<0?12:13;for(let i=0;i<n;i++){const xx=side*(.31-(i+.5)*.258/n),top=.103+.146*(i+1)/n;k.box(b,.258/n+.0005,.014,.145,p.rail,xx,top-.006,0);}}
 sign(k,b,'重建胡厢使桥',.155,.021,0,.270,.092,{background:'#aeac97',color:'#686957'});
}
function flatBridge(k,g,p){
 const x=.18,z=.225;k.box(g,.16,.017,.21,p.joint,x,.096,z);for(let i=0;i<6;i++)k.box(g,.16/6-.0004,.019,.21,p.rail,x+(i-2.5)*.16/6,.096,z);
 for(const side of [-1,1]){k.box(g,.012,.036,.205,p.rail,x+side*.080,.142,z);for(const zz of [z-.101,z+.101]){k.box(g,.022,.070,.022,p.rail,x+side*.080,.137,zz);k.box(g,.026,.007,.026,p.rail,x+side*.080,.175,zz);}k.box(g,.016,.005,.205,p.rail,x+side*.080,.163,z);}
}
function willow(k,g,p){
 const x=-.30,z=.27;k.beam(g,[x,.105,z],[x-.018,.31,z-.006],.007,p.bark);for(let b=0;b<5;b++){const a=b*1.8,xx=x+Math.cos(a)*.07,zz=z+Math.sin(a)*.06;k.beam(g,[x-.012,.24,z],[xx,.34,zz],.003,p.bark);for(let j=0;j<5;j++){const s=a+j*.33,dx=Math.cos(s)*.048,dz=Math.sin(s)*.048;k.line(g,[[xx,.34,zz],[xx+dx*.7,.32,zz+dz*.7],[xx+dx,.23-j*.009,zz+dz]],.001,p.leaf);for(let n=0;n<6;n++){const m=k.mesh(g,new THREE.IcosahedronGeometry(.009,0),p.leaf,xx+dx*(.4+n*.12),.32-n*(.017+j*.002),zz+dz*(.4+n*.12));m.scale.set(.55,1.35,.50);}}}
}
function boat(k,g,p){
 const b=new THREE.Group();b.position.set(-.08,.032,.365);g.add(b);const profile=new THREE.Shape();profile.moveTo(-.046,-.12);profile.quadraticCurveTo(-.075,-.01,-.039,.13);profile.quadraticCurveTo(0,.145,.039,.13);profile.quadraticCurveTo(.075,-.01,.046,-.12);profile.quadraticCurveTo(0,-.15,-.046,-.12);const hull=k.mesh(b,new THREE.ExtrudeGeometry(profile,{depth:.023,bevelEnabled:false}),p.wood);hull.rotation.x=-Math.PI/2;
 k.box(b,.083,.004,.18,p.bark,0,.026,0);for(const side of [-1,1])for(const z of [-.065,.075])k.box(b,.002,.075,.002,p.wood,side*.045,.061,z);
 skin(k,b,(u,v)=>[(u-.5)*.106,.105+.018*Math.sin(Math.PI*u),(v-.5)*.158+.005],10,24,p.canopy);
 for(let i=0;i<19;i++)k.line(b,Array.from({length:13},(_,j)=>[(j/12-.5)*.106,.106+.018*Math.sin(Math.PI*j/12),(i/18-.5)*.158+.005]),.0007,p.bark);
 k.beam(b,[.02,.026,-.10],[.085,.14,-.15],.002,p.wood);for(const z of [-.040,.015,.065])k.box(b,.075,.008,.018,p.wood,0,.032,z);
}
export function pingjiang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.76,.72);p.masonry=stone(k,'#8b8c77',66);p.rail=stone(k,'#c5bfa8',120);p.joint=k.mat('#777b6a',.98);p.white=plaster(k);p.wood=k.mat('#534031',.95);p.window=lit(k,'#494039',.25);p.tile=roofMaterial(k);p.ridge=k.mat('#5c625a',.97);p.bark=k.mat('#73624a',.98);p.leaf=k.mat('#779164',.99);p.canopy=k.mat('#a39364',.93);p.light=lit(k,'#bcb18d',.8);p.edge=lit(k,'#c2b797',.3);p.lantern=lit(k,'#b74935',.65);p.water=k.mat('#527b67',.46,.13);p.water.userData.water=true;
 k.box(g,.25,.003,1.15,p.water,-.08,.030,0);k.box(g,.55,.003,.13,p.water,.305,.030,.225);
 k.box(g,.145,.076,1.10,p.masonry,-.2775,.066,0);for(const [z,d]of [[-.195,.71],[.420,.26]])k.box(g,.27,.076,d,p.masonry,.18,.066,z);
 k.box(g,.365,.076,.16,p.masonry,-.3875,.066,.02);k.box(g,.365,.004,.16,p.rail,-.3875,.105,.02);
 for(const [x,z,w,d]of [[-.2775,0,.145,1.10],[.18,-.195,.27,.71],[.18,.420,.27,.26]]){k.box(g,w,.004,d,p.rail,x,.105,z);for(let i=0;i<Math.floor(d/.031);i++)k.box(g,w,.0008,.0012,p.joint,x,.1075,z-d/2+(i+.5)*.031);}
 // The east-running side canal lies between the stone bridge's east landing and Tangjia Bridge.
 for(const z of [.151,.299])k.box(g,.30,.074,.018,p.masonry,.43,.067,z);
 bridge(k,g,p);flatBridge(k,g,p);
 streetHouse(k,g,p,{x:-.456,z:-.31,w:.37,d:.20,floors:1,rotate:Math.PI/2});streetHouse(k,g,p,{x:-.456,z:.38,w:.30,d:.20,floors:1,rotate:Math.PI/2});
 streetHouse(k,g,p,{x:.438,z:-.245,w:.43,d:.235,floors:2,rotate:-Math.PI/2});streetHouse(k,g,p,{x:.438,z:.43,w:.23,d:.235,floors:1,rotate:-Math.PI/2});
 willow(k,g,p);boat(k,g,p);
 // Low waterside stone guards end at the bridge approaches.
 for(const [x,z,d]of [[.056,-.32,.32],[.056,.46,.16],[-.205,-.32,.28]]){k.box(g,.013,.036,d,p.rail,x,.143,z);for(const zz of [z-d/2,z+d/2])k.box(g,.019,.06,.020,p.rail,x,.136,zz);}
 return finish(k,g,{lamps:[[.28,.108,-.42],[.29,.108,.43],[-.29,.108,-.43]],visitors:[[-.08,.258,.02],[.11,.108,-.18],[.23,.108,.43],[-.29,.108,-.34],[.17,.106,.23]]});
}
