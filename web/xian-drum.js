import * as THREE from 'three';
import {archWall,masonry} from './xian-kit.js';
import {plaque} from './wuhan-architecture.js';

// Seven bays along the long elevation, three across the short elevation.
// The roof is a hip-and-gable silhouette, not three stacked pyramids.
function panel(k,g,p,w,y,z,h){
 k.box(g,w,h,.009,p.paint,0,y,z);
 for(const s of [-1,1])k.box(g,w,.0015,.010,p.gold,0,y+s*h*.41,z+.001);
 for(let i=0;i<Math.round(w/.065);i++){
  const x=(i/(Math.round(w/.065)-1)-.5)*w*.92;
  const pts=Array.from({length:17},(_,j)=>[x+(j/16-.5)*.047,y+Math.sin(j/16*Math.PI*2)*h*.22,z+.0055]);
  k.line(g,pts,.00065,p.gold);k.mesh(g,new THREE.CircleGeometry(h*.16,4),p.blue,x,y,z+.006);
 }
}
function bracketRow(k,g,p,w,y,z,count){
 for(let i=0;i<count;i++){
  const x=(i/(count-1)-.5)*w;
  for(let j=0;j<3;j++){
   k.box(g,.012+j*.006,.003,.006,p.wood,x,y+j*.005,z+j*.003);
   k.box(g,.003,.005,.015+j*.007,p.paint,x,y+.002+j*.005,z+j*.003);
   for(const s of [-1,1])k.box(g,.003,.004,.007,p.gold,x+s*(.005+j*.003),y+.004+j*.005,z+j*.003);
  }
 }
}
function gallery(k,g,p,{y,h,upper=false}){
 k.box(g,.65,h-.012,.23,upper?p.wood:p.wall,0,y+(h-.012)/2,0);
 for(let side=0;side<4;side++){
  const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);
  const long=side%2===0,w=long?.74:.36,d=long?.36:.74,bays=long?7:3,room=long?.65:.23;
  for(let i=0;i<=bays;i++){
   const x=(i/bays-.5)*w;k.cyl(f,.005,.006,h,p.wood,x,y+h/2,d/2,12);k.cyl(f,.008,.009,.005,p.cap,x,y+.0025,d/2,12);
  }
  panel(k,f,p,w,y+h-.012,d/2,.019);bracketRow(k,f,p,w,y+h+.001,d/2,2*bays+1);
  for(let i=0;i<bays;i++){
   const x=((i+.5)/bays-.5)*w,wallZ=(long?.23:.65)/2+.001;
   if(upper){
    const roomX=((i+.5)/bays-.5)*room,pane=room/bays*.74;
    k.box(f,pane,h*.72,.003,p.dark,roomX,y+h*.43,wallZ);
    for(let n=0;n<6;n++)k.box(f,.0015,h*.65,.004,p.wood,roomX+(n/5-.5)*pane*.95,y+h*.43,wallZ+.002);
    for(let n=0;n<3;n++)k.box(f,pane,.002,.004,p.wood,roomX,y+h*(.18+n*.26),wallZ+.002);
   }else if(Math.abs(x)<room/2-.02){
    const circle=k.mesh(f,new THREE.CircleGeometry(.026,24),p.dark,x,y+h*.47,wallZ+.001);circle.scale.y=1.12;
    for(let n=0;n<5;n++)k.box(f,.0015,.037,.003,p.wood,x+(n-2)*.009,y+h*.47,wallZ+.003);
   }
   const lantern=k.ball(f,.0115,p.lantern,x,y+h-.032,d/2+.008);lantern.scale.y=.79;
   k.cyl(f,.005,.005,.003,p.gold,x,y+h-.043,d/2+.008,10);k.beam(f,[x,y+h-.046,d/2+.008],[x,y+h-.053,d/2+.008],.0008,p.lantern);
  }
  if(upper){
   k.box(f,w+.018,.016,.035,p.wood,0,y-.009,d/2);panel(k,f,p,w,y-.009,d/2+.019,.014);
   for(const yy of [y+.008,y+.032])k.box(f,w,.003,.004,p.paint,0,yy,d/2+.012);
   for(let i=0;i<=bays*6;i++)k.box(f,.002,.025,.003,p.paint,(i/(bays*6)-.5)*w,y+.020,d/2+.012);
  }
 }
}
function strip(k,g,material,point,rows,cols){
 const positions=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)positions.push(...point(i/cols,j/rows));
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();material.side=THREE.DoubleSide;k.mesh(g,geo,material);
}
function roofSkirt(k,g,p,{w,d,y,h,inner=.74}){
 const point=(side,u,r,lift=0)=>{
  const t=u*2-1,rr=inner+(1-inner)*r,x=(side%2?w/2:w/2*t)*rr,z=(side%2?d/2*t:d/2)*rr,s=side>1?-1:1;
  return[x*s,y+h*Math.pow(1-r,1.3)+.017*Math.pow(r,5)*Math.pow(Math.abs(t),7)+lift,z*s];
 };
 for(let side=0;side<4;side++){
  strip(k,g,p.tile,(u,r)=>point(side,u,r),12,48);
  const count=side%2?38:82;
  for(let i=0;i<=count;i++)k.line(g,Array.from({length:9},(_,j)=>point(side,i/count,j/8,.0006)),.00055,p.rib);
  k.line(g,Array.from({length:33},(_,j)=>point(side,j/32,1,.001)),.0021,p.edge);
  for(let i=0;i<=count;i++){const a=point(side,i/count,1);k.box(g,.002,.004,.003,p.gold,a[0],a[1]-.003,a[2]);}
 }
}
function gableRoof(k,g,p){
 const w=.82,d=.45,y=.599,h=.112,inner=.72,low=y+.036,halfW=w/2*inner,halfD=d/2*inner;
 roofSkirt(k,g,p,{w,d,y,h:.036,inner});
 const point=(s,x,t,lift=0)=>[x,low+(h-.036)*Math.pow(1-t,1.25)+lift,s*halfD*t];
 for(const s of [-1,1]){
  strip(k,g,p.tile,(u,t)=>point(s,(u*2-1)*halfW,t),24,76);
  for(let i=0;i<=84;i++)k.line(g,Array.from({length:10},(_,j)=>point(s,(i/84*2-1)*halfW,j/9,.0006)),.00055,p.rib);
  for(let j=1;j<10;j++)k.line(g,Array.from({length:17},(_,i)=>point(s,(i/16*2-1)*halfW,j/10,.0003)),.0003,p.seam);
 }
 for(const s of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-halfD,low);shape.lineTo(halfD,low);for(let i=0;i<=32;i++){const z=halfD-i/32*2*halfD;shape.lineTo(z,low+(h-.036)*Math.pow(1-Math.abs(z)/halfD,1.25));}shape.closePath();
  const face=k.mesh(g,new THREE.ShapeGeometry(shape),p.gable,s*halfW,0,0);face.rotation.y=s*Math.PI/2;p.gable.side=THREE.DoubleSide;
  const f=new THREE.Group();f.position.x=s*(halfW+.001);f.rotation.y=s*Math.PI/2;g.add(f);
  for(const direction of [-1,1])k.line(f,Array.from({length:25},(_,i)=>{const t=i/24;return[direction*(.010+t*.095),low+.020+Math.sin(t*Math.PI*3)*.006+(1-t)*.015,.001];}),.0011,p.gold);
  const medallion=k.mesh(f,new THREE.CircleGeometry(.009,16),p.gold,0,low+.035,.002);medallion.scale.y=1.5;
  for(const zsign of [-1,1])k.line(g,Array.from({length:17},(_,i)=>point(zsign,s*halfW,i/16,.002)),.0027,p.ridge);
 }
 k.line(g,[[-halfW-.008,y+h+.011,0],[0,y+h+.003,0],[halfW+.008,y+h+.011,0]],.0035,p.ridge);
 for(const s of [-1,1]){
  k.line(g,[[s*(halfW-.007),y+h+.004,0],[s*(halfW+.006),y+h+.014,0],[s*(halfW+.005),y+h+.032,0],[s*(halfW-.002),y+h+.027,0]],.005,p.ridge);
  for(const zz of [-1,1])for(let i=0;i<5;i++)k.cyl(g,.0014,.003,.006,p.ridge,s*(w*.49-i*.012),y+.012-i*.001,zz*(d*.48-i*.009),8);
 }
}
function drums(k,g,p){
 const profile=[[-.018,.020],[-.015,.022],[0,.024],[.015,.022],[.018,.020]].map(([y,r])=>new THREE.Vector2(r,y));
 for(const s of [-1,1])for(let i=0;i<12;i++){
  const x=(i/11-.5)*.70,z=s*.237,y=.230;
  for(const dx of [-.017,.017])for(const dz of [-.014,.014])k.box(g,.003,.032,.003,p.drum,x+dx,.198+ .016,z+dz);
  k.box(g,.042,.006,.034,p.drum,x,.228,z);
  const barrel=k.mesh(g,new THREE.LatheGeometry(profile,24),p.drum,x,y+.024,z);barrel.rotation.x=Math.PI/2;
  for(const side of [-1,1]){
   const skin=k.mesh(g,new THREE.CircleGeometry(.0197,24),p.skin,x,y+.024,z+side*.0181);skin.rotation.y=side===1?0:Math.PI;
   for(let j=0;j<16;j++){const a=j/16*Math.PI*2;k.ball(g,.00085,p.gold,x+Math.cos(a)*.018,y+.024+Math.sin(a)*.018,z+side*.019);}
  }
 }
}
function base(k,g,p){
 archWall(k,g,{w:1.02,h:.16,d:.67,y:.018,openings:[{r:.057,spring:.058,bottom:0}],mat:p.brick});
 k.box(g,1.035,.012,.684,p.cap,0,.184,0);
 for(const s of [-1,1]){
  k.box(g,1.03,.024,.016,p.brick,0,.202,s*.333);k.box(g,1.04,.004,.022,p.cap,0,.216,s*.333);
  // Stair flights climb along the short side of the platform, never across the main arch.
  for(let i=0;i<22;i++){
   const z=.380-i*.021,top=.014+(i+1)*.008;
   k.box(g,.092,top-.012,.023,p.cap,s*.565,(top+.012)/2,z);
  }
  k.box(g,.116,.012,.105,p.cap,s*.565,.184,-.11);
  const flank=new THREE.Shape();flank.moveTo(-.395,.014);flank.lineTo(.16,.014);flank.lineTo(.16,.222);flank.lineTo(-.11,.222);flank.lineTo(-.395,.040);flank.closePath();
  const wall=k.mesh(g,new THREE.ExtrudeGeometry(flank,{depth:.014,bevelEnabled:false}),p.brick,s*.615,0,0);wall.rotation.y=Math.PI/2;
  k.box(g,.014,.024,.16,p.brick,s*.512,.202,-.249);k.box(g,.014,.024,.34,p.brick,s*.512,.202,.15);
  for(let j=0;j<=18;j++){const a=j/18*Math.PI;const stone=k.box(g,.010,.013,.008,p.arch,Math.cos(a)*.065,.076+Math.sin(a)*.065,s*.337);stone.rotation.z=a-Math.PI/2;}
 }
}
export function drum(k){
 const first=k.materials.length,g=new THREE.Group(),p={brick:masonry(k,'#777a72'),cap:k.mat('#9c9d8b'),arch:k.mat('#969789'),wood:k.mat('#554638'),wall:k.mat('#d1c7ac'),dark:k.mat('#302e26'),paint:k.mat('#3b5750'),blue:k.mat('#395963'),gold:k.mat('#b3985e',.65,.16),tile:k.mat('#48594c',.66),rib:k.mat('#566457',.70),seam:k.mat('#465347'),ridge:k.mat('#64735b',.60),gable:k.mat('#945247'),edge:k.mat('#7e8865'),lantern:k.mat('#c74728'),drum:k.mat('#a7452c'),skin:k.mat('#cfc19a')};
 for(const [name,m]of Object.entries(p))m.userData.night={color:new THREE.Color(name==='lantern'?'#ff632f':'#f4bd73'),intensity:name==='edge'?.65:name==='lantern'?.75:name==='gold'?.24:name==='brick'?.065:name==='tile'||name==='rib'?.035:.10};
 p.lantern.userData.pulse={speed:.55,phase:.6};
 // A horizontal terrace grades down to the spherical terrain only at its outer rim.
 const paving=k.mat('#b4b09b'),pos=[],idx=[],N=128,R=24;
 for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const r=j/R,a=i/N*Math.PI*2,x=.76*r*Math.cos(a),z=.60*r*Math.sin(a),sag=2.15-Math.sqrt(2.15**2-x*x-z*z);pos.push(x,.012-sag*THREE.MathUtils.smoothstep(r,.88,1),z);}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)idx.push(a,a+1,b);idx.push(a+1,b+1,b);}
 const ground=new THREE.BufferGeometry();ground.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ground.setIndex(idx);ground.computeVertexNormals();k.mesh(g,ground,paving);
 base(k,g,p);gallery(k,g,p,{y:.194,h:.123});roofSkirt(k,g,p,{w:1.00,d:.55,y:.337,h:.052,inner:.73});
 k.box(g,.77,.017,.39,p.wood,0,.390,0);gallery(k,g,p,{y:.400,h:.095,upper:true});roofSkirt(k,g,p,{w:.92,d:.51,y:.518,h:.025,inner:.77});
 k.box(g,.69,.063,.27,p.wood,0,.5655,0);
 for(const s of [-1,1]){const f=new THREE.Group();f.rotation.y=s===1?0:Math.PI;g.add(f);panel(k,f,p,.70,.565,.14,.045);bracketRow(k,f,p,.70,.593,.14,23);}
 gableRoof(k,g,p);drums(k,g,p);
 plaque(k,g,'文武盛地',.20,.034,0,.565,.148);const north=new THREE.Group();north.rotation.y=Math.PI;g.add(north);plaque(k,north,'声闻于天',.20,.034,0,.565,.148);
 for(const m of k.materials.slice(first))m.userData.drumRigid=true;
 g.userData={roofTiers:3,drums:24,bays:7,openGallery:true};k.merge(g);
 for(const s of [-1,1]){const light=new THREE.SpotLight('#ffd39b',0,1.5,Math.PI*.27,.85,2);light.position.set(s*.45,.30,.43);light.target.position.set(0,.42,0);light.userData.nightIntensity=.08;g.add(light,light.target);}
 return g;
}
