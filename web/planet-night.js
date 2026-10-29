import {createWaterfrontLightShow} from './planet-light-show.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {PLANET_RADIUS as R,PUBLIC_ROADS,RIVER_COURSE,GARDENS,CONTEXT_PARCELS,PLACEMENTS,normalAt,frameAt,terrainAt} from './planet-layout.js';
import {sampleRoad,entryGeo} from './planet-layout-scene.js';

export const NIGHT_STORAGE_KEY='travel-planet-night-v1';
export function readNightPreference(storage){try{return storage.getItem(NIGHT_STORAGE_KEY)==='true';}catch{return false;}}
export function saveNightPreference(storage,value){try{storage.setItem(NIGHT_STORAGE_KEY,String(Boolean(value)));}catch{}}

// A few light sources illuminate landmarks; merged fixtures and soft pools
// mark the rest of the streets without hundreds of real-time point lights.
export function createNightDistrict(){
  const root=new THREE.Group();root.name='night-district';root.visible=false;
  const posts=[],heads=[],accents=[],poolPositions=[],poolColors=[],poolIndices=[],positions=[];
  const warm=new THREE.Color('#ffc875'),pole=new THREE.MeshStandardMaterial({color:'#586677',roughness:.8});
  const lampMaterial=new THREE.MeshBasicMaterial({color:'#ffe0a0',toneMapped:false});
  function fixture(n,height=.032){
    const base=n.clone().multiplyScalar(R+.011),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n),matrix=new THREE.Matrix4().compose(base,q,new THREE.Vector3(1,1,1));
    posts.push(new THREE.CylinderGeometry(.0013,.0018,height,5).translate(0,height/2,0).applyMatrix4(matrix));
    heads.push(new THREE.SphereGeometry(.004,6,4).translate(0,height,0).applyMatrix4(matrix));positions.push(n.toArray());
    const tangent=new THREE.Vector3(0,1,0).cross(n).normalize();if(tangent.lengthSq()<.1)tangent.set(1,0,0);
    const across=n.clone().cross(tangent),start=poolPositions.length/3;
    poolPositions.push(...n.clone().multiplyScalar(R+.0118).toArray());poolColors.push(warm.r,warm.g,warm.b,.30);
    for(let i=0;i<=16;i++){
      const a=i*Math.PI/8,p=n.clone().multiplyScalar(R).addScaledVector(tangent,Math.cos(a)*.038).addScaledVector(across,Math.sin(a)*.038).normalize().multiplyScalar(R+.0118);
      poolPositions.push(...p.toArray());poolColors.push(warm.r,warm.g,warm.b,0);if(i)poolIndices.push(start,start+i,start+i+1);
    }
  }
  const approaches=[...GARDENS,...CONTEXT_PARCELS].filter(p=>p.road).map(p=>({id:p.id,width:p.roadWidth??.020,points:[entryGeo(p),...(p.via||[]),p.road]}));
  for(const road of [...PUBLIC_ROADS,...approaches]){
    const path=sampleRoad(road.points);let distance=1;
    for(let i=1;i<path.length-1;i++){
      distance+=path[i].distanceTo(path[i-1])*R;if(distance<.16||terrainAt(path[i].toArray())!=='land')continue;distance=0;
      const side=path[i+1].clone().sub(path[i-1]).cross(path[i]).normalize();
      const n=path[i].clone().multiplyScalar(R).addScaledVector(side,road.width/2-.003).normalize();fixture(n,road.id==='sudi-walk'?.026:.032);
    }
  }
  for(let i=4;i<RIVER_COURSE.length-4;i+=5){
    const [lon,n,s]=RIVER_COURSE[i];
    // Leave the city balcony's own architectural lighting in front.
    if(lon<151||lon>170)fixture(new THREE.Vector3(...normalAt(lon,n+1.1)));
    fixture(new THREE.Vector3(...normalAt(lon,s-1.1)));
  }
  function onParcel(parcel,x,y,z){
    const f=frameAt(...parcel.geo),m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...f.east),new THREE.Vector3(...f.up),new THREE.Vector3(...f.south));
    m.setPosition(new THREE.Vector3(...f.up).multiplyScalar(R+(parcel.elevation??.014)));m.multiply(new THREE.Matrix4().makeRotationY(parcel.turn||0));
    return new THREE.Vector3(x,y,z).applyMatrix4(m);
  }
  function poolLight(parcel,source,target,power,color){
    const spot=new THREE.SpotLight(color,power,.60,1.02,.8,2);spot.position.copy(onParcel(parcel,...source));spot.target.position.copy(onParcel(parcel,...target));spot.castShadow=false;root.add(spot,spot.target);
    return spot;
  }
  const temple=GARDENS.find(p=>p.id==='lingyin-temple');
  poolLight(temple,[0,.32,.15],[0,.10,-.02],.080,'#ffd6a0');
  for(const p of CONTEXT_PARCELS)poolLight({...p,elevation:.004},[.08,.45,.13],[0,.16,0],.048,'#ffdaa2');
  for(const id of ['pagoda','goldenBall']){
    const p=PLACEMENTS.find(p=>p.id===id),lamp=poolLight(p,[0,.42,.28],[0,.13,0],.045,'#ffd9a2');lamp.userData.optionalPiece=id;
  }
  // Shopfront emission preserves the glass depth; these two broad, shadow-free
  // sources also light the actual shoppers and paving between the buildings.
  const hubin=PLACEMENTS.find(p=>p.id==='cafe');
  for(const x of [-.19,.19]){
    const lamp=poolLight(hubin,[x,.16,.28],[x*.85,-.02,.26],.022,'#ffe0b0');
    lamp.name='hubin-shopping-lane-light';lamp.userData.optionalPiece='cafe';
  }
  function accent(parcel,points){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>onParcel(parcel,...p)));
    accents.push(new THREE.TubeGeometry(curve,Math.max(12,points.length*3),.00085,3,false));
  }
  // Concealed warm eave strips follow the existing architecture, with gaps
  // at corners so the night scene doesn't become a solid neon outline.
  for(const [z,y,w,d] of [[.158,.084,.261,.104],[-.043,.135,.290,.203],[-.043,.165,.261,.181],[-.043,.195,.232,.159],[-.204,.170,.276,.101]]){
    for(const side of [-1,1])accent(temple,[[-w*.46,y,z+side*d*.48],[0,y-.002,z+side*d*.48],[w*.46,y,z+side*d*.48]]);
  }
  for(const p of CONTEXT_PARCELS){
    if(p.id==='garden-lane')for(let k=0;k<13;k++){
      const r=.077-k*.0016,y=.014+k*.025+.027,pts=Array.from({length:9},(_,i)=>[Math.sin(i*Math.PI/4)*r,y,Math.cos(i*Math.PI/4)*r]);accent({...p,elevation:.004},pts);
    }
  }
  const bridgePoints=RIVER_COURSE.filter((_,i)=>i%3===0).map(([lon,n])=>new THREE.Vector3(...normalAt(lon,n+.12)).multiplyScalar(R+.010));
  accents.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bridgePoints),bridgePoints.length*2,.0007,3,false));
  for(const [geometry,material,name] of [[posts,pole,'night-path-posts'],[heads,lampMaterial,'night-path-lamps']]){
    const merged=mergeGeometries(geometry);for(const g of geometry)g.dispose();const mesh=new THREE.Mesh(merged,material);mesh.name=name;root.add(mesh);
  }
  const accentGeometry=mergeGeometries(accents);for(const g of accents)g.dispose();const trim=new THREE.Mesh(accentGeometry,new THREE.MeshBasicMaterial({color:'#c8a06b',toneMapped:false}));trim.name='night-eave-and-crown-strips';root.add(trim);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(poolPositions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(poolColors,4));g.setIndex(poolIndices);
  const pool=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));pool.name='night-path-light-pools';root.add(pool);
  root.add(createRiverLightReflections());
  root.userData.lampPositions=positions;
  return root;
}

