import * as THREE from 'three';
import {PLANET_RADIUS as R,PLACEMENTS,PUBLIC_ROADS,RIVER_COURSE,DISTRICT_GROUNDS,normalAt,createGrid,footprintFrame,footprintCells,projectToFrame,polygonsOverlap,terrainAt,inGround,dot} from './planet-layout.js';
import {measurePieces,measureContext,measureGardens,measureStreetProps,sampleRoad,entryGeo,oriented,createLandscape,createPlacedPiece} from './planet-layout-scene.js';
export {measurePieces,measureGardens,measureStreetProps,sampleRoad} from './planet-layout-scene.js';
const v=a=>new THREE.Vector3(...a);
const palette={block:'#d9d8d0',hill:'#aebaa3',roof:'#a8aaa1',lot:'#8b9c93',grid:'#7e8e7d'};
function mesh(g,c){return new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:.88}));}
function volume(p){
  const g=new THREE.Group(),size=p.bounds.max.map((x,i)=>(x-p.bounds.min[i])*p.scale),center=p.bounds.max.map((x,i)=>(x+p.bounds.min[i])/2*p.scale);
  const body=mesh(new THREE.BoxGeometry(...size),p.id==='mountains'?palette.hill:palette.block);body.position.set(...center);g.add(body);
  const roof=mesh(new THREE.BoxGeometry(size[0]*.94,.012,size[2]*.94),palette.roof);roof.position.set(center[0],p.bounds.max[1]*p.scale+.004,center[2]);g.add(roof);
  g.name=p.id;g.userData.componentId=p.id;return oriented(g,p);
}
function footprintLines(frame,color=palette.lot){const points=frame.world.map(n=>v(n).multiplyScalar(R+.019));points.push(points[0]);return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity:.65}));}
function footprintSamples(frame){
  const lo=frame.polygon[0],hi=frame.polygon[2],nx=Math.max(1,Math.ceil((hi[0]-lo[0])/.025)),nz=Math.max(1,Math.ceil((hi[1]-lo[1])/.025)),result=[];
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++)result.push(v(frame.up).multiplyScalar(R).addScaledVector(v(frame.east),lo[0]+(hi[0]-lo[0])*i/nx).addScaledVector(v(frame.south),lo[1]+(hi[1]-lo[1])*j/nz).normalize().toArray());
  return result;
}
export function validateLayout(pieces=measurePieces(),{streetProps=measureStreetProps()}={}){
  const context=measureContext(),gardens=measureGardens(),all=[...pieces,...context,...gardens],grid=createGrid(),frames=all.map(p=>({p,f:footprintFrame(p,p.bounds,p.buffer??.025)})),collisions=[],terrain=[],occupancy={},roadCollisions=[],roadWater=[],disconnected=[],reservedSpaceConflicts=[];
  const openSpaces=DISTRICT_GROUNDS.filter(s=>s.keepOpen);
  for(const {p,f} of frames){
    occupancy[p.id]=footprintCells(f,grid);
    if(p.terrain==='land'&&footprintSamples(f).some(n=>terrainAt(n)==='water'))terrain.push({id:p.id,expected:'land'});
    if(p.terrain==='water'&&footprintSamples(f).some(n=>terrainAt(n)!=='water'))terrain.push({id:p.id,expected:'water'});
    for(const space of openSpaces){const normals=space.outline.map(q=>normalAt(...q));if(dot(normals[0],f.up)<.6)continue;const projected=normals.map(n=>projectToFrame(n,f));if(projected.every(Boolean)&&polygonsOverlap(f.polygon,projected))reservedSpaceConflicts.push({space:space.id,component:p.id});}
  }
  for(let i=0;i<frames.length;i++)for(let j=i+1;j<frames.length;j++){
    const a=frames[i],b=frames[j];if(dot(a.f.up,b.f.up)<.6)continue;
    const projected=b.f.world.map(n=>projectToFrame(n,a.f));if(projected.every(Boolean)&&polygonsOverlap(a.f.polygon,projected))collisions.push([a.p.id,b.p.id]);
  }
  const roads=[...PUBLIC_ROADS,...all.filter(p=>p.road).map(p=>({id:'entry:'+p.id,owner:p.id,points:[entryGeo(p),...(p.via||[]),p.road],width:p.roadWidth??(context.includes(p)?.018:gardens.includes(p)?.022:.026)}))];
  // The continuous river promenades are public access too; they are rendered
  // by createRiver, so no duplicate paving is needed for connected entrances.
  const publicSamples=[...PUBLIC_ROADS.flatMap(r=>sampleRoad(r.points)),...RIVER_COURSE.flatMap(([lon,n,s])=>[v(normalAt(lon,n+1.1)),v(normalAt(lon,s-1.1))])];
  for(const road of roads){const blocked=new Set();let wet=false;
    const crossedSpaces=new Set();
    for(const sample of sampleRoad(road.points)){
      const normal=sample.toArray();
      for(const space of openSpaces)if(inGround(normal,space))crossedSpaces.add(space.id);
      if(terrainAt(normal)==='water'){
        const bridge=frames.find(x=>x.p.terrain==='bridge'),q=bridge&&projectToFrame(normal,bridge.f);
        if(!q||q[0]<bridge.f.polygon[0][0]||q[0]>bridge.f.polygon[1][0]||q[1]<bridge.f.polygon[0][1]||q[1]>bridge.f.polygon[2][1])wet=true;
      }
      for(const p of all){if(p.id===road.owner||(p.terrain==='rail'&&road.id==='district-loop')||(p.terrain==='bridge'&&road.id==='lake-walk'))continue;
        const f=footprintFrame(p,p.bounds,road.width/2+(p.accessClearance??.01));if(dot(normal,f.up)<.8)continue;const q=projectToFrame(normal,f);
        if(q&&q[0]>f.polygon[0][0]&&q[0]<f.polygon[1][0]&&q[1]>f.polygon[0][1]&&q[1]<f.polygon[2][1])blocked.add(p.id);
      }
    }
    if(blocked.size)roadCollisions.push({road:road.id,components:[...blocked]});if(wet)roadWater.push(road.id);
    for(const space of crossedSpaces)reservedSpaceConflicts.push({space,road:road.id});
    if(road.owner){const last=v(normalAt(...road.points.at(-1)));if(Math.min(...publicSamples.map(n=>n.distanceTo(last)*R))>.04)disconnected.push(road.id);}
  }
  const propFrames=streetProps.map(p=>({p,f:footprintFrame(p,p.bounds,p.buffer)})),propCollisions=[],propTerrain=[],propRoadConflicts=[];
  const overlap=(a,b)=>{if(dot(a.f.up,b.f.up)<.6)return false;const q=b.f.world.map(n=>projectToFrame(n,a.f));return q.every(Boolean)&&polygonsOverlap(a.f.polygon,q);};
  for(const a of propFrames){
    occupancy[a.p.id]=footprintCells(a.f,grid);
    if(footprintSamples(a.f).some(n=>terrainAt(n)==='water'))propTerrain.push(a.p.id);
    if(a.p.type!=='visitor')for(const space of openSpaces){const q=space.outline.map(n=>normalAt(...n));if(dot(q[0],a.f.up)<.6)continue;const projected=q.map(n=>projectToFrame(n,a.f));if(projected.every(Boolean)&&polygonsOverlap(a.f.polygon,projected))reservedSpaceConflicts.push({space:space.id,component:a.p.id});}
    for(const b of frames.slice(0,pieces.length+context.length))if(overlap(a,b))propCollisions.push([a.p.id,b.p.id]);
    if(a.p.type!=='visitor')for(const road of roads){const f=footprintFrame(a.p,a.p.bounds,road.width/2+.003);
      if(sampleRoad(road.points).some(n=>{if(dot(n.toArray(),f.up)<.8)return false;const q=projectToFrame(n.toArray(),f);return q&&q[0]>f.polygon[0][0]&&q[0]<f.polygon[1][0]&&q[1]>f.polygon[0][1]&&q[1]<f.polygon[2][1];}))propRoadConflicts.push({prop:a.p.id,road:road.id});
    }
  }
  for(let i=0;i<propFrames.length;i++)for(let j=i+1;j<propFrames.length;j++)if(overlap(propFrames[i],propFrames[j]))propCollisions.push([propFrames[i].p.id,propFrames[j].p.id]);
  return {components:pieces.length,contextBlocks:context.length,gardens:gardens.length,streetProps:streetProps.length,propCollisions,propTerrain,propRoadConflicts,cells:grid.length,collisions,terrain,roadCollisions,roadWater,disconnected,reservedSpaceConflicts,protectedOpenSpaces:openSpaces.map(s=>s.id),occupancy,measurements:[...all,...streetProps].map(p=>({id:p.id,geo:p.geo,scale:p.scale,bounds:p.bounds,height:p.bounds.max[1]*p.scale}))};
}
export function createBlockout({details=false,grid=false,selection=PLACEMENTS.map(p=>p.id)}={}){
  const root=new THREE.Group();root.name='LayoutCandidate';root.add(createLandscape({gardens:details}));
  for(const p of measurePieces())if(selection.includes(p.id)){root.add(details?createPlacedPiece(p.id):volume(p));if(grid)root.add(footprintLines(footprintFrame(p,p.bounds)));}
  if(grid)for(const cell of createGrid()){
    const points=cell.corners.map(n=>v(n).multiplyScalar(R+.010));points.push(points[0]);
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:palette.grid,transparent:true,opacity:.24})));
  }
  root.userData.layoutReport=validateLayout();return root;
}
