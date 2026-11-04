import * as THREE from 'three';
import {palette,site,disc,grove,finish,gable,sign,TAU} from './qingdao-kit.js';

function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function rect(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();return s;}
function windowShape(a){return a.rect?rect(a.w,a.h):arch(a.w,a.h);}
function facade(k,g,p,w,h,holes,mat=p.wall){
 const s=rect(w,h);for(const a of holes)s.holes.push(new THREE.Path(windowShape(a).getPoints(20).map(v=>new THREE.Vector2(v.x+a.x,v.y+a.y))));
 k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:false,curveSegments:20}),mat,0,0,-.016);
 for(const a of holes){
  const q=new THREE.Group();q.position.set(a.x,a.y,0);g.add(q);const frame=a.rect?rect(a.w+.010,a.h+.010):arch(a.w+.010,a.h+.010);frame.holes.push(new THREE.Path(windowShape(a).getPoints(20).map(v=>new THREE.Vector2(v.x,v.y+.005))));
  k.mesh(q,new THREE.ExtrudeGeometry(frame,{depth:.006,bevelEnabled:false,curveSegments:20}),p.trim,0,-.005,-.003);
  k.mesh(q,new THREE.ShapeGeometry(windowShape(a),20),a.door?p.door:p.glass,0,0,-.013);
  const flat=a.rect?a.h:a.h-a.w/2;for(const x of [-a.w/4,0,a.w/4])k.box(q,.0013,flat,.0015,p.frame,x,flat/2,-.009);
  for(const y of [flat*.35,flat*.68,flat])k.box(q,a.w,.0013,.0015,p.frame,0,y,-.009);
  if(!a.rect)for(const v of [.25,.5,.75]){const t=v*Math.PI;k.beam(q,[0,flat,-.009],[Math.cos(t)*a.w/2,flat+Math.sin(t)*a.w/2,-.009],.0007,p.frame);}
  k.box(q,a.w+.016,a.door?.006:.005,.014,p.trim,0,a.door?-.003:-.005,.002);
  if(a.door)for(const x of [-.007,.007])k.box(q,.0015,.012,.004,p.brass,x,.035,-.004);
 }
}
function stone(k,color){
 const m=k.mat(color,.95,0);m.userData.stationMasonry=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 stationP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstationP=position;');s.fragmentShader='varying vec3 stationP;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float gr=fract(sin(dot(floor(stationP.xy*1150.),vec2(127.1,311.7)))*43758.5453);diffuseColor.rgb*=.94+.06*gr;
 `);};m.customProgramCacheKey=()=> 'qingdao-station-stone';return m;
}
function course(k,g,p,w,h,y=0){for(let row=0;row<h/.026;row++){const yy=y+row*.026;k.box(g,w,.0007,.001,p.joint,0,yy,.001);for(let j=0;j<w/.057;j++){const xx=-w/2+(j+.5+(row%2)*.5)*.057;if(xx<w/2-.005)k.box(g,.0007,.026,.001,p.joint,xx,yy+.013,.001);}}}
function roof(k,g,p,w,d,y,x,z,rise){const q=new THREE.Group();q.position.set(x,0,z);q.rotation.y=Math.PI/2;g.add(q);gable(k,q,p,d,w,rise,y);for(const side of [-1,1])k.box(g,w,.008,.014,p.accent,x,y-.002,z+side*d/2);}
function dormer(k,g,p,x,y,z){const q=new THREE.Group();q.position.set(x,y,z);g.add(q);k.box(q,.050,.026,.032,p.wall,0,.013,0);k.box(q,.035,.015,.002,p.glass,0,.012,.017);for(const xx of [-.011,0,.011])k.box(q,.001,.016,.003,p.frame,xx,.012,.019);gable(k,q,p,.060,.040,.012,.026);}
function clock(k,g,p){
 const dial=k.mat('#263835',.82,0),ink=k.mat('#d5ddca',.8,0);ink.userData.night={color:new THREE.Color('#e7edd9'),intensity:.75};dial.userData.night={color:new THREE.Color('#849587'),intensity:.16};
 k.mesh(g,new THREE.CircleGeometry(.039,64),dial,0,.064,.003);k.mesh(g,new THREE.TorusGeometry(.0415,.0022,5,64),p.trim,0,.064,.004);
 for(let i=0;i<60;i++){const a=i/60*TAU,inner=i%5?.034:.029;k.beam(g,[Math.sin(a)*inner,.064+Math.cos(a)*inner,.005],[Math.sin(a)*.037,.064+Math.cos(a)*.037,.005],i%5?.00035:.0008,ink);}
 k.beam(g,[0,.064,.007],[-.018,.079,.007],.0011,ink);k.beam(g,[0,.064,.007],[.026,.073,.007],.0008,ink);k.ball(g,.002,ink,0,.064,.008);
}
function clockTower(k,g,p){
 const x=-.212,z=.034,q=new THREE.Group();q.position.set(x,0,z);g.add(q);const half=.099;
 for(let i=0;i<4;i++){
  const a=i/4*TAU,f=new THREE.Group();f.position.set(Math.sin(a)*half,.021,Math.cos(a)*half);f.rotation.y=a;q.add(f);
  const holes=[{x:-.032,y:.222,w:.014,h:.080,rect:true},{x:0,y:.215,w:.014,h:.117,rect:true},{x:.032,y:.222,w:.014,h:.080,rect:true},{x:0,y:.454,w:.025,h:.045,rect:true}];
  facade(k,f,p,.198,.616,holes);const base=new THREE.Group();f.add(base);course(k,base,p,.198,.207);
  for(const side of [-1,1])for(let j=0;j<13;j++)k.box(f,.013+(j%2)*.006,.019,.005,p.trim,side*.091,.01+j*.046,.001);
  // Narrow recessed vents below the four clock gables.
  for(let j=0;j<5;j++){k.box(f,.020,.021,.002,p.glass,-.070+j*.035,.587,.001);k.box(f,.026,.004,.006,p.trim,-.070+j*.035,.600,.003);}
 }
 for(const [y,w]of [[.021,.217],[.231,.204],[.581,.207],[.614,.222],[.636,.234]])k.box(q,w,.009,w,p.trim,0,y,0);
 // A continuous tapered spire and four projecting, stone-edged clock gables.
 const levels=[[.642,.116],[.823,.045],[.853,.036],[.902,.020],[.948,0]],pos=[],indices=[];
 for(const [y,h]of levels)for(const [sx,sz]of [[-1,1],[1,1],[1,-1],[-1,-1]])pos.push(sx*h,y,sz*h);
 for(let j=0;j<levels.length-1;j++)for(let i=0;i<4;i++){const a=j*4+i,b=j*4+(i+1)%4,c=a+4,d=b+4;indices.push(a,b,c,b,d,c);}
 const spire=new THREE.BufferGeometry();spire.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));spire.setIndex(indices);spire.computeVertexNormals();k.mesh(q,spire,p.tile);
 for(const [sx,sz]of [[-1,1],[1,1],[1,-1],[-1,-1]])for(let j=1;j<levels.length;j++)k.beam(q,[sx*levels[j-1][1],levels[j-1][0],sz*levels[j-1][1]],[sx*levels[j][1],levels[j][0],sz*levels[j][1]],.0013,p.red);
 for(let i=0;i<4;i++){
  const a=i/4*TAU,f=new THREE.Group();f.position.set(Math.sin(a)*.117,.644,Math.cos(a)*.117);f.rotation.y=a;q.add(f);
  const s=new THREE.Shape();s.moveTo(-.112,0);s.lineTo(.112,0);s.lineTo(.088,.038);s.lineTo(.066,.047);s.lineTo(.043,.095);s.lineTo(.026,.096);s.lineTo(0,.144);s.lineTo(-.026,.096);s.lineTo(-.043,.095);s.lineTo(-.066,.047);s.lineTo(-.088,.038);s.closePath();
  k.mesh(f,new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false}),p.wall,0,0,-.010);clock(k,f,p);
  const pts=[[-.112,.003,.004],[-.088,.040,.004],[-.066,.050,.004],[-.043,.100,.004],[-.026,.101,.004],[0,.151,.004],[.026,.101,.004],[.043,.100,.004],[.066,.050,.004],[.088,.040,.004],[.112,.003,.004]];
  for(let j=1;j<pts.length;j++)k.beam(f,pts[j-1],pts[j],.0035,p.accent);
  for(const side of [-1,1])k.ball(f,.006,p.trim,side*.043,.103,.004);
 }
 k.cyl(q,.003,.005,.040,p.brass,0,.964,0,8);k.ball(q,.005,p.brass,0,.944,0);const star=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*TAU,r=i%2?.006:.014;i?star.lineTo(Math.sin(a)*r,Math.cos(a)*r):star.moveTo(Math.sin(a)*r,Math.cos(a)*r);}star.closePath();k.mesh(q,new THREE.ExtrudeGeometry(star,{depth:.003,bevelEnabled:false}),p.red,0,.994,0);
}
function centralGable(k,g,p){
 const q=new THREE.Group();q.position.set(.095,.322,.143);g.add(q);const s=new THREE.Shape();
 s.moveTo(-.137,0);s.lineTo(.137,0);s.lineTo(.137,.023);s.lineTo(.112,.023);s.quadraticCurveTo(.105,.067,.078,.084);s.lineTo(.078,.111);s.lineTo(.052,.111);s.lineTo(.052,.145);s.lineTo(.028,.170);s.lineTo(.028,.188);s.lineTo(-.028,.188);s.lineTo(-.028,.170);s.lineTo(-.052,.145);s.lineTo(-.052,.111);s.lineTo(-.078,.111);s.lineTo(-.078,.084);s.quadraticCurveTo(-.105,.067,-.112,.023);s.lineTo(-.137,.023);s.closePath();
 const hole=arch(.034,.081);s.holes.push(new THREE.Path(hole.getPoints(20).map(v=>new THREE.Vector2(v.x,v.y+.049))));
 k.mesh(q,new THREE.ExtrudeGeometry(s,{depth:.018,bevelEnabled:false,curveSegments:18}),p.wall,0,0,-.012);
 const pane=new THREE.Group();pane.position.y=.049;q.add(pane);k.mesh(pane,new THREE.ShapeGeometry(hole,20),p.glass,0,0,-.014);for(const x of [-.010,0,.010])k.box(pane,.0015,.064,.003,p.frame,x,.032,-.010);
 for(const x of [-.077,.077]){k.box(q,.009,.12,.010,p.trim,x,.060,.009);k.ball(q,.008,p.trim,x,.129,.009);}
 for(const [w,y]of [[.29,.003],[.17,.091],[.116,.119],[.065,.170],[.071,.190]])k.box(q,w,.007,.027,p.trim,0,y,.003);
 const cap=k.ball(q,.021,p.trim,0,.200,0);cap.scale.z=.65;
 for(const x of [-.125,.125])k.line(q,[[x,.011,.008],[x*.91,.038,.008],[x*.72,.066,.008],[x*.65,.096,.008]],.0023,p.trim);
}
export function station(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.69,.49);p.wall=stone(k,'#c0b397');p.trim=stone(k,'#ac9b83');p.joint=k.mat('#998b75',.98,0);p.frame=k.mat('#687b70',.87,0);p.glass=k.mat('#465e57',.78,.06);p.glass.userData.night={color:new THREE.Color('#dec99c'),intensity:.20};p.door=k.mat('#344c42',.9,0);p.door.userData.night={color:new THREE.Color('#d0be8c'),intensity:.09};p.brass=k.mat('#b99c5d',.65,.24);p.tile=k.mat('#a6573f',.94,0);p.accent=k.mat('#ac9b83',.94,0);p.accent.userData.night={color:new THREE.Color('#f4cd93'),intensity:.27};
 disc(k,g,.61,.39,.020,k.mat('#bebba8',.99));
 // Entrance apron and six connected stone treads.
 k.box(g,.39,.035,.139,p.trim,.095,.0375,.2065);
 for(let i=0;i<6;i++){const top=.020+(i+1)*.0058;k.box(g,.39,top-.020,.014,p.trim,.095,(top+.020)/2,.353-i*.014);}
 const main=new THREE.Group();main.position.set(.165,.056,-.018);g.add(main);
 for(const side of [-1,1]){const f=new THREE.Group();f.position.z=side*.148;f.rotation.y=side<0?Math.PI:0;main.add(f);const holes=[];for(const x of [-.143,-.070,.003,.150,.258]){holes.push({x,y:0,w:.050,h:.118,door:true});holes.push({x,y:.167,w:.034,h:.065});}facade(k,f,p,.67,.265,holes);k.box(f,.683,.007,.025,p.trim,0,.143,.004);k.box(f,.69,.013,.028,p.trim,0,.263,.004);}
 for(const side of [-1,1]){const f=new THREE.Group();f.position.x=side*.335;f.rotation.y=side*Math.PI/2;main.add(f);facade(k,f,p,.296,.265,[{x:0,y:.025,w:.09,h:.125},{x:0,y:.183,w:.08,h:.052,rect:true}]);}
 roof(k,g,p,.70,.33,.328,.165,-.018,.144);
 for(const x of [-.08,.34,.45])dormer(k,g,p,x,.376,.087);
 const wing=new THREE.Group();wing.position.set(-.433,.021,-.012);g.add(wing);
 for(const side of [-1,1]){const f=new THREE.Group();f.position.z=side*.143;f.rotation.y=side<0?Math.PI:0;wing.add(f);facade(k,f,p,.285,.198,[-.085,0,.085].map(x=>({x,y:.052,w:.042,h:.080,rect:true})));k.box(f,.29,.006,.012,p.trim,0,.023,.003);}
 const end=new THREE.Group();end.rotation.y=-Math.PI/2;end.position.x=-.1425;wing.add(end);facade(k,end,p,.286,.198,[{x:0,y:.041,w:.085,h:.112}]);roof(k,g,p,.313,.31,.222,-.433,-.012,.111);dormer(k,g,p,-.46,.265,.087);
 centralGable(k,g,p);clockTower(k,g,p);
 sign(k,g,'青岛站',.103,.024,.095,.297,.145,{background:'#b6ad95',color:'#354a42'});
 // The rear stays architecturally resolved rather than a blank flat box.
 k.box(g,.68,.016,.312,p.trim,.165,.042,-.018);
 grove(k,g,height,[[-.60,-.24,.11],[.57,-.23,.13]]);
 return finish(k,g,{lamps:[[-.48,.024,.28],[.49,.024,.28]],visitors:[[-.13,.024,.31],[.14,.024,.39],[.24,.024,.36]]});
}
