import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,hip,TAU,pond,facade} from './nanjing-kit.js';
import {glow} from './shenzhen-forms.js';
export function baoen(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.55,.54);paving(k,g,p,.45,.42);k.cyl(g,.24,.30,.08,p.pale,0,.06,0,8);steps(k,g,p,0,.31,.22,8,.08,.18);
 const glass=k.mat('#9aaeb3',.26,.23),cool=glow(k,'#6ccad8',.48,.7,.2);glass.transparent=true;glass.opacity=.54;glass.depthWrite=false;glass.userData.night={color:new THREE.Color('#b6d7df'),intensity:.18};
 const frame=k.mat('#d3d1bc',.7);frame.userData.night={color:new THREE.Color('#eed2a0'),intensity:.40};const core=k.mat('#667b80',.7);k.cyl(g,.028,.046,.78,core,0,.494,0,8);
 for(let i=0;i<9;i++){const y=.105+i*.086,r=.133-i*.0067;k.cyl(g,r*.84,r*.89,.080,glass,0,y+.040,0,8);k.cyl(g,r*1.01,r*1.05,.005,frame,0,y+.078,0,8);for(let j=0;j<8;j++){const a=j*TAU/8,x=Math.sin(a)*r*.99,z=Math.cos(a)*r*.99;k.beam(g,[x,y,z],[x,y+.084,z],.0021,frame);const a2=(j+1)*TAU/8,xx=Math.sin(a2)*r*.99,zz=Math.cos(a2)*r*.99;for(let row=1;row<=4;row++)k.beam(g,[x,y+row*.019,z],[xx,y+row*.019,zz],row===4?.0015:.0009,row===4?(i>6?cool:p.warm):frame);for(const t of [.33,.67])k.beam(g,[x+(xx-x)*t,y,z+(zz-z)*t],[x+(xx-x)*t,y+.08,z+(zz-z)*t],.0008,frame);}}
 k.cyl(g,.015,.078,.047,p.pale,0,.904,0,8);k.cyl(g,.001,.013,.15,p.gold,0,.995,0,12);for(let i=0;i<10;i++)k.ring(g,.018-i*.0013,.0018,p.gold,.932+i*.012);k.ball(g,.009,p.gold,0,1.075,0);
 for(const side of [-1,1]){k.box(g,.19,.056,.32,glass,side*.31,.051,-.05);for(let i=0;i<7;i++)k.box(g,.002,.056,.322,p.pale,side*.31+(i/6-.5)*.19,.051,-.05);}
 return finish(k,g,{lamps:[[-.26,.30],[.26,.30],[-.27,-.27],[.27,-.27]],visitors:[[-.11,.35],[.14,.29]]});
}
export {zifeng} from './nanjing-zifeng.js';
export function eye(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.80,.48);pond(k,g,p,.72,.36);const white=k.mat('#d0d5cb',.56,.24),lit=glow(k,'#d7e9ee',.58,.6,.7);white.userData.eyeTower=true;
 // Two inclined transverse elliptical towers; the walkway passes through both eyes.
 for(const center of [-.36,.36]){
  const point=a=>[center+.12*Math.sin(a),.36+.32*Math.sin(a),.225*Math.cos(a)];const ring=Array.from({length:100},(_,i)=>point(i/100*TAU));k.line(g,ring,.015,white,true);k.line(g,ring.map(q=>[q[0]-.012,q[1],q[2]]),.0018,lit,true);
  for(const side of [-1,1])for(let i=1;i<=9;i++){const a=.18+i*.13,top=point(side>0?a:Math.PI-a),x=center+(i/9-.5)*.60;k.beam(g,top,[x,.127,side*.073],.0010,p.pale);}
  k.box(g,.080,.095,.19,p.pale,center,.071,0);
 }
 k.box(g,1.46,.030,.15,white,0,.113,0);for(const side of [-1,1]){for(let i=0;i<55;i++)k.box(g,.0018,.035,.002,white,(i/54-.5)*1.46,.145,side*.077);k.box(g,1.46,.003,.003,lit,0,.163,side*.077);}
 for(const side of [-1,1]){const end=new THREE.Group();g.add(end);end.position.x=side*.73;end.rotation.y=-side*Math.PI/2;steps(k,end,p,0,.12,.13,5,.075,.12);}
 return finish(k,g);
}
