const {test}=require('node:test'),assert=require('node:assert/strict');
const dispose=root=>root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});

test('Southbank contains no rest gardens, benches or visitors',async()=>{const {createRiver}=await import('../web/planet-river.js');const r=createRiver();try{assert.equal(r.children.filter(o=>o.name.startsWith('southbank-garden-')).length,0);}finally{dispose(r);}});

test('Qiantang ribbon agrees with terrain across both ends and the longitude seam',async()=>{
  const {createRiver}=await import('../web/planet-river.js'),{terrainAt,normalAt}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  for(const [lon,lat] of [[80,-52],[110,-53],[179,-52],[220,-55],[263,-53],[-97,-53],[-181,-52]])assert.equal(terrainAt(normalAt(lon,lat)),'water');
  for(const [lon,lat] of [[179,-37],[179,-66],[110,-30],[263,-35],[0,-55]])assert.equal(terrainAt(normalAt(lon,lat)),'land');
  const river=createRiver(),water=river.getObjectByName('qiantang-water'),p=water.geometry.attributes.position,index=water.geometry.index;
  for(let i=0;i<index.count;i+=3){
    const center=new Vector3();for(let j=0;j<3;j++)center.add(new Vector3().fromBufferAttribute(p,index.getX(i+j)));
    assert.equal(terrainAt(center.normalize().toArray()),'water','visible water must be reserved as water');
  }dispose(river);
});

test('River bank paths stay dry and bridge landings meet land with an elevated channel crossing',async()=>{
  const {createRiver}=await import('../web/planet-river.js'),{terrainAt,PLANET_RADIUS:R}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  const river=createRiver(),deck=river.getObjectByName('river-bridge-deck'),p=deck.geometry.attributes.position;
  for(const i of [0,1,p.count-2,p.count-1]){const v=new Vector3().fromBufferAttribute(p,i);assert.equal(terrainAt(v.clone().normalize().toArray()),'land');assert.ok(Math.abs(v.length()-(R+.011))<1e-6);}
  const center=new Vector3().fromBufferAttribute(p,60);assert.equal(terrainAt(center.clone().normalize().toArray()),'water');assert.ok(center.length()>R+.065);
  for(const o of river.children.filter(o=>o.name==='river-walk'||o.name==='river-bridge-approach')){
    const pos=o.geometry.attributes.position;
    for(let i=0;i<pos.count;i++)assert.equal(terrainAt(new Vector3().fromBufferAttribute(pos,i).normalize().toArray()),'land',o.name);
  }
  for(const o of river.children){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5,o.name);}
  dispose(river);
});

test('Cable bridge towers meet the deck and stays connect to towers without cutting through the road',async()=>{
  const {createRiver}=await import('../web/planet-river.js'),{PLANET_RADIUS:R}=await import('../web/planet-layout.js');
  const {Vector3,Box3,Raycaster}=await import('three'),river=createRiver();river.updateMatrixWorld(true);
  const deck=river.getObjectByName('river-bridge-deck'),towers=river.children.filter(o=>o.name==='river-bridge-pylon');
  const stays=river.children.filter(o=>o.name==='river-bridge-stay');
  assert.ok(towers.length>=2&&stays.length>=30,'both spans need a visible supporting structure');
  const ends=o=>[-1,1].map(sign=>new Vector3(0,sign*o.geometry.parameters.height/2,0).applyMatrix4(o.matrixWorld)).sort((a,b)=>a.length()-b.length());
  const under=p=>{const n=p.clone().normalize();return new Raycaster(n.clone().multiplyScalar(R+.4),n.negate()).intersectObject(deck)[0];};
  const boxes=towers.map(o=>new Box3().setFromObject(o));
  for(const tower of towers){
    const foot=ends(tower)[0],hit=under(foot);assert.ok(hit,'tower must stand on deck');
    assert.ok(Math.abs(hit.point.length()-foot.length())<.001,'tower cannot float');
  }
  for(const stay of stays){
    const [foot,head]=ends(stay),hit=under(foot);assert.ok(hit,'cable anchor must meet bridge');
    assert.ok(Math.abs(hit.point.length()-foot.length())<.005,'cable anchor cannot float');
    assert.ok(boxes.some(box=>box.distanceToPoint(head)<.001),'cable must connect to a pylon');
    for(const t of [.2,.5,.8]){
      const p=foot.clone().lerp(head,t),below=under(p);assert.ok(below);
      assert.ok(p.length()>below.point.length()+.004,'cable cuts through road');
    }
  }
  dispose(river);
});

