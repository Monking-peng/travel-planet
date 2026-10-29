const test=require('node:test'),assert=require('node:assert/strict');

test('Picking uses the nearest surface and never reaches a landmark through the globe or an unlabelled foreground object',async()=>{
  const {Group,Mesh,SphereGeometry,BoxGeometry,MeshBasicMaterial,PerspectiveCamera}=await import('three'),{createPlanetPicker}=await import('../web/planet-picking.js');
  const root=new Group(),globe=new Mesh(new SphereGeometry(1,24,16),new MeshBasicMaterial());root.add(globe);
  const landmark=new Group(),building=new Mesh(new BoxGeometry(.5,.5,.5),new MeshBasicMaterial());landmark.userData={componentId:'pagoda',placeId:'leifeng'};landmark.add(building);root.add(landmark);
  const camera=new PerspectiveCamera(45,1,.1,100);camera.position.set(0,0,5);camera.lookAt(0,0,0);const pick=createPlanetPicker(root,camera);
  landmark.position.z=-1.2;assert.equal(pick(100,100,200,200),null);
  landmark.position.z=1.2;assert.deepEqual(pick(100,100,200,200),{componentId:'pagoda',placeId:'leifeng'});
  const foreground=new Mesh(new BoxGeometry(.8,.8,.1),new MeshBasicMaterial());foreground.position.z=2;root.add(foreground);assert.equal(pick(100,100,200,200),null);
  root.remove(foreground,landmark);assert.equal(pick(100,100,200,200),null);
  for(const o of [globe,building,foreground]){o.geometry.dispose();o.material.dispose();}
});

test('Decorative pieces remain inspectable without inventing a real place, and canvas bounds cannot pick an offscreen object',async()=>{
  const {Group,Mesh,BoxGeometry,MeshBasicMaterial,PerspectiveCamera}=await import('three'),{createPlanetPicker}=await import('../web/planet-picking.js');
  const root=new Group(),piece=new Mesh(new BoxGeometry(1,1,1),new MeshBasicMaterial());piece.userData.componentId='cafe';root.add(piece);
  const camera=new PerspectiveCamera(45,1,.1,100);camera.position.z=4;camera.lookAt(0,0,0);const pick=createPlanetPicker(root,camera);
  assert.deepEqual(pick(50,50,100,100),{componentId:'cafe',placeId:''});
  for(const args of [[-1,50,100,100],[50,101,100,100],[50,50,0,100]])assert.equal(pick(...args),null);
  root.rotation.y=.4;root.position.x=2;assert.equal(pick(50,50,100,100),null);
  piece.geometry.dispose();piece.material.dispose();
});
