const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Wuhan roofs, landmarks, lights and terrain contain finite geometry; cached modules dispose exactly once',async()=>{
  const {createWuhanScene}=await import('../web/wuhan-scene.js'),{LANDMARKS}=await import('../web/wuhan-landmarks.js');const scene=createWuhanScene(),geos=new Set();
  try{assert.equal(scene.landmarks.size,17);assert.equal(new Set(LANDMARKS.map(l=>l.id)).size,17);scene.root.traverse(o=>{if(!o.isMesh)return;geos.add(o.geometry);for(const name of ['position','normal']){const a=o.geometry.attributes[name];assert.ok(a);for(const n of a.array)assert.ok(Number.isFinite(n),`${name} cannot contain broken roof coordinates`);}});
    const count=()=>{let n=0;scene.root.traverse(()=>n++);return n;},baseline=count(),original=new Map(scene.landmarks);
    scene.setNight(true);const crane=original.get('crane'),lights=[];crane.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.some(l=>l.intensity>0));scene.setLandmarkEnabled('crane',false);assert.equal(crane.parent,null);scene.setLandmarkEnabled('crane',true);assert.equal(count(),baseline);
    for(let round=0;round<2;round++){for(const id of original.keys())scene.setLandmarkEnabled(id,false);assert.equal(scene.landmarks.size,0);for(const [id,g] of original){scene.setLandmarkEnabled(id,true);assert.equal(scene.landmarks.get(id),g);}assert.equal(count(),baseline);}
    assert.equal(scene.setLandmarkEnabled('unknown',true),false);scene.setNight(false);assert.ok(lights.every(l=>l.intensity===0));
    let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();assert.equal(disposed,geos.size);
  }catch(e){scene.dispose();throw e;}
});

test('Every non-bridge Wuhan landmark stays outside the actual Yangtze and Han water triangles',async()=>{
  const T=await import('three'),{createWuhanScene,RADIUS}=await import('../web/wuhan-scene.js');const scene=createWuhanScene();scene.root.updateMatrixWorld(true);
  try{const waters=scene.root.getObjectByName('wuhan-rivers').children;assert.equal(waters.length,2);const triangles=[];
    for(const mesh of waters){const a=mesh.geometry.attributes.position,idx=mesh.geometry.index;for(let i=0;i<idx.count;i+=3){const pts=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,idx.getX(i+j)).applyMatrix4(mesh.matrixWorld).normalize());triangles.push({pts,center:pts[0].clone().add(pts[1]).add(pts[2]).normalize(),radius:Math.max(pts[0].distanceTo(pts[1]),pts[1].distanceTo(pts[2]),pts[2].distanceTo(pts[0]))});}}
    const cross=new T.Vector3();let checked=0;
    for(const [id,g] of scene.landmarks){if(id==='bridge')continue;const samples=new Map();g.traverse(m=>{if(!m.isMesh||m.userData.nightOnly)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).normalize(),key=p.toArray().map(n=>n.toFixed(4)).join(',');if(!samples.has(key))samples.set(key,p);}});
      for(const p of samples.values()){checked++;for(const {pts,center,radius} of triangles){if(p.distanceToSquared(center)>radius*radius)continue;const signs=pts.map((a,i)=>cross.crossVectors(a,pts[(i+1)%3]).dot(p));assert.ok(!(signs.every(n=>n>1e-9)||signs.every(n=>n< -1e-9)),`${id} over river at ${p.clone().multiplyScalar(RADIUS).toArray()}`);}}
    }assert.ok(checked>50000);
  }finally{scene.dispose();}
});

test('Wuhan night animation honors reduced motion and module settings cannot affect Shanghai',async()=>{
  const {createWuhanScene}=await import('../web/wuhan-scene.js'),{MODULE_STORAGE_KEY,parseRemovedModules}=await import('../web/wuhan-module-panel.js'),sh=await import('../web/shanghai-module-panel.js');const scene=createWuhanScene();
  try{assert.notEqual(MODULE_STORAGE_KEY,sh.MODULE_STORAGE_KEY);assert.deepEqual([...parseRemovedModules('["crane","disney","crane",null]')],['crane']);scene.setNight(true);const pulse=[];scene.landmarks.get('han').traverse(o=>{if(o.material?.userData.pulse)pulse.push(o.material);});assert.ok(pulse.length);scene.update(1,false);const a=pulse[0].emissiveIntensity;scene.update(4,false);assert.notEqual(a,pulse[0].emissiveIntensity);scene.update(4,true);const b=pulse[0].emissiveIntensity;scene.update(14,true);assert.equal(b,pulse[0].emissiveIntensity);scene.setNight(false);scene.update(20,false);assert.equal(pulse[0].emissiveIntensity,0);
  }finally{scene.dispose();}
});

test('Wuhan ground footprints keep clearance on the sphere, including the reverse-side lake and museum',async()=>{
  const T=await import('three'),{createWuhanScene,RADIUS}=await import('../web/wuhan-scene.js');const scene=createWuhanScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g] of scene.landmarks){if(id==='bridge')continue;const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh||m.userData.nightOnly)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);if(p.length()<RADIUS+.12)radius=Math.max(radius,normal.angleTo(p));}});caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.ok(scene.landmarks.get('eastlake').position.y<0&&scene.landmarks.get('museum').position.y<0);
  }finally{scene.dispose();}
});

test('The complete cherry avenue and its night lights detach, restore and release together',async()=>{
  const {createWuhanScene}=await import('../web/wuhan-scene.js');const scene=createWuhanScene(),campus=scene.landmarks.get('university'),lights=[],nightObjects=[],textures=new Set();
  campus.traverse(o=>{if(o.isLight)lights.push(o);if(o.userData.nightOnly)nightObjects.push(o);if(o.material?.map)textures.add(o.material.map);});
  assert.ok(lights.length>=4&&nightObjects.length>=20);assert.ok(campus.position.y<0,'expanded campus has a separate hemisphere');
  scene.setNight(true);assert.ok(lights.every(l=>l.intensity>0));assert.ok(nightObjects.every(o=>o.visible));scene.setLandmarkEnabled('university',false);
  scene.root.traverse(o=>assert.ok(!lights.includes(o)&&!nightObjects.includes(o),'no orphan campus lighting'));
  scene.setLandmarkEnabled('university',true);assert.equal(scene.landmarks.get('university'),campus);scene.setNight(false);assert.ok(lights.every(l=>l.intensity===0));assert.ok(nightObjects.every(o=>!o.visible));
  const released=new Map([...textures].map(t=>[t,0]));textures.forEach(t=>t.addEventListener('dispose',()=>released.set(t,released.get(t)+1)));scene.dispose();assert.ok([...released.values()].every(n=>n===1),'shared halo texture released once');
});

test('Yellow Crane Tower upper roof is closed over its central room',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{crane}=await import('../web/wuhan-crane.js');const k=makeKit({time:{value:0},night:{value:0}}),g=crane(k);g.updateMatrixWorld(true);
  const ray=new T.Raycaster(new T.Vector3(.012,1.2,.011),new T.Vector3(0,-1,0));const hits=ray.intersectObject(g,true);assert.ok(hits.length&&hits[0].point.y>.83,'roof cap covers the upper gallery');
  g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());
});
