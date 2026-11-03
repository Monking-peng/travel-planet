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
export function maritime(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.77,.64);sea(k,g,p,.76,.63);const white=lit(k,'#d0d3ca',.09),seam=k.mat('#a3b1ae',.75),glass=lit(k,'#405c67',.045),concrete=k.mat('#a8ae9f',.97);
 k.box(g,1.03,.030,.52,concrete,0,.045,.25);k.box(g,.33,.022,.29,p.pale,0,.048,.49);for(let j=0;j<9;j++)k.box(g,.28,.004,.014,concrete,0,.065+j*.002,.61-j*.022);
 k.box(g,.66,.14,.25,glass,0,.115,.22);for(let i=0;i<20;i++)k.box(g,.002,.14,.004,p.pale,-.32+i*.034,.115,.348);k.box(g,.70,.012,.29,white,0,.188,.22);
 const wings=[[-.40,-.58,.44,.16,.12],[-.20,-.33,.70,.21,.145],[.01,-.03,.76,.23,.15],[.22,.33,.70,.21,.145],[.41,.59,.54,.16,.12]];
 const section=[[-1,0],[-1,.25],[-.97,.55],[-.80,.88],[-.53,1],[.53,1],[.80,.88],[.97,.55],[1,.25],[1,0]];
 function contour(v){const t=v*(section.length-1),i=Math.min(section.length-2,Math.floor(t)),f=t-i;return [THREE.MathUtils.lerp(section[i][0],section[i+1][0],f),THREE.MathUtils.lerp(section[i][1],section[i+1][1],f)];}
 for(let n=0;n<wings.length;n++){const [root,end,L,w,h]=wings[n],cx=t=>root+(end-root)*(t*t*(3-2*t)),zz=t=>.27-L*t,yy=t=>.10+.040*t+.025*Math.sin(t*Math.PI),width=t=>w*(.91+.09*Math.sin(t*Math.PI));
  const point=(t,v)=>{const [a,b]=contour(v);return [cx(t)+a*width(t)/2,yy(t)+b*h*(.83+.17*t),zz(t)];};
  const mesh=skin(k,g,point,22,56,white);mesh.material.side=THREE.DoubleSide;
  for(let i=0;i<=18;i++){const t=i/18;k.line(g,Array.from({length:20},(_,j)=>{const q=point(t,j/19);q[1]+=.0005;return q;}),.00055,seam);}
  for(const v of [.22,.39,.61,.78])k.line(g,Array.from({length:28},(_,i)=>point(i/27,v)),.0005,seam);
  // Flat, fully glazed terminal faces close the hull-shaped cantilevers.
  for(const t of [0,1]){const shape=new THREE.Shape();section.forEach(([a,b],i)=>{const xx=a*width(t)/2,y=b*h*(.83+.17*t);i?shape.lineTo(xx,y):shape.moveTo(xx,y);});shape.closePath();const cap=k.mesh(g,new THREE.ShapeGeometry(shape),glass,cx(t),yy(t),zz(t)+(t?-.0005:.0005));if(t)cap.rotation.y=Math.PI;
   for(let j=-2;j<=2;j++)k.box(g,.0015,h*.70,.002,p.pale,cx(t)+j*w*.13,yy(t)+h*.39,zz(t)+(t?-.001:.001));}
  // Recessed supports expose the tips hovering over the harbor.
  for(const t of [.15,.46])k.box(g,w*.43,.08,.035,concrete,cx(t),.068,zz(t));
 }
 // Elevated connections cross the gaps between the radiating exhibition wings.
 for(const z of [-.02,-.19])k.box(g,.77,.013,.031,p.pale,0,.160,z);
 for(let i=0;i<9;i++)k.box(g,.002,.034,.003,p.pale,-.36+i*.09,.184,-.19);
 k.box(g,.85,.002,.003,p.pale,0,.201,-.19);
 return finish(k,g,{lamps:[[-.40,.061,.40],[.40,.061,.40]],visitors:[[-.08,.061,.39],[.08,.061,.43]]});
}
