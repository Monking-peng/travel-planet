const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Hunan Museum keeps a level terrace, supported wings, closed roof and continuous stairs',async()=>{
 const T=await import('three'),{createChangshaScene}=await import('../web/changsha-scene.js'),scene=createChangshaScene();scene.root.updateMatrixWorld(true);
 const g=scene.landmarks.get('museum'),ray=(a,b,far=5)=>new T.Raycaster(g.localToWorld(new T.Vector3(...a)),new T.Vector3(...b).transformDirection(g.matrixWorld),0,far).intersectObject(g,true),height=h=>g.worldToLocal(h.point.clone()).y;
 try{
  const terrace=[-.40,-.15,.15,.40].map(x=>ray([x,.22,.30],[0,-1,0])[0]);assert.ok(terrace.every(Boolean));assert.ok(Math.max(...terrace.map(height))-Math.min(...terrace.map(height))<.0001,'Terrace must stay flat instead of bending with the globe');
  assert.equal(ray([.12,.07,.37],[0,0,-1],.14).length,0,'Lower entry approach must remain open under the terrace');
  for(const x of [-.465,.465])assert.ok(ray([x,.08,.35],[0,0,-1],.30).length,'Both gallery wings need masonry below them');
  for(const x of [-.30,0,.30])for(const z of [-.18,0,.18])assert.ok(ray([x,1,z],[0,-1,0]).some(h=>h.object.material.userData.museumRoof),'Crystalline roof must be closed');
  let last=null;for(let i=0;i<12;i++){
   const hits=ray([-.385,1,.51-i*.015],[0,-1,0]).filter(h=>h.object.material.userData.museumStep);assert.ok(hits.length,'Each stair tread must be reachable');const y=height(hits[0]);assert.ok(last===null||(y>last&&y-last<.032),'Entrance stair must rise without a broken step');last=y;
  }
  assert.ok(Math.abs(last-.154)<.002,'Top stair must meet the observation terrace');
  const roofs=[];g.traverse(o=>{if(o.material?.userData.museumRoof)roofs.push(o.material);});assert.ok(roofs.length);scene.setNight(true);assert.ok(roofs.every(m=>m.color.getHexString()==='686f6d'),'Night lighting must preserve the metal roof colour');
 }finally{scene.dispose();}
});

test('Yuelu Academy has real axial doorways, closed library roofs and distinct temple tiles',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{yuelu}=await import('../web/changsha-yuelu.js');
 const kit=makeKit({time:{value:0},night:{value:0}}),g=yuelu(kit);g.updateMatrixWorld(true);
 const ray=(a,b,far=5)=>new T.Raycaster(new T.Vector3(...a),new T.Vector3(...b),0,far).intersectObject(g,true);
 try{
  for(const z of [.49,.245,-.035])assert.equal(ray([-.20,.08,z+.10],[0,0,-1],.20).length,0,'Gates and lecture hall must keep a real central passage');
  for(const x of [-.29,-.20,-.11])assert.equal(ray([x,.08,.345],[0,0,-1],.20).length,0,'Second gate needs three independent doorways');
  for(const x of [-.37,-.20,-.03])for(const z of [-.53,-.43,-.33]){
   const hits=ray([x,1,z],[0,-1,0]);assert.ok(hits.some(h=>h.object.material.userData.academyRoof&&h.point.y>.33),'Main library roof must remain closed across its span');
  }
  const library=ray([-.20,1,-.43],[0,-1,0])[0],hall=ray([-.20,1,-.035],[0,-1,0])[0];assert.ok(library.point.y>hall.point.y+.17,'Library must have a distinct tall silhouette');
  assert.ok(kit.materials.some(m=>m.userData.academyRoof&&m.color.getHexString()==='5e625d'));
  assert.ok(kit.materials.some(m=>m.userData.academyRoof&&m.color.getHexString()==='ba8e3f'));
  // Steps are pre-compensated for terrain: verify their final height in the rendered scene.
  const {createChangshaScene}=await import('../web/changsha-scene.js'),scene=createChangshaScene();scene.root.updateMatrixWorld(true);
  try{const model=scene.landmarks.get('yuelu');let last=null;
   for(let i=0;i<6;i++){const z=.561+(5-i)*.013,hits=new T.Raycaster(model.localToWorld(new T.Vector3(-.20,1,z)),new T.Vector3(0,-1,0).transformDirection(model.matrixWorld)).intersectObject(model,true).filter(h=>h.object.material.userData.academyStep);assert.ok(hits.length,'Each entrance step must exist');const y=model.worldToLocal(hits[0].point.clone()).y;assert.ok(last===null||(y>last&&y-last<.020),'Entrance stair must rise continuously');last=y;}
   const threshold=.026-(2.15-Math.sqrt(2.15**2-.055**2-.425**2));assert.ok(Math.abs(last-threshold)<.002,'Entrance stair must meet the floor in the final curved scene');
  }finally{scene.dispose();}
 }finally{g.traverse(o=>o.geometry?.dispose());kit.materials.forEach(m=>m.dispose());}
});

