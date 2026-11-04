import * as THREE from 'three';
import {TAU,disc,skin,hip,sign,finish} from './chongqing-kit.js';

// The auditorium is a tall terraced hall with three circular eaves, not a pavilion.
export function greatHall(k){
 const g=new THREE.Group(),p={land:k.mat('#8e9e78',.98),stone:k.mat('#b5b1a1',.92),wall:k.mat('#cec7ae',.9),white:k.mat('#d6d7c6',.88),red:k.mat('#a34232',.82),teal:k.mat('#257a76',.64,.16),blue:k.mat('#365b65',.8),dark:k.mat('#344944',.7),gold:k.mat('#b49a5f',.55,.28),leaf:k.mat('#70804c',.95)};
 p.land.userData.landscape=true;
 p.teal.userData.night={color:new THREE.Color('#83afa0'),intensity:.10};
 const glow=k.mat('#ceb480',.68,.1,'#efcf96');glow.userData.night.intensity=.56;
 const panes=k.mat('#50635a',.48,.1,'#e2bb7a');panes.userData.night.intensity=.23;panes.userData.pulse={phase:.8,speed:.25};
 const ground=(x,z)=>{const t=THREE.MathUtils.smoothstep(Math.hypot(x/1.13,z/1.12),.83,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .014*(1-t)-sag*t+.002;};
 disc(k,g,1.13,1.12,ground,p.land);
 const rail=(a,b,y)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.027);k.beam(g,[a[0],y+.027,a[1]],[b[0],y+.027,b[1]],.0021,p.white);k.beam(g,[a[0],y+.005,a[1]],[b[0],y+.005,b[1]],.0025,p.white);for(let i=0;i<=n;i++){const t=i/n;k.box(g,.0035,.032,.0035,p.white,a[0]+(b[0]-a[0])*t,y+.016,a[1]+(b[1]-a[1])*t);}};
 const band=(r,y,z,m=p.white)=>{const o=k.ring(g,r,.003,m,y);o.position.z=z;};
 const stair=(x,z,w,bottom,top,count,run)=>{for(let i=0;i<count;i++){const h=bottom+(top-bottom)*(i+1)/count;k.box(g,w,h-.014,run/count+.001,p.stone,x,(h+.014)/2,z-i*run/count);}return z-run;};
 // Three ground terraces connect the ceremonial gate to the main entrance.
 k.box(g,1.79,.078,.68,p.stone,0,.055,-.19);k.box(g,1.69,.008,.65,p.white,0,.098,-.18);
 k.box(g,1.20,.045,.15,p.stone,0,.038,.27);k.box(g,.38,.006,.16,p.stone,0,.064,.26);
 stair(0,.43,.38,.016,.064,7,.12);stair(0,.24,.50,.064,.102,6,.10);
 for(const side of [-1,1]){
  stair(side*.67,.30,.19,.016,.102,12,.27);
  rail([side*.79,.29],[side*.79,-.01],.10);rail([side*.56,.18],[side*.56,.33],.065);
  for(const z of [.48,.66]){k.box(g,.22,.015,.14,p.stone,side*.28,.024,z);k.box(g,.20,.012,.12,p.leaf,side*.28,.037,z);}
 }
 k.box(g,.29,.009,.40,p.stone,0,.020,.62);
 // Tall central portico and the recessed hall wall behind its red columns.
 k.box(g,.66,.39,.48,p.wall,0,.298,-.15);
 k.box(g,.55,.32,.007,panes,0,.29,.094);
 for(let j=0;j<=8;j++){const x=-.276+j*.069;k.cyl(g,.007,.008,.31,p.red,x,.295,.123,10);k.box(g,.022,.014,.024,p.white,x,.454,.123);}
 for(const y of [.14,.22,.30,.38])k.box(g,.55,.003,.007,p.blue,0,y,.099);
 for(let j=0;j<=24;j++)k.box(g,.0018,.32,.009,p.dark,-.275+j*.55/24,.29,.099);
 for(const y of [.12,.47,.495])k.box(g,.69,.012,.53,p.white,0,y,-.14);
 rail([-.33,.14],[.33,.14],.501);
 for(const side of [-1,1]){
  k.box(g,.065,.40,.54,p.wall,side*.345,.30,-.15);
  rail([side*.376,.12],[side*.376,-.39],.501);
 }
 // A smaller front balcony pavilion overlaps the circular drum, as in the photos.
 k.box(g,.42,.093,.11,p.dark,0,.553,.084);
 for(let i=0;i<=8;i++)k.cyl(g,.0035,.004,.088,p.red,-.20+i*.05,.551,.15,8);
 hip(k,g,.48,.18,.039,.604,p.teal,p.teal,0,.10);k.box(g,.42,.007,.012,p.blue,0,.597,.184);k.box(g,.43,.002,.003,glow,0,.604,.188);
 rail([-.22,.17],[.22,.17],.505);
 // Three stepped circular roof drums, with a single tall upper roof and gilt finial.
 const cz=-.19;
 for(const [r,bottom,top,roofR,rise,inner]of [[.325,.494,.70,.375,.047,.292],[.290,.716,.803,.336,.040,.264],[.260,.823,.900,.307,.154,.014]]){
  k.cyl(g,r,r,top-bottom,p.dark,0,(top+bottom)/2,cz,96);
  for(let i=0;i<56;i++){const a=i/56*TAU;k.cyl(g,.0032,.0036,top-bottom-.008,p.red,Math.sin(a)*(r+.003),(top+bottom)/2,cz+Math.cos(a)*(r+.003),6);}
  band(r+.012,bottom+.010,cz);band(r+.012,top-.015,cz,p.blue);
  if(bottom<.6){band(r+.020,bottom+.034,cz);for(let i=0;i<80;i++){const a=i/80*TAU;k.box(g,.003,.033,.003,p.white,Math.sin(a)*(r+.020),bottom+.017,cz+Math.cos(a)*(r+.020));}}
  skin(k,g,(u,v)=>{const a=u*TAU,rr=inner+(roofR-inner)*v;return [Math.sin(a)*rr,top+rise*(1-v)**1.55+.005*v**9,cz+Math.cos(a)*rr];},14,120,p.teal);
  band(roofR,top+.005,cz,p.blue);band(roofR-.003,top+.003,cz,glow);
  for(let i=0;i<80;i++){const a=i/80*TAU;k.line(g,Array.from({length:9},(_,j)=>{const v=.05+.95*j/8,r1=inner+(roofR-inner)*v;return [Math.sin(a)*r1,top+rise*(1-v)**1.55+.005*v**9+.0007,cz+Math.cos(a)*r1];}),.00065,p.teal);}
  for(let i=0;i<56;i++){const a=i/56*TAU;k.box(g,.006,.009,.006,p.white,Math.sin(a)*(roofR-.006),top-.007,cz+Math.cos(a)*(roofR-.006));}
 }
 k.cyl(g,.014,.017,.021,p.gold,0,1.063,cz,24);const finial=k.ball(g,.022,p.gold,0,1.088,cz);finial.scale.y=1.22;k.cyl(g,.002,.005,.018,p.gold,0,1.120,cz,12);
 // Three-floor side wings end in taller double-eaved corner towers.
 for(const side of [-1,1]){
  const x=side*.607,w=.45;k.box(g,w,.32,.27,p.wall,x,.262,-.16);
  for(let floor=0;floor<3;floor++){
   const y=.16+floor*.105;k.box(g,w-.025,.079,.005,panes,x,y,-.019);
   for(let j=0;j<=9;j++){const xx=x-w/2+j*w/9;k.cyl(g,.0035,.004,.087,p.red,xx,y,-.005,6);k.box(g,.012,.006,.016,p.blue,xx,y+.043,-.005);}
   k.box(g,w+.012,.009,.31,p.white,x,y-.047,-.15);rail([x-w/2,-.003],[x+w/2,-.003],y-.044);
  }
  for(const y of [.16,.265,.37]){
   for(const z of [-.24,-.15,-.06]){k.box(g,.003,.065,.035,p.dark,side*.897,y,z);k.box(g,.004,.067,.002,p.white,side*.900,y,z);}
   for(let j=0;j<7;j++){const xx=x-.18+j*.06;k.box(g,.032,.065,.003,p.dark,xx,y,-.297);k.box(g,.002,.067,.004,p.white,xx,y,-.300);}
  }
  hip(k,g,w+.06,.35,.047,.433,p.teal,p.teal,x,-.15);k.box(g,w,.003,.004,glow,x,.434,.024);
  for(const tx of [side*.398,side*.83]){
   k.box(g,.13,.36,.29,p.wall,tx,.282,-.15);
   for(const y of [.172,.285,.397]){k.box(g,.094,.071,.006,panes,tx,y,.001);for(const sx of [-1,1])k.cyl(g,.004,.005,.080,p.red,tx+sx*.052,y,.012,8);rail([tx-.07,.016],[tx+.07,.016],y-.04);}
   hip(k,g,.19,.33,.035,.458,p.teal,p.teal,tx,-.15);
   for(const sx of [-1,1])for(const sz of [-1,1])k.cyl(g,.003,.004,.057,p.red,tx+sx*.052,.502,-.15+sz*.085,8);
   k.box(g,.12,.045,.18,p.dark,tx,.498,-.15);hip(k,g,.17,.26,.055,.530,p.teal,p.teal,tx,-.15);
  }
 }
 // Five-roof, three-opening gate: ornament is concentrated in blue-green beam panels.
 const gz=.83;
 for(const x of [-.32,-.14,.14,.32]){k.box(g,.034,.25,.043,p.red,x,.145,gz);k.box(g,.052,.018,.061,p.stone,x,.025,gz);}
 for(const [x,w,y]of [[0,.285,.292],[-.23,.19,.251],[.23,.19,.251]]){
  k.box(g,w,.048,.043,p.red,x,y-.012,gz);k.box(g,w,.014,.051,p.blue,x,y+.019,gz);k.box(g,w,.008,.053,p.teal,x,y-.030,gz);
  for(let i=0;i<7;i++){const xx=x-w*.44+i*w*.88/6;k.box(g,.012,.012,.002,p.gold,xx,y+.017,gz+.027);k.box(g,.016,.003,.002,p.white,xx,y-.030,gz+.029);}
  hip(k,g,w+.07,.16,.042,y+.034,p.teal,p.teal,x,gz);
 }
 for(const x of [-.32,-.14,.14,.32]){k.box(g,.065,.059,.05,p.red,x,.337,gz);k.box(g,.064,.009,.056,p.blue,x,.371,gz);hip(k,g,.10,.13,.031,.376,p.teal,p.teal,x,gz);const medal=k.mesh(g,new THREE.CircleGeometry(.014,20),p.gold,x,.337,gz+.026);medal.rotation.z=Math.PI/4;}
 sign(k,g,'重庆市人民大礼堂',.25,.031,0,.286,gz+.024,{background:'#a14231',color:'#e1c28a'});
 return finish(k,g,{lamps:[[-.47,.76],[.47,.76],[-.48,.32],[.48,.32],[-.91,-.12],[.91,-.12]],visitors:[[-.06,.75],[.07,.71],[-.12,.37],[.11,.31]]});
}
