import * as THREE from 'three';
import {palette,site,paving,siteHeight,grove,roof,lantern,sign,finish,lit} from './guilin-kit.js';
import {lattice} from './shunde-kit.js';
function panelRail(k,g,mat,a,b,y,h=.045,stone=false){
 const A=new THREE.Vector2(...a),B=new THREE.Vector2(...b),n=Math.ceil(A.distanceTo(B)/.055),dir=B.clone().sub(A).normalize(),angle=Math.atan2(-dir.y,dir.x);
 for(let i=0;i<=n;i++){const q=A.clone().lerp(B,i/n);k.box(g,.004,h+.006,.004,mat,q.x,y+h/2,q.y);if(stone)k.ball(g,.0035,mat,q.x,y+h+.004,q.y);}
 for(const high of [h*.12,h])k.beam(g,[a[0],y+high,a[1]],[b[0],y+high,b[1]],.0027,mat,4);
 for(let i=0;i<n;i++){const q=A.clone().lerp(B,(i+.5)/n),panel=new THREE.Group();panel.position.set(q.x,y+h*.46,q.y);panel.rotation.y=angle;g.add(panel);const w=A.distanceTo(B)/n*.70;k.box(panel,w,h*.18,.0025,mat,0,0,0);for(const s of [-1,1])k.box(panel,.002,h*.45,.0025,mat,s*w*.35,0,0);}
}
function brackets(k,g,p,x,y,z,axis=0){
 const b=new THREE.Group();b.position.set(x,y,z);b.rotation.y=axis;g.add(b);
 for(let i=0;i<4;i++){k.box(b,.026+i*.013,.005,.032+i*.012,p.wood,0,i*.009,i*.006);for(const s of [-1,1])k.box(b,.007,.014,.008,p.wood,s*(.014+i*.006),i*.009+.006,.008+i*.006);}
}
function pediment(k,g,p,w,d,y,x,z){
 // A small gabled entrance is visible in both day and night reference photos.
 const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,w*.31);shape.lineTo(w/2,0);shape.closePath();k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),p.wall,x,y,z-d/2);
 for(const side of [-1,1]){const zz=z+side*(d/2+.002);k.beam(g,[x-w*.52,y,zz],[x,y+w*.34,zz],.006,p.wood);k.beam(g,[x,y+w*.34,zz],[x+w*.52,y,zz],.006,p.wood);k.beam(g,[x-w*.45,y+.010,zz],[x+w*.45,y+.010,zz],.002,p.wood);}
 for(const side of [-1,1])for(let i=-3;i<=3;i++){const xx=i*w/9,h=(1-Math.abs(xx)/(w*.5))*w*.27; k.box(g,.003,h,.004,p.wood,x+xx,y+h/2+.006,z+side*(d/2+.003));}
 roof(k,g,p,w*1.17,d*1.12,w*.38,y-.008,x,z);
}
export function xiaoyao(k){
 const g=new THREE.Group(),p=palette(k);p.wood=lit(k,'#49382c',.42,'#e1a353');p.tile=k.mat('#48504a',.94);p.tile.userData.night={color:new THREE.Color('#d7a45d'),intensity:.12};p.wall=lit(k,'#d7ceaf',.46,'#e6bf78');p.pale=k.mat('#bfc4b8',.95);p.red=p.wood;p.blue=p.wood;site(k,g,.79,.65);paving(k,g,p,.66,.50);
 const deck=k.mat('#aaa999',.95);deck.userData.xiaoyaoDeck=true;const stone=k.mat('#818c82',.98),warm=lit(k,'#9d8d65',.48,'#f0b967');
 k.box(g,1.02,.103,.66,stone,0,.0725,-.03);k.box(g,1.06,.010,.70,deck,0,.129,-.03);
 for(let row=0;row<4;row++){const y=.033+row*.024;k.box(g,1.02,.001,.001,p.pale,0,y,.3006);for(let i=0;i<13;i++){const x=-.5+(i+.5+(row%2)*.5)*.079;if(x<.5)k.box(g,.001,.022,.001,p.pale,x,y+.011,.301);}}
 // The lower storey stays open. Beams, deep bracket sets and rafters carry the broad eaves.
 for(const z of [-.245,.195])for(const x of [-.38,-.13,.13,.38]){k.cyl(g,.0068,.0082,.226,p.wood,x,.247,z,10);k.cyl(g,.010,.010,.012,stone,x,.140,z,12);brackets(k,g,p,x,.322,z,z>0?0:Math.PI);}
 for(const x of [-.38,.38])for(const z of [-.10,.045]){k.cyl(g,.0068,.0082,.226,p.wood,x,.247,z,10);brackets(k,g,p,x,.322,z,x>0?Math.PI/2:-Math.PI/2);}
 for(const z of [-.245,.195]){k.box(g,.80,.018,.012,p.wood,0,.305,z);k.box(g,.80,.007,.014,p.wall,0,.318,z);k.box(g,.82,.015,.017,p.wood,0,.355,z);}
 for(const x of [-.38,.38])k.box(g,.012,.018,.46,p.wood,x,.305,-.025);
 roof(k,g,p,1.03,.75,.084,.365,0,-.025);
 // One enclosed upper hall sits inside a usable outer gallery.
 k.box(g,.69,.014,.48,deck,0,.457,-.025);
 k.box(g,.51,.175,.285,p.wall,0,.548,-.025);
 for(const z of [-.172,.122])for(const x of [-.18,-.06,.06,.18]){const glass=lit(k,'#443d32',.25,'#d3a86a');k.box(g,.097,.098,.004,glass,x,.527,z);lattice(k,g,x,.527,z+Math.sign(z+.025)*.003,.087,.091,p.wood);}
 for(const z of [-.235,.185]){
  for(const x of [-.33,-.11,.11,.33]){k.cyl(g,.0058,.0065,.170,p.wood,x,.542,z,8);brackets(k,g,p,x,.592,z,z>0?0:Math.PI);}
  for(const y of [.587,.616])k.box(g,.68,.007,.009,p.wood,0,y,z);
  panelRail(k,g,p.wood,[-.34,z],[.34,z],.464,.049);
 }
 for(const side of [-1,1]){panelRail(k,g,p.wood,[side*.34,-.235],[side*.34,.185],.464,.049);for(const z of [-.10,.045]){k.cyl(g,.0058,.0065,.170,p.wood,side*.33,.542,z,8);brackets(k,g,p,side*.33,.592,z,side*Math.PI/2);}}
 roof(k,g,p,.87,.65,.077,.635,0,-.025);
 // The third eave shelters a short attic, not another full-height boxed floor.
 k.box(g,.49,.058,.30,p.wood,0,.738,-.025);
 for(const z of [-.181,.131])for(const x of [-.19,-.095,0,.095,.19]){lattice(k,g,x,.741,z,.071,.039,p.pale);brackets(k,g,p,x,.742,z,z>0?0:Math.PI);}
 roof(k,g,p,.73,.55,.067,.784,0,-.025);pediment(k,g,p,.28,.21,.806,0,-.025);
 // Projecting entry porch and the horizontal gold plaque.
 for(const side of [-1,1]){k.cyl(g,.007,.008,.215,p.wood,side*.13,.2415,.300);brackets(k,g,p,side*.13,.313,.300);lantern(k,g,p,side*.24,.281,.205,.016);lantern(k,g,p,side*.36,.281,.205,.016);}
 k.box(g,.28,.016,.015,p.wood,0,.318,.302);pediment(k,g,p,.29,.23,.334,0,.285);sign(k,g,'逍遥楼',.114,.031,0,.298,.314,{background:'#3c3028',color:'#d7b16c'});
 // Continuous central staircase and slope-following approach.
 for(let i=0;i<12;i++){const top=.026+(i+1)*.009,z=.571-i*.023;k.box(g,.32,top-.016,.026,deck,0,(top+.016)/2,z);}
 for(const side of [-1,1]){
  panelRail(k,g,p.pale,[side*.18,.316],[side*.50,.316],.135,.051);panelRail(k,g,p.pale,[side*.50,.316],[side*.50,-.37],.135,.051);panelRail(k,g,p.pale,[side*.50,-.37],[0,-.37],.135,.051);
  const points=[];for(let i=0;i<13;i++){const z=.582-i*.023,y=.028+i*.009;points.push([side*.18,y+.046,z]);if(i%3===0)k.box(g,.006,.051,.006,p.pale,side*.18,y+.025,z);}k.line(g,points,.0035,p.pale);
 }
 const ps=[],ix=[];for(let j=0;j<=10;j++)for(let i=0;i<=8;i++){const t=j/10,z=.584+t*.058,x=(i/8*2-1)*(.18-.05*t);ps.push(x,THREE.MathUtils.lerp(.026,siteHeight(x,z,.79,.65)+.002,t),z);}for(let j=0;j<10;j++)for(let i=0;i<8;i++){const a=j*9+i,b=a+9;ix.push(a,b,a+1,a+1,b,b+1);}const approach=new THREE.BufferGeometry();approach.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));approach.setIndex(ix);approach.computeVertexNormals();k.mesh(g,approach,deck);
 for(const side of [-1,1]){
  k.cyl(g,.028,.021,.035,stone,side*.41,.151,.252,12);const shrub=k.mesh(g,new THREE.IcosahedronGeometry(.038,1),p.leaf,side*.41,.187,.252);shrub.scale.set(1,.75,1);
  k.box(g,.28,.002,.004,warm,side*.34,.138,.317);
 }
 grove(k,g,(x,z)=>siteHeight(x,z,.79,.65),[[-.62,-.29,.12],[.60,-.30,.13]]);
 return finish(k,g,{lamps:[[-.30,.022,.46],[.30,.022,.46]],visitors:[[-.055,.135,.26],[.25,.135,.20]]});
}
