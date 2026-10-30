const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Beijing landmark geometry is finite and complete modules detach with all their lights',async()=>{
  const {createBeijingScene}=await import('../web/beijing-scene.js'),{LANDMARKS}=await import('../web/beijing-landmarks.js');const scene=createBeijingScene(),geos=new Set(),textures=new Set(),original=new Map(scene.landmarks);
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,11);
  scene.root.traverse(o=>{if(!o.isMesh)return;geos.add(o.geometry);if(o.material.map)textures.add(o.material.map);for(const key of ['position','normal']){assert.ok(o.geometry.attributes[key]);for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name}: ${key}`);}});
  scene.setNight(true);
  for(const [id,g] of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(o=>o.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o),'removed landmark must not illuminate the remaining scene'));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(disposed,geos.size);
});

test('Beijing spherical footprints stay separate and both hemispheres hold reachable landmarks',async()=>{
  const T=await import('three'),{createBeijingScene}=await import('../web/beijing-scene.js');const scene=createBeijingScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g] of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);radius=Math.max(radius,normal.angleTo(p));}});caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.ok(caps.filter(c=>c.normal.y<0).length>=4);
  }finally{scene.dispose();}
});

test('CCTV keeps a real through-opening rather than a painted dark patch',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{cctv}=await import('../web/beijing-modern.js');const k=makeKit({time:{value:0},night:{value:0}}),g=cctv(k);g.updateMatrixWorld(true);
  const through=new T.Raycaster(new T.Vector3(.01,.33,2),new T.Vector3(0,0,-1));assert.equal(through.intersectObject(g,true).length,0);
  const body=new T.Raycaster(new T.Vector3(-.17,.33,2),new T.Vector3(0,0,-1));assert.ok(body.intersectObject(g,true).length>0);
  g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());
});

test('Tiananmen vaulted doors are open through the gate base',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{tiananmen}=await import('../web/beijing-heritage.js');const k=makeKit({time:{value:0},night:{value:0}}),g=tiananmen(k);g.updateMatrixWorld(true);
  // Start beyond the bridge balustrades, immediately before the gate wall.
  const door=new T.Raycaster(new T.Vector3(.14,.06,-.05),new T.Vector3(0,0,-1));assert.equal(door.intersectObject(g,true).length,0);
  const wall=new T.Raycaster(new T.Vector3(.07,.06,-.05),new T.Vector3(0,0,-1));assert.ok(wall.intersectObject(g,true).length>0);
  g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());
});

test('Blue roofs stay blue at night and Water Cube breathing respects reduced motion',async()=>{
  const {createBeijingScene}=await import('../web/beijing-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/beijing-landmarks.js');const scene=createBeijingScene();
  try{assert.deepEqual([...parseRemovedModules('["heaven","crane","heaven",null]',LANDMARKS)],['heaven']);const blue=[],pulse=[];scene.landmarks.get('heaven').traverse(o=>{if(o.material?.color.getHexString()==='214963')blue.push(o.material);});assert.ok(blue.length);scene.setNight(true);assert.ok(blue.every(m=>m.emissive.b>m.emissive.r));scene.landmarks.get('watercube').traverse(o=>{if(o.material?.userData.pulse)pulse.push(o.material);});assert.ok(pulse.length);scene.update(1,false);const a=pulse[0].emissiveIntensity;scene.update(5,false);assert.notEqual(a,pulse[0].emissiveIntensity);scene.update(5,true);const b=pulse[0].emissiveIntensity;scene.update(25,true);assert.equal(b,pulse[0].emissiveIntensity);scene.setNight(false);scene.update(26,false);assert.equal(pulse[0].emissiveIntensity,0);
  }finally{scene.dispose();}
});
