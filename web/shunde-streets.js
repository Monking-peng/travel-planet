import * as THREE from 'three';
import {roof,plaque,tree} from './wuhan-architecture.js';
import {people,bollards,glow} from './shenzhen-forms.js';
import {palette,footing,lattice,balcony,lantern,archWall,bridge} from './shunde-kit.js';

export function shunfengGate(k){
  const g=new THREE.Group(),p=palette(k),stone=k.mat('#c9c7b7'),relief=k.mat('#a6aa9b'),tile=k.mat('#a68e63'),jade=k.mat('#527c68');
  // Three true arch openings, distinct piers and seven roof sections.
  archWall(k,g,{w:1.05,h:.42,d:.095,y:.025,openings:[{x:0,r:.15,spring:.18},{x:-.36,r:.095,spring:.15},{x:.36,r:.095,spring:.15}],mat:stone});
  for(const x of [-.53,-.20,.20,.53]){
    k.box(g,.055,.47,.13,stone,x,.253,0);k.box(g,.085,.028,.17,relief,x,.048,0);k.box(g,.082,.022,.17,stone,x,.467,0);
    for(const z of [-.073,.073])for(let j=0;j<9;j++){const line=[[x-.015,.105+j*.036,z],[x+.015,.12+j*.036,z],[x-.014,.135+j*.036,z]];k.line(g,line,.002,relief);}
  }
  for(const [x,w,y,h]of [[0,.49,.48,.10],[-.36,.32,.44,.075],[.36,.32,.44,.075]]){
    k.box(g,w*.77,.055,.08,stone,x,y-.025,0);roof(k,g,w,.23,h,y,tile,jade,x,0);roof(k,g,w*.82,.18,h*.74,y+h*.70,tile,jade,x,0);
    for(let i=0;i<5;i++)k.box(g,w*.13,.025,.002,relief,x+(i-2)*w*.15,y-.043,.051);
    for(const s of [-1,1])k.line(g,[[x-w*.47,y+.008,s*.117],[x,y-.002,s*.117],[x+w*.47,y+.008,s*.117]],.0025,p.warm);
  }
  roof(k,g,1.18,.25,.08,.395,tile,jade);
  plaque(k,g,'顺峰山',.19,.044,0,.414,.067);
  for(const x of [-.60,.60]){k.box(g,.075,.045,.075,stone,x,.045,.30);const lion=k.mesh(g,new THREE.IcosahedronGeometry(.026,1),relief,x,.089,.30);lion.scale.set(.8,1.3,1);}
  for(const x of [-.49,-.17,.17,.49])k.box(g,.004,.003,.065,p.warm,x,.025,.08);
  return k.merge(g);
}

export function fengjian(k){
  const g=new THREE.Group(),p=palette(k),black=k.mat('#333c38'),gold=glow(k,'#c7a45c',.36),tile=k.mat('#777d65');footing(k,g,1.17,1.17,p);
  k.box(g,1.10,.009,.25,p.water,0,.025,.07);
  for(const z of [-.071,.211]){k.box(g,1.12,.028,.035,p.stone,0,.034,z);for(let i=0;i<28;i++)k.box(g,.035,.002,.034,p.wall,(i-13.5)*.039,.050,z);}
  const b=new THREE.Group();bridge(k,b,p,{w:.22,length:.64,rise:.14});b.rotation.y=Math.PI/2;b.position.set(-.13,0,.07);g.add(b);
  // Jinshi paifang at the bridge head: black columns, gilded beams, lifted tile roofs.
  const gate=new THREE.Group();for(const x of [-.28,-.13,.13,.28])for(const z of [-.04,.04]){k.cyl(gate,.008,.010,.35,black,x,.20,z,8);k.box(gate,.032,.035,.036,p.stone,x,.033,z);}
  for(const [x,w,y]of [[-.21,.24,.29],[0,.32,.40],[.21,.24,.29]]){
    k.box(gate,w,.055,.08,black,x,y-.04,0);k.box(gate,w-.015,.035,.003,gold,x,y-.04,.043);
    roof(k,gate,w+.04,.20,.065,y,tile,gold,x,0);
  }
  roof(k,gate,.28,.17,.06,.51,tile,gold);k.box(gate,.20,.055,.065,black,0,.475,0);plaque(k,gate,'进士',.16,.04,0,.359,.049);
  gate.position.set(-.13,0,-.35);g.add(gate);
  for(const x of [-.48,.42])tree(k,g,x,.02,-.30,.17);
  for(const x of [-.48,.46])tree(k,g,x,.02,.40,.14);
  // A small covered boat and mooring steps, not invented village blocks.
  const hull=k.mesh(g,new THREE.SphereGeometry(.07,18,10),p.wood,.35,.043,.065);hull.scale.set(1.7,.18,.48);
  const canopy=k.cyl(g,.028,.028,.082,p.tile,.35,.071,.065,16);canopy.rotation.z=Math.PI/2;canopy.scale.z=.9;
  for(const x of [.30,.40])k.box(g,.003,.037,.003,p.wood,x,.060,.085);
  for(let i=0;i<5;i++)k.box(g,.15,.015*(i+1),.025,p.stone,.34,.0075*(i+1),.23+i*.024);
  bollards(k,g,[[-.50,.27],[.50,.27],[-.50,-.15],[.50,-.15]]);people(k,g,[[-.26,.42],[-.18,.44],[.13,-.28],[.18,-.31]]);
  for(const x of [-.35,.08])lantern(k,g,x,.26,-.30,p);
  return k.merge(g);
}