test('Changsha courtyard roofs are closed and the city-wall passage is not crossed by masonry trim',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{yuelu,tianxin}=await import('../web/changsha-heritage.js');
  const kit=makeKit({time:{value:0},night:{value:0}}),academy=yuelu(kit),wall=tianxin(kit);
  academy.updateMatrixWorld(true);wall.updateMatrixWorld(true);
  const roof=new T.Raycaster(new T.Vector3(-.15,1,-.316),new T.Vector3(0,-1,0)).intersectObject(academy,true);
  assert.ok(roof.length&&roof[0].point.y>.30,'Library roof must cover the aperture near its ridge');
  const passage=new T.Raycaster(new T.Vector3(0,.218,1),new T.Vector3(0,0,-1),0,1.5).intersectObject(wall,true);
  assert.equal(passage.length,0,'Mortar lines must stop at the actual arch opening');
  const support=new T.Raycaster(new T.Vector3(.30,.21,-1),new T.Vector3(0,0,1),0,1.5).intersectObject(wall,true);
  assert.ok(support.length&&support.some(hit=>hit.point.z<-.28),'Rear pavilion must stand on the deep city wall');
  const geos=new Set();for(const g of [academy,wall])g.traverse(o=>{if(o.geometry)geos.add(o.geometry);});geos.forEach(g=>g.dispose());kit.materials.forEach(m=>m.dispose());
});

test('Changsha landmarks stay on land, above the globe and separated on two hemispheres',async()=>{
  const T=await import('three'),{createChangshaScene,RADIUS,channelX,channelWidth,islandWidth}=await import('../web/changsha-scene.js');const scene=createChangshaScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g]of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks into terrain`);radius=Math.max(radius,normal.angleTo(p));p.normalize().multiplyScalar(RADIUS);const angle=Math.atan2(p.z,p.y),offset=Math.abs(p.x-channelX(angle));if(id==='juzizhou')assert.ok(offset<islandWidth(angle)/2,`${id} leaves Orange Isle`);else if(id!=='juzhouBridge')assert.ok(offset>channelWidth(angle)/2+.008,`${id} intrudes into the river`);}});if(id!=='juzhouBridge')caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.equal(caps.filter(c=>c.normal.y<0).length,4);
  }finally{scene.dispose();}
});

test('Changsha complete landmark modules detach with their lighting and release resources once',async()=>{
  const {createChangshaScene}=await import('../web/changsha-scene.js'),{LANDMARKS}=await import('../web/changsha-landmarks.js');const scene=createChangshaScene(),original=new Map(scene.landmarks),geometries=new Set();
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,10);
  scene.root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const key of ['position','normal'])for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name} ${key}`);});
  scene.setNight(true);
  for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o)));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let count=0;geometries.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(count,geometries.size);
});

test('Changsha night lights change gently, preserve base colors and respect reduced motion',async()=>{
  const {createChangshaScene}=await import('../web/changsha-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/changsha-landmarks.js');const scene=createChangshaScene();
  try{assert.deepEqual([...parseRemovedModules('["dufu","palace","dufu",null]',LANDMARKS)],['dufu']);const colors=new Map(),pulse=[];scene.landmarks.forEach(g=>g.traverse(o=>{if(o.material?.color)colors.set(o.material,o.material.color.clone());if(o.material?.userData.pulse)pulse.push(o.material);}));assert.ok(pulse.length);scene.setNight(true);colors.forEach((color,m)=>assert.ok(m.color.equals(color)));scene.update(1,false);const values=pulse.map(m=>m.emissiveIntensity);scene.update(4,false);assert.ok(pulse.some((m,i)=>m.emissiveIntensity!==values[i]));scene.update(5,true);const still=pulse.map(m=>m.emissiveIntensity);scene.update(30,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),still);scene.setNight(false);scene.update(31,false);assert.ok(pulse.every(m=>m.emissiveIntensity===0));}
  finally{scene.dispose();}
});

