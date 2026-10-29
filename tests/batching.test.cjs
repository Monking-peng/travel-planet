const {test}=require('node:test'),assert=require('node:assert/strict');

test('Shared indexed geometry keeps the exact library welding result, including unused pole vertices and seam normals',async()=>{
  const {Group,Mesh,SphereGeometry,MeshStandardMaterial,Float32BufferAttribute,Matrix4}=await import('three'),{mergeVertices}=await import('three/addons/utils/BufferGeometryUtils.js'),{consolidate}=await import('../web/planet-scene.js');
  const geometry=new SphereGeometry(1,64,32),reference=geometry.clone().applyMatrix4(new Matrix4());reference.deleteAttribute('uv');
  reference.setAttribute('color',new Float32BufferAttribute(new Float32Array(reference.attributes.position.count*3).fill(1),3));
  const expected=mergeVertices(reference,1e-5),root=new Group();root.add(new Mesh(geometry,new MeshStandardMaterial()));consolidate(root);
  const actual=root.children[0].geometry;
  for(const name of ['position','normal'])assert.deepEqual(actual.attributes[name].array,expected.attributes[name].array);
  assert.deepEqual(actual.index.array,expected.index.array);assert.ok([...actual.attributes.color.array].every(v=>v===255));
  actual.dispose();root.children[0].material.dispose();reference.dispose();expected.dispose();
});

test('Opaque colour batching preserves transformed colours, surfaces and selectable identities',async()=>{
  const {Group,Mesh,BoxGeometry,MeshStandardMaterial,Float32BufferAttribute}=await import('three'),{consolidate}=await import('../web/planet-scene.js');
  const root=new Group(),a=new Group(),b=new Group();a.userData={componentId:'cafe',placeId:'shop'};b.userData={componentId:'boat'};root.add(a,b);
  const expected=[];
  for(const [i,color] of ['#914a35','#4e897a'].entries()){
    const material=new MeshStandardMaterial({color,roughness:.78}),mesh=new Mesh(new BoxGeometry(1,1,1),material);mesh.position.x=i*2;mesh.castShadow=true;mesh.receiveShadow=true;a.add(mesh);expected.push(material.color.clone());
  }
  const tinted=new MeshStandardMaterial({color:'#99bb88',roughness:.78,vertexColors:true}),geometry=new BoxGeometry(1,1,1),colors=new Float32Array(geometry.attributes.position.count*3);colors.fill(.5);geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
  const foliage=new Mesh(geometry,tinted);foliage.position.x=4;foliage.castShadow=true;foliage.receiveShadow=true;a.add(foliage);expected.push(tinted.color.clone().multiplyScalar(.5));
  const separate=new Mesh(new BoxGeometry(1,1,1),new MeshStandardMaterial({color:'#914a35',roughness:.78}));separate.castShadow=true;separate.receiveShadow=true;b.add(separate);
  consolidate(root);assert.equal(root.children.length,2);
  const merged=root.children.find(m=>m.userData.componentId==='cafe');assert.equal(merged.userData.placeId,'shop');assert.equal(merged.geometry.index.count,108);assert.ok(merged.castShadow&&merged.receiveShadow);
  const pos=merged.geometry.attributes.position,c=merged.geometry.attributes.color;
  for(let i=0;i<pos.count;i++){
    const color=expected[Math.round(pos.getX(i)/2)];assert.ok(color);
    for(const [j,key] of ['r','g','b'].entries())assert.ok(Math.abs(c.getComponent(i,j)*merged.material.color[key]-color[key])<=1/255);
  }
  root.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});
});

test('Batching keeps shading, opacity, shadow and depth differences separate',async()=>{
  const {Group,Mesh,BoxGeometry,MeshStandardMaterial}=await import('three'),{consolidate}=await import('../web/planet-scene.js');
  const root=new Group(),materials=[{}, {roughness:.2}, {metalness:.5}, {emissive:'#d68f40'}, {flatShading:true}, {depthTest:false}, {transparent:true,opacity:.2}].map(x=>new MeshStandardMaterial({color:'#d5bf99',roughness:.8,...x}));
  for(const m of materials)root.add(new Mesh(new BoxGeometry(1,1,1),m));
  const shadow=new Mesh(new BoxGeometry(1,1,1),materials[0].clone());shadow.castShadow=true;root.add(shadow);
  consolidate(root);assert.equal(root.children.length,8);assert.ok(root.children.some(m=>m.material.transparent));assert.ok(root.children.some(m=>m.castShadow));assert.ok(root.children.some(m=>!m.material.depthTest));
  root.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});
});
