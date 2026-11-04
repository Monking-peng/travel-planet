import * as THREE from 'three';
import {roof,tree,plaque} from './wuhan-architecture.js';
import {plaza,bollards,people,glow,skin} from './shenzhen-forms.js';
import {lattice,balcony} from './shunde-kit.js';

export {memorial} from './guangzhou-memorial.js';

function hardRoof(k,g,x,z,w,d,y,h,tile,ridge){
  tile.side=THREE.DoubleSide;const shape=new THREE.Shape();shape.moveTo(-d/2,0);shape.lineTo(0,h);shape.lineTo(d/2,0);shape.closePath();const wall=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false}),tile,x-w/2,y,z);wall.rotation.y=Math.PI/2;wall.position.x=x-w/2;wall.position.z=z;
  // Geometry coordinates are remapped so the ridge runs across the hall's width.
  wall.rotation.y=0;const p=wall.geometry.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i),zz=p.getZ(i);p.setXYZ(i,zz,p.getY(i),xx);}wall.geometry.computeVertexNormals();
  for(let i=0;i<=Math.round(w/.014);i++){const xx=x-w/2+i*w/Math.round(w/.014);k.line(g,[[xx,y+.001,z-d/2],[xx,y+h+.001,z],[xx,y+.001,z+d/2]],.001,tile);}
  k.box(g,w+.025,.018,.025,ridge,x,y+h+.009,z);
}
function ceramicRidge(k,g,x,y,z,w,p){
  for(let i=0;i<13;i++){const xx=x+(i/12-.5)*w*.92,col=p[i%p.length];k.cyl(g,.004,.007,.016,col,xx,y+.013,z,6);k.ball(g,.0039,col,xx,y+.024,z);if(i%3===0){k.box(g,.023,.007,.018,p[1],xx,y+.038,z);k.cyl(g,0,.017,.014,p[2],xx,y+.049,z,4).rotation.y=Math.PI/4;}}
  for(const s of [-1,1]){const pts=[];for(let j=0;j<=12;j++){const t=j/12;pts.push([x+s*(w*.39+t*w*.14),y+.013+.045*Math.sin(t*Math.PI*.65),z+.008*Math.sin(t*Math.PI*2)]);}k.line(g,pts,.004,p[0]);}
}
export function chen(k){
  const g=new THREE.Group(),stone=plaza(k,g,.76,.73),gray=k.mat('#76827b'),tile=k.mat('#4c625c'),wood=k.mat('#51443b'),cream=k.mat('#b7b5a2'),trim=glow(k,'#d2b993',.50),p=['#538b80','#b4a581','#668396','#a9715a'].map(c=>k.mat(c,.67));
  k.box(g,1.28,.025,1.25,stone,0,.020,0);
  // Three courtyard axes and three halls deep, leaving both open courtyards visible.
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const x=(col-1)*.423,z=(row-1)*.49,w=col===1?.46:.32,d=.26,h=row===1?.18:.16;
    k.box(g,w,.016,d+.03,cream,x,.040,z);k.box(g,w-.025,h,d-.018,gray,x,.048+h/2,z);
    for(const side of [-1,1])for(let n=0;n<4;n++){const xx=x+(n/3-.5)*w*.76;k.box(g,w*.17,h*.76,.004,wood,xx,.051+h*.42,z+side*d*.477);k.cyl(g,.004,.005,h,cream,xx,.048+h/2,z+side*d*.52,8);lattice(k,g,xx,.050+h*.45,z+side*d*.495,w*.14,h*.60,cream);}
    hardRoof(k,g,x,z,w+.045,d+.055,.052+h,.062,tile,gray);ceramicRidge(k,g,x,.052+h+.085,z,w+.02,p);
    k.box(g,w,.002,.003,trim,x,.049+h,z+d*.61);
  }
  for(const x of [-.635,.635,-.235,.235])for(const z of [-.24,.24]){k.box(g,.035,.135,.21,gray,x,.107,z);hardRoof(k,g,x,z,.07,.25,.175,.025,tile,gray);}
  for(const z of [-.24,.24])for(const x of [-.42,.42]){k.cyl(g,.045,.046,.023,cream,x,.048,z,24);tree(k,g,x,.058,z,.075);}
  plaque(k,g,'陈氏书院',.16,.032,0,.177,.638);
  for(const x of [-.18,.18]){k.cyl(g,.021,.026,.022,cream,x,.044,.67,8);const lion=k.ball(g,.020,cream,x,.073,.67);lion.scale.set(.8,1.15,1);k.ball(g,.013,cream,x,.096,.68);}
  bollards(k,g,[[-.57,.65],[.57,.65],[-.68,-.36],[.68,-.36]]);people(k,g,[[-.1,.66],[.08,.68],[.15,.66]]);return k.merge(g);
}