test('Changsha mountain is continuous terrain and the bridge has open spans with supported approaches',async()=>{
  const T=await import('three'),{createChangshaScene,RADIUS}=await import('../web/changsha-scene.js'),{makeKit}=await import('../web/wuhan-kit.js'),{juzhouBridge}=await import('../web/changsha-bridge.js');
  const scene=createChangshaScene();scene.root.updateMatrixWorld(true);
  try{
    const terrain=scene.root.getObjectByName('changsha-terrain'),positions=terrain.geometry.attributes.position;let highest=0;
    for(let i=0;i<positions.count;i++){const p=new T.Vector3().fromBufferAttribute(positions,i);highest=Math.max(highest,p.length()-RADIUS);if(p.y<0)assert.ok(Math.abs(p.length()-RADIUS)<1e-5,'Rear globe must not inherit the mountain deformation');}
    assert.ok(highest>.25&&highest<.65,'Mountain must create visible relief');
    // Sampling the actual ground vertices beneath each model catches terrain
    // entering buildings even when the building still sits above the old sphere.
    for(const model of scene.landmarks.values()){let samples=0;model.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count&&samples<32;i+=Math.max(1,Math.ceil(a.count/40))){const point=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld),n=point.clone().normalize();if(point.length()>RADIUS+.05)continue;samples++;const hit=new T.Raycaster(n.clone().multiplyScalar(5),n.clone().negate()).intersectObject(terrain)[0];assert.ok(!hit||point.length()>=hit.point.length()-.008,'Raised terrain intersects a landmark');}});assert.ok(samples>0);}
  }finally{scene.dispose();}
  const k=makeKit({time:{value:0},night:{value:0}}),bridge=juzhouBridge(k);bridge.updateMatrixWorld(true);
  for(let x=-.70;x<=.70;x+=.07){const hits=new T.Raycaster(new T.Vector3(x,.40,0),new T.Vector3(0,-1,0)).intersectObject(bridge,true);assert.ok(hits.length&&hits[0].point.y>.18,'Continuous deck must span the river');}
  const opening=new T.Raycaster(new T.Vector3(.09,.08,.3),new T.Vector3(0,0,-1),0,.40).intersectObject(bridge,true);assert.equal(opening.length,0,'Low arch must be open underneath');
  const pier=new T.Raycaster(new T.Vector3(0,.08,.3),new T.Vector3(0,0,-1),0,.40).intersectObject(bridge,true);assert.ok(pier.length,'Concrete pier must connect deck to its support');
  bridge.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());
});

