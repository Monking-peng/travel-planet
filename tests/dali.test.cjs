const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Dali landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createDaliScene,RADIUS}=await import('../web/dali-scene.js'),s=createDaliScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});

test('Dali arcade openings stay physically open and water triangles do not expose the globe',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{archOpening}=await import('../web/tianjin-kit.js');
 const kit=makeKit({time:{value:0},night:{value:0}}),group=new T.Group(),mat=kit.mat('#aaa');mat.side=T.DoubleSide;
 const arch=archOpening(kit,group,mat);group.updateMatrixWorld(true);
 const through=new T.Raycaster(new T.Vector3(0,.045,.4),new T.Vector3(0,0,-1));assert.equal(through.intersectObject(arch).length,0,'Arcade center must not be filled by a fake dark doorway');
 const pier=new T.Raycaster(new T.Vector3(.052,.045,.4),new T.Vector3(0,0,-1));assert.ok(pier.intersectObject(arch).length>0,'The flanking pier must remain solid');arch.geometry.dispose();mat.dispose();
 const {createDaliScene,RADIUS}=await import('../web/dali-scene.js'),s=createDaliScene();
 try{const bay=s.root.getObjectByName('dali-bay'),a=bay.geometry.attributes.position,ix=bay.geometry.index;for(let i=0;i<ix.count;i+=3){const center=new T.Vector3();for(let j=0;j<3;j++)center.add(new T.Vector3().fromBufferAttribute(a,ix.getX(i+j)));assert.ok(center.multiplyScalar(1/3).length()>RADIUS);}}
 finally{s.dispose();}
});
test('Dali module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createDaliScene}=await import('../web/dali-scene.js'),s=createDaliScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});


test('Three Pagodas separate real windows from recessed figures and preserve the main-to-side height ratio',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{pagodas}=await import('../web/dali-pagodas.js'),k=makeKit({time:{value:0},night:{value:0}}),g=pagodas(k);g.updateMatrixWorld(true);
 const hits=(x,y)=>new T.Raycaster(new T.Vector3(x,y,.19),new T.Vector3(0,0,-1),0,.10).intersectObject(g,true).filter(h=>h.object.isMesh);
 try{assert.equal(hits(0,.346).length,0,'Second upper-storey window is physically open');assert.ok(hits(.035,.346).length>0,'Masonry beside the window stays solid');assert.ok(hits(0,.280).length>0,'Adjacent storey keeps its recessed statue');
  const tops=[0,-.31,.31].map(x=>new T.Raycaster(new T.Vector3(x,1.5,x===0?.03:-.21),new T.Vector3(0,-1,0)).intersectObject(g,true).filter(h=>h.object.isMesh)[0].point.y);
  for(const top of tops.slice(1)){const ratio=(top-.034)/(tops[0]-.034);assert.ok(ratio>.60&&ratio<.64,'Side towers should be about 42:69 of the main tower height');}assert.ok(Math.abs(tops[1]-tops[2])<.0001,'Side towers match in height');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Wuhua preserves a clear arched street passage, continuous paving and open outer galleries',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{wuhua}=await import('../web/dali-wuhua.js'),k=makeKit({time:{value:0},night:{value:0}}),g=wuhua(k);g.updateMatrixWorld(true);const walls=[],paving=[];g.traverse(o=>{if(o.isMesh&&o.material.userData.wuhuaWall)walls.push(o);if(o.isMesh&&o.material.userData.wuhuaPaving)paving.push(o);});
 const ray=(x,y,z,dx,dy,dz,far,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(dx,dy,dz),0,far).intersectObjects(objects,false);
 try{
  for(const x of [-.07,0,.07]){assert.equal(ray(x,.10,.5,0,0,-1,1,walls).length,0,'Street passage remains open');for(let i=0;i<201;i++){const z=-.5+i/200,h=ray(x,.08,z,0,-1,0,.08,paving);assert.ok(h.length);assert.ok(Math.abs(h[0].point.y-.028)<.0001,'Paving must stay level through the arch');}}
  assert.ok(ray(.18,.10,.5,0,0,-1,1,walls).length,'Masonry piers remain solid');
  const meshes=[];g.traverse(o=>{if(o.isMesh)meshes.push(o);});assert.equal(ray(-.31,.40,.156,1,0,0,.62,meshes).length,0,'Recessed main hall must leave a usable front gallery');
  const b=new T.Box3().setFromObject(g);assert.ok(b.max.y>1&&b.max.y<1.15,'Three-tier pavilion keeps its full roof finial');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Dali South Gate preserves three open passages with continuous supported approaches and a clear lower gallery',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{south}=await import('../web/dali-south.js'),k=makeKit({time:{value:0},night:{value:0}}),g=south(k);g.updateMatrixWorld(true);const walls=[],paving=[],all=[];g.traverse(o=>{if(!o.isMesh)return;all.push(o);if(o.material.userData.southWall)walls.push(o);if(o.material.userData.southPaving)paving.push(o);});
 const hits=(x,y,z,dir,far,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(...dir),0,far).intersectObjects(objects,false);
 try{for(const x of [-.56,0,.56]){assert.equal(hits(x,.10,.4,[0,0,-1],.8,walls).length,0,'Opening must pass through the complete wall');const range=x===0?.54:.37;let previous;for(let i=0;i<=200;i++){const z=-range+2*range*i/200,h=hits(x,.08,z,[0,-1,0],.2,paving);assert.ok(h.length);const y=h[0].point.y;if(previous!==undefined)assert.ok(Math.abs(y-previous)<.005,'Approach must descend continuously to the terrain');previous=y;if(Math.abs(z)<.13)assert.ok(Math.abs(y-.029)<.0001,'Tunnel remains level');}}
  assert.ok(hits(.25,.10,.4,[0,0,-1],.8,walls).length,'Flanking masonry remains solid');assert.equal(hits(-.36,.44,.145,[1,0,0],.72,all).length,0,'Recessed wall leaves an open gallery');

 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
