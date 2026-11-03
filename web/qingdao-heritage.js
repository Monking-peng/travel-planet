import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,archPane,gable,pyramid,cross,masonry,clockFace,lit,sign,TAU} from './qingdao-kit.js';
export function church(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.63,.59);paving(k,g,p,.49,.46);
 k.box(g,.36,.34,.60,p.wall,0,.211,-.035);gable(k,g,p,.40,.62,.15,.381,0,-.035);
 for(const side of [-1,1]){
  const x=side*.218;k.box(g,.166,.68,.18,p.wall,x,.379,.235);masonry(k,g,p,.166,.68,.18,x,.039,.235);
  for(const y of [.215,.39,.55,.705])k.box(g,.181,.011,.192,p.pale,x,y,.235);
  archPane(k,g,p,x,.041,.328,.092,.134,{door:true});archPane(k,g,p,x,.24,.328,.045,.11);archPane(k,g,p,x,.43,.328,.042,.087);
  for(const y of [.565,.649])for(const dx of [-.034,.034])archPane(k,g,p,x+dx,y,.328,.041,.063);
  pyramid(k,g,p,.189,.205,.719,x,.235);cross(k,g,p,x,.948,.235,.046);
  const ped=new THREE.Shape();ped.moveTo(-.084,0);ped.lineTo(.084,0);ped.lineTo(0,.073);ped.closePath();k.mesh(g,new THREE.ShapeGeometry(ped),p.wall,x,.718,.331);k.mesh(g,new THREE.CircleGeometry(.018,32),p.red,x,.741,.334);
 }
 k.box(g,.273,.47,.025,p.wall,0,.273,.313);
 archPane(k,g,p,0,.042,.33,.145,.19,{door:true});
 const frame=[];for(let i=0;i<=30;i++){const a=i/30*Math.PI;frame.push([Math.cos(a)*.09,.155+Math.sin(a)*.09,.34]);}k.line(g,frame,.004,p.pale);
 k.beam(g,[-.105,.23,.339],[0,.33,.339],.004,p.pale);k.beam(g,[0,.33,.339],[.105,.23,.339],.004,p.pale);
 const rose=lit(k,'#536673',.04);k.mesh(g,new THREE.CircleGeometry(.056,48),rose,0,.375,.329);k.mesh(g,new THREE.TorusGeometry(.059,.004,6,48),p.pale,0,.375,.333);k.mesh(g,new THREE.TorusGeometry(.018,.0015,5,32),p.pale,0,.375,.338);
 for(let i=0;i<6;i++){const a=i/6*TAU;k.mesh(g,new THREE.TorusGeometry(.018,.0015,5,24),p.pale,Math.sin(a)*.033,.375+Math.cos(a)*.033,.338);}
 for(let i=0;i<3;i++)archPane(k,g,p,(i-1)*.044,.439,.331,.029,.055);
 for(let i=0;i<9;i++)archPane(k,g,p,(i-4)*.027,.506,.333,.017,.027);
 for(const side of [-1,1])for(let i=0;i<4;i++){const q=new THREE.Group();q.position.set(side*.181,.11,-.26+i*.13);q.rotation.y=side*Math.PI/2;g.add(q);archPane(k,q,p,0,0,0,.056,.14);}
 steps(k,g,p,0,.485,.63,5,.025,.075);grove(k,g,h,[[-.49,-.23,.14],[.48,-.25,.14]]);
 return finish(k,g,{lamps:[[-.40,.024,.39],[.4,.024,.39]],visitors:[[-.10,.046,.43],[.08,.046,.45],[.15,.046,.43]]});
}
export function station(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.69,.48);paving(k,g,p,.60,.34);
 k.box(g,1.04,.25,.29,p.wall,0,.16,-.03);const roof=new THREE.Group();roof.position.z=-.03;roof.rotation.y=Math.PI/2;g.add(roof);gable(k,roof,p,.32,1.10,.12,.285);
 // The clock is offset beside the gabled entrance, as on the historic east facade.
 const x=-.19,z=.035;k.box(g,.19,.57,.20,p.wall,x,.32,z);masonry(k,g,p,.19,.57,.20,x,.035,z);pyramid(k,g,p,.235,.26,.605,x,z);
 for(const y of [.32,.56,.60])k.box(g,.207,.01,.215,p.pale,x,y,z);
 for(const [a,b]of [[0,1],[1,0],[-1,0],[0,-1]]){const q=new THREE.Group();q.position.set(x+a*.105,.61,z+b*.105);q.rotation.y=Math.atan2(a,b);g.add(q);const ped=new THREE.Shape();ped.moveTo(-.104,0);ped.lineTo(.104,0);ped.lineTo(0,.153);ped.closePath();k.mesh(q,new THREE.ShapeGeometry(ped),p.wall);clockFace(k,q,p,0,.058,.003,.041);}
 k.cyl(g,.004,.006,.055,p.gold,x,.890,z,8);const star=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*TAU,r=i%2?.007:.017;i?star.lineTo(Math.sin(a)*r,Math.cos(a)*r):star.moveTo(Math.sin(a)*r,Math.cos(a)*r);}star.closePath();k.mesh(g,new THREE.ExtrudeGeometry(star,{depth:.003,bevelEnabled:false}),p.red,x,.927,z);
 for(const dx of [-.043,.043])for(const y of [.155,.215])archPane(k,g,p,x+dx,y,.138,.021,.045);
 const doorX=.125;k.box(g,.255,.29,.018,p.wall,doorX,.181,.129);const ped=new THREE.Shape();ped.moveTo(-.143,0);ped.lineTo(.143,0);ped.lineTo(.110,.045);ped.lineTo(.085,.045);ped.lineTo(.085,.10);ped.lineTo(.060,.10);ped.lineTo(0,.19);ped.lineTo(-.060,.10);ped.lineTo(-.085,.10);ped.lineTo(-.085,.045);ped.lineTo(-.110,.045);ped.closePath();k.mesh(g,new THREE.ExtrudeGeometry(ped,{depth:.018,bevelEnabled:false}),p.wall,doorX,.326,.120);
 for(const dx of [-.086,0,.086]){archPane(k,g,p,doorX+dx,.034,.151,.056,.123,{door:true});archPane(k,g,p,doorX+dx,.204,.151,.030,.080);}
 for(const xx of [-.46,-.355,.35,.455]){archPane(k,g,p,xx,.044,.119,.055,.099,{door:true});archPane(k,g,p,xx,.177,.119,.035,.063);}
 for(const xx of [-.435,-.34,.34,.435]){k.box(g,.052,.033,.025,p.wall,xx,.325,.090);gable(k,g,p,.063,.040,.027,.341,xx,.09);}
 sign(k,g,'青岛站',.115,.027,.125,.294,.154,{background:'#d2c5a5',color:'#404c46'});grove(k,g,h,[[-.58,-.24,.12],[.58,-.24,.13]]);
 return finish(k,g,{lamps:[[-.47,.024,.27],[.47,.024,.27]],visitors:[[-.10,.024,.24],[.14,.024,.27],[.2,.024,.27]]});
}
export function huashi(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.57,.53);paving(k,g,p,.42,.37);p.wall.color.set('#949282');p.pale.color.set('#c7c4ad');p.wall.onBeforeCompile=sh=>{sh.vertexShader='varying vec3 vGranite;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGranite=position;');sh.fragmentShader='varying vec3 vGranite;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float gr=sin(vGranite.x*497.+sin(vGranite.y*711.))*sin(vGranite.z*661.+vGranite.y*553.);
diffuseColor.rgb*=.91+.09*gr;`);};p.wall.customProgramCacheKey=()=> 'qingdao-granite-v1';
 k.box(g,.43,.37,.35,p.wall,.03,.226,-.055);masonry(k,g,p,.43,.37,.35,.03,.041,-.055);
 k.box(g,.48,.025,.39,p.pale,.03,.421,-.055);k.box(g,.48,.035,.024,p.wall,.03,.442,-.242);k.box(g,.024,.035,.39,p.wall,.258,.442,-.055);
 for(let i=0;i<5;i++)archPane(k,g,p,-.12+i*.075,.24,.123,.042,.115);
 const tower=new THREE.Group();tower.position.set(-.17,0,.14);g.add(tower);const r=.115;
 k.cyl(tower,r,r,.57,p.wall,0,.326,0,48);
 for(const y of [.24,.43,.56,.61])k.cyl(tower,r+.008,r+.008,.012,p.pale,0,y,0,48);
 for(let row=0;row<24;row++){const y=.05+row*.023;k.ring(tower,r+.001,.0006,p.wood,y);}
 for(let level=0;level<3;level++)for(let i=0;i<8;i++){const a=i/8*TAU,q=new THREE.Group();q.position.set(Math.sin(a)*(r+.001),.085+level*.17,Math.cos(a)*(r+.001));q.rotation.y=a;tower.add(q);archPane(k,q,p,0,0,0,.037,.115);}
 for(let i=0;i<12;i++){const a=i/12*TAU;const o=k.box(tower,.038,.032,.018,p.wall,Math.sin(a)*r,.634,Math.cos(a)*r);o.rotation.y=a;}
 k.box(g,.19,.016,.17,p.pale,.105,.272,.22);for(const xx of [.025,.18]){k.cyl(g,.008,.011,.18,p.pale,xx,.174,.281,12);k.box(g,.024,.008,.024,p.pale,xx,.258,.281);}
 archPane(k,g,p,.105,.039,.128,.075,.18,{door:true});steps(k,g,p,.105,.40,.23,7,.05,.12);
 for(let i=0;i<10;i++){const x=.014+i*.018;k.box(g,.005,.042,.005,p.pale,x,.300,.298);}k.box(g,.20,.006,.008,p.pale,.105,.324,.298);
 grove(k,g,h,[[-.41,-.15,.20],[.40,-.19,.19],[.28,-.37,.18],[-.20,-.38,.17]]);
 return finish(k,g,{lamps:[[-.32,.024,.30],[.32,.024,.30]],visitors:[[-.03,.024,.40],[.18,.024,.42]]});
}
