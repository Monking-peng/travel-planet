const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Sanya landmarks occupy both hemispheres with clear ground margins and finite surfaces',async()=>{
 const T=await import('three'),{createSanyaScene,RADIUS}=await import('../web/sanya-scene.js'),s=createSanyaScene();s.root.updateMatrixWorld(true);
 try{const caps=[];for(const [id,g]of s.landmarks){const normal=g.position.clone().normalize();let radius=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);assert.ok(p.length()>RADIUS-.002,`${id} sinks below the sphere`);radius=Math.max(radius,normal.angleTo(p));}for(const key of ['position','normal'])for(const v of m.geometry.attributes[key].array)assert.ok(Number.isFinite(v));});caps.push({id,normal,radius});}
 assert.equal(caps.length,8);assert.equal(caps.filter(x=>x.normal.y<0).length,4);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j];assert.ok(a.normal.angleTo(b.normal)-a.radius-b.radius>.045,`${a.id}/${b.id} touch`);}
 }finally{s.dispose();}
});

test('Sanya module lighting preserves daylight materials, honors reduced motion and disposes removed modules once',async()=>{
 const {createSanyaScene}=await import('../web/sanya-scene.js'),s=createSanyaScene(),modules=new Map(s.landmarks),colors=new Map(),geos=new Set(),pulse=[];
 s.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.userData.landmark&&o.material?.color&&!o.material.userData.landscape){colors.set(o.material,o.material.color.clone());if(o.material.userData.pulse&&!pulse.includes(o.material))pulse.push(o.material);}});
 s.setNight(true);colors.forEach((c,m)=>assert.ok(c.equals(m.color)));assert.ok(pulse.length>0);s.update(1,false);const a=pulse.map(m=>m.emissiveIntensity);s.update(6,false);assert.ok(pulse.some((m,i)=>a[i]!==m.emissiveIntensity));s.update(9,true);const b=pulse.map(m=>m.emissiveIntensity);s.update(99,true);assert.deepEqual(pulse.map(m=>m.emissiveIntensity),b);
 for(const [id,g]of modules){const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);});assert.ok(lights.length&&lights.every(l=>l.intensity>0));assert.equal(s.setLandmarkEnabled(id,false),true);assert.equal(g.parent,null);assert.equal(s.setLandmarkEnabled(id,true),true);assert.equal(s.landmarks.get(id),g);}
 s.setNight(false);s.root.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});let disposed=0;geos.forEach(g=>g.addEventListener('dispose',()=>disposed++));for(const id of modules.keys())s.setLandmarkEnabled(id,false);s.dispose();s.dispose();assert.equal(disposed,geos.size);
});


test('Sanya preserves five distinct waterfront towers and a suspended walkway above the valley',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{createLandmark}=await import('../web/sanya-landmarks.js');const k=makeKit({time:{value:0},night:{value:0}}),models=[];
 try{
  const towers=createLandmark(k,'phoenix');models.push(towers);const ids=new Set();towers.traverse(o=>{if(Number.isInteger(o.material?.userData.phoenixTower))ids.add(o.material.userData.phoenixTower);});assert.equal(ids.size,5,'Five independent curved towers must remain present');
  const bridge=createLandmark(k,'dragon');models.push(bridge);bridge.updateMatrixWorld(true);let deck;bridge.traverse(o=>{if(o.material?.userData.suspensionDeck)deck=o;});assert.ok(deck);const a=deck.geometry.attributes.position;let middle=0,ends=0;for(let i=0;i<a.count;i++){const x=Math.abs(a.getX(i)),y=a.getY(i);if(x<.04)middle=Math.max(middle,y);if(x>.48)ends=Math.max(ends,y);}assert.ok(ends-middle>.09,'The deck must sag between the anchors');
  const below=new T.Raycaster(new T.Vector3(0,.24,-.01),new T.Vector3(0,-1,0));const hits=below.intersectObject(bridge,true);assert.ok(hits.length&&hits[0].point.y<.13,'A visible open valley must remain underneath the deck');
  const slopes=[];bridge.traverse(o=>{if(o.isMesh&&o.material?.userData.landscape)slopes.push(o);});for(const [x,y,z]of [[-.56,.385,.015],[.56,.420,-.040]]){const ground=new T.Raycaster(new T.Vector3(x,y+.04,z),new T.Vector3(0,-1,0)).intersectObjects(slopes);assert.ok(ground.length&&Math.abs(ground[0].point.y-y)<.06,'Both anchors must meet a real hill rather than float above it');}
 }finally{models.forEach(g=>g.traverse(o=>o.geometry?.dispose()));k.materials.forEach(m=>m.dispose());}
});

