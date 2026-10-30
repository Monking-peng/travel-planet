import * as THREE from 'three';
import {skin,glow,plaza,palm,bollards,people} from './shenzhen-forms.js';

export function pingan(k){
  const g=new THREE.Group(),glass=k.glass('#788c94','#efdfbb',211),steel=k.mat('#c3c8c5',.36,.65),crown=k.mat('#374b55',.38,.42),light=glow(k,'#dceaf2',1.05);
  glass.userData.night.intensity=.80;plaza(k,g,.34,.30);
  k.box(g,.40,.071,.27,glass,0,.05,.04);k.box(g,.35,.022,.25,steel,0,.096,.04);
  const oct=[[-1,-.62],[-.62,-1],[.62,-1],[1,-.62],[1,.62],[.62,1],[-.62,1],[-1,.62]];
  const bands=[[.085,.145],[.19,.122],[.78,.112],[1.07,.092],[1.18,.043],[1.23,.012]];
  const interp=t=>{const y=.085+t*1.145;let j=0;while(j<bands.length-2&&y>bands[j+1][0])j++;const a=bands[j],b=bands[j+1];return [y,a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0])];};
  const at=(u,t)=>{const v=u*8,i=Math.min(7,Math.floor(v)),a=oct[i],b=oct[(i+1)%8],[y,r]=interp(t),s=v-i;return [(a[0]+(b[0]-a[0])*s)*r,y,(a[1]+(b[1]-a[1])*s)*r];};
  skin(k,g,at,70,80,glass);
  for(let edge=0;edge<8;edge++){
    const pts=Array.from({length:50},(_,i)=>at(edge/8,i/49));k.line(g,pts,edge%2?.004:.006,steel);
    const outside=(u,t,offset)=>{const p=at(u,t),r=Math.hypot(p[0],p[2]);return [p[0]*(1+offset/r),p[1],p[2]*(1+offset/r)];};
    k.line(g,Array.from({length:20},(_,i)=>outside(edge/8,.50+i*.45/19,.0065)),.0015,light);
    for(let f=1;f<=7;f++){
      k.line(g,Array.from({length:40},(_,i)=>at((edge+f/8)/8,i/39)),.0007,steel);
      if(edge%2===0)k.line(g,Array.from({length:25},(_,i)=>outside((edge+f/8)/8,.50+i*.44/24,.0014)),.0009,light);
    }
  }
  for(const t of [.17,.39,.60,.85])k.line(g,Array.from({length:81},(_,i)=>at(i/80,t)),.002,steel,true);
  for(let face=0;face<4;face++){const roof=new THREE.Group();roof.rotation.y=face*Math.PI/2;g.add(roof);k.beam(roof,[-.056,1.151,.044],[0,1.23,.012],.004,steel);k.beam(roof,[.056,1.151,.044],[0,1.23,.012],.004,steel);k.box(roof,.036,.006,.022,crown,0,1.224,.008);}
  for(let i=0;i<7;i++)k.box(g,.003,.054,.009,steel,(i-3)*.047,.052,.179);
  for(const x of [-.26,.26])for(const z of [-.18,.18])palm(k,g,x,.012,z,.115);
  bollards(k,g,[[-.28,.24],[.28,.24],[-.28,-.22],[.28,-.22]]);people(k,g,[[.20,.20],[-.10,.22],[-.18,.20],[.14,-.21]]);
  return k.merge(g);
}

export function bamboo(k){
  const g=new THREE.Group(),glass=k.glass('#75909b','#d1e1ec',227),steel=k.mat('#d0d4cd',.43,.50),light=glow(k,'#d6e8ef',.70),dark=k.mat('#425b64');glass.userData.night.intensity=.65;
  plaza(k,g,.32,.31);
  const radius=t=>.134*Math.pow(Math.max(0,1-t*t),.65)+.005;
  const point=(a,t,radd=0)=>[Math.cos(a)*(radius(t)+radd),.025+t*.89,Math.sin(a)*(radius(t)+radd)];
  skin(k,g,(u,t)=>point(u*Math.PI*2,t),70,112,glass);
  for(let i=0;i<56;i++){
    const a=i/56*Math.PI*2;k.line(g,Array.from({length:45},(_,j)=>point(a,j/44,.001)),.0018,steel);
    if(i%4===0)k.line(g,Array.from({length:20},(_,j)=>point(a,.68+j*.31/19,.003)),.0011,light);
  }
  for(const [lo,hi,step] of [[0,.18,2],[.67,.99,2]])for(let i=0;i<56;i+=step)for(const dir of [-1,1]){
    const pts=[];for(let j=0;j<=12;j++){const t=j/12;pts.push(point((i+dir*2*t)/56*Math.PI*2,lo+(hi-lo)*t,.002));}k.line(g,pts,.0021,steel);
  }
  for(const t of [.18,.40,.65])k.line(g,Array.from({length:113},(_,i)=>point(i/112*Math.PI*2,t)),.0015,steel,true);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const d=k.box(g,.024,.035,.003,dark,Math.cos(a)*.136,.04,Math.sin(a)*.136);d.rotation.y=Math.PI/2-a;}
  const garden=k.mat('#7c945e',.95);for(const x of [-.23,.23]){const bed=k.cyl(g,.062,.062,.012,garden,x,.019,.12,36);bed.scale.z=.7;palm(k,g,x,.026,.12,.11);}
  bollards(k,g,[[-.24,-.19],[.24,-.19],[-.24,.22],[.24,.22]]);people(k,g,[[.12,.22],[.16,.22],[-.06,.23]]);
  return k.merge(g);
}

