import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,hall,hip,granite,archPane,lit,sign,TAU} from './qingdao-kit.js';
export function signal(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.66,.58);paving(k,g,p,.46,.38);p.wall.color.set('#99968a');
 for(const [x,z,r,h]of [[0,-.17,.16,.33],[-.245,.13,.13,.18],[.245,.13,.13,.18]]){
  const q=new THREE.Group();q.position.set(x,.022,z);g.add(q);k.cyl(q,r*.55,r*.62,h,p.wall,0,h/2,0,40);for(let j=1;j<h/.02;j++)k.ring(q,r*.62-j*.00012,.00055,p.wood,j*.02);
  for(let i=0;i<8;i++){const a=i/8*TAU,o=new THREE.Group();o.position.set(Math.sin(a)*r*.60,.025,Math.cos(a)*r*.60);o.rotation.y=a;q.add(o);archPane(k,o,p,0,0,0,.025,.065);}
  const red=lit(k,'#bd3e39',.20),glass=lit(k,'#485e65',.08);red.userData.signalDome=true;red.userData.night.color.copy(red.color);
  const center=h+r*.73;const top=k.mesh(q,new THREE.SphereGeometry(r,48,28,0,TAU,0,Math.PI*.50),red,0,center+.014,0);top.scale.y=.89;
  const bottom=k.mesh(q,new THREE.SphereGeometry(r,48,20,0,TAU,Math.PI*.60,Math.PI*.40),red,0,center+.014,0);bottom.scale.y=.89;
  k.cyl(q,r*.99,r*.95,.062,glass,0,center-.016,0,48);
  for(let i=0;i<32;i++){const a=i/32*TAU;k.beam(q,[Math.sin(a)*r*.95,center-.047,Math.cos(a)*r*.95],[Math.sin(a)*r,center+.015,Math.cos(a)*r],.0012,p.pale);}
  for(let i=0;i<24;i++){const a=i/24*TAU;k.beam(q,[Math.sin(a)*r*.53,h-.01,Math.cos(a)*r*.53],[Math.sin(a)*r*.74,h+.055,Math.cos(a)*r*.74],.0022,p.pale);}
  k.cyl(q,.003,.004,.078,p.wood,0,center+r*.89+.052,0,8);
 }
 grove(k,g,height,[[-.49,-.14,.18],[.49,-.14,.18],[-.3,-.43,.18],[.3,-.43,.18],[0,-.48,.17]]);steps(k,g,p,0,.46,.30,6,.03,.1);
 return finish(k,g,{lamps:[[-.37,.023,.32],[.37,.023,.32]],visitors:[[-.06,.024,.28],[.07,.024,.27]]});
}
export function taiqing(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.68,.64);paving(k,g,p,.45,.43);const gateTile=k.mat('#39878b',.67),gray=k.mat('#687168',.88);p.wall.color.set('#ab5140');p.wood.color.set('#643c31');
 for(const [x,z,rx,ry,rz]of [[-.38,-.31,.17,.32,.19],[.34,-.33,.19,.38,.20],[.08,-.46,.21,.44,.17]]){const geo=new THREE.IcosahedronGeometry(1,2),a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i),zz=a.getZ(i),f=1+.12*Math.sin(xx*8+zz*5)+.09*Math.cos(yy*9+xx*4);a.setXYZ(i,xx*rx*f,(yy+1)*ry*.5,zz*rz*f);}geo.computeVertexNormals();k.mesh(g,geo,p.stone,x,.018,z);}
 hall(k,g,{...p,tile:gray},{w:.44,d:.24,h:.17,z:-.18,y:.045,wall:p.wall,roof:gray});sign(k,g,'三清殿',.11,.026,0,.201,-.047,{background:'#303b37',color:'#d6bf81'});
 for(const x of [-.34,.34])hall(k,g,{...p,tile:gray},{x,z:0,w:.14,d:.27,h:.10,wall:p.wall,roof:gray});
 const z=.235;
 for(const [x,w,top]of [[0,.25,.26],[-.215,.17,.215],[.215,.17,.215]]){
  k.box(g,w,.18,.055,p.wall,x,.131,z);const door=lit(k,'#8d3c32',.025);k.box(g,w*.70,.14,.006,door,x,.111,z+.030);for(const dx of [-w*.48,w*.48])k.cyl(g,.006,.008,top-.03,p.pale,x+dx,(top+.03)/2,z+.030,8);k.box(g,w,.026,.075,p.blue,x,top-.014,z);hip(k,g,w*1.24,.17,.055,top,gateTile,gateTile,x,z);for(let i=0;i<7;i++){const xx=x+(i/6-.5)*w;k.box(g,.014,.016,.025,p.gold,xx,top-.028,z+.042);}
 }
 sign(k,g,'崂山太清宫',.19,.037,0,.230,.322,{background:'#343b37',color:'#ceb780'});for(const x of [-.43,.43]){k.box(g,.17,.13,.045,p.wall,x,.09,z);hip(k,g,.18,.06,.018,.156,gray,gray,x,z);}
 for(const x of [-.24,.24]){k.box(g,.05,.04,.05,p.stone,x,.049,.375);const lion=k.ball(g,.018,p.stone,x,.081,.375);lion.scale.set(.8,1.4,1);k.ball(g,.014,p.stone,x,.11,.384);}
 steps(k,g,p,0,.445,.49,5,.025,.08);grove(k,g,height,[[-.50,.0,.18],[.50,.0,.18],[-.51,-.24,.20],[.50,-.26,.19],[-.21,-.48,.18],[.22,-.49,.19]]);
 return finish(k,g,{lamps:[[-.37,.024,.34],[.37,.024,.34]],visitors:[[-.08,.024,.40],[.10,.024,.40]]});
}
