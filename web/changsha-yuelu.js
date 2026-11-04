import * as THREE from 'three';
import {plaza,bollards,people,glow,skin} from './shenzhen-forms.js';
import {tree,plaque} from './wuhan-architecture.js';

const sag=(x,z)=>2.15-Math.sqrt(2.15**2-x*x-z*z);
function roof(k,g,p,w,d,y,h,{hip=true,tile=p.tile,trim=p.ochre}={}){
 const ridge=Math.max(.01,w/2-d*.40);
 const point=(u,v)=>{
  const side=Math.floor(u*4)%4,t=u*4%1*2-1;let x,z;
  if(side===0){x=t*w/2;z=d/2;}else if(side===1){x=w/2;z=-t*d/2;}else if(side===2){x=-t*w/2;z=-d/2;}else{x=-w/2;z=t*d/2;}
  const xx=hip?x*v+(1-v)*(x/(w/2))*ridge:x;
  return [xx,y+h*(1-v)**1.35+.016*v**7*(Math.abs(x)/(w/2))**8,z*v];
 };
 // A closed ridge and continuous mapping avoid the old fan-shaped roof seams.
 skin(k,g,point,18,96,tile);skin(k,g,(u,v)=>{const q=point(u,v);q[1]-=.004;return q;},18,96,p.red);
 k.line(g,Array.from({length:96},(_,i)=>point(i/96,1)),.0023,trim,true);
 const count=Math.ceil(w/.012);
 for(let i=0;i<=count;i++)for(const side of [0,2]){
  const u=(side+i/count)/4;k.line(g,Array.from({length:14},(_,j)=>{const q=point(u,.015+j/13*.985);q[1]+=.0017;return q;}),.0011,p.rib);
 }
 k.box(g,ridge*2,.008,.009,p.rib,0,y+h+.003,0);
 for(const sign of [-1,1])k.line(g,[[sign*ridge,y+h,0],[sign*(ridge+.008),y+h+.018,0],[sign*(ridge+.003),y+h+.029,0]],.003,trim);
 if(hip)for(let i=0;i<4;i++){const q=point(i/4,1);k.line(g,[q,[q[0]*1.015,q[1]+.017,q[2]*1.015]],.0024,trim);}
 // Solid gable end panels under a projecting pitched roof.
 if(!hip)for(const s of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-d/2,y);shape.lineTo(0,y+h);shape.lineTo(d/2,y);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.006,bevelEnabled:false});geo.rotateY(Math.PI/2);k.mesh(g,geo,p.wall,s*(w/2-.012),0,0);
 }
}
function window(k,g,p,x,y,z,w,h){
 k.box(g,w,h,.003,p.glass,x,y,z);for(const xx of [-w/2,w/2])k.box(g,.003,h+.006,.005,p.wood,x+xx,y,z+.003);
 for(let i=0;i<=4;i++)k.box(g,.0013,h,.006,p.wood,x-w/2+i*w/4,y,z+.004);
 for(const yy of [-h/2,-h*.25,h*.25,h/2])k.box(g,w,.0018,.006,p.wood,x,y+yy,z+.004);
}
function base(k,g,p,x,z,w,d,rotation=0){
 const b=new THREE.Group(),c=Math.cos(rotation),s=Math.sin(rotation),corners=[[-w/2,-d/2],[-w/2,d/2],[w/2,-d/2],[w/2,d/2]];
 const top=.026-Math.min(...corners.map(([xx,zz])=>sag(x+xx*c+zz*s,z-xx*s+zz*c)));
 b.position.set(x,top,z);b.rotation.y=rotation;g.add(b);
 const geo=new THREE.BoxGeometry(w+.014,1,d+.014,18,1,14),a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const xx=a.getX(i),zz=a.getZ(i);a.setY(i,a.getY(i)>0?0:.012-sag(x+xx*c+zz*s,z-xx*s+zz*c)-top);}
 geo.computeVertexNormals();k.mesh(b,geo,p.stone);return b;
}
function stairs(k,g,p,b,width,depth,count=6){
 const x=b.position.x,z=b.position.z+depth/2,top=b.position.y;
 // Separate ground-following material: roof and wall materials remain rigid.
 for(let i=0;i<count;i++){const zz=z+.006+(count-1-i)*.013,ground=.013-sag(x,zz),y=ground+(top-ground)*(i+1)/count,height=Math.max(.005,y-ground+.003);k.box(g,width,height,.014,p.step,x,y-height/2+sag(x,zz),zz);}
}
function hall(k,g,p,{x,z,w,d,h=.14,rotation=0,name='',tile=p.tile,wall=p.wall,open=false,double=false}={}){
 const b=base(k,g,p,x,z,w,d,rotation);const y=.012;
 if(open){for(const s of [-1,1]){k.box(b,(w-.12)/2,h,d*.34,wall,s*(w+.12)/4,y+h/2,-d*.31);k.box(b,.013,h,d*.72,wall,s*(w/2-.007),y+h/2,-d*.06);}k.box(b,.12,.035,d*.34,wall,0,y+h-.0175,-d*.31);}
 else k.box(b,w-.014,h,d*.73,wall,0,y+h/2,-d*.09);
 for(let i=0;i<6;i++){const xx=(i/5-.5)*w*.94;k.cyl(b,.004,.0045,h+.012,p.wood,xx,y+h/2,d*.43,8);if(i<5&&(!open||i!==2))window(k,b,p,xx+w*.94/10,y+h*.49,d*.28,w*.15,h*.61);}
 k.box(b,w,.010,.012,p.wood,0,h+.008,d*.43);
 roof(k,b,p,w+.06,d+.065,h+.020,.068,{tile});
 if(double){k.box(b,w*.79,.065,d*.68,wall,0,h+.081,0);roof(k,b,p,w+.03,d+.035,h+.12,.070,{tile});}
 if(name)plaque(k,b,name,w*.35,.029,0,h-.018,d*.45+.002);
 return b;
}
function gate(k,g,p,{x,z,w=.51,second=false}){
 const d=.13,b=base(k,g,p,x,z,w,d),h=.15;
 if(second){
  for(const sign of [-1,1])k.box(b,w*.20,h,d,p.wall,sign*w*.40,h/2,0);
  for(const xx of [-.28,-.093,.093,.28])k.box(b,.009,h,.09,p.wood,xx*w,h/2,0);
  k.box(b,w*.60,.041,d,p.wall,0,h-.0205,0);
 }else{
  for(const sign of [-1,1]){k.box(b,(w-.115)/2,h,d,p.wall,sign*(w+.115)/4,h/2,0);k.cyl(b,.006,.007,h,p.stone,sign*.082,h/2,.069,12);window(k,b,p,sign*.19,.075,.066,.060,.075);}
  k.box(b,.125,.043,d,p.wood,0,h-.0215,0);
  for(const sign of [-1,1]){const drum=k.cyl(b,.014,.014,.011,p.stone,sign*.073,.023,.085,18);drum.rotation.x=Math.PI/2;k.box(b,.027,.010,.025,p.stone,sign*.073,.005,.085);}
 }
 roof(k,b,p,w+.045,d+.060,h,.046,{hip:false});plaque(k,b,second?'名山坛席':'岳麓书院',second?.13:.145,.032,0,.128,.071);
 for(const sign of [-1,1]){
  const l=k.box(b,.012,.024,.012,p.lamp,sign*(second?w*.37:.135),.105,.086);k.box(b,.016,.003,.016,p.wood,l.position.x,.119,.086);k.box(b,.016,.003,.016,p.wood,l.position.x,.091,.086);
 }
 stairs(k,g,p,b,second?w*.60:.19,d,second?4:6);return b;
}
function library(k,g,p){
 const b=base(k,g,p,-.20,-.43,.50,.25),d=.25;
 k.box(b,.46,.31,.21,p.dark,0,.155,-.02);
 for(const level of [0,1,2]){const y=.025+level*.123;
  for(let i=0;i<7;i++){const x=(i/6-.5)*.45;k.box(b,.006,.111,.008,p.wood,x,y+.055,d*.40);if(i<6)window(k,b,p,x+.0375,y+.054,d*.375,.057,.071);}
  k.box(b,.47,.010,.014,p.wood,0,y+.110,d*.42);
  if(level<2){const porch=new THREE.Group();porch.position.z=.093;b.add(porch);roof(k,porch,p,.53,.17,y+.111,.033,{tile:p.tile});}
 }
 // Carry the timber bay rhythm around the simplified rear and side elevations.
 for(const y of [.018,.139,.262,.370]){
  k.box(b,.468,.008,.008,p.rib,0,y,-.128);
  for(const sign of [-1,1])k.box(b,.008,.008,.214,p.rib,sign*.233,y,-.021);
 }
 const back=new THREE.Group();back.rotation.y=Math.PI;b.add(back);
 for(const x of [-.185,-.111,-.037,.037,.111,.185])for(const y of [.075,.197,.319])window(k,back,p,x,y,.129,.052,.064);
 for(const sign of [-1,1]){
  const side=new THREE.Group();side.rotation.y=sign*Math.PI/2;b.add(side);
  for(const x of [-.067,.007,.081])for(const y of [.075,.197,.319])window(k,side,p,x,y,.234,.046,.064);
 }
 roof(k,b,p,.57,.35,.378,.078,{tile:p.tile});
 plaque(k,b,'御书楼',.10,.034,0,.352,.129);stairs(k,g,p,b,.23,.25,6);
 return b;
}
export function yuelu(k){
 const g=new THREE.Group(),p={wall:k.mat('#e5e2d7',.95),stone:k.mat('#acae9f',.96),tile:k.mat('#5e625d',.90),rib:k.mat('#788078',.84),red:k.mat('#925345',.9),wood:k.mat('#343f3a',.9),dark:k.mat('#36433f',.92),glass:k.mat('#65746a',.82),ochre:k.mat('#bc9d62',.85),lamp:glow(k,'#e5c290',.28)};
 p.tile.userData.academyRoof=true;p.glass.userData.night={color:new THREE.Color('#d2b587'),intensity:.14};p.step=p.stone.clone();k.materials.push(p.step);p.step.userData.academyStep=true;
 const floor=plaza(k,g,.79,.73,'#aeb69a');floor.userData.groundSurface=true;
 gate(k,g,p,{x:-.20,z:.49});gate(k,g,p,{x:-.20,z:.245,second:true});
 const lecture=hall(k,g,p,{x:-.20,z:-.035,w:.51,d:.20,h:.15,open:true,name:'实事求是'});stairs(k,g,p,lecture,.13,.20,3);library(k,g,p);
 for(const x of [-.52,.12])for(const z of [.365,.105,-.205])hall(k,g,p,{x,z,w:.15,d:.115,h:.090,rotation:x<0?Math.PI/2:-Math.PI/2});
 const yellow=k.mat('#ba8e3f',.79),templeRed=k.mat('#a77368',.91);
 yellow.userData.academyRoof=true;const temple=hall(k,g,p,{x:.43,z:.015,w:.29,d:.23,h:.16,double:true,tile:yellow,wall:templeRed,name:'大成殿'});stairs(k,g,p,temple,.19,.23,6);
 hall(k,g,p,{x:.43,z:-.365,w:.28,d:.18,h:.13,tile:yellow,wall:templeRed,name:'崇圣祠'});
 gate(k,g,{...p,wall:templeRed,tile:yellow},{x:.43,z:.39,w:.29,second:true});
 for(const x of [.235,.625])for(const z of [.235,-.19])hall(k,g,p,{x,z,w:.15,d:.077,h:.075,rotation:x<.4?Math.PI/2:-Math.PI/2,tile:p.tile,wall:templeRed});
 // Small pond and low wall separate the garden from the main teaching court.
 const water=k.mat('#648c7c',.58,.08);water.side=THREE.DoubleSide;const pond=k.cyl(g,.12,.12,.004,water,-.61,.020,-.36,48);pond.scale.z=1.45;
 for(const [x,z,s]of [[-.43,.365,.090],[-.40,.105,.095],[-.61,-.56,.13],[-.62,.19,.11],[.70,-.36,.12],[.68,.43,.09],[.11,-.56,.11],[-.36,-.61,.12]])tree(k,g,x,.015,z,s);
 for(const b of g.children)if(b.isGroup)b.traverse(o=>{if(o.material)o.material.userData.academyRigid=true;});
 // Stone steps, garden and visitors conform to the globe; halls stay straight.
 bollards(k,g,[[-.38,.62],[-.04,.62],[.17,.39],[.16,-.30]],'#d9be90');people(k,g,[[-.22,.63],[-.18,.64],[-.28,.345],[.42,.26]]);k.merge(g);
 return g;
}
