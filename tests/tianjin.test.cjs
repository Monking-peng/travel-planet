const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Tianjin landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createTianjinScene,RADIUS}=await import('../web/tianjin-scene.js'),s=createTianjinScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});

test('Tianjin arcade openings stay physically open and water triangles do not expose the globe',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{archOpening}=await import('../web/tianjin-kit.js');
 const kit=makeKit({time:{value:0},night:{value:0}}),group=new T.Group(),mat=kit.mat('#aaa');mat.side=T.DoubleSide;
 const arch=archOpening(kit,group,mat);group.updateMatrixWorld(true);
 const through=new T.Raycaster(new T.Vector3(0,.045,.4),new T.Vector3(0,0,-1));assert.equal(through.intersectObject(arch).length,0,'Arcade center must not be filled by a fake dark doorway');
 const pier=new T.Raycaster(new T.Vector3(.052,.045,.4),new T.Vector3(0,0,-1));assert.ok(pier.intersectObject(arch).length>0,'The flanking pier must remain solid');arch.geometry.dispose();mat.dispose();
 const {createTianjinScene,RADIUS}=await import('../web/tianjin-scene.js'),s=createTianjinScene();
 try{const bay=s.root.getObjectByName('tianjin-bay'),a=bay.geometry.attributes.position,ix=bay.geometry.index;for(let i=0;i<ix.count;i+=3){const center=new T.Vector3();for(let j=0;j<3;j++)center.add(new T.Vector3().fromBufferAttribute(a,ix.getX(i+j)));assert.ok(center.multiplyScalar(1/3).length()>RADIUS);}}
 finally{s.dispose();}
});
test('Tianjin module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createTianjinScene}=await import('../web/tianjin-scene.js'),s=createTianjinScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});


test('Porcelain house has a passable gate, open side gallery and preserved vase decoration coordinates',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{porcelain}=await import('../web/tianjin-porcelain.js'),k=makeKit({time:{value:0},night:{value:0}}),g=porcelain(k);g.updateMatrixWorld(true);
 const hits=(x,y,far)=>new T.Raycaster(new T.Vector3(x,y,.4),new T.Vector3(0,0,-1),0,far).intersectObject(g,true).filter(h=>h.object.isMesh);
 try{assert.equal(hits(0,.12,.10).length,0,'Gate center remains open');assert.ok(hits(.10,.12,.10).length>0,'Gateposts remain solid');assert.equal(hits(-.33,.30,.50).length,0,'Balcony is not a solid projecting box');assert.ok(hits(.12,.30,.50).length>0,'The main house stays solid');let patterns=0;g.traverse(o=>{const uv=o.geometry?.attributes.vaseUv;if(uv){patterns++;assert.ok(uv.array.some(v=>v>0));assert.equal(uv.count,o.geometry.attributes.position.count);}});assert.equal(patterns,2,'Both blue and red vase motifs survive geometry merging');}
 finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Xikai has recessed front and side windows, solid rear walls and three continuous entrance approaches',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{xikai}=await import('../web/tianjin-xikai.js');const k=makeKit({time:{value:0},night:{value:0}}),g=xikai(k);g.updateMatrixWorld(true);const walls=[],paving=[];g.traverse(o=>{if(o.isMesh&&o.material.userData.xikaiWall)walls.push(o);if(o.isMesh&&o.material.userData.xikaiPaving)paving.push(o);});
 const ray=(x,y,z,dx,dy,dz,far,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(dx,dy,dz),0,far).intersectObjects(objects,false);
 try{
  assert.equal(ray(0,.35,.45,0,0,-1,.10,walls).length,0,'Center stained-glass window has no brick backing');
  assert.ok(ray(.10,.35,.45,0,0,-1,.10,walls).length,'Adjacent facade stays solid');
  assert.equal(ray(-.22,.68,.45,0,0,-1,.11,walls).length,0,'Belfry lancet is recessed');
  assert.equal(ray(.50,.14,-.065,-1,0,0,.25,walls).length,0,'Side aisle window is physically cut out');
  assert.ok(ray(.11,.41,-.50,0,0,1,.13,walls).length,'Rear upper nave wall closes the former gap');
  for(const x of [-.22,0,.22]){let previous=0;for(let i=0;i<=201;i++){const z=.530-.17*i/201,hits=ray(x,.20,z,0,-1,0,.20,paving);assert.ok(hits.length,`Entry paving missing at ${x}/${z}`);const y=hits[0].point.y;if(i)assert.ok(y>=previous-.0001&&y-previous<.006,`Entry step discontinuity ${x}/${z}/${y-previous}`);previous=y;}assert.ok(Math.abs(previous-.055)<.0001);}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Maritime entrance follows the ground continuously and the central atrium stays glazed',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{maritime}=await import('../web/tianjin-maritime.js'),{siteHeight}=await import('../web/chengdu-kit.js');const k=makeKit({time:{value:0},night:{value:0}}),g=maritime(k);g.updateMatrixWorld(true);const paving=[],shell=[],glass=[];g.traverse(o=>{if(!o.isMesh)return;if(o.material.userData.maritimePaving)paving.push(o);if(o.material.userData.maritimeShell)shell.push(o);if(o.material.userData.maritimeGlass)glass.push(o);});
 const down=(x,z,objects)=>new T.Raycaster(new T.Vector3(x,.5,z),new T.Vector3(0,-1,0),0,.8).intersectObjects(objects,false);
 try{let previous;for(let i=0;i<=301;i++){const z=.61-i*.33/301,terrain=siteHeight(0,z,.77,.64),hit=down(0,z,paving),height=Math.max(terrain,hit.length?hit[0].point.y:-Infinity);if(i)assert.ok(height>=previous-.0002&&height-previous<.010,`Entrance drop or jump at ${z}: ${height-previous}`);previous=height;}assert.ok(Math.abs(previous-.036)<.0005);assert.equal(down(0,0,shell).length,0,'Central atrium is not hidden under an opaque roof');assert.ok(down(0,0,glass).length,'Central glass roof exists');
 const water=[];g.traverse(o=>{if(o.isMesh&&o.material===k.materials.find(m=>m.userData.water))water.push(o);});assert.equal(down(0,.45,water).length,0,'Arrival plaza does not sit in a circular water moat');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Dule preserves solid red side walls, recessed upper windows, balcony ends and a continuous approach',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{dule}=await import('../web/tianjin-dule.js'),k=makeKit({time:{value:0},night:{value:0}}),g=dule(k);g.updateMatrixWorld(true);const red=[],stone=[];g.traverse(o=>{if(!o.isMesh)return;if(o.material.userData.duleWall)red.push(o);if(o.material.userData.dulePaving)stone.push(o);});
 const ray=(x,y,z,dx,dy,dz,far,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(dx,dy,dz),0,far).intersectObjects(objects,false);
 try{
  assert.equal(ray(0,.12,.19,0,0,-1,.15,red).length,0,'Center entrance is an opening');
  assert.ok(ray(.24,.12,.19,0,0,-1,.15,red).length,'Front wall beside entry stays solid');
  assert.equal(ray(0,.435,.13,0,0,-1,.06,red).length,0,'Upper window is recessed into the facade');
  assert.ok(ray(.45,.435,-.06,-1,0,0,.16,red).length,'Side wall must not become a fake full-height window');
  assert.ok(ray(.45,.434,-.06,-1,0,0,.09,red).length,'End of balcony has a handrail');
  for(const x of [-.16,.16]){let previous=.020;for(let i=0;i<=241;i++){const z=.365-i*.23/241,hit=ray(x,.16,z,0,-1,0,.18,stone),y=hit.length?hit[0].point.y:.020;assert.ok(y>=previous-.0001&&y-previous<.006,`Approach has a gap or jump at ${x}/${z}: ${y-previous}`);previous=y;}assert.ok(Math.abs(previous-.058)<.0001);}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Minyuan has open passages, continuous entrance levels and glass pavilion ribs above the roof',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{minyuan}=await import('../web/tianjin-minyuan.js'),k=makeKit({time:{value:0},night:{value:0}}),g=minyuan(k);g.updateMatrixWorld(true);const walls=[],stone=[],glass=[],frames=[];g.traverse(o=>{if(!o.isMesh)return;if(o.material.userData.minyuanPortal)walls.push(o);if(o.material.userData.minyuanPaving)stone.push(o);if(o.material.userData.minyuanGlass)glass.push(o);if(o.material.userData.minyuanFrame)frames.push(o);});
 const ray=(x,y,z,dx,dy,dz,far,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(dx,dy,dz),0,far).intersectObjects(objects,false);
 try{
  assert.equal(ray(0,.10,.40,0,0,-1,.22,walls).length,0,'Main portal is physically open');assert.ok(ray(.10,.10,.40,0,0,-1,.22,walls).length,'Portal pier stays solid');
  for(const x of [-.03,.03]){let previous=.020;for(let i=0;i<=251;i++){const z=.43-i*.22/251,hit=ray(x,.15,z,0,-1,0,.16,stone),y=hit.length?hit[0].point.y:.020;assert.ok(y>=previous-.0001&&y-previous<.006,`Entrance gap or step ${x}/${z}/${y-previous}`);previous=y;}assert.ok(previous>.024);}
  for(let i=3;i<=15;i++){const z=(i/19-.5)*.36;const roof=ray(.455,.3,z,0,-1,0,.25,glass),rib=ray(.455,.3,z,0,-1,0,.25,frames);assert.ok(roof.length&&rib.length,'Glass and roof rib both exist');assert.ok(rib[0].point.y>roof[0].point.y+.001,'White ribs are not buried under the glass roof');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Jiefang has continuous river crossings, clear traffic lanes and a concave upper steel profile',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{jiefang}=await import('../web/tianjin-jiefang.js'),k=makeKit({time:{value:0},night:{value:0}}),g=jiefang(k);g.updateMatrixWorld(true);const decks=[],steel=[];g.traverse(o=>{if(!o.isMesh)return;if(o.material.userData.jiefangDeck)decks.push(o);if(o.material.userData.jiefangSteel)steel.push(o);});
 const ray=(x,y,z,dx,dy,dz,far,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(dx,dy,dz),0,far).intersectObjects(objects,false);
 try{
  for(const z of [-.126,0,.126]){let previous;for(let i=0;i<=401;i++){const x=-.82+i*1.64/401,hits=ray(x,.2,z,0,-1,0,.2,decks);assert.ok(hits.length,`Deck has a gap at ${x}/${z}`);const y=hits[0].point.y;if(i)assert.ok(Math.abs(y-previous)<.005,`Approach discontinuity at ${x}/${z}`);previous=y;}}
  assert.equal(ray(-.65,.21,0,1,0,0,1.3,steel).length,0,'Main traffic lane is not blocked by cross-bracing');
  const center=ray(0,.6,.103,0,-1,0,.5,steel),shoulder=ray(.32,.6,.103,0,-1,0,.5,steel);assert.ok(center.length&&shoulder.length);assert.ok(shoulder[0].point.y-center[0].point.y>.07,'Upper plate girder must dip toward the center');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
