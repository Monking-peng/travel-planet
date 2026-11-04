import * as THREE from 'three';
import {palette,site,skin,sign,finish,grove,sea,edge,TAU} from './xiamen-kit.js';

function stone(k,color,key){
 const m=k.mat(color,.97);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 szStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nszStone=position;');s.fragmentShader='varying vec3 szStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vec2((szStone.x+szStone.z)*29.0,szStone.y*53.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),aa=max(fwidth(q),vec2(.005));float line=max(1.0-smoothstep(.035,.035+aa.x,min(f.x,1.0-f.x)),1.0-smoothstep(.04,.04+aa.y,min(f.y,1.0-f.y)));float shade=fract(sin(dot(floor(q),vec2(21.7,31.3)))*928.7);diffuseColor.rgb*=.92+shade*.11-line*.15;`);};m.customProgramCacheKey=()=>key;return m;
}
function rock(k,g,p,{x,y,z,rx,ry,rz,seed=1}){
 const geo=new THREE.SphereGeometry(1,48,32),a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i),zz=a.getZ(i),f=1+.05*Math.sin(xx*5+zz*6+seed)+.026*Math.cos(yy*9+xx*4);a.setXYZ(i,xx*rx*f+yy*.014,Math.max(0,(yy+1)*ry*.5),zz*rz*f);}
 geo.computeVertexNormals();k.mesh(g,geo,p.rock,x,y,z);
}
function rail(k,g,p,pts,{cross=true,h=.050}={}){
 for(let j=1;j<pts.length;j++){
  const a=new THREE.Vector3(...pts[j-1]),b=new THREE.Vector3(...pts[j]),n=Math.ceil(a.distanceTo(b)/.070);
  for(let i=0;i<n;i++){
   const u=a.clone().lerp(b,i/n),v=a.clone().lerp(b,(i+1)/n);k.box(g,.009,h+.006,.009,p.white,u.x,u.y+h/2,u.z);k.box(g,.012,.003,.012,p.white,u.x,u.y+h+.003,u.z);
   for(const dy of [.007,h-.006])k.beam(g,[u.x,u.y+dy,u.z],[v.x,v.y+dy,v.z],.0028,p.white,4);
   if(cross)k.beam(g,[u.x,u.y+.008,u.z],[(u.x+v.x)/2,(u.y+v.y)/2+h-.007,(u.z+v.z)/2],.0025,p.white,4);
   if(cross)k.beam(g,[(u.x+v.x)/2,(u.y+v.y)/2+h-.007,(u.z+v.z)/2],[v.x,v.y+.008,v.z],.0025,p.white,4);
  }
 }
 const q=pts.at(-1);k.box(g,.009,h+.006,.009,p.white,q[0],q[1]+h/2,q[2]);
}
function walk(k,g,p,pts,w=.073,{cross=true}={}){
 for(let j=1;j<pts.length;j++){
  const a=new THREE.Vector3(...pts[j-1]),b=new THREE.Vector3(...pts[j]),delta=b.clone().sub(a),len=Math.hypot(delta.x,delta.z),mid=a.clone().add(b).multiplyScalar(.5),angle=Math.atan2(delta.x,delta.z),slope=Math.atan2(delta.y,len);
  const part=new THREE.Group();part.position.copy(mid);part.rotation.y=angle;g.add(part);const floor=k.box(part,w,.022,Math.hypot(len,delta.y)+.003,p.stone,0,-.011,0);floor.rotation.x=-slope;
  const n=Math.ceil(len/.12);for(let i=0;i<=n;i++){const v=a.clone().lerp(b,i/n),col=new THREE.Group();col.position.set(v.x,0,v.z);col.rotation.y=angle;g.add(col);k.box(col,w*.86,v.y-.027,.026,p.pier,0,(v.y-.017)/2,0);}
  const side=new THREE.Vector3(delta.z,0,-delta.x).normalize().multiplyScalar(w/2-.005);for(const s of [-1,1])rail(k,g,p,[a.clone().addScaledVector(side,s).toArray(),b.clone().addScaledVector(side,s).toArray()],{cross});
  for(let i=1;i<n*2;i++){const v=a.clone().lerp(b,i/(n*2));k.beam(g,[v.x-side.x,v.y+.0008,v.z-side.z],[v.x+side.x,v.y+.0008,v.z+side.z],.0007,p.joint,4);}
 }
}
function arch(k,g,p){
 const n=40,w=.44,z=.395,d=.078,top=x=>.139+.083*Math.max(0,1-(x/(w/2))**2),under=x=>.055+.127*Math.sqrt(Math.max(0,1-(x/(w/2))**2)),pos=[],idx=[];
 for(let i=0;i<=n;i++){const x=(i/n-.5)*w;for(const s of [-1,1])for(const y of [under(x),top(x)])pos.push(x+.12,y,z+s*d/2);}
 for(let i=0;i<n;i++){const a=i*4,b=a+4;idx.push(a,a+1,b+1,a,b+1,b,a+2,b+3,a+3,a+2,b+2,b+3,a,b,a+2,b,b+2,a+2,a+1,a+3,b+1,b+1,a+3,b+3);}idx.push(0,2,3,0,3,1,n*4,n*4+1,n*4+3,n*4,n*4+3,n*4+2);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,p.arch);
 for(const side of [-1,1]){const pts=Array.from({length:9},(_,i)=>{const x=(i/8-.5)*w;return[x+.12,top(x)+.002,z+side*(d/2-.006)];});rail(k,g,p,pts,{cross:false});}
 for(const x of [-.1,.34])k.box(g,.05,.123,d+.012,p.pier,x,.0665,z);
 for(let i=1;i<22;i++){const x=(i/22-.5)*w;k.beam(g,[x+.12,top(x)+.0007,z-d/2],[x+.12,top(x)+.0007,z+d/2],.0008,p.joint,4);}
}
function roof(k,g,p,w,d,h,y){
 const ridge=Math.max(0,(w-d)*.45),at=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),n=Math.max(Math.abs(c),Math.abs(s)),x=c/n*w/2,z=s/n*d/2,t=.001+.999*v;return[x*t+THREE.MathUtils.clamp(x,-ridge,ridge)*(1-t),y+h*(1-t)**1.5+.025*t**6*(Math.min(Math.abs(c),Math.abs(s))/.7071)**8,z*t];};
 skin(k,g,at,16,96,p.tile);k.line(g,Array.from({length:96},(_,i)=>at(i/96,1)),.004,p.white,true);
 for(let i=0;i<80;i++){const points=Array.from({length:17},(_,j)=>{const q=at(i/80,.06+j*.94/16);q[1]+=.001;return q;});k.line(g,points,.0011,p.rib);}
 k.line(g,[[-ridge-.018,y+h+.028,0],[-ridge,y+h+.005,0],[ridge,y+h+.005,0],[ridge+.018,y+h+.028,0]],.004,p.white);
 for(const sx of [-1,1])for(const sz of [-1,1]){const a=(sx>0?(sz>0?.125:.875):(sz>0?.375:.625)),points=Array.from({length:17},(_,j)=>at(a,j/16));k.line(g,points,.004,p.white);const q=points.at(-1);k.line(g,[q,[q[0]+sx*.008,q[1]+.012,q[2]+sz*.006],[q[0]+sx*.007,q[1]+.026,q[2]+sz*.004],[q[0],q[1]+.030,q[2]]],.002,p.white);}
}
function pavilion(k,g,p){
 const a=new THREE.Group();a.position.set(.43,0,.065);a.rotation.y=-.15;g.add(a);
 const shape=new THREE.Shape();shape.moveTo(-.14,-.015);shape.lineTo(.14,-.015);shape.absarc(0,-.015,.14,0,Math.PI,false);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.11,bevelEnabled:false,curveSegments:40});geo.rotateX(-Math.PI/2);k.mesh(a,geo,p.pier,0,.027,0);k.box(a,.27,.012,.16,p.stone,0,.143,-.04);
 for(const x of [-.073,.073])for(const z of [-.070,.070]){k.cyl(a,.011,.012,.014,p.white,x,.157,z);k.cyl(a,.0065,.007,.137,p.red,x,.232,z);k.box(a,.020,.008,.020,p.white,x,.304,z);}
 for(const z of [-.07,.07])k.box(a,.162,.011,.016,p.white,0,.312,z);roof(k,a,p,.225,.225,.075,.320);
 const pts=Array.from({length:17},(_,i)=>{const an=i/16*Math.PI;return[Math.cos(an)*.135,.148,-.015-Math.sin(an)*.135];});rail(k,a,p,pts);k.box(a,.23,.003,.002,p.eave,0,.316,.112);
}
function gardenHouse(k,g,p){
 const a=new THREE.Group();a.position.set(-.13,0,-.34);g.add(a);const w=.60,b=.145,h=.18;
 k.box(a,w+.05,.02,.30,p.stone,0,b-.01,0);const wall=new THREE.Shape();wall.moveTo(-w/2,b);wall.lineTo(w/2,b);wall.lineTo(w/2,b+h);wall.lineTo(-w/2,b+h);wall.closePath();const opening=new THREE.Path();opening.absarc(-.15,b+.081,.069,0,TAU,true);wall.holes.push(opening);k.mesh(a,new THREE.ExtrudeGeometry(wall,{depth:.017,bevelEnabled:false,curveSegments:36}),p.wall,0,0,.018);
 for(const x of [-w/2,w/2])k.box(a,.015,h,.19,p.wall,x,b+h/2,-.065);k.box(a,w,.18,.012,p.wall,0,b+.09,-.16);
 for(let i=0;i<4;i++){const x=-.03+i*.069;k.box(a,.054,.132,.005,p.wood,x,b+.077,.040);k.box(a,.045,.102,.003,p.pane,x,b+.083,.044);for(let j=1;j<4;j++)k.box(a,.046,.002,.005,p.red,x,b+.04+j*.024,.046);k.box(a,.002,.10,.006,p.red,x,b+.083,.046);}
 for(const x of [-.28,-.07,.07,.28]){k.cyl(a,.006,.007,.19,p.red,x,b+.095,.128);k.box(a,.023,.008,.022,p.white,x,b+.19,.128);}
 roof(k,a,p,.72,.35,.09,b+.20);k.box(a,.29,.043,.15,p.wall,0,b+.31,-.018);roof(k,a,p,.38,.21,.065,b+.34);
 sign(k,a,'菽庄',.070,.023,.12,b+.149,.047,{background:'#e2ddcd',color:'#423a30'});
 rail(k,a,p,[[-.31,b,.145],[-.24,b,.145]],{cross:true});rail(k,a,p,[[.24,b,.145],[.31,b,.145]],{cross:true});
}
export function shuzhuang(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.82,.73);p.stone=stone(k,'#b8b3a2','shuzhuang-stone');p.pier=stone(k,'#929485','shuzhuang-pier');p.arch=stone(k,'#b2afa0','shuzhuang-arch');p.arch.userData.shuzhuangArch=true;p.white=k.mat('#d6d7cb',.9);p.wall=k.mat('#d6d2be',.93);p.rock=k.mat('#a29e86',.99);p.joint=k.mat('#8c8d80',.97);p.rib=k.mat('#4a7469',.77);p.tile=k.mat('#446458',.8);p.red=k.mat('#784338',.9);p.eave=edge(k,'#8c7454','#edc78c',.38);p.pane=edge(k,'#45534c','#e1c392',.24);
 for(const m of [p.stone,p.pier,p.arch,p.white])m.userData.shuzhuangStructure=true;
 sea(k,g,p,.73,.47,0,.10);k.box(g,1.13,.105,.27,p.pier,0,.0795,-.32);k.box(g,1.14,.010,.28,p.stone,0,.137,-.32);gardenHouse(k,g,p);
 const west=[[-.52,.142,-.24],[-.52,.142,.04],[-.46,.142,.20],[-.48,.142,.43],[-.28,.142,.50],[-.18,.142,.46],[-.16,.142,.395],[-.10,.142,.395]];
 const east=[[.34,.142,.395],[.50,.142,.28],[.54,.142,.08],[.52,.142,-.16],[.45,.142,-.24]];
 walk(k,g,p,west);walk(k,g,p,east);arch(k,g,p);pavilion(k,g,p);
 rock(k,g,p,{x:-.29,y:.026,z:.29,rx:.135,ry:.16,rz:.13,seed:4});const upper=new THREE.Shape();upper.moveTo(-.105,0);upper.lineTo(.10,.01);upper.lineTo(.12,.11);upper.lineTo(.078,.223);upper.lineTo(-.066,.23);upper.lineTo(-.125,.15);upper.closePath();k.mesh(g,new THREE.ExtrudeGeometry(upper,{depth:.11,bevelEnabled:true,bevelSegments:5,bevelSize:.013,bevelThickness:.02,steps:1}),p.rock,-.29,.15,.24);
 sign(k,g,'海阔天空',.104,.025,-.29,.26,.371,{background:'#a6a18e',color:'#8f503b'});
 for(const [x,z,rx,ry,rz]of [[.62,-.13,.12,.22,.14],[.63,.15,.10,.12,.14],[-.60,-.27,.09,.13,.12],[-.54,.40,.075,.075,.06],[.30,.54,.07,.04,.05]])rock(k,g,p,{x,y:.025,z,rx,ry,rz,seed:x*10});
 for(let i=0;i<5;i++)k.line(g,[[.56+i*.012,.05,-.06],[.57+i*.014,.12,-.12],[.60+i*.014,.17,-.16]],.001,p.joint);
 grove(k,g,(x,z)=>ground(x,z)+.02,[[-.56,-.49,.15],[-.32,-.57,.18],[.06,-.56,.18],[.36,-.44,.19],[.60,-.24,.14]]);
 const lamp=edge(k,'#e2dbc3','#ffe2a8',.9);for(const x of [-.47,.33]){k.cyl(g,.003,.004,.13,p.red,x,.21,-.29,8);for(let i=0;i<3;i++){const xx=x+(i-1)*.015,yy=.275+(i===1?.01:0);k.beam(g,[x,.26,-.29],[xx,yy,-.29],.0015,p.white,5);k.ball(g,.008,lamp,xx,yy,-.29);}}
 return finish(k,g,{lamps:[[-.43,.142,-.18],[.25,.142,-.20]],visitors:[[-.40,.142,.44],[.11,.222,.395],[.50,.142,.23],[-.18,.145,-.18]]});
}
