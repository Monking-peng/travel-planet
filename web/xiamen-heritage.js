import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hip,skin,TAU,edge,window,railing,palm,granite,sea,hall,minnanRoof} from './xiamen-kit.js';
function octagonRoof(k,g,p,r,y,h){
 const sample=(u,v)=>{const a=u*TAU,sector=TAU/8,local=((a+sector/2)%sector)-sector/2,t=.002+v*.998,rr=r*Math.cos(sector/2)/Math.cos(local)*t;return [Math.sin(a)*rr,y+h*(1-t)**1.3+.018*t**7*(Math.abs(local)/(sector/2))**6,Math.cos(a)*rr];};skin(k,g,sample,12,96,p.tile);
 k.line(g,Array.from({length:96},(_,i)=>sample(i/96,1)),.002,edge(k,p.tile.color),true);
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;k.line(g,[[Math.sin(a)*r*.20,y+h*.81,Math.cos(a)*r*.20],[Math.sin(a)*r*.68,y+h*.20,Math.cos(a)*r*.68],[Math.sin(a)*r,y+.021,Math.cos(a)*r],[Math.sin(a)*r*1.06,y+.053,Math.cos(a)*r*1.06]],.0028,p.pale);}
}
export function putuo(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.64,.61);paving(k,g,p,.44,.49);sea(k,g,p,.30,.11,0,.39);
 const lotus=k.mat('#80a16d',.9),flower=k.mat('#cf998e',.9);for(let i=0;i<13;i++){const a=i*2.4,x=Math.sin(a)*.25,z=.39+Math.cos(a)*.075;const leaf=k.mesh(g,new THREE.CircleGeometry(.016,18),lotus,x,.028,z);leaf.rotation.x=-Math.PI/2;if(i%3===0)k.ball(g,.005,flower,x,.032,z);}
 hall(k,g,p,{z:.16,w:.49,d:.18,h:.12});hall(k,g,p,{z:-.08,y:.07,w:.50,d:.26,h:.18,double:true});steps(k,g,p,0,.055,.25,4,.05,.055);
 for(const x of [-.35,.35]){const side=new THREE.Group();side.position.set(x,0,-.02);side.rotation.y=Math.PI/2;g.add(side);hall(k,side,p,{w:.43,d:.13,h:.10});}
 const oct=new THREE.Group();oct.position.set(0,.11,-.36);g.add(oct);k.cyl(oct,.155,.17,.035,p.stone,0,.0175,0,8);k.cyl(oct,.116,.116,.15,p.red,0,.11,0,8);
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;const group=new THREE.Group();group.position.set(Math.sin(a)*.11,.11,Math.cos(a)*.11);group.rotation.y=a;oct.add(group);window(k,group,p,0,0,0,.045,.088);k.cyl(oct,.004,.005,.18,p.red,Math.sin(a)*.13,.125,Math.cos(a)*.13,8);}
 octagonRoof(k,oct,p,.19,.205,.085);k.cyl(oct,.105,.105,.05,p.red,0,.29,0,8);octagonRoof(k,oct,p,.145,.32,.08);k.cyl(oct,.068,.068,.03,p.red,0,.40,0,8);octagonRoof(k,oct,p,.105,.425,.075);k.cyl(oct,.002,.010,.044,p.gold,0,.518,0,12);
 steps(k,g,p,0,-.22,.16,6,.105,.12);sign(k,g,'南普陀寺',.095,.027,0,.14,.254,{background:'#674b2d',color:'#ebd69d'});
 grove(k,g,(x,z)=>ground(x,z)+.018,[[-.46,-.32,.23],[.45,-.32,.22],[-.28,-.46,.21],[.28,-.47,.22],[-.45,.16,.16],[.44,.17,.15]]);
 return finish(k,g,{lamps:[[-.25,.025,.29],[.25,.025,.29],[-.25,.025,-.22],[.25,.025,-.22]],visitors:[[-.06,.025,.27],[.12,.025,.27],[.22,.025,.02],[-.10,.025,-.16]]});
}
export {jiannan} from './xiamen-jiannan.js';
function campusWing(k,g,p,x,z,w=.30){
 k.box(g,w,.25,.14,p.brick,x,.16,z);for(const side of [-1,1]){for(let j=0;j<3;j++)for(let i=0;i<6;i++)window(k,g,p,x+(i/5-.5)*w*.88,.079+j*.076,z+side*.071,.020,.045);for(let i=0;i<7;i++)k.box(g,.009,.25,.012,p.pale,x+(i/6-.5)*w,.16,z+side*.071);}minnanRoof(k,g,p,w+.065,.20,.065,.285,x,z);
}
export function jimei(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.66,.56);paving(k,g,p,.50,.40);sea(k,g,p,.49,.21,0,.22);k.box(g,.92,.015,.04,p.stone,0,.032,-.01);railing(k,g,p,[[-.46,.04,.015],[.46,.04,.015]],.035);
 campusWing(k,g,p,-.18,-.18,.38);campusWing(k,g,p,.28,-.18,.22);
 const tower=new THREE.Group();tower.position.set(.09,.035,-.18);g.add(tower);
 for(const [y,w,h]of [[0,.18,.39],[.39,.15,.12],[.51,.12,.095],[.605,.087,.075]]){k.box(tower,w,h,w,p.wall,0,y+h/2,0);for(const side of [-1,1])for(let j=0;j<Math.max(1,Math.round(h/.065));j++)for(let i=0;i<3;i++)window(k,tower,p,(i-1)*w*.25,y+(j+.5)*h/Math.max(1,Math.round(h/.065)),side*(w/2+.001),w*.13,.035);for(const x of [-1,1])for(const z of [-1,1])k.box(tower,.008,h,.008,p.pale,x*w/2,y+h/2,z*w/2);if(y>.50)minnanRoof(k,tower,p,w+.030,w+.030,.030,y+h);else {k.box(tower,w+.020,.012,w+.020,p.pale,0,y+h,0);for(const side of [-1,1])railing(k,tower,p,[[-w/2,y+h,side*w/2],[w/2,y+h,side*w/2]],.022);}}
 k.cyl(tower,.002,.007,.041,p.gold,0,.730,0,8);
 for(const x of [-.20,.27]){const pag=new THREE.Group();pag.position.set(x,.033,.24);g.add(pag);k.box(pag,.145,.017,.14,p.pale,0,.01,0);for(const xx of [-.050,.05])for(const zz of [-.05,.05])k.cyl(pag,.0035,.0045,.09,p.red,xx,.063,zz,8);minnanRoof(k,pag,p,.18,.18,.06,.115);k.box(g,.018,.018,.23,p.pale,x,.044,.11);}
 for(const x of [-.43,-.29,.38])palm(k,g,p,x,.025,-.045,.17);
 grove(k,g,(x,z)=>ground(x,z)+.018,[[-.48,-.26,.14],[.45,-.29,.15]]);sign(k,g,'集美学村',.12,.025,-.2,.245,-.104);
 return finish(k,g,{lamps:[[-.43,.025,-.03],[.42,.025,-.03]],visitors:[[-.17,.043,.21],[.28,.043,.21],[-.34,.025,-.045]]});
}
