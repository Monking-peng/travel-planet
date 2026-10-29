const {test}=require('node:test'),assert=require('node:assert/strict');
const dispose=g=>g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});

test('Wooded relief has real height, seated tree roots and a continuous spherical edge',async()=>{
  const {GARDENS,PLANET_RADIUS:R}=await import('../web/planet-layout.js'),{createGarden}=await import('../web/planet-layout-scene.js'),{Raycaster,Vector3}=await import('three');
  const parcels=GARDENS.filter(g=>g.kind==='wooded-hill');assert.ok(parcels.reduce((n,p)=>n+p.trees,0)>=70);
  for(const parcel of parcels){const root=createGarden(parcel);root.updateMatrixWorld(true);
    try{
      const terrain=root.getObjectByName('wooded-hill-terrain'),p=terrain.geometry.attributes.position;
      const normal=terrain.geometry.attributes.normal;for(let i=0;i<normal.count;i++)assert.ok(Math.abs(Math.hypot(normal.getX(i),normal.getY(i),normal.getZ(i))-1)<1e-5,'pole and seam lighting normals must remain valid');
      assert.ok(p.getY(0)>.005,'relief must rise above spherical turf');
      for(let i=p.count-49;i<p.count;i++)assert.ok(Math.abs(Math.hypot(p.getX(i),p.getY(i)+R+.014,p.getZ(i))-(R+.006))<1e-6,'terrain edge must meet globe');
      const trees=root.children.filter(o=>o.name==='hill-tree');assert.equal(trees.length,parcel.trees);
      for(const tree of trees){const ray=new Raycaster(new Vector3(tree.position.x,1,tree.position.z),new Vector3(0,-1,0)),hit=ray.intersectObject(terrain)[0];assert.ok(hit&&Math.abs(hit.point.y-tree.position.y)<.0004,'trees must stand on the slope');}
    }finally{dispose(root);}
  }
});

test('Generic house clusters are replaced by distinct Hangzhou silhouettes and readable vector plaques',async()=>{
  const {CONTEXT_PARCELS,PLANET_RADIUS:R}=await import('../web/planet-layout.js'),{createContextBlock}=await import('../web/planet-context.js');
  for(const parcel of CONTEXT_PARCELS){const root=createContextBlock(parcel),liu=parcel.id==='garden-lane',prefix=liu?'liuhe':'chenghuang';
    try{
      assert.equal(root.getObjectByName('context-house'),undefined);
      assert.equal(root.children.filter(o=>new RegExp('^'+prefix+'-eave-\\d+$').test(o.name)).length,liu?13:5);
      assert.equal(root.children.filter(o=>o.name===prefix+'-plaque-character').map(o=>o.userData.character).join(''),liu?'六和塔':'城隍阁');
      if(!liu)assert.equal(root.children.filter(o=>o.name==='chenghuang-corner-roof').length,4);
      const p=root.getObjectByName(prefix+'-street-connection').geometry.attributes.position;
      for(const i of [p.count-2,p.count-1]){assert.ok(Math.abs(p.getZ(i)-parcel.entrance[1])<1e-6);assert.ok(Math.abs(Math.hypot(p.getX(i),p.getY(i)+R+.004,p.getZ(i))-(R+.009))<.0005);}
    }finally{dispose(root);}
  }
});

test('Heritage view faces both permanent monuments without changing the saved scenery library',async()=>{
  const {overviewView,DEFAULT_COMPONENTS,COMPONENTS}=await import('../web/planet-options.js'),{CONTEXT_PARCELS,normalAt}=await import('../web/planet-layout.js'),{Vector3,Euler}=await import('three');
  const v=overviewView('heritage');assert.ok(v&&v.zoom<3);
  for(const p of CONTEXT_PARCELS)assert.ok(new Vector3(...normalAt(...p.geo)).applyEuler(new Euler(v.x,v.y,v.z)).dot(new Vector3(0,1,6.2).normalize())>.3);
  assert.equal(DEFAULT_COMPONENTS.length,11);assert.equal(COMPONENTS.length,22);
});
