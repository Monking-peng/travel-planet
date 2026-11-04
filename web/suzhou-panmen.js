import * as THREE from 'three';
import {palette,site,disc,pond,skin,archWall,lattice,sign,finish} from './suzhou-kit.js';

function tiles(k){
 const m=k.mat('#666b68',.96,.015),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 panmenTileUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npanmenTileUv=uv;');s.fragmentShader='varying vec2 panmenTileUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(panmenTileUv.x),.008),rib=1.0-smoothstep(.05,.05+aa,abs(fract(panmenTileUv.x)-.5));float visible=1.0-smoothstep(.38,.9,aa);float seam=smoothstep(.025,.025+max(fwidth(panmenTileUv.y),.008),fract(panmenTileUv.y));diffuseColor.rgb*=mix(1.0,.77+.27*rib,visible)*mix(.88,1.0,seam);`);};m.customProgramCacheKey=()=> 'panmen-grey-tiles';return m;
}
function roof(k,g,p,w,d,h,y){
 const ridge=w*.255;
 const at=(side,u,v)=>{const a=u*2-1,b=ridge+(w/2-ridge)*v;return [side<2?a*b:(side===2?b:-b),y+h*(1-v)**1.6+.026*v**6*Math.abs(a)**7,side<2?(side===0?1:-1)*d/2*v:a*d/2*v];};
 for(let side=0;side<4;side++){
  const mesh=skin(k,g,(u,v)=>at(side,u,v),24,64,p.tile),uv=[],n=side<2?64:34;
  for(let j=0;j<=24;j++)for(let i=0;i<=64;i++)uv.push(i/64*n,j/24*17);
  mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  k.line(g,Array.from({length:65},(_,i)=>at(side,i/64,1)),.0035,p.eave);
  for(let i=0;i<=n;i++){const a=at(side,i/n,1),m=k.mesh(g,new THREE.CircleGeometry(.0021,8),p.cap,a[0],a[1]-.001,a[2]);m.rotation.y=side<2?(side?Math.PI:0):(side===2?Math.PI/2:-Math.PI/2);}
 }
 for(const side of [0,1])for(const u of [0,1])k.line(g,Array.from({length:33},(_,i)=>at(side,u,i/32)),.004,p.cap);
 k.box(g,ridge*2+.008,.016,.014,p.cap,0,y+h+.004,0);
 return {ridge,top:y+h+.012};
}

function stone(k){
 const m=k.mat('#74796c',.99,.01);m.userData.panmenGate=true;m.userData.night={color:new THREE.Color('#d3cfb4'),intensity:.09};
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 pmPoint;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npmPoint=position;');s.fragmentShader='varying vec3 pmPoint;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float scale=mix(62.0,126.0,smoothstep(.105,.12,pmPoint.y));vec2 q=vec2((pmPoint.x+pmPoint.z)*scale*.56,pmPoint.y*scale);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),fw=max(fwidth(q),vec2(.007));float seam=max(1.0-smoothstep(.055-fw.x*.5,.055+fw.x*.5,min(f.x,1.0-f.x)),1.0-smoothstep(.07-fw.y*.5,.07+fw.y*.5,min(f.y,1.0-f.y)));float visible=1.0-smoothstep(.5,1.0,max(fw.x,fw.y));float n=fract(sin(dot(floor(q),vec2(7.51,13.37)))*1078.3);diffuseColor.rgb*=mix(1.0,.80+n*.26-seam*.20,visible);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.15,1.08,.88),(1.0-smoothstep(.10,.13,pmPoint.y))*n*.5);
 `);};m.customProgramCacheKey=()=> 'panmen-aged-stone';return m;
}
function parapet(k,g,p,w,x,z,y,rotation=0){
 const f=new THREE.Group();f.position.set(x,0,z);f.rotation.y=rotation;g.add(f);k.box(f,w,.025,.024,p.wall,0,y+.0125,0);const n=Math.max(3,Math.round(w/.067));for(let i=0;i<n;i++){const xx=((i+.5)/n-.5)*w;k.box(f,w/n*.70,.022,.027,p.wall,xx,y+.035,0);k.box(f,w/n*.74,.004,.031,p.cap,xx,y+.048,0);}
}
function archRim(k,g,p,x,z,y,r,spring,side=1){
 const pts=Array.from({length:33},(_,i)=>{const a=Math.PI*i/32;return [x+r*Math.cos(a),y+spring+r*Math.sin(a),z];});k.line(g,pts,.004,p.cap);
 for(let i=0;i<=18;i++){const a=Math.PI*(i+.5)/19,o=k.box(g,.002,.015,.003,p.cap,x+(r+.005)*Math.cos(a),y+spring+(r+.005)*Math.sin(a),z+side*.001);o.rotation.z=a-Math.PI/2;}
 for(const s of [-1,1])k.box(g,.010,spring,.003,p.cap,x+s*(r+.004),y+spring/2,z);
}
function ivy(k,g,p,x,z,y,len,flip=1){
 for(let j=0;j<3;j++){const xx=x+(j-1)*.018;k.line(g,[[xx,y,z],[xx+.009,y-len*.45,z+.003*flip],[xx-.008,y-len,z+.006*flip]],.0011,p.vine);for(let i=0;i<9;i++){const yy=y-i*len/9,leaf=k.mesh(g,new THREE.IcosahedronGeometry(.009-i*.00035,0),p.leaf,xx+Math.sin(i*2.3+j)*.012,yy,z+.007*flip);leaf.scale.set(1.1,.8,.25);}}
}
function gatehouse(k,g,p){
 const house=new THREE.Group();house.position.set(.17,0,-.205);g.add(house);const y=.322;
 k.box(house,.49,.012,.28,p.cap,0,y-.006,0);k.box(house,.37,.134,.183,p.plaster,0,y+.067,0);
 for(const side of [-1,1]){const f=new THREE.Group();f.rotation.y=side===1?0:Math.PI;house.add(f);for(const x of [-.225,-.15,-.075,.075,.15,.225])k.cyl(f,.0045,.006,.140,p.red,x,y+.070,.118,10);k.box(f,.105,.113,.007,p.red,0,y+.057,.097);for(let i=0;i<6;i++)k.box(f,.0013,.102,.002,p.dark,(i/5-.5)*.090,y+.059,.102);k.box(f,.48,.009,.018,p.red,0,y+.135,.118);}
 roof(k,house,p,.58,.37,.080,y+.146);
 const upper=y+.217;k.box(house,.39,.095,.178,p.red,0,upper+.0475,0);
 for(let side=0;side<4;side++){const f=new THREE.Group();f.rotation.y=side*Math.PI/2;house.add(f);const front=side%2===0,w=front?.39:.178,z=front?.091:.197;for(let i=0;i<(front?5:3);i++){const x=((i+.5)/(front?5:3)-.5)*w*.90;k.box(f,w*.65/(front?5:3),.063,.003,p.dark,x,upper+.043,z);lattice(k,f,x,upper+.043,z+.002,w*.65/(front?5:3),.063,p.red);}k.box(f,w+.015,.007,.012,p.red,0,upper+.091,z+.003);}
 const crown=roof(k,house,p,.52,.31,.104,upper+.105);
 // Tall ornamental ridge, circular medallion and curled end pieces match the gatehouse silhouette.
 const ridgeY=crown.top;for(const yy of [ridgeY+.002,ridgeY+.022])k.box(house,crown.ridge*2,.006,.010,p.cap,0,yy,0);
 for(let i=-6;i<=6;i++)k.mesh(house,new THREE.TorusGeometry(.006,.0015,4,12),p.cap,i*.018,ridgeY+.012,0);
 k.mesh(house,new THREE.TorusGeometry(.014,.003,6,24),p.cap,0,ridgeY+.035,0);
 for(const side of [-1,1]){const s=new THREE.Shape();s.moveTo(-.012,-.010);s.lineTo(.008,-.010);s.bezierCurveTo(.027,.007,.030,.035,.016,.050);s.bezierCurveTo(.006,.038,-.006,.027,.003,.021);s.bezierCurveTo(.012,.026,.014,.029,.014,.032);s.bezierCurveTo(.019,.012,.008,.008,-.012,.007);s.closePath();const m=k.mesh(house,new THREE.ExtrudeGeometry(s,{depth:.009,bevelEnabled:false,curveSegments:12}),p.cap,side*crown.ridge,ridgeY, -.0045);m.scale.x=side;}
 sign(k,house,'水陆萦洄',.22,.041,0,upper+.050,.097,{background:'#dddcd0',color:'#383a32'});
}
export function panmen(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.72,.67);p.wall=stone(k);p.cap=k.mat('#9b9c89',.96);p.cap.userData.night={color:new THREE.Color('#c9c6a8'),intensity:.09};p.plaster=k.mat('#bfc3b9',.95);p.red=k.mat('#6c342e',.91);p.red.userData.night={color:new THREE.Color('#e5ba7d'),intensity:.09};p.dark=k.mat('#303d37',.91);p.tile=tiles(k);p.eave=k.mat('#626352',.88);p.eave.userData.night={color:new THREE.Color('#f3c889'),intensity:.6};p.leaf=k.mat('#537049',.99);p.vine=k.mat('#635e42',.99);
 disc(k,g,.62,.55,.024,p.stone);pond(k,g,p,.44,.15,-.14,.365);k.box(g,.206,.002,.91,p.water,-.26,.026,-.015);
 k.box(g,.425,.014,.49,p.stone,.2075,.0285,.015);k.box(g,.13,.014,.36,p.stone,.31,.0285,.335);k.box(g,.13,.014,.26,p.stone,.17,.0285,-.335);
 const rear={z:-.205,h:.295,landX:.17},front={z:.245,h:.257,landX:.31};
 for(const [wall,waterR]of [[rear,.092],[front,.092]]){archWall(k,g,{w:.98,h:wall.h,d:.084,y:.025,z:wall.z,openings:[{x:-.26,r:waterR,spring:.104,bottom:.001},{x:wall.landX,r:.061,spring:.111,bottom:.001}],mat:p.wall});for(const side of [-1,1]){archRim(k,g,p,-.26,wall.z+side*.044,.025,waterR,.104,side);archRim(k,g,p,wall.landX,wall.z+side*.044,.025,.061,.111,side);}k.box(g,.98,.012,.096,p.cap,0,.025+wall.h+.006,wall.z);}
 // The open land court and parallel water channel replace a filled rectangular gate block.
 for(const [x,w]of [[-.45,.08],[-.09,.07],[.45,.08]])k.box(g,w,.257,.45,p.wall,x,.1535,.020);
 for(const x of [-.45,-.09,.45])k.box(g,.092,.012,.45,p.cap,x,.288,.020);
 parapet(k,g,p,.98,0,.286,.294);parapet(k,g,p,.45,-.488,.020,.294,Math.PI/2);parapet(k,g,p,.45,.488,.020,.294,Math.PI/2);parapet(k,g,p,.30,-.34,-.250,.332);
 // Inward stairs climb from the barbican to the rear wall and gatehouse terrace.
 for(let i=0;i<22;i++){const top=.0355+(i+1)*(.2865/22);k.box(g,.083,top-.022,.0125,p.cap,.375,(top+.022)/2,.18-i*.0115);}
 gatehouse(k,g,p);
 // Gate grooves remain at the jambs; the water route itself stays open.
 for(const z of [-.205,.245])for(const side of [-1,1])k.box(g,.004,.16,.007,p.dark,-.26+side*.087,.106,z+.045);
 for(const [x,z,y,len]of [[-.39,.291,.265,.12],[-.13,.291,.26,.095],[.10,.291,.23,.085],[-.40,-.251,.29,.11],[-.13,-.251,.26,.09]])ivy(k,g,p,x,z,y,len,z>0?1:-1);
 for(const x of [-.373,-.147])k.box(g,.018,.024,.91,p.cap,x,.035,-.015);
 return finish(k,g,{lamps:[[.09,.035,.37],[.40,.035,.37],[-.39,.032,.36]],visitors:[[.25,.036,.39],[.15,.036,.05],[.36,.333,-.15]]});
}
