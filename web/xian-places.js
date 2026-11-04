import * as THREE from 'three';
import {colors,terrace,ellipseSurface,steps,timberFloor,eave,hall,groves,finish,archWall,roof,glow,people} from './xian-kit.js';
import {plaque,rail} from './wuhan-architecture.js';
import {skin} from './shenzhen-forms.js';

export function wall(k){
  const g=new THREE.Group(),p=colors(k);terrace(k,g,p,.77,.61);
  const water=k.mat('#4b7772',.48,.08);k.box(g,1.37,.004,.078,water,0,.018,.48);
  const battlement=(x,z,w,d)=>{k.box(g,w,.17,d,p.stone,x,.10,z);for(const s of [-1,1]){k.box(g,w,.018,.015,p.stone,x,.189,z+s*d/2);for(let j=0;j<=Math.ceil(w/.035);j++)k.box(g,.019,.027,.018,p.stone,x-w/2+j*w/Math.ceil(w/.035),.211,z+s*d/2);}};
  for(const x of [-.49,.49])battlement(x,-.15,.50,.17);
  archWall(k,g,{w:.48,h:.18,d:.17,z:-.15,y:.016,openings:[{r:.06,spring:.065,bottom:0}],mat:p.stone});
  const main=new THREE.Group();main.position.set(0,.205,-.15);timberFloor(k,main,p,{w:.68,d:.25,y:0,h:.14,bays:11});eave(k,main,p,.80,.36,.142,.065);timberFloor(k,main,p,{w:.56,d:.22,y:.195,h:.10,bays:9});eave(k,main,p,.69,.32,.296,.067);g.add(main);
  for(const s of [-1,1]){const a=new THREE.Group();battlement(s*.41,.14,.15,.55);steps(k,a,p,.10,.31,.18,0,.36,16);a.position.x=s*.61;g.add(a);}
  archWall(k,g,{w:.78,h:.16,d:.12,z:.36,y:.016,openings:[{r:.05,spring:.065,bottom:0}],mat:p.stone});
  hall(k,g,p,{w:.42,d:.18,z:.36,y:.18,h:.10,roofHeight:.055});k.box(g,.16,.014,.20,p.light,0,.038,.50);
  for(let i=0;i<13;i++){const x=(i/12-.5)*1.36;k.cyl(g,.002,.003,.10,p.wood,x,.24,-.04,6);for(const h of [.25,.275])k.ball(g,.006,p.warm,x,h,-.04);}
  plaque(k,main,'永宁门',.12,.03,0,.115,.132);groves(k,g,[[-.67,.38,.08],[.67,.38,.08]]);g.userData={barbican:true,gateCenters:[[-.15,.085],[.36,.085]]};return finish(k,g,p,{lamps:[[-.25,.52],[.25,.52]],visitors:[[-.25,.07],[.23,.10],[.14,-.15],[-.12,.53]]});
}
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
export function warriors(k){
  const g=new THREE.Group(),p=colors(k);terrace(k,g,p,.80,.68);const metal=k.mat('#a6b1ae',.62,.34),glass=k.mat('#42615e',.27,.25);glass.userData.night={color:new THREE.Color('#e9d7ae'),intensity:.18};
  const pit=new THREE.Group();pit.position.set(-.24,0,-.16);const w=.56,d=.70,roofY=x=>.16+.16*Math.sqrt(Math.max(0,1-(x/(w/2))**2));
  k.box(pit,w,.02,d,p.light,0,.024,0);for(const s of [-1,1])k.box(pit,.015,.14,d,p.wall,s*w/2,.10,0);
  skin(k,pit,(u,v)=>{const x=(u-.5)*w;return [x,roofY(x),(v-.5)*d];},30,36,metal);metal.userData.preserveSmooth=true;
  for(let i=0;i<=18;i++){const z=(i/18-.5)*d;k.line(pit,Array.from({length:25},(_,j)=>{const x=(j/24-.5)*w;return [x,roofY(x)+.002,z];}),.0015,p.light);}
  const facade=new THREE.Shape();facade.moveTo(-w/2,.035);facade.lineTo(w/2,.035);for(let i=24;i>=0;i--){const x=(i/24-.5)*w;facade.lineTo(x,roofY(x));}facade.closePath();
  for(const s of [-1,1]){const face=k.mesh(pit,new THREE.ShapeGeometry(facade),glass,0,0,s*d/2);if(s<0)face.rotation.y=Math.PI;for(let i=0;i<=8;i++){const x=(i/8-.5)*w;k.box(pit,.004,roofY(x)-.035,.006,p.light,x,(roofY(x)+.035)/2,s*(d/2+.004));}}
  k.box(pit,.075,.014,d,metal,0,.328,0);for(let i=0;i<12;i++)k.box(pit,.07,.005,.004,p.light,0,.337,(i/11-.5)*d);g.add(pit);
  k.box(g,.46,.16,.62,p.wall,.30,.10,-.16);k.box(g,.49,.016,.65,metal,.30,.186,-.16);
  for(let i=0;i<9;i++)k.box(g,.003,.148,.006,p.light,.08+i*.055,.11,.154);
  for(const s of [-1,1])hall(k,g,p,{x:s*.43,z:.31,w:.24,d:.16,h:.085,roofHeight:.04});hall(k,g,p,{x:0,z:.38,w:.32,d:.18,h:.10,roofHeight:.045});
  k.box(g,.92,.011,.12,p.light,0,.022,.15);groves(k,g,[[-.58,-.45,.09],[-.59,-.25,.10],[-.59,-.04,.09],[.60,-.43,.10],[.60,-.21,.10],[.61,.01,.09]]);
  plaque(k,g,'秦始皇帝陵博物院',.29,.028,0,.096,.479);g.userData={barrelVault:true,pitHalls:2};return finish(k,g,p,{lamps:[[-.58,.46],[.58,.46],[-.15,.22],[.15,.22]],visitors:[[-.2,.41],[.19,.44],[-.08,.56],[.34,.53]]});
}
