import * as THREE from 'three';
import {skin,plaza,bollards,people,glow} from './shenzhen-forms.js';
import {tree} from './wuhan-architecture.js';

export function canton(k){
  const g=new THREE.Group(),stone=plaza(k,g,.49,.46),steel=k.mat('#b6c3c5',.43,.37),dark=k.glass('#496b77','#d5d9ed',71),rib=k.mat('#acb8bd',.45,.3,'#af8ddd');
  rib.userData.night.intensity=1.4;rib.userData.spectrum=true;
  // A ruled lattice connects two differently oriented ellipses; the waist is structural, not a solid cone.
  const point=(a,t)=>{const twist=Math.PI*.75;return [(1-t)*.146*Math.cos(a)+t*.103*Math.cos(a+twist),.024+1.42*t,(1-t)*.114*Math.sin(a)+t*.087*Math.sin(a+twist)];};
  k.cyl(g,.034,.043,1.35,dark,0,.70,0,32);
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2;k.line(g,Array.from({length:35},(_,j)=>point(a,j/34)),.0034,rib);
    for(let j=0;j<45;j++)k.beam(g,point(a,j/45),point(a+Math.PI*2/24,(j+1)/45),.0009,steel,4);
  }
  for(let row=0;row<46;row++)k.line(g,Array.from({length:73},(_,i)=>point(i/72*Math.PI*2,row/45)),.0017,rib,true);
  for(const t of [.10,.27,.72,.89,.96]){const p=point(0,t),radius=Math.hypot(p[0],p[2]);k.cyl(g,radius*.84,radius*.84,.018,dark,0,.024+1.42*t,0,48);}
  k.cyl(g,.073,.080,.020,steel,0,1.451,0,48);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const pod=k.ball(g,.010,dark,Math.cos(a)*.080,1.467+Math.cos(a)*.012,Math.sin(a)*.066);pod.scale.y=1.25;}
  k.cyl(g,.009,.018,.29,steel,0,1.60,0,16);k.cyl(g,.0015,.007,.13,rib,0,1.80,0,12);
  for(let y=1.48;y<1.77;y+=.04){const r=.020-(y-1.48)*.034;k.ring(g,r,.0017,rib,y);}
  k.cyl(g,.18,.22,.021,stone,0,.027,0,48);
  for(const a of [-.8,.4,2.5])tree(k,g,Math.cos(a)*.38,.014,Math.sin(a)*.34,.11);
  bollards(k,g,[[-.27,.30],[.27,.30],[-.38,-.10],[.37,-.10]]);people(k,g,[[-.12,.25],[-.08,.27],[.15,.28],[.21,.18]]);
  return k.merge(g);
}

