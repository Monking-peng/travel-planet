import * as THREE from 'three';
import {palette,site,paving,disc,roof,lit,sign,archOpening,finish,lattice,lantern,grove} from './dali-kit.js';

export function south(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.75,.64);
 const paved=(x,z)=>{const t=THREE.MathUtils.smoothstep(Math.hypot(x/.65,z/.54),.58,1);return .020*(1-t)+(ground(x,z)+.002)*t;};
 disc(k,g,.65,.54,paved,p.pale);
 for(let j=-5;j<=5;j++){const z=j*.54/6,w=2*.65*Math.sqrt(1-(z/.54)**2);k.line(g,Array.from({length:41},(_,i)=>{const x=(i/40-.5)*w;return [x,paved(x,z)+.001,z];}),.0005,p.stone);}

 const stone=lit(k,'#777e72',.18,'#b6a17b'),joint=k.mat('#a2a592',.97),cap=k.mat('#898d7a',.97),blue=lit(k,'#325c80',.14,'#a2b8bf'),green=lit(k,'#47786b',.12),cream=k.mat('#b8b895',.93),red=lit(k,'#8b392d',.13,'#be8052'),wood=k.mat('#4f3a2e',.94),pane=lit(k,'#342f29',.12),gold=lit(k,'#b4a16a',.65),warm=lit(k,'#c5a16d',.88),tile=lit(k,'#505e58',.24,'#b49c72');stone.userData.southWall=true;
 const floor=k.mat('#a7a795',.96);floor.userData.southPaving=true;
 const supported=(x,z,w,d,top,mat)=>{const geo=new THREE.BoxGeometry(w,1,d,12,1,48),v=geo.attributes.position;for(let i=0;i<v.count;i++)v.setY(i,v.getY(i)>0?(typeof top==='function'?top(x+v.getX(i),z+v.getZ(i)):top):ground(x+v.getX(i),z+v.getZ(i))+.0003);geo.computeVertexNormals();k.mesh(g,geo,mat,x,0,z);};
 supported(0,0,1.30,.42,.0285,stone);const approach=(x,z,edge,start)=>{const t=THREE.MathUtils.smoothstep(Math.abs(z),start,edge);return Math.max(.029*(1-t)+(ground(x,z)+.003)*t,paved(x,z)+.006);};supported(0,0,.28,1.1,(x,z)=>approach(x,z,.55,.25),floor);
 const masonry=(x,w,h,d,opening,rise)=>{
  archOpening(k,g,stone,{w,h,opening,rise,d,x,y:.029});const spring=.029+rise-opening/2;
  for(const z of [-d/2-.001,d/2+.001]){
   for(let j=1;j<h/.022;j++){const y=.029+j*.022,half=y<spring?opening/2:y<spring+opening/2?Math.sqrt((opening/2)**2-(y-spring)**2):0;
    for(const side of [-1,1]){const length=w/2-half;k.box(g,length,.0009,.001,joint,x+side*(w/2+half)/2,y,z);}
    for(let i=0;i<Math.ceil(w/.049);i++){const xx=-w/2+(i+.5+(j%2)*.5)*.049;if(Math.abs(xx)>half+.008&&Math.abs(xx)<w/2-.003)k.box(g,.0008,.021,.001,joint,x+xx,y-.011,z);}
   }
   for(let j=0;j<=30;j++){const a=j/30*Math.PI;const o=k.box(g,.012,.021,.008,cap,x+Math.cos(a)*(opening/2+.010),spring+Math.sin(a)*(opening/2+.010),z);o.rotation.z=a-Math.PI/2;}
   for(const side of [-1,1])k.box(g,.02,spring-.029,.008,cap,x+side*(opening/2+.010),(spring+.029)/2,z);
  }
  k.box(g,w,.018,d+.016,cap,x,.029+h+.009,0);
  for(const side of [-1,1])for(let i=0;i<Math.round(w/.09);i++){const xx=x+(i/(Math.round(w/.09)-1)-.5)*(w-.06),yy=.029+h+.041;k.box(g,.052,.048,.03,stone,xx,yy,side*(d/2-.008));k.box(g,.058,.008,.036,cap,xx,yy+.028,side*(d/2-.008));k.box(g,.011,.014,.002,wood,xx,yy-.007,side*(d/2+.008));}
 };
 masonry(0,.94,.34,.42,.24,.276);for(const side of [-1,1])masonry(side*.56,.18,.28,.26,.082,.195);
 for(const x of [-.651,.651])for(let j=0;j<12;j++)k.box(g,.001,.0009,.26,joint,x,.039+j*.022,0);
 // Paving continues through the two flanking openings as well as the central portal.
 for(const side of [-1,1])supported(side*.56,.03,.105,.82,(x,z)=>approach(x,z,.44,.20),floor);
 for(const z of [-.18,.0,.18]){const pts=[];for(let j=0;j<=32;j++){const a=j/32*Math.PI;pts.push([Math.cos(a)*.119,.185+Math.sin(a)*.119,z]);}k.line(g,pts,.0015,warm);}
 k.box(g,.86,.011,.38,wood,0,.3915,0);
 const beamPattern=(parent,w,y,z)=>{k.box(parent,w,.022,.016,blue,0,y,z);for(const yy of [-.011,.011])k.box(parent,w,.002,.019,cream,0,y+yy,z);const n=Math.round(w/.10);for(let i=0;i<n;i++){const xx=((i+.5)/n-.5)*w,ww=w/n*.82;k.box(parent,ww,.015,.002,green,xx,y,z+.009);for(const side of [-1,1])k.line(parent,[[xx+side*ww*.42,y-.006,z+.011],[xx+side*ww*.30,y,z+.011],[xx+side*ww*.42,y+.006,z+.011]],.001,cream);k.mesh(parent,new THREE.TorusGeometry(.006,.001,4,12),cream,xx,y,z+.011);}};
 const brackets=(parent,w,d,y)=>{for(const side of [-1,1])for(const axis of [0,1]){const len=axis?d:w,n=Math.round(len/.047);for(let i=0;i<=n;i++){const at=(i/n-.5)*len;for(let j=0;j<4;j++){const off=.008*j,x=axis?side*(w/2+off):at,z=axis?at:side*(d/2+off);k.box(parent,.012+j*.009,.006,.014+j*.012,j%2?green:blue,x,y+j*.012,z);k.box(parent,.006,.006,.009,cream,x,y+j*.012-.006,z);}}}};
 const tiers=[[.78,.35,.397,.13,1.02,.58,.075],[.63,.30,.645,.115,.88,.51,.128]];
 for(const [w,d,y,h,rw,rd,rh]of tiers){
  const b=new THREE.Group();b.position.y=y;g.add(b);k.box(b,w*.82,h*.92,d*.65,wood,0,h*.46,0);
  for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side<0?Math.PI:0;b.add(face);
   for(let i=0;i<7;i++){const x=(i-3)*w*.118;k.box(face,w*.091,h*.70,.003,pane,x,h*.43,d*.33+.002);lattice(k,face,x,h*.43,d*.33+.005,w*.085,h*.68,wood);}
   for(let i=0;i<=6;i++){const x=(i/6-.5)*w;k.cyl(face,.006,.0075,h,red,x,h/2,d*.50,12);for(const yy of [.025,h-.018]){k.cyl(face,.0077,.0077,.017,green,x,yy,d*.50,12);k.box(face,.012,.002,.002,cream,x,yy,d*.50+.008);}}
   beamPattern(face,w+.02,h-.008,d*.50);for(let i=0;i<=6;i++)lantern(k,face,p,(i/6-.5)*w,h+.012,d*.62,.013);
  }
  for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side*Math.PI/2;b.add(face);beamPattern(face,d,h-.008,w*.50);for(let i=-1;i<=1;i++)k.cyl(b,.006,.007,h,red,side*w*.50,h/2,i*d*.27,12);}
  for(const side of [-1,1])for(let j=-1;j<=1;j++){const face=new THREE.Group();face.rotation.y=side*Math.PI/2;b.add(face);k.box(face,d*.17,h*.65,.003,pane,j*d*.21,h*.43,w*.413);lattice(k,face,j*d*.21,h*.43,w*.417,d*.16,h*.64,wood);}
  brackets(b,w,d,h+.006);roof(k,b,{...p,tile,pale:cream},rw,rd,rh,h+.054);
  for(const side of [-1,1]){k.box(b,w+.05,.003,.004,warm,0,h+.035,side*(d/2+.03));k.box(b,.003,.003,d+.05,warm,side*(w/2+.03),h+.035,0);}
  // Closely spaced round eave tiles and separate rafters give the double roof its depth.
  for(const side of [-1,1])for(let i=0;i<65;i++){const x=(i/64-.5)*rw*.94,u=Math.abs(x/(rw/2)),yy=h+.054+.04*u**8;k.ball(b,.0023,cream,x,yy,side*rd*.50);k.beam(b,[x,yy-.007,side*rd*.44],[x,yy-.003,side*rd*.50],.0016,red,6);}
  const ridge=(rw-rd)*.48;for(const side of [-1,1]){k.line(b,[[side*ridge,h+.054+rh,0],[side*(ridge+.022),h+.054+rh+.014,0],[side*(ridge+.027),h+.054+rh+.038,0],[side*(ridge+.019),h+.054+rh+.046,0]],.004,cream);}
  for(let j=-3;j<=3;j++){const xx=j*ridge/3;k.cyl(b,.003,.005,.017,cream,xx,h+.054+rh+.010,0,8);k.ball(b,.003,gold,xx,h+.054+rh+.020,0);}
 }
 if(typeof document!=='undefined')for(const [i,char]of [...'邦名獻文'].entries()){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#283d3b';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#7c977c';ctx.lineWidth=4;ctx.strokeRect(5,5,246,246);ctx.font='bold 190px "Microsoft YaHei",sans-serif';ctx.fillStyle='#a6b997';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(char,128,137);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mat=lit(k,'#ffffff',.4);mat.map=tex;mat.emissiveMap=tex;k.mesh(g,new THREE.PlaneGeometry(.078,.086),mat,(i-1.5)*.099,.742,.198);
 }
 sign(k,g,'理大',.126,.057,0,.324,.218,{background:'#7b8378',color:'#bba265'});
 // Raised flowerbeds follow the real approach; the central route stays unobstructed.
 for(const side of [-1,1]){supported(side*.325,.36,.29,.19,.0505,cap);k.box(g,.275,.004,.175,p.leaf,side*.325,.0525,.36);for(let i=0;i<22;i++){const x=side*.325+Math.sin(i*2.4)*.11,z=.36+Math.cos(i*2.4)*.063;k.ball(g,.007,k.mat(i%3?'#9f5969':'#c3aa68'),x,.062,z);}}
 grove(k,g,ground,[[-.62,-.24,.19],[.61,-.25,.18]]);
 return finish(k,g,{lamps:[[-.37,paved(-.37,.49),.49],[.37,paved(.37,.49),.49]],visitors:[[-.055,approach(-.055,.40,.55,.25),.40],[.08,approach(.08,.30,.55,.25),.30],[.025,.029,.15],[.56,approach(.56,.25,.44,.20),.25],[-.24,.397,.17]]});
}
