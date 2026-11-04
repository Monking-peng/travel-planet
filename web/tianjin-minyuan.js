import * as THREE from 'three';
import {palette,site,paving,finish,lit,skin,archOpening,gable,TAU,sign} from './tianjin-kit.js';
import {tree} from './wuhan-architecture.js';
function arch(w,h,Type=THREE.Shape){const s=new Type();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function archFrame(k,g,p,w,h,y,z){const s=arch(w+.006,h+.003);s.holes.push(arch(w,h,THREE.Path));k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.003,bevelEnabled:false,curveSegments:14}),p.trim,0,y,z);k.line(g,Array.from({length:33},(_,i)=>{const a=i/32*Math.PI;return [Math.cos(a)*w/2,y+h-w/2+Math.sin(a)*w/2,z+.003];}),.0012,p.archLight);k.box(g,.006,.008,.006,p.trim,0,y+h,z+.002);}
function rail(k,g,p,w,y,z){for(let i=0;i<=10;i++)k.box(g,.0009,.021,.001,p.iron,(i/10-.5)*w,y+.010,z);for(const h of [0,.021])k.box(g,w,.0015,.0015,p.iron,0,y+h,z);}
function bay(k,g,p,w,curved){
 const upper=curved?.182:.248;
 for(const side of [-1,1]){
  const f=new THREE.Group();f.position.z=side*.036;f.rotation.y=side===1?0:Math.PI;g.add(f);
  for(const y of curved?[0]:[0,.092]){
   archOpening(k,f,p.stone,{w,h:.092,opening:w*.67,rise:.077,d:.012,y});archFrame(k,f,p,w*.67,.077,y,.006);
   for(const x of [-w*.43,w*.43]){
    k.box(f,w*.13,.043,.014,p.brick,x,y+.022,.004);for(const yy of [.004,.035,.043])k.box(f,w*.15,.003,.017,p.trim,x,y+yy,.005);
    if(y>.08){k.cyl(f,.0025,.0030,.053,p.trim,x,y+.031,.012,12);k.box(f,.009,.005,.016,p.trim,x,y+.060,.012);}
   }
   k.box(f,w+.003,.004,.019,p.corniceLight,0,y+.090,.005);if(y>.08)rail(k,f,p,w*.66,y+.006,.012);
  }
  const yy=curved?.095:.188,hh=curved?.080:.056;
  k.box(f,w,hh,.011,p.brick,0,yy+hh/2,0);
  const windows=curved?3:1;for(let j=0;j<windows;j++){
   const ww=w*(curved?.18:.57),xx=(j-(windows-1)/2)*w*.255;
   k.box(f,ww+.005,hh*.76+.005,.003,p.trim,xx,yy+hh*.50,.008);k.box(f,ww,hh*.76,.003,p.dark,xx,yy+hh*.50,.010);
   k.box(f,.0014,hh*.76,.003,p.trim,xx,yy+hh*.50,.012);k.box(f,ww,.0014,.003,p.trim,xx,yy+hh*.44,.012);
  }
  for(const x of [-w*.45,w*.45])k.box(f,.005,hh,.014,p.trim,x,yy+hh/2,.007);
  for(const y of [upper-.008,upper])k.box(f,w+.006,.005,.023,p.corniceLight,0,y,.005);
  k.box(f,.006,.002,.003,p.lamp,0,.085,.012);if(!curved)k.box(f,.006,.002,.003,p.lamp,0,.177,.012);
 }
 for(const y of [0,.093,curved?.182:.186,.248]){if(curved&&y>.183)continue;k.box(g,w+.004,.004,.077,p.paving,0,y+.002,0);}
 if(curved){k.box(g,w+.008,.004,.084,p.trim,0,.184,0);k.box(g,w+.004,.003,.060,p.flat,0,.187,0);}
 else{const q=new THREE.Group();q.rotation.y=Math.PI/2;g.add(q);gable(k,q,{...p,red:p.roof},.085,w+.011,.027,.251,0,0,p.roof);}
}
function gateway(k,g,p){
 const q=new THREE.Group();q.position.set(0,.025,.29);g.add(q);p.portal.userData.minyuanPortal=true;
 archOpening(k,q,p.portal,{w:.247,h:.303,opening:.116,rise:.224,d:.12});
 for(const side of [-1,1]){
  const f=new THREE.Group();f.position.z=side*.062;f.rotation.y=side===1?0:Math.PI;q.add(f);
  for(let j=0;j<3;j++)archFrame(k,f,p,.116+j*.009,.224+j*.005,0,.003+j*.002);
  for(const x of [-.090,.090]){k.box(f,.036,.245,.016,p.trim,x,.122,.008);for(let i=0;i<12;i++)k.box(f,.037,.0011,.018,p.joint,x,.015+i*.019,.009);for(const y of [.006,.232,.249,.289])k.box(f,.047,.006,.025,p.corniceLight,x,y,.012);for(let j=0;j<3;j++)k.box(f,.004,.024,.003,p.dark,x+(j-1)*.008,.272,.020);}
  for(let j=-4;j<=4;j++)k.box(f,.004,.022,.005,p.dark,j*.011,.270,.011);
  for(const y of [.248,.289,.301])k.box(f,.247,.005,.026,p.corniceLight,0,y,.010);
  for(let j=-15;j<=15;j++)k.box(f,.003,.003,.013,p.trim,j*.0075,.296,.011);
 }
 // The portal roof is a shallow open parapet, not a solid slab blocking the arch.
 k.box(q,.235,.006,.128,p.flat,0,.306,0);for(const side of [-1,1]){k.box(q,.238,.016,.010,p.trim,0,.317,side*.059);k.box(q,.011,.019,.13,p.trim,side*.116,.319,0);}
 k.box(g,.118,.005,.190,p.paving,0,.028,.29);for(let i=0;i<3;i++){const top=.0235+i*.0035;k.box(g,.128,top-.020,.018,p.paving,0,(top+.020)/2,.400-i*.017);}sign(k,g,'民园广场',.083,.018,0,.264,.364,{background:'#c9b896',color:'#75634c'});
}
function rear(k,g,p){
 const q=new THREE.Group();q.position.set(0,.025,-.29);g.add(q);
 archOpening(k,q,p.brick,{w:.117,h:.295,opening:.047,rise:.076,d:.092});
 for(const side of [-1,1]){const f=new THREE.Group();f.position.z=side*.048;f.rotation.y=side===1?0:Math.PI;q.add(f);archFrame(k,f,p,.047,.076,0,.003);k.box(f,.049,.139,.003,p.dark,0,.164,.003);for(const x of [-.048,.048]){k.box(f,.014,.247,.012,p.trim,x,.124,.006);for(const y of [.008,.082,.228,.245])k.box(f,.021,.004,.017,p.trim,x,y,.010);}for(const y of [.252,.290,.300])k.box(f,.132,.006,.024,p.trim,0,y,.005);for(let i=-3;i<=3;i++)k.box(f,.004,.022,.006,p.dark,i*.012,.274,.010);}
 k.box(q,.133,.007,.108,p.flat,0,.304,0);for(const x of [-.026,.026]){k.cyl(q,.0011,.0015,.045,p.iron,x,.329,0,8);for(let j=0;j<3;j++){const o=k.box(q,.008,.006,.009,p.iron,x,.317+j*.012,.005);o.rotation.x=-.3;}}k.beam(q,[0,.306,0],[0,.38,0],.0006,p.iron);
}
function glassPavilion(k,g,p){
 const q=new THREE.Group();q.position.x=.455;g.add(q);p.trim.userData.minyuanFrame=true;p.glass.userData.minyuanGlass=true;
 const edge=(t,side)=>[side*.105*Math.sin(Math.PI*t)**.82,.135+.025*t,(t-.5)*.36];
 for(const side of [-1,1]){
  skin(k,q,(u,v)=>{const a=edge(u,side);return [a[0],.030+(a[1]-.030)*v,a[2]];},12,48,p.glass);
  k.line(q,Array.from({length:49},(_,i)=>edge(i/48,side)),.0025,p.trim);
  for(let i=1;i<24;i++){const a=edge(i/24,side);k.beam(q,[a[0],.03,a[2]],a,.0011,p.trim,6);}
  for(const v of [.25,.5,.75])k.line(q,Array.from({length:49},(_,i)=>{const a=edge(i/48,side);return[a[0],.03+(a[1]-.03)*v,a[2]];}),.0008,p.trim);
 }
 skin(k,q,(u,v)=>{const a=edge(u,1);return [(v*2-1)*a[0],a[1]+.007*Math.sin(v*Math.PI),a[2]];},12,48,p.glass);
 for(let i=1;i<19;i++){const t=i/19,a=edge(t,1);k.line(q,Array.from({length:13},(_,j)=>[(j/6-1)*a[0],a[1]+.002+.007*Math.sin(j/12*Math.PI),a[2]]),.0018,p.trim);}
 const lower=arch(.035,.042);k.mesh(q,new THREE.ShapeGeometry(lower),p.dark,-.087,.031,0).rotation.y=-Math.PI/2;
}
function terraces(k,g,p){
 const cx=-.285;
 for(let row=0;row<5;row++){
  const inner=.035+row*.034,outer=inner+.033,y=.027+row*.004;
  skin(k,g,(u,v)=>{const a=Math.PI/2+u*Math.PI,rr=inner+(outer-inner)*v;return[cx+Math.cos(a)*rr,y,Math.sin(a)*rr];},2,48,p.grass);
  k.line(g,Array.from({length:49},(_,i)=>{const a=Math.PI/2+i/48*Math.PI;return[cx+Math.cos(a)*outer,y+.001,Math.sin(a)*outer];}),.0025,p.trim);
  for(const side of [-1,1])k.box(g,.058,.004,.004,p.trim,cx+.028,y,side*outer);
 }
 for(const z of [-.13,.13]){k.box(g,.10,.012,.030,p.paving,-.34,.030,z);for(let i=0;i<8;i++){const x=-.285-i*.010,top=.028+i*.002;k.box(g,.011,top-.020,.030,p.paving,x,(top+.020)/2,z);}}
}
export function minyuan(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.77,.56);paving(k,g,p,.72,.49);
 p.stone=lit(k,'#b9a98b',.035);p.trim=lit(k,'#cbbca1',.13);p.portal=lit(k,'#c2b08e',.14);p.brick=k.mat('#936a51',.98);p.roof=k.mat('#a37965',.97);p.flat=k.mat('#b7b7aa',.96);p.paving=k.mat('#ada99b',.97);p.paving.userData.minyuanPaving=true;p.iron=k.mat('#4d5046',.9);p.glass=lit(k,'#58777b',.10,'#d8d7be');p.dark=lit(k,'#44565a',.075);p.joint=k.mat('#9f927e',.98);p.lamp=lit(k,'#dbcca9',.55);p.archLight=lit(k,'#cbb695',1.1);p.corniceLight=lit(k,'#cbbca1',.65);p.grass=k.mat('#68885b',.98);
 p.brick.onBeforeCompile=s=>{s.vertexShader='varying vec3 vMinyuan;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMinyuan=position;');s.fragmentShader='varying vec3 vMinyuan;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float row=floor(vMinyuan.y/.0045);vec2 f=fract(vec2((vMinyuan.x+vMinyuan.z)/.012+mod(row,2.)*.5,vMinyuan.y/.0045));float joint=step(.065,min(f.x,f.y));diffuseColor.rgb*=mix(.72,1.,joint);`);};p.brick.customProgramCacheKey=()=> 'minyuan-brick-240';
 k.box(g,.558,.006,.408,p.trim,0,.025,0);k.box(g,.55,.007,.40,p.grass,0,.029,0);
 const path=[];for(let i=0;i<18;i++)path.push([-.37+(i+.5)*.74/18,.29,0,false,.74/18]);for(let i=0;i<24;i++){const a=(i+.5)/24*Math.PI;path.push([.37+Math.sin(a)*.29,Math.cos(a)*.29,a,true,Math.PI*.29/24]);}for(let i=0;i<18;i++)path.push([.37-(i+.5)*.74/18,-.29,Math.PI,false,.74/18]);for(let i=0;i<24;i++){const a=Math.PI+(i+.5)/24*Math.PI;path.push([-.37+Math.sin(a)*.29,Math.cos(a)*.29,a,true,Math.PI*.29/24]);}
 for(const [x,z,a,curved,w]of path){if(!curved&&((z>0&&Math.abs(x)<.118)||(z<0&&Math.abs(x)<.06)))continue;const q=new THREE.Group();q.position.set(x,.025,z);q.rotation.y=a;g.add(q);bay(k,q,p,w+.003,curved);}
 gateway(k,g,p);rear(k,g,p);glassPavilion(k,g,p);terraces(k,g,p);
 const track=k.mat('#9b7964',.99);
 for(const z of [-.228,.228]){k.box(g,.69,.003,.027,track,0,.026,z);for(const x of [-.27,-.13,.13,.27])tree(k,g,x,.028,z,.075);}
 const visitors=[[-.22,-.13],[-.20,-.11],[-.08,.09],[-.05,.11],[.17,-.08],[.19,-.10],[.06,.14],[-.13,-.03],[.21,.05],[.22,.09],[.02,-.14],[.04,-.13],[-.16,.14],[.11,.02],[.14,.03],[-.02,-.04]].map(([x,z])=>[x,.035,z]);visitors.push([-.12,.026,.40],[.13,.026,.39],[-.58,.026,.04],[.29,.026,-.21]);
 return finish(k,g,{lamps:[[-.31,.024,.40],[.31,.024,.40],[-.31,.024,-.40],[.31,.024,-.40]],visitors});
}
