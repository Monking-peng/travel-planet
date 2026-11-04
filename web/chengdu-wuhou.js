import * as THREE from 'three';
import {disc,plaque} from './chengdu-kit.js';
function groundHeight(x,z){const t=THREE.MathUtils.smoothstep(Math.hypot(x/.91,z/.84),.86,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .014*(1-t)-sag*t+.002;}
function strip(k,g,material,point,rows,cols){
 const positions=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)positions.push(...point(i/cols,j/rows));
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();material.side=THREE.DoubleSide;k.mesh(g,geo,material);
}
function roofSkirt(k,g,p,{w,d,y,h,inner=.74}){
 const point=(side,u,r,lift=0)=>{
  const t=u*2-1,rr=inner+(1-inner)*r,x=(side%2?w/2:w/2*t)*rr,z=(side%2?d/2*t:d/2)*rr,s=side>1?-1:1;
  return[x*s,y+h*Math.pow(1-r,1.3)+.017*Math.pow(r,5)*Math.pow(Math.abs(t),7)+lift,z*s];
 };
 for(let side=0;side<4;side++){
  strip(k,g,p.tile,(u,r)=>point(side,u,r),12,48);
  const count=side%2?38:82;
  for(let i=0;i<=count;i++)k.line(g,Array.from({length:9},(_,j)=>point(side,i/count,j/8,.0006)),.00055,p.rib);
  k.line(g,Array.from({length:33},(_,j)=>point(side,j/32,1,.001)),.0021,p.edge);
  for(let i=0;i<=count;i++){const a=point(side,i/count,1);k.box(g,.002,.004,.003,p.gold,a[0],a[1]-.003,a[2]);}
 }
}
function gableRoof(k,g,p,{w,d,y,h}){
 const inner=.72,low=y+.036,halfW=w/2*inner,halfD=d/2*inner;
 roofSkirt(k,g,p,{w,d,y,h:.036,inner});
 const point=(s,x,t,lift=0)=>[x,low+(h-.036)*Math.pow(1-t,1.25)+lift,s*halfD*t];
 for(const s of [-1,1]){
  strip(k,g,p.tile,(u,t)=>point(s,(u*2-1)*halfW,t),24,76);
  for(let i=0;i<=84;i++)k.line(g,Array.from({length:10},(_,j)=>point(s,(i/84*2-1)*halfW,j/9,.0006)),.00055,p.rib);
  for(let j=1;j<10;j++)k.line(g,Array.from({length:17},(_,i)=>point(s,(i/16*2-1)*halfW,j/10,.0003)),.0003,p.seam);
 }
 for(const s of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-halfD,low);shape.lineTo(halfD,low);for(let i=0;i<=32;i++){const z=halfD-i/32*2*halfD;shape.lineTo(z,low+(h-.036)*Math.pow(1-Math.abs(z)/halfD,1.25));}shape.closePath();
  const face=k.mesh(g,new THREE.ShapeGeometry(shape),p.gable,s*halfW,0,0);face.rotation.y=s*Math.PI/2;p.gable.side=THREE.DoubleSide;
  const f=new THREE.Group();f.position.x=s*(halfW+.001);f.rotation.y=s*Math.PI/2;g.add(f);
  for(const direction of [-1,1])k.line(f,Array.from({length:25},(_,i)=>{const t=i/24;return[direction*halfD*.80*t,low+h*.20+Math.sin(t*Math.PI*2)*h*.04+(1-t)*h*.12,.001];}),.0011,p.gold);
  const medallion=k.mesh(f,new THREE.CircleGeometry(h*.07,16),p.gold,0,low+h*.25,.002);medallion.scale.y=1.5;
  for(const zsign of [-1,1])k.line(g,Array.from({length:17},(_,i)=>point(zsign,s*halfW,i/16,.002)),.0027,p.ridge);
 }
 k.line(g,[[-halfW-.008,y+h+.011,0],[0,y+h+.003,0],[halfW+.008,y+h+.011,0]],.0035,p.ridge);
 for(const s of [-1,1]){
  k.line(g,[[s*(halfW-.007),y+h+.004,0],[s*(halfW+.006),y+h+.014,0],[s*(halfW+.005),y+h+.032,0],[s*(halfW-.002),y+h+.027,0]],.005,p.ridge);
  for(const zz of [-1,1])for(let i=0;i<5;i++)k.cyl(g,.0014,.003,.006,p.ridge,s*(w*.49-i*.012),y+.012-i*.001,zz*(d*.48-i*.009),8);
 }
}

