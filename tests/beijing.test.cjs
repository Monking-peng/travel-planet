const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Water Cube membranes cover every face outward and keep smooth normals after spherical bending',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{foamFace}=await import('../web/beijing-watercube.js'),{createBeijingScene}=await import('../web/beijing-scene.js');
  const k=makeKit({time:{value:0},night:{value:0}}),mat=k.mat('#8faebc'),groups=[];
  try{
    for(const [u,v,normal]of [[[1,0,0],[0,1,0],[0,0,1]],[[1,0,0],[0,1,0],[0,0,-1]],[[0,0,1],[0,1,0],[1,0,0]],[[0,0,1],[0,1,0],[-1,0,0]],[[1,0,0],[0,0,1],[0,1,0]]]){
      const g=new T.Group(),n=new T.Vector3(...normal);groups.push(g);foamFace(k,g,.65,.21,[0,0,0],u,v,normal,[mat],3);g.updateMatrixWorld(true);
      g.traverse(o=>{if(o.material!==mat)return;const p=o.geometry.attributes.position,a=o.geometry.attributes.normal;for(let i=0;i<a.count;i++){assert.ok(new T.Vector3().fromBufferAttribute(a,i).dot(n)>.1,'membrane normal must point outward');const depth=new T.Vector3().fromBufferAttribute(p,i).dot(n);assert.ok(depth>=-1e-6&&depth<=.0041,'cushions must remain a shallow outer skin');}});
      for(const [x,y]of [[.17,.04],[-.1,-.06],[0,.02],[.23,.08]]){
        const origin=new T.Vector3(...u).multiplyScalar(x).addScaledVector(new T.Vector3(...v),y).addScaledVector(n,.1),hits=new T.Raycaster(origin,n.clone().negate()).intersectObject(g,true);
        assert.ok(hits.length&&hits[0].distance>.095&&hits[0].distance<=.1001,'single-sided membrane must cover the full facade without holes');
      }
    }
    const scene=createBeijingScene();try{
      let duplicates=0;scene.landmarks.get('watercube').traverse(o=>{
        if(!o.material?.userData.cushion)return;const p=o.geometry.attributes.position,n=o.geometry.attributes.normal,c=o.geometry.attributes.color,seen=new Map();
        for(let i=0;i<p.count;i++){
          if(c.getX(i)<.89)continue;const key=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>x.toFixed(6)).join(','),current=new T.Vector3().fromBufferAttribute(n,i);
          if(seen.has(key)){assert.ok(current.dot(seen.get(key))>.9999,'adjacent triangles must retain a continuous normal at shared interior vertices');duplicates++;}else seen.set(key,current);
        }
      });assert.ok(duplicates>100,'exercise the rendered tessellated surface, not only the raw module');
    }finally{scene.dispose();}
  }finally{groups.forEach(g=>g.traverse(o=>o.geometry?.dispose()));k.materials.forEach(m=>m.dispose());}
});

