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
export function jiefang(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.77,.55);sea(k,g,p,.76,.54);const steel=lit(k,'#899c9d',.16),edge=lit(k,'#b9bda9',.38),road=k.mat('#68716c',.97);
 k.box(g,1.38,.028,.26,p.stone,0,.102,0);k.box(g,1.36,.006,.17,road,0,.120,0);for(let i=0;i<14;i++)k.box(g,.045,.001,.002,p.pale,-.64+i*.098,.124,0);
 const knots=[[-.67,.15],[-.44,.36],[-.22,.39],[.22,.39],[.44,.36],[.67,.15]];
 for(const z of [-.111,.111]){
  for(let i=1;i<knots.length;i++)k.beam(g,[knots[i-1][0],knots[i-1][1],z],[knots[i][0],knots[i][1],z],.010,steel,4);
  k.beam(g,[-.67,.14,z],[.67,.14,z],.010,steel,4);
  for(let j=0;j<10;j++){const x=-.60+j*.133,y=Math.abs(x)>.43?.26:.38;k.beam(g,[x,.145,z],[x,y,z],.005,steel,4);if(j<9)k.beam(g,[x,.145,z],[x+.133,Math.abs(x+.133)>.43?.26:.38,z],.0055,steel,4);}
  for(const x of [-.43,.43]){k.beam(g,[x,.14,z],[x,.47,z],.006,steel,4);k.beam(g,[x,.47,z],[x+Math.sign(x)*.20,.14,z],.0055,steel,4);}
  k.beam(g,[-.66,.131,z],[.66,.131,z],.0018,edge,4);
 }
 for(const x of [-.43,.43]){k.beam(g,[x,.47,-.12],[x,.47,.12],.009,steel,4);for(let j=0;j<4;j++)k.beam(g,[x,.455,-.12+j*.06],[x,.485,-.06+j*.06],.002,steel,4);}
 for(const x of [-.66,-.22,.22,.66]){k.box(g,.06,.09,.24,p.stone,x,.065,0);if(Math.abs(x)<.3)k.beam(g,[x,.39,-.11],[x,.39,.11],.004,steel);}
 for(const x of [-.70,.70])k.box(g,.12,.040,.35,p.pale,x,.082,0);
 const marker=new THREE.Group();marker.position.set(-.64,.125,.155);g.add(marker);k.box(marker,.13,.055,.026,p.stone);sign(k,marker,'解放桥',.10,.035,0,0,.014,{background:'#969b90',color:'#d5b66c'});
 return finish(k,g,{lamps:[[-.66,.127,-.14],[.66,.127,-.14]],visitors:[[-.48,.126,.116],[.28,.126,.116]]});
}
export function tianta(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.58,.56);sea(k,g,p,.57,.55);const cement=lit(k,'#b4b0a0',.07),glass=lit(k,'#41606a',.045,'#7c9bb8'),trim=lit(k,'#bcbca9',.23);
 k.cyl(g,.15,.17,.028,p.stone,0,.045,0,64);k.box(g,.13,.024,.50,p.pale,0,.040,.27);k.cyl(g,.105,.14,.045,p.wall,0,.080,0,64);
 k.cyl(g,.025,.049,1.00,cement,0,.60,0,64);for(let j=0;j<7;j++){const y=1.09+j*.013,r=.042+j*.010;k.cyl(g,r,r,.011,trim,0,y,0,64);}
 k.cyl(g,.116,.105,.040,glass,0,1.20,0,64);k.cyl(g,.112,.122,.018,trim,0,1.229,0,64);k.cyl(g,.053,.112,.034,cement,0,1.255,0,64);k.cyl(g,.035,.052,.035,glass,0,1.289,0,40);k.cyl(g,.015,.033,.08,cement,0,1.346,0,40);
 for(let i=0;i<36;i++){const a=i/36*TAU;k.beam(g,[Math.sin(a)*.113,1.18,Math.cos(a)*.113],[Math.sin(a)*.119,1.223,Math.cos(a)*.119],.0012,p.pale);}
 k.cyl(g,.004,.009,.23,p.red,0,1.498,0,16);for(let j=0;j<4;j++)k.cyl(g,.007,.007,.020,p.pale,0,1.418+j*.048,0,16);
 return finish(k,g,{lamps:[[-.08,.052,.30],[.08,.052,.42]],visitors:[[.025,.053,.26]]});
}
