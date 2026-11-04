import * as THREE from 'three';
import {tree,plaque} from './wuhan-architecture.js';
import {plaza,bollards,people,glow,skin} from './shenzhen-forms.js';

const TAU=Math.PI*2;
function oct(k,g,r,h,y,m){const o=k.cyl(g,r/Math.cos(Math.PI/8),r/Math.cos(Math.PI/8),h,m,0,y,0,8);o.rotation.y=Math.PI/8;return o;}
function panel(k,g,p,x,y,z,w,h){
 k.box(g,w,h,.004,p.paint,x,y,z);for(const sy of [-1,1])k.box(g,w,.002,.006,p.pale,x,y+sy*h*.44,z+.003);
 const n=Math.max(1,Math.round(w/.075));for(let i=0;i<n;i++){const xx=x+(i-(n-1)/2)*w/n,ww=w/n*.62;
  k.box(g,ww,h*.65,.001,p.gold,xx,y,z+.003);k.box(g,ww*.88,h*.52,.001,p.salmon,xx,y,z+.004);k.line(g,[[xx-ww*.38,y+h*.20,z+.005],[xx+ww*.38,y+h*.20,z+.005],[xx+ww*.30,y,z+.005],[xx+ww*.38,y-h*.20,z+.005],[xx-ww*.38,y-h*.20,z+.005],[xx-ww*.30,y,z+.005]],.0007,p.pale,true);
 }
}
function bracket(k,g,p,x,y,z){for(let i=0;i<4;i++){k.box(g,.009+i*.006,.003,.011+i*.005,i%2?p.blue:p.pale,x,y+i*.005,z+i*.003);k.box(g,.005,.007,.007,p.gold,x,y+i*.005-.002,z+i*.003);}}
function window(k,g,p,x,y,z,w,h){
 k.box(g,w,h,.003,p.dark,x,y,z);for(const xx of [-w/2,0,w/2])k.box(g,.0025,h+.004,.005,p.red,x+xx,y,z+.002);
 for(const yy of [-h/2,h*.06,h/2])k.box(g,w+.005,.003,.005,p.red,x,y+yy,z+.002);
 for(let i=0;i<5;i++)for(let j=0;j<7;j++){const xx=x+(i-2)*w*.17,yy=y+(j-3)*h*.12;k.line(g,[[xx-w*.05,yy,z+.003],[xx,yy+h*.035,z+.003],[xx+w*.05,yy,z+.003],[xx,yy-h*.035,z+.003]],.00065,p.lattice,true);}
}
function hipRoof(k,g,p,w,d,h,y,z){
 const parent=g;g=new THREE.Group();parent.add(g);
 const ridge=Math.max(.008,(w-d)*.42);
 const point=(u,v)=>{const s=Math.floor(u*4)%4,t=u*4%1*2-1;let x,zz;if(s===0){x=t*w/2;zz=d/2;}else if(s===1){x=w/2;zz=-t*d/2;}else if(s===2){x=-t*w/2;zz=-d/2;}else{x=-w/2;zz=t*d/2;}return [x*v+(1-v)*(x/(w/2))*ridge,y+h*(1-v)**1.35+.018*v**5*Math.abs(t)**7,z+zz*v];};
 skin(k,g,point,16,128,p.tile);k.line(g,Array.from({length:128},(_,i)=>point(i/128,1)),.002,p.edge,true);
 for(let i=0;i<128;i++)k.line(g,Array.from({length:17},(_,j)=>{const a=point(i/128,.01+.99*j/16);a[1]+=.0012;return a;}),.0008,p.rib);
 k.line(g,[[-ridge,y+h+.002,z],[ridge,y+h+.002,z]],.003,p.rib);
 for(const side of [-1,1]){
  k.line(g,[[side*ridge,y+h+.003,z],[side*(ridge+.018),y+h+.009,z],[side*(ridge+.027),y+h+.024,z]],.003,p.rib);
  for(const sz of [-1,1])for(let j=0;j<5;j++){const t=.64+j*.065,xx=side*(w*.5*t+(1-t)*ridge),yy=y+h*(1-t)**1.35+.018*t**5,zz=z+sz*d*.5*t;k.box(g,.004,.010,.004,p.rib,xx,yy+.005,zz);k.ball(g,.0026,p.rib,xx,yy+.012,zz);}
 }
 for(let i=0;i<=Math.round(w/.013);i++){const x=(i/Math.round(w/.013)-.5)*w;for(const s of [-1,1])k.cyl(g,.0019,.0019,.003,p.pale,x,y-.002,z+s*d*.5,6).rotation.x=Math.PI/2;}
 // Adjacent wings meet at a valley instead of drawing two roof skins on top of each other.
 g.traverse(o=>{if(!o.isMesh)return;o.updateMatrix();const source=o.geometry,index=source.index,a=source.attributes.position,vertices=[];
  for(let i=0;i<(index?index.count:a.count);i+=3){let poly=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(o.matrix));
   for(const sign of [-1,1]){const next=[];for(let j=0;j<poly.length;j++){const v=poly[j],q=poly[(j+1)%poly.length],dv=v.z-sign*v.x,dq=q.z-sign*q.x;if(dv>=0)next.push(v);if((dv>=0)!==(dq>=0))next.push(v.clone().lerp(q,dv/(dv-dq)));}poly=next;}
   for(let j=1;j+1<poly.length;j++)vertices.push(...poly[0].toArray(),...poly[j].toArray(),...poly[j+1].toArray());
  }const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();o.geometry=geo;source.dispose();o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);
 });
}
function topRoof(k,g,p){
 const r=.351,y=.582,h=.144,step=TAU/8;
 const point=(u,v)=>{const a=u*TAU,d=((a+step/2)%step)-step/2,rad=r/Math.cos(d)*v;return [Math.sin(a)*rad,y+h*(1-v)**1.45+.019*v**7*(Math.abs(d)/(step/2))**7,Math.cos(a)*rad];};
 skin(k,g,point,16,128,p.tile);k.line(g,Array.from({length:128},(_,i)=>point(i/128,1)),.002,p.edge,true);
 for(let i=0;i<144;i++)k.line(g,Array.from({length:15},(_,j)=>{const v=point(i/144,.02+.98*j/14);v[1]+=.0014;return v;}),.001,p.rib);
 for(let i=0;i<8;i++){const u=(i+.5)/8,tip=point(u,1);k.line(g,Array.from({length:17},(_,j)=>{const v=point(u,.015+.985*j/16);v[1]+=.002;return v;}),.0034,p.rib);k.line(g,[tip,[tip[0]*1.025,tip[1]+.012,tip[2]*1.025]],.003,p.rib);
  for(let j=0;j<5;j++){const v=point(u,.71+j*.05);k.box(g,.004,.010,.004,p.rib,v[0],v[1]+.007,v[2]);k.ball(g,.003,p.rib,v[0],v[1]+.014,v[2]);}
 }
 oct(k,g,.012,.010,.730,p.blue);const cap=k.ball(g,.014,p.gold,0,.750,0);cap.scale.y=1.35;k.cyl(g,.001,.0015,.023,p.gold,0,.776,0,8);
}
function footing(k,g,w,d,top,x,z,m){
 const geo=new THREE.BoxGeometry(w,1,d,20,1,20),a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const xx=a.getX(i)+x,zz=a.getZ(i)+z,low=Math.sqrt(Math.max(.001,2.15**2-xx**2-zz**2))-2.15+.014;a.setXYZ(i,xx,a.getY(i)>0?top:low,zz);}geo.computeVertexNormals();k.mesh(g,geo,m);
}
function wing(k,root,p,angle,width=.62,front=false){
 const g=new THREE.Group();root.add(g);g.rotation.y=angle;const w=width,z=.31;
 footing(k,g,w+.04,.32,.058,0,z,p.stone);k.box(g,w,.257,.202,p.wall,0,.186,.285);
 const bays=front?7:5;
 for(let i=0;i<bays;i++){const x=(i-(bays-1)/2)*w/bays;window(k,g,p,x,.224,.389,w/bays*.72,.142);window(k,g,p,x,.098,.389,w/bays*.72,.070);}
 k.box(g,w,.009,.008,p.pale,0,.142,.393);
 for(let i=0;i<=bays;i++){const x=(i/bays-.5)*w;k.cyl(g,.008,.0095,.244,p.red,x,.184,.472,12);k.cyl(g,.013,.013,.015,p.stone,x,.069,.472,12);bracket(k,g,p,x,.309,.471);}
 panel(k,g,p,0,.304,.478,w+.035,.034);
 for(let i=0;i<=bays*2;i++)bracket(k,g,p,(i/(bays*2)-.5)*(w+.025),.326,.476);
 hipRoof(k,g,p,w+.13,.32,.077,.349,.35);
 k.box(g,w*.80,.068,.175,p.wall,0,.420,.302);panel(k,g,p,0,.424,.394,w*.82,.042);
 for(let i=0;i<=12;i++)bracket(k,g,p,(i/12-.5)*w*.84,.452,.390);
 hipRoof(k,g,p,w*.95,.27,.077,.466,.305);
 if(front)plaque(k,g,'天下为公',.18,.046,0,.427,.401);
 const n=front?10:6,start=front?.62:.56,run=(start-.476)/(n-1),low=Math.sqrt(2.15**2-start**2)-2.15+.020;
 for(let i=0;i<n;i++)footing(k,g,front?.50:w*.65,run+.0002,low+(.058-low)*i/(n-1),0,start-i*run,p.steps);
}
export function memorial(k){
 const g=new THREE.Group(),ground=new THREE.Group(),b=new THREE.Group();g.add(ground,b);plaza(k,ground,.69,.69);
 const p={stone:k.mat('#c3c2ae',.93),wall:k.mat('#bea875',.93),red:k.mat('#773b35',.80),tile:k.mat('#28466d',.62,.15),rib:k.mat('#3d5c87',.62,.12),blue:k.mat('#506985',.80),paint:k.mat('#8095a6',.83),gold:k.mat('#c0a461',.66,.25),pale:k.mat('#c8c7ad',.87),salmon:k.mat('#a47b66',.86),dark:glow(k,'#303a33',.11,.8,.3),lattice:k.mat('#988a68',.9),edge:glow(k,'#afa991',.27)};
 p.dark.userData.night.color.set('#ffd69a');p.edge.userData.night.color.set('#fff0ca');p.tile.userData.night={color:new THREE.Color('#638fd5'),intensity:.075};
 p.steps=p.stone.clone();k.materials.push(p.steps);p.steps.userData.memorialSteps=true;p.tile.side=THREE.DoubleSide;p.tile.userData.memorialRoof=true;
 p.wall.onBeforeCompile=s=>{s.vertexShader='varying vec3 vMemorialBrick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMemorialBrick=position;');s.fragmentShader='varying vec3 vMemorialBrick;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vec2(vMemorialBrick.x+vMemorialBrick.z,vMemorialBrick.y)/vec2(.025,.008);q.x+=mod(floor(q.y),2.)*.5;vec2 f=fract(q);float line=max(1.-smoothstep(.02,.07,f.x),1.-smoothstep(.03,.11,f.y));diffuseColor.rgb*=1.-line*.11;`);};p.wall.customProgramCacheKey=()=> 'memorial-yellow-brick-v1';
 footing(k,b,.74,.74,.055,0,0,p.stone);oct(k,b,.335,.30,.205,p.wall);oct(k,b,.289,.174,.489,p.wall);
 for(let side=0;side<8;side++){
  const angle=side/8*TAU,f=new THREE.Group();f.position.set(Math.sin(angle)*.290,.404,Math.cos(angle)*.290);f.rotation.y=angle;b.add(f);const w=2*.290*Math.tan(Math.PI/8);
  for(let i=0;i<4;i++)window(k,f,p,(i-1.5)*w*.23,.079,.003,w*.19,.113);
  for(const x of [-w*.5,w*.5]){k.box(f,.008,.165,.012,p.red,x,.086,.002);bracket(k,f,p,x,.153,.006);}
  panel(k,f,p,0,.147,.009,w,.018);for(let j=0;j<9;j++)bracket(k,f,p,(j/8-.5)*w,.163,.008);
 }
 topRoof(k,b,p);for(let i=0;i<4;i++)wing(k,b,p,i*Math.PI/2,.66,i===0);
 b.traverse(o=>{if(o.material){o.material.userData.rigidArchitecture=true;o.material.envMapIntensity=.25;}});
 for(const x of [-.57,.57])tree(k,ground,x,.014,-.38,.12);bollards(k,ground,[[-.42,.56],[.42,.56],[-.56,-.42],[.56,-.42]]);people(k,ground,[[-.20,.60],[.18,.60]]);
 k.merge(g);
 for(const x of [-.24,.24]){const l=new THREE.SpotLight('#ffe1b1',0,1.2,.50,.88,2);l.position.set(x,.21,.61);l.target.position.set(x,.28,.39);l.userData.nightIntensity=.019;g.add(l,l.target);}
 return g;
}
