import * as THREE from 'three';

function surface(k,g,m,fn,nu=32,nv=24){
 const p=[],ix=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)p.push(...fn(i/nu,j/nv));
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;ix.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();m.side=THREE.DoubleSide;k.mesh(g,geo,m);
}
function hip(k,g,p,w,d,y,h){
 const ridge=Math.max(.015,w/2-d*.38);
 for(const sign of [-1,1]){
  const pt=(u,t,lift=0)=>[(u*2-1)*(ridge+(w/2-ridge)*t),y+h*(1-t)**1.28+.003*t**6*Math.abs(u*2-1)**6+lift,sign*d/2*t];
  surface(k,g,p.tile,(u,t)=>pt(u,t),36,12);
  for(let i=0;i<=50;i++)k.line(g,Array.from({length:9},(_,j)=>pt(i/50,j/8,.0007)),.00065,p.tileRib);
  surface(k,g,p.tile,(u,t)=>[sign*(ridge+(w/2-ridge)*t),y+h*(1-t)**1.28+.003*t**6*Math.abs(u*2-1)**6,(u*2-1)*d/2*t],24,12);
  k.line(g,[[-w/2,y+.003,sign*d/2],[0,y,sign*d/2],[w/2,y+.003,sign*d/2]],.002,p.trim);
 }
 k.line(g,[[-ridge-.006,y+h+.004,0],[ridge+.006,y+h+.004,0]],.003,p.tileRib);
}
function cedar(k,g,p,x,z,h){
 k.cyl(g,.003,.006,h*.65,p.trunk,x,.016+h*.32,z,6);
 for(let j=0;j<5;j++)k.mesh(g,new THREE.ConeGeometry(h*(.27-.043*j),h*.33,8),p.leaf,x,.016+h*(.30+.15*j),z);
}
function entry(k,g,p,x,z,w=.43){
 const e=new THREE.Group();e.position.set(x,0,z);g.add(e);
 k.box(e,w+.024,.024,.165,p.stone,0,.026,0);
 for(let i=0;i<5;i++)k.box(e,w*.88,.0048*(i+1),.012,p.stone,0,.014+.0024*(i+1),.128-i*.012);
 for(let i=0;i<6;i++)k.box(e,.017,.096,.019,p.stone,(i/5-.5)*w*.91,.088,.050);
 for(const s of [-1,1])k.box(e,.025,.10,.14,p.stone,s*w/2,.090,0);
 k.box(e,w,.018,.14,p.trim,0,.145,0);hip(k,e,p,w+.050,.185,.156,.030);
 for(let i=0;i<5;i++){
  const xx=((i+.5)/5-.5)*w*.91;k.box(e,w*.14,.095,.004,p.glass,xx,.088,-.06);
  k.box(e,w*.12,.002,.006,p.lamp,xx,.130,.038);
 }
}
function sign(k,g,p){
 k.box(g,.31,.035,.014,p.darkStone,-.39,.033,.74);
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#3c4742';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#b9ac7f';ctx.font='72px "KaiTi", "Microsoft YaHei", serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('秦始皇兵马俑博物馆',512,68,995);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:t,roughness:.9});m.userData.night={color:new THREE.Color('#c1b38e'),intensity:.08};k.materials.push(m);k.mesh(g,new THREE.PlaneGeometry(.296,.028),m,-.39,.034,.7475);
}
export function warriors(k){
 const first=k.materials.length,g=new THREE.Group(),p={stone:k.mat('#bebdb0'),trim:k.mat('#acb0a7'),wall:k.mat('#c5c7bc'),panel:k.mat('#aeb3aa'),glass:k.mat('#384e4f',.4,.12),frame:k.mat('#8c9690'),metal:k.mat('#9da6a1',.73,.17),seam:k.mat('#bdc4bb',.8),tile:k.mat('#595d57'),tileRib:k.mat('#767971'),leaf:k.mat('#526b4c'),trunk:k.mat('#746d58'),ground:k.mat('#bcbba6'),lawn:k.mat('#819068'),darkStone:k.mat('#444d44')};
 for(const [key,m]of Object.entries(p))m.userData.night={color:new THREE.Color(key==='glass'?'#edd8ad':key==='leaf'?'#7b946f':'#ddc9a4'),intensity:key==='glass'?.15:key==='metal'?.025:key==='ground'?.025:.045};
 p.lamp=k.mat('#c9c0a3',.8,0,'#ffe0a6');p.lamp.userData.night.intensity=.6;p.metal.userData.preserveSmooth=true;
 // A continuous flat visitor plaza blends down to the sphere only beyond the buildings.
 surface(k,g,p.ground,(u,v)=>{const a=u*Math.PI*2,r=v,x=.84*r*Math.cos(a),z=1.02*r*Math.sin(a),sag=2.15-Math.sqrt(2.15**2-x*x-z*z);return[x,.014-sag*THREE.MathUtils.smoothstep(r,.91,1),z];},128,24);
 const one=new THREE.Group();one.position.set(-.36,0,-.20);g.add(one);
 const w=.43,d=1.16,roofY=x=>.165+.077*Math.sqrt(Math.max(0,1-(x/(w/2))**2));
 k.box(one,w+.015,.012,d+.018,p.stone,0,.020,0);
 for(const s of [-1,1]){
  k.box(one,.014,.145,d,p.wall,s*w/2,.093,0);
  for(let i=0;i<23;i++){const z=(i/22-.5)*d;k.box(one,.017,.155,.004,p.panel,s*(w/2+.001),.097,z);}
  k.box(one,.003,.045,d-.06,p.glass,s*(w/2+.009),.121,0);
  for(let i=0;i<28;i++)k.box(one,.004,.048,.002,p.frame,s*(w/2+.012),.121,(i/27-.5)*(d-.06));
 }
 surface(k,one,p.metal,(u,v)=>{const x=(u-.5)*w;return[x,roofY(x),(v-.5)*d];},48,60);
 for(let i=0;i<=43;i++){const z=(i/43-.5)*d;k.line(one,Array.from({length:41},(_,j)=>{const x=(j/40-.5)*w;return[x,roofY(x)+.0008,z];}),.00065,p.seam);}
 for(const x of [-.17,-.11,-.055,0,.055,.11,.17])k.line(one,[[x,roofY(x)+.001,-d/2],[x,roofY(x)+.001,d/2]],.00055,p.panel);
 for(const s of [-1,1]){
  const f=new THREE.Shape();f.moveTo(-w/2,.026);f.lineTo(w/2,.026);for(let i=48;i>=0;i--){const x=(i/48-.5)*w;f.lineTo(x,roofY(x)-.004);}f.closePath();
  const m=k.mesh(one,new THREE.ShapeGeometry(f),p.glass,0,0,s*d/2);if(s<0)m.rotation.y=Math.PI;
  for(let i=0;i<13;i++){const x=(i/12-.5)*w,h=roofY(x)-.026;k.box(one,.004,h,.006,p.frame,x,.026+h/2,s*(d/2+.002));}
  for(let j=0;j<5;j++){const y=.042+j*.031;k.box(one,w-.009,.0025,.004,p.frame,0,y,s*(d/2+.005));}
  k.line(one,Array.from({length:49},(_,j)=>{const x=(j/48-.5)*w;return[x,roofY(x)+.001,s*(d/2+.003)];}),.004,p.trim);
 }
 // Raised continuous ridge-light above the shallow vault.
 k.box(one,.046,.020,d*.84,p.glass,0,.248,0);k.box(one,.060,.005,d*.87,p.metal,0,.261,0);
 for(const s of [-1,1])for(let i=0;i<27;i++)k.box(one,.004,.019,.003,p.frame,s*.024,.248,(i/26-.5)*d*.84);
 entry(k,g,p,-.36,.43,.43);
 // The neighboring pit hall is a broad, low square volume with an entrance extension.
 const two=new THREE.Group();two.position.set(.25,0,-.25);g.add(two);
 k.box(two,.57,.237,.76,p.wall,0,.136,0);
 surface(k,two,p.metal,(u,v)=>[(u-.5)*.57,.258+.021*(1-Math.max(Math.abs(u*2-1),Math.abs(v*2-1))),(v-.5)*.76],24,30);
 for(const s of [-1,1]){
  k.box(two,.008,.012,.78,p.trim,s*.289,.262,0);k.box(two,.59,.012,.008,p.trim,0,.262,s*.384);
  for(let i=0;i<25;i++)k.box(two,.002,.224,.002,p.panel,(i/24-.5)*.55,.139,s*.381);
  for(let i=0;i<35;i++)k.box(two,.002,.224,.002,p.panel,s*.286,.139,(i/34-.5)*.74);
 }
 for(let j=0;j<14;j++)for(const s of [-1,1]){const y=.026+j*.016;k.box(two,.571,.0006,.001,p.panel,0,y,s*.381);k.box(two,.001,.0006,.761,p.panel,s*.286,y,0);}
 k.box(two,.55,.15,.17,p.wall,0,.091,.44);k.box(two,.57,.005,.185,p.stone,0,.169,.44);
 for(let i=0;i<8;i++){const x=(i/7-.5)*.51;k.box(two,.013,.166,.020,p.trim,x,.102,.535);k.box(two,.045,.050,.003,p.glass,x,.050,.539);}
 for(const x of [-.18,0,.18]){const e=new THREE.Group();e.position.set(x,0,.568);two.add(e);k.box(e,.095,.085,.045,p.stone,0,.063,0);k.box(e,.053,.065,.002,p.glass,0,.056,.023);hip(k,e,p,.11,.067,.108,.019);}
 // Front lawns leave clear walks to both halls; planting frames the site rather than filling it.
 for(const [x,z,ww,dd]of [[-.36,.67,.39,.12],[.31,.59,.40,.23]]){
  k.box(g,ww+.008,.005,dd+.008,p.stone,x,.018,z);k.box(g,ww,.002,dd,p.lawn,x,.022,z);
  for(let i=0;i<5;i++){const b=k.ball(g,.013,p.leaf,x+(i/4-.5)*ww*.85,.031,z-dd*.43);b.scale.y=.70;}
 }
 for(const [x,z]of [[.19,.56],[.42,.59],[.31,.65]]){const b=k.ball(g,.027,p.leaf,x,.040,z);b.scale.set(1.4,.7,1);}
 for(const [x,z,h]of [[-.65,-.55,.17],[-.65,-.28,.18],[-.65,0,.18],[-.65,.29,.16],[-.06,-.58,.16],[-.06,-.35,.17],[-.06,-.12,.16],[.60,-.46,.17],[.61,-.16,.16],[.61,.13,.15]])cedar(k,g,p,x,z,h);
 for(const [i,[x,z]]of [[-.13,.65],[.06,.51],[.54,.52],[-.61,.55]].entries()){
  const lamp=k.mat('#c9c0a3',.8,0,'#ffe0a6');lamp.userData.night.intensity=.80;lamp.userData.pulse={speed:.70+i*.08,phase:i*1.7};
  k.cyl(g,.002,.003,.064,p.frame,x,.046,z,8);k.ball(g,.006,lamp,x,.081,z);
 }
 sign(k,g,p);for(const m of k.materials.slice(first))m.userData.warriorsRigid=true;
 g.userData={barrelVault:true,pitHalls:2,openStonePortico:true};return k.merge(g);
}
