const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Sanya landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createSanyaScene,RADIUS}=await import('../web/sanya-scene.js'),s=createSanyaScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});

test('Sanya module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createSanyaScene}=await import('../web/sanya-scene.js'),s=createSanyaScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});


test('Sanya preserves five distinct waterfront towers and a suspended walkway above the valley',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{createLandmark}=await import('../web/sanya-landmarks.js');const k=makeKit({time:{value:0},night:{value:0}}),models=[];
 try{
  const towers=createLandmark(k,'phoenix');models.push(towers);const ids=new Set();towers.traverse(o=>{if(Number.isInteger(o.material?.userData.phoenixTower))ids.add(o.material.userData.phoenixTower);});assert.equal(ids.size,5,'Five independent curved towers must remain present');
  const bridge=createLandmark(k,'dragon');models.push(bridge);bridge.updateMatrixWorld(true);let deck;bridge.traverse(o=>{if(o.material?.userData.suspensionDeck)deck=o;});assert.ok(deck);const a=deck.geometry.attributes.position;let middle=0,ends=0;for(let i=0;i<a.count;i++){const x=Math.abs(a.getX(i)),y=a.getY(i);if(x<.04)middle=Math.max(middle,y);if(x>.48)ends=Math.max(ends,y);}assert.ok(ends-middle>.09,'The deck must sag between the anchors');
  const below=new T.Raycaster(new T.Vector3(0,.24,-.01),new T.Vector3(0,-1,0));const hits=below.intersectObject(bridge,true);assert.ok(hits.length&&hits[0].point.y<.13,'A visible open valley must remain underneath the deck');
  const slopes=[];bridge.traverse(o=>{if(o.isMesh&&o.material?.userData.landscape)slopes.push(o);});for(const [x,y,z]of [[-.56,.385,.015],[.56,.420,-.040]]){const ground=new T.Raycaster(new T.Vector3(x,y+.04,z),new T.Vector3(0,-1,0)).intersectObjects(slopes);assert.ok(ground.length&&Math.abs(ground[0].point.y-y)<.06,'Both anchors must meet a real hill rather than float above it');}
 }finally{models.forEach(g=>g.traverse(o=>o.geometry?.dispose()));k.materials.forEach(m=>m.dispose());}
});

test('Phoenix Island has separated broad towers and stable facade coordinates through batching and motion changes',async()=>{
 const T=await import('three'),{createSanyaScene}=await import('../web/sanya-scene.js'),s=createSanyaScene(),g=s.landmarks.get('phoenix');
 try{const towers=g.children.filter(o=>Number.isInteger(o.material?.userData.phoenixTower)),lights=g.children.filter(o=>Number.isInteger(o.material?.userData.phoenixLight));assert.equal(towers.length,5);assert.equal(lights.length,5);
 const boxes=towers.map(m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox;});for(const b of boxes){const size=b.getSize(new T.Vector3());assert.ok(size.y/Math.max(size.x,size.z)<3.1&&size.y/Math.max(size.x,size.z)>2.4,'Tower must have a broad curved profile instead of a narrow capsule');}
 for(let i=1;i<boxes.length;i++)assert.ok(boxes[i].min.x-boxes[i-1].max.x>.02,'Separate tower shells must leave room for their projecting side ribs');
 for(const m of lights){const a=m.geometry.attributes.facadeUV;assert.equal(a.count,m.geometry.attributes.position.count);const levels=new Set();for(let i=0;i<a.count;i++){assert.ok(a.getX(i)>=0&&a.getX(i)<=1);assert.ok(a.getY(i)>=0&&a.getY(i)<=1);levels.add(a.getY(i));}assert.ok(levels.size>25,'Merged light bands retain distinct local floor heights');}
 s.setNight(true);s.update(7,false);lights.forEach(m=>assert.equal(m.material.userData.facadeTime.value,7));s.update(13,false);lights.forEach(m=>assert.equal(m.material.userData.facadeTime.value,13));s.update(16,true);s.update(99,true);lights.forEach(m=>assert.equal(m.material.userData.facadeTime.value,0));
 s.setLandmarkEnabled('phoenix',false);s.setLandmarkEnabled('phoenix',true);assert.equal(s.landmarks.get('phoenix'),g);s.setNight(false);lights.forEach(m=>assert.equal(m.material.emissiveIntensity,0));
 }finally{s.dispose();}
});
