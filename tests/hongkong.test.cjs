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


test('HSBC escalator treads rise through an open undercroft and night trusses preserve the daytime finish',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{hsbc}=await import('../web/hongkong-hsbc.js'),k=makeKit({time:{value:0},night:{value:0}}),g=hsbc(k);g.updateMatrixWorld(true);
 try{let treads;g.traverse(o=>{if(o.material?.userData.hsbcEscalatorTreads)treads=o;});assert.ok(treads);
  for(const x of [-.087*.78,.087*.78]){let previous=0;for(const j of [2,7,12,17]){const z=.28-j/19*.285,hit=new T.Raycaster(new T.Vector3(x,.3,z),new T.Vector3(0,-1,0)).intersectObject(treads)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-(.047+j/19*.12))<.001);assert.ok(hit.point.y>previous);previous=hit.point.y;}}
  for(const y of [.06,.09,.12])assert.equal(new T.Raycaster(new T.Vector3(0,y,.45),new T.Vector3(0,0,-1),0,1).intersectObject(g,true).length,0,'Central ground passage must remain unobstructed');
  const truss=k.materials.find(m=>m.userData.hsbcTruss);assert.ok(truss&&truss.userData.night.color.r>truss.userData.night.color.g*3);assert.ok(truss.color.r<.7,'Daytime truss must remain silver, not red');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('HKCEC staggered wings keep a recessed glazed envelope and a grounded continuous waterfront approach',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{cec,cecRoof}=await import('../web/hongkong-cec.js'),k=makeKit({time:{value:0},night:{value:0}}),g=cec(k);g.updateMatrixWorld(true);const roof=[],glass=[],walk=[];g.traverse(o=>{if(!o.isMesh)return;if(o.material.userData.cecRoof)roof.push(o);if(o.material.userData.cecGlass)glass.push(o);if(o.material.userData.cecWalk)walk.push(o);});
 const cast=(x,y,z,d,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(...d),0,3).intersectObjects(objects);
 try{
  assert.ok(cecRoof(.5,.5,0)[1]-cecRoof(.5,.5,1)[1]>.07);assert.ok(cecRoof(.5,1,1)[2]-cecRoof(.5,1,0)[2]>.5,'Lower wing projects beyond the concave main roof');
  for(const i of [0,1])for(const u of [.15,.3,.5,.7,.85]){const q=cecRoof(.07+.86*u,.9,i);const h=cast(q[0],q[1]-.05,q[2]+.2,[0,0,-1],glass)[0];assert.ok(h&&Math.abs(h.point.z-q[2])<.005,'Facade is present underneath each wing');const e=cecRoof(.07+.86*u,1,i);assert.ok(e[2]-q[2]>.025,'Cantilever edge projects beyond glass');}
  for(const x of [.03,.13,.23]){let last;for(let j=0;j<=100;j++){const z=.639-j*.14/100,h=cast(x,.06,z,[0,-1,0],walk)[0];assert.ok(h&&Math.hypot(x,2.15+h.point.y,z)>2.15&&h.point.y<.031,'Entry stairs stays above the curved planet and below the doorway');if(last!==undefined)assert.ok(Math.abs(last-h.point.y)<.017);last=h.point.y;}}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Tsim Sha Tsui clock tower keeps a rounded concrete dome, recessed windows and a reachable doorway',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{clock}=await import('../web/hongkong-clock.js'),k=makeKit({time:{value:0},night:{value:0}}),g=clock(k);g.updateMatrixWorld(true);const domes=[];g.traverse(m=>{if(m.isMesh&&m.material.userData.clockDome)domes.push(m);});
 const ray=(p,d,objects=[g])=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,2).intersectObjects(objects,true);
 try{
  for(const x of [0,.03,.06,.08]){const hit=ray([x,1.4,-.12],[0,-1,0],domes)[0];assert.ok(hit);const expected=1.187+.067*Math.sqrt(1-(x/.090)**2);assert.ok(Math.abs(hit.point.y-expected)<.001,'Roof must retain a rounded cross-section rather than a conical spire');}
  for(const side of [1,2,3])for(const y of [.25,.43,.61]){const a=side*Math.PI/2,d=[-Math.sin(a),0,-Math.cos(a)],p=[Math.sin(a)*.3,y,-.12+Math.cos(a)*.3];const h=ray(p,d)[0];assert.ok(h?.object.material.userData.clockGlazing,'Side opening must expose glass, not a wall covering it');assert.ok(.3-h.distance<.123,'Glazing is set behind the stone surround');}
  for(const side of [0,1,2,3]){const a=side*Math.PI/2,h=ray([Math.sin(a)*.3,.851,-.12+Math.cos(a)*.3],[-Math.sin(a),0,-Math.cos(a)])[0];assert.ok(h?.object.material.userData.clockGlazing,'Three-light attic windows must not be buried under the stone shell');}
  let prev;for(let i=0;i<81;i++){const z=.113-i*.086/80,h=ray([0,.14,z],[0,-1,0])[0];assert.ok(h);if(prev!==undefined)assert.ok(Math.abs(h.point.y-prev)<.023,'Entrance stair treads rise continuously without a tall plinth jump');prev=h.point.y;}
  const mat=k.materials.find(m=>m.userData.clockDome);assert.ok(mat.color.r>mat.color.b&&mat.color.g>mat.color.b,'Concrete roof has a warm neutral finish, not a green copper spire');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('M+ keeps gaps between embedded LED rails, an open entrance and continuous arrival stairs',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{mplus}=await import('../web/hongkong-mplus.js'),clock={time:{value:0},night:{value:0}},k=makeKit(clock);k.clock=clock;const g=mplus(k);g.updateMatrixWorld(true);const lights=[];g.traverse(m=>{if(m.isMesh&&m.material.userData.mplusScreen)lights.push(m);});
 const cast=(p,d,objects=[g])=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,2).intersectObjects(objects,true);
 try{
  let bars=0,gaps=0;for(let i=0;i<250;i++){const y=.328+i*.0019;if(cast([.011,y,.10],[0,0,-1],lights).length)bars++;else gaps++;}assert.ok(bars>40&&gaps>140,'LED material forms separated rails rather than an opaque screen covering the whole facade');
  for(const y of [.38,.5,.65]){const h=cast([.011,y,.1],[0,0,-1])[0];assert.ok(h&&h.point.z<.02,'Facade stays shallow instead of a detached luminous slab');}
  assert.equal(cast([0,.125,.35],[0,0,-1]).some(h=>h.distance<.16),false,'Cantilevered podium must not close the public entrance');
  for(const dx of [-.055,0,.055]){let last;for(let j=0;j<=180;j++){const z=.496-j*.300/180,t=Math.max(0,(z-.472)/.024),x=.342+dx-.055*t,h=cast([x,.15,z],[0,-1,0])[0];assert.ok(h&&Math.hypot(x,2.15+h.point.y,z)>2.15&&h.point.y<.11);if(last!==undefined)assert.ok(Math.abs(h.point.y-last)<.014,'Approach, stairs and upper entrance landing must meet');last=h.point.y;}}
  const screen=k.materials.find(m=>m.userData.mplusScreen),shader={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:'#include <emissivemap_fragment>'};screen.onBeforeCompile(shader);assert.equal(shader.uniforms.hkTime,clock.time);assert.match(shader.fragmentShader,/hkTime\*\.38/);
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Peak Tower has an enclosed atrium, curved bowl with recessed side slots, and a continuous hill approach',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{peak,peakSoffit}=await import('../web/hongkong-peak.js'),k=makeKit({time:{value:0},night:{value:0}}),g=peak(k);g.updateMatrixWorld(true);
 const walk=[];g.traverse(m=>{if(m.isMesh&&m.material.userData.peakWalk)walk.push(m);});
 const cast=(p,d,objects=[g])=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,2).intersectObjects(objects,true);
 try{
  for(const y of [.36,.535,.615]){const h=cast([.039,y,.4],[0,0,-1])[0];assert.ok(h?.object.material.userData.peakGlazing,'Atrium must be glazed between its piers');assert.ok(h.point.z<.209);}
  for(const x of [.348,.373,.398]){const h=cast([x,.6,0],[0,1,0])[0];assert.ok(h&&h.point.y>peakSoffit(x)+.018,'Underside viewing recess has real depth between its beams');}
  assert.ok(peakSoffit(.48)-peakSoffit(0)>.22,'The soffit retains its deeply curved bowl outline');
  for(const x of [-.09,0,.09]){let last;for(let i=0;i<=220;i++){const z=.699-i*.365/220,h=cast([x,.28,z],[0,-1,0],walk)[0];assert.ok(h,`Missing stair surface at ${x}/${z}`);assert.ok(Math.hypot(x,2.15+h.point.y,z)>2.15-.002);if(last!==undefined)assert.ok(Math.abs(last-h.point.y)<.018,`Stair jump at ${z}: ${last}/${h.point.y}`);last=h.point.y;}}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Chi Lin first courtyard has a passable mountain gate, four recessed ponds and continuous stone approaches',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{chilin}=await import('../web/hongkong-chilin.js'),k=makeKit({time:{value:0},night:{value:0}}),g=chilin(k);g.updateMatrixWorld(true);const water=[],walk=[];g.traverse(m=>{if(m.isMesh&&m.material.userData.chilinPond)water.push(m);if(m.isMesh&&m.material.userData.chilinWalk)walk.push(m);});
 const cast=(p,d,objects=[g])=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,2).intersectObjects(objects,true);
 try{
  for(const x of [-.028,0,.028])for(const y of [.135,.177])assert.equal(cast([x,y,.55],[0,0,-1]).some(h=>h.distance<.22),false,'Gate must be open through both faces');
  for(const x of [-.17,.17])for(const z of [-.048,.18]){const h=cast([x,.2,z],[0,-1,0],water)[0];assert.ok(h&&Math.abs(h.point.y-.071)<.001);const rim=cast([x+.131,.2,z],[0,-1,0])[0];assert.ok(rim&&rim.point.y>.10,'Stone railing stands above the recessed lotus pool');}
  assert.equal(cast([0,.09,.29],[0,0,-1],water).length,0,'The lotus pools do not block the central walking axis');
  for(const x of [-.025,0,.025]){let previous;for(let j=0;j<=260;j++){const z=.650-j*.85/260,h=cast([x,.20,z],[0,-1,0],walk)[0];assert.ok(h,`Entry surface missing at ${x}/${z}`);assert.ok(Math.hypot(x,2.15+h.point.y,z)>2.15-.002);if(previous!==undefined)assert.ok(Math.abs(previous-h.point.y)<.020,`Stone route jumps at ${z}: ${previous}/${h.point.y}`);previous=h.point.y;}}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Tian Tan Buddha has bronze materials and an uninterrupted stair through three granite terraces',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{buddha}=await import('../web/hongkong-buddha.js'),k=makeKit({time:{value:0},night:{value:0}}),g=buddha(k);g.updateMatrixWorld(true);const walk=[];g.traverse(m=>{if(m.isMesh&&m.material.userData.buddhaWalk)walk.push(m);});
 const cast=(p,d,objects=[g])=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,2).intersectObjects(objects,true);
 try{
  for(const x of [-.06,0,.06]){let last;for(let j=0;j<=320;j++){const z=.622-j*.407/320,h=cast([x,.392,z],[0,-1,0],walk)[0];assert.ok(h,`Missing granite stair at ${x}/${z}`);assert.ok(Math.hypot(x,2.15+h.point.y,z)>2.15-.002);if(last!==undefined)assert.ok(Math.abs(last-h.point.y)<.018,`Stair jump at ${x}/${z}: ${last}/${h.point.y}`);last=h.point.y;}}
  for(const r of [.31,.275,.24]){const h=cast([r,.5,0],[0,-1,0])[0];assert.ok(h&&h.point.y>.32,'Every terrace has a separate stone balustrade');}
  const bronze=k.materials.find(m=>m.userData.buddhaBronze);assert.ok(bronze&&bronze.color.r>bronze.color.b&&bronze.color.g<bronze.color.r*1.1,'Bronze must not become saturated green');assert.ok(bronze.userData.night.intensity<.1,'Keep statue material subdued at night');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