export function diwang(k){
  const g=new THREE.Group(),glass=k.glass('#4f9f9d','#c6e0d1',241),silver=k.mat('#c7d0c4',.49,.38),dark=k.mat('#3d686a'),rim=glow(k,'#c9eee4',.72);glass.userData.night.intensity=.7;plaza(k,g,.36,.30);
  k.box(g,.30,.72,.18,glass,0,.383,-.045);
  for(const x of [-.15,.15]){
    k.cyl(g,.045,.045,.74,glass,x,.394,-.045,32);k.cyl(g,.052,.052,.015,dark,x,.756,-.045,32);k.cyl(g,.031,.034,.050,glass,x,.790,-.045,32);k.cyl(g,.0015,.003,.13,silver,x,.879,-.045,10);
    const r=k.ring(g,.05,.002,rim,.762);r.position.set(x,.762,-.045);
  }
  for(let row=0;row<41;row++){const y=.041+row*.017;k.box(g,.294,.004,.183,silver,0,y,-.045);}
  k.box(g,.035,.47,.005,k.mat('#79c0c6',.37,.3),0,.502,.049);
  // The lower narrow wing is part of the same landmark, not an unrelated filler tower.
  k.box(g,.15,.43,.22,silver,.115,.23,.15);const wing=k.cyl(g,.047,.047,.43,glass,.115,.23,.262,32);wing.scale.x=1.12;
  for(let row=0;row<24;row++){k.box(g,.153,.005,.21,dark,.115,.03+row*.017,.147);}
  for(const x of [-.24,.26])palm(k,g,x,.015,-.20,.105);
  bollards(k,g,[[-.25,.21],[-.25,-.22],[.26,-.22]]);people(k,g,[[-.11,.22],[-.08,.24]]);
  return k.merge(g);
}

export function kk100(k){
  const g=new THREE.Group(),glass=k.glass('#547887','#bcddec',259),steel=k.mat('#bfcfd0',.36,.53),top=k.mat('#344e5a',.35,.35),edge=glow(k,'#bfdde9',.70);glass.userData.night.intensity=.8;plaza(k,g,.32,.29);
  // A gently tapering, rounded rectangular blade with a pointed curved crown.
  const point=(a,t)=>{const crown=t>.64?Math.pow(Math.max(0,1-((t-.64)/.36)**1.7),.88):1,cap=(1-.20*t)*crown,shape=v=>Math.sign(v)*Math.abs(v)**.42;return [shape(Math.cos(a))*.098*cap,.035+t*.995,shape(Math.sin(a))*.065*cap+.022*t*t];};
  skin(k,g,(u,t)=>point(u*Math.PI*2,t),80,72,glass);
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const pts=Array.from({length:51},(_,j)=>point(a,j/50));k.line(g,pts,.0009,steel);if(i%10===0)k.line(g,pts,.0019,edge);}
  for(let j=1;j<65;j++){const t=j/65;k.line(g,Array.from({length:73},(_,i)=>point(i/72*Math.PI*2,t)),.00065,steel,true);}
  for(const t of [.67,.76,.86])k.line(g,Array.from({length:73},(_,i)=>point(i/72*Math.PI*2,t)),.002,top,true);
  const podium=k.cyl(g,.23,.25,.057,glass,0,.039,0,56);podium.scale.z=.70;
  for(let i=0;i<3;i++){const r=k.ring(g,.24-i*.008,.002,steel,.045+i*.012);r.scale.y=.70;}
  for(const x of [-.25,.25])palm(k,g,x,.015,.11,.12);bollards(k,g,[[-.24,-.18],[.24,-.18],[-.24,.22],[.24,.22]]);
  people(k,g,[[.07,.22],[-.08,.21],[-.11,.20]]);return k.merge(g);
}
