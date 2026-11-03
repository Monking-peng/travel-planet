import * as THREE from 'three';
export {site,siteHeight,disc,skin,sign,steps,ellipsoid,polygon,prism,frame,hill,woodland,perimeter,windowGlass,lit,finish,roof,railing,TAU} from './hongkong-kit.js';
export {archOpening,dome} from './tianjin-kit.js';
export {gable,cross} from './qingdao-kit.js';
import {polygon} from './hongkong-kit.js';
export function hip(k,g,w,d,h,y,mat,edge,x=0,z=0){const ridge=Math.max(.001,(w-d)/2),a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y,z+d/2],e=[x-w/2,y,z+d/2],l=[x-ridge,y+h,z],rr=[x+ridge,y+h,z];for(const face of [[a,b,rr,l],[b,c,rr],[c,e,l,rr],[e,a,l]])polygon(k,g,face,mat);for(const [v,q]of [[a,b],[b,c],[c,e],[e,a],[l,rr]])k.beam(g,v,q,.002,edge);for(let j=-Math.floor(w/.025)/2;j<=Math.floor(w/.025)/2;j++){const xx=j*.025;for(const side of [-1,1])k.beam(g,[x+xx,y+.001,z+side*d/2],[x+Math.max(-ridge,Math.min(ridge,xx)),y+h+.001,z],.0007,mat);}}
export {story,lantern} from './dali-kit.js';
import {lit} from './hongkong-kit.js';
export function palette(k){const p={stone:k.mat('#a49e89',.97),pale:k.mat('#ddd6c1',.93),wall:k.mat('#ede4cd',.94),ochre:k.mat('#d6ac60',.89),wood:k.mat('#244f46',.9),tile:k.mat('#9c5e45',.93),mint:k.mat('#96bdac',.91),red:k.mat('#9f4836',.91),blue:k.mat('#4b6571',.58),gold:k.mat('#bf9e5b',.50,.28),steel:k.mat('#adb5b1',.56,.23),dark:k.mat('#34464b',.8),water:k.mat('#638e93',.55,.08),warm:lit(k,'#d9bb8f',.40)};p.water.userData.landscape=true;return p;}
export function archPath(x,y,w,h){const s=new THREE.Path(),r=w/2;s.moveTo(x-r,y);s.lineTo(x+r,y);s.lineTo(x+r,y+h-r);s.absarc(x,y+h-r,r,0,Math.PI,false);s.closePath();return s;}
export function extrude(k,g,shape,m,depth=.055,z=0){return k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:20}),m,0,0,z-depth/2);}
export function panel(k,g,p,{x=0,y=.15,z=0,w=.07,h=.12,arched=false,door=false,shutters=false}={}){
 const m=door?p.wood:lit(k,'#405751',.21),s=arched?new THREE.Shape(archPath(0,0,w,h).getPoints(24)):new THREE.Shape([new THREE.Vector2(-w/2,0),new THREE.Vector2(w/2,0),new THREE.Vector2(w/2,h),new THREE.Vector2(-w/2,h)]);
 const o=k.mesh(g,new THREE.ShapeGeometry(s,24),m,x,y,z);o.material.side=THREE.DoubleSide;
 const pts=s.getPoints(30).map(a=>[x+a.x,y+a.y,z+.002]);k.line(g,pts,.003,p.pale,true);k.box(g,w+.014,.006,.014,p.pale,x,y-.003,z);
 if(!door){for(let a=-1;a<=1;a++)k.box(g,.002,h*.9,.002,p.pale,x+a*w*.24,y+h*.46,z+.002);k.box(g,w,.002,.002,p.pale,x,y+h*.48,z+.002);}
 if(shutters)for(const side of [-1,1]){k.box(g,w*.42,h,.008,p.wood,x+side*w*.75,y+h/2,z);for(let j=0;j<7;j++)k.box(g,w*.35,.0015,.009,p.pale,x+side*w*.75,y+h*(j+.5)/7,z+.002);}
}
export function column(k,g,p,x,y,z,h,r=.008){k.cyl(g,r*.82,r,h,p.pale,x,y+h/2,z,12);for(const yy of [y,y+h]){k.box(g,r*3,.012,r*3,p.pale,x,yy,z);k.cyl(g,r*1.5,r*1.5,.006,p.pale,x,yy+.008,z,12);}}
export function pediment(k,g,p,x,y,z,w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();const o=extrude(k,g,s,p.wall,.018,z);o.position.x=x;o.position.y=y;k.beam(g,[x-w/2,y,z+.013],[x,y+h,z+.013],.006,p.pale);k.beam(g,[x+w/2,y,z+.013],[x,y+h,z+.013],.006,p.pale);k.box(g,w+.025,.011,.03,p.pale,x,y,z);}
export function balustrade(k,g,p,a,b,y,h=.055){k.beam(g,[a[0],y+h,a[1]],[b[0],y+h,b[1]],.004,p.pale);k.beam(g,[a[0],y,a[1]],[b[0],y,b[1]],.004,p.pale);const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.018);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;k.cyl(g,.0025,.0032,h,p.pale,x,y+h/2,z,6);}}
export function calçada(k){const m=k.mat('#d8d5c5',.98);m.userData.landscape=true;m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vPave;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPave=position;');s.fragmentShader='varying vec3 vPave;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float band=.5+.5*sin((vPave.z+.055*sin(vPave.x*15.))*48.);float dark=smoothstep(.60,.68,band);vec2 cell=fract(vPave.xz*150.);float joint=step(.075,min(cell.x,cell.y));diffuseColor.rgb*=mix(vec3(.22,.26,.25),vec3(1.),1.-dark)*mix(.83,1.,joint);`);};m.customProgramCacheKey=()=> 'macau-calcada';return m;}
