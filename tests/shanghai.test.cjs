const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Shanghai keeps identifiable landmarks and physically open SWFC portal',async()=>{
  const THREE=await import('three');
  const {makeKit,createLandmark,LANDMARKS}=await import('../web/shanghai-landmarks.js');
  const kit=makeKit({time:{value:0},night:{value:0}});
  const models=LANDMARKS.map(l=>createLandmark(l.id,kit));
  for(let i=0;i<models.length;i++){
    const bounds=new THREE.Box3().setFromObject(models[i]);
    assert.ok(Number.isFinite(bounds.min.x)&&Number.isFinite(bounds.max.y));
    assert.ok(bounds.max.y>LANDMARKS[i].height*.8,LANDMARKS[i].id);
    models[i].traverse(o=>{if(o.isMesh){assert.equal(o.userData.landmark,LANDMARKS[i].id);assert.ok(o.geometry.attributes.position.count>0);}});
  }
  const swfc=models[2],h=LANDMARKS[2].height;swfc.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(0,h-.09,1),new THREE.Vector3(0,0,-1));
  assert.equal(ray.intersectObject(swfc,true).length,0,'The portal must be empty, not a painted rectangle');
  ray.set(new THREE.Vector3(0,h-.22,1),new THREE.Vector3(0,0,-1));
  assert.ok(ray.intersectObject(swfc,true).length>0,'Solid facade remains below the opening');
  const height=models.slice(0,4).map(m=>new THREE.Box3().setFromObject(m).max.y);
  assert.ok(height[1]>height[2]&&height[2]>height[0]&&height[0]>height[3]);
  models.forEach(m=>m.traverse(o=>o.geometry?.dispose()));kit.materials.forEach(m=>m.dispose());
});

test('Shanghai night can restore daylight and freezes animation for reduced motion',async()=>{
  const {createShanghaiScene}=await import('../web/shanghai-scene.js');
  const s=createShanghaiScene();const before=[];
  s.root.traverse(o=>{if(o.material?.emissive)before.push([o.material,o.material.emissiveIntensity]);});
  s.setNight(true);assert.ok(before.some(([m])=>m.emissiveIntensity>0));
  s.update(2,true);const opacity=[];s.root.traverse(o=>{if(o.material?.transparent)opacity.push([o.material,o.material.opacity]);});
  s.update(9,true);opacity.forEach(([m,x])=>assert.equal(m.opacity,x));
  s.update(9,false);assert.ok(opacity.some(([m,x])=>m.opacity!==x));
  s.setNight(false);before.forEach(([m,x])=>assert.equal(m.emissiveIntensity,x));
  assert.equal(s.landmarks.size,17);s.dispose();
});


test('Old-town landmarks can be seen and selected from their close-up viewpoints',async()=>{
  const THREE=await import('three');
  const {LANDMARKS}=await import('../web/shanghai-landmarks.js');
  const {createShanghaiScene,riverX}=await import('../web/shanghai-scene.js');
  const scene=createShanghaiScene();scene.root.updateMatrixWorld(true);
  try{
    for(const info of LANDMARKS.filter(x=>x.grounded)){
      const object=scene.landmarks.get(info.id),target=object.localToWorld(new THREE.Vector3(0,(info.focusY??info.height*.46),0));
      const view=new THREE.Vector3(...info.view).normalize().applyQuaternion(object.quaternion);
      const ray=new THREE.Raycaster(target.clone().addScaledVector(view,info.distance),view.clone().negate());
      const hits=ray.intersectObject(scene.root,true);
      assert.equal(hits[0]?.object.userData.landmark,info.id,'A neighbouring building or the globe must not block the focal point');
    }
    const bridge=LANDMARKS.find(x=>x.id==='waibaidu');
    assert.ok(bridge.x<riverX(bridge.z)-.20,'Bridge is west of the Huangpu');
    assert.ok(Math.abs(bridge.z-(-.94+.07*Math.sin((bridge.x+1.5)*4)))<.01,'Bridge crosses Suzhou Creek');
    const bridgeObject=scene.landmarks.get('waibaidu');
    // The space under the top bracing is open to vehicles in each span.
    for(const z of [-.066,.066]){
      const origin=bridgeObject.localToWorld(new THREE.Vector3(0,.074,z));
      const direction=new THREE.Vector3(0,0,1).applyQuaternion(bridgeObject.quaternion);
      const ray=new THREE.Raycaster(origin,direction,0,.03);
      assert.equal(ray.intersectObject(bridgeObject,true).length,0);
    }
  }finally{scene.dispose();}
});


