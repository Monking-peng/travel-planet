import * as THREE from 'three';
import {plaza,bollards,people,glow} from './shenzhen-forms.js';
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

export {hunanMuseum} from './changsha-museum.js';

export {xie} from './changsha-xie.js';
