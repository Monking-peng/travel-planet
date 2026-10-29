const {test}=require('node:test'),assert=require('node:assert/strict');
const dispose=g=>g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});

test('All individual southbank building fronts point toward the City Balcony across the river',async()=>{
  const {GARDENS,normalAt,placementFrame}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  for(const p of GARDENS.filter(p=>['southbank-skyline','river-tower'].includes(p.kind))){
    const f=placementFrame(p),up=new Vector3(...f.up),target=new Vector3(...normalAt(160,-46));
    target.addScaledVector(up,-target.dot(up)).normalize();
    assert.ok(target.dot(new Vector3(...f.south))>.999,'front must face the observation deck, not the back of the district');
  }
});

test('Night switch restores original materials, follows selection changes and avoids added shadow maps',async()=>{
  const T=await import('three'),{createNightController,readNightPreference,saveNightPreference}=await import('../web/planet-night.js');
  const root=new T.Group(),river=new T.Group(),light=new T.SpotLight('#fff',.009);river.add(light);root.add(river);
  const material=new T.MeshStandardMaterial({emissive:'#775533',emissiveIntensity:.3}),mesh=new T.Mesh(new T.BoxGeometry(.1,.1,.1),material);mesh.userData.componentId='pagoda';root.add(mesh);
  let state;const controller=createNightController(root,{setNight:n=>state=n},river),district=root.getObjectByName('night-district');
  try{
    controller.set(true);assert.equal(state,true);assert.equal(district.visible,true);assert.equal(light.intensity,.045);assert.ok(material.emissiveIntensity>.3);
    const lamps=[];district.traverse(o=>{if(o.isLight)lamps.push(o);});assert.equal(lamps.length,7);assert.ok(lamps.every(l=>!l.castShadow));
    const temple=lamps[0];assert.ok(temple.position.clone().sub(temple.target.position).length()>.2,'landmark light must sit above its target');
    const optional=lamps.find(l=>l.userData.optionalPiece==='pagoda');assert.equal(optional.visible,true);root.remove(mesh);controller.refresh();assert.equal(optional.visible,false);root.add(mesh);controller.refresh();assert.equal(optional.visible,true);
    for(let i=0;i<4;i++){controller.set(false);assert.equal(material.emissiveIntensity,.3);assert.equal(light.intensity,.009);assert.equal(material.emissive.getHex(),new T.Color('#775533').getHex());controller.set(true);}
    controller.set(false);assert.equal(state,false);assert.equal(district.visible,false);
    const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};saveNightPreference(storage,true);assert.equal(readNightPreference(storage),true);saveNightPreference(storage,false);assert.equal(readNightPreference(storage),false);assert.equal(readNightPreference({getItem(){throw Error();}}),false);
  }finally{controller.dispose();dispose(root);}
});

test('Su Causeway stones remain above the spherical path with varied stone colors and open joints',async()=>{
  const {causewayStonePaving}=await import('../web/planet-surfaces.js'),{sampleRoad}=await import('../web/planet-layout-scene.js'),{PUBLIC_ROADS,PLANET_RADIUS:R}=await import('../web/planet-layout.js');
  const road=PUBLIC_ROADS.find(p=>p.id==='sudi-walk'),mesh=causewayStonePaving(sampleRoad(road.points),road.width);
  try{const g=mesh.geometry,p=g.attributes.position,c=g.attributes.color,tones=new Set();assert.ok(p.count>300);
    for(let i=0;i<p.count;i++){assert.ok(Math.abs(Math.hypot(p.getX(i),p.getY(i),p.getZ(i))-(R+.0103))<1e-6);tones.add(c.getX(i).toFixed(5));}
    assert.ok(tones.size>8);assert.equal(g.index.count,p.count*2,'each separated slab must keep its own vertices and faces');
    for(let i=6;i<p.count/2-6;i+=6){const gap=Math.hypot(p.getX(i)-p.getX(i-2),p.getY(i)-p.getY(i-2),p.getZ(i)-p.getZ(i-2));assert.ok(gap>.0001,'adjacent slabs must not share a solid seam');}
  }finally{dispose(mesh);}
});

