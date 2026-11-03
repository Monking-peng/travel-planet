import * as THREE from 'three';
import {TAU,palette,site,hill,woodland,skin,lit,windowGlass,ellipsoid,polygon,roof,finish,sign,disc,perimeter} from './hongkong-kit.js';
import {lattice} from './shunde-kit.js';

export function peak(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const h=hill(k,g,p,{height:.25,flat:.36}),glass=windowGlass(k,'#5f7b7b',71),stone=lit(k,'#b5b4a5',.18),rail=lit(k,'#d2d4c7',.34,3);
 k.box(g,.67,.14,.42,glass,0,.32,.04);k.box(g,.72,.025,.46,p.pale,0,.403,.04);k.box(g,.54,.085,.20,glass,.05,.28,.29);k.box(g,.58,.016,.23,stone,.05,.33,.29);
 for(const x of [-.22,.22]){k.box(g,.08,.29,.26,stone,x,.50,0);for(let j=0;j<6;j++)k.box(g,.084,.003,.265,p.pale,x,.40+j*.022,0);}
 const bottom=u=>.58+.23*Math.pow(2*u-1,2),top=.91;
 // The famous bowl is a hollow viewing volume with a curved soffit, not a disk.
 for(const z of [-.215,.215]){
  skin(k,g,(u,v)=>[(u-.5)*.99,bottom(u)+(top-bottom(u))*v,z],10,64,glass);
  k.line(g,Array.from({length:65},(_,i)=>[(i/64-.5)*.99,bottom(i/64),z]),.007,stone);
  for(let j=1;j<5;j++)k.line(g,Array.from({length:65},(_,i)=>{const u=i/64;return [(u-.5)*.99,bottom(u)+(top-bottom(u))*j/5,z+Math.sign(z)*.001];}),.0032,stone);
  for(let i=0;i<=22;i++){const u=i/22;k.beam(g,[(u-.5)*.99,bottom(u),z],[(u-.5)*.99,top,z],.0018,p.steel);}
 }
 skin(k,g,(u,v)=>[(u-.5)*.99,bottom(u),-.215+v*.43],20,64,stone);
 for(const x of [-.495,.495])k.box(g,.022,.103,.45,stone,x,.86,0);
 k.box(g,1.025,.019,.45,rail,0,.919,0);k.box(g,.93,.009,.37,p.dark,0,.929,0);
 for(const z of [-.197,.197]){k.beam(g,[-.48,.967,z],[.48,.967,z],.0017,p.steel);for(let j=0;j<=24;j++)k.beam(g,[-.48+j*.04,.93,z],[-.48+j*.04,.966,z],.0012,p.steel);}
 for(let j=0;j<12;j++){const z=.53-j*.016,y=.035+(j+1)*.017;k.box(g,.22,.017,.016,p.pale,.04,y,z);}
 sign(k,g,'THE PEAK',.19,.025,.035,.378,.278,{background:'#b5b4a5',color:'#364d4d'});
 woodland(k,g,h,[[-.52,-.19,.15],[.5,-.21,.14],[-.48,.31,.13],[.5,.28,.13],[-.2,-.45,.12],[.2,-.44,.15]]);
 return finish(k,g,{lamps:[[-.19,.24,.35],[.28,.24,.35]],visitors:[[-.2,.934,0],[.1,.934,.1],[.27,.934,-.04],[.23,.24,.36]]});
}

