import * as THREE from 'three';
import {disc,skin,sign,finish,grove,TAU} from './nanjing-kit.js';

// Compact hillside compound, based on aerial and street-level photographs.
function tile(k){
 const m=k.mat('#3d4445',.87,.05),t=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);t.needsUpdate=true;m.map=t;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec2 templeUv;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntempleUv=uv;');s.fragmentShader='varying vec2 templeUv;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float aa=max(fwidth(templeUv.x),.01),rib=1.0-smoothstep(.06,.06+aa,abs(fract(templeUv.x)-.5));
 diffuseColor.rgb*=mix(1.0,.90+.14*rib,1.0-smoothstep(.32,.85,aa));`);};m.customProgramCacheKey=()=> 'jiming-tiles-v1';return m;
}
function roof(k,g,p,w,d,y,h,x,z){
 const ridge=w*.25,at=(side,u,v)=>{const a=2*u-1,hip=side>1;return [x+(hip?(side===2?1:-1):a)*(ridge+(w/2-ridge)*v),y+h*(1-v)**1.7+.014*v**7*Math.abs(a)**6,z+(hip?a:(side===0?1:-1))*d/2*v];};
 for(let side=0;side<4;side++){
  const o=skin(k,g,(u,v)=>at(side,u,v),16,40,p.tile),uv=[];for(let j=0;j<=16;j++)for(let i=0;i<=40;i++)uv.push(i/40*(side<2?48:28),j/16*14);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  k.line(g,Array.from({length:41},(_,i)=>at(side,i/40,1)),.0022,p.edge);
  k.line(g,Array.from({length:41},(_,i)=>{const a=at(side,i/40,1);a[1]-=.004;return a;}),.001,p.lamp);
 }
 k.box(g,ridge*2,.008,.008,p.edge,x,y+h+.004,z);
 for(const side of [-1,1])k.line(g,[[x+side*ridge,y+h,z],[x+side*(ridge+.016),y+h+.016,z],[x+side*(ridge+.033),y+h+.022,z]],.003,p.edge);
}
function window(k,g,p,x,y,z,w,h,rot=0){
 const q=new THREE.Group();g.add(q);q.position.set(x,y,z);q.rotation.y=rot;
 k.box(q,w,h,.005,p.red);k.box(q,w-.007,h-.008,.004,p.pane,0,0,.003);
 for(let j=0;j<5;j++)k.box(q,.0015,h-.004,.002,p.wood,(j-2)*(w-.008)/4,0,.006);
 for(let j=0;j<4;j++)k.box(q,w-.004,.0015,.002,p.wood,0,(j-1.5)*(h-.008)/3,.006);
}
function hall(k,g,p,{x,z,y,w,d,h=.18,double=false}){
 k.box(g,w+.018,.018,d+.025,p.stone,x,y-.009,z);k.box(g,w,h,d,p.yellow,x,y+h/2,z);
 for(const side of [-1,1]){
  for(let i=0;i<5;i++)window(k,g,p,x+(i-2)*w/5,y+h*.53,z+side*(d/2+.002),w*.15,h*.64,side<0?Math.PI:0);
  k.box(g,w+.02,.014,.027,p.red,x,y+h-.007,z+side*d/2);
 }
 for(const side of [-1,1])for(let i=0;i<3;i++)window(k,g,p,x+side*(w/2+.001),y+h*.53,z+(i-1)*d/3,d*.23,h*.60,side*Math.PI/2);
 roof(k,g,p,w*1.18,d*1.22,y+h+.015,h*.45,x,z);
 if(double){k.box(g,w*.79,h*.68,d*.79,p.yellow,x,y+h*1.62,z);for(const side of [-1,1]){for(let i=0;i<7;i++)window(k,g,p,x+(i-3)*w*.105,y+h*1.67,z+side*d*.399,w*.081,h*.44,side<0?Math.PI:0);for(let i=0;i<3;i++)window(k,g,p,x+side*w*.399,y+h*1.67,z+(i-1)*d*.25,d*.17,h*.44,side*Math.PI/2);}roof(k,g,p,w*1.08,d*1.1,y+h*1.99,h*.42,x,z);}
}
function rail(k,g,p,a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/.028);for(const height of [.012,.036])k.beam(g,a.map((v,i)=>v+(i===1?height:0)),b.map((v,i)=>v+(i===1?height:0)),.002,p.red);for(let i=0;i<=n;i++){const q=a.map((v,j)=>v+(b[j]-v)*i/n);k.cyl(g,.0025,.003,.040,p.red,q[0],q[1]+.020,q[2],6);}}
function towerRoof(k,g,p,r,y,h){
 const at=(u,v)=>{const angle=u*TAU,sector=TAU/8,local=((angle+sector/2)%sector)-sector/2,rad=r*Math.cos(sector/2)/Math.cos(local)*v;return [Math.sin(angle)*rad,y+h*(1-v)**1.65+.012*v**8*(Math.abs(local)/(sector/2))**6,Math.cos(angle)*rad];};
 const o=skin(k,g,at,18,80,p.tile),uv=[];for(let j=0;j<=18;j++)for(let i=0;i<=80;i++)uv.push(i/80*80,j/18*14);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const edge=Array.from({length:128},(_,i)=>at(i/128,1));k.line(g,edge,.0022,p.edge,true);k.line(g,edge.map(a=>[a[0],a[1]-.002,a[2]]),.0015,p.towerLight,true);
 for(let i=0;i<8;i++){const u=(i+.5)/8;k.line(g,Array.from({length:20},(_,j)=>at(u,.04+j*.96/19)),.0018,p.edge);if(h>.1)k.line(g,Array.from({length:20},(_,j)=>{const a=at(u,.06+j*.94/19);a[1]+=.001;return a;}),.001,p.towerLight);}
}
export function jiming(k){
 const g=new THREE.Group(),p={tile:tile(k),yellow:k.mat('#cf982c',.9),red:k.mat('#a83c30',.83),wood:k.mat('#463a30',.9),cream:k.mat('#d5c8a6',.9),stone:k.mat('#a6a393',.95),edge:k.mat('#6c6252',.78),land:k.mat('#789064',.98),gold:k.mat('#ba9142',.5,.28)};
 p.land.userData.landscape=true;p.yellow.userData.templeWall=true;
 p.stone.onBeforeCompile=s=>{s.vertexShader='varying vec3 wallPoint; varying vec3 wallNormal;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwallPoint=position;wallNormal=normal;');s.fragmentShader='varying vec3 wallPoint; varying vec3 wallNormal;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float row=wallPoint.y*38.0;vec2 cell=vec2((wallPoint.x+wallPoint.z)*18.0+mod(floor(row),2.0)*.5,row);
 vec2 aa=max(fwidth(cell),vec2(.01));vec2 joint=1.0-smoothstep(vec2(.025),vec2(.025)+aa,min(fract(cell),1.0-fract(cell)));
 float vertical=1.0-abs(normalize(wallNormal).y);diffuseColor.rgb*=1.0-.16*max(joint.x,joint.y)*vertical;`);};p.stone.customProgramCacheKey=()=> 'jiming-stone-v1';
 p.pane=k.mat('#544632',.74,.08,'#edc58d');p.pane.userData.night.intensity=.22;p.pane.userData.pulse={speed:.22,phase:2};
 p.lamp=k.mat('#8d7756',.7,.08,'#eec184');p.lamp.userData.night.intensity=.58;
 p.towerLight=k.mat('#ad925e',.6,.12,'#ffd99e');p.towerLight.userData.night.intensity=1.4;
 const ground=(x,z)=>{const t=THREE.MathUtils.smoothstep(Math.hypot(x/.89,z/.91),.84,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z)),hill=.28*Math.exp(-((x+.12)**2/.44+(z+.33)**2/.45))*(.70+.30*Math.sin(z*7+x*4)**2);const cap=z>.67?.018:z>.50?.026+.066*THREE.MathUtils.clamp((.66-z)/.15,0,1)-.014:z>.39?.078:z>.18?.092+.106*THREE.MathUtils.clamp((.38-z)/.20,0,1)-.014:z>.03?.184:z>-.15?.198+.117*THREE.MathUtils.clamp((.02-z)/.17,0,1)-.014:.30,cut=1-THREE.MathUtils.smoothstep(Math.abs(x-.20),.125,.205),shaped=THREE.MathUtils.lerp(.016+hill,Math.min(.016+hill,cap),cut);return shaped*(1-t)-sag*t+.002;};disc(k,g,.89,.91,ground,p.land);
 // Three connected terraces climb from the southeast entrance into the compound.
 for(const [x,z,w,d,y,join] of [[.14,.43,.83,.34,.092,.516],[.07,.12,1.13,.38,.198,.188],[.0,-.35,1.19,.59,.315,-.143]]){
  const back=z-d/2,front=z+d/2,left=x-w/2,right=x+w/2;
  k.box(g,w,y-.018,join-back,p.stone,x,(y+.018)/2,(back+join)/2);
  for(const [a,b]of [[left,.085],[.315,right]])k.box(g,b-a,y-.018,front-join,p.stone,(a+b)/2,(y+.018)/2,(front+join)/2);
 }
 const stair=(x,front,run,bottom,top,n=12,w=.18)=>{for(let i=0;i<n;i++){const y=bottom+(top-bottom)*(i+1)/n;k.box(g,w,y-.016,run/n+.002,p.stone,x,(y+.016)/2,front-i*run/n);}};
 k.box(g,.24,.010,.17,p.stone,.20,.021,.69);stair(.20,.66,.15,.026,.092);stair(.20,.38,.20,.092,.198);stair(.20,.02,.17,.198,.315);
 for(const side of [-1,1]){rail(k,g,p,[.20+side*.103,.026,.67],[.20+side*.103,.092,.51]);rail(k,g,p,[.20+side*.103,.092,.39],[.20+side*.103,.198,.19]);rail(k,g,p,[.20+side*.103,.198,.03],[.20+side*.103,.315,-.14]);}
 // Gate is a real opening between yellow masonry piers.
 for(const side of [-1,1])k.box(g,.07,.145,.08,p.yellow,.20+side*.115,.164,.50);
 k.box(g,.30,.053,.08,p.yellow,.20,.241,.50);roof(k,g,p,.35,.16,.272,.055,.20,.50);sign(k,g,'古鸡鸣寺',.13,.032,.20,.243,.543,{background:'#b98e37',color:'#302b20'});
 // Halls and adjoining galleries form the compact yellow-walled hilltop silhouette.
 hall(k,g,p,{x:-.34,z:.13,y:.198,w:.38,d:.27,h:.19,double:true});
 hall(k,g,p,{x:.46,z:-.26,y:.315,w:.25,d:.58,h:.18});
 hall(k,g,p,{x:-.37,z:-.39,y:.315,w:.31,d:.38,h:.18});
 hall(k,g,p,{x:.02,z:-.60,y:.315,w:.45,d:.18,h:.15});
 hall(k,g,p,{x:-.18,z:.42,y:.092,w:.37,d:.18,h:.13});
 // Courtyard walls, stepped gables and covered approach preserve gaps for circulation.
 for(const [x,z,w,d,y]of [[-.56,.12,.04,.33,.198],[.61,-.29,.035,.62,.315],[-.56,-.36,.035,.51,.315]]){k.box(g,w,.17,d,p.yellow,x,y+.085,z);for(let i=0;i<3;i++)k.box(g,w+.018,.035,d*(1-i*.24),p.yellow,x,y+.18+i*.03,z);}
 k.box(g,.17,.16,.04,p.yellow,.44,.278,.24);k.box(g,.12,.16,.04,p.yellow,-.035,.278,.24);
 roof(k,g,p,.17,.09,.361,.028,.44,.24);roof(k,g,p,.12,.09,.361,.028,-.035,.24);
 // Pagoda: seven octagonal storeys, red balconies, pale supports and a tall crowning roof.
 const q=new THREE.Group();g.add(q);q.position.set(.055,.315,-.285);
 k.cyl(q,.18,.20,.026,p.stone,0,.013,0,8);towerRoof(k,q,p,.205,.035,.057);
 for(let level=0;level<7;level++){
  const r=.146-level*.007,y=.075+level*.104;
  k.cyl(q,r*.78,r*.80,.074,p.yellow,0,y+.037,0,8).rotation.y=Math.PI/8;
  k.cyl(q,r*1.07,r*1.07,.010,p.red,0,y+.006,0,8).rotation.y=Math.PI/8;
  for(let side=0;side<8;side++){
   const a=side*TAU/8,tx=Math.sin(a),tz=Math.cos(a),face=new THREE.Group();q.add(face);face.position.set(tx*r*.76,y+.043,tz*r*.76);face.rotation.y=a;
   k.box(face,r*.34,.052,.004,p.red);k.box(face,r*.23,.042,.005,p.pane,0,0,.003);
   for(const s of [-1,1])k.cyl(face,.0022,.0028,.076,p.cream,s*r*.33,-.002,r*.19,8);
   for(let i=-2;i<=2;i++)k.box(face,.0015,.042,.006,p.wood,i*r*.045,0,.006);
   const next=(side+1)*TAU/8,ra=r*1.015;
   rail(k,q,p,[Math.sin(a+Math.PI/8)*ra,y+.011,Math.cos(a+Math.PI/8)*ra],[Math.sin(next+Math.PI/8)*ra,y+.011,Math.cos(next+Math.PI/8)*ra]);
  }
  towerRoof(k,q,p,r*1.20,y+.080,level===6?.145:.043);
 }
 k.cyl(q,.001,.014,.11,p.gold,0,.978,0,12);for(let i=0;i<8;i++)k.ring(q,.013-i*.0013,.0017,p.gold,.933+i*.012);k.ball(q,.009,p.gold,0,1.039,0);
 // Small courtyard censer and planted edges, not filler buildings.
 k.cyl(g,.021,.028,.04,p.wood,-.03,.219,.08,12);k.cyl(g,.031,.025,.008,p.gold,-.03,.241,.08,12);
 const trees=[[-.66,.29,.16],[-.69,.05,.17],[-.66,-.21,.18],[-.61,-.57,.18],[-.35,-.72,.15],[.15,-.75,.15],[.59,-.63,.16],[.70,-.13,.15],[.63,.28,.16],[-.45,.58,.15],[-.62,.48,.13],[-.76,-.05,.13],[-.70,-.45,.14],[-.54,-.66,.14],[-.10,-.77,.13],[.39,-.70,.14],[.70,-.37,.15],[.75,.11,.13]];grove(k,g,ground,trees);
 finish(k,g,{lamps:[[-.32,.61],[.47,.56]],visitors:[[.02,.65],[.32,.66]]});
 for(const [x,y,z]of [[-.34,.27,.37],[.31,.38,-.07]]){const light=new THREE.PointLight('#f2d6a7',0,.68,2);light.position.set(x,y,z);light.userData.nightIntensity=.035;g.add(light);}
 return g;
}
