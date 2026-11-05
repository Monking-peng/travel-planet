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
export {nanshan} from './sanya-nanshan.js';
export {tianya} from './sanya-tianya.js';
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
