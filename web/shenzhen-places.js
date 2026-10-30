import * as THREE from 'three';
import {roof,stairs,plaque} from './wuhan-architecture.js';
import {skin,glow,plaza,palm,bollards,people,hill} from './shenzhen-forms.js';

export function wheel(k){
  const g=new THREE.Group(),white=k.mat('#d4dfd7',.47,.36),glass=k.mat('#7596a2',.29,.38,'#f5cb8f'),stone=plaza(k,g,.48,.32),led=Array.from({length:8},(_,i)=>glow(k,['#58cfdf','#69b4e2','#9c9ae3','#dbb1d5'][i%4],.65,i*.8,.72));glass.userData.night.intensity=.24;
  const radius=.425,cy=.52;
  led.forEach(m=>m.color.set('#b7c6c2'));
  // Cantilevered A-frame stays in front of the wheel, leaving the hub readable.
  for(const s of [-1,1])k.beam(g,[s*.22,.025,.18],[0,cy,.09],.027,white,12);
  k.beam(g,[0,cy,.13],[0,cy,-.035],.026,white,16);
  for(const z of [-.023,.023]){const ring=k.mesh(g,new THREE.TorusGeometry(radius,.007,6,112),white,0,cy,z);}
  for(let i=0;i<28;i++){
    const a=i/28*Math.PI*2,x=Math.cos(a)*radius,y=cy+Math.sin(a)*radius;
    for(const s of [-1,1])k.beam(g,[0,cy,s*.014],[x,y,s*.022],.0011,led[i%8],4);
    const cabin=k.ball(g,.025,glass,x,y,0);cabin.scale.set(1.12,.86,1.02);
    const rim=k.mesh(g,new THREE.TorusGeometry(.024,.0015,4,16),white,x,y,0);rim.scale.y=.86;
    k.box(g,.034,.004,.029,white,x,y-.019,0);k.beam(g,[x,y-.025,-.016],[x,y+.025,-.016],.0012,white,4);
    const next=(i+1)/28*Math.PI*2;const aa=[];for(let j=0;j<=5;j++){const angle=a+(next-a)*j/5;aa.push([Math.cos(angle)*radius,cy+Math.sin(angle)*radius,.025]);}k.line(g,aa,.0025,led[i%8]);
  }
  k.box(g,.26,.032,.09,white,0,.035,.20);k.box(g,.19,.019,.093,k.mat('#517a88'),0,.042,.20);
  for(const x of [-.36,.36]){palm(k,g,x,.014,.17,.14);k.box(g,.06,.008,.05,stone,x,.019,-.21);}
  bollards(k,g,[[-.37,.24],[.37,.24],[-.34,-.22],[.34,-.22]]);people(k,g,[[.09,.26],[-.09,.25],[-.14,.25],[.19,.23]]);
  return k.merge(g);
}

