import * as THREE from 'three';
import {palette,site,paving,steps,grove,roof,story,lit,sign,archOpening,railing,finish,wallPattern,lantern} from './dali-kit.js';
export {south} from './dali-south.js';
export {wuhua} from './dali-wuhua.js';
function baiBlock(k,g,p,x,z,w,d){
 const b=new THREE.Group();b.position.set(x,.031,z);g.add(b);k.box(b,w,.225,d,p.wall,0,.1125,0);
 for(const side of [-1,1]){for(const y of [.065,.177]){for(let i=0;i<5;i++){const xx=(i-2)*w*.17;k.box(b,w*.115,.071,.004,p.wood,xx,y,side*(d/2+.002));for(let j=0;j<4;j++)k.box(b,w*.105,.0014,.002,p.pale,xx,y-.025+j*.017,side*(d/2+.005));}k.box(b,w,.005,.005,p.wood,0,y-.045,side*(d/2+.008));}
  for(let i=0;i<7;i++)k.cyl(b,.0025,.003,.22,p.wood,(i-3)*w/6,.11,side*(d/2+.025),8);
 }
 roof(k,b,p,w*1.12,d*1.18,.062,.231);for(const side of [-1,1])k.box(b,w,.025,.002,p.blue,0,.214,side*(d/2+.001));return b;
}
export function yan(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.76,.67);paving(k,g,p,.64,.55);
 baiBlock(k,g,p,0,-.30,.77,.18);for(const s of [-1,1]){const b=baiBlock(k,g,p,s*.33,-.015,.51,.17);b.rotation.y=Math.PI/2;}
 const screen=new THREE.Group();screen.position.set(0,.031,.238);g.add(screen);k.box(screen,.45,.225,.025,p.wall,0,.1125,0);roof(k,screen,p,.49,.075,.035,.23);
 for(const x of [-.213,.213]){k.box(screen,.009,.198,.003,p.blue,x,.113,-.014);k.box(screen,.006,.198,.003,p.blue,x,.113,.014);}
 for(const z of [-.015,.015]){k.box(screen,.416,.006,.002,p.blue,0,.208,z);k.box(screen,.416,.006,.002,p.blue,0,.025,z);}
 const back=new THREE.Group();back.rotation.y=Math.PI;screen.add(back);sign(k,back,'福',.13,.12,0,.125,.017,{background:'#deded0',color:'#393e37'});sign(k,screen,'福',.13,.12,0,.125,.017,{background:'#deded0',color:'#393e37'});
 // Ornate Bai entrance is offset from the enclosed screen-wall court.
 const door=new THREE.Group();door.position.set(-.50,.031,.275);g.add(door);archOpening(k,door,p.wall,{w:.22,h:.255,opening:.12,rise:.18,d:.055});roof(k,door,p,.29,.12,.05,.26);for(const x of [-.09,.09])k.box(door,.015,.15,.005,p.blue,x,.09,.030);sign(k,door,'严家大院',.135,.035,0,.213,.031,{background:'#7e332c',color:'#ccb071'});lantern(k,door,p,-.113,.223,.07);lantern(k,door,p,.113,.223,.07);
 // The small western villa is part of this named historic compound.
 const villa=new THREE.Group();villa.position.set(.39,.030,-.38);g.add(villa);k.box(villa,.29,.32,.22,p.wall,0,.16,0);for(const x of [-.134,.134])k.box(villa,.025,.32,.015,k.mat('#a7735e'),x,.16,.116);
 for(const y of [.085,.235])for(const x of [-.073,.073]){k.box(villa,.074,.11,.004,p.pale,x,y,.113);k.box(villa,.056,.09,.006,p.wood,x,y,.117);for(let j=0;j<6;j++)k.box(villa,.053,.0015,.003,p.pale,x,y-.035+j*.013,.121);}
 k.box(villa,.31,.014,.24,p.pale,0,.326,0);railing(k,villa,p,[[-.14,.333,.10],[.14,.333,.10],[.14,.333,-.10],[-.14,.333,-.10],[-.14,.333,.10]],.035);
 for(const x of [-.12,.12]){k.cyl(g,.027,.018,.024,p.wood,x,.043,-.08,12);k.ball(g,.033,p.leaf,x,.08,-.08);}
 return finish(k,g,{lamps:[[-.25,.025,.42],[.27,.025,.39]],visitors:[[0,.025,.09],[-.48,.025,.40],[.20,.025,-.12]]});
}
export function shaxi(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.72,.61);paving(k,g,p,.61,.50);
 k.box(g,.40,.16,.32,p.stone,0,.11,-.06);k.box(g,.31,.09,.006,p.wood,0,.095,.104);k.box(g,.46,.02,.36,p.pale,0,.20,-.06);
 // The open performance stage is in front of the narrower Kuixing pavilion.
 k.box(g,.36,.20,.025,p.red,0,.32,-.19);for(const x of [-.19,.19])k.cyl(g,.009,.012,.23,p.red,x,.325,.10,12);
 for(const x of [-.20,.20])for(let j=0;j<3;j++)k.box(g,.02+j*.018,.006,.032+j*.022,p.gold,x,.405+j*.01,.10);
 k.box(g,.42,.026,.035,p.blue,0,.435,.10);roof(k,g,p,.55,.40,.11,.448,0,-.05);
 k.box(g,.25,.20,.24,p.red,0,.55,-.15);story(k,g,p,{w:.25,d:.23,y:.55,h:.17,z:-.15});roof(k,g,p,.36,.33,.075,.775,0,-.15);
 for(const x of [-.074,.074]){k.box(g,.058,.075,.004,p.wood,x,.588,-.027);for(let j=0;j<4;j++)k.box(g,.003,.069,.004,p.gold,x-.022+j*.014,.588,-.024);}
 for(const x of [-.085,.085]){k.box(g,.12,.125,.003,p.gold,x,.33,-.174);k.box(g,.108,.113,.004,p.blue,x,.33,-.171);k.line(g,[[x-.043,.29,-.168],[x-.025,.35,-.168],[x,.31,-.168],[x+.022,.37,-.168],[x+.044,.30,-.168]],.002,p.pale);}
 sign(k,g,'古戏台',.15,.035,0,.425,.121,{background:'#3a514b',color:'#d2b777'});
 for(const s of [-1,1]){baiBlock(k,g,p,s*.40,-.10,.31,.22);steps(k,g,p,s*.30,.17,.13,6,.17,.20);}
 grove(k,g,height,[[.55,.18,.20],[-.50,-.31,.19]]);
 return finish(k,g,{lamps:[[-.25,.024,.40],[.32,.024,.39]],visitors:[[-.10,.023,.35],[.08,.023,.29],[.26,.023,.29],[-.27,.023,.32]]});
}
