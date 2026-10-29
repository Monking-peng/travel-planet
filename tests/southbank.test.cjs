const {test}=require('node:test'),assert=require('node:assert/strict');
const dispose=g=>g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});

test('Southbank landmarks have finite unit surface normals and fit their individual footprints',async()=>{
  const {createOlympicLotus,createSouthbankSkyline}=await import('../web/planet-southbank.js');
  const {Box3}=await import('three');
  for(const build of [createOlympicLotus,createSouthbankSkyline]){
    const model=build(.40,.28),bounds=new Box3().setFromObject(model);
    assert.ok(bounds.min.x>=-.201&&bounds.max.x<=.201);
    assert.ok(bounds.min.z>=-.141&&bounds.max.z<=.141);
    model.traverse(o=>{
      if(!o.isMesh)return;
      for(const attr of Object.values(o.geometry.attributes))assert.ok(Array.from(attr.array).every(Number.isFinite),o.name);
      const n=o.geometry.attributes.normal;
      for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5,o.name);
    });
    dispose(model);
  }
});

test('Lotus roof exposes the neutral event floor without sports markings and welcome text stays outside its facade',async()=>{
  const {createOlympicLotus,createRiverTower}=await import('../web/planet-southbank.js');
  const {Raycaster,Vector3,Box3}=await import('three');
  const stadium=createOlympicLotus(),city=createRiverTower({size:[.072,.062],height:.41,style:1,welcome:true});
  stadium.updateMatrixWorld(true);city.updateMatrixWorld(true);
  const hit=new Raycaster(new Vector3(0,1,0),new Vector3(0,-1,0)).intersectObject(stadium,true)[0];
  assert.equal(hit.object.name,'stadium-event-floor','roof covers the neutral floor');
  stadium.traverse(o=>assert.ok(!/football|pitch-|stadium-field|running-track|running-lane/.test(o.name),'sports decoration returned'));
  const panel=city.getObjectByName('hangzhou-welcome-screen'),panelBox=new Box3().setFromObject(panel);
  const glyphs=city.children.filter(o=>o.name.startsWith('welcome-character-'));
  assert.equal(glyphs.map(o=>o.userData.character).join(''),'杭州欢迎您');
  for(const glyph of glyphs){
    const b=new Box3().setFromObject(glyph);
    assert.ok(b.min.z>panelBox.max.z,'letters sink into facade');
    assert.ok(b.min.x>panelBox.min.x&&b.max.x<panelBox.max.x&&b.min.y>panelBox.min.y&&b.max.y<panelBox.max.y,'letters overflow screen');
  }
  dispose(stadium);dispose(city);
});

test('District lamps and their targets rotate together with the globe and remain local',async()=>{
  const {createRiverDistrictLights}=await import('../web/planet-lighting.js'),{Group,Vector3}=await import('three');
  const globe=new Group(),lighting=createRiverDistrictLights();globe.add(lighting);globe.updateMatrixWorld(true);
  const lamps=[];lighting.traverse(o=>{if(o.isLight)lamps.push(o);});
  assert.equal(lamps.length,3);
  const before=lamps.map(l=>l.getWorldPosition(new Vector3()));
  const distances=lamps.map(l=>l.getWorldPosition(new Vector3()).distanceTo(l.target.getWorldPosition(new Vector3())));
  globe.rotation.set(.5,.7,.2);globe.updateMatrixWorld(true);
  lamps.forEach((lamp,i)=>{
    assert.equal(lamp.parent,lamp.target.parent);
    assert.equal(lamp.castShadow,false);
    assert.ok(lamp.distance>0&&lamp.distance<=.4&&lamp.intensity>0&&lamp.intensity<.02);
    const p=lamp.getWorldPosition(new Vector3()),target=lamp.target.getWorldPosition(new Vector3());
    assert.ok(p.distanceTo(before[i])>.1,'light stays fixed while planet rotates');
    assert.ok(Math.abs(p.distanceTo(target)-distances[i])<1e-8,'light detached from target');
  });
});

test('Hangzhou gateway has an open ground arch and a suspended link below the upper opening',async()=>{
  const {createSouthbankSkyline}=await import('../web/planet-southbank.js');
  const {Raycaster,Vector3}=await import('three');
  const city=createSouthbankSkyline();city.updateMatrixWorld(true);
  const across=y=>new Raycaster(new Vector3(0,y,.2),new Vector3(0,0,-1)).intersectObject(city,true);
  assert.equal(across(.08).length,0,'a solid slab blocks the ground arch');
  assert.ok(across(.16).some(h=>h.object.name==='gate-suspended-veil'),'the hanging bridge is missing');
  assert.equal(across(.30).length,0,'the upper U opening is closed');
  dispose(city);
});

test('Individual riverfront buildings have no shared block plate and their feet meet the ground',async()=>{
  const {createGarden}=await import('../web/planet-layout-scene.js'),{GARDENS,PLANET_RADIUS:R}=await import('../web/planet-layout.js'),{Box3}=await import('three');
  const parcels=GARDENS.filter(p=>['river-tower','southbank-skyline','olympic-lotus'].includes(p.kind));
  assert.equal(parcels.filter(p=>p.kind==='river-tower').length,9);
  for(const p of parcels){const model=createGarden(p);model.updateMatrixWorld(true);
    model.traverse(o=>assert.ok(!/district-plaza|district-terrace|riverfront-planter|plaza-crossing/.test(o.name),'shared display plate returned'));
    const b=new Box3().setFromObject(model);assert.ok(b.min.y<=-.013,p.id+' floats');
    if(p.kind==='river-tower'){assert.ok(b.max.y>=.27);assert.equal(model.children.filter(o=>o.name==='river-tower-glass').length,1);}
    if(p.kind==='southbank-skyline')assert.ok(b.max.y>.53);
    if(p.kind==='olympic-lotus'){
      const apron=model.getObjectByName('landmark-oval-apron'),v=apron.geometry.attributes.position;
      for(let i=0;i<v.count;i++){assert.ok(Math.abs(Math.hypot(v.getX(i),R+.014+v.getY(i),v.getZ(i))-(R+.009))<1e-6);assert.ok((v.getX(i)/(p.size[0]*.49))**2+(v.getZ(i)/(p.size[1]*.49))**2<=1.000001);}
    }
    dispose(model);
  }
});


