import * as THREE from 'three';
import {palette,site,skin,disc,ellipse,band,palms,lit,finish,TAU} from './sanya-kit.js';
function island(k,g,p,rx=.67,rz=.25){disc(k,g,rx,rz,.029,p.paving);for(let row=0;row<3;row++)band(k,g,a=>[Math.cos(a)*rx,.030+row*.003,Math.sin(a)*rz],p.stone,.001);}
export function phoenix(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p,{sea:true});island(k,g,p,.685,.265);
 for(let i=0;i<5;i++){
  const cx=(i-2)*.25,cz=-.015+.042*Math.sin(i*.9),H=.75+.035*Math.sin(i*1.7),angle=[.05,.75,.82,.12,.10][i],tower=new THREE.Group();tower.position.set(cx,.035,cz);tower.rotation.y=angle;g.add(tower);
  const glass=k.mat('#4d7276',.44,.16);glass.userData.night={color:new THREE.Color('#78999d'),intensity:.035};glass.userData.phoenixTower=i;const ribs=Array.from({length:7},(_,j)=>lit(k,'#c8cfbf',.65,j*.7+i*.9,['#b0d9dc','#b2c9ec','#e8caa3'][i%3]));
  const point=(a,t)=>{const radius=.72+.28*Math.sin(Math.PI*t*.84),cap=t<.77?1:Math.sqrt(Math.max(.0001,1-((t-.77)/.23)**2)),w=.105*radius*cap,d=.070*radius*cap;return [Math.cos(a)*w+.016*Math.sin(t*Math.PI),t*H,Math.sin(a)*d];};
  skin(k,tower,(u,t)=>point(u*TAU,t),48,80,glass);
  for(let j=1;j<=34;j++){const t=j/35;band(k,tower,a=>point(a,t),ribs[j%7],.00155);}
  for(const side of [-1,1]){const pts=Array.from({length:41},(_,j)=>{const q=point(side*Math.PI/2,j/40);q[0]+=.004*side;return q;});k.line(tower,pts,.003,p.pale);}
  ellipse(k,tower,p.pale,0,.012,0,.106,.014,.075);
 }
 for(const z of [-.21,.21])palms(k,g,p,()=>.030,Array.from({length:7},(_,i)=>[(i-3)*.17,z,.115+(i%2)*.02]));
 return finish(k,g,{lamps:[[-.58,.04,.24],[0,.04,.24],[.58,.04,.24]],visitors:[[-.1,.04,.19],[.12,.04,.18]]});
}
export function atlantis(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p);disc(k,g,.62,.49,.021,p.paving);
 const glass=k.mat('#557d83',.40,.17);glass.userData.night={color:new THREE.Color('#6c8a94'),intensity:.045};glass.userData.atlantisFin=true;
 const rail=lit(k,'#dbd9cd',.11,null,'#dfd5bc'),gold=lit(k,'#b99b66',.75,.4,'#f4cd81'),window=lit(k,'#69898c',.50,.8,'#efcc90');
 const top=x=>1.14+.28*Math.exp(-(((x+.205)/.105)**2))+.18*Math.exp(-(((x-.205)/.10)**2));
 const front=x=>.075+.050*Math.cos(x/.30*Math.PI)+.018*Math.sin(x/.30*Math.PI),back=x=>front(x)-.185;
 const shape=new THREE.Shape();shape.moveTo(-.30,.055);shape.lineTo(.30,.055);for(let j=80;j>=0;j--){const x=-.30+j/80*.60;shape.lineTo(x,top(x));}shape.closePath();
 const shell=new THREE.ExtrudeGeometry(shape,{depth:.185,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:3,curveSegments:40}),a=shell.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i);a.setZ(i,a.getZ(i)+back(x)-.075);}shell.computeVertexNormals();k.mesh(g,shell,glass);
 for(let j=1;j<=48;j++){
  const y=.055+j*.028,segments=[];let run=[];
  for(let i=0;i<=120;i++){const x=-.305+i/120*.61;if(y<top(Math.max(-.30,Math.min(.30,x))))run.push(x);else if(run.length){segments.push(run);run=[];}}if(run.length)segments.push(run);
  for(const xs of segments){if(xs.length<2)continue;const pts=xs.map(x=>[x,y,front(x)-.075+.009]);pts.push(...xs.slice().reverse().map(x=>[x,y,back(x)-.075-.009]));k.line(g,pts,.0020,rail,true);}
  for(let i=0;i<27;i++){const x=-.285+i*.022;if(y+.014>=top(x)||Math.sin(i*18.21+j*7.33)<.22)continue;k.box(g,.014,.011,.0018,window,x,y+.014,front(x)-.075+.0015);}
 }
 // A gold lantern band wraps each crest above the last occupied balconies.
 for(const center of [-.205,.205])for(const side of [-1,1]){
  skin(k,g,(u,v)=>{const x=center+(u-.5)*.17,y=top(x)-.098+v*.098;return [x,y,(side===1?front(x)+.013:back(x)-.013)-.075];},3,34,gold);
 }
 for(let i=0;i<=58;i++){const x=-.29+i*.01,y=top(x);k.beam(g,[x,y-.105,front(x)-.060],[x,y+.003,front(x)-.060],.0015,gold);}
 k.line(g,Array.from({length:81},(_,i)=>{const x=-.30+i/80*.60;return [x,top(x)+.003,front(x)-.075];}),.0022,gold);
 for(const x of [-.299,.299])k.line(g,[[x,.06,front(x)-.075],[x,top(x),front(x)-.075]],.004,rail);
 for(const [x,z,rx,rz,y]of [[-.25,.10,.19,.15,.08],[.22,.12,.20,.17,.06],[0,.31,.16,.115,.045]]){
  const shell=(a,t)=>[x+Math.cos(a)*rx,y+.04*Math.sin(t*Math.PI),z+Math.sin(a)*rz];
  const walls=k.cyl(g,1,1,y,p.glass,x,.026+y/2,z,72);walls.scale.set(rx,1,rz);
  disc(k,g,rx*1.1,rz*1.1,y+.03,p.white,x,z);band(k,g,a=>[x+Math.cos(a)*rx*1.1,y+.034,z+Math.sin(a)*rz*1.1],gold,.002);
  for(let i=0;i<28;i++){const a=i/28*TAU;k.beam(g,[x+Math.cos(a)*rx,.028,z+Math.sin(a)*rz],[x+Math.cos(a)*rx,y+.025,z+Math.sin(a)*rz],.0016,p.pale);}
 }
 p.water.userData.landscape=true;for(const [x,z,rx,rz]of [[-.4,.29,.1,.15],[.40,.27,.1,.15],[-.43,-.23,.11,.17],[.43,-.24,.11,.15]])disc(k,g,rx,rz,.025,p.water,x,z);
 palms(k,g,p,h,[[-.54,.04,.24],[.54,.06,.25],[-.30,.43,.19],[.31,.44,.2],[-.37,-.35,.19],[.39,-.35,.21]]);
 return finish(k,g,{lamps:[[-.15,.025,.42],[.15,.025,.42]],visitors:[[-.09,.025,.43],[.09,.025,.44]]});
}
export function dutyfree(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p);disc(k,g,.69,.53,.022,p.paving);
 const trim=lit(k,'#cad9dd',.6,.3,'#75b7df'),glass=k.glass('#668b87','#ecd2a0',72);glass.userData.night.intensity=.50;const white=p.white;
 for(const cx of [-.295,.295]){
  const outline=a=>{const r=.225+.070*Math.cos(2*a);return [cx+Math.sin(a)*r,Math.cos(a)*r*1.18];},shape=new THREE.Shape();
  const rim=Array.from({length:128},(_,i)=>outline(i/128*TAU));shape.moveTo(...rim[0]);for(const q of rim.slice(1))shape.lineTo(...q);shape.closePath();
  for(const z of [-.17,.17]){const hole=new THREE.Path();hole.absellipse(cx,z,.088,.106,0,TAU,true);shape.holes.push(hole);}
  const roof=new THREE.ShapeGeometry(shape,64),a=roof.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getY(i);a.setXYZ(i,x,.205+.018*Math.cos(z*8),z);}roof.computeVertexNormals();white.side=THREE.DoubleSide;k.mesh(g,roof,white);
  skin(k,g,(u,v)=>{const [x,z]=outline(u*TAU);return [x,.025+v*(.18+.018*Math.cos(z*8)),z];},1,128,glass);
  for(let j=0;j<3;j++)k.line(g,rim.map(([x,z])=>[x,.072+j*.056,z]),.002,p.pale,true);
  k.line(g,rim.map(([x,z])=>[x,.207+.018*Math.cos(z*8),z]),.003,trim,true);
  for(let j=0;j<64;j++){const [x,z]=outline(j/64*TAU);k.beam(g,[x,.025,z],[x,.205+.018*Math.cos(z*8),z],.0016,p.pale);}
  for(const z of [-.17,.17]){const roofGlass=k.mat('#789f9a',.33,.14);roofGlass.userData.night={color:new THREE.Color('#dfcea9'),intensity:.3};
   const pt=(u,v)=>{const a=u*TAU,r=v;return [cx+Math.cos(a)*.088*r,.21+.031*Math.sqrt(Math.max(0,1-r*r)),z+Math.sin(a)*.106*r];};skin(k,g,pt,12,64,roofGlass);
   for(let j=0;j<12;j++)k.line(g,Array.from({length:17},(_,i)=>pt(j/12,i/16)),.0015,p.pale);band(k,g,a=>[cx+Math.cos(a)*.088,.212,z+Math.sin(a)*.106],p.pale,.0023);
  }
 }
 // The open central court remains visible beneath the crossing curved canopy.
 skin(k,g,(u,v)=>{const x=(u-.5)*.33,z=(v-.5)*.09;return [x,.237+.035*Math.sin(u*Math.PI),z];},8,40,white);
 for(const z of [-.045,.045])k.line(g,Array.from({length:21},(_,i)=>{const t=i/20;return [(t-.5)*.33,.237+.035*Math.sin(t*Math.PI),z];}),.002,trim);
 palms(k,g,p,h,[[-.56,-.34,.18],[.56,-.34,.2],[-.56,.33,.18],[.56,.33,.2],[-.13,.43,.18],[.14,.43,.19]]);
 return finish(k,g,{lamps:[[-.4,.024,.41],[0,.024,.41],[.4,.024,.41]],visitors:[[-.06,.024,.26],[.08,.024,.28]]});
}
