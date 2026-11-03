import * as THREE from 'three';
import {roof,tree,rail,plaque} from './wuhan-architecture.js';
import {skin,glow,bollards,people} from './shenzhen-forms.js';
import {lattice,balcony,archWall} from './shunde-kit.js';
export {roof,tree,rail,plaque,skin,glow,bollards,people,lattice,balcony,archWall};
export const TAU=Math.PI*2;
export function palette(k){return {stone:k.mat('#b5b5a4',.92),pale:k.mat('#d9d7c5',.87),red:k.mat('#963e32',.88),wood:k.mat('#493d31',.91),tile:k.mat('#526158',.86),leaf:k.mat('#55745b',.96),gold:k.mat('#bb914f',.48,.35),warm:glow(k,'#f2cc93',.72,.3,.55),water:k.mat('#508b87',.32,.22)};}

// Only the landscape meets the sphere. Architecture stays rigid on a level site.
export function siteHeight(x,z,rx,rz){const r=Math.hypot(x/rx,z/rz),t=THREE.MathUtils.smoothstep(r,.67,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .014*(1-t)-sag*t+.002;}
export function disc(k,g,rx,rz,height,mat,x=0,z=0){
 const positions=[],indices=[],N=128,R=32;
 for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const a=i/N*TAU,xx=Math.sin(a)*rx*j/R,zz=Math.cos(a)*rz*j/R;positions.push(xx+x,typeof height==='function'?height(xx,zz):height,zz+z);}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)indices.push(a,b,a+1);indices.push(a+1,b,b+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return k.mesh(g,geo,mat);
}
export function site(k,g,rx=.62,rz=.55){const mat=k.mat('#8fa580',.98);mat.userData.landscape=true;disc(k,g,rx,rz,(x,z)=>siteHeight(x,z,rx,rz),mat);return (x,z)=>siteHeight(x,z,rx,rz);}
export function pond(k,g,p,rx,rz,x=0,z=0){p.water.userData.water=true;disc(k,g,rx,rz,.019,p.water,x,z);}
export function paving(k,g,p,rx,rz){disc(k,g,rx,rz,.020,p.pale);for(let j=-5;j<=5;j++){const z=j*rz/6,w=2*rx*Math.sqrt(1-(z/rz)**2);k.box(g,w,.0007,.0011,p.stone,0,.021,z);}}
export function steps(k,g,p,x,z,w=.25,n=5,h=.055,d=.13){for(let i=0;i<n;i++){const v=(i+1)/n;k.box(g,w,h*v,d/n,p.stone,x,.021+h*v/2,z-i*d/n);}}
export function grove(k,g,height,points){for(const [x,z,size=.13]of points)tree(k,g,x,height(x,z),z,size);}
export function bamboo(k,g,x,z,h=.28){const stem=k.mat('#738453',.9),leaves=k.mat('#4b7557',.96);for(let i=0;i<7;i++){const a=i*2.399,s=.018*Math.sqrt(i),xx=x+Math.sin(a)*s,zz=z+Math.cos(a)*s,high=h*(.72+.04*i);k.beam(g,[xx,.018,zz],[xx+.015*Math.sin(a),high,zz+.012*Math.cos(a)],.0019,stem);for(let j=2;j<6;j++){const y=high*j/6;for(const side of [-1,1]){const o=k.mesh(g,new THREE.SphereGeometry(.01,6,4),leaves,xx+side*.013,y,zz);o.scale.set(2.3,.25,.43);o.rotation.z=side*.42;}}}}
export function glazing(k,g,p,w,h,d,x,y,z){const glass=k.glass('#597e83','#ffdc9c',w*19+h*37);k.box(g,w,h,d,glass,x,y,z);for(const side of [-1,1]){for(let i=0;i<=Math.ceil(w/.035);i++)k.box(g,.0018,h,.002,p.stone,x-w/2+i*w/Math.ceil(w/.035),y,z+side*(d/2+.001));for(let i=0;i<=Math.ceil(h/.035);i++)k.box(g,w,.0015,.002,p.stone,x,y-h/2+i*h/Math.ceil(h/.035),z+side*(d/2+.001));}return glass;}
export function sign(k,g,text,w,h,x,y,z,{background='#eeeece',color='#263d39'}={}){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=512;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,192);ctx.font='bold 116px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,256,104,470);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff',.7);m.map=t;m.emissiveMap=t;m.userData.night={color:new THREE.Color('#fff0cf'),intensity:.4};k.mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);}
export function finish(k,g,{lamps=[],visitors=[]}={}){bollards(k,g,lamps);people(k,g,visitors);return k.merge(g);}
