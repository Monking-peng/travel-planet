import * as THREE from 'three';
import {skin,plaza,bollards,people,glow} from './shenzhen-forms.js';
import {plaque,tree} from './wuhan-architecture.js';

function bevelRect(w,d,b=.016){return [[-w/2+b,d/2],[w/2-b,d/2],[w/2,d/2-b],[w/2,-d/2+b],[w/2-b,-d/2],[-w/2+b,-d/2],[-w/2,-d/2+b],[-w/2,d/2-b]];}
function prism(k,g,outline,height,y,mat,x=0,z=0){
  const points=outline.map(([a,b])=>new THREE.Vector2(a,b)),shape=new THREE.Shape(points);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geo.rotateX(Math.PI/2);geo.translate(x,y+height,z);return k.mesh(g,geo,mat);
}
export function ifs(k){
  const g=new THREE.Group(),stone=plaza(k,g,.70,.51),glass=k.glass('#4d6874','#dfd3b8',89),metal=k.mat('#86999b',.43,.35),belt=k.mat('#374e59'),gold=glow(k,'#edce8d',.95,.4,.48),white=glow(k,'#c9d9e4',.68,2,.35);
  stone.userData.groundSurface=true;glass.roughness=.46;glass.metalness=.18;
  // The taller and shorter tower retain their 452:315 height relationship.
  for(const [x,z,h,w,d]of [[-.28,-.04,1.52,.285,.25],[.29,-.07,1.06,.29,.26]]){
    const y=.13,outline=bevelRect(w,d);
    prism(k,g,outline,h*.86,y,glass,x,z);prism(k,g,bevelRect(w*.92,d*.92),h*.14,y+h*.86,glass,x,z);
    for(let i=0;i<8;i++){const [xx,zz]=outline[i];k.beam(g,[x+xx,y,z+zz],[x+xx,y+h*.86,z+zz],.0017,metal,4);}
    for(const side of [-1,1]){
      for(let i=1;i<16;i++)k.box(g,.0009,h*.86,.0015,metal,x+(i/16-.5)*(w-.027),y+h*.43,z+side*(d/2+.001));
      for(let i=1;i<14;i++)k.box(g,.0015,h*.86,.0009,metal,x+side*(w/2+.001),y+h*.43,z+(i/14-.5)*(d-.027));
      for(const f of [.34,.62,.86,.98]){k.box(g,w*.89,.014,.003,belt,x,y+h*f,z+side*d*.465);k.box(g,.003,.014,d*.89,belt,x+side*w*.465,y+h*f,z);}
      k.box(g,w*.90,.003,.003,white,x,y+h+.002,z+side*d*.463);
      k.box(g,.003,h*.84,.003,white,x+side*w*.448,y+h*.42,z+d*.501);
    }
    prism(k,g,bevelRect(w*.92,d*.92),.006,y+h,metal,x,z);
  }
  // Retail podium has stepped terraces, a recessed glazed base and luminous shop bands.
  for(let i=0;i<3;i++){const w=1.05-i*.08,d=.59-i*.07,y=.035+i*.035;k.box(g,w,.035,d,i%2?metal:belt,0,y,0);for(const side of [-1,1]){k.box(g,w,.0025,.002,gold,0,y+.018,side*d/2);k.box(g,.002,.0025,d,gold,side*w/2,y+.018,0);}}
  for(let i=0;i<14;i++)k.box(g,.044,.025,.006,glass,(i-6.5)*.069,.040,.300);
  plaque(k,g,'IFS 国金中心',.21,.045,0,.104,.229);
  for(const x of [-.57,.57])tree(k,g,x,.015,.23,.09);
  bollards(k,g,[[-.52,.36],[-.20,.40],[.20,.40],[.52,.36]],'#eace99');people(k,g,[[-.21,.31],[.18,.35],[.31,.31],[.40,.33]]);
  return k.merge(g);
}

