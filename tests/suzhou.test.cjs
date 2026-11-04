const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Tiger Hill tower keeps seven recessed openings and a continuous level stair approach',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{tiger}=await import('../web/suzhou-tiger.js'),k=makeKit({time:{value:0},night:{value:0}}),g=tiger(k);g.updateMatrixWorld(true);
 try{const walls=[];g.traverse(o=>{if(o.material?.userData.tigerMasonry)walls.push(o);});const transform=new T.Matrix4().makeRotationZ(-.041);transform.setPosition(0,.068,0);let y=0,floor=0;
  for(const h of [.169,.157,.151,.145,.139,.133,.127]){const origin=new T.Vector3(.003,y+.047+(h-.086)*.35,(.218-floor*.0117)*Math.cos(Math.PI/8)+.060).applyMatrix4(transform),direction=new T.Vector3(0,0,-1);const ray=new T.Raycaster(origin,direction,0,.16);assert.equal(ray.intersectObjects(walls).length,0,'Every storey needs a physical lobed opening instead of a dark mark on solid plaster');const all=ray.intersectObject(g,true);assert.ok(all.length&&all[0].distance>.074,'The grille or inner wall must be recessed behind the facade');y+=h;floor++;}
  let previous=.024;for(let z=.416;z>.24;z-=.002){const hit=new T.Raycaster(new T.Vector3(0,.080,z),new T.Vector3(0,-1,0),0,.09).intersectObject(g,true)[0];assert.ok(hit,'Approach must remain grounded');assert.ok(Math.abs(hit.point.y-previous)<.010,'The stairs must meet the level base without a gap');previous=hit.point.y;}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Suzhou Museum entrance stays open and the recessed skylight is not covered by an opaque roof',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{museum}=await import('../web/suzhou-museum.js'),k=makeKit({time:{value:0},night:{value:0}}),g=museum(k);g.updateMatrixWorld(true);
 try{const opaque=[];g.traverse(o=>{if(o.material?.userData.museumOpaque)opaque.push(o);});
  const gate=new T.Raycaster(new T.Vector3(0,.10,.64),new T.Vector3(0,0,-1),0,.16);assert.equal(gate.intersectObjects(opaque).length,0,'Entrance canopy must leave an open path toward the main hall');gate.ray.origin.x=.20;assert.ok(gate.intersectObjects(opaque).length>0,'Entrance side wall must remain present');
  const sky=new T.Raycaster(new T.Vector3(.01,.42,.28),new T.Vector3(0,-1,0),0,.10);assert.equal(sky.intersectObjects(opaque).length,0,'Skylight needs an actual recess');sky.ray.origin.set(.15,.42,.275);sky.far=.20;assert.ok(sky.intersectObjects(opaque).length>0,'Stone roof around the skylight must remain present');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Suzhou keeps the Gate of East, Panmen passages and Taihu stone holes physically open',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{orient}=await import('../web/suzhou-modern.js'),{panmen}=await import('../web/suzhou-heritage.js'),{lingering}=await import('../web/suzhou-gardens.js');
 const k=makeKit({time:{value:0},night:{value:0}}),models=[orient(k),panmen(k),lingering(k)];models.forEach(g=>g.updateMatrixWorld(true));
 const collect=(g,key)=>{const a=[];g.traverse(o=>{if(o.material?.userData[key])a.push(o);});return a;};
 try{
  const arch=collect(models[0],'orientArch'),gate=collect(models[1],'panmenGate'),rock=collect(models[2],'taihuRock');
  let ray=new T.Raycaster(new T.Vector3(0,.8,.5),new T.Vector3(0,0,-1),0,1);assert.equal(ray.intersectObjects(arch).length,0);ray.ray.origin.x=.16;assert.ok(ray.intersectObjects(arch).length>0);
  for(const x of [-.19,.19]){ray=new T.Raycaster(new T.Vector3(x,.075,.5),new T.Vector3(0,0,-1),0,1);assert.equal(ray.intersectObjects(gate).length,0,'Both water and land passages must cross both walls');}ray.ray.origin.x=0;assert.ok(ray.intersectObjects(gate).length>0);
  ray=new T.Raycaster(new T.Vector3(-.009,.3058,.20),new T.Vector3(0,0,-1),0,.5);assert.equal(ray.intersectObjects(rock).length,0,'The main Taihu opening is a real hole');ray.ray.origin.y=.38;assert.ok(ray.intersectObjects(rock).length>0,'The rock crown remains solid');
 }finally{models.forEach(g=>g.traverse(o=>o.geometry?.dispose()));k.materials.forEach(m=>m.dispose());}
});
test('Suzhou landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createSuzhouScene,RADIUS}=await import('../web/suzhou-scene.js'),s=createSuzhouScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Suzhou module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createSuzhouScene}=await import('../web/suzhou-scene.js'),s=createSuzhouScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});
