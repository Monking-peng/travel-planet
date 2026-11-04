import * as THREE from 'three';
import {palette,site,disc,finish,TAU} from './quanzhou-kit.js';

function lighting(k,color,night,intensity){const m=k.mat(color,.88);m.userData.night={color:new THREE.Color(night),intensity};m.userData.clockStructure=true;return m;}
function frame(k,g,p,w,h,y,z){
 k.box(g,w,h,.005,p.glass,0,y,z);
 for(const x of [-w/2,0,w/2])k.box(g,.0025,h+.004,.008,p.bronze,x,y,z+.003);
 for(const yy of [-h/2,0,h/2])k.box(g,w+.005,.0025,.008,p.bronze,0,y+yy,z+.003);
}
function clockFace(k,g,p,y,z){
 const c=new THREE.Group();c.position.set(0,y,z);g.add(c);
 const face=lighting(k,'#ebeee5','#ddeaf1',.58),ink=k.mat('#354440',.88);delete face.userData.clockStructure;
 k.mesh(c,new THREE.CircleGeometry(.045,64),face);
 k.mesh(c,new THREE.TorusGeometry(.045,.0015,8,64),p.bronze,0,0,.001);
 for(let i=0;i<60;i++){const a=i/60*TAU,r=i%5===0?.0365:.041;k.beam(c,[Math.sin(a)*r,Math.cos(a)*r,.002],[Math.sin(a)*.043,Math.cos(a)*.043,.002],i%5===0?.00065:.00032,ink,4);}
 if(typeof document!=='undefined'){
  const cv=document.createElement('canvas');cv.width=cv.height=512;const ctx=cv.getContext('2d');ctx.clearRect(0,0,512,512);ctx.fillStyle='#354440';ctx.font='34px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach((n,i)=>{const a=i/12*TAU;ctx.save();ctx.translate(256+Math.sin(a)*188,256-Math.cos(a)*188);ctx.rotate(a);ctx.fillText(n,0,0);ctx.restore();});
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff');m.map=t;m.transparent=true;m.depthWrite=false;k.mesh(c,new THREE.PlaneGeometry(.085,.085),m,0,0,.003);
 }
 // A fixed display time avoids depending on the visitor's timezone.
 for(const [a,len,r]of [[-Math.PI/2.4,.025,.0011],[Math.PI/3,.036,.0008]]){k.beam(c,[0,0,.005],[Math.sin(a)*len,Math.cos(a)*len,.005],r,ink,6);k.beam(c,[0,0,.005],[-Math.sin(a)*.006,-Math.cos(a)*.006,.005],r,ink,6);}
 k.ball(c,.0024,ink,0,0,.006);
}
function haunch(k,g,p,rotation){
 const c=new THREE.Group();c.rotation.y=rotation;g.add(c);
 for(const side of [-1,1]){
  const s=new THREE.Shape();s.moveTo(side*.065,.181);s.lineTo(side*.065,.236);s.lineTo(side*.013,.236);s.quadraticCurveTo(side*.056,.219,side*.065,.181);
  k.mesh(c,new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:false,curveSegments:16}),p.edge,0,0,.0525);
 }
}
export function clock(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.52,.49);
 p.wall=lighting(k,'#dadbd2','#ebecdb',.095);p.edge=lighting(k,'#e8e6db','#ffe5b5',.15);p.recess=lighting(k,'#bfc4bb','#f6e6c8',.075);
 p.wash=lighting(k,'#e8e6db','#ffe2a5',.58);
 p.wash.onBeforeCompile=s=>{s.vertexShader='varying float clockY;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nclockY=position.y;');s.fragmentShader='varying float clockY;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=.15+.85*pow(1.-clamp((clockY-.25)/.27,0.,1.),1.6);');};p.wash.customProgramCacheKey=()=> 'quanzhou-clock-uplight';
 p.bronze=k.mat('#665e3b',.69,.24);p.glass=lighting(k,'#4d584c','#dbc17b',.16);delete p.glass.userData.clockStructure;
 const pavement=k.mat('#c1beb0',.97),road=k.mat('#7e8580',.98),paint=k.mat('#d9d9c9',.96),black=k.mat('#3a403a',.9);
 disc(k,g,.43,.41,.021,pavement);k.box(g,.80,.005,.25,road,0,.024,0);k.box(g,.25,.005,.76,road,0,.024,0);
 k.cyl(g,.108,.115,.009,p.recess,0,.031,0,64);k.cyl(g,.098,.108,.006,p.edge,0,.038,0,64);
 g.userData.clockOpenBase=true;
 for(const x of [-.065,.065])for(const z of [-.065,.065]){
  k.box(g,.022,.174,.022,p.wall,x,.128,z);k.box(g,.030,.015,.030,p.edge,x,.048,z);
  k.box(g,.026,.017,.026,p.edge,x,.208,z);k.box(g,.039,.010,.039,p.edge,x,.220,z);
 }
 for(let side=0;side<4;side++)haunch(k,g,p,side/4*TAU);
 k.box(g,.224,.014,.224,p.edge,0,.239,0);k.box(g,.207,.006,.207,p.recess,0,.249,0);
 for(let side=0;side<4;side++){
  const c=new THREE.Group();g.add(c);c.rotation.y=side/4*TAU;
  // Deep vertical panels and small lower openings are integral to the Art Deco facade.
  for(const x of [-.080,.080])k.box(c,.037,.262,.035,p.wash,x,.383,.079);
  k.box(c,.126,.010,.015,p.edge,0,.509,.089);k.box(c,.126,.006,.016,p.recess,0,.497,.083);
  k.box(c,.126,.126,.012,p.wall,0,.431,.076);k.box(c,.126,.017,.012,p.wall,0,.304,.076);
  for(const x of [-.04325,.04325])k.box(c,.0395,.056,.012,p.wall,x,.340,.076);
  frame(k,c,p,.047,.052,.340,.084);
  for(const x of [-.032,0,.032]){k.box(c,.014,.027,.018,p.wall,x,.274,.079);}
  for(const x of [-.061,.061])k.box(c,.013,.044,.018,p.wall,x,.282,.079);
  k.box(c,.130,.007,.020,p.edge,0,.290,.082);
  for(const x of [-.078,.078]){k.box(c,.015,.006,.011,black,x,.255,.112);k.mesh(c,new THREE.SphereGeometry(.003,8,6),lighting(k,'#d5d1ba','#ffe6b1',.45),x,.258,.114);}
 }
 k.box(g,.198,.009,.198,p.wall,0,.510,0);
 // Solid square clock neck with subtly splayed shoulders, not an octagonal gazebo.
 k.box(g,.100,.056,.100,p.wall,0,.539,0);
 const shoulder=new THREE.CylinderGeometry(.0615,.071,.022,4,1,false,Math.PI/4);k.mesh(g,shoulder,p.wall,0,.576,0);
 k.box(g,.087,.116,.087,p.wall,0,.641,0);
 for(let side=0;side<4;side++){
  const c=new THREE.Group();c.rotation.y=side/4*TAU;g.add(c);k.box(c,.010,.116,.012,p.edge,-.048,.641,.047);k.box(c,.010,.116,.012,p.edge,.048,.641,.047);
  clockFace(k,c,p,.654,.050);k.box(c,.060,.003,.003,p.recess,0,.589,.045);
  // Lower access hatch and tiny floodlights in the reference photographs.
  k.box(c,.022,.026,.002,p.recess,0,.538,.051);k.box(c,.002,.023,.002,p.edge,-.010,.538,.053);
  for(const x of [-.039,.039]){const lamp=k.cyl(c,.003,.004,.006,black,x,.518,.054,10);lamp.rotation.x=Math.PI/2;}
 }
 k.box(g,.125,.009,.125,p.edge,0,.705,0);k.box(g,.112,.006,.112,p.recess,0,.712,0);
 // Four dark inset windows with broad corner piers; the cap has chamfered corners.
 k.box(g,.067,.053,.067,p.recess,0,.741,0);
 for(let side=0;side<4;side++){const c=new THREE.Group();c.rotation.y=side/4*TAU;g.add(c);frame(k,c,p,.024,.039,.741,.035);for(const x of [-.032,.032])k.box(c,.011,.057,.010,p.edge,x,.742,.034);}
 k.cyl(g,.051,.051,.009,p.edge,0,.774,0,8);k.cyl(g,.044,.051,.008,p.edge,0,.782,0,8);
 k.beam(g,[0,.785,0],[0,.833,0],.0013,p.bronze);
 for(const a of [0,Math.PI/2]){const dx=Math.cos(a),dz=Math.sin(a);k.beam(g,[-dx*.028,.815,-dz*.028],[dx*.028,.815,dz*.028],.001,p.bronze);for(const sign of [-1,1]){k.beam(g,[dx*.028*sign,.815,dz*.028*sign],[dx*.020*sign,.821,dz*.020*sign],.0008,p.bronze);k.beam(g,[dx*.028*sign,.815,dz*.028*sign],[dx*.020*sign,.809,dz*.020*sign],.0008,p.bronze);}}
 for(let side=0;side<4;side++){
  const c=new THREE.Group();c.rotation.y=side/4*TAU;g.add(c);k.box(c,.069,.022,.018,p.wall,0,.239,.117);
  for(let i=0;i<3;i++){k.mesh(c,new THREE.CircleGeometry(.007,16),black,(i-1)*.020,.239,.127);if(i===0)k.mesh(c,new THREE.CircleGeometry(.0053,16),lighting(k,'#a73c36','#e25c3f',.42),-.020,.239,.1275);}
  for(let i=0;i<9;i++)k.box(c,.013,.001,.064,paint,(i-4)*.020,.027,.205);
 }
 return finish(k,g,{lamps:[[-.28,.023,.26],[.28,.023,.26],[-.28,.023,-.26],[.28,.023,-.26]],visitors:[[-.24,.023,.27],[.29,.023,.24],[-.26,.023,-.22],[.23,.023,-.28]]});
}
