import * as THREE from 'three';
import {roof,tree} from './wuhan-architecture.js';
import {bollards,people} from './shenzhen-forms.js';

function brick(k,color){
 const m=k.mat(color,.97,.02);m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 pagodaBrick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npagodaBrick=position;');
  s.fragmentShader='varying vec3 pagodaBrick;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float row=floor(pagodaBrick.y*210.0);
   vec2 cell=vec2((pagodaBrick.x+pagodaBrick.z)*85.0+mod(row,2.0)*.5,pagodaBrick.y*210.0);
   vec2 uv=fract(cell), fw=max(fwidth(cell),vec2(.01));
   float mortar=max(1.0-smoothstep(.035,.035+fw.y,uv.y),1.0-smoothstep(.025,.025+fw.x,uv.x));
   float random=fract(sin(dot(floor(cell),vec2(127.1,311.7)))*43758.5453);
   float weather=.5+.5*sin(pagodaBrick.x*22.0+pagodaBrick.z*11.0+sin(pagodaBrick.y*38.0));
   float low=1.0-smoothstep(.08,.23,pagodaBrick.y+weather*.05);
   diffuseColor.rgb*=mix(.94,1.02,random)*(1.0-.045*mortar);
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.63,.69,.71),low*.65);`);
 };m.customProgramCacheKey=()=> 'dayanta-brick-201';return m;
}
function foundation(k,g,m,w,d,top,x=0,z=0){
 const geo=new THREE.BoxGeometry(w,top+.16,d,12,1,12),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const xx=p.getX(i)+x,zz=p.getZ(i)+z;p.setXYZ(i,xx,p.getY(i)>0?top:Math.sqrt(Math.max(.001,2.15**2-xx*xx-zz*zz))-2.15,zz);}
 geo.computeVertexNormals();k.mesh(g,geo,m);
}
function arch(k,g,p,x,y,z,r,spring,bottom,grille=false){
 // Actual recessed openings, with masonry jambs and radial arch bricks.
 k.box(g,r*2.04,spring+r-bottom,.005,p.dark,x,y+bottom+(spring+r-bottom)/2,z-.030);
 for(let n=0;n<13;n++){const a=n/12*Math.PI,b=k.box(g,.006,.008,.005,p.arch,x+Math.cos(a)*(r+.004),y+spring+Math.sin(a)*(r+.004),z+.002);b.rotation.z=a-Math.PI/2;}
 for(const sign of [-1,1])k.box(g,.007,spring-bottom,.006,p.arch,x+sign*(r+.004),y+(spring+bottom)/2,z+.001);
 const gh=grille?spring+r*.65:spring*.43;
 for(let j=-3;j<=3;j++)k.box(g,.0012,gh,.002,p.metal,x+j*r*.26,y+bottom+gh/2,z-.019);
 k.box(g,r*1.82,.002,.002,p.metal,x,y+bottom+gh,z-.019);
}
function storey(k,g,p,{w,h,y,bays,ground=false}){
 const top=w-.016;
 for(let side=0;side<4;side++){
  const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
  const holes=[{x:0,r:ground?.026:w*.074,spring:ground?.061:h*.42,bottom:ground?.003:.004}];
  if(ground&&side===0)for(const s of [-1,1])holes.push({x:s*.129,r:.018,spring:.040,bottom:.008,niche:true});
  for(const a of holes){const q=new THREE.Path();q.moveTo(a.x-a.r,a.bottom);q.lineTo(a.x-a.r,a.spring);q.absarc(a.x,a.spring,a.r,Math.PI,0,true);q.lineTo(a.x+a.r,a.bottom);q.closePath();shape.holes.push(q);}
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.028,bevelEnabled:false,curveSegments:20}),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const t=pos.getY(i)/h;pos.setX(i,pos.getX(i)*(1-.016/w*t));pos.setZ(i,pos.getZ(i)-.008*t);}
  geo.computeVertexNormals();k.mesh(f,geo,p.brick,0,y,w/2-.028);
  for(const a of holes){arch(k,f,p,a.x,y,w/2,a.r,a.spring,a.bottom,ground&&!a.niche);if(a.niche){k.box(f,.022,.040,.004,p.stele,a.x,y+.031,w/2-.019);for(let j=0;j<5;j++)k.box(f,.015,.0006,.0005,p.carving,a.x,y+.018+j*.006,w/2-.0165);}}
  for(let j=0;j<=bays;j++){
   const x=(j/bays-.5)*(w-.014),pillar=k.box(f,.0055,h-.012,.006,p.pilaster,x,y+h/2-.002,w/2-.001);
   pillar.rotation.x=-Math.atan2(.008,h);
   k.box(f,.011,.005,.010,p.arch,x*(top/w),y+h-.008,top/2+.002);
  }
  k.box(f,top,.004,.008,p.arch,0,y+h-.015,top/2);
  k.box(f,top,.003,.008,p.pilaster,0,y+h-.004,top/2);
  for(let j=0;j<bays;j++)k.box(f,.0025,.008,.007,p.arch,((j+.5)/bays-.5)*top,y+h-.008,top/2+.001);
 }
 // Two small diagonal brick tooth bands, below stepped corbelled eaves.
 for(let side=0;side<4;side++){
  const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);const n=Math.ceil(top/.012);
  for(let row=0;row<2;row++)for(let j=0;j<n;j++){const tooth=k.box(f,.006,.003,.006,p.arch,((j+.5)/n-.5)*(top+.010),y+h+.002+row*.005,top/2+.006);tooth.rotation.y=Math.PI/4;}
 }
 for(let j=0;j<6;j++){const ww=top+.016+j*.0048;k.box(g,ww,.0038,ww,j%2?p.eave:p.arch,0,y+h+.011+j*.0033,0);}
}
function temple(k,g,p,{x=0,z,w,d,h,y=.018}){
 const a=new THREE.Group();a.position.set(x,y,z);g.add(a);
 foundation(k,g,p.paving,w+.035,d+.035,y,x,z);
 k.box(a,w*.88,h,d*.77,p.wall,0,h/2,0);
 for(const s of [-1,1]){
  for(let j=0;j<7;j++){const xx=(j/6-.5)*w*.88;k.cyl(a,.003,.004,h,p.red,xx,h/2,s*d*.46,8);if(j<6){k.box(a,w*.13,h*.76,.003,p.door,xx+w*.073,h*.40,s*d*.39);for(let n=0;n<3;n++)k.box(a,.001,h*.35,.003,p.red,xx+w*(.04+n*.035),h*.57,s*d*.40);}}
  k.box(a,w,.009,.014,p.red,0,h-.005,s*d*.46);
 }
 roof(k,a,w*1.17,d*1.28,.047,h+.001,p.tile,p.ridge);
 k.box(a,w*.86,.0015,.003,p.warm,0,h-.008,d*.49);
}
export function pagoda(k){
 const firstMaterial=k.materials.length,g=new THREE.Group(),p={brick:brick(k,'#a18e76'),pilaster:brick(k,'#a18f79'),arch:brick(k,'#95846e'),eave:brick(k,'#8e8678'),dark:k.mat('#33352f'),metal:k.mat('#4a4b42'),stele:k.mat('#959387'),carving:k.mat('#77786d'),paving:k.mat('#bdb9a8'),wall:k.mat('#d4cbb4'),red:k.mat('#805c4b'),door:k.mat('#4d4b3e'),tile:k.mat('#7f7d6c'),ridge:k.mat('#999583'),warm:k.mat('#dac39b'),finial:k.mat('#95846a')};
 for(const [name,m]of Object.entries(p)){m.userData.pagodaRigid=true;m.userData.night={color:new THREE.Color('#efc58b'),intensity:name==='warm'?.50:name==='brick'||name==='pilaster'?.16:name==='eave'?.10:.06};}
 const paving=k.mat('#bcb9a6'),vertices=[],indices=[],N=128,rings=24;
 for(let j=0;j<=rings;j++)for(let i=0;i<=N;i++){const r=j/rings,a=i/N*Math.PI*2,x=.70*r*Math.cos(a),z=.80*r*Math.sin(a),t=THREE.MathUtils.smoothstep(r,.90,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));vertices.push(x,.012-sag*t,z);}
 for(let j=0;j<rings;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)indices.push(a,a+1,b);indices.push(a+1,b+1,b);}
 const land=new THREE.BufferGeometry();land.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));land.setIndex(indices);land.computeVertexNormals();k.mesh(g,land,paving);
 const tower=new THREE.Group();tower.position.z=-.18;g.add(tower);
 foundation(k,g,p.paving,.59,.57,.058,0,-.18);
 let y=.063;const heights=[.185,.137,.122,.112,.102,.092,.086];
 for(let i=0;i<7;i++){storey(k,tower,p,{w:.44-i*.030,h:heights[i],y,bays:i<2?9:i<4?7:5,ground:i===0});y+=heights[i]+.031;}
 const cap=k.cyl(tower,.018,.174,.066,p.eave,0,y+.029,0,4);cap.rotation.y=Math.PI/4;
 // Curving gourd finial above the square brick cap, sized from the photograph.
 const profile=[[0,0],[.021,0],[.019,.007],[.013,.012],[.015,.019],[.014,.027],[.009,.032],[.013,.038],[.012,.045],[.008,.052],[.007,.059],[.003,.064],[0,.067]].map(([r,h])=>new THREE.Vector2(r,h));
 k.mesh(tower,new THREE.LatheGeometry(profile,32),p.finial,0,y+.060,0);k.cyl(tower,.0007,.0015,.026,p.metal,0,y+.137,0,8);
 for(const sx of [-1,1])for(const sz of [-1,1]){k.line(tower,[[sx*.115,y+.002,sz*.115],[sx*.060,y+.035,sz*.060],[0,y+.112,0]],.00045,p.metal);k.cyl(tower,.002,.003,.007,p.metal,sx*.124,y-.005,sz*.124,8);}
 // The south terrace has a central stair gap, with a low stone balustrade.
 for(let side=0;side<4;side++){
  const f=new THREE.Group();f.position.z=-.18;f.rotation.y=side*Math.PI/2;g.add(f);
  for(let j=0;j<=18;j++){const x=(j/18-.5)*.56;if(side===0&&Math.abs(x)<.055)continue;k.box(f,.005,.029,.005,p.paving,x,.0725,.275);if(j<18&&!(side===0&&Math.abs(x+.0155)<.060))k.box(f,.027,.015,.003,p.paving,x+.0155,.073,.275);}
 }
 for(let i=0;i<6;i++){const z=.232-i*.023,top=.013+(i+1)*.0075;foundation(k,g,p.paving,.11,.025,top,0,z);}
 temple(k,g,p,{z:.36,w:.43,d:.17,h:.10});temple(k,g,p,{z:.63,w:.26,d:.13,h:.075});
 for(const x of [-.42,.42]){temple(k,g,p,{x,z:.27,w:.15,d:.30,h:.075});foundation(k,g,p.wall,.016,.85,.0675,x,.05);k.box(g,.025,.009,.85,p.tile,x,.071,.05);}
 for(const [x,z,s]of [[-.33,.22,.10],[.33,.22,.10],[-.34,-.46,.10],[.34,-.46,.10],[-.34,.50,.09],[.34,.50,.09]])tree(k,g,x,.014,z,s);
 bollards(k,g,[[-.23,.51],[.23,.51],[-.32,-.20],[.32,-.20]]);people(k,g,[[-.14,.51],[.12,.53],[-.14,.14]]);
 for(const m of k.materials.slice(firstMaterial))m.userData.pagodaRigid=true;
 const copies=new Map();g.traverse(o=>{
  if(!o.isMesh||o.material.userData.pagodaRigid)return;
  const original=o.material;
  if(!copies.has(original)){
   const copy=original.clone();copy.onBeforeCompile=original.onBeforeCompile;copy.customProgramCacheKey=original.customProgramCacheKey;
   // Material.clone serializes userData, turning Color into a number. Keep typed lighting data.
   copy.userData={...original.userData,pagodaRigid:true};
   if(original.userData.night)copy.userData.night={...original.userData.night,color:original.userData.night.color.clone()};
   k.materials.push(copy);copies.set(original,copy);
  }
  o.material=copies.get(original);
 });
 g.userData={storeys:7};return k.merge(g);
}
