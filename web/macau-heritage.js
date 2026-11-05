import * as THREE from 'three';
import {palette,site,disc,siteHeight,steps,sign,finish,extrude,archPath,column,pediment,panel,balustrade,calçada,hip,lit,TAU,archOpening} from './macau-kit.js';
export {paul} from './macau-paul.js';
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
export {dominic} from './macau-dominic.js';
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
