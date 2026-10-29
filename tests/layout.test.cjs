const {test}=require('node:test'),assert=require('node:assert/strict');

test('The Grand Theatre shell faces outward and its forecourt skirt meets the curved earth',async()=>{
  const THREE=await import('three'),{createGrandTheatre}=await import('../web/planet-architecture.js'),{PLANET_RADIUS:R}=await import('../web/planet-layout.js');
  const root=createGrandTheatre(THREE);
  try{
    const roof=root.getObjectByName('theatre-titanium-crescent'),p=roof.geometry.attributes.position,n=roof.geometry.attributes.normal;
    for(let i=0;i<n.count;i++){
      assert.ok(Number.isFinite(n.getX(i)+n.getY(i)+n.getZ(i)));
      assert.ok(n.getY(i)>-.0001,'roof normals point out of the building');
    }
    assert.ok(Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i)))>.16,'crescent keeps its raised central profile');
    const floor=root.getObjectByName('theatre-curved-forecourt').geometry.attributes.position;
    for(let i=25;i<floor.count;i++)assert.ok(Math.abs(Math.hypot(floor.getX(i),floor.getY(i)+R+.014,floor.getZ(i))-(R+.006))<1e-6,'skirt follows the globe');
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});

test('The Grand Theatre approach joins its entrance to the public path and participates in obstruction checks',async()=>{
  const {GARDENS,PLANET_RADIUS:R,normalAt}=await import('../web/planet-layout.js'),{createLandscape,entryGeo}=await import('../web/planet-layout-scene.js'),{validateLayout,measurePieces}=await import('../web/planet-blockout.js'),{Vector3}=await import('three');
  const garden=GARDENS.find(g=>g.kind==='theatre'),root=createLandscape();
  try{
    const path=root.getObjectByName('landmark-approach:'+garden.id),p=path.geometry.attributes.position;
    const middle=i=>new Vector3().fromBufferAttribute(p,i).add(new Vector3().fromBufferAttribute(p,i+1)).multiplyScalar(.5);
    assert.ok(middle(0).distanceTo(new Vector3(...normalAt(...entryGeo(garden))).multiplyScalar(R+.009))<.001);
    assert.ok(middle(p.count-2).distanceTo(new Vector3(...normalAt(...garden.road)).multiplyScalar(R+.009))<.001);
    const pieces=measurePieces(),intruder=pieces.find(p=>p.id==='cafe');
    intruder.geo=[(garden.geo[0]+garden.road[0])/2,(garden.geo[1]+garden.road[1])/2];
    assert.ok(validateLayout(pieces).roadCollisions.some(x=>x.road==='entry:garden:'+garden.id&&x.components.includes('cafe')),'landmark approach cannot pass through a selectable building');
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});

test('The mountain approach reaches its curved trail entrance without passing under the hillside',async()=>{
  const {createPlacedPiece}=await import('../web/planet-layout-scene.js'),{PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const root=createPlacedPiece('mountains');root.updateMatrixWorld(true);
  const trail=root.getObjectByName('mountain-trail'),approach=root.children.find(o=>o.name==='paved-path');
  const midpoint=(mesh,i)=>new Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i).add(new Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i+1)).multiplyScalar(.5).applyMatrix4(mesh.matrixWorld);
  assert.ok(midpoint(trail,0).distanceTo(midpoint(approach,0))<.007,'approach and trail must meet');
  for(let i=0;i<approach.geometry.attributes.position.count;i+=2){
    const p=midpoint(approach,i),n=p.clone().normalize(),ray=new Raycaster(n.clone().multiplyScalar(PLANET_RADIUS+1),n.clone().negate()),hit=ray.intersectObject(root.children[0],true)[0];
    if(hit)assert.ok(hit.point.length()-p.length()<.007,'approach is buried under the hillside');
  }
  root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Consolidation keeps transparent shop windows and custom water shading separate',async()=>{
  const {Group,Mesh,PlaneGeometry,MeshStandardMaterial}=await import('three'),{consolidate}=await import('../web/planet-scene.js'),{waterMaterial}=await import('../web/planet-materials.js');
  const group=new Group(),water=waterMaterial(),plain=new MeshStandardMaterial({color:water.color,roughness:water.roughness,metalness:water.metalness,envMapIntensity:water.envMapIntensity,vertexColors:water.vertexColors,side:water.side}),glass=plain.clone();
  glass.transparent=true;glass.opacity=.15;glass.depthWrite=false;
  for(const material of [water,plain,glass])group.add(new Mesh(new PlaneGeometry(1,1),material));
  const result=consolidate(group);assert.equal(result.children.length,3);
  assert.ok(result.children.some(o=>o.material===water));assert.ok(result.children.some(o=>o.material.transparent&&o.material.opacity===.15&&!o.material.depthWrite));
  result.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Promenade slabs leave the reserved lake-view lawn exposed',async()=>{
  const {createLandscape}=await import('../web/planet-layout-scene.js'),{normalAt,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Raycaster,Vector3}=await import('three');
  const root=createLandscape();root.updateMatrixWorld(true);const surfaces=root.children.filter(o=>o.isMesh);
  for(const geo of [[41,14],[42,15],[42,14]]){const n=new Vector3(...normalAt(...geo)),ray=new Raycaster(n.clone().multiplyScalar(PLANET_RADIUS+.1),n.clone().negate());const hit=ray.intersectObjects(surfaces,false)[0];assert.equal(hit.object.name,'district-ground:hubin-view');}
  root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('The candidate fits every existing asset without terrain, footprint, road or access conflicts',async()=>{
  const {COMPONENTS}=await import('../web/planet-options.js'),{measurePieces,validateLayout}=await import('../web/planet-blockout.js');
  const pieces=measurePieces(),report=validateLayout(pieces);
  assert.deepEqual(pieces.map(p=>p.id).sort(),COMPONENTS.map(c=>c.id).sort());
  for(const field of ['collisions','terrain','roadCollisions','roadWater','disconnected','reservedSpaceConflicts','propCollisions','propTerrain','propRoadConflicts'])assert.deepEqual(report[field],[],field);
  for(const p of pieces){assert.ok(report.occupancy[p.id].length>0,p.id);assert.ok([...p.bounds.min,...p.bounds.max].every(Number.isFinite));}
});

test('Grid parcels crossing a cube-face seam reserve cells on both sides',async()=>{
  const {createGrid,footprintFrame,footprintCells}=await import('../web/planet-layout.js');
  const grid=createGrid(),frame=footprintFrame({geo:[45,0],scale:1},{min:[-.18,0,-.18],max:[.18,.2,.18]}),ids=footprintCells(frame,grid);
  assert.equal(grid.length,864);assert.equal(new Set(grid.map(c=>c.id)).size,864);
  assert.deepEqual([...new Set(ids.map(id=>id.split(':')[0]))].sort(),['0','4']);
  assert.ok(grid.every(c=>Math.abs(Math.hypot(...c.center)-1)<1e-12));
  const far=grid.filter(c=>c.center[0]<-.8).map(c=>c.id);assert.ok(ids.every(id=>!far.includes(id)));
});

test('The overlap checker rejects colliding parcels across a cube-face seam',async()=>{
  const {measurePieces,validateLayout}=await import('../web/planet-blockout.js');
  const pieces=measurePieces(),a=pieces.find(p=>p.id==='cafe'),b=pieces.find(p=>p.id==='courtyard');
  a.geo=[44,0];b.geo=[46,0];
  assert.ok(validateLayout(pieces).collisions.some(pair=>pair.includes('cafe')&&pair.includes('courtyard')));
});

test('Invalid land and water placements are rejected instead of only checking asset counts',async()=>{
  const {measurePieces,validateLayout}=await import('../web/planet-blockout.js');
  const pieces=measurePieces();pieces.find(p=>p.id==='cafe').geo=[15,15];pieces.find(p=>p.id==='boat').geo=[90,0];
  const report=validateLayout(pieces);assert.ok(report.terrain.some(p=>p.id==='cafe'));assert.ok(report.terrain.some(p=>p.id==='boat'));
});

test('Rear environment reserves real parcels and water across the longitude seam',async()=>{
  const {normalAt,terrainAt,GARDENS}=await import('../web/planet-layout.js'),{measurePieces,validateLayout}=await import('../web/planet-blockout.js'),{measureContext,createGarden}=await import('../web/planet-layout-scene.js');
  assert.equal(terrainAt(normalAt(185,-47)),'water');assert.equal(terrainAt(normalAt(-175,-47)),'water');assert.equal(terrainAt(normalAt(185,-25)),'land');
  const pieces=measurePieces(),context=measureContext()[0];pieces.find(p=>p.id==='skyline').geo=context.geo;
  assert.ok(validateLayout(pieces).collisions.some(pair=>pair.includes('skyline')&&pair.includes(context.id)));
  pieces.find(p=>p.id==='skyline').geo=[185,-47];assert.ok(validateLayout(pieces).terrain.some(p=>p.id==='skyline'));
  for(const garden of GARDENS.filter(g=>g.kind==='hill')){const model=createGarden(garden),normal=model.getObjectByName('garden-hill-terrain').geometry.attributes.normal;for(let i=0;i<normal.count;i++)assert.ok(normal.getY(i)>0,'hill faces outward');model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});

test('Access checks reject a road through another building and an isolated path end',async()=>{
  const {measurePieces,validateLayout}=await import('../web/planet-blockout.js');
  // [90,-60] now lies beside the connected south-bank promenade. Use an
  // inland point beyond both promenades to exercise disconnected access.
  const pieces=measurePieces(),cafe=pieces.find(p=>p.id==='cafe');cafe.via=[pieces.find(p=>p.id==='courtyard').geo];cafe.road=[90,-82];
  const report=validateLayout(pieces);assert.ok(report.roadCollisions.some(r=>r.road==='entry:cafe'&&r.components.includes('courtyard')));assert.ok(report.disconnected.includes('entry:cafe'));
});

test('Candidate geometry is finite and paved paths stay on the sphere',async()=>{
  const {createBlockout}=await import('../web/planet-blockout.js'),{PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  const model=createBlockout({details:true});model.updateMatrixWorld(true);let paths=0;
  model.traverse(o=>{const attr=o.geometry?.attributes.position;if(!attr)return;assert.ok(Array.from(attr.array).every(Number.isFinite),o.name);if(o.name==='paved-path'){paths++;for(let i=0;i<attr.count;i++){const point=new Vector3().fromBufferAttribute(attr,i).applyMatrix4(o.matrixWorld);assert.ok(Math.abs(point.length()-(PLANET_RADIUS+.009))<1e-5);}}o.geometry.dispose();o.material?.dispose();});
  assert.ok(paths>10);
});

test('Removing a component removes its access path without replacing it with vegetation',async()=>{
  const {createPlanet}=await import('../web/planet-scene.js');
  const empty=createPlanet([]),cafe=createPlanet(['cafe']),again=createPlanet([]);
  const signature=root=>{const data=[];root.traverse(o=>{if(o.geometry)data.push([o.name,o.userData.componentId||'',o.geometry.attributes.position.count]);});return data;};
  assert.deepEqual(signature(empty),signature(again));
  assert.ok(signature(cafe).some(row=>row[1]==='cafe'));assert.ok(signature(empty).every(row=>!row[1]));
  for(const model of [empty,cafe,again])model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Ground paths do not leave a walkable line across the lake when the bridge is absent',async()=>{
  const {createLandscape}=await import('../web/planet-layout-scene.js'),{terrainAt}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  const root=createLandscape();let checked=0;
  root.traverse(o=>{if(o.name!=='paved-path')return;const pos=o.geometry.attributes.position,index=o.geometry.index;
    for(let i=0;i<index.count;i+=3){const center=new Vector3();for(let j=0;j<3;j++)center.add(new Vector3().fromBufferAttribute(pos,index.getX(i+j)));center.normalize();assert.equal(terrainAt(center.toArray()),'land');checked++;}
  });assert.ok(checked>100);root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Reserved city lawn rejects a new building or an entrance path crossing it',async()=>{
  const {measurePieces,validateLayout}=await import('../web/planet-blockout.js');
  const pieces=measurePieces();pieces.find(p=>p.id==='cafe').geo=[178,46];
  pieces.find(p=>p.id==='twinTowers').via=[[178,46]];
  const conflicts=validateLayout(pieces).reservedSpaceConflicts;
  assert.ok(conflicts.some(c=>c.space==='city-common'&&c.component==='cafe'));
  assert.ok(conflicts.some(c=>c.space==='city-common'&&c.road==='entry:twinTowers'));
});

test('Shared squares and lawns remain above the sphere and outside the lake',async()=>{
  const {createLandscape}=await import('../web/planet-layout-scene.js'),{DISTRICT_GROUNDS,PLANET_RADIUS,terrainAt,inGround,normalAt}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  const scene=createLandscape({gardens:false}),grounds=scene.children.filter(o=>o.userData.groundId);
  assert.deepEqual(grounds.map(o=>o.userData.groundId),DISTRICT_GROUNDS.map(s=>s.id));
  for(const ground of grounds){const pos=ground.geometry.attributes.position,index=ground.geometry.index;
    for(let i=0;i<index.count;i+=3){const center=new Vector3();for(let j=0;j<3;j++)center.add(new Vector3().fromBufferAttribute(pos,index.getX(i+j)));center.divideScalar(3);assert.ok(center.length()>PLANET_RADIUS+.0001,ground.name+' falls inside the globe');assert.equal(terrainAt(center.normalize().toArray()),'land',ground.name);}
  }
  const lawn=DISTRICT_GROUNDS.find(s=>s.id==='city-common');
  assert.equal(inGround(normalAt(178,46),lawn),true);assert.equal(inGround(normalAt(-182,46),lawn),true);
  assert.equal(inGround(normalAt(0,0),lawn),false);
  scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Merging scenery preserves non-casting ground surfaces',async()=>{
  const {Group,Mesh,BoxGeometry,MeshStandardMaterial}=await import('three'),{consolidate}=await import('../web/planet-scene.js');
  const root=new Group();
  for(const cast of [true,false]){const o=new Mesh(new BoxGeometry(1,.01,1),new MeshStandardMaterial({color:'#ccc7b2'}));o.castShadow=cast;o.receiveShadow=true;root.add(o);}
  consolidate(root);assert.equal(root.children.length,2);assert.deepEqual(root.children.map(o=>o.castShadow).sort(),[false,true]);assert.ok(root.children.every(o=>o.receiveShadow));
  root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});


test('Street furniture rejects water, building intrusion and blocked paths while pedestrians can use paths',async()=>{
  const {measurePieces,measureStreetProps,validateLayout}=await import('../web/planet-blockout.js');
  const pieces=measurePieces(),props=measureStreetProps();
  props.find(p=>p.id==='street:bench-0').geo=[15,15];
  props.find(p=>p.id==='street:lamp-0').geo=pieces.find(p=>p.id==='cafe').geo;
  props.find(p=>p.id==='street:railing-0').geo=[-26,20];
  const report=validateLayout(pieces,{streetProps:props});
  assert.ok(report.propTerrain.includes('street:bench-0'));
  assert.ok(report.propCollisions.some(pair=>pair.includes('street:lamp-0')&&pair.includes('cafe')));
  assert.ok(report.propRoadConflicts.some(pair=>pair.prop==='street:railing-0'&&pair.road==='sudi-walk'));
  assert.ok(report.propRoadConflicts.every(pair=>!pair.prop.includes('visitor')));
  assert.equal(report.streetProps,17);assert.ok(report.occupancy['street:visitor-6'].length>0);
});

test('The street bench is lower than the miniature adults and compressed foliage retains its colours',async()=>{
  const {createStreetProp}=await import('../web/planet-street.js'),{consolidate}=await import('../web/planet-scene.js');
  const {Box3,BoxGeometry,Float32BufferAttribute,Group,Mesh,MeshStandardMaterial}=await import('three');
  const bench=createStreetProp({id:'test',type:'bench'}),person=createStreetProp({id:'test',type:'visitor',color:'#789f82'});
  assert.ok(new Box3().setFromObject(bench).max.y<new Box3().setFromObject(person).max.y*.8);
  const geometry=new BoxGeometry(1,1,1),pos=geometry.attributes.position,colors=[];
  for(let i=0;i<pos.count;i++)colors.push(.23+.12*pos.getX(i),.40+.10*pos.getY(i),.70+.05*pos.getZ(i));
  geometry.setAttribute('color',new Float32BufferAttribute(colors,3));const group=new Group();group.add(new Mesh(geometry,new MeshStandardMaterial({vertexColors:true})));consolidate(group);
  const output=group.children[0].geometry,p=output.attributes.position,c=output.attributes.color;assert.ok(c.normalized);assert.ok(c.array instanceof Uint8Array);
  for(let i=0;i<p.count;i++){assert.ok(Math.abs(c.getX(i)-(.23+.12*p.getX(i)))<=1/255);assert.ok(Math.abs(c.getY(i)-(.40+.10*p.getY(i)))<=1/255);assert.ok(Math.abs(c.getZ(i)-(.70+.05*p.getZ(i)))<=1/255);}
  for(const root of [bench,person,group])root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});


test('Public street objects touch their actual paved or planted surface instead of floating above it',async()=>{
  const {createLandscape}=await import('../web/planet-layout-scene.js'),{PLANET_RADIUS}=await import('../web/planet-layout.js'),{Raycaster,Vector3}=await import('three');
  const scene=createLandscape();scene.updateMatrixWorld(true);const surfaces=scene.children.filter(o=>o.isMesh),props=scene.children.filter(o=>o.userData.streetPropId),ray=new Raycaster();assert.equal(props.length,17);
  for(const prop of props){const up=prop.position.clone().normalize();ray.set(up.clone().multiplyScalar(PLANET_RADIUS+.06),up.clone().negate());const hit=ray.intersectObjects(surfaces,false)[0];assert.ok(hit,prop.name);let foot=Infinity;
    prop.traverse(o=>{const p=o.geometry?.attributes.position;if(p)for(let i=0;i<p.count;i++)foot=Math.min(foot,new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).length());});
    assert.ok(Math.abs(foot-hit.point.length())<.0015,prop.name+' ground gap '+(foot-hit.point.length()));
  }
  scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('The pagoda access path reaches its stone steps instead of ending on exposed grass',async()=>{
  const {createPlacedPiece,entryGeo}=await import('../web/planet-layout-scene.js'),{PLACEMENTS,normalAt,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Raycaster,Vector3}=await import('three');
  const placement=PLACEMENTS.find(p=>p.id==='pagoda'),piece=createPlacedPiece('pagoda');piece.updateMatrixWorld(true);
  const direction=new Vector3(...normalAt(...entryGeo(placement))),ray=new Raycaster(direction.clone().multiplyScalar(PLANET_RADIUS+.2),direction.clone().negate());
  assert.ok(ray.intersectObject(piece.children[0],true).length,'road endpoint has to overlap the visible stone entrance');
  piece.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('The bridge has an open arch above the water and both landings meet dry ground',async()=>{
  const {createPlacedPiece}=await import('../web/planet-layout-scene.js'),{PLANET_RADIUS,terrainAt}=await import('../web/planet-layout.js'),{Raycaster,Vector3}=await import('three');
  const root=createPlacedPiece('bridge');root.updateMatrixWorld(true);const model=root.children[0],body=model.getObjectByName('bridge-arch');
  const origin=new Vector3(0,.078,-.2).applyMatrix4(model.matrixWorld),direction=new Vector3(0,0,1).transformDirection(model.matrixWorld),ray=new Raycaster(origin,direction,0,.3);
  assert.equal(ray.intersectObject(body).length,0,'arch must leave a visible gap above the waterline');
  ray.set(new Vector3(.30,.078,-.2).applyMatrix4(model.matrixWorld),direction);assert.ok(ray.intersectObject(body).length,'solid abutment must flank the opening');
  for(const x of [-.465,.465]){const landing=new Vector3(x,.020,0).applyMatrix4(model.matrixWorld);assert.equal(terrainAt(landing.clone().normalize().toArray()),'land');assert.ok(Math.abs(landing.length()-(PLANET_RADIUS+.009))<.005,'landing joins the curved path');}
  root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Lotus leaves follow the actual curved water and the pier entry reaches its landing',async()=>{
  const {createPlacedPiece,entryGeo}=await import('../web/planet-layout-scene.js'),{PLANET_RADIUS,PLACEMENTS,normalAt}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const root=createPlacedPiece('lotusPier');root.updateMatrixWorld(true);let leaves=0;
  root.traverse(o=>{if(o.name!=='floating-lotus-leaf')return;leaves++;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const position=new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);assert.ok(Math.abs(position.length()-(PLANET_RADIUS+.004))<1e-6,'leaf floats above or sinks below the lake');}});assert.equal(leaves,5);
  const direction=new Vector3(...normalAt(...entryGeo(PLACEMENTS.find(p=>p.id==='lotusPier')))),ray=new Raycaster(direction.clone().multiplyScalar(PLANET_RADIUS+.2),direction.clone().negate());
  const hit=ray.intersectObject(root.children[0],true)[0];assert.ok(hit?.object.name==='pier-landing','the access path overlaps the stone landing');assert.ok(Math.abs(hit.point.length()-(PLANET_RADIUS+.009))<.005);
  root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});
