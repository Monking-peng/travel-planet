import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hall,lit,TAU,skin,lantern,dragon,hip,sea,railing} from './quanzhou-kit.js';
import {bridge} from './shunde-kit.js';
function stonePagoda(k,g,p,x,z,scale=1){
 const child=new THREE.Group();g.add(child);child.position.set(x,.035,z);child.scale.setScalar(scale);
 for(let i=0;i<3;i++)k.cyl(child,.14-i*.008,.15-i*.008,.014,p.stone,0,.007+i*.014,0,8);
 const wall=lit(k,'#9e9983',.16),shade=k.mat('#4b4b40',.96),trim=lit(k,'#aaa58c',.35);
 for(let level=0;level<5;level++){
  const y=.043+level*.125,r=.092-level*.006;k.cyl(child,r,r*.99,.098,wall,0,y+.049,0,8);
  for(let face=0;face<8;face++){const a=(face+.5)/8*TAU,c=new THREE.Group();c.rotation.y=a;c.position.set(Math.sin(a)*r*.926,y,Math.cos(a)*r*.926);child.add(c);
   k.box(c,.020,.050,.003,shade,0,.044,0);k.mesh(c,new THREE.CircleGeometry(.010,16,0,Math.PI),shade,0,.069,.002);k.box(c,.028,.004,.006,p.pale,0,.017,.001);
   for(const side of [-1,1]){k.cyl(c,.003,.003,.078,p.stone,side*.030,.047,0,8);k.box(c,.012,.006,.009,p.pale,side*.030,.086,.002);}
   for(let j=0;j<3;j++)k.box(c,.065,.001,.001,p.stone,0,.015+j*.028,.003);
  }
  k.cyl(child,r*1.20,r*1.20,.007,trim,0,y+.008,0,8);
  const eave=r*1.34,high=.038;
  const point=(u,v)=>{const a=u*TAU,sector=TAU/8,local=((a+sector/2)%sector)-sector/2,rr=eave*Math.cos(sector/2)/Math.cos(local),t=.001+.999*v;return [Math.sin(a)*rr*t,y+.097+high*(1-t)**1.4+.013*t**8*(Math.abs(local)/(sector/2))**5,Math.cos(a)*rr*t];};
  skin(k,child,point,10,96,p.stone);k.line(child,Array.from({length:96},(_,i)=>point(i/96,1)),.002,trim,true);
  for(let i=0;i<32;i++)k.line(child,Array.from({length:8},(_,j)=>{const q=point(i/32,.08+.92*j/7);q[1]+=.001;return q;}),.0009,p.stone);
 }
 const top=.043+4*.125+.135;k.cyl(child,.006,.014,.13,p.stone,0,top+.065,0,12);for(let j=0;j<8;j++)k.cyl(child,.014-j*.0011,.014-j*.0011,.004,p.stone,0,top+.012+j*.014,0,16);k.ball(child,.005,p.gold,0,top+.140,0);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.line(child,[[0,top+.13,0],[Math.sin(a)*.035,top+.075,Math.cos(a)*.035],[Math.sin(a)*.084,top-.025,Math.cos(a)*.084]],.0007,shade);}
}
export function kaiyuan(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.66,.55);paving(k,g,p,.53,.42);g.userData.stonePagodas={stories:[5,5],sides:8};
 stonePagoda(k,g,p,-.31,.13,.92);stonePagoda(k,g,p,.31,.13,1.02);p.tile=k.mat('#9e6549',.91);
 hall(k,g,p,{w:.42,d:.23,h:.16,z:-.14,double:true,ornate:true});hall(k,g,p,{w:.23,d:.12,h:.07,z:.32});
 for(const x of [-.40,.40])hall(k,g,p,{x,z:-.22,w:.16,d:.15,h:.095});
 steps(k,g,p,0,.02,.24,5,.030,.08);sign(k,g,'开元寺',.088,.031,0,.205,.005,{background:'#47382b',color:'#dbc18b'});
 grove(k,g,h,[[-.49,-.05,.16],[.49,-.06,.16],[-.25,-.39,.18],[.23,-.39,.17],[0,-.41,.17]]);
 return finish(k,g,{lamps:[[-.13,.023,.24],[.13,.023,.24],[-.48,.023,.27],[.48,.023,.27]],visitors:[[-.10,.023,.12],[.05,.023,.16],[.13,.023,.29],[-.18,.023,-.02]]});
}
export function tianhou(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.62,.55);paving(k,g,p,.49,.43);p.tile=k.mat('#79755c',.91);
 hall(k,g,p,{z:.23,w:.55,d:.18,h:.17,ornate:true});hall(k,g,p,{z:-.18,w:.45,d:.25,h:.18,double:true,ornate:true});
 for(const x of [-.36,.36]){const wing=new THREE.Group();g.add(wing);wing.position.set(x,0,-.02);wing.rotation.y=Math.PI/2;hall(k,wing,p,{w:.42,d:.13,h:.10});}
 for(const x of [-.20,-.068,.068,.20])lantern(k,g,p,x,.185,.325,.015);
 // Stone dragon columns and the two guardian lions belong to the entrance.
 for(const x of [-.18,.18]){k.box(g,.048,.037,.048,p.stone,x,.040,.38);const body=k.ball(g,.019,p.stone,x,.072,.38);body.scale.set(.8,1.1,1.0);k.ball(g,.014,p.pale,x,.094,.393);for(const dx of [-.009,.009])k.box(g,.010,.025,.022,p.stone,x+dx,.060,.397);}
 sign(k,g,'天后宫',.076,.033,0,.190,.324,{background:'#483c32',color:'#d6bc83'});steps(k,g,p,0,.41,.25,4,.026,.07);
 grove(k,g,h,[[-.49,-.29,.16],[.49,-.30,.16],[-.18,-.43,.13],[.20,-.43,.13]]);
 return finish(k,g,{lamps:[[-.29,.023,.40],[.29,.023,.40],[-.22,.023,.01],[.22,.023,.01]],visitors:[[-.08,.023,.40],[.09,.023,.41],[.12,.023,.05],[-.16,.023,-.04]]});
}
export function wenmiao(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.63,.56);paving(k,g,p,.51,.45);p.tile=k.mat('#787657',.9);
 hall(k,g,p,{z:-.20,w:.57,d:.26,h:.17,double:true,ornate:true});sign(k,g,'大成殿',.077,.034,0,.235,-.034,{background:'#4a392b',color:'#ddc69c'});
 for(const x of [-.40,.40]){const c=new THREE.Group();c.position.x=x;c.rotation.y=Math.PI/2;g.add(c);hall(k,c,p,{w:.43,d:.13,h:.09});}
 sea(k,g,p,.29,.19,0,.17);for(const z of [-.02,.36])k.box(g,.61,.011,.020,p.stone,0,.031,z);for(const x of [-.30,.30])k.box(g,.020,.011,.38,p.stone,x,.031,.17);
 const b=new THREE.Group();b.rotation.y=Math.PI/2;b.position.z=.17;g.add(b);bridge(k,b,p,{length:.42,w:.085,rise:.043,y:.025});
 for(const side of [-1,1]){const a=side*.27;railing(k,g,p,[[a,.032,-.03],[a,.032,.37]],.031);}
 steps(k,g,p,0,.01,.32,4,.025,.065);const burner=k.cyl(g,.022,.028,.035,p.wood,0,.075,-.015,20);for(const side of [-1,1])k.beam(g,[side*.022,.074,-.015],[side*.028,.115,-.015],.003,p.wood);
 grove(k,g,h,[[-.39,.29,.20],[.39,.29,.20],[-.48,-.27,.14],[.48,-.27,.14]]);
 return finish(k,g,{lamps:[[-.20,.023,.40],[.20,.023,.40],[-.28,.023,-.06],[.28,.023,-.06]],visitors:[[-.08,.023,.40],[.07,.023,.37],[-.24,.023,-.06]]});
}
export function luojia(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.71,.59);sea(k,g,p,.66,.54);p.tile=k.mat('#bd764d',.85);p.wall=k.mat('#d5b66a',.94);
 // The temple rests on a granite island with a sea wall and an elevated approach.
 const shape=new THREE.Shape();[[-.43,-.24],[-.25,-.37],[.23,-.36],[.43,-.20],[.44,.19],[.28,.30],[-.28,.30],[-.44,.13]].forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.071,bevelEnabled:false});geo.rotateX(-Math.PI/2);k.mesh(g,geo,p.stone,0,.025,0);const deck=new THREE.ShapeGeometry(shape);deck.rotateX(-Math.PI/2);k.mesh(g,deck,p.pale,0,.097,0);
 hall(k,g,p,{y:.117,z:-.12,w:.36,d:.25,h:.22,double:true,ornate:true});hall(k,g,p,{y:.117,z:.20,w:.29,d:.10,h:.10,ornate:true});
 hall(k,g,p,{y:.117,x:-.32,z:-.07,w:.13,d:.33,h:.10});hall(k,g,p,{y:.117,x:.32,z:-.04,w:.13,d:.15,h:.18,double:true});for(const x of [-.32,.32])hall(k,g,p,{y:.117,x,z:.18,w:.14,d:.10,h:.07});
 const wall=[[-.43,-.24],[-.25,-.37],[.23,-.36],[.43,-.20],[.44,.19],[.28,.30],[-.28,.30],[-.44,.13],[-.43,-.24]];railing(k,g,p,wall.map(([x,z])=>[x,.098,z]),.035);
 k.box(g,.105,.024,.30,p.stone,-.13,.087,.43);for(const x of [-.181,-.079])railing(k,g,p,[[x,.10,.30],[x,.10,.57]],.037);
 const rocks=k.mat('#817f6d',.99);for(let i=0;i<30;i++){const a=i/30*TAU,r=.43+.035*Math.sin(i*7);const o=k.mesh(g,new THREE.DodecahedronGeometry(.038+(i%4)*.008,0),rocks,Math.sin(a)*r,.046,Math.cos(a)*r*.77);o.scale.set(1.1,.73,.85);o.rotation.set(i*.31,i*.67,i*.21);}
 for(let i=0;i<8;i++){const a=i/8*TAU;k.line(g,Array.from({length:12},(_,j)=>{const t=a+(j/11-.5)*.19;return [Math.sin(t)*.52,.029,Math.cos(t)*.45];}),.0015,k.mat('#b9cebd',.8));}
 sign(k,g,'洛伽寺',.067,.026,0,.216,.263,{background:'#754739',color:'#ead4a6'});
 return finish(k,g,{lamps:[[-.28,.099,.26],[.28,.099,.26],[-.28,.099,-.30],[.28,.099,-.30]],visitors:[[-.12,.10,.47],[-.08,.10,.10],[.10,.10,.07],[.18,.10,.16],[-.22,.10,-.20]]});
}
