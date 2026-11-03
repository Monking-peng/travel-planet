import * as THREE from 'three';
import {palette,site,disc,hip,glow,sign,finish,facade,grove} from './chongqing-kit.js';
export function liziba(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.80,.60),wall=k.mat('#c3c4ad',.91),peach=k.mat('#bd8e75',.9),glass=k.mat('#50686a',.39,.2),rail=k.mat('#8e9790',.73),train=k.mat('#79b6ad',.60),frame=k.mat('#d7d7c5',.76);
 // Exact landmark building with a clear station void at middle level.
 const x=.20,z=-.08,w=.44,d=.32;wall.userData.stationMasonry=true;
 k.box(g,w,.23,d,wall,x,.16,z);k.box(g,w,.47,d,wall,x,.59,z);k.box(g,w,.025,d+.035,frame,x,.84,z);
 for(const side of [-1,1])k.box(g,w,.13,.035,peach,x,.342,z+side*(d/2-.0175));
 for(const side of [-1,1])for(let j=0;j<9;j++){const y=.397+j*.049;facade(k,g,w*.88,.035,x,y,z+side*.162,wall,frame,{bays:6,rows:1,lit:glass});for(let i=0;i<3;i++){const bx=x-.13+i*.13;k.box(g,.072,.004,.027,frame,bx,y-.012,z+side*.177);k.box(g,.072,.013,.002,rail,bx,y-.003,z+side*.191);k.box(g,.012,.010,.008,frame,bx+.023,y+.008,z+side*.171);}}
 for(let j=0;j<4;j++)facade(k,g,w*.90,.045,x,.075+j*.05,z+.163,wall,peach,{bays:5,rows:1,lit:glass});
 // Paired monorail beams enter the void along X, with piers below and no rail through walls.
 for(const zz of [-.055,.045]){k.box(g,1.25,.025,.025,rail,-.08,.288,zz);for(const xx of [-.65,-.39,.60]){k.box(g,.034,.25,.035,rail,xx,.15,zz);k.box(g,.082,.018,.11,rail,xx,.273,0);}}
 for(let car=0;car<5;car++){const xx=-.49+car*.145,zz=.045;k.box(g,.136,.065,.056,train,xx,.337,zz);k.box(g,.13,.008,.058,frame,xx,.373,zz);k.box(g,.126,.025,.058,glass,xx,.350,zz);for(let i=0;i<5;i++)k.box(g,.003,.029,.06,frame,xx-.055+i*.0275,.350,zz);if(car===0)k.box(g,.002,.030,.045,glass,xx-.069,.35,zz);k.box(g,.13,.004,.057,p.warm,xx,.321,zz);}
 sign(k,g,'李子坝',.11,.029,x,.382,z+.168,{background:'#678779',color:'#f1eed7'});grove(k,g,height,[[-.54,-.28,.20],[-.30,-.37,.24],[0,-.40,.25],[.48,-.32,.23]]);
 k.box(g,1.12,.008,.15,k.mat('#777e76',.93),0,.026,.29);for(let i=0;i<11;i++)k.box(g,.040,.001,.003,p.pale,-.5+i*.10,.031,.29);
 return finish(k,g,{lamps:[[-.51,.39],[.51,.39]],visitors:[[-.20,.40],[-.11,.41],[.06,.40],[.18,.41]]});
}
export function cableway(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.83,.57);disc(k,g,.77,.51,.018,p.water);const metal=k.mat('#515e59',.69,.28),yellow=k.mat('#ccb65c',.77),glass=k.mat('#526f71',.32,.22),lamp=glow(k,'#f2d6a0',.45,.2,.5);
 for(const x of [-.64,.64]){k.box(g,.24,.055,.35,p.stone,x,.045,0);k.box(g,.18,.10,.23,p.pale,x,.11,0);k.box(g,.15,.055,.235,glass,x,.13,0);k.box(g,.22,.018,.28,p.pale,x,.175,0);for(const z of [-.085,.085]){k.beam(g,[x-.045,.16,z],[x-.028,.53,z],.008,metal);k.beam(g,[x+.045,.16,z],[x+.028,.53,z],.008,metal);}k.box(g,.10,.02,.24,metal,x,.53,0);}
 const sag=x=>.53-.095*(1-(x/.64)**2);
 for(const z of [-.09,-.068,.068,.09])k.line(g,Array.from({length:45},(_,j)=>{const x=-.64+j/44*1.28;return [x,sag(x),z];}),.0018,metal);
 for(const [x,z]of [[-.18,.079],[.24,-.079]]){const top=sag(x),y=top-.15;k.box(g,.15,.087,.085,yellow,x,y,z);k.box(g,.152,.042,.087,glass,x,y+.012,z);for(let i=0;i<5;i++)k.box(g,.002,.044,.090,yellow,x-.070+i*.035,y+.012,z);k.box(g,.16,.007,.095,metal,x,y+.047,z);k.box(g,.158,.007,.093,metal,x,y-.045,z);for(const dx of [-.045,.045])k.beam(g,[x+dx,y+.05,z],[x+dx*.4,top-.005,z],.003,metal);k.box(g,.06,.008,.018,metal,x,top-.004,z);k.box(g,.14,.002,.003,lamp,x,y+.035,z+.046);sign(k,g,'长江索道',.112,.020,x,y-.027,z+.047,{background:'#ccb65c',color:'#913c30'});}
 return finish(k,g);
}
