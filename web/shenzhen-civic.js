import * as THREE from 'three';
import {skin,glow,plaza,palm,bollards,people} from './shenzhen-forms.js';

export function civic(k){
  const g=new THREE.Group(),stone=plaza(k,g,.76,.53),glass=k.glass('#657f86','#ebd7b0',271),roof=k.mat('#577583',.58,.37),metal=k.mat('#a5bdc0',.48,.4),gold=k.mat('#c8a34d',.67,.2),red=k.mat('#b54a42'),lawn=k.mat('#73916c');glass.userData.night.intensity=.42;
  for(const x of [-.42,.42]){k.box(g,.35,.14,.32,glass,x,.086,-.07);for(let j=0;j<5;j++)k.box(g,.36,.004,.33,metal,x,.03+j*.028,-.07);for(let i=0;i<8;i++)k.box(g,.004,.15,.334,metal,x+(i-3.5)*.043,.085,-.07);}
  k.box(g,.145,.30,.18,red,-.16,.17,-.14);k.cyl(g,.088,.088,.30,gold,.16,.17,-.14,48);
  const curve=(u,v)=>{const x=(u-.5)*1.36,z=(v-.5)*.44-.07;return [x,.238+.054*Math.cos(x/ .68*Math.PI*2)+.038*(Math.abs(x)/.68)**4+.017*Math.cos((v-.5)*Math.PI),z];};
  skin(k,g,curve,18,90,roof);
  for(const v of [0,1])k.line(g,Array.from({length:91},(_,i)=>curve(i/90,v)),.004,metal);
  for(let i=0;i<=44;i++)k.line(g,Array.from({length:9},(_,j)=>curve(i/44,j/8)),.00085,metal);
  // The broad wing roof is raised over the public forecourt, with real daylight below.
  for(const x of [-.59,-.28,.28,.59])for(const z of [-.20,.07])k.cyl(g,.005,.008,.21,metal,x,.12,z,8);
  for(const x of [-.43,.43])for(const z of [.27,.40])k.box(g,.28,.008,.09,lawn,x,.019,z);
  for(let i=0;i<6;i++)k.box(g,.25,.003,.055,stone,0,.018+i*.003,.43-i*.05);
  for(const x of [-.66,.66])for(const z of [-.20,.10,.34])palm(k,g,x,.015,z,.115);
  bollards(k,g,[[-.21,.45],[.21,.45],[-.61,.27],[.61,.27]]);people(k,g,[[.02,.27],[.05,.33],[-.05,.35],[-.22,.18],[.31,.20],[-.32,.33],[.20,.40]]);
  return k.merge(g);
}

function cocoonShell(k,g,cx,rx,rz,h,open,white,glazing,rim){
  const start=open?.83:0;
  const point=(u,v)=>{const a=u*Math.PI*2,phi=start+v*(Math.PI/2-start);return [cx+Math.cos(a)*Math.sin(phi)*rx,.036+Math.pow(Math.max(0,Math.cos(phi)),.50)*h,Math.sin(a)*Math.sin(phi)*rz];};
  skin(k,g,point,25,100,glazing);
  // Crossing curved ribs, with a genuine central opening over the large bowl.
  for(let i=0;i<64;i++)for(const direction of [-1,1])k.line(g,Array.from({length:23},(_,j)=>point(i/64+direction*j/22*.14,j/22)),.0025,white);
  for(const v of [0,.90,1])k.line(g,Array.from({length:101},(_,i)=>point(i/100,v)),.0035,rim,true);
  const floor=k.cyl(g,rx*.70,rx*.70,.009,k.mat('#59736f'),cx,.028,0,64);floor.scale.z=rz/rx;
  if(open)for(let row=0;row<7;row++){const bowl=k.mesh(g,new THREE.RingGeometry(.16+row*.014,.173+row*.014,72),k.mat(row%2?'#779789':'#bbc6bc'),cx,.032+row*.013,0);bowl.rotation.x=-Math.PI/2;bowl.scale.y=rz/rx;}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.box(g,.016,.026,.009,k.mat('#385359'),cx+Math.cos(a)*rx*.93,.040,Math.sin(a)*rz*.93);}
}
export function cocoon(k){
  const g=new THREE.Group(),white=k.mat('#d4ded9',.59,.22),glass=k.mat('#8eacaf',.54,.21,'#9fbec1'),rim=glow(k,'#d8e7df',.36);glass.userData.night.intensity=.18;plaza(k,g,.76,.41);
  cocoonShell(k,g,-.29,.39,.32,.20,true,white,glass,rim);cocoonShell(k,g,.29,.39,.27,.148,false,white,glass,rim);
  const center=k.mat('#bdcecb',.63,.24);skin(k,g,(u,v)=>[(u-.5)*.30,.115+.018*Math.sin(v*Math.PI),(v-.5)*.42],16,18,center);
  for(const z of [-.27,.27]){k.box(g,.30,.035,.045,white,.22,.026,z);for(let i=0;i<9;i++)k.box(g,.018,.018,.048,k.mat('#476775'),.10+i*.03,.031,z);}
  for(const x of [-.66,.66])for(const z of [-.29,.29])palm(k,g,x,.013,z,.10);
  bollards(k,g,[[-.56,.34],[-.28,.37],[.10,.34],[.48,.33]]);people(k,g,[[-.32,.34],[-.28,.35],[.22,.33],[.26,.34],[.46,-.30]]);
  return k.merge(g);
}
