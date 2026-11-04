import * as THREE from 'three';
import {palette,site,skin,disc,band,palms,lit,finish,TAU} from './sanya-kit.js';

function facadeLight(k,index){
 const m=lit(k,'#ccd1c8',2.8,null,'#d7e3ef'),time={value:0};m.userData.facadeTime=time;m.userData.phoenixLight=index;
 m.onBeforeCompile=s=>{s.uniforms.phoenixTime=time;s.vertexShader='attribute vec2 facadeUV; varying vec2 vFacadeUV;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFacadeUV=facadeUV;');
 s.fragmentShader='varying vec2 vFacadeUV; uniform float phoenixTime;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 float wave=sin(vFacadeUV.y*12.-phoenixTime*.56+sin(vFacadeUV.x*12.+phoenixTime*.13)*1.8+${(index*.43).toFixed(2)});
 float beam=smoothstep(-.36,.66,wave);float hue=.5+.5*sin(phoenixTime*.17+vFacadeUV.y*4.+${index.toFixed(1)});
 totalEmissiveRadiance*=mix(vec3(1.,.76,.52),vec3(.72,.83,1.),hue)*(.06+.94*beam);
 `);};m.customProgramCacheKey=()=>`phoenix-horizontal-light-${index}`;return m;
}
function addFacadeUV(mesh,columns,rows,height){
 const uv=[];for(let r=0;r<=rows;r++)for(let c=0;c<=columns;c++)uv.push(c/columns,height);
 mesh.geometry.setAttribute('facadeUV',new THREE.Float32BufferAttribute(uv,2));
}
function tower(k,g,p,index,x,z,angle){
 const t=new THREE.Group();t.position.set(x,.034,z);t.rotation.y=angle;g.add(t);
 const H=.72+.021*Math.sin(index*1.7),W=.140,D=.067,levels=34;
 const glass=k.mat('#354d53',.50,.19);glass.userData.phoenixTower=index;glass.userData.night={color:new THREE.Color('#557883'),intensity:.035};
 const frame=k.mat('#53656a',.76,.16),slab=k.mat('#c8cfc6',.82,.12),lights=facadeLight(k,index),lobby=lit(k,'#526969',.35,null,'#e7c28a');
 const width=t=>t<.71?.77+.23*Math.sin(t/.71*Math.PI/2):.08+.92*Math.cos((t-.71)/.29*Math.PI/2);
 const point=(a,f,offset=0,y=f*H)=>{const q=width(f);return [Math.cos(a)*(W*q+offset)+.013*Math.sin(Math.PI*f),y,Math.sin(a)*(D*(.84+.16*Math.sin(Math.PI*f))*q+offset)];};
 for(let floor=0;floor<levels;floor++){
  const a=floor/levels,b=(floor+1)/levels,upper=floor>=24;
  skin(k,t,(u,v)=>point(u*TAU,upper?a:a+(b-a)*v,-.002,a*H+(b-a)*H*v),1,80,glass);
  // Upper floors end in separate terraces instead of a smooth bullet-shaped cap.
  skin(k,t,(u,v)=>{const outside=point(u*TAU,a,.004),inside=point(u*TAU,a,-.004);return [inside[0]+v*(outside[0]-inside[0]),a*H+.002,inside[2]+v*(outside[2]-inside[2])];},1,80,slab);
  const rim=skin(k,t,(u,v)=>point(u*TAU,a,.004,a*H+.001+v*.0035),1,96,lights);addFacadeUV(rim,96,1,a);
  if(upper){skin(k,t,(u,v)=>{const outer=point(u*TAU,a,-.002),inner=point(u*TAU,b,-.002);return [inner[0]+v*(outer[0]-inner[0]),b*H,inner[2]+v*(outer[2]-inner[2])];},1,80,slab);}
  for(let j=0;j<32;j++){const angle=j/32*TAU;const p0=point(angle,a,-.0004),p1=point(angle,upper?a:b,-.0004,b*H);k.beam(t,p0,p1,.0007,frame,4);}
 }
 const crown=point(0,1);disc(k,t,W*.08,D*.08,H,slab,crown[0]-W*.08,0);
 for(const side of [-1,1]){
  const a=side<0?Math.PI:0;
  skin(k,t,(u,v)=>point(a+(u-.5)*.20,v,.008),56,6,p.white);
  for(const edge of [-1,1])k.line(t,Array.from({length:45},(_,j)=>point(a+edge*.10,j/44,.010)),.0015,slab);
 }
 // Low curved entrance halls and projecting canopies tie each tower to the island.
 skin(k,t,(u,v)=>[Math.cos(u*TAU)*.130,.010+v*.044,Math.sin(u*TAU)*.082+.007],1,64,lobby);
 disc(k,t,.141,.090,.057,p.white,0,.007);
 for(let j=0;j<24;j++){const a=j/24*TAU;k.beam(t,[Math.cos(a)*.130,.011,Math.sin(a)*.082+.007],[Math.cos(a)*.130,.054,Math.sin(a)*.082+.007],.0015,slab);}
 for(const side of [-1,1]){const e=new THREE.Group();e.position.set(0,0,side*.088);t.add(e);k.box(e,.065,.004,.052,p.white,0,.044,0);for(const x of [-.026,.026])k.cyl(e,.0018,.002,.041,slab,x,.023,side*.017,8);}
}
export function phoenix(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p,{sea:true});
 // An actual wall below the island edge avoids a floating paper-thin platform.
 skin(k,g,(u,v)=>[Math.cos(u*TAU)*.712,.009+v*.025,Math.sin(u*TAU)*.310],1,128,p.stone);
 disc(k,g,.712,.310,.034,p.paving);band(k,g,a=>[Math.cos(a)*.712,.035,Math.sin(a)*.310],p.white,.002);
 const path=k.mat('#a6aa9a',.99);path.userData.landscape=true;
 skin(k,g,(u,v)=>[Math.cos(u*TAU)*(.675-v*.026),.0355,Math.sin(u*TAU)*(.269-v*.026)],1,128,path);
 const layouts=[[-.55,-.005,.08],[-.285,-.026,1.05],[-.025,.010,1.26],[.24,-.018,.10],[.55,-.005,-.09]];
 layouts.forEach(([x,z,a],i)=>tower(k,g,p,i,x,z,a));
 for(const z of [-.221,.221])palms(k,g,p,()=>.035,Array.from({length:6},(_,i)=>[(i-2.5)*.20,z,.088+(i%2)*.014]));
 for(const [x,z,rx,rz]of [[-.38,.13,.07,.035],[.12,.16,.08,.034],[.42,.14,.06,.028]])disc(k,g,rx,rz,.036,p.leaf,x,z);
 return finish(k,g,{lamps:[[-.60,.036,.17],[-.3,.036,.23],[0,.036,.25],[.3,.036,.23],[.60,.036,.17]],visitors:[[-.1,.036,.21],[.12,.036,.22]]});
}
