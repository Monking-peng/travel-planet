const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Guilin limestone tunnels stay open through solid hills and terrace treads face upward',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{createLandmark}=await import('../web/guilin-landmarks.js');
 const k=makeKit({time:{value:0},night:{value:0}}),models=[];
 try{
  for(const [id,tag,x,y,solidX,solidY]of [['elephant','elephant-arch',-.27,.201,.18,.30],['moon','moon-arch',.045,.454,-.30,.22]]){
   const g=createLandmark(k,id);models.push(g);g.updateMatrixWorld(true);const rock=g.children.find(m=>m.material?.userData.naturalFeature===tag);assert.ok(rock);
   const tunnel=new T.Raycaster(new T.Vector3(x,y,.8),new T.Vector3(0,0,-1));assert.equal(tunnel.intersectObject(rock).length,0,`${id} tunnel must be physically open`);
   const wall=new T.Raycaster(new T.Vector3(solidX,solidY,.8),new T.Vector3(0,0,-1));assert.ok(wall.intersectObject(rock).length>0,`${id} must retain solid cliff beside the tunnel`);
  }
  const terraces=createLandmark(k,'longji');models.push(terraces);const heights=new Set();terraces.traverse(m=>{if(!m.material?.userData.terrace)return;const p=m.geometry.attributes.position,n=m.geometry.attributes.normal;for(let i=0;i<p.count;i++){heights.add(p.getY(i).toFixed(3));assert.ok(n.getY(i)>.95,'Terrace treads must render from above');}});assert.ok(heights.size>=16);
 }finally{models.forEach(g=>g.traverse(m=>m.geometry?.dispose()));k.materials.forEach(m=>m.dispose());}
});
test('Guilin landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createGuilinScene,RADIUS}=await import('../web/guilin-scene.js'),s=createGuilinScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});

test('Guilin module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createGuilinScene}=await import('../web/guilin-scene.js'),s=createGuilinScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});


test('Sun and Moon Pagodas retain their height ratio and their water animation respects reduced motion',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{twins}=await import('../web/guilin-twins.js'),{createGuilinScene}=await import('../web/guilin-scene.js');
 const k=makeKit({time:{value:0},night:{value:0}}),g=twins(k);g.updateMatrixWorld(true);
 try{const tops=[[.24,.07],[-.28,-.10]].map(([x,z])=>new T.Raycaster(new T.Vector3(x,2,z),new T.Vector3(0,-1,0)).intersectObject(g,true).filter(h=>h.object.isMesh)[0].point.y);assert.ok(tops[1]/tops[0]>.83&&tops[1]/tops[0]<.88,'Moon/Sun tower height should remain close to 35/41');}
 finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
 const s=createGuilinScene();try{const lake=s.landmarks.get('twins').children.find(o=>o.material?.userData.waterTime);assert.ok(lake,'Twin Pagodas lake has its own animation uniform');const m=lake.material,day=m.color.clone();assert.equal(m.emissiveIntensity,0);
 s.setNight(true);assert.ok(m.emissiveIntensity>0);s.update(6,false);assert.equal(m.userData.waterTime.value,6);s.update(12,false);assert.equal(m.userData.waterTime.value,12);
 s.update(20,true);assert.equal(m.userData.waterTime.value,0);s.update(99,true);assert.equal(m.userData.waterTime.value,0);
 s.setLandmarkEnabled('twins',false);s.setLandmarkEnabled('twins',true);assert.equal(s.landmarks.get('twins').children.find(o=>o.material===m),lake,'Module restoration reuses its water material');s.setNight(false);assert.equal(m.emissiveIntensity,0);assert.ok(day.equals(m.color));
 }finally{s.dispose();}
});
