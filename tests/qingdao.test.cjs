const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Qingdao landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createQingdaoScene,RADIUS}=await import('../web/qingdao-scene.js'),s=createQingdaoScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Qingdao module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createQingdaoScene}=await import('../web/qingdao-scene.js'),s=createQingdaoScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});

test('Qingdao bay triangles stay above the globe and red observation domes retain red night illumination',async()=>{
 const T=await import('three'),{createQingdaoScene,RADIUS}=await import('../web/qingdao-scene.js'),s=createQingdaoScene();
 try{const bay=s.root.getObjectByName('qingdao-bay'),a=bay.geometry.attributes.position,ix=bay.geometry.index;for(let i=0;i<ix.count;i+=3){const v=new T.Vector3();for(let j=0;j<3;j++)v.add(new T.Vector3().fromBufferAttribute(a,ix.getX(i+j)));assert.ok(v.multiplyScalar(1/3).length()>RADIUS,'Water faces must not reveal a land strip through their middle');}const reds=new Set();s.landmarks.get('signal').traverse(o=>{if(o.material?.userData.signalDome)reds.add(o.material);});assert.equal(reds.size,3);s.setNight(true);for(const m of reds){assert.ok(m.emissive.r>m.emissive.g*2&&m.emissive.r>m.emissive.b*2,'Red domes must not be washed to cream by night emission');}}
 finally{s.dispose();}
});

test('St Michael cathedral keeps recessed rose glass and separate bell louvres inside actual masonry openings',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{church}=await import('../web/qingdao-church.js'),k=makeKit({time:{value:0},night:{value:0}}),g=church(k);g.updateMatrixWorld(true);const stone=[];g.traverse(o=>{if(o.material?.userData.churchMasonry)stone.push(o);});
 const hits=(x,y)=>new T.Raycaster(new T.Vector3(x,y,.40),new T.Vector3(0,0,-1),0,.075).intersectObjects(stone).length;
 try{assert.equal(hits(0,.287),0,'The rose glass is recessed behind an actual opening');assert.ok(hits(.073,.287)>0,'The facade remains substantial outside the rose');for(const x of [-.218,.218]){for(const side of [-1,1])assert.equal(hits(x+side*.031,.582),0,'The paired bell openings stay separate');assert.ok(hits(x,.582)>0,'A stone pier remains between bell openings');}}
 finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Huashi Villa has open crown arches, recessed entrance and rear windows, and a continuous entry stair',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{huashi}=await import('../web/qingdao-huashi.js'),k=makeKit({time:{value:0},night:{value:0}}),g=huashi(k);g.updateMatrixWorld(true);const stone=[];g.traverse(o=>{if(o.material?.userData.huashiStone)stone.push(o);});
 try{
  const hit=(x,y,z,dir,far)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,0,dir),0,far).intersectObjects(stone);
  assert.equal(hit(-.205,.680,.34,-1,.15).length,0,'The front crown arch is open');
  assert.ok(hit(-.157,.680,.34,-1,.15).length>0,'A stone pier remains beside the arch');
  assert.equal(hit(.012,.20,.08,-1,.05).length,0,'The entrance glass is behind a real opening');
  assert.equal(hit(.170,.36,-.28,1,.065).length,0,'Rear glass is not hidden behind a solid block');
  let last=.020;
  for(let i=0;i<=240;i++){
   const z=.460-i*.407/240,hits=new T.Raycaster(new T.Vector3(.012,.16,z),new T.Vector3(0,-1,0),0,.16).intersectObjects(g.children,true);
   assert.ok(hits.length,'The entrance route has no missing landing');const y=hits[0].point.y;assert.ok(y>=last-.001,'The stairs never drop into a gap');assert.ok(y-last<.014,'Each rise stays a small step');last=y;
  }
  assert.ok(last>.105&&last<.115,'The landing reaches the doorway threshold');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});


test('Qingdao station has a continuous entry apron and actual recessed narrow tower windows',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{station}=await import('../web/qingdao-station.js'),k=makeKit({time:{value:0},night:{value:0}}),g=station(k);g.updateMatrixWorld(true);const stone=[];g.traverse(o=>{if(o.material?.userData.stationMasonry)stone.push(o);});
 try{
  const ray=(x,y,z,far)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,0,-1),0,far).intersectObjects(stone);
  for(const x of [-.244,-.212,-.180])assert.equal(ray(x,.290,.155,.04).length,0,'Long tower windows are recessed into actual openings');
  assert.ok(ray(-.228,.290,.155,.04).length>0,'Window piers retain their stone thickness');
  for(const x of [.022,.095,.168])assert.equal(ray(x,.10,.151,.034).length,0,'Each central door has a clear opening');
  let last=.020;for(let i=0;i<=180;i++){const z=.362-i*.227/180,hits=new T.Raycaster(new T.Vector3(.095,.12,z),new T.Vector3(0,-1,0),0,.12).intersectObjects(g.children,true);assert.ok(hits.length);const y=hits[0].point.y;assert.ok(y>=last-.001&&y-last<.007,'No broken or oversized step at the entry apron');last=y;}assert.ok(last>.054&&last<.057);
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});

