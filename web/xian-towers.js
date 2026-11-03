import * as THREE from 'three';
import {colors,terrace,steps,ledge,timberFloor,eave,hall,groves,finish,archWall,roof,masonry} from './xian-kit.js';
import {plaque} from './wuhan-architecture.js';

function crossBase(k,g,p,w,d,h){
  // Four pierced perimeter walls and corner piers leave both axes open.
  const r=.06,spring=.065;
  for(const s of [-1,1]){archWall(k,g,{w,h,d:.028,z:s*(d/2-.014),y:.018,openings:[{r,spring,bottom:0}],mat:p.stone});const side=new THREE.Group();archWall(k,side,{w:d,h,d:.028,y:.018,openings:[{r,spring,bottom:0}],mat:p.stone});side.rotation.y=Math.PI/2;side.position.x=s*(w/2-.014);g.add(side);}
  for(const x of [-1,1])for(const z of [-1,1])k.box(g,(w-.15)/2,h,(d-.15)/2,p.stone,x*(w+.15)/4,h/2+.018,z*(d+.15)/4);
  k.box(g,w,.018,d,p.stone,0,h+.018,0);
}
export function bell(k){
  const g=new THREE.Group(),p=colors(k);p.tile=k.mat('#3c6b4d',.65);p.tile.userData.night={color:new THREE.Color('#96b873'),intensity:.065};
  for(const key of ['stone','red','wall','blue'])p[key].userData.night={color:new THREE.Color('#efb35e'),intensity:key==='stone'?.32:.20};terrace(k,g,p,.56,.53);
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;k.box(g,.043,.012,.018,i%3?p.green:p.gold,Math.cos(a)*.46,.025,Math.sin(a)*.43).rotation.y=-a;}
  crossBase(k,g,p,.62,.58,.18);ledge(k,g,p,.64,.60,.21);
  timberFloor(k,g,p,{w:.43,d:.40,y:.23,h:.145});eave(k,g,p,.56,.53,.377,.075);
  timberFloor(k,g,p,{w:.34,d:.32,y:.433,h:.115});eave(k,g,p,.45,.43,.55,.053);
  k.box(g,.29,.045,.27,p.blue,0,.587,0);eave(k,g,p,.40,.38,.63,.105);
  k.cyl(g,.012,.016,.034,p.gold,0,.75,0,12);k.ball(g,.011,p.gold,0,.773,0);plaque(k,g,'钟楼',.10,.033,0,.347,.21);
  const b=new THREE.Group();k.cyl(b,.022,.028,.042,p.gold,0,.28,0);for(const s of [-1,1])k.box(b,.007,.08,.008,p.red,s*.033,.27,0);k.box(b,.09,.008,.02,p.red,0,.315,0);b.position.set(-.245,0,.21);g.add(b);
  g.userData={roofTiers:3,crossPassages:true};return finish(k,g,p,{lamps:[[-.46,-.35],[.46,-.35],[-.46,.35],[.46,.35]],visitors:[[-.38,.13],[.36,.11],[.17,.42]]});
}
export function drum(k){
  const g=new THREE.Group(),p=colors(k);p.red=k.mat('#51463b');p.tile=k.mat('#596052');terrace(k,g,p,.65,.49);
  p.stone.userData.night.intensity=.34;p.wall.userData.night.intensity=.24;p.red.userData.night={color:new THREE.Color('#e5b66e'),intensity:.22};
  archWall(k,g,{w:.84,h:.17,d:.36,y:.018,openings:[{r:.055,spring:.065,bottom:0}],mat:p.stone});ledge(k,g,p,.87,.40,.20);
  timberFloor(k,g,p,{w:.66,d:.33,y:.22,h:.14,bays:11});eave(k,g,p,.82,.46,.365,.073);
  timberFloor(k,g,p,{w:.54,d:.28,y:.42,h:.11,bays:9});eave(k,g,p,.69,.39,.535,.045);k.box(g,.48,.035,.25,p.wall,0,.573,0);eave(k,g,p,.62,.36,.592,.095);
  for(const s of [-1,1]){const stair=new THREE.Group();steps(k,stair,p,.12,.32,.19,0,.35,14);stair.position.x=s*.36;g.add(stair);for(let i=0;i<8;i++){const x=(i/7-.5)*.66;const d=k.cyl(g,.012,.012,.016,p.red,x,.246,s*.19,16);d.rotation.x=Math.PI/2;}}
  plaque(k,g,'文武盛地',.22,.04,0,.337,.18);g.userData={roofTiers:3,drums:16};return finish(k,g,p,{lamps:[[-.56,.35],[.56,.35],[-.55,-.32],[.55,-.32]],visitors:[[-.22,.36],[.18,.37],[.07,.40]]});
}
function pagodaStorey(k,g,p,w,top,h,y,door=true){
  const sub=new THREE.Group();
  for(let side=0;side<4;side++){
    const face=new THREE.Shape();face.moveTo(-w/2,0);face.lineTo(w/2,0);face.lineTo(top/2,h);face.lineTo(-top/2,h);face.closePath();
    if(door){const a=new THREE.Path(),r=w*.065,b=.010,cy=h*.45;a.moveTo(-r,b);a.lineTo(-r,cy);a.absarc(0,cy,r,Math.PI,0,true);a.lineTo(r,b);a.closePath();face.holes.push(a);}
    const wall=k.mesh(sub,new THREE.ExtrudeGeometry(face,{depth:.015,bevelEnabled:false,curveSegments:16}),p.brick);wall.position.z=w/2-.015;const transform=new THREE.Group();sub.remove(wall);transform.add(wall);transform.rotation.y=side*Math.PI/2;g.add(transform);transform.position.y=y;
    if(door){const inset=k.box(transform,w*.14,h*.61,.006,p.wood,0,h*.28,w/2-.018);inset.userData.recess=true;}
  }
  k.box(g,top+.026,.013,top+.026,p.brick,0,y+h+.006,0);k.box(g,top+.014,.008,top+.014,p.brick,0,y+h+.016,0);
}
export function pagoda(k){
  const g=new THREE.Group(),p=colors(k);terrace(k,g,p,.60,.64);const base=.057;k.box(g,.49,.04,.49,p.light,0,.034,-.10);
  const tower=new THREE.Group();tower.position.z=-.10;let y=base;
  for(let i=0;i<7;i++){const w=.44-i*.030,h=.15-i*.009;pagodaStorey(k,tower,p,w,w-.020,h,y);y+=h+.024;}
  const cap=k.cyl(tower,.018,.16,.044,p.brick,0,y+.018,0,4);cap.rotation.y=Math.PI/4;k.cyl(tower,.004,.012,.030,p.brick,0,y+.052,0,12);g.add(tower);
  hall(k,g,p,{w:.43,d:.18,z:.35,h:.13});for(const x of [-.48,.48]){hall(k,g,p,{x,z:-.17,w:.16,d:.40,h:.08,roofHeight:.045});}
  steps(k,g,p,.25,.13,.035,0,.54,7);groves(k,g,[[-.36,.28,.10],[.36,.28,.10],[-.34,-.45,.12],[.34,-.45,.12]]);
  g.userData={storeys:7};return finish(k,g,p,{lamps:[[-.22,-.3],[.22,-.3],[-.24,.20],[.24,.20]],visitors:[[-.12,.53],[.10,.51],[-.18,.17]]});
}
export function smallPagoda(k){
  const g=new THREE.Group(),p=colors(k);p.brick=masonry(k,'#a39b80');terrace(k,g,p,.54,.57);
  let y=.035;for(let i=0;i<13;i++){const t=i/12,w=.31*(1-.49*t),h=i===0?.16:.067-.028*t;pagodaStorey(k,g,p,w,w-.012,h,y,i<11);y+=h+.022;}
  // The top is the surviving broken crown, not an invented intact finial.
  for(let i=0;i<5;i++)k.box(g,.024,.012+(i%3)*.006,.033,p.brick,(i-2)*.027,y-.003,-.04);
  hall(k,g,p,{w:.29,d:.16,z:.37,h:.10,roofHeight:.055});groves(k,g,[[-.35,.15,.14],[-.40,-.15,.16],[.34,-.25,.15],[.32,.17,.11],[-.26,-.39,.12],[.20,-.40,.14]]);
  g.userData={storeys:13,brokenCrown:true};return finish(k,g,p,{lamps:[[-.22,-.22],[.22,-.22],[-.23,.34],[.23,.34]],visitors:[[-.08,.50],[.13,.40]]});
}
