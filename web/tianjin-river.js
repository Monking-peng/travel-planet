import * as THREE from 'three';
import {palette,site,sea,finish,railing,lit,TAU,sign} from './tianjin-kit.js';
export function eye(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.82,.60);sea(k,g,p,.81,.59);const white=lit(k,'#c7d4cf',.13),steel=k.mat('#879b9b',.7,.22),glass=lit(k,'#466b78',.11);
 k.box(g,1.50,.047,.15,p.stone,0,.106,0);for(const z of [-.066,.066]){k.box(g,1.48,.006,.008,white,0,.143,z);for(let i=0;i<36;i++)k.beam(g,[-.73+i*.041,.089,z],[-.71+i*.041,.132,z],.003,steel);}
 for(const x of [-.66,-.32,.32,.66])for(const z of [-.048,.048])k.cyl(g,.018,.021,.077,p.stone,x,.058,z,12);
 for(const z of [-.10,.10]){const s=new THREE.Shape();s.moveTo(-.025,.690);s.lineTo(.025,.690);s.lineTo(.025,.50);s.quadraticCurveTo(.027,.435,.07,.410);s.lineTo(.65,.150);s.lineTo(.62,.115);s.lineTo(.045,.375);s.quadraticCurveTo(0,.397,-.045,.375);s.lineTo(-.62,.115);s.lineTo(-.65,.150);s.lineTo(-.07,.410);s.quadraticCurveTo(-.027,.435,-.025,.50);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.002}),white,0,0,z-.0125);}
 const cy=.68,r=.485,inner=.458;for(const z of [-.036,.036])for(const rr of [r,inner])k.mesh(g,new THREE.TorusGeometry(rr,.0035,6,128),white,0,cy,z);
 for(let i=0;i<48;i++){const a=i/48*TAU,b=(i+1)/48*TAU;for(const z of [-.036,.036]){k.beam(g,[0,cy,z],[Math.sin(a)*inner,cy+Math.cos(a)*inner,z],.00075,steel,4);k.beam(g,[Math.sin(a)*inner,cy+Math.cos(a)*inner,z],[Math.sin(b)*r,cy+Math.cos(b)*r,z],.0015,steel,4);}k.beam(g,[Math.sin(a)*r,cy+Math.cos(a)*r,-.036],[Math.sin(a)*r,cy+Math.cos(a)*r,.036],.002,white);
  const x=Math.sin(a)*(r+.015),y=cy+Math.cos(a)*(r+.015);k.box(g,.021,.026,.042,glass,x,y,0);k.box(g,.023,.003,.044,white,x,y+.014,0);k.box(g,.023,.004,.044,white,x,y-.014,0);
 }
 for(let i=0;i<12;i++){const m=lit(k,'#9aabb9',1.3,i%3===0?'#d52585':i%3===1?'#247cbd':'#d09940');m.userData.pulse={speed:.67,phase:i*.52};const arc=k.mesh(g,new THREE.TorusGeometry(r,.004,6,16,TAU/12),m,0,cy,.040);arc.rotation.z=i/12*TAU;}
 k.beam(g,[0,cy,-.13],[0,cy,.13],.020,white,24);for(const x of [-.72,.72]){k.box(g,.11,.018,.57,p.pale,x,.035,0);railing(k,g,p,[[x,.045,-.26],[x,.045,.26]],.03);}
 return finish(k,g,{visitors:[[-.69,.045,.17],[.69,.045,.06]]});
}
export {jiefang} from './tianjin-jiefang.js';
export {tianta} from './tianjin-tianta.js';