function arcade(k,g,p,x,z,w,stories,color){
  const wall=k.mat(color),h=.075*stories;
  // Ground-floor colonnade has actual arches and recessed shop fronts.
  k.box(g,w,.10,.17,p.wood,x,.070,z-.02);
  archWall(k,g,{w,h:.13,d:.018,x,y:.018,z:z+.103,openings:[{r:w*.35,spring:.058}],mat:wall});
  k.box(g,w,h,.21,wall,x,.148+h/2,z);
  for(let level=0;level<stories;level++){
    const y=.19+level*.075;k.box(g,w+.006,.007,.23,p.wall,x,y-.037,z);
    for(const s of [-1,1]){k.box(g,.043,.046,.003,k.glass('#607a77','#e8c58d',level+3),x+s*w*.23,y,z+.107);lattice(k,g,x+s*w*.23,y,z+.111,.048,.051,p.wall);}
  }
  k.box(g,w+.018,.018,.24,p.wall,x,.155+h,z);balcony(k,g,x,z+.113,w,.163+h,p.wall);
  for(const xx of [x-w/2+.009,x+w/2-.009]){k.box(g,.015,h+.10,.012,p.wall,xx,.17+h/2,z+.112);k.box(g,.025,.012,.025,p.wall,xx,.138,z+.108);}
}
export function huagai(k){
  const g=new THREE.Group(),p=palette(k);footing(k,g,1.20,1.18,p);
  const road=k.mat('#b7b5a8'),joint=k.mat('#9b9e93');k.box(g,.33,.006,1.10,road,0,.022,0);
  for(let j=0;j<26;j++)k.box(g,.33,.001,.001,joint,0,.026,-.53+j*.042);
  const colors=['#9dbaa8','#d4c1ab','#c9b4ad','#9bb5b8'];
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const a=new THREE.Group();arcade(k,a,p,0,0,.22,2+(i===3?1:0),colors[(i+(side>0?1:0))%4]);a.rotation.y=-side*Math.PI/2;a.position.set(side*.29,0,.30-i*.23);g.add(a);
  }
  // Clock-tower entrance is the identifiable end of the walking street.
  const front=new THREE.Group();arcade(k,front,p,0,0,.30,3,'#d3d1bb');
  k.box(front,.16,.18,.18,p.wall,0,.48,0);k.box(front,.18,.016,.20,p.stone,0,.568,0);
  const pediment=new THREE.Shape();pediment.moveTo(-.10,0);pediment.lineTo(.10,0);pediment.lineTo(0,.08);pediment.closePath();k.mesh(front,new THREE.ExtrudeGeometry(pediment,{depth:.022,bevelEnabled:false}),p.wall,0,.577,.080);
  const face=k.cyl(front,.034,.034,.004,p.wall,0,.515,.098,48);face.rotation.x=Math.PI/2;
  const frame=k.mesh(front,new THREE.TorusGeometry(.035,.003,6,48),p.wood,0,.515,.102);
  k.beam(front,[0,.515,.105],[.018,.526,.105],.0018,p.wood,6);k.beam(front,[0,.515,.105],[-.003,.540,.105],.0014,p.wood,6);
  front.position.set(.31,0,.40);g.add(front);plaque(k,g,'华盖路步行街',.24,.034,-.04,.065,.52);
  for(let i=0;i<6;i++){
    const z=.37-i*.16;for(const x of [-.17,.17]){k.cyl(g,.0025,.004,.15,p.wood,x,.096,z,8);k.ball(g,.007,p.warm,x,.174,z);}
    k.line(g,[[-.20,.26,z],[0,.23,z],[.20,.26,z]],.001,p.wood);for(const x of [-.11,0,.11])lantern(k,g,x,.228,z,{...p,warm:glow(k,'#d76b43',.55)},.008);
  }
  people(k,g,Array.from({length:24},(_,i)=>[((i*7)%11-5)*.022,-.47+(i%12)*.079]));
  return k.merge(g);
}
