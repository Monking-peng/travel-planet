import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {surfaceDetail} from './wuhan-atmosphere.js';
import {LANDMARKS,createLandmark} from './nanjing-landmarks.js';
export const RADIUS=2.15;
export function surface(x,z,lift=0,side=1){return new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);}
export function createNanjingScene(){
 const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map();
 const ground=k.mat('#8c9e8d',.99),terrain=k.mesh(root,new THREE.SphereGeometry(RADIUS,176,144),ground);terrain.name='nanjing-terrain';terrain.receiveShadow=true;surfaceDetail(ground,clock);
 for(const item of LANDMARKS){
  const model=createLandmark(k,item.id);model.name=item.id;
  model.traverse(o=>{if(!o.isMesh)return;o.userData.landmark=item.id;o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.30;
   if(o.material.userData.landscape)o.material.userData.dayColor=o.material.color.clone();
   if(!o.material.userData.night&&!o.material.userData.landscape)o.material.userData.night={color:o.material.color.clone(),intensity:.065};
  });
  const light=new THREE.PointLight('#ffdda9',0,1.4,2);light.position.set(.15,.35,.37);light.userData.nightIntensity=.040;model.add(light);
  const n=surface(item.x,item.z,0,item.hemisphere||1).normalize();model.position.copy(n).multiplyScalar(RADIUS+.007);model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);model.rotateY(item.rotation||0);root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);
 }
 // A continuous waterway separates the landmark districts without cut-off ends.
 const water=k.mat('#5a8580',.32,.17);water.userData.dayColor=water.color.clone();water.userData.landscape=true;water.side=THREE.DoubleSide;
 const ribbon=(branch)=>{const v=[],idx=[],N=240;for(let j=0;j<=N;j++)for(const edge of [-1,1]){const t=j/N*Math.PI*(branch?1:2);let p;if(branch){p=new THREE.Vector3(.17*Math.sin(t*2)+edge*.12,RADIUS*Math.cos(t),-RADIUS*Math.sin(t));}else{p=new THREE.Vector3(RADIUS*Math.sin(t),RADIUS*Math.cos(t),.11*Math.sin(t*2)+edge*.145);}p.normalize().multiplyScalar(RADIUS+.006);v.push(...p);}for(let j=0;j<N;j++){const a=j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(root,geo,water);};ribbon(false);
 let night=false,disposed=false;
 function setNight(value){night=Boolean(value);clock.night.value=+night;ground.color.set(night?'#2e4542':'#8c9e8d');for(const m of k.materials){if(m.userData.dayColor)m.color.copy(m.userData.dayColor).multiplyScalar(night?.30:1);const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.isLight)o.intensity=night?o.userData.nightIntensity:0;}));}
 function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.90+.10*Math.sin(time*p.speed+p.phase)):0;}}
 function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
 function dispose(){if(disposed)return;disposed=true;const geos=new Set(),mats=new Set(k.materials),textures=new Set(),collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
 setNight(false);return {root,landmarks,setNight,update,setLandmarkEnabled,dispose};
}
