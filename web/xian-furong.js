import * as THREE from 'three';
import {ellipseSurface} from './xian-kit.js';
import {plaque} from './wuhan-architecture.js';

function patch(k,g,m,fn,nu=40,nv=16){
 const p=[],ix=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)p.push(...fn(i/nu,j/nv));
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;ix.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();m.side=THREE.DoubleSide;k.mesh(g,geo,m);
}
function tangRoof(k,g,p,w,d,y,h,pyramidal=false){
 const ridge=pyramidal?.001:Math.max(.01,w/2-d*.35),point=(sign,u,t,lift=0)=>{
  const x=(u*2-1)*(ridge+(w/2-ridge)*t);return[x,y+h*(1-t)**1.45+.008*t**6*Math.abs(u*2-1)**7+lift,sign*d/2*t];
 };
 for(const sign of [-1,1]){
  patch(k,g,p.tile,(u,t)=>point(sign,u,t));
  const count=Math.max(28,Math.ceil(w/.009));for(let i=0;i<=count;i++)k.line(g,Array.from({length:10},(_,j)=>point(sign,i/count,j/9,.0008)),.0008,p.rib);
  for(let j=1;j<10;j++)k.line(g,Array.from({length:21},(_,i)=>point(sign,i/20,j/10,.0003)),.00035,p.seam);
  k.line(g,Array.from({length:41},(_,i)=>point(sign,i/40,1,.002)),.0025,p.edge);
  patch(k,g,p.tile,(u,t)=>[sign*(ridge+(w/2-ridge)*t),y+h*(1-t)**1.45+.008*t**6*Math.abs(u*2-1)**7,(u*2-1)*d/2*t],24,16);
  for(let i=0;i<=28;i++)k.line(g,Array.from({length:10},(_,j)=>{const t=j/9,u=i/28*2-1;return[sign*(ridge+(w/2-ridge)*t),y+h*(1-t)**1.45+.008*t**6*Math.abs(u)**7+.0008,u*d/2*t];}),.0008,p.rib);
  if(!pyramidal)k.line(g,[[sign*ridge,y+h+.002,0],[sign*(ridge+.011),y+h+.022,0],[sign*(ridge+.007),y+h+.035,0],[sign*(ridge-.008),y+h+.034,0]],.005,p.gold);
 }
 k.line(g,[[-ridge,y+h+.003,0],[0,y+h+.001,0],[ridge,y+h+.003,0]],.004,p.rib);
}

