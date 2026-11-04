import * as THREE from 'three';
import {palette,site,paving,finish,sea,lit,skin,archOpening,gable,TAU,sign} from './tianjin-kit.js';
export function minyuan(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.76,.55);paving(k,g,p,.70,.48);const stone=lit(k,'#c7b38a',.09),roof=k.mat('#9c6550',.93),shade=lit(k,'#645c47',.065),green=k.mat('#6a875c',.98);k.box(g,.67,.012,.45,green,0,.031,0);for(const x of [-.335,.335]){const grass=k.cyl(g,.225,.225,.012,green,x,.031,0,64);}
 const path=[];for(let i=0;i<14;i++)path.push([-.36+i*.72/13,.32,0]);for(let i=1;i<=13;i++){const a=i/13*Math.PI;path.push([.36+Math.sin(a)*.32,Math.cos(a)*.32,a]);}for(let i=1;i<=13;i++)path.push([.36-i*.72/13,-.32,Math.PI]);for(let i=1;i<13;i++){const a=Math.PI+i/13*Math.PI;path.push([-.36+Math.sin(a)*.32,Math.cos(a)*.32,a]);}
 for(let i=0;i<path.length;i++){
  const [x,z,a]=path[i];if(z>.30&&Math.abs(x)<.13)continue;const next=path[(i+1)%path.length],prev=path[(i+path.length-1)%path.length],angle=Math.atan2(next[0]-prev[0],next[1]-prev[1])-Math.PI/2,w=(Math.hypot(next[0]-x,next[1]-z)+Math.hypot(x-prev[0],z-prev[1]))/2+.008;
  const q=new THREE.Group();q.position.set(x,.025,z);q.rotation.y=angle;g.add(q);
  for(const y of [0,.105]){archOpening(k,q,stone,{w,h:.104,opening:w*.61,rise:.082,d:.060,y});k.box(q,w+.003,.009,.071,stone,0,y+.104,0);for(const xx of [-w*.39,w*.39]){k.cyl(q,.003,.003,.066,p.pale,xx,y+.033,.034,8);k.box(q,.011,.006,.014,p.pale,xx,y+.068,.035);}
   k.box(q,.035,.004,.052,shade,0,y+.098,0);}
  // Each adjacent roof tile meets its neighbor, retaining one continuous arcade.
  const rr=new THREE.Group();rr.rotation.y=Math.PI/2;q.add(rr);gable(k,rr,{...p,red:roof},.088,w+.012,.025,.220,0,0,roof);
 }
 const entrance=new THREE.Group();entrance.position.set(0,.026,.32);g.add(entrance);archOpening(k,entrance,stone,{w:.23,h:.280,opening:.105,rise:.192,d:.11});for(const side of [-1,1]){for(const x of [-.083,.083]){k.box(entrance,.014,.23,.010,p.pale,x,.115,side*.060);k.box(entrance,.026,.010,.023,p.pale,x,.235,side*.060);}k.box(entrance,.255,.012,.012,p.pale,0,.279,side*.062);}
 k.box(entrance,.255,.014,.137,p.pale,0,.287,0);for(const x of [-.098,.098])k.box(entrance,.040,.035,.040,stone,x,.310,0);sign(k,entrance,'民园广场',.13,.035,0,.237,.061,{background:'#c7b38a',color:'#544a38'});
 const rear=new THREE.Group();rear.position.set(0,.025,-.32);g.add(rear);k.box(rear,.12,.24,.09,stone,0,.12,0);gable(k,rear,{...p,red:roof},.145,.12,.035,.247,0,0,roof);archOpening(k,rear,p.pale,{w:.13,h:.15,opening:.055,rise:.12,d:.018,y:0,z:.06});
 for(const x of [-.39,.39])for(const z of [-.18,.18])k.box(g,.08,.018,.06,p.stone,x,.046,z);
 return finish(k,g,{lamps:[[-.32,.024,.40],[.32,.024,.40],[-.31,.024,-.40],[.31,.024,-.40]],visitors:[[-.13,.039,.15],[.08,.039,.11],[.23,.039,-.09],[-.24,.039,-.12],[.04,.039,-.17]]});
}
export {maritime} from './tianjin-maritime.js';
