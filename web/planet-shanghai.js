import {viewportFov,createTapTracker} from './viewport-controls.js';
import {SHANGHAI_PLACE_LINKS} from './shanghai-place-links.js';
import {mountModulePanel} from './shanghai-module-panel.js';
import {visibleLandmark,transitionPosition,reframeOrbit,FreeOrbitControls} from './shanghai-camera.js';
import {recoverContext} from './shanghai-context-recovery.js';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createShanghaiScene} from './shanghai-scene.js';
import {LANDMARKS} from './shanghai-landmarks.js';

// The same miniature used by the landmark explorer, mounted in the travel shell.
export async function mountPlanet(canvas,onPick){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),stage=canvas.closest('.planet-stage'),cleanup=[];
  const listen=(target,event,fn)=>{target.addEventListener(event,fn);cleanup.push(()=>target.removeEventListener(event,fn));};
  let renderer,controls,model,env,observer,frame=0,dead=false;
  function destroy(){if(dead)return;dead=true;cancelAnimationFrame(frame);observer?.disconnect();cleanup.forEach(fn=>fn());controls?.dispose();model?.dispose();env?.dispose();renderer?.dispose();}
  try{
    await recoverContext(canvas);
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.05,40);
    const home=new THREE.Vector3(2.1,5.7,6.4),target=new THREE.Vector3(0,.90,0),homeDistance=home.distanceTo(target);
    camera.position.copy(home);controls=new FreeOrbitControls(camera,canvas);controls.target.copy(target);controls.enablePan=false;controls.enableDamping=!reduced.matches;controls.dampingFactor=.09;controls.minDistance=1.15;controls.maxDistance=12;controls.autoRotateSpeed=.35;
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
    const ambient=new THREE.HemisphereLight('#f7f5e9','#728c80',1.1),sun=new THREE.DirectionalLight('#fff0d2',2),fill=new THREE.DirectionalLight('#a6c7dc',1);scene.add(ambient,sun,fill);sun.position.set(-3,7,4);fill.position.set(4,3,-4);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-3.5,right:3.5,top:3.5,bottom:-3.5});sun.shadow.normalBias=.012;sun.shadow.bias=-.0001;
    model=createShanghaiScene();scene.add(model.root);
    let night=false,rotating=false,paused=false,last=0,elapsed=0,transition=null;
    const emit=()=>{canvas.dataset.rotation=rotating?'running':'paused';canvas.dispatchEvent(new CustomEvent('planetviewchange',{detail:{autoRotate:rotating,zoom:homeDistance/camera.position.distanceTo(controls.target),min:homeDistance/controls.maxDistance,max:homeDistance/controls.minDistance}}));};
    function setNight(value){night=Boolean(value);model.setNight(night);document.documentElement.classList.toggle('planet-night',night);canvas.dataset.night=String(night);ambient.intensity=night?.28:.95;sun.intensity=night?.24:1.7;fill.intensity=night?.24:.9;scene.environmentIntensity=night?.08:.38;renderer.toneMappingExposure=night?1.1:1;canvas.dispatchEvent(new CustomEvent('planetthemechange',{detail:{night}}));try{localStorage.setItem('travel-shanghai-night',String(night));}catch{}}
    function focus(id){
      rotating=false;controls.autoRotate=false;const item=model.landmarks.has(id)?LANDMARKS.find(l=>l.id===id):null;let to=home.clone(),toTarget=target.clone();
      if(item){const object=model.landmarks.get(id);object.updateWorldMatrix(true,true);toTarget=object.localToWorld(new THREE.Vector3(0,(item.focusY??item.height*.46),0));const direction=new THREE.Vector3(...(item.view||(id==='swfc'?[1,.35,-1]:id==='tower'?[.9,.35,1]:item.area.startsWith('外滩')?[1,.55,1]:[-.65,.4,1]))).normalize();if(item.grounded)direction.applyQuaternion(object.quaternion);to=toTarget.clone().addScaledVector(direction,item.distance||Math.max(1.25,item.height*3.5));}
      const up=new THREE.Vector3(0,1,0);if(item?.grounded)up.applyQuaternion(model.landmarks.get(item.id).quaternion);controls=reframeOrbit(controls,up);wireOrbit();
      canvas.dataset.focus=item?id:'overview';
      if(reduced.matches){camera.position.copy(to);controls.target.copy(toTarget);controls.update();}
      else transition={start:performance.now(),from:camera.position.clone(),to,fromTarget:controls.target.clone(),toTarget};emit();
    }
    function zoomBy(factor){transition=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()/factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();emit();}
    function toggleRotation(){transition=null;rotating=!rotating;controls.autoRotate=rotating&&!reduced.matches;emit();}
    function wireOrbit(){controls.addEventListener('change',emit);controls.addEventListener('start',()=>{transition=null;rotating=false;controls.autoRotate=false;emit();});}wireOrbit();
    listen(canvas,'keydown',event=>{const key=event.key;if(!['+','=','-','0',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return;event.preventDefault();if(key==='0')focus(null);else if(key===' ')toggleRotation();else if(key==='+'||key==='=')zoomBy(1.1);else if(key==='-')zoomBy(1/1.1);else{transition=null;rotating=false;controls.autoRotate=false;controls.rotateByKey(key);emit();}});
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),placeIds=SHANGHAI_PLACE_LINKS;const taps=createTapTracker();
    listen(canvas,'pointerdown',e=>taps.down(e));listen(canvas,'pointermove',e=>taps.move(e));listen(canvas,'pointercancel',e=>taps.cancel(e));listen(canvas,'lostpointercapture',e=>taps.cancel(e));listen(canvas,'pointerup',e=>{if(!taps.up(e)||paused)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const landmark=visibleLandmark(model.root,ray),id=placeIds[landmark];if(id)onPick(id);else if(landmark)focus(landmark);});
    listen(reduced,'change',()=>{controls.enableDamping=!reduced.matches;if(reduced.matches){rotating=false;transition=null;controls.autoRotate=false;emit();}});
    const fit=()=>{const {width,height}=canvas.getBoundingClientRect();renderer.setSize(width,Math.max(1,height),false);camera.aspect=width/Math.max(1,height);camera.fov=viewportFov(35,width,height);camera.updateProjectionMatrix();controls.handleResize();};observer=new ResizeObserver(fit);observer.observe(canvas);fit();
    function draw(now){if(dead)return;frame=requestAnimationFrame(draw);const wallDelta=Math.min(.5,(now-(last||now))/1000),dt=Math.min(.05,wallDelta);last=now;if(document.hidden||paused)return;if(!reduced.matches)elapsed+=wallDelta;if(transition){const t=Math.min(1,(now-transition.start)/700),ease=t*t*(3-2*t);camera.position.copy(transitionPosition(transition.from,transition.to,ease));controls.target.lerpVectors(transition.fromTarget,transition.toTarget,ease);if(t===1){transition=null;}}model.update(elapsed,reduced.matches);canvas.dataset.fireworks=!night||!model.landmarks.has('disney')?'off':reduced.matches?'reduced':model.fireworks.state.active?'playing':'waiting';controls.update(dt);renderer.render(scene,camera);}
    let saved=false;try{saved=localStorage.getItem('travel-shanghai-night')==='true';}catch{}setNight(saved);controls.update();renderer.render(scene,camera);emit();canvas.dataset.focus='overview';frame=requestAnimationFrame(draw);
    cleanup.push(mountModulePanel({model,canvas,resetView:()=>focus(null)}));
    listen(canvas,'webglcontextlost',e=>{e.preventDefault();destroy();canvas.dispatchEvent(new CustomEvent('planeterror'));});
    return {failed:false,reset:()=>focus(null),zoomBy,toggleRotation,toggleNight:()=>setNight(!night),focusOverview:focus,focusComponent:focus,pause:value=>{paused=Boolean(value);controls.enabled=!paused;},setEditing(){},setInspection(){},setComponents(){},destroy};
  }catch(error){destroy();throw error;}
}

