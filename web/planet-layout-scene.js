import {createLingyinTemple} from './planet-lingyin.js';
import {createWoodedHill} from './planet-wooded-hill.js';
import {buildImmediately} from './planet-build.js';
import {waterMaterial,landColorAt} from './planet-materials.js';
import * as THREE from 'three';
import {foliage,willow,woodlandTree} from './planet-nature.js';
import {createRiver} from './planet-river.js';
import {createStreetProp} from './planet-street.js';
import {promenadePaving,causewayStonePaving} from './planet-surfaces.js';
import {createPiece} from './planet-pieces.js';
import {createContextBlock} from './planet-context.js';
import {createGrandTheatre} from './planet-architecture.js';
import {createOlympicLotus,createSouthbankSkyline,createRiverTower} from './planet-southbank.js';
import {PLANET_RADIUS as R,PLACEMENTS,ENTRANCES,LAKE_OUTLINE,LAKE_LAND,CONTEXT_PARCELS,PUBLIC_ROADS,GARDENS,STREET_PROPS,BASES,DISTRICT_GROUNDS,normalAt,frameAt,placementFrame,terrainAt,inGround} from './planet-layout.js';

const v=a=>new THREE.Vector3(...a);
const material=color=>new THREE.MeshStandardMaterial({color,roughness:.88});
const palette={land:'#99b48c',water:'#60afae',road:'#e5d9bb',paving:'#d3cbb6',block:'#d9d8d0',roof:'#a8aaa1',hill:'#80a37b',grid:'#7e8e7d',lot:'#8b9c93',leaf:'#6f9870',leafLight:'#9bb779',leafDark:'#4c7d65',wood:'#96785a',stone:'#c4bda6'};
function mesh(geometry,color){const o=new THREE.Mesh(geometry,material(color));o.castShadow=true;o.receiveShadow=true;return o;}
export function measurePieces(){return PLACEMENTS.map(placement=>{const piece=createPiece(placement.id,{vegetation:false}),box=new THREE.Box3().setFromObject(piece),bounds={min:box.min.toArray(),max:box.max.toArray()};piece.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return {...placement,bounds};});}
export function measureContext(){return CONTEXT_PARCELS.map(p=>{const piece=createContextBlock(p),box=new THREE.Box3().setFromObject(piece),bounds={min:box.min.toArray(),max:box.max.toArray()};piece.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return {...p,id:'context:'+p.id,bounds};});}
function geoPatch(points,height,color,resolution=.055){
  const coords=[];for(const q of points){coords.push(new THREE.Vector2(...q));}
  const faces=THREE.ShapeUtils.triangulateShape(coords,[]),vertices=[],indices=[];
  // Adjacent faces must sample their common edge at the same fractions. Per-face
  // counts leave narrow cracks after projecting the triangles onto the globe.
  const directions=points.map(p=>v(normalAt(...p)));
  const maxAngle=Math.max(...faces.map(([a,b,c])=>Math.max(directions[a].angleTo(directions[b]),directions[b].angleTo(directions[c]),directions[c].angleTo(directions[a]))));
  const steps=Math.max(2,Math.ceil(maxAngle/resolution));
  for(const triangle of faces){const [a,b,c]=triangle.map(i=>points[i]),rows=[];
    for(let j=0;j<=steps;j++){const row=[];for(let k=0;k<=steps-j;k++){const p=a.map((x,i)=>x+(b[i]-x)*j/steps+(c[i]-x)*k/steps);row.push(vertices.length/3);vertices.push(...normalAt(...p).map(x=>x*(R+height)));}rows.push(row);}
    for(let j=0;j<steps;j++)for(let k=0;k<rows[j+1].length;k++){indices.push(rows[j][k],rows[j+1][k],rows[j][k+1]);if(k<rows[j+1].length-1)indices.push(rows[j][k+1],rows[j+1][k],rows[j+1][k+1]);}
  }
  const normals=[];for(let i=0;i<vertices.length;i+=3){const len=Math.hypot(...vertices.slice(i,i+3));normals.push(vertices[i]/len,vertices[i+1]/len,vertices[i+2]/len);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setIndex(indices);
  const o=mesh(geometry,color);o.material.side=THREE.DoubleSide;o.castShadow=false;return o;
}
export function sampleRoad(points){
  const normals=points.map(p=>v(normalAt(...p))),closed=normals[0].distanceTo(normals.at(-1))<1e-8;
  const length=normals.slice(1).reduce((sum,n,i)=>sum+n.angleTo(normals[i])*R,0);
  if(closed)normals.pop();
  return new THREE.CatmullRomCurve3(normals,closed,'centripetal').getPoints(Math.max(8,Math.ceil(length/.018))).map(n=>n.normalize());
}
function lineOnSphere(points,width=.025,color=palette.road,height=.009,clipWater=false){
  const normals=sampleRoad(points),vertices=[],indices=[];
  normals.forEach((n,i)=>{
    const direction=normals[Math.min(i+1,normals.length-1)].clone().sub(normals[Math.max(0,i-1)]),side=direction.cross(n).normalize();
    for(const sign of [-1,1])vertices.push(...n.clone().multiplyScalar(R).addScaledVector(side,sign*width/2).normalize().multiplyScalar(R+height).toArray());
    if(i&&(!clipWater||terrainAt(n.toArray())==='land'&&terrainAt(normals[i-1].toArray())==='land')){const a=(i-1)*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  });
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const o=mesh(geometry,color);o.material.side=THREE.DoubleSide;o.name=height===.009?'paved-path':'shoreline';return o;
}
export function oriented(group,p){const f=frameAt(...p.geo);group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(v(f.east),v(f.up),v(f.south)));group.rotateY(p.turn||0);group.position.copy(v(f.up)).multiplyScalar(R+(p.elevation??.014));return group;}
export function entryGeo(p){
  const f=placementFrame(p),entry=p.entrance||ENTRANCES[p.id];if(!entry)throw new Error('Missing entrance: '+p.id);const x=entry[0]*p.scale,z=entry[1]*p.scale;
  const up=p.surfaceEntrance?Math.sqrt(R*R-x*x-z*z):R;
  const n=v(f.up).multiplyScalar(up).addScaledVector(v(f.east),x).addScaledVector(v(f.south),z).normalize();
  return [Math.atan2(n.x,n.z)*180/Math.PI,Math.asin(n.y)*180/Math.PI];
}
export function foundation(p){
  if(p.flushGround)return null;
  const base=BASES[p.id];if(!base)return null;
  const [w,d]=base.map(x=>x*p.scale),outline=[];
  if(base[2])for(let i=0;i<base[2];i++){const a=(i+.5)*Math.PI*2/base[2];outline.push([Math.sin(a)*w/2,Math.cos(a)*d/2]);}
  else{const r=.012*p.scale;for(let j=0;j<4;j++){const a=j*Math.PI/2,cx=(j===0||j===3?1:-1)*(w/2-r),cz=(j<2?1:-1)*(d/2-r);for(let k=0;k<=5;k++){const t=a+k/5*Math.PI/2;outline.push([cx+Math.cos(t)*r,cz+Math.sin(t)*r]);}}}
  const vertices=[0,.002,0],indices=[],n=outline.length;
  for(const [x,z] of outline)vertices.push(x,.002,z);
  for(const [x,z] of outline)vertices.push(x,Math.sqrt(Math.max(0,(R-.003)**2-x*x-z*z))-(R+.014),z);
  for(let i=0;i<n;i++){const a=i+1,b=(i+1)%n+1;indices.push(0,b,a,a,b,a+n,b,b+n,a+n);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const o=mesh(geometry,p.district==='park'?palette.hill:palette.stone);o.name='curved-foundation';o.material.side=THREE.DoubleSide;return o;
}
export function createGarden(garden){
  if(garden.kind==='wooded-hill'){const g=createWoodedHill(garden,R);g.userData.gardenId=garden.id;g.userData.district=garden.district;return g;}
  if(garden.kind==='lingyin'){const g=createLingyinTemple(...garden.size,R);g.userData.gardenId=garden.id;g.userData.district=garden.district;return g;}
  if(['olympic-lotus','southbank-skyline','river-tower'].includes(garden.kind)){
    const build=garden.kind==='olympic-lotus'?createOlympicLotus:createSouthbankSkyline;
    const g=garden.kind==='river-tower'?createRiverTower(garden):build(...garden.size,R);g.userData.gardenId=garden.id;g.userData.district=garden.district;return g;
  }
  if(garden.kind==='theatre'){
    const g=createGrandTheatre(THREE,...garden.size,R);g.userData.gardenId=garden.id;g.userData.district=garden.district;return g;
  }
  const g=new THREE.Group();g.name='garden:'+garden.id;g.userData.gardenId=garden.id;g.userData.district=garden.district;
  const [w,d]=garden.size,verts=[0,-.006,0],ix=[];
  for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,x=Math.cos(a)*w/2,z=Math.sin(a)*d/2;verts.push(x,Math.sqrt((R+.008)**2-x*x-z*z)-(R+.014),z);if(i)ix.push(0,i+1,i);}
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geom.setIndex(ix);geom.computeVertexNormals();
  const groundColor=['shore-grove','forest','forest-belt','river-tree'].includes(garden.kind)?landColorAt(...normalAt(...garden.geo)):palette.hill;
  g.add(mesh(geom,groundColor));
  const plant=(x,z,o)=>{o.position.set(x,Math.sqrt(R*R-x*x-z*z)-(R+.014)+.012,z);g.add(o);};
  const crown=(rx,ry,rz,color)=>foliage(rx,ry,rz,color,rx*100+ry*50);
  if(garden.kind==='willow'){
    // Seat the trunk just inside its actual planted surface.
    const tree=willow(w,d,garden.id),bottom=new THREE.Box3().setFromObject(tree).min.y;
    tree.position.y=geom.attributes.position.getY(0)-bottom-.0008;
    g.add(tree);
  }else if(garden.kind==='river-tree'){
    // Individual, explicitly reserved crowns follow the land side of the
    // river walk. The small planted surface blends into the surrounding turf.
    const tree=woodlandTree(Math.min(w,d)*.43,.108*Math.min(1,w/.10),garden.id);
    tree.position.y=geom.attributes.position.getY(0)-.0006;g.add(tree);
  }else if(garden.kind==='forest'||garden.kind==='forest-belt'){
    // A staggered, low canopy fills a reserved woodland parcel, with an
    // irregular edge and roots seated on the actual curved ground surface.
    const belt=garden.kind==='forest-belt';
    const planting=belt
      ? [[-.37,-.23,.90],[-.18,-.25,1],[.04,-.23,.86],[.25,-.22,.95],[.40,-.15,.70],[-.42,.05,.72],[-.27,.10,.98],[-.06,.08,1.05],[.13,.10,.94],[.32,.08,.82],[-.24,.32,.75],[-.02,.31,.90],[.18,.32,.76],[.35,.25,.70]]
      : [[-.30,-.16,.91],[0,-.24,1.04],[.30,-.12,.88],[-.22,.15,1.05],[.10,.10,1],[.31,.23,.75],[-.02,.34,.72]];
    for(const [i,[dx,dz,s]] of planting.entries()){
      const tree=woodlandTree(Math.min(w*(belt?.095:.19),d*.25)*s,.105*s*Math.min(1,w/.25),garden.id+':'+i);
      plant(dx*w,dz*d,tree);
      const hit=new THREE.Raycaster(new THREE.Vector3(tree.position.x,1,tree.position.z),new THREE.Vector3(0,-1,0)).intersectObject(g.children[0],false)[0];
      if(hit)tree.position.y=hit.point.y-.0006;
    }
  }else if(garden.kind==='shore-grove'){
    // Three offset broadleaf trees form a planted bank, not scattered spikes.
    // Modest crown resolution keeps the complete shore affordable to render.
    const seed=Array.from(garden.id).reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0)|0,7)>>>0;
    for(const [dx,dz,s] of [[-.24,-.13,.93],[.23,-.08,1.05],[.01,.23,.84]]){
      const tree=new THREE.Group(),r=Math.min(w*.21,d*.27)*s,h=(.086+(seed%9)*.0024)*s;tree.name='shore-tree';
      const trunk=mesh(new THREE.CylinderGeometry(.0025*s,.0042*s,h*.66,6),palette.wood);
      trunk.name='shore-tree-trunk';trunk.position.y=h*.33;tree.add(trunk);
      for(const end of [new THREE.Vector3(-r*.48,h*.82,r*.10),new THREE.Vector3(r*.44,h*.74,-r*.10)]){
        const start=new THREE.Vector3(0,h*.45,0),dir=end.clone().sub(start),len=dir.length();
        const fork=mesh(new THREE.CylinderGeometry(.0012*s,.0020*s,len,6,1),palette.wood);
        fork.name='shore-tree-fork';fork.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());fork.position.copy(start).add(end).multiplyScalar(.5);tree.add(fork);
      }
      // Broad, folded leaves make a broken canopy edge and reveal small gaps
      // between branches. The seeded envelope stays within the existing plot.
      let state=(seed^Math.round((dx+1)*731+(dz+1)*991))>>>0;
      const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
      const leafPositions=[],leafColors=[],leafIndices=[],dark=new THREE.Color('#567860'),light=new THREE.Color('#8ea572'),phase=random()*Math.PI*2;
      const leafCount=104;
      for(let j=0;j<leafCount;j++){
        const y=1-2*(j+.5)/leafCount,a=phase+j*2.399963+(random()-.5)*.35,ring=Math.sqrt(1-y*y),radius=.80*(1+.13*Math.sin(a*3+phase)+.06*Math.cos(a*7-y*4));
        const center=new THREE.Vector3(Math.cos(a)*r*ring*radius,h*(.94+y*.27+.02*Math.sin(a*4+phase)),Math.sin(a)*r*.90*ring*radius);
        const normal=new THREE.Vector3(Math.cos(a)*ring*.7,.35+y*.35,Math.sin(a)*ring*.7).normalize();
        const along=new THREE.Vector3(-Math.sin(a),.15*Math.cos(a*3),Math.cos(a));along.addScaledVector(normal,-along.dot(normal)).normalize();
        along.applyAxisAngle(normal,(random()-.5)*1.2);
        const across=normal.clone().cross(along).normalize(),length=r*(.258+random()*.075),width=r*(.161+random()*.054);
        const points=[center.clone().addScaledVector(along,-length),center.clone().addScaledVector(across,width).addScaledVector(normal,r*.035),center.clone().addScaledVector(along,length),center.clone().addScaledVector(across,-width).addScaledVector(normal,r*.035)];
        const color=dark.clone().lerp(light,.18+random()*.38+Math.max(0,y)*.10),offset=leafPositions.length/3;
        for(const p of points){leafPositions.push(...p.toArray());leafColors.push(...color.toArray());}
        leafIndices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
      }
      const leafGeometry=new THREE.BufferGeometry();leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute(leafPositions,3));leafGeometry.setAttribute('color',new THREE.Float32BufferAttribute(leafColors,3));leafGeometry.setIndex(leafIndices);leafGeometry.computeVertexNormals();
      const canopy=mesh(leafGeometry,'#ffffff');canopy.name='shore-leaf-canopy';canopy.material.vertexColors=true;canopy.material.side=THREE.DoubleSide;tree.add(canopy);
      plant(dx*w,dz*d,tree);tree.position.y-=.004;
    }
    // A planted lower layer stays inside each existing bank parcel. Broad,
    // bowed leaves form small groups under the trees, never a ring of spikes.
    const positions=[],colors=[],indices=[],ray=new THREE.Raycaster();
    const green=new THREE.Color('#648866'),tipGreen=new THREE.Color('#9cae78');
    const clusters=[[-.29,.15,.94],[.27,.24,.88],[-.24,-.29,1],[.08,-.30,.82],[.30,-.14,.75],[-.04,.05,.93],[.02,.34,.72]];
    for(const [cluster,[dx,dz,scale]] of clusters.entries()){
      const cx=dx*w*.84,cz=dz*d*.84;
      ray.set(new THREE.Vector3(cx,1,cz),new THREE.Vector3(0,-1,0));
      const soil=ray.intersectObject(g.children[0],false)[0];if(!soil)continue;
      const baseY=soil.point.y-.0004,span=Math.min(w,d)*.17*scale;
      const phase=(seed%97)*.37+cluster*1.73;
      for(let blade=0;blade<13;blade++){
        const angle=phase+blade*2.39996,reach=span*(.78+(blade%3)*.14),height=span*(.76+(blade%4)*.13);
        const along=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle)),across=new THREE.Vector3(-Math.sin(angle),0,Math.cos(angle));
        const offset=positions.length/3;
        for(let step=0;step<=4;step++){
          const t=step/4,center=new THREE.Vector3(cx,baseY+height*(Math.sin(t*Math.PI)*.85+t*.15),cz).addScaledVector(along,reach*t);
          const halfWidth=span*.28*(.04+Math.pow(Math.sin(t*Math.PI),.8));
          const tone=green.clone().lerp(tipGreen,.18+t*.36+(blade%3)*.07);
          for(const side of [-1,0,1]){
            const p=center.clone().addScaledVector(across,halfWidth*side);
            if(side===0)p.y+=halfWidth*.28;
            positions.push(...p.toArray());colors.push(...tone.toArray());
          }
          if(step){const a=offset+(step-1)*3,b=offset+step*3;indices.push(a,b,a+1,a+1,b,b+1,a+1,b+1,a+2,a+2,b+1,b+2);}
        }
      }
    }
    const leaves=new THREE.BufferGeometry();leaves.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));leaves.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));leaves.setIndex(indices);leaves.computeVertexNormals();
    const undergrowth=mesh(leaves,'#ffffff');undergrowth.name='shore-understory';undergrowth.material.vertexColors=true;undergrowth.material.side=THREE.DoubleSide;g.add(undergrowth);
  }else if(garden.kind==='hill'){
    const hill=(x,z)=>{const u=x/(w*.5),v=z/(d*.5),rim=Math.max(0,1-u*u-v*v);return .115*Math.pow(rim,1.6)*(1+.16*Math.sin(u*5+v*2));};
    const terrain=new THREE.PlaneGeometry(w,d,32,20),positions=terrain.attributes.position,colors=[];
    const edge=new THREE.Color(palette.land),top=new THREE.Color('#698e6e');
    for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getY(i),h=hill(x,z);positions.setXYZ(i,x,Math.sqrt(R*R-x*x-z*z)-R+h-.012,z);colors.push(...edge.clone().lerp(top,Math.min(1,h/.12)).toArray());}
    terrain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const indices=terrain.index.array;for(let i=0;i<indices.length;i+=3)[indices[i],indices[i+2]]=[indices[i+2],indices[i]];terrain.computeVertexNormals();const mound=mesh(terrain,'#ffffff');mound.name='garden-hill-terrain';mound.material.vertexColors=true;g.add(mound);
    for(let row=-1;row<=1;row++)for(let col=-4;col<=4;col++){
      const x=col*w*.085,z=row*d*.21+.008*Math.sin(col*2),h=hill(x,z),r=Math.min(w/17,d/6);if(h<.025)continue;
      const tree=crown(r*1.1,.023,r*.9,(row+col)%3?palette.leaf:palette.leafDark);tree.material.color.set('#ffffff');tree.position.set(x,Math.sqrt(R*R-x*x-z*z)-R+h+.014,z);g.add(tree);
    }
  }else if(garden.kind==='woodland'){
    for(let row=0;row<2;row++)for(let col=0;col<6;col++){
      const r=Math.min(w/11,d/3.6),tree=new THREE.Group(),rise=.025+(col%3)*.006;
      const top=crown(r*1.1,rise,r*.92,(row+col)%3?palette.leaf:palette.leafLight);top.position.y=rise*.75;tree.add(top);
      plant((col-2.5)*w/6,(row-.5)*d*.45+.009*Math.sin(col*2),tree);
    }
  }else if(garden.kind==='grove'){
    for(const [dx,dz,s] of [[-.23,-.11,.94],[.18,-.10,1.03],[.01,.23,.80]]){
      const tree=new THREE.Group(),r=Math.min(w*.18,d*.28)*s;
      // Keep small island trunks proportional to their own crown footprint.
      const trunkRadius=Math.min(.0065*s,r*.15),trunk=mesh(new THREE.CylinderGeometry(trunkRadius*.68,trunkRadius,.055*s,8),palette.wood);
      trunk.position.y=.0275*s;tree.add(trunk);
      for(const [x,z] of [[-.32,.18],[.31,-.22]]){
        const start=new THREE.Vector3(0,.038*s,0),end=new THREE.Vector3(x*r,.079*s,z*r),dir=end.clone().sub(start);
        const fork=mesh(new THREE.CylinderGeometry(trunkRadius*.30,trunkRadius*.48,dir.length(),6),palette.wood);
        fork.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());fork.position.copy(start).add(end).multiplyScalar(.5);tree.add(fork);
      }
      // Related greens and offset lobes replace the old three-colour caps.
      const seed=Array.from(garden.id).reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0)|0,7)>>>0;
      for(const [i,[x,y,z,rx,ry,rz,color]] of [[0,.082,0,.80,.038,.76,'#78986f'],[-.36,.088,.20,.68,.030,.65,'#7c9972'],[.34,.074,-.24,.70,.032,.68,'#73946d'],[.11,.106,-.16,.64,.026,.60,'#809d76'],[-.13,.063,.31,.63,.026,.64,'#73936c']].entries()){
        const top=foliage(r*rx,ry*s,r*rz,color,(seed%31)+dx*17+dz*23+i*2.7,16);
        top.position.set(x*r,y*s,z*r);tree.add(top);
      }
      tree.scale.y=Math.min(1,Math.max(.3,Math.min(w,d)/.16));plant(dx*w,dz*d,tree);
      // Match the actual triangulated planting surface at this offset root.
      const soilHit=new THREE.Raycaster(new THREE.Vector3(tree.position.x,1,tree.position.z),new THREE.Vector3(0,-1,0)).intersectObject(g.children[0],false)[0];
      if(soilHit)tree.position.y=soilHit.point.y-.0006;
    }
  }else for(const [x,z,s] of [[-.28,-.03,.95],[.02,.12,1],[.28,-.08,.8]]){const bed=crown(w*.20*s,Math.min(.027,w*.35,d*.22)*s,d*.36*s,s===1?palette.leafLight:palette.leaf);bed.position.y=.02;const group=new THREE.Group();group.add(bed);plant(x*w,z*d,group);}
  return g;
}
export function measureGardens(){return GARDENS.map(g=>{const model=createGarden(g),box=new THREE.Box3().setFromObject(model),bounds={min:box.min.toArray(),max:box.max.toArray()};model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return {...g,id:'garden:'+g.id,scale:1,terrain:'land',buffer:g.buffer??.01,bounds};});}

