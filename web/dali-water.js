import * as THREE from 'three';
import {palette,site,sea,disc,paving,steps,grove,roof,story,lit,sign,archOpening,railing,finish,TAU} from './dali-kit.js';
function pagoda(k,parent,p,x,z,small=false){
 const g=new THREE.Group();g.position.set(x,.034,z);parent.add(g);const n=small?8:4,levels=small?10:16,body=lit(k,'#cebea0',.13),ledge=lit(k,'#dbccb0',.20),dark=k.mat('#5c5544');
 let y=small?.13:.20;
 const column=(rt,rb,h,mat,yy)=>{const m=k.cyl(g,rt,rb,h,mat,0,yy,0,n);m.rotation.y=Math.PI/n;return m;};
 const r=small?.078:.112;column(r,r*1.04,y,body,y/2);column(r*1.15,r*1.18,.017,p.stone,.008);
 for(let j=0;j<levels;j++){const f=j/(levels-1),rr=r*(1-.66*f),hh=(small?.043:.049)*(1-.40*f);column(rr,rr*1.03,hh,body,y+hh/2);column(rr*1.23,rr*1.28,.008,ledge,y+hh+.004);column(rr*1.13,rr*1.23,.009,ledge,y+hh+.0125);
  for(let i=0;i<n;i++){const a=i/n*TAU,face=n===4?rr*.707:rr*Math.cos(Math.PI/8);const window=k.box(g,rr*.32,hh*.53,.002,dark,Math.sin(a)*face,y+hh*.47,Math.cos(a)*face+.0001);window.rotation.y=a;}
  y+=hh+.017;
 }
 column(.008,.015,.038,p.gold,y+.018);k.ball(g,.009,p.gold,0,y+.046,0);
 if(!small)sign(k,g,'永镇山川',.087,.026,0,.12,r*.708+.002,{background:'#c5b99c',color:'#655d43'});
 return g;
}
export function pagodas(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.77,.65);paving(k,g,p,.61,.51);
 pagoda(k,g,p,0,.03);pagoda(k,g,p,-.31,-.21,true);pagoda(k,g,p,.31,-.21,true);
 disc(k,g,.33,.15,.028,p.water,0,.35);for(const s of [-1,1]){railing(k,g,p,[[s*.35,.025,.23],[s*.35,.025,.46]],.023);grove(k,g,height,[[s*.55,-.23,.20],[s*.51,.20,.16],[s*.34,-.43,.14]]);}
 return finish(k,g,{lamps:[[-.18,.024,.17],[.18,.024,.17]],visitors:[[-.42,.025,.18],[.42,.025,.27]]});
}
export function putuo(k){
 const g=new THREE.Group(),p=palette(k);p.red=k.mat('#526e7b',.92);p.wood=k.mat('#3e4d50',.93);site(k,g,.72,.62);sea(k,g,p,.71,.61);
 const stone=k.mat('#797d6e',.99),island=k.mesh(g,new THREE.CylinderGeometry(.29,.36,.11,29),stone,0,.082,0);island.scale.z=.73;
 for(let j=0;j<28;j++){const a=j/28*TAU,rr=.31+.017*Math.sin(j*5);const b=k.mesh(g,new THREE.DodecahedronGeometry(.039,0),p.stone,Math.sin(a)*rr,.056+Math.sin(j*3)**2*.015,Math.cos(a)*rr*.75);b.scale.set(1.3,.80,1.1);}
 k.box(g,.26,.18,.22,p.wall,0,.224,-.015);for(const x of [-.14,.14])k.cyl(g,.006,.008,.21,p.wood,x,.235,.105,8);
 const arch=archOpening(k,g,p.blue,{w:.13,h:.15,opening:.073,rise:.10,d:.010,y:.134,z:.099});arch.position.z=.101;
 roof(k,g,p,.36,.33,.09,.324,0,-.015);story(k,g,p,{w:.23,d:.23,h:.14,y:.388,z:-.015});
 for(const x of [-.18,.18]){k.cyl(g,.006,.008,.18,p.wood,x,.21,-.08);k.ball(g,.065,p.leaf,x,.32,-.08);}
 k.box(g,.14,.014,.12,p.stone,.25,.055,.11);steps(k,g,p,.21,.16,.12,4,.078,.10);railing(k,g,p,[[-.25,.14,.17],[.14,.14,.17]],.027);
 for(let i=0;i<7;i++){const x=-.48+i*.14,y=.42+Math.sin(i*2)*.04,z=.35;k.line(g,[[x-.018,y,z],[x,y-.005,z+.002],[x+.018,y,z]],.0015,p.pale);}
 return finish(k,g,{lamps:[[-.15,.14,.14],[.13,.14,.15]],visitors:[[-.08,.14,.15],[.26,.064,.12]]});
}
export function xingsheng(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.83,.57);sea(k,g,p,.82,.56);const white=lit(k,'#d3d1bd',.13),trim=lit(k,'#bdbda8',.25);
 for(const z of [-.115,.115])for(let i=0;i<3;i++){const x=(i-1)*.42;archOpening(k,g,white,{w:.44,h:.20,opening:.34,rise:.18,d:.052,x,y:.04,z});const pts=Array.from({length:41},(_,j)=>{const a=j/40*Math.PI;return [x+Math.cos(a)*.178,.04+.01+Math.sin(a)*.178,z+.030];});k.line(g,pts,.004,trim);}
 k.box(g,1.36,.023,.29,p.stone,0,.25,0);k.box(g,1.34,.008,.18,k.mat('#778078'),0,.266,0);for(const z of [-.14,.14])railing(k,g,p,[[-.66,.265,z],[.66,.265,z]],.042);
 for(const x of [-.21,.21])for(const z of [-.15,.15]){
  k.box(g,.095,.048,.09,white,x,.29,z);k.box(g,.075,.19,.071,white,x,.40,z);
  for(const s of [-1,1]){k.box(g,.042,.126,.004,p.blue,x,.408,z+s*.036);for(const sx of [-1,1])k.box(g,.010,.16,.009,trim,x+sx*.031,.407,z+s*.037);}
  k.box(g,.100,.016,.10,trim,x,.505,z);k.box(g,.076,.03,.074,white,x,.528,z);k.mesh(g,new THREE.ConeGeometry(.061,.043,4),white,x,.562,z).rotation.y=Math.PI/4;k.cyl(g,.002,.003,.035,p.gold,x,.599,z,8);k.ball(g,.004,p.gold,x,.619,z);
 }
 for(const x of [-.70,.70])k.box(g,.16,.23,.40,p.stone,x,.145,0);
 for(const x of [-.53,0,.53])for(const z of [-.157,.157]){k.cyl(g,.0025,.004,.10,p.wood,x,.32,z,8);k.ball(g,.006,p.warm,x,.373,z);}
 return finish(k,g,{visitors:[[-.50,.272,.10],[.50,.272,.10]]});
}
