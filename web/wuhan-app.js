import {WUHAN_PLACE_LINKS} from './wuhan-place-links.js';
import {viewportFov,createTapTracker} from './viewport-controls.js';
import {mountModulePanel} from './wuhan-module-panel.js';
import {visibleLandmark,transitionPosition,reframeOrbit,FreeOrbitControls} from './shanghai-camera.js';
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createWuhanScene} from './wuhan-scene.js';
import {LANDMARKS} from './wuhan-landmarks.js';

const $=s=>document.querySelector(s),canvas=$('#wuhan'),stage=$('.scene-stage'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const nav=$('#landmarks');
for(const l of LANDMARKS){const button=document.createElement('button');button.type='button';button.dataset.landmark=l.id;button.disabled=true;button.setAttribute('aria-pressed','false');const area=document.createElement('span');area.textContent=l.area.split(' · ')[0];button.append(area,document.createTextNode(l.name));nav.append(button);}
const storage={get:()=>{try{return localStorage.getItem('travel-wuhan-night')==='true';}catch{return false;}},set:n=>{try{localStorage.setItem('travel-wuhan-night',String(n));}catch{}}};
let dispose=null;
function boot(){
  let renderer,composer,bloom,model,controls,envTarget,pmrem,environment,resize,frame=0;
  const cleanups=[];
  const listen=(target,event,fn)=>{target.addEventListener(event,fn);cleanups.push(()=>target.removeEventListener(event,fn));};
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene();scene.fog=new THREE.Fog('#edf1ed',12,22);const camera=new THREE.PerspectiveCamera(35,1,.05,40);
    const overviewPosition=new THREE.Vector3(2.7,7.0,6.0),overviewTarget=new THREE.Vector3(0,.65,0);camera.position.copy(overviewPosition);
    controls=new FreeOrbitControls(camera,canvas);controls.target.copy(overviewTarget);controls.enableDamping=!reduced.matches;controls.dampingFactor=.09;controls.minDistance=1.15;controls.maxDistance=12;controls.enablePan=false;
    pmrem=new THREE.PMREMGenerator(renderer);environment=new RoomEnvironment();envTarget=pmrem.fromScene(environment,.04);scene.environment=envTarget.texture;scene.environmentIntensity=.45;environment.dispose();pmrem.dispose();
    const ambient=new THREE.HemisphereLight('#f7f5e9','#728c80',2.0);scene.add(ambient);
    const sun=new THREE.DirectionalLight('#fff0d2',3.0);sun.position.set(-3,7,4);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-3.5;sun.shadow.camera.right=3.5;sun.shadow.camera.top=3.5;sun.shadow.camera.bottom=-3.5;sun.shadow.normalBias=.012;sun.shadow.bias=-.0001;scene.add(sun);
    const fill=new THREE.DirectionalLight('#a6c7dc',1.0);fill.position.set(4,3,-4);scene.add(fill);
    const bounce=new THREE.AmbientLight('#d1dfd7',.8);scene.add(bounce);
    const back=new THREE.DirectionalLight('#f0e1c5',1.4);back.position.set(-2,-6,2);scene.add(back);
    model=createWuhanScene();scene.add(model.root);
    composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4}));composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.28,.38,1.1);composer.addPass(bloom);composer.addPass(new OutputPass());
    let night=false,rotating=false,transition=null,last=0,elapsed=0,stopped=false;
    const syncRotation=()=>{controls.autoRotate=rotating;controls.autoRotateSpeed=.35;$('#rotate').setAttribute('aria-pressed',String(rotating));$('#rotate').textContent=rotating?'暂停旋转':'开始旋转';canvas.dataset.rotation=rotating?'running':'paused';};
    function select(id){
      rotating=false;syncRotation();const item=model.landmarks.has(id)?LANDMARKS.find(l=>l.id===id):null;
      nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.landmark===id)));
      let target=overviewTarget.clone(),position=overviewPosition.clone();
      if(item){const m=model.landmarks.get(id);m.updateWorldMatrix(true,true);target=m.localToWorld(new THREE.Vector3(0,(item.focusY??item.height*.46),item.focusZ||0));const view=new THREE.Vector3(...(item.view||(item.id==='swfc'?[1,.35,-1]:item.id==='tower'?[.9,.35,1]:item.area.startsWith('外滩')?[1,.55,1]:[-.65,.4,1]))).normalize();if(item.grounded)view.applyQuaternion(m.quaternion);const distance=item.distance||Math.max(1.25,item.height*3.5);position=target.clone().addScaledVector(view,distance);$('#detail-area').textContent=item.area;$('#detail-name').textContent=item.name;$('#detail-description').textContent=item.description;$('#detail-source').href=item.source;}
      const up=new THREE.Vector3(0,1,0);if(item?.grounded)up.applyQuaternion(model.landmarks.get(item.id).quaternion);controls=reframeOrbit(controls,up);wireOrbit();
      $('#detail').hidden=!item;const travelLink=$('#plan-place'),place=item&&WUHAN_PLACE_LINKS[item.id];travelLink.hidden=!place;if(place)travelLink.href='./wuhan-trip.html#place/'+place;canvas.dataset.focus=item?id:'overview';
      if(reduced.matches){camera.position.copy(position);controls.target.copy(target);controls.update();}
      else transition={start:performance.now(),from:camera.position.clone(),to:position,fromTarget:controls.target.clone(),toTarget:target};
    }
    function setNight(value){night=Boolean(value);model.setNight(night);document.body.classList.toggle('night',night);$('#night').setAttribute('aria-pressed',String(night));$('#night').textContent=night?'☀ 白天':'☾ 夜晚';canvas.dataset.night=String(night);ambient.intensity=night?.32:.80;sun.intensity=night?.12:2.3;fill.intensity=night?.45:.72;bounce.intensity=night?.08:.44;back.intensity=night?.34:1.5;scene.environmentIntensity=night?.15:.32;renderer.toneMappingExposure=night?1.12:1.0;bloom.enabled=night;scene.fog.color.set(night?'#091727':'#edf1ed');storage.set(night);}
    listen($('#night'),'click',()=>setNight(!night));listen($('#overview'),'click',()=>select(null));listen(nav,'click',e=>{const b=e.target.closest('button[data-landmark]');if(b)select(b.dataset.landmark);});
    listen($('#rotate'),'click',()=>{transition=null;rotating=!rotating;syncRotation();});
    function zoom(factor){transition=null;const d=camera.position.clone().sub(controls.target);d.setLength(THREE.MathUtils.clamp(d.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(d);controls.update();}
    listen($('#zoom-in'),'click',()=>zoom(.84));listen($('#zoom-out'),'click',()=>zoom(1.19));
    function wireOrbit(){controls.addEventListener('start',()=>{transition=null;rotating=false;syncRotation();});}wireOrbit();
    listen(canvas,'keydown',e=>{if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='0')select(null);else if(e.key==='+'||e.key==='=')zoom(.9);else if(e.key==='-')zoom(1.1);else if(e.key.startsWith('Arrow')){transition=null;rotating=false;syncRotation();controls.rotateByKey(e.key);}});
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();const taps=createTapTracker();
    listen(canvas,'pointerdown',e=>taps.down(e));listen(canvas,'pointermove',e=>taps.move(e));listen(canvas,'pointercancel',e=>taps.cancel(e));listen(canvas,'lostpointercapture',e=>taps.cancel(e));listen(canvas,'pointerup',e=>{if(!taps.up(e))return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const id=visibleLandmark(model.root,raycaster);if(id)select(id);});
    listen(reduced,'change',()=>{controls.enableDamping=!reduced.matches;if(reduced.matches){transition=null;rotating=false;syncRotation();}});
    function fit(){const {width,height}=canvas.getBoundingClientRect();renderer.setSize(width,height,false);composer.setSize(width,height);camera.aspect=width/height;camera.fov=viewportFov(35,width,height);camera.updateProjectionMatrix();controls.handleResize();}
    resize=new ResizeObserver(fit);resize.observe(canvas);fit();
    function render(now){if(stopped)return;frame=requestAnimationFrame(render);if(document.hidden){last=now;return;}const wallDelta=Math.min(.5,(now-(last||now))/1000),dt=Math.min(.05,wallDelta);last=now;if(!reduced.matches)elapsed+=wallDelta;
      if(transition){const t=Math.min(1,(now-transition.start)/700),e=t*t*(3-2*t);camera.position.copy(transitionPosition(transition.from,transition.to,e));controls.target.lerpVectors(transition.fromTarget,transition.toTarget,e);if(t===1){transition=null;}}
      model.update(elapsed,reduced.matches);controls.update(dt);composer.render();
    }
    setNight(storage.get());syncRotation();select(null);canvas.dataset.state='ready';canvas.setAttribute('aria-busy','false');$('#loading').hidden=true;document.querySelectorAll('button:disabled').forEach(b=>{b.disabled=false;});cleanups.push(mountModulePanel({model,canvas,resetView:()=>select(null)}));frame=requestAnimationFrame(render);
    dispose=()=>{stopped=true;cancelAnimationFrame(frame);resize.disconnect();cleanups.forEach(fn=>fn());controls.dispose();model.dispose();envTarget.dispose();composer.passes.forEach(p=>p.dispose?.());composer.dispose();renderer.dispose();};
    listen(canvas,'webglcontextlost',e=>{e.preventDefault();dispose();showError('3D 画面暂时不可用，请重新载入。');});
  }catch(error){cancelAnimationFrame(frame);resize?.disconnect();cleanups.forEach(fn=>fn());controls?.dispose();model?.dispose();envTarget?.dispose();pmrem?.dispose();environment?.dispose();composer?.passes.forEach(p=>p.dispose?.());composer?.dispose();renderer?.dispose();console.error(error);showError('武汉星球载入失败，请重试。');}
}
function showError(message){canvas.dataset.state='error';canvas.setAttribute('aria-busy','false');$('#loading').hidden=false;$('#loading span').textContent=message;$('#retry').hidden=false;document.querySelectorAll('button:not(#retry)').forEach(b=>{b.disabled=true;});}
$('#retry').addEventListener('click',()=>location.reload());addEventListener('pagehide',event=>{if(!event.persisted)dispose?.();});boot();
