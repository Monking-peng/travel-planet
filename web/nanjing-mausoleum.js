import * as THREE from 'three';
import {palette,site,disc,paving,finish,archWall} from './nanjing-kit.js';

function stone(k,color){const m=k.mat(color,.94,.02);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 memorialStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmemorialStone=position;');s.fragmentShader='varying vec3 memorialStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float row=floor(memorialStone.y*54.0);float joint=step(.042,fract(memorialStone.y*54.0))*step(.025,fract((memorialStone.x+memorialStone.z)*19.0+mod(row,2.0)*.5));
 float grain=fract(sin(dot(floor(memorialStone*1800.0),vec3(12.98,43.6,77.3)))*43758.5);
 diffuseColor.rgb*=mix(.90,1.0,joint)*mix(.97,1.015,grain);`);};m.customProgramCacheKey=()=> 'mausoleum-stone-v1';m.userData.night={color:new THREE.Color('#e6ddc5'),intensity:.035};return m;}
function inscription(k,g,text,w,h,x,y,z,vertical=false){
 if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=vertical?192:640;c.height=vertical?640:160;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#b6974f';ctx.font=`${vertical?125:105}px 'KaiTi','STKaiti','Microsoft YaHei',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 if(vertical)Array.from(text).forEach((letter,i)=>ctx.fillText(letter,c.width/2,80+i*155));else ctx.fillText(text,c.width/2,c.height/2,c.width-30);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff',.84,.05);m.map=tex;m.transparent=true;m.alphaTest=.1;m.depthWrite=false;m.userData.night={color:new THREE.Color('#d9c497'),intensity:.06};k.mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);
}
function curvedRoof(k,g,p,w,d,y,h,z,{shed=false}={}){
 const pos=[],idx=[],ridge=w*.28;
 function point(side,u,v){const sideHip=side>1,r=sideHip?.45+.55*v:v,extent=ridge+(w/2-ridge)*THREE.MathUtils.smoothstep(r,.45,1),a=u*2-1;let x,zz;
  if(sideHip){x=(side===2?1:-1)*extent;zz=a*d/2*r;}else{x=a*extent;zz=(side===0?1:-1)*d/2*r;}
  return [x,y+h*(1-r)**1.45+.014*Math.abs(a)**7*r**6,z+zz];}
 const sides=shed?[0]:[0,1,2,3],N=64,R=18;
 for(const side of sides){const start=pos.length/3;for(let j=0;j<=R;j++)for(let i=0;i<=N;i++)pos.push(...point(side,i/N,j/R));for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=start+j*(N+1)+i,b=a+N+1;idx.push(a,a+1,b,a+1,b+1,b);}
  for(let i=0;i<=N;i++){const pts=[];for(let j=0;j<=12;j++){const v=point(side,i/N,j/12);v[1]+=.0007;pts.push(v);}k.line(g,pts,.0004,p.tileRib);}
  k.line(g,Array.from({length:65},(_,i)=>point(side,i/64,1)),.0025,p.tileEdge);
  for(let i=0;i<=N;i++){const pt=point(side,i/N,1);const cap=k.mesh(g,new THREE.CircleGeometry(.0016,8),p.tileEdge,pt[0],pt[1]-.001,pt[2]+(side===0?.001:0));if(side===1)cap.rotation.y=Math.PI;}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();p.blue.side=THREE.DoubleSide;k.mesh(g,geo,p.blue);
 if(shed)return;
 for(const side of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-d*.225,y+h*.55**1.45);shape.lineTo(0,y+h);shape.lineTo(d*.225,y+h*.55**1.45);shape.closePath();const face=k.mesh(g,new THREE.ShapeGeometry(shape),p.pale,side*ridge,0,z);face.rotation.y=side*Math.PI/2;
  const ridgeLine=[];for(let i=0;i<=24;i++)ridgeLine.push([(i/24-.5)*ridge*2,y+h+.007+.015*Math.abs(i/12-1)**7,z]);k.line(g,ridgeLine,.004,p.tileEdge);
  for(let i=0;i<4;i++){const xx=side*(ridge-.005+i*.004);k.box(g,.007,.012+i*.006,.012,p.tileEdge,xx,y+h+.010+i*.003,z);}
 }
}
function brackets(k,g,p,w,y,z,count,upper){
 for(let i=0;i<count;i++){const x=(i/(count-1)-.5)*w;k.box(g,.009,.014,.012,p.shade,x,y-.004,z);
  for(let tier=0;tier<(upper?3:2);tier++){const yy=y+tier*.006,zz=z+tier*.004;k.box(g,.019+tier*.007,.004,.014,p.pale,x,yy,zz);k.box(g,.005,.006,.020+tier*.007,p.pale,x,yy+.003,zz);for(const s of [-1,1])k.box(g,.005,.007,.010,p.pale,x+s*(.007+tier*.003),yy+.005,zz);}
 }
 for(const offset of [0,.006])for(let i=0;i<count*2;i++){const m=k.box(g,.008,.008,.010,p.pale,(i/(count*2-1)-.5)*w,y+.023+offset,z+.011);m.rotation.z=Math.PI/4;}
}
function scroll(k,g,p,x,y,z,r){const pts=[];for(let j=0;j<27;j++){const t=j/26,a=t*Math.PI*4,rr=r*(1-t*.91);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr,z]);}k.line(g,pts,.0007,p.carving);}
function frieze(k,g,p,w,h,x,y,z){k.box(g,w,h,.009,p.pale,x,y,z);for(const side of [-1,1])k.box(g,w,.002,.011,p.carving,x,y+side*h*.44,z+.002);const n=Math.round(w/.045);for(let i=0;i<n;i++){const xx=x+((i+.5)/n-.5)*w;scroll(k,g,p,xx,y,z+.0054,h*.24);}}
function doorway(k,g,p,x,y,z,r,spring){
 const shape=new THREE.Shape(),outer=r+.009;shape.moveTo(-outer,0);shape.lineTo(-outer,spring);shape.absarc(0,spring,outer,Math.PI,0,true);shape.lineTo(outer,0);shape.closePath();const hole=new THREE.Path();hole.moveTo(-r,0);hole.lineTo(r,0);hole.lineTo(r,spring);hole.absarc(0,spring,r,0,Math.PI,false);hole.closePath();shape.holes.push(hole);
 k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:false,curveSegments:28}),p.pale,x,y,z);
 for(let i=0;i<13;i++){const a=i/12*Math.PI;scroll(k,g,p,x+Math.cos(a)*(r+.0045),y+spring+Math.sin(a)*(r+.0045),z+.0085,.0025);}
 // Open lower entrance; bronze tracery is confined to the transom.
 const frame=new THREE.Group();frame.position.set(x,y,z-.005);g.add(frame);k.box(frame,r*1.94,.003,.003,p.bronze,0,spring,0);
 for(let row=0;row<4;row++)for(let col=-6;col<=6;col++){const xx=col*.009,yy=spring+.006+row*.010;if(xx*xx+(yy-spring)**2>(r-.004)**2)continue;const ring=k.mesh(frame,new THREE.TorusGeometry(.0043,.0007,4,6),p.bronze,xx,yy,0);ring.rotation.z=Math.PI/6;}
}
export function mausoleum(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.70,.78);const initialSite=g.children[0];g.remove(initialSite);initialSite.geometry.dispose();p.pale=stone(k,'#c9c9be');p.shade=k.mat('#a5a99f',.94);p.carving=k.mat('#b7b9ae',.93);p.bronze=k.mat('#58615a',.72,.18);p.blue=k.mat('#29466e',.46,.12);p.tileRib=k.mat('#2e486b',.46,.12);p.tileEdge=k.mat('#314863',.55,.10);
 for(const key of ['blue','tileRib','tileEdge'])p[key].userData.night={color:new THREE.Color('#9ab6d2'),intensity:.06};
 const hillside=k.mat('#8b9e80',.98);hillside.userData.landscape=true;const grade=(x,z)=>THREE.MathUtils.lerp(ground(x,z),.021+.282*THREE.MathUtils.clamp((.50-z)/.65,0,1),(1-THREE.MathUtils.smoothstep(Math.abs(x),.43,.69))*(1-THREE.MathUtils.smoothstep(-z,.60,.77))*(1-THREE.MathUtils.smoothstep(Math.hypot(x/.70,z/.78),.96,1)));disc(k,g,.70,.78,grade,hillside);
 paving(k,g,p,.35,.56);
 // Broad flights and continuous sloping parapets lead to the same arrival platform.
 const count=42,step=.0155,top=.282,front=.50;for(let i=0;i<count;i++){const h=top*(i+1)/count;k.box(g,.54,h,step+.0004,p.pale,0,.021+h/2,front-i*step);}
 for(const side of [-1,1]){for(let i=0;i<=count;i++){const z=front+.009-i*step,y=.021+top*Math.min(i+1,count)/count;k.box(g,.027,y+.025,.0184,p.pale,side*.285,(y+.025)/2,z);if(i%4===0)k.box(g,.018,.035,.018,p.carving,side*.285,y+.043,z);}k.beam(g,[side*.285,.055,front+.009],[side*.285,.337,front-count*step+.009],.006,p.carving);}
 const y=.303,z=-.355; k.box(g,.81,.028,.44,p.pale,0,y-.014,z);k.box(g,.78,.265,.42,p.pale,0,.155,z);
 // The recessed interior sits behind three genuine front portals; no flat black decals.
 p.pale.userData.memorialFacade=true;
 archWall(k,g,{w:.56,h:.265,d:.030,y,z:z+.205,mat:p.pale,openings:[{x:-.18,r:.046,spring:.092,bottom:0},{x:0,r:.058,spring:.120,bottom:0},{x:.18,r:.046,spring:.092,bottom:0}]});
 k.box(g,.56,.380,.025,p.pale,0,y+.190,z-.175);for(const side of [-1,1])k.box(g,.028,.380,.36,p.pale,side*.268,y+.190,z+.005);
 const interior=k.mat('#4a514a',.98);k.box(g,.53,.25,.002,interior,0,y+.130,z-.160);k.box(g,.53,.004,.35,interior,0,y+.003,z+.005);
 for(const side of [-1,1])for(const back of [-1,1]){const x=side*.34,zz=z+back*.133;k.box(g,.12,.292,.166,p.pale,x,y+.146,zz);k.box(g,.135,.012,.18,p.carving,x,y+.297,zz);k.box(g,.14,.007,.184,p.pale,x,y+.305,zz);}
 for(const [x,r,spring]of [[-.18,.046,.092],[0,.058,.120],[.18,.046,.092]])doorway(k,g,p,x,y,z+.224,r,spring);
 for(const x of [-.09,.09])k.box(g,.015,.220,.024,p.pale,x,y+.11,z+.225);
 for(const [x,label]of [[-.18,'權民'],[0,'生民'],[.18,'族民']]){const yy=y+(x===0?.221:.206);frieze(k,g,p,.17,.026,x,yy,z+.228);inscription(k,g,label,.060,.018,x,yy,z+.234);}
 for(const x of [-.09,.09])for(const side of [-1,1]){const m=k.box(g,.026,.015,.022,p.carving,x+side*.010,y+.192,z+.226);m.rotation.z=side*.45;scroll(k,g,p,x+side*.013,y+.194,z+.239,.006);}
 brackets(k,g,p,.56,y+.247,z+.225,23,false);curvedRoof(k,g,p,.59,.19,y+.285,.044,z+.140,{shed:true});
 k.box(g,.54,.060,.32,p.pale,0,y+.324,z);frieze(k,g,p,.53,.028,0,y+.321,z+.175);brackets(k,g,p,.55,y+.340,z+.176,23,true);
 for(const side of [-1,1]){const face=new THREE.Group();face.position.set(side*.275,0,z);face.rotation.y=side*Math.PI/2;g.add(face);frieze(k,face,p,.30,.028,0,y+.321,0);brackets(k,face,p,.31,y+.340,0,13,true);}
 curvedRoof(k,g,p,.64,.39,y+.380,.108,z);
 const tablet=new THREE.Shape();tablet.moveTo(-.025,0);tablet.lineTo(.025,0);tablet.lineTo(.029,.068);tablet.lineTo(.021,.077);tablet.lineTo(-.021,.077);tablet.lineTo(-.029,.068);tablet.closePath();k.mesh(g,new THREE.ExtrudeGeometry(tablet,{depth:.008,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:1}),p.pale,0,y+.286,z+.202);inscription(k,g,'天地正氣',.031,.065,0,y+.326,z+.211,true);
 // Cypress rows support the ascent without hiding the hall behind round crowns.
 const needles=k.mat('#4e6755',.98),bark=k.mat('#655a47',.98);
 for(const side of [-1,1])for(let i=0;i<7;i++){const x=side*.48,z=.44-i*.14,y=grade(x,z),h=.18+i*.006;k.cyl(g,.003,.004,h*.6,bark,x,y+h*.3,z,6);const profile=[[0,h],[.015,h*.88],[.029,h*.64],[.034,h*.38],[.025,h*.22],[.009,h*.18]].map(([r,yy])=>new THREE.Vector2(r,yy));k.mesh(g,new THREE.LatheGeometry(profile,9),needles,x,y,z);}
 finish(k,g,{visitors:[[-.07,.45],[.08,.44]]});
 for(const side of [-1,1]){const light=new THREE.SpotLight('#e5e6d7',0,1.6,Math.PI*.25,.85,2);light.position.set(side*.40,.34,.16);light.target.position.set(0,.60,-.35);light.userData.nightIntensity=.18;g.add(light,light.target);}return g;
}
