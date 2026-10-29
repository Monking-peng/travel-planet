const {test}=require('node:test'),assert=require('node:assert/strict');
const pose=(zoom,x=0)=>({x,y:0,z:0,offsetY:0,zoom});
test('Focusing a small piece turns at overview scale before approaching it',async()=>{
  const {createFocusTransition:make,sampleFocusTransition:sample}=await import('../web/planet-focus.js');
  const from=pose(1),to={...pose(7,1),offsetY:-1},f=make(from,to,1000);
  assert.deepEqual(sample(f,1000),{...from,done:false});
  const turning=sample(f,1100);assert.ok(turning.x>0&&turning.x<1);assert.equal(turning.zoom,1);
  const approach=sample(f,1300);assert.equal(approach.x,1);assert.ok(approach.zoom>1&&approach.zoom<7);
  assert.deepEqual(sample(f,2000),{...to,done:true});assert.deepEqual(from,pose(1));
});
test('Leaving an eight-times close view pulls back before rotating to another piece',async()=>{
  const {createFocusTransition:make,sampleFocusTransition:sample}=await import('../web/planet-focus.js');
  const from=pose(8),to=pose(3.6,1),f=make(from,to,0);
  assert.deepEqual(sample(f,0),{...from,done:false});
  const retreat=sample(f,60);assert.equal(retreat.x,0);assert.ok(retreat.zoom<8&&retreat.zoom>1.4);
  const turning=sample(f,240);assert.ok(turning.x>0&&turning.x<1);assert.equal(turning.zoom,1.4);
  assert.deepEqual(sample(f,600),{...to,done:true});
});
test('Retargeting a running approach starts at the currently rendered view',async()=>{
  const {createFocusTransition:make,sampleFocusTransition:sample}=await import('../web/planet-focus.js');
  const current=sample(make(pose(1),pose(7,1),0),300),target=pose(3.6,-1);
  const next=make(current,target,300),first=sample(next,300);
  for(const key of ['x','y','z','offsetY','zoom'])assert.equal(first[key],current[key]);
  assert.deepEqual(sample(next,1000),{...target,done:true});
});
test('An already aligned view changes zoom smoothly without an unnecessary overview detour',async()=>{
  const {createFocusTransition:make,sampleFocusTransition:sample}=await import('../web/planet-focus.js');
  const f=make(pose(8),pose(7),0),values=[0,30,60,90,120,150,180,1000].map(t=>sample(f,t));
  for(let i=0;i<values.length;i++){assert.equal(values[i].x,0);assert.ok(values[i].zoom>=7&&values[i].zoom<=8);if(i)assert.ok(values[i].zoom<=values[i-1].zoom);}
  assert.deepEqual(values.at(-1),{...pose(7),done:true});
});
test('Overview destinations bring their atlas districts to the front without changing scenery selection',async()=>{
  const {overviewView,DEFAULT_COMPONENTS}=await import('../web/planet-options.js'),{normalAt}=await import('../web/planet-layout.js'),{Vector3,Euler}=await import('three');
  const selection=[...DEFAULT_COMPONENTS];
  for(const [id,geo] of [['hubin',[64,7]],['river',[162,-45]]]){
    const target=overviewView(id),center=new Vector3(...normalAt(...geo)).applyEuler(new Euler(target.x,target.y,target.z));
    assert.ok(center.z>(id==='river'?.4:.75)&&Math.abs(center.x)<.5,id+' should be visible in front');
    assert.ok(target.zoom>=1&&target.zoom<=3);
    target.zoom=4.5;assert.notEqual(overviewView(id).zoom,4.5);
  }
  assert.deepEqual(overviewView('lake'),{x:-.35,y:-.20,z:.25,offsetY:0,zoom:2});
  for(const id of ['bad','__proto__','constructor'])assert.equal(overviewView(id),null);
  assert.deepEqual(DEFAULT_COMPONENTS,selection);
});

test('The scenery editor fit view retains a canvas margin for default and full selections',async()=>{
  const {createPlanet}=await import('../web/planet-scene.js'),{createPlanetCamera}=await import('../web/planet.js'),{COMPONENTS,DEFAULT_COMPONENTS}=await import('../web/planet-options.js'),{Vector3}=await import('three');
  for(const selection of [DEFAULT_COMPONENTS,COMPONENTS.map(c=>c.id)]){
    const root=createPlanet(selection);root.updateMatrixWorld(true);const v=new Vector3();
    for(const [width,height] of [[900,512],[660,372]]){
      const camera=createPlanetCamera(width,height);assert.equal(camera.zoom,2);camera.zoom=.9;camera.updateProjectionMatrix();
      root.traverse(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.attributes.position;
        for(let i=0;i<positions.count;i++){
          v.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).project(camera);
          assert.ok(Math.abs(v.x)<=.97&&Math.abs(v.y)<=.97,`${mesh.name}: vertex ${i} leaves the overview margin (${v.x}, ${v.y})`);
        }
      });
    }
    const materials=new Set();root.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();materials.add(mesh.material);}});materials.forEach(m=>m.dispose());
  }
});
