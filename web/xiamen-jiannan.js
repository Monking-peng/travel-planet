import * as THREE from 'three';
import {palette,site,skin,sign,finish,railing,palm,edge} from './xiamen-kit.js';

function tiled(k,color,key){
 const m=k.mat(color,.81,.06),tex=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);tex.needsUpdate=true;m.map=tex;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 jnUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njnUv=uv;');s.fragmentShader='varying vec2 jnUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(jnUv.x),.008),rib=1.0-smoothstep(.06,.06+aa,abs(fract(jnUv.x)-.5));float visible=1.0-smoothstep(.4,.9,aa);float seam=smoothstep(.035,.035+max(fwidth(jnUv.y),.008),fract(jnUv.y));diffuseColor.rgb*=mix(1.0,.78+.29*rib,visible)*mix(.88,1.0,seam);`);};m.customProgramCacheKey=()=>key;return m;
}
function masonry(k){
 const m=k.mat('#c4b89b',.95,.01);m.userData.jiannanStone=true;m.userData.night={color:new THREE.Color('#e2c39b'),intensity:.10};
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 jnPos;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njnPos=position;');s.fragmentShader='varying vec3 jnPos;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vec2((jnPos.x+jnPos.z)*32.0,jnPos.y*55.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),aa=max(fwidth(q),vec2(.005));float seam=max(1.0-smoothstep(.035-aa.x*.5,.035+aa.x*.5,min(f.x,1.0-f.x)),1.0-smoothstep(.04-aa.y*.5,.04+aa.y*.5,min(f.y,1.0-f.y)));float rnd=fract(sin(dot(floor(q),vec2(23.7,17.3)))*721.3);diffuseColor.rgb*=.92+rnd*.12-seam*.13;`);};m.customProgramCacheKey=()=> 'jiannan-granite';return m;
}
function trim(k,g,p,w,y,z){
 k.box(g,w,.009,.018,p.pale,0,y,z);k.box(g,w+.012,.005,.024,p.pale,0,y+.006,z);
 for(let i=0;i<Math.floor(w/.016);i++)k.box(g,.006,.006,.016,p.pale,(i+.5)*w/Math.floor(w/.016)-w/2,y-.006,z);
}
// Each window is set behind a cut-out in the actual stone wall.
function facade(k,g,p,w,y,h,z,windows){
 const shape=new THREE.Shape();shape.moveTo(-w/2,y);shape.lineTo(w/2,y);shape.lineTo(w/2,y+h);shape.lineTo(-w/2,y+h);shape.closePath();
 for(const a of windows){const hole=new THREE.Path();hole.moveTo(a.x-a.w/2,a.y-a.h/2);hole.lineTo(a.x-a.w/2,a.y+a.h/2);hole.lineTo(a.x+a.w/2,a.y+a.h/2);hole.lineTo(a.x+a.w/2,a.y-a.h/2);hole.closePath();shape.holes.push(hole);}
 k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.022,bevelEnabled:false,curveSegments:6}),p.wall,0,0,z-.022);
 for(const a of windows){
  k.box(g,a.w,a.h,.003,p.glass,a.x,a.y,z-.014);
  for(const sx of [-1,1]){k.box(g,.004,a.h+.010,.026,p.pale,a.x+sx*(a.w/2+.002),a.y,z-.006);k.box(g,.002,a.h,.008,p.red,a.x+sx*a.w*.46,a.y,z-.010);}
  for(const sy of [-1,1])k.box(g,a.w+.015,.004,.029,p.pale,a.x,a.y+sy*(a.h/2+.002),z-.004);
  k.box(g,.002,a.h,.006,p.red,a.x,a.y,z-.010);
  for(let j=1;j<4;j++)k.box(g,a.w,.0016,.006,p.red,a.x,a.y-a.h/2+j*a.h/4,z-.010);
  if(a.shutters)for(const sx of [-1,1]){
   const shutter=new THREE.Group();shutter.position.set(a.x+sx*a.w*.52,a.y,z+.005);shutter.rotation.y=sx*.34;g.add(shutter);
   k.box(shutter,a.w*.24,a.h*.78,.003,p.red,sx*a.w*.12,-a.h*.11,0);
   for(let j=0;j<9;j++)k.box(shutter,a.w*.22,.0012,.004,p.wood,sx*a.w*.12,-a.h*.44+j*a.h*.078,.001);
  }
 }
}
function lantern(k,g,p,x,y,z){
 k.cyl(g,.002,.002,.012,p.gold,x,y-.006,z,8);k.cyl(g,.006,.006,.013,p.lantern,x,y-.018,z,8);k.cyl(g,.008,.008,.003,p.red,x,y-.011,z,8);k.cyl(g,.007,.007,.003,p.red,x,y-.026,z,8);for(const dx of [-.004,.004])k.box(g,.0015,.015,.002,p.red,x+dx,y-.018,z+.005);
}
function roof(k,g,p,w,d,h,y,x=0,z=0){
 const r=new THREE.Group();r.position.set(x,0,z);g.add(r);
 const at=(side,u,t)=>{const a=u*2-1;return [a*w*(.37+.13*t),y+h*(1-t)**1.5+.020*Math.abs(a)**5*(1-t)**2+.016*Math.abs(a)**7*t**5,side*d/2*t];};
 for(const side of [-1,1]){
  const o=skin(k,r,(u,v)=>at(side,u,v),20,48,p.tile),uv=[];for(let j=0;j<=20;j++)for(let i=0;i<=48;i++)uv.push(i/48*w*155,j/20*16);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  k.line(r,Array.from({length:49},(_,i)=>at(side,i/48,1)),.003,p.eave);
  for(const u of [0,1]){const line=Array.from({length:25},(_,i)=>at(side,u,i/24));k.line(r,line,.004,p.pale);k.line(r,line.map(a=>[a[0],a[1]+.003,a[2]]),.002,p.blue);}
  for(let i=0;i<Math.round(w/.035);i++){const a=at(side,(i+.5)/Math.round(w/.035),1);k.beam(r,[a[0],a[1]-.013,a[2]*.68],[a[0],a[1]-.004,a[2]*.97],.0025,p.pale,5);}
  for(const u of [.025,.975]){const a=at(side,u,1);lantern(k,r,p,a[0],a[1]-.003,a[2]);}
 }
 for(const sx of [-1,1]){
  skin(k,r,(u,v)=>[sx*w*.37,y+(h+.020)*v,(u*2-1)*d*.40*(1-v)],12,24,p.brick);
  const points=Array.from({length:25},(_,i)=>{const a=i/12-1;return[a*w*.37,y+h+.020*Math.abs(a)**5,0];});
  if(sx<0)k.line(r,points,.004,p.pale);const q=points[sx<0?0:24];k.line(r,[q,[q[0]+sx*.010,q[1]+.012,0],[q[0]+sx*.017,q[1]+.035,0]],.003,p.blue);
  const ornament=k.mesh(r,new THREE.CircleGeometry(.010,20),p.gold,sx*(w*.37+.001),y+h*.47,0);ornament.rotation.y=sx*Math.PI/2;
 }
 return r;
}
function column(k,g,p,x,base,h,z){
 k.box(g,.033,.025,.033,p.wall,x,base+.0125,z);k.box(g,.039,.004,.039,p.pale,x,base+.027,z);k.cyl(g,.0105,.014,h-.049,p.pale,x,base+.029+(h-.049)/2,z,20);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;k.beam(g,[x+Math.sin(a)*.013,base+.038,z+Math.cos(a)*.013],[x+Math.sin(a)*.0105,base+h-.028,z+Math.cos(a)*.0105],.0008,p.wall,4);}
 k.cyl(g,.015,.012,.008,p.pale,x,base+h-.019,z,20);k.box(g,.032,.010,.026,p.pale,x,base+h-.009,z);
 for(const sx of [-1,1])k.mesh(g,new THREE.TorusGeometry(.005,.0014,5,16),p.wall,x+sx*.010,base+h-.010,z+.014);
}
function rearHall(k,g,p,base){
 const rear=new THREE.Group();rear.position.set(0,0,-.36);g.add(rear);const w=.70,d=.55;
 k.box(rear,w-.048,.245,d-.040,p.wall,0,base+.1225,0);
 for(const sx of [-1,1]){const side=new THREE.Group();side.position.x=sx*w/2;side.rotation.y=sx*Math.PI/2;rear.add(side);facade(k,side,p,d,base,.245,0,Array.from({length:7},(_,i)=>({x:(i-3)*.069,y:base+.15,w:.038,h:.11})));}
 const back=new THREE.Group();back.position.z=-d/2;back.rotation.y=Math.PI;rear.add(back);facade(k,back,p,w,base,.245,0,[-.22,0,.22].map(x=>({x,y:base+.12,w:.055,h:.11})));
 const clay={...p,tile:p.clay};
 for(const [ww,yy,hh] of [[.76,base+.235,.105],[.50,base+.365,.078],[.26,base+.465,.045]]){
  for(const sx of [-1,1]){const m=skin(k,rear,(u,v)=>[sx*(ww/2)*(1-v),yy+hh*v,(u*2-1)*(d+.04)/2],14,48,clay.tile),uv=[];for(let j=0;j<=14;j++)for(let i=0;i<=48;i++)uv.push(i/48*65,j/14*16);m.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));k.box(rear,.006,.006,d+.04,p.clayEdge,sx*ww/2,yy-.001,0);}
  for(const end of [-1,1])skin(k,rear,(u,v)=>[(u*2-1)*ww/2*(1-v),yy+hh*v,end*(d+.04)/2],10,32,p.brick);
  if(ww>.27){const cw=ww-.26;k.box(rear,cw,.029,d+.02,p.pale,0,yy+hh+.012,0);for(const sx of [-1,1])for(let i=0;i<13;i++){k.box(rear,.003,.021,.031,p.glass,sx*(cw/2+.001),yy+hh+.012,(i-6)*.042);k.box(rear,.004,.025,.002,p.red,sx*(cw/2+.003),yy+hh+.012,(i-6)*.042+.016);}}
 }
}
export function jiannan(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.83,.79);p.wall=masonry(k);p.glass=edge(k,'#374a4d','#e8cd9c',.25);p.tile=tiled(k,'#42695b','jiannan-green-tile');p.clay=tiled(k,'#a85a39','jiannan-clay-tile');p.clayEdge=edge(k,'#7e4935','#dcaf7d',.14);p.eave=edge(k,'#793d31','#edbf86',.6);p.blue=k.mat('#3c686c',.8);p.lantern=edge(k,'#d6b470','#ffdfac',.8);
 const base=.145;k.box(g,1.28,.114,1.02,p.wall,0,.086,-.155);k.box(g,1.30,.006,1.042,p.pale,0,base-.003,-.165);
 // Wide stepped seating and a finer central stair share one continuous top landing.
 for(let i=0;i<12;i++){const top=.027+(i+1)*(.118/12),z=.62-(i+.5)*.022;for(const sx of [-1,1]){k.box(g,.485,top-.021,.023,p.wall,sx*.3925,(top+.021)/2,z);k.box(g,.487,.002,.025,p.pale,sx*.3925,top-.001,z);}}
 for(let i=0;i<24;i++){const top=.027+(i+1)*(.118/24),z=.62-(i+.5)*.011;k.box(g,.30,top-.021,.012,p.wall,0,(top+.021)/2,z);}
 rearHall(k,g,p,base);
 // The two-storey porch is left open; the masonry is recessed behind four columns.
 k.box(g,.65,.25,.16,p.wall,0,base+.125,-.015);k.box(g,.66,.012,.31,p.pale,0,base+.255,.065);
 for(const x of [-.24,-.08,.08,.24])column(k,g,p,x,base,.252,.20);
 for(const x of [-.21,-.105,0,.105,.21]){
  const circular=Math.abs(x)!==.105,y=base+.19,rad=circular?.019:.018;
  const ring=k.mesh(g,new THREE.TorusGeometry(rad,.003,5,circular?32:8),p.pale,x,y,.069);ring.rotation.z=circular?0:Math.PI/8;
  k.mesh(g,new THREE.CircleGeometry(rad-.003,circular?32:8),p.glass,x,y,.068);
  for(let j=0;j<(circular?5:4);j++){const a=j/(circular?5:4)*Math.PI*2;k.beam(g,[x,y,.071],[x+Math.sin(a)*rad*.83,y+Math.cos(a)*rad*.83,.071],.001,p.wood,4);}
  k.box(g,.042,.076,.004,p.red,x,base+.038,.067);k.box(g,.034,.067,.003,p.glass,x,base+.037,.070);
  k.mesh(g,new THREE.CircleGeometry(.021,24,0,Math.PI),p.red,x,base+.076,.067);
 }
 trim(k,g,p,.68,base+.262,.21);
 // Second and third storeys step back into the highest central glazed gallery.
 facade(k,g,p,.64,base+.27,.12,.20,Array.from({length:7},(_,i)=>({x:(i-3)*.084,y:base+.33,w:.036,h:.077,shutters:true})));
 k.box(g,.64,.12,.22,p.wall,0,base+.33,-.02);
 const top=new THREE.Group();top.position.z=-.012;g.add(top);k.box(top,.28,.125,.13,p.wall,0,base+.445,-.045);
 facade(k,top,p,.28,base+.39,.125,.055,[-.087,0,.087].map(x=>({x,y:base+.452,w:.076,h:.105})));
 for(const x of [-.135,-.045,.045,.135])k.cyl(top,.0035,.005,.12,p.pale,x,base+.45,.155,10);
 railing(k,top,p,[[-.14,base+.394,.162],[.14,base+.394,.162]],.024);sign(k,g,'建南大会堂',.125,.023,0,base+.409,.158,{background:'#c6bea6',color:'#5f6053'});
 k.box(top,.29,.009,.22,p.pale,0,base+.514,.05);roof(k,g,p,.35,.27,.080,base+.52,0,-.008);
 for(const sx of [-1,1]){
  const inner=new THREE.Group();inner.position.x=sx*.25;g.add(inner);roof(k,inner,p,.23,.29,.071,base+.39,0,.045);
  const wing=new THREE.Group();wing.position.x=sx*.445;g.add(wing);k.box(wing,.165,.305,.18,p.wall,0,base+.1525,-.01);
  facade(k,wing,p,.21,base,.305,.135,Array.from({length:3},(_,j)=>[-.050,.050].map(x=>({x,y:base+.051+j*.101,w:.036,h:.071,shutters:true}))).flat());
  const side=new THREE.Group();side.position.set(sx*.106,0,-.01);side.rotation.y=sx*Math.PI/2;wing.add(side);facade(k,side,p,.21,base,.305,0,Array.from({length:3},(_,j)=>[-.050,.050].map(x=>({x,y:base+.051+j*.101,w:.036,h:.071}))).flat());roof(k,wing,p,.265,.29,.074,base+.305,0,-.01);
  const terrace=new THREE.Group();terrace.position.x=sx*.606;g.add(terrace);k.box(terrace,.112,.165,.24,p.wall,0,base+.0825,-.02);facade(k,terrace,p,.112,base,.165,.115,[-.029,.029].map(x=>({x,y:base+.073,w:.032,h:.105,shutters:true})));k.box(terrace,.12,.008,.25,p.pale,0,base+.17,-.02);railing(k,terrace,p,[[-.058,base+.174,.106],[.058,base+.174,.106]],.031);
 }
 for(const x of [-.55,-.40,.40,.55])palm(k,g,p,x,base,.27,.145);
 return finish(k,g,{lamps:[[-.56,.027,.62],[.56,.027,.62],[-.32,base,.28],[.32,base,.28]],visitors:[[.19,.027,.65],[-.16,.08,.50],[.08,.12,.42],[-.19,base,.29],[.21,base,.28]]});
}
