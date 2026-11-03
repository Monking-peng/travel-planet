import * as THREE from 'three';
import {palette,site,finish,skin,frame,ellipsoid,lit,windowGlass,extrude,perimeter,TAU,sign,disc,polygon} from './macau-kit.js';
export function tower(k){const g=new THREE.Group(),p=palette(k);site(k,g,p);const glass=windowGlass(k,'#4d626c',38),shaft=lit(k,'#c6b997',.11);
 const point=(u,v)=>{const a=u*TAU,r=.035+.095*Math.exp(-v*12)+.018*v**5;return [r*Math.cos(a),.025+1.18*v,r*Math.sin(a)];};skin(k,g,point,70,72,shaft);
 for(let i=0;i<4;i++){const a=i/4*TAU;k.line(g,Array.from({length:30},(_,j)=>{const v=j/29,r=.038+.101*Math.exp(-v*11);return [r*Math.cos(a),.025+v*1.18,r*Math.sin(a)];}),.003,p.pale);}
 const profile=[[.048,1.11],[.077,1.14],[.092,1.19],[.11,1.21],[.11,1.29],[.119,1.30],[.115,1.315],[.08,1.34],[0,1.34]];k.mesh(g,new THREE.LatheGeometry(profile.map(q=>new THREE.Vector2(...q)),64),glass);
 for(const [r,y]of [[.08,1.15],[.096,1.20],[.113,1.215],[.12,1.30],[.118,1.318]])k.ring(g,r,.003,p.pale,y);
 for(let i=0;i<40;i++){const a=i/40*TAU;k.beam(g,[.111*Math.cos(a),1.22,.111*Math.sin(a)],[.111*Math.cos(a),1.286,.111*Math.sin(a)],.0012,p.steel);}
 for(let j=0;j<5;j++)k.cyl(g,.008-j*.0013,.010-j*.0013,.065,p.pale,0,1.355+j*.065,0,12);
 k.ball(g,.003,lit(k,'#b95643',.7,1),0,1.65,0);return finish(k,g,{lamps:[[-.19,.025,.15],[.19,.025,.15]],visitors:[[-.18,.026,.20],[.22,.026,.25]]});}
export function lisboa(k){const g=new THREE.Group(),p=palette(k);site(k,g,p);const gold=windowGlass(k,'#bb9851',52,'#f1cc72');gold.roughness=.47;gold.metalness=.30;
 const base=k.mat('#bda96b',.46,.30);base.onBeforeCompile=s=>{s.vertexShader='varying vec3 vGold;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGold=position;');s.fragmentShader='varying vec3 vGold;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 c=vec2(atan(vGold.z,vGold.x)*22.,vGold.y*65.);float q=fract(sin(dot(floor(c),vec2(43.7,89.3)))*43758.5);diffuseColor.rgb*=mix(vec3(.48,.58,.60),vec3(1.13,.99,.64),q);float seam=min(fract(c.x+c.y),fract(c.x-c.y));diffuseColor.rgb*=mix(.60,1.,step(.06,seam));`);};base.customProgramCacheKey=()=> 'lisboa-mosaic';
 ellipsoid(k,g,base,0,.255,0,.49,.235,.33);k.box(g,.21,.12,.07,p.dark,0,.09,.30);sign(k,g,'GRAND LISBOA',.20,.025,0,.176,.331,{background:'#5b3526',color:'#e6cf8c'});
 // The flower opens upward around a narrow stem. Seven staggered ribs are
 // separate stepped petals rather than a cylinder with a painted gold skin.
 const stem=(u,v)=>{const a=u*TAU,r=.13+.10*v*v;return [Math.cos(a)*r,.31+.53*v,Math.sin(a)*r*.58];};skin(k,g,stem,36,64,gold);frame(k,g,stem,14,24,p.gold,.0012);
 for(let j=0;j<6;j++){
  const bottom=.60+j*.08,top=1.04+j*.050,width=.29+j*.010;
  const front=(u,v)=>{const xx=(u-.5)*2,rx=.125+(width-.125)*v,yy=bottom+(top-bottom)*v+.07*v**4*xx*xx;return [xx*rx,yy,.115+.022*(5-j)+.025*Math.sin(v*Math.PI)*(1-xx*xx)];};
  for(const side of [-1,1]){const f=(u,v)=>{const a=front(u,v);a[2]*=side;return a;};skin(k,g,f,24,32,gold);frame(k,g,f,12,12,p.gold,.001);k.line(g,Array.from({length:48},(_,i)=>f(i/47,1)),.0035,p.gold);for(const edge of [0,1])k.line(g,Array.from({length:24},(_,i)=>f(edge,i/23)),.0025,p.gold);}
 }
 k.cyl(g,.02,.055,.055,p.gold,0,1.33,0,24);for(let i=0;i<8;i++){const a=i/8*TAU;k.line(g,[[Math.cos(a)*.035,1.35,Math.sin(a)*.035],[Math.cos(a)*.018,1.41,Math.sin(a)*.018],[0,1.43,0]],.0015,p.pale);}
 return finish(k,g,{lamps:[[-.50,.026,.22],[.50,.026,.22]],visitors:[[-.20,.026,.39],[.21,.026,.39]]});}
