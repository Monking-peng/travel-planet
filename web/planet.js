import {viewportFov} from './viewport-controls.js';
import {createNightController,readNightPreference,saveNightPreference} from './planet-night.js';
import * as THREE from 'three';
import {createEditablePlanetAsync} from './planet-composition.js';
import {lightPlanet,configurePlanetRenderer,createRiverDistrictLights} from './planet-lighting.js';
import {COMPONENTS,focusAngles,inspectionView,overviewView} from './planet-options.js';
import {createPlanetPicker} from './planet-picking.js';
import {createFocusTransition,sampleFocusTransition} from './planet-focus.js';

const MIN_ZOOM=.8,MAX_ZOOM=4.5,RESUME_DELAY=4000;
export function createPlanetCamera(width=1,height=1){
  const camera=new THREE.PerspectiveCamera(34,width/height,.1,100);
  // The product opens at 200%; users can pull back with the zoom control.
  camera.zoom=overviewView('lake').zoom;camera.updateProjectionMatrix();
  camera.position.set(0,1.2,6.2);camera.lookAt(0,.20,0);camera.updateMatrixWorld(true);return camera;
}
export async function mountPlanet(canvas,onPick,selection,{onInspect}={}){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return {failed:true,reset(){},pause(){},setEditing(){},setInspection(){},zoomBy(){},toggleRotation(){},focusComponent(){},focusOverview(){},setComponents(){},destroy(){}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;configurePlanetRenderer(renderer);
  const scene=new THREE.Scene(),camera=createPlanetCamera();
  let compactView=canvas.getBoundingClientRect().width<=760;
  if(compactView){camera.zoom*=.5;camera.updateProjectionMatrix();}
  const lighting=lightPlanet(scene,renderer,{shadows:true});
  let composition;
  try{composition=await createEditablePlanetAsync(selection);}catch(error){lighting.dispose();renderer.dispose();throw error;}
  const planet=composition.root,riverLights=createRiverDistrictLights();planet.add(riverLights);scene.add(planet);const night=createNightController(planet,lighting,riverLights);canvas.dataset.components=selection.join(',');
  const pickTarget=createPlanetPicker(planet,camera),hoverTip=document.createElement('div');
  hoverTip.className='planet-hover-tip';hoverTip.hidden=true;hoverTip.setAttribute('aria-hidden','true');canvas.parentElement.append(hoverTip);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(75,104,72,.18)');gradient.addColorStop(.6,'rgba(75,104,72,.08)');gradient.addColorStop(1,'rgba(75,104,72,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas),ground=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.6),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.8;scene.add(ground);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),pointers=new Map();
  let focusTransition=null,gesture=null,moved=false,frame,disposed=false,panelPaused=false,editing=false,inspecting=false,inspectionId='',framing=null,savedView=null,autoRotate=!reduced.matches,resumeAt=0,lastTime=0,dirty=true,visibleInLayout=true;
  let hoverPoint=null,hoverDirty=false,lastHover=0;
  function clearHover(){hoverPoint=null;hoverDirty=false;hoverTip.hidden=true;delete canvas.dataset.hovered;}
  function updateHover(){
    if(!hoverPoint||editing||pointers.size||!active()){clearHover();return;}
    const rect=canvas.getBoundingClientRect(),x=hoverPoint.x-rect.left,y=hoverPoint.y-rect.top,target=pickTarget(x,y,rect.width,rect.height),item=COMPONENTS.find(c=>c.id===target?.componentId);
    const action=target?.placeId&&onPick?'查看景点':item&&onInspect?'靠近看看':'';
    if(!item||!action){hoverTip.hidden=true;delete canvas.dataset.hovered;return;}
    canvas.dataset.hovered=item.id;hoverTip.textContent=item.name+' · '+action;hoverTip.hidden=false;
    hoverTip.style.left=Math.max(8,Math.min(rect.width-hoverTip.offsetWidth-8,x+15))+'px';
    hoverTip.style.top=Math.max(8,Math.min(rect.height-hoverTip.offsetHeight-8,y-hoverTip.offsetHeight-10))+'px';
  }
  const active=()=>!document.hidden&&!panelPaused&&visibleInLayout;
  const hold=()=>{resumeAt=performance.now()+RESUME_DELAY;};
  // Small pier details need closer inspection; the whole-planet limit stays unchanged.
  const zoomLimit=()=>inspecting&&inspectionId==='lotusPier'?8:MAX_ZOOM;
  function notify(){canvas.dataset.zoom=camera.zoom.toFixed(3);canvas.dispatchEvent(new CustomEvent('planetviewchange',{detail:{zoom:camera.zoom,autoRotate,min:MIN_ZOOM,max:zoomLimit()}}));}
  function setNight(value){night.set(value);canvas.dataset.night=String(night.enabled);document.documentElement.classList.toggle('planet-night',night.enabled);saveNightPreference(localStorage,night.enabled);canvas.dispatchEvent(new CustomEvent('planetthemechange',{detail:{night:night.enabled}}));dirty=true;}
  setNight(readNightPreference(localStorage));
  function setZoom(value){clearHover();dirty=true;camera.zoom=THREE.MathUtils.clamp(value,MIN_ZOOM,zoomLimit());camera.updateProjectionMatrix();hold();notify();}
  function zoomBy(factor){focusTransition=null;setZoom(camera.zoom*factor);}
  function reset(){focusTransition=null;inspectionId='';framing=null;planet.rotation.set(-.35,-.20,.25);planet.position.y=0;setZoom(editing?.9:overviewView('lake').zoom*(compactView?.5:1));}
  function toggleRotation(){autoRotate=!autoRotate;resumeAt=0;notify();}
  const resize=()=>{clearHover();const {width,height}=canvas.getBoundingClientRect();visibleInLayout=Boolean(width&&height);if(!visibleInLayout)return;dirty=true;renderer.setSize(width,height,false);camera.aspect=width/height;const compact=width<=760;if(compact!==compactView&&!inspecting&&!editing){camera.zoom*=compact?.5:2;notify();}compactView=compact;camera.fov=inspecting?34:viewportFov(34,width,height);if(inspecting&&inspectionId&&framing){const next=inspectionView(inspectionId,width,height),dy=next.offsetY-framing.offsetY;camera.zoom=THREE.MathUtils.clamp(camera.zoom*next.zoom/framing.zoom,MIN_ZOOM,zoomLimit());planet.position.y+=dy;if(focusTransition){focusTransition.from.offsetY+=dy;focusTransition.to.offsetY+=dy;focusTransition.from.zoom*=next.zoom/framing.zoom;focusTransition.viaZoom*=next.zoom/framing.zoom;focusTransition.to.zoom=next.zoom;}framing=next;notify();}camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function rebase(){const p=[...pointers.values()];gesture=p.length>1?{type:'pinch',distance:Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),zoom:camera.zoom}:p.length?{type:'drag',x:p[0].x,y:p[0].y,rotX:planet.rotation.x,rotY:planet.rotation.y}:null;}
  const down=e=>{if(!active()||e.button!==0)return;clearHover();focusTransition=null;if(!pointers.size)moved=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size>1)moved=true;canvas.setPointerCapture(e.pointerId);hold();rebase();};
  const move=e=>{
    if(!pointers.has(e.pointerId)){if(!editing&&active()&&['mouse','pen'].includes(e.pointerType)){hoverPoint={x:e.clientX,y:e.clientY};hoverDirty=true;}return;}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});hold();const p=[...pointers.values()];
    if(gesture?.type==='pinch'&&p.length>1){setZoom(gesture.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/gesture.distance);return;}
    if(gesture?.type!=='drag')return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
    if(moved){dirty=true;planet.rotation.y=gesture.rotY+dx*.006/camera.zoom;planet.rotation.x=THREE.MathUtils.clamp(gesture.rotX+dy*.004/camera.zoom,-Math.PI,Math.PI);}
  };
  function release(e,cancelled=false){
    if(!pointers.has(e.pointerId))return;const pick=!cancelled&&!moved&&pointers.size===1;pointers.delete(e.pointerId);hold();rebase();if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(!pick||editing||!active())return;const r=canvas.getBoundingClientRect(),target=pickTarget(e.clientX-r.left,e.clientY-r.top,r.width,r.height);if(!target)return;
    if(target.placeId&&onPick)onPick(target.placeId);else if(target.componentId&&onInspect)onInspect(target.componentId);
  }
  const up=e=>release(e),cancel=e=>release(e,true);
  const wheel=e=>{if(!active())return;focusTransition=null;e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1;zoomBy(Math.exp(-THREE.MathUtils.clamp(e.deltaY*unit,-160,160)*.0015));};
  const key=e=>{
    if(!active()||e.ctrlKey||e.altKey||e.metaKey)return;clearHover();focusTransition=null;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();hold();dirty=true;planet.rotation.y+=(e.key==='ArrowRight'?.12:e.key==='ArrowLeft'?-.12:0)/camera.zoom;planet.rotation.x=THREE.MathUtils.clamp(planet.rotation.x+(e.key==='ArrowDown'?.08:e.key==='ArrowUp'?-.08:0)/camera.zoom,-Math.PI,Math.PI);}
    else if(['+','=','-','0',' '].includes(e.key)){e.preventDefault();if(e.key==='0')reset();else if(e.key===' ')toggleRotation();else zoomBy(e.key==='-'?1/1.2:1.2);}
  };
  const listeners={pointerdown:down,pointermove:move,pointerup:up,pointercancel:cancel,pointerleave:clearHover,lostpointercapture:cancel,keydown:key,webglcontextlost:clearHover,webglcontextrestored:()=>{lighting.restore();dirty=true;}};Object.entries(listeners).forEach(([name,fn])=>canvas.addEventListener(name,fn));canvas.addEventListener('wheel',wheel,{passive:false});
  function clearPointers(){const interrupted=pointers.size>0;for(const id of [...pointers.keys()]){pointers.delete(id);if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}gesture=null;if(interrupted)hold();}
  function applyFocus(view){planet.rotation.set(view.x,view.y,view.z);planet.position.y=view.offsetY;camera.zoom=view.zoom;camera.updateProjectionMatrix();dirty=true;notify();}
  const visibility=()=>{lastTime=0;dirty=true;clearHover();clearPointers();},motionChange=()=>{if(reduced.matches){autoRotate=false;if(focusTransition){applyFocus(focusTransition.to);focusTransition=null;}dirty=true;notify();}};
  const blur=()=>{clearHover();clearPointers();};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);reduced.addEventListener('change',motionChange);
  function render(t){
    if(disposed)return;frame=requestAnimationFrame(render);const dt=lastTime?Math.min((t-lastTime)/1000,.05):0;lastTime=t;
    const running=active()&&autoRotate&&!editing&&!pointers.size&&t>=resumeAt,status=running?'running':autoRotate?'waiting':'paused';if(canvas.dataset.rotation!==status)canvas.dataset.rotation=status;
    if(!active())return;
    if(night.update(dt,reduced.matches))dirty=true;
    if(focusTransition){const view=sampleFocusTransition(focusTransition,t);applyFocus(view);if(view.done)focusTransition=null;}
    if(running){planet.rotation.y+=dt*.07;dirty=true;}if(dirty){renderer.render(scene,camera);dirty=false;}
    if(hoverPoint&&(hoverDirty||running)&&t-lastHover>=100){lastHover=t;hoverDirty=false;updateHover();}
  }
  // Render once even if a travel dialog opened while the module was loading.
  // The loader can then replace its still image without exposing an empty canvas.
  renderer.render(scene,camera);dirty=false;notify();frame=requestAnimationFrame(render);
  return {failed:false,reset,zoomBy,toggleRotation,toggleNight(){setNight(!night.enabled);},
    focusOverview(id){
      const target=overviewView(id);if(!target||editing)return;if(compactView)target.zoom=Math.max(MIN_ZOOM,target.zoom*.5);
      const from={x:planet.rotation.x,y:planet.rotation.y,z:planet.rotation.z,offsetY:planet.position.y,zoom:camera.zoom};
      inspectionId='';framing=null;clearPointers();clearHover();hold();
      for(const axis of ['x','y','z'])target[axis]=from[axis]+Math.atan2(Math.sin(target[axis]-from[axis]),Math.cos(target[axis]-from[axis]));
      if(reduced.matches){focusTransition=null;applyFocus(target);}
      else{focusTransition=createFocusTransition(from,target,performance.now());dirty=true;notify();}
    },
    focusComponent(id){
      resize();const bounds=canvas.getBoundingClientRect(),target=inspecting?inspectionView(id,bounds.width,bounds.height):focusAngles(id);if(!target)return;
      const from={x:planet.rotation.x,y:planet.rotation.y,z:planet.rotation.z,offsetY:planet.position.y,zoom:camera.zoom};
      inspectionId=inspecting?id:'';framing=inspecting?{...target}:null;
      for(const axis of ['x','y','z'])target[axis]=from[axis]+Math.atan2(Math.sin(target[axis]-from[axis]),Math.cos(target[axis]-from[axis]));
      clearHover();hold();if(reduced.matches){focusTransition=null;applyFocus(target);}else{focusTransition=createFocusTransition(from,target,performance.now());dirty=true;notify();}
    },
    setInspection(value){inspecting=Boolean(value);if(!inspecting){inspectionId='';framing=null;}resize();},
    setEditing(value){if(Boolean(value)===editing)return;editing=Boolean(value);focusTransition=null;clearPointers();if(editing){savedView={rotation:planet.rotation.clone(),zoom:camera.zoom,positionY:planet.position.y};reset();}else{inspecting=false;inspectionId='';framing=null;if(savedView){planet.rotation.copy(savedView.rotation);planet.position.y=savedView.positionY;setZoom(savedView.zoom);savedView=null;}}},
    setComponents(ids){clearHover();focusTransition=null;canvas.dataset.components=composition.setComponents(ids).join(',');night.refresh();renderer.render(scene,camera);dirty=false;},
    pause(v){panelPaused=Boolean(v);dirty=true;clearHover();clearPointers();},
    destroy(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);reduced.removeEventListener('change',motionChange);Object.entries(listeners).forEach(([name,fn])=>canvas.removeEventListener(name,fn));canvas.removeEventListener('wheel',wheel);clearPointers();clearHover();hoverTip.remove();night.dispose();composition.dispose();scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});shadowTexture.dispose();lighting.dispose();renderer.dispose();}
  };
}
