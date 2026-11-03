const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Xiamen sea faces stay above the globe and the suspension bridge keeps a clear span',async()=>{
 const T=await import('three'),{createXiamenScene,RADIUS}=await import('../web/xiamen-scene.js'),{makeKit}=await import('../web/wuhan-kit.js'),{haicang}=await import('../web/xiamen-modern.js');const s=createXiamenScene(),k=makeKit({time:{value:0},night:{value:0}}),bridge=haicang(k);bridge.updateMatrixWorld(true);
 try{
  const bay=s.root.getObjectByName('xiamen-bay').geometry,positions=bay.attributes.position,indices=bay.index;
  for(let i=0;i<indices.count;i+=3){const center=new T.Vector3();for(let j=0;j<3;j++)center.add(new T.Vector3().fromBufferAttribute(positions,indices.getX(i+j)));center.multiplyScalar(1/3);assert.ok(center.length()>RADIUS+.003,'Sea triangles must not cut below the globe');}
  const pylons=[];bridge.traverse(o=>{if(o.material?.userData.haicangPylons)pylons.push(o);});let ray=new T.Raycaster(new T.Vector3(0,.35,.5),new T.Vector3(0,0,-1),0,1);assert.equal(ray.intersectObjects(pylons).length,0,'Main span remains open');ray.ray.origin.x=.32;assert.ok(ray.intersectObjects(pylons).length>0,'The tower legs remain substantial');
 }finally{s.dispose();bridge.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Xiamen landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createXiamenScene,RADIUS}=await import('../web/xiamen-scene.js'),s=createXiamenScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Xiamen module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createXiamenScene}=await import('../web/xiamen-scene.js'),s=createXiamenScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});
