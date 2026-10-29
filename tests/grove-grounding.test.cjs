const test=require('node:test'),assert=require('node:assert/strict');

test('Every existing grove trunk meets its actual planted surface without an air gap or deep burial',async()=>{
  const THREE=await import('three'),{createGarden}=await import('../web/planet-layout-scene.js'),{GARDENS}=await import('../web/planet-layout.js');
  const gardens=GARDENS.filter(g=>g.kind==='grove');assert.ok(gardens.length>0);let trunks=0;
  for(const garden of gardens){
    const group=createGarden(garden);group.updateMatrixWorld(true);
    try{
      const soil=group.children.find(o=>o.isMesh);
      for(const tree of group.children.filter(o=>o.isGroup)){
        const trunk=tree.children.find(o=>o.geometry?.type==='CylinderGeometry');assert.ok(trunk,garden.id);trunks++;
        const positions=trunk.geometry.attributes.position,height=trunk.geometry.parameters.height;let points=0;
        for(let i=0;i<positions.count;i++){
          if(Math.abs(positions.getY(i)+height/2)>1e-7)continue;points++;
          const point=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(trunk.matrixWorld);
          const hit=new THREE.Raycaster(new THREE.Vector3(point.x,1,point.z),new THREE.Vector3(0,-1,0)).intersectObject(soil,false)[0];
          assert.ok(hit,`${garden.id}: root leaves its planted surface`);
          const gap=point.y-hit.point.y;assert.ok(gap<=.00005&&gap>=-.0012,`${garden.id}: root vertex ${i} soil gap ${gap}`);
        }
        assert.ok(points>0,garden.id);
      }
    }finally{group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  }
  assert.ok(trunks>0);
});
