import * as THREE from 'three';
import {tree} from './wuhan-architecture.js';
export const hills=[[.78,.96,.50,.33,.13],[-1.10,.81,.54,.34,.14]];
export function terrainLift(x,z){return hills.reduce((h,[cx,cz,rx,rz,high])=>Math.max(h,high*Math.exp(-2*((x-cx)**2/rx**2+(z-cz)**2/rz**2))),0);}
export function landscapeDetails(k,g,{surface,anchor,riverX,landmarks}){
  const foliage=k.mat('#7a9b76',.98),paving=k.mat('#c5c3aa'),lamp=k.mat('#4b655f'),glow=k.mat('#e5d1a0',.6,0,'#ffd6a1');glow.userData.night.intensity=1.6;
  for(const [cx,cz,rx,rz] of hills){const v=[],ix=[],N=40;for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=cx+(i/N-.5)*rx*3,z=cz+(j/N-.5)*rz*3;v.push(...surface(x,z,terrainLift(x,z)+.003));}for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,a+1,b,a+1,b+1,b);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();k.mesh(g,geo,foliage);}
  const isClear=(x,z)=>Math.abs(x-riverX(z))>.34&&!(x<0&&Math.abs(z-(-.43+.30*(x+2.04)/2.04+.09*Math.sin((x+2.04)/2.04*Math.PI*2)))<.14)&&!landmarks.some(l=>(l.hemisphere||1)>0&&Math.hypot(x-l.x,z-l.z)<({bridge:.70,crane:.46,guishan:.23,guqintai:.53,university:1.13,qingchuan:.46,customs:.44,han:.38,greenland:.32,baotong:.46}[l.id]||.4));
  const woods=[[-.98,.99,.68,.42,120],[.94,1.30,.63,.38,95],[-1.55,.42,.40,.33,44],[1.64,-.64,.29,.53,46]];
  for(const [cx,cz,rx,rz,count] of woods)for(let i=0;i<count;i++){const a=i*2.399963,r=Math.sqrt((i+.5)/count),x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r;if(x*x+z*z>4.2||!isClear(x,z))continue;const t=new THREE.Group();tree(k,t,0,0,0,.056+(i%5)*.008);anchor(t,x,z,terrainLift(x,z)+.003);g.add(t);}
  for(const side of [-1,1])for(let j=0;j<29;j++){const z=-1.65+j*.118,x=riverX(z)+side*.29;if(side<0&&z>-.31&&z<-.06||z>.48&&z<.72)continue;const t=new THREE.Group();k.cyl(t,.002,.003,.057,lamp,0,.028,0,6);k.cyl(t,.008,.008,.004,glow,0,.058,0,10);anchor(t,x,z,.021);g.add(t);}
  // A few named waterfront public spaces and boats establish scale without filler buildings.
  for(const [x,z] of [[-.41,-.78],[.39,-1.12],[.44,1.32],[-.46,1.40]]){const t=new THREE.Group();k.cyl(t,.08,.087,.016,paving,0,-.004,0,24);for(const a of [-1,1]){k.box(t,.045,.007,.014,lamp,a*.042,.021);for(const zz of [-.005,.005])k.box(t,.003,.020,.003,lamp,a*.042,.009,zz);}anchor(t,x,z,.013);g.add(t);}
  const hull=k.mat('#5a7374'),white=k.mat('#eee6ce'),window=k.mat('#647e88',.4,.2,'#e3c88e');window.userData.night.intensity=.6;
  for(const z of [-1.60,-.57,1.27]){const boat=new THREE.Group();const b=k.cyl(boat,.045,.036,.019,hull,0,.011,0,8);b.scale.z=2.0;k.box(boat,.052,.024,.094,white,0,.033);k.box(boat,.054,.014,.061,window,0,.051);k.box(boat,.063,.004,.073,white,0,.061);anchor(boat,riverX(z)+.075,z,.027);g.add(boat);}
}
