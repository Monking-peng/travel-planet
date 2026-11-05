import * as THREE from 'three';
import {palette,site,skin,disc,ellipse,band,palms,lit,texturedStone,smoothRock,label,steps,railing,finish,TAU} from './sanya-kit.js';
import {tree} from './wuhan-architecture.js';
function face(k,g,mat,{x=0,y=0,z=0,s=1}={}){
 const head=ellipse(k,g,mat,x,y,z,.026*s,.039*s,.027*s);const shade=k.mat('#acae9e',.99);
 ellipse(k,g,mat,x,y-.002*s,z+.027*s,.005*s,.012*s,.008*s);
 for(const side of [-1,1]){
  k.line(g,[[x+side*.006*s,y+.008*s,z+.026*s],[x+side*.014*s,y+.010*s,z+.023*s],[x+side*.020*s,y+.007*s,z+.019*s]],.0014*s,mat);
  k.line(g,[[x+side*.007*s,y+.004*s,z+.027*s],[x+side*.014*s,y+.003*s,z+.024*s],[x+side*.018*s,y+.004*s,z+.020*s]],.00075*s,shade);
  ellipse(k,g,mat,x+side*.026*s,y-.004*s,z,.006*s,.014*s,.008*s);
 }
 k.line(g,[[x-.009*s,y-.018*s,z+.022*s],[x,y-.019*s,z+.026*s],[x+.009*s,y-.018*s,z+.022*s]],.0009*s,shade);return head;
}
function sleeve(k,g,mat,points,r){const curve=new THREE.CatmullRomCurve3(points.map(q=>new THREE.Vector3(...q)));return k.mesh(g,new THREE.TubeGeometry(curve,24,r,12,false),mat);}
export function nanshan(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p,{sea:true}),body=texturedStone(k,'#e2e1d7');body.userData.night={color:new THREE.Color('#e2dfc9'),intensity:.14};body.userData.guanyin=true;
 const centerZ=-.12,base=new THREE.Group();base.position.z=centerZ;g.add(base);

 const stone=texturedStone(k,'#c5c2b7'),trim=texturedStone(k,'#e3e0d4'),recess=k.mat('#9b9c90',.99);stone.userData.guanyinPodium=true;trim.userData.guanyinPodium=true;
 const oct=(r,i)=>{const b=r*(Math.SQRT2-1);return [[-b,r],[b,r],[r,b],[r,-b],[b,-r],[-b,-r],[-r,-b],[-r,b]][i%8];};
 const slab=(radius,y,thick,mat)=>{const shape=new THREE.Shape();for(let i=0;i<8;i++){const [x,z]=oct(radius,i);i?shape.lineTo(x,z):shape.moveTo(x,z);}shape.closePath();const m=k.mesh(base,new THREE.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false}),mat,0,y,0);m.rotation.x=Math.PI/2;return m;};
 const wall=(r0,r1,y,height,{door=false}={})=>{for(let i=0;i<8;i++){const at=(u,v)=>{const r=r0+(r1-r0)*v,a=oct(r,i),b=oct(r,i+1);return [a[0]+(b[0]-a[0])*u,y+height*v,a[1]+(b[1]-a[1])*u];};const panel=(u0,u1,v0,v1)=>skin(k,base,(u,v)=>at(u0+(u1-u0)*u,v0+(v1-v0)*v),4,12,stone);if(door&&i===0){panel(0,.33,0,1);panel(.67,1,0,1);panel(.33,.67,0,.38);panel(.33,.67,.81,1);}else panel(0,1,0,1);
   const a=oct(r0+(r1-r0)*.56,i),b=oct(r0+(r1-r0)*.56,i+1),cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,theta=Math.atan2(b[0]-a[0],b[1]-a[1]);
   if(!(door&&i===0)){const panelGroup=new THREE.Group();panelGroup.position.set(cx,y+height*.54,cz);panelGroup.rotation.y=theta-Math.PI/2;base.add(panelGroup);const width=Math.hypot(b[0]-a[0],b[1]-a[1])*.74;k.box(panelGroup,width,height*.52,.003,recess,0,0,.002);for(const dy of [-1,1])k.box(panelGroup,width+.006,.003,.006,trim,0,dy*height*.27,.004);for(const dx of [-1,1])k.box(panelGroup,.003,height*.54,.006,trim,dx*(width/2+.002),0,.004);for(let j=0;j<5;j++){const xx=(j-2)*width*.17;k.line(panelGroup,[[xx-.008,-.008,.007],[xx,.007,.007],[xx+.008,-.008,.007]],.001,trim);}}
  }};
 slab(.335,.045,.014,stone);wall(.290,.263,.045,.100,{door:true});slab(.272,.150,.010,trim);wall(.240,.214,.150,.041);slab(.225,.197,.009,trim);
 k.box(base,.075,.041,.008,p.wood,0,.105,.252);k.box(base,.086,.006,.012,p.gold,0,.130,.266);k.box(base,.078,.004,.058,trim,0,.086,.274);
 const rail=lit(k,'#d9d4c4',.12,null,'#e8d0a4');
 for(let i=0;i<8;i++){const a=oct(.209,i),b=oct(.209,i+1);for(const y of [.201,.222])k.line(base,[[a[0],y,a[1]],[b[0],y,b[1]]],.0018,rail);for(let j=0;j<=7;j++){const t=j/7;k.cyl(base,.0018,.0022,.026,trim,a[0]+(b[0]-a[0])*t,.211,a[1]+(b[1]-a[1])*t,8);}}
 // Rounded overlapping lotus petals surround the gilded seat, instead of detached vertical beads.
 k.cyl(base,.125,.149,.044,p.gold,0,.239,0,64);
 for(let row=0;row<3;row++)for(let i=0;i<28;i++){const a=(i+row*.5)/28*TAU,r=.147-row*.009,y=.218+row*.013;const petal=ellipse(k,base,p.gold,Math.cos(a)*r,y,Math.sin(a)*r,.014,.015,.021);petal.rotation.y=-a+Math.PI/2;petal.rotation.x=.35;}
 for(let i=0;i<42;i++){const a=i/42*TAU,r=.332+.008*Math.sin(i*7),m=k.mesh(base,new THREE.IcosahedronGeometry(.014+(i%3)*.003,1),stone,Math.cos(a)*r,.030,Math.sin(a)*r);m.scale.y=.5;}
 // Three radial robes share one continuous core; each face carries a different attribute.
 skin(k,base,(u,t)=>{const a=u*TAU,y=.267+t*.61,r=.107-.052*Math.sin(Math.PI*t*.72)+.016*Math.exp(-(((t-.78)/.13)**2)),fold=.004*Math.cos(a*18+t*4)*(1-t);return [Math.sin(a)*(r+fold),y,Math.cos(a)*(r+fold)];},70,120,body);
 for(let side=0;side<3;side++){
  const fig=new THREE.Group();fig.rotation.y=side*TAU/3;g.add(fig);fig.position.z=centerZ;
  ellipse(k,fig,body,0,.795,.046,.047,.075,.031);
  skin(k,fig,(u,t)=>{const x=(u-.5)*.14,y=.29+t*.49,z=.052+.033*Math.sin(t*Math.PI)+.005*Math.cos(u*8*Math.PI+t*7);return [x*(1-.50*t),y,z];},40,42,body);
  face(k,fig,body,{y:.907,z:.047,s:1.08});
  // The gilded three-sided headdress rises behind the white forehead.
  const crown=new THREE.Shape();crown.moveTo(-.027,0);crown.quadraticCurveTo(-.041,.037,-.025,.071);crown.quadraticCurveTo(0,.052,.025,.071);crown.quadraticCurveTo(.041,.037,.027,0);crown.closePath();k.mesh(fig,new THREE.ExtrudeGeometry(crown,{depth:.008,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2}),p.gold,0,.927,.014);
  for(const sx of [-1,1])k.line(fig,[[sx*.028,.933,.024],[sx*.026,.998,.019]],.002,p.gold);
  sleeve(k,fig,body,[[-.033,.832,.047],[-.073,.769,.073],[-.048,.716,.098],[-.018,.763,.102]],.018);
  sleeve(k,fig,body,[[.034,.831,.045],[.066,.780,.075],[.051,.742,.102],[.015,.765,.108]],.016);
  for(const sx of [-1,1])ellipse(k,fig,body,sx*.015,.767,.113,.009,.018,.006);
  if(side===0){k.box(fig,.033,.048,.009,p.pale,0,.773,.118);k.line(fig,[[-.012,.757,.124],[0,.751,.126],[.012,.757,.124]],.001,p.gold);}
  if(side===1){k.beam(fig,[0,.76,.12],[0,.807,.123],.0015,p.gold);for(let i=0;i<7;i++){const a=i/7*TAU;const o=ellipse(k,fig,p.pale,Math.cos(a)*.011,.812,Math.sin(a)*.006+.123,.008,.012,.004);o.rotation.z=-Math.cos(a)*.5;}}
  if(side===2)for(let i=0;i<16;i++){const a=i/16*TAU;ellipse(k,fig,p.gold,Math.sin(a)*.023,.744+Math.cos(a)*.032,.122,.0025,.0025,.0025);}
  for(let i=0;i<5;i++)k.line(fig,[[(-.045+i*.022),.29,.078],[(-.035+i*.017),.43,.087],[(-.028+i*.014),.60,.090]],.0016,body);
 }

 // Puji Bridge has a continuous stone surface to both the sanctuary threshold and shore stairs.
 const walking=texturedStone(k,'#d2cfbf');walking.userData.guanyinWalk=true;
 k.box(g,.145,.020,.306,walking,0,.076,.293);for(const z of [.19,.29,.39])for(const x of [-.053,.053])k.cyl(g,.009,.011,.055,stone,x,.044,z,10);
 for(const x of [-.068,.068])railing(k,g,p,[[x,.088,.14],[x,.088,.44]],.045);
 for(let i=0;i<15;i++)k.box(g,.136,.0006,.0015,recess,0,.0865,.15+i*.020);
 for(const x of [-.023,.023])k.box(g,.0012,.0006,.290,recess,x,.0865,.29);
 disc(k,g,.54,.14,(x,z)=>{const t=THREE.MathUtils.smoothstep(Math.hypot(x/.54,z/.14),.48,1);return THREE.MathUtils.lerp(.037,h(x,z+.50)+.003,t);},p.sand,0,.50);k.box(g,.19,.008,.026,walking,0,.038,.505);
 for(let i=0;i<4;i++)k.box(g,.17,.012*(i+1),.018,walking,0,.038+.006*(i+1),.494-i*.014);
 for(const x of [-.25,.25])palms(k,g,p,()=>.037,[[x,.465,.16]]);
 for(const x of [-.064,.064])k.line(g,[[x,.087,.18],[x,.087,.425]],.0014,p.warm);
 return finish(k,g,{visitors:[[-.035,.087,.34],[.036,.087,.39]]});
}
