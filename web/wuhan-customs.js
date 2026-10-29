import * as THREE from 'three';
import {stairs,plaque} from './wuhan-architecture.js';

export function jianghan(k){const g=new THREE.Group(),stone=k.mat('#cfc3ac',.82),edge=k.mat('#e4d9c2',.7,.06,'#f1ce8b'),glass=k.mat('#3f6267',.35,.25,'#f6d99b'),bronze=k.mat('#4a655f',.5,.3);edge.userData.night.intensity=.40;glass.userData.night.intensity=.58;
  k.box(g,.59,.06,.36,stone,0,-.012);k.box(g,.53,.235,.28,stone,0,.13);
  for(const y of [.025,.085,.232,.257])k.box(g,.56,.010,.31,edge,0,y);
  for(const side of [-1,1])for(let x=-.216;x<.23;x+=.054){for(let j=0;j<3;j++){const y=.056+j*.067;k.box(g,.033,.047,.003,glass,x,y,side*.142);k.box(g,.040,.004,.009,edge,x,y+.026,side*.146);k.box(g,.0018,.044,.005,edge,x,y,side*.145);}
    k.cyl(g,.006,.007,.164,edge,x+.024,.155,side*.158,12);for(const y of [.073,.235])k.box(g,.022,.008,.021,edge,x+.024,y,side*.158);for(const dx of [-.006,.006])k.ball(g,.0045,edge,x+.024+dx,.226,side*.161);
  }
  for(let y=.033;y<.25;y+=.015)for(const side of [-1,1])k.box(g,.532,.0008,.001,edge,0,y,side*.141);
  k.box(g,.134,.21,.132,stone,0,.357);for(const y of [.27,.46,.475])k.box(g,.153,.008,.151,edge,0,y);
  for(let side=0;side<4;side++){const face=new THREE.Group();face.rotation.y=side*Math.PI/2;
    k.box(face,.105,.174,.008,edge,0,.366,.069);k.box(face,.021,.036,.004,glass,0,.323,.075);
    const c=k.mesh(face,new THREE.CircleGeometry(.038,48),bronze,0,.413,.078);c.material.side=THREE.DoubleSide;
    const rim=k.mesh(face,new THREE.TorusGeometry(.039,.003,6,48),edge,0,.413,.080);
    for(let j=0;j<12;j++){const a=j/12*Math.PI*2;k.beam(face,[Math.sin(a)*.030,.413+Math.cos(a)*.030,.082],[Math.sin(a)*.035,.413+Math.cos(a)*.035,.082],.0011,edge,4);}
    k.beam(face,[0,.413,.084],[-.021,.425,.084],.0017,edge);k.beam(face,[0,.413,.084],[.020,.428,.084],.0014,edge);g.add(face);
  }
  k.cyl(g,.071,.071,.009,edge,0,.486,0,8);
  k.cyl(g,.048,.048,.06,glass,0,.520,0,8);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.cyl(g,.0045,.0055,.060,edge,Math.sin(a)*.060,.521,Math.cos(a)*.060,8);}
  k.cyl(g,.075,.075,.008,edge,0,.554,0,8);k.cyl(g,.026,.074,.022,bronze,0,.569,0,8);k.beam(g,[0,.58,0],[0,.635,0],.0014,edge);
  k.box(g,.026,.016,.001,k.mat('#b74836'),.013,.626);
  plaque(k,g,'江汉关',.093,.026,0,.251,.162);k.box(g,.041,.057,.006,bronze,0,.054,.147);stairs(k,g,.115,.10,.029,stone,0,.247);
  return k.merge(g);
}
