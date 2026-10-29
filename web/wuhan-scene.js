import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {LANDMARKS,createLandmark} from './wuhan-landmarks.js';
import {surfaceDetail,addRiverReflections,buildingIllumination} from './wuhan-atmosphere.js';
import {addDistricts} from './wuhan-districts.js';
import {landscapeDetails} from './wuhan-landscape.js';

export const RADIUS=2.15;
export const riverX=z=>-.05+.14*Math.sin(z*1.65);
export const surface=(x,z,lift=0,side=1)=>new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);
export function anchor(object,x,z,lift=0,side=1){const n=surface(x,z,0,side).normalize();object.position.copy(n).multiplyScalar(RADIUS+lift);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);return object;}

export function createWuhanScene(){
  const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landscape=new THREE.Group(),landmarks=new Map(),modules=new Map();root.add(landscape);
  const ground=k.mat('#8a9c7c',.97,0),water=k.mat('#437981',.67,.06),paving=k.mat('#d4cfb9',.9);
  surfaceDetail(ground,clock);surfaceDetail(water,clock,true);
  const terrain=new THREE.SphereGeometry(RADIUS,160,128),colors=[];for(let i=0;i<terrain.attributes.position.count;i++){const x=terrain.attributes.position.getX(i),z=terrain.attributes.position.getZ(i),a=.5+.5*Math.sin(x*4+Math.cos(z*3));colors.push(.78+.20*a,.83+.15*a,.73+.24*a);}terrain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));ground.vertexColors=true;k.mesh(landscape,terrain,ground);
  function strip(points,width,mat,lift=.012,side=1){const v=[],idx=[];points.forEach(([x,z],i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;for(const s of [-1,1])v.push(...surface(x+s*dz/l*width/2,z-s*dx/l*width/2,lift,side));if(i){const n=i*2;idx.push(n-2,n,n-1,n-1,n,n+1);}});const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=k.mesh(landscape,geo,mat);if(mat===water)mesh.userData.water=true;return mesh;}
  // The Yangtze follows one continuous arc. The Han terminates at the confluence.
  function river(width,mat,lift){const v=[],idx=[];for(let i=0;i<=240;i++){const t=i/240,theta=-1.48+t*3.1,x=riverX(RADIUS*Math.sin(theta)),taper=Math.sin(Math.min(1,Math.min(t,1-t)/.045)*Math.PI/2);for(const s of [-1,1]){const xx=x+s*width/2*taper,rr=Math.sqrt((RADIUS+lift)**2-xx*xx);v.push(xx,rr*Math.cos(theta),rr*Math.sin(theta));}if(i){const n=i*2;idx.push(n-2,n,n-1,n-1,n,n+1);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=k.mesh(landscape,geo,mat);if(mat===water)mesh.userData.water=true;}
  river(.49,paving,.009);river(.43,water,.027);
  const han=Array.from({length:101},(_,i)=>{const t=i/100;return [-2.04+2.04*t,-.43+.30*t+.09*Math.sin(t*Math.PI*2)];});strip(han,.19,paving,.010);strip(han,.145,water,.020);
  for(const sign of [-1,1]){let pts=[];for(let i=0;i<130;i++){const z=-1.85+i/129*3.7;if(sign<0&&z>-.32&&z<-.04){if(pts.length>1)strip(pts,.036,paving,.018);pts=[];continue;}pts.push([riverX(z)+sign*.29,z]);}if(pts.length>1)strip(pts,.036,paving,.018);}
  addDistricts(k,landscape,{surface,anchor,riverX,landmarks:LANDMARKS});
  landscapeDetails(k,landscape,{surface,anchor,riverX,landmarks:LANDMARKS});
  for(const item of LANDMARKS){const model=createLandmark(k,item.id);buildingIllumination(k,model,item.id);anchor(model,item.x,item.z,item.lift||.014,item.hemisphere||1);model.rotateY(item.rotation||0);model.traverse(o=>{if(o.isMesh)o.userData.landmark=item.id;});root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);}
  addRiverReflections(k,modules,{surface,riverX,clock});
  const waterRoot=new THREE.Group();waterRoot.name='wuhan-rivers';landscape.children.filter(o=>o.userData.water).forEach(o=>waterRoot.add(o));root.add(waterRoot);k.merge(landscape);
  let night=false;
  function setNight(value){night=Boolean(value);clock.night.value=night?1:0;for(const m of k.materials){const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.userData.nightOnly)o.visible=night;if(o.isLight)o.intensity=night?o.userData.nightIntensity||0:0;}));ground.color.set(night?'#344e4f':'#8a9c7c');water.color.set(night?'#123044':'#437981');}
  function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.72+.28*Math.sin(time*p.speed+p.phase)):0;}}
  function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
  function dispose(){const geos=new Set(),mats=new Set(k.materials);const collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());const textures=new Set();mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
  setNight(false);return {root,landmarks,setNight,update,dispose,setLandmarkEnabled};
}
