import * as THREE from 'three';
import {PLANET_RADIUS as R,RIVER_COURSE,RIVER_BRIDGE,normalAt,frameAt} from './planet-layout.js';
import {waterMaterial} from './planet-materials.js';
import {createStreetProp} from './planet-street.js';
import {woodlandTree} from './planet-nature.js';

const point=(lon,lat,height)=>new THREE.Vector3(...normalAt(lon,lat)).multiplyScalar(R+height);
const solid=color=>new THREE.MeshStandardMaterial({color,roughness:.88});
function mesh(geometry,mat,name,cast=true){
  const m=new THREE.Mesh(geometry,mat);m.name=name;m.castShadow=cast;m.receiveShadow=true;return m;
}
export function riverSections(){
  const sections=[];
  for(let i=0;i<RIVER_COURSE.length-1;i++){
    const a=RIVER_COURSE[i],b=RIVER_COURSE[i+1],steps=Math.ceil((b[0]-a[0])/1.1);
    for(let j=0;j<steps;j++)sections.push(a.map((x,k)=>x+(b[k]-x)*j/steps));
  }
  sections.push(RIVER_COURSE.at(-1));return sections;
}
function ribbon(rows,name,mat,colorAt){
  const positions=[],colors=[],indices=[],columns=rows[0].length;
  rows.forEach((row,i)=>row.forEach((p,j)=>{
    positions.push(...p.toArray());if(colorAt)colors.push(...colorAt(i,j).toArray());
    if(i&&j){const k=i*columns+j;indices.push(k-columns-1,k-columns,k,k-columns-1,k,k-1);}
  }));
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);
  if(colorAt)geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const normal=geo.attributes.normal,p=geo.attributes.position;
  let facing=0;for(let i=0;i<p.count;i++)facing+=p.getX(i)*normal.getX(i)+p.getY(i)*normal.getY(i)+p.getZ(i)*normal.getZ(i);
  if(facing<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];geo.setIndex(indices);geo.computeVertexNormals();}
  mat.side=THREE.DoubleSide;return mesh(geo,mat,name,false);
}
function beam(a,b,width,depth,mat,name){
  const m=mesh(new THREE.BoxGeometry(width,a.distanceTo(b),depth),mat,name);
  m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;
}
// A closed rectangular sweep shares vertices along each face. It replaces
// sixty overlapping beam boxes without flattening the beam or its end caps.
function bridgeSweep(points,width,depth,mat,name){
  const rings=points.map((p,i)=>{
    const up=p.clone().normalize(),tangent=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]);
    const east=up.clone().cross(tangent).normalize();
    return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>p.clone().addScaledVector(east,x*width/2).addScaledVector(up,y*depth/2));
  }),positions=[],indices=[];
  for(let side=0;side<4;side++){
    const start=positions.length/3;
    rings.forEach((ring,i)=>{
      positions.push(...ring[side].toArray(),...ring[(side+1)%4].toArray());
      if(i){const k=start+i*2;indices.push(k-2,k-1,k+1,k-2,k+1,k);}
    });
  }
  for(const [i,reverse] of [[0,true],[rings.length-1,false]]){
    const k=positions.length/3;positions.push(...rings[i].flatMap(p=>p.toArray()));
    indices.push(...(reverse?[k,k+2,k+1,k,k+3,k+2]:[k,k+1,k+2,k,k+2,k+3]));
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return mesh(geometry,mat,name);
}
// City Balcony is a broad, two-level public deck projecting over the river.
// The model keeps its horizontal slab, glazed lower gallery, repeated piers
// and open viewing edge; it is an artistic miniature, not a surveyed replica.
function addCityBalcony(root,sections){
  const bankAt=lon=>{
    const i=sections.findIndex(row=>row[0]>=lon),a=sections[i-1],b=sections[i];
    return a[1]+(b[1]-a[1])*(lon-a[0])/(b[0]-a[0]);
  };
  const at=(lon,offset,h=.008)=>point(lon,bankAt(lon)+offset,h);
  const stone=solid('#c4c4af'),paving=solid('#d8d7c6'),fascia=solid('#596e69'),glass=solid('#82aaa0'),rail=solid('#bfd0bd');
  // Keep the already-validated land-side forecourt and its continuous walk.
  const rowCount=48,rows=[];
  for(let i=0;i<=rowCount;i++){
    const u=i/rowCount,lon=149+24*u,depth=3.8*Math.sqrt(Math.max(0,Math.sin(Math.PI*u)));
    rows.push(Array.from({length:5},(_,j)=>at(lon,1.1+depth*j/4)));
  }
  for(const i of [0,rowCount])rows[i]=Array.from({length:5},(_,j)=>at(149+24*i/rowCount,1.1+.025*j/4));
  root.add(ribbon(rows,'river-terrace-paving',paving));
  const deckRows=[],lowerRows=[],front=[];
  for(let i=0;i<=30;i++){
    const u=i/30,lon=147+26*u,tip=Math.abs(u-.5)*2;
    const edge=-4.8+1.6*Math.max(0,(tip-.76)/.24);
    deckRows.push(Array.from({length:5},(_,j)=>at(lon,-.5+(edge+.5)*j/4,.048)));
    lowerRows.push([at(lon,-.5,.014),at(lon,edge+.65,.014)]);
    front.push([lon,edge]);
  }
  const upper=ribbon(deckRows,'city-balcony-upper-deck',paving);upper.castShadow=true;root.add(upper);
  root.add(ribbon(lowerRows,'city-balcony-lower-deck',stone));
  root.add(ribbon(front.map(([lon,edge])=>[at(lon,edge,.038),at(lon,edge,.048)]),'city-balcony-fascia',fascia));
  root.add(ribbon(front.map(([lon,edge])=>[at(lon,edge+.65,.015),at(lon,edge+.65,.038)]),'city-balcony-lower-glazing',glass));
  // Pale glass parapet and a slender metal cap, with an uninterrupted view.
  root.add(ribbon(front.map(([lon,edge])=>[at(lon,edge,.049),at(lon,edge,.065)]),'city-balcony-glass-rail',glass));
  root.add(bridgeSweep(front.map(([lon,edge])=>at(lon,edge,.066)),.002,.002,rail,'city-balcony-rail-cap'));
  for(let i=0;i<front.length-1;i++){
    const [lon,edge]=front[i];
    if(i%2===0){
      root.add(beam(at(lon,edge,.048),at(lon,edge,.066),.0018,.0018,rail,'city-balcony-rail-post'));
      root.add(beam(at(lon,edge+.65,.015),at(lon,edge+.65,.038),.0018,.0018,fascia,'city-balcony-gallery-mullion'));
    }
  }
  for(const [lon,edge] of [front[0],front.at(-1)]){
    root.add(ribbon([[-.5,.048],[-.5,.065]].map(([offset,h])=>[at(lon,offset,h),at(lon,edge,h)]),'city-balcony-side-rail',glass));
  }
  // Deep round supports are visible below the overhanging lower gallery.
  for(const lon of [149,153,157,161,165,169,171])for(const offset of [-1,-3]){
    const a=at(lon,offset,.001),b=at(lon,offset,.014);
    const pier=mesh(new THREE.CylinderGeometry(.0045,.0055,a.distanceTo(b),8),stone,'city-balcony-pier');
    pier.position.copy(a).add(b).multiplyScalar(.5);pier.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());root.add(pier);
  }
  // Broad central steps terminate at the existing walk's river-side edge.
  // Nothing is placed across the through route at offset +1.1.
  for(let step=0;step<6;step++){
    const rear=.78-step*1.28/6,fore=.78-(step+1)*1.28/6,low=.007+step*.041/6,high=.007+(step+1)*.041/6;
    const lons=Array.from({length:11},(_,i)=>156+i);
    root.add(ribbon(lons.map(lon=>[at(lon,rear,high),at(lon,fore,high)]),'city-balcony-stair-tread',paving));
    root.add(ribbon(lons.map(lon=>[at(lon,rear,low),at(lon,rear,high)]),'city-balcony-stair-riser',stone));
  }
  for(const lon of [148,172]){
    const access=Array.from({length:7},(_,i)=>[-.35,.35].map(dx=>at(lon+dx,.78-i*1.28/6,.007+i*.007/6)));
    root.add(ribbon(access,'city-balcony-lower-access',paving));
  }
  // Long flat canopy echoes the steel-and-glass structure beside the plaza.
  const canopyLons=Array.from({length:13},(_,i)=>150+i*1.7);
  const canopy=ribbon(canopyLons.map(lon=>[at(lon,-.75,.103),at(lon,-1.55,.103)]),'city-balcony-canopy',stone);canopy.castShadow=true;root.add(canopy);
  for(const lon of [150,155.1,160.2,165.3,170.4]){
    root.add(beam(at(lon,-1.15,.048),at(lon,-1.15,.103),.0045,.0045,fascia,'city-balcony-canopy-post'));
  }
  function place(group,lon,offset,h,name){
    const lat=bankAt(lon)+offset,{east,up,south}=frameAt(lon,lat);
    const transform=new THREE.Matrix4().makeBasis(new THREE.Vector3(...east),new THREE.Vector3(...up),new THREE.Vector3(...south));transform.setPosition(point(lon,lat,h));
    group.updateMatrix();transform.multiply(group.matrix);
    for(const part of [...group.children]){part.applyMatrix4(transform);part.name=name;root.add(part);}
  }
  for(const lon of [152.6,168.3]){
    const bedLons=Array.from({length:5},(_,i)=>lon-1.6+i*.8);
    root.add(ribbon(bedLons.map(x=>[at(x,-2.1,.049),at(x,-3.5,.049)]),'city-balcony-lawn',solid('#7e9a6a')));
    place(createStreetProp({type:'bench',id:'city-balcony-bench'}),lon,-3,.050,'city-balcony-bench');
    place(woodlandTree(.018,.054,'city-balcony-'+lon),lon,-2.35,.049,'city-balcony-tree');
  }
  const visitors=[
    [155.2,-3.9],[156.4,-3.75],[157.8,-4.0],[159.6,-3.8],[160.7,-3.9],
    [163.2,-3.7],[164.4,-3.9],[165.7,-3.8],
    [150.8,-2.35],[154.9,-2.3],[158.3,-2.25],[161.5,-2.3],[164.7,-2.25],[170,-2.3],
    [154.8,-1.75],[158,-1.85],[162.5,-1.75],[166,-1.8],
    [149.8,-2.7],[151,-4],[162,-4.05],[167.4,-4.05],[169.1,-4.05],
    [156,-2.8],[158.8,-3],[162.2,-2.9],[166.1,-2.65],
    [149.8,-1.85],[156.5,-1.85],[160.2,-1.85],[164.2,-1.8],[169.4,-1.75]
  ],coats=['#ae735c','#597e8b','#d3b478','#e4dbbf','#728979','#916e85'];
  for(const [i,[lon,offset]] of visitors.entries()){
    const pose=['photo','talk','walk','wave','talk'][i%5];
    const person=createStreetProp({type:'visitor',id:'city-balcony-visitor-'+i,color:coats[i%coats.length],pose});
    person.rotation.y=i%3===0?Math.PI*.35:i%3===1?-Math.PI*.2:0;
    if([2,7,22,30].includes(i))person.scale.multiplyScalar(.72);
    place(person,lon,offset,.048,'city-balcony-visitor');
  }
  // Warm lamps mark the viewing edge, not the centre of the through route.
  const light=solid('#ffe0a6');light.side=THREE.DoubleSide;light.emissive.set('#ffc77c');light.emissiveIntensity=.7;
  for(const lon of [150,154,158,162,166,170]){
    const offset=-4.35,h=.048;
    root.add(beam(at(lon,offset,h),at(lon,offset,h+.026),.003,.003,fascia,'city-balcony-light-post'));
    root.add(beam(at(lon,offset,h+.026),at(lon,offset,h+.031),.004,.004,light,'city-balcony-lamp'));
  }
  root.add(ribbon(front.map(([lon,edge])=>[at(lon,edge,.039),at(lon,edge,.041)]),'city-balcony-edge-light',light));
  root.add(ribbon(canopyLons.map(lon=>[at(lon,-1.50,.101),at(lon,-1.55,.101)]),'city-balcony-canopy-light',light));
  // A few large paving joints give scale without filling the deck with noise.
  for(const lon of [155,161,167])root.add(ribbon([lon-.025,lon+.025].map(x=>[at(x,-1.6,.0483),at(x,-4.65,.0483)]),'city-balcony-paving-joint',solid('#acb6a4')));
}
export function createRiver(){
  const root=new THREE.Group();root.name='qiantang-river-district';
  const sections=riverSections(),deep=new THREE.Color('#538f98'),shallow=new THREE.Color('#88b8ad'),water=waterMaterial();
  water.color.set('#ffffff');water.vertexColors=true;
  root.add(ribbon(sections.map(([lon,n,s])=>Array.from({length:13},(_,j)=>point(lon,n+(s-n)*j/12,.003))),
    'qiantang-water',water,(_,j)=>shallow.clone().lerp(deep,Math.min(1,Math.min(j,12-j)/2.2))));
  // Continuous land-side paths. Their thin kerbs make the long river banks
  // readable without turning the globe into a raised, circular platform.
  for(const north of [true,false]){
    const side=north?1:-1,bank=north?1:2;
    for(const [offset,width,color,name] of [[.12,.34,'#b4c5ac','river-revetment'],[1.1,.66,'#d8d1b6','river-walk']]){
      root.add(ribbon(sections.map(row=>[-1,1].map(sign=>point(row[0],row[bank]+side*offset+sign*width/2,.007))),
        name,solid(color)));
    }
  }
  // The historic Xixing Bridge's twin single pylons and central cable plane
  // guide this miniature. Existing globe placement and landing geometry stay;
  // this is not a surveyed replica or a statement that the real bridge is open.
  const {longitude:lon,north,south}=RIVER_BRIDGE,stone=solid('#c1c8bd'),rail=solid('#829a95'),deck=[],steps=60;
  for(let i=0;i<=steps;i++){
    const t=i/steps,lat=north+(south-north)*t,height=.011+.060*Math.sin(Math.PI*t);
    deck.push([point(lon-1.6,lat,height),point(lon+1.6,lat,height)]);
  }
  const deckMesh=ribbon(deck,'river-bridge-deck',stone);deckMesh.castShadow=true;root.add(deckMesh);
  const surface=(i,f,h=0)=>{
    const lo=Math.floor(i),hi=Math.min(steps,lo+1),t=i-lo;
    const a=deck[lo][0].clone().lerp(deck[hi][0],t),b=deck[lo][1].clone().lerp(deck[hi][1],t),p=a.lerp(b,f);
    return p.addScaledVector(p.clone().normalize(),h);
  };
  root.add(ribbon(deck.map((_,i)=>[surface(i,.18,.0008),surface(i,.82,.0008)]),'river-bridge-road',solid('#81918c')));
  for(const f of [.18,.82])root.add(ribbon(deck.map((_,i)=>[surface(i,f-.012,.001),surface(i,f+.012,.001)]),'river-bridge-edge-line',solid('#e0dfcb')));
  for(const f of [.36,.64])for(let i=2;i<steps-2;i+=4){
    root.add(ribbon([i,i+1.8].map(j=>[surface(j,f-.009,.0012),surface(j,f+.009,.0012)]),'river-bridge-lane-mark',solid('#d7d9ca')));
  }
  for(const side of [0,1]){
    root.add(bridgeSweep(deck.map(row=>row[side]),.009,.008,stone,'river-bridge-fascia'));
    root.add(bridgeSweep(deck.map(row=>row[side].clone().addScaledVector(row[side].clone().normalize(),.016)),.002,.002,rail,'river-bridge-rail'));
    for(let i=0;i<=steps;i+=3){
      const a=deck[i][side];root.add(beam(a,a.clone().addScaledVector(a.clone().normalize(),.016),.0018,.0018,rail,'river-bridge-post'));
    }
  }
  const tower=solid('#d3d8ce'),cable=solid('#8faaa6');
  for(const i of [15,45]){
    const center=surface(i,.5),normal=center.clone().normalize(),top=center.clone().addScaledVector(normal,.148);
    root.add(beam(normal.clone().multiplyScalar(R+.001),center,.022,.026,stone,'river-bridge-pier'));
    root.add(beam(center,top,.014,.020,tower,'river-bridge-pylon'));
    // Fifteen pairs attach along the height, forming a single harp-like plane.
    // Each cable has a closed solid profile, visible when the planet rotates.
    for(let j=0;j<15;j++)for(const direction of [-1,1]){
      const f=j/14,anchor=surface(i+direction*(2+12*f),.5,.003);
      const upper=center.clone().addScaledVector(normal,.038+.105*f);
      root.add(beam(anchor,upper,.0018,.0018,cable,'river-bridge-stay'));
    }
  }
  // Approaches connect the existing north-bank walk and the new south path.
  for(const [a,b] of [[north,-37],[south,-64.1]]){
    const rows=Array.from({length:9},(_,i)=>[-1.6,1.6].map(dx=>point(lon+dx,a+(b-a)*i/8,.009)));
    root.add(ribbon(rows,'river-bridge-approach',solid('#d8d1b6')));
  }
  addCityBalcony(root,sections);

  return root;
}
