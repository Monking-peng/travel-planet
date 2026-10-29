import * as THREE from 'three';
import {roof,stairs,plaque,tree} from './wuhan-architecture.js';

export function hanShow(k){const g=new THREE.Group(),silver=k.mat('#cccdc0',.4,.45),red=k.mat('#ac3b3c',.55,.18,'#e33f45'),glass=k.glass('#537779','#d5c4a1',91),stone=k.mat('#c9c7b4');red.userData.night.intensity=.72;red.userData.pulse={speed:.6,phase:1.7};
  k.cyl(g,.28,.30,.045,stone,0,-.003,0,64);k.cyl(g,.238,.248,.09,glass,0,.065,0,64);
  const points=Array.from({length:25},(_,i)=>{const t=i/24;return new THREE.Vector2(.245+.025*Math.sin(t*Math.PI),.11+t*.28);});k.mesh(g,new THREE.LatheGeometry(points,80),red);
  const dark=k.mat('#70464a',.6,.2);k.cyl(g,.247,.247,.005,dark,0,.392,0,80);for(let i=1;i<=12;i++)k.ring(g,i*.019,.0015,silver,.397);for(let i=0;i<24;i++){const a=i*Math.PI/12;k.beam(g,[.02*Math.cos(a),.401,.02*Math.sin(a)],[.246*Math.cos(a),.397,.246*Math.sin(a)],.0012,silver);}
  for(const direction of [-1,1])for(let i=0;i<7;i++){const p=Array.from({length:51},(_,j)=>{const t=j/50,a=i/7*Math.PI*2+direction*t*Math.PI*.80,r=.248+.025*Math.sin(t*Math.PI);return [r*Math.cos(a),.11+t*.28,r*Math.sin(a)];});k.line(g,p,.0028,silver);}
  for(let j=0;j<15;j++)for(let i=0;i<64;i++){const t=j/14,a=(i+(j%2)*.5)/64*Math.PI*2,r=.246+.025*Math.sin(t*Math.PI);const m=k.mesh(g,new THREE.CircleGeometry(.0033,6),silver,r*Math.cos(a),.114+t*.272,r*Math.sin(a));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(Math.cos(a),0,Math.sin(a)));}
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;k.cyl(g,.0018,.0018,.082,silver,.244*Math.cos(a),.068,.244*Math.sin(a),6);}
  plaque(k,g,'汉秀',.10,.033,0,.235,.277);stairs(k,g,.19,.11,.028,stone,0,.36);
  return k.merge(g);
}

export function hubeiMuseum(k){const g=new THREE.Group(),stone=k.mat('#c9c1ac'),wall=k.mat('#dccfb9'),roofMat=k.mat('#476777',.55,.2),trim=k.mat('#aab6b4',.6,.2,'#d6c49d'),glass=k.mat('#42616c',.36,.25,'#f8cf83');trim.userData.night.intensity=.34;glass.userData.night.intensity=.65;
  k.box(g,.86,.06,.69,stone,0,-.025);k.box(g,.22,.008,.52,wall,0,.010,.10);
  function modernRoof(w,d,h,y,x=0,z=0){const o=k.mesh(g,new THREE.CylinderGeometry(.64,1,h,4,1),roofMat,x,y+h/2,z);o.rotation.y=Math.PI/4;o.scale.set(w/Math.SQRT2,1,d/Math.SQRT2);k.box(g,w*.66,.006,d*.66,stone,x,y+h,z);k.box(g,w,.004,d,trim,x,y,z);}
  function wing(x,z,w,d,h){k.box(g,w,h,d,wall,x,h/2+.02,z);for(let j=0;j<2;j++)for(let i=0;i<7;i++){k.box(g,w/12,h*.25,.003,glass,x+(i/6-.5)*w*.82,.06+j*h*.45,z+d/2+.002);}modernRoof(w*1.16,d*1.16,.065,h+.022,x,z);}
  wing(0,-.13,.40,.32,.17);k.box(g,.32,.038,.26,glass,0,.271,-.13);modernRoof(.40,.34,.048,.289,0,-.13);k.box(g,.26,.020,.20,glass,0,.347,-.13);modernRoof(.31,.25,.058,.357,0,-.13);
  wing(-.28,.06,.18,.31,.13);wing(.28,.06,.18,.31,.13);
  for(const x of [-.19,.19])wing(x,-.14,.10,.12,.09);
  for(const x of [-.15,.15])k.box(g,.075,.003,.18,k.mat('#6b969b',.36,.25),x,.014,.22);
  stairs(k,g,.28,.11,.038,stone,0,.10);plaque(k,g,'湖北省博物馆',.23,.032,0,.212,.026);
  for(let i=0;i<8;i++){const x=(i-3.5)*.104;tree(k,g,x,-.028,-.39,.070,i%4===0);}
  for(const x of [-.40,.40]){k.box(g,.10,.085,.28,wall,x,.047,-.12);modernRoof(.14,.32,.042,.093,x,-.12);for(let j=0;j<8;j++)k.box(g,.006,.046,.282,glass,x+(j-3.5)*.010,.055,-.12);}
  const merged=k.merge(g);merged.scale.set(1.2,1,1.10);return merged;
}
