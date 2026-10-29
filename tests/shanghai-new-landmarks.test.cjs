const test=require('node:test');
const assert=require('node:assert/strict');

test('Astronomy museum has an open entrance oculus and an inverted skylight',async()=>{
  const THREE=await import('three'),{makeKit,createLandmark}=await import('../web/shanghai-landmarks.js');
  const k=makeKit({time:{value:0},night:{value:0}}),g=createLandmark('astronomy',k);g.updateMatrixWorld(true);
  try{
    const ray=new THREE.Raycaster(new THREE.Vector3(-.45,1,.02),new THREE.Vector3(0,-1,0));
    const opening=ray.intersectObject(g,true);assert.ok(opening.length&&opening[0].point.y<.06,'Sunlight reaches the pool through the roof aperture');
    ray.set(new THREE.Vector3(-.53,1,.02),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(g,true)[0]?.point.y>.20,'Roof remains solid beside the hole');
    ray.set(new THREE.Vector3(-.12,1,-.16),new THREE.Vector3(0,-1,0));const center=ray.intersectObject(g,true)[0].point.y;
    ray.set(new THREE.Vector3(.11,1,-.16),new THREE.Vector3(0,-1,0));const rim=ray.intersectObject(g,true)[0].point.y;
    assert.ok(rim-center>.05,'The central skylight is concave rather than a second sphere');
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Cathedral twin spires and Nanpu river clearance retain their distinct silhouettes',async()=>{
  const THREE=await import('three'),{makeKit,createLandmark}=await import('../web/shanghai-landmarks.js');
  const k=makeKit({time:{value:0},night:{value:0}}),church=createLandmark('cathedral',k),bridge=createLandmark('nanpu',k);church.updateMatrixWorld(true);bridge.updateMatrixWorld(true);
  try{
    const ray=new THREE.Raycaster(new THREE.Vector3(-.204,1,.215),new THREE.Vector3(0,-1,0));const left=ray.intersectObject(church,true)[0].point.y;
    ray.set(new THREE.Vector3(.204,1,.215),new THREE.Vector3(0,-1,0));const right=ray.intersectObject(church,true)[0].point.y;
    assert.ok(left>.67&&Math.abs(left-right)<.001,'Matching tall slate spires');
    ray.set(new THREE.Vector3(0,1,.215),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(church,true)[0].point.y<left*.6,'The nave stays well below the towers');
    ray.set(new THREE.Vector3(0,.06,.25),new THREE.Vector3(0,0,-1));ray.far=.50;assert.equal(ray.intersectObject(bridge,true).length,0,'River crossing remains open beneath the central span');
    ray.set(new THREE.Vector3(0,.3,0),new THREE.Vector3(0,-1,0));ray.far=1;assert.ok(ray.intersectObject(bridge,true)[0]?.point.y>.12,'A solid roadway spans the open river');
  }finally{for(const g of [church,bridge])g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('New scenic landmarks have finite daylight and night materials and remain outside travel catalogs',async()=>{
  const {createShanghaiScene}=await import('../web/shanghai-scene.js'),{LANDMARKS}=await import('../web/shanghai-landmarks.js');
  const s=createShanghaiScene();
  try{
    for(const id of ['astronomy','cathedral','nanpu']){
      assert.equal(LANDMARKS.find(x=>x.id===id).sceneryOnly,true);
      for(const night of [true,false]){
        s.setNight(night);s.update(3,false);let lamps=0;
        s.landmarks.get(id).traverse(o=>{if(!o.isMesh)return;const m=o.material;for(const c of ['r','g','b']){assert.ok(Number.isFinite(m.color[c]));assert.ok(Number.isFinite(m.emissive[c]));}if(m.userData.night){lamps++;assert.equal(m.emissiveIntensity>0,night);}});
        assert.ok(lamps>=2,'Architectural lighting is independently modelled');
      }
    }
  }finally{s.dispose();}
});
