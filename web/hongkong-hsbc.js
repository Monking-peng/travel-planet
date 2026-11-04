import * as THREE from 'three';
import {palette,site,skin,windowGlass,lit,finish,sign,polygon} from './hongkong-kit.js';

function node(k,g,x,y,z,m){const o=k.ball(g,.010,m,x,y,z);o.scale.set(1.18,.78,.72);}
function truss(k,g,y,z,w,m){
 const left=-w/2,right=w/2,drop=.057,top=y+.055;
 k.box(g,w,.009,.013,m,0,top,z);k.box(g,w,.007,.013,m,0,y-drop,z);
 // Large suspended chevrons with short cantilever arms, not a grid of small W's.
 const pts=[[left,y-drop,z],[-w*.28,top,z],[0,y-drop,z],[w*.28,top,z],[right,y-drop,z]];
 for(let i=1;i<pts.length;i++)k.beam(g,pts[i-1],pts[i],.0056,m,8);
 for(const x of [-w*.28,w*.28]){k.beam(g,[x,y-drop,z],[x,top,z],.0026,m);node(k,g,x,y-drop,z,m);}
}
function lion(k,g,x,z,stone,bronze){
 k.box(g,.052,.016,.078,stone,x,.030,z);const body=k.ball(g,.023,bronze,x,.062,z);body.scale.set(.70,1,1.1);
 const head=k.ball(g,.015,bronze,x,.087,z+.020);head.scale.set(1,1,.9);
 for(const dx of [-.009,.009]){k.cyl(g,.004,.005,.027,bronze,x+dx,.052,z+.021,8);k.ball(g,.004,bronze,x+dx,.099,z+.020);}
 k.line(g,[[x+.014,.067,z-.015],[x+.026,.051,z-.029],[x+.018,.041,z-.040]],.003,bronze);
}
export function hsbc(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const b=new THREE.Group();g.add(b);b.scale.x=.78;
 const treads=k.mat('#bfc7c4',.53,.24);treads.userData.hsbcEscalatorTreads=true;
 const glass=windowGlass(k,'#526c75',43,'#e1e5d6'),steel=k.mat('#bfc7c4',.53,.24),cladding=k.mat('#aeb9b9',.67,.16),shadow=k.mat('#455a60',.73,.12),bronze=k.mat('#65554b',.82,.3);
 steel.userData.hsbcExoskeleton=true;
 const trussMat=lit(k,'#c3cac6',.68,1.8,'#f04733');trussMat.userData.hsbcTruss=true;
 const mastLight=lit(k,'#c4d4d2',.52,4,'#a0cdd7');const warm=lit(k,'#dad6bd',.45,null,'#ffe0a7');
 // Three staggered floor volumes, with open air retained below the banking hall.
 for(const [x,w,h,z]of [[-.25,.16,.76,.015],[0,.33,1.00,0],[.25,.16,.84,.015]]){
  k.box(b,w,h-.165,.315,glass,x,(h+.165)/2,z);
  for(const side of [-1,1]){
   for(let y=.182;y<h-.005;y+=.022)k.box(b,w,.0018,.006,steel,x,y,z+side*.160);
   for(let n=0;n<=Math.round(w/.028);n++){const xx=x-w/2+n/Math.round(w/.028)*w;k.box(b,.0008,h-.17,.005,steel,xx,(h+.17)/2,z+side*.162);}
  }
  k.box(b,w+.012,.013,.33,steel,x,h+.006,z);
  k.box(b,w-.013,.008,.285,shadow,x,h+.014,z);
 }
 // Eight masts; four tubular columns are joined into each exposed mast.
 for(const x of [-.35,-.17,.17,.35])for(const z of [-.19,.19]){
  const h=Math.abs(x)>.3?(x<0?.81:.89):1.065;
  for(const dx of [-.009,.009])for(const dz of [-.009,.009])k.cyl(b,.0048,.0062,h-.025,steel,x+dx,.025+(h-.025)/2,z+dz,10);
  for(let y=.059;y<h;y+=.042){k.box(b,.037,.007,.035,steel,x,y,z);k.box(b,.028,.0025,.003,mastLight,x,y+.004,z+(z>0?.020:-.020));}
  k.box(b,.044,.017,.047,steel,x,h,z);
 }
 for(const y of [.275,.475,.675,.86])for(const z of [-.211,.211])truss(k,b,y,z,y>.8?.36:.70,trussMat);
 // Flanking service pods, ribbed aluminium rather than extra glass boxes.
 for(const side of [-1,1])for(let j=0;j<3;j++){
  const z=-.13+j*.13,h=side<0?.70:.78,xx=side*.391;
  k.box(b,.060,h-.14,.099,cladding,xx,(h+.14)/2,z);
  for(let y=.165;y<h;y+=.028)k.box(b,.064,.002,.102,shadow,xx,y,z);
  for(const zz of [z-.038,z+.038])k.box(b,.003,h-.15,.002,steel,xx+side*.032,(h+.15)/2,zz);
  k.box(b,.065,.012,.105,steel,xx,h+.007,z);
 }
 // Diagonal side bracing links the different-height bays.
 for(const side of [-1,1])for(const y of [.25,.46,.65]){
  const x=side*.428;k.beam(b,[x,y,-.18],[x,y+.12,.18],.0035,steel);k.beam(b,[x,y,.18],[x,y+.12,-.18],.0035,steel);
 }
 // Glass underbelly and two raised escalators retain the open pedestrian axis.
 const underside=k.mat('#759094',.30,.22);skin(k,b,(u,v)=>[(u-.5)*.65,.151+.017*((v-.5)*2)**2,(v-.5)*.32],8,18,underside);
 for(let j=0;j<=12;j++)k.box(b,.002,.004,.318,steel,-.31+j*.052,.15,0);
 for(const x of [-.087,.087]){
  const from=[x,.043,.28],to=[x,.163,-.005];k.beam(b,from,to,.014,shadow,4);
  for(let i=0;i<20;i++){const t=i/19;k.box(b,.038,.004,.015,treads,x,.045+t*.12,.28-t*.285);}
  for(const dx of [-.022,.022]){k.beam(b,[x+dx,.060,.28],[x+dx,.183,-.005],.0028,steel);k.beam(b,[x+dx,.055,.28],[x+dx,.174,-.005],.002,shadow);}
 }
 // Rounded rooftop drum and paired maintenance cranes seen in the photographs.
 const drum=k.cyl(b,.113,.113,.046,cladding,.045,1.048,0,64);drum.scale.z=.72;drum.scale.x=1.15;
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2;k.box(b,.0015,.043,.0015,shadow,.045+Math.sin(a)*.131,1.048,Math.cos(a)*.082);}
 sign(k,b,'HSBC',.11,.028,.043,1.05,.085,{background:'#b8c0bd',color:'#48595a'});
 const red=lit(k,'#b6352b',.65,null,'#f54e38');for(const side of [-1,1])polygon(k,b,[[.130+side*.013,1.05,.086],[.130,1.064,.086],[.130,1.036,.086]],red);
 for(const x of [-.17,.17]){
  k.cyl(b,.012,.014,.035,steel,x,1.084,0,12);
  k.beam(b,[x,1.093,0],[x,1.135,-.083],.0045,shadow);k.beam(b,[x,1.118,-.083],[x,1.135,-.083],.003,steel);k.box(b,.043,.009,.025,steel,x,1.137,-.083);
 }
 for(const x of [-.21,.21])lion(k,g,x,.37,p.stone,bronze);
 k.box(g,.49,.005,.065,p.pale,0,.022,.34);for(let i=0;i<9;i++)k.box(g,.001,.001,.09,shadow,-.22+i*.055,.025,.34);
 for(const x of [-.22,.22])k.box(g,.003,.003,.17,warm,x,.029,.29);
 return finish(k,g,{lamps:[[-.38,.021,.30],[.38,.021,.30]],visitors:[[-.18,.021,.40],[.04,.021,.42],[.23,.021,.45]]});
}
