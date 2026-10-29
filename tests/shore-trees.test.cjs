const {test}=require('node:test'),assert=require('node:assert/strict');

test('Shore planting reaches all four lake banks and stays close to the shoreline',async()=>{
  const {GARDENS,LAKE_OUTLINE,normalAt,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3}=await import('three');
  const groves=GARDENS.filter(g=>g.kind==='shore-grove');
  for(const sector of ['north','south','east','west'])assert.ok(groves.filter(g=>g.sector===sector).length>=3,sector+' bank is bare');
  for(const garden of groves){const p=new Vector3(...normalAt(...garden.geo));assert.ok(Math.min(...LAKE_OUTLINE.map(q=>p.angleTo(new Vector3(...normalAt(...q)))*PLANET_RADIUS))<.42,garden.id+' is detached from the lake');}
});

test('New shore trunks meet the actual curved garden surface without floating or sinking',async()=>{
  const {createLandscape}=await import('../web/planet-layout-scene.js'),{Vector3,Raycaster}=await import('three'),{PLANET_RADIUS}=await import('../web/planet-layout.js');
  const scene=createLandscape();scene.updateMatrixWorld(true);let trunks=0;
  for(const garden of scene.children.filter(o=>o.userData.gardenId?.startsWith('shore-'))){
    const ground=garden.children[0];
    garden.traverse(o=>{if(o.name!=='shore-tree-trunk')return;trunks++;
      const foot=new Vector3(0,-o.geometry.parameters.height/2,0).applyMatrix4(o.matrixWorld),up=foot.clone().normalize();
      const hit=new Raycaster(up.clone().multiplyScalar(PLANET_RADIUS+.2),up.clone().negate()).intersectObject(ground,false)[0];
      assert.ok(hit,garden.name+' root leaves its planting bed');assert.ok(foot.distanceTo(hit.point)<.001,garden.name+' root floats or sinks');
    });
  }
  assert.ok(trunks>=36);scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});
