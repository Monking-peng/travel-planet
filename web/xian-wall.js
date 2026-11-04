import * as THREE from 'three';
function strip(k,g,material,point,rows,cols){
 const positions=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)positions.push(...point(i/cols,j/rows));
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();material.side=THREE.DoubleSide;k.mesh(g,geo,material);
}
function roofSkirt(k,g,p,{w,d,y,h,inner=.74}){
 const point=(side,u,r,lift=0)=>{
  const t=u*2-1,rr=inner+(1-inner)*r,x=(side%2?w/2:w/2*t)*rr,z=(side%2?d/2*t:d/2)*rr,s=side>1?-1:1;
  return[x*s,y+h*Math.pow(1-r,1.3)+.017*Math.pow(r,5)*Math.pow(Math.abs(t),7)+lift,z*s];
 };
 for(let side=0;side<4;side++){
  strip(k,g,p.tile,(u,r)=>point(side,u,r),12,48);
  const count=side%2?38:82;
  for(let i=0;i<=count;i++)k.line(g,Array.from({length:9},(_,j)=>point(side,i/count,j/8,.0006)),.00055,p.rib);
  k.line(g,Array.from({length:33},(_,j)=>point(side,j/32,1,.001)),.0021,p.edge);
  for(let i=0;i<=count;i++){const a=point(side,i/count,1);k.box(g,.002,.004,.003,p.gold,a[0],a[1]-.003,a[2]);}
 }
}
function gableRoof(k,g,p,{w,d,y,h}){
 const inner=.72,low=y+.036,halfW=w/2*inner,halfD=d/2*inner;
 roofSkirt(k,g,p,{w,d,y,h:.036,inner});
 const point=(s,x,t,lift=0)=>[x,low+(h-.036)*Math.pow(1-t,1.25)+lift,s*halfD*t];
 for(const s of [-1,1]){
  strip(k,g,p.tile,(u,t)=>point(s,(u*2-1)*halfW,t),24,76);
  for(let i=0;i<=84;i++)k.line(g,Array.from({length:10},(_,j)=>point(s,(i/84*2-1)*halfW,j/9,.0006)),.00055,p.rib);
  for(let j=1;j<10;j++)k.line(g,Array.from({length:17},(_,i)=>point(s,(i/16*2-1)*halfW,j/10,.0003)),.0003,p.seam);
 }
 for(const s of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(-halfD,low);shape.lineTo(halfD,low);for(let i=0;i<=32;i++){const z=halfD-i/32*2*halfD;shape.lineTo(z,low+(h-.036)*Math.pow(1-Math.abs(z)/halfD,1.25));}shape.closePath();
  const face=k.mesh(g,new THREE.ShapeGeometry(shape),p.gable,s*halfW,0,0);face.rotation.y=s*Math.PI/2;p.gable.side=THREE.DoubleSide;
  const f=new THREE.Group();f.position.x=s*(halfW+.001);f.rotation.y=s*Math.PI/2;g.add(f);
  for(const direction of [-1,1])k.line(f,Array.from({length:25},(_,i)=>{const t=i/24;return[direction*halfD*.80*t,low+h*.20+Math.sin(t*Math.PI*2)*h*.04+(1-t)*h*.12,.001];}),.0011,p.gold);
  const medallion=k.mesh(f,new THREE.CircleGeometry(h*.07,16),p.gold,0,low+h*.25,.002);medallion.scale.y=1.5;
  for(const zsign of [-1,1])k.line(g,Array.from({length:17},(_,i)=>point(zsign,s*halfW,i/16,.002)),.0027,p.ridge);
 }
 k.line(g,[[-halfW-.008,y+h+.011,0],[0,y+h+.003,0],[halfW+.008,y+h+.011,0]],.0035,p.ridge);
 for(const s of [-1,1]){
  k.line(g,[[s*(halfW-.007),y+h+.004,0],[s*(halfW+.006),y+h+.014,0],[s*(halfW+.005),y+h+.032,0],[s*(halfW-.002),y+h+.027,0]],.005,p.ridge);
  for(const zz of [-1,1])for(let i=0;i<5;i++)k.cyl(g,.0014,.003,.006,p.ridge,s*(w*.49-i*.012),y+.012-i*.001,zz*(d*.48-i*.009),8);
 }
}

