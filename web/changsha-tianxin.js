import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {plaque,tree} from './wuhan-architecture.js';
import {lattice,balcony,archWall} from './shunde-kit.js';
import {hill,bollards,people,glow} from './shenzhen-forms.js';
const sag=(x,z)=>2.15-Math.sqrt(2.15**2-x*x-z*z);
function face(k,g,p,m){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.computeVertexNormals();return k.mesh(g,geo,m);}
const quad=(p,a,b,c,d)=>p.push(...a,...b,...c,...a,...c,...d);
function rib(k,g,pts,r,m){return k.mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),Math.max(3,pts.length-1),r,3,false),m);}
function tiledRoof(k,g,p,w,d,y,h,x=0,z=0){
 const positions=[],n=24,rows=8,rx=w*.33,rz=d*.22;
 const at=(side,u,t)=>{
  let xx,zz;if(side===0){xx=u*w/2;zz=d/2;}else if(side===1){xx=w/2;zz=-u*d/2;}else if(side===2){xx=-u*w/2;zz=-d/2;}else{xx=-w/2;zz=u*d/2;}
  return[x+xx*(1-t)+Math.sign(xx)*Math.min(Math.abs(xx),rx)*t,y+h*.33*Math.pow(t,1.25)+.014*(1-t)**5*Math.abs(u)**6,z+zz*(1-t)+Math.sign(zz)*Math.min(Math.abs(zz),rz)*t];
 };
 for(let s=0;s<4;s++)for(let j=0;j<rows;j++)for(let i=0;i<n;i++)quad(positions,at(s,i/n*2-1,j/rows),at(s,(i+1)/n*2-1,j/rows),at(s,(i+1)/n*2-1,(j+1)/rows),at(s,i/n*2-1,(j+1)/rows));
 for(const side of [-1,1]){
  const y0=y+h*.33;
  if(side===1)quad(positions,[x-rx,y0,z+rz],[x+rx,y0,z+rz],[x+rx,y+h,z],[x-rx,y+h,z]);
  else quad(positions,[x+rx,y0,z-rz],[x-rx,y0,z-rz],[x-rx,y+h,z],[x+rx,y+h,z]);
  // Gable-end infill sits below the two tiled slopes.
  const shape=new THREE.Shape();shape.moveTo(-rz,0);shape.lineTo(rz,0);shape.lineTo(0,h*.67);shape.closePath();const end=k.mesh(g,new THREE.ShapeGeometry(shape),p.white,x+side*rx,y0,z);end.rotation.y=Math.PI/2;end.material.side=THREE.DoubleSide;
  k.line(g,[[x+side*(rx+.001),y0,z-rz],[x+side*(rx+.001),y+h,z],[x+side*(rx+.001),y0,z+rz]],.004,p.red);
  for(let j=-3;j<=3;j++){const zz=j*rz/4,hh=h*.67*(1-Math.abs(zz)/rz);if(hh>.006)k.box(g,.003,hh,.003,p.red,x+side*(rx+.002),y0+hh/2,z+zz);}
  for(let i=0;i<=22;i++){const xx=x-rx+i*rx/11,pts=[];for(let j=0;j<=10;j++){const t=j/10;pts.push([xx,y0+(h*.67)*t+.001,z+side*rz*(1-t)]);}rib(k,g,pts,.001,p.tileRib);}
 }
 p.tile.side=THREE.DoubleSide;face(k,g,positions,p.tile);
 for(let s=0;s<4;s++){
  const edge=[];for(let i=0;i<=24;i++)edge.push(at(s,i/24*2-1,0));k.line(g,edge,.0022,p.edge);
  for(let i=0;i<=24;i++){const pts=[];for(let j=0;j<=10;j++){const pt=at(s,i/24*2-1,j/10);pt[1]+=.001;pts.push(pt);}rib(k,g,pts,.001,p.tileRib);}
 }
 k.line(g,[[x-rx-.014,y+h+.029,z],[x-rx,y+h+.005,z],[x,y+h,z],[x+rx,y+h+.005,z],[x+rx+.014,y+h+.029,z]],.004,p.tileRib);
}