test('Foxiang has a closed tiled top and genuinely open upper balconies around recessed doors',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{foxiang}=await import('../web/beijing-foxiang.js');
  const k=makeKit({time:{value:0},night:{value:0}}),g=foxiang(k);g.updateMatrixWorld(true);
  try{
    for(const [x,z]of [[0,0],[.02,.03],[.10,.01],[-.07,.06]]){
      const hits=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,-1,0)).intersectObject(g,true);
      assert.ok(hits.length&&hits[0].point.y>.42,'a roof must cover the upper hall, including its center');
      assert.ok(hits[0].face.normal.y>0,'roof surface must face upward');
    }
    for(const q of g.userData.levels.slice(0,2))for(let side=0;side<8;side++){
      const a=(side+.25)*Math.PI/4,n=new T.Vector3(Math.sin(a),0,Math.cos(a)),origin=n.clone().multiplyScalar(.20);origin.y=q.floor+.04;
      const hits=new T.Raycaster(origin,n.clone().negate()).intersectObject(g,true);
      assert.ok(hits.length&&hits[0].distance>.085&&hits[0].distance<.12,'gallery sightline should reach recessed doors rather than a solid outer wall');
    }
    const entrance=new T.Raycaster(new T.Vector3(0,.045,.25),new T.Vector3(0,0,-1)).intersectObject(g,true);
    assert.ok(entrance.length&&entrance[0].distance<.15,'lowest eave must have an entrance storey below it');
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Beijing landmark geometry is finite and complete modules detach with all their lights',async()=>{
  const {createBeijingScene}=await import('../web/beijing-scene.js'),{LANDMARKS}=await import('../web/beijing-landmarks.js');const scene=createBeijingScene(),geos=new Set(),textures=new Set(),original=new Map(scene.landmarks);
  assert.equal(original.size,LANDMARKS.length);assert.equal(original.size,12);
  scene.root.traverse(o=>{if(!o.isMesh)return;geos.add(o.geometry);if(o.material.map)textures.add(o.material.map);for(const key of ['position','normal']){assert.ok(o.geometry.attributes[key]);for(const v of o.geometry.attributes[key].array)assert.ok(Number.isFinite(v),`${o.name}: ${key}`);}});
  scene.setNight(true);
  for(const [id,g] of original){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(o=>o.intensity>0));assert.equal(scene.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);scene.root.traverse(o=>assert.ok(!lights.includes(o),'removed landmark must not illuminate the remaining scene'));assert.equal(scene.setLandmarkEnabled(id,true),true);assert.equal(scene.landmarks.get(id),g);}
  scene.setNight(false);scene.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
  let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of original.keys())scene.setLandmarkEnabled(id,false);scene.dispose();scene.dispose();assert.equal(disposed,geos.size);
});

test('Beijing spherical footprints stay separate and both hemispheres hold reachable landmarks',async()=>{
  const T=await import('three'),{createBeijingScene}=await import('../web/beijing-scene.js');const scene=createBeijingScene();scene.root.updateMatrixWorld(true);
  try{const caps=[];for(const [id,g] of scene.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);radius=Math.max(radius,normal.angleTo(p));}});caps.push({id,normal,radius});}
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.025,`${a.id} crowds ${b.id}`);}
    assert.ok(caps.filter(c=>c.normal.y<0).length>=4);
  }finally{scene.dispose();}
});

test('CCTV keeps a real through-opening rather than a painted dark patch',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{cctv}=await import('../web/beijing-modern.js');const k=makeKit({time:{value:0},night:{value:0}}),g=cctv(k);g.updateMatrixWorld(true);
  const through=new T.Raycaster(new T.Vector3(.01,.33,2),new T.Vector3(0,0,-1));assert.equal(through.intersectObject(g,true).length,0);
  const body=new T.Raycaster(new T.Vector3(-.17,.33,2),new T.Vector3(0,0,-1));assert.ok(body.intersectObject(g,true).length>0);
  g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());
});

test('Tiananmen vaulted doors are open through the gate base',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{tiananmen}=await import('../web/beijing-heritage.js');const k=makeKit({time:{value:0},night:{value:0}}),g=tiananmen(k);g.updateMatrixWorld(true);
  // Start beyond the bridge balustrades, immediately before the gate wall.
  const door=new T.Raycaster(new T.Vector3(.14,.06,-.05),new T.Vector3(0,0,-1));assert.equal(door.intersectObject(g,true).length,0);
  const wall=new T.Raycaster(new T.Vector3(.07,.06,-.05),new T.Vector3(0,0,-1));assert.ok(wall.intersectObject(g,true).length>0);
  g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());
});

