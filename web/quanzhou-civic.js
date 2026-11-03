import * as THREE from 'three';
import {palette,site,paving,grove,finish,hall,lit,pointedPortal,sign,TAU,sea,railing,hip} from './quanzhou-kit.js';
export function qingjing(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.62,.55);paving(k,g,p,.50,.43);p.stone=k.mat('#b6b8ab',.98);p.pale=k.mat('#d1cfbd',.95);
 pointedPortal(k,g,p,{x:.14,z:.23,w:.31,h:.45,d:.115,r:.086,spring:.225});pointedPortal(k,g,p,{x:.14,z:.155,w:.235,h:.335,d:.026,r:.066,spring:.13});
 k.box(g,.34,.22,.040,p.stone,-.185,.135,.23);k.box(g,.09,.22,.040,p.stone,.34,.135,.23);
 // The old prayer hall is roofless: perimeter masonry and freestanding columns.
 k.box(g,.46,.16,.035,p.stone,-.10,.105,-.30);k.box(g,.035,.16,.40,p.stone,-.33,.105,-.10);
 for(let j=0;j<6;j++){const xx=-.28+j*.067;k.box(g,.034,.086,.002,lit(k,'#687166',.12),xx,.093,-.281);k.mesh(g,new THREE.CircleGeometry(.017,16,0,Math.PI),p.wood,xx,.136,-.279);}
 for(const x of [-.22,-.06,.10])for(const z of [-.17,-.02]){k.cyl(g,.010,.013,.12,p.stone,x,.087,z,12);k.box(g,.034,.018,.034,p.pale,x,.150,z);}
 for(let j=1;j<9;j++)k.box(g,.34,.0008,.001,p.wood,-.185,.025+j*.025,.251);
 const frame=k.mat('#645845',.9);for(let i=0;i<13;i++)k.box(g,.0015,.17,.002,frame,.14+(i/12-.5)*.16,.111,.292);k.box(g,.17,.002,.003,frame,.14,.17,.293);
 // A modest later Chinese prayer hall is distinct from the medieval stone gate.
 const q={...p,tile:k.mat('#637065',.9),wall:k.mat('#d4cfad',.94)};hall(k,g,q,{x:.25,z:-.21,w:.21,d:.15,h:.10});
 sign(k,g,'清净寺',.055,.020,.34,.145,.252,{background:'#3c5151',color:'#ebdfb9'});grove(k,g,h,[[.46,-.23,.17],[-.47,-.20,.16],[.40,.02,.14],[-.40,.35,.12]]);
 return finish(k,g,{lamps:[[-.23,.023,.36],[.32,.023,.36],[.35,.023,-.07]],visitors:[[.13,.023,.37],[-.03,.023,.29],[.02,.023,-.12]]});
}
function clockFace(k,g,p,x,y,z,rotation){
 const c=new THREE.Group();g.add(c);c.position.set(x,y,z);c.rotation.y=rotation;
 const face=lit(k,'#d9dfcf',.36),ink=k.mat('#3e5d59',.87);k.mesh(c,new THREE.CircleGeometry(.042,48),face);k.mesh(c,new THREE.TorusGeometry(.042,.002,6,48),ink);
 if(typeof document!=='undefined'){const cv=document.createElement('canvas');cv.width=256;cv.height=256;const ctx=cv.getContext('2d');ctx.clearRect(0,0,256,256);ctx.fillStyle='#2f4d49';ctx.font='22px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach((n,i)=>{const a=i/12*TAU;ctx.fillText(n,128+Math.sin(a)*97,128-Math.cos(a)*97);});const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff');m.map=t;m.transparent=true;m.depthWrite=false;k.mesh(c,new THREE.PlaneGeometry(.081,.081),m,0,0,.002);}
 for(const [a,len] of [[-Math.PI/3,.023],[Math.PI/3,.031]])k.beam(c,[0,0,.004],[Math.sin(a)*len,Math.cos(a)*len,.004],.0017,ink,6);k.ball(c,.0028,ink,0,0,.005);
}
export function clock(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.55,.53);paving(k,g,p,.44,.42);p.pale=k.mat('#dbded0',.88);const road=k.mat('#8e948d',.96);k.box(g,.74,.006,.21,road,0,.024,0);k.box(g,.21,.006,.72,road,0,.025,0);
 const y=.030;g.userData.clockOpenBase=true;
 for(const x of [-.056,.056])for(const z of [-.056,.056]){k.box(g,.018,.15,.018,p.pale,x,y+.075,z);k.box(g,.029,.017,.029,p.pale,x,y+.014,z);k.box(g,.037,.011,.037,p.pale,x,y+.143,z);for(let i=0;i<3;i++)k.box(g,.040+i*.010,.006,.040+i*.010,p.pale,x,y+.152+i*.008,z);}
 k.box(g,.176,.026,.176,p.pale,0,.217,0);k.box(g,.136,.20,.136,p.pale,0,.328,0);
 for(let side=0;side<4;side++){const a=side/4*TAU,c=new THREE.Group();c.rotation.y=a;g.add(c);k.box(c,.043,.070,.004,lit(k,'#53675c',.31),0,.286,.069);for(const x of [-.022,0,.022])k.box(c,.002,.07,.006,p.pale,x,.286,.072);k.box(c,.064,.005,.012,p.pale,0,.325,.068);for(const x of [-.074,.074])k.box(c,.014,.195,.016,p.pale,x,.324,.067);}
 k.box(g,.105,.16,.105,p.pale,0,.48,0);k.box(g,.124,.008,.124,p.pale,0,.564,0);
 for(let side=0;side<4;side++){const a=side/4*TAU;clockFace(k,g,p,Math.sin(a)*.053,.500,Math.cos(a)*.053,a);}
 for(let i=0;i<8;i++){const a=i/8*TAU;k.cyl(g,.003,.003,.065,p.pale,Math.sin(a)*.033,.600,Math.cos(a)*.033,8);}k.cyl(g,.043,.043,.010,p.pale,0,.636,0,8);k.cyl(g,.002,.030,.024,p.pale,0,.653,0,8);k.beam(g,[0,.66,0],[0,.70,0],.0013,p.wood);k.beam(g,[-.018,.685,0],[.018,.685,0],.001,p.wood);
 for(const side of [-1,1])for(let i=0;i<7;i++){k.box(g,.013,.001,.073,p.pale,side*.20+(i-3)*.017,.029,.135);k.box(g,.073,.001,.013,p.pale,.135,.029,side*.20+(i-3)*.017);}
 return finish(k,g,{lamps:[[-.28,.023,.24],[.28,.023,.24],[-.28,.023,-.24],[.28,.023,-.24]],visitors:[[-.22,.023,.24],[.29,.023,.19],[-.25,.023,-.17],[.20,.023,-.23]]});
}
export function luoyang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.72,.53);sea(k,g,p,.68,.46);const pierMat=k.mat('#a3a18b',.99);pierMat.userData.luoyangPiers=true;g.userData.bridgeType='stone-beam';
 // Long stone slabs rest on pointed cutwater piers, with no invented arch spans.
 for(let i=0;i<7;i++){const x=(i-3)*.165;const sh=new THREE.Shape();[[-.039,-.09],[0,-.15],[.039,-.09],[.039,.09],[0,.15],[-.039,.09]].forEach(([a,b],j)=>j?sh.lineTo(a,b):sh.moveTo(a,b));sh.closePath();const ge=new THREE.ExtrudeGeometry(sh,{depth:.138,bevelEnabled:false});ge.rotateX(-Math.PI/2);k.mesh(g,ge,pierMat,x,.027,0);
  for(let j=1;j<6;j++){const points=[[-.039,-.09],[0,-.15],[.039,-.09],[.039,.09],[0,.15],[-.039,.09]].map(([a,b])=>[x+a*1.005,.027+j*.022,b*1.005]);k.line(g,points,.00065,p.wood,true);}
 }
 for(let i=0;i<10;i++){const x=(i-4.5)*.124;for(let j=0;j<4;j++)k.box(g,.124,.023,.040,p.pale,x,.177,(j-1.5)*.041);}
 for(const z of [-.081,.081]){railing(k,g,p,[[-.62,.19,z],[.62,.19,z]],.048);for(let i=0;i<25;i++)k.box(g,.033,.016,.006,p.stone,(i-12)*.050,.216,z);}
 const island=k.cyl(g,.13,.16,.155,p.stone,-.33,.105,-.14,12);k.box(g,.17,.018,.15,p.pale,-.33,.19,-.14);
 for(const x of [-.39,-.27])for(const z of [-.20,-.08])k.cyl(g,.0035,.004,.12,p.red,x,.258,z,8);hip(k,g,.21,.20,.045,.319,p.tile,lit(k,p.tile.color,.34),-.33,-.14);
 const pagoda=new THREE.Group();g.add(pagoda);pagoda.position.set(.48,.194,-.11);for(let j=0;j<4;j++){k.cyl(pagoda,.025-j*.002,.026-j*.002,.031,p.stone,0,.015+j*.042,0,8);k.cyl(pagoda,.019-j*.002,.034-j*.002,.013,p.stone,0,.037+j*.042,0,8);}k.cyl(pagoda,.001,.012,.045,p.stone,0,.19,0,8);
 return finish(k,g,{lamps:[[-.58,.193,.07],[.58,.193,.07]],visitors:[[-.14,.190,.015],[.12,.190,-.018],[.36,.190,.015]]});
}
