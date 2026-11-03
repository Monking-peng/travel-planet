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
export function jiming(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.70,.62);p.ochre.color.set('#c49b3f');
 const hill=k.mat('#7c8b64',.99);hill.userData.landscape=true;disc(k,g,.59,.47,(x,z)=>.019+.16*Math.max(0,1-(x/.59)**2-(z/.47)**2)**1.4,hill,0,-.10);
 for(const [z,y,w]of [[.26,.065,.54],[.03,.145,.65],[-.22,.23,.62]])k.box(g,w,y,.25,p.stone,0,.02+y/2,z);
 hall(k,g,p,{x:-.20,z:.24,y:.085,w:.22,d:.18,h:.12,wall:p.ochre});hall(k,g,p,{x:.23,z:.01,y:.165,w:.26,d:.19,h:.15,wall:p.ochre,double:true});hall(k,g,p,{x:-.23,z:-.17,y:.25,w:.22,d:.27,h:.15,wall:p.ochre});
 const tower=new THREE.Group();g.add(tower);tower.position.set(.07,.245,-.23);
 for(let i=0;i<7;i++){const radius=.096-i*.0065,y=i*.082;k.cyl(tower,radius*.84,radius*.87,.069,p.ochre,0,y+.034,0,8);for(let s=0;s<8;s++){const a=s*TAU/8;k.box(tower,.015,.042,.003,p.wood,Math.sin(a)*radius*.86,y+.035,Math.cos(a)*radius*.86).rotation.y=a;k.cyl(tower,.0025,.0025,.065,p.red,Math.sin(a)*radius*.91,y+.033,Math.cos(a)*radius*.91,6);}octagonalRoof(k,tower,radius*1.45,y+.068,.043,p.tile,p.tile);}
 k.cyl(tower,.001,.013,.078,p.gold,0,.632,0,12);for(let i=0;i<6;i++)k.ring(tower,.010-i*.001,.0012,p.gold,.602+i*.011);k.ball(tower,.007,p.gold,0,.676,0);
 for(const [z,base,rise,length]of [[.50,0,.065,.12],[.26,.065,.08,.11],[.01,.145,.085,.11]]){const stair=new THREE.Group();g.add(stair);stair.position.y=base;steps(k,stair,p,0,z,.14,9,rise,length);}
 grove(k,g,ground,[[-.48,.10,.18],[-.46,-.29,.18],[.46,-.28,.20],[.46,.24,.15],[-.43,.37,.13]]);sign(k,g,'鸡鸣寺',.07,.018,-.20,.194,.337,{background:'#493b28',color:'#dfbc77'});
 return finish(k,g,{lamps:[[-.32,.37],[.32,.25],[-.34,-.04]],visitors:[[.05,.42],[.15,.36]]});
}