function petalOutline(a,s){return s*(1+.26*Math.cos(a*3)+.065*Math.sin(a*2));}
function fluidVenue(k,g,{x,z,s,stretch=1,turn=0,height=.30,lobes=3},white,glass,edge,seam){
  const point=(a,r,y)=>{const radius=lobes===1?s*(1+.16*Math.cos(a)):petalOutline(a,s),xx=Math.cos(a)*radius*r*stretch,zz=Math.sin(a)*radius*r;return [x+xx*Math.cos(turn)-zz*Math.sin(turn),y,z+xx*Math.sin(turn)+zz*Math.cos(turn)];};
  const roofY=(a,r)=>.045+height*(.76+.15*Math.cos(a*lobes)*r)+.045*(1-r*r);
  // Continuous glass walls sit below a closed, gently rising folded roof.
  skin(k,g,(u,v)=>{const a=u*Math.PI*2;return point(a,1,.025+(roofY(a,1)-.025)*v);},10,128,glass);
  // Broad white folds dominate the actual buildings. Glazing sits in recessed
  // horizontal gaps rather than forming the whole external wall.
  for(const [lo,hi]of [[.24,.43],[.48,.65],[.70,.85],[.90,1]]){
    skin(k,g,(u,v)=>{const a=u*Math.PI*2,f=lo+(hi-lo)*v;return point(a,1.018+.013*Math.sin(v*Math.PI),.025+(roofY(a,1)-.025)*f);},4,128,white);
  }
  skin(k,g,(u,v)=>{const a=u*Math.PI*2,r=.001+.999*v;return point(a,r,roofY(a,r));},22,128,white);
  for(let ring=0;ring<5;ring++){
    const r=1-ring*.145;
    k.line(g,Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2;return point(a,r,roofY(a,r)+.0015);}),ring===0?.0027:.0012,ring===0?edge:seam,true);
  }
  // The lower ribbons fold with the same perimeter rather than floating flat rings.
  for(const f of [.24,.70])k.line(g,Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2;return point(a,1.021,.025+(roofY(a,1)-.025)*f);}),.0015,edge,true);
  for(let i=0;i<64;i++){const a=i/64*Math.PI*2;k.beam(g,point(a,1.001,.030),point(a,1.001,roofY(a,1)-.004),.001,seam,4);}
}
export function meixi(k){
  const g=new THREE.Group(),base=plaza(k,g,.83,.69,'#bdc3b9'),white=k.mat('#d1d8d4',.67,.12),glass=k.mat('#365b65',.49,.16,'#99bdc4'),edge=glow(k,'#c9e3df',.60,3,.38),seam=k.mat('#9caaa6',.70,.14);glass.userData.night.intensity=.12;
  base.userData.groundSurface=true;
  fluidVenue(k,g,{x:.02,z:.25,s:.23,stretch:1.38,turn:-.22,height:.27},white,glass,edge,seam);
  fluidVenue(k,g,{x:.32,z:-.29,s:.18,stretch:1.10,turn:.50,height:.23},white,glass,edge,seam);
  fluidVenue(k,g,{x:-.37,z:-.29,s:.17,stretch:1.23,turn:-.35,height:.18,lobes:1},white,glass,edge,seam);
  // A connected pedestrian forecourt surrounds the venues; only small edge
  // pools occupy water, matching the aerial view rather than an invented lake.
  const water=k.mat('#5a8982',.50,.10),green=k.mat('#788c69');
  for(const [x,z,rx,rz]of [[-.60,.10,.07,.24],[.60,.14,.07,.25],[-.11,-.49,.12,.047]]){
    const pool=k.cyl(g,rx,rx,.010,water,x,.026,z,48);pool.scale.z=rz/rx;
    const bed=k.cyl(g,rx*.75,rx*.75,.016,green,x+(x<0?-.015:.015),.029,z,48);bed.scale.z=rz/rx*.75;
  }
  const path=k.mat('#d4d6ca');
  k.line(g,[[-.66,.023,-.03],[-.20,.023,-.01],[.02,.023,-.06],[.53,.023,-.02]],.018,path);
  bollards(k,g,[[-.68,.32],[-.32,.50],[.38,.43],[.64,-.30]],'#cee1dc');people(k,g,[[-.15,-.02],[.04,-.07],[.47,-.02]]);
  return k.merge(g);
}

