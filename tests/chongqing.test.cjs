const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Hongya galleries have actual setback depth and the riverfront entrance stays open',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{hongya}=await import('../web/chongqing-hongya.js');
 const k=makeKit({time:{value:0},night:{value:0}}),g=hongya(k);g.updateMatrixWorld(true);
 try{
  const meshes=[];g.traverse(o=>{if(o.isMesh)meshes.push(o);});
  const gallery=new T.Raycaster(new T.Vector3(-.49,.083,.32),new T.Vector3(0,0,-1),0,.079);
  assert.equal(gallery.intersectObjects(meshes).length,0,'Balcony must have clear depth ahead of the recessed room');
  gallery.far=.15;assert.ok(gallery.intersectObjects(meshes).length>0,'Recessed room must still exist behind the balcony');
  const masonry=meshes.filter(o=>o.material.userData.hongyaStone);
  const entry=new T.Raycaster(new T.Vector3(.602,.080,.28),new T.Vector3(0,0,-1),0,.11);
  assert.equal(entry.intersectObjects(masonry).length,0,'Street arch must not be a painted opening');
  entry.ray.origin.x=.665;assert.ok(entry.intersectObjects(masonry).length>0,'Arch side pier must remain solid');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Chongqing landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createChongqingScene,RADIUS}=await import('../web/chongqing-scene.js'),s=createChongqingScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Chongqing bridge has an open spindle tower and Liziba preserves a true rail passage',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{qiansimen}=await import('../web/chongqing-riverfront.js'),{liziba}=await import('../web/chongqing-transit.js');
 const k=makeKit({time:{value:0},night:{value:0}}),bridge=qiansimen(k),station=liziba(k);bridge.updateMatrixWorld(true);station.updateMatrixWorld(true);
 try {const tower=[];bridge.traverse(o=>{if(o.material?.userData.bridgeTower)tower.push(o);});assert.ok(tower.length);let ray=new T.Raycaster(new T.Vector3(-.18,.5,.4),new T.Vector3(0,0,-1),0,.8);assert.equal(ray.intersectObjects(tower).length,0,'Tower must not close its central opening');
 const walls=[];station.traverse(o=>{if(o.material?.userData.stationMasonry)walls.push(o);});ray=new T.Raycaster(new T.Vector3(-.8,.33,0),new T.Vector3(1,0,0),0,1.6);assert.equal(ray.intersectObjects(walls).length,0,'Rail passage must remain clear');ray.ray.origin.y=.55;assert.ok(ray.intersectObjects(walls).length>0,'Homes above the station must remain solid');
 }finally{for(const g of [bridge,station])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Chongqing module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createChongqingScene}=await import('../web/chongqing-scene.js'),s=createChongqingScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});