export function createLandscape(options){return buildImmediately(createLandscapeSteps(options));}
export function* createLandscapeSteps({gardens=true}={}){
  const root=new THREE.Group();root.name='planet-base';
  const terrain=mesh(new THREE.SphereGeometry(R,96,72),'#ffffff'),tp=terrain.geometry.attributes.position,tc=[];
  for(let i=0;i<tp.count;i++)tc.push(...landColorAt(tp.getX(i)/R,tp.getY(i)/R,tp.getZ(i)/R).toArray());
  terrain.geometry.setAttribute('color',new THREE.Float32BufferAttribute(tc,3));terrain.material.vertexColors=true;root.add(terrain);yield;
  function waterSurface(outline,islands=[]){
  const water=geoPatch(outline,.003,palette.water,.065);water.material.dispose();water.material=waterMaterial();
  const colors=[],banks=[outline,...islands].map(outline=>outline.map(q=>v(normalAt(...q)))),pos=water.geometry.attributes.position,deep=new THREE.Color('#4d9fa4'),shallow=new THREE.Color('#76b5b0');
  // Measure distance to complete shore segments, including the islands and
  // causeways. The shallow rim stays continuous instead of pooling at vertices.
  const segments=banks.flatMap(bank=>bank.map((a,i)=>({a,b:bank[(i+1)%bank.length]})));
  for(let i=0;i<pos.count;i++){
    const n=new THREE.Vector3().fromBufferAttribute(pos,i).normalize();let distance=Infinity;
    for(const {a,b} of segments){const ab=b.clone().sub(a),t=THREE.MathUtils.clamp(n.clone().sub(a).dot(ab)/ab.lengthSq(),0,1);distance=Math.min(distance,n.distanceTo(a.clone().addScaledVector(ab,t)));}
    colors.push(...shallow.clone().lerp(deep,THREE.MathUtils.smoothstep(distance,.005,.085)).toArray());
  }
  water.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));water.material.color.set('#ffffff');water.material.vertexColors=true;return water;
  }
  const water=waterSurface(LAKE_OUTLINE,LAKE_LAND.map(land=>land.outline));water.name='west-lake-water';root.add(water);yield;
  root.add(createRiver());yield;
  root.add(lineOnSphere([...LAKE_OUTLINE,LAKE_OUTLINE[0]],.020,'#c8cfab',.005));
  // Low stone revetment, jointed along the bank instead of a raised circular base.
  const bank=sampleRoad([...LAKE_OUTLINE,LAKE_OUTLINE[0]]);
  for(let i=0;i<bank.length-1;i+=2){const n=bank[i],next=bank[Math.min(i+2,bank.length-1)],mid=n.clone().add(next).normalize(),tangent=next.clone().sub(n).normalize(),side=tangent.clone().cross(mid).normalize();if([n,mid,next].some(p=>LAKE_LAND.some(land=>inGround(p.toArray(),land))))continue;const edge=mesh(new THREE.BoxGeometry(Math.max(.001,n.distanceTo(next)*R-.0006),.010,.012),i%6?'#c8c6ac':'#b6bba0');edge.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent,mid,side));edge.position.copy(mid).multiplyScalar(R+.006);edge.name='stone-lakeshore';root.add(edge);yield;}
  for(const [i,land] of LAKE_LAND.entries()){const patch=geoPatch(land.outline,.006+i*.00015,palette.hill);patch.name='lake-land:'+land.id;root.add(patch);yield;}
  // Two inset ponds, a garden walk and a small waterside pavilion make the island legible.
  for(const [lon,lat,rx,ry] of [[-8,-5,2.0,3.2],[-2,-5,1.5,2.8]]){
    const points=Array.from({length:32},(_,i)=>[lon+Math.cos(i/32*Math.PI*2)*rx,lat+Math.sin(i/32*Math.PI*2)*ry]);
    const pond=geoPatch(points,.0075,'#68aba7');pond.name='island-pond';root.add(pond);
  }
  const islandWalk=lineOnSphere([[-10,-10],[-5,-10],[0,-10],[1,-5],[-2,-1.5],[-5,-.5],[-10,-2],[-10,-10]],.010,palette.road,.009);root.add(islandWalk);
  const islandPavilion=createPiece('pavilion',{vegetation:false});islandPavilion.scale.setScalar(.12);delete islandPavilion.userData.componentId;islandPavilion.name='island-pavilion';root.add(oriented(islandPavilion,{geo:[-5,-10],elevation:.008}));
  for(const geo of [[-11,-7],[-5,0],[1,-7]]){const group=createGarden({id:'island-bed',district:'lake',size:[.045,.045],kind:'bed'});root.add(oriented(group,{geo}));}
  for(const surface of DISTRICT_GROUNDS){
    const ground=geoPatch(surface.outline,surface.kind==='lawn'?.006:.004,surface.kind==='paving'?palette.paving:surface.kind==='lawn'?palette.land:palette.hill);
    if(surface.kind==='meadow'){
      const p=ground.geometry.attributes.position,outline=surface.outline.map(q=>v(normalAt(...q))),colors=[],interior=new THREE.Color(palette.hill);
      for(let i=0;i<p.count;i++){
        const n=new THREE.Vector3().fromBufferAttribute(p,i).normalize();let distance=Infinity;
        for(let j=0;j<outline.length;j++){const a=outline[j],ab=outline[(j+1)%outline.length].clone().sub(a),t=THREE.MathUtils.clamp(n.clone().sub(a).dot(ab)/ab.lengthSq(),0,1);distance=Math.min(distance,n.distanceTo(a.clone().addScaledVector(ab,t)));}
        colors.push(...landColorAt(n.x,n.y,n.z).lerp(interior,THREE.MathUtils.smoothstep(distance,0,.09)*.35).toArray());
      }
      ground.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));ground.material.color.set('#ffffff');ground.material.vertexColors=true;
    }
    ground.name='district-ground:'+surface.id;ground.userData.district=surface.district;ground.userData.groundId=surface.id;root.add(ground);yield;
  }
  root.add(promenadePaving(DISTRICT_GROUNDS.find(s=>s.id==='hubin-promenade'),DISTRICT_GROUNDS.filter(s=>s.kind==='lawn'&&s.district==='street')));
  // Water crossings belong to their bridge model. Removing the bridge leaves shore paths.
  for(const road of PUBLIC_ROADS){root.add(lineOnSphere(road.points,road.width,road.id==='sudi-walk'?'#788279':palette.road,.009,true));if(road.id==='sudi-walk')root.add(causewayStonePaving(sampleRoad(road.points),road.width));}
  for(const p of CONTEXT_PARCELS){const block=createContextBlock(p);block.name='context:'+p.id;root.add(oriented(block,{...p,elevation:.004}));root.add(lineOnSphere([entryGeo(p),...(p.via||[]),p.road],.018,palette.road));yield;}
  if(gardens)for(const garden of GARDENS){
    root.add(oriented(createGarden(garden),garden));
    if(garden.road){const path=lineOnSphere([entryGeo(garden),...(garden.via||[]),garden.road],garden.roadWidth??.022,palette.road);path.name='landmark-approach:'+garden.id;root.add(path);}
    yield;
  }
  yield* addPromenadeDetails(root);
  return root;
}

