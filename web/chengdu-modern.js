import * as THREE from 'three';
import {TAU,palette,site,paving,grove,skin,glow,glazing,sign,finish} from './chengdu-kit.js';

function ellipsoid(k,g,r,material,x,y,z,sx,sy,sz){const o=k.mesh(g,new THREE.IcosahedronGeometry(r,2),material,x,y,z);o.scale.set(sx,sy,sz);return o;}
export function ifs(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.68,.57);paving(k,g,p,.53,.43);
 const stone=k.mat('#a9a69a',.83),dark=k.mat('#303d42',.53,.22),white=k.mat('#e8e5d8',.62),black=k.mat('#242e32',.69);
 k.box(g,.87,.35,.38,stone,0,.198,-.06);
 glazing(k,g,p,.82,.09,.39,0,.083,-.06);
 for(const side of [-1,1])glazing(k,g,p,.23,.23,.41,side*.30,.266,-.06);
 // Separate warm ground-floor shop fronts, horizontal stone courses and the IFS sign.
 const shop=glow(k,'#e7b970',.65,.9,.33);
 for(let i=0;i<5;i++){const x=-.34+i*.17;k.box(g,.145,.103,.012,i%2?dark:shop,x,.10,.149);k.box(g,.14,.007,.06,dark,x,.16,.166);for(let j=0;j<4;j++)k.box(g,.003,.10,.016,p.gold,x-.063+j*.042,.10,.159);}
 for(let i=0;i<8;i++)k.box(g,.88,.003,.004,p.stone,0,.19+i*.027,.135);
 k.box(g,.22,.31,.02,p.pale,.294,.261,.163);sign(k,g,'IFS',.19,.09,.294,.274,.175);sign(k,g,'国际金融中心',.19,.035,.294,.208,.175);
 // The sculpture clings to the facade. Head and forepaws clear the parapet;
 // the black hind legs hang below its white back rather than standing on a roof.
 const body=ellipsoid(k,g,.094,white,-.05,.326,.18,.77,1.31,.60);body.rotation.z=-.12;
 ellipsoid(k,g,.063,black,-.054,.411,.194,1.13,.72,.86);
 ellipsoid(k,g,.061,white,-.043,.459,.164,1.05,.87,.92);
 for(const side of [-1,1]){
  const ear=ellipsoid(k,g,.019,black,-.043+side*.047,.492,.164,1,.92,.65);ear.rotation.z=side*.2;
  const arm=ellipsoid(k,g,.025,black,-.052+side*.065,.414,.154,.58,1.18,1.35);arm.rotation.z=side*.38;
  const leg=ellipsoid(k,g,.033,black,-.045+side*.051,.254,.190,.70,1.31,.70);leg.rotation.z=side*.34;
 }
 ellipsoid(k,g,.013,white,-.046,.452,.107,1.8,.74,1);ellipsoid(k,g,.007,black,-.045,.452,.096,1.3,.65,.67);
 // A restrained pair of the real glass office towers gives the podium its context.
 for(const [x,w,h,z]of [[-.27,.22,.61,-.21],[.22,.26,.72,-.22]]){
  glazing(k,g,p,w,h,.20,x,.375+h/2,z);k.box(g,w+.014,.018,.214,p.stone,x,.382+h,z);
  for(const side of [-1,1])for(let j=0;j<5;j++)k.box(g,.003,h,.003,p.pale,x-w/2+j*w/4,.375+h/2,z+side*.102);
 }
 for(let i=0;i<5;i++)k.box(g,.80,.001,.002,p.stone,0,.022,.24+i*.026);
 grove(k,g,height,[[-.53,-.23,.12],[.52,-.23,.13]]);
 return finish(k,g,{lamps:[[-.43,.31],[.43,.31]],visitors:[[-.32,.27],[-.22,.31],[-.12,.28],[.04,.32],[.13,.24],[.27,.32],[.35,.25]]});
}

