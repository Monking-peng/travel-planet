import * as THREE from 'three';
import {TrackballControls} from 'three/addons/controls/TrackballControls.js';

export function visibleLandmark(root,ray){
  return ray.intersectObject(root,true)[0]?.object.userData.landmark??null;
}

// Rotate the view frame together with the camera: crossing a pole never clamps
// the angle or forces the globe upright again.
export function orbitStep(offset,up,key,angle=.12){
  const vertical=key==='ArrowUp'||key==='ArrowDown';
  const axis=vertical?new THREE.Vector3().crossVectors(up,offset).normalize():up.clone().normalize();
  const sign=key==='ArrowUp'||key==='ArrowRight'?-1:1;
  const turn=new THREE.Quaternion().setFromAxisAngle(axis,angle*sign);
  up.applyQuaternion(turn).normalize();
  return offset.clone().applyQuaternion(turn);
}

export function transitionPosition(from,to,t){
  const a=from.clone().normalize(),b=to.clone().normalize();
  if(a.dot(b)>.25)return from.clone().lerp(to,t);
  // Cross-hemisphere travel goes around the globe, never through its interior.
  const turn=new THREE.Quaternion().setFromUnitVectors(a,b);
  a.applyQuaternion(new THREE.Quaternion().slerp(turn,t));
  return a.multiplyScalar(THREE.MathUtils.lerp(from.length(),to.length(),t));
}

// Keep the travel/explorer API, while TrackballControls supplies unbounded
// pointer rotation and updates camera.up continuously instead of locking it.
export class FreeOrbitControls extends TrackballControls{
  constructor(camera,element){
    super(camera,element);
    this.keys=[];this.noPan=true;this.rotateSpeed=2.3;
    this.autoRotate=false;this.autoRotateSpeed=.35;
  }
  get enableDamping(){return !this.staticMoving;}
  set enableDamping(value){this.staticMoving=!value;}
  get dampingFactor(){return this.dynamicDampingFactor;}
  set dampingFactor(value){this.dynamicDampingFactor=value;}
  get enablePan(){return !this.noPan;}
  set enablePan(value){this.noPan=!value;}
  get enableZoom(){return !this.noZoom;}
  set enableZoom(value){this.noZoom=!value;}
  get enableRotate(){return !this.noRotate;}
  set enableRotate(value){this.noRotate=!value;}
  rotateByKey(key){
    const before=this.object.position.clone().sub(this.target),oldUp=this.object.up.clone();
    const vertical=key==='ArrowUp'||key==='ArrowDown';
    const axis=vertical?new THREE.Vector3().crossVectors(oldUp,before).normalize():oldUp.normalize();
    const turn=new THREE.Quaternion().setFromAxisAngle(axis,(key==='ArrowUp'||key==='ArrowRight'?-1:1)*.12);
    this.object.position.applyQuaternion(turn);this.target.applyQuaternion(turn);this.object.up.applyQuaternion(turn).normalize();
    this.update();this.dispatchEvent({type:'change'});
  }
  update(dt=0){
    if(!this.enabled)return;
    this.object.lookAt(this.target);
    const before=this.object.quaternion.clone(),target=this.target.clone();
    if(this.autoRotate&&this.enableRotate&&dt>0){
      const offset=this.object.position.clone().sub(this.target);
      this.object.position.copy(this.target).add(orbitStep(offset,this.object.up,'ArrowRight',Math.PI/30*this.autoRotateSpeed*dt));
    }
    super.update();
    // Rotate the complete viewing frame around the planet center. A close-up
    // remains outside the globe when dragged below its local horizon.
    const turn=this.object.quaternion.clone().multiply(before.invert());
    const shift=target.clone().applyQuaternion(turn).sub(target);
    this.object.position.add(shift);this.target.add(shift);
  }
}

// Re-enter a selected landmark or the overview with its intended upright frame;
// free dragging after that has no hemisphere or polar-angle limit.
export function reframeOrbit(previous,up){
  const camera=previous.object,element=previous.domElement,position=camera.position.clone(),target=previous.target.clone();
  const properties=['enabled','enableDamping','dampingFactor','enablePan','enableZoom','enableRotate','rotateSpeed','zoomSpeed','autoRotateSpeed','minDistance','maxDistance'];
  const values=Object.fromEntries(properties.map(key=>[key,previous[key]]));
  previous.dispose();camera.up.copy(up).normalize();
  const next=new FreeOrbitControls(camera,element);Object.assign(next,values);
  camera.position.copy(position);next.target.copy(target);next.update();return next;
}