export function buddha(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const h=hill(k,g,p,{height:.25,flat:.43,cut:(x,z,top)=>{if(z<.24||z>.55)return top;const channel=1-THREE.MathUtils.smoothstep(Math.abs(x),.085,.13),path=.018+(.51-z)/.0095*.0105;return THREE.MathUtils.lerp(top,Math.min(top,path),channel);}}),bronze=lit(k,'#52645c',.065,null,'#a69e78'),fold=k.mat('#45564f',.86,.12),hair=k.mat('#344c47',.85),face=k.mat('#617267',.82,.16);bronze.userData.buddhaBronze=true;
 for(let i=0;i<3;i++){const r=.31-i*.035,y=.272+i*.045;k.cyl(g,r,r,.045,p.pale,0,y,0,72);perimeter(k,g,r+.003,r+.003,y+.024,p.stone);}
 for(let j=0;j<26;j++){const z=.51-j*.0095,y=.025+(j+1)*.0105;k.box(g,.17,.011,.0095,p.pale,0,y,z);}
 for(const x of [-.096,.096]){k.beam(g,[x,.08,.51],[x,.33,.265],.004,p.pale);for(let i=0;i<12;i++)k.beam(g,[x,.035+i*.022,.51-i*.022],[x,.08+i*.022,.51-i*.022],.0026,p.pale);}
 k.cyl(g,.21,.23,.045,bronze,0,.397,0,64);
 for(let i=0;i<30;i++){const a=i/30*TAU,o=ellipsoid(k,g,bronze,Math.cos(a)*.208,.42,Math.sin(a)*.208,.021,.044,.013);o.rotation.y=-a+Math.PI/2;}
 for(const s of [-1,1]){const leg=ellipsoid(k,g,bronze,s*.095,.476,.04,.14,.064,.105);leg.rotation.y=s*.24;ellipsoid(k,g,bronze,-s*.053,.499,.117,.091,.026,.041);}
 const outline=[[.50,.145,.09],[.57,.15,.10],[.68,.135,.082],[.735,.137,.064],[.79,.052,.037]],body=(u,v)=>{const a=u*TAU,y=.5+.29*v;let i=0;while(i<outline.length-2&&y>outline[i+1][0])i++;const q=outline[i],n=outline[i+1],t=THREE.MathUtils.smoothstep(y,q[0],n[0]),w=THREE.MathUtils.lerp(q[1],n[1],t),d=THREE.MathUtils.lerp(q[2],n[2],t);return [Math.cos(a)*w,y,Math.sin(a)*d-.025];};skin(k,g,body,40,64,bronze);
 ellipsoid(k,g,face,0,.797,-.02,.038,.045,.034);ellipsoid(k,g,face,0,.875,-.018,.061,.081,.058);
 for(const s of [-1,1]){ellipsoid(k,g,face,s*.060,.866,-.014,.012,.035,.014);k.line(g,[[s*.054,.88,.003],[s*.061,.858,.009],[s*.054,.844,.006]],.002,fold);}
 ellipsoid(k,g,hair,0,.928,-.026,.062,.045,.055);
 for(let j=0;j<9;j++)for(let i=0;i<20;i++){const theta=.3+j/8*1.12,a=i/20*TAU;k.ball(g,.0042,hair,Math.sin(theta)*Math.cos(a)*.062,.922+Math.cos(theta)*.044,-.026+Math.sin(theta)*Math.sin(a)*.055);}
 ellipsoid(k,g,hair,0,.971,-.026,.024,.021,.024);
 for(const s of [-1,1]){k.line(g,[[s*.011,.885,.039],[s*.025,.884,.039],[s*.038,.887,.034]],.0017,fold);k.line(g,[[s*.010,.897,.041],[s*.026,.902,.039],[s*.042,.896,.031]],.0015,fold);}
 ellipsoid(k,g,face,0,.867,.043,.009,.020,.011);k.line(g,[[-.017,.844,.035],[0,.841,.042],[.018,.845,.035]],.0018,fold);k.ball(g,.0034,p.gold,0,.908,.041);
 k.line(g,[[-.083,.728,-.018],[-.142,.702,.025],[-.174,.669,.052],[-.174,.782,.112]],.029,bronze);ellipsoid(k,g,face,-.174,.802,.115,.027,.035,.014);
 for(let i=0;i<4;i++)k.line(g,[[-.195+i*.013,.813,.115],[-.195+i*.013,.853-(i===0||i===3?.008:0),.114]],.0045,face);k.line(g,[[-.151,.804,.119],[-.140,.820,.121]],.006,face);
 k.line(g,[[.083,.726,-.015],[.15,.685,.018],[.174,.631,.035],[.137,.541,.114]],.032,bronze);ellipsoid(k,g,face,.132,.538,.139,.037,.016,.026);
 for(let i=0;i<4;i++)k.line(g,[[.106+i*.013,.542,.146],[.106+i*.013,.535,.170]],.0037,face);
 // Robe folds follow the shoulder, chest and seated legs in separate arcs.
 for(let i=0;i<7;i++)k.line(g,[[.080+i*.005,.766-i*.012,.035],[.018,.692-i*.013,.077],[-.091,.622-i*.010,.040]],.0022,fold);
 for(let i=0;i<9;i++){const z=.02+i*.014;k.line(g,[[-.205,.472,z],[-.11,.512,z+.022],[0,.506,z+.014],[.12,.499,z+.008],[.203,.474,z]],.0019,fold);}
 for(let i=0;i<5;i++)k.line(g,[[.11+i*.008,.735,.025],[.135+i*.007,.652,.066],[.13+i*.009,.556,.085]],.002,fold);
 woodland(k,g,h,[[-.48,.11,.17],[.46,.13,.16],[-.36,-.30,.18],[.38,-.27,.16],[0,-.46,.16],[-.30,.38,.13],[.30,.38,.13]]);
 return finish(k,g,{lamps:[[-.25,.255,.21],[.25,.255,.21]],visitors:[[-.16,.342,.18],[.17,.342,.18],[.035,.12,.42]]});
}