test('Expo silhouettes preserve the open museum undercroft and the closed arena roof',async()=>{
  const THREE=await import('three');const {makeKit,createLandmark}=await import('../web/shanghai-landmarks.js');
  const k=makeKit({time:{value:0},night:{value:0}}),museum=createLandmark('artMuseum',k),arena=createLandmark('expoArena',k);
  try{
    museum.updateMatrixWorld(true);arena.updateMatrixWorld(true);
    let ray=new THREE.Raycaster(new THREE.Vector3(0,.075,.5),new THREE.Vector3(0,0,-1));
    assert.equal(ray.intersectObject(museum,true).length,0,'The public undercroft stays open between piers');
    ray.set(new THREE.Vector3(0,.22,.5),new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(museum,true).length>0);
    ray.set(new THREE.Vector3(0,.5,0),new THREE.Vector3(0,-1,0));const hits=ray.intersectObject(arena,true);
    assert.ok(hits.length&&hits[0].point.y>.17,'The arena is covered, not an open bowl');
  }finally{for(const g of [museum,arena])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Landmark lighting varies without rotation, stays within its palette, and respects reduced motion',async()=>{
  const {createShanghaiScene}=await import('../web/shanghai-scene.js');
  const s=createShanghaiScene();const animated=new Set(),pearl=new Set();
  s.root.traverse(o=>{if(o.material?.userData.pulse)animated.add(o.material);});
  s.landmarks.get('pearl').traverse(o=>{if(o.material?.userData.night)pearl.add(o.material);});
  const pearlDay=new Map([...pearl].map(m=>[m,m.color.getHex()]));
  const snapshot=()=>[...animated].map(m=>[m.emissiveIntensity,m.emissive.getHex()]);
  try{
    s.setNight(true);s.update(1,false);const a=snapshot();s.update(4,false);const b=snapshot();
    assert.ok(b.some((v,i)=>Math.abs(v[0]-a[i][0])>.15),'Visible luminance change, independent of camera motion');
    assert.ok(b.some((v,i)=>v[1]!==a[i][1]),'Selected architectural lights change colour within a restrained palette');
    assert.deepEqual([...pearl].map(m=>m.userData.pearlLighting).sort(),['antenna','glass','ring','shell','structure','stud']);
    for(let t=0;t<20;t+=.5){
      s.update(t,false);
      for(const m of pearl){
        const role=m.userData.pearlLighting;
        assert.ok([m.emissive.r,m.emissive.g,m.emissive.b,m.emissiveIntensity].every(Number.isFinite));
        assert.equal(m.color.getHex(),pearlDay.get(m),'Every night finish keeps its daytime colour');
        if(role==='glass')assert.ok(m.emissive.r>m.emissive.g*2&&m.emissive.r>m.emissive.b*2&&m.emissiveIntensity<=.1,'Only the existing red glass receives a subtle matching light');
        else assert.ok(m.emissive.g>m.emissive.r*.4&&m.emissive.b>m.emissive.r*.2,'Structures and lamps stay neutral instead of a red wash');
        if(['structure','shell','antenna'].includes(role))assert.ok(m.emissiveIntensity<.3&&!m.userData.pulse,'Steady low-power lighting keeps the original structure visible');
      }
    }
    s.update(2,true);const fixed=snapshot();s.update(20,true);assert.deepEqual(snapshot(),fixed);
    s.setNight(false);s.update(24,false);for(const m of new Set([...animated,...pearl])){assert.equal(m.emissiveIntensity,0);if(m.userData.dayColor)assert.equal(m.color.getHex(),m.userData.dayColor.getHex());}
    s.setNight(true);s.update(24,true);assert.deepEqual(snapshot(),fixed);
  }finally{s.dispose();}
});

test('Enlarged Yu Garden retains a grounded pond and an unobstructed named landmark',async()=>{
  const THREE=await import('three');const {createShanghaiScene,RADIUS}=await import('../web/shanghai-scene.js');
  const s=createShanghaiScene();const g=s.landmarks.get('huxinting');s.root.updateMatrixWorld(true);
  try{
    const local=new THREE.Box3();g.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();local.union(o.geometry.boundingBox);}});
    assert.ok(local.max.x-local.min.x>.79&&local.max.z-local.min.z>.66,'Garden has a substantial, readable footprint');
    assert.ok(local.max.y>.30&&local.max.y<.46,'Heritage landmark height stays below the major towers');
    g.traverse(o=>{if(o.isMesh&&o.material.color.getHexString()==='688f82'){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const world=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);assert.ok(world.length()>RADIUS-.004,'Water surface remains above the globe; rocks and footings may be embedded');}}});
  }finally{s.dispose();}
});

