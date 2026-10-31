import * as THREE from 'three';
import {glow,plaza,bollards,people,skin} from './shenzhen-forms.js';

export function theatre(k){
  const g=new THREE.Group(),concrete=k.mat('#c5c1ad',.9),frame=k.mat('#bdc6bf',.55,.17),glass=k.mat('#638080',.35,.15),sand=k.mat('#bdb39d'),red=k.mat('#a75d48'),shadow=k.mat('#456362'),light=glow(k,'#ead7b0',1.2),blue=glow(k,'#aecdd3',.36,1,.45),water=k.mat('#5d8987',.40,.12);
  glass.transparent=true;glass.opacity=.22;glass.depthWrite=false;glass.side=THREE.DoubleSide;
  k.box(g,1.35,.020,1.04,concrete,0,.010,0);k.box(g,1.25,.006,.25,water,0,.026,.36);
  k.box(g,.73,.020,.52,concrete,-.18,.060,-.15);
  // Red angular auditorium roofs are visible through the rectangular glass enclosure.
  const profile=[[-.50,.16],[-.38,.23],[-.27,.34],[-.08,.32],[.03,.25],[.15,.21]];
  for(let j=0;j<2;j++){
    const s=new THREE.Shape();s.moveTo(profile[0][0],.075);profile.forEach(q=>s.lineTo(...q));s.lineTo(.15,.075);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.15,bevelEnabled:false}),red,0,0,-.30+j*.17);
  }
  for(const z of [-.35,.08]){
    k.box(g,.80,.32,.002,glass,-.17,.232,z);
    for(let i=0;i<26;i++)k.box(g,.002,.32,.003,frame,-.57+i*.032,.232,z+.003);
    for(let row=0;row<6;row++)k.box(g,.80,.002,.004,frame,-.17,.076+row*.062,z+.003);
    for(const y of [.14,.26])k.box(g,.79,.0015,.003,light,-.17,y,z+.005);
  }
  for(const x of [-.57,.23]){k.box(g,.003,.32,.43,glass,x,.232,-.135);for(let i=0;i<14;i++)k.box(g,.003,.32,.002,frame,x,.232,-.34+i*.032);}
  k.box(g,.81,.012,.45,frame,-.17,.397,-.135);
  // Egg-shaped stone music hall, with diagonal slit windows and a low circular roof.
  skin(k,g,(u,v)=>{const a=u*Math.PI*2,h=.285*v,r=.215*(.78+.22*Math.sin(v*Math.PI));return [.43+Math.cos(a)*r,.055+h,-.13+Math.sin(a)*r*.79];},24,80,sand);
  const top=k.cyl(g,.167,.167,.008,concrete,.43,.343,-.13,64);top.scale.z=.79;
  for(let row=0;row<14;row++){
    const v=(row+.5)/14,r=.215*(.78+.22*Math.sin(v*Math.PI)),pts=[];for(let i=0;i<80;i++){const a=i/80*Math.PI*2;pts.push([.43+Math.cos(a)*(r+.001),.055+.285*v,-.13+Math.sin(a)*(r+.001)*.79]);}k.line(g,pts,.0009,concrete,true);
  }
  for(let i=0;i<13;i++){const a=(.06+i*.07)*Math.PI*2,r=.218,xx=.43+Math.cos(a)*r,zz=-.13+Math.sin(a)*r*.79;k.beam(g,[xx-.006,.17,zz],[xx+.005,.22,zz],.003,shadow,5);}
  const towerX=-.59;k.box(g,.065,.42,.065,concrete,towerX,.262,-.32);k.box(g,.09,.075,.09,shadow,towerX,.49,-.32);k.box(g,.10,.008,.10,concrete,towerX,.532,-.32);
  for(const s of [-1,1]){k.box(g,.082,.002,.002,blue,towerX,.514,-.32+s*.046);for(let i=0;i<6;i++)k.box(g,.002,.065,.002,frame,towerX+(i-2.5)*.014,.491,-.32+s*.046);}
  for(let i=0;i<7;i++)k.box(g,1.13,.008*(i+1),.019,concrete,-.05,.004*(i+1),.20-i*.019);
  for(let i=0;i<14;i++){const x=-.60+i*.092;k.box(g,.002,.037,.002,frame,x,.049,.22);}
  k.box(g,1.21,.002,.002,frame,0,.068,.22);k.box(g,1.21,.002,.002,light,0,.036,.224);
  bollards(k,g,[[-.62,.18],[.60,.18],[-.62,-.43],[.60,-.43]]);people(k,g,[[-.20,.17],[-.15,.17],[.2,.18],[.3,.17],[.34,.18]]);
  return k.merge(g);
}