export function hunanMuseum(k){
  const g=new THREE.Group(),base=plaza(k,g,.76,.58,'#c0bcaa'),stone=k.mat('#c2bda8'),dark=k.mat('#5c6564',.66,.2),glass=k.mat('#7d9698',.35,.22,'#e5dcc0'),edge=glow(k,'#e4ce9c',.48);glass.userData.night.intensity=.14;
  base.userData.groundSurface=true;
  // Broad overhanging roof and central glazed atrium, distinct from a classical hip roof.
  const outline=bevelRect(.79,.54,.065),lower=bevelRect(.50,.32,.028),p=[],idx=[];
  for(let i=0;i<8;i++){p.push(outline[i][0],.47,outline[i][1]);p.push(lower[i][0],.385,lower[i][1]);}
  for(let i=0;i<8;i++){const a=i*2,b=((i+1)%8)*2;idx.push(a,b,a+1,a+1,b,b+1);}idx.push(0,2,4,0,4,6,0,6,8,0,8,10,0,10,12,0,12,14);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();dark.side=THREE.DoubleSide;k.mesh(g,geo,dark);
  k.box(g,.54,.28,.30,glass,0,.236,0);
  for(let i=0;i<12;i++)k.box(g,.54,.002,.004,dark,0,.105+i*.023,.152);
  for(let i=0;i<11;i++)k.box(g,.002,.278,.004,dark,(i-5)*.051,.236,.153);
  for(const x of [-.18,.18]){k.box(g,.009,.37,.016,stone,x,.235,.19);k.box(g,.049,.005,.009,stone,x,.398,.204);for(const y of [.15,.27,.38])k.box(g,.047,.005,.009,stone,x,y,.206);for(const side of [-1,1])k.box(g,.005,.23,.009,stone,x+side*.024,.275,.206);}
  for(const side of [-1,1]){k.box(g,.28,.27,.40,stone,side*.46,.285,-.035);k.box(g,.28,.014,.43,dark,side*.46,.43,-.035);for(let i=0;i<22;i++)k.box(g,.27,.0012,.002,dark,side*.46,.160+i*.012,.167);k.box(g,.27,.003,.004,edge,side*.46,.151,.170);}
  k.box(g,1.12,.045,.13,dark,0,.13,.23);k.box(g,.70,.115,.28,dark,0,.06,.03);
  for(const x of [-.30,0,.30]){k.box(g,.018,.11,.08,stone,x,.070,.24);k.box(g,.21,.071,.006,glass,x+.015,.053,.177);}
  k.box(g,.72,.002,.004,edge,0,.108,.181);
  for(let i=0;i<10;i++)k.box(g,.23,.012*(i+1),.024,base,-.41,.006*(i+1),.45-i*.024);
  for(const x of [-.58,.58])k.box(g,.15,.03,.24,k.mat('#748367'),x,.031,.32);
  plaque(k,g,'湖南博物院',.25,.045,0,.345,.157);
  bollards(k,g,[[-.61,.40],[.61,.40],[-.20,.45],[.20,.45]]);people(k,g,[[-.19,.33],[.13,.37],[.25,.33]]);return k.merge(g);
}

export function xie(k){
  const g=new THREE.Group(),base=plaza(k,g,.76,.62,'#b9c0ae'),white=k.mat('#d3d6c7',.92),seam=k.mat('#afb7ac'),glass=k.mat('#4e6e73',.30,.18,'#e1ceac'),warm=glow(k,'#e8cf9e',.58);glass.userData.night.intensity=.40;
  base.userData.groundSurface=true;
  k.box(g,1.18,.010,.73,k.mat('#6e9690',.32,.13),0,.021,.12);
  // An open, supported cantilever shelters the water court and a narrow crossing.
  k.box(g,.97,.047,.48,white,0,.365,-.10);k.box(g,.97,.15,.065,white,0,.264,-.305);
  k.box(g,.14,.32,.48,white,-.415,.203,-.10);k.box(g,.12,.32,.48,white,.425,.203,-.10);
  k.box(g,.70,.135,.032,white,0,.296,.138);
  // Two genuine horizontal slots in the upper facade.
  k.box(g,.70,.025,.032,white,0,.210,.138);k.box(g,.045,.042,.032,white,0,.244,.138);
  for(const x of [-.18,.18])k.box(g,.28,.034,.005,glass,x,.244,.116);
  k.box(g,.70,.16,.008,glass,0,.132,-.23);
  for(let i=0;i<9;i++)k.box(g,.004,.158,.006,seam,(i-4)*.079,.132,-.224);
  k.box(g,.072,.017,.81,white,.16,.039,.16);
  k.box(g,.48,.024,.17,white,0,.034,-.05);
  for(let i=0;i<16;i++)k.box(g,.025,.012*(i+1),.13,white,-.19+i*.025,.043+.006*(i+1),-.05);
  k.box(g,.042,.25,.42,white,.30,.169,-.07);
  for(let row=0;row<4;row++)for(let col=0;col<18;col++)k.ball(g,.0013,seam,-.45+col*.052,.281+row*.026,.156);
  k.box(g,.65,.002,.003,warm,0,.198,.122);k.box(g,.003,.003,.57,warm,.121,.049,.16);
  plaque(k,g,'谢子龙影像艺术馆',.26,.032,.05,.327,.157);
  for(const [x,z]of [[-.62,.33],[.59,.34],[-.54,-.43]])tree(k,g,x,.014,z,.10);
  bollards(k,g,[[-.57,.46],[.56,.46],[-.60,-.35],[.59,-.35]],'#e0d1b3');people(k,g,[[.16,.40],[.16,.26],[-.54,.31]]);
  return k.merge(g);
}
