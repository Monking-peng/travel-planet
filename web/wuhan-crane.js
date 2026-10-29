import * as THREE from 'three';
import {plaque,stairs} from './wuhan-architecture.js';

// Long pavilion facades and clipped corners, not a stack of circular dishes.
export function crane(k){
 const g=new THREE.Group(),stone=k.mat('#bcb39d',.95),wood=k.mat('#75402e',.82,0,'#b36c36'),shadow=k.mat('#4b342a',.9,0,'#e39a57'),tile=k.mat('#ad7e32',.78,.05,'#b78435'),ridge=k.mat('#bd9143',.73,.05),paint=k.mat('#4a685e',.9),cream=k.mat('#b7aa7b',.8),lit=k.mat('#dab37c',.6,0,'#ffd391');
 wood.userData.night.intensity=.19;shadow.userData.night.intensity=.23;tile.userData.night.intensity=.19;lit.userData.night.intensity=.70;ridge.userData.night={color:new THREE.Color('#bd9143'),intensity:0};
 function outline(w,d){const c=.20;return [[-w/2+c*w,-d/2],[w/2-c*w,-d/2],[w/2,-d/2+c*d],[w/2,d/2-c*d],[w/2-c*w,d/2],[-w/2+c*w,d/2],[-w/2,d/2-c*d],[-w/2,-d/2+c*d]];}
 function slab(w,d,y,h,mat){const shape=new THREE.Shape(outline(w,d).map(([x,z])=>new THREE.Vector2(x,-z)));const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});geo.rotateX(-Math.PI/2);return k.mesh(g,geo,mat,0,y,0);}
 function eave(w,d,y,rise,closed=false){
  const poly=outline(w,d),N=128,M=12,v=[],ix=[];
  function p(t,u){const s=t*8,i=Math.floor(s)%8,f=s-Math.floor(s),a=poly[i],b=poly[(i+1)%8],x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;const corner=Math.pow(Math.abs(f-.5)*2,5);return [x*u,y+rise*(1-u)**1.65+.031*u**7*(.30+.70*corner),z*u];}
  for(let j=0;j<=M;j++)for(let i=0;i<=N;i++)v.push(...p(i/N,(closed?0:.36)+(closed?1:.64)*j/M));
  for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;ix.push(a,a+1,a+N+1,a+1,a+N+2,a+N+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();tile.side=THREE.DoubleSide;k.mesh(g,geo,tile);
  for(let i=0;i<N;i++)k.line(g,Array.from({length:9},(_,j)=>{const a=p(i/N,.37+j*.63/8);a[1]+=.0016;return a;}),.00085,ridge);
  k.line(g,Array.from({length:N},(_,i)=>p(i/N,1)),.0023,ridge,true);
  for(let i=0;i<8;i++){const tip=p(i/8,1);k.line(g,[p(i/8,.36),p(i/8,.68),tip,[tip[0]*1.035,tip[1]+.018,tip[2]*1.035]],.0028,ridge);}
  for(const s of [-1,1])k.box(g,w*.65,.003,.006,lit,0,y-.009,s*d*.40);
 }
 slab(.58,.50,-.055,.092,stone);slab(.54,.46,.037,.016,stone);stairs(k,g,.27,.23,.052,stone,0,.40,12);
 for(const side of [-1,1])for(let i=0;i<9;i++){const x=side*(.15+i*.014);k.box(g,.004,.041,.004,stone,x,.073,.235);}
 for(const side of [-1,1])k.box(g,.13,.007,.009,stone,side*.215,.096,.235);
 const window=k.mat('#573d29',.85,0,'#eebc7d');window.userData.night.intensity=.19;
 for(let f=0;f<5;f++){
  const w=.45-f*.026,d=.37-f*.023,y=.055+f*.155,h=f===0?.15:.142,poly=outline(w,d);
  slab(w*.79,d*.79,y,.012,wood);slab(w*.63,d*.60,y+.014,h-.018,shadow);
  for(let i=0;i<8;i++){const a=poly[i],b=poly[(i+1)%8],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.round(len/.070));
   for(let j=0;j<n;j++){const t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;k.cyl(g,.0048,.0058,h,wood,x,y+h/2,z,10);k.box(g,.018,.006,.018,cream,x,y+.009,z);k.box(g,.019,.007,.019,paint,x,y+h-.016,z);k.box(g,.028,.005,.025,wood,x,y+h-.008,z);}
   k.beam(g,[a[0],y+h-.017,a[1]],[b[0],y+h-.017,b[1]],.004,paint,6);
   const posts=Math.max(3,Math.round(len/.017));for(let j=0;j<=posts;j++){const t=j/posts,x=(a[0]+(b[0]-a[0])*t)*1.015,z=(a[1]+(b[1]-a[1])*t)*1.015;k.box(g,.0024,.032,.0024,wood,x,y+.024,z);}
   for(const yy of [.013,.041])k.beam(g,[a[0]*1.015,y+yy,a[1]*1.015],[b[0]*1.015,y+yy,b[1]*1.015],.0025,wood);
   for(let j=0;j<4;j++){const t=(j+.5)/4,x=(a[0]+(b[0]-a[0])*t)*.64,z=(a[1]+(b[1]-a[1])*t)*.64;k.beam(g,[x,y+.036,z],[x,y+h-.025,z],.002,wood);}
  }
  for(const side of [-1,1])for(const q of [-1,0,1]){
   const px=q*w*.14,zz=side*d*.303,pw=w*.115,ph=h*.43,yy=y+h*.53;
   k.box(g,pw,ph,.003,window,px,yy,zz);
   for(const off of [-.5,0,.5]){k.box(g,.0018,ph,.004,wood,px+off*pw,yy,zz+side*.002);k.box(g,pw,.0018,.004,wood,px,yy+off*ph,zz+side*.002);}
   for(const off of [-1,1])k.beam(g,[px-pw*.34,yy+off*ph*.27,zz+side*.002],[px+pw*.34,yy-off*ph*.27,zz+side*.002],.0009,cream);
  }
  eave(w+.14,d+.14,y+h,.054,f===4);if(f===0)eave(w+.20,d+.20,y+.100,.043);
  for(const side of [-1,1])for(let i=0;i<11;i++){const x=(i-5)*(w*.75/10);k.box(g,.009,.009,.005,cream,x,y+h-.025,side*d*.495);}
 }
 k.cyl(g,.003,.007,.029,ridge,0,.872,0,10);k.ball(g,.006,ridge,0,.889);
 plaque(k,g,'黄鹤楼',.142,.047,0,.773,.146);plaque(k,g,'气吞云梦',.154,.034,0,.143,.256);
 const lantern=k.mat('#a63f28',.75,0,'#ff9d4d');lantern.userData.night.intensity=.40;
 for(const x of [-.16,-.08,.08,.16]){k.beam(g,[x,.156,.214],[x,.135,.214],.0012,wood);const l=k.ball(g,.010,lantern,x,.123,.214);l.scale.y=1.2;k.cyl(g,.002,.002,.010,ridge,x,.104,.214,6);}
 return k.merge(g);
}
