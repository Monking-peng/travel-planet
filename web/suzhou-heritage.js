import * as THREE from 'three';
import {palette,site,disc,pond,steps,grove,hall,hip,archWall,bridge,balcony,sign,finish,lit,edgeLight,TAU} from './suzhou-kit.js';

export {tiger} from './suzhou-tiger.js';
export {hanshan} from './suzhou-hanshan.js';

export {panmen} from './suzhou-panmen.js';

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
