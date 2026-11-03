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

