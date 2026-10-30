import * as THREE from 'three';
import {roof,tree,plaque} from './wuhan-architecture.js';
import {people,bollards,skin} from './shenzhen-forms.js';
import {palette,footing,lattice,balcony,lantern,hall,moonWall,bridge} from './shunde-kit.js';

export function qinghui(k){
  const g=new THREE.Group(),p=palette(k);footing(k,g,1.24,1.16,p);
  // An enclosed Lingnan garden, with a central pond and several connected courts.
  for(const x of [-.60,.60])k.box(g,.018,.14,1.12,p.wall,x,.086,0);
  for(const z of [-.56,.56])k.box(g,1.20,.14,.018,p.wall,0,.086,z);
  const pond=k.cyl(g,.35,.35,.008,p.water,.14,.024,.04,72);pond.scale.z=1.13;
  const rim=k.mesh(g,new THREE.TorusGeometry(.352,.011,6,72),p.stone,.14,.024,.04);rim.rotation.x=Math.PI/2;rim.scale.y=1.13;
  hall(k,g,p,{x:-.33,z:.31,w:.37,d:.22,h:.19});
  plaque(k,g,'清晖园',.14,.037,-.33,.177,.448);
  hall(k,g,p,{x:-.32,z:-.32,w:.34,d:.25,h:.19});
  plaque(k,g,'碧溪草堂',.14,.030,-.32,.175,-.158);
  // The circular bamboo-pattern opening is set into a real hollow front screen.
  moonWall(k,g,p,{x:-.32,z:-.154,w:.30,h:.18,r:.066});
  for(let i=0;i<7;i++){const x=-.32+(i-3)*.016,span=Math.sqrt(Math.max(0,.060**2-(x+.32)**2));k.box(g,.0015,span*2,.002,p.green,x,.092,-.142);}
  for(const z of [-.46,.43]){
    const w=z<0?.77:.56,xc=z<0?.12:.20;
    k.box(g,w,.016,.105,p.stone,xc,.028,z);
    for(let i=0;i<=9;i++){const x=xc+(i/9-.5)*w;k.cyl(g,.003,.004,.12,p.red,x,.092,z+.032,8);}
    roof(k,g,w+.04,.14,.048,.155,p.tile,p.tile,xc,z);
    balcony(k,g,xc,z+.039,w,.037,p.wood);k.box(g,w,.002,.002,p.warm,xc,.154,z+.070);
  }
  const corridor=new THREE.Group();k.box(corridor,.84,.016,.09,p.stone,0,.03,0);
  for(let i=0;i<=10;i++)k.cyl(corridor,.003,.004,.11,p.red,(i/10-.5)*.84,.093,.039,8);
  roof(k,corridor,.90,.15,.045,.15,p.tile,p.tile);balcony(k,corridor,0,.039,.84,.038,p.wood);
  k.box(corridor,.84,.003,.003,p.warm,0,.148,.077);corridor.rotation.y=Math.PI/2;corridor.position.set(.50,0,0);g.add(corridor);
  // Waterside pavilion and pierced rockery retain a clear view across the pool.
  const pav=new THREE.Group();hall(k,pav,p,{w:.19,d:.20,h:.14});pav.position.set(.31,0,-.26);g.add(pav);
  bridge(k,g,p,{x:.06,z:.15,w:.075,length:.40,rise:.055});
  const rock=k.mat('#969886',.98);for(let i=0;i<14;i++){const a=i*2.4,s=.03+(i%4)*.014,m=k.mesh(g,new THREE.IcosahedronGeometry(s,1),rock,-.10+Math.cos(a)*.09,.025+s*1.8,.00+Math.sin(a)*.11);m.scale.set(.68,1.8,.70);}
  for(const [x,z,s]of [[-.48,-.06,.16],[-.50,.10,.12],[-.04,-.36,.14],[.40,.30,.13],[.46,-.34,.15],[-.45,-.46,.14],[.02,.35,.09]])tree(k,g,x,.02,z,s);
  for(let i=0;i<8;i++){const x=-.51+i*.017;k.cyl(g,.0018,.002,.15+(i%3)*.018,p.green,x,.10,-.23,5);k.beam(g,[x,.15,-.23],[x+.024,.18,-.22],.004,p.green,5);}
  for(const [x,z]of [[-.4,.43],[.1,-.41],[.35,.4]])lantern(k,g,x,.13,z,p);
  bollards(k,g,[[-.55,.48],[.53,.48],[-.55,-.48],[.53,-.48]]);people(k,g,[[-.30,.46],[-.36,.47],[.36,.37],[.43,.38]]);
  return k.merge(g);
}

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

