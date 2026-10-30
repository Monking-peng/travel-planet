const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Guangzhou landmarks stay on land, above the globe and separated on two hemispheres',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS,channelX}=await import('../web/guangzhou-scene.js');const scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g]of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks into terrain`);radius=Math.max(radius,normal.angleTo(p));p.normalize().multiplyScalar(RADIUS);if(id!=='haixin')assert.ok(Math.abs(p.x-channelX(Math.atan2(p.z,p.y)))>.25,`${id} intrudes into the river`);}});if(id!=='haixin')caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.equal(caps.filter(c=>c.normal.y<0).length,4);
  }finally{scene.dispose();}
});

test('Guangzhou complete landmark modules detach with their lighting and release resources once',async()=>{
  const {createGuangzhouScene}=await import('../web/guangzhou-scene.js'),{LANDMARKS}=await import('../web/guangzhou-landmarks.js');const scene=createGuangzhouScene(),original=new Map(scene.landmarks),geometries=new Set();
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,10);
  scene.root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const key of ['position','normal'])for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name} ${key}`);});
  scene.setNight(true);
  for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o)));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let count=0;geometries.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(count,geometries.size);
});

test('Guangzhou night lights change gently, preserve base colors and respect reduced motion',async()=>{
  const {createGuangzhouScene}=await import('../web/guangzhou-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/guangzhou-landmarks.js');const scene=createGuangzhouScene();
  try{assert.deepEqual([...parseRemovedModules('["canton","palace","canton",null]',LANDMARKS)],['canton']);const colors=new Map(),pulse=[];scene.landmarks.forEach(g=>g.traverse(o=>{if(o.material?.color)colors.set(o.material,o.material.color.clone());if(o.material?.userData.pulse)pulse.push(o.material);}));assert.ok(pulse.length);scene.setNight(true);colors.forEach((color,m)=>assert.ok(m.color.equals(color)));scene.update(1,false);const values=pulse.map(m=>m.emissiveIntensity);scene.update(4,false);assert.ok(pulse.some((m,i)=>m.emissiveIntensity!==values[i]));scene.update(5,true);const still=pulse.map(m=>m.emissiveIntensity);scene.update(30,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),still);scene.setNight(false);scene.update(31,false);assert.ok(pulse.every(m=>m.emissiveIntensity===0));}
  finally{scene.dispose();}
});

test('Haixin pedestrian deck crosses the river above water with an open single arch',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{
    const bridge=scene.landmarks.get('haixin'),water=scene.root.getObjectByName('guangzhou-waterways');
    const bent=([x,y,z])=>new T.Vector3(x,y-RADIUS+Math.sqrt(RADIUS*RADIUS-x*x-z*z),z).applyMatrix4(bridge.matrixWorld);
    for(const sample of bridge.userData.deckSamples){const center=bent(sample),normal=center.clone().normalize(),ray=new T.Raycaster(normal.clone().multiplyScalar(RADIUS+1),normal.clone().negate());const deck=ray.intersectObject(bridge,true),river=ray.intersectObject(water);assert.ok(deck.length&&river.length,'The deck must cross the actual river, not nearby grass');assert.ok(deck[0].point.distanceTo(center)<.012,'Pedestrian centerline remains a clear walkable surface');assert.ok(deck[0].point.length()-river[0].point.length()>.08,'Usable clearance remains above the river');}
    const crown=bent(bridge.userData.archSamples[6]),deck=bent(bridge.userData.deckSamples[1]);assert.ok(crown.length()-deck.length()>.25,'The single arch must remain above the walking deck');
  }finally{scene.dispose();}
});

test('Guangzhou riverbank walks join the bridge and three plaza landmarks without crossing the water',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS,channelX}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();
  try{
    const walks=scene.root.getObjectByName('guangzhou-riverfront');assert.ok(walks);assert.ok(walks.userData.connections.length>=6);assert.equal(walks.userData.bridgeLinks.length,4);assert.deepEqual(walks.userData.districtLinks.map(x=>x.to),['twins','opera','museum']);
    walks.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i);assert.ok(v.length()>RADIUS,'Paving must remain above the terrain');v.normalize().multiplyScalar(RADIUS);assert.ok(Math.abs(v.x-channelX(Math.atan2(v.z,v.y)))>.22,'Bank walk should not be laid on water');}});
    for(const id of [...scene.landmarks.keys()])scene.setLandmarkEnabled(id,false);assert.equal(walks.parent,scene.root,'The shared riverbanks survive landmark removal');
  }finally{scene.dispose();}
});