test('New woodland trees touch their planted surface and have finite, unit leaf normals',async()=>{
  const {FOREST_PARCELS}=await import('../web/planet-layout.js'),{createGarden}=await import('../web/planet-layout-scene.js'),{Vector3,Raycaster}=await import('three');
  // Three western parcels become the Lingyin court; the other woodland stays.
  // Three flat plots around Lingyin became larger wooded relief, tested in
  // heritage-woodland.test.cjs. Only the two intentional woodland belts remain.
  assert.equal(FOREST_PARCELS.length,2);let count=0;
  for(const parcel of FOREST_PARCELS){
    const model=createGarden(parcel);model.updateMatrixWorld(true);
    for(const tree of model.children.filter(o=>o.name==='woodland-tree')){
      count++;const hit=new Raycaster(new Vector3(tree.position.x,1,tree.position.z),new Vector3(0,-1,0)).intersectObject(model.children[0])[0];
      assert.ok(hit,parcel.id);assert.ok(Math.abs(tree.position.y-hit.point.y)<.001);
      const canopy=tree.getObjectByName('woodland-leaf-canopy'),g=canopy.geometry;
      for(const attr of Object.values(g.attributes))assert.ok(Array.from(attr.array).every(Number.isFinite),parcel.id);
      const n=g.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);
    }dispose(model);
  }
  assert.equal(count,FOREST_PARCELS.reduce((sum,p)=>sum+(p.kind==='forest-belt'?14:7),0));
});

test('River avenue roots meet soil and their full crowns leave both river walks and the bridge clear',async()=>{
  const {RIVER_TREE_PARCELS,footprintFrame,projectToFrame,dot}=await import('../web/planet-layout.js');
  const {createGarden}=await import('../web/planet-layout-scene.js'),{createRiver}=await import('../web/planet-river.js');
  const {Box3,Vector3,Raycaster}=await import('three'),river=createRiver();
  const paving=river.children.filter(o=>['river-walk','river-bridge-deck','river-bridge-approach'].includes(o.name));
  const pathSamples=paving.flatMap(o=>{
    const p=o.geometry.attributes.position,result=[];
    for(let i=0;i<p.count;i++)result.push(new Vector3().fromBufferAttribute(p,i).normalize().toArray());
    return result;
  });
  // The Olympic district replaces part of the southern tree belt; every
  // remaining tree must still pass the same grounding and clearance checks.
  assert.ok(RIVER_TREE_PARCELS.length>0);
  for(const parcel of RIVER_TREE_PARCELS){
    const garden=createGarden(parcel);garden.updateMatrixWorld(true);
    const tree=garden.getObjectByName('woodland-tree'),ground=garden.children[0];
    const hit=new Raycaster(new Vector3(0,1,0),new Vector3(0,-1,0)).intersectObject(ground)[0];
    assert.ok(tree&&hit,parcel.id);assert.ok(Math.abs(tree.position.y-hit.point.y)<.001,parcel.id);
    const box=new Box3().setFromObject(garden),frame=footprintFrame({...parcel,scale:1},{min:box.min.toArray(),max:box.max.toArray()},.01);
    for(const n of pathSamples){
      if(dot(n,frame.up)<.8)continue;
      const q=projectToFrame(n,frame),[lo,,hi]=frame.polygon;
      assert.ok(!q||q[0]<=lo[0]||q[0]>=hi[0]||q[1]<=lo[1]||q[1]>=hi[1],parcel.id+' encroaches on river paving');
    }
    dispose(garden);
  }
  dispose(river);
});

