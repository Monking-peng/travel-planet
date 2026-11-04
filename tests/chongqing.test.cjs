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

test('Raffles has eight separate tower frames, open Crystal gardens and continuous pedestrian connections',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{raffles}=await import('../web/chongqing-raffles.js');
 const k=makeKit({time:{value:0},night:{value:0}}),g=raffles(k);g.updateMatrixWorld(true);
 try{
  const meshes=[],towers=[];g.traverse(o=>{if(o.isMesh){meshes.push(o);if(Number.isInteger(o.material.userData.rafflesTower))towers.push(o);}});
  assert.equal(new Set(towers.map(o=>o.material.userData.rafflesTower)).size,8);
  const heights=towers.map(o=>new T.Box3().setFromObject(o).max.y);assert.equal(heights.filter(y=>y>1.5).length,2);assert.equal(heights.filter(y=>y<1.3).length,6);
  for(const side of [-1,1]){
   const clear=new T.Raycaster(new T.Vector3(side*.76,1.28,.162),new T.Vector3(-side,0,0),0,.14);
   assert.equal(clear.intersectObjects(meshes).length,0,'Crystal end garden must remain open, not a capped pipe');
   const deck=new T.Raycaster(new T.Vector3(side*.69,1.28,.16),new T.Vector3(0,-1,0),0,.10).intersectObjects(meshes);
   assert.ok(deck.length>0 && Math.abs(deck[0].point.y-1.20)<.003,'End garden needs a walkable deck');
  }
  const shell=meshes.filter(o=>o.material.userData.crystalShell);
  assert.ok(new T.Raycaster(new T.Vector3(0,1.24,.50),new T.Vector3(0,0,-1),0,.30).intersectObjects(shell).length>0,'Central conservatory must retain glazing');
  for(const x of [-.205,.205])for(let z=-.18;z<=.07;z+=.01){
   const hits=new T.Raycaster(new T.Vector3(x,1.30,z),new T.Vector3(0,-1,0),0,.14).intersectObjects(meshes);
   assert.ok(hits.length>0,`Conservatory bridge has a gap at ${x},${z.toFixed(2)}`);
  }
  for(let i=0;i<12;i++){
   const z=.745-i*.014,top=.031+(i+1)*.0108;
   const hits=new T.Raycaster(new T.Vector3(0,.19,z),new T.Vector3(0,-1,0),0,.20).intersectObjects(meshes);
   assert.ok(hits.length>0 && Math.abs(hits[0].point.y-top)<.001,`Podium step ${i} must not be buried`);
  }
  for(let z=.53;z<=.59;z+=.005){const hits=new T.Raycaster(new T.Vector3(0,.19,z),new T.Vector3(0,-1,0),0,.04).intersectObjects(meshes);assert.ok(hits.length>0,'Upper stair must connect to roof park');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Grand Theater keeps panel coordinates, recessed foyers, supported windows and continuous podium stairs',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{theatre}=await import('../web/chongqing-theatre.js');
 const k=makeKit({time:{value:0},night:{value:0}}),g=theatre(k);g.updateMatrixWorld(true);
 try{
  const meshes=[],cladding=[],stages=[],slots=[];g.traverse(o=>{if(!o.isMesh)return;meshes.push(o);if(o.material.userData.theatreGlass)cladding.push(o);if(o.material.userData.theatreStage)stages.push(o);if(o.material.userData.theatreSlot)slots.push(o);});
  assert.equal(stages.length,2);assert.ok(Math.abs(new T.Box3().setFromObject(stages[0]).max.y-.72)<.002);assert.ok(Math.abs(new T.Box3().setFromObject(stages[1]).max.y-.55)<.002);
  for(const o of cladding){assert.equal(o.geometry.attributes.uv.count,o.geometry.attributes.position.count);assert.ok(o.geometry.attributes.uv.array.some(v=>v>2),'Glass joints must survive mesh merging');}
  for(const x of [-.11,.11]){
   const ray=new T.Raycaster(new T.Vector3(x,.15,.80),new T.Vector3(0,0,-1),0,.205);assert.equal(ray.intersectObjects(meshes).length,0,'Foyer entrance must have actual depth');ray.far=.29;assert.ok(ray.intersectObjects(meshes).length>0,'Entrance needs recessed glazing');
  }
  assert.ok(slots.length>0);
  for(const o of slots){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i+=24){
   const b=new T.Box3();for(let j=0;j<24;j++)b.expandByPoint(new T.Vector3().fromBufferAttribute(a,i+j));const c=b.getCenter(new T.Vector3()),side=Math.sign(c.x);
   for(const y of [c.y,b.max.y-.001]){const ray=new T.Raycaster(new T.Vector3(c.x+side*.01,y,c.z),new T.Vector3(-side,0,0),0,.02);assert.ok(ray.intersectObjects(cladding).length>0,`Window at ${c.x.toFixed(2)},${y.toFixed(2)},${c.z.toFixed(2)} must touch its glass facade`);}
  }}
  for(let i=0;i<9;i++){const top=.018+(i+1)*.0098,z=.936-i*.018,hits=new T.Raycaster(new T.Vector3(0,.16,z),new T.Vector3(0,-1,0),0,.15).intersectObjects(meshes);assert.ok(hits.length&&Math.abs(hits[0].point.y-top)<.001,`Podium step ${i} is blocked`);}
  for(let z=.72;z<.80;z+=.005)assert.ok(new T.Raycaster(new T.Vector3(0,.16,z),new T.Vector3(0,-1,0),0,.06).intersectObjects(meshes).length>0,'Stairs must reach the upper plaza');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});

test('Great Hall ceremonial portals stay open and terraces continuously reach the columned entry',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{greatHall}=await import('../web/chongqing-hall.js'),k=makeKit({time:{value:0},night:{value:0}}),g=greatHall(k);g.updateMatrixWorld(true);const meshes=[];g.traverse(o=>{if(o.isMesh)meshes.push(o);});
 try{
  for(const x of [-.23,0,.23])assert.equal(new T.Raycaster(new T.Vector3(x,.12,1.02),new T.Vector3(0,0,-1),0,.30).intersectObjects(meshes).length,0,'Ceremonial portal must be traversable');
  let previous=0;
  for(let z=.91;z>=.14;z-=.005){const hit=new T.Raycaster(new T.Vector3(0,.13,z),new T.Vector3(0,-1,0),0,.15).intersectObjects(meshes)[0];assert.ok(hit,'Main approach must have a walking surface');assert.ok(hit.point.y>=.015&&hit.point.y<=.115,'Main approach must not fall into terrain or hit a wall');assert.ok(Math.abs(hit.point.y-previous)<.025,'Terraces must connect without an abrupt step');previous=hit.point.y;}
  const bounds=new T.Box3().setFromObject(g);assert.ok(bounds.max.y>1.12&&bounds.max.y<1.15);assert.ok(bounds.max.x>.89&&bounds.min.x<-.89);
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});
