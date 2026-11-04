import * as THREE from 'three';
import {disc,skin,sign,finish} from './nanjing-kit.js';

// Photo-led History Hall: a deep hipped roof, stone end bays and lower attached galleries.
function tileMaterial(k,color){
 const m=k.mat(color,.78,.08),tex=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);tex.needsUpdate=true;m.map=tex;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 museumTileUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmuseumTileUv=uv;');s.fragmentShader='varying vec2 museumTileUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(museumTileUv.x),.008),rib=1.0-smoothstep(.065,.065+aa,abs(fract(museumTileUv.x)-.5));
 float visible=1.0-smoothstep(.35,.85,aa);float seam=smoothstep(.02,.02+max(fwidth(museumTileUv.y),.01),fract(museumTileUv.y));
 diffuseColor.rgb*=mix(1.0,.88+.14*rib,visible)*mix(.97,1.0,seam);`);};m.customProgramCacheKey=()=> 'museum-tiles-v1';return m;
}
function tiledRoof(k,g,p,w,d,y,h,x,z,{gold=false}={}){
 const ridge=w*.245,mat=gold?p.goldTile:p.tile;
 const at=(side,u,v)=>{const hip=side>1,a=u*2-1,xx=hip?(side===2?1:-1)*(ridge+(w/2-ridge)*v):a*(ridge+(w/2-ridge)*v),zz=hip?a*d/2*v:(side===0?1:-1)*d/2*v;return [x+xx,y+h*(1-v)**1.7+.012*v**8*Math.abs(a)**8,z+zz];};
 for(let side=0;side<4;side++){
  const o=skin(k,g,(u,v)=>at(side,u,v),24,64,mat),uv=[];for(let j=0;j<=24;j++)for(let i=0;i<=64;i++)uv.push(i/64*(side<2?78:36),j/24*18);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const count=side<2?78:36;
  k.line(g,Array.from({length:65},(_,i)=>at(side,i/64,1)),.003,p.gold);
  k.line(g,Array.from({length:65},(_,i)=>{const a=at(side,i/64,1);a[1]-=.004;return a;}),.0013,p.light);
  for(let i=0;i<=count;i++){const a=at(side,i/count,1),o=k.mesh(g,new THREE.CircleGeometry(.0018,8),p.gold,a[0],a[1]-.001,a[2]);o.rotation.y=side<2?(side?Math.PI:0):(side===2?Math.PI/2:-Math.PI/2);}
 }
 for(const s of [-1,1])k.line(g,Array.from({length:25},(_,i)=>at(0,s<0?0:1,i/24)),.0035,p.gold);
 k.box(g,ridge*2,.014,.014,p.gold,x,y+h+.009,z);
 for(const s of [-1,1]){
  // Curled ridge-end ornaments replace pointed, generic pavilion tips.
  const shape=new THREE.Shape();shape.moveTo(-.015,0);shape.bezierCurveTo(.018,.002,.019,.037,.039,.044);shape.bezierCurveTo(.010,.051,-.015,.037,-.009,.017);shape.lineTo(-.021,.008);shape.closePath();
  const o=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.010,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:1,curveSegments:12}),p.gold,x+s*ridge,y+h+.009,z-.005);o.scale.x=s;
  for(let i=0;i<4;i++){const a=at(0,s<0?.025:.975,.79+i*.05);k.cyl(g,.0017,.003,.007,p.gold,a[0],a[1]+.004,a[2],6);}
 }
}
function rail(k,g,p,a,b){
 const len=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.round(len/.055)),at=t=>a.map((v,i)=>v+(b[i]-v)*t);
 for(const h of [.009,.034])k.beam(g,at(0).map((v,i)=>v+(i===1?h:0)),at(1).map((v,i)=>v+(i===1?h:0)),.0025,p.pale);
 for(let i=0;i<=n;i++){const [x,y,z]=at(i/n);k.box(g,.008,.047,.008,p.pale,x,y+.022,z);k.ball(g,.005,p.pale,x,y+.047,z);}
 for(let i=0;i<n*4;i++){const [x,y,z]=at((i+.5)/(n*4));k.box(g,.0024,.018,.0024,p.pale,x,y+.023,z);}
}
function pane(k,g,p,x,y,z,w,h,side=0){
 const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=side;g.add(group);
 k.box(group,w,h,.005,p.wood,0,0,0);k.box(group,w-.009,h-.010,.003,p.glass,0,0,.003);
 for(let i=0;i<=5;i++)k.box(group,.0017,h,.004,p.wood,-w/2+i*w/5,0,.006);
 for(let i=0;i<=4;i++)k.box(group,w,.0018,.004,p.wood,0,-h/2+i*h/4,.006);
}
export function museum(k){
 const g=new THREE.Group(),p={land:k.mat('#8e9e7d',.98),stone:k.mat('#b7b7aa',.94),pale:k.mat('#d2d1c4',.87),wall:k.mat('#b9b8a6',.93),red:k.mat('#9e382b',.86),wood:k.mat('#493b2f',.88),tile:tileMaterial(k,'#694535'),gold:k.mat('#b98c39',.62,.23),goldTile:tileMaterial(k,'#af873d'),bracket:k.mat('#797968',.94),leaf:k.mat('#758151',.98),water:k.mat('#4c7c7c',.30,.3)};
 p.land.userData.landscape=true;p.water.userData.water=true;
 p.light=k.mat('#b99b64',.68,.10,'#f5c77b');p.light.userData.night.intensity=.65;
 p.glass=k.mat('#525447',.54,.08,'#e4be82');p.glass.userData.night.intensity=.16;p.glass.userData.pulse={speed:.22,phase:1.7};
 p.tile.userData.night={color:new THREE.Color('#9f8466'),intensity:.04};
 const ground=(x,z)=>{const t=THREE.MathUtils.smoothstep(Math.hypot(x/1.09,z/1.01),.90,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .016*(1-t)-sag*t+.002;};disc(k,g,1.09,1.01,ground,p.land);
 // Level upper terrace and two broad flights with a shared landing.
 k.box(g,1.88,.126,.71,p.stone,0,.081,-.225);k.box(g,1.90,.010,.72,p.pale,0,.149,-.225);
 k.box(g,.84,.013,.68,p.stone,0,.024,.48);
 const stair=(front,n,run,bottom,top)=>{for(let i=0;i<n;i++){const y=bottom+(top-bottom)*(i+1)/n;k.box(g,.77,y-.018,run/n+.001,p.pale,0,(y+.018)/2,front-i*run/n);}};
 stair(.50,9,.165,.031,.092);k.box(g,.79,.074,.075,p.pale,0,.055,.306);stair(.263,9,.15,.092,.154);
 for(const s of [-1,1]){
  rail(k,g,p,[s*.40,.031,.51],[s*.40,.092,.35]);rail(k,g,p,[s*.40,.092,.35],[s*.40,.092,.27]);rail(k,g,p,[s*.40,.092,.27],[s*.40,.154,.11]);
  rail(k,g,p,[s*.41,.154,.13],[s*.93,.154,.13]);rail(k,g,p,[s*.93,.154,.13],[s*.93,.154,-.16]);
 }
 for(const x of [-.14,.14]){k.beam(g,[x,.034,.51],[x,.096,.35],.004,p.stone);k.beam(g,[x,.096,.263],[x,.157,.113],.004,p.stone);}
 // Main portico has real depth: the red columns stand in front of recessed doors.
 const floor=.154,cz=-.27;
 k.box(g,1.12,.245,.40,p.wall,0,floor+.1225,cz-.04);
 for(const s of [-1,1])k.box(g,.125,.245,.46,p.wall,s*.5325,floor+.1225,cz);
 k.box(g,1.17,.014,.48,p.pale,0,.400,cz);
 for(let i=0;i<10;i++){
  const x=(i-4.5)*.103;k.cyl(g,.0067,.008,.218,p.red,x,floor+.109,cz+.245,12);k.box(g,.020,.014,.025,p.pale,x,.381,cz+.245);
  for(let level=0;level<3;level++){k.box(g,.022+level*.012,.006,.022+level*.008,p.bracket,x,.417+level*.008,cz+.246+level*.006);for(const s of [-1,1])k.box(g,.008,.010,.015,p.bracket,x+s*(.007+level*.006),.421+level*.008,cz+.25);}
 }
 for(let i=0;i<9;i++){
  const x=(i-4)*.103;pane(k,g,p,x,.253,cz+.164,.088,.147);pane(k,g,p,x,.361,cz+.164,.088,.036);k.box(g,.090,.012,.018,p.pale,x,.330,cz+.167);
 }
 // Oversailing beams, repeated bracket sets and gold-brown tile relief.
 for(const z of [cz+.255,cz-.255]){k.box(g,1.23,.013,.024,p.bracket,0,.443,z);for(let i=0;i<32;i++)k.box(g,.014,.010,.041,p.bracket,(i/31-.5)*1.20,.445,z);}
 tiledRoof(k,g,p,1.40,.66,.457,.165,0,cz);
 sign(k,g,'南京博物院',.20,.040,0,.416,cz+.274,{background:'#244a68',color:'#dfbc6a'});
 // Lower side galleries have stone walls and attached corridors, rather than open kiosks.
 for(const side of [-1,1]){
  const x=side*.777;k.box(g,.35,.156,.44,p.wall,x,.232,-.16);
  for(let i=0;i<3;i++)pane(k,g,p,x+(i-1)*.09,.235,.064,.067,.083);
  for(let i=0;i<4;i++)pane(k,g,p,side*.954,.235,-.31+i*.097,.065,.083,side*Math.PI/2);
  tiledRoof(k,g,p,.43,.51,.318,.063,x,-.16,{gold:true});
  for(let i=0;i<3;i++)k.box(g,.043,.035,.002,p.glass,x+(i-1)*.11,.081,.133);
  rail(k,g,p,[side*.61,.154,.13],[side*.61,.154,-.08]);
 }
 // Retain the low rear exhibition connection visible behind the old hall.
 k.box(g,1.15,.20,.20,p.wall,0,.254,-.56);k.box(g,1.19,.018,.24,p.bracket,0,.363,-.56);
 for(let i=0;i<14;i++)pane(k,g,p,(i-6.5)*.078,.268,-.662,.053,.085,Math.PI);
 for(const side of [-1,1])for(let i=0;i<3;i++)pane(k,g,p,side*.597,.270,-.34+i*.10,.056,.096,side*Math.PI/2);
 // The reflective forecourt and lawns preserve the main approach to the stairs.
 for(const side of [-1,1]){
  const x=side*.59;k.box(g,.32,.012,.39,p.pale,x,.024,.60);k.box(g,.30,.009,.37,side<0?p.water:p.leaf,x,.033,.60);
  for(let i=0;i<6;i++)k.box(g,.11,.001,.0014,p.stone,side*.31,.032,.55+i*.047);
 }
 for(const z of [.43,.56,.69,.82])k.box(g,.53,.001,.0015,p.stone,0,.032,z);
 finish(k,g,{lamps:[[-.87,.48],[.87,.48],[-.83,-.43],[.83,-.43]],visitors:[[-.11,.65],[.13,.72],[-.25,.56]]});
 for(const x of [-.43,.43]){const light=new THREE.SpotLight('#e9dfc0',0,1.0,Math.PI*.28,.8,2);light.position.set(x,.21,.26);light.target.position.set(x,.40,-.22);light.userData.nightIntensity=.09;g.add(light,light.target);}
 return g;
}
