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

test('Anshun light linings keep openings clear and end stairs rise along the bridge axis',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{anshun}=await import('../web/chengdu-anshun.js'),k=makeKit({time:{value:0},night:{value:0}}),g=anshun(k);g.updateMatrixWorld(true);
 try{for(const [x,y]of [[0,.12],[-.405,.08],[.405,.08],[-.24,.166],[.24,.166]]){const ray=new T.Raycaster(new T.Vector3(x,y,.17),new T.Vector3(0,0,-1),0,.34);assert.equal(ray.intersectObject(g,true).length,0,`Lighting blocked the opening at ${x}/${y}`);}
  let stairs;g.traverse(o=>{if(o.material?.userData.anshunSteps)stairs=o;});assert.ok(stairs);
  for(const side of [-1,1]){let previous=0;for(const i of [0,2,4,6,8]){const ray=new T.Raycaster(new T.Vector3(side*(.735-i*.021),.6,0),new T.Vector3(0,-1,0)),hit=ray.intersectObject(stairs)[0];assert.ok(hit);assert.ok(hit.point.y>previous+.02);previous=hit.point.y;}assert.ok(Math.abs(previous-.25)<.001,'The stair must reach the bridge end');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Wuhou gate has a clear central passage, closed timber sides and connected ascending entrance steps',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{wuhou}=await import('../web/chengdu-wuhou.js'),k=makeKit({time:{value:0},night:{value:0}}),g=wuhou(k);g.updateMatrixWorld(true);
 const hit=(p,d,n)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,n).intersectObject(g,true)[0];
 try{
  const entry=hit([0,.14,.35],[0,0,-1],.35);assert.ok(!entry,'central entry stays open; hit='+JSON.stringify(entry?{p:entry.point.toArray(),color:entry.object.material.color.getHexString()}:null));
  for(const x of [-.21,.21])assert.ok(hit([x,.14,.35],[0,0,-1],.3),'dark timber side panels remain solid');
  let y=.020;for(let i=0;i<5;i++){const a=hit([0,.10,.340-i*.014],[0,-1,0],.1);assert.ok(a&&Math.abs(a.point.y-y-.006)<1e-5,'each step rises without being hidden');y=a.point.y;}
  for(const z of [.279,.275,.270]){const a=hit([0,.10,z],[0,-1,0],.1);assert.ok(a&&Math.abs(a.point.y-y)<1e-5,'last tread meets gate landing without a gap');}
  const lane=hit([.5,.10,.10],[0,0,-1],.30);assert.ok(!lane,'red-wall lane remains walkable; hit='+JSON.stringify(lane?{p:lane.point.toArray(),color:lane.object.material.color.getHexString()}:null));
  for(const z of [-.25,-.15,-.05,.05]){const outer=hit([.75,.10,z],[-1,0,0],.2);assert.ok(outer&&outer.object.material.color.getHexString()==='8e3e32','bamboo must remain behind the red wall');}
  assert.equal(k.materials.filter(m=>m.userData.pulse).length,4,'four lanterns retain separate light phases');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Tianfu has an open central court, level water and a dry continuous entrance from the land',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{tianfu}=await import('../web/chengdu-tianfu.js'),k=makeKit({time:{value:0},night:{value:0}}),g=tianfu(k);g.updateMatrixWorld(true);
 try{
  let roof,water;g.traverse(m=>{if(m.material?.userData.museumRoof)roof=m;if(m.material?.userData.water)water=m;});assert.ok(roof&&water);
  assert.equal(new T.Raycaster(new T.Vector3(0,.7,.025),new T.Vector3(0,-1,0)).intersectObject(roof).length,0,'the roof must not cap the courtyard');
  assert.ok(new T.Raycaster(new T.Vector3(.25,.7,0),new T.Vector3(0,-1,0)).intersectObject(roof).length>0,'gallery roof remains solid');
  const pos=water.geometry.attributes.position;for(let i=0;i<pos.count;i++)assert.ok(Math.abs(pos.getY(i)-.018)<1e-6,'water cannot curve down as a vertical wall');
  let previous=.04;for(let z=-.44;z>=-1.04;z-=.01){const hit=new T.Raycaster(new T.Vector3(0,.04,z),new T.Vector3(0,-1,0),0,.5).intersectObject(g,true)[0];assert.ok(hit&&['c5c9bc','657875'].includes(hit.object.material.color.getHexString()),'entry path must not break into grass or water at '+z);assert.ok(hit.point.y<=previous+.004&&previous-hit.point.y<.035,'entry ramp remains connected');previous=hit.point.y;}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
