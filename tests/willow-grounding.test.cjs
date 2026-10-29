const test=require('node:test'),assert=require('node:assert/strict');

test('Every planted willow trunk meets its actual soil surface without an air gap or deep burial',async()=>{
  const THREE=await import('three'),{createGarden}=await import('../web/planet-layout-scene.js'),{GARDENS}=await import('../web/planet-layout.js');
  const gardens=GARDENS.filter(g=>g.kind==='willow');assert.ok(gardens.length>0);
  for(const garden of gardens){
    const group=createGarden(garden);group.updateMatrixWorld(true);
    try{
      const soil=group.children.find(o=>o.isMesh),tree=group.getObjectByName('weeping-willow'),branches=[];
      assert.ok(soil&&tree,garden.id);
      tree.traverse(o=>{if(o.geometry?.type==='TubeGeometry')branches.push(o);});
      const trunk=branches.sort((a,b)=>b.geometry.parameters.radius-a.geometry.parameters.radius)[0];assert.ok(trunk,garden.id);
      const position=trunk.geometry.attributes.position,baseRing=trunk.geometry.parameters.radialSegments+1;
      for(let i=0;i<baseRing;i++){
        const point=new THREE.Vector3().fromBufferAttribute(position,i).applyMatrix4(trunk.matrixWorld);
        const ray=new THREE.Raycaster(new THREE.Vector3(point.x,1,point.z),new THREE.Vector3(0,-1,0));
        const hit=ray.intersectObject(soil,false)[0];assert.ok(hit,`${garden.id}: trunk base has no planted surface`);
        const gap=point.y-hit.point.y;
        assert.ok(gap<=.00005&&gap>=-.0012,`${garden.id}: base vertex ${i} soil gap ${gap}`);
      }
    }finally{group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  }
});
