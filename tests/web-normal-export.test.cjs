const {test}=require('node:test'),assert=require('node:assert/strict');

test('Packed web normals round trip without changing positions, topology or vertex colors',async()=>{
  const THREE=await import('three'),{packWebNormals}=await import('../tools/pack-web-normals.mjs');
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
  const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
  globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();});}};
  const geometry=new THREE.SphereGeometry(1,12,8),source=geometry.clone();
  const colors=new Uint8Array(geometry.attributes.position.count*3).map((_,i)=>i%256);
  geometry.setAttribute('color',new THREE.Uint8BufferAttribute(colors,3,true));
  const root=new THREE.Group();root.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true})));
  packWebNormals(root);
  const data=await new GLTFExporter().parseAsync(root,{binary:true});
  const length=new DataView(data).getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(data,20,length)));
  assert.ok(json.extensionsRequired.includes('KHR_mesh_quantization'));
  const loaded=await new GLTFLoader().parseAsync(data,''),objects=[];loaded.scene.traverse(o=>{if(o.isMesh)objects.push(o);});
  assert.equal(objects.length,1);const restored=objects[0].geometry;
  assert.deepEqual(restored.attributes.position.array,source.attributes.position.array);
  assert.deepEqual(restored.index.array,source.index.array);
  for(let i=0;i<colors.length;i++)assert.equal(restored.attributes.color.getComponent(Math.floor(i/3),i%3),colors[i]/255);
  const normal=restored.attributes.normal;assert.ok(normal.normalized);assert.ok(normal.array instanceof Int16Array);
  for(let i=0;i<normal.count;i++)for(let j=0;j<3;j++)assert.ok(Math.abs(normal.getComponent(i,j)-source.attributes.normal.getComponent(i,j))<=1/32767);
  geometry.dispose();source.dispose();objects[0].geometry.dispose();root.children[0].material.dispose();objects[0].material.dispose();
});