test('River terrace stays on connected dry ground, outside trees, all optional plots and existing roads',async()=>{
  const {createRiver}=await import('../web/planet-river.js');
  const {terrainAt,PLANET_RADIUS:R,footprintFrame,projectToFrame,dot,PUBLIC_ROADS}=await import('../web/planet-layout.js');
  const {measurePieces,measureContext,measureGardens,sampleRoad,entryGeo}=await import('../web/planet-layout-scene.js');
  const {Vector3}=await import('three'),river=createRiver(),paving=river.getObjectByName('river-terrace-paving');
  const p=paving.geometry.attributes.position,index=paving.geometry.index,samples=[];
  for(let i=0;i<p.count;i++)samples.push(new Vector3().fromBufferAttribute(p,i));
  for(let i=0;i<index.count;i+=3){
    const center=new Vector3();for(let j=0;j<3;j++)center.add(new Vector3().fromBufferAttribute(p,index.getX(i+j)));
    center.divideScalar(3);assert.ok(center.length()>R+.006,'paving sinks into the globe');samples.push(center);
  }
  for(const v of samples)assert.equal(terrainAt(v.clone().normalize().toArray()),'land');
  const pieces=measurePieces(),context=measureContext(),frames=[...pieces,...context,...measureGardens()].map(p=>({id:p.id,frame:footprintFrame(p,p.bounds,.005)}));
  for(const {id,frame} of frames)for(const v of samples){
    const n=v.clone().normalize().toArray();if(dot(n,frame.up)<.8)continue;
    const q=projectToFrame(n,frame),[lo,,hi]=frame.polygon;
    assert.ok(!q||q[0]<=lo[0]||q[0]>=hi[0]||q[1]<=lo[1]||q[1]>=hi[1],id+' overlaps terrace');
  }
  const roads=[...PUBLIC_ROADS,...[...pieces,...context].filter(p=>p.road).map(p=>({id:p.id,width:.026,points:[entryGeo(p),...(p.via||[]),p.road]}))];
  for(const road of roads){
    const points=sampleRoad(road.points);
    for(const v of samples)for(const n of points)assert.ok(v.clone().normalize().distanceTo(n)*R>road.width/2+.001,road.id+' overlaps terrace');
  }
  const walk=river.children.find(o=>o.name==='river-walk').geometry.attributes.position;
  const walkCenters=[];for(let i=0;i<walk.count;i+=2)walkCenters.push(new Vector3().fromBufferAttribute(walk,i).add(new Vector3().fromBufferAttribute(walk,i+1)).multiplyScalar(.5));
  for(let i=0;i<p.count;i+=5)assert.ok(Math.min(...walkCenters.map(v=>v.distanceTo(new Vector3().fromBufferAttribute(p,i))))<.015,'terrace must join river walk along its full front');
  dispose(river);
});

test('City Balcony furniture is grounded on the upper deck and leaves the existing through walk open',async()=>{
  const {createRiver}=await import('../web/planet-river.js'),{PLANET_RADIUS:R}=await import('../web/planet-layout.js');
  const {Vector3,Raycaster}=await import('three'),river=createRiver();river.updateMatrixWorld(true);
  const deck=river.getObjectByName('city-balcony-upper-deck');
  const furniture=river.children.filter(o=>['city-balcony-canopy-post','city-balcony-bench','city-balcony-visitor','city-balcony-tree','city-balcony-light-post','city-balcony-lamp'].includes(o.name));
  assert.ok(furniture.length>10);
  for(const o of furniture){
    const p=o.geometry.attributes.position,vertices=Array.from({length:p.count},(_,i)=>new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));
    for(const vertex of vertices){
      const n=vertex.clone().normalize(),hit=new Raycaster(n.clone().multiplyScalar(R+.2),n.clone().negate()).intersectObject(deck)[0];
      assert.ok(hit,o.name+' extends off deck');
    }
    if(['city-balcony-canopy-post','city-balcony-light-post'].includes(o.name)){
      const foot=vertices.sort((a,b)=>a.length()-b.length())[0],n=foot.clone().normalize();
      const hit=new Raycaster(n.clone().multiplyScalar(R+.2),n.clone().negate()).intersectObject(deck)[0];
      assert.ok(Math.abs(foot.length()-hit.point.length())<.0015,o.name+' is floating');
    }
  }
  const walk=river.children.find(o=>o.name==='river-walk').geometry.attributes.position;
  for(let i=0;i<walk.count;i+=2){
    const n=new Vector3().fromBufferAttribute(walk,i).add(new Vector3().fromBufferAttribute(walk,i+1)).normalize();
    assert.ok(!new Raycaster(n.clone().multiplyScalar(R+.2),n.clone().negate()).intersectObjects(furniture)[0],'furniture blocks through walk');
  }
  dispose(river);
});

