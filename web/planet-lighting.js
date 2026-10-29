import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {PLANET_RADIUS as R,GARDENS,RIVER_COURSE,frameAt} from './planet-layout.js';

export function configurePlanetRenderer(renderer){
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;
  renderer.toneMappingExposure=1;
}

// Three restrained local pools, attached to the globe so light and buildings
// rotate together. No extra shadow maps, moving lights or full-scene tint.
export function createRiverDistrictLights(){
  const root=new THREE.Group();root.name='river-district-lighting';
  function add(geo,turn,source,target,intensity,distance,angle,name){
    const group=new THREE.Group(),f=frameAt(...geo),v=a=>new THREE.Vector3(...a);
    group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(v(f.east),v(f.up),v(f.south)));
    group.rotateY(turn);group.position.copy(v(f.up)).multiplyScalar(R+.014);
    const lamp=new THREE.SpotLight('#ffd7a1',intensity,distance,angle,.85,2);
    lamp.name=name;lamp.position.set(...source);lamp.target.position.set(...target);lamp.castShadow=false;
    group.add(lamp,lamp.target);root.add(group);
  }
  const lon=160,index=RIVER_COURSE.findIndex(row=>row[0]>=lon),a=RIVER_COURSE[index-1],b=RIVER_COURSE[index];
  const bank=a[1]+(b[1]-a[1])*(lon-a[0])/(b[0]-a[0]);
  add([lon,bank-2.3],0,[0,.13,0],[0,.034,0],.008,.30,1.08,'balcony-warm-pool');
  for(const [id,source,target,power,range,angle] of [
    ['olympic-lotus',[0,.18,.07],[0,.025,0],.012,.40,1.04],
    ['binjiang-skyline',[0,.15,.12],[0,.025,.03],.009,.38,.95]
  ]){
    const garden=GARDENS.find(g=>g.id===id);
    add(garden.geo,garden.turn,source,target,power,range,angle,id+'-warm-pool');
  }
  return root;
}

// Shared by the interactive planet and its actual-model thumbnails.
export function lightPlanet(scene,renderer,{shadows=false}={}){
  const sky=new THREE.HemisphereLight('#fff9ef','#a9bda7',.68);
  const sun=new THREE.DirectionalLight('#fff4de',2.35);sun.position.set(-3,6,8);
  sun.castShadow=shadows;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-2.5,right:2.5,top:2.5,bottom:-2.5});
  sun.shadow.normalBias=.004;sun.shadow.bias=-.00015;sun.shadow.radius=2;
  const fill=new THREE.DirectionalLight('#d9ebec',.65);fill.position.set(4,1,-3);
  scene.add(sky,sun,fill);scene.environmentIntensity=.16;
  let target=null;
  function restore(){
    target?.dispose();
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer);
    target=generator.fromScene(room,.06,.1,100,{size:128});scene.environment=target.texture;
    room.dispose();generator.dispose();
  }
  restore();
  return {restore,setNight(night){sky.color.set(night?'#849bbf':'#fff9ef');sky.groundColor.set(night?'#263b48':'#a9bda7');sky.intensity=night?.68:.68;sun.color.set(night?'#aac9f3':'#fff4de');sun.intensity=night?.70:2.35;fill.color.set(night?'#8ba7cd':'#d9ebec');fill.intensity=night?.32:.65;scene.environmentIntensity=night?.055:.16;},dispose(){scene.environment=null;target?.dispose();scene.remove(sky,sun,fill);sun.shadow.dispose();}};
}
