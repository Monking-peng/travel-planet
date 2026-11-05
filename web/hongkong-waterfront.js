import * as THREE from 'three';
import {TAU,palette,site,skin,windowGlass,lit,finish,disc,perimeter,sign} from './hongkong-kit.js';
import {palm} from './shenzhen-forms.js';

export {cec} from './hongkong-cec.js';

export function clock(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const cream=lit(k,'#c8c0a7',.16),brick=k.mat('#a86d51',.95),face=lit(k,'#dfddc8',.50),black=k.mat('#26383c',.65),roof=k.mat('#697d74',.78,.2);
 k.box(g,.28,.045,.28,p.pale,0,.04,-.10);k.box(g,.22,.75,.22,brick,0,.43,-.10);
 for(let j=0;j<28;j++){const y=.07+j*.026;for(const x of [-.093,.093])for(const z of [-.193,-.007])k.box(g,.042,.024,.043,cream,x,y,z);}
 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const f=new THREE.Group();g.add(f);f.position.z=-.10;f.rotation.y=a;
  for(const y of [.24,.41,.55]){k.box(f,.055,.09,.006,cream,0,y,.113);k.box(f,.040,.072,.003,black,0,y,.117);for(const yy of [-.018,.018])k.box(f,.04,.0015,.002,p.steel,0,y+yy,.120);}
  const rim=k.mesh(f,new THREE.TorusGeometry(.044,.003,6,48),cream,0,.69,.115);k.mesh(f,new THREE.CircleGeometry(.041,48),black,0,.69,.116);
  for(let i=0;i<12;i++){const angle=i/12*TAU,m=k.box(f,.0025,.009,.001,face,Math.sin(angle)*.033,.69+Math.cos(angle)*.033,.118);m.rotation.z=-angle;}
  k.beam(f,[0,.69,.12],[.022,.71,.12],.0018,face);k.beam(f,[0,.69,.12],[-.013,.714,.12],.002,face);k.ball(f,.003,face,0,.69,.12);
 }
 for(const [w,y]of [[.25,.80],[.275,.824],[.22,.843]])k.box(g,w,.015,w,cream,0,y,-.10);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.cyl(g,.012,.014,.12,cream,Math.cos(a)*.083,.911,-.10+Math.sin(a)*.083,8);}
 k.cyl(g,.09,.105,.036,brick,0,.993,-.10,8);k.cyl(g,.025,.115,.09,roof,0,1.053,-.10,8);k.cyl(g,.01,.018,.075,cream,0,1.128,-.10,8);k.ball(g,.017,roof,0,1.176,-.10);k.beam(g,[0,1.19,-.1],[0,1.22,-.1],.0019,p.gold);
 // The reflecting pool belongs to the clock-tower plaza, not to the harbour.
 const pool=k.mat('#608d8f',.52,.08);pool.userData.landscape=true;k.box(g,.17,.008,.48,p.pale,0,.024,.30);k.box(g,.145,.005,.45,pool,0,.029,.30);
 for(const x of [-.35,.35])for(const z of [-.24,.13,.38])palm(k,g,x,.018,z,.19);
 return finish(k,g,{lamps:[[-.15,.022,.38],[.15,.022,.38]],visitors:[[-.19,.021,.24],[.21,.021,.42],[.2,.021,.13]]});
}

export function mplus(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p,.76,.64);const ceramic=lit(k,'#3d4f4d',.05),glass=windowGlass(k,'#3e5357',65),ribs=k.mat('#65736e',.75),screen=lit(k,'#435b59',.80,1,'#90b8ce');screen.userData.mplusScreen=true;
 k.box(g,1.02,.028,.70,p.pale,0,.032,0);k.box(g,.91,.12,.56,ceramic,0,.14,0);k.box(g,.66,.055,.44,glass,0,.057,0);
 k.box(g,.71,.48,.092,glass,0,.448,-.015);k.box(g,.735,.018,.105,ceramic,0,.695,-.015);
 // Horizontal ceramic rails and deep vertical ribs retain the thin T profile.
 for(const s of [-1,1]){for(let j=0;j<25;j++)k.box(g,.72,.004,.009,ribs,0,.218+j*.019,s*.065-.015);for(let i=0;i<24;i++)k.box(g,.004,.48,.014,ceramic,-.35+i*.030,.448,s*.067-.015);}
 for(let i=0;i<82;i++)for(const z of [-.284,.284])k.box(g,.004,.12,.012,ribs,-.45+i*.011,.14,z);
 for(const x of [-.455,.455])for(let i=0;i<48;i++)k.box(g,.012,.12,.0035,ribs,x,.14,-.275+i*.0115);
 const panel=k.box(g,.69,.445,.002,screen,0,.45,.065);screen.onBeforeCompile=s=>{s.uniforms.hkTime=k.clock?.time||{value:0};s.vertexShader='varying vec3 vHKScreen;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHKScreen=position;');s.fragmentShader='uniform float hkTime;varying vec3 vHKScreen;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 float rows=step(.34,fract(vHKScreen.y*180.));float wave=.5+.5*sin(vHKScreen.x*17.+vHKScreen.y*11.-hkTime*.45);vec3 display=mix(vec3(.22,.42,.55),vec3(.7,.44,.42),wave);totalEmissiveRadiance*=display*rows;`);};screen.customProgramCacheKey=()=> 'hongkong-mplus-display';
 sign(k,g,'M+',.17,.085,.22,.13,.294,{background:'#3d4f4d',color:'#e5e5d5'});
 const roofGarden=k.mat('#6b8468',.99);roofGarden.userData.landscape=true;k.box(g,.85,.009,.38,roofGarden,0,.206,.05);
 return finish(k,g,{lamps:[[-.52,.023,.37],[.52,.023,.37]],visitors:[[-.24,.022,.42],[0,.022,.42],[.19,.022,.42]]});
}
