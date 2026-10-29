import * as THREE from 'three';
import {university as library} from './wuhan-eastlake.js';
import {roof,plaque,stairs} from './wuhan-architecture.js';

const R=2.15;
const groundY=(x,z)=>Math.sqrt(Math.max(.1,R*R-x*x-z*z))-R;
function place(g,o,x,z,lift=0){const y=groundY(x,z);o.position.set(x,y+lift,z);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(x,y+R,z).normalize());g.add(o);return o;}

export function universityCampus(k){
 const g=new THREE.Group(),stone=k.mat('#bdbbad',.95),wall=k.mat('#c3bcaa',.92),trim=k.mat('#e2d6be',.9),tile=k.mat('#486e60',.85),wood=k.mat('#6c4238',.85),window=k.mat('#354947',.6,.1,'#efc88e'),lamp=k.mat('#c3a56c',.55,.08,'#ffdcaa'),bark=k.mat('#69564f',.96);
 window.userData.night.intensity=.31;lamp.userData.night.intensity=2.3;
 const blossoms=['#f0e5e7','#e4cdd7','#f5eeeb','#d8b5c6'].map((c,i)=>{const m=k.mat(c,.98,0,'#e9aebf');m.userData.night.intensity=.055+i*.016;return m;});
 const greenery=k.mat('#7d8e68',.98);
 // Paths conform to the sphere; buildings sit on individual terraces.
 function path(points,w,mat,lift=.012){const vs=[],ix=[];for(let i=0;i<points.length;i++){const [x,z]=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1;for(const s of [-1,1]){const xx=x+s*dz/len*w/2,zz=z-s*dx/len*w/2;vs.push(xx,groundY(xx,zz)+lift,zz);}if(i){const n=i*2;ix.push(n-2,n,n-1,n-1,n,n+1);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ix);geo.computeVertexNormals();mat.side=THREE.DoubleSide;k.mesh(g,geo,mat);}
 const road=t=>[-.93+t*1.86,.43+.09*Math.sin((t-.5)*Math.PI)];
 const pts=Array.from({length:101},(_,i)=>road(i/100));path(pts,.19,stone);
 for(const s of [-1,1])path(pts.map(([x,z])=>[x,z+s*.103]),.012,trim,.014);
 path(Array.from({length:61},(_,i)=>[0,.49-i/60*.92]),.16,stone);
 for(let i=0;i<58;i++){const t=(i+.5)/58,[x,z]=road(t);path([[x-.004,z-.088],[x+.004,z+.088]],.0028,trim,.014);}
 // Existing old library, enlarged, with its own surrounding terrace rather than the old token trees.
 const lib=library(k,{trees:false});lib.scale.multiplyScalar(1.15);place(g,lib,0,-.55,.055);
 // The historic dormitory's four connected blocks and three vaulted entrances.
 const dorm=new THREE.Group();
 for(const x of [-.54,-.18,.18,.54]){
  k.box(dorm,.30,.225,.23,wall,x,.1125,0);k.box(dorm,.316,.012,.246,trim,x,.233,0);
  for(const z of [-.121,.121])for(let row=0;row<3;row++)for(let col=0;col<5;col++){const xx=x+(col-2)*.048,yy=.047+row*.063;k.box(dorm,.023,.037,.003,wood,xx,yy,z);k.box(dorm,.002,.038,.005,trim,xx,yy,z);k.box(dorm,.024,.002,.005,trim,xx,yy,z);}
  for(let row=0;row<13;row++)k.box(dorm,.299,.0012,.002,trim,x,.014+row*.016,.118);
  roof(k,dorm,.31,.25,.045,.246,tile,tile,x,0);
 }
 for(const x of [-.36,0,.36]){
  const arch=new THREE.Shape();arch.moveTo(-.06,0);arch.lineTo(-.06,.135);arch.absarc(0,.135,.06,Math.PI,0,true);arch.lineTo(.06,0);arch.lineTo(.045,0);arch.lineTo(.045,.135);arch.absarc(0,.135,.045,0,Math.PI,false);arch.lineTo(-.045,0);arch.closePath();
  const ge=new THREE.ExtrudeGeometry(arch,{depth:.24,bevelEnabled:false,curveSegments:14});k.mesh(dorm,ge,trim,x,0,-.12);k.box(dorm,.115,.040,.242,wall,x,.214,0);k.box(dorm,.125,.012,.25,trim,x,.241,0);
  stairs(k,dorm,.087,.22,.055,stone,x,.21,12);for(let j=0;j<7;j++)k.box(dorm,.084,.004,.023,stone,x,.055+j*.013,.08-j*.026);
 }
 plaque(k,dorm,'樱园老斋舍',.15,.029,0,.218,.126);place(g,k.merge(dorm),0,-.04,.025);
 // Mature cherry trees: spreading branches and many small blossom clusters.
 function sakura(seed){const t=new THREE.Group(),h=.205+(seed%5)*.008;k.cyl(t,.0045,.009,h*.66,bark,0,h*.31,0,8);
  for(let b=0;b<6;b++){const a=b*2.399+seed*.51,reach=.048+(b%3)*.014,tip=[Math.cos(a)*reach,h*(.78+(b%2)*.12),Math.sin(a)*reach];k.beam(t,[0,h*.42,0],tip,.0029,bark,6);
   for(let c=0;c<5;c++){const a2=a+c*2.4,r=.021+(c%2)*.015,x=tip[0]+Math.cos(a2)*r,y=tip[1]+.010+(c%3)*.016,z=tip[2]+Math.sin(a2)*r;k.beam(t,tip,[x,y,z],.0012,bark,5);const crown=k.mesh(t,new THREE.IcosahedronGeometry(.025+(c%3)*.005,1),blossoms[(seed+b+c)%4],x,y,z);crown.scale.set(1.0,.80+(seed%3)*.08,1.0);
    for(let q=0;q<3;q++){const ang=a2+q*2.1;const fleck=k.mesh(t,new THREE.IcosahedronGeometry(.009,0),blossoms[(q+seed)%4],x+Math.cos(ang)*.026,y+.015,z+Math.sin(ang)*.025);fleck.scale.y=.85;}
   }
  }return t;
 }
 for(let i=0;i<22;i++){const t=.025+i/21*.95,[x,z]=road(t);for(const side of [-1,1])place(g,sakura(i+(side+1)*13),x,z+side*(.145+(i%2)*.010));}
 const skin=k.mat('#b79071'),coats=['#476b71','#a77864','#e1d3ba'].map(c=>k.mat(c));
 for(let i=0;i<36;i++){const [x,z]=road((i+.5)/36),p=new THREE.Group();k.cyl(p,.0045,.005,.019,coats[i%3],0,.025,0,6);k.ball(p,.005,skin,0,.039);for(const s of [-1,1])k.cyl(p,.0016,.0016,.014,wood,s*.0025,.009,0,5);place(g,p,x,z+(i%3-1)*.046,.014);}
 // Warm bollards under the blossom canopy; no flashing tubes through the trees.
 for(let i=0;i<12;i++){const [x,z]=road((i+.5)/12);for(const s of [-1,1]){const p=new THREE.Group();k.box(p,.008,.033,.008,wood,0,.017);k.box(p,.010,.007,.010,lamp,0,.035);k.box(p,.013,.003,.013,wood,0,.040);place(g,p,x,z+s*.104,.014);}}
 // Taller shaded lamps give the avenue a readable cadence under the blossoms.
 for(let i=0;i<10;i++){const [x,z]=road(.06+i/9*.88);for(const s of [-1,1]){const p=new THREE.Group();k.cyl(p,.002,.003,.13,wood,0,.065,0,8);k.cyl(p,.010,.006,.016,lamp,0,.137,0,10);k.cyl(p,.014,.010,.005,wood,0,.148,0,10);place(g,p,x,z+s*.105,.014);}}
 // Merge only solid geometry. Light pools stay separate for night visibility and module ownership.
 k.merge(g);g.userData.sakuraTreeCount=44;g.userData.sakuraAvenueLength=1.86;
 const pix=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,r=Math.hypot(x-15.5,y-15.5)/15.5;pix.set([255,188,167,Math.round(Math.max(0,1-r)**2*100)],i);}const tex=new THREE.DataTexture(pix,32,32);tex.needsUpdate=true;
 const glowMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});k.materials.push(glowMat);
 for(let i=0;i<14;i++){const [x,z]=road((i+.5)/14),q=new THREE.Group(),glow=k.mesh(q,new THREE.PlaneGeometry(.20,.25),glowMat);glow.rotation.x=-Math.PI/2;glow.userData.nightOnly=true;glow.raycast=()=>{};place(g,q,x,z,.019);}
 const haloMat=new THREE.SpriteMaterial({map:tex,color:'#ffd6a7',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});k.materials.push(haloMat);
 for(let i=0;i<10;i++){const [x,z]=road(.06+i/9*.88);for(const s of [-1,1]){const p=new THREE.Group(),halo=new THREE.Sprite(haloMat);halo.position.y=.137;halo.scale.set(.065,.065,1);halo.userData.nightOnly=true;halo.raycast=()=>{};p.add(halo);place(g,p,x,z+s*.105,.014);}}
 for(const t of [.16,.38,.62,.84]){const [x,z]=road(t),q=new THREE.Group(),light=new THREE.PointLight('#ffd1bf',0,.42,2);light.position.y=.09;light.userData.nightIntensity=.055;q.add(light);place(g,q,x,z);}
 return g;
}