test('Meixi curved roofs are closed and the common court keeps clear routes between three venues',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{meixi}=await import('../web/changsha-meixi.js'),k=makeKit({time:{value:0},night:{value:0}}),model=meixi(k);model.updateMatrixWorld(true);
  try{
    const floor=model.children.find(o=>o.material?.userData.groundSurface),roofs=model.children.filter(o=>o.material?.userData.meixiRoof);
    assert.equal(roofs.length,3);assert.ok(floor);
    for(const mesh of [floor,...roofs]){const a=mesh.geometry.attributes.normal;for(let i=0;i<a.count;i++)assert.ok(a.getY(i)>0,'court and roofs need upward-facing, non-degenerate normals');}
    for(const q of model.userData.venues){
      const roof=roofs.find(o=>o.material.userData.meixiRoof===q.id),heights=[];
      // Sample the center, each petal and the recesses on the built roof.
      for(let i=0;i<q.outline.length;i+=5)for(const scale of [0,.45,.94]){
        const [ox,oz]=q.outline[i],x=q.x+(ox-q.x)*scale,z=q.z+(oz-q.z)*scale;
        const hit=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,-1,0)).intersectObject(roof)[0];
        assert.ok(hit&&hit.point.y>.10,'roof has a hole or an implausibly low fold');heights.push(hit.point.y);
      }
      assert.ok(Math.max(...heights)-Math.min(...heights)>.055,'venue needs actual rising folds, not a flat extruded outline');
    }
    const buildings=model.children.filter(o=>o.material?.userData.venue||o.material?.userData.meixiRoof);
    for(const route of model.userData.paths){
      const curve=new T.CatmullRomCurve3(route.map(([x,z])=>new T.Vector3(x,.07,z)),false,'centripetal');
      for(const point of curve.getPoints(40)){
        const ray=new T.Raycaster(new T.Vector3(point.x,1,point.z),new T.Vector3(0,-1,0));
        assert.equal(ray.intersectObjects(buildings,false).length,0,'a venue obstructs the common-court route');
        assert.ok(ray.intersectObject(floor)[0],'a route leaves the public forecourt');
      }
    }
  }finally{model.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Orange Isle forecourt is supported by actual island geometry and both river branches remain open',async()=>{
  const T=await import('three'),{createChangshaScene,RADIUS,channelWidth,islandWidth,channelX}=await import('../web/changsha-scene.js');
  const scene=createChangshaScene();scene.root.updateMatrixWorld(true);
  try{
    assert.ok(Math.abs(channelWidth(0)-channelWidth(Math.PI*2))<1e-10,'River seam must close around the globe');
    const island=scene.root.getObjectByName('xiangjiang-island'),model=scene.landmarks.get('juzizhou');
    for(let angle=.25;angle<.72;angle+=.018){
      assert.ok(channelWidth(angle)-islandWidth(angle)>.17,'Both river branches must remain visibly open');
      for(const side of [-1,1]){
        const x=channelX(angle)+side*(channelWidth(angle)+islandWidth(angle))/4,rad=Math.sqrt(RADIUS*RADIUS-x*x),n=new T.Vector3(x,Math.cos(angle)*rad,Math.sin(angle)*rad).normalize();
        assert.equal(new T.Raycaster(n.clone().multiplyScalar(4),n.clone().negate()).intersectObject(island).length,0,'Island must not close a water branch');
      }
    }
    for(let i=0;i<48;i++){
      const angle=i/48*Math.PI*2,point=model.localToWorld(new T.Vector3(Math.cos(angle)*.305,.006,Math.sin(angle)*.174+.023)).normalize();
      const hit=new T.Raycaster(point.clone().multiplyScalar(4),point.clone().negate()).intersectObject(island)[0];
      assert.ok(hit&&hit.point.length()>RADIUS+.007,'Forecourt edge must be supported by the island, not water');
    }
  }finally{scene.dispose();}
});

test('Orange Isle sculpture keeps a solid head, a projected facial profile and a wide shoulder silhouette',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{juzizhou}=await import('../web/changsha-juzizhou.js');
  const kit=makeKit({time:{value:0},night:{value:0}}),g=juzizhou(kit);g.updateMatrixWorld(true);
  try{
    const stone=g.children.filter(o=>o.material?.userData.sculptureStone);
    const front=(x,y)=>new T.Raycaster(new T.Vector3(x,y,1),new T.Vector3(0,0,-1)).intersectObjects(stone)[0];
    for(const y of [.104,.124,.145,.167,.19])assert.ok(front(0,y),'Head and neck must have no visible central gaps');
    const nose=front(0,.128),cheek=front(.022,.128);assert.ok(nose&&cheek&&nose.point.z-cheek.point.z>.008,'Nose must be a real projecting surface');
    assert.ok(new T.Raycaster(new T.Vector3(0,.15,-1),new T.Vector3(0,0,1)).intersectObjects(stone).length,'Head needs a rear volume');
    const bounds=new T.Box3();stone.forEach(mesh=>bounds.expandByObject(mesh));const size=bounds.getSize(new T.Vector3());assert.ok(size.x/size.y>2.2,'Long shoulders are essential to the actual sculpture silhouette');
  }finally{g.traverse(o=>o.geometry?.dispose());kit.materials.forEach(m=>m.dispose());}
});


