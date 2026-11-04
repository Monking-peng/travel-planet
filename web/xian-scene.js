import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {surfaceDetail} from './wuhan-atmosphere.js';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {LANDMARKS,createLandmark} from './xian-landmarks.js';
export const RADIUS=2.15;
export function surface(x,z,lift=0,side=1){return new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);}
const sag=(x,z)=>RADIUS-Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z));
export function createXianScene(){
  const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map();
  const ground=k.mat('#a7ab8b',.98),terrain=k.mesh(root,new THREE.SphereGeometry(RADIUS,176,144),ground);terrain.name='xian-terrain';terrain.receiveShadow=true;surfaceDetail(ground,clock);
  for(const item of LANDMARKS){
    const model=createLandmark(k,item.id);model.name=item.id;
    model.traverse(o=>{
      if(!o.isMesh)return;o.userData.landmark=item.id;o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.30;
      const old=o.geometry;o.geometry=new TessellateModifier(.055,7).modify(old);old.dispose();const a=o.geometry.attributes.position,n=o.geometry.attributes.normal;
      if(!o.material.userData.pagodaRigid&&!o.material.userData.drumRigid&&!o.material.userData.smallPagodaRigid)for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i);a.setY(i,a.getY(i)-sag(x,z));if(o.material.userData.preserveSmooth){const ny=n.getY(i),r=Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),nx=n.getX(i)+x/r*ny,nz=n.getZ(i)+z/r*ny,len=Math.hypot(nx,ny,nz);n.setXYZ(i,nx/len,ny/len,nz/len);}}
      a.needsUpdate=true;if(o.material.userData.preserveSmooth)n.needsUpdate=true;else o.geometry.computeVertexNormals();
      if(!o.material.userData.night)o.material.userData.night={color:o.material.color.clone(),intensity:.045};
    });
    const light=new THREE.PointLight('#ffdcb0',0,1.5,2);light.position.set(.18,.40,.30);light.userData.nightIntensity=.042;model.add(light);
    const n=surface(item.x,item.z,0,item.hemisphere||1).normalize();model.position.copy(n).multiplyScalar(RADIUS+.007);model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);model.rotateY(item.rotation||0);root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);
  }
  // The central avenues connect the city as an abstract miniature, not a GPS map.
  const pavement=k.mat('#bdb7a0',.98),road=new THREE.Group();road.name='xian-avenues';
  for(const side of [-1,1])for(const axis of [0,1]){
    const p=[],idx=[];for(let j=0;j<=100;j++)for(const offset of [-.035,.035]){const t=-1.65+j/100*3.30,x=axis?offset:t,z=axis?t:offset,v=surface(x,z,.004,side);p.push(...v);}
    for(let j=0;j<100;j++){const a=j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();pavement.side=THREE.DoubleSide;k.mesh(road,geo,pavement);
  }root.add(road);
  let night=false,disposed=false;
  function setNight(value){night=Boolean(value);clock.night.value=+night;ground.color.set(night?'#3b4c46':'#a7ab8b');for(const m of k.materials){const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.isLight)o.intensity=night?o.userData.nightIntensity:0;}));}
  function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.90+.10*Math.sin(time*p.speed+p.phase)):0;}}
  function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
  function dispose(){if(disposed)return;disposed=true;const geos=new Set(),mats=new Set(k.materials),textures=new Set(),collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
  setNight(false);return {root,landmarks,setNight,update,setLandmarkEnabled,dispose};
}
