import * as THREE from 'three';
import {palette,site,sea,lit,finish} from './dali-kit.js';

// Miniature bridge: five open spans, stone-clad ribs and repeated hollow pylons.
export function xingsheng(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.83,.57);sea(k,g,p,.82,.56);
 const stone=lit(k,'#d4d7cf',.10),edge=lit(k,'#c3c9c4',.34),joint=k.mat('#909b98'),blue=lit(k,'#728f9b',.16),gold=lit(k,'#b99751',.28),iron=k.mat('#496374'),deck=k.mat('#a3ada6'),road=k.mat('#69716e');
 stone.userData.bridgeStone=true;deck.userData.bridgeDeck=true;road.userData.bridgeDeck=true;
 const lamp=lit(k,'#d5cda7',.72),warm=lit(k,'#b6b6a1',.56);warm.userData.pulse={speed:.32,phase:.7};
 const rib=(cx,z)=>{const shape=new THREE.Shape(),N=48;
  for(let i=0;i<=N;i++){const t=-1+2*i/N,y=.035+.160*(1-t*t);if(i)shape.lineTo(cx+t*.134,y);else shape.moveTo(cx+t*.134,y);}
  for(let i=N;i>=0;i--){const t=-1+2*i/N;shape.lineTo(cx+t*.144,.035+.178*(1-t*t));}shape.closePath();
  k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.020,bevelEnabled:false}),stone,0,0,z-.010);
  for(const side of [-1,1]){const zz=z+side*.0105;k.line(g,Array.from({length:49},(_,i)=>{const t=-1+2*i/48;return[cx+t*.140,.035+.171*(1-t*t),zz];}),.0024,blue);
   k.line(g,Array.from({length:49},(_,i)=>{const t=-1+2*i/48;return[cx+t*.144,.035+.179*(1-t*t),zz];}),.0012,warm);
  }
 };
 const ornament=(x,y,z,size=.014)=>{const o=new THREE.Group();o.position.set(x,y,z);g.add(o);k.ball(o,size*.20,gold,0,0,0);for(const s of [-1,1])for(let i=0;i<4;i++){const end=[s*size*(.50+.16*i),size*(.8-.15*i),0];k.line(o,[[0,0,0],[s*size*.45,size*.21,0],end],size*.06,gold);}k.line(o,[[0,-size*.65,0],[0,size*.55,0],[size*.18,size*.67,0]],size*.08,gold);};
 // Open spandrels between each parabolic rib and the horizontal roadway.
 for(let span=0;span<5;span++){
  const x=(span-2)*.28;for(const z of [-.155,0,.155])rib(x,z);
  for(const z of [-.155,.155])for(let j=0;j<7;j++){const t=-.90+j*.30,xx=x+t*.14,low=.035+.178*(1-t*t),h=.223-low;if(h>.004)k.box(g,.010,h,.020,stone,xx,low+h/2,z);}
  for(const t of [-.82,-.42,0,.42,.82]){const yy=.035+.178*(1-t*t);k.box(g,.014,.014,.32,blue,x+t*.14,yy-.004,0);}
  for(const side of [-1,1]){ornament(x,.209,side*.169,.010);for(const t of [-.70,.70])ornament(x+t*.13,.132,side*.170,.010);}
 }
 // Faceted piers and layered cornices continue below the open pylons.
 for(const x of [-.70,-.42,-.14,.14,.42,.70]){
  k.box(g,.044,.187,.35,stone,x,.127,0);k.box(g,.058,.018,.36,edge,x,.043,0);
  for(const z of [-.179,.179]){const cut=k.mesh(g,new THREE.CylinderGeometry(.030,.039,.130,4),stone,x,.115,z);cut.rotation.y=Math.PI/4;k.box(g,.068,.016,.061,edge,x,.192,z);ornament(x,.132,z+Math.sign(z)*.031,.015);}
  for(let j=0;j<6;j++)for(const z of [-.197,.197])k.box(g,.045,.001,.0013,joint,x,.064+j*.022,z);
 }
 k.box(g,1.43,.018,.36,deck,0,.229,0);k.box(g,1.43,.004,.23,road,0,.240,0);
 for(const z of [-.148,.148])k.box(g,1.43,.012,.052,deck,0,.244,z);
 for(const z of [-.181,.181]){k.box(g,1.44,.009,.009,edge,0,.237,z);k.box(g,1.44,.003,.012,warm,0,.225,z);}
 for(const z of [-.036,.036])for(let i=0;i<24;i++)k.box(g,.030,.0007,.0015,p.pale,-.68+i*.059,.2425,z);
 for(const z of [-.004,.004])k.box(g,1.42,.0007,.0015,gold,0,.2425,z);
 // Stone posts, curved iron panels and restrained gold emblems.
 for(const z of [-.178,.178]){
  for(let i=0;i<=32;i++){const x=-.704+i*.044;if(i%4===0){k.box(g,.014,.046,.017,stone,x,.272,z);k.box(g,.020,.005,.023,edge,x,.297,z);}else k.box(g,.002,.037,.0025,iron,x,.271,z);}
  k.box(g,1.43,.004,.007,edge,0,.299,z);
  for(let j=0;j<8;j++){const x=-.616+j*.176;for(const shift of [-.048,0,.048])k.line(g,[[x+shift-.020,.291,z],[x+shift-.013,.263,z],[x+shift,.256,z],[x+shift+.013,.263,z],[x+shift+.020,.291,z]],.0013,iron);ornament(x,.272,z+Math.sign(z)*.003,.010);}
 }
 for(const x of [-.42,-.14,.14,.42])for(const z of [-.180,.180]){
  const tower=new THREE.Group();tower.position.set(x,.250,z);g.add(tower);
  // Taller inner pylons, shorter outer pylons: same open construction.
  const scale=Math.abs(x)<.2?1:.82;tower.scale.y=scale*.70;
  for(const [w,h,y]of [[.104,.018,.009],[.091,.016,.026],[.075,.045,.0565],[.084,.008,.083],[.075,.007,.092]])k.box(tower,w,h,w,stone,0,y,0);
  for(const a of [-1,1])for(const b of [-1,1])k.box(tower,.014,.154,.014,stone,a*.025,.173,b*.025);
  for(const yy of [.102,.144,.186,.225])for(const a of [-1,1])for(const b of [-1,1])k.box(tower,.0145,.0008,.0145,joint,a*.025,yy,b*.025);
  for(const [w,h,y]of [[.075,.009,.254],[.087,.007,.262],[.074,.030,.280],[.094,.008,.300],[.078,.013,.310],[.064,.011,.322],[.078,.007,.332],[.056,.014,.342],[.064,.006,.352]])k.box(tower,w,h,w,edge,0,y,0);
  k.cyl(tower,.004,.013,.038,gold,0,.374,0,16);for(let i=0;i<5;i++)k.cyl(tower,.012-i*.0016,.012-i*.0016,.002,gold,0,.360+i*.007,0,16);
  k.cyl(tower,.018,.008,.004,gold,0,.396,0,20);k.ball(tower,.004,gold,0,.404,0);k.cyl(tower,.0006,.0016,.028,gold,0,.422,0,8);
  for(const side of [-1,1])k.box(tower,.002,.142,.0015,warm,side*.017,.175,side*.033);
 }
 // Two low waterfront landings with stairs; no tall blank blocks at the ends.
 for(const side of [-1,1]){
  const x=side*.737;
  k.box(g,.125,.079,.64,stone,x,.0095,.070);k.box(g,.12,.010,.15,deck,x,.244,-.005);
  // Descend from the bridge sidewalk toward the near bank.
  for(let i=0;i<10;i++){const top=.249-i*.0202,z=.085+i*.026;k.box(g,.12,top-.049,.030,stone,x,(top+.049)/2,z);}
  for(const sign of [-1,1])k.line(g,[[x+sign*.055,.292,.070],[x+sign*.055,.110,.325]],.0022,iron);
 }
 // Curled lamp arms visible in the close photographs.
 for(const x of [-.56,0,.56])for(const z of [-.162,.162]){
  k.cyl(g,.0022,.0035,.115,iron,x,.3075,z,8);k.box(g,.010,.019,.010,stone,x,.356,z);k.ball(g,.004,lamp,x,.373,z);
  for(const side of [-1,1]){k.line(g,[[x,.352,z],[x+side*.014,.371,z],[x+side*.025,.368,z],[x+side*.028,.356,z]],.0012,iron);k.cyl(g,.008,.005,.006,iron,x+side*.028,.352,z,12);k.ball(g,.0045,lamp,x+side*.028,.349,z);}
 }
 return finish(k,g,{visitors:[[-.54,.250,.145],[.33,.250,-.145]]});
}
