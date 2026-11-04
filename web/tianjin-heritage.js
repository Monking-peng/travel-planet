import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,hip,sign,lit,archPane,gable,cross,dome,ceramic,vase,TAU} from './tianjin-kit.js';
import {lattice} from './shunde-kit.js';
export {xikai} from './tianjin-xikai.js';
export {porcelain} from './tianjin-porcelain.js';
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