function trianglePoint(a,y){const r=.158*(1-.16*y+.055*Math.sin(y*Math.PI));return [Math.cos(a)*(r+.015*Math.cos(3*a)),Math.sin(a)*(r+.015*Math.cos(3*a))];}
export function twins(k){
  const g=new THREE.Group(),base=plaza(k,g,.64,.46),white=k.mat('#c6d0cb',.5,.28),blue=k.glass('#66818a','#d7e4f0',23),dark=k.glass('#486875','#f1d8a3',29),line=k.mat('#84999e',.4,.3),gold=glow(k,'#dfbd76',.85,1,.50),crown=glow(k,'#bec9ed',.88,0,.39);
  const x=-.31,h=1.31;
  skin(k,g,(u,v)=>{const q=trianglePoint(u*Math.PI*2,v);return [x+q[0],.025+h*v,q[1]];},50,90,dark);
  for(let row=0;row<65;row++){const v=row/65;k.line(g,Array.from({length:91},(_,i)=>{const q=trianglePoint(i/90*Math.PI*2,v);return [x+q[0],.025+h*v,q[1]];}),.00065,line,true);}
  for(let i=0;i<18;i++)for(const dir of [-1,1])k.line(g,Array.from({length:90},(_,j)=>{const v=j/89,a=i/18*Math.PI*2+dir*v*2.3,q=trianglePoint(a,v);return [x+q[0]*1.004,.025+h*v,q[1]*1.004];}),.0013,line);
  for(const v of [.34,.58,.84,.995])k.line(g,Array.from({length:91},(_,i)=>{const q=trianglePoint(i/90*Math.PI*2,v);return [x+q[0],.025+h*v,q[1]];}),.0022,gold,true);
  k.cyl(g,.119,.119,.008,line,x,1.341,0,3).rotation.y=Math.PI/6;
  // East tower steps back in four occupied volumes; pale terracotta fins continue to each crown.
  const segments=[{x:.26,z:0,w:.28,d:.26,h:1.10},{x:.29,z:-.022,w:.235,d:.22,h:1.40},{x:.31,z:-.040,w:.19,d:.18,h:1.58},{x:.32,z:-.048,w:.146,d:.135,h:1.635}];
  for(const b of segments){k.box(g,b.w,b.h,b.d,blue,b.x,.025+b.h/2,b.z);for(const side of [-1,1]){for(let i=0;i<=Math.round(b.w/.012);i++)k.box(g,.0015,b.h,.003,white,b.x+(i/Math.round(b.w/.012)-.5)*b.w,.025+b.h/2,b.z+side*(b.d/2+.001));for(let i=0;i<=Math.round(b.d/.012);i++)k.box(g,.003,b.h,.0015,white,b.x+side*(b.w/2+.001),.025+b.h/2,b.z+(i/Math.round(b.d/.012)-.5)*b.d);k.box(g,b.w,.004,.003,crown,b.x,.026+b.h,b.z+side*b.d/2);}k.box(g,b.w,.003,b.d,white,b.x,.026+b.h,b.z);}
  k.box(g,.90,.075,.20,line,.02,.055,-.25);k.box(g,.92,.008,.22,white,.02,.096,-.25);
  for(let i=0;i<6;i++)k.box(g,.010,.003,.40,base,-.10+i*.035,.020,.19);
  for(const [tx,tz]of [[-.49,.29],[.49,.26],[-.52,-.24],[.50,-.24]])tree(k,g,tx,.014,tz,.075);
  bollards(k,g,[[-.50,.32],[.50,.32],[0,.35]]);people(k,g,[[-.08,.24],[.03,.30],[.10,.32]]);
  return k.merge(g);
}

export function museum(k){
  const g=new THREE.Group(),base=plaza(k,g,.66,.53),gray=k.mat('#717d7e',.78,.22),seam=k.mat('#556566'),red=k.mat('#9c4050',.72,.14,'#b95954'),dark=k.glass('#334a52','#d2c8af',63);red.userData.night.intensity=.24;
  k.box(g,.50,.15,.36,dark,0,.10,0);for(const x of [-.22,.22])k.box(g,.058,.17,.30,gray,x,.105,0);
  k.box(g,1.01,.37,.67,red,0,.36,0);k.box(g,1.04,.022,.70,gray,0,.55,0);
  const holes=new Set(['1,1','1,2','2,1','3,1','2,5','3,5','4,5','4,6','4,8','5,8','0,9','1,9','2,9','3,11','3,12','4,12','5,12','1,14','2,14','2,15','4,2','5,2','0,6','0,7']);
  for(const side of [-1,1])for(let row=0;row<6;row++)for(let col=0;col<17;col++){
    if(holes.has(row+','+col)){k.box(g,.051,.052,.003,dark,(col-8)*.061,.195+row*.061,side*.342);continue;}
    k.box(g,.060,.060,.045,gray,(col-8)*.061,.195+row*.061,side*.372);
    for(let line=0;line<3;line++)k.box(g,.059,.0005,.001,seam,(col-8)*.061,.178+row*.061+line*.017,side*.395);
  }
  for(const side of [-1,1])for(let row=0;row<6;row++)for(let col=0;col<11;col++)if(!holes.has(row+','+col))k.box(g,.045,.060,.060,gray,side*.516,.195+row*.061,(col-5)*.061);
  for(let i=0;i<10;i++)k.box(g,.40,.007*(i+1),.026,base,0,.0035*(i+1),.49-i*.026);
  for(const x of [-.41,.41])k.box(g,.18,.022,.25,k.mat('#60806a'),x,.028,.36);
  bollards(k,g,[[-.26,.42],[.26,.42],[-.52,-.36],[.52,-.36]]);people(k,g,[[-.08,.38],[.04,.40],[.13,.40]]);
  return k.merge(g);
}
