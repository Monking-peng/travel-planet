const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('All distinct scenery pieces coexist without a six-piece cap or silent replacement',async()=>{
  const web=await import('../web/planet-options.js'),native=require('../miniprogram/utils/scenery');
  for(const options of [web,native]){
    const old=[...options.DEFAULT_COMPONENTS],next=options.toggleComponent(old,'fountain');
    assert.equal(next.selected.length,old.length+1);assert.ok(next.selected.includes('fountain'));assert.deepEqual(old,options.DEFAULT_COMPONENTS);
    assert.deepEqual(options.normalizeSelection(['goldenBall','twinTowers','bad','bridge','bridge']),['goldenBall','twinTowers','bridge']);
    let all=[];for(const c of options.COMPONENTS)all=options.toggleComponent(all,c.id).selected;
    assert.equal(all.length,22);assert.equal(new Set(all).size,22);assert.equal(options.toggleComponent(all,'cafe').selected.length,21);
    assert.deepEqual(options.normalizeSelection([]),[]);assert.equal(options.toggleComponent(all,'invalid').invalid,true);
    assert.deepEqual(options.restoreSelection(options.LEGACY_DEFAULT),options.DEFAULT_COMPONENTS);
    assert.deepEqual(options.restoreSelection(['tea','cafe']),['tea','cafe']);assert.deepEqual(options.restoreSelection([]),[]);
    for(const preset of options.PRESETS)assert.deepEqual(options.normalizeSelection(preset.items),preset.items);
  }
});
test('Scenery uses distinct plots across every quarter of the planet',async()=>{
  const {createPlacedPiece}=await import('../web/planet-scene.js'),{COMPONENTS}=await import('../web/planet-options.js');
  const positions=COMPONENTS.map(c=>({id:c.id,p:createPlacedPiece(c.id).position.clone().normalize()})),quarters=new Set();
  for(const {p} of positions)quarters.add(Math.floor((Math.atan2(p.x,p.z)+Math.PI)/(Math.PI/2))%4);
  assert.equal(quarters.size,4);assert.ok(positions.filter(c=>c.p.z<0).length>=5);
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++)assert.ok(positions[i].p.distanceTo(positions[j].p)>.20,positions[i].id+' / '+positions[j].id);
});
test('Appearance migration upgrades historical defaults once and retains explicit v3 choices',async()=>{
  const {readScenery}=await import('../web/planet-wardrobe.js'),{LEGACY_DEFAULT,PREVIOUS_DEFAULT,DEFAULT_COMPONENTS}=await import('../web/planet-options.js');
  const previous=global.localStorage,values=new Map();global.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  try{
    values.set('travel-planet-scenery-v1',JSON.stringify(LEGACY_DEFAULT));assert.deepEqual(readScenery(),DEFAULT_COMPONENTS);assert.deepEqual(JSON.parse(values.get('travel-planet-scenery-v3')),DEFAULT_COMPONENTS);
    values.delete('travel-planet-scenery-v3');values.set('travel-planet-scenery-v2',JSON.stringify(PREVIOUS_DEFAULT));assert.deepEqual(readScenery(),DEFAULT_COMPONENTS);
    values.delete('travel-planet-scenery-v3');values.set('travel-planet-scenery-v2',JSON.stringify(LEGACY_DEFAULT));assert.deepEqual(readScenery(),LEGACY_DEFAULT);
    values.set('travel-planet-scenery-v3',JSON.stringify(PREVIOUS_DEFAULT));assert.deepEqual(readScenery(),PREVIOUS_DEFAULT);
    values.set('travel-planet-scenery-v3','[]');assert.deepEqual(readScenery(),[]);
    values.delete('travel-planet-scenery-v3');values.delete('travel-planet-scenery-v2');values.set('travel-planet-scenery-v1','["tea","cafe"]');global.localStorage.setItem=()=>{throw new Error('quota')};assert.deepEqual(readScenery(),['tea','cafe']);
  }finally{if(previous===undefined)delete global.localStorage;else global.localStorage=previous;}
});

