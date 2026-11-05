import * as THREE from 'three';
import {palette,site,lit,finish,skin,sign,polygon,disc} from './hongkong-kit.js';

function mediaMaterial(k){
 const m=lit(k,'#33483e',1.4,null,'#d4e5de');m.userData.mplusScreen=true;
 m.onBeforeCompile=s=>{
  s.uniforms.hkTime=k.clock?.time||{value:0};
  s.vertexShader='varying vec3 vHKScreen;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHKScreen=position;');
  s.fragmentShader='uniform float hkTime;varying vec3 vHKScreen;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float wave=.5+.5*sin(vHKScreen.x*10.+vHKScreen.y*5.-hkTime*.38);
   float ribbon=exp(-pow((vHKScreen.y-.56-sin(vHKScreen.x*5.+hkTime*.25)*.13)/.09,2.));
   vec3 display=mix(vec3(.10,.40,.52),vec3(.85,.36,.22),wave);
   display=mix(display,vec3(.55,.76,.70),ribbon*.65);
   float pixels=.50+.50*step(.22,fract(vHKScreen.x*170.));totalEmissiveRadiance*=display*pixels*(.48+.52*ribbon);`);
 };m.customProgramCacheKey=()=> 'hongkong-mplus-embedded-led';return m;
}
function sill(k,g,x,y,z,w,d,m){k.box(g,w,.009,d,m,x,y,z);}
export function mplus(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p,.76,.64);
 const ground=(x,z)=>{const q=Math.hypot(x/.76,z/.64),t=THREE.MathUtils.smoothstep(q,.92,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .020*(1-t)-sag*t+.002;};
 const lawn=k.mat('#94a28a',.99),paving=k.mat('#999e99',.96);lawn.userData.landscape=true;paving.userData.landscape=true;
 disc(k,g,.76,.64,ground,lawn);disc(k,g,.64,.52,(x,z)=>ground(x,z)+.003,paving);
 const ceramic=k.mat('#34433d',.62,.12),tube=k.mat('#41554b',.48,.15),concrete=k.mat('#b2b5ad',.96),edge=k.mat('#d0d0c3',.92),glass=lit(k,'#435b5a',.10),metal=k.mat('#81918b',.57,.2),screen=mediaMaterial(k),warm=lit(k,'#dfcfb0',.45);
 ceramic.userData.mplusCeramic=true;glass.userData.mplusGlazing=true;
 const walk=k.mat('#a3aaa2',.97);walk.userData.mplusWalk=true;
 // Ground-level plaza, recessed glazing and columns remain visible below the cantilever.
 k.box(g,1.07,.021,.75,walk,0,.027,0);
 k.box(g,.78,.055,.41,glass,.025,.134,-.025);
 k.box(g,.80,.012,.43,walk,.025,.098,-.025);k.box(g,.18,.012,.164,walk,.342,.098,.265);
 for(const x of [-.37,-.18,.15,.37])k.box(g,.035,.116,.038,concrete,x,.104,.22);
 for(const x of [-.32,.30])k.box(g,.042,.115,.06,concrete,x,.104,-.24);
 for(let i=0;i<31;i++)k.box(g,.002,.055,.005,metal,-.35+i*.024,.134,.184);
 for(const x of [-.37,.42])for(let i=0;i<15;i++)k.box(g,.005,.055,.002,metal,x,.134,-.21+i*.027);
 // Broad gallery slab, ribbed with semi-cylindrical dark-green terracotta panels.
 k.box(g,1.02,.136,.69,ceramic,0,.235,0);
 for(let i=0;i<116;i++)for(const z of [-.351,.351]){
  const x=-.503+i*.00875;k.cyl(g,.0034,.0034,.136,tube,x,.235,z,8);
 }
 for(const x of [-.516,.516])for(let i=0;i<78;i++)k.cyl(g,.0034,.0034,.136,tube,x,.235,-.337+i*.00875,8);
 sill(k,g,0,.164,0,1.035,.708,ceramic);sill(k,g,0,.306,0,1.035,.708,metal);
 // The research tower has transparent slots between ceramic rails, not a solid screen pasted over it.
 k.box(g,.82,.505,.113,glass,0,.566,-.055);
 for(const z of [-.119,.009]){
  for(let j=0;j<49;j++)k.box(g,.833,.0041,.012,tube,0,.321+j*.0102,z);
  for(let i=0;i<26;i++)k.box(g,.0037,.507,.014,ceramic,-.407+i*.0326,.566,z);
 }
 for(const x of [-.414,.414]){k.box(g,.013,.51,.128,ceramic,x,.566,-.055);for(let j=0;j<49;j++)k.box(g,.017,.0041,.132,tube,x,.321+j*.0102,-.055);}
 sill(k,g,0,.823,-.055,.847,.134,ceramic);
 for(let j=0;j<48;j++)k.box(g,.814,.0023,.002,screen,0,.326+j*.0102,.0166);
 // Quiet interior bands are behind the louvers; the entire daytime facade remains dark green.
 for(const y of [.384,.456,.528,.600,.672,.744,.790])for(const x of [-.29,-.14,.03,.20])k.box(g,.105,.002,.002,warm,x,y,.002);
 // Side service pavilion uses the stepped concrete silhouette visible in the actual building.
 const side=new THREE.Group();g.add(side);side.position.set(-.447,0,-.17);
 polygon(k,side,[[-.083,.05,-.10],[.083,.05,-.10],[.083,.43,-.10],[-.083,.48,-.10]],concrete);
 polygon(k,side,[[-.083,.05,.10],[.083,.05,.10],[.083,.43,.10],[-.083,.48,.10]],concrete);
 polygon(k,side,[[-.083,.05,-.10],[-.083,.05,.10],[-.083,.48,.10],[-.083,.48,-.10]],concrete);
 polygon(k,side,[[.083,.05,-.10],[.083,.05,.10],[.083,.43,.10],[.083,.43,-.10]],concrete);
 polygon(k,side,[[-.083,.48,-.10],[.083,.43,-.10],[.083,.43,.10],[-.083,.48,.10]],edge);
 k.box(side,.090,.034,.003,glass,0,.38,.102);for(let i=0;i<10;i++)k.box(side,.002,.032,.004,metal,-.042+i*.0093,.38,.105);
 // Roof garden with planted strips, sheltered paths and a slender perimeter rail.
 const planting=k.mat('#6b7f5a',.98);planting.userData.landscape=true;
 k.box(g,.80,.008,.235,walk,.055,.315,.194);k.box(g,.785,.008,.158,walk,.04,.315,-.235);
 for(const z of [.125,.268,-.295])k.box(g,.75,.014,.026,planting,.05,.324,z);
 for(const z of [-.325,.325]){k.beam(g,[-.39,.347,z],[.49,.347,z],.0013,metal);for(let j=0;j<30;j++)k.box(g,.0014,.028,.0014,metal,-.39+j*.0303,.333,z);}
 // Side stair reaches the ground entrance; the diagonal sculpted ramp sits under the overhang.
 for(let i=0;i<8;i++){const top=.040+i*.009;k.box(g,.18,top-.017,.018,walk,.342,(top+.017)/2,.465-i*.017);}
 skin(k,g,(u,v)=>{const x=-.49+u*.39,z=.355-v*.17,y=.038+.066*u;return [x,y,z];},10,40,concrete);
 for(const z of [.355,.185])k.line(g,Array.from({length:41},(_,i)=>{const u=i/40;return [-.49+u*.39,.041+.066*u,z];}),.002,edge);
 k.box(g,.225,.052,.003,glass,.31,.243,.357);for(let i=0;i<16;i++)k.box(g,.0017,.052,.004,metal,.205+i*.014,.243,.360);
 sign(k,g,'M+',.11,.055,-.27,.136,.193,{background:'#34433d',color:'#e5e5d5'});
 // Solid low retaining edges meet the curved ground; only the entry paths project forward.
 for(const z of [-.375,.375])skin(k,g,(u,v)=>{const x=-.535+u*1.07;return [x,THREE.MathUtils.lerp(ground(x,z)+.003,.038,v),z];},6,80,concrete);
 for(const x of [-.535,.535])skin(k,g,(u,v)=>{const z=-.375+u*.75;return [x,THREE.MathUtils.lerp(ground(x,z)+.003,.038,v),z];},6,60,concrete);
 for(const [cx,w,z0,y0,shift]of [[.342,.20,.472,.032,-.055],[-.37,.24,.375,.038,.065]])skin(k,g,(u,v)=>{const x=cx+(u-.5)*w*(1-.25*v)+shift*v,z=z0+v*(.496-z0);return [x,THREE.MathUtils.lerp(y0,ground(x,z)+.003,v),z];},16,32,walk);
 return finish(k,g,{lamps:[[-.56,.023,.28],[.56,.023,.28]],visitors:[[-.24,.038,.40],[0,.038,.40],[.22,.038,.40]]});
}
