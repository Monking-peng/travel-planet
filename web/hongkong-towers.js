import * as THREE from 'three';
import {TAU,palette,site,skin,prism,lit,windowGlass,finish,sign,polygon} from './hongkong-kit.js';

export function boc(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const glass=windowGlass(k,'#6b8e98',19),edge=lit(k,'#d0d9d5',.43,0,'#e4e4db');edge.userData.bocBracing=true;
 k.box(g,.57,.045,.51,p.pale,0,.04,0);const corners=[[-.205,-.205],[.205,-.205],[.205,.205],[-.205,.205]],tops=[[1.22,1.01,1.01],[1.01,1.01,.80],[.80,.59,.59],[1.01,.80,1.01]];
 for(let i=0;i<4;i++){
  const points=[[0,0],corners[i],corners[(i+1)%4]],ys=tops[i];prism(k,g,points,ys,glass,.065);
  for(let j=0;j<3;j++){const q=points[j],v=points[(j+1)%3];k.beam(g,[q[0],.065,q[1]],[q[0],ys[j],q[1]],.0038,edge);k.beam(g,[q[0],ys[j],q[1]],[v[0],ys[(j+1)%3],v[1]],.0038,edge);}
  const a=points[1],b=points[2],hA=ys[1],hB=ys[2];
  for(let j=0;j<5;j++){const low=.065+j*.19,high=low+.19;if(high<Math.min(hA,hB)+.015){k.beam(g,[a[0],low,a[1]],[b[0],high,b[1]],.0044,edge);k.beam(g,[a[0],high,a[1]],[b[0],low,b[1]],.0044,edge);}}
  for(let j=1;j<12;j++){const t=j/12,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,top=hA+(hB-hA)*t;k.beam(g,[x,.065,z],[x,top,z],.0007,p.steel);}
 }
 for(const x of [-.04,.04])k.beam(g,[x,1.18,-.035],[x,1.53,-.035],.0024,edge);k.beam(g,[-.04,1.25,-.035],[.04,1.33,-.035],.0015,edge);k.beam(g,[.04,1.25,-.035],[-.04,1.33,-.035],.0015,edge);
 sign(k,g,'中銀大廈',.17,.035,0,.055,.258,{background:'#d6d6ca',color:'#365256'});
 return finish(k,g,{lamps:[[-.32,.021,.3],[.32,.021,.3]],visitors:[[-.14,.063,.29],[.05,.063,.28],[.24,.021,.31]]});
}

const IFC_SECTION=[[-.65,-1],[.65,-1],[.65,-.83],[.83,-.83],[.83,-.65],[1,-.65],[1,.65],[.83,.65],[.83,.83],[.65,.83],[.65,1],[-.65,1],[-.65,.83],[-.83,.83],[-.83,.65],[-1,.65],[-1,-.65],[-.83,-.65],[-.83,-.83],[-.65,-.83]];
function ifcShape(a,t){const phase=((a/TAU)%1+1)%1*IFC_SECTION.length,i=Math.floor(phase),f=phase-i,q=IFC_SECTION[i],v=IFC_SECTION[(i+1)%IFC_SECTION.length],r=.225*(1-.10*t-.15*Math.max(0,(t-.82)/.18));return [(q[0]+(v[0]-q[0])*f)*r,.045+1.34*t,(q[1]+(v[1]-q[1])*f)*r];}
export function ifc(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const glass=windowGlass(k,'#71878e',28),silver=lit(k,'#b8c0b9',.3,2);k.box(g,.59,.042,.5,p.pale,0,.038,0);
 skin(k,g,(u,v)=>ifcShape(u*TAU,v),88,96,glass);
 for(let i=0;i<88;i++){const t=i/88;k.line(g,Array.from({length:96},(_,j)=>ifcShape(j/96*TAU,t)),.00115,p.steel,true);}
 for(let i=0;i<36;i++){const a=i/36*TAU;k.line(g,Array.from({length:30},(_,j)=>ifcShape(a,j/29)),i%9===0?.0032:.0008,p.steel);}
 for(const t of [.26,.53,.77])for(let i=-1;i<=1;i++)k.line(g,Array.from({length:96},(_,j)=>ifcShape(j/96*TAU,t+i*.007)),.003,p.dark,true);
 // Eight tapering crown fins enclose the recessed roof instead of a pointed cap.
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU,base=ifcShape(a,.94),tip=ifcShape(a,1);const tangent=[-Math.sin(a)*.028,Math.cos(a)*.028];polygon(k,g,[[base[0]+tangent[0],base[1],base[2]+tangent[1]],[base[0]-tangent[0],base[1],base[2]-tangent[1]],[tip[0]-tangent[0]*.6,1.43,tip[2]-tangent[1]*.6],[tip[0]+tangent[0]*.6,1.43,tip[2]+tangent[1]*.6]],silver);}
 const top=k.cyl(g,.15,.15,.02,p.dark,0,1.375,0,32);top.name='ifc-recessed-roof';
 k.box(g,.36,.09,.20,glass,0,.09,.22);k.box(g,.40,.015,.23,p.steel,0,.142,.22);
 return finish(k,g,{lamps:[[-.32,.021,.28],[.32,.021,.28]],visitors:[[-.2,.021,.37],[0,.021,.38],[.13,.021,.36]]});
}

