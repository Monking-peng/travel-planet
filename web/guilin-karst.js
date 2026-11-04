import * as THREE from 'three';
import {palette,site,lake,karstSolid,peak,raft,finish,grove,siteHeight,polygonRoof,TAU,noise} from './guilin-kit.js';
const ell=(x,y,z,cx,cy,cz,rx,ry,rz)=>Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz)-1;
export function elephant(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);lake(k,g,p,.74,.60);
 const field=(x,y,z)=>{let d=Math.min(Math.hypot((x-.17)/.42,(z+.03)/.27)+Math.pow(Math.max(0,y-.32)/.28,2)-1,ell(x,y,z,-.17,.31,0,.34,.24,.25),ell(x,y,z,-.43,.19,0,.13,.22,.22));d+=.032*(noise(x*21,y*19,z*19)-.5)+.016*Math.sin(x*55+z*47)*Math.sin(y*37);d=Math.max(d,1-Math.hypot((x+.27+.05*z)/.153,(y-.171)/.168));return Math.max(d,-y*5);};
 karstSolid(k,g,field,{id:'elephant-arch',bounds:[[-.60,.62],[-.025,.64],[-.31,.31]],resolution:[62,44,30]});
 // Puxian pagoda is a small masonry landmark on the summit, not another hall.
 const stone=p.pale;for(let j=0;j<4;j++)k.cyl(g,.016-j*.002,.020-j*.002,.015,stone,.17,.619+j*.016,-.015,8);k.cyl(g,0,.009,.030,p.gold,.17,.692,-.015,8);
 raft(k,g,p,-.29,.34,-.8);raft(k,g,p,.28,.40,.7);
 return finish(k,g);
}
export function moon(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);
 const field=(x,y,z)=>{let d=Math.min(ell(x,y,z,.05,.33,0,.38,.42,.22),ell(x,y,z,-.29,.18,.015,.34,.25,.23),ell(x,y,z,.34,.16,0,.28,.24,.22));d+=.014*Math.sin(x*51+z*29)*Math.sin(y*49);d=Math.max(d,1-Math.hypot((x-.045+.06*z)/.137,(y-.424)/.146));return Math.max(d,-y*4);};
 karstSolid(k,g,field,{id:'moon-arch',bounds:[[-.66,.67],[-.025,.80],[-.29,.29]],resolution:[64,52,28]});
 const land=(x,z)=>siteHeight(x,z,.79,.65);grove(k,g,land,[[-.49,.22,.17],[-.38,.31,.13],[.46,.25,.16],[.31,.36,.13],[-.62,-.03,.12],[.57,-.06,.14]]);
 return finish(k,g);
}
export {xingping} from './guilin-xingping.js';