function component(){let config;let clock=10000;const loads=[],events=[];vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../miniprogram/components/planet/index.js'),'utf8'),{Component:c=>config=c,require:()=>require('../miniprogram/utils/scenery'),wx:{loadSubpackage:o=>loads.push(o)},Promise,Date:{now:()=>clock}});const c={...config.methods,data:structuredClone(config.data),setData:d=>Object.assign(c.data,d),triggerEvent:e=>events.push(e)};return {c,loads,events,advance:ms=>{clock+=ms;},attach:()=>config.lifetimes.attached.call(c),detach:()=>config.lifetimes.detached.call(c)};}
test('Native models wait for all packages and ignore loading callbacks after removal',async()=>{const h=component();h.attach();h.loads[0].success();await new Promise(setImmediate);assert.equal(h.c.data.assetsReady,false);for(const l of h.loads.slice(1))l.success();await new Promise(setImmediate);assert.equal(h.c.data.assetsReady,true);const detached=component();detached.attach();detached.detach();for(const l of detached.loads)l.success();await new Promise(setImmediate);assert.equal(detached.c.data.assetsReady,false);});
test('A failed native scenery download exposes the existing fallback instead of partial models',async()=>{const h=component();h.attach();h.loads[0].success();h.loads[1].fail(new Error('network'));await new Promise(setImmediate);assert.equal(h.c.data.assetsReady,false);assert.deepEqual(h.events,['error']);});

test('Native inspection pauses rotation during touch and resumes after the quiet period',()=>{
  const h=component();h.attach();const c=h.c,rotation={x:0,y:0,z:0};c.scene={getElementById:()=>({getComponent:()=>({rotation})})};c.xr={Transform:class{}};c.data.modelsReady=true;
  c.tick();h.advance(40);c.tick();assert.ok(rotation.y>-.20);
  c.touchStart({touches:[{clientX:100,clientY:100}]});c.touchMove({touches:[{clientX:160,clientY:125}]});c.tick();const manual=rotation.y;
  h.advance(500);c.tick();assert.equal(rotation.y,manual);c.touchEnd({touches:[]});h.advance(3900);c.tick();assert.equal(rotation.y,manual);h.advance(150);c.tick();assert.ok(rotation.y>manual);
  c.data.paused=true;const before=rotation.y;h.advance(100);c.tick();assert.equal(rotation.y,before);
  c.data.paused=false;c.toggleRotation();h.advance(100);c.tick();assert.equal(rotation.y,before);
});
test('Native pinch bounds zoom and the decoration view restores the previous inspection',()=>{
  const h=component();h.attach();const c=h.c;
  c.touchStart({touches:[{clientX:100,clientY:100},{clientX:180,clientY:100}]});c.touchMove({touches:[{clientX:60,clientY:100},{clientX:220,clientY:100}]});assert.equal(c.view.zoom,2);assert.ok(c.data.cameraFov<34);c.touchEnd({touches:[]});
  c.zoomBy(10);assert.equal(c.view.zoom,4.5);c.zoomBy(.01);assert.equal(c.view.zoom,.8);c.setZoom(1.7);c.view.y=.6;
  c.editingChanged(true);assert.equal(c.view.zoom,1);c.editingChanged(false);assert.equal(c.view.zoom,1.7);assert.equal(c.view.y,.6);c.reset();assert.equal(c.view.zoom,1);assert.equal(c.view.y,-.20);
});

test('Native decoration focuses a rear building and permits inspection without resuming automatic spin',()=>{
  const h=component();h.attach();const c=h.c;c.data.editing=true;c.editingChanged(true);
  c.focusComponent('goldenBall');const target=require('../miniprogram/utils/scenery').focusAngles('goldenBall');assert.equal(c.view.y,target.y);assert.equal(c.view.zoom,3.6);assert.equal(c.data.worldY,target.offsetY);
  const before=c.view.y;c.touchStart({touches:[{clientX:100,clientY:100}]});c.touchMove({touches:[{clientX:140,clientY:110}]});assert.ok(c.view.y>before);c.touchEnd({touches:[]});
  const rotation={x:0,y:0,z:0};c.scene={getElementById:()=>({getComponent:()=>({rotation})})};c.xr={Transform:class{}};c.data.modelsReady=true;c.tick();const still=rotation.y;h.advance(5000);c.tick();assert.equal(rotation.y,still);
  c.editingChanged(false);assert.equal(c.view.y,-.20);assert.equal(c.view.zoom,1);assert.equal(c.data.worldY,0);
});


test('Web close inspection exposes each facade with its top visible',async()=>{
  const {COMPONENTS,focusAngles}=await import('../web/planet-options.js'),{placementFrame}=await import('../web/planet-layout.js'),{Vector3,Euler}=await import('three'),native=require('../miniprogram/utils/scenery');
  for(const piece of COMPONENTS){const target=focusAngles(piece.id),basis=placementFrame(piece),rotation=new Euler(target.x,target.y,target.z),up=new Vector3(...basis.up).applyEuler(rotation),front=new Vector3(...basis.south).applyEuler(rotation);
    assert.ok(up.y>.75&&up.z>(piece.id==='cafe'?.15:.4)&&Math.abs(up.x)<1e-8,piece.id+' stands upright with its top visible');assert.ok(front.z>(piece.id==='boat'?.7:.9),piece.id+' facade faces the camera');if(piece.id==='cafe')assert.ok(up.z<.20&&front.z>.98,'Hubin storefronts face forward while rooftop seating stays visible');assert.equal(target.zoom,3.6);
  }
});


test('The mountain upper surface faces outward and every selectable landmark resolves to a real place',async()=>{
  const {createPiece}=await import('../web/planet-pieces.js'),{COMPONENTS}=await import('../web/planet-options.js'),{byId}=require('../shared/catalog.cjs');
  const hill=createPiece('mountains').children.find(o=>o.material?.vertexColors),normals=hill.geometry.attributes.normal;
  for(let i=0;i<normals.count;i++)assert.ok(normals.getY(i)>0,'terrain triangles face upward');
  for(const c of COMPONENTS){const piece=createPiece(c.id);piece.traverse(o=>{if(o.userData.placeId)assert.ok(byId[o.userData.placeId],o.userData.placeId);o.geometry?.dispose();o.material?.dispose();});}
  hill.geometry.dispose();hill.material.dispose();
});

test('The boat floor stays inside its hollow hull and the hull crosses the waterline',async()=>{
  const {createPiece}=await import('../web/planet-pieces.js'),{createPlacedPiece}=await import('../web/planet-layout-scene.js'),{PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  const model=createPiece('boat'),inner=model.getObjectByName('boat-inner-hull').geometry.attributes.position,outline=[];
  const floorY=Math.min(...Array.from({length:inner.count},(_,i)=>inner.getY(i)));
  for(let i=0;i<inner.count/2;i++)outline.push([inner.getX(i),inner.getZ(i)]);
  const inside=(x,z)=>{let found=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])found=!found;}return found;};
  let checked=0;model.updateMatrixWorld(true);
  model.traverse(o=>{if(o.name!=='boat-floorboard')return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);assert.ok(inside(v.x,v.z),'floorboard protrudes through the hull');assert.ok(v.y<floorY+.02);checked++;}});assert.ok(checked>100);
  const placed=createPlacedPiece('boat');placed.updateMatrixWorld(true);let wet=0,dry=0;
  placed.traverse(o=>{if(o.name!=='boat-hull-strake')return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const radius=new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).length();if(radius<PLANET_RADIUS+.003)wet++;else dry++;}});assert.ok(wet>0&&dry>0,'hull must sit in the water');
  for(const root of [model,placed])root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('Every actual web model silhouette fits portrait and desktop inspection',async()=>{
  const {COMPONENTS,inspectionView}=await import('../web/planet-options.js'),{createPlacedPiece}=await import('../web/planet-scene.js'),{createPlanetCamera}=await import('../web/planet.js'),{Group,Vector3}=await import('three'),native=require('../miniprogram/utils/scenery');
  for(const c of COMPONENTS){const root=new Group(),piece=createPlacedPiece(c.id);root.add(piece);
    for(const [width,height] of [[1120,740],[390,624],[800,440],[320,400]]){const view=inspectionView(c.id,width,height);const camera=createPlanetCamera(width,height);camera.zoom=view.zoom;camera.updateProjectionMatrix();root.rotation.set(view.x,view.y,view.z);root.position.y=view.offsetY;root.updateMatrixWorld(true);const vertex=new Vector3();
      piece.children[0].traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){vertex.fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld).project(camera);assert.ok(Math.abs(vertex.x)<.94&&Math.abs(vertex.y)<.94,c.id+' at '+width+'x'+height+' is clipped');}});
    }piece.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  }
});
