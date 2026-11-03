const {test}=require('node:test');
const assert=require('node:assert/strict');
test('HongKong landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createHongKongScene,RADIUS}=await import('../web/hongkong-scene.js'),s=createHongKongScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));assert.ok(Math.abs(p.clone().normalize().y)>.29,`${id} overlaps the harbour`);}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,10);assert.equal(caps.filter(x=>x.normal.y<0).length,5);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});

test('HongKong preserves the HSBC open undercroft, climbable Buddha approach and animated M+ facade',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{createLandmark}=await import('../web/hongkong-landmarks.js');const clock={time:{value:0},night:{value:0}},k=makeKit(clock);k.clock=clock;const models=[];
 try{
  const hsbc=createLandmark(k,'hsbc');models.push(hsbc);hsbc.updateMatrixWorld(true);const open=new T.Raycaster(new T.Vector3(0,.09,.35),new T.Vector3(0,0,-1),0,.7).intersectObject(hsbc,true);assert.equal(open.length,0,'The public undercroft should remain open rather than a solid tower base');
  const buddha=createLandmark(k,'buddha');models.push(buddha);buddha.updateMatrixWorld(true);for(const j of [4,9,14,19]){const z=.51-j*.0095,expected=.025+(j+1)*.0105+.0055,hit=new T.Raycaster(new T.Vector3(0,1.2,z),new T.Vector3(0,-1,0)).intersectObject(buddha,true)[0];assert.ok(hit&&Math.abs(hit.point.y-expected)<.004,'Hill must not cover the stair tread');}
  const m=createLandmark(k,'mplus');models.push(m);const material=k.materials.find(m=>m.userData.mplusScreen);assert.ok(material);const shader={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:'#include <emissivemap_fragment>'};material.onBeforeCompile(shader);assert.equal(shader.uniforms.hkTime,clock.time,'The screen must use the scene animation clock, not a frozen fallback');assert.match(shader.fragmentShader,/hkTime/);
 }finally{models.forEach(g=>g.traverse(o=>o.geometry?.dispose()));k.materials.forEach(m=>m.dispose());}
});

test('HongKong module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createHongKongScene}=await import('../web/hongkong-scene.js'),s=createHongKongScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});


