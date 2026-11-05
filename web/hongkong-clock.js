import * as THREE from 'three';
import {TAU,palette,site,lit,finish,polygon,skin} from './hongkong-kit.js';
import {palm} from './shenzhen-forms.js';

function masonry(k){
 const m=k.mat('#ad6c4d',.96);m.userData.clockBrick=true;
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 vClockPosition;varying vec3 vClockNormal;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvClockPosition=position;vClockNormal=normal;');
  s.fragmentShader='varying vec3 vClockPosition;varying vec3 vClockNormal;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 q=vec2(abs(vClockNormal.x)>abs(vClockNormal.z)?vClockPosition.z:vClockPosition.x,vClockPosition.y)*vec2(132.,280.);
   q.x+=mod(floor(q.y),2.)*.5;vec2 f=fract(q);float mortar=max(1.-step(.06,f.x),1.-step(.09,f.y));
   float tone=fract(sin(dot(floor(q),vec2(23.17,61.3)))*4137.13);diffuseColor.rgb*=mix(.87,1.08,tone);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.31,.24,.18),mortar*.5);`);
 };m.customProgramCacheKey=()=> 'hongkong-clock-brick';return m;
}
function cornice(k,g,width,y,stone,depth=width){
 for(const [w,h,dy]of [[1,.008,0],[1.045,.006,.007],[1.09,.006,.013]])k.box(g,width*w,h,depth*w,stone,0,y+dy,0);
}
function pediment(k,g,w,y,z,m){
 polygon(k,g,[[-w/2,y,z],[w/2,y,z],[0,y+w*.30,z]],m);
 for(const d of [0,.004]){k.beam(g,[-w/2,y+d,z+.002],[0,y+w*.30+d,z+.002],.0025,m);k.beam(g,[0,y+w*.30+d,z+.002],[w/2,y+d,z+.002],.0025,m);}
 k.box(g,w*1.08,.006,.014,m,0,y-.003,z-.003);
}
function windowFrame(k,g,w,h,y,z,stone,glass,steel,{gable=false}={}){
 k.box(g,w-.012,h-.012,.002,glass,0,y,z-.010);
 for(const x of [-w/2+.003,w/2-.003])k.box(g,.006,h,.018,stone,x,y,z-.004);
 for(const yy of [-h/2+.003,h/2-.003])k.box(g,w,.006,.018,stone,0,y+yy,z-.004);
 for(const x of [-w/6,w/6])k.box(g,.0014,h-.012,.002,steel,x,y,z-.006);
 for(let j=1;j<5;j++)k.box(g,w-.012,.0015,.002,steel,0,y-h/2+j*h/5,z-.006);
 k.box(g,w+.012,.005,.026,stone,0,y-h/2-.003,z-.002);
 if(gable)pediment(k,g,w+.020,y+h/2+.009,z+.006,stone);
}
function roman(k,g,text,x,y,angle,m){
 const f=new THREE.Group();g.add(f);f.position.set(x,y,.144);f.rotation.z=-angle;
 const w=.0038,h=.007,gap=.0014,total=text.length*w+(text.length-1)*gap;
 [...text].forEach((c,i)=>{const xx=-total/2+i*(w+gap);const line=(a,b)=>k.beam(f,a,b,.00055,m,5);
  if(c==='I'){line([xx+w/2,-h/2,0],[xx+w/2,h/2,0]);}
  if(c==='V'){line([xx,h/2,0],[xx+w/2,-h/2,0]);line([xx+w/2,-h/2,0],[xx+w,h/2,0]);}
  if(c==='X'){line([xx,-h/2,0],[xx+w,h/2,0]);line([xx,h/2,0],[xx+w,-h/2,0]);}
 });
}
function clockFace(k,g,y,stone,dark,white){
 k.mesh(g,new THREE.CircleGeometry(.055,80),stone,0,y,.137);
 k.mesh(g,new THREE.CircleGeometry(.049,80),dark,0,y,.140);
 k.mesh(g,new THREE.TorusGeometry(.0505,.0018,6,80),white,0,y,.142);
 k.mesh(g,new THREE.TorusGeometry(.036,.0008,5,80),stone,0,y,.142);
 const numbers=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
 for(let i=0;i<60;i++){const a=i/60*TAU,r=i%5===0?.046:.047;k.beam(g,[Math.sin(a)*r,y+Math.cos(a)*r,.143],[Math.sin(a)*.048,y+Math.cos(a)*.048,.143],.00045,white,4);}
 for(let i=0;i<12;i++){const a=i/12*TAU;roman(k,g,numbers[i],Math.sin(a)*.041,y+Math.cos(a)*.041,a,white);}
 const petals=Array.from({length:17},(_,i)=>{const a=i/16*TAU,r=i%2?.014:.024;return [Math.sin(a)*r,y+Math.cos(a)*r,.144];});k.line(g,petals,.0009,white);
 k.beam(g,[0,y,.146],[.024,y+.019,.146],.0014,white);k.beam(g,[0,y,.147],[-.013,y+.026,.147],.0011,white);k.ball(g,.0024,white,0,y,.147);
}
export function clock(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const tower=new THREE.Group();g.add(tower);tower.position.z=-.12;
 const stone=lit(k,'#bdb8a6',.13),brick=masonry(k),dome=lit(k,'#d0cbbb',.16),dark=k.mat('#17282b',.72),white=lit(k,'#dce0d7',.43),glass=lit(k,'#354849',.11),bronze=k.mat('#69543e',.7,.2);
 dome.userData.clockDome=true;glass.userData.clockGlazing=true;dark.userData.clockRecess=true;stone.userData.clockStone=true;
 // Six-storey square shaft. Wall strips leave genuine recesses for the side windows.
 for(const [w,h,y]of [[.31,.028,.035],[.288,.034,.066],[.27,.052,.109]])k.box(tower,w,h,w,stone,0,y,0);
 for(let f=0;f<4;f++){
  const face=new THREE.Group();tower.add(face);face.rotation.y=f*Math.PI/2;
  const holes=f===0?[[.209,.148,.070]]:[[.25,.112,.068],[.43,.112,.068],[.61,.112,.068]];
  let bottom=.135;
  for(const [cy,h,w]of holes){const low=cy-h/2,high=cy+h/2;if(low>bottom)k.box(face,.25,low-bottom,.026,brick,0,(low+bottom)/2,.112);
   for(const s of [-1,1])k.box(face,(.25-w)/2,h,.026,brick,s*(w+(.25-w)/2)/2,cy,.112);
   if(f===0){
    k.box(face,w-.007,.112,.003,bronze,0,.191,.105);k.mesh(face,new THREE.CircleGeometry(.0315,24,0,Math.PI),dark,0,.247,.106);
    for(const xx of [-.016,.016])for(const yy of [.161,.209]){k.box(face,.025,.037,.004,stone,xx,yy,.108);k.box(face,.021,.033,.004,bronze,xx,yy,.111);}
    for(const xx of [-.039,.039])k.box(face,.006,.116,.018,stone,xx,.191,.125);
    k.line(face,Array.from({length:25},(_,j)=>{const t=j/24*Math.PI;return [Math.cos(t)*.039,.247+Math.sin(t)*.039,.129];}),.003,stone);
    for(const xx of [-.012,0,.012])k.box(face,.0012,.024,.002,bronze,xx,.258,.108);
   }
   else windowFrame(k,face,w,h,cy,.130,stone,glass,bronze,{gable:true});bottom=high;
  }
  k.box(face,.25,.814-bottom,.026,brick,0,(.814+bottom)/2,.112);
  clockFace(k,face,.750,stone,dark,white);
  // A three-window attic sits between each clock and the projecting cornice.
  for(const yy of [.819,.883])k.box(face,.25,.010,.020,stone,0,yy,.112);
  for(const xx of [-.101,-.027,.027,.101])k.box(face,Math.abs(xx)>.08?.048:.014,.056,.020,stone,xx,.851,.112);
  for(const x of [-.054,0,.054]){const win=new THREE.Group();face.add(win);win.position.x=x;windowFrame(k,win,.040,.056,.851,.130,stone,glass,bronze);}
  for(let i=0;i<27;i++)for(const x of [-.104,.104])k.box(face,.043,.027,.035,stone,x,.148+i*.0275,.118);
  for(let i=0;i<10;i++)k.box(face,.010,.010,.017,stone,-.12+i*.0266,.897,.142);
 }
 cornice(k,tower,.274,.902,stone);
 // Closed red-brick octagonal attic with shallow arched openings and scroll buttresses.
 k.box(tower,.249,.055,.249,brick,0,.954,0);
 for(let i=0;i<4;i++){const f=new THREE.Group();tower.add(f);f.rotation.y=i*Math.PI/2;for(const x of [-.112,.112])k.box(f,.025,.055,.010,stone,x,.954,.127);k.box(f,.249,.005,.010,stone,0,.930,.127);}
 cornice(k,tower,.258,.975,stone);
 k.cyl(tower,.111,.111,.127,brick,0,1.058,0,8).rotation.y=Math.PI/8;
 for(let i=0;i<8;i++){
  const a=i/8*TAU,f=new THREE.Group();tower.add(f);f.rotation.y=a;
  k.box(f,.040,.070,.002,dark,0,1.056,.104);
  k.mesh(f,new THREE.CircleGeometry(.020,24,0,Math.PI),dark,0,1.091,.105);
  for(const x of [-.025,.025])k.cyl(f,.004,.0045,.087,stone,x,1.064,.111,12);
  k.line(f,Array.from({length:25},(_,j)=>{const t=j/24*Math.PI;return [Math.cos(t)*.025,1.090+Math.sin(t)*.025,.112];}),.003,stone);
  for(let j=0;j<3;j++)k.box(f,.036,.0015,.002,bronze,0,1.035+j*.021,.108);
 }
 for(let i=0;i<4;i++){
  const a=(i+.5)/4*TAU,f=new THREE.Group();tower.add(f);f.rotation.y=a;
  k.box(f,.018,.047,.018,stone,0,.952,.164);
  const points=[[0,1.010,.109],[0,1.006,.125],[0,.988,.142],[0,.965,.155],[0,.952,.170],[0,.955,.181],[0,.966,.181],[0,.971,.173],[0,.967,.168]];k.line(f,points,.005,stone);
 }
 for(const [rt,rb,h,y]of [[.119,.113,.010,1.123],[.121,.122,.009,1.133]])k.cyl(tower,rt,rb,h,stone,0,y,0,8).rotation.y=Math.PI/8;
 k.cyl(tower,.093,.109,.040,brick,0,1.159,0,8).rotation.y=Math.PI/8;
 for(let i=0;i<8;i++){const a=i/8*TAU;k.beam(tower,[Math.sin(a)*.107,1.139,Math.cos(a)*.107],[Math.sin(a)*.093,1.179,Math.cos(a)*.093],.004,stone);}
 k.cyl(tower,.100,.101,.008,stone,0,1.182,0,8).rotation.y=Math.PI/8;
 skin(k,tower,(u,v)=>{const a=u*TAU,t=v*Math.PI/2;return [Math.cos(a)*.090*Math.cos(t),1.187+.067*Math.sin(t),Math.sin(a)*.090*Math.cos(t)];},24,80,dome);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.line(tower,Array.from({length:17},(_,j)=>{const t=j/16*Math.PI/2;return [Math.cos(a)*.0905*Math.cos(t),1.187+.0675*Math.sin(t),Math.sin(a)*.0905*Math.cos(t)];}),.0007,stone);}
 k.cyl(tower,.012,.017,.012,bronze,0,1.259,0,16);
 // Slender steel lightning mast, not a green spire.
 for(const s of [-1,1])k.beam(tower,[s*.006,1.263,0],[s*.004,1.347,0],.0011,dark);
 for(let i=0;i<7;i++){const y=1.265+i*.011;k.beam(tower,[-.005,y,0],[.005,y+.011,0],.00065,dark);k.beam(tower,[.005,y,0],[-.005,y+.011,0],.00065,dark);}
 k.beam(tower,[0,1.346,0],[0,1.366,0],.0008,dark);
 const step=k.mat('#b9b7aa',.94);step.userData.clockSteps=true;
 for(let i=0;i<6;i++){const top=.035+i*.020; k.box(g,.096,top-.016,.017,step,0,(top+.016)/2,.107-i*.016);}
 // Reflecting pool remains separate from the harbour; the surrounding plaza stays clear.
 const pool=k.mat('#608d8f',.52,.08);pool.userData.landscape=true;k.box(g,.17,.008,.35,p.pale,0,.024,.35);k.box(g,.145,.005,.325,pool,0,.029,.35);
 for(const x of [-.35,.35])for(const z of [-.24,.13,.38])palm(k,g,x,.018,z,.19);
 return finish(k,g,{lamps:[[-.18,.022,.15],[.18,.022,.15]],visitors:[[-.20,.021,.28],[.21,.021,.42],[.23,.021,-.08]]});
}
