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
export {taiqing} from './qingdao-taiqing.js';