test('City Balcony projects over water, stays clear of the bridge, and has connected dry access to both levels',async()=>{
  const {createRiver}=await import('../web/planet-river.js');
  const {terrainAt,PLANET_RADIUS:R,footprintFrame,projectToFrame,dot}=await import('../web/planet-layout.js');
  const {measurePieces,measureContext,measureGardens}=await import('../web/planet-layout-scene.js');
  const {Vector3,Raycaster}=await import('three'),river=createRiver();river.updateMatrixWorld(true);
  const upper=river.getObjectByName('city-balcony-upper-deck'),lower=river.getObjectByName('city-balcony-lower-deck');
  const frames=[...measurePieces(),...measureContext(),...measureGardens()].map(p=>({id:p.id,frame:footprintFrame(p,p.bounds,.005)}));
  for(const deck of [upper,lower]){
    const p=deck.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const vertex=new Vector3().fromBufferAttribute(p,i),n=vertex.clone().normalize();
      assert.equal(terrainAt(n.toArray()),'water');assert.ok(vertex.length()>R+.01);
      for(const {id,frame} of frames){
        if(dot(n.toArray(),frame.up)<.8)continue;
        const q=projectToFrame(n.toArray(),frame),[lo,,hi]=frame.polygon;
        assert.ok(!q||q[0]<=lo[0]||q[0]>=hi[0]||q[1]<=lo[1]||q[1]>=hi[1],id+' overlaps balcony');
      }
      const hits=new Raycaster(n.clone().multiplyScalar(R+.3),n.clone().negate()).intersectObjects(river.children.filter(o=>o.name.startsWith('river-bridge')));
      assert.equal(hits.length,0,'balcony overlaps bridge');
    }
  }
  const stairs=river.children.filter(o=>o.name==='city-balcony-stair-tread');assert.equal(stairs.length,6);
  const nearest=(v,mesh)=>{
    const p=mesh.geometry.attributes.position;let d=Infinity;
    for(let i=0;i<p.count;i++)d=Math.min(d,v.distanceTo(new Vector3().fromBufferAttribute(p,i)));return d;
  };
  const walk=river.children.find(o=>o.name==='river-walk'),first=stairs[0].geometry.attributes.position,last=stairs.at(-1).geometry.attributes.position;
  assert.ok(nearest(new Vector3().fromBufferAttribute(first,10),walk)<.012,'stairs must meet bank walk');
  assert.ok(nearest(new Vector3().fromBufferAttribute(last,11),upper)<.012,'stairs must meet upper deck');
  const lowerAccess=river.children.filter(o=>o.name==='city-balcony-lower-access');assert.equal(lowerAccess.length,2);
  for(const ramp of lowerAccess){
    const p=ramp.geometry.attributes.position;
    assert.ok(nearest(new Vector3().fromBufferAttribute(p,0),walk)<.012,'lower gallery access must meet bank walk');
    assert.ok(nearest(new Vector3().fromBufferAttribute(p,p.count-1),lower)<.012,'lower gallery access must meet its deck');
  }
  for(let i=1;i<stairs.length;i++){
    const a=stairs[i-1].geometry.attributes.position,b=stairs[i].geometry.attributes.position;
    const va=new Vector3().fromBufferAttribute(a,11),vb=new Vector3().fromBufferAttribute(b,10);
    assert.ok(va.clone().normalize().distanceTo(vb.clone().normalize())<1e-6);
    assert.ok(vb.length()-va.length()>0&&vb.length()-va.length()<.008);
  }
  assert.ok(river.children.filter(o=>o.name==='city-balcony-pier').length>=10);
  dispose(river);
});
