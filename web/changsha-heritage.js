import * as THREE from 'three';
import {roof,plaque,rail,tree} from './wuhan-architecture.js';
import {palette,lattice,balcony,archWall} from './shunde-kit.js';
import {plaza,bollards,people,hill,glow} from './shenzhen-forms.js';

// All roofs have closed ridges. Trim lights belong to the same complete landmark.
function hip(k,g,w,d,h,y,tile,edge,x=0,z=0){
  roof(k,g,w,d,h,y,tile,edge,x,z);
  // The shared eaves stop at an inner ring. Close that actual opening, not a
  // ridge-sized box suspended above it (especially visible on broad halls).
  const vertices=[x,y+h*Math.pow(.92,1.35),z],indices=[],ridge=Math.max(0,w-d)*.42;
  for(let i=0;i<64;i++){const t=i/64,side=Math.floor(t*4),u=(t*4)%1*2-1;let xx,zz;
    if(side===0){xx=u*w/2;zz=d/2;}else if(side===1){xx=w/2;zz=-u*d/2;}else if(side===2){xx=-u*w/2;zz=-d/2;}else{xx=-w/2;zz=u*d/2;}
    vertices.push(x+xx*.08+.92*Math.sign(xx)*ridge,y+h*Math.pow(.92,1.35)+.0002,z+zz*.08);indices.push(0,i+1,(i+1)%64+1);
  }
  const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));cap.setIndex(indices);cap.computeVertexNormals();k.mesh(g,cap,tile);
  for(const s of [-1,1])k.line(g,[[x+s*w*.46,y+.009,z+d*.48],[x+s*w*.50,y+.025,z+d*.50],[x+s*w*.515,y+.044,z+d*.505]],.002,tile);
}
function courtHall(k,g,p,{x=0,z=0,w=.4,d=.2,h=.14,y=.02,tile=p.tile,wall=p.wall,name=''}={}){
  k.box(g,w+.025,.015,d+.04,p.stone,x,y+.0075,z);k.box(g,w*.89,h*.87,d*.79,wall,x,y+.015+h*.435,z);
  for(const side of [-1,1])for(let i=0;i<5;i++){const xx=x+(i/4-.5)*w*.90;k.cyl(g,.004,.004,h,p.wood,xx,y+h/2+.015,z+side*d*.46,8);lattice(k,g,xx,y+h*.50+.015,z+side*d*.400,w*.145,h*.63,p.wood);}
  hip(k,g,w*1.15,d*1.22,h*.43,y+h+.015,tile,p.edge,x,z);
  if(name)plaque(k,g,name,w*.38,.031,x,y+h*.89,z+d*.48);
}
function autumn(k,g,x,y,z,s,p,index){
  k.beam(g,[x,y,z],[x+.008,y+s*.78,z],.0037,p.bark,6);
  for(let j=0;j<5;j++){const a=j*2.4,leaf=k.mesh(g,new THREE.IcosahedronGeometry(s*.31,1),p.leaves[(index+j)%p.leaves.length],x+Math.cos(a)*s*.26,y+s*(.70+(j%3)*.12),z+Math.sin(a)*s*.24);leaf.scale.set(1,.85,1);}
}
export function yuelu(k){
  const g=new THREE.Group(),p=palette(k);p.tile=k.mat('#626b65',.91);p.wall=k.mat('#e2dfca');p.edge=glow(k,'#d9bb80',.32);p.wood=k.mat('#53483a');
  const base=plaza(k,g,.79,.73,'#b3b39a');base.userData.groundSurface=true;
  // Main teaching axis plus the ochre-roofed Confucian temple seen in the aerial reference.
  const mainX=-.20;
  for(const [z,w,h,name] of [[.47,.50,.13,'岳麓书院'],[.10,.54,.15,'实事求是'],[-.32,.51,.21,'御书楼']])courtHall(k,g,p,{x:mainX,z,w,d:.19,h,name});
  for(const x of [-.49,.09]){courtHall(k,g,p,{x,z:.29,w:.115,d:.26,h:.105});courtHall(k,g,p,{x,z:-.105,w:.115,d:.24,h:.105});}
  const ochre=k.mat('#b99153',.80),red=k.mat('#a36958');
  for(const z of [.36,-.10])courtHall(k,g,p,{x:.41,z,w:.30,d:.20,h:z>0?.14:.19,tile:ochre,wall:red,name:z>0?'文庙':'大成殿'});
  for(const x of [.24,.58])courtHall(k,g,p,{x,z:.11,w:.075,d:.27,h:.092,tile:ochre,wall:red});
  // The entrance screen has a genuine opening rather than a painted dark rectangle.
  archWall(k,g,{w:.51,h:.136,d:.019,x:mainX,y:.035,z:.575,mat:p.wall,openings:[{r:.042,spring:.075}]});
  for(const x of [mainX-.22,mainX+.22]){k.box(g,.018,.190,.025,p.wall,x,.130,.575);hip(k,g,.057,.057,.013,.225,p.tile,p.tile,x,.575);}
  plaque(k,g,'岳麓书院',.15,.035,mainX,.147,.588);
  for(let i=0;i<6;i++)k.box(g,.30,.005*(i+1),.018,base,mainX,.0025*(i+1),.690-i*.018);
  for(const [x,z,s] of [[-.20,.29,.11],[-.20,-.10,.12],[-.63,-.34,.13],[-.61,.24,.11],[.68,-.36,.13],[.62,.46,.10],[.11,-.56,.14],[-.36,-.61,.14]])tree(k,g,x,.015,z,s);
  bollards(k,g,[[-.38,.61],[-.04,.61],[.17,.39],[.16,-.25]],'#e3c48a');people(k,g,[[-.23,.62],[-.18,.65],[-.30,.29],[.42,.20]]);
  return k.merge(g);
}

