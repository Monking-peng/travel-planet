const {test}=require('node:test');
const assert=require('node:assert/strict');

test('All non-bridge landmarks and their roofs stay outside actual river surfaces',async()=>{
  const T=await import('three'),{createShanghaiScene,RADIUS}=await import('../web/shanghai-scene.js');
  const scene=createShanghaiScene();scene.root.updateMatrixWorld(true);
  try{
    // Read the rendered water geometry rather than keeping a second river path in the test.
    const waters=[];scene.root.traverse(m=>{if(m.isMesh&&m.material?.color?.getHexString()==='619da4')waters.push(m);});assert.ok(waters.length);
    const triangles=[];
    for(const mesh of waters){const geo=mesh.geometry,a=geo.attributes.position,idx=geo.index;
      for(let i=0;i<(idx?.count??a.count);i+=3){const pts=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld).normalize());triangles.push({pts,center:pts[0].clone().add(pts[1]).add(pts[2]).normalize(),radius:Math.max(pts[0].distanceTo(pts[1]),pts[1].distanceTo(pts[2]),pts[2].distanceTo(pts[0]))});}
    }
    const p=new T.Vector3(),cross=new T.Vector3();let checked=0;
    for(const [id,object] of scene.landmarks){if(['waibaidu','nanpu'].includes(id))continue;
      const samples=new Map();object.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).normalize();const key=p.toArray().map(n=>n.toFixed(4)).join(',');if(!samples.has(key))samples.set(key,p.clone());}});
      for(const p of samples.values()){checked++;
        for(const {pts,center,radius} of triangles){if(p.distanceToSquared(center)>radius*radius)continue;
          const signs=pts.map((a,i)=>cross.crossVectors(a,pts[(i+1)%3]).dot(p));
          assert.ok(!(signs.every(n=>n>1e-9)||signs.every(n=>n< -1e-9)),`${id} projects onto river water at ${p.clone().multiplyScalar(RADIUS).toArray()}`);
        }
      }
    }assert.ok(checked>50000);
  }finally{scene.dispose();}
});

test('Whole modules detach effects and forecourts, reconnect without duplication, and dispose cached geometry',async()=>{
  const {createShanghaiScene}=await import('../web/shanghai-scene.js');const scene=createShanghaiScene();
  const original=new Map(scene.landmarks),all=new Set();scene.root.traverse(o=>{if(o.geometry)all.add(o.geometry);});
  let disposed=0;all.forEach(g=>g.addEventListener('dispose',()=>disposed++));
  const counts=()=>{const result={objects:0,lights:0};scene.root.traverse(o=>{result.objects++;if(o.isLight)result.lights++;});return result;};
  const baseline=counts();
  try{
    const pearl=scene.root.getObjectByName('landmark-module:pearl');assert.ok(pearl.children.length>=4,'Tower and its forecourt/edge lighting share ownership');
    scene.setNight(true);scene.update(0,false);scene.update(4,false);assert.ok(scene.fireworks.state.particleCount>0);
    assert.equal(scene.setLandmarkEnabled('disney',false),true);scene.update(5,false);assert.equal(scene.fireworks.state.active,false);assert.equal(scene.fireworks.state.particleCount,0);assert.equal(scene.root.getObjectByName('disney-fireworks'),undefined);
    assert.ok(counts().lights<baseline.lights-5,'Park lights detach with the park');
    scene.setLandmarkEnabled('disney',true);assert.deepEqual(counts(),baseline);
    for(let round=0;round<3;round++){
      for(const id of original.keys())assert.equal(scene.setLandmarkEnabled(id,false),true);
      assert.equal(scene.landmarks.size,0);let liveModules=0,paths=0;scene.root.traverse(o=>{if(o.userData.moduleId)liveModules++;if(o.name.startsWith('connection:'))paths++;});assert.equal(liveModules,0);assert.equal(paths,0);
      assert.equal(scene.setLandmarkEnabled('unknown',true),false);
      for(const [id,object] of original){scene.setLandmarkEnabled(id,true);assert.equal(scene.landmarks.get(id),object);assert.equal(scene.setLandmarkEnabled(id,true),false);}
      assert.deepEqual(counts(),baseline);
    }
    scene.setLandmarkEnabled('wukang',false);assert.equal(scene.root.getObjectByName('connection:jingan:wukang'),undefined);
    for(const id of original.keys())scene.setLandmarkEnabled(id,false);
  }finally{scene.dispose();}
  assert.equal(disposed,all.size,'Detached cached resources are disposed exactly once');
});

test('Saved landscape choices reject invalid values and unrelated catalog IDs',async()=>{
  const {parseRemovedModules}=await import('../web/shanghai-module-panel.js');
  assert.deepEqual([...parseRemovedModules('["disney","disney","sh-bund","unknown",7,null]')],['disney']);
  for(const raw of [null,'oops','{}','null','true'])assert.equal(parseRemovedModules(raw).size,0);
});