test('Temple smoke has soft transparent edges and rises above the incense vessel',async()=>{
  const {createIncenseSmoke}=await import('../web/planet-incense.js');const g=createIncenseSmoke();
  try{const mesh=g.children[0],p=mesh.geometry.attributes.position,c=mesh.geometry.attributes.color;assert.equal(c.itemSize,4);assert.equal(mesh.material.depthWrite,false);assert.equal(mesh.material.transparent,true);let alpha=0,maxY=0;
    for(let i=0;i<c.count;i++){alpha=Math.max(alpha,c.getW(i));maxY=Math.max(maxY,p.getY(i));if(i%7===0||i%7===6)assert.equal(c.getW(i),0);assert.ok(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)));}
    assert.ok(alpha>.1&&alpha<=.3);assert.ok(maxY>.17);
  }finally{dispose(g);}
});


test('Architectural night palettes survive batching and restore exact day colours',async()=>{
  const T=await import('three'),{consolidate}=await import('../web/planet-scene.js'),{createNightController}=await import('../web/planet-night.js');
  const {createOlympicLotus,createRiverTower}=await import('../web/planet-southbank.js');
  const root=new T.Group();root.add(createOlympicLotus(),createRiverTower());consolidate(root);
  const profiles=root.children.filter(o=>o.material.userData.nightProfile);assert.ok(profiles.length>=8,'night profiles merged into unrelated materials');
  const day=profiles.map(o=>({m:o.material,color:o.material.color.clone(),emissive:o.material.emissive.clone(),power:o.material.emissiveIntensity}));
  const control=createNightController(root,{setNight(){}},new T.Group());
  try{for(let cycle=0;cycle<3;cycle++){
    control.set(true);for(const {m} of day){assert.equal(m.emissive.getHex(),new T.Color(m.userData.nightProfile.emissive).getHex());assert.equal(m.emissiveIntensity,m.userData.nightProfile.intensity);}
    control.set(false);for(const {m,color,emissive,power} of day){assert.ok(m.color.equals(color));assert.ok(m.emissive.equals(emissive));assert.equal(m.emissiveIntensity,power);}
  }}finally{control.dispose();dispose(root);}
});

test('River colour glints remain on water with transparent edges and no added real-time lights',async()=>{
  const {createRiverLightReflections}=await import('../web/planet-night.js'),{terrainAt,PLANET_RADIUS:R}=await import('../web/planet-layout.js');
  const mesh=createRiverLightReflections();try{const p=mesh.geometry.attributes.position,c=mesh.geometry.attributes.color;assert.ok(p.count>1000);assert.equal(mesh.material.depthWrite,false);
    for(let i=0;i<p.count;i++){const n=[p.getX(i),p.getY(i),p.getZ(i)],length=Math.hypot(...n);assert.ok(Math.abs(length-(R+.0065))<1e-6);assert.equal(terrainAt(n.map(v=>v/length)),'water');if(i%14<2||i%14>11)assert.ok(c.getW(i)<1e-6);}
  }finally{dispose(mesh);}
});
test('Hubin shop lighting survives batching, restores the day scene and leaves with the shops',async()=>{
  const T=await import('three'),{createPiece}=await import('../web/planet-pieces.js'),{consolidate}=await import('../web/planet-scene.js'),{createNightController}=await import('../web/planet-night.js');
  const shop=createPiece('cafe');const required=['in77-letter','retail-lit-display','retail-lit-entrance','retail-upper-strip','apple-lit-ceiling','hubin-lit-lamp'];
  for(const name of required)assert.ok(shop.getObjectByName(name)?.material.userData.nightProfile,name+' must have a night treatment');
  const root=new T.Group();root.add(shop);consolidate(root);const pieces=root.children.slice(),profiles=pieces.filter(o=>o.material?.userData.nightProfile);assert.ok(profiles.length>=8);
  const before=profiles.map(o=>({m:o.material,c:o.material.color.clone(),e:o.material.emissive.clone(),i:o.material.emissiveIntensity})),control=createNightController(root,{setNight(){}},new T.Group());
  try{
    control.set(true);for(const {m} of before)assert.equal(m.emissiveIntensity,m.userData.nightProfile.intensity);
    const lamps=[];root.traverse(o=>{if(o.isLight&&o.userData.optionalPiece==='cafe')lamps.push(o);});assert.equal(lamps.length,2);assert.ok(lamps.every(l=>l.visible&&!l.castShadow));
    pieces.forEach(o=>root.remove(o));control.refresh();assert.ok(lamps.every(l=>!l.visible));pieces.forEach(o=>root.add(o));control.refresh();assert.ok(lamps.every(l=>l.visible));
    control.set(false);for(const {m,c,e,i} of before){assert.ok(m.color.equals(c));assert.ok(m.emissive.equals(e));assert.equal(m.emissiveIntensity,i);}
  }finally{control.dispose();dispose(root);}
});

