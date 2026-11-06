import * as THREE from 'three';

// A compressed Badaling ridge, with an uninterrupted stepped walk through the towers.
const curve=new THREE.CatmullRomCurve3([
  [-.73,.105,.24],[-.61,.23,.09],[-.40,.35,-.16],[-.16,.25,-.25],
  [.07,.32,-.10],[.26,.49,.14],[.50,.55,.24],[.72,.39,.08],
].map(p=>new THREE.Vector3(...p)));
const samples=curve.getSpacedPoints(160);
const towerSteps=[20,53,102,140];
function frame(i){const p=samples[i],a=samples[Math.max(0,i-1)],b=samples[Math.min(160,i+1)],angle=Math.atan2(b.x-a.x,b.z-a.z);return {p,angle,n:new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle))};}
const towers=towerSteps.map(i=>({...frame(i),i}));
function nearest(x,z){
  let d=Infinity,y=0;
  for(let i=0;i<160;i++){
    const a=samples[i],b=samples[i+1],dx=b.x-a.x,dz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1),q=(x-a.x-t*dx)**2+(z-a.z-t*dz)**2;
    if(q<d){d=q;y=a.y+(b.y-a.y)*t;}
  }
  return {distance:Math.sqrt(d),height:y};
}
export function greatWallHeight(x,z){
  const q=nearest(x,z),edge=Math.max(0,1-(Math.abs(x)/.89)**12)*Math.max(0,1-(Math.abs(z)/.52)**10);
  const width=.19+.035*Math.sin(x*5+z*3),ridge=q.height*Math.exp(-Math.pow(q.distance/width,1.65));
  const creases=(Math.sin(x*31+z*23)+.5*Math.sin(x*63-z*37))*.011*Math.min(1,q.distance/.065);
  let h=Math.max(.002,(ridge+creases)*edge);
  for(const t of towers){const d=Math.hypot(x-t.p.x,z-t.p.z);if(d<.24)h=THREE.MathUtils.lerp(t.p.y,h,THREE.MathUtils.smoothstep(d,.112,.24));}
  return h;
}
function brick(k,color,scale=1){
  const m=k.mat(color,.96,.01);m.userData.night={color:new THREE.Color('#d4c6a9'),intensity:.085};
  m.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vMasonry; varying vec3 vMasonryNormal;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMasonry=position; vMasonryNormal=normal;');
    s.fragmentShader='varying vec3 vMasonry; varying vec3 vMasonryNormal;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 uv=vec2(abs(vMasonryNormal.x)>abs(vMasonryNormal.z)?vMasonry.z:vMasonry.x,vMasonry.y)*vec2(${(45*scale).toFixed(1)},${(125*scale).toFixed(1)});
      uv.x+=mod(floor(uv.y),2.0)*.5;
      vec2 cell=fract(uv),aa=fwidth(uv)*.8;
      float joint=max(1.0-smoothstep(.015,.06+aa.x,cell.x),1.0-smoothstep(.015,.07+aa.y,cell.y));
      float variation=fract(sin(dot(floor(uv),vec2(12.9,78.2)))*43758.5);
      float face=1.0-smoothstep(.80,.95,abs(normalize(vMasonryNormal).y));
      diffuseColor.rgb*=mix(1.0,(.87+variation*.20)*(1.0-joint*.23),face);
    `);
  };m.customProgramCacheKey=()=>`badaling-masonry-${scale}`;return m;
}
function archPanel(k,g,w,h,d,y,m,{openings=[0],door=false,x=0,z=0,rotation=0}={}){
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
  for(const xx of openings){const r=door?.024:.013,bottom=door?.001:.037,top=door?.049:.066,p=new THREE.Path();p.moveTo(xx-r,bottom);p.lineTo(xx-r,top);p.absarc(xx,top,r,Math.PI,0,true);p.lineTo(xx+r,bottom);p.closePath();shape.holes.push(p);}
  const o=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:10}),m,x,y,z);o.rotation.y=rotation;
}
function watchtower(k,g,t,p){
  const a=new THREE.Group();a.position.copy(t.p);a.rotation.y=t.angle;g.add(a);
  // Hollow opposing arched gates align with the walk; flanking windows also pierce the wall.
  k.box(a,.154,.067,.154,p.foundation,0,.032,0);
  k.box(a,.145,.007,.145,p.floor,0,.067,0);
  for(const s of [-1,1])archPanel(k,a,.146,.099,.012,.071,p.wall,{door:true,z:s>0?.067:-.079});
  for(const s of [-1,1])archPanel(k,a,.133,.099,.012,.071,p.wall,{openings:[-.033,.033],x:s>0?.067:-.079,rotation:Math.PI/2});
  k.box(a,.165,.013,.165,p.cap,0,.176,0);
  for(const s of [-1,1]){
    k.box(a,.166,.020,.009,p.wall,0,.190,s*.079);k.box(a,.009,.020,.166,p.wall,s*.079,.190,0);
    for(let j=0;j<5;j++){const u=(j/4-.5)*.158;k.box(a,.018,.024,.010,p.wall,u,.211,s*.079);if(j>0&&j<4)k.box(a,.010,.024,.018,p.wall,s*.079,.211,u);}
  }
  for(const z of [-.083,.083])k.box(a,.150,.004,.014,p.cap,0,.071,z);
  for(const side of [-1,1])k.box(a,.003,.002,.068,p.warm,side*.060,.074,0);
}
export function greatWall(k){
  const g=new THREE.Group(),p={wall:brick(k,'#999589'),foundation:brick(k,'#77786c',.6),cap:k.mat('#b5b0a0',.94),floor:k.mat('#93958a',.94),joint:k.mat('#676e65',.98),warm:k.mat('#d7bf8d',.6,.04,'#e4b765')};p.warm.userData.night.intensity=.62;
  const mountain=new THREE.PlaneGeometry(1.78,1.04,132,84);mountain.rotateX(-Math.PI/2);const a=mountain.attributes.position,colors=[];
  const base=new THREE.Color('#8f9c79'),green=new THREE.Color('#5e7251'),rock=new THREE.Color('#91917b');
  for(let i=0;i<a.count;i++){
    const x=a.getX(i),z=a.getZ(i),y=greatWallHeight(x,z),q=nearest(x,z);a.setY(i,y);
    const c=base.clone().lerp(green,Math.min(1,y/.095));const slope=Math.abs(greatWallHeight(x,z+.008)-greatWallHeight(x,z-.008))/.016;
    c.lerp(rock,THREE.MathUtils.smoothstep(slope,1.2,2.3)*.46);c.multiplyScalar(1+.04*Math.sin(x*41+z*59)*Math.min(1,y/.03));colors.push(c.r,c.g,c.b);
  }
  mountain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));mountain.computeVertexNormals();const soil=k.mat('#ffffff',1,0);soil.vertexColors=true;soil.userData.terrainTint=true;soil.userData.preserveSmooth=true;soil.userData.night={color:new THREE.Color('#4d6556'),intensity:.10};k.mesh(g,mountain,soil);
  // Fade the moonlit fill into the globe at the foot, avoiding a rectangular patch at night.
  soil.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vHill;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHill=position;');
    s.fragmentShader='varying vec3 vHill;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat hillHeight=vHill.y+2.15-sqrt(max(.001,4.6225-dot(vHill.xz,vHill.xz)));totalEmissiveRadiance*=smoothstep(.008,.12,hillHeight);');
  };soil.customProgramCacheKey=()=> 'badaling-moonlit-ridge';
  const walk=[];
  for(let i=0;i<160;i++){
    const f=frame(i),b=samples[i+1],mid=f.p.clone().add(b).multiplyScalar(.5),angle=Math.atan2(b.x-f.p.x,b.z-f.p.z),len=Math.hypot(b.x-f.p.x,b.z-f.p.z)+.002;
    // Discrete flat treads ascend instead of a single smooth ramp.
    const occupied=towers.find(t=>Math.hypot(mid.x-t.p.x,mid.z-t.p.z)<.095),y=occupied?occupied.p.y+.067:Math.max(greatWallHeight(f.p.x,f.p.z),greatWallHeight(b.x,b.z))+.066,part=new THREE.Group();part.position.set(mid.x,y,mid.z);part.rotation.y=angle;g.add(part);walk.push([mid.x,y+.004,mid.z]);
    k.box(part,.072,.010,len,p.floor,0,0,0);const bottom=Math.min(greatWallHeight(mid.x+Math.cos(angle)*.042,mid.z-Math.sin(angle)*.042),greatWallHeight(mid.x-Math.cos(angle)*.042,mid.z+Math.sin(angle)*.042))-.004,depth=y-bottom;k.box(part,.074,depth,len,p.foundation,0,-depth/2,0);
    if(occupied)continue;
    for(const s of [-1,1]){
      k.box(part,.010,.034,len+.001,p.wall,s*.040,.017,0);k.box(part,.012,.004,len+.001,p.cap,s*.040,.036,0);
      if(i%3===0){k.box(part,.012,.023,len*1.42,p.wall,s*.040,.047,0);k.box(part,.013,.004,len*1.48,p.cap,s*.040,.060,0);}
      if(i%5===0)k.box(part,.002,.002,len*.80,p.warm,s*.034,.006,0);
    }
    k.box(part,.070,.0015,.0012,p.joint,0,.005,len*.45);
  }
  towers.forEach(t=>watchtower(k,g,t,p));
  const leaves=['#486344','#59724b','#6b8057','#7a875b'].map(c=>k.mat(c,.99,0)),rockMat=k.mat('#a5a38d',.98,0);
  let planted=0;
  for(let i=0;i<1300;i++){
    const x=(Math.sin(i*127.1)*43758.5453%1)*.84,z=(Math.sin(i*311.7+4)*19128.1%1)*.48,h=greatWallHeight(x,z),q=nearest(x,z);
    if(h<.015||q.distance<.074||towers.some(t=>Math.hypot(x-t.p.x,z-t.p.z)<.16))continue;
    const size=.021+(i%5)*.003,leaf=k.mesh(g,new THREE.IcosahedronGeometry(size,1),leaves[i%4],x,h+size*.65,z);leaf.scale.set(1.05,1.12,1.05);planted++;
    if(i%23===0&&q.distance>.11){const stone=k.mesh(g,new THREE.DodecahedronGeometry(.032,0),rockMat,x+.016,h-.006,z);stone.scale.set(1.4,.65,1.1);}
  }
  g.userData={walk,towers:towers.map(t=>({x:t.p.x,y:t.p.y,z:t.p.z,angle:t.angle})),treeCount:planted};
  k.merge(g);
  for(const t of towers){const l=new THREE.PointLight('#e4bd82',0,.35,2);l.position.copy(t.p).add(new THREE.Vector3(.10,.21,.12));l.userData.nightIntensity=.012;g.add(l);}
  return g;
}

// A long, sphere-following mountain panorama. Coordinates are world-space;
// the scene places this complete module under its focus/removal pivot.
export function greatWallAcrossGlobe(k,radius){
  const g=new THREE.Group(),count=360,halfWidth=.245;
  const p={wall:brick(k,'#929184'),foundation:brick(k,'#727669',.6),cap:k.mat('#b9b5a5',.95,0),floor:k.mat('#a4a697',.98,0),warm:k.mat('#c5ae7b',.8,0,'#e0be7d')};p.warm.userData.night.intensity=.52;
  const ridge=(t)=>.09+Math.pow(Math.sin(t*Math.PI),.6)*(.25+.11*Math.sin(t*23)+.065*Math.cos(t*41));
  const direction=(t,offset=0)=>{const u=(t-.5)*3.04,v=.64+.16*Math.sin(t*8.5)+.065*Math.cos(t*17)+offset;return new THREE.Vector3(Math.sin(u)*Math.cos(v),-Math.cos(u)*Math.cos(v),-Math.sin(v));};
  const height=(t,offset)=>{
    const width=halfWidth*(.83+.14*Math.sin(t*37)+.08*Math.cos(t*73)),edge=Math.max(0,Math.cos(Math.min(1,Math.abs(offset)/width)*Math.PI/2));
    const end=THREE.MathUtils.smoothstep(t,0,.025)*(1-THREE.MathUtils.smoothstep(t,.975,1));
    return .002+ridge(t)*Math.pow(edge,1.5)*end+(Math.sin(t*190+offset*72)*.014+Math.cos(t*93-offset*51)*.009)*Math.pow(edge,.7)*Math.min(1,Math.abs(offset)/.04)*end;
  };
  const point=(t,o=0,lift=0)=>direction(t,o).multiplyScalar(radius+height(t,o)+lift);
  const frame=(t,lift=0)=>{const n=direction(t),along=point(Math.min(1,t+.0001)).sub(point(Math.max(0,t-.0001))).projectOnPlane(n).normalize(),x=new THREE.Vector3().crossVectors(n,along).normalize();const part=new THREE.Group();part.position.copy(point(t,0,lift));part.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,n,along));return part;};
  const vertices=[],colors=[],indices=[],rows=48,base=new THREE.Color('#8f9c79'),forest=new THREE.Color('#536c4c'),stone=new THREE.Color('#91917f');
  for(let i=0;i<=count;i++)for(let j=0;j<=rows;j++){
    const t=i/count,o=(j/rows*2-1)*halfWidth,h=height(t,o);vertices.push(...point(t,o).toArray());
    const c=base.clone().lerp(forest,THREE.MathUtils.smoothstep(h,.005,.08));const steep=Math.abs(height(t,o+.002)-height(t,o-.002))/.004;
    c.lerp(stone,THREE.MathUtils.smoothstep(steep,.8,1.8)*.6);c.multiplyScalar(1+Math.sin(t*320+o*190)*.025);colors.push(c.r,c.g,c.b);
    if(i<count&&j<rows){const a=i*(rows+1)+j;indices.push(a,a+1,a+rows+1,a+1,a+rows+2,a+rows+1);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  // Ensure outward-facing terrain independently of the route's handedness.
  if(new THREE.Vector3().fromBufferAttribute(geo.attributes.normal,500).dot(new THREE.Vector3().fromBufferAttribute(geo.attributes.position,500))<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];geo.setIndex(indices);geo.computeVertexNormals();}
  const soil=k.mat('#ffffff',1,0);soil.vertexColors=true;soil.userData.terrainTint=true;soil.userData.preserveSmooth=true;soil.userData.night={color:new THREE.Color('#45594b'),intensity:.045};k.mesh(g,geo,soil);
  const towerTs=[.055,.15,.25,.35,.45,.55,.65,.75,.85,.945],walk=[];
  for(let i=0;i<count;i++){
    const t=(i+.5)/count,part=frame(t,.066),len=point(i/count).distanceTo(point((i+1)/count))+.003;g.add(part);walk.push(part.position.toArray());
    k.box(part,.074,.012,len,p.floor);k.box(part,.081,.082,len,p.foundation,0,-.043,0);
    if(towerTs.some(q=>Math.abs(q-t)*6.3<.095))continue;
    for(const side of [-1,1]){k.box(part,.012,.035,len,p.wall,side*.042,.019,0);k.box(part,.014,.004,len,p.cap,side*.042,.038,0);if(i%2===0)k.box(part,.013,.026,len*.77,p.wall,side*.042,.050,0);if(i%5===0)k.box(part,.002,.002,len*.8,p.warm,side*.034,.008,0);}
  }
  const towerPositions=[];
  for(const t of towerTs){const a=frame(t);g.add(a);watchtower(k,a,{p:new THREE.Vector3(),angle:0},p);towerPositions.push(a.position.toArray());}
  const leaves=['#496344','#61774e','#728159'].map(c=>k.mat(c,1,0));let planted=0;
  for(let i=0;i<950;i++){
    const t=.025+.95*((i*.61803398875)%1),o=Math.sin(i*24.713)*halfWidth*.93;
    if(Math.abs(o)<.035||height(t,o)<.015)continue;
    const n=direction(t,o),pos=point(t,o,.018),leaf=k.mesh(g,new THREE.IcosahedronGeometry(.024+(i%4)*.004,1),leaves[i%3]);leaf.position.copy(pos);leaf.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);leaf.scale.set(1,1.15,1);planted++;
  }
  g.userData={sphereLandscape:true,walk,towerPositions,treeCount:planted,angularSpan:3.04,halfWidth};
  return k.merge(g);
}