function ellipsoid(k,g,r,m,x,y,z,scale,rotation=0){const o=k.ball(g,r,m,x,y,z);o.scale.set(...scale);o.rotation.z=rotation;return o;}
function goat(k,g,m,{x,y,z,s=1,angle=0,tall=false}){
  const q=new THREE.Group();g.add(q);
  ellipsoid(k,q,.08,m,0,.13,0,[.83,1.12,1.55],tall?-.18:0);
  ellipsoid(k,q,.068,m,0,tall?.235:.20,.074,[.62,tall?1.52:1.0,.72],-.13);
  k.beam(q,[0,.17,.065],[0,tall?.29:.23,.105],.031,m,12);
  ellipsoid(k,q,.045,m,0,tall?.318:.257,.116,[.8,1.05,1.3],-.10);
  const yy=tall?.320:.26;
  ellipsoid(k,q,.026,m,0,yy-.014,.16,[.65,.7,1.25]);
  for(const side of [-1,1]){for(const zz of [-.068,.062]){k.beam(q,[side*.042,.10,zz],[side*.048,.028,zz+(zz<0?-.018:.02)],.011,m,7);k.box(q,.025,.014,.032,m,side*.048,.014,zz+(zz<0?-.02:.02));}
    const horn=[];for(let i=0;i<16;i++){const t=i/15;horn.push([side*(.022+.047*Math.sin(t*Math.PI*.8)),yy+.025+.052*Math.sin(t*Math.PI*.8),.11-.077*t]);}k.line(q,horn,.006,m);ellipsoid(k,q,.020,m,side*.043,yy,.105,[1.2,.35,.6],side*.2);
  }
  k.line(q,[[0,.13,-.105],[.01,.12,-.146],[.01,.10,-.15]],.007,m);k.cyl(q,0,.010,.041,m,0,yy-.050,.147,8).rotation.z=Math.PI;
  q.scale.setScalar(s);q.rotation.y=angle;q.position.set(x,y,z);return q;
}
export function rams(k){
  const g=new THREE.Group(),base=plaza(k,g,.57,.54),stone=k.mat('#b5b7a5',.97),rock=k.mat('#949f8b',.98),leaf=k.mat('#4b755d');
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,o=k.mesh(g,new THREE.IcosahedronGeometry(.17,1),rock,Math.cos(a)*.21,.16,Math.sin(a)*.17);o.scale.set(1,.66,1);}
  const peak=k.mesh(g,new THREE.IcosahedronGeometry(.19,1),rock,.01,.31,-.04);peak.scale.set(.8,1.2,.72);
  goat(k,g,stone,{x:.01,y:.28,z:-.04,s:1.17,tall:true,angle:-.15});
  goat(k,g,stone,{x:-.17,y:.23,z:.06,s:.85,angle:1.2});goat(k,g,stone,{x:.17,y:.22,z:.05,s:.8,angle:-.9});goat(k,g,stone,{x:-.12,y:.22,z:-.17,s:.68,angle:2.6});goat(k,g,stone,{x:.03,y:.21,z:.20,s:.58,angle:2.7});
  for(let i=0;i<27;i++){const a=i/27*Math.PI*2,r=.36+Math.sin(i*7)*.015;k.ball(g,.037,leaf,Math.cos(a)*r,.05,Math.sin(a)*r*.82);if(i%3===0)k.ball(g,.016,k.mat(i%2?'#a37587':'#c28e9b'),Math.cos(a)*r,.087,Math.sin(a)*r*.82);}
  for(const [x,z]of [[-.44,-.27],[.45,-.22],[.20,-.42]])tree(k,g,x,.013,z,.13);
  bollards(k,g,[[-.41,.28],[.41,.28],[-.30,-.36],[.30,-.36]]);people(k,g,[[-.12,.44],[.06,.45],[.14,.43]]);return k.merge(g);
}