test('Du Fu Pavilion has deep open galleries, closed grey roofs and continuous entry stairs',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{dufu}=await import('../web/changsha-dufu.js');
 const k=makeKit({time:{value:0},night:{value:0}}),g=dufu(k);g.updateMatrixWorld(true);
 const down=(x,z)=>new T.Raycaster(new T.Vector3(x,1.2,z),new T.Vector3(0,-1,0)).intersectObject(g,true);
 try{
  for(const [x,min,max]of [[.39,.326,.4],[.355,.536,.615],[.10,.746,.94]]){const hits=down(x,0);assert.ok(hits.length&&hits[0].point.y>=min&&hits[0].point.y<=max,'Each projecting roof must cover its floor');assert.ok(hits.some(h=>h.object.material.userData.dufuRoof));}
  for(const [y,z,d]of [[.23,.30,.14],[.45,.26,.12],[.66,.23,.10]])for(const side of [-1,1]){
   const hits=new T.Raycaster(new T.Vector3(.045,y,side*z),new T.Vector3(0,0,-side),0,d).intersectObject(g,true);assert.equal(hits.length,0,'Inner windows must leave real space behind the red colonnade');
  }
  let previous=0;for(let i=0;i<8;i++){const hits=down(0,.47-i*.02);assert.ok(hits.length&&hits[0].point.y>=previous&&hits[0].point.y<.17);previous=hits[0].point.y;}
  for(const side of [-1,1]){const hits=new T.Raycaster(new T.Vector3(side*.5,.84,0),new T.Vector3(-side,0,0)).intersectObject(g,true);assert.ok(hits.length,'The triangular gable ends must close below the roof');}
  assert.ok(k.materials.some(m=>m.userData.dufuRoof&&m.color.getHexString()==='555b58'),'Daylight tiles must remain dark grey');
  const lights=[];g.traverse(o=>{if(o.isPointLight)lights.push(o);});assert.equal(lights.length,2);assert.ok(lights.every(l=>l.parent===g&&l.intensity===0&&l.userData.nightIntensity>0));
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Aiwan Pavilion keeps open passages and grilles, closed green roofs and a continuous hillside stair',async()=>{
 const T=await import('three'),{createChangshaScene}=await import('../web/changsha-scene.js'),scene=createChangshaScene();scene.root.updateMatrixWorld(true);
 const g=scene.landmarks.get('aiwan'),ray=(origin,direction,far=5)=>new T.Raycaster(g.localToWorld(new T.Vector3(...origin)),new T.Vector3(...direction).transformDirection(g.matrixWorld),0,far).intersectObject(g,true);
 try{
  assert.equal(ray([0,.30,.40],[0,0,-1],.8).length,0,'Visitors must be able to see through the pavilion at walking height');
  const roofHits=ray([.02,1,.04],[0,-1,0]);assert.ok(roofHits.some(h=>h.object.material.userData.aiwanRoof),'Upper roof must close over the center');
  assert.ok(ray([.02,1,.23],[0,-1,0]).some(h=>h.object.material.userData.aiwanRoof),'Lower eaves must cover the outer colonnade');
  let open=0,framed=0;for(let x=-.10;x<=.10;x+=.009)for(let y=.54;y<=.62;y+=.009){const hits=ray([x,y,.15],[0,0,-1],.05);if(hits.length)framed++;else open++;}
  assert.ok(open>50&&framed>15,'Upper lattice must have actual openings and framing, not a filled panel');
  let last=null;for(let i=0;i<16;i++){
   const hits=ray([0,1,.61-i*.026],[0,-1,0]).filter(h=>h.object.material.userData.aiwanSteps);assert.ok(hits.length,'Each step must be present');
   const y=g.worldToLocal(hits[0].point.clone()).y;assert.ok(last===null||(y>last&&y-last<.030),'Stair rise must stay continuous');last=y;
  }
  assert.ok(Math.abs(last-.1925)<.003,'Top stair must meet the pavilion floor');
  const mats=new Set();g.traverse(o=>{if(o.material)mats.add(o.material);});const roofs=[...mats].filter(m=>m.userData.aiwanRoof);assert.ok(roofs.length);assert.ok(roofs.every(m=>m.color.getHexString()==='42776d'));
  scene.setNight(true);assert.ok(roofs.every(m=>m.color.getHexString()==='42776d'),'Night must retain the green glaze');
 }finally{scene.dispose();}
});
