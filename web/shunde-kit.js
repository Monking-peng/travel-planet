import * as THREE from 'three';
import {roof} from './wuhan-architecture.js';
import {glow} from './shenzhen-forms.js';

// Shared small architectural parts; each caller owns its complete model and lights.
export function palette(k){return {stone:k.mat('#b8b3a0'),wall:k.mat('#dedac6'),brick:k.mat('#768079'),wood:k.mat('#514c3c'),red:k.mat('#825143'),tile:k.mat('#67766a'),green:k.mat('#3d725a'),gold:k.mat('#b49a59',.56,.25),warm:glow(k,'#f3c788',1.7),water:k.mat('#60908b',.40,.10)};}
export function footing(k,g,w,d,p){k.box(g,w,.016,d,p.stone,0,.008,0);}
export function lattice(k,g,x,y,z,w,h,mat){
  for(const s of [-1,1]){k.box(g,.003,h,.006,mat,x+s*w/2,y,z);k.box(g,w,.003,.006,mat,x,y+s*h/2,z);}
  for(let i=1;i<6;i++)k.box(g,.0017,h,.005,mat,x+(i/6-.5)*w,y,z);
  for(let i=1;i<4;i++)k.box(g,w,.0017,.005,mat,x,y+(i/4-.5)*h,z);
}
export function balcony(k,g,x,z,w,y,mat){
  k.box(g,w,.004,.006,mat,x,y+.040,z);k.box(g,w,.004,.006,mat,x,y+.009,z);
  for(let i=0;i<=Math.ceil(w/.023);i++)k.box(g,.003,.032,.005,mat,x+(i/Math.ceil(w/.023)-.5)*w,y+.024,z);
}
export function lantern(k,g,x,y,z,p,size=.009){k.cyl(g,size*.78,size*.78,size*1.6,p.warm,x,y,z,12);k.cyl(g,size*.9,size*.9,.002,p.gold,x,y+size*.9,z,12);k.beam(g,[x,y+size,z],[x,y+size*2.5,z],.001,p.wood,4);}
export function hall(k,g,p,{x=0,z=0,w=.35,d=.24,h=.14,y=.018,double=false,tile=p.tile}={}){
  k.box(g,w+.035,.018,d+.04,p.stone,x,y+.009,z);k.box(g,w*.85,h*.86,d*.76,p.wall,x,y+.018+h*.43,z);
  for(const s of [-1,1])for(let i=0;i<5;i++){const xx=x+(i/4-.5)*w*.87;k.cyl(g,.004,.005,h,p.wood,xx,y+h/2+.018,z+s*d*.46,8);lattice(k,g,xx,y+h*.50+.018,z+s*d*.385,w*.15,h*.66,p.wood);}
  roof(k,g,w*1.2,d*1.24,h*.40,y+h+.018,tile,tile,x,z);
  if(double){k.box(g,w*.70,h*.28,d*.72,p.wood,x,y+h*1.35,z);roof(k,g,w*.96,d,h*.35,y+h*1.49,tile,tile,x,z);}
  for(const s of [-1,1])k.box(g,w*1.04,.003,.004,p.warm,x,y+h+.017,z+s*d*.628);
}
export function archWall(k,g,{w,h,d,x=0,y=0,z=0,openings=[],mat}){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
  for(const {x:cx=0,r,spring,bottom=.001} of openings){const o=new THREE.Path();o.moveTo(cx-r,bottom);o.lineTo(cx-r,spring);o.absarc(cx,spring,r,Math.PI,0,true);o.lineTo(cx+r,bottom);o.closePath();s.holes.push(o);}
  k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:32}),mat,x,y,z-d/2);
}
export function moonWall(k,g,p,{x=0,y=.018,z=0,w=.3,h=.25,r=.08}={}){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();const hole=new THREE.Path();hole.absarc(0,r+.008,r,0,Math.PI*2,true);s.holes.push(hole);
  k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:false,curveSegments:32}),p.wall,x,y,z-.008);
  const rim=k.mesh(g,new THREE.TorusGeometry(r+.001,.004,6,48),p.stone,x,y+r+.008,z+.01);return rim;
}
export function bridge(k,g,p,{x=0,z=0,w=.16,length=.62,rise=.15,y=.018}={}){
  // Open masonry arch, a curved deck and stepped parapets cross the water.
  const pts=[],n=36;for(let i=0;i<=n;i++){const u=i/n;pts.push([-length/2+length*u,y+.035+rise*Math.sin(u*Math.PI)]);}
  const shape=new THREE.Shape();shape.moveTo(...pts[0]);pts.slice(1).forEach(q=>shape.lineTo(...q));
  for(let i=n;i>=0;i--){const u=i/n;shape.lineTo(-length/2+length*u,y+.013+Math.max(0,rise-.025)*Math.sin(u*Math.PI));}shape.closePath();
  const m=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false}),p.stone,x,0,z-w/2);
  for(const side of [-1,1]){const path=pts.map(([xx,yy])=>[x+xx,yy+.043,z+side*w/2]);k.line(g,path,.004,p.stone);
    for(let i=0;i<=12;i++){const u=i/12,xx=x-length/2+length*u,yy=y+.035+rise*Math.sin(u*Math.PI);k.box(g,.007,.045,.009,p.stone,xx,yy+.022,z+side*w/2);k.box(g,length/13,.022,.005,p.stone,xx,yy+.022,z+side*w/2);}}
  return m;
}
