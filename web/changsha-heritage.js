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
export {yuelu} from './changsha-yuelu.js';

export {aiwan} from './changsha-aiwan.js';

export {tianxin} from './changsha-tianxin.js';
