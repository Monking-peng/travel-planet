import * as THREE from 'three';
import {roof,hall,tree,stairs,rail,plaque} from './wuhan-architecture.js';

export function qingchuan(k){const g=new THREE.Group(),stone=k.mat('#bfbca5'),red=k.mat('#794f47'),dark=k.mat('#3e4c49'),trim=k.mat('#918f76',.7,.1,'#edc084');trim.userData.night.intensity=.48;
  const terrace=k.cyl(g,.28,.29,.07,stone,0,-.012,0,48);terrace.scale.z=.83;
  hall(k,g,{w:.35,d:.25,h:.125,base:.023,roofColor:'#53615b'});
  k.box(g,.25,.092,.16,red,0,.218);for(const z of [-.09,.09])for(let i=0;i<5;i++)k.cyl(g,.0035,.004,.08,red,(i/4-.5)*.28,.227,z,8);
  roof(k,g,.33,.25,.055,.265,dark,trim);roof(k,g,.17,.17,.040,.298,dark,trim,0,.006);
  const balcony=new THREE.Group();rail(k,balcony,.30,.20,0,red);balcony.position.y=.187;g.add(balcony);
  plaque(k,g,'晴川阁',.10,.030,0,.249,.105);stairs(k,g,.18,.13,.04,stone,0,.29);
  for(let i=0;i<20;i++){const a=i/19*Math.PI;const x=Math.cos(a)*.268,z=Math.sin(a)*.228;k.cyl(g,.0022,.0022,.028,stone,x,.044,z,6);if(i)k.beam(g,[Math.cos(a-Math.PI/19)*.268,.058,Math.sin(a-Math.PI/19)*.228],[x,.058,z],.0025,stone);}
  hall(k,g,{x:-.32,z:-.12,w:.15,d:.18,h:.08,roofColor:'#575f55',name:'禹稷行宫'});
  for(let i=0;i<12;i++){const a=Math.PI+i/11*Math.PI;tree(k,g,Math.cos(a)*.33,-.028,Math.sin(a)*.27,.060+(i%3)*.012);}
  return k.merge(g);
}
export function guishan(k){const g=new THREE.Group(),white=k.mat('#d4d6cc',.64),dark=k.mat('#455e65',.35,.35),edge=k.mat('#cbd3c9',.42,.4,'#a9d4e8'),red=k.mat('#a0604e');edge.userData.night.intensity=.8;
  k.cyl(g,.13,.16,.045,white,0,-.005,0,32);k.cyl(g,.073,.091,.065,dark,0,.043,0,32);
  k.cyl(g,.020,.040,.45,white,0,.285,0,32);
  const ys=[.515,.535,.555,.578,.600,.618],rs=[.033,.047,.057,.060,.054,.040];
  for(let i=0;i<ys.length;i++){k.cyl(g,rs[i],rs[Math.max(0,i-1)],.021,i%2?dark:white,0,ys[i],0,32);k.ring(g,rs[i]+.002,.002,edge,ys[i]+.01);}
  k.cyl(g,.010,.021,.036,white,0,.649,0,16);k.cyl(g,.004,.008,.22,white,0,.775,0,12);
  for(let i=0;i<8;i++){k.cyl(g,.008,.008,.012,i%2?red:white,0,.69+i*.027,0,12);k.ring(g,.012,.0015,edge,.69+i*.027);}
  k.beam(g,[0,.88,0],[0,.94,0],.0018,red);k.ball(g,.004,edge,0,.94);
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2;tree(k,g,Math.cos(a)*(.15+(i%2)*.05),-.05,Math.sin(a)*(.14+(i%2)*.07),.07+(i%3)*.012);}
  return k.merge(g);
}