export function windowWorld(k){
  const g=new THREE.Group(),bronze=k.mat('#8c7960',.50,.42),gold=glow(k,'#edd29b',.52),lights=Array.from({length:4},(_,i)=>glow(k,['#e6bd81','#a3d2bd','#c3b4dd','#9cbbdf'][i],.40,i*.9,.5)),stone=plaza(k,g,.52,.48),hedge=k.mat('#52784b'),water=k.mat('#527c88',.37,.18);
  const levels=[[.018,.20],[.22,.105],[.35,.070],[.65,.026],[.81,.018]];
  for(let level=0;level<levels.length-1;level++)for(const sx of [-1,1])for(const sz of [-1,1]){
    const [a,r1]=levels[level],[b,r2]=levels[level+1];k.beam(g,[sx*r1,a,sz*r1],[sx*r2,b,sz*r2],.005,bronze);
    k.beam(g,[sx*(r1+.0045),a,sz*(r1+.0045)],[sx*(r2+.0045),b,sz*(r2+.0045)],.0014,lights[level]);
    for(let j=0;j<6;j++){const t=j/6,tn=(j+1)/6,y=a+(b-a)*t,yn=a+(b-a)*tn,r=r1+(r2-r1)*t,rn=r1+(r2-r1)*tn;
      if(level===0&&j<4)continue;
      if(sx===1){k.beam(g,[-r,y,sz*r],[rn,yn,sz*rn],.0015,bronze);k.beam(g,[r,y,sz*r],[-rn,yn,sz*rn],.0015,bronze);}
      if(sz===1){k.beam(g,[sx*r,y,-r],[sx*rn,yn,rn],.0015,bronze);k.beam(g,[sx*r,y,r],[sx*rn,yn,-rn],.0015,bronze);}
    }
  }
  for(const [y,w] of [[.22,.25],[.35,.18],[.81,.065]]){k.box(g,w,.014,w,bronze,0,y,0);for(const side of [-1,1]){k.box(g,w,.002,.002,gold,0,y+.01,side*w/2);k.box(g,.002,.002,w,gold,side*w/2,y+.01,0);}}
  for(const side of [-1,1]){const arc=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI;arc.push([Math.cos(a)*.15,.025+Math.sin(a)*.14,side*.15]);}k.line(g,arc,.006,bronze);const a2=arc.map(([x,y,z])=>[z,y,x]);k.line(g,a2,.006,bronze);}
  k.cyl(g,.0015,.003,.073,gold,0,.85,0,8);plaque(k,g,'世界之窗',.11,.026,0,.38,.082);
  // A formal pool and parterres identify the park setting of the Shenzhen replica.
  k.box(g,.14,.007,.21,water,0,.022,.34);
  for(const side of [-1,1])for(let i=0;i<4;i++)k.box(g,.075,.018,.055,hedge,side*.17,.025,.22+i*.06);
  for(const x of [-.35,.35])palm(k,g,x,.015,.13,.13);
  bollards(k,g,[[-.27,.39],[.27,.39],[-.34,-.25],[.34,-.25]]);people(k,g,[[.28,.26],[.30,.29],[-.30,.25],[-.27,.28]]);
  return k.merge(g);
}

export function dapeng(k){
  const g=new THREE.Group(),stone=k.mat('#939184',.98),block=k.mat('#716f63',.97),tile=k.mat('#485e55',.86),wood=k.mat('#4f463b'),gold=glow(k,'#bda575',.25),lantern=glow(k,'#cf7653',.45);plaza(k,g,.66,.44,'#b7b4a0');
  const outline=new THREE.Shape();outline.moveTo(-.46,.018);outline.lineTo(.46,.018);outline.lineTo(.46,.225);outline.lineTo(-.46,.225);outline.closePath();
  const opening=new THREE.Path();opening.moveTo(-.065,.019);opening.lineTo(-.065,.105);opening.absarc(0,.105,.065,Math.PI,0,true);opening.lineTo(.065,.019);opening.closePath();outline.holes.push(opening);
  k.mesh(g,new THREE.ExtrudeGeometry(outline,{depth:.15,bevelEnabled:false}),stone,0,0,-.075);
  for(let row=0;row<11;row++)for(let col=0;col<39;col++){
    const x=(col-19)*.023+(row%2)*.011,y=.03+row*.018;
    if(Math.abs(x)<.08&&y<.184)continue;
    for(const z of [-.076,.076]){k.box(g,.021,.0011,.0015,block,x,y,z);k.box(g,.0009,.016,.0015,block,x+.010,y+.008,z);}
  }
  for(const side of [-1,1]){k.box(g,.10,.19,.42,stone,side*.48,.109,-.13);for(let i=0;i<10;i++)k.box(g,.105,.035,.020,stone,side*.48,.22,-.34+i*.043);}
  for(let i=0;i<23;i++)k.box(g,.023,.037,.15,stone,(i-11)*.04,.242,0);
  k.box(g,.58,.095,.17,wood,0,.294,-.015);
  for(const side of [-1,1])for(let i=0;i<7;i++){const x=(i-3)*.082;k.cyl(g,.005,.006,.115,wood,x,.30,side*.093-.015,8);k.box(g,.048,.052,.004,k.mat('#324339'),x,.292,side*.089-.015);}
  roof(k,g,.75,.32,.10,.348,tile,tile,0,-.015);
  const eaves=glow(k,'#e6c492',.72);for(const z of [-.161,.131])k.box(g,.65,.002,.003,eaves,0,.345,z);
  k.box(g,.37,.006,.035,tile,0,.445,-.015);
  for(const x of [-.25,-.085,.085,.25]){k.cyl(g,.007,.007,.016,lantern,x,.315,.107,12);k.beam(g,[x,.325,.107],[x,.343,.107],.001,gold,4);}
  plaque(k,g,'南门',.049,.033,0,.20,.079);
  for(const x of [-.11,.11]){k.box(g,.036,.04,.012,block,x,.04,.16);}
  stairs(k,g,.065,.26,.20,stone,-.40,-.04,14);
  bollards(k,g,[[-.35,.31],[.35,.31],[-.57,-.29],[.57,-.29]]);people(k,g,[[.03,.26],[-.06,.24],[.15,.29],[-.17,.30]]);
  return k.merge(g);
}

