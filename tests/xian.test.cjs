const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Furong Lake has only its shoreline boundary after curving onto the planet',async()=>{
 const {createXianScene}=await import('../web/xian-scene.js'),s=createXianScene();
 try{let water;s.landmarks.get('furong').traverse(o=>{if(o.material?.userData.furongLake)water=o;});assert.ok(water);
  const p=water.geometry.attributes.position,edges=new Map(),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(6)).join(',');
  for(let i=0;i<p.count;i+=3){const a=key(i),b=key(i+1),c=key(i+2);for(const [u,v]of [[a,b],[b,c],[c,a]]){if(u===v)continue;const edge=[u,v].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1);}}
  const boundary=new Map();for(const [edge,count]of edges){assert.ok(count<=2);if(count!==1)continue;const [a,b]=edge.split('|');for(const [u,v]of [[a,b],[b,a]]){const n=boundary.get(u)||new Set();n.add(v);boundary.set(u,n);}}
  assert.ok(boundary.size>100);for(const n of boundary.values())assert.equal(n.size,2,'Internal T junction cracks the curved water');
  const visited=new Set(),pending=[boundary.keys().next().value];while(pending.length){const v=pending.pop();if(visited.has(v))continue;visited.add(v);for(const n of boundary.get(v))pending.push(n);}assert.equal(visited.size,boundary.size);
 }finally{s.dispose();}
});

test('Xian complete modules occupy both hemispheres without sinking or crowding',async()=>{
 const T=await import('three'),{createXianScene,RADIUS}=await import('../web/xian-scene.js'),s=createXianScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);
 for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.04,`${a.id}/${b.id} crowded`);}
 }finally{s.dispose();}
});
test('Bell tower retains real crossing tunnels rather than painted doorways',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{bell}=await import('../web/xian-towers.js'),k=makeKit({time:{value:0},night:{value:0}}),g=bell(k);g.updateMatrixWorld(true);
 try{for(const [start,dir]of [[[0,.07,.35],[0,0,-1]],[[.35,.07,0],[-1,0,0]]])assert.equal(new T.Raycaster(new T.Vector3(...start),new T.Vector3(...dir),0,.70).intersectObject(g,true).length,0);assert.ok(new T.Raycaster(new T.Vector3(.20,.07,.35),new T.Vector3(0,0,-1),0,.70).intersectObject(g,true).length>0);
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Xian module lights detach together, night preserves colors and resources dispose once',async()=>{
 const {createXianScene}=await import('../web/xian-scene.js'),s=createXianScene(),original=new Map(s.landmarks),geos=new Set(),colors=new Map(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material?.color&&o.userData.landmark){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(7,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let count=0;geos.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(count,geos.size);
});

test('Bell tower colonnades remain open around recessed rooms and supported balcony',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{bell}=await import('../web/xian-bell.js'),k=makeKit({time:{value:0},night:{value:0}}),g=bell(k);g.updateMatrixWorld(true);
 const hits=(start,dir,length)=>new T.Raycaster(new T.Vector3(...start),new T.Vector3(...dir),0,length).intersectObject(g,true);
 try{
  assert.equal(hits([-.25,.28,.195],[1,0,0],.50).length,0,'front outer gallery must remain free of the interior wall');
  assert.equal(hits([.195,.28,-.25],[0,0,1],.50).length,0,'side gallery must remain open');
  assert.ok(hits([0,.28,.195],[0,0,-1],.40).length>0,'room wall must remain recessed behind gallery');
  assert.ok(hits([.075,.28,.27],[0,0,-1],.06).length>0,'outer red columns must support the canopy');
  assert.ok(hits([0,.44,.35],[0,0,-1],.70).length>0,'upper gallery has a continuous structural apron');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});
