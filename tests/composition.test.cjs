const {test}=require('node:test'),assert=require('node:assert/strict');

test('Scenery toggles preserve landscape, camera transform and reusable geometry without hidden raycast targets',async()=>{
  const {createEditablePlanet}=await import('../web/planet-composition.js');
  const {createPlanet}=await import('../web/planet-scene.js');
  const {Raycaster,Vector3}=await import('three');
  const composition=createEditablePlanet(['cafe']),root=composition.root;
  const base=root.children.filter(m=>!m.userData.componentId),shops=root.children.filter(m=>m.userData.componentId==='cafe');
  root.rotation.set(.2,.3,.4);root.position.y=.1;
  composition.setComponents([]);
  assert.deepEqual(root.children,base);assert.ok(shops.every(m=>m.parent===null));
  const ray=new Raycaster(new Vector3(0,0,6),new Vector3(0,0,-1));root.updateMatrixWorld(true);
  assert.ok(ray.intersectObject(root,true).every(h=>h.object.userData.componentId!=='cafe'));
  composition.setComponents(['cafe','skyline','skyline','unknown']);
  assert.deepEqual(root.children.filter(m=>!m.userData.componentId),base);
  assert.deepEqual(root.children.filter(m=>m.userData.componentId==='cafe'),shops);
  assert.deepEqual(root.rotation.toArray().slice(0,3),[.2,.3,.4]);assert.equal(root.position.y,.1);
  const fresh=createPlanet(['skyline']),actual=root.children.filter(m=>m.userData.componentId==='skyline'),expected=fresh.children.filter(m=>m.userData.componentId==='skyline');
  assert.equal(actual.length,expected.length);
  for(let i=0;i<actual.length;i++){
    for(const attr of ['position','normal','color'])assert.deepEqual(actual[i].geometry.attributes[attr]?.array,expected[i].geometry.attributes[attr]?.array);
    assert.equal(actual[i].userData.placeId,expected[i].userData.placeId);
  }
  composition.dispose();fresh.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});
});

test('Composition releases both visible and cached scenery resources exactly once',async()=>{
  const {createEditablePlanet}=await import('../web/planet-composition.js');
  const composition=createEditablePlanet(['boat']);composition.setComponents(['boat','cafe']);
  const resources=new Map();composition.root.traverse(m=>{for(const resource of [m.geometry,m.material])if(resource&&!resources.has(resource)){resources.set(resource,0);resource.addEventListener('dispose',()=>resources.set(resource,resources.get(resource)+1));}});
  composition.setComponents([]);assert.ok([...resources.values()].every(n=>n===0));
  composition.dispose();composition.dispose();assert.ok([...resources.values()].every(n=>n===1));
  assert.equal(composition.root.children.length,0);assert.deepEqual(composition.setComponents(['boat']),[]);
});
