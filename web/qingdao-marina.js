import * as THREE from 'three';
import {palette,site,sea,skin,lit,finish,TAU} from './qingdao-kit.js';

function rail(k,g,m,r,y,h=.025,start=0,end=TAU){
 const n=Math.ceil((end-start)*r/.017);
 for(let i=0;i<n;i++){const a=start+(end-start)*i/n,b=start+(end-start)*(i+1)/n;
  k.beam(g,[Math.sin(a)*r,y,Math.cos(a)*r],[Math.sin(a)*r,y+h,Math.cos(a)*r],.0008,m);
  for(const yy of [y+h,y+.004])k.beam(g,[Math.sin(a)*r,yy,Math.cos(a)*r],[Math.sin(b)*r,yy,Math.cos(b)*r],.0009,m);
 }
}
function pierRail(k,g,m,x,z1,z2,y){
 k.beam(g,[x,y+.027,z1],[x,y+.027,z2],.0011,m);
 k.beam(g,[x,y+.009,z1],[x,y+.009,z2],.0008,m);
 for(let z=z1;z<=z2+.0001;z+=.024)k.beam(g,[x,y,z],[x,y+.027,z],.0008,m);
}
function lighthouse(k,g,p){
 const q=new THREE.Group();q.position.set(.424,.078,.285);g.add(q);
 const white=k.mat('#e0dfd5',.78),metal=k.mat('#465b5d',.62,.24),glass=lit(k,'#6b8485',.12),recess=k.mat('#384847',.91);
 white.userData.night={color:new THREE.Color('#d3b8ef'),intensity:.19};white.userData.marinaLighthouse=true;
 metal.userData.marinaLantern=true;metal.userData.marinaRails=true;
 for(const [r,y]of [[.089,.003],[.082,.009],[.074,.015]])k.cyl(q,r,r,.006,p.stone,0,y,0,64);
 k.cyl(q,.043,.046,.013,p.stone,0,.024,0,64);
 k.cyl(q,.028,.040,.203,white,0,.132,0,64);
 for(const y of [.232,.267]){k.cyl(q,.032,.032,.004,white,0,y,0,64);k.cyl(q,.030,.030,.009,white,0,y+.005,0,64);}
 k.cyl(q,.027,.029,.065,white,0,.265,0,64);
 for(let i=0;i<4;i++)k.cyl(q,.033+i*.003,.031+i*.003,.0036,white,0,.294+i*.0036,0,64);
 k.cyl(q,.031,.031,.037,white,0,.328,0,64);
 rail(k,q,metal,.046,.309,.028);
 k.cyl(q,.040,.040,.004,white,0,.349,0,64);
 k.cyl(q,.027,.027,.042,glass,0,.372,0,32);
 for(let i=0;i<12;i++){const a=i/12*TAU;k.beam(q,[Math.sin(a)*.027,.351,Math.cos(a)*.027],[Math.sin(a)*.027,.394,Math.cos(a)*.027],.001,metal);}
 k.cyl(q,.029,.029,.003,metal,0,.395,0,48);k.cyl(q,.004,.034,.018,metal,0,.406,0,48);k.cyl(q,0,.008,.010,metal,0,.420,0,24);k.beam(q,[0,.424,0],[0,.440,0],.0006,metal);
 // The narrow front window and closed service door are shallow framed recesses.
 k.box(q,.012,.027,.003,recess,0,.166,.036);for(const x of [-.007,.007])k.box(q,.0015,.030,.004,white,x,.166,.038);for(const y of [.151,.181])k.box(q,.015,.002,.004,white,0,y,.038);
 k.box(q,.021,.035,.004,p.stone,0,.048,.040);k.box(q,.017,.031,.004,white,0,.048,.043);k.box(q,.001,.030,.001,p.stone,0,.048,.046);k.cyl(q,0,.016,.007,p.stone,0,.069,.040,4).rotation.y=Math.PI/4;
 k.ball(q,.005,p.warm,0,.372,0);
 rail(k,q,metal,.103,0,.026,-Math.PI+.42,Math.PI-.42);
 const band=lit(k,'#d5cab4',1.15);band.userData.night.color.set('#e6c5ef');
 for(const y of [.029,.308,.349]){const r=y<.1?.042:y<.33?.045:.039;k.ring(q,r,.0008,band,y);}
}
function torch(k,g,p){
 const q=new THREE.Group();q.position.set(-.392,.078,.258);g.add(q);
 const red=lit(k,'#a51f2b',.15),silver=k.mat('#d5d5cc',.50,.28),pattern=k.mat('#9c2632',.75),metal=k.mat('#657172',.70);
 red.userData.night.color.copy(red.color);silver.userData.night={color:new THREE.Color('#efd8b2'),intensity:.18};silver.userData.marinaTorchUpper=true;
 for(const [r,y]of [[.087,.003],[.078,.009],[.069,.015]])k.cyl(q,r,r,.006,p.stone,0,y,0,64);
 k.cyl(q,.024,.018,.238,red,0,.140,0,48);k.cyl(q,.030,.024,.248,silver,0,.383,0,48);k.ball(q,.030,silver,0,.507,0).scale.y=.22;
 // Spiral-and-hook cloud motifs are generated geometry, not a copied photograph.
 for(let row=0;row<10;row++)for(let col=0;col<7;col++){
  const a=col/7*TAU+(row%2)*.23,y=.274+row*.023,pts=[];
  for(let i=0;i<=24;i++){const t=i/24,theta=t*TAU*1.20,rad=.009*(1-t*.78),u=Math.cos(theta)*rad,v=Math.sin(theta)*rad;
   const aa=a+u/.028,rr=.024+((y+v-.259)/.248)*.006+.0009;pts.push([Math.sin(aa)*rr,y+v,Math.cos(aa)*rr]);}
  k.line(q,pts,.0006,pattern);
 }
 k.cyl(q,.0245,.0245,.004,red,0,.262,0,48);rail(k,q,metal,.062,.018,.035);
}
function sailboat(k,g,p,x,z,size=1,yaw=0){
 const q=new THREE.Group();q.position.set(x,.027,z);q.scale.setScalar(size);q.rotation.y=yaw;g.add(q);
 const white=k.mat('#e2e0d3',.81),trim=k.mat('#345563',.60),deck=k.mat('#b8ad90',.90),rope=k.mat('#77817c',.88),sail=k.mat('#e8e7dd',.91);sail.side=THREE.DoubleSide;
 white.userData.marinaHull=true;
 const width=t=>.031*Math.pow(Math.sin(Math.PI*(.08+.92*t)),.73),end=t=>-.073+.184*t;
 skin(k,q,(u,v)=>{const a=u*Math.PI,w=width(v);return [Math.cos(a)*w,.020-Math.sin(a)*.019,end(v)];},28,40,white);
 skin(k,q,(u,v)=>[(u*2-1)*width(v),.020,end(v)],12,40,deck);
 for(const s of [-1,1])k.line(q,Array.from({length:25},(_,i)=>{const t=i/24;return [s*width(t),.022,end(t)];}),.0012,white);
 const stern=new THREE.Shape();stern.moveTo(-width(0),.020);stern.quadraticCurveTo(0,-.016,width(0),.020);stern.closePath();k.mesh(q,new THREE.ShapeGeometry(stern,20),white,0,0,-.073).rotation.y=Math.PI;
 k.box(q,.032,.014,.050,white,0,.026,-.012);for(const s of [-1,1])k.box(q,.001,.007,.032,trim,s*.0165,.029,-.013);k.box(q,.024,.002,.031,trim,0,.034,-.011);
 k.beam(q,[0,.025,.010],[0,.252,.010],.0011,p.pale);k.beam(q,[0,.066,.010],[0,.066,-.067],.001,p.pale);
 skin(k,q,(u,v)=>[.009*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),.067+.177*v,.010-u*.075*(1-v)],14,20,sail);
 skin(k,q,(u,v)=>[.005*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),.041+.199*v,.012+u*.082*(1-v)],12,20,sail);
 for(const t of [.24,.48,.72])k.line(q,Array.from({length:10},(_,i)=>{const u=i/9;return [.009*Math.sin(u*Math.PI)*Math.sin(t*Math.PI)+.0003,.067+.177*t,.010-u*.075*(1-t)];}),.00035,rope);
 for(const s of [-1,1])k.beam(q,[s*.027,.023,-.015],[0,.246,.010],.00035,rope);
 k.beam(q,[0,.245,.010],[0,.022,.100],.0004,rope);
}
export function marina(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.69,.63);sea(k,g,p,.68,.62);
 const ground=k.mat('#afa898',.97),joint=k.mat('#918e82',.98),metal=k.mat('#667574',.70),breakwater=k.mat('#999b93',.99),light=lit(k,'#c9c4b3',1.15);light.userData.night.color.set('#efd4a3');metal.userData.marinaRails=true;
 ground.userData.marinaPaving=true;
 k.box(g,1.02,.048,.116,p.stone,0,.049,-.365);k.box(g,1.02,.005,.116,ground,0,.0755,-.365);
 for(const [x,w,d,z]of [[.424,.13,.65,-.045],[-.392,.15,.63,-.045]]){k.box(g,w,.048,d,p.stone,x,.049,z);k.box(g,w,.005,d,ground,x,.0755,z);}
 for(const [x,z,r]of [[.424,.285,.117],[-.392,.258,.100]]){k.cyl(g,r,r,.048,p.stone,x,.049,z,64);k.cyl(g,r,r,.005,ground,x,.0755,z,64);}
 for(let z=-.32;z<.25;z+=.031)for(const [x,w]of [[.424,.13],[-.392,.15]])k.box(g,w,.0007,.0006,joint,x,.0784,z);
 for(let x=-.49;x<.50;x+=.038)k.box(g,.0006,.0007,.116,joint,x,.0784,-.365);
 for(const x of [.366,.482,-.457,-.327])pierRail(k,g,metal,x,-.313,.192,.078);
 for(const side of [-1,1])for(let i=0;i<7;i++){const z=-.29+i*.074,x=-.392+side*.053;k.beam(g,[x,.078,z],[x,.207,z],.0009,metal);const colors=['#e3d4bb','#7e9ca7','#b9bc9d'];skin(k,g,(u,v)=>[x+u*.026,.204-v*.019,.0025*Math.sin(u*4+v*2)+z],5,7,k.mat(colors[i%3],.9));}
 for(let i=0;i<30;i++){const a=.35+i/29*(TAU-.70),r=.130+.010*Math.sin(i*2.2),q=new THREE.Group();q.position.set(.424+Math.sin(a)*r,.030,.285+Math.cos(a)*r);q.rotation.y=a;q.rotation.z=.20*Math.sin(i);g.add(q);
  for(const [start,end]of [[[0,.004,0],[.018,.023,.006]],[[0,.008,0],[-.019,.020,.008]],[[0,.009,0],[0,.024,-.016]]])k.beam(q,start,end,.0065,breakwater,5);
 }
 lighthouse(k,g,p);torch(k,g,p);
 for(const [x,z,s,a]of [[-.15,-.16,.75,.40],[.10,-.09,.82,-.4],[-.13,.13,1,.30],[.20,.21,.70,-.7],[.01,.39,.65,.5]])sailboat(k,g,p,x,z,s,a);
 for(const x of [.366,-.327])for(let i=0;i<5;i++)k.box(g,.002,.0015,.045,light,x,.080,-.25+i*.09);
 return finish(k,g,{lamps:[[-.46,.078,-.29],[.48,.078,-.25],[.48,.078,.17]],visitors:[[-.39,.078,-.05],[-.41,.078,.09],[.43,.078,-.03],[.42,.078,.17]]});
}