export function aiwan(k){
  const g=new THREE.Group(),p=palette(k);p.edge=glow(k,'#e9cb8d',.55);p.tile=k.mat('#427767',.65,.20);p.red=k.mat('#9c5143');p.bark=k.mat('#75654c');p.leaves=['#a45737','#be743c','#8f773e','#62805b'].map(c=>k.mat(c,.96));
  const elevation=hill(k,g,.72,.67,.17,'#758869'),y=.17;
  k.box(g,.42,.018,.40,p.stone,0,y+.009,0);
  for(const x of [-.16,.16])for(const z of [-.15,.15])k.box(g,.015,.23,.015,p.stone,x,y+.13,z);
  for(const x of [-.115,.115])for(const z of [-.105,.105])k.cyl(g,.008,.009,.24,p.red,x,y+.135,z,10);
  for(const side of [-1,1]){k.box(g,.35,.032,.013,p.wood,0,y+.239,side*.15);k.box(g,.013,.032,.32,p.wood,side*.16,y+.239,0);}
  hip(k,g,.52,.50,.10,y+.26,p.tile,p.edge);
  k.box(g,.22,.092,.22,p.wood,0,y+.36,0);
  for(const side of [-1,1]){lattice(k,g,0,y+.36,side*.112,.19,.07,p.red);k.box(g,.20,.006,.006,p.red,0,y+.403,side*.115);}
  hip(k,g,.365,.35,.092,y+.41,p.tile,p.edge);k.ball(g,.010,p.tile,0,y+.515,0);
  plaque(k,g,'爱晚亭',.13,.043,0,y+.36,.118);
  // Continuous stepped approach follows the mound instead of floating above it.
  for(let i=0;i<12;i++){const z=.61-i*.027,h=elevation(0,z);k.box(g,.15,.018,.029,p.stone,0,h+.010,z);}
  for(let i=0;i<27;i++){const a=i*2.399,r=.32+(i%5)*.064,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z>.18&&Math.abs(x)<.12)continue;autumn(k,g,x,elevation(x,z),z,.13+(i%3)*.022,p,i);}
  for(const x of [-.16,.16]){const lamp=new THREE.PointLight('#efbc78',0,.42,2);lamp.userData.nightIntensity=.018;lamp.position.set(x,y+.19,.19);g.add(lamp);}
  bollards(k,g,[[-.12,.58],[.12,.58],[-.22,.30],[.22,.30]],'#edc389');
  // Merge geometry before attaching the small local lights.
  const lights=g.children.filter(o=>o.isLight);k.merge(g);lights.forEach(o=>g.add(o));return g;
}