export function baolin(k){
  const g=new THREE.Group(),p=palette(k),heightAt=(x,z)=>Math.pow(Math.max(0,1-(x/.74)**2-(z/.84)**2),1.5)*Math.max(0,.28-.67*z),tile=k.mat('#a98045',.77),temple={...p,red:k.mat('#995340'),wood:k.mat('#8d4737'),tile};
  skin(k,g,(u,v)=>{const a=u*Math.PI*2,x=Math.cos(a)*v*.74,z=Math.sin(a)*v*.84;return [x,heightAt(x,z),z];},36,96,k.mat('#527658',.98));
  // Three terraces climb the mountain; the forecourt, gate and main hall remain distinct.
  const retaining=k.mat('#a6a693',.97);
  for(const [z,y,w,d]of [[.45,.10,.56,.20],[0,.26,.74,.26],[-.42,.43,.85,.32]]){
    k.box(g,w,y+.015,d,retaining,0,(y+.015)/2,z);k.box(g,w+.008,.012,d+.008,p.stone,0,y+.016,z);
    for(const x of [-w/2,w/2]){k.box(g,.015,.05,d,p.wall,x,y+.04,z);for(let i=0;i<6;i++)k.box(g,.008,.078,.008,p.wall,x,y+.05,z+(i/5-.5)*d);}
  }
  hall(k,g,temple,{z:-.42,y:.455,w:.43,d:.25,h:.19,double:true});plaque(k,g,'宝林寺',.14,.034,0,.62,-.26);
  hall(k,g,temple,{z:0,y:.285,w:.36,d:.19,h:.13});
  const green=k.mat('#487b5a');hall(k,g,{...temple,tile:green},{z:.45,y:.125,w:.29,d:.14,h:.12});
  for(const x of [-.31,.31])hall(k,g,temple,{x,z:-.40,y:.455,w:.16,d:.17,h:.11});
  for(const [start,end,base,top]of [[.72,.55,.018,.12],[.35,.13,.12,.28],[-.13,-.26,.28,.45]])for(let i=0;i<12;i++){
    const z=start+(end-start)*i/11,y=base+(top-base)*(i+1)/12,depth=(start-end)/11+.002;k.box(g,.23,y,depth,p.stone,0,y/2,z);
    for(const x of [-.13,.13]){k.box(g,.008,.040,depth,p.wall,x,y+.022,z);if(i%3===0)k.box(g,.012,.06,.012,p.wall,x,y+.031,z);}
  }
  for(let i=0;i<75;i++){const a=i*2.39996,r=.38+((i*13)%37)/37*.28,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<.24&&z>.16)continue;if(Math.abs(x)<.48&&z<.20&&z>-.46)continue;tree(k,g,x,heightAt(x,z),z,.08+(i%4)*.015);}
  for(const [z,y]of [[.67,.05],[.57,.11],[.30,.16],[.20,.23],[-.14,.31],[-.24,.43]])for(const x of [-.15,.15]){k.cyl(g,.002,.003,.024,p.wood,x,y+.015,z,6);k.ball(g,.004,p.warm,x,y+.030,z);}
  for(const x of [-.17,.17])lantern(k,g,x,.62,-.26,p);
  return k.merge(g);
}