function balustrade(k,g,p,a,b,y,stone=true){
 const len=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.max(2,Math.round(len/.026)),m=stone?p.stone:p.red;
 for(let i=0;i<=count;i++){
  const x=THREE.MathUtils.lerp(a[0],b[0],i/count),z=THREE.MathUtils.lerp(a[1],b[1],i/count);
  k.box(g,.004,.030,.004,m,x,y+.015,z);if(stone)k.ball(g,.0034,m,x,y+.032,z);
  if(i<count){const xx=THREE.MathUtils.lerp(a[0],b[0],(i+.5)/count),zz=THREE.MathUtils.lerp(a[1],b[1],(i+.5)/count);k.box(g,.002,.020,.002,m,xx,y+.013,zz);}
 }
 for(const h of [.009,.027])k.beam(g,[a[0],y+h,a[1]],[b[0],y+h,b[1]],.0022,m);
}
function gallery(k,g,p,{w,d,y,h,bays=8,open=false}){
 const iw=w*.81,id=d*.67;
 k.box(g,w+.015,.012,d+.015,p.stone,0,y-.006,0);
 if(!open){
  k.box(g,iw,h*.91,id,p.cream,0,y+h*.46,0);
  for(const sign of [-1,1]){
   for(let i=0;i<bays;i++){
    const x=((i+.5)/bays-.5)*iw,ww=iw/bays*.76;
    k.box(g,ww,h*.76,.003,p.door,x,y+h*.43,sign*(id/2+.001));
    for(let j=0;j<5;j++)k.box(g,.0014,h*.68,.002,p.wood,x+(j/4-.5)*ww*.88,y+h*.43,sign*(id/2+.003));
   }
   for(let j=0;j<4;j++){const zz=(j/3-.5)*id*.84;k.box(g,.003,h*.73,id*.15,p.door,sign*(iw/2+.001),y+h*.44,zz);}
  }
 }
 for(const sign of [-1,1]){
  for(let i=0;i<=bays;i++){
   const x=(i/bays-.5)*w*.94,z=sign*d*.46;
   k.cyl(g,.0048,.0058,h,p.red,x,y+h/2,z,10);k.cyl(g,.007,.008,.009,p.stone,x,y+.004,z,10);
   for(let j=0;j<3;j++){k.box(g,.014+j*.009,.004,.018+j*.006,p.wood,x,y+h-.012+j*.005,z);k.box(g,.005,.004,.023+j*.009,p.red,x,y+h-.009+j*.005,z);}
  }
  k.box(g,w,.010,.016,p.wood,0,y+h-.005,sign*d*.46);k.box(g,w*.96,.003,.002,p.gold,0,y+h-.007,sign*(d*.46+.009));
  for(let i=1;i<4;i++)k.cyl(g,.0048,.0058,h,p.red,sign*w*.47,y+h/2,(i/4-.5)*d*.92,10);
  k.box(g,.016,.010,d,p.wood,sign*w*.47,y+h-.005,0);
  for(let i=0;i<bays;i++)k.box(g,w*.72/bays,.002,.006,p.light,((i+.5)/bays-.5)*w*.94,y+h-.017,sign*d*.40);
 }
}
function podium(k,g,p,w,d,y,h,x=0,z=0){
 const geo=new THREE.CylinderGeometry(1,1.13,h,4,1,false);geo.rotateY(Math.PI/4);geo.scale(w/Math.sqrt(2),1,d/Math.sqrt(2));k.mesh(g,geo,p.stone,x,y+h/2,z);
 k.box(g,w+.014,.012,d+.014,p.cap,x,y+h+.003,z);
}
function bridge(k,g,p,side,z){
 const a=.42,b=.60,w=.095,base=.238;
 patch(k,g,p.stone,(u,v)=>[side*(a+(b-a)*u),base+.024*Math.sin(u*Math.PI),(v-.5)*w+z],28,6);
 for(const sz of [-1,1]){
  const pts=[];for(let i=0;i<=9;i++){const u=i/9,x=side*(a+(b-a)*u),y=base+.024*Math.sin(u*Math.PI);k.box(g,.004,.028,.004,p.stone,x,y+.014,z+sz*w/2);pts.push([x,y+.030,z+sz*w/2]);}
  k.line(g,pts,.0025,p.stone);k.line(g,pts.map(([x,y,z])=>[x,y-.037,z]),.004,p.cap);
  patch(k,g,p.cap,(u,v)=>[side*(a+(b-a)*u),base+.024*Math.sin(u*Math.PI)-v*.010,z+sz*w/2],28,1);
 }
}
function willow(k,g,p,x,z,h){
 k.cyl(g,.004,.010,h,p.trunk,x,.016+h/2,z,8);
 for(let j=0;j<7;j++){
  const a=j/7*Math.PI*2,xx=x+Math.cos(a)*h*.25,zz=z+Math.sin(a)*h*.25;
  k.beam(g,[x,.016+h*.65,z],[xx,.016+h,zz],.003,p.trunk);
  const b=k.mesh(g,new THREE.IcosahedronGeometry(h*.30,1),p.leaf,xx,h*.96,zz);b.scale.set(1,.70,1);
  for(let i=-1;i<=1;i++)k.line(g,[[xx,h*.98,zz],[xx+Math.cos(a+i*.2)*h*.20,h*.77,zz+Math.sin(a+i*.2)*h*.2],[xx+Math.cos(a+i*.2)*h*.16,h*.38,zz+Math.sin(a+i*.2)*h*.16]],.004,p.leaf);
 }
}
export function furong(k){
 const first=k.materials.length,g=new THREE.Group(),p={stone:k.mat('#cbcbbc'),cap:k.mat('#aaa999'),cream:k.mat('#d6cdb6'),tile:k.mat('#415651'),rib:k.mat('#5c6c60'),seam:k.mat('#344642'),edge:k.mat('#c1ac74'),gold:k.mat('#b99a4b',.55,.3),red:k.mat('#824136'),wood:k.mat('#493a31'),door:k.mat('#282b29'),ground:k.mat('#a6ad8a'),paving:k.mat('#b8b7a5'),water:k.mat('#52817c',.34,.12),leaf:k.mat('#5d7650'),trunk:k.mat('#796650')};
 for(const [name,m]of Object.entries(p))m.userData.night={color:new THREE.Color(name==='leaf'?'#6a8057':name==='water'?'#6b8584':'#f2cf99'),intensity:name==='tile'?.015:name==='door'?.035:name==='ground'?.018:name==='stone'?.035:.055};
 p.edge.userData.night.intensity=.42;p.gold.userData.night.intensity=.16;
 p.light=k.mat('#c9b48e',.8,0,'#ffd39b');p.light.userData.night.intensity=.68;
 p.water.userData.furongLake=true;p.water.userData.preserveSmooth=true;
 const positions=[],indices=[],N=128,R=24;
 for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const rr=j/R,a=i/N*Math.PI*2,x=.96*rr*Math.cos(a),z=.88*rr*Math.sin(a),sag=2.15-Math.sqrt(2.15**2-x*x-z*z);positions.push(x,.012-sag*THREE.MathUtils.smoothstep(rr,.88,1),z);}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)indices.push(a,a+1,b);indices.push(a+1,b+1,b);}
 const ground=new THREE.BufferGeometry();ground.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));ground.setIndex(indices);ground.computeVertexNormals();k.mesh(g,ground,p.ground);
 // The lake lies beyond the land-based podium and the continuous shore walk.
 const lake=ellipseSurface(k,g,.69,.20,.017,p.water);lake.position.z=.60;
 k.box(g,1.49,.008,.16,p.paving,0,.018,.36);
 for(const s of [-1,1]){k.box(g,.12,.006,.59,p.paving,s*.82,.016,-.04);balustrade(k,g,p,[s*.23,.43],[s*.73,.43],.022);}
 // Wide raised base: the three bottom doors are recessed below the main gallery.
 k.box(g,.86,.210,.52,p.stone,0,.117,-.19);k.box(g,.89,.014,.60,p.stone,0,.229,-.16);
 const faceZ=.100;
 for(const [x,w]of [[-.275,.31],[.275,.31],[0,.046]]){if(x===0)continue;k.box(g,w,.21,.024,p.stone,x,.117,faceZ);}
 for(const x of [-.105,0,.105]){
  k.box(g,.063,.088,.003,p.door,x,.162,faceZ-.014);
  for(const s of [-1,1])k.box(g,.006,.093,.007,p.gold,x+s*.034,.164,faceZ+.002);
  k.box(g,.074,.007,.007,p.gold,x,.211,faceZ+.002);
 }
 for(const x of [-.0525,.0525])k.box(g,.035,.115,.024,p.stone,x,.174,faceZ);
 k.box(g,.25,.015,.024,p.stone,0,.222,faceZ);k.box(g,.28,.112,.024,p.stone,0,.068,faceZ);
 // Broad lower flight reaches the recessed door landing, with two upper side flights.
 for(let i=0;i<16;i++)k.box(g,.40,.007*(i+1),.011,p.stone,0,.022+.0035*(i+1),.342-i*.010);
 k.box(g,.45,.112,.110,p.stone,0,.078,.143);
 for(const side of [-1,1]){
  const stairRail=[];
  for(let i=0;i<13;i++){
   const x=side*(.225+i*.012),y=.134+.008*(i+1);k.box(g,.013,.008*(i+1),.060,p.stone,x,.134+.004*(i+1),.170);
   if(i%2===0){k.box(g,.004,.028,.004,p.stone,x,y+.014,.205);stairRail.push([x,y+.030,.205]);}
  }
  k.box(g,.075,.104,.140,p.stone,side*.405,.186,.150);k.line(g,stairRail,.0025,p.stone);
  const lower=[];for(let i=0;i<9;i++){const z=.342-i*.01875,y=.029+i*.013125;k.box(g,.005,.030,.005,p.stone,side*.207,y+.015,z);lower.push([side*.207,y+.031,z]);}k.line(g,lower,.003,p.stone);
 }
 // Three eave levels sit over two broad, recessed column galleries and a low attic.
 const hall=new THREE.Group();hall.position.z=-.16;g.add(hall);
 gallery(k,hall,p,{w:.80,d:.55,y:.242,h:.145,bays:10});tangRoof(k,hall,p,.96,.70,.394,.060);
 gallery(k,hall,p,{w:.74,d:.49,y:.466,h:.135,bays:8});
 for(const s of [-1,1]){balustrade(k,hall,p,[-.37,s*.25],[.37,s*.25],.468,false);balustrade(k,hall,p,[s*.37,-.25],[s*.37,.25],.468,false);}
 tangRoof(k,hall,p,.96,.68,.611,.055);
 gallery(k,hall,p,{w:.67,d:.43,y:.673,h:.039,bays:8});tangRoof(k,hall,p,.88,.60,.722,.106);
 const porch=new THREE.Group();porch.position.z=.155;g.add(porch);tangRoof(k,porch,p,.57,.23,.391,.065);
 plaque(k,g,'紫云楼',.073,.028,0,.364,.274);
 for(const s of [-1,1]){
  balustrade(k,g,p,[s*.29,.127],[s*.44,.127],.240);
  balustrade(k,g,p,[s*.44,-.45],[s*.44,.055],.240);
  for(const z of [-.39,.035]){
   const x=s*.68;podium(k,g,p,.22,.22,.012,.222,x,z);
   const pavilion=new THREE.Group();pavilion.position.set(x,0,z);g.add(pavilion);
   gallery(k,pavilion,p,{w:.20,d:.20,y:.242,h:.110,bays:2,open:true});
   tangRoof(k,pavilion,p,.29,.29,.360,.060,true);k.cyl(pavilion,.003,.005,.022,p.gold,0,.430,0,8);k.ball(pavilion,.006,p.gold,0,.444,0);
   for(const d of [-1,1]){balustrade(k,pavilion,p,[-.106,d*.106],[.106,d*.106],.243);if(d===s)balustrade(k,pavilion,p,[d*.106,-.106],[d*.106,.106],.243);}
   bridge(k,g,p,s,z);
  }
 }
 balustrade(k,g,p,[-.43,-.46],[.43,-.46],.240);
 for(const [x,z,h]of [[-.76,.23,.20],[.76,.25,.23],[-.70,-.56,.22],[.70,-.56,.20],[-.39,-.64,.18],[.39,-.64,.20]])willow(k,g,p,x,z,h);
 for(const [i,[x,z]]of [[-.31,.34],[.31,.34],[-.82,-.15],[.82,-.15]].entries()){
  const m=k.mat('#c2a56d',.8,0,'#ffd59b');m.userData.night.intensity=.95;m.userData.pulse={speed:.65,phase:i*1.7};k.cyl(g,.003,.005,.065,p.wood,x,.054,z,8);k.ball(g,.010,m,x,.089,z);k.cyl(g,.014,.012,.005,p.gold,x,.099,z,8);
 }
 for(const m of k.materials.slice(first))m.userData.furongRigid=true;
 g.userData={modernTangGarden:true,cornerPavilions:4,landBasedPodium:true};return k.merge(g);
}
