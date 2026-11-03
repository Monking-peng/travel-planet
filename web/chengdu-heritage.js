import * as THREE from 'three';
import {TAU,palette,site,pond,paving,steps,grove,bamboo,roof,plaque,skin,lattice,balcony,glow,finish} from './chengdu-kit.js';

function lion(k,g,p,x,z){k.box(g,.044,.04,.052,p.stone,x,.041,z);const body=k.ball(g,.022,p.stone,x,.076,z);body.scale.set(.77,1.1,1);k.ball(g,.019,p.stone,x,.103,z+.008);for(let i=0;i<9;i++){const a=i/9*TAU;k.ball(g,.0045,p.stone,x+.017*Math.sin(a),.103+.014*Math.cos(a),z+.009);}for(const side of [-1,1])k.cyl(g,.005,.007,.03,p.stone,x+side*.010,.063,z+.018,6);k.ball(g,.006,p.stone,x,.10,z+.024);}
export function wuhou(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.66,.58);paving(k,g,p,.49,.46);
 // Five-bay gate, with a genuinely open central passage, then red garden walls.
 const z=.17,w=.65,h=.23;
 for(const side of [-1,1]){k.box(g,.22,h,.095,p.red,side*.23,h/2+.043,z);k.box(g,.27,.035,.10,p.stone,side*.23,.039,z);k.box(g,.11,h*.76,.007,p.wood,side*.135,.13,z+.051);lattice(k,g,side*.23,.14,z+.053,.09,.12,p.wood);}
 k.box(g,w,.045,.11,p.red,0,.249,z);
 for(const x of [-.322,-.195,-.067,.067,.195,.322]){k.cyl(g,.007,.008,h,p.red,x,.158,z+.067,12);k.cyl(g,.011,.012,.018,p.stone,x,.049,z+.067,12);k.box(g,.035,.009,.03,p.wood,x,.267,z+.067);}
 roof(k,g,.78,.25,.095,.278,p.tile,p.tile,0,z);plaque(k,g,'汉昭烈庙',.175,.048,0,.241,z+.073);
 for(const x of [-.26,-.10,.10,.26]){const lantern=glow(k,'#d96643',.65);k.cyl(g,.013,.013,.039,lantern,x,.212,z+.082,8);k.cyl(g,.015,.015,.004,p.gold,x,.234,z+.082,8);k.beam(g,[x,.235,z+.082],[x,.269,z+.082],.0015,p.wood);}
 steps(k,g,p,0,.315,.65,5,.026,.055);lion(k,g,p,-.36,.32);lion(k,g,p,.36,.32);
 for(const side of [-1,1]){k.box(g,.026,.20,.49,p.red,side*.415,.121,-.045);for(const dx of [-.008,.008])k.box(g,.034,.009,.50,p.tile,side*.415+dx,.226,-.045);k.box(g,.15,.20,.024,p.red,side*.39,.121,.17);}
 // A shaded red-wall lane is the second recognizable part of this entrance group.
 k.box(g,.019,.18,.43,p.red,.29,.113,-.07);roof(k,g,.05,.45,.015,.207,p.tile,p.tile,.29,-.07);
 for(let i=0;i<5;i++)bamboo(k,g,.35,-.27+i*.08,.30+(i%2)*.025);
 grove(k,g,height,[[-.43,-.35,.20],[-.22,-.40,.23],[0,-.43,.25],[.20,-.40,.20],[-.44,-.13,.22],[-.47,.12,.24],[.47,.18,.22],[.48,-.27,.23]]);
 return finish(k,g,{lamps:[[-.23,.39],[.23,.39],[-.37,-.20]],visitors:[[-.06,.34],[.05,.37],[.12,.30],[.00,-.05],[-.18,-.19]]});
}
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

export function anshun(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.76,.58);pond(k,g,p,.69,.49);p.water.roughness=.28;
 const s=new THREE.Shape();s.moveTo(-.56,0);s.lineTo(.56,0);s.lineTo(.56,.25);s.lineTo(.34,.29);s.lineTo(-.34,.29);s.lineTo(-.56,.25);s.closePath();
 const arches=[{x:0,r:.195,spring:.034},{x:-.405,r:.137,spring:.025},{x:.405,r:.137,spring:.025}];
 for(const {x,r,spring}of arches){const h=new THREE.Path();h.moveTo(x-r,.001);h.lineTo(x-r,spring);h.absarc(x,spring,r,Math.PI,0,true);h.lineTo(x+r,.001);h.closePath();s.holes.push(h);}
 for(const x of [-.24,.24]){const h=new THREE.Path();h.absarc(x,.166,.039,0,TAU,true);s.holes.push(h);}
 const stone=k.mat('#b2b4a1',.94);stone.userData.bridgeMasonry=true;k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.21,bevelEnabled:false,curveSegments:40}),stone,0,0,-.105);
 const edge=glow(k,'#efc27d',1.05,.5,.45);
 for(const z of [-.108,.108]){for(const {x,r,spring}of arches)k.line(g,Array.from({length:41},(_,i)=>[x+r*Math.cos(i/40*Math.PI),spring+r*Math.sin(i/40*Math.PI),z]),.003,edge);for(const x of [-.24,.24])k.line(g,Array.from({length:40},(_,i)=>[x+.04*Math.sin(i/40*TAU),.166+.04*Math.cos(i/40*TAU),z]),.002,edge,true);}
 k.box(g,.66,.012,.29,p.stone,0,.293,0);k.box(g,.59,.125,.20,p.wood,0,.36,0);
 for(const side of [-1,1]){for(let i=0;i<9;i++){const x=-.29+i*.58/8;k.cyl(g,.004,.005,.13,p.red,x,.36,side*.132,8);lattice(k,g,x,.36,side*.102,.052,.089,p.pale);}balcony(k,g,0,side*.145,.66,.299,p.wood);}
 roof(k,g,.74,.34,.10,.428,p.tile,edge);
 k.box(g,.47,.083,.17,p.pale,0,.505,0);for(const z of [-.087,.087])for(const x of [-.17,0,.17])lattice(k,g,x,.51,z,.085,.045,p.wood);
 roof(k,g,.59,.27,.09,.55,p.tile,edge);plaque(k,g,'安顺廊桥',.17,.035,0,.512,.091);
 for(const x of [-.455,.455]){k.box(g,.23,.11,.22,p.wood,x,.314,0);for(const z of [-.113,.113]){for(let i=0;i<4;i++)k.cyl(g,.003,.004,.11,p.red,x-.095+i*.19/3,.314,z,8);balcony(k,g,x,z,.23,.265,p.pale);}roof(k,g,.29,.29,.092,.377,p.tile,edge,x,0);}
 for(const x of [-.61,.61]){k.box(g,.11,.02,.34,p.stone,x,.03,0);steps(k,g,p,x,.21,.12,8,.21,.15);}
 return finish(k,g,{lamps:[[-.61,-.20],[.61,-.20],[-.61,.20],[.61,.20]]});
}
