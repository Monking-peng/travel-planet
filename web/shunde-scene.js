import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {surfaceDetail} from './wuhan-atmosphere.js';
import {LANDMARKS,createLandmark} from './shunde-landmarks.js';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';

export const RADIUS=2.15;
export function surface(x,z,lift=0,side=1){return new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);}
const sag=(x,z)=>RADIUS-Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z));
export const channelX=angle=>.045*Math.sin(angle*3);
function channelGeometry(width,lift){
  const p=[],idx=[];for(let row=0;row<=6;row++)for(let j=0;j<=256;j++){const a=j/256*Math.PI*2,x=channelX(a)+(row/6-.5)*width,r=Math.sqrt(RADIUS*RADIUS-x*x);p.push(x,Math.cos(a)*r,Math.sin(a)*r);}
  for(let row=0;row<6;row++)for(let j=0;j<256;j++){const a=row*257+j,b=a+257;idx.push(a,a+1,b,b,a+1,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.scale(lift,lift,lift);geo.computeVertexNormals();return geo;
}
export function createShundeScene(){
  const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map();
  const ground=k.mat('#91a18a',.98),terrain=k.mesh(root,new THREE.SphereGeometry(RADIUS,160,128),ground);terrain.name='shunde-terrain';terrain.receiveShadow=true;surfaceDetail(ground,clock);
  const bank=k.mat('#b7b9a0',.98);bank.side=THREE.DoubleSide;k.mesh(root,channelGeometry(.19,1.001),bank).name='shunde-banks';
  const seaMaterial=k.mat('#608e83',.6,.12);seaMaterial.envMapIntensity=.1;seaMaterial.side=THREE.DoubleSide;k.mesh(root,channelGeometry(.145,1.002),seaMaterial).name='shunde-waterways';surfaceDetail(seaMaterial,clock,true);
  for(const item of LANDMARKS){
    const model=createLandmark(k,item.id);model.name=item.id;
    model.traverse(o=>{if(!o.isMesh)return;o.userData.landmark=item.id;o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.35;if(!o.material.userData.night&&!o.material.transparent)o.material.userData.night={color:o.material.color.clone(),intensity:.035};const original=o.geometry;o.geometry=new TessellateModifier(.055,7).modify(original);original.dispose();const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)-sag(a.getX(i),a.getZ(i)));a.needsUpdate=true;o.geometry.computeVertexNormals();});
    const light=new THREE.PointLight(['hem','theatre'].includes(item.id)?'#ccdef2':'#f7d3a2',0,1.5,2);light.position.set(.24,.22,.34);light.userData.nightIntensity=item.id==='baolin'?.075:.050;model.add(light);
    const normal=surface(item.x,item.z,0,item.hemisphere||1).normalize();model.position.copy(normal).multiplyScalar(RADIUS+.006);model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);model.rotateY(item.rotation||0);root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);
  }
  let night=false,disposed=false;
  function setNight(value){night=Boolean(value);clock.night.value=+night;ground.color.set(night?'#314b44':'#91a18a');seaMaterial.color.set(night?'#234a48':'#608e83');for(const m of k.materials){const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.isLight)o.intensity=night?o.userData.nightIntensity:0;}));}
  function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.80+.20*Math.sin(time*p.speed+p.phase)):0;}}
  function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
  function dispose(){if(disposed)return;disposed=true;const geos=new Set(),mats=new Set(k.materials),textures=new Set();const collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
  setNight(false);return {root,landmarks,setNight,update,setLandmarkEnabled,dispose};
}
