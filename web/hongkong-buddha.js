import * as THREE from 'three';
import {TAU,palette,site,hill,woodland,skin,siteHeight,lit,ellipsoid,finish,disc} from './hongkong-kit.js';



export function buddha(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const h=hill(k,g,p,{height:.25,flat:.43,cut:(x,z,top)=>{if(z<.24||z>.65)return top;const channel=1-THREE.MathUtils.smoothstep(Math.abs(x),.105,.14),path=.018+(.51-z)/.0095*.0105;return THREE.MathUtils.lerp(top,Math.min(top,path),channel);}}),bronze=lit(k,'#5d5b4e',.055,null,'#b8a57c'),fold=k.mat('#45463e',.84,.22),hair=k.mat('#45463d',.78,.22),face=k.mat('#686354',.76,.25);bronze.userData.buddhaBronze=true;
 const walk=k.mat('#d3cdbb',.94),stone=k.mat('#c0bcad',.96),joint=k.mat('#8c8b7e',.96);walk.userData.buddhaWalk=true;
 // Three granite terraces, with an open stair axis through every balustrade.
 for(let level=0;level<3;level++){
  const r=.31-level*.035,top=.2945+level*.045;
  const cutTop=(x,z)=>{if(z<.205)return top;const stair=z>=.272?.018+(.51-z)/.0095*.0105:.299+(.266-z)/.011*.015;return THREE.MathUtils.lerp(Math.min(top,stair),top,THREE.MathUtils.smoothstep(Math.abs(x),.088,.103));};
  disc(k,g,r,r,cutTop,walk);
  skin(k,g,(u,v)=>{const a=u*TAU,x=Math.cos(a)*r,z=Math.sin(a)*r,t=cutTop(x,z);return [x,Math.min(top-.045,t-.008)+v*(t-Math.min(top-.045,t-.008)),z];},3,128,stone);
  for(let i=0;i<72;i++){const a=i/72*TAU;if(Math.sin(a)>.7&&Math.abs(Math.cos(a)*r)<.100)continue;
   const b=(i+1)/72*TAU,x=Math.cos(a)*r,z=Math.sin(a)*r;
   k.beam(g,[x,top+.011,z],[Math.cos(b)*r,top+.011,Math.sin(b)*r],.0023,stone);
   k.beam(g,[x,top+.046,z],[Math.cos(b)*r,top+.046,Math.sin(b)*r],.0031,walk);
   k.box(g,.005,.038,.005,walk,x,top+.027,z);
   if(i%4===0){k.cyl(g,.0055,.0065,.052,walk,x,top+.026,z,8);k.ball(g,.006,stone,x,top+.055,z);}
   if(i%3===0)k.line(g,[[x,top-.041,z],[x,top-.009,z]],.0008,joint);
  }
 }
 for(let i=0;i<6;i++){const z=.266-i*.011,top=.305+i*.015;k.box(g,.168,.012,.0115,walk,0,top-.006,z);}
 for(let i=0;i<7;i++){const z=.5195+i*.0095,top=.0305-i*.0105;k.box(g,.17,.011,.010,walk,0,top-.0055,z);}
 skin(k,g,(u,v)=>{const x=(u-.5)*.17,z=.581+v*.043;return [x,THREE.MathUtils.lerp(-.034,siteHeight(x,z,.72,.62)+.003,v),z];},4,8,walk);
 for(let j=0;j<26;j++){const z=.51-j*.0095,y=.025+(j+1)*.0105;k.box(g,.17,.011,.0095,walk,0,y,z);}
 for(const x of [-.096,.096]){k.beam(g,[x,.08,.51],[x,.33,.265],.004,p.pale);for(let i=0;i<12;i++)k.beam(g,[x,.035+i*.022,.51-i*.022],[x,.08+i*.022,.51-i*.022],.0026,p.pale);}
 k.cyl(g,.21,.225,.043,bronze,0,.402,0,64);
 // Two alternating rows of broad pointed lotus petals, not upright capsules.
 for(let row=0;row<2;row++)for(let i=0;i<24;i++){
  const a=(i+row*.5)/24*TAU,base=.388+row*.020;
  const point=(u,v)=>{const across=(u-.5)*2,span=Math.sin(Math.PI*v)**.7*.032,rr=.220+Math.sin(Math.PI*v)*.014-row*.008;
   return [Math.cos(a)*rr-Math.sin(a)*across*span,base+v*.060,Math.sin(a)*rr+Math.cos(a)*across*span];};
  skin(k,g,point,10,12,bronze);
  k.line(g,Array.from({length:12},(_,j)=>point(.5,j/11)),.001,fold);
 }
 for(const s of [-1,1]){const leg=ellipsoid(k,g,bronze,s*.095,.476,.04,.14,.064,.105);leg.rotation.y=s*.24;ellipsoid(k,g,bronze,-s*.053,.499,.117,.091,.026,.041);}
 const outline=[[.50,.145,.09],[.57,.138,.082],[.68,.139,.078],[.735,.149,.068],[.79,.055,.040]],body=(u,v)=>{const a=u*TAU,y=.5+.29*v;let i=0;while(i<outline.length-2&&y>outline[i+1][0])i++;const q=outline[i],n=outline[i+1],t=THREE.MathUtils.smoothstep(y,q[0],n[0]),w=THREE.MathUtils.lerp(q[1],n[1],t),d=THREE.MathUtils.lerp(q[2],n[2],t);const ripple=.0024*Math.sin(a*21+v*2)*Math.sin(v*Math.PI);return [Math.cos(a)*(w+ripple),y,Math.sin(a)*(d+ripple)-.025];};skin(k,g,body,40,64,bronze);
 ellipsoid(k,g,face,0,.797,-.02,.038,.045,.034);ellipsoid(k,g,face,0,.875,-.018,.063,.080,.057);
 for(const s of [-1,1]){ellipsoid(k,g,face,s*.060,.866,-.014,.012,.035,.014);k.line(g,[[s*.054,.88,.003],[s*.061,.858,.009],[s*.054,.844,.006]],.002,fold);}
 ellipsoid(k,g,hair,0,.931,-.026,.060,.043,.053);
 for(let row=0;row<11;row++)for(let i=0;i<28;i++){
  const theta=.13+row/10*1.54,a=(i+(row%2)*.5)/28*TAU;
  k.ball(g,.0034,hair,Math.sin(theta)*Math.cos(a)*.061,.924+Math.cos(theta)*.049,-.026+Math.sin(theta)*Math.sin(a)*.054);
 }
 ellipsoid(k,g,hair,0,.970,-.027,.018,.017,.019);
 for(const s of [-1,1]){k.line(g,[[s*.011,.885,.039],[s*.025,.884,.039],[s*.038,.887,.034]],.0017,fold);k.line(g,[[s*.010,.897,.041],[s*.026,.902,.039],[s*.042,.896,.031]],.0015,fold);}
 ellipsoid(k,g,face,0,.867,.043,.009,.020,.011);k.line(g,[[-.016,.845,.037],[0,.844,.042],[.016,.845,.037]],.0018,fold);k.ball(g,.0034,p.gold,0,.908,.041);
 k.line(g,[[-.083,.728,-.018],[-.142,.702,.025],[-.174,.669,.052],[-.174,.782,.112]],.029,bronze);ellipsoid(k,g,face,-.174,.802,.115,.027,.035,.014);
 for(let i=0;i<4;i++)k.line(g,[[-.195+i*.013,.813,.115],[-.195+i*.013,.853-(i===0||i===3?.008:0),.114]],.0045,face);k.line(g,[[-.151,.804,.119],[-.140,.820,.121]],.006,face);
 k.line(g,[[.083,.726,-.015],[.15,.685,.018],[.174,.631,.035],[.137,.541,.114]],.032,bronze);ellipsoid(k,g,face,.132,.538,.139,.037,.016,.026);
 for(let i=0;i<4;i++)k.line(g,[[.106+i*.013,.542,.146],[.106+i*.013,.535,.170]],.0037,face);
 // Low relief follows the curved torso rather than a separate cut sheet.
 const front=(x,y,lift=.0025)=>{let i=0;while(i<outline.length-2&&y>outline[i+1][0])i++;const a=outline[i],b=outline[i+1],t=THREE.MathUtils.smoothstep(y,a[0],b[0]),w=THREE.MathUtils.lerp(a[1],b[1],t),d=THREE.MathUtils.lerp(a[2],b[2],t);return [x,y,Math.sqrt(Math.max(.02,1-(x/w)**2))*d-.025+lift];};
 for(let i=0;i<5;i++){
  const path=new THREE.CatmullRomCurve3([[.099+i*.005,.748-i*.010,0],[.082+i*.006,.689-i*.010,0],[.025,.642-i*.013,0],[-.105,.611-i*.014,0]].map(q=>new THREE.Vector3(...q)));
  const pts=Array.from({length:40},(_,j)=>{const q=path.getPoint(j/39);return front(q.x,q.y);});
  k.line(g,pts,i===0?.0038:.0016,i===0?bronze:fold);
 }
 const sleeve=ellipsoid(k,g,bronze,.146,.642,.006,.040,.101,.056);sleeve.rotation.z=-.13;
 for(let i=0;i<4;i++)k.line(g,[[.131+i*.009,.721,.044],[.158+i*.006,.646,.052],[.130+i*.009,.558,.080]],.0014,fold);
 for(let i=0;i<6;i++){const z=.028+i*.018;k.line(g,[[-.203,.476,z],[-.116,.513,z+.019],[-.018,.509,z+.009],[.105,.504,z+.007],[.199,.476,z]],.0016,fold);}
 for(let i=0;i<7;i++){const a=Math.PI*1.12+i*.12;k.line(g,Array.from({length:18},(_,j)=>{const y=.54+j/17*.19,t=(y-.5)/.29,q=body(a/TAU,t);q[0]*=1.008;q[2]-=.002;return q;}),.0013,fold);}
 woodland(k,g,h,[[-.48,.11,.17],[.46,.13,.16],[-.36,-.30,.18],[.38,-.27,.16],[0,-.46,.16],[-.30,.38,.13],[.30,.38,.13]]);
 return finish(k,g,{lamps:[[-.25,.255,.21],[.25,.255,.21]],visitors:[[-.16,.342,.18],[.17,.342,.18],[.035,.12,.42]]});
}

