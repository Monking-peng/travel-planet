import * as THREE from 'three';
import {glow,plaza,palm,bollards,people} from './shenzhen-forms.js';

const RX=.72,RZ=.325;
const stadium={x:-.34,z:0,rx:.235,rz:.177};
const arena={x:.22,z:-.025,rx:.177,rz:.142};
const pool={x:.50,z:.015,rx:.116,rz:.112};
const court={x:-.025,z:-.015,rx:.060,rz:.058};
const ellipse=(x,z,q)=>((x-q.x)/q.rx)**2+((z-q.z)/q.rz)**2;
export function cocoonHeight(x,z){
  const inside=Math.max(0,1-(x/RX)**2-(z/RZ)**2);
  const entry=.070*Math.exp(-((x/.13)**2))*Math.min(1,Math.abs(z)/RZ)**4;
  const crown=.203+.025*Math.exp(-(((x+.36)/.23)**2))-.025*Math.exp(-((x/.12)**2));
  return .031+crown*Math.pow(inside,.34)+entry;
}
function meshData(k,g,positions,m){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();return k.mesh(g,geo,m);}
function quad(p,a,b,c,d){p.push(...a,...b,...c,...a,...c,...d);}
function point(x,z,lift=0){return [x,cocoonHeight(x,z)+lift,z];}
function ribbon(k,g,q,a,b,m){
  const p=[],n=160;
  for(let i=0;i<n;i++){
    const u=i/n*Math.PI*2,v=(i+1)/n*Math.PI*2;
    const at=(angle,r,lift)=>point(q.x+Math.cos(angle)*q.rx*r,q.z+Math.sin(angle)*q.rz*r,lift);
    const A=at(u,b,.002),B=at(u,a,.002),C=at(v,a,.002),D=at(v,b,.002);
    quad(p,A,B,C,D);quad(p,at(u,a,-.005),at(u,b,-.005),at(v,b,-.005),at(v,a,-.005));
    quad(p,B,at(u,a,-.005),at(v,a,-.005),C);quad(p,D,at(v,b,-.005),at(u,b,-.005),A);
  }
  return meshData(k,g,p,m);
}
function roofInset(k,g,q,m){
  const p=[],rows=10,cols=80,at=(i,j)=>point(q.x+q.rx*i/rows*Math.cos(j/cols*Math.PI*2),q.z+q.rz*i/rows*Math.sin(j/cols*Math.PI*2),-.002);
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)quad(p,at(i,j),at(i,j+1),at(i+1,j+1),at(i+1,j));
  return meshData(k,g,p,m);
}
export function cocoon(k){
  const g=new THREE.Group(),white=k.mat('#d8ddd7',.62,.18),lining=k.mat('#60716c',.80),roof=k.mat('#c4cecc',.64,.24),glass=k.mat('#486a73',.38,.22),stone=plaza(k,g,.765,.405,'#c5c8bb'),rail=k.mat('#829695',.55,.28);
  white.userData.night={color:new THREE.Color('#f4d8ae'),intensity:.19};white.userData.cocoonLattice=true;
  roof.userData.night={color:new THREE.Color('#bdd9df'),intensity:.13};roof.userData.cocoonClosedRoof=true;
  glass.userData.night={color:new THREE.Color('#ffc477'),intensity:.56};
  const lamps=Array.from({length:4},(_,i)=>glow(k,'#e4eff2',.67,i*.8,.28));lamps.forEach(m=>m.color.set('#b8c6c6'));
  const grid=[],px=.028,pz=.025,segments=24;
  // One porous shell, rather than two intersecting transparent hemispheres.
  for(let i=-26;i<=26;i++)for(let j=-13;j<=13;j++){
    if((i+j)%2)continue;
    const x=i*px,z=j*pz;
    const valid=(xx,zz)=>((xx/RX)**2+(zz/RZ)**2)<.99&&[stadium,arena,pool,court].every(q=>ellipse(xx,zz,q)>1.02);
    const corners=[[x+px,z],[x,z+pz],[x-px,z],[x,z-pz]];
    if(!corners.every(([xx,zz])=>valid(xx,zz)))continue;
    const inner=[],outer=[],bottomInner=[],bottomOuter=[];
    for(let n=0;n<segments;n++){
      const a=n/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ro=1/(Math.abs(c)+Math.abs(s)),ri=.74/Math.pow(Math.abs(c)**1.35+Math.abs(s)**1.35,1/1.35);
      outer.push(point(x+c*ro*px,z+s*ro*pz,.001));inner.push(point(x+c*ri*px,z+s*ri*pz,.001));bottomOuter.push(point(x+c*ro*px,z+s*ro*pz,-.006));bottomInner.push(point(x+c*ri*px,z+s*ri*pz,-.006));
    }
    for(let n=0;n<segments;n++){const b=(n+1)%segments;quad(grid,outer[n],inner[n],inner[b],outer[b]);quad(grid,bottomInner[n],bottomOuter[n],bottomOuter[b],bottomInner[b]);quad(grid,inner[n],bottomInner[n],bottomInner[b],inner[b]);}
    if((i+2*j)%4===0){const v=point(x+px,z,.003);k.mesh(g,new THREE.IcosahedronGeometry(.003,0),lamps[(i-j+80)%4],...v);}
  }
  meshData(k,g,grid,white);
  // The steep lower skin remains open: diamond ribs follow the curved wall to its foot.
  const lower=k.mat('#d4d9d1',.65,.16);lower.userData.night={color:new THREE.Color('#ffce8e'),intensity:.38};lower.userData.cocoonLattice=true;
  const perimeter=100,step=Math.PI*2/perimeter,start=Math.asin(.91);
  for(let i=0;i<perimeter;i++)for(const direction of [-1,1]){
    const pts=[];
    for(let j=0;j<=16;j++){
      const t=j/16,r=Math.sin(start+(Math.PI/2-start)*t),a=(i+direction*t*3)*step;
      pts.push(point(Math.cos(a)*RX*r,Math.sin(a)*RZ*r,.001));
    }
    k.line(g,pts,.0022,lower);
  }
  for(const r of [.915,1]){const pts=Array.from({length:161},(_,i)=>{const a=i/160*Math.PI*2;return point(Math.cos(a)*RX*r,Math.sin(a)*RZ*r,.001);});k.line(g,pts,.002,white);}

  for(const q of [stadium,arena,pool,court])ribbon(k,g,q,1,1.10,white);
  roofInset(k,g,arena,roof);roofInset(k,g,pool,roof);
  const roofSeam=k.mat('#a5b5b4',.68,.18);
  for(const q of [arena,pool])for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2,pts=[];for(let j=0;j<=12;j++){const r=j/12;pts.push(point(q.x+Math.cos(a)*q.rx*r,q.z+Math.sin(a)*q.rz*r,-.0008));}k.line(g,pts,.0007,roofSeam);
  }
  // The enclosed hall volumes sit behind the open lattice, leaving a shaded concourse.
  for(const q of [arena,pool]){
    const body=k.cyl(g,1,1,.111,glass,q.x,.073,q.z,64);body.scale.set(q.rx*.87,1,q.rz*.85);
    for(let i=0;i<60;i++){const a=i/60*Math.PI*2,x=q.x+Math.cos(a)*q.rx*.88,z=q.z+Math.sin(a)*q.rz*.86;k.cyl(g,.001,.001,.11,rail,x,.074,z,4);}
    for(const y of [.045,.083,.12]){const pts=Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*2;return[q.x+Math.cos(a)*q.rx*.89,y,q.z+Math.sin(a)*q.rz*.87];});k.line(g,pts,.0012,rail,true);}
  }
  const bowl=k.mat('#718a83',.91),seats=k.mat('#bdc9c1',.86);
  const floor=k.cyl(g,1,1,.008,lining,stadium.x,.024,0,80);floor.scale.set(.175,1,.117);
  for(let row=0;row<8;row++){
    const ring=k.mesh(g,new THREE.RingGeometry(1,1.075,96),row%2?bowl:seats,stadium.x,.031+row*.014,0);ring.rotation.x=-Math.PI/2;ring.scale.set(.175+row*.0065,.117+row*.0068,1);
  }
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2;for(let row=0;row<8;row++)k.box(g,.007,.003,.009,stone,stadium.x+Math.cos(a)*(.178+row*.0065),.034+row*.014,Math.sin(a)*(.119+row*.0068));
  }
  // The central tree court folds down from the continuous canopy into a latticed funnel.
  for(let i=0;i<24;i++)for(const direction of [-1,1]){
    const pts=[];for(let j=0;j<=10;j++){const t=j/10,a=i/24*Math.PI*2+direction*t*.65,rx=.024+(.060-.024)*t,rz=.023+(.058-.023)*t,x=court.x+Math.cos(a)*rx,z=court.z+Math.sin(a)*rz;pts.push([x,.022+(cocoonHeight(court.x+Math.cos(a)*court.rx,court.z+Math.sin(a)*court.rz)-.022)*t,z]);}k.line(g,pts,.002,white);
  }
  for(const x of [-.56,-.16,.20,.54])for(const side of [-1,1]){
    const z=side*.22,top=cocoonHeight(x,z)-.018;k.beam(g,[x,.016,z],[x,top*.52,z],.004,rail,8);
    for(const dx of [-.035,.035])k.beam(g,[x,top*.52,z],[x+dx,cocoonHeight(x+dx,z)-.006,z],.003,rail,6);
  }
  const paving=k.mat('#a8b2aa',.94);
  for(const side of [-1,1]){
    k.box(g,.15,.003,.19,paving,0,.016,side*.30);
    for(let i=-3;i<=3;i++)k.box(g,.001,.001,.19,stone,i*.02,.018,side*.30);
    const q=new THREE.Group();q.position.set(.20,0,side*.25);g.add(q);k.box(q,.22,.032,.035,glass,0,.033,0);k.box(q,.24,.006,.052,roof,0,.053,0);for(let i=-4;i<=4;i++)k.box(q,.0015,.032,.037,white,i*.024,.032,0);
  }
  for(const x of [-.64,.64])for(const z of [-.28,.28])palm(k,g,x,.013,z,.085);
  bollards(k,g,[[-.51,.34],[-.25,.36],[.16,.35],[.47,.33],[-.11,-.35],[.13,-.35]]);people(k,g,[[-.02,.31],[.02,.33],[.035,.29],[.16,.31],[.25,.34],[-.30,.34]]);
  k.merge(g);
  for(const x of [-.32,.30]){
    const lamp=new THREE.PointLight('#ffd29a',0,.46,2);lamp.position.set(x,.08,.20);lamp.userData.nightIntensity=.0023;g.add(lamp);
  }
  return g;
}
