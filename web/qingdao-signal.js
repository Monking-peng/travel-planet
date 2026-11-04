import * as THREE from 'three';
import {palette,site,grove,finish,lit,TAU} from './qingdao-kit.js';

function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);return s;}
function stone(k,cx,cz){
 const m=k.mat('#a79a83',.97,0);m.userData.signalMasonry=true;
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 signalP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsignalP=position;');
  s.fragmentShader='varying vec3 signalP;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float row=floor(signalP.y/.022),az=atan(signalP.x-(${cx.toFixed(5)}),signalP.z-(${cz.toFixed(5)}));
   float col=az*6.5+mod(row,2.)*.5;vec2 cell=vec2(col,signalP.y/.022),f=fract(cell);
   float seam=max(1.-smoothstep(.015,.045,min(f.x,1.-f.x)),1.-smoothstep(.018,.060,min(f.y,1.-f.y)));
   float hash=fract(sin(dot(floor(cell),vec2(127.1,311.7)))*43758.5453);
   float grit=fract(sin(dot(floor(signalP.xy*1400.),vec2(61.7,93.1)))*17263.7);
   diffuseColor.rgb*=mix(.86+hash*.18+grit*.035,.67,seam*.75);
  `);
 };m.customProgramCacheKey=()=>`signal-stone-${cx}-${cz}`;return m;
}
function curvedWall(k,g,p,r,h,upper){
 const w=TAU*r/8,m=p.masonry;
 for(let side=0;side<8;side++){
  const a=side/8*TAU,s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
  const openings=[{y:.012,w:.030,h:.066}];if(upper)openings.push({y:h-.093,w:.029,h:.061});
  for(const v of openings)s.holes.push(new THREE.Path(arch(v.w,v.h).getPoints(20).map(q=>new THREE.Vector2(q.x,q.y+v.y))));
  const geo=new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false,curveSegments:24}),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const angle=a+pos.getX(i)/r,rr=r-pos.getZ(i);pos.setXYZ(i,Math.sin(angle)*rr,pos.getY(i),Math.cos(angle)*rr);}
  // Bending depth inward reverses orientation; retain outward front faces.
  const indices=Array.from({length:pos.count},(_,i)=>i);for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];geo.setIndex(indices);geo.computeVertexNormals();k.mesh(g,geo,m);
  for(const v of openings){
   const f=new THREE.Group();f.position.set(Math.sin(a)*(r-.012),v.y,Math.cos(a)*(r-.012));f.rotation.y=a;g.add(f);
   k.mesh(f,new THREE.ShapeGeometry(arch(v.w,v.h),20),p.glass);
   for(const x of [-.010,-.005,0,.005,.010])k.box(f,.0008,v.h-v.w/2,.001,p.frame,x,(v.h-v.w/2)/2,.002);k.box(f,v.w,.0013,.002,p.frame,0,v.h-v.w/2,.003);
   const rim=arch(v.w+.010,v.h+.006);rim.holes.push(new THREE.Path(arch(v.w,v.h).getPoints(20).map(q=>new THREE.Vector2(q.x,q.y+.003))));
   k.mesh(f,new THREE.ExtrudeGeometry(rim,{depth:.003,bevelEnabled:false,curveSegments:20}),p.trim,0,-.003,.012);
  }
 }
}
function dome(k,g,p,r,h){
 const red=lit(k,'#bd3a34',.18);red.userData.signalDome=true;red.userData.night.color.copy(red.color);
 const c=h+r*.95,sy=.88,top=new THREE.SphereGeometry(r,128,80,0,TAU,0,Math.PI/2),p0=top.attributes.position,idx=top.index.array,kept=[];
 const winY=r*.23,winW=r*.25,winH=r*.28,inside=(x,y)=>Math.abs(x)<winW/2&&y>=winY&&y<=winY+winH&&(y<winY+winH-winW/2||x*x+(y-(winY+winH-winW/2))**2<(winW/2)**2);
 for(let i=0;i<idx.length;i+=3){let x=0,y=0,z=0;for(let j=0;j<3;j++){x+=p0.getX(idx[i+j])/3;y+=p0.getY(idx[i+j])*sy/3;z+=p0.getZ(idx[i+j])/3;}let cut=false;for(let n=0;n<4;n++){const a=n/4*TAU,u=x*Math.cos(a)-z*Math.sin(a),v=x*Math.sin(a)+z*Math.cos(a);if(v>r*.65&&inside(u,y)){cut=true;break;}}if(!cut)kept.push(idx[i],idx[i+1],idx[i+2]);}
 top.setIndex(kept);const roof=k.mesh(g,top,red,0,c+.025,0);roof.scale.y=sy;
 const lowerAngle=Math.acos(-.21/sy),low=k.mesh(g,new THREE.SphereGeometry(r,64,32,0,TAU,lowerAngle,Math.PI-lowerAngle),red,0,c+.025,0);low.scale.y=sy;
 // The wide red bowl and a narrow two-part glazed belt read as a sphere.
 k.cyl(g,r,r*.971,r*.21,p.glass,0,c+.025-r*.105,0,64);
 for(let i=0;i<32;i++){const a=i/32*TAU;k.beam(g,[Math.sin(a)*r*.971,c+.025-r*.21,Math.cos(a)*r*.971],[Math.sin(a)*r,c+.025,Math.cos(a)*r],.0014,p.frame);}
 for(const [rr,yy]of [[r,c+.025],[r*.994,c+.025-r*.065],[r*.971,c+.025-r*.21]])k.ring(g,rr,.0015,p.frame,yy);
 for(let n=0;n<4;n++){
  const a=n/4*TAU,f=new THREE.Group();f.position.set(Math.sin(a)*r*.91,c+.025+winY,Math.cos(a)*r*.91);f.rotation.y=a;g.add(f);
  k.mesh(f,new THREE.ShapeGeometry(arch(winW,winH),24),p.glass,0,0,-.012);
  const rim=arch(winW+.009,winH+.006);rim.holes.push(new THREE.Path(arch(winW,winH).getPoints(24).map(q=>new THREE.Vector2(q.x,q.y+.003))));
  k.mesh(f,new THREE.ExtrudeGeometry(rim,{depth:.012,bevelEnabled:false,curveSegments:24}),red,0,-.003,-.006);
  k.box(f,winW,.0016,.003,p.frame,0,winH*.38,-.008);
 }
 for(let i=0;i<30;i++){
  const a=i/30*TAU,q=new THREE.Group();q.rotation.y=a;g.add(q);const fin=new THREE.Shape();fin.moveTo(r*.53,h-.004);fin.lineTo(r*.74,h-.004);fin.lineTo(r*.74,h+.071);fin.lineTo(r*.58,h+.058);fin.closePath();
  k.mesh(q,new THREE.ExtrudeGeometry(fin,{depth:.004,bevelEnabled:false}),p.pale,0,0,-.002);
 }
 k.cyl(g,.002,.002,.034,p.frame,0,c+r*sy+.043,0,8);k.cyl(g,.018,.022,.004,red,0,c+r*sy+.025,0,24);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.beam(g,[Math.sin(a)*r*.70,h+.009,Math.cos(a)*r*.70],[Math.sin(a)*r*.92,h+.026,Math.cos(a)*r*.92],.0008,p.frame);const lamp=k.box(g,.009,.005,.007,p.lamp,Math.sin(a)*r*.92,h+.029,Math.cos(a)*r*.92);lamp.rotation.y=a;}
}
export function signal(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.66,.58);p.pale.color.set('#dad9ca');
 const paving=k.mat('#b5aa94',.95),edge=k.mat('#8f897a',.97);paving.userData.signalPaving=true;
 const platform=k.cyl(g,1,1,.038,edge,0,.035,-.01,96);platform.scale.set(.485,1,.383);const floor=k.cyl(g,1,1,.002,paving,0,.055,-.01,96);floor.scale.set(.484,1,.382);
 for(let row=-7;row<=7;row++){const z=row*.046-.01,half=.484*Math.sqrt(Math.max(0,1-((z+.01)/.382)**2));k.box(g,half*2,.0006,.0007,edge,0,.0565,z);for(let col=-9;col<=9;col++){const x=col*.049+(row%2)*.0245;if(Math.abs(x)<half-.01)k.box(g,.0007,.0006,.046,edge,x,.0565,z+.023);}}
 const first=height(0,.5174)+.003;
 for(let i=0;i<12;i++){
  const z=.525-i*.014,top=Math.max(height(0,z-.0076)+.003,first+(.056-first)*i/11),pos=[];
  for(const y of [0,1])for(const [x,zz]of [[-.16,z+.0076],[.16,z+.0076],[.16,z-.0076],[-.16,z-.0076]])pos.push(x,y?top:height(x,zz)+.0005,zz);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);geo.computeVertexNormals();k.mesh(g,geo,paving);
 }
 const glass=lit(k,'#465352',.075),frame=k.mat('#454b42',.83),trim=k.mat('#96856b',.94),lamp=lit(k,'#625e50',.5);
 for(const [x,z,r,h]of [[0,-.14,.17,.263],[-.25,.14,.14,.157],[.25,.14,.14,.157]]){
  const q=new THREE.Group();q.position.set(x,.056,z);g.add(q);const pp={...p,glass,frame,trim,lamp,masonry:stone(k,x,z)};const base=r*.59;
  k.cyl(q,base+.010,base+.013,.007,edge,0,.0035,0,64);curvedWall(k,q,pp,base,h,h>.2);k.cyl(q,base+.004,base+.004,.006,trim,0,h-.002,0,64);dome(k,q,pp,r,h);
 }
 grove(k,g,height,[[-.51,-.14,.15],[.51,-.14,.15],[-.34,-.43,.16],[.34,-.43,.16],[-.12,-.48,.14],[.12,-.49,.16]]);
 return finish(k,g,{lamps:[[-.37,.056,.23],[.37,.056,.23]],visitors:[[-.06,.056,.26],[.07,.056,.27],[.10,.056,-.01]]});
}
