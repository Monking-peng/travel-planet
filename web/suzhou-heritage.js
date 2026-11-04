import * as THREE from 'three';
import {palette,site,disc,pond,steps,grove,hall,hip,archWall,bridge,balcony,sign,finish,lit,edgeLight,TAU} from './suzhou-kit.js';

export {tiger} from './suzhou-tiger.js';
export {hanshan} from './suzhou-hanshan.js';

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
