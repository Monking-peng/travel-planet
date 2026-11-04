import * as THREE from 'three';
import {palette,site,disc,skin,palms,lit,finish,TAU} from './sanya-kit.js';
export const ATLANTIS_BASE=.050;
export const atlantisTop=x=>1.105+.29*Math.exp(-(((x+.205)/.102)**2))+.205*Math.exp(-(((x-.205)/.097)**2));
export function atlantisFront(x){return .015+.042*Math.cos(x/.32*Math.PI)+.014*Math.sin(x/.32*Math.PI)+.083*Math.sqrt(Math.max(.0001,1-(Math.abs(x)/.32)**8));}
export function atlantisBack(x){return .015+.042*Math.cos(x/.32*Math.PI)+.014*Math.sin(x/.32*Math.PI)-.083*Math.sqrt(Math.max(.0001,1-(Math.abs(x)/.32)**8));}
function ribbon(k,g,points,width,height,mat){const a=[],ix=[];for(let i=0;i<points.length;i++){const [x,y,z]=points[i];a.push(x,y-height/2,z-width/2,x,y-height/2,z+width/2,x,y+height/2,z-width/2,x,y+height/2,z+width/2);}for(let i=0;i<points.length-1;i++){const n=i*4,m=n+4;ix.push(n,m,n+1,m,m+1,n+1,n+2,n+3,m+2,m+2,n+3,m+3,n,n+2,m,m,n+2,m+2,n+1,m+1,n+3,m+1,m+3,n+3);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.setIndex(ix);geo.computeVertexNormals();return k.mesh(g,geo,mat);}
function spiralRoof(k,g,p,{x,z,rx,rz,y,from,to,spin}){
 const glass=k.mat('#426d73',.58,.11),roof=k.mat('#e6e4d9',.78,.05),edge=lit(k,'#cabd9c',.28,null,'#e7c188');glass.userData.night={color:new THREE.Color('#e7bd80'),intensity:.12};roof.side=THREE.DoubleSide;
 const at=(u,v)=>{const a=from+(to-from)*u,r=.48+.52*v;return [x+Math.cos(a)*rx*r,y+.020*Math.sin(u*Math.PI)+.006*v,z+Math.sin(a)*rz*r];};skin(k,g,at,12,90,roof);
 const inner=[],outer=[];for(let i=0;i<=90;i++){inner.push(at(i/90,0));outer.push(at(i/90,1));}k.line(g,inner,.0025,edge);k.line(g,outer,.0025,edge);
 for(const r of [.50,.98])skin(k,g,(u,v)=>{const a=from+(to-from)*u;return [x+Math.cos(a)*rx*r,.026+v*(y+.020*Math.sin(u*Math.PI)-.026),z+Math.sin(a)*rz*r];},4,90,glass);
 for(let i=0;i<=28;i++){const u=i/28,a=from+(to-from)*u,yy=y+.020*Math.sin(u*Math.PI);for(const r of [.50,.98])k.box(g,.0026,yy-.026,.0026,p.pale,x+Math.cos(a)*rx*r,(yy+.026)/2,z+Math.sin(a)*rz*r);}
 // Continuous curled canopies connect the low wings to the main lobby.
 const pts=Array.from({length:42},(_,i)=>{const t=i/41,a=to+t*1.25*spin,r=.48*(1-t*.62);return [x+Math.cos(a)*rx*r,y-.010*t,z+Math.sin(a)*rz*r];});ribbon(k,g,pts,.035,.006,roof);
}
export function atlantis(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,p);disc(k,g,.64,.51,.023,p.paving);p.paving.userData.atlantisWalk=true;
 const glass=k.mat('#426c76',.60,.11);glass.side=THREE.DoubleSide;glass.userData.night={color:new THREE.Color('#5b8194'),intensity:.05};glass.userData.atlantisFin=true;
 const balcony=lit(k,'#d8d9d2',.30,null,'#efd7b4');balcony.userData.atlantisBalcony=true;const guard=k.mat('#7b989b',.58,.12),gold=lit(k,'#bb9a60',.64,.4,'#efc470'),window=lit(k,'#77908d',.48,.8,'#e9ca91');gold.userData.atlantisCrown=true;const mullion=k.mat('#779395',.72,.06),roofSurface=k.mat('#758082',.85,.02);roofSurface.userData.atlantisRoof=true;
 for(const fn of [atlantisFront,atlantisBack])skin(k,g,(u,v)=>{const x=-.32+u*.64;return [x,ATLANTIS_BASE+v*(atlantisTop(x)-ATLANTIS_BASE),fn(x)];},48,144,glass);
 skin(k,g,(u,v)=>{const x=-.32+u*.64;return [x,atlantisTop(x),atlantisBack(x)+(atlantisFront(x)-atlantisBack(x))*v];},6,144,roofSurface);
 for(let j=0;j<=9;j++){const v=j/9;k.line(g,Array.from({length:145},(_,i)=>{const x=-.32+i/144*.64;return [x,atlantisTop(x)+.0015,atlantisBack(x)+(atlantisFront(x)-atlantisBack(x))*v];}),.0012,mullion);}
 for(let row=1;row<=54;row++){
  const y=ATLANTIS_BASE+row*.0245,segments=[];let run=[];for(let i=0;i<=160;i++){const x=-.32+i/160*.64;if(y+.004<atlantisTop(x))run.push(x);else if(run.length){segments.push(run);run=[];}}if(run.length)segments.push(run);
  for(const xs of segments){if(xs.length<2)continue;for(const [fn,sign]of [[atlantisFront,1],[atlantisBack,-1]]){ribbon(k,g,xs.map(x=>[x,y,fn(x)+sign*.006]),.017,.0035,balcony);ribbon(k,g,xs.map(x=>[x,y+.006,fn(x)+sign*.012]),.0018,.007,guard);}}
  for(let i=0;i<26;i++){const x=-.30+i*.024;if(y+.018>atlantisTop(x))continue;for(const [fn,sign]of [[atlantisFront,1],[atlantisBack,-1]]){const zz=fn(x)+sign*.0015,angle=Math.atan2(fn(x+.001)-fn(x-.001),.002);if(Math.sin(i*18.21+row*7.33)>.18){const o=k.box(g,.014,.011,.002,window,x,y+.014,zz);o.rotation.y=-angle;}const o=k.box(g,.0012,.023,.002,mullion,x+.010,y+.014,fn(x+.010)+sign*.002);o.rotation.y=-angle;}}
 }
 for(const center of [-.205,.205])for(const [fn,sign]of [[atlantisFront,1],[atlantisBack,-1]]){
  for(let i=0;i<=22;i++){const x=center-.08+i*.16/22,top=atlantisTop(x);k.beam(g,[x,top-.088,fn(x)+sign*.014],[x,top+.003,fn(x)+sign*.014],.0018,gold);}
  ribbon(k,g,Array.from({length:31},(_,i)=>{const x=center-.08+i*.16/30;return [x,atlantisTop(x),fn(x)+sign*.014];}),.004,.003,gold);
 }
 // Rear services spine and end frames interrupt the balconies as in the real tower.
 for(const x of [-.319,.319])k.line(g,[[x,.055,atlantisFront(x)],[x,atlantisTop(x),atlantisFront(x)]],.003,p.pale);
 k.box(g,.052,1.01,.020,glass,.025,.555,atlantisBack(.025)-.010);for(const x of [0,.050])k.box(g,.003,1.01,.004,p.pale,x,.555,atlantisBack(.025)-.022);
 spiralRoof(k,g,p,{x:-.26,z:.19,rx:.23,rz:.17,y:.112,from:-.6,to:4.7,spin:-1});spiralRoof(k,g,p,{x:.27,z:.21,rx:.23,rz:.19,y:.087,from:-1.2,to:3.9,spin:1});
 // Open entrance axis and glazed lobby below a shallow rounded canopy.
 const lobby=k.cyl(g,1,1,.080,glass,0,.066,.35,72);lobby.scale.set(.14,1,.105);disc(k,g,.16,.12,.112,p.white,0,.35);bandLocal(k,g,a=>[Math.cos(a)*.16,.114,.35+Math.sin(a)*.12],gold);
 const entrance=lit(k,'#405c5f',.32,null,'#ebbc73');entrance.userData.atlantisEntrance=true;k.box(g,.084,.077,.004,entrance,0,.065,.455);k.box(g,.002,.073,.007,p.pale,0,.065,.459);k.box(g,.075,.002,.007,p.pale,0,.066,.459);for(const x of [-.007,.007])k.box(g,.0015,.015,.009,gold,x,.064,.460);for(const x of [-.034,.034])k.box(g,.003,.075,.006,p.pale,x,.065,.458);
 for(const x of [-.105,.105])k.cyl(g,.004,.004,.10,p.pale,x,.074,.45,12);
 k.box(g,.15,.006,.13,p.paving,0,.027,.472);for(const x of [-.07,.07])k.line(g,[[x,.032,.53],[x,.032,.42]],.0015,p.pale);
 p.water.userData.landscape=true;p.water.userData.water=true;for(const [x,z,rx,rz]of [[-.48,-.20,.09,.18],[.47,-.21,.105,.17],[-.49,.30,.06,.12],[.49,.30,.06,.12]])disc(k,g,rx,rz,.025,p.water,x,z);
 palms(k,g,p,ground,[[-.55,-.02,.24],[.55,.02,.25],[-.33,.43,.19],[.32,.45,.20],[-.39,-.38,.19],[.40,-.37,.21]]);
 return finish(k,g,{lamps:[[-.15,.027,.48],[.15,.027,.48]],visitors:[[-.045,.030,.50],[.045,.030,.49]]});
}
function bandLocal(k,g,fn,mat){k.line(g,Array.from({length:80},(_,i)=>fn(i/80*TAU)),.002,mat,true);}
