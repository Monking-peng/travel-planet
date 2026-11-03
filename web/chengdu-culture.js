import * as THREE from 'three';
import {TAU,palette,site,pond,paving,steps,grove,skin,glow,disc,finish} from './chengdu-kit.js';

// A geometric interpretation of the four birds and twelve rays; no photo texture.
function birdBand(k,g,inner,outer,y,material){
 for(let i=0;i<12;i++){const a=i/12*TAU,shape=new THREE.Shape();shape.moveTo(Math.sin(a)*inner,Math.cos(a)*inner);shape.quadraticCurveTo(Math.sin(a+.22)*outer*.90,Math.cos(a+.22)*outer*.90,Math.sin(a+.32)*outer,Math.cos(a+.32)*outer);shape.lineTo(Math.sin(a+.38)*inner,Math.cos(a+.38)*inner);shape.closePath();const geo=new THREE.ShapeGeometry(shape,16);geo.rotateX(-Math.PI/2);k.mesh(g,geo,material,0,y,0);}
 for(let i=0;i<4;i++){
  const a=i/4*TAU,r=outer*1.13,pts=[];for(let j=0;j<=28;j++){const t=j/28,aa=a-.17+t*1.14,rr=r+outer*.10*Math.sin(t*Math.PI*2);pts.push([Math.sin(aa)*rr,y,Math.cos(aa)*rr]);}k.line(g,pts,outer*.018,material);
  const head=a+.93;const neck=[];for(let j=0;j<=20;j++){const t=j/20,aa=head+t*TAU*1.15,rr=outer*.11*(1-.65*t);neck.push([Math.sin(head)*r+Math.sin(aa)*rr,y,Math.cos(head)*r+Math.cos(aa)*rr]);}k.line(g,neck,outer*.015,material);
  const wing=new THREE.Shape();for(const [j,rr,aa]of [[0,r,a+.50],[1,r+outer*.23,a+.15],[2,r+outer*.07,a+.73],[3,r,a+.83]]){const x=Math.sin(aa)*rr,z=Math.cos(aa)*rr;if(j===0)wing.moveTo(x,z);else wing.lineTo(x,z);}wing.closePath();const geo=new THREE.ShapeGeometry(wing);geo.rotateX(-Math.PI/2);k.mesh(g,geo,material,0,y,0);
 }
}
export function jinsha(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.74,.62);paving(k,g,p,.57,.49);
 const stone=k.mat('#d1cdbb',.93),seam=k.mat('#aaa99c',.9),glass=k.mat('#536d70',.37,.3),warm=glow(k,'#e8be7e',.63,.9,.4);
 const roofY=z=>.18-.27*z;
 const shape=new THREE.Shape();shape.moveTo(-.47,-.32);shape.lineTo(.47,-.32);shape.lineTo(.47,.32);shape.lineTo(-.47,.32);shape.closePath();
 const eye=new THREE.Path();eye.absarc(0,-.025,.083,0,TAU,true);shape.holes.push(eye);
 for(const x of [-.29,-.15,.20,.34]){const h=new THREE.Path();h.moveTo(x,-.29);h.lineTo(x+.026,-.29);h.lineTo(x+.026,-.13);h.lineTo(x,-.13);h.closePath();shape.holes.push(h);}
 const cut=new THREE.Path();cut.moveTo(.052,.062);cut.lineTo(.092,.062);cut.lineTo(.22,.275);cut.lineTo(.18,.275);cut.closePath();shape.holes.push(cut);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:false,curveSegments:64}),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getY(i),depth=pos.getZ(i);pos.setXYZ(i,x,roofY(z)-depth,z);}geo.computeVertexNormals();stone.userData.jinshaRoof=true;k.mesh(g,geo,stone);
 for(const x of [-.47,.47]){const s=new THREE.Shape();s.moveTo(-.32,.023);s.lineTo(.32,.023);s.lineTo(.32,roofY(.32)-.012);s.lineTo(-.32,roofY(-.32)-.012);s.closePath();const o=k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.015,bevelEnabled:false}),stone,x,0,0);o.rotation.y=Math.PI/2;}
 k.box(g,.94,roofY(-.32)-.033,.012,stone,0,(roofY(-.32)+.013)/2,-.314);
 k.box(g,.94,.067,.012,glass,0,.056,.305);
 for(let i=0;i<14;i++)k.box(g,.002,.065,.007,seam,-.44+i*.88/13,.056,.316);
 for(const side of [-1,1])k.box(g,.27,.068,.025,stone,side*.33,.056,.31);
 // Dark glass sits below the circular recess and long slots; all cutouts are real.
 const glassRoof=glass.clone();k.materials.push(glassRoof);glassRoof.userData.night={color:new THREE.Color('#dfc18b'),intensity:.25};
 skin(k,g,(u,v)=>{const a=u*TAU,r=v*.083,x=Math.sin(a)*r,z=-.025+Math.cos(a)*r;return [x,roofY(z)-.018,z];},16,64,glassRoof);
 for(const x of [-.29,-.15,.20,.34]){const o=k.box(g,.027,.005,.17,glass,x+.013,roofY(-.21)-.015,-.21);o.rotation.x=Math.atan(.27);}
 const slot=k.box(g,.04,.007,.253,glass,.136,roofY(.17)-.020,.17);slot.rotation.y=.54;slot.rotation.x=Math.atan(.27);
 for(let i=0;i<=22;i++){const x=-.47+i*.94/22;k.line(g,[[x,roofY(-.32)+.0006,-.32],[x,roofY(.32)+.0006,.32]],.00035,seam);}
 for(let i=0;i<=16;i++){const z=-.32+i*.64/16;k.line(g,[[-.47,roofY(z)+.0006,z],[.47,roofY(z)+.0006,z]],.00035,seam);}
 steps(k,g,p,0,.43,.30,5,.020,.08);k.box(g,.22,.004,.28,p.pale,0,.026,.47);
 // The emblem is presented on its own low monument, not pasted across the roof.
 const emblem=new THREE.Group();birdBand(k,emblem,.041,.063,0,p.gold);k.ring(emblem,.092,.002,p.gold,0);emblem.rotation.x=Math.PI/2;emblem.position.set(-.33,.137,.41);g.add(emblem);k.box(g,.12,.035,.07,p.stone,-.33,.04,.41);k.cyl(g,.004,.006,.055,p.gold,-.33,.079,.41,8);
 grove(k,g,height,[[-.59,-.16,.16],[.59,-.18,.15],[-.38,-.47,.17],[.28,-.48,.16]]);
 k.box(g,.36,.002,.004,warm,0,.089,.326);
 return finish(k,g,{lamps:[[-.16,.40],[.16,.40]],visitors:[[.03,.42],[-.06,.46]]});
}

