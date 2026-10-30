import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {surfaceDetail} from './wuhan-atmosphere.js';
import {LANDMARKS,createLandmark} from './shenzhen-landmarks.js';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';

export const RADIUS=2.15,SHORE_Z=1.45;
export const shorelineZ=angle=>SHORE_Z+.055*Math.cos(angle*3)+.10*Math.sin(angle*2);
export function surface(x,z,lift=0,side=1){return new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);}
const sag=(x,z)=>RADIUS-Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z));
function shoreGeometry(){
  const positions=[],indices=[];for(let row=0;row<2;row++)for(let j=0;j<=256;j++){const a=j/256*Math.PI*2,z=shorelineZ(a)+row*.026,r=Math.sqrt(RADIUS*RADIUS-z*z);positions.push(Math.cos(a)*r,Math.sin(a)*r,z);}
  for(let j=0;j<256;j++){const a=j,b=j+257;indices.push(a,b,a+1,b,b+1,a+1);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function bayGeometry(){
  const p=[],idx=[];for(let row=0;row<=64;row++)for(let j=0;j<=256;j++){const a=j/256*Math.PI*2,phi=row/64*Math.acos(shorelineZ(a)/RADIUS),r=(RADIUS+.004)*Math.sin(phi);p.push(Math.cos(a)*r,Math.sin(a)*r,(RADIUS+.004)*Math.cos(phi));}
  for(let row=0;row<64;row++)for(let j=0;j<256;j++){const a=row*257+j,b=a+257;idx.push(a,a+1,b,b,a+1,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return geo;
}
export function createShenzhenScene(){
  const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map();
  const ground=k.mat('#8ca08a',.98),terrain=k.mesh(root,new THREE.SphereGeometry(RADIUS,160,128),ground);terrain.name='shenzhen-terrain';terrain.receiveShadow=true;surfaceDetail(ground,clock);
  const seaMaterial=k.mat('#427d8c',.68,.12);seaMaterial.envMapIntensity=.10;seaMaterial.side=THREE.DoubleSide;const sea=k.mesh(root,bayGeometry(),seaMaterial);sea.name='shenzhen-bay';surfaceDetail(seaMaterial,clock,true);
  const shore=k.mesh(root,shoreGeometry(),k.mat('#b4b59a',.98));shore.scale.setScalar(1.0025);shore.name='shenzhen-shore';shore.material.side=THREE.DoubleSide;
  for(const item of LANDMARKS){
    const model=createLandmark(k,item.id);model.name=item.id;
    model.traverse(o=>{if(!o.isMesh)return;o.userData.landmark=item.id;o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.42;const original=o.geometry;o.geometry=new TessellateModifier(.055,7).modify(original);original.dispose();const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)-sag(a.getX(i),a.getZ(i)));a.needsUpdate=true;o.geometry.computeVertexNormals();});
    const light=new THREE.PointLight(['cocoon','pingan','bamboo'].includes(item.id)?'#ccdef2':'#f7d3a2',0,1.5,2);light.position.set(.24,.22,.34);light.userData.nightIntensity=item.id==='civic'?.035:.012;model.add(light);
    const normal=surface(item.x,item.z,0,item.hemisphere||1).normalize();model.position.copy(normal).multiplyScalar(RADIUS+.006);model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);model.rotateY(item.rotation||0);root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);
  }
  let night=false,disposed=false;
  function setNight(value){night=Boolean(value);clock.night.value=+night;ground.color.set(night?'#29443e':'#8ca08a');seaMaterial.color.set(night?'#18394c':'#427d8c');for(const m of k.materials){const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.isLight)o.intensity=night?o.userData.nightIntensity:0;}));}
  function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.80+.20*Math.sin(time*p.speed+p.phase)):0;}}
  function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
  function dispose(){if(disposed)return;disposed=true;const geos=new Set(),mats=new Set(k.materials),textures=new Set();const collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
  setNight(false);return {root,landmarks,setNight,update,setLandmarkEnabled,dispose};
}
