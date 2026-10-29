const test=require('node:test'),assert=require('node:assert/strict');

test('The greenhouse approach overlaps a visible entrance surface close to the actual curved path',async()=>{
  const {createPlacedPiece,entryGeo}=await import('../web/planet-layout-scene.js'),{PLACEMENTS,normalAt,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const root=createPlacedPiece('greenhouse');root.updateMatrixWorld(true);
  try{
    const p=PLACEMENTS.find(p=>p.id==='greenhouse'),n=new Vector3(...normalAt(...entryGeo(p)));
    const visible=root.children.filter(o=>o.name!=='paved-path'&&o.name!=='curved-foundation');
    const hit=new Raycaster(n.clone().multiplyScalar(PLANET_RADIUS+.4),n.clone().negate()).intersectObjects(visible,true)[0];
    assert.ok(hit,'the public path must reach the visible entrance');
    const gap=hit.point.length()-(PLANET_RADIUS+.009);
    assert.ok(gap>=-.001&&gap<.012,'the approach has an abrupt floating threshold: '+gap);
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});

test('The greenhouse entry has continuous descending walking surfaces and grounded step feet',async()=>{
  const {createPlacedPiece}=await import('../web/planet-layout-scene.js'),{PLACEMENTS,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const root=createPlacedPiece('greenhouse');root.updateMatrixWorld(true);
  try{
    const p=PLACEMENTS.find(p=>p.id==='greenhouse'),inverse=root.matrixWorld.clone().invert(),direction=new Vector3(0,-1,0).transformDirection(root.matrixWorld);
    const visible=root.children.filter(o=>o.name!=='paved-path'&&o.name!=='curved-foundation');let previous=null;
    for(let z=.185;z<=.302;z+=.002){
      const origin=new Vector3(0,.3,z*p.scale).applyMatrix4(root.matrixWorld),hit=new Raycaster(origin,direction).intersectObjects(visible,true)[0];
      assert.ok(hit,'the walk has an opening at '+z);const y=hit.point.clone().applyMatrix4(inverse).y;
      if(previous!==null){assert.ok(y-previous<.001,'entry rises away from the door');assert.ok(previous-y<.021,'entry has an excessive drop');}previous=y;
    }
    for(const step of root.children.filter(o=>o.name==='greenhouse-entry-step')){
      const pos=step.geometry.attributes.position,bottom=-step.geometry.parameters.height/2;
      for(let i=0;i<pos.count;i++)if(Math.abs(pos.getY(i)-bottom)<1e-7){
        const foot=new Vector3().fromBufferAttribute(pos,i).applyMatrix4(step.matrixWorld);
        assert.ok(foot.length()<=PLANET_RADIUS+.006,'step foot floats above the planted surface');
      }
    }
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});
