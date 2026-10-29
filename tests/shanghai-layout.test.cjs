const {test}=require('node:test');
const assert=require('node:assert/strict');

test('Relocated attractions have separate spherical ground footprints and Disney has no river underneath',async()=>{
  const T=await import('three'),{createShanghaiScene,RADIUS}=await import('../web/shanghai-scene.js');
  const scene=createShanghaiScene();scene.root.updateMatrixWorld(true);
  try{
    const caps=new Map();
    for(const [id,object] of scene.landmarks){
      const normal=object.position.clone().normalize();let radius=0;
      object.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;
        for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);if(p.length()<RADIUS+.10)radius=Math.max(radius,normal.angleTo(p));}
      });caps.set(id,{normal,radius});
    }
    const moved=['huxinting','wukang','jingan','artMuseum','expoArena','disney','astronomy','cathedral'];
    for(const id of moved)for(const [other,b] of caps){if(other===id)continue;const a=caps.get(id),gap=a.normal.angleTo(b.normal)-a.radius-b.radius;assert.ok(gap>.035,`${id} overlaps or crowds ${other}: ${gap}`);}
    const park=caps.get('disney');let riverVertices=0;
    scene.root.traverse(m=>{if(!m.isMesh||m.material?.color?.getHexString()!=='619da4')return;const a=m.geometry.attributes.position;
      for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);riverVertices++;assert.ok(park.normal.angleTo(p)>park.radius+.025,'River must remain outside the entire park, including its tree belt');}
    });assert.ok(riverVertices>1000);
    assert.ok([...scene.landmarks.values()].filter(m=>m.position.y<0).length>=5,'Attractions occupy the reverse hemisphere as well as the front');
  }finally{scene.dispose();}
});

test('TRON has a broad continuous roof and clear standing space beneath its two wave crests',async()=>{
  const T=await import('three'),{makeKit}=await import('../web/shanghai-landmarks.js'),{parkAttractions}=await import('../web/shanghai-disney-attractions.js'),{sag}=await import('../web/shanghai-heritage.js');
  const k=makeKit({time:{value:0},night:{value:0}}),g=new T.Group(),mat=k.mat('#cccccc');parkAttractions(k,g,{border:mat,cream:mat,warm:mat});g.updateMatrixWorld(true);
  try{
    const heights=[];
    for(const z of [-.38,-.08,.22])for(const x of [-.92,-.80]){
      const ray=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(g,true)[0];
      assert.ok(hit,'The middle of the canopy cannot be an empty oval');assert.ok(hit.point.y-sag(x,z)>.16,'Roof clears visitors and the track');heights.push(hit.point.y-sag(x,z));
    }
    assert.ok(Math.max(...heights)-Math.min(...heights)>.075,'The roof has visible wave heights, not a flat panel');
    const ray=new T.Raycaster(new T.Vector3(-.86,sag(-.86,-.08)+.10,-.08),new T.Vector3(1,0,0),0,.05);
    assert.equal(ray.intersectObject(g,true).length,0,'The central space beneath the canopy is open');
  }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
