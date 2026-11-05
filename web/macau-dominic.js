import * as THREE from 'three';
import {palette,site,siteHeight,skin,extrude,hip,lit,finish,TAU,ellipsoid} from './macau-kit.js';

function rectangle(x,y,w,h){const s=new THREE.Path();s.moveTo(x-w/2,y);s.lineTo(x+w/2,y);s.lineTo(x+w/2,y+h);s.lineTo(x-w/2,y+h);s.closePath();return s;}
function flower(k,g,m,x,y,z,r=.009){for(let i=0;i<8;i++){const a=i/8*TAU,o=ellipsoid(k,g,m,x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65,z,r*.35,r*.20,.0015);o.rotation.z=a;}k.ball(g,r*.25,m,x,y,z+.0015);}
function outline(k,g,m,points,r=.0012){k.line(g,points,r,m,true);}
function capital(k,g,p,x,y,z){k.box(g,.033,.006,.031,p.pale,x,y,z);for(const dx of [-.010,0,.010])for(const dz of [-.008,.008]){const o=ellipsoid(k,g,p.pale,x+dx,y-.008,z+dz,.004,.008,.002);o.rotation.z=dx*25;}k.box(g,.039,.005,.036,p.pale,x,y+.006,z);}
function cornice(k,g,p,y,width,z=.164){for(let i=0;i<4;i++)k.box(g,width+i*.006,.0035,.043+i*.004,i%2?p.pale:p.stone,0,y+i*.004,z);}
function shutter(k,g,p,x,y,z,w,h,side){const t=new THREE.Group();t.position.set(x+side*w/2,y,z);t.rotation.y=-side*.70;g.add(t);const cx=side*w*.22;k.box(t,w*.44,h,.006,p.wood,cx,h/2,0);for(const xx of [cx-w*.20,cx+w*.20])k.box(t,.002,h,.008,p.greenEdge,xx,h/2,.002);for(let j=0;j<13;j++){const a=k.box(t,w*.39,.003,.006,p.greenEdge,cx,(j+.5)*h/13,.002);a.rotation.x=-.35;}k.box(t,.002,h,.008,p.greenEdge,cx,h/2,.003);}

