const {test}=require('node:test'),assert=require('node:assert/strict');

test('Responsive construction lets pending page tasks run and preserves every scene buffer and material',async()=>{
  const {createPlanet,createPlanetAsync}=await import('../web/planet-scene.js');
  let ticks=0;const timer=setInterval(()=>ticks++,1),selection=['cafe','boat','pagoda'];
  const actual=await createPlanetAsync(selection);clearInterval(timer);
  assert.ok(ticks>5,'Page tasks must run while geometry is being constructed');
  const expected=createPlanet(selection);
  try{
    assert.equal(actual.children.length,expected.children.length);
    assert.deepEqual(actual.rotation.toArray(),expected.rotation.toArray());
    for(let i=0;i<actual.children.length;i++){
      const a=actual.children[i],b=expected.children[i];assert.deepEqual(a.userData,b.userData);
      assert.deepEqual(a.geometry.index.array,b.geometry.index.array);
      assert.deepEqual(Object.keys(a.geometry.attributes),Object.keys(b.geometry.attributes));
      for(const key of Object.keys(a.geometry.attributes))assert.deepEqual(a.geometry.attributes[key].array,b.geometry.attributes[key].array);
      for(const key of ['type','roughness','metalness','transparent','opacity','side','vertexColors','depthWrite'])assert.equal(a.material[key],b.material[key]);
      assert.equal(a.material.color.getHexString(),b.material.color.getHexString());
      assert.equal(a.material.customProgramCacheKey(),b.material.customProgramCacheKey());
    }
  }finally{for(const root of [actual,expected])root.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});}
});

function fakePage(){
  const stage={dataset:{}},fallback={},hint={firstChild:{}},retry={},controls=[{},{}];
  const canvas={closest:()=>stage,setAttribute(){},dispatchEvent(){},addEventListener(){},removeEventListener(){}};
  const originalDocument=global.document,originalRAF=global.requestAnimationFrame;
  global.document={querySelector:selector=>({'#planet-fallback':fallback,'#planet-hint':hint,'#retry-planet':retry})[selector],querySelectorAll:()=>controls};
  global.requestAnimationFrame=callback=>setTimeout(callback,0);
  return {canvas,stage,restore(){global.document=originalDocument;global.requestAnimationFrame=originalRAF;}};
}
const nextTurn=()=>new Promise(resolve=>setTimeout(resolve,5));

test('An asynchronously mounted scene adopts the latest panel and selection state',async()=>{
  const {createPlanetLoader}=await import('../web/planet-loader.js'),page=fakePage();
  let finish,began=false;const calls=[];
  const instance={failed:false,pause:v=>calls.push(['pause',v]),setEditing:v=>calls.push(['editing',v]),setInspection:v=>calls.push(['inspection',v]),setComponents:v=>calls.push(['selection',v]),destroy:()=>calls.push(['destroy'])};
  const loader=createPlanetLoader({canvas:page.canvas,selection:['boat'],load:async()=>({mountPlanet:()=>{began=true;return new Promise(resolve=>finish=resolve);}})});
  try{
    const loading=loader.start();while(!began)await nextTurn();
    loader.pause(true);loader.setEditing(true);loader.setInspection(true);loader.setComponents(['cafe']);
    finish(instance);await loading;
    assert.equal(page.stage.dataset.state,'ready');
    assert.deepEqual(calls,[['selection',['cafe']],['pause',true],['editing',true],['inspection',true]]);
  }finally{loader.destroy();page.restore();}
});

test('Destroying a loader during asynchronous construction releases its late scene without announcing readiness',async()=>{
  const {createPlanetLoader}=await import('../web/planet-loader.js'),page=fakePage();
  let finish,began=false,destroyed=0;
  const loader=createPlanetLoader({canvas:page.canvas,selection:[],load:async()=>({mountPlanet:()=>{began=true;return new Promise(resolve=>finish=resolve);}})});
  try{
    const loading=loader.start();while(!began)await nextTurn();loader.destroy();
    finish({failed:false,destroy:()=>destroyed++});await loading;
    assert.equal(destroyed,1);assert.notEqual(page.stage.dataset.state,'ready');
  }finally{page.restore();}
});