// Broken colour glints sit on the actual river surface. A shared shader clock
// softly modulates their opacity; no mirrored scene or extra light sources.
export function createRiverLightReflections(){
  const positions=[],colors=[],indices=[];
  const landmarks=GARDENS.filter(p=>['river-tower','southbank-skyline','olympic-lotus'].includes(p.kind));
  for(const [index,p] of landmarks.entries()){
    const lon=p.geo[0],i=RIVER_COURSE.findIndex(r=>r[0]>=lon),a=RIVER_COURSE[i-1],b=RIVER_COURSE[i];
    const south=a[2]+(b[2]-a[2])*(lon-a[0])/(b[0]-a[0]);
    const color=new THREE.Color(p.kind==='olympic-lotus'?'#dc8be9':index%3===0?'#e4ba7b':'#77b9eb');
    for(let row=0;row<18;row++){
      const lat=south+.65+row*.36,shift=Math.sin(row*2.7+index)*.35,width=(p.kind==='olympic-lotus'?2.8:1.8)*(1-row/28)*(.76+.24*Math.sin(row*1.9+index)**2),thickness=.07+(row%3)*.035;
      const points=[];
      for(let j=0;j<=6;j++)for(const side of [-1,1])points.push(normalAt(lon+shift+(j/6-.5)*width,lat+side*thickness/2));
      if(points.some(n=>terrainAt(n)!=='water'))continue;
      const start=positions.length/3,opacity=.38*(1-row/18)**1.5;
      for(let n=0;n<points.length;n++){positions.push(...points[n].map(v=>v*(R+.0065)));const j=Math.floor(n/2);colors.push(color.r,color.g,color.b,opacity*Math.sin(j/6*Math.PI));}
      for(let j=0;j<6;j++){const k=start+j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geometry.setIndex(indices);
  const material=new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  material.userData.nightProfile={animation:'reflection'};
  const mesh=new THREE.Mesh(geometry,material);mesh.name='night-river-building-glints';return mesh;
}

export function createNightController(planet,lighting,riverLights){
  const district=createNightDistrict(),original=new Map(),show=createWaterfrontLightShow();planet.add(district);let enabled=false;
  show.register(district.getObjectByName('night-river-building-glints').material);
  const originalPower=new Map();riverLights.traverse(o=>{if(o.isLight)originalPower.set(o,{power:o.intensity,color:o.color.clone()});});
  function applyMaterials(){
    planet.traverse(o=>{if(!o.isMesh||!o.material?.emissive)return;const m=o.material;if(!original.has(m))original.set(m,{color:m.color.clone(),emissive:m.emissive.clone(),intensity:m.emissiveIntensity});show.register(m);const day=original.get(m),profile=m.userData.nightProfile;m.color.copy(day.color);m.emissive.copy(day.emissive);m.emissiveIntensity=enabled&&day.emissive.getHex()?Math.max(day.intensity*2.1,.65):day.intensity;if(enabled&&profile){m.color.set(profile.color);m.emissive.set(profile.emissive);m.emissiveIntensity=profile.intensity;}});
    district.traverse(o=>{if(o.userData.optionalPiece)o.visible=planet.children.some(p=>p.userData.componentId===o.userData.optionalPiece);});
  }
  return {
    get enabled(){return enabled;},
    set(value){enabled=Boolean(value);if(!enabled)show.update(0,false,false);district.visible=enabled;lighting.setNight(enabled);for(const [light,day] of originalPower){light.intensity=day.power*(enabled?5:1);light.color.copy(day.color);if(enabled&&light.name.startsWith('olympic-lotus'))light.color.set('#ca7eff');}applyMaterials();},
    refresh:applyMaterials,
    update(dt,reduced){return show.update(dt,enabled,reduced);},
    dispose(){show.dispose();district.removeFromParent();district.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});original.clear();}
  };
}
