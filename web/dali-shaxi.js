import * as THREE from 'three';
import {palette,site,disc,grove,roof,lit,sign,finish,lattice} from './dali-kit.js';

export function shaxi(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.72,.61);
 const stone=k.mat('#8f7764',.98),joint=k.mat('#9e9785',.98),wood=lit(k,'#69483a',.10),dark=k.mat('#3c322b',.96),tile=k.mat('#73796d',.96),cream=k.mat('#b8b49a',.96),blue=lit(k,'#3c5067',.12),gold=k.mat('#b3a16f',.91),warm=lit(k,'#c9ae80',.65),plaster=k.mat('#c9c8b7',.97);
 const rp={...p,tile,pale:cream};
 const pavement=k.mat('#aaa28b',.98);pavement.userData.shaxiPaving=true;
 const paved=(x,z)=>THREE.MathUtils.lerp(.023,ground(x,z)+.003,THREE.MathUtils.smoothstep(Math.hypot(x/.64,z/.52),.64,1));
 disc(k,g,.64,.52,paved,pavement);
 for(let row=-7;row<=7;row++){const z=row*.063,w=.64*Math.sqrt(Math.max(0,1-(z/.52)**2));k.line(g,Array.from({length:65},(_,i)=>{const x=-w+2*w*i/64;return[x,paved(x,z)+.001,z];}),.00065,joint);for(let col=-6;col<=6;col++){const x=(col+(row%2)*.5)*.096;if(Math.hypot(x/.62,z/.49)<.96)k.line(g,[[x,paved(x,z)+.001,z],[x,paved(x,z+.06)+.001,z+.06]],.0006,joint);}}
 const footing=(x,z,w,d,top,mat)=>{const geo=new THREE.BoxGeometry(w,1,d,8,1,12),a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i)+x,zz=a.getZ(i)+z;a.setXYZ(i,xx,a.getY(i)>0?top:ground(xx,zz)+.0005,zz);}geo.computeVertexNormals();return k.mesh(g,geo,mat);};
 const frame=(parent,x,y,z,w,h)=>{k.box(parent,w,h,.004,dark,x,y,z);lattice(k,parent,x,y,z+.004,w*.94,h*.93,wood);for(const yy of [-h*.52,h*.52])k.box(parent,w+.012,.006,.014,wood,x,y+yy,z+.002);};
 const panel=(parent,x,y,z,w,h)=>{k.box(parent,w,h,.008,blue,x,y,z);for(const yy of [-h/2,h/2])k.box(parent,w,.002,.010,cream,x,y+yy,z);for(const xx of [-w/2,w/2])k.box(parent,.002,h,.010,cream,x+xx,y,z);for(let i=0;i<Math.max(2,Math.round(w/.038));i++){const xx=x+((i+.5)/Math.max(2,Math.round(w/.038))-.5)*w*.95;const ring=k.mesh(parent,new THREE.TorusGeometry(Math.min(.008,h*.28),.001,5,14,Math.PI*1.72),gold,xx,y,z+.006);ring.rotation.z=i%2?Math.PI:0;}};
 const brack=(parent,x,y,z)=>{for(let j=0;j<4;j++){k.box(parent,.022+j*.011,.007,.028+j*.011,j%2?cream:wood,x,y+j*.009,z+j*.005);k.box(parent,.008,.008,.014,gold,x,y+j*.009-.006,z+j*.005);}};
 const roofDetail=(w,d,h,y,x,z)=>{
  roof(k,g,rp,w,d,h,y,x,z);
  // Decorative pierced ridge bands sit above the eaves; they are not solid walls.
  for(const side of [-1,1]){const pts=[];for(let i=0;i<=40;i++){const u=(i/40-.5)*2;pts.push([x+u*w*.46,y+h*.36+.038*Math.abs(u)**4,z+side*d*.32]);}k.line(g,pts,.003,cream);
   for(let i=0;i<18;i++){const u=(i/17-.5)*2,yy=y+h*.36+.038*Math.abs(u)**4;const o=k.mesh(g,new THREE.TorusGeometry(.006,.0012,5,14),cream,x+u*w*.43,yy-.012,z+side*d*.32);o.scale.y=.8;}
   for(let i=0;i<52;i++){const u=(i/51-.5)*2,xx=x+u*w*.48,yy=y+.037*Math.abs(u)**8;k.cyl(g,.002,.002,.012,wood,xx,yy-.009,z+side*d*.45,6);k.ball(g,.0022,cream,xx,yy,z+side*d*.50);}
   for(const s of [-1,1]){const xx=x+s*w*.40,zz=z+side*d*.32,yy=y+h*.36+.027;k.line(g,[[xx,yy,zz],[xx+s*.010,yy+.010,zz],[xx+s*.004,yy+.017,zz],[xx+s*.015,yy+.025,zz]],.0032,stone);k.ball(g,.005,stone,xx+s*.014,yy+.025,zz);}
  }
 };
 // The stone piers support an open stage, with wooden shop shutters below it.
 for(const x of [-.265,.265]){footing(x,.045,.085,.37,.218,stone);for(let j=0;j<7;j++){k.box(g,.085,.001,.001,joint,x,.034+j*.026,.232);for(const s of [-1,1])k.box(g,.001,.001,.37,joint,x+s*.043,.034+j*.026,.045);}}
 k.box(g,.46,.16,.18,plaster,0,.103,-.12);for(let i=0;i<10;i++)k.box(g,.043,.155,.009,wood,(i-4.5)*.045,.105,-.024);
 const stage=k.mat('#826753',.96);stage.userData.shaxiStage=true;k.box(g,.61,.020,.43,stage,0,.221,.025);k.box(g,.56,.010,.43,wood,0,.236,.025);
 for(const x of [-.265,.265])for(const z of [-.13,.20]){k.cyl(g,.007,.010,.345,wood,x,.413,z,12);k.box(g,.025,.016,.026,stone,x,.249,z);brack(g,x,.548,z);}
 k.box(g,.35,.33,.025,wood,0,.409,-.153);for(const x of [-.263,.263])k.box(g,.024,.33,.025,wood,x,.409,-.153);k.box(g,.55,.075,.025,wood,0,.536,-.153);
 for(let i=0;i<3;i++)frame(g,(i-1)*.108,.345,-.138,.093,.18);
 // Three muted landscape panels suggest the existing painted backdrop, without a fictitious event poster.
 for(let i=0;i<3;i++){const x=(i-1)*.162;panel(g,x,.512,-.132,.155,.080);k.box(g,.143,.067,.003,k.mat(i===1?'#a39055':'#999b88',.95),x,.512,-.126);for(let j=0;j<3;j++){const shape=new THREE.Shape();shape.moveTo(x-.07,.482);shape.lineTo(x-.055,.498+j*.009);shape.lineTo(x-.018,.489+j*.011);shape.lineTo(x+.015,.506+j*.006);shape.lineTo(x+.065,.488);shape.lineTo(x+.07,.482);shape.closePath();k.mesh(g,new THREE.ShapeGeometry(shape),k.mat(['#777d6f','#67776e','#576f68'][j],.98),0,0,-.123+j*.0007);}}
 k.box(g,.51,.015,.34,wood,0,.579,.024);
 for(const x of [-.17,0,.17])for(const z of [-.065,.055,.175]){const o=k.mesh(g,new THREE.RingGeometry(.022,.030,8),blue,x,.570,z);o.rotation.x=Math.PI/2;for(const rr of [.021,.030]){const ring=k.mesh(g,new THREE.TorusGeometry(rr,.0015,5,8),gold,x,.568,z);ring.rotation.x=Math.PI/2;}}
 panel(g,0,.564,.215,.57,.044);panel(g,0,.523,.218,.46,.022);
 for(const x of [-.247,.247]){panel(g,x,.413,.215,.025,.29);for(let i=0;i<6;i++){const y=.287+i*.045;k.line(g,[[x-.008,y,.224],[x+.006,y+.008,.224],[x-.006,y+.017,.224],[x+.008,y+.023,.224]],.0012,gold);}}
 for(let i=0;i<7;i++)brack(g,(i-3)*.084,.575,.187);
 roofDetail(.80,.52,.092,.615,0,.01);
 // Rear Kuixing pavilion rises through the broad stage roof, not as a detached red box.
 k.box(g,.31,.30,.25,wood,0,.690,-.145);k.box(g,.38,.010,.34,wood,0,.651,-.145);
 for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side<0?Math.PI:0;face.position.z=-.145;g.add(face);for(let i=0;i<4;i++)frame(face,(i-1.5)*.067,.747,.127,.057,.115);for(const x of [-.178,.178]){k.cyl(face,.007,.008,.19,wood,x,.742,.16,10);brack(face,x,.816,.16);}panel(face,0,.827,.167,.35,.026);}
 for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side*Math.PI/2;face.position.z=-.145;g.add(face);for(let i=0;i<3;i++)frame(face,(i-1)*.066,.742,.156,.057,.12);}
 roofDetail(.55,.45,.090,.870,0,-.145);
 sign(k,g,'照普光文',.19,.035,0,.822,.029,{background:'#34362c',color:'#bfae77'});
 k.cyl(g,.009,.015,.018,stone,0,.969,-.145,12);k.ball(g,.013,stone,0,.988,-.145);k.cyl(g,.002,.006,.023,cream,0,1.006,-.145,12);
 for(const y of [.599,.855])k.box(g,y<.65?.46:.30,.002,.003,warm,0,y,y<.65?.18:.014);
 // Two attached historic shop wings, with lower porch eaves and recessed timber windows.
 for(const s of [-1,1]){const x=s*.445;footing(x,-.09,.29,.32,.03,stone);k.box(g,.285,.35,.28,plaster,x,.205,-.09);k.box(g,.285,.016,.32,wood,x,.216,-.075);
  for(let i=0;i<4;i++){frame(g,x+(i-1.5)*.064,.292,.052,.054,.124);frame(g,x+(i-1.5)*.064,.117,.052,.054,.143);}
  for(const xx of [x-.14,x+.14])k.cyl(g,.005,.006,.35,wood,xx,.205,.09,8);
  roof(k,g,rp,.34,.37,.057,.39,x,-.09);roof(k,g,rp,.34,.17,.035,.207,x,.087);
  k.box(g,.25,.002,.003,warm,x,.197,.161);
  for(const yy of [.10,.29]){const rear=new THREE.Group();rear.position.set(x,0,-.231);rear.rotation.y=Math.PI;g.add(rear);for(let i=0;i<3;i++)frame(rear,(i-1)*.08,yy,0,.065,.105);}
  // Rear stairs remain part of the building module and connect to the stage at the same height.
  const n=12,from=-.48,to=-.19,start=paved(s*.215,from);for(let j=0;j<n;j++){const z=from+(j+.5)/n*(to-from),top=start+(.241-start)*(j+1)/n;footing(s*.215,z,.072,(to-from)/n+.001,top,stone);}
 }
 for(let j=0;j<9;j++)k.box(g,.31,.0012,.001,dark,0,.55+j*.033,-.271);for(let j=0;j<8;j++)k.box(g,.35,.0012,.001,dark,0,.25+j*.033,-.166);
 grove(k,g,ground,[[.55,.23,.18],[-.50,-.31,.17]]);
 return finish(k,g,{lamps:[[-.36,paved(-.36,.37),.37],[.34,paved(.34,.38),.38]],visitors:[[-.08,.023,.34],[.11,.023,.29],[-.29,.023,.30],[.26,.023,.37]]});
}
