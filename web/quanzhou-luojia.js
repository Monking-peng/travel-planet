import * as THREE from 'three';
import {palette,site,skin,sign,finish,railing,sea,TAU,lantern} from './quanzhou-kit.js';

function tile(k,color){
 const m=k.mat(color,.84,.04),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 ljUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nljUv=uv;');s.fragmentShader='varying vec2 ljUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\nfloat aa=max(fwidth(ljUv.x),.008),rib=1.0-smoothstep(.04,.04+aa,abs(fract(ljUv.x)-.5)),vis=1.0-smoothstep(.4,.9,aa);float seam=smoothstep(.02,.02+max(fwidth(ljUv.y),.008),fract(ljUv.y));diffuseColor.rgb*=mix(1.0,.79+.28*rib,vis)*mix(.89,1.0,seam);`);};m.customProgramCacheKey=()=> 'luojia-tile';return m;
}
function surface(k,g,p,fn,w){const o=skin(k,g,fn,20,64,p.tile),uv=[];for(let j=0;j<=20;j++)for(let i=0;i<=64;i++)uv.push(i/64*w*145,j/20*16);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return o;}
function frieze(k,g,p,w,y,z){
 k.box(g,w,.018,.008,p.blue,0,y,z);for(const dy of [-.010,.010])k.box(g,w,.002,.010,p.pale,0,y+dy,z);
 for(let i=0,n=Math.max(2,Math.round(w/.047));i<n;i++){const x=((i+.5)/n-.5)*w;k.box(g,w/n*.80,.011,.010,p.gold,x,y,z+.001);for(let j=0;j<4;j++){const a=j*TAU/4,pet=k.ball(g,.0019,p.red,x+Math.sin(a)*.003,y+Math.cos(a)*.003,z+.007);pet.scale.z=.35;}}
}
function dragon(k,g,p,x,y,z,side,scale=1){
 const a=new THREE.Group();a.position.set(x,y,z);a.scale.set(side*scale,scale,scale);g.add(a);
 const spine=[[0,0,0],[.018,.006,0],[.038,.018,0],[.041,.034,0],[.026,.041,0],[.018,.056,0],[.024,.072,0],[.035,.077,0]];k.line(a,spine,.0034,p.green);k.line(a,spine.map(q=>[q[0],q[1]-.002,q[2]+.002]),.0012,p.gold);
 const head=k.ball(a,.006,p.green,.035,.077,0);head.scale.set(1.4,.7,.6);k.ball(a,.0015,p.pale,.036,.079,.004);k.line(a,[[.027,.080,0],[.021,.091,0],[.023,.097,0]],.0014,p.red);k.line(a,[[.029,.066,0],[.045,.065,.002],[.052,.076,.001]],.0013,p.gold);
 for(let i=1;i<7;i++){const q=spine[i];k.beam(a,[q[0],q[1]+.003,0],[q[0]-.006,q[1]+.011,0],.0014,p.pale,5);}
}
function roof(k,g,p,w,d,h,y,{gable=false,ornate=true}={}){
 if(gable){
  const at=(side,u,v)=>{const a=u*2-1;return [a*w*(.38+.12*v),y+h*(1-v)**1.5+.018*Math.abs(a)**6*(1-v)**2+.014*Math.abs(a)**7*v**6,side*d*v/2];};
  for(const side of [-1,1]){surface(k,g,p,(u,v)=>at(side,u,v),w);k.line(g,Array.from({length:49},(_,i)=>at(side,i/48,1)),.0027,p.eave);for(const u of [0,1]){const a=Array.from({length:25},(_,i)=>at(side,u,i/24));k.line(g,a,.0037,p.pale);k.line(g,a.map(q=>[q[0],q[1]+.003,q[2]]),.0015,p.blue);}}
  for(const sx of [-1,1]){skin(k,g,(u,v)=>[sx*w*.38,y+(h+.018)*v,(u*2-1)*d*.40*(1-v)],16,32,p.brick);for(const zz of [-.018,.018])k.box(g,.003,.012,.012,p.pale,sx*w*.381,y+h*.36,zz);}
 }else{
  const ridge=Math.max(.005,(w-d)*.46),at=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),n=Math.max(Math.abs(c),Math.abs(s)),x=c/n*w/2,z=s/n*d/2,t=.001+.999*v,corner=Math.min(Math.abs(c),Math.abs(s))/.7071;return [x*t+THREE.MathUtils.clamp(x,-ridge,ridge)*(1-t),y+h*(1-t)**1.5+.020*t**6*corner**8,z*t];};surface(k,g,p,at,w*2);k.line(g,Array.from({length:128},(_,i)=>at(i/128,1)),.0028,p.eave,true);
  for(const u of [.125,.375,.625,.875])k.line(g,Array.from({length:19},(_,i)=>at(u,i/18)),.003,p.pale);
 }
 const rw=gable?w*.38:Math.max(.005,(w-d)*.46);k.line(g,Array.from({length:33},(_,i)=>{const a=i/16-1;return[a*rw,y+h+.018*Math.abs(a)**5,0];}),.004,p.blue);
 for(const sx of [-1,1]){if(ornate)dragon(k,g,p,sx*rw*.65,y+h+.01,0,sx,Math.min(1,w/.5));else k.line(g,[[sx*rw,y+h+.014,0],[sx*(rw+.015),y+h+.035,0]],.002,p.pale);}
 for(const side of [-1,1]){frieze(k,g,p,w*.93,y-.008,side*d*.46);for(let i=0,n=Math.ceil(w/.026);i<n;i++){const x=((i+.5)/n-.5)*w;k.beam(g,[x*.84,y-.018,side*d*.35],[x,y-.006,side*d*.48],.002,p.wood,5);}}
}
function door(k,g,p,x,b,h,z,w){
 k.box(g,w,h,.008,p.wood,x,b+h/2,z);k.box(g,w*.78,h*.77,.009,p.pane,x,b+h*.52,z+.001);
 for(let i=0;i<5;i++)k.box(g,.0015,h*.72,.006,p.red,x+(i/4-.5)*w*.72,b+h*.55,z+.008);for(let i=0;i<4;i++)k.box(g,w*.76,.0016,.006,p.red,x,b+h*(.24+i*.18),z+.008);
}
function hall(k,g,p,{x=0,z=0,w=.42,d=.24,b=.13,h=.14,double=false,label='',gable=true}){
 const a=new THREE.Group();a.position.set(x,0,z);g.add(a);k.box(a,w+.018,b-.10,d+.023,p.stone,0,(b+.10)/2,0);k.box(a,w+.024,.006,d+.032,p.pale,0,b-.003,0);
 k.box(a,w*.90,h,d*.53,p.wall,0,b+h/2,-d*.17);const bays=Math.max(3,Math.round(w/.085)|1);for(let i=0;i<bays;i++)door(k,a,p,((i+.5)/bays-.5)*w*.88,b+.006,h*.78,d*.10,w*.69/bays);
 for(let i=0;i<bays;i++){const rear=new THREE.Group();rear.rotation.y=Math.PI;a.add(rear);door(k,rear,p,((i+.5)/bays-.5)*w*.83,b+.018,h*.66,d*.438,w*.60/bays);}
 for(const sx of [-1,1])for(let i=0;i<3;i++){const zz=-d*.39+i*d*.22,side=new THREE.Group();side.position.set(sx*w*.455,0,zz);side.rotation.y=sx*Math.PI/2;a.add(side);door(k,side,p,0,b+.018,h*.65,0,d*.16);}
 for(let i=0;i<=bays;i++){const xx=(i/bays-.5)*w*.94;k.box(a,.023,.014,.023,p.stone,xx,b+.007,d*.43);k.cyl(a,.006,.008,h-.02,p.pale,xx,b+.014+(h-.02)/2,d*.43,12);for(let j=0;j<3;j++)k.box(a,.014+j*.008,.005,.016+j*.008,p.red,xx,b+h-.005+j*.006,d*.43);if(i%2===1)k.line(a,Array.from({length:30},(_,j)=>{const t=j/29,an=t*TAU*2;return[xx+Math.sin(an)*.008,b+.028+t*(h-.052),d*.43+Math.cos(an)*.008];}),.0018,p.stone);}
 k.box(a,w,.012,.014,p.red,0,b+h,d*.43);roof(k,a,p,w*1.13,d*1.20,h*.39,b+h+.018,{gable:false,ornate:!double});
 if(double){const yy=b+h+.018+h*.39+.026;k.box(a,w*.72,.033,d*.64,p.wall,0,yy-.016,0);roof(k,a,p,w*.94,d*.94,h*.50,yy,{gable,ornate:true});k.cyl(a,.001,.006,.027,p.clay,0,yy+h*.50+.020,0,8);}
 if(label)sign(k,a,label,w*.31,.024,0,b+h-.020,d*.44,{background:'#4b4331',color:'#d9b963'});return a;
}
function tower(k,g,p,x,z){
 const a=new THREE.Group();a.position.set(x,0,z);g.add(a);k.box(a,.145,.20,.14,p.wall,0,.20,0);for(const yy of [.112,.208,.282]){k.box(a,.160,.009,.16,p.pale,0,yy,0);for(const s of [-1,1]){const face=new THREE.Group();face.rotation.y=s*Math.PI/2;a.add(face);frieze(k,face,p,.145,yy-.01,.075);}}
 for(const yy of [.15,.245])for(const side of [-1,1]){door(k,a,p,0,yy-.025,.05,side*.071,.055);k.box(a,.168,.008,.168,p.red,0,yy+.04,0);}
 roof(k,a,p,.21,.20,.045,.300,{gable:false,ornate:false});k.box(a,.100,.054,.100,p.wall,0,.373,0);for(const side of [-1,1]){door(k,a,p,0,.354,.035,side*.051,.045);}roof(k,a,p,.158,.152,.043,.400,{gable:false,ornate:false});
}
function gallery(k,g,p,x,z,length,rotation=0){
 const a=new THREE.Group();a.position.set(x,0,z);a.rotation.y=rotation;g.add(a);k.box(a,length,.23,.12,p.wall,0,.215,0);for(const yy of [.113,.225,.330])k.box(a,length+.015,.008,.15,p.pale,0,yy,0);
 const n=Math.round(length/.075);for(let i=0;i<n;i++){const xx=((i+.5)/n-.5)*length;for(const yy of [.145,.255]){door(k,a,p,xx,yy,.055,.061,length/n*.65);const rear=new THREE.Group();rear.rotation.y=Math.PI;a.add(rear);door(k,rear,p,-xx,yy,.055,.061,length/n*.65);}k.cyl(a,.003,.004,.225,p.red,xx,.215,.080,8);}railing(k,a,p,[[-length/2,.224,.079],[length/2,.224,.079]],.031);k.box(a,length+.025,.007,.16,p.tile,0,.337,0);
}
function gate(k,g,p){
 const a=new THREE.Group();a.position.set(-.46,0,.27);a.rotation.y=-Math.PI/2;g.add(a);const gp={...p,tile:p.greenTile};
 const arch=(x,w,high,r)=>{const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,high);shape.lineTo(-w/2,high);shape.closePath();const hole=new THREE.Path();hole.moveTo(-r,.001);hole.lineTo(-r,high*.42);hole.absarc(0,high*.42,r,Math.PI,0,true);hole.lineTo(r,.001);hole.closePath();shape.holes.push(hole);k.mesh(a,new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:24}),p.gate,x,.102,-.0175);const roofGroup=new THREE.Group();roofGroup.position.x=x;a.add(roofGroup);roof(k,roofGroup,gp,w+.028,.09,.037,.102+high,{gable:false,ornate:false});};
 arch(0,.14,.15,.043);arch(-.11,.08,.104,.021);arch(.11,.08,.104,.021);sign(k,a,'洛伽寺',.065,.023,0,.225,.019,{background:'#41452c',color:'#d9c287'});
}
export function luojia(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.84,.78);sea(k,g,p,.81,.73);p.tile=tile(k,'#b76f46');p.greenTile=tile(k,'#476d58');p.wall=k.mat('#cf994f',.92);p.gate=p.wall.clone();k.materials.push(p.gate);p.gate.userData.luojiaGate=true;p.red=k.mat('#793a2d',.91);p.brick=k.mat('#ac5b46',.94);p.green=k.mat('#365e53',.78);p.blue=k.mat('#3f687c',.80);p.clay=k.mat('#b86a43',.87);p.eave=k.mat('#a47847',.82);p.eave.userData.night={color:new THREE.Color('#f1c78e'),intensity:.32};p.pane=k.mat('#403e30',.9);p.pane.userData.night={color:new THREE.Color('#e7bb79'),intensity:.20};p.stone.userData.luojiaGround=true;
 p.stone.onBeforeCompile=s=>{s.vertexShader='varying vec3 ljStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nljStone=position;');s.fragmentShader='varying vec3 ljStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\nvec2 q=vec2((ljStone.x+ljStone.z)*23.0,ljStone.y*65.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),aa=max(fwidth(q),vec2(.006));float seam=max(1.0-smoothstep(.02,.02+aa.x,min(f.x,1.0-f.x)),1.0-smoothstep(.025,.025+aa.y,min(f.y,1.0-f.y)));diffuseColor.rgb*=.98-seam*.13;`);};p.stone.customProgramCacheKey=()=> 'luojia-stone-courses';
 const border=[[-.60,-.38],[-.40,-.52],[.38,-.50],[.60,-.28],[.63,.30],[.45,.50],[-.42,.47],[-.63,.20]],shape=new THREE.Shape();border.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const base=new THREE.ExtrudeGeometry(shape,{depth:.076,bevelEnabled:false});base.rotateX(-Math.PI/2);k.mesh(g,base,p.stone,0,.026,0);const top=new THREE.ShapeGeometry(shape);top.rotateX(-Math.PI/2);k.mesh(g,top,p.pale,0,.103,0);
 for(let i=0;i<border.length;i++){const a=border[i],b=border[(i+1)%border.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.025);for(let j=0;j<n;j++){const t=(j+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(Math.abs(x+.43)<.065&&z>.39)continue;railing(k,g,p,[[a[0]+(b[0]-a[0])*j/n,.103,a[1]+(b[1]-a[1])*j/n],[a[0]+(b[0]-a[0])*(j+1)/n,.103,a[1]+(b[1]-a[1])*(j+1)/n]],.037);}}

 hall(k,g,p,{x:.07,z:-.17,w:.48,d:.34,b:.137,h:.17,double:true,label:'圆通宝殿'});
 gallery(k,g,p,-.46,-.20,.51,Math.PI/2);gallery(k,g,p,-.19,-.44,.45);hall(k,g,p,{x:-.46,z:-.11,w:.17,d:.18,b:.13,h:.16});
 tower(k,g,p,.47,-.12);tower(k,g,p,.47,-.395);
 hall(k,g,p,{x:.47,z:.275,w:.22,d:.23,b:.12,h:.105,label:'念佛堂'});hall(k,g,p,{x:.025,z:.31,w:.40,d:.14,b:.12,h:.09,label:'天王殿',gable:false});
 for(const sx of [-1,1])hall(k,g,p,{x:.025+sx*.25,z:.32,w:.11,d:.12,b:.112,h:.075,gable:false});gate(k,g,p);
 for(let i=0;i<7;i++){const yy=.103+(i+1)*(.034/7);k.box(g,.18,yy-.101,.013,p.stone,.07,(yy+.101)/2,.075-i*.012);}for(const sx of [-1,1])railing(k,g,p,[[.07+sx*.102,.103,.083],[.07+sx*.102,.137,-.007]],.030);
 // The bridge meets the island beside the green entrance; keep its path open through the sea wall.
 k.box(g,.098,.020,.265,p.stone,-.43,.093,.575);for(const x of [-.481,-.379])railing(k,g,p,[[x,.103,.45],[x,.103,.707]],.036);
 for(const z of [.51,.62,.69])k.box(g,.075,.068,.025,p.stone,-.43,.059,z);
 const rock=k.mat('#817c6a',.99);for(let i=0;i<45;i++){const a=i/45*TAU,r=.63+.035*Math.sin(i*7);const o=k.mesh(g,new THREE.DodecahedronGeometry(.028+i%4*.009,1),rock,Math.sin(a)*r,.042,Math.cos(a)*r*.84);o.scale.set(1.2,.50,.8);o.rotation.set(i*.31,i*.67,i*.21);}
 for(let i=0;i<6;i++){const a=i/6*TAU;k.line(g,Array.from({length:16},(_,j)=>{const t=a+(j/15-.5)*.20;return[Math.sin(t)*.73,.027,Math.cos(t)*.65];}),.0012,k.mat('#b2c5b8',.85));}
 for(const x of [-.12,.17])lantern(k,g,p,x,.195,.395,.009);
 g.traverse(o=>{if(o.material)o.material.userData.luojiaStructure=true;});
 return finish(k,g,{lamps:[[-.52,.104,.38],[.34,.104,.43],[-.29,.104,.13],[.30,.104,.03],[.54,.104,-.42]],visitors:[[-.43,.104,.65],[-.43,.104,.55],[-.44,.104,.40],[-.30,.104,.37],[-.29,.104,.15],[-.17,.104,.10],[-.04,.104,.12],[.10,.104,.10],[.20,.104,.07],[.22,.104,.43],[.38,.104,.12],[.56,.104,.06],[-.33,.104,-.13],[-.29,.104,-.30]]});
}
