import * as THREE from 'three';
import {palette,site,skin,sign,finish,TAU,lantern,grove} from './quanzhou-kit.js';
function tile(k,color){
 const m=k.mat(color,.84,.04),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 wmUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwmUv=uv;');s.fragmentShader='varying vec2 wmUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\nfloat aa=max(fwidth(wmUv.x),.008),rib=1.0-smoothstep(.04,.04+aa,abs(fract(wmUv.x)-.5)),vis=1.0-smoothstep(.4,.9,aa);float seam=smoothstep(.02,.02+max(fwidth(wmUv.y),.008),fract(wmUv.y));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.25,.26,.19),vis*(1.0-rib)*.29);diffuseColor.rgb*=mix(.90,1.0,seam);`);};m.customProgramCacheKey=()=> 'wenmiao-tile';return m;
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
function banyan(k,g,p,x,z,h){
 const a=new THREE.Group();a.position.set(x,.026,z);g.add(a);const trunk=k.mat('#7f7762',.98),leaves=[k.mat('#506c43',.98),k.mat('#60774a',.98),k.mat('#49613c',.99)];
 k.cyl(a,.009,.018,h*.58,trunk,0,h*.29,0,9);
 for(let i=0;i<9;i++){const an=i/9*TAU,dx=Math.sin(an),dz=Math.cos(an);k.line(a,[[dx*.003,h*.43,dz*.003],[dx*.014,h*.19,dz*.015],[dx*.033,.018,dz*.030],[dx*.052,.003,dz*.046]],.0023,trunk);}
 for(let i=0;i<17;i++){const an=i*2.399,r=Math.sqrt(i/17)*h*.48,xx=Math.sin(an)*r,zz=Math.cos(an)*r,yy=h*(.72+.20*Math.sin(i*1.7));if(i<8)k.beam(a,[0,h*.40,0],[xx,yy*.84,zz],.003,trunk);const o=k.mesh(a,new THREE.DodecahedronGeometry(h*(.19+(i%4)*.015),1),leaves[i%3],xx,yy,zz);o.scale.set(1.3,.77,1.1);o.rotation.y=an;}
}

function panel(k,g,p,x,y,z,w,h){
 k.box(g,w,h,.009,p.red,x,y,z);k.box(g,w*.73,h*.53,.010,p.pane,x,y+h*.13,z+.001);
 for(let i=0;i<4;i++){const xx=x+(i/3-.5)*w*.63;k.box(g,.0012,h*.52,.006,p.pale,xx,y+h*.13,z+.008);}
 for(let i=0;i<4;i++)k.box(g,w*.68,.0011,.006,p.pale,x,y-h*.11+i*h*.16,z+.008);
 k.box(g,w*.76,.018,.010,p.wood,x,y-h*.34,z+.001);k.box(g,w*.69,.012,.011,p.red,x,y-h*.34,z+.002);
}
function col(k,g,p,x,y,z,h,carved=false){
 k.box(g,.025,.010,.025,p.stone,x,y+.005,z);k.cyl(g,.0065,.009,h,p.pale,x,y+.010+h/2,z,14);
 for(let i=0;i<3;i++){k.box(g,.020+i*.008,.005,.015+i*.008,p.red,x,y+h-.006+i*.006,z);k.box(g,.005,.009,.033+i*.006,p.blue,x,y+h-.004+i*.006,z);}
 if(carved){const curve=Array.from({length:34},(_,j)=>{const t=j/33,a=t*TAU*1.65;return[x+Math.sin(a)*.008,y+.02+t*h*.73,z+Math.cos(a)*.008];});k.line(g,curve,.0024,p.stone);const q=curve.at(-1);k.ball(g,.005,p.stone,q[0],q[1],q[2]);}
}
function mainHall(k,g,p){
 const a=new THREE.Group();a.position.z=-.355;g.add(a);const b=.075,h=.147,w=.69,d=.38;
 k.box(a,.73,.043,.43,p.stone,0,.0465,0);k.box(a,.75,.007,.45,p.pale,0,.0715,0);
 k.box(a,.68,h,.023,p.brick,0,b+h/2,-.15);for(const side of [-1,1])k.box(a,.025,h,.30,p.brick,side*.331,b+h/2,0);
 for(let i=0;i<7;i++){const x=(i-3)*.090; if(i!==3)panel(k,a,p,x,b+h*.43,.116,.085,h*.86);}
 for(let i=0;i<=7;i++)col(k,a,p,(i/7-.5)*w*.93,b,.176,h,i===1||i===6);
 for(const side of [-1,1]){col(k,a,p,side*.320,b,-.14,h);const f=new THREE.Group();f.position.x=side*.346;f.rotation.y=side*Math.PI/2;a.add(f);k.box(f,.17,.115,.003,p.pale,0,b+.065,0);k.box(f,.148,.093,.004,p.brick,0,b+.065,.002);for(let j=0;j<3;j++){const rr=.035+j*.009;const pts=Array.from({length:8},(_,i)=>{const an=i/8*TAU+Math.PI/8;return[Math.cos(an)*rr,b+.065+Math.sin(an)*rr,.005];});k.line(f,pts,.0016,p.pale,true);}k.mesh(f,new THREE.CircleGeometry(.018,32),p.pale,0,b+.065,.006);}
 roof(k,a,p,.80,.49,.068,b+h+.014,{gable:false,ornate:false});
 k.box(a,.57,.034,.27,p.wood,0,.316,0);roof(k,a,p,.70,.39,.088,.334,{gable:false,ornate:true});
 ['大','成','殿'].forEach((c,i)=>sign(k,a,c,.022,.020,0,.328-i*.021,.247,{background:'#c7bb8c',color:'#644738'}));
 const rear=new THREE.Group();rear.rotation.y=Math.PI;a.add(rear);for(let i=0;i<7;i++)panel(k,rear,p,(i-3)*.087,b+.071,.163,.058,.093);
 // A broad raised terrace precedes the doors; bronze burners flank its clear centre.
 k.box(g,.46,.036,.25,p.stone,0,.044,-.085);k.box(g,.47,.006,.26,p.pale,0,.065,-.085);
 for(let i=0;i<6;i++){const top=.026+(i+1)*.042/6;k.box(g,.22,top-.024,.014,p.stone,0,(top+.024)/2,.117-i*.013);}
 for(const x of [-.165,.165]){const a=new THREE.Group();a.position.set(x,.068,-.060);g.add(a);const bronze=k.mat('#666d5e',.89,.13);k.box(a,.054,.033,.042,bronze,0,.037,0);for(const sx of [-1,1])for(const sz of [-1,1])k.box(a,.005,.021,.005,bronze,sx*.021,.012,sz*.015);for(const sx of [-1,1])k.line(a,[[sx*.024,.045,0],[sx*.036,.072,0],[sx*.025,.082,0]],.002,bronze);roof(k,a,{...p,tile:bronze},.085,.069,.023,.105,{gable:false,ornate:false});}
 for(const side of [-1,1])for(const z of [-.16,-.03]){k.box(g,.014,.040,.016,p.pale,side*.225,.090,z);}for(const side of [-1,1])k.box(g,.010,.008,.19,p.pale,side*.225,.111,-.085);
}
function gallery(k,g,p,x){
 const a=new THREE.Group();a.position.set(x,0,.012);a.rotation.y=x>0?-Math.PI/2:Math.PI/2;g.add(a);
 const len=.93;k.box(a,len,.023,.13,p.stone,0,.037,0);k.box(a,len,.11,.024,p.brick,0,.105,-.049);
 for(let i=0;i<12;i++)panel(k,a,p,((i+.5)/12-.5)*len,.100,-.034,.058,.076);
 for(let i=0;i<=12;i++)col(k,a,p,(i/12-.5)*len,.049,.051,.105);
 roof(k,a,p,len+.020,.18,.042,.168,{gable:true,ornate:false});
}
function gate(k,g,p){
 const a=new THREE.Group();a.position.z=.535;g.add(a);const b=.049,h=.129;k.box(a,.78,.024,.18,p.stone,0,.037,0);
 for(const [x,w]of [[-.330,.12],[-.115,.075],[.115,.075],[.330,.12]])k.box(a,w,h,.034,p.red,x,b+h/2,0);
 for(const x of [-.245,-.077,.077,.245])col(k,a,p,x,b,.069,h);
 k.box(a,.71,.020,.032,p.red,0,b+h-.010,0);roof(k,a,p,.84,.24,.063,b+h+.010,{gable:true,ornate:false});
 ['大','成','門'].forEach((c,i)=>sign(k,a,c,.015,.016,0,b+h-.027-i*.017,.086,{background:'#c7bb8c',color:'#644738'}));
 for(let i=0;i<4;i++){const top=.026+(i+1)*.023/4;k.box(a,.15,top-.024,.016,p.stone,0,(top+.024)/2,.143-i*.015);}
 for(const x of [-.115,.115])lantern(k,a,p,x,b+.098,.075,.009);
}
function poolBridge(k,g,p){
 const water=k.mat('#597c66',.65,.04);water.userData.water=true;water.userData.dayColor=water.color.clone();water.userData.landscape=true;
 k.box(g,.64,.003,.257,water,0,.028,.302);for(const z of [.166,.438])k.box(g,.68,.026,.018,p.stone,0,.039,z);for(const x of [-.330,.330])k.box(g,.020,.026,.29,p.stone,x,.039,.302);
 const height=z=>.052+.020*Math.sin(Math.PI*(z-.149)/.305);const n=30;
 for(let i=0;i<n;i++){const z=.149+(i+.5)*.305/n,h=height(z);k.box(g,.11,.013,.305/n+.0002,p.pale,0,h-.0065,z);}
 for(const z of [.173,.232,.291,.350,.425])for(const x of [-.039,.039]){const top=height(z)-.013;k.box(g,.018,top-.027,.020,p.stone,x,(top+.027)/2,z);}
 for(const x of [-.065,.065]){for(let i=0;i<=8;i++){const z=.149+i*.305/8,y=height(z);k.box(g,.012,.047,.014,p.pale,x,y+.0235,z);k.ball(g,.008,p.stone,x,y+.051,z);}
  for(let j=0;j<2;j++)for(let i=0;i<8;i++){const z1=.149+i*.305/8,z2=.149+(i+1)*.305/8;k.beam(g,[x,height(z1)+.012+j*.025,z1],[x,height(z2)+.012+j*.025,z2],.003,p.pale,6);}}
 for(const z of [.151,.453])for(let i=0;i<5;i++){const top=.026+(i+1)*.026/5,zz=z+(z<.3?-1:1)*(.050-i*.011);k.box(g,.11,top-.024,.014,p.stone,0,(top+.024)/2,zz);}
 for(const z of [.166,.438])for(const side of [-1,1]){for(let i=0;i<5;i++){const x=side*(.105+i*.054);k.box(g,.013,.035,.015,p.pale,x,.0695,z);}k.box(g,.24,.008,.009,p.pale,side*.216,.085,z);}
}
export function wenmiao(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.78,.79);p.tile=tile(k,'#b7814e');p.red=k.mat('#8c4033',.91);p.brick=k.mat('#b77959',.98);p.pale=k.mat('#c4c2af',.96);p.green=k.mat('#496e59',.86);p.blue=k.mat('#526777',.90);p.eave=k.mat('#947d50',.9);p.eave.userData.night={color:new THREE.Color('#eac28a'),intensity:.22};p.pane=k.mat('#393e32',.96);p.pane.userData.night={color:new THREE.Color('#e5b875'),intensity:.16};
 k.box(g,1.12,.009,1.25,p.stone,0,.020,0);for(let j=-16;j<=16;j++)k.box(g,1.11,.0006,.0008,p.pale,0,.025,j*.038);for(let i=-14;i<=14;i++)k.box(g,.0008,.0006,1.24,p.pale,i*.039,.0251,0);
 mainHall(k,g,p);for(const side of [-1,1])gallery(k,g,p,side*.47);gate(k,g,p);poolBridge(k,g,p);
 for(const side of [-1,1]){banyan(k,g,p,side*.31,.030,.25);banyan(k,g,p,side*.409,.325,.19);}
 g.traverse(o=>{if(o.material&&!o.material.userData.landscape)o.material.userData.wenmiaoStructure=true;});
 return finish(k,g,{lamps:[[-.40,.026,.60],[.40,.026,.60],[-.20,.026,.07],[.20,.026,.07],[-.34,.026,-.12],[.34,.026,-.12]],visitors:[[-.07,.026,.67],[.07,.026,.63],[.18,.026,.46],[-.18,.026,.46],[-.04,.026,.09],[.12,.026,.08],[-.26,.026,-.11],[.29,.026,-.15],[.025,.071,.30]]});
}
