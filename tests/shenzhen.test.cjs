const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Shenzhen complete landmark modules detach with their lighting and release resources once',async()=>{
  const {createShenzhenScene}=await import('../web/shenzhen-scene.js'),{LANDMARKS}=await import('../web/shenzhen-landmarks.js');const scene=createShenzhenScene(),original=new Map(scene.landmarks),geometries=new Set();
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,13);
  scene.root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const key of ['position','normal'])for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name} ${key}`);});
  scene.setNight(true);
  for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o)));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let count=0;geometries.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(count,geometries.size);
});

test('Shenzhen models stay above ground, off the bay and separated across both hemispheres',async()=>{
  const T=await import('three'),{createShenzhenScene,RADIUS,shorelineZ}=await import('../web/shenzhen-scene.js');const scene=createShenzhenScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g]of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks into terrain`);radius=Math.max(radius,normal.angleTo(p));p.normalize().multiplyScalar(RADIUS);assert.ok(p.z<shorelineZ(Math.atan2(p.y,p.x))-.02,`${id} intrudes into water`);}});caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.ok(caps.filter(c=>c.normal.y<0).length>=4);assert.ok(scene.root.getObjectByName('shenzhen-bay'));
  }finally{scene.dispose();}
});

test('Dapeng gate has a through-opening and solid wall on both sides',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{dapeng}=await import('../web/shenzhen-places.js');const k=makeKit({time:{value:0},night:{value:0}}),g=dapeng(k);g.updateMatrixWorld(true);
  try{const open=new T.Raycaster(new T.Vector3(0,.08,.10),new T.Vector3(0,0,-1));assert.equal(open.intersectObject(g,true).length,0);for(const x of [-.12,.12]){const wall=new T.Raycaster(new T.Vector3(x,.08,.10),new T.Vector3(0,0,-1));assert.ok(wall.intersectObject(g,true).length>0);}}
  finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Shenzhen night lights change gently, preserve base colors and respect reduced motion',async()=>{
  const {createShenzhenScene}=await import('../web/shenzhen-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/shenzhen-landmarks.js');const scene=createShenzhenScene();
  try{assert.deepEqual([...parseRemovedModules('["wheel","palace","wheel",null]',LANDMARKS)],['wheel']);const colors=new Map(),pulse=[];scene.landmarks.forEach(g=>g.traverse(o=>{if(o.material?.color)colors.set(o.material,o.material.color.clone());if(o.material?.userData.pulse)pulse.push(o.material);}));assert.ok(pulse.length);scene.setNight(true);colors.forEach((color,m)=>assert.ok(m.color.equals(color)));scene.update(1,false);const values=pulse.map(m=>m.emissiveIntensity);scene.update(4,false);assert.ok(pulse.some((m,i)=>m.emissiveIntensity!==values[i]));scene.update(5,true);const still=pulse.map(m=>m.emissiveIntensity);scene.update(30,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),still);scene.setNight(false);scene.update(31,false);assert.ok(pulse.every(m=>m.emissiveIntensity===0));}
  finally{scene.dispose();}
});

test('Minghua portholes and promenade windows are visible outside the hull',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{minghua}=await import('../web/shenzhen-minghua.js');const k=makeKit({time:{value:0},night:{value:0}}),g=minghua(k);g.updateMatrixWorld(true);
  try{
    for(const [x,y,color] of [[-.028,.088,'344b50'],[-.028,.131,'344b50'],[-.080,.201,'34515a'],[-.080,.241,'34515a']]){
      const hits=new T.Raycaster(new T.Vector3(x,y,.5),new T.Vector3(0,0,-1)).intersectObject(g,true);
      assert.ok(hits.length);assert.equal(hits[0].object.material.color.getHexString(),color,`Window at ${x}, ${y} is hidden behind the ship wall`);
    }
    const water=new T.Raycaster(new T.Vector3(.18,.5,.30),new T.Vector3(0,-1,0)).intersectObject(g,true);
    assert.ok(water.length);assert.equal(water[0].object.material.color.getHexString(),'468d91','The fountain forecourt must remain an enclosed water pool');
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Shenzhen waterfront connects seven districts and remains when buildings are removed',async()=>{
  const T=await import('three'),{createShenzhenScene,RADIUS,shorelineZ}=await import('../web/shenzhen-scene.js');const scene=createShenzhenScene();scene.root.updateMatrixWorld(true);
  try{
    const walk=scene.root.getObjectByName('shenzhen-coastal-greenway');assert.ok(walk);assert.deepEqual(walk.userData.connections.map(c=>c.id).sort(),['civic','cocoon','diwang','minghua','wheel','window','talent'].sort());assert.deepEqual(walk.userData.districtLinks.map(c=>[c.from,c.to]),[['bamboo','talent'],['cocoon','talent'],['culture','civic'],['lianhua','culture']]);
    walk.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const p=new T.Vector3().fromBufferAttribute(positions,i);assert.ok(p.length()>RADIUS,'Walks and lamps must stay above terrain');p.normalize().multiplyScalar(RADIUS);assert.ok(p.z<shorelineZ(Math.atan2(p.y,p.x)),'The greenway must not cut across the sea');}});
    for(const id of [...scene.landmarks.keys()])scene.setLandmarkEnabled(id,false);assert.equal(walk.parent,scene.root);assert.equal(scene.landmarks.size,0);
  }finally{scene.dispose();}
});

