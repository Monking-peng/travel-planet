import * as THREE from 'three';
import {skin,glow,plaza,palm,bollards,people} from './shenzhen-forms.js';

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
