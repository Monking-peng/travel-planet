import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hip,skin,TAU,edge,window,railing,palm,granite,sea,hall} from './xiamen-kit.js';

export {bagua} from './xiamen-bagua.js';
export function sunlight(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.64,.56);p.stone=k.mat('#b6b5a5',.98);
 granite(k,g,p,{x:-.15,y:.005,z:-.02,rx:.24,ry:.42,rz:.23,seed:2});granite(k,g,p,{x:.18,y:.005,z:.02,rx:.21,ry:.34,rz:.23,seed:4});
 const geo=new THREE.SphereGeometry(1,56,40),a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),yy=Math.min(.95,(y+1)/2),t=(y+1)/2,n=1+.025*Math.sin(z*7+x*9);a.setXYZ(i,x*.23*n*(.9+.1*Math.sin(t*4)),.06+yy*.59,z*.20*n);}
 geo.computeVertexNormals();p.stone.userData.sunlightRock=true;k.mesh(g,geo,p.stone);
 const fissure=k.mat('#98998d',.99);for(let i=0;i<7;i++){const x=-.16+i*.052;k.line(g,[[x,.11,.173],[x+.011,.24,.189],[x-.004,.39,.167],[x+.007,.50,.113]],.001,fissure);}
 k.box(g,.136,.012,.105,p.pale,0,.623,-.005);railing(k,g,p,[[-.07,.63,-.061],[.07,.63,-.061],[.07,.63,.049],[-.07,.63,.049],[-.07,.63,-.061]],.034);
 // A narrow stone stair follows the boulder rather than floating to its summit.
 const path=[[-.28,.06,.20],[-.19,.19,.20],[.14,.37,.17],[.13,.49,.085],[.04,.62,.03]],front=q=>[q.x,q.y,Math.max(q.z,.20*Math.sqrt(Math.max(0,1-(q.x/.23)**2-((q.y-.06)/.59*2-1)**2))+.018)];
 for(let j=1;j<path.length;j++){const av=new THREE.Vector3(...path[j-1]),bv=new THREE.Vector3(...path[j]),N=12,rail=[];for(let i=0;i<=N;i++){const q=front(av.clone().lerp(bv,i/N));rail.push([q[0],q[1]+.007,q[2]+.025]);if(i<N){k.box(g,.043,.013,.043,p.pale,...q);k.box(g,.039,.026,.055,p.stone,q[0],q[1]-.016,q[2]-.014);}}railing(k,g,p,rail,.027);}
 grove(k,g,(x,z)=>ground(x,z)+.018,Array.from({length:15},(_,i)=>{const a=i/15*TAU;return [Math.sin(a)*.43,Math.cos(a)*.34,.12+.045*Math.sin(i*3)**2];}));sign(k,g,'日光岩',.08,.028,-.25,.14,.245,{background:'#aaa997',color:'#8b3e2b'});
 return finish(k,g,{visitors:[[0,.632,.02],[.05,.632,-.02],[-.30,.025,.28]]});
}
export {shuzhuang} from './xiamen-shuzhuang.js';