test('Phoenix Island has separated broad towers and stable facade coordinates through batching and motion changes',async()=>{
 const T=await import('three'),{createSanyaScene}=await import('../web/sanya-scene.js'),s=createSanyaScene(),g=s.landmarks.get('phoenix');
 try{const towers=g.children.filter(o=>Number.isInteger(o.material?.userData.phoenixTower)),lights=g.children.filter(o=>Number.isInteger(o.material?.userData.phoenixLight));assert.equal(towers.length,5);assert.equal(lights.length,5);
 const boxes=towers.map(m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox;});for(const b of boxes){const size=b.getSize(new T.Vector3());assert.ok(size.y/Math.max(size.x,size.z)<3.1&&size.y/Math.max(size.x,size.z)>2.4,'Tower must have a broad curved profile instead of a narrow capsule');}
 for(let i=1;i<boxes.length;i++)assert.ok(boxes[i].min.x-boxes[i-1].max.x>.02,'Separate tower shells must leave room for their projecting side ribs');
 for(const m of lights){const a=m.geometry.attributes.facadeUV;assert.equal(a.count,m.geometry.attributes.position.count);const levels=new Set();for(let i=0;i<a.count;i++){assert.ok(a.getX(i)>=0&&a.getX(i)<=1);assert.ok(a.getY(i)>=0&&a.getY(i)<=1);levels.add(a.getY(i));}assert.ok(levels.size>25,'Merged light bands retain distinct local floor heights');}
 s.setNight(true);s.update(7,false);lights.forEach(m=>assert.equal(m.material.userData.facadeTime.value,7));s.update(13,false);lights.forEach(m=>assert.equal(m.material.userData.facadeTime.value,13));s.update(16,true);s.update(99,true);lights.forEach(m=>assert.equal(m.material.userData.facadeTime.value,0));
 s.setLandmarkEnabled('phoenix',false);s.setLandmarkEnabled('phoenix',true);assert.equal(s.landmarks.get('phoenix'),g);s.setNight(false);lights.forEach(m=>assert.equal(m.material.emissiveIntensity,0));
 }finally{s.dispose();}
});

