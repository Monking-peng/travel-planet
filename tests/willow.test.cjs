const {test}=require('node:test'),assert=require('node:assert/strict');
test('Every fixed willow keeps its crown within the allocated garden and reproduces the same geometry on reload',async()=>{
  const {willow}=await import('../web/planet-nature.js'),{Box3}=await import('three'),layout=await import('../web/planet-layout.js');
  const gardens=Object.values(layout).filter(Array.isArray).flat().filter(g=>g?.kind==='willow');assert.equal(gardens.length,29);
  for(const garden of gardens){
    const [width,depth]=garden.size,a=willow(width,depth,garden.id),b=willow(width,depth,garden.id);
    try{
      const bounds=new Box3().setFromObject(a);assert.ok(Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x))<=width/2+1e-8,garden.id);assert.ok(Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z))<=depth/2+1e-8,garden.id);
      assert.deepEqual(a.scale.toArray(),b.scale.toArray());assert.equal(a.children.length,b.children.length);
      for(let i=0;i<a.children.length;i++){const x=a.children[i].geometry,y=b.children[i].geometry;assert.deepEqual(x.index.array,y.index.array);for(const key of Object.keys(x.attributes))assert.deepEqual(x.attributes[key].array,y.attributes[key].array);}
    }finally{for(const root of [a,b])root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  }
});
