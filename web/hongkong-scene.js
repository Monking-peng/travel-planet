import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {surfaceDetail} from './wuhan-atmosphere.js';
import {LANDMARKS,createLandmark} from './hongkong-landmarks.js';
export const RADIUS=2.15;
export function surface(x,z,lift=0,side=1){return new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);}
export function createHongKongScene(){
 const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map();
 k.clock=clock;
 const ground=k.mat('#9ca98d',.99),terrainGeo=new THREE.SphereGeometry(RADIUS,176,144),positions=terrainGeo.attributes.position;
 // Concentrate the island relief inland; waterfront building pads stay rigid.
 for(let i=0;i<positions.count;i++){const n=new THREE.Vector3().fromBufferAttribute(positions,i).normalize(),cap=THREE.MathUtils.smoothstep(Math.abs(n.y),.94,.995),rise=.31*cap*(.72+.28*Math.cos(n.x*18+n.z*10));n.multiplyScalar(RADIUS+rise);positions.setXYZ(i,n.x,n.y,n.z);}terrainGeo.computeVertexNormals();
 const terrain=k.mesh(root,terrainGeo,ground);terrain.name='hongkong-terrain';terrain.receiveShadow=true;surfaceDetail(ground,clock);
 for(const item of LANDMARKS){
  const model=createLandmark(k,item.id);model.name=item.id;
  model.traverse(o=>{if(!o.isMesh)return;o.userData.landmark=item.id;o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.30;
   if(o.material.userData.landscape)o.material.userData.dayColor=o.material.color.clone();
   if(!o.material.userData.night&&!o.material.userData.landscape)o.material.userData.night={color:o.material.color.clone(),intensity:.065};
  });
  const light=new THREE.PointLight('#ffdda9',0,1.4,2);light.position.set(.15,.35,.37);light.userData.nightIntensity=.040;model.add(light);
  const n=surface(item.x,item.z,0,item.hemisphere||1).normalize();model.position.copy(n).multiplyScalar(RADIUS+.007);model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);const towardHarbour=new THREE.Vector3(0,-Math.sign(n.y),0).projectOnPlane(n).normalize().applyQuaternion(model.quaternion.clone().invert());model.rotateY(item.facesHarbour?Math.atan2(towardHarbour.x,towardHarbour.z):(item.rotation||0));root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);
 }
 // An equatorial harbour separates the island and Kowloon landmark groups.
 // It is an illustrative composition, not a geographic map.
 const water=k.mat('#438e9b',.56,.06);water.userData.dayColor=water.color.clone();water.userData.landscape=true;water.side=THREE.DoubleSide;
 // Subdivide across the bay as well as along it: a single chord would sink
 // beneath the globe and expose a false land strip through the middle.
 const v=[],idx=[],N=240,W=20;for(let j=0;j<=N;j++)for(let i=0;i<=W;i++){const t=j/N*Math.PI*2,offset=(i/W*2-1)*.60,p=new THREE.Vector3(RADIUS*Math.sin(t),.05*Math.sin(t*2)+offset,RADIUS*Math.cos(t)).normalize().multiplyScalar(RADIUS+.006);v.push(...p);}
 for(let j=0;j<N;j++)for(let i=0;i<W;i++){const a=j*(W+1)+i,b=a+W+1;idx.push(a,a+1,b,a+1,b+1,b);}const bay=new THREE.BufferGeometry();bay.setAttribute('position',new THREE.Float32BufferAttribute(v,3));bay.setIndex(idx);bay.computeVertexNormals();const bayMesh=k.mesh(root,bay,water);bayMesh.name='hongkong-bay';
 let night=false,disposed=false;
 function setNight(value){night=Boolean(value);clock.night.value=+night;ground.color.set(night?'#2a4648':'#9ca98d');for(const m of k.materials){if(m.userData.dayColor)m.color.copy(m.userData.dayColor).multiplyScalar(night?.56:1);const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.isLight)o.intensity=night?o.userData.nightIntensity:0;}));}
 function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.90+.10*Math.sin(time*p.speed+p.phase)):0;}}
 function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
 function dispose(){if(disposed)return;disposed=true;const geos=new Set(),mats=new Set(k.materials),textures=new Set(),collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
 setNight(false);return {root,landmarks,setNight,update,setLandmarkEnabled,dispose};
}
