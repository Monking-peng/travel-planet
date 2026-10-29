const {test}=require('node:test'),assert=require('node:assert/strict');

test('Paving follows a convex lawn boundary instead of leaving its whole bounding rectangle empty',async()=>{
  const {promenadePaving}=await import('../web/planet-surfaces.js'),{normalAt,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const surface={outline:[[0,0],[4,0],[4,4],[0,4]]},outline=[[2,1],[3,2],[2,3],[1,2]];
  for(const lawn of [outline,[...outline].reverse()]){
    const mesh=promenadePaving(surface,[{outline:lawn}]);mesh.updateMatrixWorld(true);
    try{
      const hit=geo=>{const n=new Vector3(...normalAt(...geo));return new Raycaster(n.clone().multiplyScalar(PLANET_RADIUS+.1),n.clone().negate()).intersectObject(mesh,false).length>0;};
      for(const point of [[2,2],[2.2,2],[2,1.7]])assert.equal(hit(point),false,'grass must stay exposed');
      for(const point of [[1.2,1.2],[2.7,1.2],[2.7,2.7],[1.2,2.7]])assert.equal(hit(point),true,'paving must reach the sloping lawn edge');
      const {position,normal}=mesh.geometry.attributes;
      assert.ok([...position.array,...normal.array].every(Number.isFinite));
    }finally{mesh.geometry.dispose();mesh.material.dispose();}
  }
});
