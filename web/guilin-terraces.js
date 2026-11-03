import * as THREE from 'three';
import {palette,site,siteHeight,lake,skin,raft,grove,railing,finish,TAU} from './guilin-kit.js';
function bridgeHeight(x){return .070+Math.sqrt(Math.max(0,.38*.38-x*x));}
export function fuli(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);lake(k,g,p,.74,.58);
 const shape=new THREE.Shape();shape.moveTo(-.56,.032);shape.lineTo(-.323,.032);shape.lineTo(-.323,.070);shape.absarc(0,.070,.323,Math.PI,0,true);shape.lineTo(.323,.032);shape.lineTo(.56,.032);shape.lineTo(.56,.070);
 for(let i=0;i<=56;i++){const x=.56-1.12*i/56;shape.lineTo(x,bridgeHeight(x));}shape.closePath();
 k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:false,curveSegments:48}),p.stone,0,0,-.085);
 // Radial voussoirs follow the single arch; the raised crown has stone steps.
 for(const s of [-1,1])for(let j=0;j<=29;j++){const a=j/29*Math.PI;k.beam(g,[Math.cos(a)*.326,.070+Math.sin(a)*.326,s*.086],[Math.cos(a)*.377,.070+Math.sin(a)*.377,s*.086],.0012,p.pale,5);}
 for(let i=0;i<46;i++){const x=-.553+(i+.5)*1.106/46,y=bridgeHeight(x);k.box(g,1.106/46,.007,.18,p.pale,x,y+.002,0);for(const s of [-1,1])k.box(g,.023,.023,.017,p.stone,x,y+.011,s*.094);}
 for(const x of [-.55,.55])for(let j=0;j<5;j++){const o=k.mesh(g,new THREE.DodecahedronGeometry(.025,0),p.stone,x+(j%2)*.02,.048,(j-2)*.055);o.scale.y=.5;}
 grove(k,g,(x,z)=>siteHeight(x,z,.79,.65),[[-.57,.25,.17],[-.62,-.18,.16],[.57,.22,.16],[.60,-.22,.18]]);raft(k,g,p,-.11,.32,1.35);raft(k,g,p,.20,.31,1.2);
 return finish(k,g,{visitors:[[-.16,bridgeHeight(-.16)+.010,0],[.06,bridgeHeight(.06)+.010,.02]]});
}
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
