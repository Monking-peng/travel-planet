import * as THREE from 'three';
import {palette,site,skin,sign,finish,sea,grove,TAU,edge} from './xiamen-kit.js';

function stone(k){
 const m=k.mat('#aaa99e',.95,.02);m.userData.nanxunStone=true;m.userData.night={color:new THREE.Color('#efd2a5'),intensity:.13};
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 nxPos;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nnxPos=position;');s.fragmentShader='varying vec3 nxPos;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vec2((nxPos.x+nxPos.z)*47.0,nxPos.y*87.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),aa=max(fwidth(q),vec2(.008));float seam=max(1.0-smoothstep(.025-aa.x*.4,.025+aa.x*.4,min(f.x,1.0-f.x)),1.0-smoothstep(.035-aa.y*.4,.035+aa.y*.4,min(f.y,1.0-f.y)));float rnd=fract(sin(dot(floor(q),vec2(27.3,19.1)))*521.7);diffuseColor.rgb*=.96+rnd*.07-seam*.11;`);};m.customProgramCacheKey=()=> 'nanxun-granite';return m;
}
function roofMaterial(k){
 const m=k.mat('#587463',.86,.03),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 nxUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nnxUv=uv;');s.fragmentShader='varying vec2 nxUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(nxUv.x),.012);float rib=1.0-smoothstep(.11,.11+aa,abs(fract(nxUv.x)-.5));float visible=1.0-smoothstep(.3,1.0,aa);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.37,.19,.09),(.13+.20*(1.0-rib))*visible);diffuseColor.rgb*=mix(1.0,.90+.28*rib,visible);`);};m.customProgramCacheKey=()=> 'nanxun-jiageng-tiles';return m;
}
function group(g,x=0,y=0,z=0,angle=0){const q=new THREE.Group();q.position.set(x,y,z);q.rotation.y=angle;g.add(q);return q;}
function opening(k,g,p,x,y,w,h,z){
 k.box(g,w,h,.002,p.glass,x,y,z-.007);
 for(const dx of [-1,1])k.box(g,.003,h+.006,.015,p.pale,x+dx*(w/2+.001),y,z-.002);
 for(const dy of [-1,1])k.box(g,w+.008,.003,.017,p.pale,x,y+dy*(h/2+.001),z-.001);
 k.box(g,.0016,h,.002,p.wood,x,y,z-.005);k.box(g,w,.0016,.002,p.wood,x,y+.003,z-.005);
}
// Cut-outs belong to the masonry shell, so glazing is recessed and does not sit on a solid block.
function wall(k,g,p,w,h,windows,{circle=null}={}){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
 for(const a of windows){const t=new THREE.Path();t.moveTo(a.x-a.w/2,a.y-a.h/2);t.lineTo(a.x-a.w/2,a.y+a.h/2);t.lineTo(a.x+a.w/2,a.y+a.h/2);t.lineTo(a.x+a.w/2,a.y-a.h/2);t.closePath();s.holes.push(t);}
 if(circle){const t=new THREE.Path();t.absarc(circle.x,circle.y,circle.r,0,TAU,true);s.holes.push(t);}
 k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false,curveSegments:40}),p.wall,0,0,-.014);
 for(const a of windows)opening(k,g,p,a.x,a.y,a.w,a.h,0);
 if(circle){k.mesh(g,new THREE.TorusGeometry(circle.r+.002,.0025,6,56),p.pale,circle.x,circle.y,.001);}
}
function grid(cols,rows,w,h,y0=0){const a=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)a.push({x:((i+.5)/cols-.5)*w*.88,y:y0+(j+.5)*h/rows,w:Math.min(.022,w/cols*.52),h:h/rows*.52});return a;}
function shell(k,g,p,w,d,y,h,rows,cols=4,circle=false){
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2,ww=i%2?d:w,f=group(g,Math.sin(a)*(i%2?w:d)/2,y,Math.cos(a)*(i%2?w:d)/2,a);
  let windows=grid(i%2?Math.max(2,cols-1):cols,rows,ww,h);
  if(circle&&i===0)windows=[-.043,.043].flatMap(x=>[.025,h-.025].map(y=>({x,y,w:.014,h:.023})));
  wall(k,f,p,ww,h,windows,{circle:circle&&i===0?{x:0,y:h*.53,r:.023}:null});
 }
 k.box(g,w,.007,d,p.pale,0,y+h-.0035,0);
}
function balustrade(k,g,p,w,d,y){
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2,ww=i%2?d:w,zz=(i%2?w:d)/2,side=group(g,Math.sin(a)*zz,y,Math.cos(a)*zz,a);
  k.box(side,ww+.005,.004,.009,p.pale,0,.028,0);k.box(side,ww,.004,.010,p.pale,0,.005,0);
  const n=Math.max(2,Math.round(ww/.017));for(let j=0;j<=n;j++){const x=(j/n-.5)*ww;k.box(side,.003,.023,.005,p.pale,x,.016,0);if(j<n){const loop=k.mesh(side,new THREE.TorusGeometry(.005,.0014,5,14),p.pale,x+ww/n/2,.016,0);loop.scale.y=.86;}}
 }
 for(const x of [-w/2,w/2])for(const z of [-d/2,d/2]){k.box(g,.008,.036,.008,p.pale,x,y+.018,z);k.cyl(g,.003,.007,.014,p.pale,x,y+.043,z,4);k.ball(g,.003,p.pale,x,y+.052,z);}
}
function roof(k,g,p,w,d,h,y,{octagon=false}={}){
 if(octagon){
  const r=w/2,at=(u,v)=>{const a=u*TAU,seg=TAU/8,b=((a+seg/2)%seg)-seg/2,t=.006+v*.994,rr=r*Math.cos(seg/2)/Math.cos(b)*t;return [Math.sin(a)*rr,y+h*(1-t)**1.45+.012*t**6*(Math.abs(b)/(seg/2))**5,Math.cos(a)*rr];};
  const mesh=skin(k,g,at,16,96,p.tile),uv=[];for(let j=0;j<=16;j++)for(let i=0;i<=96;i++)uv.push(i/96*80,j/16*12);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  k.line(g,Array.from({length:96},(_,i)=>at(i/96,1)),.0025,p.eave,true);
  for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;k.line(g,[[Math.sin(a)*r*.13,y+h*.9,Math.cos(a)*r*.13],[Math.sin(a)*r*.55,y+h*.35,Math.cos(a)*r*.55],[Math.sin(a)*r,y+.013,Math.cos(a)*r],[Math.sin(a)*r*1.05,y+.029,Math.cos(a)*r*1.05]],.0021,p.pale);}
 }else{
  const at=(side,u,v)=>{const a=u*2-1,t=.002+.998*v;return [a*w*(.28+.22*t),y+h*(1-t)**1.5+.012*Math.abs(a)**5*(1-t)**2+.016*Math.abs(a)**7*t**5,side*d/2*t];};
  for(const side of [-1,1]){
   const mesh=skin(k,g,(u,v)=>at(side,u,v),16,40,p.tile),uv=[];for(let j=0;j<=16;j++)for(let i=0;i<=40;i++)uv.push(i/40*w*180,j/16*12);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));k.line(g,Array.from({length:41},(_,i)=>at(side,i/40,1)),.0025,p.eave);
   for(const u of [0,1]){const points=Array.from({length:17},(_,j)=>at(side,u,j/16));k.line(g,points,.003,p.pale);k.line(g,points.map(v=>[v[0],v[1]-.003,v[2]]),.0016,p.red);}
  }
  // Curved end slopes close both hips; the roof is a volume rather than two floating planes.
  for(const end of [-1,1]){const mesh=skin(k,g,(u,v)=>{const t=.002+.998*v,a=u*2-1;return [end*w*(.28+.22*t),y+h*(1-t)**1.5+.012*(1-t)**2+.016*Math.abs(a)**7*t**5,a*d/2*t];},16,28,p.tile),uv=[];for(let j=0;j<=16;j++)for(let i=0;i<=28;i++)uv.push(i/28*d*160,j/16*12);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}
  k.line(g,[[-w*.35,y+h+.038,0],[-w*.30,y+h+.014,0],[0,y+h+.008,0],[w*.30,y+h+.014,0],[w*.35,y+h+.038,0]],.003,p.pale);
 }
}
function pavilion(k,g,p,{w=.15,y=0,h=.075,octagon=false,finial=true}={}){
 const n=octagon?8:4,r=w*(octagon?.36:.40),posts=[];
 for(let i=0;i<n;i++){const a=(i+.5)/n*TAU,x=Math.sin(a)*r,z=Math.cos(a)*r;posts.push([x,z]);k.box(g,.006,h,.006,p.pale,x,y+h/2,z);k.box(g,.014,.006,.014,p.pale,x,y+h-.006,z);k.box(g,.010,.004,.010,p.red,x,y+h-.012,z);}
 for(let i=0;i<n;i++){const a=posts[i],b=posts[(i+1)%n];k.beam(g,[a[0],y+h,a[1]],[b[0],y+h,b[1]],.003,p.red);}
 const cap=group(g,0,0,0);roof(k,cap,p,w,w,.048,y+h,{octagon});
 if(finial){k.cyl(g,.002,.006,.038,p.pale,0,y+h+.075,0,8);for(let j=0;j<3;j++)k.cyl(g,.006-j*.001,.007-j*.001,.004,p.pale,0,y+h+.062+j*.011,0,8);k.cyl(g,0,.003,.024,p.gold,0,y+h+.106,0,8);}
}
function wing(k,g,p,side){
 const length=.43,depth=.17,angle=side*Math.PI/6,q=group(g,side*.305,0,-.30,angle),bottom=side>0?.115:.055,height=side>0?.268:.328;
 if(bottom>.055)k.box(q,length+.014,bottom-.055,depth+.014,p.wall,0,(bottom+.055)/2,0);
 shell(k,q,p,length,depth,bottom,height,side>0?4:5,7);
 for(const z of [-depth/2,depth/2]){
  for(let i=0;i<8;i++){const x=(i/7-.5)*length;k.box(q,.011,height,.013,p.pale,x,bottom+height/2,z);for(let j=0;j<4;j++)k.box(q,.009,.009,.015,p.red,x,bottom+(j+.5)*height/4,z);}
  for(let j=0;j<=4;j++)k.box(q,length+.012,.005,.013,p.pale,0,bottom+j*height/4,z);
 }
 roof(k,q,p,length+.060,depth+.065,.062,bottom+height+.006);
 const end=group(q,side*(length/2+.015),0,0);
 const cap=.415;
 shell(k,end,p,.16,.19,bottom,cap-bottom,side>0?4:5,3);balustrade(k,end,p,.17,.20,cap);
 if(bottom>.055)k.box(end,.16,bottom-.055,.19,p.wall,0,(bottom+.055)/2,0);
 pavilion(k,end,p,{w:.18,y:cap+.034,h:.056,octagon:true,finial:false});
 k.cyl(end,.052,.052,.024,p.wall,0,cap+.151,0,8);pavilion(k,end,p,{w:.128,y:cap+.165,h:.035,octagon:true,finial:true});
 // The carved brick/stone end tower is not a second generic temple.
 for(const x of [-.076,.076])k.box(end,.009,cap-bottom,.012,p.red,x,(bottom+cap)/2,.101);
}
function pondPavilion(k,g,p,x,z,large){
 const q=group(g,x,0,z),w=large?.17:.13,d=large?.14:.11;
 k.box(q,w+.015,.040,d+.025,p.wall,0,.035,0);k.box(q,w+.025,.009,d+.035,p.pale,0,.059,0);
 for(const xx of [-w*.34,w*.34])for(const zz of [-d*.32,d*.32]){k.box(q,.009,.084,.009,p.wall,xx,.105,zz);k.box(q,.016,.006,.016,p.pale,xx,.146,zz);}
 roof(k,q,p,w+.055,d+.055,.054,.151);k.box(q,w,.006,.008,p.red,0,.147,d*.32);
 for(let i=0;i<4;i++)k.box(q,w*.48,.007*(4-i),.016,p.pale,0,.026+.0035*(4-i),d*.58+i*.013);
 // The photo shows detached water pavilions; no invented concrete catwalk across the pond.
}
export function jimei(k){
 const g=new THREE.Group(),p=palette(k);p.wall=stone(k);p.pale=edge(k,'#c5c5b4','#ecca8f',.17);p.red=k.mat('#904d39',.9,.02);p.wood=k.mat('#566c62',.86,.04);p.tile=roofMaterial(k);p.tile.userData.night={color:new THREE.Color('#deb172'),intensity:.045};p.eave=edge(k,'#c4b18b','#efc284',.95);p.glass=edge(k,'#344744','#e4c7a0',.32);
 const terrain=site(k,g,.82,.70);k.box(g,1.37,.035,.66,p.wall,0,.031,-.20);k.box(g,1.38,.006,.67,p.pale,0,.052,-.20);sea(k,g,p,.66,.24,0,.34);
 const tower=group(g,0,.055,-.12);
 for(const [y,w,d,h,rows,cols,circle]of [[0,.32,.28,.43,6,5,false],[.43,.275,.24,.16,3,4,false],[.59,.213,.185,.145,2,3,false],[.735,.154,.148,.145,2,2,true],[.880,.126,.126,.055,1,3,false]]){
  shell(k,tower,p,w,d,y,h,rows,cols,circle);k.box(tower,w+.014,.010,d+.014,p.pale,0,y+h+.002,0);balustrade(k,tower,p,w+.010,d+.010,y+h+.006);
 }
 // Tall front bays and carved corner piers continue into the lower terraces.
 for(const x of [-.151,-.090,-.030,.030,.090,.151]){
  k.box(tower,.011,.435,.026,p.pale,x,.219,.146);k.box(tower,.007,.429,.028,p.wall,x,.219,.149);
  k.box(tower,.020,.018,.032,p.pale,x,.444,.146);k.mesh(tower,new THREE.TorusGeometry(.005,.0014,5,16),p.pale,x,.444,.164);
 }
 for(const side of [-1,1]){
  const b=group(tower,side*.205,0,-.020);
  for(let j=0;j<4;j++){
   const y=.055+j*.09;k.box(b,.10,.008,.17,p.pale,0,y,0);k.box(b,.10,.006,.012,p.red,0,y+.067,.078);
   for(const x of [-.042,.042])k.box(b,.008,.066,.008,p.pale,x,y+.035,.072);
   balustrade(k,b,p,.096,.15,y+.005);roof(k,b,p,.135,.19,.035,y+.077);
  }
 }
 pavilion(k,tower,p,{w:.176,y:.957,h:.076});
 // Deep central entrance and stone steps ground the tower at the pool-side walk.
 const porch=group(tower,0,0,.192);k.box(porch,.155,.006,.095,p.pale,0,.095,0);
 for(const x of [-.063,.063])k.box(porch,.009,.091,.009,p.pale,x,.048,.034);
 for(let i=0;i<5;i++)k.box(g,.18,.009*(5-i),.018,p.pale,0,.0225+.0045*(5-i),.136+i*.018);
 wing(k,g,p,-1);wing(k,g,p,1);
 k.box(g,1.34,.012,.062,p.pale,0,.057,.116);
 // Low granite embankment frames the water without crossing its center.
 for(const side of [-1,1]){const x=side*.665;k.box(g,.019,.042,.35,p.wall,x,.035,.30);for(let j=0;j<11;j++){const z=.15+j*.029;k.box(g,.011,.037,.011,p.pale,x,.074,z);if(j<10)k.box(g,.008,.006,.03,p.pale,x,.089,z+.0145);}}
 pondPavilion(k,g,p,-.30,.36,true);pondPavilion(k,g,p,.35,.34,false);
 for(const [x,z,h]of [[-.50,.005,.14],[.50,.008,.14],[-.55,-.50,.18],[.57,-.49,.16]])grove(k,g,(xx,zz)=>Math.max(.04,terrain(xx,zz)+.014),[[x,z,h]]);
 sign(k,g,'南薰楼',.055,.015,0,.166,.181,{background:'#696b5c',color:'#eee7cd'});
 return finish(k,g,{lamps:[[-.56,.064,.12],[.56,.064,.12],[-.12,.064,.12],[.12,.064,.12]],visitors:[[-.38,.064,.12],[.32,.064,.12]]});
}
