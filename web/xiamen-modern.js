import * as THREE from 'three';
import {palette,site,paving,grove,sign,finish,skin,TAU,edge,railing,palm,sea} from './xiamen-kit.js';
export function twins(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.64,.55);paving(k,g,p,.48,.37);sea(k,g,p,.54,.135,0,.35);
 const frame=k.mat('#92a9ab',.67,.14),glass=k.glass('#567d88','#ebd5b0',171.1);glass.roughness=.57;glass.metalness=.13;glass.userData.night.intensity=.80;glass.userData.xiamenSails=true;
 for(const [cx,h,z0]of [[-.21,1.13,-.035],[.20,1.28,-.07]]){
  // The upper rim is diagonal and gently arced. It is not a flat cylinder cap.
  const point=(u,v)=>{const a=u*TAU,top=h*(.87+.13*Math.sin(a)),r=(.094+.018*Math.sin(v*Math.PI))*(1-.13*v);return [cx+Math.sin(a)*r,.065+v*top,z0+Math.cos(a)*r*.85+.033*v*v];};skin(k,g,point,64,80,glass);
  const cap=(u,v)=>{const q=point(u,1);return [cx+(q[0]-cx)*v,.065+h*.87+(q[1]-.065-h*.87)*v,z0+.033+(q[2]-z0-.033)*v];};skin(k,g,cap,16,80,glass);
  for(let i=1;i<=52;i++){const y=.065+h*i/52,points=[];for(let j=0;j<=96;j++){const u=j/96-.25,top=h*(.87+.13*Math.sin(u*TAU));if(y-.065<=top)points.push(point(u,(y-.065)/top));}if(points.length>2)k.line(g,points,.0015,frame,points.length===97);}
  for(let i=0;i<14;i++)k.line(g,Array.from({length:30},(_,j)=>point(i/14,j/29)),.0008,frame);
  for(const a of [.23,.73]){const light=edge(k,frame.color,'#a08ced',.68);light.userData.pulse={speed:.65,phase:cx*7};k.line(g,Array.from({length:48},(_,j)=>point(a,j/47)),.002,light);}
  k.line(g,Array.from({length:72},(_,j)=>point(j/72,1)),.002,edge(k,frame.color,'#c5d8ed',.5),true);
 }
 // A low shared podium follows a wave, without joining the towers overhead.
 skin(k,g,(u,v)=>{const a=u*TAU,r=.46;return [Math.sin(a)*r,.030+.032*v,Math.cos(a)*.19-.02];},2,80,p.wall);
 const podium=k.mat('#a9b6ad',.8);const roof=k.mesh(g,new THREE.CircleGeometry(1,80),podium,0,.064,-.02);roof.rotation.x=-Math.PI/2;roof.scale.set(.46,.19,1);
 const path=Array.from({length:26},(_,i)=>{const x=-.48+i*.96/25;return [x,.075,.27+.035*Math.cos(x*6)];});k.line(g,path,.018,p.pale);for(const dz of [-.02,.02])railing(k,g,p,path.map(q=>[q[0],q[1],q[2]+dz]),.026);
 for(const x of [-.41,.42])palm(k,g,p,x,.025,.13,.14);
 return finish(k,g,{lamps:[[-.39,.025,.19],[.39,.025,.19]],visitors:[[-.17,.091,.29],[.09,.091,.30],[.31,.091,.28]]});
}
export function haicang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.72,.50);sea(k,g,p,.66,.41);const deck=k.mat('#646d6b',.90),white=k.mat('#c6cebf',.88),blue=k.mat('#597e88',.70),warm=edge(k,blue.color,'#e6cd90',.65);white.userData.haicangPylons=true;
 k.box(g,1.22,.023,.115,deck,0,.175,0);k.box(g,1.22,.018,.126,white,0,.156,0);
 for(const x of [-.32,.32]){
  for(const z of [-.071,.071]){k.box(g,.078,.033,.067,p.stone,x,.043,z);k.beam(g,[x,.06,z*1.09],[x,.55,z],.015,white,4);}
  k.box(g,.031,.022,.155,white,x,.493,0);k.box(g,.032,.027,.155,white,x,.21,0);
 }
 // Continuous sagging main cables with vertical hangers, not a cable-stayed fan.
 const cableY=x=>Math.abs(x)<=.32?.235+.315*(x/.32)**2:.55-.35*((Math.abs(x)-.32)/.29)**.80;
 for(const z of [-.067,.067]){
  const path=Array.from({length:121},(_,i)=>{const x=-.61+i*1.22/120;return [x,cableY(x),z];});k.line(g,path,.0032,blue);k.line(g,path.map(q=>[q[0],q[1]+.0015,q[2]]),.0011,warm);
  for(let i=1;i<40;i++){const x=-.61+i*1.22/40;k.beam(g,[x,.188,z],[x,cableY(x),z],.0011,blue);}
  k.line(g,[[-.61,.191,z],[.61,.191,z]],.0018,warm);
 }
 for(let i=0;i<29;i++){const x=-.59+i*1.18/28;k.box(g,.016,.001,.002,p.pale,x,.188,0);}
 for(const side of [-1,1]){
  for(const z of [-.09,.09])for(let i=0;i<6;i++){const x=side*(.43+i*.025);k.cyl(g,.008,.009,.12,white,x,.09,z,8);}
  const park=new THREE.Group();park.position.set(side*.61,0,0);g.add(park);k.box(park,.09,.10,.20,p.stone,0,.05,0);
 }
 for(const [x,z,col]of [[-.19,.025,'#b6bdab'],[.07,-.023,'#a65f4f'],[.30,.025,'#d0c8ac']]){const m=k.mat(col);k.box(g,.034,.011,.016,m,x,.197,z);k.box(g,.018,.006,.014,k.mat('#536a70'),x,.205,z);}
 return finish(k,g);
}