export function lianhua(k){
  const g=new THREE.Group(),heightAt=hill(k,g,.68,.62,.27),stone=k.mat('#b8afa0'),bronze=k.mat('#5f6056',.58,.33),plinth=k.mat('#bca99b'),leaf=k.mat('#3c6b4c',.94),bark=k.mat('#786c53');
  bronze.userData.night={color:new THREE.Color('#d7bb8d'),intensity:.07};
  const platform=k.cyl(g,.28,.31,.095,stone,0,.2415,0,56);platform.scale.z=.76;
  k.box(g,.105,.05,.08,plinth,0,.314,-.028);
  // Small bronze walking figure on the summit memorial; no invented facial detail.
  k.box(g,.045,.075,.024,bronze,0,.378,-.028);const head=k.ball(g,.014,bronze,0,.431,-.028);head.scale.y=1.12;
  k.beam(g,[-.012,.347,-.028],[-.016,.327,.002],.007,bronze);k.beam(g,[.012,.347,-.028],[.015,.327,-.052],.007,bronze);
  k.beam(g,[-.023,.407,-.028],[-.027,.360,-.016],.006,bronze);k.beam(g,[.023,.406,-.028],[.027,.363,-.043],.006,bronze);
  for(let i=0;i<22;i++){
    const z=.13+i*.017,y=heightAt(0,z)+.015;k.box(g,.13,.04,.019,stone,0,y,z);
  }
  for(let i=0;i<66;i++){const a=i*2.39996,r=.33+.28*((i*17)%67)/67,x=Math.cos(a)*r,z=Math.sin(a)*r*.88;if(z>0&&Math.abs(x)<.13)continue;const y=heightAt(x,z),s=.065+((i*7)%9)*.004;k.cyl(g,.003,.004,s*.6,bark,x,y+s*.25,z,6);const crown=k.ball(g,s*.45,leaf,x,y+s*.70,z);crown.scale.set(1,1.3,.9);}
  for(const x of [-.19,.19]){const light=glow(k,'#e9c995',.45);k.ball(g,.004,light,x,.30,.09);}
  const pathLight=glow(k,'#e6c78d',.68),post=k.mat('#5c6256');
  for(let i=0;i<6;i++)for(const x of [-.085,.085]){const z=.18+i*.058,y=heightAt(x,z);k.cyl(g,.002,.003,.026,post,x,y+.017,z,6);k.ball(g,.003,pathLight,x,y+.032,z);}
  return k.merge(g);
}
