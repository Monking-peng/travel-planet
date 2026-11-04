import * as THREE from 'three';
import {palette,site,disc,finish,sea,lit,skin} from './tianjin-kit.js';

// COX's paired exhibition shells and glazed arrival hall, reduced to one module.
export function maritime(k){
 const g=new THREE.Group(),p=palette(k);const groundHeight=site(k,g,.77,.64);
 const waterPositions=[],waterIndex=[],rows=36,cols=72;for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const x=-.745+1.49*i/cols,limit=.63*Math.sqrt(Math.max(0,1-(x/.76)**2)),shore=-.22+.065*Math.cos(x*5),z=-limit+(Math.max(-limit,shore)+limit)*j/rows;waterPositions.push(x,.026,z);}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;waterIndex.push(a,b,a+1,a+1,b,b+1);}const waterGeometry=new THREE.BufferGeometry();waterGeometry.setAttribute('position',new THREE.Float32BufferAttribute(waterPositions,3));waterGeometry.setIndex(waterIndex);waterGeometry.computeVertexNormals();p.water.side=THREE.DoubleSide;p.water.userData.landscape=true;p.water.userData.water=true;k.mesh(g,waterGeometry,p.water);
 const stone=k.mat('#b8bcb0',.94),paving=k.mat('#c4c6bb',.94),white=lit(k,'#d8dbd4',.035),inner=lit(k,'#7b8584',.09),glass=lit(k,'#3d5b64',.075,'#c6d9d9'),frame=k.mat('#a6b0ac',.68,.13),dark=k.mat('#3c5558',.80),warm=lit(k,'#e0ceab',.48);
 white.userData.maritimeShell=true;paving.userData.maritimePaving=true;glass.userData.maritimeGlass=true;
 // Land follows the quay; only the tips project over water.
 const land=new THREE.Shape();land.moveTo(-.67,-.13);land.lineTo(-.52,-.29);land.lineTo(-.34,-.43);land.lineTo(-.11,-.29);land.lineTo(.12,-.29);land.lineTo(.29,-.43);land.lineTo(.57,-.26);land.lineTo(.68,-.10);land.quadraticCurveTo(.65,.36,.38,.47);land.lineTo(.18,.46);land.lineTo(.15,.417);land.lineTo(-.15,.417);land.lineTo(-.18,.46);land.quadraticCurveTo(-.63,.39,-.67,-.13);
 function flatShape(shape){const geo=new THREE.ShapeGeometry(shape,48);geo.rotateX(Math.PI/2);const a=geo.index.array;for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];geo.computeVertexNormals();return geo;}
 const ground=flatShape(land);k.mesh(g,ground,paving,0,.036,0);
 for(let i=0;i<18;i++){const z=.589-i*.009,low=groundHeight(0,z+.005),top=Math.max(groundHeight(0,z-.005)+.0015,THREE.MathUtils.lerp(groundHeight(0,.594)+.002,.036,(i+1)/18));k.box(g,.27,top-low+.002,.010,paving,0,(top+low-.002)/2,z);}
 k.box(g,.29,.004,.105,paving,0,.034,.386);
 // Subtle paving joints stop at the plaza perimeter.
 for(let i=-5;i<=5;i++)k.box(g,.001,.0006,.13,stone,i*.065,.0364,.345);
 for(const z of [.30,.35,.40])k.box(g,.72,.0006,.001,stone,0,.0364,z);
 const outline=[[-.77,0],[-1,.18],[-.94,.40],[-.60,.98],[.48,1],[.91,.46],[1,.20],[.78,0]];
 const profile={getPoint(v){const f=v*outline.length,i=Math.floor(f),t=f-i,a=outline[i%outline.length],b=outline[(i+1)%outline.length];return {x:a[0]+(b[0]-a[0])*t,y:(a[1]+(b[1]-a[1])*t)*.88};}};
 const wings=[{a:-.36,b:-.46,L:.61,w:.145,h:.135,z:.29},{a:-.17,b:-.29,L:.80,w:.185,h:.185,z:.37},{a:.17,b:.29,L:.80,w:.19,h:.190,z:.38},{a:.38,b:.51,L:.61,w:.15,h:.14,z:.29},{a:-.45,b:-.64,L:.30,w:.12,h:.12,z:.09}];
 const shapes=[];
 for(let n=0;n<wings.length;n++){
  const s=wings[n],bend=n===4?-.045:(s.a<0?.052:-.052),cx=t=>THREE.MathUtils.lerp(s.a,s.b,t)+bend*Math.sin(t*Math.PI),zz=t=>s.z-s.L*t,yy=t=>.075+.012*t+.008*Math.sin(Math.PI*t),hh=t=>s.h*(1-.13*Math.sin(Math.PI*t)),ww=t=>s.w*(1-.10*Math.sin(Math.PI*t));
  const point=(t,v,shrink=1)=>{const q=profile.getPoint(v%1);let bottom=0;if(n!==4&&q.y<.32){const cut=Math.max(Math.exp(-(((t-.42)/.11)**4))*.057,Math.exp(-(((t-.75)/.055)**4))*.073);bottom=cut*(1-q.y/.32);}
   return [cx(t)+q.x*ww(t)/2*shrink,yy(t)+q.y*hh(t)*shrink+bottom,zz(t)];};
  skin(k,g,(t,v)=>point(t,v),64,64,white);
  // Sides expose dark recessed glazing beneath the folded metal envelope.
  for(const side of [-1,1]){
   skin(k,g,(t,v)=>[cx(t)+side*ww(t)*.435,.037+v*.095,zz(t)],2,48,glass);
   for(let j=0;j<=24;j++){const t=j/24;k.box(g,.0016,.095,.002,frame,cx(t)+side*ww(t)*.438,.0845,zz(t));}
  }
  for(const t of [0,1]){
   const contour=Array.from({length:64},(_,i)=>point(t,i/64)),z=zz(t)+(t? .008:-.008),shape=new THREE.Shape();contour.forEach((v,i)=>i?shape.lineTo(v[0],v[1]):shape.moveTo(v[0],v[1]));shape.closePath();
   const geo=new THREE.ShapeGeometry(shape,16);k.mesh(g,geo,glass,0,0,z);
   k.line(g,contour,.0033,white,true);
   k.line(g,contour.map(v=>[cx(t)+(v[0]-cx(t))*.93,yy(t)+(v[1]-yy(t))*.94,z]),.0018,frame,true);
   for(let j=1;j<=5;j++){const y=yy(t)+hh(t)*j/6,w=ww(t)*(j===5?.66:.81);k.box(g,w,.0015,.0015,frame,cx(t),y,z);}
   for(let j=-2;j<=2;j++)k.box(g,.0015,hh(t)*.68,.0015,frame,cx(t)+j*ww(t)*.14,yy(t)+hh(t)*.43,z);
   // Three deep horizontal soffit bands create the actual recessed entrances.
   if(t===0)for(let j=0;j<3;j++)k.box(g,ww(t)*(.75-j*.10),.002,.028,inner,cx(t),yy(t)+hh(t)*(.63-j*.14),zz(t)-.018);
  }
  for(let j=1;j<44;j++){const t=j/44;k.line(g,Array.from({length:43},(_,i)=>{const q=point(t,.05+.90*i/42);q[1]+=.0002;return q;}),.00023,frame);}
  for(const v of [.12,.27,.42,.58,.72,.87])k.line(g,Array.from({length:45},(_,j)=>point(j/44,v)),.00022,frame);
  for(const t of [.20,.58,.87])k.box(g,s.w*.47,.042,.037,stone,cx(t),.057,zz(t));
  shapes.push({cx,zz,yy,hh,ww,s});
 }
 // Pairwise clerestories, not open water gaps between every wing.
 for(const [l,r]of [[0,1],[2,3]]){
  const a=shapes[l],b=shapes[r],z0=.245,z1=-.255,at=(q,z)=>Math.max(0,Math.min(1,(q.s.z-z)/q.s.L));
  const pt=(u,v)=>{const z=z0+(z1-z0)*u,ta=at(a,z),tb=at(b,z),x0=a.cx(ta)+a.ww(ta)*.44,x1=b.cx(tb)-b.ww(tb)*.44;return [x0+(x1-x0)*v,.153+.009*Math.sin(Math.PI*v),z];};
  skin(k,g,pt,8,32,glass);for(let j=0;j<=24;j++)k.line(g,[pt(j/24,0),pt(j/24,1)],.0012,frame);
  for(const v of [.25,.5,.75])k.line(g,Array.from({length:25},(_,j)=>pt(j/24,v)),.00065,frame);
 }
 const roof=(u,v)=>{const z=.29-u*.50,w=.168+.05*u;return [(v-.5)*w,.172+.039*Math.sin(Math.PI*v),z];};
 skin(k,g,roof,24,32,glass);for(let j=0;j<=22;j++)k.line(g,Array.from({length:17},(_,i)=>roof(j/22,i/16)),.0022,white);
 for(const v of [.2,.4,.6,.8])k.line(g,Array.from({length:24},(_,j)=>roof(j/23,v)),.0007,frame);
 k.box(g,.17,.108,.006,glass,0,.096,.285);for(let i=-4;i<=4;i++)k.box(g,.002,.108,.008,frame,i*.019,.096,.290);
 k.box(g,.20,.009,.08,white,0,.157,.31);k.box(g,.07,.072,.005,dark,0,.072,.293);
 // Quays and two narrow piers echo the photographed harbor edge.
 for(const [x,z,endx,endz]of [[-.15,-.29,-.17,-.59],[.37,-.36,.48,-.55]]){
  const dx=endx-x,dz=endz-z,L=Math.hypot(dx,dz),m=k.box(g,.026,.015,L,inner,(x+endx)/2,.032,(z+endz)/2);m.rotation.y=Math.atan2(dx,dz);
  for(let i=1;i<7;i++){const t=i/7;k.cyl(g,.002,.002,.035,dark,x+dx*t,.023,z+dz*t,6);}
 }
 for(const x of [-.55,.55]){const shape=new THREE.Shape();shape.moveTo(x-.06,.22);shape.quadraticCurveTo(x,.10,x+.025,.02);shape.lineTo(x+.065,.15);shape.lineTo(x+.03,.29);shape.closePath();const geo=flatShape(shape);k.mesh(g,geo,p.leaf,0,.037,0);}
 for(const x of [-.39,-.12,.12,.39])k.box(g,.025,.001,.004,warm,x,.037,.32);
 return finish(k,g,{lamps:[[-.32,.036,.40],[.32,.036,.40]],visitors:[[-.10,.036,.36],[.08,.036,.40],[-.20,.036,.30],[.22,.036,.29]]});
}
