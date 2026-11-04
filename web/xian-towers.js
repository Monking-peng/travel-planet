import * as THREE from 'three';
import {colors,terrace,steps,ledge,timberFloor,eave,hall,groves,finish,archWall,roof,masonry} from './xian-kit.js';
import {plaque} from './wuhan-architecture.js';

export {bell} from './xian-bell.js';

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
export {pagoda} from './xian-pagoda.js';

export function smallPagoda(k){
  const g=new THREE.Group(),p=colors(k);p.brick=masonry(k,'#a39b80');terrace(k,g,p,.54,.57);
  let y=.035;for(let i=0;i<13;i++){const t=i/12,w=.31*(1-.49*t),h=i===0?.16:.067-.028*t;pagodaStorey(k,g,p,w,w-.012,h,y,i<11);y+=h+.022;}
  // The top is the surviving broken crown, not an invented intact finial.
  for(let i=0;i<5;i++)k.box(g,.024,.012+(i%3)*.006,.033,p.brick,(i-2)*.027,y-.003,-.04);
  hall(k,g,p,{w:.29,d:.16,z:.37,h:.10,roofHeight:.055});groves(k,g,[[-.35,.15,.14],[-.40,-.15,.16],[.34,-.25,.15],[.32,.17,.11],[-.26,-.39,.12],[.20,-.40,.14]]);
  g.userData={storeys:13,brokenCrown:true};return finish(k,g,p,{lamps:[[-.22,-.22],[.22,-.22],[-.23,.34],[.23,.34]],visitors:[[-.08,.50],[.13,.40]]});
}
