import * as THREE from 'three';
import {palette,site,disc,siteHeight,steps,sign,finish,extrude,archPath,column,pediment,panel,balustrade,calçada,hip,lit,TAU,archOpening} from './macau-kit.js';
export function paul(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);steps(k,g,p,0,.53,.95,12,.11,.35);
 const z=-.03,y=.135,s=new THREE.Shape();s.moveTo(-.49,y);s.lineTo(.49,y);s.lineTo(.49,y+.48);s.lineTo(.37,y+.48);s.lineTo(.34,y+.63);s.lineTo(.23,y+.63);s.lineTo(.23,y+.75);s.lineTo(0,y+.88);s.lineTo(-.23,y+.75);s.lineTo(-.23,y+.63);s.lineTo(-.34,y+.63);s.lineTo(-.37,y+.48);s.lineTo(-.49,y+.48);s.closePath();
 for(const x of [-.31,0,.31]){s.holes.push(archPath(x,y+.012,.115,x===0?.23:.20));s.holes.push(archPath(x,y+.32,.10,.13));}s.holes.push(archPath(0,y+.56,.08,.14));extrude(k,g,s,p.stone,.065,z);
 for(const [yy,w]of [[0,1.02],[.26,1.02],[.49,.99],[.65,.74],[.76,.49]]){k.box(g,w,.012,.093,p.pale,0,y+yy,z);k.box(g,w+.01,.004,.1,p.stone,0,y+yy+.01,z);}
 for(const yy of [y+.025,y+.285])for(const x of [-.435,-.405,-.19,-.16,.16,.19,.405,.435])column(k,g,p,x,yy,z+.05,.21,.009);
 for(const x of [-.20,-.10,.10,.20])column(k,g,p,x,y+.52,z+.05,.115,.006);
 for(const x of [-.265,.265,-.44,.44]){const yy=y+.54+(Math.abs(x)<.3?.13:0);k.cyl(g,.006,.012,.038,p.pale,x,yy,z,8);k.ball(g,.007,p.pale,x,yy+.026,z);}
 for(const x of [-.26,.26]){k.line(g,[[x*1.3,y+.50,z+.055],[x*1.27,y+.60,z+.055],[x,y+.62,z+.055],[x*.9,y+.55,z+.055]],.008,p.pale);}
 for(const x of [-.24,.24])for(const yy of [y+.11,y+.385]){k.cyl(g,.008,.013,.055,p.pale,x,yy,z+.044,8);k.ball(g,.009,p.pale,x,yy+.038,z+.045);}
 pediment(k,g,p,0,y+.765,z+.01,.46,.115);k.box(g,.007,.055,.01,p.pale,0,y+.905,z);k.box(g,.032,.007,.01,p.pale,0,y+.914,z);
 for(const x of [-.42,.42]){k.box(g,.035,.015,.33,p.stone,x,.04,-.25);k.box(g,.10,.015,.035,p.stone,x*.65,.04,-.39);}
 return finish(k,g,{lamps:[[-.50,.04,.07],[.50,.04,.07]],visitors:[[-.28,.026,.45],[.24,.026,.42],[.07,.026,.46]]});
}
export function senado(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);disc(k,g,.64,.53,(x,z)=>siteHeight(x,z,.72,.62)+.004,calçada(k));
 const z=-.27; k.box(g,.98,.36,.30,p.wall,0,.21,z);hip(k,g,1.02,.34,.075,.39,p.tile,p.pale,0,z);
 for(const y of [.055,.235,.385])k.box(g,1.01,.012,.325,p.pale,0,y,z);
 for(const x of [-.46,-.27,.27,.46]){k.box(g,.025,.35,.015,p.stone,x,.21,z+.157);k.box(g,.04,.012,.025,p.pale,x,.38,z+.16);}
 for(let i=-3;i<=3;i++){const x=i*.136;panel(k,g,p,{x,y:.075,z:z+.155,w:.070,h:.12,door:i===0});panel(k,g,p,{x,y:.262,z:z+.155,w:.068,h:.105});if(Math.abs(i)<=1)pediment(k,g,p,x,.372,z+.159,.088,.021);}
 k.box(g,.47,.015,.065,p.pale,0,.246,-.085);balustrade(k,g,{...p,pale:p.wood},[-.23,-.048],[.23,-.048],.25,.05);pediment(k,g,p,0,.416,-.115,.59,.09);sign(k,g,'LEAL SENADO',.37,.025,0,.411,-.093,{background:'#e7dfca',color:'#324b41'});
 k.cyl(g,.12,.13,.014,p.pale,0,.035,.25,64);k.cyl(g,.105,.105,.007,p.water,0,.044,.25,64);k.cyl(g,.013,.022,.075,p.stone,0,.085,.25,16);
 const sphere=new THREE.Group();sphere.position.set(0,.16,.25);g.add(sphere);for(let i=0;i<4;i++){const o=k.mesh(sphere,new THREE.TorusGeometry(.035,.0018,5,48),p.gold);o.rotation.set(i*.6,i*.9,i*.2);}k.beam(g,[-.03,.12,.25],[.03,.20,.25],.002,p.gold);
 return finish(k,g,{lamps:[[-.43,.024,.25],[.43,.024,.25]],visitors:[[-.2,.026,.35],[.31,.026,.08],[.23,.026,.39]]});
}
export function dominic(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const z=.12,y=.045;
 k.box(g,.65,.43,.57,p.ochre,0,y+.215,-.14);hip(k,g,.69,.61,.12,y+.43,p.tile,p.pale,0,-.14);
 const s=new THREE.Shape();s.moveTo(-.36,y);s.lineTo(.36,y);s.lineTo(.36,y+.43);s.bezierCurveTo(.24,y+.43,.205,y+.57,.19,y+.65);s.lineTo(0,y+.76);s.lineTo(-.19,y+.65);s.bezierCurveTo(-.205,y+.57,-.24,y+.43,-.36,y+.43);s.closePath();extrude(k,g,s,p.ochre,.045,z);
 for(const yy of [.02,.22,.43,.65])k.box(g,yy>.5?.42:.75,.011,.067,p.pale,0,y+yy,z);
 for(const x of [-.31,-.15,.15,.31]){k.box(g,.018,.40,.022,p.pale,x,y+.23,z+.027);for(const yy of [.03,.21,.42])k.box(g,.031,.012,.034,p.pale,x,y+yy,z+.026);}
 for(const x of [-.24,0,.24]){panel(k,g,p,{x,y:y+.035,z:z+.027,w:x===0?.13:.09,h:.15,door:true});panel(k,g,p,{x,y:y+.26,z:z+.027,w:x===0?.125:.09,h:.13,door:true,shutters:true});}
 for(const x of [-.16,.16])column(k,g,p,x,y+.45,z+.03,.18,.008);const o=k.mesh(g,new THREE.TorusGeometry(.047,.005,6,48),p.pale,0,y+.54,z+.032);k.cyl(g,.031,.031,.005,p.ochre,0,y+.54,z+.033).rotation.x=Math.PI/2;for(let j=0;j<8;j++){const a=j/8*TAU;k.ball(g,.004,p.pale,Math.sin(a)*.03,y+.54+Math.cos(a)*.03,z+.038);}
 pediment(k,g,p,0,y+.65,z+.017,.43,.10);k.box(g,.005,.06,.008,p.pale,0,y+.79,z);k.box(g,.03,.005,.008,p.pale,0,y+.8,z);
 steps(k,g,p,0,.34,.69,3,.023,.11);return finish(k,g,{lamps:[[-.43,.025,.21],[.43,.025,.21]],visitors:[[-.24,.026,.42],[.10,.026,.40]]});
}
function villa(k,g,p,x,z,w=.19,tall=false){const y=.044,h=tall?.245:.145,d=.17;
 k.box(g,w+.015,.025,d+.025,p.stone,x,y-.01,z);k.box(g,w,h,d,p.mint,x,y+h/2,z);hip(k,g,w+.02,d+.035,.065,y+h,p.tile,p.pale,x,z);
 for(const yy of [y+.015,y+h])k.box(g,w+.02,.008,d+.018,p.pale,x,yy,z);
 for(const xx of [x-w/2,x+w/2])k.box(g,.009,h,.014,p.pale,xx,y+h/2,z+d/2);
 for(const xx of [x-w*.27,x+w*.27])panel(k,g,p,{x:xx,y:y+.025,z:z+d/2+.009,w:w*.24,h:.073,arched:true});
 if(tall){for(const xx of [x-w*.27,x+w*.27])panel(k,g,p,{x:xx,y:y+.16,z:z+d/2+.005,w:w*.22,h:.06});k.box(g,w+.03,.01,.065,p.pale,x,y+.132,z+d/2+.025);balustrade(k,g,p,[x-w/2,z+d/2+.057],[x+w/2,z+d/2+.057],y+.14,.045);}
 for(const dx of [-w*.46,w*.46])column(k,g,p,x+dx,y,z+d/2+.05,.12,.004);
 for(let j=-1;j<=1;j++)archOpening(k,g,p.mint,{w:w/3+.002,h:.12,opening:w/3-.012,rise:.103,d:.012,x:x+j*w/3,y:y,z:z+d/2+.052});
 const s=new THREE.Shape();s.moveTo(-w*.52,0);s.lineTo(w*.52,0);s.lineTo(w*.52,.02);s.bezierCurveTo(w*.20,.02,w*.20,.065,0,.065);s.bezierCurveTo(-w*.2,.065,-w*.2,.02,-w*.52,.02);s.closePath();const crest=extrude(k,g,s,p.mint,.015,z+d/2);crest.position.set(x,y+h-.002,crest.position.z);k.line(g,s.getPoints(32).map(v=>[x+v.x,y+h+v.y,z+d/2+.012]),.003,p.pale);
}
export function taipa(k){const g=new THREE.Group(),p=palette(k);site(k,g,p);disc(k,g,.61,.18,.027,p.water,0,.34);for(let i=0;i<5;i++){const x=(i-2)*.235,z=-.14+Math.abs(i-2)*.035;villa(k,g,p,x,z,.19,i===2);}
 k.box(g,1.13,.009,.11,p.pale,0,.032,.12);for(let i=-15;i<=15;i++)k.box(g,.001,.001,.11,p.stone,i*.035,.037,.12);
 return finish(k,g,{lamps:[[-.49,.026,.15],[0,.026,.15],[.49,.026,.15]],visitors:[[-.19,.026,.15],[.31,.026,.12],[.06,.026,.11]]});}
