const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Xiamen sea faces stay above the globe and the suspension bridge keeps a clear span',async()=>{
 const T=await import('three'),{createXiamenScene,RADIUS}=await import('../web/xiamen-scene.js'),{makeKit}=await import('../web/wuhan-kit.js'),{haicang}=await import('../web/xiamen-modern.js');const s=createXiamenScene(),k=makeKit({time:{value:0},night:{value:0}}),bridge=haicang(k);bridge.updateMatrixWorld(true);
 try{
  const bay=s.root.getObjectByName('xiamen-bay').geometry,positions=bay.attributes.position,indices=bay.index;
  for(let i=0;i<indices.count;i+=3){const center=new T.Vector3();for(let j=0;j<3;j++)center.add(new T.Vector3().fromBufferAttribute(positions,indices.getX(i+j)));center.multiplyScalar(1/3);assert.ok(center.length()>RADIUS+.003,'Sea triangles must not cut below the globe');}
  const pylons=[];bridge.traverse(o=>{if(o.material?.userData.haicangPylons)pylons.push(o);});let ray=new T.Raycaster(new T.Vector3(0,.35,.5),new T.Vector3(0,0,-1),0,1);assert.equal(ray.intersectObjects(pylons).length,0,'Main span remains open');ray.ray.origin.x=.32;assert.ok(ray.intersectObjects(pylons).length>0,'The tower legs remain substantial');
 }finally{s.dispose();bridge.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
test('Xiamen landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createXiamenScene,RADIUS}=await import('../web/xiamen-scene.js'),s=createXiamenScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});
test('Xiamen module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createXiamenScene}=await import('../web/xiamen-scene.js'),s=createXiamenScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});

test('Bagua House has deep open front and side porticoes and genuine arched drum openings',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{bagua}=await import('../web/xiamen-bagua.js'),k=makeKit({time:{value:0},night:{value:0}}),g=bagua(k);g.updateMatrixWorld(true);const masonry=[];g.traverse(o=>{if(o.material?.userData.baguaMasonry)masonry.push(o);});
 const hits=(origin,dir,far)=>new T.Raycaster(new T.Vector3(...origin),new T.Vector3(...dir),0,far).intersectObjects(masonry).length;
 try{assert.equal(hits([0,.16,.36],[0,0,-1],.12),0,'The front colonnade has real depth');assert.ok(hits([.0532,.16,.36],[0,0,-1],.12)>0,'Front columns remain substantial');assert.equal(hits([.46,.16,0],[-1,0,0],.12),0,'The side colonnade is also recessed');assert.ok(hits([.46,.16,.055],[-1,0,0],.12)>0);assert.equal(hits([0,.57,.16],[0,0,-1],.09),0,'The arched drum is not a painted solid cylinder');assert.ok(hits([.014,.57,.16],[0,0,-1],.09)>0,'Masonry survives between the drum windows');}
 finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Jiannan has an open two-storey portico, recessed return windows and a continuous central stair',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{jiannan}=await import('../web/xiamen-jiannan.js'),k=makeKit({time:{value:0},night:{value:0}}),g=jiannan(k);g.updateMatrixWorld(true);
 try{
  const ray=(p,d,far)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,far).intersectObject(g,true);
  assert.equal(ray([0,.28,.26],[0,0,-1],.16).length,0,'The entrance porch must stay open in front of the recessed rear wall');
  assert.ok(ray([.08,.28,.26],[0,0,-1],.1).length>0,'The porch must still have solid columns');
  for(const [p,d,min]of [[[.395,.297,.18],[0,0,-1],.050],[[.40,.295,-.36],[-1,0,0],.056],[[.01,.265,-.70],[0,0,1],.070]]){const hit=ray(p,d,.13)[0];assert.ok(hit&&hit.distance>min&&!hit.object.material.userData.jiannanStone,'A solid building core must not cover recessed front, side or back windows');}
  for(const x of [.022,.37]){let last=.027;for(let z=.619;z>.28;z-=.002){const hit=ray([x,.18,z],[0,-1,0],.18)[0];assert.ok(hit,'The stone stair must have continuous support');assert.ok(Math.abs(hit.point.y-last)<.014,'Stair risers must meet the raised landing without an abrupt jump');last=hit.point.y;}assert.ok(last>.14);}
  const landing=ray([.50,.18,.31],[0,-1,0],.06);const top=landing[0],under=landing.find(h=>h.object.material!==top.object.material);assert.ok(top&&under&&Math.abs(top.point.y-under.point.y)>.0015,'The paving and podium must not occupy the same plane and flicker');
  for(const z of [-.29,-.45,-.61])assert.ok(ray([0,.8,z],[0,-1,0],.3).length>0,'The rear auditorium must have a continuous roof volume beyond the shallow front building');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Nanxun keeps the uninstalled-clock opening and wind pavilion genuinely open and both wings grounded',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{jimei}=await import('../web/xiamen-nanxun.js'),k=makeKit({time:{value:0},night:{value:0}}),g=jimei(k);g.updateMatrixWorld(true);
 try{
  const ray=(p,d,far)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,far).intersectObject(g,true);
  const cy=.055+.735+.145*.53;
  assert.equal(ray([0,cy,.02],[0,0,-1],.09).length,0,'The round opening is not a painted clock or a glass circle on a solid wall');
  assert.ok(ray([.030,cy,.02],[0,0,-1],.09).length>0,'Stone must remain beside the round opening');
  assert.equal(ray([0,1.05,.05],[0,0,-1],.28).length,0,'The top wind pavilion is open from front to back');
  assert.ok(ray([.050,1.05,.05],[0,0,-1],.28).length>0,'The pavilion still has structural corner posts');
  const pane=ray([0,.055+.43+.16/6,.05],[0,0,-1],.2)[0];assert.ok(pane&&!pane.object.material.userData.nanxunStone,'Upper windows are recessed rather than painted onto a solid core');
  for(const side of [-1,1]){const a=side*Math.PI/6,origin=new T.Vector3(side*.305,.075,-.30).add(new T.Vector3(Math.sin(a)*.14,0,Math.cos(a)*.14)),direction=new T.Vector3(-Math.sin(a),0,-Math.cos(a));const hit=new T.Raycaster(origin,direction,0,.15).intersectObject(g,true);assert.ok(hit.length,'Raised wings need a solid plinth instead of floating over the terrace');}
  for(const x of [-.12,.12])assert.equal(ray([x,.075,.37],[0,0,-1],.20).length,0,'Water between the detached pavilions remains open');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Nanputuo stone porticoes are recessed and the uphill stair meets the octagonal podium without a jump',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{putuo}=await import('../web/xiamen-putuo.js'),k=makeKit({time:{value:0},night:{value:0}}),g=putuo(k);g.updateMatrixWorld(true);
 try{
  const ray=(p,d,far)=>new T.Raycaster(new T.Vector3(...p),new T.Vector3(...d),0,far).intersectObject(g,true);
  assert.equal(ray([0,.20,.1125],[0,0,-1],.08).length,0,'The main-hall portico must have depth in front of the door wall');
  assert.ok(ray([.045,.20,.1125],[0,0,-1],.08).length>0,'The front stone columns remain solid');
  assert.equal(ray([0,.25,-.26],[0,0,-1],.065).length,0,'The octagonal hall has an open outer porch');
  assert.ok(ray([.07156,.25,-.26],[0,0,-1],.065).length>0,'The octagonal porch still has stone posts');
  let last=.034;
  for(let z=-.200;z>-.305;z-=.002){const hit=ray([.024,.24,z*.90],[0,-1,0],.24)[0];assert.ok(hit,'The stair cannot float over a gap');assert.ok(hit.point.y>=last-.001&&hit.point.y-last<.012,'The stair must ascend continuously into the podium');last=hit.point.y;}
  assert.ok(last>.179,'The stairs must reach the hall terrace');
  assert.equal(ray([0,.08,.675],[0,-1,0],.06)[0]?.object.material.userData.water,true,'The foreground pond stays open rather than being covered by a building platform');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