export function dongan(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.77,.70);paving(k,g,p,.63,.60);
 const roofMat=k.mat('#d7d4c2',.51,.29),glass=k.mat('#5f7d83',.33,.31),frame=k.mat('#9da9aa',.48,.32),blue=glow(k,'#689cae',.55,.4,.43),gold=k.mat('#9d7136',.64,.24),seat=k.mat('#91a5ad',.83),field=k.mat('#556d5b',.97);
 roofMat.userData.night={color:new THREE.Color('#f1b95c'),intensity:.61};roofMat.userData.pulse={phase:.9,speed:.33};glass.userData.night={color:new THREE.Color('#7db2cd'),intensity:.18};gold.userData.night={color:new THREE.Color('#916229'),intensity:.09};
 // A low, truly open circular bowl, with an elliptical interior opening.
 function roofPoint(u,v){const a=u*TAU,innerX=.30,innerZ=.245,x=Math.sin(a)*(innerX+(.525-innerX)*v),z=Math.cos(a)*(innerZ+(.525-innerZ)*v),y=.183+.045*Math.sin(v*Math.PI)+.018*Math.sin(a)**2;return [x,y,z];}
 skin(k,g,roofPoint,24,240,roofMat);roofMat.userData.stadiumRoof=true;roofMat.userData.preserveSmooth=true;
 skin(k,g,(u,v)=>{const a=u*TAU,r=.483+.04*Math.sin(v*Math.PI);return [r*Math.sin(a),.052+v*.128,r*Math.cos(a)];},14,180,glass);
 for(let i=0;i<120;i++){const a=i/120*TAU;k.line(g,Array.from({length:10},(_,j)=>{const v=j/9,r=.483+.04*Math.sin(v*Math.PI);return [r*Math.sin(a),.052+v*.128,r*Math.cos(a)];}),.0014,frame);}
 for(const y of [.066,.090,.119,.145,.174])k.ring(g,.514,.0015,frame,y);
 k.line(g,Array.from({length:240},(_,i)=>roofPoint(i/240,1)),.003,blue,true);
 for(let i=0;i<120;i++)k.line(g,Array.from({length:12},(_,j)=>{const p=roofPoint(i/120,j/11);p[1]+=.0009;return p;}),.0005,frame);
 for(let j=1;j<10;j++)k.line(g,Array.from({length:180},(_,i)=>{const p=roofPoint(i/180,j/10);p[1]+=.0009;return p;}),.0005,frame,true);
 // Warm solar-bird motif is a separate gently raised annulus, with its open centre.
 const motif=new THREE.Group();birdBand(k,motif,.309,.363,0,gold);motif.updateMatrixWorld(true);
 motif.traverse(o=>{if(!o.isMesh)return;o.geometry.applyMatrix4(o.matrixWorld);const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i),theta=Math.atan2(x,z),inner=1/Math.sqrt((Math.sin(theta)/.30)**2+(Math.cos(theta)/.245)**2),v=THREE.MathUtils.clamp((Math.hypot(x,z)-inner)/(.525-inner),0,1);a.setY(i,.183+.045*Math.sin(v*Math.PI)+.018*Math.sin(theta)**2+.002);}o.geometry.computeVertexNormals();o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);});g.add(motif);
 for(let j=0;j<12;j++){const t=j/12,rx=.245+t*.065,rz=.18+t*.066,yy=.043+t*.127;skin(k,g,(u,v)=>{const a=u*TAU,r=v*.006;return [Math.sin(a)*(rx+r),yy,Math.cos(a)*(rz+r)];},1,128,seat);}
 disc(k,g,.243,.178,.039,field);
 // Low-key interior, no oversized painted football field competing with the roof.
 const track=k.mat('#a98775',.96);for(const r of [0,1,2,3]){const pts=Array.from({length:128},(_,i)=>{const a=i/128*TAU;return [Math.sin(a)*(.215-r*.006),.040,Math.cos(a)*(.155-r*.006)];});k.line(g,pts,.001,track,true);}
 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const entry=new THREE.Group();entry.rotation.y=a;k.box(entry,.16,.055,.05,p.pale,0,.05,.51);k.box(entry,.126,.04,.003,p.wood,0,.043,.537);for(let i=0;i<6;i++)k.box(entry,.20,.004*(i+1),.016,p.stone,0,.022+.002*i,.63-i*.016);g.add(entry);}
 for(let i=0;i<16;i++){const a=i/16*TAU,x=Math.sin(a)*.60,z=Math.cos(a)*.60;k.box(g,.018,.002,.018,p.warm,x,.027,z);}
 grove(k,g,height,[[-.60,-.30,.10],[.60,-.30,.10],[-.32,-.59,.10],[.32,-.59,.10]]);
 return finish(k,g,{lamps:[[-.32,.48],[.32,.48]],visitors:[[-.08,.60],[.04,.59],[.12,.57]]});
}
