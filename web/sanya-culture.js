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
 disc(k,base,.35,.30,.038,p.stone);for(let row=0;row<5;row++){const r=.28-row*.021;k.cyl(base,r,r+.018,.031,p.pale,0,.05+row*.031,0,8);band(k,base,a=>[Math.cos(a)*r,.066+row*.031,Math.sin(a)*r],p.stone,.0018);}
 k.box(base,.075,.057,.006,p.wood,0,.078,.267);k.box(base,.095,.008,.008,p.gold,0,.108,.270);
 for(let i=0;i<32;i++){const a=i/32*TAU;for(let row=0;row<2;row++){const r=.13+row*.022,o=ellipse(k,base,p.gold,Math.cos(a)*r,.224+row*.015,Math.sin(a)*r,.012,.028,.020);o.rotation.z=-Math.cos(a)*.35;o.rotation.x=Math.sin(a)*.35;}}
 k.cyl(base,.123,.145,.045,p.gold,0,.239,0,64);
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
 // Puji Bridge connects the sanctuary to the shore, with visible piles and balustrades.
 k.box(g,.145,.020,.42,p.pale,0,.076,.35);for(const z of [.19,.29,.39,.49])for(const x of [-.053,.053])k.cyl(g,.009,.011,.055,p.stone,x,.044,z,10);
 for(const x of [-.068,.068])railing(k,g,p,[[x,.088,.14],[x,.088,.56]],.045);
 for(const x of [-.09,.09])k.line(g,[[x,.082,.18],[x,.082,.54]],.002,p.warm);
 return finish(k,g,{visitors:[[-.035,.087,.34],[.036,.087,.45]]});
}
export function tianya(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p,{sea:true});disc(k,g,.66,.41,.034,p.sand,0,.07);
 smoothRock(k,g,p,{x:-.11,z:-.065,y:.035,rx:.27,ry:.245,rz:.17,seed:4});smoothRock(k,g,p,{x:.30,z:-.10,y:.035,rx:.14,ry:.31,rz:.125,seed:13});
 smoothRock(k,g,p,{x:-.40,z:-.18,y:.035,rx:.09,ry:.11,rz:.11,seed:6});smoothRock(k,g,p,{x:.49,z:-.27,y:.026,rx:.095,ry:.105,rz:.09,seed:8});
 label(k,g,'天涯',.088,.19,-.12,.33,.112);label(k,g,'海角',.060,.15,.30,.42,.033);
 palms(k,g,p,h,[[-.55,.02,.29],[-.47,.28,.25],[.47,.25,.26],[.49,-.31,.22]]);
 const surf=lit(k,'#b0d0bd',.01);surf.userData.landscape=true;for(let j=0;j<3;j++)k.line(g,Array.from({length:32},(_,i)=>{const a=.20+Math.PI*.85*i/31;return [.62*Math.cos(a),.032,.08+.43*Math.sin(a)+j*.013];}),.0018,surf);
 return finish(k,g,{visitors:[[-.18,.037,.27],[.12,.037,.25]]});
}
export function luhuitou(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p),stone=texturedStone(k,'#bebba6');stone.userData.night={color:new THREE.Color('#e9d4ac'),intensity:.09};
 const land=k.mat('#637c51',.99);land.userData.landscape=true;const hill=(x,z)=>.12*Math.max(0,1-(x/.68)**2-(z/.54)**2)**1.7+.019;
 skin(k,g,(u,v)=>{const a=u*TAU,x=Math.cos(a)*.68*v,z=Math.sin(a)*.54*v;return [x,hill(x,z),z];},24,80,land);
 disc(k,g,.40,.30,.136,p.paving);for(let i=0;i<4;i++)k.box(g,.48-i*.035,.026,.29-i*.018,stone,0,.151+i*.026,0);
 const carved=new THREE.Group();carved.position.set(0,.24,-.012);g.add(carved);
 const shape=new THREE.Shape();shape.moveTo(-.24,0);shape.lineTo(-.17,.14);shape.lineTo(-.09,.28);shape.lineTo(.06,.30);shape.lineTo(.10,.39);shape.quadraticCurveTo(.16,.46,.09,.52);shape.lineTo(.067,.54);shape.lineTo(.10,.55);shape.quadraticCurveTo(.23,.48,.205,.36);shape.lineTo(.17,.26);shape.lineTo(.22,.16);shape.lineTo(.25,0);shape.closePath();
 const core=k.mesh(carved,new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.011,bevelThickness:.015,bevelSegments:3,curveSegments:32}),stone,0,0,-.06);core.material.userData.deerCarving=true;
 // A backward-looking head and the tall ears preserve the landmark's characteristic outline.
 ellipse(k,carved,stone,.10,.51,.005,.045,.036,.043);const muzzle=ellipse(k,carved,stone,.062,.494,.034,.037,.015,.023);muzzle.rotation.z=.25;
 for(const [x,y,a]of [[.10,.570,-.15],[.145,.566,.44]]){const ear=ellipse(k,carved,stone,x,y,.005,.012,.060,.010);ear.rotation.z=a;}
 for(let i=0;i<8;i++)k.line(carved,[[-.12+i*.04,.03,.074],[-.15+i*.037,.09,.077],[-.11+i*.032,.16,.072]],.0015,p.stone);
 const man=new THREE.Group();carved.add(man);man.position.set(-.13,.005,.085);
 ellipse(k,man,stone,0,.235,0,.047,.099,.029);face(k,man,stone,{y:.372,z:.008,s:.78});
 for(const side of [-1,1]){sleeve(k,man,stone,[[side*.022,.172,0],[side*.025,.085,.006],[side*.023,.018,.017]],.017);ellipse(k,man,stone,side*.025,.008,.026,.019,.011,.036);}
 sleeve(k,man,stone,[[-.038,.307,0],[-.065,.262,.014],[-.074,.313,.025],[-.036,.337,.029]],.013);
 sleeve(k,man,stone,[[.039,.304,0],[.057,.268,.023],[.062,.327,.024],[.045,.344,.020]],.013);
 k.beam(man,[-.055,.337,.005],[.18,.351,-.014],.004,stone);
 for(let i=0;i<8;i++){const a=i/8*TAU,x=Math.cos(a)*.51,z=Math.sin(a)*.39;if(z>.23)continue;tree(k,g,x,hill(x,z),z,.20+(i%3)*.025);}
 steps(k,g,p,0,.39,.33,7,.105,.17);for(const x of [-.20,.20])railing(k,g,p,[[x,.13,.23],[x,.027,.43]],.03);
 return finish(k,g,{lamps:[[-.29,.136,.17],[.29,.136,.17]],visitors:[[-.25,.136,.16]]});
}
