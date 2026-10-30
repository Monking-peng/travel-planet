const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Shunde landmarks stay on land, above the globe and separated on two hemispheres',async()=>{
  const T=await import('three'),{createShundeScene,RADIUS,channelX}=await import('../web/shunde-scene.js');const scene=createShundeScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g]of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks into terrain`);radius=Math.max(radius,normal.angleTo(p));p.normalize().multiplyScalar(RADIUS);assert.ok(Math.abs(p.x-channelX(Math.atan2(p.z,p.y)))>.10,`${id} intrudes into the river`);}});caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.equal(caps.filter(c=>c.normal.y<0).length,4);
  }finally{scene.dispose();}
});

test('Shunfengshan three arches and the Fengjian bridge pass through their masonry',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{shunfengGate,fengjian}=await import('../web/shunde-streets.js');const k=makeKit({time:{value:0},night:{value:0}}),gate=shunfengGate(k),village=fengjian(k);gate.updateMatrixWorld(true);village.updateMatrixWorld(true);
  try{for(const x of [-.36,0,.36]){const ray=new T.Raycaster(new T.Vector3(x,.10,.07),new T.Vector3(0,0,-1),0,.15);assert.equal(ray.intersectObject(gate,true).length,0);}
    const wall=new T.Raycaster(new T.Vector3(.20,.10,.07),new T.Vector3(0,0,-1),0,.15);assert.ok(wall.intersectObject(gate,true).length>0);
    const channel=new T.Raycaster(new T.Vector3(-.4,.085,.07),new T.Vector3(1,0,0),0,.55);assert.equal(channel.intersectObject(village,true).length,0);
  }finally{for(const g of [gate,village])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Shunde complete landmark modules detach with their lighting and release resources once',async()=>{
  const {createShundeScene}=await import('../web/shunde-scene.js'),{LANDMARKS}=await import('../web/shunde-landmarks.js');const scene=createShundeScene(),original=new Map(scene.landmarks),geometries=new Set();
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,8);
  scene.root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const key of ['position','normal'])for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name} ${key}`);});
  scene.setNight(true);
  for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o)));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let count=0;geometries.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(count,geometries.size);
});

test('Shunde night lights change gently, preserve base colors and respect reduced motion',async()=>{
  const {createShundeScene}=await import('../web/shunde-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/shunde-landmarks.js');const scene=createShundeScene();
  try{assert.deepEqual([...parseRemovedModules('["hem","palace","hem",null]',LANDMARKS)],['hem']);const colors=new Map(),pulse=[];scene.landmarks.forEach(g=>g.traverse(o=>{if(o.material?.color&&!o.material.userData.terrainTint)colors.set(o.material,o.material.color.clone());if(o.material?.userData.pulse)pulse.push(o.material);}));assert.ok(pulse.length);scene.setNight(true);colors.forEach((color,m)=>assert.ok(m.color.equals(color)));scene.update(1,false);const values=pulse.map(m=>m.emissiveIntensity);scene.update(4,false);assert.ok(pulse.some((m,i)=>m.emissiveIntensity!==values[i]));scene.update(5,true);const still=pulse.map(m=>m.emissiveIntensity);scene.update(30,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),still);scene.setNight(false);scene.update(31,false);assert.ok(pulse.every(m=>m.emissiveIntensity===0));}
  finally{scene.dispose();}
});

test('Shunfeng park keeps its lake open and its five bridges and pagoda grounded',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{shunfeng}=await import('../web/shunde-park.js'),k=makeKit({time:{value:0},night:{value:0}}),park=shunfeng(k);park.updateMatrixWorld(true);
  try{
    const soil=park.children.find(o=>o.material?.userData.terrainTint),{tower,bridges,bridgeSamples}=park.userData;
    assert.equal(bridges.length,5);assert.equal(tower.storeys,7);assert.ok(park.userData.trees.length>65);
    const lakeRay=new T.Raycaster(new T.Vector3(-.08,.9,-.20),new T.Vector3(0,-1,0)),lakeHit=lakeRay.intersectObject(park,true)[0];assert.ok(lakeHit&&lakeHit.point.y>.015&&lakeHit.point.y<.025,'central water must not be covered by terrain');
    const hillRay=new T.Raycaster(new T.Vector3(tower.x,1,tower.z),new T.Vector3(0,-1,0)),hill=hillRay.intersectObject(soil)[0];assert.ok(hill&&hill.point.y>.12&&hill.point.y<tower.baseY+.003,'tower must sit on an upward-facing hill');
    for(const [x,y,z]of bridgeSamples){const ray=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,-1,0)),ground=ray.intersectObject(soil)[0];assert.ok(ground&&y-ground.point.y>.009,'white bridge deck must clear the hill at the landing');}
    for(const {x,z}of bridges){const ray=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,-1,0)),hit=ray.intersectObject(park,true)[0];assert.ok(hit&&hit.point.y>.08,'all five entrance bridges must span the water');}
  }finally{park.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Shunde riverside paths stay on land, meet all eight modules and survive removal',async()=>{
  const T=await import('three'),{createShundeScene,RADIUS,channelX}=await import('../web/shunde-scene.js'),scene=createShundeScene();
  try{
    const paths=scene.root.getObjectByName('shunde-riverside-walks');assert.equal(paths.userData.connections.length,8);
    for(const v of paths.userData.samples){const p=new T.Vector3(...v);assert.ok(p.length()>RADIUS+.008&&p.length()<RADIUS+.021);p.normalize().multiplyScalar(RADIUS);assert.ok(Math.abs(p.x-channelX(Math.atan2(p.z,p.y)))>.10,'walkways must avoid the channel');}
    const soil=[];scene.landmarks.get('shunfeng').traverse(o=>{if(o.material?.userData.terrainTint)soil.push(o.material);});assert.equal(soil.length,1);scene.setNight(true);
    const expected=new T.Color('#314b44'),edge=new T.Color('#91a18a').multiply(soil[0].color);assert.ok(Math.abs(edge.r-expected.r)+Math.abs(edge.g-expected.g)+Math.abs(edge.b-expected.b)<1e-6);assert.equal(soil[0].emissive.getHex(),0);
    scene.setLandmarkEnabled('shunfeng',false);assert.ok(paths.parent===scene.root);scene.setNight(false);assert.equal(soil[0].color.getHex(),0xffffff);
  }finally{scene.dispose();}
});