function lion(k,g,p,x,z){
 k.box(g,.062,.035,.074,p.stone,x,.038,z);k.box(g,.072,.009,.084,p.stone,x,.060,z);
 const body=k.ball(g,.026,p.stone,x,.090,z);body.scale.set(.75,1.24,.85);
 k.ball(g,.021,p.stone,x,.125,z+.009);
 for(let i=0;i<13;i++){const a=i/13*Math.PI*2;k.ball(g,.0055,p.cap,x+.019*Math.sin(a),.125+.018*Math.cos(a),z+.009);}
 for(const s of [-1,1]){k.cyl(g,.005,.007,.038,p.stone,x+s*.013,.084,z+.024,8);k.ball(g,.008,p.stone,x+s*.013,.065,z+.029);k.ball(g,.0025,p.dark,x+s*.007,.129,z+.028);}
 k.ball(g,.008,p.stone,x,.120,z+.030);k.ball(g,.003,p.dark,x,.124,z+.037);
 k.line(g,[[x-.017,.090,z-.015],[x-.028,.108,z-.019],[x-.021,.116,z-.012]],.005,p.stone);
}
function oldTree(k,g,p,x,z,h){
 const rooted=new THREE.Group();rooted.position.y=groundHeight(x,z)-.016;g.add(rooted);g=rooted;
 k.cyl(g,.009,.018,h*.78,p.trunk,x,.016+h*.39,z,10);
 for(let i=0;i<7;i++){
  const a=i*2.399,xx=x+Math.cos(a)*h*.23,zz=z+Math.sin(a)*h*.23,yy=.016+h*(.79+(i%3)*.075);
  k.beam(g,[x,.016+h*.42,z],[xx,yy,zz],.005,p.trunk,7);
  const leaf=k.mesh(g,new THREE.IcosahedronGeometry(h*(.23+(i%2)*.025),2),i%3?p.leaf:p.leafLight,xx,yy,zz);leaf.scale.set(1,.80,1);
 }
}
function bamboo(k,g,x,z,h){
 const stem=k.mat('#738453',.9),leaves=k.mat('#4b7557',.96);
 for(let i=0;i<7;i++){const a=i*2.399,r=.007*Math.sqrt(i),xx=x+Math.sin(a)*r,zz=z+Math.cos(a)*r,high=h*(.72+.04*i);
  k.beam(g,[xx,.018,zz],[xx+.006*Math.sin(a),high,zz+.008*Math.cos(a)],.0019,stem);
  for(let j=2;j<6;j++)for(const side of [-1,1]){const o=k.mesh(g,new THREE.SphereGeometry(.007,6,4),leaves,xx+side*.012,high*j/6,zz);o.scale.set(1.7,.25,.43);o.rotation.z=side*.42;}
 }
}
function wall(k,g,p,x,z,length,angle=0){
 const a=new THREE.Group();a.position.set(x,0,z);a.rotation.y=angle;g.add(a);
 k.box(a,length,.156,.027,p.red,0,.107,0);
 const segments=Math.ceil(length/.025);
 for(let i=0;i<segments;i++){const xx=length*((i+.5)/segments-.5),wx=x+Math.cos(angle)*xx,wz=z-Math.sin(angle)*xx,bottom=groundHeight(wx,wz)-.001,top=.060;k.box(a,length/segments+.0001,top-bottom,.034,p.brick,xx,(top+bottom)/2,0);}
 k.box(a,length+.016,.012,.058,p.tile,0,.191,0);
 for(let i=0;i<=Math.ceil(length/.012);i++){
  const xx=(i/Math.ceil(length/.012)-.5)*length;
  k.line(a,[[xx,.195,-.032],[xx,.207,0],[xx,.195,.032]],.0025,p.rib);
 }
}
function gate(k,g,p,{z=.19,w=.70,h=.22,base=.050,entrance=true}){
 const a=new THREE.Group();a.position.z=z;g.add(a);
 k.box(a,w+.035,.025,.17,p.stone,0,base-.0125,0);
 for(const s of [-1,1]){
  k.box(a,w*.31,h,.045,p.wood,s*w*.31,base+h/2,-.024);
  k.box(a,.025,h+.020,.15,p.brick,s*(w/2+.010),base+(h+.020)/2,0);
  k.box(a,.035,h*.45,.160,p.brick,s*(w/2+.010),base+h*.225,0);
  for(let i=0;i<6;i++){
   const xx=s*(.112+i*.033);if(Math.abs(xx)>w*.46)continue;
   k.box(a,.0018,h*.83,.002,p.panel,xx,base+h*.43,.001);
   for(const yy of [.055,.087,.12,.15])k.ball(a,.0013,p.gold,xx,base+yy,.003);
  }
  for(const yy of [.045,.125,.193])k.box(a,w*.29,.004,.006,p.panel,s*w*.31,base+yy,.004);
 }
 for(const x of [-w*.45,-w*.155,w*.155,w*.45]){
  k.cyl(a,.0065,.0075,h,p.red,x,base+h/2,.071,12);k.cyl(a,.010,.011,.012,p.stone,x,base+.006,.071,10);
  k.box(a,.026,.010,.027,p.wood,x,base+h-.006,.071);
  for(const s of [-1,1])k.line(a,[[x,base+h-.010,.073],[x+s*.023,base+h-.018,.073],[x+s*.039,base+h-.006,.073]],.0023,p.red);
 }
 k.box(a,w,.024,.15,p.wood,0,base+h+.008,0);k.box(a,w,.008,.008,p.red,0,base+h-.004,.079);
 gableRoof(k,a,p,{w:w+.09,d:.285,y:base+h+.022,h:.072});
 for(const y of [base+h+.107,base+h+.119,base+h+.131])k.cyl(a,.005,.008,.008,p.ridge,0,y,0,8);k.ball(a,.005,p.ridge,0,base+h+.140,0);
 if(entrance){
  plaque(k,a,'廟烈昭漢',.21,.041,0,base+h-.035,.083);
  for(const [i,x]of [-.28,-.115,.115,.28].entries()){
   const glow=k.mat('#bb503b',.8,0,'#edb66c');glow.userData.night.intensity=.62;glow.userData.pulse={speed:.70,phase:i*1.5};
   k.cyl(a,.011,.011,.036,glow,x,base+h-.073,.105,6);
   k.cyl(a,.016,.013,.005,p.red,x,base+h-.053,.105,6);k.cyl(a,.013,.016,.005,p.red,x,base+h-.094,.105,6);
   for(let j=0;j<6;j++){const theta=j/6*Math.PI*2;k.beam(a,[x+Math.cos(theta)*.012,base+h-.053,.105+Math.sin(theta)*.012],[x+Math.cos(theta)*.012,base+h-.100,.105+Math.sin(theta)*.012],.0013,p.red);k.beam(a,[x+Math.cos(theta)*.010,base+h-.098,.105+Math.sin(theta)*.010],[x+Math.cos(theta)*.010,base+h-.115,.105+Math.sin(theta)*.010],.0007,p.gold);}
   k.beam(a,[x,base+h-.050,.105],[x,base+h+.004,.105],.0012,p.wood);
  }
 }
 return a;
}
export function wuhou(k){
 const g=new THREE.Group(),p={stone:k.mat('#aaa99b'),cap:k.mat('#83897e'),red:k.mat('#8e3e32'),brick:k.mat('#394943'),wood:k.mat('#392d28'),panel:k.mat('#5e4435'),dark:k.mat('#282b26'),tile:k.mat('#47534d'),rib:k.mat('#65716a'),edge:k.mat('#4f5b53'),ridge:k.mat('#66736a'),seam:k.mat('#35443e'),gable:k.mat('#56615b'),gold:k.mat('#b89b61',.65,.2),leaf:k.mat('#405d43'),leafLight:k.mat('#567451'),trunk:k.mat('#5e5847'),paving:k.mat('#aaa99b')};
 for(const [name,m]of Object.entries(p))m.userData.night={color:new THREE.Color(name.includes('leaf')?'#6f865f':'#e8cda0'),intensity:['tile','rib','ridge'].includes(name)?.014:name==='wood'?.035:.050};
 const terrain=k.mat('#8fa580',.98);terrain.userData.landscape=true;disc(k,g,.91,.84,groundHeight,terrain);
 // A solid level forecourt meets the sloping island instead of floating over it.
 const verts=[],indices=[],N=24,w=.91,d=.97,cz=-.025;
 for(let side=0;side<2;side++)for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=(i/N-.5)*w,z=(j/N-.5)*d+cz;verts.push(x,side?groundHeight(x,z)-.001:.0215,z);}
 const layer=(N+1)**2;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const border=[];for(let i=0;i<=N;i++)border.push(i);for(let j=1;j<=N;j++)border.push(j*(N+1)+N);for(let i=N-1;i>=0;i--)border.push(N*(N+1)+i);for(let j=N-1;j>0;j--)border.push(j*(N+1));
 for(let i=0;i<border.length;i++){const a=border[i],b=border[(i+1)%border.length];indices.push(a,b,a+layer,b,b+layer,a+layer);}
 const base=new THREE.BufferGeometry();base.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));base.setIndex(indices);base.computeVertexNormals();p.paving.side=THREE.DoubleSide;k.mesh(g,base,p.paving);
 // Five-part front elevation, with closed dark side doors and a central real passage.
 gate(k,g,p,{});
 for(let i=0;i<5;i++)k.box(g,.36,.006*(i+1),.014,p.stone,0,.020+.003*(i+1),.340-i*.014);
 for(const s of [-1,1]){
  k.box(g,.24,.030,.092,p.stone,s*.30,.035,.298);lion(k,g,p,s*.47,.34);
  wall(k,g,p,s*.52,.19,.28);wall(k,g,p,s*.65,-.115,.61,Math.PI/2);
 }
 // The inner hall is a compressed glimpse through the entry, not the entire shrine.
 gate(k,g,p,{z:-.33,w:.47,h:.15,base:.041,entrance:false});
 k.box(g,.22,.004,.40,p.stone,0,.024,-.07);
 wall(k,g,p,.40,-.08,.46,Math.PI/2);
 for(let i=0;i<6;i++)bamboo(k,g,.59,-.31+i*.085,.30+(i%3)*.025);
 for(const [x,z,h]of [[-.51,.12,.40],[.53,.15,.41],[-.48,-.26,.39],[.47,-.36,.40],[-.20,-.50,.40],[.15,-.53,.38],[-.58,-.06,.37]])oldTree(k,g,p,x,z,h);
 for(const side of [-1,1])for(let i=0;i<3;i++)k.box(g,.10,.001,.001,p.cap,side*.24,.022,.39+i*.03);
 g.userData={entranceFragment:true,openPassage:true,redWallLane:true};return k.merge(g);
}

