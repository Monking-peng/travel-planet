import * as THREE from 'three';
import {palette,site,siteHeight,lake,raft,finish,noise,TAU} from './guilin-kit.js';
export const XINGPING_PEAKS=[[-.50,-.23,.43,.14,.16,1],[-.31,-.29,.62,.18,.17,3],[-.06,-.27,.79,.20,.19,6],[.24,-.28,.65,.18,.17,4],[.49,-.19,.46,.14,.16,7],[-.57,.07,.28,.12,.13,8],[.57,.08,.25,.10,.11,9]];
export function xingpingShore(x){return .048+.038*Math.sin(x*7)+.020*Math.sin(x*19+.4);}
function cliff(k,g,[x,z,h,rx,rz,seed]){
 const N=80,M=64,ps=[],ix=[],cs=[];
 for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){
  const t=j/M,a=i/N*TAU,r=Math.pow(Math.max(.000001,Math.cos(t*Math.PI/2)),.26+.025*(seed%4)),ribs=1+.095*Math.sin(a*5+seed)+.060*Math.sin(a*9+t*2.3)+.025*Math.sin(a*23+t*4),lift=Math.sin(t*Math.PI/2),xx=x+Math.sin(a)*rx*r*ribs+.065*Math.sin(seed)*lift*lift,zz=z+Math.cos(a)*rz*r*ribs+.042*Math.cos(seed)*lift*lift,yy=siteHeight(xx,zz,.79,.65)+.012+h*t+.004*Math.sin(a*8+seed)*Math.sin(t*Math.PI);
  ps.push(xx,yy,zz);
 }
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(ix);geo.computeVertexNormals();const normal=geo.attributes.normal;
 for(let n=0;n<ps.length/3;n++){const xx=ps[n*3],yy=ps[n*3+1],zz=ps[n*3+2],ny=normal.getY(n),broad=noise(xx*27+seed,yy*11,zz*27),fine=noise(xx*180,yy*130+seed,zz*180),seam=noise(xx*65,yy*6,zz*65),green=Math.max(THREE.MathUtils.smoothstep(ny,.1,.7),THREE.MathUtils.smoothstep(broad,.39,.62)*.93),stone=new THREE.Color('#92998b').lerp(new THREE.Color('#b4b3a3'),fine*.42).multiplyScalar(.76+.25*seam),leaf=new THREE.Color('#345438').lerp(new THREE.Color('#627e4a'),fine);stone.lerp(leaf,green);cs.push(stone.r,stone.g,stone.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));const mat=k.mat('#ffffff',.99);mat.vertexColors=true;mat.userData.landscape=true;mat.userData.xingpingCliff=true;mat.onBeforeCompile=s=>{s.vertexShader='varying vec3 vCliff;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCliff=position;');s.fragmentShader='varying vec3 vCliff;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grain=fract(sin(dot(floor(vCliff*1800.),vec3(127.1,311.7,74.7)))*43758.5453);float seam=pow(.5+.5*sin(vCliff.x*210.+sin(vCliff.y*18.)*.7+vCliff.z*113.),12.);diffuseColor.rgb*=.89+grain*.17-seam*.10;`);};mat.customProgramCacheKey=()=> 'xingping-cliff-v1';k.mesh(g,geo,mat);
}
export function xingping(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);lake(k,g,p,.75,.59);
 const bank=k.mat('#7a8b62',1);bank.userData.landscape=true;bank.userData.xingpingBank=true;const sand=k.mat('#a8a58b',1);sand.userData.landscape=true;const leaves=['#43653c','#557843','#627e4a'].map(c=>{const m=k.mat(c,1);m.userData.landscape=true;return m;});const stem=k.mat('#65784d',1);stem.userData.landscape=true;
 const ps=[],ix=[],N=120,M=28;for(let i=0;i<=N;i++){const x=-.75+1.50*i/N,edge=.59*Math.sqrt(Math.max(0,1-(x/.75)**2)),back=-edge,front=Math.min(edge*.95,Math.max(-edge*.95,xingpingShore(x)));for(let j=0;j<=M;j++){const t=j/M,z=back+(front-back)*t;ps.push(x,siteHeight(x,z,.79,.65)+.014+.009*Math.sin(Math.PI*t),z);}}
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;ix.push(a,a+1,b,a+1,b+1,b);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(ix);geo.computeVertexNormals();k.mesh(g,geo,bank);
 const shore=[],si=[];for(let i=0;i<=N;i++){const x=-.75+1.50*i/N,edge=.59*Math.sqrt(Math.max(0,1-(x/.75)**2)),z=Math.min(edge*.95,Math.max(-edge*.95,xingpingShore(x)));for(const dd of [0,.022]){const d=Math.min(dd,edge-z);shore.push(x,siteHeight(x,z+d,.79,.65)+.014-d*.12,z+d);};}for(let i=0;i<N;i++){const a=i*2;si.push(a,a+1,a+2,a+1,a+3,a+2);}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(shore,3));sg.setIndex(si);sg.computeVertexNormals();k.mesh(g,sg,sand);
 for(const form of XINGPING_PEAKS)cliff(k,g,form);
 // The riverside vegetation follows one real bank, instead of a line of loose display rocks.
 for(let i=0;i<19;i++){
  const x=-.62+i*.068+.009*Math.sin(i*3.4),z=xingpingShore(x)-.024-.016*Math.sin(i*2.1),base=siteHeight(x,z,.79,.65)+.016;
  for(let j=0;j<7;j++){const a=j*2.4,xx=x+Math.cos(a)*.018,zz=z+Math.sin(a)*.024,h=.033+.036*(.5+.5*Math.sin(i*4.1+j*.8));k.beam(g,[xx,base,zz],[xx+.006*Math.cos(a),base+h,zz],.0013,stem);
   for(let l=0;l<3;l++){const head=k.ball(g,.013,leaves[(i+j+l)%3],xx+.008*Math.cos(a+l*2),base+h*(.52+l*.18),zz+.009*Math.sin(a+l*2));head.scale.set(1.2,.78,1.35);head.rotation.y=a;}}
 }

 raft(k,g,p,-.18,.28,-.4);raft(k,g,p,.28,.33,.55);
 return finish(k,g);
}