test('Sloped single-tower roofs form one plane and meet the glass crown',async()=>{
  const {createRiverTower}=await import('../web/planet-southbank.js');
  const width=.072,height=.41,model=createRiverTower({size:[width,.062],height,style:1});
  try{const roof=model.getObjectByName('river-tower-roof').geometry.attributes.position;
    for(let i=0;i<roof.count;i++){const expected=.003+height+roof.getX(i)/(width*.84)*.037+.0002;assert.ok(Math.abs(roof.getY(i)-expected)<1e-6,'roof folds at the centre');}
  }finally{dispose(model);}
});

test('Facade lights maintain an even gap over tapered and sloped glass elevations',async()=>{
  const {createRiverTower}=await import('../web/planet-southbank.js'),{Raycaster,Vector3}=await import('three');
  for(const style of [0,1,2]){
    const city=createRiverTower({size:[.072,.062],height:.41,style});city.updateMatrixWorld(true);
    try{const glass=city.getObjectByName('river-tower-glass');
      for(const light of city.children.filter(o=>['facade-led-ribbon','office-lit-room'].includes(o.name))){
        const positions=light.geometry.attributes.position;
        for(let i=0;i<positions.count;i++){
          const point=new Vector3().fromBufferAttribute(positions,i).applyMatrix4(light.matrixWorld);
          const direction=light.name==='facade-led-ribbon'?new Vector3(0,0,-Math.sign(point.z)):new Vector3(-Math.sign(point.x),0,0);
          const hit=new Raycaster(point,direction,0,.002).intersectObject(glass)[0];
          assert.ok(hit,'light is buried in the facade');assert.ok(Math.abs(hit.distance-.0008)<.00003,'light floats away from the tapered facade');
        }
      }
    }finally{dispose(city);}
  }
});

test('Lotus light ribbons stay outside their actual shell facets without casting striped shadows',async()=>{
  const {createOlympicLotus}=await import('../web/planet-southbank.js'),{Raycaster,Vector3}=await import('three');
  const model=createOlympicLotus(.32,.22);model.updateMatrixWorld(true);let checked=0;
  try{for(const ribbon of model.children.filter(o=>o.name==='lotus-shell-seam')){
    const shell=model.children.slice(0,model.children.indexOf(ribbon)).findLast(o=>/^lotus-(small|large)-petal$/.test(o.name));assert.ok(shell);
    const p=ribbon.geometry.attributes.position,n=ribbon.geometry.attributes.normal,ix=ribbon.geometry.index;
    for(let i=0;i<ix.count;i+=3){
      const a=new Vector3().fromBufferAttribute(p,ix.getX(i)),b=new Vector3().fromBufferAttribute(p,ix.getX(i+1)),c=new Vector3().fromBufferAttribute(p,ix.getX(i+2));
      if(b.clone().sub(a).cross(c.clone().sub(a)).lengthSq()<1e-18)continue;
      const point=a.add(b).add(c).multiplyScalar(1/3),direction=new Vector3().fromBufferAttribute(n,ix.getX(i)).negate();
      const hit=new Raycaster(point,direction,0,.0008).intersectObject(shell)[0];
      assert.ok(hit,'ribbon crosses or leaves its shell');assert.ok(Math.abs(hit.distance-.00045)<1e-6,'ribbon has uneven shell clearance');checked++;
    }assert.equal(ribbon.castShadow,false);
  }assert.ok(checked>2000);
  }finally{dispose(model);}
});
test('Riverfront buildings form a close sequence and the lotus sits beside the gateway',async()=>{
  const {measureGardens}=await import('../web/planet-layout-scene.js'),{footprintFrame,projectToFrame}=await import('../web/planet-layout.js');
  const list=measureGardens().filter(p=>['river-tower','southbank-skyline','olympic-lotus'].includes(p.kind)).sort((a,b)=>a.geo[0]-b.geo[0]);
  const distance=(p,a,b)=>{const v=b.map((n,i)=>n-a[i]),t=Math.max(0,Math.min(1,p.reduce((s,n,i)=>s+(n-a[i])*v[i],0)/v.reduce((s,n)=>s+n*n,0)));return Math.hypot(...p.map((n,i)=>n-a[i]-t*v[i]));};
  for(let i=1;i<list.length;i++){
    const a=list[i-1],b=list[i];
    if(a.kind==='southbank-skyline')continue; // The bridge approach stays open.
    const f=footprintFrame(a,a.bounds,0),g=footprintFrame(b,b.bounds,0),left=f.polygon,right=g.world.map(n=>projectToFrame(n,f));let gap=Infinity;
    for(let k=0;k<4;k++)for(let j=0;j<4;j++)gap=Math.min(gap,distance(left[k],right[j],right[(j+1)%4]),distance(right[k],left[j],left[(j+1)%4]));
    assert.ok(gap>.002&&gap<(a.kind==='river-tower'&&b.kind==='river-tower'?.006:.016),`${a.id} / ${b.id}: tight, nonintersecting frontage (${gap})`);
  }
  const lotusIndex=list.findIndex(p=>p.kind==='olympic-lotus');assert.equal(list[lotusIndex+1].kind,'southbank-skyline','lotus must directly adjoin the landmark twin towers');
});