function tangHall(k,g,p,{w=.60,d=.25,h=.16,x=0,z=0,y=.035}={}){
 const pane=lit(k,'#74634c',.16,null,'#c3a172');k.box(g,w+.04,.025,d+.045,p.pale,x,y-.008,z);k.box(g,w*.90,h*.86,d*.63,p.wood,x,y+h*.44,z);
 for(const side of [-1,1]){for(let j=0;j<=6;j++){const xx=x+(j/6-.5)*w;k.cyl(g,.006,.007,h,p.wood,xx,y+h/2,z+side*d*.46,8);for(let l=0;l<3;l++)k.box(g,.023+l*.014,.005,.028+l*.015,p.wood,xx,y+h-.019+l*.006,z+side*d*.46);}
  k.box(g,w,.009,.014,p.wood,x,y+h-.02,z+side*d*.46);
  for(let j=0;j<6;j++){const xx=x+((j+.5)/6-.5)*w,zz=z+side*d*.323;k.box(g,w*.12,h*.62,.002,pane,xx,y+h*.45,zz);lattice(k,g,xx,y+h*.45,zz+side*.002,w*.12,h*.62,p.wood);}
 }
 roof(k,g,p,w*1.19,d*1.30,h*.42,y+h,x,z);
}
export function chilin(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p,.78,.67);const paving=k.mat('#bfc2b3',.97);paving.userData.landscape=true;k.box(g,1.03,.025,.84,paving,0,.024,-.015);
 tangHall(k,g,p,{w:.67,d:.25,h:.18,z:-.28,y:.083});tangHall(k,g,p,{w:.34,d:.17,h:.13,z:.40,y:.045});
 for(const s of [-1,1]){const side=new THREE.Group();side.position.x=s*.46;side.rotation.y=Math.PI/2;g.add(side);tangHall(k,side,p,{w:.65,d:.15,h:.105,z:0,y:.048});tangHall(k,g,p,{w:.14,d:.15,h:.19,x:s*.36,z:-.33,y:.05});}
 for(const x of [-.16,.16])for(const z of [-.05,.18]){k.box(g,.25,.018,.185,p.pale,x,.052,z);k.box(g,.225,.004,.16,p.water,x,.064,z);for(let j=0;j<13;j++){const a=j*2.4,r=.015+Math.sqrt(j)*.018,m=k.mesh(g,new THREE.CircleGeometry(.012,10),k.mat(j%2?'#6e875b':'#839266'),x+Math.cos(a)*r,.067,z+Math.sin(a)*r*.65);m.rotation.x=-Math.PI/2;}}
 for(let j=0;j<5;j++)k.box(g,.21,.009,.022,p.pale,0,.041+(j+1)*.009,-.13-j*.022);
 for(const x of [-.33,.33])for(const z of [-.07,.15,.32]){k.box(g,.06,.023,.06,p.pale,x,.051,z);woodland(k,g,()=>.062,[[x,z,.065]]);}
 sign(k,g,'志蓮淨苑',.16,.028,0,.206,-.148,{background:'#4b3e2e',color:'#d2be8e'});
 return finish(k,g,{lamps:[[-.28,.043,.34],[.28,.043,.34]],visitors:[[-.03,.043,.26],[.02,.043,.07],[.02,.043,-.05]]});
}
