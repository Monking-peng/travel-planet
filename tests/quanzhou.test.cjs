const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Kaiyuan stone towers alternate four open portals and four solid niches between storeys',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{kaiyuan}=await import('../web/quanzhou-kaiyuan.js'),k=makeKit({time:{value:0},night:{value:0}}),g=kaiyuan(k);g.updateMatrixWorld(true);const stone=[];g.traverse(o=>{if(o.material?.userData.kaiyuanStone)stone.push(o);});
 try{for(const [x,scale]of [[-.32,.92],[.32,.985]])for(let level=0;level<5;level++)for(let i=0;i<8;i++){
  const a=i*Math.PI/4,y=.034+scale*(.064+level*.129+.040),ray=new T.Raycaster(new T.Vector3(x+Math.sin(a)*.16*scale,y,.13+Math.cos(a)*.16*scale),new T.Vector3(-Math.sin(a),0,-Math.cos(a)),0,.11*scale),hits=ray.intersectObjects(stone).length;
  assert.equal(hits>0,(i+level)%2!==0,`Tower ${x}, storey ${level+1}, face ${i}: four genuine portals rotate 45 degrees on the next level`);
  ray.ray.origin.add(new T.Vector3(Math.cos(a)*.025*scale,0,-Math.sin(a)*.025*scale));assert.ok(ray.intersectObjects(stone).length>0,'Stone piers remain beside the opening');
 }}finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Quanzhou stone portals are open and the Luoyang cutwaters keep clear beam spans',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{qingjing,luoyang}=await import('../web/quanzhou-civic.js');const k=makeKit({time:{value:0},night:{value:0}}),mosque=qingjing(k),bridge=luoyang(k);mosque.updateMatrixWorld(true);bridge.updateMatrixWorld(true);
 try{const portals=[],piers=[];mosque.traverse(o=>{if(o.material?.userData.pointedPortal)portals.push(o);});bridge.traverse(o=>{if(o.material?.userData.luoyangPiers)piers.push(o);});assert.ok(portals.length&&piers.length);
 const r=new T.Raycaster(new T.Vector3(.14,.15,.6),new T.Vector3(0,0,-1),0,1);assert.equal(r.intersectObjects(portals).length,0,'Nested arches must remain empty');r.ray.origin.x=.28;assert.ok(r.intersectObjects(portals).length>0,'Stone sides remain substantial');r.ray.origin.set(.0825,.10,.5);assert.equal(r.intersectObjects(piers).length,0,'Water stays visible between cutwaters');r.ray.origin.x=0;assert.ok(r.intersectObjects(piers).length>0);
 }finally{for(const g of [mosque,bridge])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Quanzhou landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createQuanzhouScene,RADIUS}=await import('../web/quanzhou-scene.js'),s=createQuanzhouScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Quanzhou module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createQuanzhouScene}=await import('../web/quanzhou-scene.js'),s=createQuanzhouScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});

test('Luojia bridge joins its island without a blocking seawall rail, temple portico and green gate stay open',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{luojia}=await import('../web/quanzhou-luojia.js'),k=makeKit({time:{value:0},night:{value:0}}),g=luojia(k);g.updateMatrixWorld(true);const structures=[],gate=[];g.traverse(o=>{if(o.material?.userData.luojiaStructure)structures.push(o);if(o.material?.userData.luojiaGate)gate.push(o);});
 try{
  for(let i=0;i<=100;i++){const z=.695-i*.003,ray=new T.Raycaster(new T.Vector3(-.43,.18,z),new T.Vector3(0,-1,0),0,.18),hits=ray.intersectObjects(structures);assert.ok(hits.length,'Approach bridge must meet the island');assert.ok(Math.abs(hits[0].point.y-.103)<.003,'No seawall post or rail blocks the bridge entry');}
  let previous=0;for(let i=0;i<=50;i++){const z=.080-i*.0019,ray=new T.Raycaster(new T.Vector3(.07,.22,z),new T.Vector3(0,-1,0),0,.22),hits=ray.intersectObjects(structures);assert.ok(hits.length);const y=hits[0].point.y;assert.ok(y>=.102&&y<=.140,'Stair is above court and below the portico');if(i)assert.ok(Math.abs(y-previous)<.008,'Stair treads meet continuously');previous=y;}
  const r=new T.Raycaster(new T.Vector3(.07,.197,.045),new T.Vector3(0,0,-1),0,.10);assert.equal(r.intersectObjects(structures).length,0,'An open central bay reaches the recessed doorway');
  const arch=new T.Raycaster(new T.Vector3(-.65,.15,.27),new T.Vector3(1,0,0),0,.35);assert.equal(arch.intersectObjects(gate).length,0,'The green gate is a genuine arch passage');arch.ray.origin.z=.32;assert.ok(arch.intersectObjects(gate).length,'Gate piers remain beside the opening');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});

