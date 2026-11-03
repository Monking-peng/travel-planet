import * as THREE from 'three';
import {roof,tree,rail} from './wuhan-architecture.js';
import {glow,bollards,people} from './shenzhen-forms.js';
import {archWall,lattice,balcony} from './shunde-kit.js';
export {roof,tree,rail,glow,bollards,people,archWall,lattice,balcony};

export function masonry(k,color){
  const m=k.mat(color,.94);m.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vMasonry;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMasonry=position;');
    s.fragmentShader='varying vec3 vMasonry;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float course=floor(vMasonry.y*145.0);
      float horizontal=step(.10,fract(vMasonry.y*145.0));
      float vertical=step(.065,fract((vMasonry.x+vMasonry.z)*75.0+mod(course,2.0)*.5));
      diffuseColor.rgb*=mix(.80,1.0,horizontal*vertical);`);
  };m.customProgramCacheKey=()=> 'xian-masonry-v1';return m;
}
export function colors(k){const p={stone:masonry(k,'#9b9988'),light:k.mat('#d2cbb4'),brick:masonry(k,'#b19a76'),wall:k.mat('#cfc5a7'),red:k.mat('#8d3e31'),wood:k.mat('#4c4034'),tile:k.mat('#4f5c4b'),green:k.mat('#52714c'),gold:k.mat('#b9944e',.53,.36),blue:k.mat('#3b6261'),warm:glow(k,'#f1c98b',.85,.4,.5)};
  for(const key of ['stone','brick','red','blue','wall'])p[key].userData.night={color:new THREE.Color('#e9bc7b'),intensity:key==='brick'?.16:.11};
  return p;
}
export function ellipseSurface(k,g,rx,rz,y,material){
  const positions=[],indices=[],rings=36,segments=160;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=j/rings;positions.push(Math.cos(a)*rx*r,y,Math.sin(a)*rz*r);}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;if(j)indices.push(a,a+1,b);indices.push(a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return k.mesh(g,geo,material);
}
export function terrace(k,g,p,rx,rz){const b=k.cyl(g,rx,rx,.014,p.light,0,.007,0,80);b.scale.z=rz/rx;for(let j=-4;j<=4;j++){const z=j*rz/5,w=2*rx*Math.sqrt(1-(z/rz)**2);k.box(g,w,.0008,.0012,p.stone,0,.0145,z);}return b;}
export function steps(k,g,p,w,d,h,x,z,n=12){for(let i=0;i<n;i++){const v=(i+1)/n;k.box(g,w,h*v,d/n,p.light,x,h*v/2+.014,z-i*d/n);}}
export function ledge(k,g,p,w,d,y){k.box(g,w,.009,d,p.light,0,y,0);const r=new THREE.Group();r.position.y=y+.005;rail(k,r,w*.98,d*.98,0,p.light);g.add(r);}
export function timberFloor(k,g,p,{w,d,y,h,bays=7}){
  k.box(g,w*.83,h*.86,d*.75,p.wall,0,y+h*.43,0);
  for(const s of [-1,1]){
    for(let i=0;i<bays;i++){const x=(i/(bays-1)-.5)*w*.91;k.cyl(g,.005,.006,h,p.red,x,y+h/2,s*d*.46,8);lattice(k,g,x,y+h*.46,s*d*.385,w*.72/bays,h*.66,p.wood);
      for(let level=0;level<3;level++){k.box(g,.025+level*.009,.004,.025,p.blue,x,y+h-.016+level*.006,s*d*.47);}}
    k.box(g,w,.012,.018,p.blue,0,y+h-.006,s*d*.47);balcony(k,g,0,s*d*.5,w,y,p.red);
    for(let i=0;i<5;i++)k.cyl(g,.004,.005,h,p.red,s*w*.47,y+h/2,(i/4-.5)*d*.8,8);
  }
}
export function eave(k,g,p,w,d,y,h,tile=p.tile){roof(k,g,w,d,h,y,tile,p.warm);for(const s of [-1,1])k.box(g,w*.94,.002,.003,p.warm,0,y-.004,s*d*.48);}
export function hall(k,g,p,{x=0,z=0,w=.4,d=.24,y=.02,h=.14,roofHeight=.08}={}){const a=new THREE.Group();a.position.set(x,y,z);k.box(a,w+.04,.018,d+.04,p.light,0,.009,0);timberFloor(k,a,p,{w,d,y:.018,h,bays:7});eave(k,a,p,w*1.19,d*1.2,h+.025,roofHeight);g.add(a);return a;}
export function groves(k,g,points){for(let i=0;i<points.length;i++){const [x,z,s=.085]=points[i];tree(k,g,x,.015,z,s);}}
export function finish(k,g,p,{lamps=[],visitors=[]}={}){bollards(k,g,lamps);people(k,g,visitors);return k.merge(g);}