export const MORPHEUS_HOLES=[{x:0,y:.43,rx:.108,ry:.126,phase:.4},{x:.022,y:.76,rx:.113,ry:.145,phase:2},{x:-.015,y:1.055,rx:.073,ry:.077,phase:4}];
function holePoint(h,a){const r=1+.15*Math.sin(a*3+h.phase);return [h.x+Math.cos(a)*h.rx*r,h.y+Math.sin(a)*h.ry*r];}
function holeDistance(x,y,h){const a=Math.atan2((y-h.y)/h.ry,(x-h.x)/h.rx),r=1+.15*Math.sin(a*3+h.phase);return Math.hypot((x-h.x)/h.rx,(y-h.y)/h.ry)-r;}
export function morpheus(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const glass=windowGlass(k,'#415c70',76),steel=lit(k,'#9caead',.12);
 const s=new THREE.Shape();s.moveTo(-.39,.08);s.lineTo(.39,.08);s.lineTo(.39,1.29);s.quadraticCurveTo(.39,1.33,.35,1.33);s.lineTo(-.35,1.33);s.quadraticCurveTo(-.39,1.33,-.39,1.29);s.closePath();
 for(const h of MORPHEUS_HOLES){const path=new THREE.Path();for(let i=0;i<=100;i++){const q=holePoint(h,i/100*TAU);i?path.lineTo(...q):path.moveTo(...q);}path.closePath();s.holes.push(path);}extrude(k,g,s,glass,.29,0);
 const valid=(x,y)=>Math.abs(x)<=.391&&y>=.08&&y<=1.332&&MORPHEUS_HOLES.every(h=>holeDistance(x,y,h)>.055);
 // Clip the diagonal structure at every real tunnel opening. No beams span
 // the void just to simulate a hole with a black circle.
 for(const face of [-1,1]){
  const z=face*.153;for(const slope of [-1.45,1.45])for(let j=-17;j<=17;j++){
   const intercept=j*.117;let start=null,last=null;for(let i=0;i<=241;i++){const x=-.39+.78*i/240,y=slope*x+intercept;if(i<=240&&valid(x,y)){if(!start)start=[x,y];last=[x,y];}else if(start){if(Math.hypot(last[0]-start[0],last[1]-start[1])>.003)k.beam(g,[...start,z],[...last,z],.0032,steel);start=null;}}
  }
  for(const h of MORPHEUS_HOLES){k.line(g,Array.from({length:100},(_,i)=>{const q=holePoint({...h,rx:h.rx*1.04,ry:h.ry*1.04},i/100*TAU);return [...q,z];}),.006,steel,true);}
  for(let j=0;j<25;j++){const y=.095+j*.05;for(const a of [[-.386,-.14],[.14,.386]])k.beam(g,[a[0],y,z],[a[1],y,z],.0013,p.steel);}
 }
 for(const side of [-1,1])for(let j=0;j<11;j++){const y=.10+j*.112;k.beam(g,[side*.395,y,-.151],[side*.395,y+.11,.151],.003,steel);k.beam(g,[side*.395,y,.151],[side*.395,y+.11,-.151],.003,steel);}
 for(const h of MORPHEUS_HOLES)for(let i=0;i<12;i++){const q=holePoint(h,i/12*TAU);k.beam(g,[q[0],q[1],-.145],[q[0],q[1],.145],.002,p.steel);}
 k.box(g,.88,.025,.38,p.pale,0,.055,0);sign(k,g,'MORPHEUS',.22,.024,0,.094,.157,{background:'#243945',color:'#dcdac9'});
 return finish(k,g,{lamps:[[-.48,.025,.24],[.48,.025,.24]],visitors:[[-.19,.026,.31],[.20,.026,.34]]});
}
export function science(k){const g=new THREE.Group(),p=palette(k);site(k,g,p);const metal=k.mat('#bdc3bd',.57,.22),glass=windowGlass(k,'#576f75',41);
 const surface=(u,v)=>{const a=u*TAU,r=.355*(1-v)+.073*v;return [Math.cos(a)*r-.08*v,.035+.77*v+v*.035*Math.cos(a),Math.sin(a)*r];};skin(k,g,surface,52,96,metal);frame(k,g,surface,30,36,p.steel,.00075);polygon(k,g,Array.from({length:96},(_,i)=>surface(i/96,1)),metal);
 for(const [lo,hi]of [[.12,.145],[.48,.54]])skin(k,g,(u,v)=>{const q=surface(u,lo+(hi-lo)*v);q[0]*=1.006;q[2]*=1.006;return q;},3,96,glass);
 const lip=(u,v)=>{const a=-.55+u*2.7,r=.24+v*.065;return [Math.cos(a)*r-.04,.455+.016*v,Math.sin(a)*r];};skin(k,g,lip,4,64,metal);
 // The round lookout stands off the cone and is joined by a raised bridge.
 k.cyl(g,.022,.030,.37,p.pale,-.37,.205,.20,24);k.cyl(g,.115,.11,.018,p.steel,-.37,.399,.20,64);
 for(let i=0;i<16;i++){const a=i/16*TAU;k.beam(g,[-.37+Math.cos(a)*.108,.41,.20+Math.sin(a)*.108],[-.37+Math.cos(a)*.108,.48,.20+Math.sin(a)*.108],.002,p.steel);}
 const deck=new THREE.Group();deck.position.set(-.37,0,.20);g.add(deck);k.ring(deck,.108,.002,p.steel,.48);k.ring(deck,.108,.0015,p.steel,.44);
 k.beam(g,[-.28,.40,.18],[-.12,.40,.12],.016,p.pale,4);for(const z of [.165,.205])k.beam(g,[-.28,.445,z],[-.12,.445,z-.06],.002,p.steel);
 ellipsoid(k,g,p.steel,.34,.115,-.19,.17,.11,.16);k.ring(g,.17,.002,p.pale,.08).position.set(.34,.08,-.19);
 return finish(k,g,{lamps:[[-.49,.025,.34],[.47,.025,.13]],visitors:[[-.10,.026,.42],[.22,.026,.35]]});}
