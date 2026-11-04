const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Drum tower keeps its arch and galleries open with level side stairs and gabled roof',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{drum}=await import('../web/xian-drum.js'),k=makeKit({time:{value:0},night:{value:0}}),g=drum(k);g.updateMatrixWorld(true);
 const hits=(p,d,n=1)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,n).intersectObject(g,true);
 try{
  assert.equal(hits([0,.07,.4],[0,0,-1],.8).length,0,'north-south arch must be a real passage');
  assert.ok(hits([.16,.07,.4],[0,0,-1],.8).length>0,'brick piers support the platform');
  for(const y of [.26,.45])assert.equal(hits([-.4,y,.15],[1,0,0],.8).length,0,'recessed rooms leave a continuous outer gallery');
  const gable=hits([.5,.658,0],[-1,0,0],.4)[0];assert.ok(gable&&gable.point.x>.285&&gable.point.x<.31,'short side retains its triangular gable');
  for(const s of [-1,1]){
   let previous=.014;for(let i=0;i<22;i++){const hit=hits([s*.565,.25,.380-i*.021],[0,-1,0],.3)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-previous-.008)<1e-5,'stair treads are consecutive and level');previous=hit.point.y;}
   const landing=hits([s*.565,.25,-.11],[0,-1,0],.3)[0],deck=hits([s*.40,.25,-.11],[0,-1,0],.3)[0];assert.ok(Math.abs(landing.point.y-previous)<1e-5&&Math.abs(deck.point.y-previous)<1e-5,'side landing meets the terrace without a barrier');
  }
  assert.ok(new T.Box3().setFromObject(g).max.y>.73);
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});

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
 s.setNight(true);colors.forEach((c,m)=>{assert.ok(c.equals(m.color));assert.ok([m.emissive.r,m.emissive.g,m.emissive.b,m.emissiveIntensity].every(Number.isFinite),'cloned module materials must retain valid night colors');});assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(7,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
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

test('Wild Goose Pagoda has deep arched openings, a level plinth and continuous entry steps',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{pagoda}=await import('../web/xian-pagoda.js'),k=makeKit({time:{value:0},night:{value:0}}),g=pagoda(k);g.updateMatrixWorld(true);
 const hit=(start,dir,length=1)=>new T.Raycaster(new T.Vector3(...start),new T.Vector3(...dir),0,length).intersectObject(g,true)[0];
 try{
  const doorway=hit([.008,.11,.12],[0,0,-1]),wall=hit([.065,.11,.12],[0,0,-1]);assert.ok(doorway&&wall);assert.ok(wall.point.z-doorway.point.z>.015,'entry must sit behind the solid masonry facade');
  for(const x of [-.129,.129]){const niche=hit([x,.095,.12],[0,0,-1]);assert.ok(niche&&niche.point.z<wall.point.z-.009,'stele niches must have depth, not a painted arch');}
  const plinth=[-.22,0,.22].map(x=>hit([x,.20,.08],[0,-1,0]).point.y);assert.ok(Math.max(...plinth)-Math.min(...plinth)<1e-6,'stone platform must stay level');
  let previous=.012;for(let i=0;i<6;i++){const top=hit([.04,.2,.232-i*.023],[0,-1,0]).point.y;assert.ok(top>previous&&top-previous<.009,'entry steps rise without a gap or tall barrier');previous=top;}assert.ok(Math.abs(previous-plinth[0])<1e-5,'last step meets the plinth');
  const box=new T.Box3().setFromObject(g);assert.ok(box.max.y>1.22&&box.max.y<1.30,'seven-storey silhouette keeps its finial and proportions');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});


test('Small Wild Goose Pagoda has north-south recessed windows, broken crown and connected court',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{smallPagoda}=await import('../web/xian-small.js'),k=makeKit({time:{value:0},night:{value:0}}),g=smallPagoda(k);g.updateMatrixWorld(true);
 const hit=(p,d,n=2)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,n).intersectObject(g,true)[0];
 try{
  for(const sign of [-1,1]){
   const window=hit([0,.528,sign*.4-.12],[0,0,-sign]),wall=hit([.055,.528,sign*.4-.12],[0,0,-sign]);assert.ok(window&&wall);assert.ok(sign*(wall.point.z-window.point.z)>.007,'north-south arches must be recessed in masonry');
   const solid=hit([sign*.4,.528,-.12],[-sign,0,0]);assert.ok(solid&&Math.abs(solid.point.x)>.13,'east-west sides retain solid brick walls');
   let previous=.013;for(let i=0;i<7;i++){const step=hit([0,.09,sign*(.380-i*.020)-.12],[0,-1,0],.1);assert.ok(step);assert.ok(Math.abs(step.point.y-previous-.010)<1e-5,'north-south steps rise continuously');previous=step.point.y;}
   const deck=hit([.05,.09,sign*.22-.12],[0,-1,0],.1);assert.ok(deck&&Math.abs(deck.point.y-previous)<1e-5,'last tread meets the level plinth');
  }
  const well=hit([.012,1.5,-.12+.012],[0,-1,0]);for(const x of [-.053,.053])for(const z of [-.053,.053]){const pier=hit([x,1.5,z-.12],[0,-1,0]);assert.ok(pier.point.y-well.point.y>.020,'four surviving corner piers enclose an open crown');}
  assert.equal(hit([0,.060,.65],[0,0,-1],.42),undefined,'central temple entrance must remain a usable passage');
  g.traverse(o=>{if(o.isMesh)assert.ok(o.material.userData.smallPagodaRigid,'court lamps and buildings use the same level foundation');});
  const bounds=new T.Box3().setFromObject(g);assert.ok(bounds.max.y>1.27&&bounds.max.y<1.31,'tower retains thirteen-storey height without a fictitious spire');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});
