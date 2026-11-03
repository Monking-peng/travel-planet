const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Chengdu landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createChengduScene,RADIUS}=await import('../web/chengdu-scene.js'),s=createChengduScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Anshun has three navigable arches and open circular spandrels',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{anshun}=await import('../web/chengdu-heritage.js'),k=makeKit({time:{value:0},night:{value:0}}),g=anshun(k);g.updateMatrixWorld(true);
 try{let masonry;g.traverse(o=>{if(o.material?.userData.bridgeMasonry)masonry=o;});assert.ok(masonry);
  const ray=(x,y)=>new T.Raycaster(new T.Vector3(x,y,.20),new T.Vector3(0,0,-1),0,.4).intersectObject(masonry);
  for(const [x,y]of [[0,.12],[-.405,.08],[.405,.08],[-.24,.166],[.24,.166]])assert.equal(ray(x,y).length,0,`Closed opening at ${x}/${y}`);
  assert.ok(ray(.26,.06).length>0,'An arch pier must remain');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Dongan roof remains open and rigid, while its surroundings meet the sphere',async()=>{
 const T=await import('three'),{createChengduScene}=await import('../web/chengdu-scene.js'),s=createChengduScene(),g=s.landmarks.get('dongan');
 try{let roof;g.traverse(o=>{if(o.material?.userData.stadiumRoof)roof=o;});assert.ok(roof);roof.updateMatrixWorld(true);
  const ray=new T.Raycaster(new T.Vector3(0,.6,0),new T.Vector3(0,-1,0));const standalone=new T.Mesh(roof.geometry,roof.material);standalone.updateMatrixWorld();assert.equal(ray.intersectObject(standalone).length,0);ray.ray.origin.x=.4;assert.ok(ray.intersectObject(standalone).length>0);
  const p=roof.geometry.attributes.position;let min=Infinity,max=-Infinity;for(let i=0;i<p.count;i++){const y=p.getY(i);min=Math.min(y,min);max=Math.max(y,max);}assert.ok(min>.18&&max<.25,'The rigid roof must not be warped with ground sag');
 }finally{s.dispose();}
});
test('Chengdu module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createChengduScene}=await import('../web/chengdu-scene.js'),s=createChengduScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});
