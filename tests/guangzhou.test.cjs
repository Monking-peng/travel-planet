const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Guangzhou landmarks stay on land, above the globe and separated on two hemispheres',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS,channelX}=await import('../web/guangzhou-scene.js');const scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g]of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks into terrain`);radius=Math.max(radius,normal.angleTo(p));p.normalize().multiplyScalar(RADIUS);if(id!=='haixin')assert.ok(Math.abs(p.x-channelX(Math.atan2(p.z,p.y)))>.25,`${id} intrudes into the river`);}});if(id!=='haixin')caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.equal(caps.filter(c=>c.normal.y<0).length,4);
  }finally{scene.dispose();}
});

test('Guangzhou complete landmark modules detach with their lighting and release resources once',async()=>{
  const {createGuangzhouScene}=await import('../web/guangzhou-scene.js'),{LANDMARKS}=await import('../web/guangzhou-landmarks.js');const scene=createGuangzhouScene(),original=new Map(scene.landmarks),geometries=new Set();
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,11);
  scene.root.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const key of ['position','normal'])for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name} ${key}`);});
  scene.setNight(true);
  for(const [id,g]of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o)));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let count=0;geometries.forEach(g=>g.addEventListener('dispose',()=>count++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(count,geometries.size);
});

test('Guangzhou night lights change gently, preserve base colors and respect reduced motion',async()=>{
  const {createGuangzhouScene}=await import('../web/guangzhou-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/guangzhou-landmarks.js');const scene=createGuangzhouScene();
  try{assert.deepEqual([...parseRemovedModules('["canton","palace","canton",null]',LANDMARKS)],['canton']);const colors=new Map(),pulse=[];scene.landmarks.forEach(g=>g.traverse(o=>{if(o.material?.color)colors.set(o.material,o.material.color.clone());if(o.material?.userData.pulse)pulse.push(o.material);}));assert.ok(pulse.length);scene.setNight(true);colors.forEach((color,m)=>assert.ok(m.color.equals(color)));scene.update(1,false);const values=pulse.map(m=>m.emissiveIntensity);scene.update(4,false);assert.ok(pulse.some((m,i)=>m.emissiveIntensity!==values[i]));scene.update(5,true);const still=pulse.map(m=>m.emissiveIntensity);scene.update(30,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),still);scene.setNight(false);scene.update(31,false);assert.ok(pulse.every(m=>m.emissiveIntensity===0));}
  finally{scene.dispose();}
});

test('Haixin pedestrian deck crosses the river above water with an open single arch',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{
    const bridge=scene.landmarks.get('haixin'),water=scene.root.getObjectByName('guangzhou-waterways');
    const bent=([x,y,z])=>new T.Vector3(x,y-RADIUS+Math.sqrt(RADIUS*RADIUS-x*x-z*z),z).applyMatrix4(bridge.matrixWorld);
    for(const sample of bridge.userData.deckSamples){const center=bent(sample),normal=center.clone().normalize(),ray=new T.Raycaster(normal.clone().multiplyScalar(RADIUS+1),normal.clone().negate());const deck=ray.intersectObject(bridge,true),river=ray.intersectObject(water);assert.ok(deck.length&&river.length,'The deck must cross the actual river, not nearby grass');assert.ok(deck[0].point.distanceTo(center)<.012,'Pedestrian centerline remains a clear walkable surface');assert.ok(deck[0].point.length()-river[0].point.length()>.08,'Usable clearance remains above the river');}
    const crown=bent(bridge.userData.archSamples[6]),deck=bent(bridge.userData.deckSamples[1]);assert.ok(crown.length()-deck.length()>.25,'The single arch must remain above the walking deck');
  }finally{scene.dispose();}
});

test('Guangzhou riverbank walks join the bridge and three plaza landmarks without crossing the water',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS,channelX}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();
  try{
    const walks=scene.root.getObjectByName('guangzhou-riverfront');assert.ok(walks);assert.ok(walks.userData.connections.length>=6);assert.equal(walks.userData.bridgeLinks.length,4);assert.deepEqual(walks.userData.districtLinks.map(x=>x.to),['twins','opera','museum']);
    walks.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i);assert.ok(v.length()>RADIUS,'Paving must remain above the terrain');v.normalize().multiplyScalar(RADIUS);assert.ok(Math.abs(v.x-channelX(Math.atan2(v.z,v.y)))>.22,'Bank walk should not be laid on water');}});
    for(const id of [...scene.landmarks.keys()])scene.setLandmarkEnabled(id,false);assert.equal(walks.parent,scene.root,'The shared riverbanks survive landmark removal');
  }finally{scene.dispose();}
});

test('Opera House curved roofs stay closed and the entrance promenade stays dry and clear',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{
    const g=scene.landmarks.get('opera'),bent=([x,y,z])=>new T.Vector3(x,y-RADIUS+Math.sqrt(RADIUS*RADIUS-x*x-z*z),z).applyMatrix4(g.matrixWorld);
    for(const [x,z,s] of [[.23,-.045,.91],[-.48,-.115,.47]])for(const [dx,dz] of [[-.20,-.10],[0,-.10],[.12,.08]]){
      const p=bent([x+dx*s,.55*s+.008,z+dz*s]),normal=g.position.clone().normalize(),ray=new T.Raycaster(p,normal.clone().negate()),hits=ray.intersectObject(g,true);
      assert.ok(hits.length,'Each pebble needs a closed roof under a downward ray');
      assert.ok(hits[0].object.material.userData.operaSurface,'Roof ray must meet the shell before the pool or plaza');
      assert.ok(hits[0].distance<.28*s,'The roof must cover the central occupied volume');
    }
    for(const point of g.userData.walkSamples){
      const floor=bent(point),normal=g.position.clone().normalize(),ray=new T.Raycaster(floor.clone().addScaledVector(normal,.8),normal.clone().negate()),hits=ray.intersectObject(g,true);
      assert.ok(hits.length&&hits[0].point.distanceTo(floor)<.012,'Promenade should reach both entrances without water or an overhead shell blocking the route');
    }
    const water=[];g.traverse(o=>{if(o.material?.userData.operaPool)water.push(o);});assert.ok(water.length);
    for(const r of [.15,.5,.85])for(let i=0;i<24;i++){
      const a=i/24*Math.PI*2,p=bent([Math.cos(a)*.70*r,.019,Math.sin(a)*.532*r]),normal=g.position.clone().normalize();
      const ray=new T.Raycaster(p.clone().addScaledVector(normal,.2),normal.clone().negate()),hits=ray.intersectObjects(water);
      assert.ok(hits.length&&hits[0].point.distanceTo(p)<.001,'Pool must remain a continuous outward-facing surface after spherical bending');
    }
  }finally{scene.dispose();}
});

test('Cathedral side aisles have covered roofs, open flying buttresses and detachable facade lights',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{
    const g=scene.landmarks.get('cathedral'),bent=([x,y,z])=>new T.Vector3(x,y-RADIUS+Math.sqrt(RADIUS*RADIUS-x*x-z*z),z).applyMatrix4(g.matrixWorld);
    const segment=(a,b)=>{const start=bent(a),end=bent(b),delta=end.clone().sub(start);return new T.Raycaster(start,delta.clone().normalize(),0,delta.length()).intersectObject(g,true);};
    for(const side of [-1,1]){
      for(const z of [-.40,-.23,-.06,.11,.28]){
        const roof=segment([side*.32,.40,-.04+z],[side*.32,.27,-.04+z]);
        assert.ok(roof.length&&roof[0].object.material.color.getHexString()==='76796a','Lower aisle needs a closed sloping roof between the supports');
      }
      for(const z of [-.475,-.305,-.135,.035,.205]){
        const center=-.04+z;
        assert.equal(segment([side*.34,.35,center-.025],[side*.34,.35,center+.025]).length,0,'Space below the flying buttress must remain open');
        assert.ok(segment([side*.34,.42,center-.025],[side*.34,.42,center+.025]).length,'The stone arch must cross above the open space');
      }
    }
    const lights=[];g.traverse(o=>{if(o.isSpotLight)lights.push(o);});assert.equal(lights.length,2);
    scene.setNight(true);assert.ok(lights.every(l=>l.intensity>0&&l.target.parent===g));
    scene.setLandmarkEnabled('cathedral',false);scene.root.traverse(o=>assert.ok(!lights.includes(o)));scene.setLandmarkEnabled('cathedral',true);assert.equal(g.parent,scene.root);
    scene.setNight(false);assert.ok(lights.every(l=>l.intensity===0));
  }finally{scene.dispose();}
});


test('Shamian has a recessed chapel entrance, open red-house galleries and closed roofs',async()=>{
  const T=await import('three'),{createGuangzhouScene,RADIUS}=await import('../web/guangzhou-scene.js'),scene=createGuangzhouScene();scene.root.updateMatrixWorld(true);
  try{
    const g=scene.landmarks.get('shamian'),bent=([x,y,z])=>new T.Vector3(x,y-RADIUS+Math.sqrt(RADIUS*RADIUS-x*x-z*z),z).applyMatrix4(g.matrixWorld);
    const segment=(a,b)=>{const start=bent(a),end=bent(b),delta=end.clone().sub(start);return new T.Raycaster(start,delta.clone().normalize(),0,delta.length()).intersectObject(g,true);};
    for(const dx of [-.018,0,.018])assert.equal(segment([-.40+dx,.118,.280],[-.40+dx,.118,.146]).length,0,'Chapel porch should have real depth before the recessed door');
    assert.ok(segment([-.40,.118,.146],[-.40,.118,.111]).length,'A recessed door closes the end of the entrance');
    for(const x of [-.215,-.073,.073,.215])for(let floor=0;floor<3;floor++)assert.equal(segment([.38+x,.020+.024+floor*.115+.066,.15],[.38+x,.020+.024+floor*.115+.066,.005]).length,0,'Each arcade bay remains open from the street to its back wall');
    for(const [x,z,y]of [[-.40,-.23,.46],[.38,-.12,.60]]){const hits=segment([x,y,z],[x,.20,z]);assert.ok(hits.length&&hits[0].object.material.userData.shamianRoof,'Nave and red house must have complete sloping roofs');}
    for(const x of [-.60,-.30,0,.30,.60]){const hits=segment([x,.13,.44],[x,.010,.44]);assert.ok(hits.length&&hits[0].point.distanceTo(bent([x,.018,.44]))<.008,'Pedestrian strip stays unblocked');}
  }finally{scene.dispose();}
});