function pavilion(k,g,p,{x=0,z=0,w=.58,d=.40,base=.10,levels=3,step=.205}={}){
  for(let level=0;level<levels;level++){
    const width=w-level*.08,depth=d-level*.045,y=base+level*step;
    k.box(g,width*.92,step*.70,depth*.70,p.wall,x,y+step*.35,z);
    for(const side of [-1,1])for(let j=0;j<7;j++){const xx=x+(j/6-.5)*width;k.cyl(g,.005,.006,step*.88,p.red,xx,y+step*.44,z+side*depth*.46,8);lattice(k,g,xx,y+step*.42,z+side*depth*.355,width*.10,step*.48,p.wood);}
    k.box(g,width+.052,.012,depth+.052,p.stone,x,y+.006,z);
    for(const side of [-1,1])balcony(k,g,x,z+side*(depth/2+.021),width+.045,y+.012,p.stone);
    for(const s of [-1,1]){k.box(g,.006,.004,depth+.04,p.stone,x+s*(width/2+.02),y+.048,z);for(let i=0;i<7;i++)k.box(g,.004,.038,.004,p.stone,x+s*(width/2+.02),y+.029,z+(i/6-.5)*depth);}
    hip(k,g,width*1.30,depth*1.34,step*.31,y+step*.83,p.tile,p.edge,x,z);
    for(const side of [-1,1])for(const s of [-1,1]){const lamp=k.ball(g,.010,p.lamp,x+s*width*.37,y+step*.71,z+side*depth*.49);lamp.scale.y=1.2;}
  }
}
export function tianxin(k){
  const g=new THREE.Group(),p=palette(k);p.tile=k.mat('#615e4d');p.red=k.mat('#594133');p.wall=k.mat('#d7d1b6');p.stone=k.mat('#727c70');p.edge=glow(k,'#c49a57',.55);p.lamp=glow(k,'#e2bd85',.48);
  const elevation=hill(k,g,.77,.65,.17,'#708162');
  // A substantial old city wall, with masonry courses and a real arched passage.
  archWall(k,g,{w:1.18,h:.23,d:.60,x:0,y:.055,z:.01,mat:p.stone,openings:[{x:0,r:.07,spring:.115}]});
  // The same deep masonry body supports all three pavilions; its arch stays open.
  const mortar=k.mat('#566153');for(let row=0;row<9;row++){const y=.068+row*.025;for(const face of [-.292,.312]){
    if(y<.242)for(const x of [-.335,.335])k.box(g,.51,.0015,.001,mortar,x,y,face);else k.box(g,1.18,.0015,.001,mortar,0,y,face);
    for(let c=0;c<16;c++){const x=-.58+c*.075+(row%2)*.037;if(Math.abs(x)<.08&&y<.24)continue;k.box(g,.001,.023,.001,mortar,x,y+.012,face);}
  }}
  for(let i=0;i<17;i++)k.box(g,.039,.044,.039,p.stone,-.57+i*.071,.309,.30);
  pavilion(k,g,p,{base:.283,z:-.07,w:.46,d:.31,step:.166,levels:3});
  for(const x of [-.46,.46])pavilion(k,g,p,{x,z:-.07,base:.283,w:.24,d:.27,step:.148,levels:2});
  plaque(k,g,'天心阁',.15,.036,0,.735,.05);
  for(const x of [-.62,.60])tree(k,g,x,elevation(x,-.26),-.26,.15);
  for(let i=0;i<10;i++){const x=-.54+i*.030,z=-.39,h=.02+i*.026;k.box(g,.032,h,.10,p.stone,x,h/2,z);}
  for(const [x,z]of [[-.59,.42],[.58,.39],[-.35,-.48],[.34,-.45]])tree(k,g,x,elevation(x,z),z,.11);
  bollards(k,g,[[-.24,.48],[.24,.48],[-.64,-.04],[.64,-.04]]);return k.merge(g);
}
