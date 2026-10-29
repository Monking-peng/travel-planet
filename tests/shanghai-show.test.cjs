const {test}=require('node:test');
const assert=require('node:assert/strict');
function element(){
  const maps=[new Map(),new Map(),new Map()];
  const node=map=>({addEventListener(t,f){if(!map.has(t))map.set(t,new Set());map.get(t).add(f);},removeEventListener(t,f){map.get(t)?.delete(f);},dispatch(t,e){for(const f of map.get(t)||[])f(e);}});
  const win={...node(maps[2]),pageXOffset:0,pageYOffset:0},doc={...node(maps[1]),documentElement:{clientLeft:0,clientTop:0}};
  const el={...node(maps[0]),ownerDocument:doc,getRootNode:()=>doc,style:{},clientWidth:1440,clientHeight:960,getBoundingClientRect:()=>({left:0,top:0,width:1440,height:960}),setPointerCapture(){},releasePointerCapture(){}};
  return {el,doc,win,count:()=>maps.flatMap(m=>[...m.values()]).reduce((n,s)=>n+s.size,0)};
}
test('Pointer rotation crosses both poles repeatedly in overview and park close-up without leaking handlers',async()=>{
  const THREE=await import('three'),{FreeOrbitControls,reframeOrbit}=await import('../web/shanghai-camera.js');
  const dom=element(),oldWindow=global.window;global.window=dom.win;
  const camera=new THREE.PerspectiveCamera(35,1,.05,40),up=new THREE.Vector3(-.85,-1.60,-.35).normalize();camera.position.set(2,5,6);let controls;
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),up),target=up.clone().multiplyScalar(2),offset=new THREE.Vector3(0,2,4).applyQuaternion(q);
  try{
    controls=new FreeOrbitControls(camera,dom.el);controls.enableDamping=false;const listeners=dom.count();
    for(let i=0;i<8;i++)controls=reframeOrbit(controls,i%2?up:new THREE.Vector3(0,1,0));
    assert.equal(dom.count(),listeners,'Old pointer and window handlers must be detached');
    for(const close of [false,true]){
      camera.position.copy(offset).add(close?target:new THREE.Vector3());camera.up.copy(up);controls.target.copy(close?target:new THREE.Vector3());controls.update();
      const initial=camera.position.clone().sub(controls.target).normalize(),radius=camera.position.distanceTo(controls.target),worldRadius=camera.position.length();let previous=initial.clone(),travel=0,minDot=1;
      const event=y=>({pointerId:1,pointerType:'mouse',button:0,pageX:720,pageY:y});
      dom.el.dispatch('pointerdown',event(300));
      for(let i=1;i<=180;i++){
        dom.doc.dispatch('pointermove',event(300+i*30));controls.update();const direction=camera.position.clone().sub(controls.target).normalize();
        const step=previous.angleTo(direction);assert.ok(step>.01&&step<.2,'Pointer motion must neither stop at a pole nor jump');travel+=step;minDot=Math.min(minDot,initial.dot(direction));previous=direction;
        assert.ok(Math.abs(camera.position.distanceTo(controls.target)-radius)<1e-7);assert.ok(Number.isFinite(camera.quaternion.w));assert.ok(Math.abs(camera.position.length()-worldRadius)<1e-6,"Close-up rotation must not move the camera through the planet");
      }
      dom.doc.dispatch('pointerup',event(5700));assert.ok(travel>Math.PI*4,'Can rotate through more than two complete turns');assert.ok(minDot<-.99,'Can view the opposite side');
      assert.equal(dom.count(),listeners,'Pointer release removes temporary document listeners');
    }
    const beforeAuto=camera.position.clone(),radius=camera.position.length();controls.autoRotate=true;controls.update(1);
    assert.ok(camera.position.distanceTo(beforeAuto)>.01,'Automatic rotation still moves after free dragging');
    assert.ok(Math.abs(camera.position.length()-radius)<1e-6);controls.autoRotate=false;
    const distance=camera.position.distanceTo(controls.target);dom.el.dispatch('wheel',{deltaMode:0,deltaY:-120,preventDefault(){}});controls.update();
    assert.ok(camera.position.distanceTo(controls.target)<distance,'Wheel zoom remains available');
    const beforePause=camera.position.clone();controls.enabled=false;controls.autoRotate=true;controls.update(1);assert.ok(camera.position.distanceTo(beforePause)<1e-8);
  }finally{controls?.dispose();assert.equal(dom.count(),0);if(oldWindow===undefined)delete global.window;else global.window=oldWindow;}
});
test('Keyboard rotation continues over poles and returns to its original orientation after full turns',async()=>{
  const THREE=await import('three'),{orbitStep}=await import('../web/shanghai-camera.js');
  const initial=new THREE.Vector3(0,0,5),up=new THREE.Vector3(0,1,0);let offset=initial.clone(),travel=0;
  for(let i=0;i<120;i++){const next=orbitStep(offset,up,'ArrowUp',Math.PI/30);travel+=offset.angleTo(next);offset=next;}
  assert.ok(travel>Math.PI*3.99,'Keyboard crosses both poles twice');assert.ok(offset.distanceTo(initial)<1e-7);assert.ok(up.distanceTo(new THREE.Vector3(0,1,0))<1e-7);
});


test('Castle fireworks repeat every 60 seconds, finish between shows and stop in daylight or reduced motion',async()=>{
  const {createDisneyFireworks,FIREWORK_INTERVAL,FIREWORK_DURATION}=await import('../web/shanghai-fireworks.js');const f=createDisneyFireworks();
  try{
    assert.equal(FIREWORK_INTERVAL,60);assert.ok(FIREWORK_DURATION<25);
    f.setNight(true);f.update(0,false);f.update(6,false);assert.ok(f.root.visible&&f.state.particleCount>100);const p=f.root.children[0].geometry.attributes.position;const a=Array.from(p.array.slice(0,f.state.particleCount*3));
    f.update(59,false);assert.equal(f.root.visible,false);assert.equal(f.state.particleCount,0);
    f.update(66,false);assert.equal(f.state.cycle,1);assert.deepEqual(Array.from(p.array.slice(0,f.state.particleCount*3)),a,'The second minute repeats the same complete choreography');
    f.update(67,true);assert.equal(f.root.visible,false);assert.equal(f.state.particleCount,0);
    f.setNight(false);f.update(68,false);assert.equal(f.root.visible,false);
    f.setNight(true);f.update(90,false);f.update(96,false);assert.equal(f.state.cycle,0);assert.deepEqual(Array.from(p.array.slice(0,f.state.particleCount*3)),a);
  }finally{f.dispose();}
});
