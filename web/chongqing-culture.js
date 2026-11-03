import * as THREE from 'three';
import {TAU,palette,site,paving,steps,hip,skin,glow,sign,finish,facade,prism,grove} from './chongqing-kit.js';
export function greatHall(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.79,.65);paving(k,g,p,.67,.55);const wall=k.mat('#c7b78c',.9),roof=k.mat('#267d72',.52),trim=glow(k,'#dbbd79',.65,.3,.36),r=.25;
 k.box(g,.54,.14,.37,wall,0,.16,-.11);k.cyl(g,.234,.234,.19,p.red,0,.292,-.11,72);
 for(const [radius,y,h]of [[.307,.40,.055],[.279,.48,.050],[.255,.55,.13]]){
  skin(k,g,(u,v)=>{const a=u*TAU,rr=.002+(radius-.002)*v;return [Math.sin(a)*rr,y+h*(1-v)**1.5,-.11+Math.cos(a)*rr];},14,96,roof);const ring=k.ring(g,radius,.0025,trim,y);ring.position.z=-.11;
  const bodyHeight=y===.40?.14:.06,rr=radius*.83;k.cyl(g,rr,rr,bodyHeight,k.mat('#566c5b',.8),0,y-bodyHeight/2,-.11,64);
  for(let i=0;i<32;i++){const a=i/32*TAU;k.cyl(g,.0032,.004,bodyHeight-.008,p.red,Math.sin(a)*radius*.88,y-bodyHeight/2,-.11+Math.cos(a)*radius*.88,8);k.line(g,Array.from({length:7},(_,j)=>{const v=.15+.85*j/6;return [Math.sin(a)*radius*v,y+h*(1-v)**1.5+.001,-.11+Math.cos(a)*radius*v];}),.001,roof);}
  for(const offset of [bodyHeight-.009,bodyHeight-.026]){const rail=k.ring(g,radius*.92,.0018,p.pale,y-offset);rail.position.z=-.11;}
 }
 k.cyl(g,.008,.017,.04,p.gold,0,.704,-.11,12);k.ball(g,.010,p.gold,0,.728,-.11);k.beam(g,[0,.732,-.11],[0,.77,-.11],.0015,p.gold);
 for(const side of [-1,1]){k.box(g,.35,.14,.23,wall,side*.43,.16,-.08);hip(k,g,.42,.29,.055,.235,roof,trim,side*.43,-.08);for(let j=0;j<7;j++)k.cyl(g,.004,.005,.12,p.red,side*.43-.15+j*.05,.17,.047,8);facade(k,g,.31,.10,side*.43,.16,.039,wall,p.pale,{bays:7,rows:2});for(const x of [side*.27,side*.61])hip(k,g,.14,.15,.055,.285,roof,trim,x,-.08);}
 for(let i=0;i<9;i++)k.cyl(g,.006,.007,.15,p.red,-.22+i*.055,.17,.105,10);steps(k,g,p,0,.33,.51,9,.09,.18);
 // Three open ceremonial portals with five staggered roof caps.
 const gy=.21,gz=.43;for(const x of [-.30,-.13,.13,.30]){k.box(g,.034,.22,.042,p.red,x,.13,gz);k.box(g,.050,.012,.06,p.stone,x,.023,gz);}
 for(const [x,w,y]of [[0,.27,.275],[-.215,.18,.23],[.215,.18,.23]]){k.box(g,w,.049,.044,p.red,x,y-.022,gz);k.box(g,w,.008,.050,p.green,x,y+.008,gz);hip(k,g,w+.07,.13,.046,y+.018,roof,trim,x,gz);}
 for(const x of [-.30,-.13,.13,.30])hip(k,g,.085,.10,.035,.345,roof,trim,x,gz);
 sign(k,g,'重庆市人民大礼堂',.25,.035,0,.255,gz+.026,{background:'#a43e31',color:'#e4c37b'});grove(k,g,height,[[-.61,.23,.18],[.61,.23,.18],[-.58,-.31,.20],[.58,-.31,.20]]);
 return finish(k,g,{lamps:[[-.42,.41],[.42,.41],[-.55,.10],[.55,.10]],visitors:[[-.06,.52],[.04,.50],[.25,.34],[-.22,.31]]});
}
export function monument(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.58,.53);paving(k,g,p,.49,.44);const wall=k.mat('#d9ceab',.9),accent=k.mat('#b89858',.58,.24),dark=k.mat('#4c625d',.7);
 k.cyl(g,.18,.20,.025,p.stone,0,.035,0,64);k.cyl(g,.104,.133,.075,wall,0,.078,0,8);k.cyl(g,.072,.099,.48,wall,0,.35,0,8);k.cyl(g,.084,.078,.042,wall,0,.61,0,8);k.cyl(g,.105,.105,.018,p.pale,0,.639,0,8);
 for(let i=0;i<8;i++){const a=i/8*TAU;k.box(g,.007,.41,.007,accent,.089*Math.sin(a),.35,.089*Math.cos(a));}
 for(let i=0;i<4;i++){const a=i/4*TAU,face=new THREE.Group();g.add(face);face.rotation.y=a;
  const clock=k.mesh(face,new THREE.CircleGeometry(.025,40),p.pale,0,.611,.083);clock.material.side=THREE.DoubleSide;for(let j=0;j<12;j++){const t=j/12*TAU;const tick=k.box(face,.002,.005,.001,dark,Math.sin(t)*.020,.611+Math.cos(t)*.020,.085);tick.rotation.z=-t;}k.beam(face,[0,.611,.086],[.014,.617,.086],.0017,dark);k.beam(face,[0,.611,.086],[-.003,.627,.086],.0013,dark);
 }
 // Open observation crown and a small helmet top, not a pagoda roof.
 for(let i=0;i<8;i++){const a=i/8*TAU;k.cyl(g,.004,.005,.054,wall,.076*Math.sin(a),.674,.076*Math.cos(a),6);}k.cyl(g,.085,.091,.012,wall,0,.704,0,8);k.mesh(g,new THREE.SphereGeometry(.086,32,14,0,TAU,0,Math.PI/2),wall,0,.705,0).scale.y=.42;k.beam(g,[0,.74,0],[0,.825,0],.002,dark);k.beam(g,[-.022,.805,0],[.022,.805,0],.0017,dark);
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=128;c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle='#d9ceab';ctx.fillRect(0,0,128,1024);ctx.fillStyle='#8f6033';ctx.font='bold 94px Microsoft YaHei';ctx.textAlign='center';'人民解放纪念碑'.split('').forEach((s,i)=>ctx.fillText(s,64,110+i*120));const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#fff');m.map=map;k.mesh(g,new THREE.PlaneGeometry(.039,.37),m,0,.35,.095);}
 for(let i=0;i<24;i++){const a=i/24*TAU;k.ball(g,.017,k.mat(i%3?'#6e8352':'#bf975d',.95),.19*Math.sin(a),.051,.19*Math.cos(a));}
 return finish(k,g,{lamps:[[-.3,-.20],[.3,-.20],[-.3,.20],[.3,.20]],visitors:[[.25,.20],[-.22,.28],[.1,.31],[-.25,-.16],[.28,-.12]]});
}
export function theatre(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.77,.60);paving(k,g,p,.68,.49);k.box(g,1.08,.052,.64,p.pale,0,.052,0);const glass=k.mat('#8da99c',.38,.26),frames=k.mat('#627d73',.59,.22),dark=k.mat('#3b5954',.36,.3);glass.userData.night={color:new THREE.Color('#b8d6bd'),intensity:.50};glass.userData.pulse={phase:2,speed:.28};
 // Distinct inclined glass shells sit around two higher stage houses.
 for(const [x,w,h,z,d]of [[-.35,.28,.31,.05,.46],[-.04,.33,.35,.02,.56],[.29,.30,.29,.05,.46]]){
  const pts=[[x-w/2,.08,z+d/2],[x+w/2,.08,z+d/2],[x+w/2,.08,z-d/2],[x-w/2,.08,z-d/2],[x-w*.62,h,z+d*.67],[x+w*.62,h,z+d*.67],[x+w*.43,h+.06,z-d*.38],[x-w*.43,h+.06,z-d*.38]];prism(k,g,pts,glass);
  const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];for(const f of faces){for(const axis of [0,1])for(let j=0;j<=10;j++){const t=j/10,a=new THREE.Vector3(...pts[f[axis?0:0]]).lerp(new THREE.Vector3(...pts[f[axis?3:1]]),t),b=new THREE.Vector3(...pts[f[axis?1:3]]).lerp(new THREE.Vector3(...pts[f[axis?2:2]]),t);k.beam(g,a.toArray(),b.toArray(),.0008,frames);}}
  for(let j=0;j<5;j++){const yy=.10+j*.045;k.box(g,.007,.022,.002,dark,x+w*.22,yy,z+d*.5+.004+(yy-.08)*.25);}
 }
 for(const [x,z,w,h]of [[-.12,-.10,.27,.58],[.30,-.13,.19,.45]]){const pts=[[x-w/2,.20,z+.10],[x+w/2,.20,z+.10],[x+w/2,.20,z-.10],[x-w/2,.20,z-.10],[x-w*.45,h,z+.075],[x+w*.45,h,z+.075],[x+w*.42,h,z-.09],[x-w*.42,h,z-.09]];prism(k,g,pts,glass);for(let i=0;i<=10;i++)k.beam(g,[x-w/2+i*w/10,.22,z+.102],[x-w*.45+i*w*.9/10,h,z+.078],.0015,frames);for(let i=0;i<=12;i++)k.box(g,w*.9,.001,.003,frames,x,.22+i*(h-.22)/12,z+.085);}
 k.box(g,.33,.048,.020,dark,-.08,.101,.335);for(let i=0;i<9;i++)k.box(g,.003,.049,.023,p.pale,-.24+i*.04,.101,.335);steps(k,g,p,-.08,.41,.45,5,.035,.075);sign(k,g,'重庆大剧院',.20,.025,-.08,.157,.337,{background:'#8da99c',color:'#34534c'});
 return finish(k,g,{lamps:[[-.52,.37],[.48,.37],[-.56,-.33],[.56,-.33]],visitors:[[-.18,.37],[.12,.38],[.4,.29]]});
}