export function pandaTower(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.57,.54);paving(k,g,p,.36,.34);
 const copper=k.mat('#b65d31',.59,.27),bronze=k.mat('#c9a457',.57,.30),floor=k.mat('#969f9d',.7,.24),glass=k.mat('#687775',.72,.15),warm=glow(k,'#e4aa65',.63,.6,.34);
 function radius(y,a){const t=(y-.10)/.99;return (.235-.115*t)*(1+.14*Math.cos(3*a))*(.91+.09*Math.cos(TAU*t*10));}
 // Eleven exposed decks; the fins omit a front wedge so the balconies stay visible.
 k.cyl(g,.055,.060,1.0,glass,0,.59,-.047,48);
 for(let j=0;j<11;j++){
  const y=.10+j*.091,r=.213-j*.0102;k.cyl(g,r,r,.009,floor,0,y,0,64);
  for(const side of [-1,1])k.beam(g,[side*r*.82,y+.007,.045],[side*r*.60,y+.086,.045],.003,bronze);
  const pts=Array.from({length:49},(_,i)=>{const a=-.66+i/48*1.32;return [r*Math.sin(a),y+.034,r*Math.cos(a)];});k.line(g,pts,.0018,floor);
  for(let i=0;i<=12;i++){const a=-.66+i/12*1.32;k.cyl(g,.0012,.0012,.030,floor,r*Math.sin(a),y+.019,r*Math.cos(a),5);}
  k.line(g,Array.from({length:25},(_,i)=>{const a=-.66+i/24*1.32;return [r*Math.sin(a),y-.001,r*Math.cos(a)];}),.002,warm);
 }
 for(let i=0;i<=118;i++){
  const a=.61+i/118*(TAU-1.22),pts=[];
  for(let j=0;j<=110;j++){const y=.105+j/110*.998,r=radius(y,a);pts.push([r*Math.sin(a),y,r*Math.cos(a)]);}
  k.line(g,pts,.0025,i%4?copper:bronze);
 }
 // Three high petal tips are separate from the eleven regular floor edges.
 for(let i=0;i<3;i++){const a=Math.PI/3+i*TAU/3,pts=[];for(let j=0;j<=14;j++){const t=j/14,r=.112*(1-.40*t);pts.push([r*Math.sin(a),1.035+t*.20,r*Math.cos(a)]);}k.line(g,pts,.004,bronze);}
 for(const a of [-.61,.61]){const pts=[];for(let j=0;j<=48;j++){const y=.10+j/48*1.0,r=radius(y,a);pts.push([r*Math.sin(a),y,r*Math.cos(a)]);}k.line(g,pts,.005,bronze);}
 const base=k.cyl(g,.29,.34,.065,p.pale,0,.054,0,96);base.userData.towerBase=true;
 // Recessed dark entry and flared stairs in the pale pedestal.
 k.box(g,.10,.04,.012,p.wood,0,.045,.313);for(let i=0;i<7;i++)k.box(g,.16,.004*(i+1),.018,p.stone,0,.025+.002*i,.42-i*.016);
 grove(k,g,height,[[-.38,-.13,.15],[.37,-.17,.16],[-.23,-.39,.14],[.19,-.40,.15]]);
 return finish(k,g,{lamps:[[-.27,.25],[.27,.25]],visitors:[[-.09,.34],[.10,.36]]});
}

export function tianfu(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.74,.67);p.water.color.set('#607d7b');p.water.roughness=.25;
 // The exhibition hall emerges from a reflecting pool, under five generous petals.
 skin(k,g,(u,v)=>{const a=u*TAU,r=v*.60;return [Math.sin(a)*r,.020,Math.cos(a)*r];},36,160,p.water);
 const glass=k.mat('#8fa39c',.33,.26),frame=k.mat('#788c88',.5,.3),roofMat=k.mat('#deded0',.58,.27),soffit=k.mat('#b39462',.85),rim=glow(k,'#e8d4ad',.53,.3,.37);
 glass.userData.night={color:new THREE.Color('#e6c698'),intensity:.27};soffit.userData.night={color:new THREE.Color('#e3bd80'),intensity:.23};
 function roofPoint(u,v,under=0){const a=u*TAU,petal=(1+Math.cos(5*a))/2,r=(.105+v*(.36+.11*petal));return [Math.sin(a)*r,.205+v*(.045+.205*petal)+.018*Math.sin(v*Math.PI)-under,Math.cos(a)*r];}
 skin(k,g,(u,v)=>roofPoint(u,v),30,240,roofMat);skin(k,g,(u,v)=>roofPoint(u,v,.008),30,240,soffit);
 roofMat.userData.preserveSmooth=true;soffit.userData.preserveSmooth=true;
 k.line(g,Array.from({length:240},(_,i)=>roofPoint(i/240,1,.003)),.003,rim,true);
 k.cyl(g,.104,.104,.014,roofMat,0,.204,0,64);
 for(let j=1;j<=16;j++)k.line(g,Array.from({length:240},(_,i)=>roofPoint(i/240,j/16,.010)),.00065,soffit,true);
 for(let i=0;i<60;i++)k.line(g,Array.from({length:16},(_,j)=>roofPoint(i/60,j/15)),.00065,frame);
 function wallPoint(a,y){const r=.225+.035*Math.cos(5*a);return [Math.sin(a)*r,.027+y*.184,Math.cos(a)*r];}
 skin(k,g,(u,v)=>wallPoint(u*TAU,v),8,160,glass);
 for(let i=0;i<56;i++){const a=i/56*TAU;k.beam(g,wallPoint(a,0),wallPoint(a,1),.0013,frame,5);}
 for(let j=1;j<=3;j++)k.line(g,Array.from({length:160},(_,i)=>wallPoint(i/160*TAU,j/4)),.0011,frame,true);
 for(const side of [-1,1]){k.box(g,.10,.008,.27,p.pale,side*.36,.027,.27);for(let i=0;i<6;i++)k.box(g,.105,.002,.001,p.stone,side*.36,.032,.16+i*.04);}
 grove(k,g,height,[[-.57,-.20,.12],[.57,-.20,.12],[-.32,-.52,.13],[.34,-.52,.13]]);
 return finish(k,g,{lamps:[[-.36,.42],[.36,.42]],visitors:[[-.36,.30],[-.36,.37],[.36,.31]]});
}
