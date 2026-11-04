import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hall,lit,TAU,skin,lantern,dragon,hip,sea,railing} from './quanzhou-kit.js';
import {bridge} from './shunde-kit.js';
function graniteMaterial(k){const m=k.mat('#929185',.98,.01);m.userData.night={color:new THREE.Color('#c7c4ad'),intensity:.018};m.userData.kaiyuanStone=true;m.onBeforeCompile=s=>{s.vertexShader='varying vec3 kaiyuanStone;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nkaiyuanStone=position;');s.fragmentShader='varying vec3 kaiyuanStone;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float row=floor(kaiyuanStone.y*135.0);vec2 grid=vec2((kaiyuanStone.x+kaiyuanStone.z)*85.0+mod(row,2.0)*.5,kaiyuanStone.y*135.0);
 vec2 f=fract(grid);float joint=step(.026,f.x)*step(.035,f.y);
 float tone=fract(sin(dot(floor(grid),vec2(12.989,78.233)))*43758.5453);diffuseColor.rgb*=mix(.78,.94+tone*.10,joint);`);};m.customProgramCacheKey=()=> 'kaiyuan-stone-block-v1';return m;}
function relief(k,g,p,x,y,z,seed){
 const panel=k.box(g,.017,.041,.002,p.recess,x,y+.021,z),robe=k.mesh(g,new THREE.LatheGeometry([new THREE.Vector2(.006,0),new THREE.Vector2(.005,.010),new THREE.Vector2(.0055,.020),new THREE.Vector2(.0035,.026)],10),p.carving,x,y+.003,z+.002);robe.scale.z=.52;
 const head=k.ball(g,.0033,p.carving,x,y+.034,z+.003);head.scale.z=.65;k.cyl(g,.0034,.003,.003,p.carving,x,y+.038,z+.003,8);
 const pose=seed%3;for(const side of [-1,1]){k.beam(g,[x+side*.004,y+.025,z+.003],[x+side*(pose===0?.001:.005),y+(pose===1?.030:.017),z+.007],.0018,p.carving,7);for(let j=0;j<3;j++)k.beam(g,[x+side*j*.0015,y+.017,z+.006],[x+side*(j+.2)*.0017,y+.003,z+.006],.0005,p.trim);}
 for(const xx of [-.009,.009])k.box(g,.0012,.045,.003,p.trim,x+xx,y+.022,z+.001);for(const yy of [0,.044])k.box(g,.019,.0012,.003,p.trim,x,y+yy,z+.001);
}
function bracket(k,g,p,x,y,z){for(let i=0;i<3;i++){const reach=.005+i*.004;k.box(g,.008+i*.005,.004,.009+i*.006,p.trim,x,y+i*.004,z+reach);k.box(g,.005,.005,.010,p.stone,x,y-.003+i*.004,z+reach);}k.box(g,.024,.003,.023,p.stone,x,y+.013,z+.011);}
function stonePagoda(k,g,p,x,z,scale=1,east=false){
 const child=new THREE.Group();child.name=east?'kaiyuan-east':'kaiyuan-west';g.add(child);child.position.set(x,.034,z);child.scale.setScalar(scale);
 const q={stone:graniteMaterial(k),trim:k.mat('#99988b',.96),roof:k.mat('#787c73',.98),recess:k.mat('#74746a',.99),carving:k.mat('#a4a193',.98),dark:k.mat('#3e413b',.99),metal:k.mat('#695743',.78,.2)};
 for(const [r,y,h]of [[.146,.008,.016],[.140,.022,.012],[.125,.037,.018],[.141,.051,.010],[.145,.058,.006]]){const o=k.cyl(child,r,r,h,q.stone,0,y,0,8);o.rotation.y=Math.PI/8;}
 // A moulded plinth and miniature relief panels support the five real storeys.
 for(let i=0;i<8;i++){const a=i*TAU/8,f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*.118,.028,Math.cos(a)*.118);child.add(f);for(const xx of [-.026,0,.026]){k.box(f,.021,.014,.002,q.recess,xx,.011,0);const o=k.ball(f,.006,q.carving,xx,.012,.001);o.scale.set(1.2,.65,.3);}}
 for(let level=0;level<5;level++){
  const y=.064+level*.129,r=.105-level*.004,apothem=r*Math.cos(Math.PI/8),width=2*r*Math.sin(Math.PI/8),height=.103;
  const core=k.cyl(child,.026,.026,.115,q.dark,0,y+.052,0,8);core.userData.hiddenCore=true;
  for(let i=0;i<8;i++){const a=i*TAU/8,f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*apothem,y,Math.cos(a)*apothem);child.add(f);const opening=(i+level)%2===0;
   if(opening){const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(width/2,0);shape.lineTo(width/2,height);shape.lineTo(-width/2,height);shape.closePath();const hole=new THREE.Path();hole.moveTo(-.011,.009);hole.lineTo(-.011,.056);hole.absarc(0,.056,.011,Math.PI,0,true);hole.lineTo(.011,.009);hole.closePath();shape.holes.push(hole);k.mesh(f,new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:false,curveSegments:16}),q.stone,0,0,-.008);
    k.line(f,[[-.013,.009,.002],[-.013,.056,.002],[-.010,.065,.002],[0,.070,.002],[.010,.065,.002],[.013,.056,.002],[.013,.009,.002]],.0014,q.trim);
   }else{k.box(f,width,height,.009,q.stone,0,height/2,-.0045);k.box(f,.022,.041,.002,q.recess,0,.045,.001);k.box(f,.017,.035,.003,q.dark,0,.045,.002);for(const xx of [-.008,0,.008])k.box(f,.001,.035,.005,q.trim,xx,.045,.004);k.box(f,.018,.001,.005,q.trim,0,.045,.004);}
   for(const side of [-1,1]){relief(k,f,q,side*width*.32,.024,.003,i+level+side);k.box(f,.005,.094,.009,q.trim,side*width*.49,.047,.001);}
   for(const yy of [.012,.020,.084,.092])k.box(f,width,.002,.005,q.trim,0,yy,.001);
   const points=east||level<2?[-width/2,-width/6,width/6,width/2]:[-width/2,0,width/2];for(const xx of points)bracket(k,f,q,xx,.097,.001);
   // Low stone rails sit outside the tower wall; portals remain distinguishable.
   const railZ=.012;for(const yy of [.006,.020])k.box(f,width+.007,.0025,.004,q.trim,0,yy,railZ);for(const xx of [-width/2,0,width/2])k.box(f,.003,.023,.004,q.trim,xx,.012,railZ);
  }
  const shelf=k.cyl(child,r*1.17,r*1.17,.006,q.stone,0,y+.003,0,8);shelf.rotation.y=Math.PI/8;
  const outer=r*1.38,high=level===4?.062:.030,inner=level===4?.004:r*.74;
  const point=(u,v)=>{const a=u*TAU,sector=TAU/8,local=((a+sector/2)%sector)-sector/2,edge=outer*Math.cos(sector/2)/Math.cos(local),rad=inner+(edge-inner)*v;return [Math.sin(a)*rad,y+.112+high*(1-v)**1.45+.009*v**7*(Math.abs(local)/(sector/2))**5,Math.cos(a)*rad];};
  skin(k,child,point,12,96,q.roof);k.line(child,Array.from({length:128},(_,i)=>point(i/128,1)),.0018,q.trim,true);
  for(let i=0;i<64;i++)k.line(child,Array.from({length:10},(_,j)=>{const q=point(i/64,.04+.96*j/9);q[1]+=.001;return q;}),.00085,q.trim);
 }
 const top=.064+4*.129+.174;k.cyl(child,.0025,.003,.126,q.metal,0,top+.063,0,16);k.ball(child,.012,q.metal,0,top+.010,0);for(let j=0;j<9;j++)k.cyl(child,.012-j*.0009,.012-j*.0009,.004,q.metal,0,top+.026+j*.010,0,16);k.ball(child,.005,q.metal,0,top+.133,0);k.ball(child,.003,p.gold,0,top+.142,0);
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;k.line(child,[[0,top+.117,0],[Math.sin(a)*.042,top+.050,Math.cos(a)*.042],[Math.sin(a)*.118,top-.052,Math.cos(a)*.118]],.00065,q.metal);}
 return child;
}
export function kaiyuan(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.66,.55);paving(k,g,p,.53,.42);g.userData.stonePagodas={stories:[5,5],sides:8};
 stonePagoda(k,g,p,-.32,.13,.92);stonePagoda(k,g,p,.32,.13,.985,true);p.tile=k.mat('#9e6549',.91);
 hall(k,g,p,{w:.56,d:.27,h:.14,z:-.17,double:true,ornate:true});hall(k,g,p,{w:.23,d:.12,h:.07,z:.32});
 for(const x of [-.40,.40])hall(k,g,p,{x,z:-.22,w:.16,d:.15,h:.095});
 steps(k,g,p,0,.02,.24,5,.030,.08);sign(k,g,'界法蓮桑',.093,.022,0,.254,-.069,{background:'#47382b',color:'#dbc18b'});
 grove(k,g,h,[[-.49,-.05,.16],[.49,-.06,.16],[-.25,-.39,.18],[.23,-.39,.17],[0,-.41,.17]]);
 finish(k,g,{lamps:[[-.13,.023,.24],[.13,.023,.24],[-.48,.023,.27],[.48,.023,.27]],visitors:[[-.10,.023,.12],[.05,.023,.16],[.13,.023,.29],[-.18,.023,-.02]]});
 for(const x of [-.32,.32]){const l=new THREE.SpotLight('#e1d6b9',0,1.1,.58,.8,2);l.position.set(x,.48,.48);l.target.position.set(x,.48,.13);l.userData.nightIntensity=.07;g.add(l,l.target);}return g;
}
