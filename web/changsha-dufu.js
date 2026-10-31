import * as THREE from 'three';
import {plaque,tree} from './wuhan-architecture.js';
import {lattice,balcony,lantern} from './shunde-kit.js';
import {glow,plaza,bollards,people} from './shenzhen-forms.js';

function face(k,g,p,m){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.computeVertexNormals();return k.mesh(g,geo,m);}
const quad=(p,a,b,c,d)=>p.push(...a,...b,...c,...a,...c,...d);
function rib(k,g,pts,r,m){return k.mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),Math.max(3,pts.length-1),r,3,false),m);}
function tiledRoof(k,g,p,w,d,y,h,x=0,z=0){
 const positions=[],n=36,rows=10,rx=w*.33,rz=d*.22;
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
  for(let i=0;i<=30;i++){const xx=x-rx+i*rx/15,pts=[];for(let j=0;j<=10;j++){const t=j/10;pts.push([xx,y0+(h*.67)*t+.001,z+side*rz*(1-t)]);}rib(k,g,pts,.0008,p.tileRib);}
 }
 p.tile.side=THREE.DoubleSide;face(k,g,positions,p.tile);
 for(let s=0;s<4;s++){
  const edge=[];for(let i=0;i<=36;i++)edge.push(at(s,i/36*2-1,0));k.line(g,edge,.0022,p.edge);
  for(let i=0;i<=36;i++){const pts=[];for(let j=0;j<=10;j++){const pt=at(s,i/36*2-1,j/10);pt[1]+=.001;pts.push(pt);}rib(k,g,pts,.0008,p.tileRib);}
 }
 k.line(g,[[x-rx-.014,y+h+.029,z],[x-rx,y+h+.005,z],[x,y+h,z],[x+rx,y+h+.005,z],[x+rx+.014,y+h+.029,z]],.004,p.tileRib);
}
function balustrade(k,g,p,w,d,y,x=0,z=0,entry=false){
 for(const side of [-1,1]){
  if(entry){for(const sign of [-1,1])balcony(k,g,x+sign*(w*.25+.05),z+side*d/2,w*.5-.1,y,p.white);}
  else balcony(k,g,x,z+side*d/2,w,y,p.white);
  const q=new THREE.Group();q.position.set(x+side*w/2,0,z);q.rotation.y=Math.PI/2;g.add(q);balcony(k,q,0,0,d,y,p.white);
 }
}
function floor(k,g,p,w,d,y,h,entry=false){
 k.box(g,w+.025,.014,d+.025,p.white,0,y,0);balustrade(k,g,p,w+.018,d+.018,y+.008,0,0,entry);
 // The central room is recessed behind a real public colonnade on all four sides.
 const innerW=w*.75,innerD=d*.60;k.box(g,innerW,h*.89,innerD,p.wall,0,y+.010+h*.445,0);
 for(const side of [-1,1]){
  for(let i=0;i<7;i++){
   const xx=(i/6-.5)*w*.91;k.cyl(g,.005,.0055,h,p.red,xx,y+h/2+.008,side*d*.455,10);
   if(i>0&&i<6){k.box(g,w*.088,h*.64,.004,p.window,xx,y+h*.47+.01,side*(innerD/2+.002));lattice(k,g,xx,y+h*.47+.01,side*(innerD/2+.005),w*.088,h*.64,p.wood);}
   for(let j=0;j<3;j++){k.box(g,.016+j*.007,.004,.024+j*.009,p.red,xx,y+h-.009+j*.007,side*d*.455);}
  }
  for(let i=1;i<4;i++){const zz=(i/4-.5)*d*.9;k.cyl(g,.005,.0055,h,p.red,side*w*.455,y+h/2+.008,zz);}
  k.box(g,w*.96,.017,.014,p.red,0,y+h+.005,side*d*.455);k.box(g,.014,.017,d*.91,p.red,side*w*.455,y+h+.005,0);
  for(const xx of [-w*.32,w*.32])lantern(k,g,xx,y+h*.72,side*d*.465,p,.006);
 }
}
function corridor(k,g,p,side){
 const q=new THREE.Group();q.position.set(side*.47,0,-.10);g.add(q);k.box(q,.14,.014,.49,p.stone,0,.034,0);
 for(const x of [-.055,.055])for(let i=0;i<7;i++)k.cyl(q,.004,.004,.095,p.red,x,.087,-.21+i*.07);
 tiledRoof(k,q,p,.20,.54,.14,.055);balustrade(k,q,p,.14,.48,.042);
 const pavilion=new THREE.Group();pavilion.position.set(side*.47,0,-.33);g.add(pavilion);k.box(pavilion,.20,.025,.18,p.white,0,.043,0);
 for(const x of [-.075,.075])for(const z of [-.065,.065])k.cyl(pavilion,.005,.005,.14,p.red,x,.124,z);
 tiledRoof(k,pavilion,p,.28,.25,.20,.09);
}
export function dufu(k){
 const g=new THREE.Group(),p={white:k.mat('#dddacf',.90),wall:k.mat('#eee5cd',.84),stone:k.mat('#bcb8a8',.92),red:k.mat('#8a3f31'),wood:k.mat('#4d3a2c'),tile:k.mat('#555b58',.89),tileRib:k.mat('#616660',.83),window:k.mat('#5b4940',.7),edge:glow(k,'#e8b86b',.48),warm:glow(k,'#f4bb67',.85,1,.4),gold:k.mat('#b19459')};
 p.window.userData.night={color:new THREE.Color('#f6b65f'),intensity:.62};p.tile.userData.night={color:new THREE.Color('#edab40'),intensity:.42};p.tileRib.userData.night={color:new THREE.Color('#d69e42'),intensity:.23};p.tile.userData.dufuRoof=true;
 const base=plaza(k,g,.67,.58,'#b3b09d');base.userData.groundSurface=true;
 k.box(g,.72,.025,.49,p.stone,0,.028,0);k.box(g,.49,.108,.28,p.wall,0,.091,0);
 for(const side of [-1,1])for(let i=0;i<7;i++)k.cyl(g,.006,.006,.12,p.red,(i/6-.5)*.64,.096,side*.19,10);
 // Lower entrance level and three balcony levels follow the four-storey building.
 floor(k,g,p,.64,.43,.16,.158,true);tiledRoof(k,g,p,.83,.60,.326,.074);
 floor(k,g,p,.56,.38,.381,.148);tiledRoof(k,g,p,.75,.54,.536,.077);
 floor(k,g,p,.48,.33,.594,.145);tiledRoof(k,g,p,.68,.48,.746,.155);
 for(const side of [-1,1]){const name=new THREE.Group();name.rotation.y=side===1?0:Math.PI;g.add(name);plaque(k,name,'杜甫江阁',.18,.039,0,.689,.158);}
 // The broad entrance stair reaches the first terrace, with side return rails.
 for(const side of [-1,1]){
  for(let i=0;i<10;i++){const h=.015+i*.014;k.box(g,.32,h,.020,p.stone,0,h/2+.013,side*(.47-i*.020));}
  for(const x of [-.185,.185])k.line(g,[[x,.05,side*.49],[x,.185,side*.29],[x,.185,side*.23]],.004,p.white);
  k.box(g,.39,.014,.10,p.white,0,.152,side*.245);
 }
 for(const side of [-1,1])corridor(k,g,p,side);
 for(const [x,z]of [[-.49,.30],[.48,.31],[-.59,-.04],[.59,-.05]])tree(k,g,x,.014,z,.085);
 bollards(k,g,[[-.29,.46],[.29,.46],[-.60,.18],[.60,.18]],'#e9bf7a');people(k,g,[[-.25,.43],[.22,.42],[-.38,.21],[.38,.18],[-.2,.51],[.23,.51]]);
 k.merge(g);
 for(const z of [-.20,.20]){const light=new THREE.PointLight('#edb568',0,.60,2);light.position.set(0,.50,z);light.userData.nightIntensity=.004;g.add(light);}
 return g;
}
