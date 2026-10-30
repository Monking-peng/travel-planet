import * as THREE from 'three';
import {glow} from './shenzhen-forms.js';

// Orange Isle Bridge: repeated low concrete arches and the circular island ramp.
// It is deliberately not a suspension bridge or a generic illuminated cable span.
export function juzhouBridge(k){
  const g=new THREE.Group(),concrete=k.mat('#a5ad9e',.92),deck=k.mat('#737e75',.97),rail=k.mat('#c4c8b6',.70,.14),paint=k.mat('#dedcc5'),warm=glow(k,'#edcc8f',.55),headlight=glow(k,'#f5e8bb',.70);
  const y=.185,span=.18,length=1.44;
  k.box(g,length,.022,.118,concrete,0,y,0);k.box(g,length,.003,.105,deck,0,y+.013,0);
  for(let i=0;i<8;i++){
    const center=-length/2+(i+.5)*span;
    for(const z of [-.046,.046]){
      const p=[],idx=[];for(let j=0;j<=24;j++){const t=j/24,x=center+(t-.5)*span,bottom=.045+.100*Math.sin(Math.PI*t);p.push(x,bottom,z,x,bottom+.016,z);if(j){const a=(j-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();concrete.side=THREE.DoubleSide;k.mesh(g,geo,concrete);
      for(let j=1;j<6;j++){const t=j/6,x=center+(t-.5)*span,bottom=.059+.10*Math.sin(t*Math.PI);k.box(g,.006,y-bottom,.008,concrete,x,(y+bottom)/2,z);}
    }
  }
  for(let i=0;i<=8;i++){const x=-length/2+i*span;k.box(g,.020,.165,.105,concrete,x,.0825,0);k.box(g,.033,.012,.120,concrete,x,.162,0);}
  for(const side of [-1,1]){
    k.box(g,length,.005,.004,rail,0,y+.041,side*.057);k.box(g,length,.003,.004,warm,0,y+.019,side*.057);
    for(let i=0;i<65;i++)k.box(g,.002,.023,.002,rail,-length/2+i/64*length,y+.030,side*.057);
  }
  for(let i=0;i<29;i++)k.box(g,.021,.001,.002,paint,-.69+i*.049,y+.015,0);
  for(const side of [-1,1]){
    const p=[],idx=[];
    for(let i=0;i<=20;i++){const t=i/20,x=side*(.72+t*.28),h=y*(1-t)+.008*t;p.push(x,0,-.059,x,h,-.059,x,h,.059,x,0,.059);if(i){const a=(i-1)*4,b=i*4;idx.push(a,b,a+1,a+1,b,b+1,a+1,b+1,a+2,a+2,b+1,b+2,a+2,b+2,a+3,a+3,b+2,b+3);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,concrete);
    for(let i=0;i<20;i++){const t=(i+.5)/20,road=k.box(g,.017,.003,.105,deck,side*(.72+t*.28),y*(1-t)+.008*t+.003,0);road.rotation.z=-side*Math.atan((y-.008)/.28);}
  }
  // One continuous descending spiral connects the bridge to the island walk.
  const points=[],low=[];for(let i=0;i<=96;i++){const t=i/96,a=t*Math.PI*2.7;points.push([Math.cos(a)*.115,y-.150*t,-.18+Math.sin(a)*.115]);low.push([Math.cos(a)*.115,y-.150*t+.018,-.18+Math.sin(a)*.115]);}
  k.line(g,points,.019,concrete);k.line(g,low,.002,rail);
  k.line(g,[[.115,y,-.18],[.145,y,-.10],[.15,y,0]],.019,concrete);
  for(let i=0;i<7;i++){const t=(i+.3)/7,a=t*Math.PI*2.7,x=Math.cos(a)*.115,z=-.18+Math.sin(a)*.115,h=y-.150*t;k.cyl(g,.006,.008,h,concrete,x,h/2,z,8);}
  const carColors=['#deded1','#697d82','#8e5447'].map(c=>k.mat(c,.55,.14));
  for(let i=0;i<9;i++){const x=-.62+i*.15,z=i%2?.028:-.028;k.box(g,.035,.013,.018,carColors[i%3],x,y+.022,z);k.box(g,.019,.008,.016,k.mat('#5b7478',.4,.2),x,y+.031,z);k.box(g,.002,.003,.014,headlight,x+(i%2?.018:-.018),y+.020,z);}
  return k.merge(g);
}
