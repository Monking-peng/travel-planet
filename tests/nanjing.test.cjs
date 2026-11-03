const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Mausoleum has three open stone portals, a taller central arch and a closed rear wall',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{mausoleum}=await import('../web/nanjing-mausoleum.js'),k=makeKit({time:{value:0},night:{value:0}}),g=mausoleum(k);g.updateMatrixWorld(true);
 try{const walls=[];g.traverse(o=>{if(o.material?.userData.memorialFacade)walls.push(o);});
  const front=(x,y)=>new T.Raycaster(new T.Vector3(x,y,.30),new T.Vector3(0,0,-1),0,.50).intersectObjects(walls);
  for(const x of [-.18,0,.18])assert.equal(front(x,.36).length,0,'Portal must open into the room rather than use a black wall decal');
  assert.ok(front(.09,.36).length>0,'Stone between the portals must remain solid');
  assert.equal(front(0,.453).length,0,'The central arch rises above the side arches');assert.ok(front(.18,.453).length>0);
  const rear=new T.Raycaster(new T.Vector3(0,.59,-.80),new T.Vector3(0,0,1),0,.40);assert.ok(rear.intersectObjects(walls).length>0,'Rear wall must meet the upper roof without a visible gap');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Nanjing gates preserve the full passage and both bridge eyes stay open above the deck',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{zhonghua}=await import('../web/nanjing-fortifications.js'),{eye}=await import('../web/nanjing-modern.js');
 const k=makeKit({time:{value:0},night:{value:0}}),gate=zhonghua(k),bridge=eye(k);gate.updateMatrixWorld(true);bridge.updateMatrixWorld(true);
 try{
  const walls=[],rings=[];gate.traverse(o=>{if(o.material?.userData.cityGate)walls.push(o);});bridge.traverse(o=>{if(o.material?.userData.eyeTower)rings.push(o);});
  let ray=new T.Raycaster(new T.Vector3(0,.08,.80),new T.Vector3(0,0,-1),0,1.6);assert.equal(ray.intersectObjects(walls).length,0,'All four gate passages must connect');ray.ray.origin.x=.17;assert.ok(ray.intersectObjects(walls).length>0,'Walls beside the gate must remain solid');
  for(const x of [-.345,-.230,-.115,0,.115,.230,.345]){ray=new T.Raycaster(new T.Vector3(x,.257,-.20),new T.Vector3(0,0,-1),0,.30);assert.equal(ray.intersectObjects(walls).length,0,'Upper caves must have real depth');}
  ray=new T.Raycaster(new T.Vector3(-1,.24,0),new T.Vector3(1,0,0),0,2);assert.equal(ray.intersectObjects(rings).length,0,'A person on the deck must pass through both elliptical eyes');
  ray.ray.origin.y=.67;assert.ok(ray.intersectObjects(rings).length>0,'The upper portions of both eye towers must exist');
 }finally{for(const g of [gate,bridge])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Nanjing landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createNanjingScene,RADIUS}=await import('../web/nanjing-scene.js'),s=createNanjingScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Nanjing module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createNanjingScene}=await import('../web/nanjing-scene.js'),s=createNanjingScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});