test('Blue roofs stay blue at night and Water Cube breathing respects reduced motion',async()=>{
  const {createBeijingScene}=await import('../web/beijing-scene.js'),{parseRemovedModules}=await import('../web/destination-module-panel.js'),{LANDMARKS}=await import('../web/beijing-landmarks.js');const scene=createBeijingScene();
  try{assert.deepEqual([...parseRemovedModules('["heaven","crane","heaven",null]',LANDMARKS)],['heaven']);const blue=[],pulse=[];scene.landmarks.get('heaven').traverse(o=>{if(o.material?.color.getHexString()==='214963')blue.push(o.material);});assert.ok(blue.length);scene.setNight(true);assert.ok(blue.every(m=>m.emissive.b>m.emissive.r));scene.landmarks.get('watercube').traverse(o=>{if(o.material?.userData.pulse)pulse.push(o.material);});assert.ok(pulse.length);scene.update(1,false);const a=pulse[0].emissiveIntensity;scene.update(5,false);assert.notEqual(a,pulse[0].emissiveIntensity);scene.update(5,true);const b=pulse[0].emissiveIntensity;scene.update(25,true);assert.equal(b,pulse[0].emissiveIntensity);scene.setNight(false);scene.update(26,false);assert.equal(pulse[0].emissiveIntensity,0);
  }finally{scene.dispose();}
});

test('Jingshan pavilions stand on an upward facing connected hill and its forest leaves the courts clear',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{jingshan,jingshanHeight}=await import('../web/beijing-jingshan.js');
  const k=makeKit({time:{value:0},night:{value:0}}),g=jingshan(k);g.updateMatrixWorld(true);
  try{const soil=g.children.find(o=>o.material?.userData.terrainTint);assert.ok(soil);assert.equal(g.userData.pavilions.length,5);assert.ok(g.userData.treeCount>100);
    for(const f of g.userData.pavilions){const hits=new T.Raycaster(new T.Vector3(f.x,1,f.z),new T.Vector3(0,-1,0)).intersectObject(soil);assert.ok(hits.length,`${f.name}: hill must have an upward face`);assert.ok(Math.abs(hits[0].point.y-(f.y-.010))<.007,`${f.name}: foundation must meet the actual hill`);}
    for(const x of [-.22,0,.22])assert.ok(jingshanHeight(x,-.40)<.003,'Shouhuang court must remain on flat land');
    assert.ok(g.userData.pavilions[2].y>g.userData.pavilions[1].y&&g.userData.pavilions[1].y>g.userData.pavilions[0].y);
    for(let i=0;i<soil.geometry.attributes.normal.count;i++)assert.ok(soil.geometry.attributes.normal.getY(i)>=0,'hill triangles must face outward');
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Beijing axis preserves the north-south order with grounded links and night terrain blends into the globe',async()=>{
  const T=await import('three'),{createBeijingScene,RADIUS}=await import('../web/beijing-scene.js');const s=createBeijingScene();s.root.updateMatrixWorld(true);
  try{const axis=s.root.getObjectByName('beijing-axis-landscape');assert.deepEqual(axis.userData.connections.map(c=>[c.from,c.to]),[['tiananmen','palace'],['palace','jingshan'],['jingshan','drum']]);
    for(const p of axis.userData.points)assert.ok(Math.abs(new T.Vector3(...p).length()-(RADIUS+.014))<.00001);
    let z=Infinity;for(const id of ['tiananmen','palace','jingshan','drum']){const current=s.landmarks.get(id).position.z;assert.ok(current<z);z=current;}
    let soil;s.landmarks.get('jingshan').traverse(o=>{if(o.material?.userData.terrainTint)soil=o.material;});s.setNight(true);const ground=s.root.getObjectByName('beijing-terrain').material,edge=new T.Color('#8f9c79').multiply(soil.color);assert.ok(Math.abs(edge.r-ground.color.r)<1e-7&&Math.abs(edge.g-ground.color.g)<1e-7&&Math.abs(edge.b-ground.color.b)<1e-7);assert.equal(soil.emissive.getHex(),0);
    s.setLandmarkEnabled('jingshan',false);assert.equal(axis.parent,s.root);s.setNight(false);assert.equal(soil.color.getHexString(),'ffffff');
  }finally{s.dispose();}
});