export function icc(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const glass=windowGlass(k,'#6c8b98',32),bands=lit(k,'#a8b9be',.24,4),dark=k.mat('#385362',.55,.17);dark.userData.night={color:new THREE.Color('#b5ccdc'),intensity:.17};
 const shape=(a,t)=>{const c=Math.cos(a),s=Math.sin(a),r=.224*(1-.085*t)+.043*Math.exp(-t*22),max=Math.max(Math.abs(c),Math.abs(s));let x=c/max*r,z=s/max*r;const nearCorner=Math.min(Math.abs(x),Math.abs(z))/r;if(nearCorner>.77){x*=.93;z*=.93;}return [x,.04+t*1.53,z];};
 skin(k,g,(u,v)=>shape(u*TAU,v),110,128,glass);for(let j=0;j<108;j++)k.line(g,Array.from({length:128},(_,i)=>shape(i/128*TAU,j/108)),.0012,p.steel,true);
 for(let j=0;j<40;j++)k.line(g,Array.from({length:36},(_,i)=>shape(j/40*TAU,i/35)),.00085,p.steel);
 for(const t of [.32,.67,.91])k.line(g,Array.from({length:128},(_,i)=>shape(i/128*TAU,t)),.0035,dark,true);
 for(let s=0;s<4;s++){const wing=new THREE.Group();g.add(wing);wing.rotation.y=s*Math.PI/2;
  skin(k,wing,(u,v)=>{const x=(u-.5)*.38,z=.19+v*.17,y=.21*(1-v)**2+.07;return [x,y,z];},14,18,glass);
  for(let j=0;j<=6;j++)k.line(wing,Array.from({length:20},(_,i)=>{const t=i/19;return [(j/6-.5)*.38,.21*(1-t)**2+.072,.19+t*.17];}),.0014,p.steel);
  const a=shape(Math.PI/4,1),b=shape(3*Math.PI/4,1);k.box(wing,.385,.045,.009,bands,0,1.581,.198);k.box(wing,.375,.004,.018,p.steel,0,1.606,.195);
 }
 k.box(g,.37,.02,.37,p.dark,0,1.565,0);
 return finish(k,g,{lamps:[[-.38,.021,.32],[.38,.021,.32]],visitors:[[-.22,.021,.42],[.02,.021,.42],[.22,.021,.43]]});
}

export function hsbc(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const glass=windowGlass(k,'#526b77',43),steel=lit(k,'#acbbb9',.28,6),red=lit(k,'#a83c35',.25);steel.userData.hsbcExoskeleton=true;
 // Three differently tall suspended blocks; an open public undercroft remains.
 for(const [x,w,h,z]of [[-.23,.19,.75,.015],[0,.24,.94,0],[.23,.19,.81,.015]]){
  k.box(g,w,h-.16,.25,glass,x,.16+(h-.16)/2,z);
  for(let j=0;j<Math.round(h/.024);j++){const y=.17+j*.024;if(y<h)for(const s of [-1,1])k.box(g,w,.0025,.004,p.steel,x,y,z+s*.129);}
  k.box(g,w,.02,.25,p.steel,x,h+.008,z);
 }
 for(const x of [-.35,-.12,.12,.35])for(const z of [-.16,.16]){
  const h=Math.abs(x)>.3?.84:1.00;for(const dx of [-.012,.012])k.cyl(g,.006,.006,h,steel,x+dx,.025+h/2,z,8);
  for(let y=.07;y<h;y+=.043)k.box(g,.043,.009,.023,steel,x,y,z);
 }
 for(const y of [.23,.43,.63,.82])for(const z of [-.174,.174]){
  const w=y>.8?.48:.70;k.box(g,w,.009,.012,steel,0,y,z);k.box(g,w,.009,.012,steel,0,y+.105,z);
  for(let j=0;j<3;j++){const a=-w/2+j*w/3,b=a+w/3;k.beam(g,[a,y+.105,z],[(a+b)/2,y,z],.0045,steel);k.beam(g,[(a+b)/2,y,z],[b,y+.105,z],.0045,steel);}
 }
 for(const x of [-.09,.09]){const escalator=k.box(g,.043,.013,.20,p.steel,x,.10,.16);escalator.rotation.x=-.43;for(const z of [.04,.23])k.box(g,.051,.009,.05,p.steel,x,z===.04?.143:.057,z);}
 sign(k,g,'HSBC',.16,.04,0,.98,.16,{background:'#c2ccca',color:'#384f55'});for(const x of [.12,.145]){const q=k.box(g,.025,.025,.002,red,x,.98,.164);q.rotation.z=Math.PI/4;}
 return finish(k,g,{lamps:[[-.38,.021,.30],[.38,.021,.30]],visitors:[[-.18,.021,.30],[.04,.021,.31],[.23,.021,.28]]});
}
