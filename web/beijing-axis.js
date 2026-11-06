import * as THREE from 'three';

// Compressed city connections, not navigable real streets.
export function createBeijingAxis(k,{radius,landmarks}){
  const g=new THREE.Group();g.name='beijing-axis-landscape';
  const stone=k.mat('#c2c2b5',.98,0),edge=k.mat('#929a8b',.98,0),asphalt=k.mat('#727e78',.99,0),mark=k.mat('#d3cdb5',.94,0),pole=k.mat('#485b52',.88,0),lamp=k.mat('#ead8b3',.5,.1,'#f4d29b');lamp.userData.night.intensity=.65;
  const bark=k.mat('#6a6251',1,0),leaves=['#4a6850','#617953','#72845d'].map(c=>k.mat(c,1,0));
  const points=[],connections=[],roads=[];
  const local=(id,x,z)=>{const model=landmarks.get(id);model.updateWorldMatrix(true,true);return model.localToWorld(new THREE.Vector3(x,Math.sqrt(radius*radius-x*x-z*z)-radius,z)).normalize();};
  function ribbon(route,width,material,lift){
    const verts=[],ids=[];
    for(let i=0;i<route.length;i++){
      const p=route[i],t=route[Math.min(route.length-1,i+1)].clone().sub(route[Math.max(0,i-1)]).normalize(),across=new THREE.Vector3().crossVectors(t,p).normalize();
      for(const s of [-1,1])verts.push(...p.clone().multiplyScalar(radius).addScaledVector(across,s*width/2).normalize().multiplyScalar(radius+lift).toArray());
      if(i<route.length-1){const a=i*2;ids.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();material.side=THREE.DoubleSide;k.mesh(g,geo,material);
  }
  function link(a,b,width=.095,{road=false,trees=false,record=false}={}){
    const len=a.angleTo(b)*radius,steps=Math.max(16,Math.ceil(len/.025)),route=Array.from({length:steps+1},(_,i)=>a.clone().lerp(b,i/steps).normalize());
    ribbon(route,width,stone,.014);
    if(road){ribbon(route,width*.65,asphalt,.015);ribbon(route,.0023,mark,.016);}
    for(let i=2;i<steps-1;i++){
      const p=route[i],tangent=route[i+1].clone().sub(route[i-1]).normalize(),across=new THREE.Vector3().crossVectors(tangent,p).normalize();
      if(!road&&i%4===0){const bar=new THREE.Group();bar.position.copy(p).multiplyScalar(radius+.015);bar.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(across,p,new THREE.Vector3().crossVectors(across,p)));k.box(bar,width,.0008,.0012,edge);g.add(bar);}
      if(i%9===0)for(const sign of [-1,1]){
        const pos=p.clone().multiplyScalar(radius).addScaledVector(across,sign*width*.68).normalize(),item=new THREE.Group();item.position.copy(pos).multiplyScalar(radius+.013);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),pos);
        k.cyl(item,.002,.0026,.042,pole,0,.021,0,6);k.box(item,.008,.004,.008,lamp,0,.044,0);g.add(item);
      }
      if(trees&&i%7===0)for(const sign of [-1,1]){
        const pos=p.clone().multiplyScalar(radius).addScaledVector(across,sign*(width*.5+.070)).normalize(),tree=new THREE.Group();tree.position.copy(pos).multiplyScalar(radius+.008);tree.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),pos);
        k.cyl(tree,.003,.004,.040,bark,0,.020,0,6);const crown=k.mesh(tree,new THREE.IcosahedronGeometry(.030,1),leaves[i%3],0,.055,0);crown.scale.set(1,1.22,1);g.add(tree);
      }
    }
    const world=route.map(p=>p.clone().multiplyScalar(radius+.014).toArray());if(record)points.push(...world);else roads.push({width,road,points:world});return [world[0],world.at(-1)];
  }
  for(const [from,fx,fz,to,tx,tz] of [
    ['tiananmen',0,-.45,'palace',0,1.01],
    ['palace',0,-1.01,'jingshan',0,.56],
    ['jingshan',0,-.56,'drum',0,.40],
  ])connections.push({from,to,ends:link(local(from,fx,fz),local(to,tx,tz),.115,{record:true})});
  // Ring walks outside the palace moat connect its entrances and parks.
  for(const s of [-1,1]){
    const corners=[[0,1.04],[s*.72,1.04],[s*.72,-1.04],[0,-1.04]];
    for(let i=0;i<corners.length-1;i++)link(local('palace',...corners[i]),local('palace',...corners[i+1]),.085,{road:true,trees:i===1});
  }
  const chain=(anchors,width,options)=>{for(let i=0;i<anchors.length-1;i++)link(local(...anchors[i]),local(...anchors[i+1]),width,options);};
  // Chang'an frontage and side connections terminate at landmark edges.
  chain([['theatre',0,.52],['tiananmen',-.64,.47]],.15,{road:true,trees:true});
  chain([['tiananmen',-.64,.47],['tiananmen',.64,.47]],.15,{road:true});
  chain([['tiananmen',.64,.47],['heaven',-.47,.40]],.15,{road:true,trees:true});
  chain([['theatre',0,-.53],['palace',-.72,.56]],.095,{road:true,trees:true});
  chain([['palace',-.72,-.55],['beihai',.50,.33]],.095,{road:true,trees:true});
  chain([['heaven',-.47,-.40],['palace',.72,.57]],.095,{road:true,trees:true});
  chain([['palace',.72,-.54],['cctv',-.44,.27]],.095,{road:true,trees:true});
  chain([['beihai',0,-.39],['jingshan',-.56,.05]],.078,{trees:true});
  chain([['cctv',0,-.37],['jingshan',.56,.05]],.078,{trees:true});
  chain([['nest',.47,0],['watercube',-.40,.10]],.14,{road:true,trees:true});
  chain([['summer',.64,.10],['nest',-.54,.10]],.10,{trees:true});
  k.merge(g);g.userData={connections,points,roads};g.traverse(o=>{if(o.isMesh){o.castShadow=[pole,bark,...leaves].includes(o.material);o.receiveShadow=true;}});return g;
}