test('Atlantis retains a continuous curved tower, attached balcony floors and a connected entrance',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{atlantis,atlantisFront,atlantisBack,atlantisTop}=await import('../web/sanya-atlantis.js'),k=makeKit({time:{value:0},night:{value:0}}),g=atlantis(k);g.updateMatrixWorld(true);const all=[],body=[],balconies=[],walk=[],crowns=[];g.traverse(o=>{if(!o.isMesh)return;all.push(o);if(o.material.userData.atlantisFin)body.push(o);if(o.material.userData.atlantisBalcony)balconies.push(o);if(o.material.userData.atlantisWalk)walk.push(o);if(o.material.userData.atlantisCrown)crowns.push(o);});const ray=(x,y,z,d,list)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(...d),0,3).intersectObjects(list,false);
 try{
 for(const x of [-.25,-.1,0,.1,.25])for(const y of [.16,.5,.94]){
  for(const [fn,dir]of [[atlantisFront,-1],[atlantisBack,1]]){const hits=ray(x,y,dir<0?1:-1,[0,0,dir],body);assert.ok(hits.some(hit=>Math.abs(hit.point.z-fn(x))<.012),'Front and rear glass must follow the actual facade rather than leave a blank offset wall');}
 }
 for(const x of [-.25,0,.25])for(const level of [5,18,32,42])for(const [fn,side]of [[atlantisFront,1],[atlantisBack,-1]]){const y=.05+level*.0245,hit=ray(x,y+.012,fn(x)+side*.010,[0,-1,0],balconies)[0];assert.ok(hit&&Math.abs(hit.point.y-y)<.003,'Occupied levels must have attached projecting balcony floors');}
 for(const x of [-.05,0,.05])for(let i=0;i<=24;i++){const z=.42+i*.11/24,hit=ray(x,.1,z,[0,-1,0],walk)[0];assert.ok(hit&&Math.abs(hit.point.y-.030)<.003,'Lobby entrance must have a continuous paved approach');}
 assert.ok(atlantisTop(-.205)>atlantisTop(.205)+.05&&atlantisTop(0)<atlantisTop(.205)-.15,'Two fins need unequal crests with a visible saddle');
 for(const x of [-.26,.27]){const hit=ray(x,.2,.20,[0,-1,0],all)[0];assert.ok(hit&&hit.point.y<.08,'Low spiral wings keep their courtyard openings');}
 for(const x of [-.205,.205])assert.ok(ray(x,atlantisTop(x)-.04,1,[0,0,-1],crowns).length,'Each fin crest has real crown ribs above the occupied floors');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('CDF phase-one mall keeps four skylights, two connected canopies and an open central courtyard',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{dutyfree,cdfCanopy}=await import('../web/sanya-dutyfree.js'),k=makeKit({time:{value:0},night:{value:0}}),g=dutyfree(k);g.updateMatrixWorld(true);const all=[],roof=[],dome=[],canopy=[],court=[];g.traverse(o=>{if(!o.isMesh)return;all.push(o);const d=o.material.userData;if(d.cdfRoof)roof.push(o);if(d.cdfDome)dome.push(o);if(d.cdfCanopy)canopy.push(o);if(d.cdfCourt)court.push(o);});const ray=(x,y,z,list)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,-1,0),0,2).intersectObjects(list,false);
 try{
 for(const x of [-.295,.295])for(const z of [-.17,.17]){const h=ray(x,.4,z,dome)[0];assert.ok(h&&h.point.y>.243,'Each hall retains two raised glazed skylights');}
 for(const side of [-1,1])for(const u of [0,1])for(const v of [.10,.5,.9]){const q=cdfCanopy(u,v,side),hit=ray(q[0],q[1]+.03,q[2],roof)[0];assert.ok(hit&&Math.abs(hit.point.y-q[1])<.008,'Canopy ends must meet the actual roof without hovering');}
 for(const side of [-1,1]){const q=cdfCanopy(.5,.5,side),h=ray(q[0],.5,q[2],canopy)[0];assert.ok(h&&h.point.y>.29,'Canopy must rise above the entrance rather than block it');}
 for(const x of [-.08,0,.08])for(const z of [-.06,0,.06]){assert.equal(ray(x,.5,z,roof.concat(canopy,dome)).length,0,'Central courtyard must remain open to the sky');const h=ray(x,.1,z,court)[0];assert.ok(h&&h.point.y>.018);}
 for(const x of [-.06,.06])for(let i=0;i<40;i++){const z=-.47+i/39*.94,h=ray(x,.10,z,court)[0];assert.ok(h&&h.point.y>.018&&h.point.y<.032,'Central pedestrian route stays continuous');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Lovers Bridge keeps a continuous beach approach, open sea spans and a usable pavilion floor',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{lovers}=await import('../web/sanya-lovers.js'),k=makeKit({time:{value:0},night:{value:0}}),g=lovers(k);g.updateMatrixWorld(true);const decks=[],piers=[],all=[];g.traverse(o=>{if(!o.isMesh)return;all.push(o);if(o.material.userData.loversDeck)decks.push(o);if(o.material.userData.loversPier)piers.push(o);});const cast=(x,y,z,d,objs)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(...d),0,2).intersectObjects(objs,false);
 try{
 for(const x of [-.05,0,.05]){let previous=null;for(let i=0;i<=240;i++){const z=.599-i*1.03/240,hit=cast(x,.30,z,[0,-1,0],decks)[0];assert.ok(hit,'Every part of the approach, bridge and pavilion needs a real supporting floor');assert.ok(hit.point.y>=.048&&hit.point.y<.16);if(previous!==null)assert.ok(Math.abs(hit.point.y-previous)<.021,'No oversized step or missing bridge-to-pavilion seam');previous=hit.point.y;}}
 for(const z of [-.30,-.12,.06,.24,.405]){const hit=cast(0,.2,z,[0,-1,0],piers)[0];assert.ok(hit&&hit.point.y>.139,'Masonry supports must reach the structural beams');}
 assert.equal(cast(0,.085,.16,[0,0,-1],piers).filter(h=>h.distance<.07).length,0,'Between piers there is an open sea span');
 for(const x of [-.05,0,.05])assert.equal(cast(x,.23,-.22,[0,0,-1],all).filter(h=>h.distance<.15).length,0,'Pavilion entry stays open above the walking surface');
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Dragon Bridge has supported landings, fine open nets and an unobstructed suspended walking route',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{dragon}=await import('../web/sanya-dragon.js'),k=makeKit({time:{value:0},night:{value:0}}),g=dragon(k);g.updateMatrixWorld(true);const decks=[],land=[],canopy=[],all=[];
 g.traverse(o=>{if(!o.isMesh)return;all.push(o);if(o.material.userData.suspensionDeck)decks.push(o);if(o.material.userData.dragonGround)land.push(o);if(o.material.userData.dragonCanopy)canopy.push(o);});
 const point=t=>[(-.50+t)*1.12,.385-.126*Math.sin(Math.PI*t)+t*.035,.015-.055*t],cast=(x,y,z,objects)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,-1,0),0,2).intersectObjects(objects,false);
 try{
 for(let i=0;i<76;i++){const q=point((i+.5)/76);for(const side of [-1,0,1]){const z=q[2]+side*.035,hit=cast(q[0],q[1]+.05,z,decks)[0];assert.ok(hit&&Math.abs(hit.point.y-q[1]-.003)<.001,'Every plank has a stable walking surface');const trees=cast(q[0],1,z,canopy);assert.ok(!trees.length||trees[0].point.y<q[1]-.015,'Canopy must not grow through the bridge');}}
 for(const t of [0,1]){const q=point(t);for(const side of [-1,0,1]){const hit=cast(q[0],.7,q[2]+side*.052,land)[0];assert.ok(hit&&Math.abs(hit.point.y-(q[1]-.007))<.013,'Each landing is supported across its width');}}
 for(const t of [.25,.5,.75]){const q=point(t),hit=cast(q[0],q[1]-.02,q[2],land)[0];assert.ok(hit&&q[1]-hit.point.y>.05,'The bridge spans a real valley');}
 for(const t of [.2,.4,.6,.8]){const q=point(t),hits=new T.Raycaster(new T.Vector3(q[0],q[1]+.04,q[2]-.040),new T.Vector3(0,0,1),0,.08).intersectObjects(all,false);assert.equal(hits.length,0,'No branch, railing or column blocks the walking lane');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Nanshan has a connected bridge and shore, a recessed entrance and a broad octagonal podium',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{nanshan}=await import('../web/sanya-nanshan.js'),k=makeKit({time:{value:0},night:{value:0}}),g=nanshan(k);g.updateMatrixWorld(true);const all=[],podium=[];g.traverse(o=>{if(o.isMesh)all.push(o);if(o.material?.userData.guanyinPodium)podium.push(o);});
 const ray=(x,y,z,d,objects=all)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(...d),0,2).intersectObjects(objects,false);
 try{
 for(const x of [-.030,0,.030]){let previous=null;for(let i=0;i<=240;i++){const z=.514-i*.382/240,hit=ray(x,.115,z,[0,-1,0])[0];assert.ok(hit&&hit.point.y>.034&&hit.point.y<.09,'Continuous shore, stair, deck and doorway threshold');if(previous!==null)assert.ok(Math.abs(hit.point.y-previous)<.014,'Approach has no oversized step or gap');previous=hit.point.y;}}
 for(const x of [-.025,0,.025]){const hit=ray(x,.105,.20,[0,0,-1])[0];assert.ok(hit&&hit.point.z<.14,'The main entrance must recess inside the sloped front wall');}
 for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const d=[-Math.sin(angle),0,-Math.cos(angle)],hit=ray(Math.sin(angle)*.4,.090,-.12+Math.cos(angle)*.4,d,podium)[0];assert.ok(hit&&Math.hypot(hit.point.x,hit.point.z+.12)>.24,'Podium walls retain their broad faceted footprint');}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});

