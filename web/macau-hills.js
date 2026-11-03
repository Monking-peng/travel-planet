import * as THREE from 'three';
import {palette,site,hill,woodland,roof,story,lantern,steps,sign,finish,lit,ellipsoid,panel,pediment,balustrade,hip,TAU} from './macau-kit.js';
export function ama(k){const g=new THREE.Group(),p=palette(k);site(k,g,p);p.tile=k.mat('#41785b',.78);p.blue=p.wood;const terrain=hill(k,g,p,{height:.24,z:-.15,rx:.65,rz:.48,flat:.32,cut:(x,z,top)=>Math.abs(x)<.085&&z>.01?.030+(.245-z)*.48:top});
 woodland(k,g,terrain,[[-.40,-.11,.15],[-.30,-.30,.19],[.35,-.20,.17],[.46,.04,.13],[.23,-.42,.12]]);
 for(const [x,z,s]of [[-.32,.06,.09],[.29,-.05,.11],[-.42,-.21,.12]]){const o=k.mesh(g,new THREE.DodecahedronGeometry(s,1),p.stone,x,terrain(x,z)+s*.38,z);o.scale.set(1,.8,.7);o.rotation.y=x*6;}
 story(k,g,p,{w:.30,d:.21,y:.26,h:.12,x:.10,z:-.24,lanterns:true});
 const y=.085,z=.27;for(const x of [-.13,.13]){k.box(g,.048,.20,.075,p.stone,x,y+.10,z);k.box(g,.068,.015,.09,p.pale,x,y,z);}k.box(g,.32,.07,.075,p.stone,0,y+.235,z);roof(k,g,p,.42,.16,.055,y+.275,0,z);
 sign(k,g,'媽祖閣',.23,.040,0,y+.235,z+.041,{background:'#aca283',color:'#e9c761'});for(const x of [-.13,.13])lantern(k,g,p,x,y+.206,z+.061,.016);
 steps(k,g,p,0,.48,.36,6,.060,.15);for(let j=0;j<15;j++)k.box(g,.11,.012,.024,p.pale,0,.035+(j+1)*.012,.22-j*.025);
 k.cyl(g,.025,.033,.035,p.dark,-.20,.055,.34,16);k.cyl(g,.033,.028,.01,p.gold,-.20,.075,.34,16);for(const x of [-.23,-.17])k.beam(g,[x,.05,.34],[x,.027,.34],.003,p.dark);
 return finish(k,g,{lamps:[[-.35,.026,.32],[.34,.026,.32]],visitors:[[-.06,.026,.47],[.19,.026,.45]]});}
export function guia(k){const g=new THREE.Group(),p=palette(k);site(k,g,p);const terrain=hill(k,g,p,{height:.17,flat:.46,cut:(x,z,top)=>Math.abs(x+.19)<.13&&z>.205?.015+(.46-z)/.25*.17:top});woodland(k,g,terrain,[[-.44,-.25,.15],[.37,-.31,.13],[-.48,.05,.12],[.43,.12,.12]]);const y=.19;
 k.box(g,.76,.055,.54,p.pale,0,y-.02,0);for(const [x,z,w,d]of [[-.37,0,.018,.54],[.37,0,.018,.54],[0,-.26,.76,.018]])k.box(g,w,.065,d,p.wall,x,y+.04,z);
 steps(k,g,p,-.19,.46,.23,10,.17,.25);
 const tx=.16,tz=-.04,h=.54;k.cyl(g,.083,.10,h,p.wall,tx,y+h/2,tz,64);k.cyl(g,.103,.103,.017,p.ochre,tx,y+h-.045,tz,64);k.cyl(g,.104,.104,.016,p.pale,tx,y+h+.02,tz,64);
 const rail=(height,r)=>{const sub=new THREE.Group();sub.position.set(tx,0,tz);g.add(sub);k.ring(sub,r,.0018,p.dark,height);for(let i=0;i<18;i++){const a=i/18*TAU;k.beam(sub,[Math.cos(a)*r,height-.045,Math.sin(a)*r],[Math.cos(a)*r,height,Math.sin(a)*r],.0012,p.dark);}};rail(y+h+.0,.108);
 k.cyl(g,.064,.068,.095,p.blue,tx,y+h+.065,tz,24);for(let i=0;i<10;i++){const a=i/10*TAU;k.beam(g,[tx+Math.cos(a)*.069,y+h+.02,tz+Math.sin(a)*.069],[tx+Math.cos(a)*.065,y+h+.11,tz+Math.sin(a)*.065],.002,p.pale);}
 k.cyl(g,.078,.078,.009,p.ochre,tx,y+h+.12,tz,48);rail(y+h+.09,.082);ellipsoid(k,g,p.steel,tx,y+h+.12,tz,.074,.055,.074);k.ball(g,.018,p.red,tx,y+h+.181,tz);k.beam(g,[tx,y+h+.19,tz],[tx,y+h+.25,tz],.001,p.dark);
 for(const yy of [.17,.37])panel(k,g,p,{x:tx,y:y+yy,z:tz+.096,w:.027,h:.046,arched:true});
 k.box(g,.25,.235,.36,p.wall,-.19,y+.117,-.01);hip(k,g,.28,.38,.085,y+.235,p.tile,p.pale,-.19,-.01);pediment(k,g,p,-.19,y+.235,.185,.28,.09);for(const xx of [-.31,-.07])k.box(g,.017,.235,.018,p.ochre,xx,y+.117,.178);
 panel(k,g,p,{x:-.19,y:y+.015,z:.18,w:.075,h:.13,door:true});pediment(k,g,p,-.19,y+.155,.185,.11,.026);for(const [dx,dy]of [[-.012,0],[.012,0],[0,-.012],[0,.012]])k.ball(g,.014,p.dark,-.19+dx,y+.21+dy,.181);
 k.box(g,.004,.045,.008,p.dark,-.19,y+.35,.18);k.box(g,.025,.004,.008,p.dark,-.19,y+.36,.18);
 return finish(k,g,{lamps:[[-.32,y,.21],[.30,y,.20]],visitors:[[-.03,y+.018,.17],[.25,y+.018,.13]]});}