test('Tianhou gate keeps three passages and all approach stairs join the court and raised platforms',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{tianhou}=await import('../web/quanzhou-tianhou.js'),k=makeKit({time:{value:0},night:{value:0}}),g=tianhou(k),structures=[];g.updateMatrixWorld(true);g.traverse(o=>{if(o.material?.userData.tianhouStructure)structures.push(o);});
 try{
  for(const x of [-.235,0,.235]){const ray=new T.Raycaster(new T.Vector3(x,.13,.61),new T.Vector3(0,0,-1),0,.15);assert.equal(ray.intersectObjects(structures).length,0,'Gate has three open bays, not solid painted doorways');}
  for(const [x,start,end,min,max]of [[0,.66,.55,.024,.050],[0,.22,.10,.024,.055],[-.23,.175,.315,.024,.105],[.23,.175,.315,.024,.105]]){let last;for(let i=0;i<=100;i++){const z=start+(end-start)*i/100,ray=new T.Raycaster(new T.Vector3(x,.14,z),new T.Vector3(0,-1,0),0,.14),hit=ray.intersectObjects(structures)[0];assert.ok(hit,'Stair must remain supported');const y=hit.point.y;assert.ok(y>=min&&y<=max,`Clear tread at ${x},${z}; got ${y}`);if(last!==undefined)assert.ok(Math.abs(y-last)<.013,'No gap or abrupt riser between stair and platform');last=y;}}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});


test('Luoyang approaches meet the slab bridge, pavilion stairs stay supported and pointed foundations stay below upper piers',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{luoyang}=await import('../web/quanzhou-luoyang.js'),k=makeKit({time:{value:0},night:{value:0}}),g=luoyang(k),stone=[],piers=[];g.updateMatrixWorld(true);g.traverse(o=>{if(o.material?.userData.luoyangStructure)stone.push(o);if(o.material?.userData.luoyangPiers)piers.push(o);});
 try{
  let prev;for(let i=0;i<=300;i++){const x=-.865+1.73*i/300,ray=new T.Raycaster(new T.Vector3(x,.27,0),new T.Vector3(0,-1,0),0,.27),hit=ray.intersectObjects(stone)[0];assert.ok(hit,'Both shore approaches connect to the bridge');const y=hit.point.y;assert.ok(y>=.040&&y<=.204,'Bridge path has no raised obstructions');if(prev!==undefined)assert.ok(Math.abs(y-prev)<.012,`No unconnected slab or stair at ${x}: ${prev} to ${y}`);prev=y;}
  const walk=new T.Raycaster(new T.Vector3(-.87,.227,0),new T.Vector3(1,0,0),0,1.74);assert.equal(walk.intersectObjects(stone).length,0,'Clear walking corridor along all spans');
  prev=undefined;for(let i=0;i<=60;i++){const z=-.08-i*.10/60,ray=new T.Raycaster(new T.Vector3(-.29,.27,z),new T.Vector3(0,-1,0),0,.27),hit=ray.intersectObjects(stone)[0];assert.ok(hit,'Island and pavilion stairs remain connected');const y=hit.point.y;assert.ok(y>=.195&&y<=.234);if(prev!==undefined)assert.ok(Math.abs(y-prev)<.012,'Pavilion stair does not jump');prev=y;}
  const foundation=new T.Raycaster(new T.Vector3(0,.15,-.21),new T.Vector3(0,-1,0),0,.15),hit=foundation.intersectObjects(piers)[0];assert.ok(hit&&Math.abs(hit.point.y-.104)<.002,'Long pointed cutwater is lower than the rectangular upper pier');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});