test('Tianya inscriptions follow the actual rock surface and the two broad boulders leave a clear sandy approach',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{tianya}=await import('../web/sanya-tianya.js');
 const old=global.document,drawn=[];
 global.document={createElement(){
  return {width:0,height:0,getContext(){
   return {clearRect(){},fillText(text,x,y){drawn.push({text,x,y});}};
  }};
 }};
 const k=makeKit({time:{value:0},night:{value:0}});let g;
 try{
  g=tianya(k);g.updateMatrixWorld(true);const rocks=[],labels=[];g.traverse(o=>{if(o.material?.userData.coastalGranite)rocks.push(o);if(o.material?.userData.rockInscription)labels.push(o);});
  assert.equal(labels.length,3);assert.ok(drawn.some(x=>x.text==='涯')&&drawn.some(x=>x.text==='角'));
  for(const label of labels){const a=label.geometry.attributes.position;for(let i=0;i<a.count;i+=19){const p=new T.Vector3().fromBufferAttribute(a,i);const hit=new T.Raycaster(p.clone().add(new T.Vector3(0,0,.005)),new T.Vector3(0,0,-1),0,.02).intersectObjects(rocks,false)[0];assert.ok(hit&&Math.abs(p.z-hit.point.z)<.001,'Inscription must hug the carved face, not float as a rectangular sign');}}
  for(const id of ['tianya','haijiao']){const rock=rocks.find(o=>o.material.userData.coastalGranite===id);rock.geometry.computeBoundingBox();const b=rock.geometry.boundingBox,size=b.getSize(new T.Vector3());assert.ok(size.x>size.y*1.2,'Named stones are broad granite masses, not slender columns');assert.ok(b.min.y<.04,'Granite reaches the sand');const colors=rock.geometry.attributes.color;let min=1,max=0;for(let i=0;i<colors.count;i++){const v=colors.getX(i);min=Math.min(min,v);max=Math.max(max,v);}assert.ok(max-min>.14,'Weathered upper surfaces and pale base must remain distinct');}
  for(const x of [-.45,-.2,0,.2,.45]){const hit=new T.Raycaster(new T.Vector3(x,.09,.25),new T.Vector3(0,-1,0),0,.15).intersectObject(g,true)[0];assert.ok(hit&&hit.point.y>.015&&hit.point.y<.05,'Visitors have a continuous sandy approach in front of the rocks');}
 }finally{global.document=old;g?.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>{m.map?.dispose();m.dispose();});}
});

