import * as THREE from 'three';
import {palette,site,disc,paving,steps,grove,finish,archWall,hall,octagonalRoof,TAU,sign} from './nanjing-kit.js';
export function zhonghua(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.73,.72);paving(k,g,p,.61,.60);const brick=k.mat('#72776d',.95);brick.userData.cityGate=true;
 for(const z of [.43,.16,-.10]){archWall(k,g,{w:.91,h:.19,d:.065,y:.026,z,mat:brick,openings:[{r:.052,spring:.070,bottom:.001}]});for(let i=0;i<28;i++)k.box(g,.017,.024,.035,brick,(i/27-.5)*.90,.228,z);}
 for(const x of [-.44,.44]){k.box(g,.07,.19,.91,brick,x,.121,0);for(let i=0;i<28;i++)k.box(g,.035,.024,.018,brick,x,.228,(i/27-.5)*.91);}
 // Current Zhonghua Gate has no reconstructed timber gatehouse above the platform.
 const caves=[{r:.055,spring:.075,bottom:.001},...[-.37,-.25,-.13,.13,.25,.37].map(x=>({x,r:.025,spring:.070,bottom:.001})),...Array.from({length:7},(_,i)=>({x:(i-3)*.115,r:.024,spring:.235,bottom:.202}))];
 archWall(k,g,{w:.91,h:.35,d:.23,y:.026,z:-.34,mat:brick,openings:caves});k.box(g,.89,.005,.23,k.mat('#7b8c5e',.97),0,.38,-.34);
 for(const side of [-1,1]){for(let i=0;i<36;i++){const h=.02+.35*(i+1)/36;k.box(g,.09,h,.026,brick,side*.54,.025+h/2,.46-i*.026);}for(let i=0;i<34;i++)k.box(g,.003,.017,.002,p.pale,side*.586,.07+.35*i/34,.46-i*.026);}
 for(const z of [.466,.196,-.064,-.219])for(let row=1;row<10;row++){const yy=.026+row*.017;for(const side of [-1,1])k.box(g,.34,.0007,.0009,p.stone,side*.27,yy,z);}
 sign(k,g,'中华门',.12,.028,0,.155,.466,{background:'#72776d',color:'#d1c9ae'});grove(k,g,ground,[[-.59,-.45,.10],[.59,-.45,.10]]);
 return finish(k,g,{lamps:[[-.28,.52],[.28,.52],[-.25,.03],[.25,-.20]],visitors:[[.13,.32],[-.17,.03],[.23,-.07]]});
}
export {jiming} from './nanjing-jiming.js';
