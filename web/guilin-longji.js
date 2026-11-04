import * as THREE from 'three';
import {site,siteHeight,finish} from './guilin-kit.js';
export const TERRACE_STEP=.012;
export function longjiRawHeight(x,z){
 const r=Math.hypot(x/.75,z/.57),edge=1-THREE.MathUtils.smoothstep(r,.76,1),warp=.028*Math.sin(z*18)+.013*Math.sin(z*39),xx=x+warp;
 const hills=[[.18,-.12,.39,.34,.29],[-.33,.18,.25,.29,.30],[-.34,-.28,.31,.24,.21]].map(([cx,cz,h,wx,wz])=>h*Math.exp(-(((xx-cx)/wx)**2+((z-cz)/wz)**2)*1.13));
 const high=Math.max(...hills),blend=high+.028*Math.log(hills.reduce((v,h)=>v+Math.exp((h-high)/.028),0));
 return siteHeight(x,z,.79,.65)+.012+(blend+.010*Math.sin(x*24+z*21)*Math.cos(z*15))*edge;
}
export function longjiSurface(x,z){const h=longjiRawHeight(x,z);return h<.030?h:.030+Math.floor((h-.030)/TERRACE_STEP)*TERRACE_STEP;}
export const LONGJI_ROUTE=[[-.61,.25],[-.48,.29],[-.34,.24],[-.22,.13],[-.12,.08],[.025,.02],[.12,-.08],[.18,-.12]];
function clip(points,h,above){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],inside=above?a[1]>=h:a[1]<=h,next=above?b[1]>=h:b[1]<=h;if(inside)out.push(a);if(inside!==next){const t=(h-a[1])/(b[1]-a[1]);out.push([a[0]+(b[0]-a[0])*t,h,a[2]+(b[2]-a[2])*t]);}}return out;}
function trimBoundary(poly){
 const out=[],inside=q=>Math.hypot(q[0]/.75,q[2]/.57)<=1;
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=inside(a),bb=inside(b);if(aa)out.push(a);if(aa!==bb){let lo=0,hi=1;for(let n=0;n<30;n++){const t=(lo+hi)/2,q=a.map((v,j)=>v+(b[j]-v)*t);if(inside(q)===aa)lo=t;else hi=t;}const t=(lo+hi)/2,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t;out.push([x,longjiRawHeight(x,z),z]);}}return out;
}
function distanceToRoute(x,z){let nearest=Infinity;for(let i=1;i<LONGJI_ROUTE.length;i++){const a=LONGJI_ROUTE[i-1],b=LONGJI_ROUTE[i],dx=b[0]-a[0],dz=b[1]-a[1],t=THREE.MathUtils.clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);nearest=Math.min(nearest,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));}return nearest;}
function riceMaterial(k){
 const m=k.mat('#ccbd72',.99);m.userData.landscape=true;m.userData.terrace=true;m.vertexColors=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vRice;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRice=position;');s.fragmentShader='varying vec3 vRice;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grain=fract(sin(dot(floor(vRice.xz*1200.),vec2(127.1,311.7)))*43758.5453);float planting=.5+.5*sin(vRice.x*730.+sin(vRice.z*49.)*2.);diffuseColor.rgb*=.88+grain*.14+planting*.07;`);};m.customProgramCacheKey=()=> 'longji-rice-v1';return m;
}
export function longji(k){
 const g=new THREE.Group();site(k,g,.79,.65);const ground=k.mat('#657a4a',1);ground.userData.landscape=true;const riser=k.mat('#6d7750',1);riser.side=THREE.DoubleSide;riser.userData.landscape=true;riser.userData.terraceRiser=true;const rice=riceMaterial(k);
 const top=[],colors=[],walls=[],base=[],Nx=100,Nz=78,grid=[];
 for(let j=0;j<=Nz;j++)for(let i=0;i<=Nx;i++){const x=-.75+i/Nx*1.5,z=-.57+j/Nz*1.14;grid.push([x,longjiRawHeight(x,z),z]);}
 const emit=(out,poly,y)=>{for(let i=1;i<poly.length-1;i++){const a=poly[0],b=poly[i],c=poly[i+1];if(Math.abs((b[0]-a[0])*(c[2]-a[2])-(c[0]-a[0])*(b[2]-a[2]))<1e-12)continue;for(const q of [a,b,c])out.push(q[0],typeof y==='function'?y(q):y,q[2]);}};
 for(let j=0;j<Nz;j++)for(let i=0;i<Nx;i++){
  const a=j*(Nx+1)+i,b=a+Nx+1;
  for(const ids of [[a,b,a+1],[a+1,b,b+1]]){
   const tri=trimBoundary(ids.map(n=>grid[n]));if(tri.length<3)continue;
   emit(base,tri,q=>Math.min(.030,q[1]));const lo=Math.max(0,Math.floor((Math.min(...tri.map(q=>q[1]))-.030)/TERRACE_STEP)),hi=Math.floor((Math.max(...tri.map(q=>q[1]))-.030)/TERRACE_STEP);
   for(let level=lo;level<=hi;level++){
    const low=.030+level*TERRACE_STEP,high=low+TERRACE_STEP,poly=clip(clip(tri,low,true),high,false);if(poly.length<3)continue;
    const start=top.length;emit(top,poly,low);
    for(let index=start;index<top.length;index+=3){const x=top[index],z=top[index+2],variation=.5+.5*Math.sin(x*31+z*13+level*.91)*Math.cos(z*24-level*.27),c=new THREE.Color('#ffffff').lerp(new THREE.Color('#b9ce9a'),variation*.29);colors.push(c.r,c.g,c.b);}
    for(let n=0;n<poly.length;n++){const aa=poly[n],bb=poly[(n+1)%poly.length];if(Math.abs(aa[1]-high)>1e-7||Math.abs(bb[1]-high)>1e-7)continue;walls.push(aa[0],low,aa[2],bb[0],low,bb[2],aa[0],high,aa[2],bb[0],low,bb[2],bb[0],high,bb[2],aa[0],high,aa[2]);}
   }
  }
 }
 for(const [values,mat]of [[base,ground],[walls,riser],[top,rice]]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(values,3));if(mat===rice)geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();k.mesh(g,geo,mat);}
 // Grain heads vary in small patches rather than covering the hill with a uniform coloured plate.
 const ears=['#d0ba67','#c2af60','#d8c885'].map(c=>{const m=k.mat(c,1);m.userData.landscape=true;return m;});
 for(let i=0;i<1800;i++){const a=i*2.399963,r=Math.sqrt((i+.5)/1800),x=Math.cos(a)*.69*r,z=Math.sin(a)*.51*r,y=longjiSurface(x,z);if(y<.085||Math.abs(longjiRawHeight(x,z)-y)<.003||distanceToRoute(x,z)<.027||Math.hypot((x-.18)/.070,(z+.12)/.053)<1)continue;const o=k.mesh(g,new THREE.ConeGeometry(.0017,.0065,3),ears[i%3],x,y+.0035,z);o.rotation.z=.30*Math.sin(i*2.1);}
 // A narrow contour path and its viewing terrace are supported above every terrace riser.
 const path=k.mat('#b9b7a0',.99);path.userData.landscape=true;path.userData.longjiPath=true;const rail=k.mat('#716c51',1);rail.userData.landscape=true;const points=[];
 for(let i=1;i<LONGJI_ROUTE.length;i++){const a=new THREE.Vector2(...LONGJI_ROUTE[i-1]),b=new THREE.Vector2(...LONGJI_ROUTE[i]),N=Math.ceil(a.distanceTo(b)/.008);for(let j=0;j<N;j++){const q=a.clone().lerp(b,j/N);points.push(q);}}points.push(new THREE.Vector2(...LONGJI_ROUTE.at(-1)));
 const rails=[[],[]];for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],d=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5),angle=Math.atan2(d.x,d.y),nx=Math.cos(angle),nz=-Math.sin(angle),y=Math.max(...[a,b,mid].flatMap(q=>[-1,0,1].map(s=>longjiSurface(q.x+s*nx*.019,q.y+s*nz*.019))))+.007;
  const o=k.box(g,.040,.010,d.length()+.004,path,mid.x,y-.005,mid.y);o.rotation.y=angle;
  for(let side=0;side<2;side++){const s=side?1:-1,x=mid.x+s*.019*nx,z=mid.y+s*.019*nz;rails[side].push([x,y+.026,z]);if(i%5===0){const foot=longjiSurface(x,z);k.box(g,.0025,y+.029-foot,.0025,rail,x,(y+.029+foot)/2,z);}}
 }
 for(const v of rails)k.line(g,v,.0013,rail);
 const dx=.18,dz=-.12,dy=Math.max(...[-.045,0,.045].flatMap(x=>[-.032,0,.032].map(z=>longjiSurface(dx+x,dz+z))))+.008;
 k.box(g,.11,.012,.082,path,dx,dy-.006,dz);for(const x of [-.048,.048])for(const z of [-.034,.034]){const bottom=longjiSurface(dx+x,dz+z);k.box(g,.004,dy-bottom,.004,rail,dx+x,(dy+bottom)/2,dz+z);}for(const z of [-.04,.04]){k.beam(g,[dx-.055,dy+.028,dz+z],[dx+.055,dy+.028,dz+z],.0017,rail);for(const x of [-.052,0,.052])k.box(g,.0025,.029,.0025,rail,dx+x,dy+.0145,dz+z);}
 return finish(k,g,{lamps:[[dx+.043,dy,dz+.026]],visitors:[[dx-.018,dy+.001,dz+.007]]});
}