test('The widened skyline keeps separate landmark plots and the river between the banks',async()=>{
  const {LANDMARKS}=await import('../web/shanghai-landmarks.js');
  const {riverX}=await import('../web/shanghai-scene.js');
  const byId=Object.fromEntries(LANDMARKS.map(l=>[l.id,l]));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const towers=['pearl','jinmao','swfc','tower'].map(id=>byId[id]);
  for(let i=0;i<towers.length;i++)for(let j=i+1;j<towers.length;j++)assert.ok(distance(towers[i],towers[j])>=.70,'Tall landmarks need a clear separate footprint');
  for(const [a,b] of [['peace','customs'],['customs','hsbc']])assert.ok(distance(byId[a],byId[b])>=.55,'Bund buildings must not form a single squeezed block');
  assert.ok(distance(byId.jingan,byId.peace)>.65);
  assert.ok(distance(byId.artMuseum,byId.expoArena)>.85);
  for(const l of towers)assert.ok(l.x>riverX(l.z)+.28,'Pudong buildings stay on the east bank');
  for(const id of ['peace','customs','hsbc','huxinting','jingan'])assert.ok(byId[id].x<riverX(byId[id].z)-.28,'Historic landmarks stay on the west bank');
  for(const l of LANDMARKS)assert.ok(Math.hypot(l.x,l.z)<1.85,'Anchors must remain on the spherical map');
});

test('Jingan retains an open courtyard and the Disney entrance is an actual arch',async()=>{
  const THREE=await import('three');const {makeKit,createLandmark}=await import('../web/shanghai-landmarks.js');
  const k=makeKit({time:{value:0},night:{value:0}}),temple=createLandmark('jingan',k),castle=createLandmark('disney',k);
  try{
    temple.updateMatrixWorld(true);castle.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(new THREE.Vector3(0,.5,.13),new THREE.Vector3(0,-1,0));
    const courtyard=ray.intersectObject(temple,true);assert.ok(courtyard.length&&courtyard[0].point.y<.04,'Courtyard must remain open between halls');
    ray.set(new THREE.Vector3(0,.5,-.045),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(temple,true)[0]?.point.y>.17,'Main hall rises above the courtyard');
    ray.set(new THREE.Vector3(0,.115,-.142),new THREE.Vector3(0,0,-1));ray.far=.045;assert.equal(ray.intersectObject(castle,true).length,0,'Door is a modelled opening, not a dark painted rectangle');
    ray.set(new THREE.Vector3(.1155,.115,-.142),new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(castle,true).length>0,'Stone facade remains beside the entrance');
  }finally{for(const g of [temple,castle])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Disney park occupies the reverse hemisphere and its moat follows the spherical ground',async()=>{
  const THREE=await import('three'),{LANDMARKS}=await import('../web/shanghai-landmarks.js');
  const {createShanghaiScene,RADIUS}=await import('../web/shanghai-scene.js');
  const scene=createShanghaiScene(),info=LANDMARKS.find(x=>x.id==='disney'),park=scene.landmarks.get('disney');
  scene.root.updateMatrixWorld(true);
  try{
    assert.equal(info.hemisphere,-1);assert.ok(park.position.y<-.8,'Park occupies the previously empty reverse hemisphere');
    // Actual ground footprints are checked separately; a fixed center-distance
    // threshold cannot account for different attraction sizes on the sphere.
    const local=new THREE.Box3();let waterVertices=0;
    park.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();local.union(o.geometry.boundingBox);
      if(o.material.color.getHexString()==='528f92'){const p=o.geometry.attributes.position;waterVertices+=p.count;for(let i=0;i<p.count;i++){
        const point=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
        assert.ok(point.length()>RADIUS&&point.length()<RADIUS+.07,'Moat stays above the globe without floating');
      }}
    });
    assert.ok(local.max.x-local.min.x>2.4&&local.max.z-local.min.z>2.3,'Park includes landscaped space around the castle');
    assert.ok(waterVertices>100);
  }finally{scene.dispose();}
});


test('Reverse-side park selection and camera movement respect the globe and local vertical',async()=>{
  const THREE=await import('three'),{createShanghaiScene}=await import('../web/shanghai-scene.js');
  const {visibleLandmark,orbitStep,transitionPosition}=await import('../web/shanghai-camera.js');
  const scene=createShanghaiScene();scene.root.updateMatrixWorld(true);
  try{
    const park=scene.landmarks.get('disney'),out=park.position.clone().normalize();
    const ray=new THREE.Raycaster(out.clone().multiplyScalar(-5),out.clone());
    assert.notEqual(visibleLandmark(scene.root,ray),'disney','Globe must occlude back-side park picking');
    ray.set(park.localToWorld(new THREE.Vector3(0,3,0)),out.clone().negate());
    assert.equal(visibleLandmark(scene.root,ray),'disney','Directly visible park remains selectable');
    const up=new THREE.Vector3(0,1,0).applyQuaternion(park.quaternion),d=new THREE.Vector3(.2,1,2).applyQuaternion(park.quaternion);
    const next=orbitStep(d,up,'ArrowLeft');assert.ok(Math.abs(next.length()-d.length())<1e-8);assert.ok(Math.abs(next.dot(up)-d.dot(up))<1e-8,'Horizontal rotation preserves local elevation');
    const from=new THREE.Vector3(2,6,6),to=out.multiplyScalar(6);
    for(let i=0;i<=30;i++)assert.ok(transitionPosition(from,to,i/30).length()>5.9,'Transition never flies through globe');
  }finally{scene.dispose();}
});
