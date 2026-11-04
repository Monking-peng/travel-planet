import * as THREE from 'three';
import {palette,site,grove,finish,TAU,edge} from './xiamen-kit.js';

const climb=[[.38,.028,.29],[.36,.15,.26],[.35,.30,.21],[.28,.44,.16],[.18,.51,.11],[.10,.51,.08],[-.055,.665,-.07],[-.12,.71,-.10]];
const flights=climb.slice(1).map((b,i)=>{const a=climb[i],dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz);return {a,b,dx,dz,length,n:Math.max(2,Math.ceil(Math.max(Math.abs(b[1]-a[1])/.009,length/.014)))};});
function stairAt(x,z){let result=null;for(const f of flights){const t=THREE.MathUtils.clamp(((x-f.a[0])*f.dx+(z-f.a[2])*f.dz)/(f.length*f.length),0,1),distance=Math.hypot(x-f.a[0]-f.dx*t,z-f.a[2]-f.dz*t),y=f.a[1]+(f.b[1]-f.a[1])*Math.ceil(t*f.n)/f.n;if(!result||distance<result.distance)result={distance,y};}return result;}
function cut(x,z,y){const s=stairAt(x,z);return s.distance<.040?Math.min(y,s.y-.013):y;}
function graniteMaterial(k){
 const m=k.mat('#ada99a',.99);m.vertexColors=true;m.userData.sunlightRock=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 sunRock;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsunRock=position;');s.fragmentShader=`varying vec3 sunRock;
float sunHash(vec3 q){return fract(sin(dot(q,vec3(17.71,81.23,43.17)))*43758.5453);}
float sunNoise(vec3 q){vec3 i=floor(q),f=fract(q);f=f*f*(3.0-2.0*f);return mix(mix(mix(sunHash(i),sunHash(i+vec3(1,0,0)),f.x),mix(sunHash(i+vec3(0,1,0)),sunHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(sunHash(i+vec3(0,0,1)),sunHash(i+vec3(1,0,1)),f.x),mix(sunHash(i+vec3(0,1,1)),sunHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
`+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float bands=sunNoise(sunRock*vec3(44.0,3.7,38.0))*.62+sunNoise(sunRock*vec3(91.0,6.0,72.0))*.38;
 float rain=smoothstep(.54,.78,bands)*(.30+.70*smoothstep(.07,.50,sunRock.y));
 float grain=fract(sin(dot(floor(sunRock*2100.0),vec3(12.9898,27.71,41.19)))*43758.5453);
 float patches=sunNoise(sunRock*19.0);
 diffuseColor.rgb*=.89-rain*.23+patches*.22+(grain-.5)*.09;`);};m.customProgramCacheKey=()=> 'sunlight-granite-weathering-v1';return m;
}
function rockHeight(x,z){
 let h=.022;
 for(const [cx,cz,rx,rz,height,p]of [[-.13,-.085,.245,.205,.63,3.3],[.14,.065,.285,.24,.49,3.0],[-.29,.16,.17,.18,.27,2.7]]){
  const xx=(x-cx)/rx,zz=(z-cz)/rz,r=Math.abs(xx)**p+Math.abs(zz)**p;
  if(r<1)h=Math.max(h,.025+height*(1-r)**.33+.006*Math.sin(x*27+z*11)*Math.sin((1-r)*Math.PI));
 }
 return h;
}
function mountain(k,g,p,ground){
 const n=176,rows=112,pos=[],colors=[],idx=[],stone=new THREE.Color('#ffffff'),earth=new THREE.Color('#83956d');earth.r/=p.rock.color.r;earth.g/=p.rock.color.g;earth.b/=p.rock.color.b;
 for(let j=0;j<=rows;j++)for(let i=0;i<=n;i++){const a=i/n*TAU,r=j/rows,x=Math.cos(a)*.54*r,z=Math.sin(a)*.43*r,raw=rockHeight(x,z),foot=stairAt(x,z),base=cut(x,z,raw),fill=foot.y-.013,y=Math.max(ground(x,z)+.001,foot.distance<.060&&fill>base?THREE.MathUtils.lerp(base,fill,1-THREE.MathUtils.smoothstep(foot.distance,.035,.060)):base);pos.push(x,y,z);const c=earth.clone().lerp(stone,THREE.MathUtils.smoothstep(raw,.026,.075));colors.push(c.r,c.g,c.b);}
 for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;idx.push(a,a+1,b,b,a+1,b+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(idx);geo.computeVertexNormals();return k.mesh(g,geo,p.rock);
}
function rail(k,g,p,pts,h=.038){
 for(let i=1;i<pts.length;i++){const a=new THREE.Vector3(...pts[i-1]),b=new THREE.Vector3(...pts[i]),n=Math.max(1,Math.ceil(a.distanceTo(b)/.024));
  for(const dy of [h,h*.38])k.beam(g,[a.x,a.y+dy,a.z],[b.x,b.y+dy,b.z],dy===h?.0018:.0011,p.metal,7);
  for(let j=0;j<n;j++){const q=a.clone().lerp(b,j/n);k.cyl(g,.0014,.0015,h,p.metal,q.x,q.y+h/2,q.z,7);}
 }
 const v=pts.at(-1);k.cyl(g,.0014,.0015,h,p.metal,v[0],v[1]+h/2,v[2],7);
}
function terrace(k,g,p,{x,z,r,top,bottom,crenels=false}){
 const n=120,rows=20,pos=[],idx=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=n;i++){const a=i/n*TAU,rr=j/rows*r,xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr;pos.push(xx,cut(xx,zz,top),zz);}
 for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;idx.push(a,a+1,b,b,a+1,b+1);}
 const start=pos.length/3;for(let i=0;i<=n;i++){const a=i/n*TAU,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;const cap=cut(xx,zz,top);pos.push(xx,Math.min(bottom,cap-.02),zz,xx,cap,zz);}
 for(let i=0;i<n;i++){const a=start+i*2;idx.push(a,a+1,a+3,a,a+3,a+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,p.platform);
 for(let i=0;i<32;i++){const a=i/32*TAU,b=(i+1)/32*TAU,mid=(a+b)/2,xx=x+Math.cos(mid)*r,zz=z+Math.sin(mid)*r,s=stairAt(xx,zz);if(s.distance<.052&&s.y<top+.04)continue;
  if(crenels&&i%2===0){const v=k.box(g,.018,.027,.015,p.platform,xx,top+.0135,zz);v.rotation.y=-mid;}
  rail(k,g,p,[[x+Math.cos(a)*r,top,z+Math.sin(a)*r],[x+Math.cos(b)*r,top,z+Math.sin(b)*r]]);
 }
}
function stairs(k,g,p){
 for(const f of flights){const angle=Math.atan2(f.dx,f.dz),normal=new THREE.Vector3(f.dz,0,-f.dx).normalize(),sidePts=[[],[]];
  for(let i=0;i<f.n;i++){const t=(i+.5)/f.n,y=f.a[1]+(f.b[1]-f.a[1])*(i+1)/f.n,x=f.a[0]+f.dx*t,z=f.a[2]+f.dz*t;const box=k.box(g,.064,.014,f.length/f.n+.0015,p.step,x,y-.007,z);box.rotation.y=angle;
   if(i%3===0&&Math.abs(f.b[1]-f.a[1])>.03){const m=k.box(g,.025,.001,.002,p.lamp,x,y+.001,z);m.rotation.y=angle;}
  }
  for(let i=0;i<=f.n;i++){const t=i/f.n,y=f.a[1]+(f.b[1]-f.a[1])*t;for(const [j,s]of [[0,-1],[1,1]])sidePts[j].push([f.a[0]+f.dx*t+normal.x*.038*s,y,f.a[2]+f.dz*t+normal.z*.038*s]);}
  sidePts.forEach(points=>rail(k,g,p,points));
 }
}
export function sunlight(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.68,.60);p.rock=graniteMaterial(k);p.platform=k.mat('#8b8d80',.98);p.platform.userData.sunlightPlatform=true;p.step=k.mat('#b7b6a8',.98);p.step.userData.sunlightSteps=true;p.metal=k.mat('#b9c4c4',.46,.35);p.lamp=edge(k,'#b8ae8e','#f3d09b',.32);
 const mountainMesh=mountain(k,g,p,ground);
 terrace(k,g,p,{x:.18,z:.11,r:.125,top:.51,bottom:.44,crenels:true});terrace(k,g,p,{x:-.12,z:-.10,r:.113,top:.665,bottom:.60,crenels:true});terrace(k,g,p,{x:-.12,z:-.10,r:.083,top:.71,bottom:.66});stairs(k,g,p);
 k.cyl(g,.0018,.0026,.16,p.metal,-.15,.79,-.12,8);k.ball(g,.011,p.metal,-.15,.842,-.12);k.cyl(g,.0008,.0012,.04,p.metal,-.15,.868,-.12,7);
 const trees=[];for(const [j,c]of [[-.50,-.20],[-.48,.18],[-.23,.36],[.10,-.36],[.42,-.22],[.49,.03]].entries())for(let i=0;i<4;i++){const a=i*2.4+j*.7,x=c[0]+Math.sin(a)*(.030+.012*(i%2)),z=c[1]+Math.cos(a)*.040;if(stairAt(x,z).distance>.10)trees.push([x,z,.10+.065*Math.sin(i*2.1+j)**2]);}
 mountainMesh.updateMatrixWorld(true);const support=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0),0,1.1).intersectObject(mountainMesh)[0]?.point.y??ground(x,z);
 grove(k,g,(x,z)=>support(x,z)+.006,trees);
 return finish(k,g,{lamps:[[.38,.028,.29],[.20,.51,.12],[-.15,.71,-.13]],visitors:[[-.14,.71,-.075],[-.105,.71,-.13],[.16,.51,.145],[.22,.51,.07],[.32,.35,.195]]});
}
