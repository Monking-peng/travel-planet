import * as THREE from 'three';
import {roof,hall,tree,rail,stairs,plaque} from './wuhan-architecture.js';

export function eastlake(k){const g=new THREE.Group(),water=k.mat('#6c9da1',.35,.25),stone=k.mat('#c8cbb9'),green=k.mat('#86a175'),wood=k.mat('#745f48'),tile=k.mat('#407d75',.64,.15),edge=k.mat('#9ba997',.55,.2,'#ffd7a4');edge.userData.night.intensity=.45;
  const pv=[],pi=[];for(let j=0;j<=24;j++)for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,r=.67*j/24;pv.push(Math.cos(a)*r,.023,Math.sin(a)*r*.76);}for(let j=0;j<24;j++)for(let i=0;i<96;i++){const a=j*97+i,b=a+97;pi.push(a,b,a+1,a+1,b,b+1);}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));pg.setIndex(pi);pg.computeVertexNormals();water.side=THREE.DoubleSide;k.mesh(g,pg,water);
  // Bi-tan fish-viewing pavilion ensemble: clear courtyards of water, not a solid slab.
  function walk(a,b){k.beam(g,[a[0],.037,a[1]],[b[0],.037,b[1]],.016,stone,4);const n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.022);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;k.cyl(g,.0015,.0015,.022,stone,x,.052,z,6);}k.beam(g,[a[0],.065,a[1]],[b[0],.065,b[1]],.0018,edge);}
  for(const z of [-.12,.12])walk([-.28,z],[.28,z]);for(const x of [-.28,0,.28])walk([x,-.12],[x,.12]);
  function pavilion(x,z,s=1){const q=new THREE.Group();k.box(q,.12,.014,.12,stone,0,.037);for(const a of [-1,1])for(const b of [-1,1])k.cyl(q,.003,.004,.065,wood,a*.043,.077,b*.043,8);roof(k,q,.155,.155,.055,.11,tile,edge);q.scale.setScalar(s);q.position.set(x,0,z);g.add(q);}
  pavilion(0,.12,1.30);for(const x of [-.28,.28])for(const z of [-.12,.12])pavilion(x,z,.78);
  let a=[-.28,-.12];for(const b of [[-.38,-.20],[-.29,-.25],[-.45,-.31],[-.39,-.39],[-.54,-.41]]){walk(a,b);a=b;}
  a=[.28,-.12];for(const b of [[.38,-.20],[.29,-.25],[.45,-.31],[.39,-.39],[.54,-.41]]){walk(a,b);a=b;}
  walk([-.55,-.43],[.55,-.43]);
  for(let i=0;i<56;i++){const a=i/56*Math.PI*2,r=.70+(i%3)*.035;tree(k,g,Math.cos(a)*r,-.008,Math.sin(a)*r*.77,.065+(i%4)*.012,i%13===0);}
  const island=k.cyl(g,.12,.14,.030,green,0,.003,.36,32);island.scale.x=1.5;walk([0,.12],[0,.30]);
  const merged=k.merge(g);merged.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,p.getY(i)-(2.15-Math.sqrt(Math.max(.1,2.15**2-x*x-z*z))));}p.needsUpdate=true;o.geometry.computeVertexNormals();});return merged;
}

export function university(k,{trees=true}={}){const g=new THREE.Group(),stone=k.mat('#ccc7b7'),white=k.mat('#e0d9c6'),tile=k.mat('#467f7b',.65,.12),edge=k.mat('#91b0a1',.6,.1,'#e6ca91'),window=k.mat('#6b4a40',.62,0,'#f2bd7d');edge.userData.night.intensity=.4;window.userData.night.intensity=.35;
  k.box(g,.79,.09,.45,stone,0,-.022);k.box(g,.60,.14,.25,white,0,.10,-.07);
  for(const x of [-.26,.26]){k.box(g,.17,.19,.27,white,x,.125,-.07);roof(k,g,.23,.33,.065,.221,tile,edge,x,-.07);}
  k.cyl(g,.145,.145,.205,white,0,.153,-.035,8);k.cyl(g,.167,.167,.010,stone,0,.258,-.035,8);
  k.cyl(g,.136,.171,.045,tile,0,.287,-.035,8);k.cyl(g,.131,.131,.075,white,0,.340,-.035,12);
  const cap=k.mesh(g,new THREE.SphereGeometry(.142,24,10,0,Math.PI*2,0,Math.PI/2),stone,0,.379,-.035);cap.scale.y=.40;
  k.ring(g,.131,.003,stone,0,.379,-.035);k.cyl(g,.025,.031,.009,stone,0,.438,-.035,12);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const pane=k.box(g,.025,.042,.003,window,.132*Math.sin(a),.340,.132*Math.cos(a)-.035);pane.rotation.y=a;}
  for(const side of [-1,1])for(let j=0;j<3;j++)for(let i=0;i<7;i++){const x=(i/6-.5)*.52,y=.064+j*.061;if(Math.abs(x)<.11||j<2){k.box(g,.024,.042,.003,window,x,y,side*.127-.07);k.box(g,.030,.003,.006,stone,x,y+.023,side*.131-.07);}}
  for(const x of [-.082,.082]){k.cyl(g,.009,.011,.116,stone,x,.101,.10,12);k.box(g,.030,.010,.028,stone,x,.163,.10);}
  for(const x of [-.26,.26])for(let i=0;i<5;i++){const xx=x+(i-2)*.027;k.box(g,.015,.102,.005,window,xx,.128,.068);for(let j=0;j<5;j++)k.box(g,.018,.002,.006,stone,xx,.084+j*.023,.072);k.box(g,.002,.102,.007,white,xx,.128,.073);}
  for(const y of [.04,.198])k.box(g,.65,.007,.26,stone,0,y,-.07);
  plaque(k,g,'图书馆',.10,.025,0,.235,.112);stairs(k,g,.20,.26,.075,stone,0,.37,15);
  if(trees)for(let i=0;i<16;i++){const x=(i/15-.5)*.86;for(const z of [.28,-.30]){if(z<0||Math.abs(x)>.15)tree(k,g,x,-.03,z,.065+(i%4)*.012,true);}}
  return k.merge(g);
}
