import * as THREE from 'three';
import {tree} from './wuhan-architecture.js';
import {plaza,people,glow} from './shenzhen-forms.js';

function prism(k,g,points,d,mat,x,y,z){const s=new THREE.Shape();points.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:18}),mat,x,y,z);}
function pointed(k,g,x,y,z,w,h,mat){return prism(k,g,[[-w/2,0],[-w/2,h*.65],[-w*.35,h*.85],[0,h],[w*.35,h*.85],[w/2,h*.65],[w/2,0]],.003,mat,x,y,z);}
function archLine(k,g,x,y,z,w,h,m,r=.002){k.line(g,[[x-w/2,y,z],[x-w/2,y+h*.62,z],[x-w*.34,y+h*.84,z],[x,y+h,z],[x+w*.34,y+h*.84,z],[x+w/2,y+h*.62,z],[x+w/2,y,z]],r,m);}
function gable(k,g,w,d,h,x,y,z,m){return prism(k,g,[[-w/2,0],[w/2,0],[0,h]],d,m,x,y,z-d/2);}
function roundArch(k,g,x,y,z,w,h,d,m){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
  const r=w*.37,hole=new THREE.Path(),spring=h-r-.008;hole.moveTo(-r,.001);hole.lineTo(-r,spring);hole.absarc(0,spring,r,Math.PI,0,true);hole.lineTo(r,.001);hole.closePath();s.holes.push(hole);
  return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:24}),m,x,y,z-d/2);
}
function railing(k,g,x,y,z,w,m){
  k.box(g,w,.003,.004,m,x,y+.034,z);k.box(g,w,.003,.004,m,x,y+.005,z);
  for(let i=0;i<=Math.ceil(w/.015);i++){const xx=x+(i/Math.ceil(w/.015)-.5)*w;k.beam(g,[xx,y+.005,z],[xx,y+.034,z],.001,m,4);}
}
function brickTexture(m){
  m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vShamian;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvShamian=position;');s.fragmentShader='varying vec3 vShamian;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 p=vec2(vShamian.x+vShamian.z,vShamian.y)*vec2(78.,120.);p.x+=mod(floor(p.y),2.)*.5;
    vec2 e=min(fract(p),1.-fract(p))/max(fwidth(p),vec2(.02));float mortar=1.-smoothstep(.05,.55,min(e.x,e.y));
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.28,mortar*.8);
  `);};m.customProgramCacheKey=()=> 'shamian-brick-v1';
}
function chapel(k,g,p){
  const c=new THREE.Group();g.add(c);c.position.set(-.40,.018,-.08);
  const {wall,ivory,roof,glass,iron,wood,light}=p;
  k.box(c,.355,.020,.70,p.stone,0,.01,0);
  // Narrow long nave, a separate western entrance tower and a real recessed portal.
  k.box(c,.32,.29,.52,wall,0,.165,-.073);
  gable(k,c,.36,.57,.105,0,.31,-.073,roof);
  gable(k,c,.32,.014,.094,0,.309,.210,wall);
  k.box(c,.025,.22,.17,wall,-.075,.13,.239);k.box(c,.025,.22,.17,wall,.075,.13,.239);
  const portal=new THREE.Shape();portal.moveTo(-.0875,0);portal.lineTo(.0875,0);portal.lineTo(.0875,.22);portal.lineTo(-.0875,.22);portal.closePath();const hole=new THREE.Path();hole.moveTo(-.0475,.001);hole.lineTo(-.0475,.129);hole.quadraticCurveTo(-.038,.173,0,.203);hole.quadraticCurveTo(.038,.173,.0475,.129);hole.lineTo(.0475,.001);hole.closePath();portal.holes.push(hole);k.mesh(c,new THREE.ExtrudeGeometry(portal,{depth:.014,bevelEnabled:false,curveSegments:18}),wall,0,.027,.318);k.box(c,.175,.27,.17,wall,0,.368,.239);
  for(const y of [.247,.493,.535])k.box(c,.196,.011,.191,ivory,0,y,.239);
  for(const x of [-.080,.080])for(const z of [.162,.316]){k.box(c,.016,.49,.016,ivory,x,.266,z);k.cyl(c,0,.013,.065,ivory,x,.553,z,4).rotation.y=Math.PI/4;}
  for(const z of [.151,.327]){pointed(k,c,0,.367,z,.086,.108,iron);archLine(k,c,0,.363,z+.004,.10,.122,ivory);k.box(c,.002,.074,.004,ivory,0,.407,z+.008);}
  const ring=k.mesh(c,new THREE.TorusGeometry(.039,.004,6,48),ivory,0,.304,.331);k.mesh(c,new THREE.CircleGeometry(.034,40),glass,0,.304,.330);
  k.box(c,.002,.065,.003,ivory,0,.304,.335);k.box(c,.065,.002,.003,ivory,0,.304,.335);
  k.cyl(c,.075,.092,.055,wall,0,.523,.239,4).rotation.y=Math.PI/4;
  k.cyl(c,0,.079,.240,wall,0,.671,.239,4).rotation.y=Math.PI/4;
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;k.beam(c,[Math.cos(a)*.079,.551,.239+Math.sin(a)*.079],[0,.791,.239],.0025,ivory);for(let j=1;j<7;j++){const t=j/8;k.ball(c,.0035,ivory,Math.cos(a)*.079*(1-t),.551+t*.24,.239+Math.sin(a)*.079*(1-t));}}
  k.box(c,.003,.054,.003,iron,0,.815,.239);k.box(c,.027,.003,.003,iron,0,.825,.239);
  // Pointed portal frames follow the opening instead of covering it with a dark decal.
  for(let j=0;j<3;j++)archLine(k,c,0,.027,.332+j*.003,.103+j*.014,.200+j*.010,ivory,.0027);
  k.box(c,.060,.14,.006,wood,0,.096,.207);k.box(c,.003,.14,.008,ivory,0,.096,.211);
  for(const side of [-1,1]){
    const face=new THREE.Group();c.add(face);face.position.x=side*.163;face.rotation.y=side*Math.PI/2;
    for(let i=0;i<5;i++){
      const z=-.285+i*.107,xx=-side*z;
      pointed(k,face,xx,.046,0,.054,.157,glass);archLine(k,face,xx,.044,.003,.064,.169,ivory,.0022);k.box(face,.002,.105,.005,ivory,xx,.104,.006);
      k.mesh(face,new THREE.CircleGeometry(.022,32),glass,xx,.258,.001);k.mesh(face,new THREE.TorusGeometry(.025,.003,5,32),ivory,xx,.258,.005);
      k.box(c,.008,.288,.008,ivory,side*.170,.165,z+.053);
      const dormer=new THREE.Group();c.add(dormer);dormer.position.set(side*.128,.340,z);dormer.rotation.y=side*Math.PI/2;
      gable(k,dormer,.042,.024,.055,0,0,0,ivory);pointed(k,dormer,0,.004,.014,.014,.029,glass);k.cyl(dormer,0,.007,.022,ivory,0,.064,0,4);
    }
    for(const y of [.026,.313])k.box(c,.010,.008,.57,ivory,side*.174,y,-.073);
    k.box(c,.003,.002,.565,light,side*.180,.305,-.073);
  }
  for(let i=0;i<4;i++)k.box(c,.19,.006*(4-i),.024,p.stone,0,.003*(4-i),.348+i*.024);
}
function redHouse(k,g,p){
  const h=new THREE.Group();g.add(h);h.position.set(.38,.020,-.10);
  const {brick,ivory,iron,roof,glass,wood,light,stone}=p;
  k.box(h,.64,.020,.41,stone,0,.01,0);
  k.box(h,.59,.350,.25,brick,0,.198,-.065);
  for(let floor=0;floor<3;floor++){
    const y=.024+floor*.115;
    k.box(h,.64,.010,.41,ivory,0,y,0);
    for(const x of [-.285,-.146,0,.146,.285]){
      k.box(h,.027,.108,.065,brick,x,y+.058,.164);k.box(h,.034,.007,.072,ivory,x,y+.014,.166);k.box(h,.032,.006,.072,ivory,x,y+.105,.166);
      for(const xx of [-.012,.012])k.box(h,.002,.103,.003,ivory,x+xx,y+.059,.200);
    }
    for(const x of [-.215,-.073,.073,.215]){
      if(floor===0||floor===2)roundArch(k,h,x,y+.009,.164,.137,.104,.030,brick);
      if(floor===0||floor===2){const r=.050,pts=[];for(let i=0;i<=24;i++){const a=Math.PI-i/24*Math.PI;pts.push([x+Math.cos(a)*r,y+.060+Math.sin(a)*r,.184]);}k.line(h,pts,.0025,ivory);}
      if(floor>0)railing(k,h,x,y+.009,.200,.112,iron);
      k.box(h,.065,.070,.004,wood,x,y+.044,.064);k.box(h,.055,.062,.005,glass,x,y+.044,.067);
      for(const xx of [-.032,.032])k.box(h,.004,.075,.007,ivory,x+xx,y+.045,.070);
      k.box(h,.070,.004,.007,ivory,x,y+.083,.070);k.box(h,.002,.062,.007,ivory,x,y+.043,.073);
    }
    if(floor>0)for(const side of [-1,1]){const rail=new THREE.Group();h.add(rail);rail.position.set(side*.307,y+.009,0);rail.rotation.y=Math.PI/2;railing(k,rail,0,0,0,.34,iron);}
    k.box(h,.58,.002,.004,light,0,y+.105,.080);
  }
  k.box(h,.675,.018,.445,ivory,0,.374,0);gable(k,h,.68,.45,.085,0,.384,0,roof);
  for(const x of [-.215,.215]){
    k.box(h,.153,.069,.084,brick,x,.407,.154);gable(k,h,.174,.11,.061,x,.443,.163,roof);
    gable(k,h,.144,.006,.045,x,.443,.208,ivory);k.box(h,.078,.041,.004,wood,x,.423,.200);
    for(const dx of [-.029,0,.029])k.box(h,.005,.044,.006,ivory,x+dx,.423,.204);
  }
  for(let i=0;i<28;i++)k.box(h,.009,.012,.011,ivory,(i/27-.5)*.64,.365,.215);
  for(const side of [-1,1])for(let j=0;j<3;j++){const y=.067+j*.115;for(const z of [-.13,-.025]){const win=new THREE.Group();h.add(win);win.position.set(side*.299,y,z);win.rotation.y=side*Math.PI/2;k.box(win,.056,.067,.003,glass);for(const x of [-.030,.030])k.box(win,.003,.073,.006,ivory,x,0,.003);}}
}
export function shamian(k){
  const g=new THREE.Group(),stone=plaza(k,g,.86,.65,'#c0bfae');
  const wall=k.mat('#d5c18d',.88),ivory=k.mat('#e5e0cd',.85),roof=k.mat('#4e5b59',.91),brick=k.mat('#995f4d',.92),wood=k.mat('#4b3f37'),iron=k.mat('#3d4947',.7,.22),glass=k.mat('#50696c',.44,.12,'#e2c28e'),light=glow(k,'#e7c48f',.6);
  roof.userData.shamianRoof=true;glass.userData.night.intensity=.25;brickTexture(brick);
  for(const m of [wall,ivory,brick])m.userData.night={color:new THREE.Color('#ead0a5'),intensity:m===ivory?.14:.08};
  const p={stone,wall,ivory,roof,brick,wood,iron,glass,light};chapel(k,g,p);redHouse(k,g,p);
  const paving=k.mat('#b3b6a9',.94);k.box(g,1.48,.004,.115,paving,0,.016,.44);k.box(g,.10,.004,.88,paving,-.075,.016,-.07);
  for(let i=0;i<35;i++)k.box(g,.001,.001,.110,ivory,(i/34-.5)*1.46,.019,.44);
  for(const x of [-.73,-.18,.19,.68])tree(k,g,x,.013,.55,.19);
  for(const [x,z]of [[-.70,-.44],[.72,-.43],[-.20,-.49]])tree(k,g,x,.014,z,.16);
  for(const x of [-.68,-.13,.17,.65]){
    k.cyl(g,.0025,.0035,.088,iron,x,.057,.375,8);k.ball(g,.009,light,x,.105,.375);k.cyl(g,0,.014,.010,iron,x,.115,.375,10);
  }
  people(k,g,[[-.55,.44],[-.50,.45],[-.05,.28],[.23,.45],[.28,.44],[.55,.45]]);
  const model=k.merge(g);model.userData.shamian={chapel:[-.4,.018,-.08],redhouse:[.38,.020,-.10],streetY:.018};
  for(const [x,z]of [[-.40,.37],[.38,.30]]){const l=new THREE.SpotLight('#f7d7a1',0,1.2,.66,.8,2);l.position.set(x,.07,z+.10);l.target.position.set(x,.36,z-.18);l.userData.nightIntensity=.040;model.add(l,l.target);}
  return model;
}
