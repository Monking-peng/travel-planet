import * as THREE from 'three';
import {palette,site,skin,disc,ellipse,band,palms,lit,smoothRock,steps,roof,finish,TAU} from './sanya-kit.js';
import {tree} from './wuhan-architecture.js';
export function lovers(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p,{sea:true});disc(k,g,.57,.27,.035,p.sand,0,.25);
 smoothRock(k,g,p,{x:0,y:.033,z:-.32,rx:.19,ry:.046,rz:.17,seed:2});
 const deck=.118;for(let i=0;i<38;i++){const z=.41-i*.020;k.box(g,.155,.012,.018,p.red,0,deck,z);}
 for(const z of [-.30,-.12,.08,.28])for(const x of [-.062,.062])k.cyl(g,.011,.016,.092,p.stone,x,.070,z,10);
 const warm=lit(k,'#b68e56',.45,.2);for(const x of [-.075,.075]){
  k.box(g,.009,.009,.77,p.red,x,deck+.070,.05);k.box(g,.007,.007,.77,p.red,x,deck+.018,.05);
  for(let i=0;i<=19;i++){const z=.43-i*.04;k.box(g,.007,.082,.007,p.red,x,deck+.036,z);}
  for(let i=0;i<9;i++){const z=.39-i*.080;const points=Array.from({length:65},(_,j)=>{const a=j/64*TAU,yy=(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/32,zz=16*Math.sin(a)**3/32;return [x,deck+.040+yy*.047,z+zz*.047];});k.line(g,points,.0018,p.red,true);}
  k.line(g,[[x,deck+.005,-.34],[x,deck+.005,.43]],.0016,warm);
 }
 // The red timber bridge terminates at a two-eaved open sea pavilion.
 k.box(g,.27,.020,.25,p.pale,0,.126,-.34);for(const x of [-.108,.108])for(const z of [-.43,-.25]){k.cyl(g,.006,.007,.17,p.red,x,.22,z,10);}
 roof(k,g,p,.34,.31,.070,.305,0,-.34);roof(k,g,p,.23,.22,.070,.377,0,-.34);
 palms(k,g,p,h,[[-.45,.26,.26],[.43,.28,.27],[-.24,.43,.19],[.24,.43,.21]]);
 return finish(k,g,{visitors:[[-.035,.126,.14],[.028,.126,-.08]]});
}
export function dragon(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p),land=k.mat('#537454',.99);land.userData.landscape=true;
 const hills=(x,z)=>.022+(.49*Math.exp(-(((x+.50)/.25)**2)-(z/.43)**2)+.535*Math.exp(-(((x-.50)/.25)**2)-((z+.055)/.40)**2))*(1-THREE.MathUtils.smoothstep(Math.hypot(x/.72,z/.55),.70,1));
 skin(k,g,(u,v)=>{const a=u*TAU,r=v,x=Math.cos(a)*.72*r,z=Math.sin(a)*.55*r;return [x,h(x,z)+hills(x,z)-.022,z];},36,112,land);
 // The bridge sags across a real low valley, instead of lying on solid ground.
 const deck=t=>[(-.50+t)*1.12,.385-.126*Math.sin(Math.PI*t)+t*.035,.015-.055*t];
 const timber=k.mat('#8a7356',.95);timber.userData.suspensionDeck=true;const rope=lit(k,'#b6ac8c',.10),light=lit(k,'#c5b68e',.55,.6,'#f2cf97');
 for(let i=0;i<60;i++){const t=(i+.5)/60,q=deck(t),next=deck(Math.min(1,t+.002)),o=k.box(g,1.12/60-.0015,.006,.102,timber,...q);o.rotation.z=Math.atan2(next[1]-q[1],next[0]-q[0]);}
 for(const side of [-1,1]){
  const pts=Array.from({length:61},(_,j)=>{const q=deck(j/60);return [q[0],q[1]+.075,q[2]+side*.060];});k.line(g,pts,.003,rope);
  k.line(g,pts.map(q=>[q[0],q[1]-.075,q[2]]),.0025,p.wood);k.line(g,pts.map(q=>[q[0],q[1]-.015,q[2]]),.001,light);
  for(let j=0;j<60;j++){const a=deck(j/60),b=deck((j+1)/60);k.beam(g,[a[0],a[1]+.073,a[2]+side*.06],[b[0],b[1],b[2]+side*.06],.0008,rope);k.beam(g,[a[0],a[1],a[2]+side*.06],[b[0],b[1]+.073,b[2]+side*.06],.0008,rope);}
 }
 for(const t of [0,1]){const q=deck(t);k.box(g,.14,.035,.19,p.stone,q[0],q[1]-.020,q[2]);for(const z of [-.08,.08])k.beam(g,[q[0],q[1]-.035,q[2]+z],[q[0],q[1]+.105,q[2]+z],.008,p.wood);}
 for(let i=0;i<54;i++){const a=i*2.399,r=Math.sqrt((i+.5)/54),x=Math.cos(a)*.69*r,z=Math.sin(a)*.49*r;if(Math.abs(z)<.10)continue;tree(k,g,x,h(x,z)+hills(x,z)-.022,z,.13+(i%4)*.016);}
 return finish(k,g);
}