test('Taiqing gate retains open side passages and continuous stairs into the courtyard',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{taiqing}=await import('../web/qingdao-taiqing.js'),k=makeKit({time:{value:0},night:{value:0}}),g=taiqing(k);g.updateMatrixWorld(true);
 try{
  const ray=x=>new T.Raycaster(new T.Vector3(x,.15,.32),new T.Vector3(0,0,-1),0,.17).intersectObjects(g.children,true);
  assert.ok(ray(0).length>0,'The central red door remains closed');
  for(const x of [-.259,.259]){
   assert.equal(ray(x).length,0,'Each side passage stays open through the entire gate');
   let last=.021;
   for(let i=0;i<=220;i++){
    const z=.460-i*.320/220,hits=new T.Raycaster(new T.Vector3(x,.15,z),new T.Vector3(0,-1,0),0,.20).intersectObjects(g.children,true);
    assert.ok(hits.length,'No missing surface on the approach');const y=hits[0].point.y;
    assert.ok(y>=last-.001&&y-last<.008,'No gaps or oversized risers between the stair and the gate');last=y;
   }
   assert.ok(last>.067&&last<.069,'The approach reaches the court floor');
  }
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});


test('Olympic marina keeps continuous pier decks and an open approach to the lighthouse apron',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{marina}=await import('../web/qingdao-marina.js'),k=makeKit({time:{value:0},night:{value:0}}),g=marina(k);g.updateMatrixWorld(true);
 const decks=[],rails=[],hulls=[];g.traverse(o=>{if(o.material?.userData.marinaPaving)decks.push(o);if(o.material?.userData.marinaRails)rails.push(o);if(o.material?.userData.marinaHull)hulls.push(o);});
 try{
  for(const [x,end]of [[.424,.19],[-.392,.16]])for(let i=0;i<=200;i++){const z=-.38+(end+.38)*i/200,h=new T.Raycaster(new T.Vector3(x,.15,z),new T.Vector3(0,-1,0),0,.10).intersectObjects(decks);assert.ok(h.length,`Pier gap at ${x}/${z}`);assert.ok(Math.abs(h[0].point.y-.078)<.0001);}
  const approach=new T.Raycaster(new T.Vector3(.424,.10,-.29),new T.Vector3(0,0,1),0,.49).intersectObjects(rails);assert.equal(approach.length,0,'The circular railing must open toward the pier, not toward the sea');
  assert.equal(hulls.length,5);for(const m of hulls){m.geometry.computeBoundingBox();const h=m.geometry.boundingBox.max.y-m.geometry.boundingBox.min.y;assert.ok(h<.050,'Sailboat hulls stay low in the water instead of becoming tall blocks');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Signal Hill stone towers have recessed arched openings and terrain-connected stairs',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{signal}=await import('../web/qingdao-signal.js'),{siteHeight}=await import('../web/chengdu-kit.js'),k=makeKit({time:{value:0},night:{value:0}}),g=signal(k);g.updateMatrixWorld(true);const masonry=[],paving=[];g.traverse(o=>{if(o.material?.userData.signalMasonry)masonry.push(o);if(o.material?.userData.signalPaving)paving.push(o);});
 try{
  for(const y of [.056+.045,.056+.263-.060]){const r=new T.Raycaster(new T.Vector3(0,y,.01),new T.Vector3(0,0,-1),0,.065);assert.equal(r.intersectObjects(masonry).length,0,'Main tower arches remain genuinely recessed');assert.ok(new T.Raycaster(new T.Vector3(.024,y,.01),new T.Vector3(0,0,-1),0,.065).intersectObjects(masonry).length>0,'Stone remains beside the opening');}
  let prev=siteHeight(0,.532,.66,.58);for(let i=0;i<=220;i++){const z=.532-i*.19/220,h=new T.Raycaster(new T.Vector3(0,.14,z),new T.Vector3(0,-1,0),0,.25).intersectObjects(paving);assert.ok(h.length,`Missing approach at ${z}`);const y=h[0].point.y;assert.ok(y>=prev-.0005);assert.ok(y-prev<.014);assert.ok(y>siteHeight(0,z,.66,.58),`Grass crosses the stair at ${z}`);prev=y;}assert.ok(Math.abs(prev-.056)<.001);
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
