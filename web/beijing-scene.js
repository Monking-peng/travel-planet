import * as THREE from 'three';
import {makeKit} from './wuhan-kit.js';
import {createBeijingAxis} from './beijing-axis.js';
import {surfaceDetail} from './wuhan-atmosphere.js';
import {LANDMARKS,createLandmark} from './beijing-landmarks.js';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';

export const RADIUS=2.15;
export function surface(x,z,lift=0,side=1){return new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),z).normalize().multiplyScalar(RADIUS+lift);}
const sag=(x,z)=>RADIUS-Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z));
export function createBeijingScene(){
  const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map();
  const ground=k.mat('#8f9c79',.97),terrain=k.mesh(root,new THREE.SphereGeometry(RADIUS,160,128),ground);terrain.name='beijing-terrain';terrain.receiveShadow=true;surfaceDetail(ground,clock);
  for(const item of LANDMARKS){
    const model=createLandmark(k,item.id);model.name=item.id;
    model.traverse(o=>{if(!o.isMesh)return;o.userData.landmark=item.id;o.castShadow=true;o.receiveShadow=true;const original=o.geometry;o.geometry=new TessellateModifier(.055,7).modify(original);original.dispose();const a=o.geometry.attributes.position,normals=o.geometry.attributes.normal,smooth=o.material.userData.cushion;
      for(let i=0;i<a.count;i++){
        const x=a.getX(i),z=a.getZ(i);a.setY(i,a.getY(i)-sag(x,z));
        // Inverse-transpose of the spherical bend preserves shared smooth normals.
        // Recomputing on TessellateModifier's non-indexed output flattens every face.
        if(smooth){const ny=normals.getY(i),denom=Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z)),nx=normals.getX(i)+x/denom*ny,nz=normals.getZ(i)+z/denom*ny,length=Math.hypot(nx,ny,nz);normals.setXYZ(i,nx/length,ny/length,nz/length);}
      }
      a.needsUpdate=true;if(smooth)normals.needsUpdate=true;else o.geometry.computeVertexNormals();
      const material=o.material;if(!material.userData.night&&!material.userData.terrainTint&&['palace','tiananmen','heaven','summer','beihai','drum','wall','jingshan'].includes(item.id)){material.userData.night={color:material.color.clone(),intensity:material.metalness>.1?.14:.045};}
    });
    // Lamps belong to the complete landmark module; removal leaves no floating lights.
    const warm=k.mat(item.id==='watercube'?'#7bcbf1':'#f2ce8a',.42,.1,item.id==='watercube'?'#68c7fa':'#ffd398');warm.userData.night.intensity=1.1;
    const pole=k.mat('#49564c');
    const edgeLamps={summer:[[-.55,-.08],[.55,-.08],[-.61,.18],[.61,.18],[-.45,.49],[.45,.49]],beihai:Array.from({length:8},(_,i)=>[Math.cos(i*Math.PI/4)*.46,.08+Math.sin(i*Math.PI/4)*.39]),watercube:[[-.38,-.35],[.38,-.35],[-.38,.35],[.38,.35]],cctv:[[-.38,-.28],[.38,-.28],[-.38,.28],[.38,.28]]};
    const radius={palace:.72,tiananmen:.60,heaven:.52,beihai:.46,theatre:.66,nest:.59,drum:.43}[item.id]||.46;
    const lamps=['wall','jingshan'].includes(item.id)?[]:edgeLamps[item.id]||Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return [Math.cos(a)*radius,Math.sin(a)*radius*(item.id==='palace'?.95:.80)];});
    for(const [x,z] of lamps){const y=-sag(x,z);k.cyl(model,.002,.003,.045,pole,x,y+.025,z,6);k.ball(model,.005,warm,x,y+.049,z);}
    const light=new THREE.PointLight(item.id==='heaven'?'#dce6f1':'#ffd8a2',0,1.7,2);light.position.set(0,.60,.24);light.userData.nightIntensity=item.id==='palace'?.055:.035;model.add(light);
    const n=surface(item.x,item.z,0,item.hemisphere||1).normalize();model.position.copy(n).multiplyScalar(RADIUS+.006);model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);model.rotateY(item.rotation||0);root.add(model);landmarks.set(item.id,model);modules.set(item.id,model);
  }
  root.add(createBeijingAxis(k,{radius:RADIUS,landmarks}));
  let night=false,disposed=false;
  function setNight(value){night=Boolean(value);clock.night.value=+night;ground.color.set(night?'#304744':'#8f9c79');for(const m of k.materials){if(m.userData.terrainTint){const day=new THREE.Color('#8f9c79');m.color.setRGB(ground.color.r/day.r,ground.color.g/day.g,ground.color.b/day.b);}const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;}}modules.forEach(g=>g.traverse(o=>{if(o.isLight)o.intensity=night?o.userData.nightIntensity:0;}));}
  function update(time,reduced){clock.time.value=reduced?0:time;for(const m of k.materials){const n=m.userData.night,p=m.userData.pulse;if(n&&p)m.emissiveIntensity=night?n.intensity*(reduced?1:.84+.16*Math.sin(time*p.speed+p.phase)):0;}}
  function setLandmarkEnabled(id,enabled){const m=modules.get(id);if(!m||landmarks.has(id)===Boolean(enabled))return false;if(enabled){root.add(m);landmarks.set(id,m);}else{m.removeFromParent();landmarks.delete(id);}return true;}
  function dispose(){if(disposed)return;disposed=true;const geos=new Set(),mats=new Set(k.materials),textures=new Set();const collect=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);};root.traverse(collect);modules.forEach(m=>m.traverse(collect));geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());}
  setNight(false);return {root,landmarks,setNight,update,setLandmarkEnabled,dispose};
}