function* addPromenadeDetails(root){
  // Cast against the already-built ground only, so benches and people stand on
  // the paving instead of inheriting the buildings' raised base offset.
  root.updateMatrixWorld(true);const surfaces=root.children.filter(o=>o.isMesh),ray=new THREE.Raycaster();
  for(const prop of STREET_PROPS){const up=v(normalAt(...prop.geo));ray.set(up.clone().multiplyScalar(R+.06),up.clone().negate());const hit=ray.intersectObjects(surfaces,false)[0],elevation=hit?hit.point.length()-R+.0005:.004;
    root.add(oriented(createStreetProp(prop),{...prop,elevation}));yield;
  }
}
export function measureStreetProps(){return STREET_PROPS.map(p=>{const model=createStreetProp(p),box=new THREE.Box3().setFromObject(model),bounds={min:box.min.toArray(),max:box.max.toArray()};model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return {...p,id:'street:'+p.id,scale:1,buffer:.003,bounds};});}
export function createPlacedPiece(id){
  const p=PLACEMENTS.find(x=>x.id===id);if(!p)throw new Error('Unknown layout component: '+id);
  const root=new THREE.Group(),asset=createPiece(id,{vegetation:false});asset.scale.multiplyScalar(p.scale);
  root.name=id;root.userData.componentId=id;root.add(asset);
  const base=foundation(p);if(base)root.add(base);
  if(id==='greenhouse'){
    // Descend from the existing landing to the curved access path.
    const width=.12*p.scale,depth=.028*p.scale;
    for(let i=0;i<4;i++){
      const z=(.219+i*.025)*p.scale,top=(.032-i*.018)*p.scale;
      const bottom=Math.sqrt((R+.006)**2-(width/2)**2-(z+depth/2)**2)-(R+(p.elevation??.014))-.002;
      const step=mesh(new THREE.BoxGeometry(width,top-bottom,depth),palette.road);
      step.name='greenhouse-entry-step';step.position.set(0,(top+bottom)/2,z);root.add(step);
    }
  }
  if(id==='tea'){
    // Three low treads connect the existing tea terrace to the curved path.
    const width=.12*p.scale,depth=.029*p.scale;
    for(let i=0;i<3;i++){
      const z=(.172+i*.026)*p.scale,top=(.022-i*.020)*p.scale;
      const bottom=Math.sqrt((R+.006)**2-(width/2)**2-(z+depth/2)**2)-(R+(p.elevation??.014))-.002;
      const step=mesh(new THREE.BoxGeometry(width,top-bottom,depth),palette.road);
      step.name='tea-entry-step';step.position.set(0,(top+bottom)/2,z);root.add(step);
    }
  }
  const entrySteps={
    gallery:{x:0,z:.284,width:.25,depth:.032,spacing:.028,top:.012},
    courtyard:{x:0,z:.202,width:.12,depth:.029,spacing:.026,top:.022},
    fountain:{x:0,z:.192,width:.12,depth:.029,spacing:.026,top:.022},
    clockTower:{x:0,z:.167,width:.12,depth:.029,spacing:.026,top:.022},
    camping:{x:-.05,z:.192,width:.12,depth:.029,spacing:.026,top:.022},
  }[id];
  if(entrySteps){
    // Keep each original landing and descend only through its entrance gap.
    const x=entrySteps.x*p.scale,width=entrySteps.width*p.scale,depth=entrySteps.depth*p.scale;
    for(let i=0;i<3;i++){
      const z=(entrySteps.z+i*entrySteps.spacing)*p.scale,top=(entrySteps.top-i*.020)*p.scale;
      const bottom=Math.sqrt((R+.006)**2-(Math.abs(x)+width/2)**2-(z+depth/2)**2)-(R+(p.elevation??.014))-.002;
      const step=mesh(new THREE.BoxGeometry(width,top-bottom,depth),palette.road);
      step.name=id+'-entry-step';step.position.set(x,(top+bottom)/2,z);root.add(step);
    }
  }
  oriented(root,p);root.updateMatrixWorld(true);
  if(p.road){const road=lineOnSphere([entryGeo(p),...(p.via||[]),p.road],.026);road.geometry.applyMatrix4(root.matrixWorld.clone().invert());root.add(road);}
  return root;
}
