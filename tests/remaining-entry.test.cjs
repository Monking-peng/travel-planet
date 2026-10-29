const test=require('node:test'),assert=require('node:assert/strict');
const walks=[{id:'gallery',x:0,start:.20,end:.353},{id:'courtyard',x:0,start:.17,end:.265},{id:'fountain',x:0,start:.183,end:.255},{id:'clockTower',x:0,start:.13,end:.23},{id:'camping',x:-.05,start:.16,end:.255}];
for(const walk of walks){
 test(walk.id+' approach reaches a walking surface at the curved path height',async()=>{
  const {createPlacedPiece,entryGeo}=await import('../web/planet-layout-scene.js'),{PLACEMENTS,normalAt,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const root=createPlacedPiece(walk.id);root.updateMatrixWorld(true);
  try{
   const p=PLACEMENTS.find(p=>p.id===walk.id),n=new Vector3(...normalAt(...entryGeo(p)));
   const visible=root.children.filter(o=>o.name!=='paved-path'&&o.name!=='curved-foundation');
   const hit=new Raycaster(n.clone().multiplyScalar(PLANET_RADIUS+.4),n.clone().negate()).intersectObjects(visible,true)[0];
   assert.ok(hit,'path ends before the visible entrance');const gap=hit.point.length()-(PLANET_RADIUS+.009);
   assert.ok(gap>=-.001&&gap<.012,'abrupt threshold above the road: '+gap);
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
 });
 test(walk.id+' walking surfaces descend continuously and tread feet touch ground',async()=>{
  const {createPlacedPiece}=await import('../web/planet-layout-scene.js'),{PLACEMENTS,PLANET_RADIUS}=await import('../web/planet-layout.js'),{Vector3,Raycaster}=await import('three');
  const root=createPlacedPiece(walk.id);root.updateMatrixWorld(true);
  try{
   const p=PLACEMENTS.find(p=>p.id===walk.id),inverse=root.matrixWorld.clone().invert(),direction=new Vector3(0,-1,0).transformDirection(root.matrixWorld);
   const visible=root.children.filter(o=>o.name!=='paved-path'&&o.name!=='curved-foundation');let previous=null;
   for(let z=walk.start;z<=walk.end;z+=.002){
    // Start below entrance canopies so the ray measures the walking surface.
    const origin=new Vector3(walk.x*p.scale,.10*p.scale,z*p.scale).applyMatrix4(root.matrixWorld),hit=new Raycaster(origin,direction).intersectObjects(visible,true)[0];
    assert.ok(hit,'walk opens at '+z);const y=hit.point.clone().applyMatrix4(inverse).y;
    if(previous!==null){assert.ok(y-previous<.001,'walk rises away from entrance at '+z);assert.ok(previous-y<.021,'excessive single drop at '+z+': '+(previous-y));}previous=y;
   }
   const steps=[];root.traverse(o=>{if(o.name===walk.id+'-entry-step'||o.name==='gallery-existing-step')steps.push(o);});
   assert.ok(steps.length>0,'entrance has no ground connection');
   for(const step of steps){
    const pos=step.geometry.attributes.position;let bottom=Infinity;
    for(let i=0;i<pos.count;i++)bottom=Math.min(bottom,pos.getY(i));
    for(let i=0;i<pos.count;i++)if(Math.abs(pos.getY(i)-bottom)<1e-7){
     const foot=new Vector3().fromBufferAttribute(pos,i).applyMatrix4(step.matrixWorld);
     assert.ok(foot.length()<=PLANET_RADIUS+.006,'step foot floats above ground');
    }
   }
  }finally{root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
 });
}
