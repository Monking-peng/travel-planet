import * as THREE from 'three';
import {hall,roof,tree,plaque,stairs} from './wuhan-architecture.js';

export function guqintai(k){const g=new THREE.Group(),stone=k.mat('#c5bfa9'),wall=k.mat('#d9d2bb'),brick=k.mat('#8d9384'),tile=k.mat('#477b64'),wood=k.mat('#685347'),rim=k.mat('#a7b49a',.6,.1,'#e7c18a');rim.userData.night.intensity=.6;
  const base=k.cyl(g,.46,.49,.065,stone,0,-.028,0,64);base.scale.z=.75;
  const path=k.mat('#d5c9af');k.box(g,.16,.005,.55,path,0,.009,.03);
  hall(k,g,{x:0,z:-.16,w:.29,d:.19,h:.11,roofColor:'#4e7164',name:'高山流水'});
  for(const x of [-.30,.30]){hall(k,g,{x,z:-.08,w:.09,d:.35,h:.07,roofColor:'#567765'});k.box(g,.018,.094,.26,wall,x,.053,.12);}
  // The photographed gate has a real open doorway and a green tile canopy.
  for(const x of [-.074,.074]){k.box(g,.040,.13,.055,brick,x,.065,.225);k.box(g,.011,.16,.073,wall,x+Math.sign(x)*.025,.081,.225);}
  k.box(g,.19,.035,.06,brick,0,.145,.225);roof(k,g,.235,.117,.035,.165,tile,rim,0,.225);
  plaque(k,g,'古琴台',.094,.033,0,.143,.258);stairs(k,g,.13,.075,.018,stone,0,.31);
  for(const x of [-.18,.18]){k.box(g,.13,.085,.022,wall,x,.043,.225);for(let i=0;i<7;i++)k.box(g,.004,.046,.025,wood,x+(i-3)*.014,.049,.225);k.box(g,.15,.008,.04,tile,x,.092,.225);}
  // Small qin terrace and a carved zither, rather than an invented residential block.
  k.cyl(g,.075,.081,.026,stone,.145,.023,.065,12);k.box(g,.11,.010,.038,wood,.145,.043,.065);for(let i=0;i<7;i++)k.box(g,.094,.001,.0008,rim,.145,.049,.055+i*.003);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;if(a>.95&&a<2.1)continue;tree(k,g,.46*Math.cos(a),-.027,.34*Math.sin(a),.065+(i%5)*.009);}
  return k.merge(g);
}
