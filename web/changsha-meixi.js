import * as THREE from 'three';
import {skin,bollards,people,glow} from './shenzhen-forms.js';
import {tree} from './wuhan-architecture.js';

const TAU=Math.PI*2;
const angleDistance=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
// Three independent buildings surround one public court: four, three and one
// unequal petals. Concave folds rise; the broad petal ends sweep down and out.
export const VENUES=[
  {id:'grand',x:.26,z:.28,r:.295,stretch:1.10,lobes:4,turn:.24,h:.29,entry:-2.45},
  {id:'gallery',x:.20,z:-.38,r:.225,stretch:1.08,lobes:3,turn:.41,h:.25,entry:2.1},
  {id:'small',x:-.43,z:-.10,r:.18,stretch:1.28,lobes:1,turn:-.42,h:.20,entry:.55},
];
function contour(a,q){
  const lobe=q.lobes===1?.93+.17*Math.cos(a):.86+.28*Math.cos(q.lobes*a)+.055*Math.sin(a+.3);
  const asymmetry=q.lobes===1?1:.94+.16*Math.cos(a-.6);
  const radial=q.r*lobe*asymmetry,xx=Math.cos(a)*radial*q.stretch,zz=Math.sin(a)*radial;
  return [q.x+xx*Math.cos(q.turn)-zz*Math.sin(q.turn),q.z+xx*Math.sin(q.turn)+zz*Math.cos(q.turn)];
}
function fold(a,q){
  if(q.lobes===1)return .48+.52*Math.exp(-((angleDistance(a,2.45)/.75)**2));
  const valley=Math.pow((1-Math.cos(q.lobes*a))/2,1.25);return .50+.46*valley;
}
function roofHeight(a,r,q){
  const center=.83,edge=fold(a,q),t=THREE.MathUtils.clamp((r-.22)/.78,0,1),blend=t*t*(3-2*t);
  return .028+q.h*(center*(1-blend)+edge*blend);
}
function point(a,r,y,q){const [x,z]=contour(a,q);return [q.x+(x-q.x)*r,y,q.z+(z-q.z)*r];}
function venue(k,g,q,p){
  const glass=k.mat('#477d89',.45,.13,'#9cc7d0');glass.userData.night.intensity=.22;
  const shell=k.mat('#d8dedb',.84,.06),joint=k.mat('#bac5c1',.90),reveal=k.mat('#809c9e',.72,.08);
  const roofMaterial=k.mat('#d8dedb',.94,.018);roofMaterial.userData.meixiRoof=q.id;
  shell.userData.venue=q.id;glass.userData.venue=q.id;
  const edgeY=a=>roofHeight(a,1,q);
  const entryCut=a=>.72*Math.exp(-((angleDistance(a+q.turn,q.entry)/.22)**2));
  const wallPoint=(a,f,offset=0)=>point(a,.95+.05*Math.sin(f*Math.PI)+offset,.024+(edgeY(a)-.024)*f,q);
  skin(k,g,(u,v)=>wallPoint(u*TAU,v),32,160,glass);
  for(const [lo,hi]of [[0,.20],[.29,.46],[.53,.70],[.76,1]]){
    skin(k,g,(u,v)=>{const a=u*TAU,cut=entryCut(a),f=THREE.MathUtils.lerp(Math.max(lo,cut),Math.max(hi,cut),v);return wallPoint(a,f,.007+.006*Math.sin(v*Math.PI));},10,160,shell);
  }
  // A closed fan roof avoids the central hole and the extruded-cookie profile.
  const pos=[q.x,roofHeight(0,0,q),q.z],idx=[];
  for(let j=1;j<=40;j++)for(let i=0;i<=160;i++){
    const a=i/160*TAU,r=j/40;pos.push(...point(a,r,roofHeight(a,r,q),q));
    if(i){const n=1+(j-1)*161+i;if(j===1)idx.push(0,n,n-1);else idx.push(n-162,n-161,n-1,n-161,n,n-1);}
  }
  const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));roofGeo.setIndex(idx);roofGeo.computeVertexNormals();k.mesh(g,roofGeo,roofMaterial);
  // Sparse curved panel joints stay quiet. Short dark skylight slits belong to
  // the individual petals, rather than full concentric circles around the roof.
  for(const radius of [.40,.62,.82])k.line(g,Array.from({length:161},(_,i)=>{const a=i/160*TAU;return point(a,radius,roofHeight(a,radius,q)+.001,q);}),.00045,joint,true);
  const skylights=[];
  for(let l=0;l<q.lobes;l++)for(const r of [.62,.79]){
    const center=l*TAU/q.lobes,span=q.lobes===1?.98:.68;
    skin(k,g,(u,v)=>{const a=center+(u-.5)*span,rr=r+(v-.5)*.022*Math.sin(u*Math.PI);return point(a,rr,roofHeight(a,rr,q)+.0016,q);},4,28,glass);skylights.push([center,r]);
  }
  for(let i=0;i<54;i++){
    const a=i/54*TAU;
    for(const [lo,hi]of [[.20,.29],[.46,.53],[.70,.76]])k.beam(g,wallPoint(a,lo,.001),wallPoint(a,hi,.001),.0007,reveal,4);
  }
  // The high glazed entry faces the shared court; mullions follow its arch.
  for(let i=-4;i<=4;i++){
    const a=q.entry-q.turn+i*.035,top=entryCut(a);
    if(top>.05)k.beam(g,wallPoint(a,.015,.001),wallPoint(a,top,.001),.0011,joint,4);
  }
  for(const f of [.20,.70]){
    const strip=[];for(let i=0;i<=160;i++){const a=i/160*TAU;strip.push(wallPoint(a,Math.max(f,entryCut(a)),.014));}k.line(g,strip,.0011,p.cool,true);
  }
  const outline=Array.from({length:160},(_,i)=>contour(i/160*TAU,q));return {...q,outline,skylights};
}
function smoothOutline(points){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');return curve.getPoints(128).slice(0,-1).map(v=>[v.x,v.z]);}
function flatPatch(k,g,points,y,mat){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geo=new THREE.ShapeGeometry(shape,32);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);return k.mesh(g,geo,mat);
}
export function meixi(k){
  const g=new THREE.Group(),p={stone:k.mat('#bcc4ba',.96),curb:k.mat('#d4d9ce',.92),green:k.mat('#72886a',.96),water:k.mat('#517f7d',.55,.10),cool:glow(k,'#c5e3df',.50,3,.30),warm:glow(k,'#e8d3ad',.70)},buildings=[];
  p.stone.userData.groundSurface=true;
  const site=smoothOutline([[-.73,.50],[-.18,.73],[.69,.69],[.83,.24],[.74,-.59],[.12,-.76],[-.69,-.55]].reverse());
  // Regular radial subdivisions keep the slab flush when wrapped onto the globe.
  const pos=[0,.016,0],idx=[];
  for(let ring=1;ring<=30;ring++)for(let i=0;i<=128;i++){
    const [x,z]=site[i%128];pos.push(x*ring/30,.016,z*ring/30);
    if(i){const n=1+(ring-1)*129+i;if(ring===1)idx.push(0,n,n-1);else idx.push(n-130,n-129,n-1,n-129,n,n-1);}
  }
  const floor=new THREE.BufferGeometry();floor.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));floor.setIndex(idx);floor.computeVertexNormals();k.mesh(g,floor,p.stone);
  for(const q of VENUES)buildings.push(venue(k,g,q,p));
  const beds=[
    [[-.67,.12],[-.39,.18],[-.31,.38],[-.40,.53],[-.65,.41]],
    [[-.52,-.48],[-.32,-.42],[-.27,-.60],[-.49,-.63]],
    [[.54,-.58],[.69,-.48],[.70,-.20],[.58,-.17],[.57,-.39]],
    [[.65,.47],[.67,.62],[.38,.64],[.47,.56]],
  ];
  for(const control of beds){
    const border=smoothOutline(control);flatPatch(k,g,border,.023,p.curb);const center=border.reduce((a,b)=>[a[0]+b[0]/border.length,a[1]+b[1]/border.length],[0,0]);flatPatch(k,g,border.map(([x,z])=>[center[0]+(x-center[0])*.87,center[1]+(z-center[1])*.87]),.027,p.green);
  }
  // Dark sunken courts sit at the perimeter, leaving the central plaza open.
  for(const control of [ [[-.70,.03],[-.66,-.10],[-.67,-.27],[-.75,-.22]], [[.57,-.67],[.66,-.63],[.55,-.55],[.49,-.58]] ])flatPatch(k,g,smoothOutline(control),.020,p.water);
  const paths=[[[-.17,.66],[-.25,.42],[-.20,.20],[-.13,.035]],[[-.68,-.42],[-.20,-.36],[-.12,-.22],[-.13,.035]],[[.73,-.03],[.51,-.08],[.26,-.04],[.04,-.02],[-.13,.035]]];
  for(const controls of paths){
    const curve=new THREE.CatmullRomCurve3(controls.map(([x,z])=>new THREE.Vector3(x,.019,z)),false,'centripetal');
    const points=curve.getPoints(70);for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],mid=a.clone().add(b).multiplyScalar(.5),m=k.box(g,.035,.002,a.distanceTo(b)+.0005,p.curb,...mid.toArray());m.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);}
  }
  for(const [x,z]of [[-.58,.34],[-.43,-.52],[.64,-.37],[.60,.59]])tree(k,g,x,.027,z,.07);
  bollards(k,g,[[-.27,.54],[-.24,.27],[-.57,-.35],[-.22,-.22],[.54,-.07],[.29,-.07],[.57,.58]],'#e7d5b4');people(k,g,[[-.15,.02],[-.20,.07],[-.24,.39],[.40,-.05],[.45,-.06],[.02,-.04]]);
  g.userData={venues:buildings,site,paths,centralCourt:[-.13,.035]};k.merge(g);
  for(const [x,z]of [[-.18,.14],[.04,-.12],[-.25,-.06]]){
    const light=new THREE.PointLight('#f5dab4',0,.38,2);light.position.set(x,.09,z);light.userData.nightIntensity=.006;g.add(light);
  }
  return g;
}