test('Talent Park has an open inner lake and two supported walkable bridges above it',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{talentPark}=await import('../web/shenzhen-talent-park.js');
  const k=makeKit({time:{value:0},night:{value:0}}),g=talentPark(k);g.updateMatrixWorld(true);
  try{
    for(const [x,z]of g.userData.waterSamples){const hits=new T.Raycaster(new T.Vector3(x,.5,z),new T.Vector3(0,-1,0)).intersectObject(g,true);assert.ok(hits.length);assert.equal(hits[0].object.material.color.getHexString(),'3f7079','Park land or props must not cover the inner lake');}
    for(const [x,,z]of g.userData.bridgeSamples){const hits=new T.Raycaster(new T.Vector3(x,.5,z),new T.Vector3(0,-1,0)).intersectObject(g,true);assert.ok(hits.length);assert.ok(hits[0].point.y>=.051&&hits[0].point.y<=.056,'The center of each bridge must be a continuous deck');const water=hits.find(h=>h.object.material.color.getHexString()==='3f7079');assert.ok(water&&water.point.y<hits[0].point.y-.03,'The bridge must cross above the enclosed lake');}
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Talent Park curved lake has one closed boundary without cracks between triangles',async()=>{
  const {createShenzhenScene}=await import('../web/shenzhen-scene.js'),scene=createShenzhenScene();
  try{
    let water;scene.landmarks.get('talent').traverse(o=>{if(o.isMesh&&o.material.color.getHexString()==='3f7079')water=o;});assert.ok(water);
    const p=water.geometry.attributes.position,edges=new Map(),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(6)).join(',');
    for(let i=0;i<p.count;i+=3){const a=key(i),b=key(i+1),c=key(i+2);for(const [u,v]of [[a,b],[b,c],[c,a]]){if(u===v)continue;const edge=[u,v].sort().join('|');edges.set(edge,(edges.get(edge)||0)+1);}}
    const boundary=new Map();for(const [edge,count]of edges){assert.ok(count<=2,'Water faces must not overlap');if(count!==1)continue;const [a,b]=edge.split('|');for(const [u,v]of [[a,b],[b,a]]){const neighbors=boundary.get(u)||new Set();neighbors.add(v);boundary.set(u,neighbors);}}
    assert.ok(boundary.size>100);for(const neighbors of boundary.values())assert.equal(neighbors.size,2,'An internal T junction would split the bent water surface');
    const visited=new Set(),pending=[boundary.keys().next().value];while(pending.length){const v=pending.pop();if(visited.has(v))continue;visited.add(v);for(const n of boundary.get(v))pending.push(n);}assert.equal(visited.size,boundary.size,'The lake must have only its outer shore, not internal holes');
  }finally{scene.dispose();}
});

test('Civic Center retains the open central axis, split roof, and correctly colored sloping towers',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{civic}=await import('../web/shenzhen-city-hall.js');
  const k=makeKit({time:{value:0},night:{value:0}}),g=civic(k);g.updateMatrixWorld(true);
  const down=(x,z)=>new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,-1,0)).intersectObject(g,true);
  try{
    const passage=new T.Raycaster(new T.Vector3(0,.06,.30),new T.Vector3(0,0,-1)).intersectObject(g,true);assert.equal(passage.length,0,'The two podiums must leave a through-passage');
    const slot=down(0,-.010);assert.ok(slot.length);assert.ok(slot[0].point.y<.04,'The narrow roof slot must open onto the passage between its braces');
    for(const x of [-.035,.035,-.44,.44]){const roof=down(x,-.01);assert.ok(roof.length);assert.equal(roof[0].object.material.color.getHexString(),'4f7c96','The roof either side of the slot must stay closed');}
    for(const [sign,color] of [[-1,'d1a634'],[1,'a64442']]){
      const outer=down(sign*.22,-.105),inner=down(sign*.14,-.105);
      assert.equal(outer[0].object.material.color.getHexString(),color);assert.equal(inner[0].object.material.color.getHexString(),color);
      assert.ok(outer[0].point.y>inner[0].point.y+.02,'Tower tops slope toward the central axis');
    }
    const lights=[];g.traverse(o=>{if(o.isSpotLight)lights.push(o);});assert.equal(lights.length,2);assert.ok(lights.every(l=>l.target.parent===g&&l.intensity===0&&l.userData.nightIntensity>0));
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});


test('Cultural pair leaves a clear public axis, closes its folded roofs and carries distinct interior lighting',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{cultureCenter}=await import('../web/shenzhen-culture.js');
 const k=makeKit({time:{value:0},night:{value:0}}),g=cultureCenter(k);g.updateMatrixWorld(true);
 try{
  const axis=new T.Raycaster(new T.Vector3(0,.06,.33),new T.Vector3(0,0,-1)).intersectObject(g,true);assert.equal(axis.length,0,'People and the bridge must not block the central passage');
  const bridge=new T.Raycaster(new T.Vector3(0,.30,-.205),new T.Vector3(0,-1,0)).intersectObject(g,true);assert.ok(bridge.length&&bridge[0].point.y>.09,'An elevated link spans the clear axis');
  for(const side of [-1,1])for(const z of [-.14,-.045,.055])for(const dx of [-.08,0,.08]){
   const hits=new T.Raycaster(new T.Vector3(side*.275+dx,.6,z),new T.Vector3(0,-1,0)).intersectObject(g,true);assert.ok(hits.some(h=>h.point.y>.095&&!h.object.material.transparent),'The three folded roof bays must close over each foyer');
  }
  const lights=[];g.traverse(o=>{if(o.isPointLight)lights.push(o);});assert.equal(lights.length,2);assert.ok(lights.every(l=>l.parent===g&&l.intensity===0&&l.userData.nightIntensity>0));assert.notEqual(lights[0].color.getHex(),lights[1].color.getHex());
  assert.ok(k.materials.some(m=>m.transparent&&m.opacity<.5),'Glazing must preserve views of the branching columns');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
