import * as THREE from 'three';
import {palette,site,paving,roof,sign,archOpening,finish,lantern,lit,lattice} from './dali-kit.js';

export function yan(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.76,.67);paving(k,g,p,.64,.55);
 const wood=lit(k,'#773c2b',.13),dark=k.mat('#352c25',.96),cream=k.mat('#c6c2a9',.96),blue=k.mat('#345477',.94),stone=k.mat('#93998e',.98),pink=k.mat('#b38371',.97),warm=lit(k,'#e4ba7b',.55);
 const frame=(parent,x,y,z,w,h)=>{k.box(parent,w,h,.004,dark,x,y,z);lattice(k,parent,x,y,z+.004,w*.92,h*.94,wood);for(const yy of [-h/2,h/2])k.box(parent,w+.009,.004,.012,wood,x,y+yy,z+.002);};
 const border=(parent,x,y,z,w,h,mat=blue)=>{for(const xx of [-w/2,w/2])k.box(parent,.003,h,.004,mat,x+xx,y,z);for(const yy of [-h/2,h/2])k.box(parent,w,.003,.004,mat,x,y+yy,z);};
 const scroll=(parent,x,y,z,w,h)=>{border(parent,x,y,z,w,h);for(const s of [-1,1]){const ring=k.mesh(parent,new THREE.TorusGeometry(h*.25,.0011,5,18,Math.PI*1.7),blue,x+s*w*.25,y,z+.002);ring.rotation.z=s<0?Math.PI:0;ring.scale.x=1.6;}};
 const balustrade=(parent,w,y,z,mat=wood,h=.052)=>{for(let i=0;i<=Math.ceil(w/.017);i++){const x=(i/Math.ceil(w/.017)-.5)*w;k.cyl(parent,.0018,.0024,h,mat,x,y+h/2,z,8);k.ball(parent,.0036,mat,x,y+h*.54,z);}for(const yy of [y+.003,y+h])k.box(parent,w+.007,.005,.008,mat,0,yy,z);};
 const block=(x,z,w,d,angle=0)=>{const b=new THREE.Group();b.position.set(x,.031,z);b.rotation.y=angle;g.add(b);
  k.box(b,w,.325,d*.62,p.wall,0,.1625,-d*.19);
  for(const yy of [.009,.172])k.box(b,w,.015,d+.054,wood,0,yy,.015);
  // The room facade is recessed behind a continuous open timber gallery.
  for(const yy of [.09,.252]){for(let i=0;i<6;i++)frame(b,(i-2.5)*w/6,yy,d*.13,w*.14,.122);k.box(b,w,.012,.022,wood,0,yy+.074,d*.54);
   for(let i=0;i<=6;i++){const xx=(i/6-.5)*w;k.cyl(b,.004,.005,.154,wood,xx,yy-.003,d*.55,10);for(let j=0;j<3;j++)k.box(b,.011+j*.010,.004,.018+j*.010,j%2?cream:wood,xx,yy+.060+j*.006,d*.55);}
   k.box(b,w*.94,.0017,.002,warm,0,yy+.065,d*.49);
  }
  balustrade(b,w,.182,d*.58);
  for(const x2 of [-w*.34,0,w*.34]){lantern(k,b,p,x2,.29,d*.62,.009);lantern(k,b,p,x2,.132,d*.62,.008);}
  roof(k,b,p,w*1.10,d*1.38,.052,.355);roof(k,b,p,w*1.08,.12,.030,.174,0,d*.44);
  const rear=new THREE.Group();rear.rotation.y=Math.PI;b.add(rear);for(let i=0;i<6;i++){const xx=(i-2.5)*w/6;frame(rear,xx,.245,d*.51,w*.12,.10);frame(rear,xx,.09,d*.51,w*.12,.10);}
  for(const s of [-1,1])k.box(b,.008,.327,d,p.pale,s*w/2,.165,0);
  return b;
 };
 block(0,-.30,.60,.18);block(-.30,-.05,.39,.17,Math.PI/2);block(.30,-.05,.47,.17,-Math.PI/2);
 sign(k,g,'第馬司',.14,.031,0,.327,-.192,{background:'#713d2a',color:'#c5a773'});
 // A square canvas keeps the calligraphic character undistorted on the Bai screen wall.
 const fu=(parent,x,y,z)=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#deded0';ctx.fillRect(0,0,512,512);ctx.fillStyle='#343b32';ctx.font='bold 360px "KaiTi","STKaiti",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('福',256,278,430);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#ffffff',.96);m.map=t;m.emissiveMap=t;m.userData.night={color:new THREE.Color('#d8cfaf'),intensity:.18};k.mesh(parent,new THREE.PlaneGeometry(.115,.115),m,x,y,z);};
 const screen=new THREE.Group();screen.position.set(0,.031,.238);g.add(screen);k.box(screen,.45,.245,.032,p.wall,0,.1225,0);roof(k,screen,p,.50,.092,.038,.251);
 for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side<0?Math.PI:0;screen.add(face);border(face,0,.128,.018,.424,.225);border(face,0,.128,.019,.333,.172);border(face,0,.128,.020,.319,.158);fu(face,0,.126,.021);
  for(const x of [-.19,.19])for(const y of [.062,.126,.19])scroll(face,x,y,.021,.032,.053);
  for(const x of [-.125,0,.125])scroll(face,x,.235,.021,.102,.018);
  for(const x of [-.147,.147])for(const y of [.052,.204]){k.box(face,.024,.008,.005,p.wall,x,y,.021);border(face,x,y,.024,.021,.009);}
 }
 // The monumental entrance uses three carved cornice layers and a real arched opening.
 const door=new THREE.Group();door.position.set(-.38,.021,.275);g.add(door);archOpening(k,door,p.wall,{w:.22,h:.24,opening:.12,rise:.19,d:.065});
 for(const s of [-1,1]){const x=s*.086;k.box(door,.025,.155,.078,cream,x,.078,0);border(door,x,.082,.042,.017,.14);scroll(door,x,.205,.043,.036,.033);k.box(door,.040,.014,.085,stone,x,.008,0);}
 for(let i=0;i<3;i++){const w=.278-i*.040,y=.254+i*.039;k.box(door,w,.023,.075,cream,0,y,0);border(door,0,y,.039,w-.015,.018);for(let j=0;j<7-i;j++)scroll(door,(j-(6-i)/2)*(w-.03)/(7-i),y,.043,(w-.05)/(7-i),.014);roof(k,door,p,w+.02,.12,.022,y+.013);}
 k.box(g,.052,.16,.030,p.wall,-.246,.101,.238);
 const crest=new THREE.Shape();crest.moveTo(-.065,.352);crest.quadraticCurveTo(-.054,.382,-.031,.382);crest.quadraticCurveTo(0,.410,.031,.382);crest.quadraticCurveTo(.054,.382,.065,.352);crest.closePath();k.mesh(door,new THREE.ExtrudeGeometry(crest,{depth:.03,bevelEnabled:false}),cream,0,0,-.015);scroll(door,0,.366,.017,.065,.02);
 sign(k,door,'院大家嚴',.145,.032,0,.227,.042,{background:'#793a31',color:'#c9b582'});
 for(const x of [-.126,.126]){k.beam(door,[x,.272,0],[x,.272,.065],.003,wood);for(const yy of [.237,.211])lantern(k,door,p,x,yy,.065,.011);}
 // Western villa: masonry cornices, a projecting central balcony and stone balusters.
 const villa=new THREE.Group();villa.position.set(.48,.030,-.40);g.add(villa);k.box(villa,.29,.35,.22,p.wall,0,.175,0);
 const base=new THREE.BoxGeometry(.318,1,.248,8,1,8),ba=base.attributes.position;for(let i=0;i<ba.count;i++){const x=ba.getX(i),z=ba.getZ(i);ba.setY(i,ba.getY(i)>0?0:ground(x+.48,z-.40)-.030+.0005);}base.computeVertexNormals();k.mesh(villa,base,p.pale);
 for(let j=0;j<7;j++){const y=-.010-j*.019;for(const side of [-1,1]){for(let n=0;n<20;n++){const x=(n/19-.5)*.318,z=side*.124;if(y>ground(x+.48,z-.40)-.030+.002)k.box(villa,.017,.001,.001,stone,x,y,z);}}}


 for(const x of [-.132,.132])for(const z of [-.113,.113]){k.box(villa,.027,.35,.018,pink,x,.175,z);for(let i=0;i<10;i++)k.box(villa,.030,.003,.020,p.pale,x,.025+i*.033,z);}
 for(const yy of [.015,.172,.349]){k.box(villa,.306,.012,.238,stone,0,yy,0);k.box(villa,.318,.006,.248,p.pale,0,yy+.009,0);}
 const win=(parent,x,y,z,w,h)=>{k.box(parent,w+.016,h+.019,.009,p.pale,x,y,z);k.box(parent,w,h,.008,dark,x,y,z+.005);k.box(parent,.004,h,.013,stone,x,y,z+.01);for(let i=0;i<8;i++)k.box(parent,w,.0017,.004,wood,x,y-h*.42+i*h*.12,z+.011);k.box(parent,w+.024,.008,.016,stone,x,y+h*.57,z+.004);};
 for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side<0?Math.PI:0;villa.add(face);for(const yy of [.091,.259])for(const xx of [-.087,.087])win(face,xx,yy,.114,.043,.101);win(face,0,.085,.114,.052,.115);
  if(side===1){archOpening(k,face,cream,{w:.086,h:.13,opening:.062,rise:.11,d:.018,x:0,y:.197,z:.126});k.box(face,.057,.10,.005,dark,0,.252,.115);k.box(face,.12,.010,.063,stone,0,.195,.147);const balcony=new THREE.Group();balcony.position.z=.18;face.add(balcony);balustrade(balcony,.11,.200,0,stone,.038);for(const x of [-.055,.055]){k.box(face,.008,.039,.052,stone,x,.219,.156);k.box(face,.012,.007,.056,p.pale,x,.24,.156);} }
 }
 for(const s of [-1,1]){const face=new THREE.Group();face.rotation.y=s*Math.PI/2;villa.add(face);for(const y of [.091,.259])for(const x of [-.058,.058])win(face,x,y,.146,.047,.10);}
 for(const z of [-.11,.11])balustrade(villa,.285,.366,z,stone,.035);for(const s of [-1,1]){const b=new THREE.Group();b.rotation.y=Math.PI/2;b.position.x=s*.143;villa.add(b);balustrade(b,.215,.366,0,stone,.035);}
 // Carved paving panels and potted plants are confined to the photographed courtyard.
 for(const x of [-.105,.105]){const tile=new THREE.Group();tile.position.set(x,.026,-.03);tile.rotation.x=-Math.PI/2;g.add(tile);border(tile,0,0,0,.17,.15,stone);k.line(tile,[[-.05,-.05,.001],[-.025,-.012,.001],[.01,.018,.001],[.035,.05,.001]],.0011,stone);for(let i=0;i<3;i++){const o=k.mesh(tile,new THREE.TorusGeometry(.012,.0011,5,18),stone,-.023+i*.024,-.012+i*.02,.001);o.scale.y=.55;}}
 for(const [x,z,s]of [[-.16,.215,.8],[.16,.215,.8],[-.20,-.14,.8],[.20,-.14,.8]]){k.cyl(g,.018*s,.013*s,.025,pink,x,.039,z,12);k.cyl(g,.002,.003,.058,wood,x,.073,z,8);for(let i=0;i<4;i++)k.ball(g,.022*s,p.leaf,x+Math.sin(i*2.4)*.015,.098+(i%2)*.015,z+Math.cos(i*2.4)*.014);}
 return finish(k,g,{lamps:[[-.25,.025,.42],[.27,.025,.39]],visitors:[[0,.025,.09],[-.38,.021,.40],[.20,.025,-.12]]});
}
