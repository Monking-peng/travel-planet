const {test}=require('node:test');
const assert=require('node:assert/strict');
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
