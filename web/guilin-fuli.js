import * as THREE from 'three';
import {palette,site,siteHeight,lake,raft,finish,TAU} from './guilin-kit.js';
export const FULI_HALF=.65,FULI_STEPS=38;
export function fuliDeckHeight(x){const t=Math.min(1,Math.abs(x)/FULI_HALF),step=Math.floor(t*FULI_STEPS);return .043+.369*(1-(Math.min(FULI_STEPS,step)/FULI_STEPS)**1.35);}
export function fuliBankHeight(x,z){const radial=Math.hypot(x/.77,z/.64),fade=1-THREE.MathUtils.smoothstep(radial,.87,1),base=siteHeight(x,z,.79,.65);return base+.002+(.043-base)*fade;}
function stoneMaterial(k){
 const m=k.mat('#a1a396',.98);m.userData.fuliStone=true;m.userData.landscape=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vFuli;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFuli=position;');s.fragmentShader='varying vec3 vFuli;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float row=floor(vFuli.y*41.);vec2 cell=vec2(vFuli.x*24.+mod(row,2.)*.48,vFuli.y*41.);vec2 edge=abs(fract(cell)-.5);float joint=step(.465,max(edge.x,edge.y));float seed=fract(sin(dot(floor(cell),vec2(12.9898,78.233)))*43758.5453);float grain=fract(sin(dot(floor(vFuli*1700.),vec3(37.1,91.7,13.7)))*43758.5453);float face=smoothstep(.085,.098,abs(vFuli.z));diffuseColor.rgb*=mix(.83+grain*.22,(.78+seed*.30)*(1.-joint*.28),face);float moss=smoothstep(.48,.90,sin(vFuli.x*27.+vFuli.y*39.)*.5+.5)*.18;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.61,.78,.43),moss);`);};m.customProgramCacheKey=()=> 'fuli-weathered-stone-v1';return m;
}
function banyan(k,g,p,x,z,side,size){
 const y=fuliBankHeight(x,z),trunk=k.mat('#6b6350',1);trunk.userData.landscape=true;
 const base=[x,y,z],fork=[x+side*.018,y+size*.70,z-.012];k.beam(g,base,fork,.014,trunk,8);
 for(let i=0;i<7;i++){const a=i*2.399963,h=.63+.18*Math.sin(i*3),tip=[x+Math.cos(a)*size*.60,y+size*h,z+Math.sin(a)*size*.47];k.beam(g,fork,tip,.006,trunk,6);const leaf=k.mat(['#486b43','#57794a','#648052'][i%3],.99);leaf.userData.landscape=true;for(let j=0;j<5;j++){const aa=j*2.399+i,pos=[tip[0]+Math.cos(aa)*size*.20,tip[1]+Math.sin(j)*size*.08,tip[2]+Math.sin(aa)*size*.15],o=k.mesh(g,new THREE.IcosahedronGeometry(size*.25,1),leaf,...pos);o.scale.set(1.25,.58,1);o.rotation.y=a;}}
 for(let i=0;i<6;i++){const a=i/6*TAU;k.beam(g,[x+Math.cos(a)*.045,y-.005,z+Math.sin(a)*.038],[x,y+.045,z],.004,trunk,6);}
}
export function fuli(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);lake(k,g,p,.74,.58);
 const stone=stoneMaterial(k),deck=k.mat('#a9ab9b',.99);deck.userData.fuliDeck=true;deck.userData.landscape=true;const dark=k.mat('#787f70',.99);dark.userData.landscape=true;
 // Step-shaped exterior surrounds a complete elliptical passage, not a floating arch strip.
 const shape=new THREE.Shape();shape.moveTo(-.65,.025);shape.lineTo(-.31,.025);shape.lineTo(-.31,.045);
 for(let i=0;i<=72;i++){const a=Math.PI-i/72*Math.PI;shape.lineTo(Math.cos(a)*.31,.045+Math.sin(a)*.30);}
 shape.lineTo(.31,.025);shape.lineTo(.65,.025);shape.lineTo(.65,fuliDeckHeight(.65));
 const w=FULI_HALF/FULI_STEPS;
 for(let i=FULI_STEPS-1;i>=0;i--){const x0=i*w,x1=(i+1)*w,y=fuliDeckHeight((x0+x1)/2);shape.lineTo(x1,y-.006);shape.lineTo(x0,y-.006);}
 for(let i=0;i<FULI_STEPS;i++){const x0=-i*w,x1=-(i+1)*w,y=fuliDeckHeight((x0+x1)/2);shape.lineTo(x0,y-.006);shape.lineTo(x1,y-.006);}shape.closePath();
 k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.21,bevelEnabled:false,curveSegments:72}),stone,0,0,-.105);
 for(const side of [-1,1])for(let i=0;i<FULI_STEPS;i++){
  const x=side*(i+.5)*w,y=fuliDeckHeight(x);k.box(g,w+.0006,.008,.214,deck,x,y-.004,0);
  for(const z of [-.117,.117]){k.box(g,w+.0005,.032,.024,stone,x,y+.016,z);if(i%2===0)k.box(g,w+.0005,.004,.027,deck,x,y+.034,z);}
 }
 // Individually shaped voussoirs run around both faces and continue into the soffit.
 const ringMaterials=['#898f83','#989b8c','#aaa99b','#929789'].map(c=>{const m=k.mat(c,.99);m.userData.landscape=true;return m;});
 for(let i=0;i<40;i++){
  const a=i/40*Math.PI+.0018,b=(i+1)/40*Math.PI-.0018,outer=.337,inner=.310;
  for(const side of [-1,1]){const s=new THREE.Shape();s.moveTo(Math.cos(a)*inner,.045+Math.sin(a)*.30);s.lineTo(Math.cos(a)*outer,.045+Math.sin(a)*.326);s.lineTo(Math.cos(b)*outer,.045+Math.sin(b)*.326);s.lineTo(Math.cos(b)*inner,.045+Math.sin(b)*.30);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.004,bevelEnabled:false}),ringMaterials[i%4],0,0,side>0?.106:-.110);}
  const mid=(a+b)/2;k.beam(g,[Math.cos(mid)*.309,.045+Math.sin(mid)*.299,-.103],[Math.cos(mid)*.309,.045+Math.sin(mid)*.299,.103],.0007,dark,4);
 }
 // River banks taper into the globe. Trees stand on dry banks rather than in the water.
 const bank=k.mat('#7c8d62',1);bank.userData.landscape=true;bank.userData.fuliBank=true;
 for(const side of [-1,1]){
  const pos=[],ix=[],N=60,M=60;
  for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){const z=-.60+j/M*1.20,outer=.77*Math.sqrt(Math.max(0,1-(z/.64)**2)),inner=Math.min(.39+.035*Math.sin(z*12+side),outer*.93),x=side*(inner+(outer-inner)*i/N);pos.push(x,fuliBankHeight(x,z),z);}
  for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,b,a+1,a+1,b,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(side>0?ix:ix.flatMap((_,i,a)=>i%3?[]:[a[i],a[i+2],a[i+1]]));geo.computeVertexNormals();k.mesh(g,geo,bank);
  const av=[],ai=[];for(let i=0;i<=24;i++)for(let j=0;j<=12;j++){const z=-.107+j/12*.214,x=side*(.643+i/24*.074);av.push(x,fuliBankHeight(x,z)+.003,z);}for(let i=0;i<24;i++)for(let j=0;j<12;j++){const a=i*13+j;ai.push(a,a+1,a+13,a+1,a+14,a+13);}const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(av,3));ag.setIndex(side>0?ai:ai.flatMap((_,i,a)=>i%3?[]:[a[i],a[i+2],a[i+1]]));ag.computeVertexNormals();k.mesh(g,ag,deck);
  banyan(k,g,p,side*.51,side>0?-.23:.22,side,.34);
  for(let i=0;i<13;i++){const z=-.37+i*.058,x=side*(.39+.035*Math.sin(z*12+side)),y=fuliBankHeight(x,z)-.009,o=k.mesh(g,new THREE.DodecahedronGeometry(.022,0),ringMaterials[i%4],x,y,z);o.scale.set(.8,.65,1.4);}
 }
 raft(k,g,p,-.10,.31,1.45);raft(k,g,p,.17,-.27,1.30);
 return finish(k,g,{visitors:[[-.14,fuliDeckHeight(-.14)+.001,0],[.05,fuliDeckHeight(.05)+.001,.025]]});
}
