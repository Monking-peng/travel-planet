import * as THREE from 'three';
import {roof} from './wuhan-architecture.js';

export function yangtzeBridge(k){const g=new THREE.Group(),steel=k.mat('#566f6f',.58,.35),stone=k.mat('#b9bcb2'),road=k.mat('#777f7a'),rail=k.mat('#d3cec0'),warm=k.mat('#ddd0a8',.4,.2,'#ffd196');warm.userData.night.intensity=2.0;steel.userData.night={color:new THREE.Color('#e7b26e'),intensity:.22};
  const L=1.26,H=.21;
  k.box(g,L,.024,.15,road,0,H);k.box(g,L,.015,.10,steel,0,H-.086);
  for(const z of [-.067,.067]){k.box(g,L,.0035,.0035,warm,0,H-.026,z);k.box(g,L,.0035,.0035,warm,0,H-.096,z);k.box(g,L,.008,.008,steel,0,H-.024,z);k.box(g,L,.007,.007,steel,0,H-.095,z);
    for(let i=0;i<18;i++){const x=-L/2+i*L/18,xx=x+L/18;k.beam(g,[x,H-.094,z],[xx,H-.024,z],.0032,steel);k.beam(g,[x,H-.024,z],[xx,H-.094,z],.0032,steel);k.box(g,.004,.077,.006,steel,x,H-.058,z);}
    k.box(g,L,.004,.003,rail,0,H+.027,z);for(let i=0;i<48;i++)k.box(g,.0018,.029,.0018,rail,-L/2+i*L/47,H+.013,z);
  }
  for(let i=0;i<8;i++){const x=-.49+i*.14,bottom=-.08-x*x/4.3;k.box(g,.032,.103-bottom,.075,stone,x,(.103+bottom)/2);k.box(g,.044,.013,.09,stone,x,.102);}
  for(const sign of [-1,1]){const v=[],idx=[];for(let i=0;i<=18;i++){const t=i/18,x=sign*(L/2+t*.28),y=H-(H+.12)*t*t*(3-2*t);for(const z of [-.075,.075])v.push(x,y,z);if(i){const a=i*2;idx.push(a-2,a-1,a,a-1,a+1,a);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();road.side=THREE.DoubleSide;k.mesh(g,geo,road);for(const z of [-.075,.075])k.line(g,Array.from({length:19},(_,i)=>{const t=i/18;return [sign*(L/2+t*.28),H-(H+.12)*t*t*(3-2*t)+.012,z];}),.0035,rail);}
  for(const x of [-.59,.59])for(const z of [-.116,.116]){k.box(g,.072,.36,.071,stone,x,.06,z);k.box(g,.027,.115,.002,steel,x,.143,z+.037);for(let j=0;j<6;j++)k.box(g,.029,.002,.004,rail,x,.09+j*.02,z+.039);k.box(g,.002,.115,.004,rail,x,.143,z+.039);k.box(g,.084,.012,.082,rail,x,.242,z);roof(k,g,.105,.10,.029,.253,k.mat('#6e7769'),warm,x,z);k.cyl(g,.003,.005,.018,warm,x,.288,z,8);}
  for(let i=0;i<13;i++){const x=-.56+i*.092;for(const z of [-.075,.075]){k.cyl(g,.0016,.002,.064,steel,x,H+.042,z,6);k.box(g,.014,.003,.006,warm,x,H+.075,z);}}
  for(let i=0;i<24;i++)k.box(g,.022,.001,.002,rail,-.59+i*.05,H+.013,0);
  for(let i=0;i<7;i++){const x=-.46+i*.15,z=(i%2?1:-1)*.030,paint=k.mat(['#eee7d0','#805b48','#577d86'][i%3]);k.box(g,.035,.013,.015,paint,x,H+.021,z);k.box(g,.017,.010,.014,steel,x,H+.032,z);}
  // Open lower deck retains two distinct railway tracks.
  for(const z of [-.025,-.012,.012,.025])k.box(g,L,.002,.002,rail,0,H-.076,z);
  return k.merge(g);
}
