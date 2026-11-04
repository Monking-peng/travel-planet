import * as THREE from 'three';
import {colors,terrace,ellipseSurface,steps,timberFloor,eave,hall,groves,finish,archWall,roof,glow,people} from './xian-kit.js';
import {plaque,rail} from './wuhan-architecture.js';

export {wall} from "./xian-wall.js";
export {historyMuseum} from "./xian-museum.js";
export function furong(k){
  const g=new THREE.Group(),p=colors(k);p.tile=k.mat('#575746',.75);p.tile.userData.night={color:new THREE.Color('#e8b969'),intensity:.17};terrace(k,g,p,.73,.65);
  const water=k.mat('#527d79',.40,.1);water.userData.furongLake=true;water.userData.preserveSmooth=true;ellipseSurface(k,g,.66,.66*.86,.023,water);
  k.box(g,.97,.021,.54,p.light,0,.032,-.15);k.box(g,.52,.035,.42,p.light,0,.048,-.14);
  const palace=new THREE.Group();palace.position.set(0,.061,-.20);
  timberFloor(k,palace,p,{w:.48,d:.31,y:0,h:.13,bays:9});eave(k,palace,p,.62,.44,.135,.070);
  timberFloor(k,palace,p,{w:.41,d:.27,y:.20,h:.115,bays:7});eave(k,palace,p,.55,.40,.32,.075);
  timberFloor(k,palace,p,{w:.33,d:.22,y:.392,h:.09,bays:7});eave(k,palace,p,.47,.35,.487,.095);g.add(palace);
  for(const s of [-1,1]){hall(k,g,p,{x:s*.40,z:-.20,y:.043,w:.17,d:.25,h:.11,roofHeight:.07});k.box(g,.12,.045,.28,p.wall,s*.28,.067,-.23);roof(k,g,.14,.31,.04,.092,p.tile,p.gold,s*.28,-.23);}
  steps(k,g,p,.24,.19,.06,0,.21,10);k.box(g,.30,.010,.27,p.light,0,.035,.30);
  for(const s of [-1,1]){k.line(g,[[s*.16,.040,.18],[s*.26,.046,.37],[s*.53,.040,.38]],.024,p.light);for(let i=0;i<5;i++){const x=s*(.27+i*.06),z=.37+i*.005;k.ball(g,.004,p.warm,x,.075,z);k.cyl(g,.002,.003,.035,p.wood,x,.058,z,6);}}
  for(const [x,z]of [[-.53,-.30],[.53,-.30],[-.52,-.12],[.52,-.12]]){k.cyl(g,.10,.11,.02,p.green,x,.04,z,16);groves(k,g,[[x,z,.095]]);}
  const island=k.cyl(g,.09,.10,.018,p.green,.49,.03,.20,24);hall(k,g,p,{x:.49,z:.20,w:.10,d:.10,y:.04,h:.06,roofHeight:.035});
  g.userData={modernTangGarden:true};return finish(k,g,p,{visitors:[[-.12,.07],[.12,.06],[-.40,-.01],[.20,-.03]]});
}
export {warriors} from "./xian-warriors.js";
