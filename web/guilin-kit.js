import * as THREE from 'three';
import {skin} from './chongqing-kit.js';
import {siteHeight} from './chengdu-kit.js';
export {site,siteHeight,disc,paving,steps,grove,bamboo,sign} from './chengdu-kit.js';
export {finish,polygonRoof} from './suzhou-kit.js';
export {roof,story,lantern,wallPattern} from './dali-kit.js';
export {railing} from './xiamen-kit.js';
export {archOpening,lit} from './tianjin-kit.js';
export {skin};
export const TAU=Math.PI*2;
export function palette(k){return {stone:k.mat('#979d90',.98),pale:k.mat('#d4d2bd',.93),yellow:k.mat('#d1b763',.93),wall:k.mat('#ded9c5',.96),wood:k.mat('#493b30',.95),red:k.mat('#6b372f',.94),tile:k.mat('#515856',.93),gold:k.mat('#b99b61',.62,.18),blue:k.mat('#536d65',.86),leaf:k.mat('#446b49',.99),water:k.mat('#4f8881',.52,.05)};}
export function lake(k,g,p,rx=.73,rz=.55){p.water.userData.landscape=true;p.water.userData.water=true;const pos=[],idx=[],N=128,R=32;for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const a=i/N*TAU,x=Math.sin(a)*rx*j/R,z=Math.cos(a)*rz*j/R;pos.push(x,siteHeight(x,z,.79,.65)+.010,z);}for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)idx.push(a,b,a+1);idx.push(a+1,b,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return k.mesh(g,geo,p.water);}
function natureMaterial(k,id){const m=k.mat('#ffffff',.99,.01);m.vertexColors=true;m.userData.landscape=true;m.userData.naturalFeature=id;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vLimestone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLimestone=position;');s.fragmentShader='varying vec3 vLimestone;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 cell=floor(vLimestone*680.);float grain=fract(sin(dot(cell,vec3(127.1,311.7,74.7)))*43758.5453);diffuseColor.rgb*=.88+grain*.24;`);};m.customProgramCacheKey=()=> 'guilin-limestone-grain';return m;}
export function noise(x,y,z){
 const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),f=[x-ix,y-iy,z-iz].map(t=>t*t*(3-2*t));
 const hash=(a,b,c)=>{const h=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return h-Math.floor(h);};let v=0;
 for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)v+=hash(ix+a,iy+b,iz+c)*(a?f[0]:1-f[0])*(b?f[1]:1-f[1])*(c?f[2]:1-f[2]);return v;
}
function vertexColor(x,y,z,ny,seed){
 const broad=noise(x*17+seed,y*11,z*17),fine=noise(x*94,y*82+seed,z*93),weather=noise(x*67,y*5,z*61);
 const stone=new THREE.Color('#898f82').lerp(new THREE.Color('#b5b2a4'),broad*.55+fine*.20).multiplyScalar(.82+.18*weather);
 const greenery=THREE.MathUtils.smoothstep(ny,.23,.70)*.9+THREE.MathUtils.smoothstep(broad,.37,.72)*.91;
 return stone.lerp(new THREE.Color('#426642').lerp(new THREE.Color('#71905e'),fine),Math.min(1,greenery));
}
// A sampled solid lets the limestone tunnel remain open through the entire hill.
export function karstSolid(k,g,field,{id='rock',bounds=[[-.7,.7],[-.025,.95],[-.36,.36]],resolution=[54,44,28],x=0,y=.03,z=0}={}){
 const [NX,NY,NZ]=resolution,points=[],values=[],positions=[],normals=[],colors=[],index=(i,j,l)=>(j*(NZ+1)+l)*(NX+1)+i;
 for(let j=0;j<=NY;j++)for(let l=0;l<=NZ;l++)for(let i=0;i<=NX;i++){const q=[bounds[0][0]+(bounds[0][1]-bounds[0][0])*i/NX,bounds[1][0]+(bounds[1][1]-bounds[1][0])*j/NY,bounds[2][0]+(bounds[2][1]-bounds[2][0])*l/NZ];points.push(q);values.push(field(...q));}
 const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
 const grad=q=>{const e=.0006;return new THREE.Vector3(field(q[0]+e,q[1],q[2])-field(q[0]-e,q[1],q[2]),field(q[0],q[1]+e,q[2])-field(q[0],q[1]-e,q[2]),field(q[0],q[1],q[2]+e)-field(q[0],q[1],q[2]-e)).normalize();};
 const emit=(a,b,c)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),cv=new THREE.Vector3(...c);if(bv.sub(av).cross(cv.sub(av)).dot(grad(a))<0)[b,c]=[c,b];for(const q of [a,b,c]){const n=grad(q),color=vertexColor(...q,n.y,2);positions.push(...q);normals.push(...n);colors.push(color.r,color.g,color.b);}};
 for(let j=0;j<NY;j++)for(let l=0;l<NZ;l++)for(let i=0;i<NX;i++){
  const cube=[index(i,j,l),index(i+1,j,l),index(i+1,j+1,l),index(i,j+1,l),index(i,j,l+1),index(i+1,j,l+1),index(i+1,j+1,l+1),index(i,j+1,l+1)];
  for(const t of tetra){const cut=[];for(const [a,b]of pairs){const ia=cube[t[a]],ib=cube[t[b]],va=values[ia],vb=values[ib];if((va<0)===(vb<0))continue;const f=va/(va-vb);cut.push(points[ia].map((v,n)=>v+(points[ib][n]-v)*f));}if(cut.length===3)emit(...cut);else if(cut.length===4){const center=cut.reduce((v,q)=>v.add(new THREE.Vector3(...q)),new THREE.Vector3()).multiplyScalar(.25),normal=grad(cut[0]),u=new THREE.Vector3(...cut[0]).sub(center).normalize(),v=normal.clone().cross(u);cut.sort((a,b)=>{const aa=new THREE.Vector3(...a).sub(center),bb=new THREE.Vector3(...b).sub(center);return Math.atan2(aa.dot(v),aa.dot(u))-Math.atan2(bb.dot(v),bb.dot(u));});emit(cut[0],cut[1],cut[2]);emit(cut[0],cut[2],cut[3]);}}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return k.mesh(g,geo,natureMaterial(k,id),x,y,z);
}
export function peak(k,g,{x=0,z=0,y=.026,h=.6,rx=.18,rz=.16,seed=1,id='peak'}={}){
 const N=72,M=40,ps=[],ix=[];
 for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){const t=j/M,a=i/N*TAU,shape=Math.pow(Math.max(.000001,1-t),.55)*(1+.09*Math.sin(t*Math.PI)),flute=1+.075*Math.sin(a*7+seed)+.035*Math.sin(a*13+t*3)+.045*(noise(Math.sin(a)*4+seed,t*11,Math.cos(a)*4)-.5),top=Math.sin(t*Math.PI/2);ps.push(x+Math.sin(a)*rx*shape*flute+.070*Math.sin(seed)*top*top,y+h*t,z+Math.cos(a)*rz*shape*flute+.035*Math.cos(seed)*top*top);}
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(ix);geo.computeVertexNormals();const c=[],n=geo.attributes.normal,a=geo.attributes.position;for(let i=0;i<a.count;i++){const color=vertexColor(a.getX(i),a.getY(i),a.getZ(i),n.getY(i),seed);c.push(color.r,color.g,color.b);}geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return k.mesh(g,geo,natureMaterial(k,id));
}
export function raft(k,g,p,x,z,angle=0){const child=new THREE.Group();child.position.set(x,.032,z);child.rotation.y=angle;g.add(child);for(let i=0;i<7;i++){const beam=k.cyl(child,.005,.005,.17,p.gold,(i-3)*.009,0,0,7);beam.rotation.x=Math.PI/2;}for(const zz of [-.05,.05])k.box(child,.074,.004,.008,p.wood,0,.007,zz);const body=k.cyl(child,.004,.006,.021,p.red,0,.025,.04,6);k.ball(child,.005,p.pale,0,.041,.04);k.beam(child,[0,.038,.04],[.025,.008,.105],.0015,p.wood);const hat=k.cyl(child,0,.012,.007,p.gold,0,.046,.04,10);return child;}
