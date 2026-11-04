import * as THREE from 'three';
import {palette,site,sea,finish,railing,lit,TAU} from './tianjin-kit.js';

export function tianta(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.62,.62);sea(k,g,p,.60,.60);
 const concrete=lit(k,'#bdbbb1',.27,'#e6c58e'),joint=k.mat('#9c9d96',.94),rim=lit(k,'#c6c5ba',.32),dark=k.mat('#363e3e',.83),glass=lit(k,'#536c73',.11,'#7da5bb'),gold=lit(k,'#aa9875',.30),red=k.mat('#a54d42',.85);
 const paving=k.mat('#bfc0b5',.94),lawn=k.mat('#62845a',.98),edge=lit(k,'#d3ccb7',.64),blue=lit(k,'#8caaaf',.37,'#86b0db');paving.userData.tiantaPaving=true;concrete.userData.tiantaShaft=true;glass.userData.tiantaGlass=true;
 const lathe=(profile,mat)=>k.mesh(g,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),96),mat);
 const ring=(radius,y,tube,mat)=>{const o=k.mesh(g,new THREE.TorusGeometry(radius,tube,5,96),mat,0,y,0);o.rotation.x=Math.PI/2;return o;};
 const polar=(r,a,y)=>[Math.sin(a)*r,y,Math.cos(a)*r];
 // An island of concentric planted terraces, with two walkways to the lake shore.
 k.cyl(g,.237,.239,.024,paving,0,.032,0,96);
 for(let j=0;j<4;j++){const r=.209-j*.025,y=.058+j*.015;k.cyl(g,r,r,.015,paving,0,y-.0075,0,96);k.cyl(g,r-.004,r-.004,.0015,lawn,0,y+.00075,0,96);ring(r-.002,y+.001,.0012,p.pale);}
 for(const a of [0,-1.27,Math.PI/2,Math.PI]){
  const radial=new THREE.Group();radial.rotation.y=a;g.add(radial);
  for(let j=0;j<4;j++)k.box(radial,.027,.015*(j+1),j===3?.050:.028,paving,0,.044+.015*(j+1)/2,.215-j*.025);
 }
 for(const a of [0,-1.27]){
  const walkway=new THREE.Group();walkway.rotation.y=a;g.add(walkway);
  k.box(walkway,.071,.017,.353,paving,0,.0355,.4035);
  for(const x of [-.035,.035])railing(k,walkway,p,[[x,.044,.244],[x,.044,.566]],.017);
  for(const z of [.30,.45])for(const x of [-.027,.027])k.cyl(walkway,.006,.007,.024,p.stone,x,.015,z,8);
  k.box(walkway,.175,.025,.075,paving,0,.0315,.551);
  for(const x of [-.057,.057]){k.box(walkway,.036,.010,.027,p.stone,x,.049,.554);k.box(walkway,.032,.002,.023,lawn,x,.055,.554);}
 }
 // Low glazed entrance drum, shallow roof and the flared concrete shaft.
 k.cyl(g,.119,.122,.004,paving,0,.104,0,80);k.cyl(g,.106,.111,.043,glass,0,.1275,0,80);
 for(let i=0;i<48;i++){const a=i/48*TAU;k.beam(g,polar(.112,a,.107),polar(.107,a,.149),.0009,p.pale,4);}
 k.cyl(g,.113,.117,.007,rim,0,.153,0,80);ring(.114,.151,.0018,edge);
 const shaftR=t=>.027+.031*(1-t)**2.4,profile=Array.from({length:61},(_,j)=>[shaftR(j/60),.156+j*.826/60]);lathe(profile,concrete);
 for(let j=1;j<39;j++){const t=j/39;ring(shaftR(t)+.00012,.156+t*.826,.00018,joint);}
 for(let i=0;i<24;i++){const a=i/24*TAU;k.line(g,profile.map(([r,y])=>polar(r+.00012,a,y)),.00014,joint);}
 // Observation levels follow the actual inverted-cone glass profile; the broad
 // pale roof is a separate upper shell rather than a stack of equal discs.
 lathe([[.028,.978],[.034,.982],[.037,.986],[.037,1.001],[.032,1.005]],rim);
 k.cyl(g,.036,.036,.011,glass,0,.993,0,80);ring(.037,.986,.0008,blue);
 lathe([[.031,1.005],[.045,1.015],[.047,1.026]],concrete);
 lathe([[.047,1.026],[.057,1.041],[.064,1.055],[.075,1.078],[.079,1.087]],glass);
 for(let i=0;i<60;i++){const a=i/60*TAU;k.line(g,[[.047,1.026],[.057,1.041],[.064,1.055],[.075,1.078],[.079,1.087]].map(([r,y])=>polar(r+.0006,a,y)),.00065,rim);}
 for(const [r,y]of [[.051,1.033],[.058,1.044],[.066,1.059],[.072,1.072],[.080,1.087]])ring(r,y,.0010,dark);
 lathe([[.079,1.088],[.098,1.105],[.102,1.122],[.101,1.128]],rim);
 for(let i=0;i<64;i++){const a=i/64*TAU;k.beam(g,polar(.0796,a,1.089),polar(.1025,a,1.123),.00035,joint,4);}
 ring(.102,1.126,.0017,dark);ring(.101,1.129,.0011,edge);
 lathe([[.101,1.13],[.092,1.139],[.065,1.150],[.046,1.171],[.036,1.181]],rim);
 for(let i=0;i<40;i++){const a=i/40*TAU;k.line(g,[[.100,1.131],[.091,1.140],[.064,1.151],[.045,1.172],[.036,1.182]].map(([r,y])=>polar(r,a,y)),.00038,joint);}
 ring(.064,1.151,.0008,dark);ring(.045,1.172,.0007,dark);
 k.cyl(g,.024,.030,.038,gold,0,1.201,0,40);ring(.030,1.182,.0012,edge);ring(.024,1.220,.001,edge);
 // Service lattice, pale antenna arrays and alternating red/white broadcast mast.
 for(const x of [-.010,.010])for(const z of [-.010,.010])k.beam(g,[x,1.22,z],[x*.78,1.35,z*.78],.0017,gold,6);
 for(let j=0;j<9;j++){const y=1.225+j*.014;for(const side of [-1,1]){k.beam(g,[-.010,y,side*.010],[.010,y+.014,side*.010],.0006,joint,4);k.beam(g,[side*.010,y,-.010],[side*.010,y+.014,.010],.0006,joint,4);}}
 k.box(g,.021,.079,.021,p.pale,0,1.391,0);
 for(let j=0;j<7;j++)for(const side of [-1,1]){k.box(g,.022,.002,.002,joint,0,1.357+j*.011,side*.011);k.box(g,.002,.002,.022,joint,side*.011,1.357+j*.011,0);}
 for(let j=0;j<10;j++){const y=1.430+j*.022,r=.0048-j*.00031;k.cyl(g,r-.00015,r,.022,j%2?red:p.pale,0,y+.011,0,12);}
 for(const y of [1.35,1.433,1.52])ring(y>1.45?.007:.015,y,.0009,rim);
 k.cyl(g,.0005,.0016,.035,p.pale,0,1.6675,0,8);
 const tip=lit(k,'#a64e40',.48,'#e48e75');k.ball(g,.0018,tip,0,1.683,0);
 return finish(k,g,{lamps:[[-.025,.044,.34],[.025,.044,.50]],visitors:[[.016,.044,.42],[-.015,.044,.51],[.15,.045,.15]]});
}