function arch(k,g,m,{w,h,d,x=0,z=0,y=.014,r=.052,spring=.066}){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();const hole=new THREE.Path();hole.moveTo(-r,0);hole.lineTo(-r,spring);hole.absarc(0,spring,r,Math.PI,0,true);hole.lineTo(r,0);hole.closePath();s.holes.push(hole);k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:24}),m,x,y,z-d/2);
}
function crenels(k,g,p,w,d,x,z,y=.214){
 for(const side of [-1,1]){k.box(g,w,.018,.014,p.stone,x,y+.009,z+side*d/2);const n=Math.ceil(w/.033);for(let j=0;j<=n;j++)k.box(g,.018,.023,.015,p.stone,x-w/2+j*w/n,y+.029,z+side*d/2);}
}
function parapet(k,g,p,pts,y){
 for(let i=0;i<pts.length-1;i++){
  const a=pts[i],b=pts[i+1],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const o=k.box(g,l+.001,.023,.013,p.stone,mid[0],y+.012,mid[1]);o.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);
  const n=Math.max(1,Math.round(l/.032));for(let j=0;j<n;j++){const t=j/n;const merlon=k.box(g,.019,.022,.015,p.stone,a[0]+(b[0]-a[0])*t,y+.033,a[1]+(b[1]-a[1])*t);merlon.rotation.y=o.rotation.y;}
 }
}
function timber(k,g,p,{w,d,y,h,bays=9}){
 k.box(g,w*.85,h-.006,d*.62,p.wood,0,y+(h-.006)/2,0);
 for(let side=0;side<4;side++){
  const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);const long=side%2===0,fw=long?w:d,fd=long?d:w,n=long?bays:3,room=long?w*.85:d*.62,back=(long?d*.62:w*.85)/2;
  for(let i=0;i<=n;i++){const x=(i/n-.5)*fw;k.cyl(f,.004,.005,h,p.wood,x,y+h/2,fd/2,8);for(let j=0;j<3;j++){k.box(f,.011+j*.006,.003,.010+j*.005,p.paint,x,y+h+j*.004,fd/2);}}
  k.box(f,fw,.016,.012,p.paint,0,y+h-.008,fd/2);for(const s of [-1,1])k.box(f,fw,.0013,.013,p.gold,0,y+h-.008+s*.006,fd/2+.001);
  for(let i=0;i<n;i++){const x=((i+.5)/n-.5)*room,pane=room/n*.76;k.box(f,pane,h*.67,.003,p.dark,x,y+h*.40,back+.001);for(let j=0;j<4;j++)k.box(f,.0015,h*.61,.003,p.wood,x+(j/3-.5)*pane,y+h*.40,back+.003);for(let j=0;j<3;j++)k.box(f,pane,.0015,.003,p.wood,x,y+h*(.15+j*.23),back+.003);k.ball(f,.006,p.red,((i+.5)/n-.5)*fw,y+h-.025,fd/2+.006);}
  for(const yy of [y+.008,y+.025])k.box(f,fw,.002,.003,p.wood,0,yy,fd/2+.008);for(let i=0;i<=n*4;i++)k.box(f,.0018,.022,.003,p.wood,(i/(n*4)-.5)*fw,y+.014,fd/2+.008);
 }
}
function arrows(k,g,p,w,h,x,z,y,rotate=0,cols=11,rows=4){
 const f=new THREE.Group();f.position.set(x,y,z);f.rotation.y=rotate;g.add(f);const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(w/2,h);sh.lineTo(-w/2,h);sh.closePath();
 for(let row=0;row<rows;row++)for(let i=0;i<cols;i++){
  const xx=((i+.5)/cols-.5)*w,yy=rows===1?(h-.023)/2:.021+row*(h-.045)/(rows-1),ww=w/cols*.38,hh=.023;const hole=new THREE.Path();hole.moveTo(xx-ww/2,yy);hole.lineTo(xx-ww/2,yy+hh);hole.lineTo(xx+ww/2,yy+hh);hole.lineTo(xx+ww/2,yy);hole.closePath();sh.holes.push(hole);k.box(f,ww,hh,.002,p.dark,xx,yy+hh/2,-.008);
 }
 k.mesh(f,new THREE.ExtrudeGeometry(sh,{depth:.012,bevelEnabled:false}),p.stone,0,0,-.006);
}
export function wall(k){
 const first=k.materials.length,g=new THREE.Group(),p={stone:k.mat('#96968b',.98),paving:k.mat('#b2b09b',.97),wood:k.mat('#4a3e32'),paint:k.mat('#355757'),gold:k.mat('#a89359'),blue:k.mat('#3f5860'),dark:k.mat('#2c302b'),tile:k.mat('#464c46'),rib:k.mat('#62675e'),seam:k.mat('#3e453f'),ridge:k.mat('#72766a'),gable:k.mat('#4b463b'),red:k.mat('#af4335'),water:k.mat('#4c756a',.55,.08),green:k.mat('#687c50')};
 p.stone.onBeforeCompile=s=>{s.vertexShader='varying vec3 wallBrick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwallBrick=position;');s.fragmentShader='varying vec3 wallBrick;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float course=floor(wallBrick.y*155.0);float seam=step(.06,fract(wallBrick.y*155.0))*step(.035,fract((wallBrick.x+wallBrick.z)*68.0+mod(course,2.0)*.5));diffuseColor.rgb*=mix(.87,1.0,seam);`);};p.stone.customProgramCacheKey=()=> 'yongning-brick-v1';
 for(const [name,m]of Object.entries(p))m.userData.night={color:new THREE.Color('#e7c58d'),intensity:name==='stone'?.12:name==='tile'?.015:.045};
 p.edge=k.mat('#9e9a73');p.edge.userData.night={color:new THREE.Color('#ffd080'),intensity:.72};
 const pos=[],idx=[],N=128,R=24;for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const rr=j/R,a=i/N*Math.PI*2,x=.91*rr*Math.cos(a),z=1.03*rr*Math.sin(a),sag=2.15-Math.sqrt(2.15**2-x*x-z*z);pos.push(x,.014-sag*THREE.MathUtils.smoothstep(rr,.87,1),z);}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)idx.push(a,a+1,b);idx.push(a+1,b+1,b);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,p.paving);
 // The north city tower stands on the main wall; its arch remains a real passage.
 arch(k,g,p.stone,{w:1.54,h:.20,d:.24,z:-.40,r:.055,spring:.072});k.box(g,1.56,.010,.25,p.stone,0,.219,-.40);crenels(k,g,p,1.56,.24,0,-.40,.224);
 const main=new THREE.Group();main.position.z=-.40;g.add(main);
 timber(k,main,p,{w:.66,d:.28,y:.228,h:.105});roofSkirt(k,main,p,{w:.82,d:.40,y:.348,h:.035,inner:.72});
 timber(k,main,p,{w:.58,d:.25,y:.382,h:.084});roofSkirt(k,main,p,{w:.74,d:.36,y:.482,h:.030,inner:.74});
 timber(k,main,p,{w:.51,d:.22,y:.511,h:.030});gableRoof(k,main,p,{w:.66,d:.33,y:.555,h:.080});
 // A pair of stairs climbs along the inner (north) face, into wall-top landings.
 for(const side of [-1,1]){for(let i=0;i<21;i++){const h=(i+1)*.010;k.box(g,.024,h,.10,p.stone,side*(.205+i*.023),.014+h/2,-.57);}k.box(g,.085,.210,.12,p.stone,side*.715,.119,-.57);const rail=[];for(let i=0;i<=10;i++){const x=side*(.205+i*.046),y=.024+i*.020;k.box(g,.004,.032,.004,p.stone,x,y+.016,-.625);rail.push([x,y+.032,-.625]);}k.line(g,rail,.003,p.stone);}
 // Square barbican: its side gate is offset from the city gate for defense.
 for(const side of [-1,1]){const f=new THREE.Group();f.position.set(side*.49,0,-.09);f.rotation.y=Math.PI/2;g.add(f);arch(k,f,p.stone,{w:.62,h:.19,d:.11,r:.044,spring:.066});crenels(k,f,p,.62,.11,0,0,.204);}
 k.box(g,.99,.19,.22,p.stone,0,.109,.22);for(const side of [-1,1])crenels(k,g,p,.17,.22,side*.41,.22,.204);
 // Arrow tower faces outward with four rows of recessed arrow windows.
 const arrow=new THREE.Group();arrow.position.z=.22;g.add(arrow);arrows(k,arrow,p,.63,.215,0,.12,.210);arrows(k,arrow,p,.24,.215,-.315,0,.210,-Math.PI/2,4);arrows(k,arrow,p,.24,.215,.315,0,.210,Math.PI/2,4);
 k.box(arrow,.61,.215,.012,p.wood,0,.3175,-.12);for(let i=0;i<11;i++){const x=(i/10-.5)*.60;k.box(arrow,.003,.20,.004,p.paint,x,.314,-.129);if(i<10)k.box(arrow,.042,.066,.002,p.dark,x+.03,.354,-.128);}strip(k,arrow,p.tile,(u,t)=>[(u*2-1)*(.31+.045*t),.336+.028*(1-t)**1.4,-.12-.07*t],12,48);k.line(arrow,[[-.355,.336,-.19],[0,.336,-.19],[.355,.336,-.19]],.002,p.edge);gableRoof(k,arrow,p,{w:.73,d:.34,y:.439,h:.076});
 // The moon enclosure curves around the outer gate and opens onto a stone bridge.
 for(const side of [-1,1]){const o=k.box(g,.14,.14,.10,p.stone,side*.55,.084,.235);o.rotation.y=-side*.22;}
 const arc=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI;arc.push([Math.cos(a)*.62,.25+Math.sin(a)*.37]);}
 for(const [start,end]of [[0,Math.acos(.12/.62)],[Math.acos(-.12/.62),Math.PI]]){
  const sh=new THREE.Shape(),n=40;for(let i=0;i<=n;i++){const a=start+(end-start)*i/n,x=.67*Math.cos(a),z=.25+.42*Math.sin(a);if(i===0)sh.moveTo(x,-z);else sh.lineTo(x,-z);}for(let i=n;i>=0;i--){const a=start+(end-start)*i/n;sh.lineTo(.57*Math.cos(a),-(.25+.32*Math.sin(a)));}sh.closePath();const mesh=k.mesh(g,new THREE.ExtrudeGeometry(sh,{depth:.14,bevelEnabled:false,curveSegments:40}),p.stone,0,.014,0);mesh.rotation.x=-Math.PI/2;
  const pts=Array.from({length:28},(_,i)=>{const a=start+(end-start)*i/27;return[.62*Math.cos(a),.25+.37*Math.sin(a)];});parapet(k,g,p,pts,.154);
 }
 for(const side of [-1,1]){
  k.box(g,.10,.003,.14,p.green,side*.40,.016,.40);
  for(const z of [.35,.46]){k.cyl(g,.004,.006,.065,p.wood,side*.40,.047,z,7);const crown=k.ball(g,.028,p.green,side*.40,.09,z);crown.scale.y=1.25;k.ball(g,.019,p.green,side*.42,.10,z+.012);}
 }

 arch(k,g,p.stone,{w:.26,h:.14,d:.18,z:.62,r:.048,spring:.06});const outer=new THREE.Group();outer.position.z=.62;g.add(outer);arrows(k,outer,p,.19,.075,0,.06,.158,0,5,1);k.box(outer,.18,.075,.09,p.wood,0,.195,0);gableRoof(k,outer,p,{w:.29,d:.19,y:.247,h:.055});
 for(const side of [-1,1]){k.box(g,.57,.003,.105,p.water,side*.395,.016,.755);k.box(g,.57,.012,.012,p.stone,side*.395,.023,.812);}
 k.box(g,.21,.016,.27,p.stone,0,.030,.79);for(const side of [-1,1]){k.box(g,.007,.025,.27,p.stone,side*.105,.047,.79);for(let i=0;i<8;i++)k.box(g,.009,.033,.009,p.stone,side*.105,.05,.67+i*.035);}
 // Lanterns line the walkways, with gentle independent courtyard-light variation.
 for(const side of [-1,1])for(let i=0;i<8;i++){const x=side*.444,z=-.35+i*.068;k.cyl(g,.0015,.002,.07,p.wood,x,.254,z,6);k.ball(g,.006,p.red,x,.286,z);}
 for(let i=0;i<4;i++){const x=(i<2?-1:1)*.34,z=i%2?.53:-.63,m=k.mat('#c5ae79',.7,0,'#ffd298');m.userData.night.intensity=.70;m.userData.pulse={speed:.65+i*.08,phase:i*1.8};k.cyl(g,.002,.003,.05,p.wood,x,.039,z,6);k.ball(g,.005,m,x,.067,z);}
 k.materials.slice(first).forEach(m=>m.userData.wallRigid=true);g.userData={barbican:true,mainEaves:3,arrowRows:4,moonEnclosure:true};return k.merge(g);
}
