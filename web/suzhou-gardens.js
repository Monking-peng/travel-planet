import * as THREE from 'three';
import {palette,site,disc,pond,hall,path,polygonRoof,stoneRock,moonWall,grove,bamboo,sign,finish,TAU} from './suzhou-kit.js';

export function humble(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.68,.61);
 pond(k,g,p,.47,.34,0,.08);hall(k,g,p,{x:0,z:-.28,w:.51,d:.22,h:.16});
 const pavilion=new THREE.Group();pavilion.position.set(.22,0,.12);g.add(pavilion);
 k.cyl(pavilion,.14,.17,.025,p.stone,0,.032,0,6);const green=k.mat('#344e42',.9);
 for(let i=0;i<6;i++){const a=i*TAU/6+Math.PI/6,x=Math.sin(a)*.107,z=Math.cos(a)*.107;k.cyl(pavilion,.004,.005,.17,green,x,.128,z,8);const b=a+TAU/6;for(const y of [.165,.183])k.beam(pavilion,[x,y,z],[Math.sin(b)*.107,y,Math.cos(b)*.107],.003,p.wood);}
 polygonRoof(k,pavilion,p,{n:6,r:.166,h:.079,y:.213});sign(k,pavilion,'荷风四面',.077,.023,0,.190,.119,{background:'#263a31',color:'#dec79c'});
 path(k,g,p,[[-.46,.08],[-.27,.08],[-.27,.25],[.08,.25],[.13,.18]],.038,.042);
 for(let i=0;i<48;i++){const a=i*2.399,r=.10+.24*Math.sqrt((i+.5)/48),x=Math.cos(a)*r-.11,z=Math.sin(a)*r*.74+.08;if(x>-.32&&z>.07&&z<.29)continue;const leaf=k.cyl(g,.012,.012,.001,p.leaf,x,.023,z,10);leaf.rotation.y=a;if(i%4===0){const pink=k.mat(i%8?'#d59ba2':'#e6b6b1',.9);k.cyl(g,.003,.001,.014,p.leaf,x,.030,z,6);for(let j=0;j<5;j++){const b=j*TAU/5,o=k.ball(g,.004,pink,x+Math.sin(b)*.003,.039,z+Math.cos(b)*.003);o.scale.set(.55,1.1,.8);}}}
 for(const [x,z]of [[-.43,-.23],[.43,-.23]])hall(k,g,p,{x,z,w:.14,d:.15,h:.09});
 grove(k,g,height,[[-.53,-.16,.20],[-.45,-.39,.20],[.48,-.37,.21],[.53,.25,.16]]);bamboo(k,g,-.47,.30,.18);
 return finish(k,g,{lamps:[[-.33,.038,-.21],[.36,.038,-.20]],visitors:[[-.22,.049,.25],[.02,.049,.25]]});
}

export function lingering(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.64,.56);
 disc(k,g,.45,.37,.023,p.pale);disc(k,g,.20,.12,.026,p.water,0,.18);
 hall(k,g,p,{z:-.27,w:.61,d:.19,h:.15});for(const side of [-1,1]){const wing=new THREE.Group();wing.position.set(side*.36,0,-.04);wing.rotation.y=Math.PI/2;g.add(wing);hall(k,wing,p,{w:.37,d:.13,h:.10});}
 stoneRock(k,g,p,{x:0,z:-.05,h:.39,w:.18});stoneRock(k,g,p,{x:-.16,z:-.01,h:.21,w:.10});stoneRock(k,g,p,{x:.16,z:-.02,h:.24,w:.12});
 moonWall(k,g,p,{x:-.26,z:.24,w:.21,h:.18,r:.058});k.box(g,.25,.012,.032,p.tile,-.26,.201,.24);
 path(k,g,p,[[.35,-.20],[.35,.30],[.18,.35],[-.09,.35]],.043,.033);
 sign(k,g,'冠云峰',.075,.022,0,.042,.061,{background:'#a09d8c',color:'#44493c'});
 grove(k,g,height,[[-.50,-.13,.23],[.49,-.25,.22],[.42,.30,.16]]);bamboo(k,g,-.42,.26,.24);
 return finish(k,g,{lamps:[[-.16,.03,-.11],[.15,.03,.06],[.33,.03,.24]],visitors:[[.31,.04,.22],[-.25,.024,.32]]});
}
