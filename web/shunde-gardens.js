import * as THREE from 'three';
import {roof,tree,plaque} from './wuhan-architecture.js';
import {people,bollards,skin} from './shenzhen-forms.js';
import {palette,footing,lattice,balcony,lantern,moonWall} from './shunde-kit.js';

export function bijiang(k){
  const g=new THREE.Group(),p=palette(k);footing(k,g,1.04,.94,p);
  k.box(g,.60,.29,.35,p.brick,-.10,.163,-.16);
  k.box(g,.61,.018,.37,p.wall,-.10,.31,-.16);
  skin(k,g,(u,v)=>[-.44+u*.68,.32+.13*(1-Math.abs(v*2-1)),-.385+v*.45],12,32,p.tile);
  for(let i=0;i<=28;i++){const x=-.44+i*.68/28;k.line(g,[[x,.324,-.385],[x,.454,-.16],[x,.324,.065]],.0012,p.tile);}
  k.box(g,.69,.009,.014,p.tile,-.10,.451,-.16);
  // A deep timber balcony; the gold carving remains inside the grey masonry shell.
  const dark=k.mat('#342d24');k.box(g,.55,.18,.016,dark,-.10,.224,.025);
  for(let i=0;i<7;i++){const x=-.34+i*.08;k.cyl(g,.004,.005,.17,p.red,x,.226,.063,8);lattice(k,g,x,.239,.034,.06,.11,p.gold);}
  balcony(k,g,-.10,.076,.58,.139,p.green);k.box(g,.59,.010,.10,p.wall,-.10,.139,.031);
  for(let i=0;i<8;i++){const x=-.35+i*.073;k.box(g,.055,.012,.008,p.gold,x,.309,.049);}
  plaque(k,g,'金楼',.085,.035,-.1,.280,.065);
  for(const x of [-.405,.205]){
    const s=new THREE.Shape();s.moveTo(-.20,.018);s.lineTo(.20,.018);s.lineTo(.20,.32);s.lineTo(0,.45);s.lineTo(-.20,.32);s.closePath();const m=k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false}),p.wall,x,0,-.16);m.rotation.y=Math.PI/2;
    k.line(g,[[x,.324,-.36],[x,.455,-.16],[x,.324,.04]],.004,p.wall);
  }
  // Grey brick joints are restrained; the side moon gate opens onto its courtyard.
  const mortar=k.mat('#667269');for(let i=0;i<13;i++)k.box(g,.60,.001,.002,mortar,-.10,.03+i*.021,-.336);
  moonWall(k,g,p,{x:.32,z:.12,w:.30,h:.28,r:.085});
  k.box(g,.018,.23,.56,p.wall,.47,.133,-.15);k.box(g,.94,.20,.018,p.brick,0,.118,-.43);
  for(let i=0;i<4;i++)lattice(k,g,.29+(i-1.5)*.018,.10,-.415,.015,.11,p.green);
  k.box(g,.52,.009,.13,p.stone,-.12,.024,.23);
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)k.box(g,.085,.003,.035,p.wall,-.30+i*.09,.030,.20+j*.04);
  for(const [x,z]of [[-.42,.22],[.35,-.35],[-.39,-.34]])tree(k,g,x,.018,z,.14);
  for(const x of [-.31,.10])lantern(k,g,x,.29,.075,p);
  bollards(k,g,[[-.40,.36],[.40,.35]]);people(k,g,[[-.10,.30],[-.16,.31],[.20,.31]]);
  return k.merge(g);
}
