const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Shenzhen complete landmark modules detach with their lighting and release resources once',async()=>{
  const {createShenzhenScene}=await import('../web/shenzhen-scene.js'),{LANDMARKS}=await import('../web/shenzhen-landmarks.js');const scene=createShenzhenScene(),original=new Map(scene.landmarks),geometries=new Set();
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,10);
  scene.root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const key of ['position','normal'])for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name} ${key}`);});
  scene.setNight(true);
  for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o)));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let count=0;geometries.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(count,geometries.size);
});

test('Shenzhen models stay above ground, off the bay and separated across both hemispheres',async()=>{
  const T=await import('three'),{createShenzhenScene,RADIUS,shorelineZ}=await import('../web/shenzhen-scene.js');const scene=createShenzhenScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g]of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks into terrain`);radius=Math.max(radius,normal.angleTo(p));p.normalize().multiplyScalar(RADIUS);assert.ok(p.z<shorelineZ(Math.atan2(p.y,p.x))-.02,`${id} intrudes into water`);}});caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.ok(caps.filter(c=>c.normal.y<0).length>=4);assert.ok(scene.root.getObjectByName('shenzhen-bay'));
  }finally{scene.dispose();}
});

test('Dapeng gate has a through-opening and solid wall on both sides',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{dapeng}=await import('../web/shenzhen-places.js');const k=makeKit({time:{value:0},night:{value:0}}),g=dapeng(k);g.updateMatrixWorld(true);
  try{const open=new T.Raycaster(new T.Vector3(0,.08,.10),new T.Vector3(0,0,-1));assert.equal(open.intersectObject(g,true).length,0);for(const x of [-.12,.12]){const wall=new T.Raycaster(new T.Vector3(x,.08,.10),new T.Vector3(0,0,-1));assert.ok(wall.intersectObject(g,true).length>0);}}
  finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Shenzhen night lights change gently, preserve base colors and respect reduced motion',async()=>{
  const {createShenzhenScene}=await import('../web/shenzhen-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/shenzhen-landmarks.js');const scene=createShenzhenScene();
  try{assert.deepEqual([...parseRemovedModules('["wheel","palace","wheel",null]',LANDMARKS)],['wheel']);const colors=new Map(),pulse=[];scene.landmarks.forEach(g=>g.traverse(o=>{if(o.material?.color)colors.set(o.material,o.material.color.clone());if(o.material?.userData.pulse)pulse.push(o.material);}));assert.ok(pulse.length);scene.setNight(true);colors.forEach((color,m)=>assert.ok(m.color.equals(color)));scene.update(1,false);const values=pulse.map(m=>m.emissiveIntensity);scene.update(4,false);assert.ok(pulse.some((m,i)=>m.emissiveIntensity!==values[i]));scene.update(5,true);const still=pulse.map(m=>m.emissiveIntensity);scene.update(30,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),still);scene.setNight(false);scene.update(31,false);assert.ok(pulse.every(m=>m.emissiveIntensity===0));}
  finally{scene.dispose();}
});
