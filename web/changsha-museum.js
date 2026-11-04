import * as THREE from 'three';
import {plaza,bollards,people,glow} from './shenzhen-forms.js';
import {tree,plaque} from './wuhan-architecture.js';
const sag=(x,z)=>2.15-Math.sqrt(2.15**2-x*x-z*z);
const outline=(w,d,b)=>[[-w/2+b,d/2],[w/2-b,d/2],[w/2,d/2-b],[w/2,-d/2+b],[w/2-b,-d/2],[-w/2+b,-d/2],[-w/2,-d/2+b],[-w/2,d/2-b]];
function facetRing(k,g,a,ay,b,by,m){
 const p=[],idx=[];for(let i=0;i<8;i++){p.push(a[i][0],ay,a[i][1],b[i][0],by,b[i][1]);}
 for(let i=0;i<8;i++){const j=i*2,n=(i+1)%8*2;idx.push(j,n,j+1,j+1,n,n+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();m.side=THREE.DoubleSide;k.mesh(g,geo,m);
}
function cap(k,g,points,y,m){const p=[0,y,0],ix=[];for(const [x,z] of points)p.push(x,y,z);for(let i=0;i<8;i++)ix.push(0,i+1,(i+1)%8+1);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();m.side=THREE.DoubleSide;k.mesh(g,geo,m);}
export function hunanMuseum(k){
 const g=new THREE.Group(),b=new THREE.Group();g.add(b);
 const stone=k.mat('#cecbbd',.94),joint=k.mat('#a3a79e',.87),metal=k.mat('#686f6d',.61,.28),rib=k.mat('#7b827c',.72,.16),frame=k.mat('#bfc5bb',.72,.15),dark=k.mat('#465554',.75),glass=k.mat('#647e7d',.42,.18),warm=glow(k,'#e0c69e',.30);
 metal.userData.museumRoof=true;glass.userData.night={color:new THREE.Color('#dbcaa9'),intensity:.16};metal.userData.night={color:new THREE.Color('#a7b0aa'),intensity:.035};
 const foundation=new THREE.BoxGeometry(1.22,1,.67,24,1,16),a=foundation.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)>0?.018:.008-sag(a.getX(i),a.getZ(i)));foundation.computeVertexNormals();k.mesh(b,foundation,stone);
 // Recessed lower entrance stays open beneath a broad level observation terrace.
 k.box(b,1.10,.029,.165,metal,0,.139,.255);
 k.box(b,.88,.092,.30,dark,0,.064,-.005);
 for(const x of [-.31,0,.31]){k.box(b,.018,.108,.035,stone,x,.073,.27);k.box(b,.23,.076,.004,glass,x,.061,.173);for(const s of [-1,1])k.box(b,.002,.076,.006,frame,x+s*.057,.061,.177);}
 k.box(b,.89,.003,.003,warm,0,.108,.179);
 // Pale side galleries with closely spaced horizontal louvres and deep reveals.
 for(const s of [-1,1]){
  const x=s*.465;k.box(b,.27,.142,.41,stone,x,.089,-.055);k.box(b,.27,.265,.41,stone,x,.290,-.055);k.box(b,.25,.011,.41,frame,x,.428,-.055);
  k.box(b,.224,.220,.006,glass,x,.292,.154);
  for(let i=0;i<25;i++)k.box(b,.233,.0024,.012,frame,x,.184+i*.009,.166);
  for(const sign of [-1,1]){k.box(b,.018,.282,.43,stone,x+sign*.126,.293,-.055);for(let j=0;j<10;j++)k.box(b,.002,.001,.406,joint,x+sign*.136,.173+j*.026,-.055);}
  for(let j=0;j<10;j++)k.box(b,.256,.001,.002,joint,x,.173+j*.026,-.263);
 }
 // Glazed central hall and the retained paired external structural frames.
 k.box(b,.66,.245,.30,glass,0,.277,-.003);k.box(b,.43,.080,.24,glass,0,.438,-.008);
 for(const z of [.151,-.155]){
  for(let i=0;i<15;i++)k.box(b,.002,.244,.004,dark,(i-7)*.045,.277,z);
  for(let j=0;j<10;j++)k.box(b,.662,.002,.009,metal,0,.166+j*.025,z);
 }
 for(const s of [-1,1]){
  for(let j=0;j<10;j++)k.box(b,.004,.002,.302,metal,s*.332,.166+j*.025,-.003);
  for(let i=0;i<7;i++)k.box(b,.004,.244,.002,dark,s*.332,.277,-.143+i*.047);
 }
 for(const x of [-.205,.205]){
  k.box(b,.011,.342,.019,stone,x,.315,.208);
  for(const y of [.19,.285,.392])k.box(b,.064,.006,.009,frame,x,y,.225);
  for(const s of [-1,1])k.box(b,.005,.250,.009,frame,x+s*.031,.291,.225);
 }
 for(const [x,z] of [[-.205,-.21],[.205,-.21],[-.28,-.08],[.28,-.08],[-.28,.08],[.28,.08],[-.10,-.21],[.10,-.21]])k.box(b,.009,.290,.012,stone,x,.296,z);
 // Three faceted levels create a hovering crystalline roof, not a bent sheet.
 const rim=outline(.86,.59,.10),inner=outline(.49,.32,.045),top=outline(.43,.28,.025);
 facetRing(k,b,rim,.487,inner,.409,metal);facetRing(k,b,rim,.490,top,.573,metal);cap(k,b,top,.573,metal);
 for(let i=0;i<8;i++){
  const next=(i+1)%8,steps=Math.ceil(Math.hypot(rim[next][0]-rim[i][0],rim[next][1]-rim[i][1])/.022);
  for(let j=0;j<=steps;j++){
   const t=j/steps,lerp=(o)=>[o[i][0]*(1-t)+o[next][0]*t,o[i][1]*(1-t)+o[next][1]*t],u=lerp(rim),v=lerp(inner),w=lerp(top);
   k.beam(b,[u[0],.486,u[1]],[v[0],.408,v[1]],.0010,rib,4);k.beam(b,[u[0],.492,u[1]],[w[0],.575,w[1]],.0010,rib,4);
  }
 }
 // Short rooflight bands on the sloping raised crown.
 for(const sign of [-1,1])for(let i=0;i<10;i++){
  const pane=k.box(b,.015,.0018,.022,glass,(i-4.5)*.020,.553,sign*.178);pane.rotation.x=sign*.49;
 }
 for(const z of [-.03,.04])k.box(b,.39,.002,.004,rib,0,.575,z);
 // Transparent balustrade keeps the terrace edge lighter than the old solid fascia.
 const bal=k.mat('#a0b5a9',.4,.08);bal.transparent=true;bal.opacity=.42;bal.depthWrite=false;
 k.box(b,1.06,.045,.002,bal,0,.178,.334);k.box(b,1.07,.002,.003,frame,0,.202,.334);
 for(let i=0;i<17;i++)k.box(b,.002,.046,.003,frame,(i-8)*.066,.177,.334);
 for(const s of [-1,1]){k.box(b,.002,.044,.14,bal,s*.532,.178,.26);k.box(b,.003,.002,.14,frame,s*.532,.202,.26);}
 k.box(b,.65,.002,.003,warm,0,.402,.156);
 plaque(k,b,'湖南博物院',.19,.026,.44,.183,.180);
 b.traverse(o=>{if(o.material)o.material.userData.museumRigid=true;});
 // Stair treads follow the globe until they meet the level terrace.
 const stair=stone.clone();k.materials.push(stair);stair.userData={museumStep:true};
 for(let i=0;i<12;i++){
  const z=.51-i*.015,ground=.016-sag(-.385,z),y=ground+(.154-ground)*(i+1)/12,h=y-ground+.005;k.box(g,.17,h,.016,stair,-.385,y-h/2+sag(-.385,z),z);
 }
 const base=plaza(k,g,.76,.58,'#bfc2b0');base.userData.groundSurface=true;
 for(const x of [-.61,.61])for(const z of [-.33,.35])tree(k,g,x,.015,z,.09);
 bollards(k,g,[[-.64,.43],[.61,.43],[-.15,.49],[.23,.49]],'#e2ceb0');people(k,g,[[-.20,.44],[.13,.40],[.27,.41]]);
 return k.merge(g);
}
