import * as THREE from 'three';
import {palette,site,disc,grove,sign,finish,skin,TAU} from './suzhou-kit.js';

function material(k,color,strength=0){const m=k.mat(color,.89,.04);if(strength)m.userData.night={color:new THREE.Color('#efc995'),intensity:strength};return m;}
function roof(k,g,p,w,y,h){
 const point=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),q=Math.max(Math.abs(c),Math.abs(s)),r=.001+.999*v,corner=Math.min(Math.abs(c),Math.abs(s))/.70710678;return [c/q*w/2*r,y+h*(1-r)**1.65+.022*r**8*corner**7,s/q*w/2*r];};
 skin(k,g,point,14,96,p.tile);skin(k,g,(u,v)=>{const a=point(u,v);a[1]-=.007;return a;},10,96,p.wood);
 k.line(g,Array.from({length:96},(_,i)=>point(i/96,1)),.002,p.edge,true);
 for(let i=0;i<48;i++){const points=Array.from({length:10},(_,j)=>{const q=point(i/48,.10+.90*j/9);q[1]+=.0013;return q;});k.line(g,points,.0009,p.tile);}
 for(let side=0;side<4;side++){const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);for(let i=0;i<=16;i++){const x=(i/16-.5)*w*.96,z=w/2-.008,t=Math.abs(x)/(w/2),yy=y+.022*t**7;k.beam(f,[x*.66,y+.002,z*.68],[x,yy-.012,z],.0014,p.wood);k.cyl(f,.0022,.0022,.004,p.end,x,yy,z+.009,8).rotation.x=Math.PI/2;}k.line(f,[[-w*.46,y+.010,w*.48],[0,y-.004,w*.48],[w*.46,y+.010,w*.48]],.0014,p.under);}
 for(const x of [-1,1])for(const z of [-1,1]){k.line(g,[[0,y+h+.003,0],[x*w*.25,y+h*.25+.006,z*w*.25],[x*w*.49,y+.026,z*w*.49]],.0026,p.tile);k.cyl(g,.0032,.005,.011,p.gold,x*w*.465,y+.006,z*w*.465,10);}
}
function rail(k,g,p,w,y,z,{entrance=false}={}){
 const spans=entrance?[[-w/2,-.066],[.066,w/2]]:[[-w/2,w/2]];
 for(const [left,right]of spans){const length=right-left,mid=(right+left)/2;k.box(g,length,.004,.005,p.rail,mid,y+.036,z);k.box(g,length,.0012,.002,p.under,mid,y+.007,z+.003);k.box(g,length,.004,.005,p.rail,mid,y+.008,z);
 const n=Math.max(2,Math.round(length/.035));for(let i=0;i<=n;i++){const x=left+i*length/n;k.cyl(g,.0021,.0024,.040,p.rail,x,y+.022,z,8);if(i===0||i===n)k.ball(g,.003,p.rail,x,y+.045,z);}
 for(let i=0;i<n;i++){const x=left+(i+.5)*length/n,cell=length/n;k.box(g,cell*.48,.003,.004,p.rail,x-cell*.12,y+.018,z);k.box(g,.003,.015,.004,p.rail,x+cell*.12,y+.024,z);k.box(g,cell*.35,.003,.004,p.rail,x+cell*.25,y+.030,z);}}
}
function facade(k,g,p,w,h,base,floor){
 const bay=w/3;
 for(let side=0;side<4;side++){const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);const z=w/2;
  // Real portals remain open on the ground floor. Upper bays have deep timber grilles.
  for(let i=0;i<3;i++){const x=(i-1)*bay,open=floor===0&&i===1&&(side===0||side===2),doorH=h*.65;
   if(!open){k.box(f,bay*.83,doorH,.009,p.dark,x,base+doorH/2,z-.018);for(let j=0;j<6;j++)k.box(f,.0017,doorH*.89,.003,p.rail,x+(j/5-.5)*bay*.70,base+doorH*.51,z-.011);}
   k.box(f,bay*.88,h-doorH,.014,p.plaster,x,base+(h+doorH)/2,z-.008);
   for(const dx of [-1,1])k.box(f,.009,doorH,.018,p.wood,x+dx*bay*.46,base+doorH/2,z);
   // Curved timber panels distinguish the bracket band from an unarticulated wall.
   k.line(f,[[x-bay*.36,base+h*.78,z+.003],[x-bay*.16,base+h*.80,z+.003],[x,base+h*.94,z+.003],[x+bay*.16,base+h*.80,z+.003],[x+bay*.36,base+h*.78,z+.003]],.003,p.wood);
  }
  for(let i=0;i<=3;i++)k.cyl(f,.0045,.0055,h+.014,p.wood,(i/3-.5)*w,base+h/2,z+.004,10);
  for(const yy of [base+h*.67,base+h*.97])k.box(f,w+.022,.008,.014,p.wood,0,yy,z+.004);
  for(let i=0;i<=6;i++){const x=(i/6-.5)*w;for(let j=0;j<3;j++){k.box(f,.012+j*.010,.005,.022+j*.012,p.wood,x,base+h+.006+j*.008,z+.012+j*.006);k.box(f,.005,.009,.014,p.pale,x,base+h+.009+j*.008,z+.015+j*.006);}}
  rail(k,f,p,w+.062,base+.005,z+.033,{entrance:floor===0&&(side===0||side===2)});
 }
}
export function hanshan(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.65,.61);p.wood=material(k,'#4b2e25',.025);p.rail=material(k,'#8b4d3b',.055);p.plaster=material(k,'#cfb3a0',.08);p.tile=material(k,'#454b48',.025);p.end=material(k,'#68716b',.20);p.edge=material(k,'#5d5140',.65);p.under=material(k,'#7a5c42',.48);p.dark=material(k,'#262b28',.018);p.gold=material(k,'#b3934d',.26);p.yellow=material(k,'#c59a3d',.07);
 p.stone.userData.hanshanStone=true;p.plaster.userData.hanshanWall=true;p.wood.userData.hanshanTimber=true;
 disc(k,g,.48,.49,.023,p.stone);const tower=new THREE.Group();tower.position.z=-.08;g.add(tower);
 k.box(tower,.44,.052,.44,p.stone,0,.049,0);k.box(tower,.46,.012,.46,p.pale,0,.081,0);
 k.box(tower,.26,.130,.016,p.dark,0,.153,-.08);
 // Square columns and curved stone brackets articulate the raised masonry podium.
 for(let side=0;side<4;side++){const f=new THREE.Group();f.rotation.y=side*Math.PI/2;tower.add(f);for(const x of [-.185,-.108,.108,.185]){k.box(f,.025,.045,.025,p.stone,x,.048,.222);k.box(f,.037,.012,.030,p.pale,x,.072,.222);}}
 for(let floor=0;floor<5;floor++){const w=.350-floor*.035,base=.088+floor*.177+(floor?.022:0),h=floor===0?.145:.125;
  if(floor)k.box(tower,w+.070,.012,w+.070,p.pale,0,base-.006,0);
  facade(k,tower,p,w,h,base,floor);roof(k,tower,p,w+.190,base+h+.030,.070-floor*.003);
  if(floor<3){sign(k,tower,['普明宝塔','佛光普照','无上菩提'][floor],w*.49,.034,0,base+h*.80,w/2+.023,{background:'#783d28',color:'#e4c77c'});}
 }
 const summit=.088+4*.177+.022+.125+.030+.058;k.cyl(tower,.003,.006,.145,p.gold,0,summit+.071,0,12);k.cyl(tower,.019,.029,.025,p.gold,0,summit+.008,0,12);for(let i=0;i<9;i++)k.ring(tower,.019-i*.0014,.002,p.gold,summit+.025+i*.012);k.ball(tower,.009,p.gold,0,summit+.151,0);
 for(let i=0;i<7;i++){const top=.024+(i+1)*.009;k.box(g,.133,top-.018,i===6?.037:.024,p.pale,0,(top+.018)/2,.309-i*.024);}
 for(const side of [-1,1]){k.beam(g,[side*.078,.070,.321],[side*.078,.123,.158],.0035,p.rail);for(let i=0;i<4;i++){const z=.319-i*.052,y=.069+i*.017;k.cyl(g,.004,.005,.043,p.rail,side*.078,y-.014,z,8);}}
 // Yellow walls enclose the forecourt; the timber gateway is rectangular, not a moon gate.
 for(const side of [-1,1]){k.box(g,.021,.151,.70,p.yellow,side*.409,.099,0);k.box(g,.035,.012,.71,p.tile,side*.409,.181,0);k.box(g,.302,.151,.028,p.yellow,side*.257,.099,.365);k.box(g,.311,.012,.046,p.tile,side*.257,.181,.365);}
 const gate=new THREE.Group();gate.position.z=.365;g.add(gate);k.box(gate,.215,.027,.087,p.plaster,0,.190,0);for(const side of [-1,1])k.cyl(gate,.006,.007,.170,p.wood,side*.099,.110,.015,10);k.box(gate,.229,.012,.102,p.wood,0,.209,0);roof(k,gate,p,.282,.227,.057);sign(k,gate,'寒山寺',.086,.027,0,.192,.046,{background:'#733d29',color:'#e2c77e'});
 grove(k,g,height,[[-.49,-.27,.22],[.49,-.28,.23]]);return finish(k,g,{lamps:[[-.28,.024,.30],[.28,.024,.30]],visitors:[[-.12,.025,.42],[.06,.025,.43]]});
}
