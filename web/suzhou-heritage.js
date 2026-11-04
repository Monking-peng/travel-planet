import * as THREE from 'three';
import {palette,site,disc,pond,steps,grove,hall,hip,archWall,bridge,balcony,sign,finish,lit,edgeLight,TAU} from './suzhou-kit.js';

export {tiger} from './suzhou-tiger.js';
export function hanshan(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.63,.57),yellow=k.mat('#be973d',.95),wood=k.mat('#633d30',.89),panel=k.mat('#cfb6a1',.91);disc(k,g,.45,.37,.022,p.pale);
 const tower=new THREE.Group();tower.position.z=-.12;g.add(tower);
 for(let i=0;i<5;i++){
  const w=.305-i*.032,y=.045+i*.146,h=.104;
  k.box(tower,w,h,w,panel,0,y+h/2,0);
  for(const side of [-1,1]){for(let j=0;j<5;j++)k.box(tower,.006,h,.008,wood,(j/4-.5)*w*.94,y+h/2,side*(w/2+.002));for(const yy of [y+.022,y+.075,y+h])k.box(tower,w+.02,.007,.007,wood,0,yy,side*(w/2+.005));balcony(k,tower,0,side*(w*.63),w*1.24,y-.006,p.pale);}
  for(let j=0;j<4;j++){const a=j*Math.PI/2,face=new THREE.Group();face.rotation.y=a;tower.add(face);for(let n=0;n<9;n++){const x=(n/8-.5)*w;k.box(face,.013,.009,.035,wood,x,y+h-.003,w*.51);k.box(face,.021,.005,.047,wood,x,y+h+.006,w*.51);}}
  hip(k,tower,w*1.50,w*1.50,.067,y+h+.009,p.tile,edgeLight(k,p.tile));
 }
 k.cyl(tower,.002,.005,.16,p.gold,0,.89,0,10);for(let i=0;i<8;i++)k.ring(tower,.020-i*.0016,.002,p.gold,.825+i*.016);k.ball(tower,.007,p.gold,0,.975,0);
 for(const side of [-1,1]){k.box(g,.021,.15,.55,yellow,side*.39,.10,0);k.box(g,.038,.015,.58,p.tile,side*.39,.183,0);hall(k,g,p,{x:side*.275,z:.17,w:.14,d:.20,h:.12,wall:yellow});}
 archWall(k,g,{w:.72,h:.17,d:.025,y:.023,z:.32,openings:[{r:.065,spring:.070,bottom:.001}],mat:yellow});hip(k,g,.28,.14,.07,.21,p.tile,edgeLight(k,p.tile),0,.32);
 sign(k,g,'寒山寺',.10,.028,0,.165,.336,{background:'#b69843',color:'#3c392c'});sign(k,tower,'普明宝塔',.092,.023,0,.113,.158,{background:'#60392e',color:'#dbc085'});
 grove(k,g,height,[[-.49,-.25,.23],[.49,-.26,.22]]);
 return finish(k,g,{lamps:[[-.20,.025,.24],[.20,.025,.24]],visitors:[[-.04,.025,.40],[.06,.025,.43]]});
}

export function panmen(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.69,.57);pond(k,g,p,.55,.34,0,.09);
 const wall=k.mat('#777d70',.98);wall.userData.panmenGate=true;
 for(const z of [-.13,.09])archWall(k,g,{w:.88,h:.24,d:.095,y:.024,z,openings:[{x:-.19,r:.084,spring:.073,bottom:.001},{x:.19,r:.058,spring:.070,bottom:.001}],mat:wall});
 for(const side of [-1,1])k.box(g,.095,.24,.31,wall,side*.39,.144,-.02);
 k.box(g,.80,.021,.32,p.stone,0,.275,-.02);
 k.box(g,.15,.018,.58,p.pale,.19,.032,.04);
 for(const z of [-.19,.145])for(let i=0;i<17;i++)k.box(g,.034,.027,.035,wall,(i/16-.5)*.83,.297,z);
 hall(k,g,p,{z:-.02,y:.30,w:.52,d:.27,h:.15});hall(k,g,p,{z:-.02,y:.515,w:.34,d:.20,h:.10});
 sign(k,g,'盘门',.086,.029,0,.424,.123,{background:'#d0cebd',color:'#423f32'});
 const stairs=new THREE.Group();stairs.position.set(.50,0,-.05);stairs.rotation.y=Math.PI/2;g.add(stairs);steps(k,stairs,p,0,.12,.12,15,.265,.42);
 grove(k,g,height,[[-.52,-.28,.19],[.47,-.33,.18]]);
 return finish(k,g,{lamps:[[-.32,.29,.09],[.33,.29,.09]],visitors:[[.15,.288,.02],[.05,.290,-.12]]});
}

export function pingjiang(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.63,.61);pond(k,g,p,.18,.48,0,0);
 for(const side of [-1,1]){k.box(g,.12,.032,.84,p.stone,side*.22,.038,0);for(let i=0;i<3;i++){const z=-.26+i*.25;hall(k,g,p,{x:side*.36,z,w:.20,d:.20,h:.15+(i%2)*.05});}for(let i=0;i<22;i++)k.box(g,.11,.001,.0018,p.pale,side*.22,.055,(i/21-.5)*.81);}
 bridge(k,g,p,{x:0,z:.13,w:.105,length:.48,rise:.105,y:.039});
 for(let i=0;i<=20;i++){const u=i/20,x=(u-.5)*.48,y=.039+.035+.105*Math.sin(u*Math.PI);k.box(g,.023,.004,.101,p.pale,x,y+.001,.13);}
 // A short side canal and flat bridge express the connected old-street bridges.
 k.box(g,.19,.005,.08,p.water,-.24,.025,-.16);k.box(g,.07,.015,.15,p.pale,-.24,.052,-.16);
 const lantern=lit(k,'#aa503b',.65);
 for(const side of [-1,1])for(let i=0;i<3;i++){const z=-.26+i*.25;for(let j=0;j<2;j++)k.cyl(g,.008,.008,.018,lantern,side*.245,.13+j*.026,z+.09,12);}
 sign(k,g,'胡厢使桥',.072,.019,0,.189,.187,{background:'#a6a695',color:'#826d5e'});
 grove(k,g,(x,z)=>height(x,z)+.018,[[-.48,-.39,.18],[.49,.37,.20]]);
 return finish(k,g,{lamps:[],visitors:[[-.05,.180,.13],[.08,.170,.13],[.22,.056,-.15],[-.22,.056,.30]]});
}