test('Luhuitou keeps an open neck aperture, two sculpted sides and a continuous grounded stair flight',async()=>{
 const T=await import('three'),{makeKit}=await import('../web/wuhan-kit.js'),{luhuitou}=await import('../web/sanya-luhuitou.js'),k=makeKit({time:{value:0},night:{value:0}}),g=luhuitou(k);g.updateMatrixWorld(true);
 const core=[];g.traverse(o=>{if(o.isMesh&&o.material.userData.deerCarving)core.push(o);});const ray=(x,y,z,d,far=2)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(...d),0,far).intersectObject(g,true);
 try{
  for(const x of [.160,.167,.174])for(const y of [.780,.787,.794])assert.equal(ray(x,y,.3,[0,0,-1],.6).length,0,'The neck opening remains a real tunnel from both sides');
  for(const x of [-.170,-.150]){const front=ray(x,.55,.4,[0,0,-1])[0],back=ray(x,.55,-.4,[0,0,1])[0];const frontStone=new T.Raycaster(new T.Vector3(x,.55,.4),new T.Vector3(0,0,-1)).intersectObjects(core)[0],backStone=new T.Raycaster(new T.Vector3(x,.55,-.4),new T.Vector3(0,0,1)).intersectObjects(core)[0];assert.ok(front&&back&&frontStone&&backStone&&front.point.z-frontStone.point.z>.035&&backStone.point.z-back.point.z>.035,'Figures project beyond both actual stone faces');}
  for(const x of [-.15,0,.15]){let previous=null;for(let i=0;i<=220;i++){const z=.49-i*.29/220,hit=ray(x,.21,z,[0,-1,0])[0];assert.ok(hit&&hit.point.y>.02&&hit.point.y<.16,'Stair and court form a continuous approach');if(previous!==null)assert.ok(Math.abs(previous-hit.point.y)<.016,'No unsupported drop between stair treads');previous=hit.point.y;}}
 }finally{g.traverse(o=>o.geometry?.dispose());k.materials.forEach(m=>m.dispose());}
});
