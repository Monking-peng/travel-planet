import * as THREE from 'three';
import {prayerHall} from './beijing-prayer-hall.js';
import {foxiang} from './beijing-foxiang.js';
import {roof,stairs,rail,tree,plaque} from './wuhan-architecture.js';

function palette(k){return {red:k.mat('#973c30',.86),stone:k.mat('#e3d8bd',.88),gold:k.mat('#c58b37',.66,.15),tile:k.mat('#bc7b24',.78),blue:k.mat('#214963',.66,.15),green:k.mat('#476358',.85),trim:k.mat('#73937e',.8),dark:k.mat('#382d27',.9)};}
function hip(k,g,w,d,h,y,p,x=0,z=0){roof(k,g,w,d,h,y,p.tile,p.gold,x,z);k.box(g,Math.max(.008,(w-d)*.85),.007,d*.085,p.tile,x,y+h-.004,z);}
export function hall(k,g,p,{x=0,z=0,w=.35,d=.22,h=.13,y=.025,double=false,name=''}){
  k.box(g,w+.045,.024,d+.045,p.stone,x,y-.012,z);k.box(g,w*.86,h,d*.80,p.red,x,y+h/2,z);
  for(const side of [-1,1])for(let i=0;i<9;i++){
    const xx=x+(i/8-.5)*w*.94;k.cyl(g,.004,.005,h+.012,p.red,xx,y+h/2,z+side*d*.48,8);
    k.box(g,w*.065,h*.69,.004,p.dark,xx,y+h*.43,z+side*d*.407);
    for(let b=0;b<3;b++)k.box(g,.014+b*.005,.004,.012+b*.006,p.trim,xx,y+h-.018+b*.007,z+side*d*.48);
    for(let j=0;j<3;j++)k.box(g,w*.06,.002,.005,p.gold,xx,y+.025+j*h*.18,z+side*d*.414);
  }
  k.box(g,w,.012,d,p.trim,x,y+h-.004,z);hip(k,g,w*1.2,d*1.22,h*.48,y+h,p,x,z);
  if(double){k.box(g,w*.77,.055,d*.73,p.red,x,y+h+.065,z);hip(k,g,w*1.05,d*1.10,h*.47,y+h+.097,p,x,z);}
  if(name)plaque(k,g,name,w*.28,.027,x,y+h*.82,z+d*.495);
}
function court(k,g,p,w,d){k.box(g,w,.016,d,p.stone,0,.008,0);for(let i=-4;i<=4;i++)k.box(g,w,.0008,.0015,p.gold,0,.017,i*d/10);}
function cypress(k,g,x,y,z,s=.08){const bark=k.mat('#6f5941'),leaf=k.mat('#365744',.94);k.cyl(g,.004,.005,s*.7,bark,x,y+s*.3,z,6);const b=k.ball(g,s*.34,leaf,x,y+s*.72,z);b.scale.set(.75,2.0,.75);}
export {palace,tiananmen} from './beijing-palace.js';
export function heaven(k){
  const g=new THREE.Group(),p=palette(k);court(k,g,p,.78,.86);
  for(let level=0;level<3;level++){
    const r=.285-level*.043,y=.032+level*.03;k.cyl(g,r,r+.01,.032,p.stone,0,y,0,96);
    k.ring(g,r-.005,.003,p.stone,y+.035);
    for(let i=0;i<56;i++){const a=i/56*Math.PI*2;if(Math.abs(Math.sin(a*2))<.16)continue;k.cyl(g,.002,.0025,.028,p.stone,Math.cos(a)*(r-.005),y+.021,Math.sin(a)*(r-.005),6);}
  }
  for(let i=0;i<4;i++){const sg=new THREE.Group();sg.rotation.y=i*Math.PI/2;g.add(sg);stairs(k,sg,.055,.18,.10,p.stone,0,.36,15);}
  g.add(prayerHall(k));
  for(const x of [-.31,.31])hall(k,g,{...p,tile:p.blue},{x,z:.12,w:.10,d:.32,h:.055});
  hall(k,g,{...p,tile:p.blue},{z:-.36,w:.26,d:.09,h:.06});hall(k,g,{...p,tile:p.blue},{z:.36,w:.23,d:.08,h:.045});
  for(const x of [-.43,.43])for(let i=0;i<8;i++)cypress(k,g,x,0,(i/7-.5)*.88,.065);
  return k.merge(g);
}
function hill(k,g,x,z,w,d,h,color='#687f56'){
  const mesh=k.mesh(g,new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2),k.mat(color,.98),x,0,z);mesh.scale.set(w,h,d);return mesh;
}
function lake(k,g,w,d,x=0,z=0){const o=k.cyl(g,1,1,.012,k.mat('#507f83',.40,.15),x,.008,z,96);o.scale.set(w,1,d);return o;}
export function summer(k){
  const g=new THREE.Group(),p=palette(k);lake(k,g,.61,.46,0,.16);hill(k,g,0,-.18,.49,.33,.25);
  const landY=(x,z)=>.25*Math.sqrt(Math.max(0,1-(x/.49)**2-((z+.18)/.33)**2));
  for(let i=0;i<64;i++){const a=i*2.4,r=.15+.30*((i*13%61)/61),x=Math.cos(a)*r,z=-.18+Math.sin(a)*r*.63;if(Math.abs(x)<.17||(Math.abs(x)<.39&&z>-.09))continue;tree(k,g,x,landY(x,z),z,.052+(i%4)*.006);}
  for(let j=0;j<4;j++)k.box(g,.31-j*.028,.035,.23-j*.016,p.stone,0,.19+j*.035,-.18);
  for(let i=0;i<23;i++){const z=.12-i*.28/22,y=.25*Math.sqrt(Math.max(0,1-((z+.18)/.33)**2))+.018;k.box(g,.075,.024,.017,p.stone,0,y,z);}
  const tower=foxiang(k);tower.position.set(0,.313,-.18);tower.scale.set(.95,.88,.95);g.add(tower);
  // Stone plinth and white balustrades remain distinct from the red balconies.
  const ashlar=k.mat('#a49778',.95),mortar=k.mat('#8b836e',.97);
  k.box(g,.32,.106,.24,ashlar,0,.258,-.18);
  for(let i=0;i<7;i++){const yy=.212+i*.014;k.box(g,.32,.0008,.001,mortar,0,yy,-.059);for(const side of [-1,1])k.box(g,.001,.0008,.24,mortar,side*.1605,yy,-.18);}
  for(const side of [-1,1])for(let i=0;i<10;i++){const z=-.30+i*.027;k.cyl(g,.0013,.0017,.024,p.stone,side*.16,.330,z,6);}
  for(const side of [-1,1]){k.box(g,.003,.003,.25,p.stone,side*.16,.343,-.18);for(let i=0;i<5;i++){const x=side*(.07+i*.021);k.cyl(g,.0013,.0017,.024,p.stone,x,.330,-.054);}k.box(g,.11,.003,.003,p.stone,side*.11,.343,-.054);}
  for(const x of [-.24,.24]){k.box(g,.24,.04,.13,p.stone,x,.16,.005);hall(k,g,{...p,tile:p.green},{x,z:.005,w:.22,d:.10,h:.045,y:.18});}
  // The Long Corridor follows the dry shoreline below the hill, not the slope.
  k.box(g,.96,.024,.072,p.stone,0,.018,.16);
  for(let i=0;i<25;i++){const x=(i/24-.5)*.92;for(const z of [.14,.18])k.cyl(g,.0025,.003,.052,p.red,x,.054,z,6);}
  const corridorRoof=new THREE.Group();corridorRoof.position.z=.16;g.add(corridorRoof);hip(k,corridorRoof,.98,.075,.022,.080,{...p,tile:p.green});
  // An arched bridge and its small island retain the garden's lake setting.
  const bg=new THREE.Group();bg.position.set(.25,.02,.31);bg.rotation.y=-.55;g.add(bg);
  for(let i=0;i<17;i++){const x=(i/16-.5)*.39,y=.025+.045*Math.sin(i/16*Math.PI);k.box(bg,.028,.012,.045,p.stone,x,y,0);for(const s of [-1,1]){k.box(bg,.003,.018,.003,p.stone,x,y+.015,s*.024);if(i%2===0)k.box(bg,.007,y,.032,p.stone,x,y/2,0);}}
  k.merge(g);
  for(const x of [-.19,.19]){
    const light=new THREE.PointLight('#f3d4a5',0,.48,2);light.position.set(x,.51,.025);light.userData.nightIntensity=.012;g.add(light);
  }
  return g;
}
export function beihai(k){
  const g=new THREE.Group(),p=palette(k);lake(k,g,.43,.36,0,.08);hill(k,g,0,-.05,.25,.23,.19);
  for(let i=0;i<32;i++){const a=i*2.4,r=.11+.12*(i%5)/5,x=Math.cos(a)*r,z=-.05+Math.sin(a)*r;tree(k,g,x,.19*Math.sqrt(Math.max(0,1-(x/.25)**2-((z+.05)/.23)**2)),z,.055);}
  const y=.20;k.box(g,.16,.025,.16,p.stone,0,y,-.05);
  const white=k.mat('#eee6d3',.82,.05);const profile=[[.088,0],[.085,.025],[.073,.038],[.090,.09],[.074,.15],[.046,.18],[.038,.22],[.034,.23]].map(([r,h])=>new THREE.Vector2(r,h));k.mesh(g,new THREE.LatheGeometry(profile,48),white,0,y+.015,-.05);
  for(let i=0;i<10;i++)k.cyl(g,.035-i*.0023,.037-i*.0023,.009,white,0,y+.25+i*.009,-.05,32);k.cyl(g,0,.035,.02,p.gold,0,y+.35,-.05,32);k.ball(g,.008,p.gold,0,y+.37,-.05);
  hall(k,g,{...p,tile:p.green},{z:.16,w:.23,d:.10,h:.07,y:.025});stairs(k,g,.055,.15,.16,p.stone,0,.15,18);
  for(let i=0;i<21;i++){const z=.22+i*.007,yy=.024+.02*Math.sin(i/20*Math.PI);k.box(g,.055,.008,.008,p.stone,0,yy,z);for(const x of [-.028,.028])k.box(g,.003,.025,.003,p.stone,x,yy+.016,z);}
  return k.merge(g);
}
export function drumBell(k){
  const g=new THREE.Group(),p=palette(k);court(k,g,p,.55,.76);
  for(const [z,red] of [[.19,true],[-.22,false]]){
    const brick=red?p.red:k.mat('#89897d');k.box(g,.32,.16,.21,brick,0,.092,z);k.box(g,.335,.012,.225,p.stone,0,.177,z);
    for(const side of [-1,1]){k.box(g,.045,.075,.003,p.dark,0,.054,z+side*.106);}
    hall(k,g,{...p,red:brick,tile:p.green},{z,w:.30,d:.20,h:.13,y:.183,double:red,name:red?'鼓楼':'钟楼'});
    if(!red){hip(k,g,.37,.27,.07,.35,{...p,tile:p.green},0,z);}
  }
  for(const x of [-.23,.23])for(let i=0;i<6;i++)cypress(k,g,x,.02,(i/5-.5)*.67,.06);
  return k.merge(g);
}