export function dominic(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);p.pale=k.mat('#eee7d4',.93);p.ochre=k.mat('#d6ae60',.93);p.wood=k.mat('#204c3b',.9);p.greenEdge=k.mat('#31604a',.92);
 const walk=k.mat('#b5ab95',.98);walk.userData.dominicWalk=true;
 const glass=lit(k,'#233d35',.13,null,'#c9aa72');glass.userData.dominicWindow=true;const door=k.mat('#3c3930',.94);door.userData.dominicDoor=true;
 const z=.16,y=.047,shape=new THREE.Shape();shape.moveTo(-.365,y);shape.lineTo(.365,y);shape.lineTo(.365,.505);shape.bezierCurveTo(.255,.505,.210,.607,.193,.723);shape.lineTo(0,.831);shape.lineTo(-.193,.723);shape.bezierCurveTo(-.210,.607,-.255,.505,-.365,.505);shape.closePath();
 const openings=[];for(const x of [-.242,0,.242]){openings.push([x,.055,x===0?.137:.087,.171],[x,.314,x===0?.127:.087,.145]);}
 for(const q of openings)shape.holes.push(rectangle(...q));extrude(k,g,shape,p.ochre,.055,z);
 for(const x of [-.319,.319])k.box(g,.017,.42,.59,p.ochre,x,.257,-.155);
 k.box(g,.65,.42,.017,p.ochre,0,.257,-.442);hip(k,g,.68,.63,.115,.467,p.tile,p.stone,0,-.14);
 k.box(g,.75,.020,.66,walk,0,.037,-.125);
 for(const yy of [.047,.283,.492])cornice(k,g,p,yy,.752);
 cornice(k,g,p,.719,.420);
 for(const x of [-.345,-.304,-.145,.145,.304,.345]){
  for(const [base,high]of [[.067,.201],[.319,.162]]){k.cyl(g,.0095,.011,high,p.ochre,x,base+high/2,.196,16);k.box(g,.027,.014,.034,p.stone,x,base,.196);capital(k,g,p,x,base+high,.196);}
 }
 for(const x of [-.145,.145]){k.box(g,.052,.206,.017,p.ochre,x,.607,.191);for(const yy of [.552,.628]){outline(k,g,p.pale,[[x-.019,yy,.203],[x-.023,yy+.007,.203],[x-.023,yy+.055,.203],[x-.017,yy+.062,.203],[x+.017,yy+.062,.203],[x+.023,yy+.055,.203],[x+.023,yy+.007,.203],[x+.019,yy,.203]]);}
  capital(k,g,p,x,.710,.201);k.box(g,.063,.009,.029,p.pale,x,.526,.201);
  for(const yy of [.099,.179])outline(k,g,p.pale,[[x,yy-.028,.207],[x+.020,yy,.207],[x,yy+.028,.207],[x-.020,yy,.207]]);
 }
 // Doors and windows sit behind real rectangular openings in the front wall.
 for(const [x,base,w,h]of openings){const upper=base>.3;
  k.box(g,w+.009,h+.009,.008,upper?glass:(x===0?door:p.wood),x,base+h/2,upper?.132:.070);
  for(const xx of [x-w/2-.004,x+w/2+.004])k.box(g,.008,h+.018,.047,p.stone,xx,base+h/2,.170);
  for(const yy of [base-.004,base+h+.004])k.box(g,w+.021,.009,.048,p.stone,x,yy,.170);
  if(upper){for(let i=-2;i<=2;i++)k.box(g,.0017,h,.003,p.wood,x+i*w/5,base+h/2,.138);for(let j=1;j<5;j++)k.box(g,w,.0017,.003,p.wood,x,base+j*h/5,.138);
   for(const side of [-1,1])shutter(k,g,p,x,base+.029,.190,w,h-.030,side);
   for(let j=0;j<4;j++)k.box(g,w,.004,.006,p.greenEdge,x,base+.005+j*.006,.19);
  }else{for(let i=-1;i<=1;i++)k.box(g,.002,h,.004,p.greenEdge,x+i*w*.32,base+h/2,.077);for(let j=0;j<3;j++){const yy=base+.031+j*.052;outline(k,g,p.greenEdge,[[x,yy-.022,.078],[x+w*.36,yy,.078],[x,yy+.022,.078],[x-w*.36,yy,.078]],.0015);}}
 }
 // Rectangular central window and semicircular stucco caps over the side windows.
 for(const x of [-.242,.242]){for(const rr of [.049,.055])k.line(g,Array.from({length:36},(_,i)=>{const a=i/35*Math.PI;return [x+Math.cos(a)*rr,.469+Math.sin(a)*rr*.62,.198];}),.0021,p.pale);k.box(g,.105,.004,.025,p.pale,x,.469,.191);flower(k,g,p.pale,x,.488,.202,.011);}
 for(const x of [-.242,0,.242])for(let i=-2;i<=2;i++){const xx=x+i*.019;flower(k,g,p.pale,xx,.252+Math.sin(i)*.008,.195,i===0?.012:.007);}
 flower(k,g,p.pale,0,.478,.200,.013);for(const x of [-.036,.036])flower(k,g,p.pale,x,.478,.200,.008);
 // The oval relief is stucco, not a clock face or a glazed circular window.
 for(const radius of [1,1.13])outline(k,g,p.pale,Array.from({length:64},(_,i)=>{const a=i/64*TAU;return [Math.sin(a)*.061*radius,.614+Math.cos(a)*.079*radius,.199];}),.0022);
 for(let i=0;i<24;i++){const a=i/24*TAU;flower(k,g,p.pale,Math.sin(a)*.073,.614+Math.cos(a)*.091,.201,.0045);}
 k.line(g,[[-.027,.584,.202],[-.019,.639,.202],[0,.606,.202],[.021,.639,.202],[.028,.584,.202]],.0017,p.pale);k.line(g,[[-.017,.597,.202],[.015,.597,.202]],.0013,p.pale);
 for(const side of [-1,1]){const edge=[];for(let i=0;i<=30;i++){const t=i/30,x=side*(.193+.172*t),yy=.505+.214*(1-t)**2.25;edge.push([x,yy,.191]);if(i%3===0)flower(k,g,p.pale,x,yy-.010,.197,.004);}k.line(g,edge,.0027,p.pale);}
 for(const side of [-1,1])for(const xx of [.303,.350]){const x=side*xx;k.cyl(g,.007,.012,.015,p.pale,x,.523,.178,12);ellipsoid(k,g,p.ochre,x,.546,.178,.013,.019,.013);k.cyl(g,.012,.008,.005,p.pale,x,.555,.178,12);k.ball(g,.006,p.pale,x,.573,.178);}
 for(let i=0;i<3;i++){const yy=.724+i*.005,w=.423-i*.010;k.beam(g,[-w/2,yy,.192+i*.003],[0,.831+i*.004,.192+i*.003],.0023,p.pale);k.beam(g,[0,.831+i*.004,.192+i*.003],[w/2,yy,.192+i*.003],.0023,p.pale);}
 const emblem=k.mesh(g,new THREE.TorusGeometry(.020,.002,6,48),p.pale,0,.770,.194);emblem.scale.y=.82;k.box(g,.004,.025,.003,p.wood,0,.770,.197);k.box(g,.025,.004,.003,p.wood,0,.770,.197);
 k.box(g,.004,.053,.006,p.stone,0,.855,.16);k.box(g,.029,.004,.006,p.stone,0,.864,.16);
 // Side elevations retain their own recessed green shutters and masonry rhythm.
 for(const side of [-1,1])for(const zz of [-.33,-.12,.075]){const a=new THREE.Group();a.position.set(side*.329,.10,zz);a.rotation.y=side*Math.PI/2;g.add(a);for(const yy of [0,.22]){k.box(a,.080,.12,.009,p.wood,0,yy+.06,0);for(let j=0;j<11;j++)k.box(a,.074,.002,.011,p.greenEdge,0,yy+(j+.5)*.12/11,.001);for(const x of [-.045,.045])k.box(a,.006,.13,.014,p.pale,x,yy+.06,.002);}}
 for(let i=0;i<3;i++){const zz=.298-i*.025,top=.021+i*.013;k.box(g,.74,.012,.026,walk,0,top-.006,zz);}
 k.box(g,.74,.012,.041,walk,0,.041,.219);
 skin(k,g,(u,v)=>{const x=(u-.5)*.74,zz=.311+v*.080,ground=siteHeight(x,zz,.72,.62)+.004;return [x,Math.max(ground,THREE.MathUtils.lerp(.021,ground,v)),zz];},6,20,walk);
 return finish(k,g,{lamps:[[-.40,.021,.22],[.40,.021,.22]],visitors:[[-.21,.023,.39],[.14,.023,.39]]});
}
