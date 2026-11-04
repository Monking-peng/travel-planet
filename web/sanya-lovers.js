import * as THREE from 'three';
import {palette,site,skin,disc,palms,lit,smoothRock,texturedStone,finish,TAU} from './sanya-kit.js';
export const LOVERS_DECK=.150;
function pavilionRoof(k,g,p,{w,d,y,h,z}){
 const rim=lit(k,'#6d3d2e',.28,null,'#d9b27d');
 const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
 for(let f=0;f<4;f++){
  const a=corners[f],b=corners[(f+1)%4],at=(u,v)=>{const ex=a[0]+(b[0]-a[0])*u,ez=a[1]+(b[1]-a[1])*u,t=.002+.998*v;return [ex*t,y+h*(1-t)**1.35+.012*t**6*(2*Math.abs(u-.5))**7,z+ez*t];};skin(k,g,at,20,40,p.tile);
  k.line(g,Array.from({length:25},(_,i)=>at(i/24,1)),.0022,rim);
  for(let i=0;i<=24;i++)k.line(g,Array.from({length:18},(_,j)=>{const q=at(i/24,.05+.95*j/17);q[1]+=.001;return q;}),.0007,p.tile);
  k.line(g,Array.from({length:24},(_,i)=>at(0,i/23)),.0017,p.red);
 }
 k.cyl(g,.002,.006,.028,p.red,0,y+h+.014,z,12);k.ball(g,.003,p.gold,0,y+h+.029,z);
}
function heart(k,g,p,x,y,z,s){const pts=Array.from({length:65},(_,j)=>{const a=j/64*TAU;return [x,y+(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/32*s,z+16*Math.sin(a)**3/32*s];});k.line(g,pts,.0019,p.heart||p.red,true);}
export function lovers(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,p,{sea:true});p.tile=k.mat('#693f31',.93,.02);p.tile.userData.night={color:new THREE.Color('#9d7457'),intensity:.025};p.red.userData.night={color:new THREE.Color('#c6a176'),intensity:.035};
 disc(k,g,.57,.21,.034,p.sand,0,.39);
 smoothRock(k,g,p,{x:0,y:.028,z:-.33,rx:.17,ry:.059,rz:.16,seed:2});
 for(const [x,z,rx,rz,seed]of [[-.31,-.29,.09,.07,4],[.28,-.19,.075,.10,7],[.37,.06,.06,.05,9]])smoothRock(k,g,p,{x,y:.018,z,rx,ry:.020,rz,seed});
 const railLight=lit(k,'#87422e',.20,null,'#d6bd86');p.heart=railLight;
 const timber=k.mat('#874b3b',.94,.015);timber.userData.loversDeck=true;
 timber.onBeforeCompile=s=>{s.vertexShader='varying vec3 vLoversWood;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLoversWood=position;');s.fragmentShader='varying vec3 vLoversWood;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=sin(vLoversWood.z*1300.+sin(vLoversWood.x*47.)*2.);diffuseColor.rgb*=.94+.06*grain;');};timber.customProgramCacheKey=()=> 'lovers-timber-grain';
 // Deck planks, structural beams and masonry pier pads are separate visible parts.
 for(let i=0;i<47;i++){const z=.46-i*.019;k.box(g,.158,.012,.0187,timber,0,LOVERS_DECK,z);}
 k.box(g,.148,.004,.91,timber,0,LOVERS_DECK-.009,.025);
 for(const x of [-.061,.061])k.box(g,.015,.025,.91,p.wood,x,LOVERS_DECK-.018,.025);
 const stone=texturedStone(k,'#949487');stone.userData.loversPier=true;
 for(const z of [-.30,-.12,.06,.24,.405]){
  k.box(g,.115,.018,.075,stone,0,.030,z);k.box(g,.048,.100,.045,stone,0,.089,z);k.box(g,.102,.019,.06,stone,0,.132,z);
  for(let row=0;row<5;row++)for(let j=0;j<3;j++){const xx=(j-1)*.015+(row%2?-.004:.003),y=.050+row*.017;for(const side of [-1,1])k.box(g,.012,.013,.001,p.pale,xx,y,z+side*.023);}
 }
 // Both sides retain framed double-heart inserts rather than solid fence panels.
 for(const side of [-1,1]){
  const x=side*.082;for(const yy of [.170,.234])k.box(g,.009,.007,.91,railLight,x,yy,.025);
  for(let i=0;i<=18;i++){const z=.475-i*.05;k.box(g,.007,.083,.007,p.red,x,.197,z);if(i===18)continue;const zz=z-.025;for(const q of [-.017,.017])k.box(g,.004,.062,.003,p.red,x,.202,zz+q);for(const y of [.178,.225])k.box(g,.004,.003,.037,p.red,x,y,zz);heart(k,g,p,x,.203,zz,.036);heart(k,g,p,x,.203,zz,.023);}
 }
 // A stepped timber approach joins the beach to the full-height bridge.
 for(let i=0;i<7;i++){const top=.034+(i+1)*(.122/7),z=.592-i*.019;k.box(g,.180,top-.032,.020,timber,0,(top+.032)/2,z);}
 for(const x of [-.092,.092]){k.line(g,[[x,.133,.60],[x,.235,.476]],.003,p.red);for(let j=0;j<4;j++){const z=.592-j*.036,base=.034+(1+j*1.9)*(.122/7);k.box(g,.005,.073,.005,p.red,x,base+.036,z);}}
 const platform=k.box(g,.27,.022,.25,timber,0,.145,-.34);platform.material.userData.loversDeck=true;
 for(const x of [-.108,.108])for(const z of [-.43,-.25]){k.cyl(g,.006,.007,.160,p.red,x,.236,z,12);for(let j=0;j<3;j++)k.box(g,.016+j*.007,.004,.030+j*.006,p.red,x,.291+j*.005,z);}
 for(const z of [-.43,-.25])k.box(g,.235,.012,.013,p.red,0,.309,z);
 for(const x of [-.108,.108])k.box(g,.013,.012,.20,p.red,x,.309,-.34);
 pavilionRoof(k,g,p,{w:.335,d:.31,y:.316,h:.066,z:-.34});
 for(const x of [-.065,.065])for(const z of [-.395,-.285])k.box(g,.006,.055,.006,p.red,x,.382,z);
 for(const side of [-1,1]){k.box(g,.14,.005,.006,p.red,0,.394,-.34+side*.057);for(let i=0;i<9;i++)k.box(g,.003,.030,.003,p.red,-.06+i*.015,.374,-.34+side*.057);}
 pavilionRoof(k,g,p,{w:.225,d:.205,y:.399,h:.062,z:-.34});
 // Pavilion benches follow the back and sides, leaving the entry open.
 k.box(g,.205,.007,.025,p.red,0,.192,-.438);for(const x of [-.108,.108])k.box(g,.025,.007,.16,p.red,x,.192,-.342);
 palms(k,g,p,ground,[[-.44,.35,.22],[.43,.35,.23],[-.27,.50,.18],[.27,.50,.19]]);
 return finish(k,g,{lamps:[[-.125,.035,.57],[.125,.035,.57]],visitors:[[-.029,.156,.16],[.025,.156,-.13]]});
}
