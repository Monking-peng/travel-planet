import * as THREE from 'three';
import {palette,site,sea,finish,lit,sign,skin} from './tianjin-kit.js';
function girder(k,g,p,a,b,w=.010){
 const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),delta=B.clone().sub(A),q=new THREE.Group();q.position.copy(A.add(B).multiplyScalar(.5));q.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());g.add(q);const h=delta.length();
 k.box(q,w*.26,h,w,p.steel);for(const x of [-w*.43,w*.43])k.box(q,w*.14,h,w*1.18,p.steel,x,0,0);
}
function plate(k,g,p,x,y,z,r=.018){
 const s=new THREE.Shape();s.moveTo(-r,-r*.5);s.lineTo(r,-r*.5);s.lineTo(r*.6,r*.45);s.lineTo(-r*.6,r*.45);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.002,bevelEnabled:false}),p.steel,x,y,z);
 for(const side of [-1,1])for(let j=0;j<3;j++)k.ball(g,.0013,p.rivet,x+side*r*.50,y-r*.27+j*r*.24,z+.003,6,4);
}
function fence(k,g,p,x1,x2,z){
 for(const y of [.141,.169,.181])k.box(g,x2-x1,.002,.002,p.pale,(x1+x2)/2,y,z);
 const n=Math.ceil((x2-x1)/.035);for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n;k.box(g,.002,.055,.002,p.pale,x,.154,z);if(i<n){const nx=x1+(x2-x1)*(i+1)/n;for(const side of [-1,1])k.beam(g,[x,side>0?.144:.176,z],[nx,side>0?.176:.144,z],.0006,p.pale,4);}}
}
export function jiefang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.84,.56);sea(k,g,p,.70,.54);p.steel=lit(k,'#8d9a99',.24,'#e8bd70');p.steel.userData.jiefangSteel=true;p.rivet=k.mat('#727e7b',.78,.10);p.pale=lit(k,'#c8cebf',.18);p.edge=lit(k,'#c4ba8f',1.05,'#ffcf7a');p.deck=k.mat('#777c72',.97);p.deck.userData.jiefangDeck=true;p.walk=k.mat('#b5b4a5',.97);p.walk.userData.jiefangDeck=true;p.bank=k.mat('#a9a794',.98);
 // The walking deck continues across the river and down both bank approaches.
 k.box(g,1.40,.023,.292,p.stone,0,.1095,0);k.box(g,1.40,.005,.188,p.deck,0,.1245,0);
 for(const z of [-.126,.126]){k.box(g,1.40,.008,.056,p.walk,0,.126,z);fence(k,g,p,-.695,.695,z<0?-.154:.154);}
 for(const x of [-.745,.745]){k.box(g,.190,.048,.44,p.bank,x,.034,0);for(const z of [-.19,.19]){k.box(g,.19,.008,.05,p.walk,x,.063,z);}}
 for(const side of [-1,1]){
  skin(k,g,(u,v)=>[side*(.70+.125*u),.127*(1-u)+.058*u,(v-.5)*.188],1,18,p.deck);
  for(const sign of [-1,1])skin(k,g,(u,v)=>[side*(.70+.125*u),.130*(1-u)+.058*u,sign*(.098+.056*v)],1,18,p.walk);
 }
 for(let i=0;i<15;i++)k.box(g,.042,.001,.0018,p.pale,-.65+i*.093,.128,0);
 for(const z of [-.092,.092])k.box(g,1.37,.001,.0018,p.pale,0,.128,z);
 for(const x of [-.68,-.38,.38,.68]){k.box(g,.057,.083,.27,p.stone,x,.0675,0);k.box(g,.072,.010,.29,p.pale,x,.105,0);}
 const nodes=Array.from({length:13},(_,i)=>-.66+i*.11);
 for(const side of [-1,1]){
  const z=side*.103;
  for(const y of [.139,.282])girder(k,g,p,[-.66,y,z],[.66,y,z],.011);
  for(let i=0;i<nodes.length;i++){
   const x=nodes[i];girder(k,g,p,[x,.139,z],[x,.282,z],.007);plate(k,g,p,x,.144,z+side*.007,.013);plate(k,g,p,x,.279,z+side*.007,.013);
   if(i<nodes.length-1){const nx=nodes[i+1];girder(k,g,p,[x,.139,z],[(x+nx)/2,.282,z],.010);girder(k,g,p,[(x+nx)/2,.282,z],[nx,.139,z],.010);}
  }
  // Upper plate girders dip toward the middle; they are not a convex arch.
  const top=x=>.306+.166*(Math.abs(x)/.38)**2.4;
  const s=new THREE.Shape();s.moveTo(-.38,.282);for(let i=0;i<=48;i++){const x=-.38+i*.76/48;s.lineTo(x,top(x));}s.lineTo(.38,.282);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.003,bevelEnabled:false}),p.steel,0,0,z-.0015);
  const line=Array.from({length:49},(_,i)=>{const x=-.38+i*.76/48;return[x,top(x),z];});k.line(g,line,.0036,p.steel);k.line(g,line.map(a=>[a[0],a[1]+.004,a[2]+side*.005]),.0014,p.edge);
  for(let i=0;i<=12;i++){const x=-.38+i*.76/12,y=top(x);k.box(g,.003,y-.285,.009,p.steel,x,(y+.285)/2,z);for(let j=0;j<5;j++)k.ball(g,.0011,p.rivet,x,.292+(y-.297)*j/5,z+side*.006,6,4);}
  for(const x of [-.38,.38]){girder(k,g,p,[x,.139,z],[x,.477,z],.018);girder(k,g,p,[x,.477,z],[x+Math.sign(x)*.23,.14,z],.013);plate(k,g,p,x,.467,z+side*.007,.025);}
  k.box(g,1.37,.002,.003,p.edge,0,.139,z+side*.010);
 }
 for(const x of [-.38,.38]){
  for(const y of [.462,.488])girder(k,g,p,[x,y,-.111],[x,y,.111],.007);
  for(let j=0;j<7;j++){const z=-.111+j*.222/7,nz=z+.222/7;girder(k,g,p,[x,.462,z],[x,.488,nz],.003);girder(k,g,p,[x,.488,z],[x,.462,nz],.003);}
  for(const z of [-.101,.101]){k.box(g,.057,.13,.003,p.steel,x,.386,z);for(let j=0;j<5;j++)k.box(g,.061,.002,.008,p.steel,x,.330+j*.025,z);}
 }
 for(let i=0;i<nodes.length;i++){const x=nodes[i];girder(k,g,p,[x,.283,-.103],[x,.283,.103],.006);if(i<nodes.length-1){girder(k,g,p,[x,.283,-.103],[nodes[i+1],.283,.103],.003);girder(k,g,p,[x,.283,.103],[nodes[i+1],.283,-.103],.003);}}
 for(const x of [-.66,.66])for(const z of [-.143,.143]){girder(k,g,p,[x,.13,z],[x,.34,z],.006);k.box(g,.008,.004,.012,p.edge,x,.341,z);}
 const marker=new THREE.Group();marker.position.set(-.74,.083,.19);g.add(marker);k.box(marker,.13,.053,.022,p.bank);sign(k,marker,'解放桥',.10,.030,0,0,.012,{background:'#9d9c8c',color:'#cbb16d'});
 return finish(k,g,{visitors:[[-.51,.130,.127],[-.48,.130,.127],[-.17,.130,-.126],[.14,.130,.126],[.46,.130,-.126]]});
}
