import * as THREE from 'three';


function patch(k,g,m,fn,nu=40,nv=16){
 const p=[],ix=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)p.push(...fn(i/nu,j/nv));
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;ix.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();m.side=THREE.DoubleSide;k.mesh(g,geo,m);
}
function tangRoof(k,g,p,w,d,y,h){
 const ridge=Math.max(.01,w/2-d*.35),point=(sign,u,t,lift=0)=>{
  const x=(u*2-1)*(ridge+(w/2-ridge)*t);return[x,y+h*(1-t)**1.45+.012*t**6*Math.abs(u*2-1)**7+lift,sign*d/2*t];
 };
 for(const sign of [-1,1]){
  patch(k,g,p.tile,(u,t)=>point(sign,u,t));
  const count=Math.max(28,Math.ceil(w/.009));for(let i=0;i<=count;i++)k.line(g,Array.from({length:10},(_,j)=>point(sign,i/count,j/9,.0008)),.0008,p.rib);
  for(let j=1;j<10;j++)k.line(g,Array.from({length:21},(_,i)=>point(sign,i/20,j/10,.0003)),.00035,p.seam);
  k.line(g,Array.from({length:41},(_,i)=>point(sign,i/40,1,.002)),.0025,p.edge);
  patch(k,g,p.tile,(u,t)=>[sign*(ridge+(w/2-ridge)*t),y+h*(1-t)**1.45+.012*t**6*Math.abs(u*2-1)**7,(u*2-1)*d/2*t],24,16);
  for(let i=0;i<=28;i++)k.line(g,Array.from({length:10},(_,j)=>{const t=j/9,u=i/28*2-1;return[sign*(ridge+(w/2-ridge)*t),y+h*(1-t)**1.45+.012*t**6*Math.abs(u)**7+.0008,u*d/2*t];}),.0008,p.rib);
  k.line(g,[[sign*ridge,y+h+.002,0],[sign*(ridge+.011),y+h+.022,0],[sign*(ridge+.007),y+h+.035,0],[sign*(ridge-.008),y+h+.034,0]],.005,p.rib);
 }
 k.line(g,[[-ridge,y+h+.003,0],[0,y+h+.001,0],[ridge,y+h+.003,0]],.004,p.rib);
}
function brackets(k,g,p,w,z,y,count){
 for(let i=0;i<count;i++){
  const x=(i/(count-1)-.5)*w;
  for(let j=0;j<3;j++){k.box(g,.014+j*.008,.004,.012+j*.007,p.stone,x,y+j*.005,z);k.box(g,.006,.005,.023+j*.008,p.cap,x,y+j*.005+.002,z);}
 }
}
function hall(k,g,p,{x=0,z=0,w=.30,d=.25,h=.18,base=.018,upper=false,bays=5,passage=false}){
 const f=new THREE.Group();f.position.set(x,base,z);g.add(f);k.box(f,w+.018,.012,d+.02,p.stone,0,.006,0);
 const iw=w*.82,id=d*.63;
 if(passage){for(const s of [-1,1])k.box(f,iw*.30,h-.025,id,p.wall,s*iw*.35,(h-.025)/2+.012,0);}
 else k.box(f,iw,h-.025,id,p.wall,0,(h-.025)/2+.012,-.012);
 for(const s of [-1,1]){
  for(let i=0;i<=bays;i++){const xx=(i/bays-.5)*w*.92;k.cyl(f,.006,.007,h,p.stone,xx,h/2+.012,s*d*.43,10);k.cyl(f,.009,.010,.008,p.cap,xx,.016,s*d*.43,10);}
  k.box(f,w*.94,.015,.015,p.cap,0,h+.002,s*d*.43);brackets(k,f,p,w*.92,s*d*.43,h+.012,bays+1);
  for(let i=0;i<bays;i++)k.box(f,w*.62/bays,.0025,.007,p.lamp,((i+.5)/bays-.5)*w*.92,h-.007,s*d*.39);
  for(let i=0;i<bays;i++){
   const xx=((i+.5)/bays-.5)*iw;if(passage&&Math.abs(xx)<iw*.2)continue;
   const ww=iw/bays*.82;k.box(f,ww,h*.70,.003,p.glass,xx,h*.46,s*id*.51-.012);
   for(let j=0;j<4;j++)k.box(f,.0018,h*.66,.002,p.frame,xx+(j/3-.5)*ww,h*.46,s*id*.51-.012+s*.002);
   k.box(f,ww,.002,.003,p.frame,xx,h*.41,s*id*.51-.012+s*.002);
  }
 }
 if(upper){
  // The smaller roof rises over a low perimeter canopy, not a duplicate pavilion.
  tangRoof(k,f,p,w*1.20,d*1.20,h+.030,.035);k.box(f,w*.80,.050,d*.64,p.wall,0,h+.065,0);
  for(const s of [-1,1]){k.box(f,w*.78,.018,.003,p.glass,0,h+.068,s*d*.322);for(let i=0;i<15;i++)k.box(f,.003,.025,.004,p.frame,(i/14-.5)*w*.76,h+.068,s*d*.325);}
  tangRoof(k,f,p,w*1.06,d*1.03,h+.100,w*.15);
 }else tangRoof(k,f,p,w*1.22,d*1.22,h+.030,w*.17);
 return f;
}
function stoneSign(k,g,w,h,x,y,z){
 if(typeof document==='undefined')return;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#b8b9a9';c.fillRect(0,0,1024,128);c.font='74px "KaiTi", "Microsoft YaHei", serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#957739';c.fillText('陕西历史博物馆',512,68,970);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,roughness:.93});material.userData.night={color:new THREE.Color('#e3d0aa'),intensity:.10};k.materials.push(material);k.mesh(g,new THREE.PlaneGeometry(w,h),material,x,y,z);
}
function cedar(k,g,p,x,z,size){
 k.cyl(g,.006,.011,size,p.trunk,x,.018+size*.45,z,8);
 for(let j=0;j<5;j++){const yy=.018+size*(.42+j*.14),r=size*(.42-j*.065);k.mesh(g,new THREE.ConeGeometry(r,size*.35,9),p.leaf,x,yy,z);}
}
export function historyMuseum(k){
 const first=k.materials.length,g=new THREE.Group(),p={wall:k.mat('#d0cfb8'),stone:k.mat('#c6c6b0'),cap:k.mat('#aaa995'),tile:k.mat('#414d4d'),rib:k.mat('#5e6865'),seam:k.mat('#384443'),edge:k.mat('#c1c2a9'),frame:k.mat('#726c55'),glass:k.mat('#354d49',.37,.16),water:k.mat('#496e66',.35,.12),ground:k.mat('#b8b69f'),lawn:k.mat('#84906b'),leaf:k.mat('#526c50'),trunk:k.mat('#696457')};
 for(const [key,m]of Object.entries(p))m.userData.night={color:new THREE.Color(key==='leaf'?'#64815c':key==='water'?'#667d75':'#f3d3a0'),intensity:key==='glass'?.17:key==='tile'?.020:key==='ground'?.025:.045};
 p.lamp=k.mat('#c9bc9d',.8,0,'#ffd29a');p.lamp.userData.night.intensity=.78;
 const positions=[],indices=[],N=128,R=24;
 for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const rr=j/R,a=i/N*Math.PI*2,x=.83*rr*Math.cos(a),z=.86*rr*Math.sin(a),sag=2.15-Math.sqrt(2.15**2-x*x-z*z);positions.push(x,.012-sag*THREE.MathUtils.smoothstep(rr,.88,1),z);}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)indices.push(a,a+1,b);indices.push(a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();k.mesh(g,geo,p.ground);
 // Main exhibition hall and a separate front gate enclose the open forecourt.
 hall(k,g,p,{z:-.20,w:.64,d:.36,h:.205,base:.083,upper:true,bays:10});
 k.box(g,.70,.082,.42,p.stone,0,.054,-.20);
 for(let i=0;i<10;i++)k.box(g,.32,.0082*(i+1),.017,p.stone,0,.013+.0041*(i+1),.19-i*.016);
 k.box(g,.32,.082,.040,p.stone,0,.054,.027);
 for(const s of [-1,1]){
  const rail=[];for(let j=0;j<7;j++){const z=.19-j*.024,y=.0212+j*.0123;k.cyl(g,.003,.004,.030,p.stone,s*.174,y+.015,z,8);rail.push([s*.174,y+.030,z]);}
  k.line(g,rail,.003,p.stone);
 }
 hall(k,g,p,{z:-.60,w:.43,d:.22,h:.24,base:.018,upper:false,bays:8});
 hall(k,g,p,{z:.40,w:.40,d:.19,h:.115,base:.018,bays:5,passage:true});
 for(const x of [-.54,.54]){
  for(const z of [-.49,.35])hall(k,g,p,{x,z,w:.25,d:.25,h:.14,base:.018,upper:true,bays:4});
  k.box(g,.22,.135,.68,p.wall,x,.080,-.055);k.box(g,.235,.010,.69,p.tile,x,.152,-.055);
  const col=new THREE.Group();col.position.set(x,0,-.05);g.add(col);
  for(let i=0;i<13;i++){const z=(i/12-.5)*.60;k.cyl(col,.004,.005,.12,p.stone,-Math.sign(x)*.14,.078,z,8);k.box(col,.025,.008,.027,p.cap,-Math.sign(x)*.14,.141,z);}
  k.box(col,.19,.008,.65,p.tile,-Math.sign(x)*.06,.151,0);
  for(const z of [-.20,.17]){k.box(g,.17,.002,.20,p.lawn,Math.sign(x)*.28,.015,z);}
 }
 // Front reflecting pool, low stone sign and side approach paths.
 k.box(g,.47,.004,.17,p.water,0,.018,.67);
 for(const s of [-1,1]){k.box(g,.014,.014,.19,p.stone,s*.242,.020,.67);k.box(g,.50,.014,.013,p.stone,0,.020,.67+s*.091);}
 k.box(g,.31,.014,.085,p.stone,0,.023,.58);k.box(g,.29,.060,.024,p.stone,0,.060,.58);stoneSign(k,g,.275,.033,0,.064,.5925);
 for(const x of [-.28,.28]){k.box(g,.026,.045,.026,p.stone,x,.043,.47);k.box(g,.050,.008,.050,p.cap,x,.067,.47);k.cyl(g,.020,.026,.023,p.stone,x,.083,.47,4);}
 for(const x of [-.67,.67])for(const z of [-.30,0,.30])cedar(k,g,p,x,z,.16);
 for(const x of [-.32,.32])for(const z of [.68,-.67])cedar(k,g,p,x,z,.13);
 for(const [x,z]of [[-.20,.22],[.20,.22],[-.36,.49],[.36,.49]]){
  k.box(g,.018,.035,.018,p.cap,x,.030,z);k.box(g,.015,.009,.015,p.lamp,x,.049,z);k.box(g,.021,.003,.021,p.stone,x,.055,z);
 }
 for(const m of k.materials.slice(first))m.userData.museumRigid=true;
 g.userData={openPortico:true,separateGate:true,cornerPavilions:4};return k.merge(g);
}
