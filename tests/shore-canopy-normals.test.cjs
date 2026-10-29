const {test}=require('node:test'),assert=require('node:assert/strict');

test('Every shore tree has leaf geometry with finite colours, unit normals and non-degenerate faces',async()=>{
  const {GARDENS}=await import('../web/planet-layout.js'),{createGarden}=await import('../web/planet-layout-scene.js');
  const {Vector3}=await import('three');let trees=0,crowns=0;
  for(const garden of GARDENS.filter(g=>g.kind==='shore-grove')){
    const group=createGarden(garden);
    try{group.traverse(o=>{
      if(o.name!=='shore-tree')return;trees++;
      const foliage=o.children.filter(child=>child.name==='shore-leaf-canopy');
      assert.equal(foliage.length,1,garden.id+' must retain a crown on each tree');
      const canopy=foliage[0];crowns++;
      const {position,normal,color}=canopy.geometry.attributes,indices=canopy.geometry.index.array,used=new Set(indices);
      assert.ok(indices.length>0&&indices.length%3===0,garden.id+' must have complete leaf faces');
      assert.equal(normal.count,position.count);assert.equal(color.count,position.count);
      assert.ok(canopy.material.vertexColors,garden.id+' must render its leaf colours');
      for(const i of used){
        const p=[position.getX(i),position.getY(i),position.getZ(i)],rgb=[color.getX(i),color.getY(i),color.getZ(i)];
        const n=[normal.getX(i),normal.getY(i),normal.getZ(i)];
        assert.ok([...p,...n,...rgb].every(Number.isFinite),garden.id+' has a non-finite attribute');
        assert.ok(rgb.every(v=>v>=0&&v<=1),garden.id+' has an invalid linear colour');
        assert.ok(Math.abs(Math.hypot(...n)-1)<1e-5,garden.id+' has a non-unit normal');
      }
      for(let i=0;i<indices.length;i+=3){
        const ids=Array.from(indices.slice(i,i+3)),[a,b,c]=ids.map(id=>new Vector3().fromBufferAttribute(position,id));
        const face=b.sub(a).cross(c.sub(a)),average=ids.reduce((sum,id)=>sum.add(new Vector3().fromBufferAttribute(normal,id)),new Vector3());
        assert.ok(face.lengthSq()>1e-16,garden.id+' has a collapsed leaf face');
        assert.ok(face.dot(average)>0,garden.id+' has lighting normals opposed to the leaf face');
      }
    });}finally{group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  }
  assert.ok(trees>0);assert.equal(crowns,trees);
});
