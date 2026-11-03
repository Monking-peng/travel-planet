import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,hip,sign,lit,archPane,gable,cross,dome,ceramic,vase,TAU} from './tianjin-kit.js';
import {lattice} from './shunde-kit.js';
export function xikai(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.61,.58);paving(k,g,p,.51,.48);const brick=k.mat('#b8825d',.95),cream=k.mat('#d5c6a5',.94),copper=lit(k,'#668e79',.08,'#a6baa2');
 function block(w,h,d,x,y,z){k.box(g,w,h,d,brick,x,y+h/2,z);for(let j=0;j<h/.029;j++)k.box(g,w+.002,.012,d+.002,cream,x,y+j*.029+.006,z);}
 block(.48,.39,.45,0,.05,-.08);for(const x of [-.175,.175]){block(.145,.65,.19,x,.05,.12);k.box(g,.163,.015,.209,cream,x,.704,.12);k.box(g,.151,.012,.20,cream,x,.609,.12);for(const side of [-1,1]){const t=new THREE.Group();t.position.set(x,.0,.12);t.rotation.y=side<0?Math.PI:0;g.add(t);for(const xx of [-.039,0,.039])archPane(k,t,{...p,pale:cream},xx,.612,.099,.028,.067);}
  dome(k,g,copper,.083,.074,.718,x,.12);k.cyl(g,.005,.009,.025,cream,x,.805,.12,12);cross(k,g,p,x,.831,.12,.045);
  for(const xx of [-.021,.021])archPane(k,g,{...p,pale:cream},x+xx,.35,.218,.031,.12);archPane(k,g,{...p,pale:cream},x,.068,.219,.070,.17,{door:true});
  const q=k.mesh(g,new THREE.CircleGeometry(.021,24),lit(k,'#527483',.10),x,.548,.220);q.scale.y=.8;
 }
 const roofGroup=new THREE.Group();g.add(roofGroup);roofGroup.rotation.y=Math.PI/2;gable(k,roofGroup,{...p,tile:cream,red:cream},.45,.38,.08,.442,.08,0,cream);
 k.box(g,.18,.36,.025,cream,0,.250,.166);archPane(k,g,{...p,pale:cream},0,.072,.184,.105,.19,{door:true});archPane(k,g,{...p,pale:cream},0,.286,.184,.094,.15);
 const arch=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI;arch.push([Math.cos(a)*.118,.347+Math.sin(a)*.118,.185]);}k.line(g,arch,.008,cream);for(let i=0;i<19;i++){const a=(i+.5)/19*Math.PI;k.beam(g,[Math.cos(a)*.111,.347+Math.sin(a)*.111,.192],[Math.cos(a)*.128,.347+Math.sin(a)*.128,.192],.003,i%2?brick:cream);}
 const ped=new THREE.Shape();ped.moveTo(-.14,0);ped.lineTo(.14,0);ped.lineTo(0,.09);ped.closePath();k.mesh(g,new THREE.ExtrudeGeometry(ped,{depth:.025,bevelEnabled:false}),brick,0,.536,.163);k.line(g,[[-.145,.535,.193],[0,.632,.193],[.145,.535,.193]],.006,cream);cross(k,g,{wood:p.pale},0,.588,.198,.046);
 for(let i=0;i<8;i++){const x=-.12+i*.034;k.cyl(g,.004,.004,.035,cream,x,.515,.19,8);}k.box(g,.27,.006,.018,cream,0,.537,.19);
 block(.16,.57,.16,0,.05,-.22);dome(k,g,copper,.099,.092,.637,0,-.22);cross(k,g,p,0,.768,-.22,.054);
 for(const side of [-1,1]){const t=new THREE.Group();t.rotation.y=side*Math.PI/2;t.position.x=side*.242;g.add(t);for(let i=0;i<5;i++)archPane(k,t,{...p,pale:cream},-.23+i*.083,.15,.003,.047,.17);}
 steps(k,g,p,0,.285,.49,5,.025,.095);return finish(k,g,{lamps:[[-.29,.023,.27],[.29,.023,.27]],visitors:[[-.13,.023,.38],[.09,.023,.32]]});
}
function hexLattice(k,g,p,x,y,z,w,h){
 for(let j=0;j<Math.ceil(h/.023);j++)for(let i=0;i<Math.ceil(w/.021);i++){const xx=x-w/2+.012+i*.021+(j%2)*.0105,yy=y-h/2+.012+j*.020;if(xx>x+w/2-.006||yy>y+h/2-.006)continue;const pts=[];for(let n=0;n<6;n++){const a=n/6*TAU;pts.push([xx+Math.sin(a)*.011,yy+Math.cos(a)*.011,z]);}k.line(g,pts,.0011,p,true);}
}
export function porcelain(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.66,.57);paving(k,g,p,.56,.48);const mosaic=ceramic(k),blue=ceramic(k,'#a8b5bb'),orange=k.mat('#a85b3d',.92),glass=lit(k,'#3f4847',.065),porcelain=k.mat('#c4c9b8',.63,.12);
 for(let level=0;level<3;level++){const y=.055+level*.16,w=.46-level*.025;k.box(g,w,.151,.29,orange,0,y+.075,-.10);k.box(g,w+.065,.015,.34,mosaic,0,y+.157,-.10);
  for(let i=0;i<4;i++){const x=(i-1.5)*w*.22;archPane(k,g,{...p,pale:mosaic},x,y+.022,.051,.068,.116);hexLattice(k,g,porcelain,x,y+.081,.061,.062,.102);}
  for(let i=0;i<5;i++){const x=(i-2)*w*.22;k.cyl(g,.008,.008,.148,mosaic,x,y+.074,.064,12);vase(k,g,blue,x,y+.02,.079,.065,.010);}
 }
 // A glazed hipped roof and terrace retain the mansion silhouette under the ceramic ornament.
 hip(k,g,.48,.34,.105,.548,mosaic,mosaic,0,-.10);
 for(let i=0;i<19;i++)vase(k,g,i%3?mosaic:blue,-.235+i*.026,.551,.079,.040,.009);
 for(const y of [.215,.375]){k.box(g,.18,.012,.26,mosaic,-.295,y,-.02);for(const x of [-.37,-.23])k.cyl(g,.006,.007,.145,mosaic,x,y-.075,.078,12);for(let i=0;i<7;i++)vase(k,g,mosaic,-.37+i*.023,y+.006,.106,.037,.0075);}
 // The roof inscription is a continuous porcelain sculpture, not a floating label.
 const letters=[[[.050,.080],[.027,.099],[.003,.082],[-.003,.044],[.014,.014],[.050,.025]],[[.060,.012],[.077,.115],[.068,.057],[.090,.069],[.101,.057],[.091,.010]],[[.111,.012],[.123,.060]],[[.134,.014],[.142,.061],[.149,.026],[.168,.063],[.181,.060],[.174,.013]],[[.211,.061],[.194,.053],[.190,.021],[.202,.011],[.218,.037],[.224,.061],[.218,.016],[.233,.014]]];
 for(const line of letters)k.line(g,line.map(v=>[v[0]-.10,.659+v[1],-.079]),.009,mosaic);k.ball(g,.009,mosaic,.027,.738,-.079);
 for(let j=0;j<3;j++)k.cyl(g,.022+j*.012,.029+j*.012,.018,mosaic,-.177,.684-j*.026,-.10,32);k.beam(g,[-.177,.690,-.10],[-.177,.776,-.10],.004,mosaic,12);
 const dragon=[[.21,.73,-.08],[.28,.74,-.02],[.28,.62,.05],[.34,.59,.05],[.38,.51,.04],[.29,.44,.10],[.36,.36,.10],[.32,.22,.14]];k.line(g,dragon,.013,mosaic);
 // Tall vase-filled boundary wall, undulating top, and a true central opening.
 for(const side of [-1,1]){for(let i=0;i<12;i++){const x=side*(.126+i*.026),top=.22+.052*Math.cos(i/11*TAU);for(let j=0;j<3;j++)vase(k,g,(i+j)%4?blue:mosaic,x,.024+j*(top-.024)/3,.315,(top-.024)/3,.0115);}
  k.line(g,Array.from({length:40},(_,i)=>{const t=i/39;return [side*(.115+t*.30),.22+.052*Math.cos(t*TAU),.315];}),.012,mosaic);
 }
 const entrance=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI;entrance.push([Math.cos(a)*.125,.22+Math.sin(a)*.105,.315]);}k.line(g,entrance,.014,mosaic);
 for(const x of [-.12,.12])k.cyl(g,.012,.014,.20,mosaic,x,.123,.315,14);for(const x of [-.05,.05]){k.box(g,.004,.19,.004,p.wood,x,.118,.315);for(let j=0;j<5;j++)k.mesh(g,new THREE.TorusGeometry(.018,.0015,4,20),p.wood,x,.06+j*.031,.315);}
 for(const x of [-.43,.43]){k.box(g,.055,.017,.060,p.stone,x,.030,.34);k.ball(g,.018,porcelain,x,.062,.34).scale.y=1.5;}
 return finish(k,g,{lamps:[[-.43,.022,.38],[.43,.022,.38]],visitors:[[-.13,.023,.43],[.14,.023,.42]]});
}
export function dule(k){
 const g=new THREE.Group(),p=palette(k);const height=site(k,g,.64,.58);paving(k,g,p,.51,.46);p.tile.color.set('#66675c');p.wood.color.set('#57483a');p.red.color.set('#794c3c');const dim=lit(k,'#514136',.035),edge=lit(k,'#66675c',.12),bracket=k.mat('#8c795c',.92);
 k.box(g,.64,.046,.41,p.stone,0,.046,-.04);steps(k,g,p,0,.21,.42,4,.044,.09);
 for(const [y,w,d,h]of [[.070,.48,.29,.23],[.386,.39,.25,.20]]){
  k.box(g,w*.94,h,d*.70,p.red,0,y+h/2,-.04);for(const side of [-1,1]){for(let i=0;i<5;i++){const x=(i-2)*w/4;k.cyl(g,.007,.009,h+.035,p.red,x,y+h/2,-.04+side*d*.48,12);
   // Three stepped bracket arms with transverse blocks under the deep eaves.
   for(let j=0;j<3;j++){const yy=y+h-.018+j*.015;k.box(g,.026+j*.015,.010,.045+j*.019,bracket,x,yy,-.04+side*(d*.47+j*.007));k.box(g,.012,.011,.068+j*.012,bracket,x,yy+.007,-.04+side*(d*.49+j*.011));}
  }
  for(let i=0;i<4;i++){const x=(i-1.5)*w/4,zz=-.04+side*d*.356;k.box(g,w*.21,h*.73,.004,dim,x,y+h*.42,zz);lattice(k,g,x,y+h*.42,zz+side*.003,w*.21,h*.73,p.wood);}
  k.box(g,w,.016,.018,p.wood,0,y+h-.02,-.04+side*d*.49);
  }
  hip(k,g,w*1.48,d*1.66,.074,y+h+.034,p.tile,edge,0,-.04);
 }
 k.box(g,.48,.020,.34,p.wood,0,.379,-.04);
 for(const z of [-.205,.125]){for(let i=0;i<13;i++)k.box(g,.004,.055,.004,p.red,-.235+i*.039,.412,z);k.box(g,.49,.004,.006,p.wood,0,.441,z);k.box(g,.49,.004,.006,p.wood,0,.408,z);}
 sign(k,g,'观音之阁',.087,.046,0,.565,.093,{background:'#47605a',color:'#bbb08b'});
 const censer=new THREE.Group();censer.position.set(0,.023,.31);g.add(censer);k.box(censer,.11,.018,.07,p.wood,0,.012,0);for(const x of [-.038,.038])for(const z of [-.023,.023])k.box(censer,.009,.073,.009,p.wood,x,.056,z);k.box(censer,.105,.046,.063,p.wood,0,.066,0);hip(k,censer,.145,.10,.032,.108,p.tile,p.wood);k.ball(censer,.008,p.wood,0,.151,0);
 for(const x of [-.25,.25]){k.cyl(g,.025,.018,.026,p.red,x,.04,.26,24);k.ball(g,.035,p.leaf,x,.081,.26).scale.y=.65;}
 grove(k,g,height,[[-.48,-.22,.15],[.49,-.22,.17]]);return finish(k,g,{lamps:[[-.36,.024,.25],[.36,.024,.25]],visitors:[[.19,.023,.38],[-.26,.023,.38]]});
}