function tower(k,g,p,{x=0,z=0,angle=0,w=.55,d=.36,step=.17,levels=3}={}){
 const q=new THREE.Group();q.position.set(x,0,z);q.rotation.y=angle;g.add(q);
 for(let n=0;n<levels;n++){
  const width=w-n*.052,depth=d-n*.033,y=.30+n*step,h=step*.79,coreW=width*.72,coreD=depth*.54;
  k.box(q,width+.03,.014,depth+.03,p.stone,0,y,0);
  k.box(q,coreW,h,coreD,n===levels-1?p.wood:p.white,0,y+.011+h/2,0);
  for(const side of [-1,1]){
   for(let j=0;j<7;j++){
    const xx=(j/6-.5)*width*.92;k.cyl(q,.0045,.005,h+.008,p.red,xx,y+.011+h/2,side*depth*.45,10);
    if(j>0&&j<6){k.box(q,width*.088,h*.64,.003,p.window,xx,y+h*.50+.011,side*(coreD/2+.002));lattice(k,q,xx,y+h*.50+.011,side*(coreD/2+.004),width*.088,h*.64,p.wood);}
    // Tianxin uses projecting beams; avoid a generic stack of bracket blocks.
    k.box(q,.010,.010,.055,p.red,xx,y+h+.005,side*depth*.40);
   }
   for(let j=1;j<4;j++)k.cyl(q,.0045,.005,h+.008,p.red,side*width*.46,y+.011+h/2,(j/4-.5)*depth*.88,10);
   k.box(q,width*.95,.015,.014,p.red,0,y+h+.008,side*depth*.45);
   k.box(q,.014,.015,depth*.92,p.red,side*width*.46,y+h+.008,0);
   if(n>0)balcony(k,q,0,side*(depth/2+.012),width+.022,y+.01,p.stone);
   if(n>0){const rail=new THREE.Group();rail.position.set(side*(width/2+.012),0,0);rail.rotation.y=Math.PI/2;q.add(rail);balcony(k,rail,0,0,depth,y+.01,p.stone);}
  }
  tiledRoof(k,q,p,width*1.23,depth*1.32,y+h+.018,n===levels-1?.112:.061);
 }
 if(levels===3){plaque(k,q,'天心阁',.14,.034,0,.737,.151);tiledRoof(k,q,p,.22,.16,.795,.066,0,.105);for(const x of [-.12,.12]){k.cyl(q,.005,.008,.022,p.tileRib,x,.887,0,7);k.mesh(q,new THREE.TorusGeometry(.009,.002,5,16),p.tileRib,x,.905,0);}}
}
function corridor(k,g,p,side){
 const path=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.23,0,0),new THREE.Vector3(side*.34,0,-.012),new THREE.Vector3(side*.42,0,-.085),new THREE.Vector3(side*.51,0,-.155)]),roof=[];
 const at=(t,v)=>{const a=path.getPoint(t),tangent=path.getTangent(t),normal=new THREE.Vector3(-tangent.z,0,tangent.x);return[a.x+normal.x*v*.107,.426+.035*(1-Math.abs(v))**1.3,a.z+normal.z*v*.107];};
 for(let i=0;i<24;i++)for(let j=0;j<12;j++)quad(roof,at(i/24,j/6-1),at((i+1)/24,j/6-1),at((i+1)/24,(j+1)/6-1),at(i/24,(j+1)/6-1));
 face(k,g,roof,p.tile);
 for(const v of [-1,0,1]){const points=[];for(let i=0;i<=24;i++)points.push(at(i/24,v));k.line(g,points,v===0?.003:.002,p.tileRib);}
 for(let i=0;i<=24;i++){
  const points=[];for(let j=0;j<=12;j++){const a=at(i/24,j/6-1);a[1]+=.001;points.push(a);}rib(k,g,points,.001,p.tileRib);
 }
 for(let i=0;i<13;i++){
  const t=i/12,at=path.getPoint(t),tan=path.getTangent(t),q=new THREE.Group();q.position.copy(at);q.rotation.y=-Math.atan2(tan.z,tan.x);g.add(q);
  k.box(q,.042,.013,.16,p.stone,0,.301,0);
  if(i%3===0)for(const z of [-.065,.065])k.cyl(q,.004,.004,.118,p.red,0,.366,z);
  for(const z of [-.070,.070]){k.box(q,.043,.004,.004,p.red,0,.346,z);if(i%3===0)k.box(q,.004,.038,.004,p.red,0,.327,z);}
 }
}
export function tianxin(k){
 const g=new THREE.Group(),b=new THREE.Group();g.add(b);
 const p={stone:k.mat('#747c71',.95),mortar:k.mat('#5e685e',.97),white:k.mat('#ddd7c1',.9),red:k.mat('#654031',.86),wood:k.mat('#47382e',.84),window:k.mat('#3c3830',.8),tile:k.mat('#98743d',.90),tileRib:k.mat('#a58a54',.87),edge:glow(k,'#d3a65d',.32)};
 p.tile.userData.tianxinRoof=true;p.stone.userData.tianxinWall=true;p.window.userData.night={color:new THREE.Color('#e3b76a'),intensity:.38};
 const wall=new THREE.Group();b.add(wall);archWall(k,wall,{w:1.40,h:.289,d:.60,y:0,z:.01,mat:p.stone,openings:[{x:0,r:.07,spring:.175,bottom:.001}]});
 wall.traverse(o=>{if(o.geometry){const old=o.geometry;o.geometry=new TessellateModifier(.025,9).modify(old);old.dispose();const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i)+o.position.z-.22*(x/.70)**2;a.setZ(i,z-o.position.z);if(a.getY(i)<.002)a.setY(i,.008-sag(x,z));}o.geometry.computeVertexNormals();}});
 // Level walking deck follows the bow in plan; the masonry foot follows the globe.
 for(let row=0;row<11;row++){
  const y=.022+row*.025;for(const side of [-1,1])for(let j=0;j<28;j++){
   const x=-.675+j*.05,z=(side===1?.312:-.292)-.22*(x/.70)**2;if(Math.abs(x)<.09&&y<.25)continue;
   const line=[-.024,0,.024].map(dx=>[x+dx,y,(side===1?.316:-.296)-.22*((x+dx)/.70)**2]);k.line(b,line,.0007,p.mortar);k.box(b,.001,.023,.0015,p.mortar,x+.024,y+.012,(side===1?.316:-.296)-.22*((x+.024)/.70)**2);
  }
 }
 for(const x of [-.701,.701])for(let row=0;row<11;row++)k.box(b,.001,.0012,.598,p.mortar,x,.022+row*.025,-.21);
 for(let i=0;i<23;i++){const x=-.68+i*.0618,z=.30-.22*(x/.70)**2;k.box(b,.033,.037,.037,p.stone,x,.307,z);}
 tower(k,b,p,{z:.018});
 for(const side of [-1,1]){corridor(k,b,p,side);tower(k,b,p,{x:side*.57,z:-.22,angle:side*.60,w:.245,d:.265,step:.123,levels:2});}
 // Narrow rear access stair and landing connect the elevated wall walk.
 const stepMat=p.stone.clone();k.materials.push(stepMat);stepMat.userData={tianxinStep:true};
 for(let i=0;i<16;i++){const z=-.65+i*.019,ground=.014-sag(-.18,z),y=ground+(.293-ground)*(i+1)/16,h=y-ground+.004;k.box(g,.14,h,.020,stepMat,-.18,y-h/2+sag(-.18,z),z);}
 k.box(b,.17,.012,.06,p.stone,-.18,.287,-.325);
 const visitors=new THREE.Group();visitors.position.y=.294;b.add(visitors);people(k,visitors,[[.28,.20],[-.30,.19]]);
 b.traverse(o=>{if(o.material)o.material.userData.tianxinRigid=true;});
 const ground=hill(k,g,.81,.67,.13,'#718064');
 for(const[x,z,s]of[[-.66,.34,.11],[.65,.34,.10],[-.61,-.49,.12],[.48,-.51,.13],[-.35,-.56,.10],[.26,-.57,.11]])tree(k,g,x,ground(x,z),z,s);
 bollards(k,g,[[-.28,.48],[.28,.48],[-.65,.30],[.64,.30]],'#dec596');people(k,g,[[.23,.48],[-.27,.46]]);
 return k.merge(g);
}
