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
