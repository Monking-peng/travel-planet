import * as THREE from 'three';

// Compressed city connections, not navigable real streets. The ceremonial
// axis stays straight; rounded corners and garden links soften its outskirts.
export function createBeijingAxis(k,{radius,landmarks}){
  const g=new THREE.Group();g.name='beijing-axis-landscape';
  const stone=k.mat('#a9ada0',.98,0),edge=k.mat('#969d8e',.98,0),asphalt=k.mat('#7b837b',.99,0),mark=k.mat('#b9bba6',.98,0),pole=k.mat('#485b52',.88,0),lamp=k.mat('#d8c6a5',.6,.04,'#f4d29b');lamp.userData.night.intensity=.65;
  const bark=k.mat('#6d6551',1,0),leaves=['#4e694c','#59734e','#657c53','#708359'].map(c=>k.mat(c,1,0));
  const verge=k.mat('#ffffff',1,0);verge.vertexColors=true;verge.userData.terrainTint=true;
  const groundColor=new THREE.Color('#8f9c79'),shadeColor=new THREE.Color('#7c8d68');
  const points=[],connections=[],roads=[],routes=[],plantings=[];
  const random=n=>{const x=Math.sin(n*127.1+19.7)*43758.5453;return x-Math.floor(x);};
  const local=(id,x,z)=>{const model=landmarks.get(id);model.updateWorldMatrix(true,true);return model.localToWorld(new THREE.Vector3(x,Math.sqrt(radius*radius-x*x-z*z)-radius,z)).normalize();};
  const pose=(pos,lift=.010)=>{const group=new THREE.Group();group.position.copy(pos).multiplyScalar(radius+lift);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),pos);g.add(group);return group;};
  function ribbon(route,width,material,lift,offset=0){
    const verts=[],ids=[],colors=[],soft=material===verge;
    for(let i=0;i<route.length;i++){
      const p=route[i],t=route[Math.min(route.length-1,i+1)].clone().sub(route[Math.max(0,i-1)]).normalize(),across=new THREE.Vector3().crossVectors(t,p).normalize();
      const bands=soft?[-.5,-.37,.37,.5]:[-.5,.5];
      for(const s of bands){verts.push(...p.clone().multiplyScalar(radius).addScaledVector(across,s*width+offset).normalize().multiplyScalar(radius+lift).toArray());if(soft){const c=Math.abs(s)>.4?groundColor:shadeColor;colors.push(c.r,c.g,c.b);}}
      if(i<route.length-1)for(let j=0;j<bands.length-1;j++){const a=i*bands.length+j;ids.push(a,a+1,a+bands.length,a+1,a+bands.length+1,a+bands.length);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ids);if(soft)geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();material.side=THREE.DoubleSide;k.mesh(g,geo,material);
  }
  function routeBetween(a,b,bend=0){
    const steps=Math.max(16,Math.ceil(a.angleTo(b)*radius/.016)),across=new THREE.Vector3().crossVectors(a,b).normalize();
    return Array.from({length:steps+1},(_,i)=>{const t=i/steps;return a.clone().lerp(b,t).addScaledVector(across,Math.sin(t*Math.PI)**2*bend/radius).normalize();});
  }
  function addRoute(route,width,{road=false,trees=false,record=false,avenue=false}={}){
    // Uniform arc spacing keeps paving joints and vegetation independent of
    // how many control points a bend uses.
    const lengths=[0];for(let i=1;i<route.length;i++)lengths.push(lengths.at(-1)+route[i].angleTo(route[i-1])*radius);
    const total=lengths.at(-1),count=Math.max(2,Math.ceil(total/.016)),spaced=[];let segment=1;
    for(let i=0;i<=count;i++){const distance=i/count*total;while(segment<route.length-1&&lengths[segment]<distance)segment++;const f=(distance-lengths[segment-1])/Math.max(1e-8,lengths[segment]-lengths[segment-1]);spaced.push(route[segment-1].clone().lerp(route[segment],f).normalize());}route=spaced;
    const world=route.map(p=>p.clone().multiplyScalar(radius+.014).toArray());
    routes.push({route,width,road,trees,avenue});if(record)points.push(...world);else roads.push({width,road,points:world});return [world[0],world.at(-1)];
  }
  const link=(a,b,width=.09,options={})=>addRoute(routeBetween(a,b,options.bend||0),width,options);
  for(const [from,fx,fz,to,tx,tz] of [
    ['tiananmen',0,-.45,'palace',0,1.01],
    ['palace',0,-1.01,'jingshan',0,.56],
    ['jingshan',0,-.56,'drum',0,.40],
  ])connections.push({from,to,ends:link(local(from,fx,fz),local(to,tx,tz),.105,{record:true})});
  const ring=[],corners=[[-.72,1.04],[.72,1.04],[.72,-1.04],[-.72,-1.04]];
  for(let i=0;i<4;i++){
    const a=new THREE.Vector2(...corners[i]),prev=new THREE.Vector2(...corners[(i+3)%4]),next=new THREE.Vector2(...corners[(i+1)%4]);
    const start=a.clone().addScaledVector(prev.clone().sub(a).normalize(),.105),end=a.clone().addScaledVector(next.clone().sub(a).normalize(),.105);
    if(ring.length){const last=ring.at(-1);for(let j=1;j<18;j++)ring.push(last.clone().lerp(start,j/18));}
    ring.push(...new THREE.QuadraticBezierCurve(start,a,end).getPoints(18));
  }
  const last=ring.at(-1),first=ring[0];for(let j=1;j<=20;j++)ring.push(last.clone().lerp(first,j/20));
  addRoute(ring.map(p=>local('palace',p.x,p.y)),.078,{road:true,trees:true,avenue:true});
  const anchors=[['theatre',0,.52],['tiananmen',-.64,.47],['tiananmen',.64,.47],['heaven',-.47,.40]].map(p=>local(...p).multiplyScalar(radius));
  const frontage=new THREE.CatmullRomCurve3(anchors,false,'centripetal');addRoute(frontage.getSpacedPoints(190).map(p=>p.normalize()),.13,{road:true,trees:true,avenue:true});
  const joins=[
    [['theatre',0,-.53],['palace',-.72,.56],.082,.07,true],
    [['palace',-.72,-.55],['beihai',.50,.33],.082,-.065,true],
    [['heaven',-.47,-.40],['palace',.72,.57],.082,-.07,true],
    [['palace',.72,-.54],['cctv',-.44,.27],.082,.07,true],
    [['beihai',0,-.39],['jingshan',-.56,.05],.060,.085,false],
    [['cctv',0,-.37],['jingshan',.56,.05],.060,-.085,false],
    [['nest',.47,0],['watercube',-.40,.10],.12,.045,true],
    [['summer',.64,.10],['nest',-.54,.10],.075,-.09,false],
  ];
  for(const [a,b,width,bend,road]of joins)link(local(...a),local(...b),width,{road,bend,trees:true});
  // All paving is known before planting, so no tree can occupy a later road.
  for(const {route,width,road,avenue}of routes){
    ribbon(route,width+.035,verge,.008);ribbon(route,width,stone,.014);
    if(road){ribbon(route,width*.84,asphalt,.015);if(avenue)for(let i=6;i<route.length-6;i+=11)ribbon(route.slice(i,i+4),.0013,mark,.016);}
    else for(let i=4;i<route.length-3;i+=5){const p=route[i],t=route[i+1].clone().sub(route[i-1]).normalize(),across=new THREE.Vector3().crossVectors(t,p).normalize(),bar=pose(p,.015);bar.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(across,p,new THREE.Vector3().crossVectors(across,p)));k.box(bar,width*.9,.0005,.0006,edge);}
  }
  const keepouts={palace:[.66,1.02],tiananmen:[.61,.50],jingshan:[.78,.63],beihai:[.52,.53],theatre:[.70,.58],heaven:[.52,.47],cctv:[.46,.42],drum:[.44,.45],summer:[.67,.65],nest:[.59,.50],watercube:[.43,.40]};
  const boxes=Object.entries(keepouts).map(([id,bounds])=>({bounds,normal:landmarks.get(id).position.clone().normalize(),inverse:landmarks.get(id).matrixWorld.clone().invert()}));
  const clearOfBuildings=(p,r)=>!boxes.some(b=>{if(p.dot(b.normal)<.65)return false;const q=p.clone().multiplyScalar(radius).applyMatrix4(b.inverse);return Math.abs(q.x)<b.bounds[0]+r&&Math.abs(q.z)<b.bounds[1]+r;});
  const nearRoad=(p,margin)=>routes.some(r=>r.route.some(q=>q.distanceToSquared(p)<((r.width/2+margin)/radius)**2));
  function tree(pos,seed,scale){
    const tree=pose(pos),height=.062*scale,spread=.033*scale,crownWidth=.86+random(seed+53)*.24;
    k.cyl(tree,.0028*scale,.0042*scale,height*.75,bark,0,height*.375,0,7);
    for(let i=0;i<3;i++){const a=i*2.25+seed*.71,x=Math.cos(a)*spread*.37,z=Math.sin(a)*spread*.37;k.beam(tree,[0,height*.40,0],[x,height*.83,z],.0017*scale,bark);}
    // Offset lobes form an uneven broadleaf crown instead of a solid ball.
    for(let i=0;i<5;i++){
      const a=i*2.399+seed,r=i===0?0:spread*(.34+random(seed+i+17)*.27),geo=new THREE.IcosahedronGeometry(spread*(i===0?.88:.55+random(seed+i+31)*.18),2),v=geo.attributes.position;
      for(let j=0;j<v.count;j++){const x=v.getX(j),y=v.getY(j),z=v.getZ(j),n=1+.06*Math.sin(x*137+seed)*Math.cos(z*151-y*123);v.setXYZ(j,x*n,y*n,z*n);}geo.computeVertexNormals();
      const crown=k.mesh(tree,geo,leaves[Math.floor(random(seed+i)*leaves.length)],Math.cos(a)*r,height+(i===0?.012:(random(seed+i)-.3)*.023)*scale,Math.sin(a)*r);crown.scale.set(crownWidth,.69+random(seed+i+9)*.34,.84+random(seed+i+4)*.24);
    }
    plantings.push({position:pos.clone().multiplyScalar(radius+.010).toArray(),radius:spread*1.2,height:height+spread,seed});
  }
  let seed=1;
  for(const {route,width,trees,avenue}of routes){
    if(!trees)continue;
    const distance=route.reduce((sum,p,i)=>sum+(i?p.angleTo(route[i-1])*radius:0),0),count=Math.floor(distance/.16);
    for(let i=1;i<count;i++)for(const side of [-1,1]){
      seed++;if(random(seed)<(avenue?.10:.25))continue;
      const t=(i+(random(seed+4)-.5)*.48)/count,index=Math.max(1,Math.min(route.length-2,Math.round(t*(route.length-1)))),p=route[index],tangent=route[index+1].clone().sub(route[index-1]).normalize(),across=new THREE.Vector3().crossVectors(tangent,p).normalize();
      const scale=.82+random(seed+1)*.45,offset=width/2+.074+random(seed+2)*(avenue?.025:.060),pos=p.clone().multiplyScalar(radius).addScaledVector(across,side*offset).normalize();
      if(!clearOfBuildings(pos,.044*scale)||nearRoad(pos,.044*scale)||plantings.some(q=>pos.clone().multiplyScalar(radius).distanceTo(new THREE.Vector3(...q.position))<.085))continue;
      tree(pos,seed,scale);
      // A few companion trees make garden links read as groups, not a grid.
      if(!avenue&&random(seed+8)>.65){const other=pos.clone().multiplyScalar(radius).addScaledVector(across,side*.08).addScaledVector(tangent,.06).normalize();if(clearOfBuildings(other,.04)&&!nearRoad(other,.04)&&!plantings.some(q=>other.clone().multiplyScalar(radius).distanceTo(new THREE.Vector3(...q.position))<.085))tree(other,seed+100,.72+random(seed+11)*.26);}
    }
    const lamps=Math.floor(distance/.34);
    for(let i=1;i<lamps;i++){
      const index=Math.min(route.length-2,Math.max(1,Math.round(i/lamps*(route.length-1)))),p=route[index],t=route[index+1].clone().sub(route[index-1]).normalize(),across=new THREE.Vector3().crossVectors(t,p).normalize(),pos=p.clone().multiplyScalar(radius).addScaledVector(across,(i%2?1:-1)*(width/2+.014)).normalize();
      if(!clearOfBuildings(pos,.008))continue;const item=pose(pos,.013);k.cyl(item,.0018,.0025,.042,pole,0,.021,0,6);k.box(item,.006,.003,.006,lamp,0,.044,0);
    }
  }
  k.merge(g);g.userData={connections,points,roads,plantings};g.traverse(o=>{if(o.isMesh){o.castShadow=[pole,bark,...leaves].includes(o.material);o.receiveShadow=true;}});return g;
}
