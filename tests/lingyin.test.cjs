const {test}=require('node:test'),assert=require('node:assert/strict');
const dispose=root=>root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});

test('Lingyin has a clear hall axis, three separate main roofs, paired stone pagodas and static plaque',async()=>{
  const {createLingyinTemple}=await import('../web/planet-lingyin.js'),{Box3}=await import('three');
  const root=createLingyinTemple();
  try{
    const hall=id=>new Box3().setFromObject(root.getObjectByName('lingyin-'+id+'-walls'));
    assert.ok(hall('tianwang').min.z>hall('mahavira').max.z,'the front court remains open');
    assert.ok(hall('mahavira').min.z>hall('rear-hall').max.z,'the upper court remains open');
    const roofs=[0,1,2].map(i=>new Box3().setFromObject(root.getObjectByName('lingyin-mahavira-roof-'+i)));
    for(let i=1;i<3;i++){assert.ok(roofs[i].min.y>roofs[i-1].min.y);assert.ok(roofs[i].max.x<roofs[i-1].max.x);}
    assert.equal(root.children.filter(o=>o.name==='lingyin-stone-pagoda-base').length,2);
    assert.equal(root.children.filter(o=>o.name.startsWith('lingyin-character-')).map(o=>o.userData.character).join(''),'灵隐寺');
    const bounds=new Box3().setFromObject(root);assert.ok(bounds.min.x>=-.25&&bounds.max.x<=.25&&bounds.min.z>=-.27&&bounds.max.z<=.271);
    for(const roof of root.children.filter(o=>/^lingyin-mahavira-roof-\d$/.test(o.name))){
      const a=roof.geometry.attributes.normal;
      for(let i=0;i<a.count;i++)assert.ok(Number.isFinite(a.getX(i)+a.getY(i)+a.getZ(i))&&Math.hypot(a.getX(i),a.getY(i),a.getZ(i))>.99);
    }
  }finally{dispose(root);}
});

test('Lingyin terrace skirts meet the globe and visitors stand on actual courtyard surfaces',async()=>{
  const {createLingyinTemple}=await import('../web/planet-lingyin.js'),{PLANET_RADIUS:R}=await import('../web/planet-layout.js'),{Raycaster,Vector3}=await import('three');
  const root=createLingyinTemple();root.updateMatrixWorld(true);
  try{
    const floors=['lingyin-lower-court','lingyin-main-terrace','lingyin-upper-court'].map(n=>root.getObjectByName(n));
    for(const floor of floors){const p=floor.geometry.attributes.position;for(let i=4;i<8;i++)assert.ok(Math.abs(Math.hypot(p.getX(i),p.getY(i)+R+.014+.002,p.getZ(i))-(R+.006))<1e-6);}
    for(const visitor of root.children.filter(o=>/^lingyin-visitor-/.test(o.name))){
      const ray=new Raycaster(new Vector3(visitor.position.x,.5,visitor.position.z),new Vector3(0,-1,0)),hit=ray.intersectObjects(floors)[0];
      assert.ok(hit&&Math.abs(hit.point.y-visitor.position.y)<1e-6,visitor.name+' must stand on the court');
    }
    const p=root.getObjectByName('lingyin-entry-path').geometry.attributes.position;
    for(const i of [p.count-2,p.count-1])assert.ok(Math.abs(Math.hypot(p.getX(i),p.getY(i)+R+.014,p.getZ(i))-(R+.009))<.002);
  }finally{dispose(root);}
});

test('Lingyin is fixed western landscape with a connected, unobstructed approach and view independent of selections',async()=>{
  const {GARDENS}=await import('../web/planet-layout.js'),{validateLayout}=await import('../web/planet-blockout.js'),{overviewView,DEFAULT_COMPONENTS,COMPONENTS}=await import('../web/planet-options.js');
  const temple=GARDENS.find(g=>g.id==='lingyin-temple');assert.ok(temple&&temple.road&&temple.via.length);
  const result=validateLayout();for(const key of ['collisions','terrain','roadCollisions','roadWater','disconnected','reservedSpaceConflicts','propCollisions','propTerrain','propRoadConflicts'])assert.deepEqual(result[key],[],key);
  assert.equal(DEFAULT_COMPONENTS.length,11);assert.equal(COMPONENTS.length,22);assert.ok(!COMPONENTS.some(c=>c.id==='lingyin-temple'));
  const a=overviewView('lingyin');assert.ok(a.zoom>=3&&a.zoom<=4.5);a.zoom=1;assert.notEqual(overviewView('lingyin').zoom,1);
});
