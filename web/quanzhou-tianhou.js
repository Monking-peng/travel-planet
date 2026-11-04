import * as THREE from 'three';
import {palette,site,skin,sign,finish,TAU,lantern,grove} from './quanzhou-kit.js';
function tile(k,color){
 const m=k.mat(color,.84,.04),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 thUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nthUv=uv;');s.fragmentShader='varying vec2 thUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\nfloat aa=max(fwidth(thUv.x),.008),rib=1.0-smoothstep(.04,.04+aa,abs(fract(thUv.x)-.5)),vis=1.0-smoothstep(.4,.9,aa);float seam=smoothstep(.02,.02+max(fwidth(thUv.y),.008),fract(thUv.y));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.23,.22),vis*(1.0-rib)*.57);diffuseColor.rgb*=mix(.90,1.0,seam);`);};m.customProgramCacheKey=()=> 'tianhou-tile';return m;
}
function surface(k,g,p,fn,w){const o=skin(k,g,fn,20,64,p.tile),uv=[];for(let j=0;j<=20;j++)for(let i=0;i<=64;i++)uv.push(i/64*w*145,j/20*16);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return o;}
function frieze(k,g,p,w,y,z){
 k.box(g,w,.018,.008,p.blue,0,y,z);for(const dy of [-.010,.010])k.box(g,w,.002,.010,p.pale,0,y+dy,z);
 for(let i=0,n=Math.max(2,Math.round(w/.047));i<n;i++){const x=((i+.5)/n-.5)*w;k.box(g,w/n*.80,.011,.010,p.gold,x,y,z+.001);for(let j=0;j<4;j++){const a=j*TAU/4,pet=k.ball(g,.0019,p.red,x+Math.sin(a)*.003,y+Math.cos(a)*.003,z+.007);pet.scale.z=.35;}}
}
function dragon(k,g,p,x,y,z,side,scale=1){
 const a=new THREE.Group();a.position.set(x,y,z);a.scale.set(side*scale,scale,scale);g.add(a);
 const spine=[[-.04,.008,0],[-.025,.016,0],[-.005,.013,0],[.010,.023,0],[.004,.041,0],[-.012,.049,0],[-.007,.067,0],[.013,.075,0],[.026,.069,0]];
 k.line(a,spine,.0045,p.green);k.line(a,spine.map(q=>[q[0],q[1]-.003,q[2]+.003]),.0016,p.gold);
 const head=k.ball(a,.007,p.green,.026,.069,0);head.scale.set(1.5,.85,.65);k.box(a,.013,.003,.007,p.red,.030,.066,.001);k.ball(a,.0018,p.pale,.026,.072,.005);
 for(const sy of [-1,1]){k.line(a,[[.015,.069,sy*.003],[.009,.082,sy*.004],[.001,.087,sy*.004]],.0018,p.pale);k.line(a,[[.020,.062,sy*.004],[.030,.053,sy*.007],[.039,.057,sy*.008]],.0016,p.red);}
 for(let i=1;i<8;i++){const q=spine[i];k.beam(a,[q[0],q[1]+.003,0],[q[0]-.006,q[1]+.011,0],.0015,p.pale,5);}
 for(const x of [-.021,.006])for(const sz of [-1,1])k.line(a,[[x,.019,0],[x+.010,.006,sz*.010],[x+.019,.007,sz*.017]],.0018,p.green);
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
function column(k,g,p,x,b,z,h,carved=false){
 k.box(g,.023,.012,.023,p.stone,x,b+.006,z);k.cyl(g,.006,.008,h*.56,p.pale,x,b+.012+h*.28,z,12);k.cyl(g,.0055,.006,h*.40,p.red,x,b+h*.78,z,10);
 for(let j=0;j<3;j++)k.box(g,.014+j*.009,.006,.016+j*.009,p.red,x,b+h-.010+j*.006,z);
 if(carved){const pts=Array.from({length:36},(_,j)=>{const t=j/35,a=t*TAU*2;return[x+.008*Math.sin(a),b+.020+t*h*.44,z+.008*Math.cos(a)];});k.line(g,pts,.0022,p.stone);const q=pts.at(-1);k.ball(g,.0045,p.stone,q[0],q[1],q[2]);}
}
function hall(k,g,p,{x=0,z=0,w=.58,d=.34,b=.052,h=.17,double=false,rear=false}={}){
 const a=new THREE.Group();a.position.set(x,0,z);g.add(a);const front=double?d*.66+.014:d/2+.017,back=-d/2-.017;k.box(a,w+.025,b-.022,front-back,p.stone,0,(b+.022)/2,(front+back)/2);k.box(a,w+.032,.006,front-back+.006,p.pale,0,b-.003,(front+back)/2);
 k.box(a,w*.91,h,d*.65,p.brick,0,b+h/2,-d*.105);k.box(a,w*.92,h*.22,d*.66,p.pale,0,b+h*.11,-d*.105);
 const bays=rear?7:5;
 for(let i=0;i<bays;i++){const xx=((i+.5)/bays-.5)*w*.88;door(k,a,p,xx,b+.008,h*.78,d*.223,w*.73/bays);const back=new THREE.Group();back.rotation.y=Math.PI;a.add(back);door(k,back,p,-xx,b+.020,h*.59,d*.433,w*.52/bays);}
 for(const side of [-1,1])for(let i=0;i<3;i++){const wall=new THREE.Group();wall.position.set(side*w*.458,0,-d*.30+i*d*.22);wall.rotation.y=side*Math.PI/2;a.add(wall);door(k,wall,p,0,b+.035,h*.53,0,d*.13);}
 for(let i=0;i<=bays;i++)column(k,a,p,(i/bays-.5)*w*.93,b,d*.44,h,i===1||i===bays-1);
 roof(k,a,p,w*1.14,d*1.19,h*.38,b+h+.012,{gable:rear,ornate:rear});
 if(double){const yy=b+h+.012+h*.38+.022;k.box(a,w*.73,.030,d*.64,p.red,0,yy-.015,0);roof(k,a,p,w*.91,d*.92,h*.50,yy,{gable:true});
  // The low front porch is a third eave, distinct from the high double roof.
  const porch=new THREE.Group();porch.position.z=d*.43;a.add(porch);roof(k,porch,p,w*1.18,.16,.045,b+h-.032,{gable:false,ornate:false});
  for(let i=0;i<=bays;i++)column(k,a,p,(i/bays-.5)*w*.99,b,d*.64,h-.038,i===1||i===bays-1);
 }
 for(let i=0;i<5;i++){const top=.022+(b-.022)*(i+1)/5;k.box(a,w*.38,top-.020,.017,p.stone,0,(top+.020)/2,front+.071-i*.016);}
 return a;
}
function octagon(k,g,p,x,y,z){
 const dark=k.mesh(g,new THREE.CircleGeometry(.026,8),p.pane,x,y,z);dark.rotation.z=Math.PI/8;
 const points=Array.from({length:8},(_,i)=>{const a=i*TAU/8+Math.PI/8;return[x+.029*Math.cos(a),y+.029*Math.sin(a),z+.001];});k.line(g,points,.0035,p.stone,true);
 for(let i=-2;i<=2;i++){const yy=i*.008,len=Math.sqrt(.024**2-yy**2);k.beam(g,[x-len,y+yy,z+.002],[x+len,y+yy,z+.002],.0014,p.pale);k.beam(g,[x+yy,y-len,z+.002],[x+yy,y+len,z+.002],.0014,p.pale);}
}
function gate(k,g,p){
 const a=new THREE.Group();a.position.z=.49;g.add(a);p={...p,tile:tile(k,'#8e7561')};const b=.048,h=.19,w=.68;
 // Three actual passage openings, framed by the carved stone and orange brick facade.
 k.box(a,w,.026,.19,p.stone,0,.035,0);
 for(const [x,width]of [[-.30,.08],[-.145,.13],[.145,.13],[.30,.08]]){k.box(a,width,h,.035,p.brick,x,b+h/2,0);k.box(a,width,.040,.039,p.pale,x,b+.020,.001);k.box(a,width,.016,.039,p.pale,x,b+h-.008,.001);}
 k.box(a,w,.038,.04,p.pale,0,b+h-.019,0);
 for(const x of [-.273,-.073,.073,.273]){column(k,a,p,x,b,.079,h,true);k.box(a,.014,h*.83,.042,p.pale,x,b+h*.415,.005);}
 for(const x of [-.145,.145])octagon(k,a,p,x,b+.085,.021);
 for(const [x,rw,rh]of [[-.235,.21,.045],[0,.30,.075],[.235,.21,.045]]){const part=new THREE.Group();part.position.x=x;a.add(part);roof(k,part,p,rw,.225,rh,b+h+.012,{gable:true});}
 for(const x of [-.25,-.085,.085,.25])lantern(k,a,p,x,b+.156,.098,.013);
 const plaque=new THREE.Group();plaque.position.set(0,b+.16,.117);a.add(plaque);for(let i=0;i<3;i++)sign(k,plaque,['天','后','宮'][i],.014,.016,0,.018-i*.017,0,{background:'#537165',color:'#cfb77e'});
 for(const x of [-.10,.10]){k.box(a,.030,.028,.036,p.stone,x,.061,.144);const body=k.ball(a,.013,p.stone,x,.086,.144);body.scale.set(.8,1.12,1);k.ball(a,.010,p.pale,x,.104,.152);for(const dx of [-.007,.007])k.box(a,.006,.017,.014,p.pale,x+dx,.081,.157);}
 for(let i=0;i<5;i++){const top=.022+.026*(i+1)/5;k.box(a,.14,top-.020,.015,p.stone,0,(top+.020)/2,.145-i*.014);}
 // Stage faces into the court. Visitors pass its sides rather than through its platform.
 const stage=new THREE.Group();stage.position.set(0,0,-.115);stage.rotation.y=Math.PI;a.add(stage);k.box(stage,.56,.074,.17,p.stone,0,.059,0);k.box(stage,.57,.006,.18,p.pale,0,.099,0);k.box(stage,.26,.15,.016,p.red,0,.173,-.07);
 for(const x of [-.115,.115])column(k,stage,p,x,.102,.057,.13);roof(k,stage,p,.34,.23,.061,.240,{gable:true});
 k.box(stage,.16,.085,.005,p.gold,0,.175,-.059);k.box(stage,.145,.073,.006,p.brick,0,.175,-.054);for(const x of [-.085,.085])lantern(k,stage,p,x,.223,.071,.010);
 for(const x of [-.23,.23])for(let i=0;i<7;i++){const top=.022+.078*(i+1)/7;k.box(stage,.10,top-.02,.017,p.stone,x,(top+.02)/2,.188-i*.016);}
}
function gallery(k,g,p,x,z,length){
 const a=new THREE.Group();a.position.set(x,0,z);a.rotation.y=x>0?-Math.PI/2:Math.PI/2;g.add(a);
 k.box(a,length,.028,.14,p.stone,0,.036,0);k.box(a,length,.12,.026,p.brick,0,.11,-.05);const n=Math.ceil(length/.075);
 for(let i=0;i<n;i++)door(k,a,p,((i+.5)/n-.5)*length,.055,.086,-.035,length/n*.7);for(let i=0;i<=n;i++)column(k,a,p,(i/n-.5)*length,.050,.055,.11);
 roof(k,a,p,length+.04,.17,.035,.165,{gable:true,ornate:false});
}
export function tianhou(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.80,.87);p.tile=tile(k,'#ac714e');p.red=k.mat('#713d34',.90);p.brick=k.mat('#bf8061',.97);p.green=k.mat('#416859',.83);p.blue=k.mat('#4f5e51',.87);p.pale=k.mat('#c7c6b8',.95);p.eave=k.mat('#88633c',.88);p.eave.userData.night={color:new THREE.Color('#f0c992'),intensity:.24};p.pane=k.mat('#3d3830',.96);p.pane.userData.night={color:new THREE.Color('#eac28d'),intensity:.18};p.brick.onBeforeCompile=s=>{s.vertexShader='varying vec3 thBrick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nthBrick=position;');s.fragmentShader='varying vec3 thBrick;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec2 q=vec2((thBrick.x+thBrick.z)*61.0,thBrick.y*110.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),a=max(fwidth(q),vec2(.01));float seam=max(1.0-smoothstep(.018,.018+a.x,min(f.x,1.0-f.x)),1.0-smoothstep(.018,.018+a.y,min(f.y,1.0-f.y)));diffuseColor.rgb*=1.0-.10*seam;');};p.brick.customProgramCacheKey=()=> 'tianhou-brick';
 k.box(g,1.12,.010,1.44,p.pale,0,.020,0);for(let j=-18;j<=18;j++)k.box(g,1.11,.0007,.0008,p.stone,0,.0255,j*.038);for(let i=-13;i<=13;i++)k.box(g,.0008,.0006,1.43,p.stone,i*.041,.0256,0);
 gate(k,g,p);hall(k,g,p,{z:-.10,w:.56,d:.34,double:true});hall(k,g,p,{z:-.56,w:.64,d:.25,h:.155,rear:true});
 for(const side of [-1,1]){gallery(k,g,p,side*.40,.105,.39);gallery(k,g,p,side*.40,-.49,.26);for(const z of [.43,-.22])hall(k,g,p,{x:side*.425,z,w:.18,d:.17,b:.05,h:.105,double:true});}
 const incense=new THREE.Group();incense.position.set(0,.025,.260);incense.scale.setScalar(.75);g.add(incense);const burner=k.mat('#6d7164',.9);k.cyl(incense,.026,.032,.041,burner,0,.035,0,16);for(const x of [-.022,.022]){k.beam(incense,[x,.015,0],[x,0,0],.004,burner);k.line(incense,[[x,.049,0],[x*1.55,.072,0],[x*1.15,.088,0]],.0028,burner);}
 roof(k,incense,{...p,tile:burner},.085,.07,.025,.107,{gable:false,ornate:false});
 grove(k,g,ground,[[-.28,.085,.18],[.28,.085,.18],[-.59,-.25,.14],[.59,-.25,.14]]);
 for(const x of [-.32,.32]){k.box(g,.070,.018,.060,p.red,x,.035,.66);grove(k,g,()=>.045,[[x,.66,.085]]);}
 g.traverse(o=>{if(o.material&&!o.material.userData.landscape){o.material.userData.tianhouStructure=true;if(o.material.userData.pulse)o.material.userData.night={color:new THREE.Color('#ed6e35'),intensity:.45};}});
 return finish(k,g,{lamps:[[-.49,.026,.58],[.49,.026,.58],[-.24,.026,.02],[.24,.026,.02],[-.22,.026,-.35],[.22,.026,-.35]],visitors:[[-.07,.026,.70],[.07,.026,.66],[-.25,.026,.24],[.22,.026,.21],[-.11,.026,.08],[.13,.026,.06],[.29,.026,-.32],[-.30,.026,-.38],[.08,.026,-.37]]});
}
