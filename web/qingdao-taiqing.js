import * as THREE from 'three';
import {palette,site,disc,finish,sign,skin,TAU} from './qingdao-kit.js';

function roof(k,g,p,w,d,y,h,tile=p.gray,ornate=false){
 const edge=ornate?p.cyanEdge:p.grayEdge;
 const point=(u,t,side)=>{const x=(u-.5)*w,z=side*t*d/2;return [x,y+h*(1-t)**1.35+.011*t**7*(Math.abs(x)/(w/2))**10,z];};
 for(const side of [-1,1]){
  skin(k,g,(u,t)=>point(u,t,side),28,12,tile);
  const rows=Math.ceil(w/.014);for(let i=0;i<=rows;i++){
   const line=Array.from({length:9},(_,j)=>{const a=point(i/rows,j/8,side);a[1]+=.0018;return a;});k.line(g,line,.0017,edge);
   const a=point(i/rows,1,side);const cap=k.mesh(g,new THREE.CircleGeometry(.0025,10),edge,a[0],a[1],a[2]+side*.001);if(side<0)cap.rotation.y=Math.PI;
  }
  k.line(g,Array.from({length:25},(_,i)=>point(i/24,1,side)),.003,edge);
 }
 k.box(g,w,.009,.011,edge,0,y+h+.003,0);
 for(const side of [-1,1]){
  const x=side*w/2,s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(0,h);s.lineTo(d/2,0);s.closePath();const wall=k.mesh(g,new THREE.ShapeGeometry(s),p.masonry,x,y,0);wall.rotation.y=Math.PI/2;
  if(ornate){
   k.line(g,[[x-side*.030,y+h+.009,0],[x-side*.015,y+h+.028,0],[x,y+h+.030,0],[x+side*.006,y+h+.047,0],[x-side*.004,y+h+.054,0],[x-side*.012,y+h+.043,0]],.004,edge);
   for(const face of [-1,1])for(let j=0;j<3;j++){const t=.56+j*.16,a=point(side>0?1:0,t,face);k.cyl(g,.002,.003,.009,edge,a[0],a[1]+.006,a[2],6);k.ball(g,.003,edge,a[0],a[1]+.012,a[2]);}
  }
 }
}
function fret(k,g,p,x,y,z,w,h){
 k.box(g,w,h,.004,p.dark,x,y+h/2,z);
 for(const side of [-1,1])k.box(g,.002,h,.003,p.red,x+side*w/2,y+h/2,z+.003);
 for(const yy of [0,h*.25,h*.5,h*.75,h])k.box(g,w,.002,.003,p.red,x,y+yy,z+.003);
 for(let i=1;i<5;i++)k.box(g,.0018,h,.003,p.red,x-w/2+w*i/5,y+h/2,z+.003);
 for(const side of [-1,1]){k.box(g,w*.25,.0018,.003,p.red,x+side*w*.25,y+h*.375,z+.004);k.box(g,.0018,h*.25,.003,p.red,x+side*w*.25,y+h*.5,z+.004);}
}
function paintedBeam(k,g,p,w,y,z){
 k.box(g,w,.027,.025,p.blue,0,y,z);
 for(const yy of [-.012,.012])k.box(g,w,.0018,.027,p.cyanEdge,0,y+yy,z);
 for(let i=0;i<Math.round(w/.045);i++){
  const x=((i+.5)/Math.round(w/.045)-.5)*w;
  const diamond=k.box(g,.009,.009,.0015,p.cyanEdge,x,y,z+.014);diamond.rotation.z=Math.PI/4;
  k.ball(g,.0025,p.gold,x,y,z+.016);
 }
}
function brackets(k,g,p,w,y,z){
 for(let i=0;i<=Math.floor(w/.045);i++){
  const x=(i/Math.floor(w/.045)-.5)*w*.91;
  k.box(g,.012,.010,.035,p.red,x,y,z);k.box(g,.029,.008,.039,p.blue,x,y+.009,z+.005);k.box(g,.044,.006,.044,p.cyan,x,y+.016,z+.008);
  k.box(g,.008,.006,.047,p.gold,x,y+.022,z+.009);
 }
}
function gate(k,g,p){
 const q=new THREE.Group();q.position.set(0,.066,.235);g.add(q);
 for(const [x,w,top,isSide]of [[0,.326,.272,false],[-.259,.190,.233,true],[.259,.190,.233,true]]){
  const bay=new THREE.Group();bay.position.x=x;q.add(bay);
  for(const sign of [-1,1]){
   k.box(bay,.026,top-.02,.082,p.masonry,sign*(w/2-.013),(top-.02)/2,0);
   k.box(bay,.034,.021,.090,p.stone,sign*(w/2-.013),.0105,0);
   k.box(bay,.038,.014,.095,p.pale,sign*(w/2-.013),top-.024,0);
  }
  const clear=w-.052,lintel=top-.095;
  k.box(bay,clear,.047,.049,p.red,0,lintel+.024,0);
  // The smaller entries remain actual through passages, as in the reference.
  if(!isSide){
   k.box(bay,clear,.172,.015,p.red,0,.086,0);
   k.box(bay,.0015,.172,.016,p.dark,0,.086,.001);
   for(const xx of [-clear*.25,clear*.25]){for(const yy of [.046,.122]){k.box(bay,clear*.39,.053,.003,p.redEdge,xx,yy,.010);k.box(bay,clear*.34,.045,.003,p.red,xx,yy,.012);}k.mesh(bay,new THREE.TorusGeometry(.007,.0015,5,16),p.brass,xx*.22,.092,.012);}
  }else{
   for(const xx of [-clear/2-.001,clear/2+.001]){k.box(bay,.008,lintel,.054,p.red,xx,lintel/2,0);k.box(bay,.004,lintel-.015,.056,p.redEdge,xx,lintel/2,0);}
  }
  // Muted inset panels suggest the painted lintels without reproducing murals.
  k.box(bay,clear*.92,.034,.004,p.mural,0,lintel+.024,.027);
  for(let j=-2;j<=2;j++)k.line(bay,[[j*clear/6-.012,lintel+.013,.030],[j*clear/6,lintel+.033,.030],[j*clear/6+.013,lintel+.016,.030]],.0012,p.gold);
  paintedBeam(k,bay,p,w,top-.040,.020);brackets(k,bay,p,w,top-.025,.025);
  roof(k,bay,p,w+.045,.157,top,.047,p.cyan,true);
 }
 for(const x of [-.438,.438]){
  k.box(q,.160,.110,.051,p.red,x,.055,0);k.box(q,.162,.023,.061,p.masonry,x,.0115,0);
  const wall=new THREE.Group();wall.position.x=x;q.add(wall);roof(k,wall,p,.178,.071,.114,.018);
 }
 sign(k,q,'崂山太清宫',.225,.043,0,.229,.088,{background:'#353a34',color:'#d6b266'});
}
function hall(k,g,p,{x=0,z=-.22,w=.49,d=.27,y=.089,h=.18,rotation=0,main=true}={}){
 const q=new THREE.Group();q.position.set(x,y,z);q.rotation.y=rotation;g.add(q);
 k.box(q,w+.027,.019,d+.045,p.masonry,0,-.0095,0);
 // Side and rear walls leave a genuinely recessed front veranda.
 for(const side of [-1,1])k.box(q,.015,h,d*.82,p.masonry,side*(w/2-.0075),h/2,-d*.04);
 k.box(q,w,h,.016,p.masonry,0,h/2,-d*.44);
 const front=d*.29;
 for(let bay=0;bay<3;bay++){
  const xx=(bay-1)*w*.30;
  if(bay===1&&main){for(const side of [-1,1]){const door=new THREE.Group();door.position.set(xx+side*w*.11,0,front);door.rotation.y=side*-.9;q.add(door);fret(k,door,p,side*w*.045,.015,0,w*.09,h*.69);}}
  else{fret(k,q,p,xx,.046,front,w*.24,h*.50);k.box(q,w*.25,.040,.015,p.red,xx,.020,front);}
 }
 for(const xx of [-.46,-.16,.16,.46]){
  k.cyl(q,.005,.006,h,p.red,xx*w,h/2,d*.45,10);k.cyl(q,.008,.009,.014,p.stone,xx*w,.007,d*.45,10);
  if(main)k.box(q,.010,h*.68,.003,p.gold,xx*w,h*.42,d*.45+.007);
 }
 paintedBeam(k,q,p,w,h-.019,d*.45);brackets(k,q,p,w,h-.002,d*.46);
 roof(k,q,p,w+.024,d+.065,h+.024,.067);
 if(main)sign(k,q,'三清殿',.105,.031,0,h-.022,d*.51,{background:'#32372f',color:'#d7b55e'});
 for(const side of [-1,1])for(let j=1;j<5;j++)k.box(q,.001,.001,d*.82,p.joint,side*(w/2+.001),j*h/5,-d*.04);
}
function tree(k,g,p,x,z,h,width,base){
 const q=new THREE.Group();q.position.set(x,base,z);g.add(q);const lean=.020*Math.sin(x*37+z*19);
 k.beam(q,[0,0,0],[lean,h*.65,.008],.008,p.bark,8);
 for(let i=0;i<7;i++){
  const angle=i*2.399+z*5,dx=Math.cos(angle)*width*.55,dz=Math.sin(angle)*width*.48,yy=h*(.58+.12*Math.sin(i*2.1));
  k.beam(q,[lean*.6,h*.35,0],[dx,yy,dz],.0035,p.bark,6);
  const geo=new THREE.IcosahedronGeometry(1,2),a=geo.attributes.position;for(let j=0;j<a.count;j++){const xx=a.getX(j),zz=a.getZ(j),f=1+.10*Math.sin(xx*11+zz*8+i*2);a.setXYZ(j,xx*f,a.getY(j)*(1+.05*Math.sin(zz*17+i)),zz*f);}geo.computeVertexNormals();const o=k.mesh(q,geo,p.leaves[i%3],dx,yy+.014,dz);o.scale.set(width*.65,h*.19,width*.55);
 }
}
function lion(k,g,p,x,z){
 const q=new THREE.Group();q.position.set(x,.021,z);g.add(q);k.box(q,.064,.052,.071,p.masonry,0,.026,0);k.box(q,.071,.008,.077,p.pale,0,.056,0);
 const body=k.ball(q,.023,p.stone,0,.085,-.008);body.scale.set(.72,1.25,.9);
 for(const side of [-1,1]){k.beam(q,[side*.013,.089,.006],[side*.018,.064,.024],.0055,p.stone);const paw=k.ball(q,.007,p.stone,side*.018,.065,.026);paw.scale.z=1.35;}
 k.ball(q,.019,p.stone,0,.119,.005);const muzzle=k.ball(q,.011,p.pale,0,.115,.020);muzzle.scale.set(1,.65,.8);
 for(let i=0;i<10;i++){const a=i/10*TAU;k.ball(q,.006,p.stone,Math.cos(a)*.017,.121+Math.sin(a)*.016,-.004);}
 for(const side of [-1,1])k.ball(q,.0017,p.dark,side*.008,.124,.021);
 k.line(q,[[0,.071,-.025],[.024,.078,-.030],[.031,.097,-.018]],.003,p.stone);
}
export function taiqing(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.70,.66);
 Object.assign(p,{masonry:k.mat('#a7aa99',.98),joint:k.mat('#797f71',.98),cyan:k.mat('#408b91',.68,.10),cyanEdge:k.mat('#63a5a6',.72,.08),blue:k.mat('#284e69',.9,0),gray:k.mat('#677064',.96,0),grayEdge:k.mat('#858d7a',.96,0),red:k.mat('#913c32',.94,0),redEdge:k.mat('#ac5542',.91,0),dark:k.mat('#293d34',.96,0),mural:k.mat('#8f8d6b',.96,0),brass:k.mat('#bba46a',.6,.25),bark:k.mat('#6c6751',.99,0),leaves:['#4e6943','#607849','#718353'].map(c=>k.mat(c,.99,0))});
 for(const m of [p.blue,p.cyanEdge,p.gold])m.userData.night={color:new THREE.Color('#efd3a2'),intensity:.11};
 p.masonry.userData.taiqingStone=true;p.red.userData.taiqingDoor=true;
 disc(k,g,.61,.55,.021,p.pale);
 k.box(g,.98,.045,.764,p.masonry,0,.0435,-.055);
 k.box(g,.94,.002,.71,p.pale,0,.067,-.062);
 for(let j=0;j<14;j++){const z=.276-j*.048;k.box(g,.92,.0008,.0008,p.joint,0,.0685,z);for(let i=0;i<11;i++){const x=-.44+(i+.5+(j%2)*.5)*.080;if(x<.455)k.box(g,.0007,.0008,.047,p.joint,x,.0685,z-.024);}}
 for(let i=0;i<6;i++){const top=.021+(i+1)*.0075;for(const [x,w]of [[0,.242],[-.259,.166],[.259,.166]])k.box(g,w,top-.021,.020,p.masonry,x,(top+.021)/2,.437-i*.020);}
 for(const x of [-.160,.160]){const s=new THREE.Shape();s.moveTo(.327,.066);s.lineTo(.447,.021);s.lineTo(.447,.028);s.lineTo(.327,.074);s.closePath();const o=k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.020,bevelEnabled:false}),p.pale,x-.010,0,0);o.rotation.y=-Math.PI/2;}
 gate(k,g,p);hall(k,g,p);
 for(const x of [-.38,.38])hall(k,g,p,{x,z:-.05,w:.30,d:.14,y:.071,h:.115,rotation:x<0?Math.PI/2:-Math.PI/2,main:false});
 // The hall platform is reached by low, continuous steps inside the court.
 for(let i=0;i<3;i++){const top=.068+(i+1)*.007;k.box(g,.25,top-.068,.016,p.masonry,0,(top+.068)/2,-.040-i*.016);}
 const incense=k.mat('#5e6754',.88,.12);for(const x of [-.022,.022])k.cyl(g,.002,.004,.025,incense,x,.081,.019,6);k.box(g,.075,.021,.040,incense,0,.099,.019);k.box(g,.084,.004,.048,p.brass,0,.112,.019);
 for(const x of [-.422,.422])lion(k,g,p,x,.414);
 // Low fractured granite and irregular trees replace the oversized boulder wall.
 for(const [cx,cz,scale]of [[-.44,-.39,1],[-.23,-.49,1.12],[.13,-.51,1.08],[.40,-.43,.94]])for(let i=0;i<3;i++){
  const x=cx+.043*Math.sin(i*2.4+cx*12),z=cz+.031*Math.cos(i*2.1),rx=(.095+i*.013)*scale,ry=(.055+i*.012)*scale;
  const geo=new THREE.DodecahedronGeometry(1,0),o=k.mesh(g,geo,p.stone,x,ground(x,z)+ry*.75,z);o.scale.set(rx,ry,.080*scale);o.rotation.set(.15*Math.sin(i),cx+i*.8,.12*Math.cos(i));o.updateMatrix();geo.applyMatrix4(o.matrix);o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);
  const a=geo.attributes.position;for(let j=0;j<a.count;j++)a.setY(j,Math.max(a.getY(j),ground(a.getX(j),a.getZ(j))+.001));geo.computeVertexNormals();
 }
 for(const [x,z,h,w]of [[-.54,.12,.29,.095],[.55,.10,.31,.10],[-.55,-.16,.38,.11],[.54,-.21,.35,.11],[-.43,-.40,.39,.105],[.42,-.42,.35,.10],[-.20,-.48,.37,.12],[.09,-.49,.40,.115],[-.22,.006,.19,.060],[.22,.006,.18,.06]])tree(k,g,p,x,z,h,w,Math.abs(x)<.3&&z>-.1?.068:ground(x,z));
 return finish(k,g,{lamps:[[-.32,.069,.13],[.32,.069,.13],[-.51,.024,.34],[.51,.024,.34]],visitors:[[-.24,.069,.16],[.25,.069,.01],[-.06,.023,.49],[.09,.023,.48]]});
}
