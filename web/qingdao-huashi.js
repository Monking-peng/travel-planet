import * as THREE from 'three';
import {palette,site,disc,grove,finish,gable,TAU} from './qingdao-kit.js';

// Photo-based miniature: the tall circular tower, lower polygonal bay and
// entrance porch remain distinct; the upper tower arcade is genuinely open.
function granite(k,color,coarse=false){
 const m=k.mat(color,.98,0);m.userData.huashiStone=true;
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 stoneP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstoneP=position;');
  s.fragmentShader='varying vec3 stoneP; float gh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float grain=gh(floor(vec2(stoneP.x+stoneP.z*.61,stoneP.y)*1100.));
   vec2 uv=vec2(stoneP.x+stoneP.z*.73,stoneP.y)*vec2(${coarse?'19.':'63.'},${coarse?'38.':'111.'});
   uv.x+=floor(uv.y)*.43;vec2 cell=floor(uv),f=fract(uv);
   float mortar=(1.-smoothstep(.018,.05,min(f.x,min(f.y,1.-f.y))));
   diffuseColor.rgb*=.88+.11*grain+.08*gh(cell)-mortar*${coarse?'.13':'.07'};
  `);
 };m.customProgramCacheKey=()=>`huashi-granite-${coarse}`;return m;
}
function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function opening(w,h,y=0,x=0){const shape=arch(w,h),p=new THREE.Path(shape.getPoints(20).map(v=>new THREE.Vector2(v.x+x,v.y+y)));return p;}
function pane(k,g,p,w,h,{rect=false,door=false}={}){
 const outline=rect?new THREE.Shape([new THREE.Vector2(-w/2,0),new THREE.Vector2(w/2,0),new THREE.Vector2(w/2,h),new THREE.Vector2(-w/2,h)]):arch(w,h);
 const rim=rect?new THREE.Shape([new THREE.Vector2(-w/2-.004,-.004),new THREE.Vector2(w/2+.004,-.004),new THREE.Vector2(w/2+.004,h+.004),new THREE.Vector2(-w/2-.004,h+.004)]):arch(w+.008,h+.008);
 if(rect)rim.holes.push(new THREE.Path(outline.getPoints()));else rim.holes.push(opening(w,h,.004));
 k.mesh(g,new THREE.ExtrudeGeometry(rim,{depth:.004,bevelEnabled:false,curveSegments:20}),p.frame,0,rect?0:-.004,-.005);
 k.mesh(g,new THREE.ShapeGeometry(outline,24),door?p.door:p.glass,0,0,-.012);
 const straight=rect?h:h-w/2;
 for(const x of [-w/2,0,w/2])k.box(g,.0022,straight,.002,p.frame,x,straight/2,-.006);
 for(const y of [straight*.18,straight*.48,straight*.78,straight])k.box(g,w,.002,.002,p.frame,0,y,-.005);
 if(!rect){
  for(const a of [Math.PI/4,Math.PI/2,Math.PI*.75])k.beam(g,[0,straight,-.005],[Math.cos(a)*w/2,straight+Math.sin(a)*w/2,-.005],.0009,p.frame);
  for(const side of [-1,1]){const s=new THREE.Shape();s.moveTo(0,straight+.002);s.lineTo(side*w*.40,straight+.003);s.lineTo(side*w*.24,straight+w*.34);s.closePath();k.mesh(g,new THREE.ShapeGeometry(s),side<0?p.green:p.amber,0,0,-.010);}
 }
 k.box(g,w+.016,.006,.014,p.trim,0,-.004,0);
 if(door){for(const x of [-w*.16,w*.16])k.box(g,.0018,.010,.005,p.metal,x,.047,-.003);}
}
// A facade with real holes, mapped either to a cylindrical sector or a flat
// polygon face. This avoids windows painted on top of uninterrupted walls.
function facade(k,g,p,{w,h,y=0,holes=[],curve=0}){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
 holes.forEach(a=>s.holes.push(opening(a.w,a.h,a.y,a.x||0)));
 const ge=new THREE.ExtrudeGeometry(s,{depth:.013,bevelEnabled:false,curveSegments:20});
 if(curve){const a=ge.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i),angle=x/curve,r=curve+z;a.setXYZ(i,Math.sin(angle)*r,a.getY(i),Math.cos(angle)*r-curve);}ge.computeVertexNormals();}
 k.mesh(g,ge,p.wall,0,y,-.013);
 for(const a of holes){const q=new THREE.Group();q.position.set(a.x||0,y+a.y,.001);g.add(q);pane(k,q,p,a.w,a.h,a);}
}
function molding(k,g,p,w,y,z){for(const [dy,depth]of [[0,.014],[.006,.018]])k.box(g,w,.005,depth,p.trim,0,y+dy,z);}
function roundTower(k,g,p){
 const q=new THREE.Group();q.position.set(-.205,0,.135);g.add(q);const r=.127,N=10;
 for(let i=0;i<N;i++){
  const a=i/N*TAU,face=new THREE.Group();face.rotation.y=a;face.position.set(Math.sin(a)*r,0,Math.cos(a)*r);q.add(face);
  facade(k,face,p,{w:r*TAU/N,h:.617,y:.022,curve:r,holes:[{y:.057,w:.033,h:.056},{y:.164,w:.048,h:.131},{y:.370,w:.048,h:.150}]});
 }
 for(const y of [.030,.150,.326,.553,.625])k.cyl(q,r+.007,r+.007,.009,p.trim,0,y,0,64);
 // Pale irregular-stone infill panels around the paired upper windows.
 for(let i=0;i<N;i++){const a=i/N*TAU,f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*(r+.001),0,Math.cos(a)*(r+.001));q.add(f);const panel={...p,wall:p.infill};facade(k,f,panel,{w:.066,h:.180,y:.352,curve:r,holes:[{y:.018,w:.048,h:.150}]});}
 // Eight open arches at the crown, without glazing or false dark blockers.
 const topR=r+.005;
 for(let i=0;i<8;i++){
  const a=i/8*TAU,f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*topR,.639,Math.cos(a)*topR);q.add(f);
  const w=topR*TAU/8,s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,.099);s.lineTo(w/2,.099);s.lineTo(w/2,0);s.lineTo(.026,0);s.lineTo(.026,.042);s.absarc(0,.042,.026,0,Math.PI,false);s.lineTo(-.026,0);s.closePath();
  const ge=new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false,curveSegments:20});const v=ge.attributes.position;
  for(let j=0;j<v.count;j++){const x=v.getX(j),z=v.getZ(j),rr=topR+z;v.setXYZ(j,Math.sin(x/topR)*rr,v.getY(j),Math.cos(x/topR)*rr-topR);}ge.computeVertexNormals();k.mesh(f,ge,p.wall,0,0,-.014);
  k.box(f,.062,.005,.016,p.trim,0,-.001,0);
 }
 k.cyl(q,r+.012,r+.012,.009,p.trim,0,.739,0,64);
 for(let i=0;i<14;i++){const a=i/14*TAU,o=k.box(q,.040,.023,.016,p.wall,Math.sin(a)*(r+.002),.754,Math.cos(a)*(r+.002));o.rotation.y=a;}
 k.ring(q,r+.008,.0012,p.metal,.768);k.cyl(q,.002,.002,.073,p.metal,0,.788,0,8);
 k.cyl(q,r-.018,r-.018,.007,p.floor,0,.641,0,64);
}
function polygonBay(k,g,p){
 const q=new THREE.Group();q.position.set(.205,0,.09);g.add(q);const r=.157,N=8,apothem=r*Math.cos(Math.PI/N),w=2*r*Math.sin(Math.PI/N);
 for(let i=0;i<N;i++){
  const a=i/N*TAU,f=new THREE.Group();f.position.set(Math.sin(a)*apothem,0,Math.cos(a)*apothem);f.rotation.y=a;q.add(f);
  facade(k,f,p,{w,h:.558,y:.022,holes:[{y:.092,w:.064,h:.130},{y:.277,w:.064,h:.139},{y:.458,w:.050,h:.068}]});
  for(const y of [.083,.260,.448,.579])molding(k,f,p,w+.004,y,0);
  k.box(f,w+.007,.027,.016,p.wall,0,.591,0);
  for(const dx of [-w*.34,w*.34])k.box(f,.025,.011,.019,p.trim,dx,.610,0);
 }
 k.cyl(q,r-.012,r-.012,.012,p.floor,0,.574,0,8);
}
function porch(k,g,p){
 const x=.012;
 k.box(g,.202,.080,.295,p.wall,x,.062,.1965);k.box(g,.214,.010,.300,p.trim,x,.107,.1965);
 // The seven broad treads meet the porch at the same level.
 for(let i=0;i<7;i++){const top=.020+(i+1)*.012; k.box(g,.23+.002*(6-i),top-.020,.018,p.trim,x,(top+.020)/2,.450-i*.018);}
 for(const xx of [-.069,.093]){
  k.box(g,.037,.034,.037,p.trim,xx,.128,.309);k.cyl(g,.019,.023,.016,p.trim,xx,.152,.309,16);
  k.cyl(g,.011,.014,.157,p.trim,xx,.238,.309,24);
  for(let i=0;i<14;i++){const a=i/14*TAU;k.beam(g,[xx+Math.sin(a)*.013,.167,.309+Math.cos(a)*.013],[xx+Math.sin(a)*.0108,.308,.309+Math.cos(a)*.0108],.0008,p.joint);}
  k.cyl(g,.018,.013,.016,p.trim,xx,.322,.309,16);k.box(g,.037,.009,.037,p.trim,xx,.336,.309);
 }
 k.box(g,.222,.013,.290,p.trim,x,.350,.195);k.box(g,.234,.009,.300,p.trim,x,.361,.195);
 for(let i=0;i<11;i++){const xx=x-.107+i*.0214;k.box(g,.010,.030,.009,p.frame,xx,.381,.341);const a=new THREE.Shape();a.moveTo(-.008,0);a.quadraticCurveTo(0,.019,.008,0);a.lineTo(.010,.022);a.lineTo(-.010,.022);a.closePath();k.mesh(g,new THREE.ExtrudeGeometry(a,{depth:.009,bevelEnabled:false}),p.frame,xx+.0107,.369,.337);}
 k.box(g,.239,.006,.017,p.trim,x,.399,.342);
 const lamp=k.mat('#d9bd83',.7,0);lamp.userData.night={color:new THREE.Color('#ffe1a8'),intensity:.55};k.ball(g,.006,lamp,x,.338,.272);
}
export function huashi(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.59,.55);
 p.wall=granite(k,'#a69b85',true);p.infill=granite(k,'#b9b29e');p.trim=granite(k,'#b2ab95');p.frame=k.mat('#d6ded3',.88,0);p.joint=k.mat('#8d8778',.97,0);p.floor=k.mat('#929583',.97,0);p.metal=k.mat('#3a5148',.8,.25);p.door=k.mat('#35473f',.9,0);
 p.glass=k.mat('#a8bbb6',.6,.08);p.glass.userData.night={color:new THREE.Color('#e6d5ac'),intensity:.18};p.green=k.mat('#608980',.6);p.amber=k.mat('#b6aa76',.65);
 disc(k,g,.46,.47,.020,k.mat('#b9b79f',.99));
 // The rear residence retains the red pitched roof visible in the aerial.
 const body=new THREE.Group();body.position.set(-.015,.022,-.100);g.add(body);
 // Walls are separate skins, so recessed glass and the doorway stay visible.
 for(const side of [-1,1]){
  const f=new THREE.Group();f.position.x=side*.2625;f.rotation.y=side*Math.PI/2;body.add(f);
  const holes=[];for(const x of [-.084,.064])for(const y of [.10,.285,.443])holes.push({x,y,w:.049,h:y>.4?.064:.118});
  facade(k,f,p,{w:.285,h:.548,holes});
 }
 for(const x of [-.183,.183])k.box(body,.159,.548,.013,p.wall,x,.274,.136);
 k.box(body,.525,.012,.285,p.floor,0,.006,0);
 const back=new THREE.Group();back.rotation.y=Math.PI;back.position.z=-.145;body.add(back);
 const rearHoles=[];for(const x of [-.185,-.064,.060,.184])for(const y of [.10,.285,.443])rearHoles.push({x,y,w:.049,h:y>.4?.064:.118});
 facade(k,back,p,{w:.525,h:.548,holes:rearHoles});
 gable(k,body,p,.54,.29,.070,.553,0,0,k.mat('#995948',.97));
 for(const x of [-.22,.18]){k.box(body,.035,.125,.033,p.wall,x,.619,-.095);k.box(body,.048,.010,.044,p.trim,x,.686,-.095);for(const dx of [-.009,0,.009])k.cyl(body,.0025,.0025,.020,p.metal,x+dx,.700,-.095,8);}
 // Front connecting wall and recessed arched entrance between the two bays.
 const front=new THREE.Group();front.position.set(.012,.022,.049);g.add(front);
 facade(k,front,p,{w:.202,h:.510,holes:[{y:.087,w:.085,h:.205,door:true},{y:.359,w:.085,h:.093}]});
 for(let i=0;i<15;i++){const xx=-.094+i*.0134;k.box(front,.0015,.064,.0015,p.metal,xx,.546+.008*Math.cos(xx*27),.006);}
 k.line(front,Array.from({length:20},(_,i)=>{const x=-.10+i*.20/19;return[x,.577+.014*Math.cos(x*27),.006];}),.0015,p.metal);
 roundTower(k,g,p);polygonBay(k,g,p);porch(k,g,p);
 // A small rear turret, distinct from the open circular tower.
 const turret=new THREE.Group();turret.position.set(-.254,.022,-.225);g.add(turret);
 for(let i=0;i<8;i++){const a=i/8*TAU,f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*.041*Math.cos(Math.PI/8),0,Math.cos(a)*.041*Math.cos(Math.PI/8));turret.add(f);facade(k,f,{...p,wall:p.infill},{w:2*.041*Math.sin(Math.PI/8),h:.56,holes:[{y:.12,w:.018,h:.058},{y:.295,w:.018,h:.058},{y:.465,w:.018,h:.058}]});}
 k.cyl(g,0,.053,.112,p.metal,-.254,.638,-.225,8);
 grove(k,g,height,[[-.44,-.21,.19],[.42,-.22,.20],[.22,-.42,.15],[-.10,-.43,.19],[-.42,.09,.12]]);
 return finish(k,g,{lamps:[[-.34,.024,.36],[.33,.024,.36]],visitors:[[-.13,.024,.43],[.17,.024,.43]]});
}
