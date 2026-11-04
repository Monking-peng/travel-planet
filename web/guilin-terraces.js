import * as THREE from 'three';
import {palette,site,siteHeight,lake,skin,raft,grove,railing,finish,TAU} from './guilin-kit.js';
export {fuli} from './guilin-fuli.js';
export function longji(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);
 const rice=['#a9ab64','#b5b36c','#b7b675','#a7ac62','#b5b16b'].map(c=>{const m=k.mat(c,.99);m.userData.landscape=true;m.userData.terrace=true;return m;});const bank=k.mat('#777e4b',1);bank.userData.landscape=true;bank.userData.terraceRiser=true;
 const N=192,L=25;
 // Nested contours create wide level treads and vertical earth banks. Their
 // off-centre, scalloped outline follows the folds of the mountain.
 const contour=(level,a)=>{const t=level/L,r=Math.pow(1-t,.68),fold=1+.16*Math.sin(a*3+.3)+.055*Math.sin(a*7+t*2);return [.67*r*Math.sin(a)*fold+.14*t,.035+level*.014,.49*r*Math.cos(a)*fold-.09*t];};
 for(let j=0;j<L;j++){
  const y=.035+j*.014,top=[],ti=[],side=[],si=[];
  for(let i=0;i<=N;i++){const a=i/N*TAU,outer=contour(j,a),inner=contour(j+1,a);top.push(outer[0],y,outer[2],inner[0],y,inner[2]);side.push(inner[0],y,inner[2],inner[0],y+.014,inner[2]);}
  for(let i=0;i<N;i++){const a=i*2;ti.push(a,a+2,a+1,a+2,a+3,a+1);si.push(a,a+2,a+1,a+2,a+3,a+1);}
  for(const [pos,ix,mat]of [[top,ti,rice[j%rice.length]],[side,si,bank]]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(ix);geo.computeVertexNormals();if(mat.userData.terrace){const n=geo.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);}k.mesh(g,geo,mat);}
 }
 const deck=new THREE.Group();deck.position.set(-.41,0,.33);g.add(deck);k.box(deck,.20,.012,.14,p.wood,0,.075,0);for(let i=0;i<14;i++)k.box(deck,.20,.002,.001,p.pale,0,.082,(i-6.5)*.009);for(const x of [-.09,.09])for(const z of [-.06,.06])k.box(deck,.010,.060,.010,p.wood,x,.044,z);railing(k,deck,p,[[-.10,.083,-.07],[-.10,.083,.07],[.10,.083,.07],[.10,.083,-.07]],.036);
 return finish(k,g,{lamps:[[-.48,.083,.38],[-.34,.083,.38]],visitors:[[-.42,.083,.33]]});
}