test('The widened Su Causeway has a full stone surface across its walking width',async()=>{
  const T=await import('three'),{causewayStonePaving}=await import('../web/planet-surfaces.js'),{sampleRoad}=await import('../web/planet-layout-scene.js'),{PUBLIC_ROADS,frameAt,PLANET_RADIUS:R,terrainAt}=await import('../web/planet-layout.js');
  const road=PUBLIC_ROADS.find(p=>p.id==='sudi-walk'),mesh=causewayStonePaving(sampleRoad(road.points),road.width),frame=frameAt(-26,12),east=new T.Vector3(...frame.east),up=new T.Vector3(...frame.up),p=mesh.geometry.attributes.position;let lo=Infinity,hi=-Infinity;
  try{for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i),n=v.clone().normalize();assert.equal(terrainAt(n.toArray()),'land');if(n.dot(up)>.999){const x=v.dot(east)*R/v.dot(up);lo=Math.min(lo,x);hi=Math.max(hi,x);}}
    assert.ok(hi-lo>.055,'stone paving must cover the widened avenue, not remain a thin centre strip');assert.ok(hi-lo<=road.width+.001);
  }finally{dispose(mesh);}
});
test('Waterfront light show animates a shared clock, stops for reduced motion and restores shaders',async()=>{
  const {createWaterfrontLightShow}=await import('../web/planet-light-show.js'),{MeshStandardMaterial,MeshBasicMaterial}=await import('three');
  const show=createWaterfrontLightShow(),facade=new MeshStandardMaterial(),lotus=new MeshStandardMaterial(),sign=new MeshStandardMaterial(),reflection=new MeshBasicMaterial({transparent:true});
  facade.userData.nightProfile={animation:'facade'};lotus.userData.nightProfile={animation:'lotus'};
  reflection.userData.nightProfile={animation:'reflection'};
  const original=facade.onBeforeCompile,key=facade.customProgramCacheKey;
  const reflectionCompile=reflection.onBeforeCompile,reflectionKey=reflection.customProgramCacheKey;
  for(const m of [facade,lotus,sign,facade,reflection])show.register(m);
  assert.equal(show.state.materials,3);assert.equal(sign.onBeforeCompile,original);
  const shaders=[facade,lotus,reflection].map(m=>{const s={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:'#include <emissivemap_fragment>\n#include <color_fragment>'};m.onBeforeCompile(s);return s;});
  assert.equal(shaders[0].uniforms.waterfrontTime,shaders[1].uniforms.waterfrontTime);
  assert.equal(shaders[0].uniforms.waterfrontTime,shaders[2].uniforms.waterfrontTime,'reflections must advance and pause with the facades');
  assert.equal(shaders[0].uniforms.waterfrontActive,shaders[2].uniforms.waterfrontActive);
  assert.ok(shaders[2].fragmentShader.includes('diffuseColor.a *='),'basic water material needs opacity animation');
  assert.ok(!shaders[2].fragmentShader.includes('totalEmissiveRadiance'),'basic shaders have no emissive radiance variable');
  assert.notEqual(shaders[0].fragmentShader,shaders[1].fragmentShader,'lotus has its own purple palette');
  assert.equal(show.update(.04,false,false),false);assert.equal(show.state.seconds,0);
  assert.equal(show.update(.04,true,false),true);assert.equal(show.state.active,true);
  for(let i=0;i<60;i++)show.update(1/30,true,false);
  assert.ok(show.state.seconds>1.9);assert.equal(shaders[0].uniforms.waterfrontTime.value,show.state.seconds);
  assert.equal(show.update(.04,true,true),true);assert.equal(show.state.active,false);assert.equal(show.state.seconds,0);
  assert.equal(show.update(.04,true,true),false);
  show.update(500,true,false);assert.ok(show.state.seconds<=.05,'resume never jumps across an inactive interval');
  show.update(0,false,false);assert.equal(shaders[0].uniforms.waterfrontActive.value,0);
  show.dispose();assert.equal(facade.onBeforeCompile,original);assert.equal(facade.customProgramCacheKey,key);
  assert.equal(reflection.onBeforeCompile,reflectionCompile);assert.equal(reflection.customProgramCacheKey,reflectionKey);assert.equal(show.state.materials,0);
  for(const m of [facade,lotus,sign,reflection])m.dispose();
});
