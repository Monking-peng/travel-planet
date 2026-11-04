import * as THREE from 'three';
import {TAU,disc,skin,sign,finish} from './chongqing-kit.js';
function ground(x,z){const t=THREE.MathUtils.smoothstep(Math.hypot(x/.97,z/.85),.89,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .014*(1-t)-sag*t+.002;}
function loop(k,g,fn,y,material,r=.002){return k.line(g,Array.from({length:101},(_,i)=>{const p=fn(i/100);return[p[0],y,p[1]];}),r,material,true);}
const edgeCurve=new THREE.CatmullRomCurve3([[-.60,-.43],[.60,-.43],[.66,.20],[.49,.42],[.22,.54],[0,.57],[-.22,.54],[-.49,.42],[-.66,.20]].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'catmullrom',.25);
function podium(t,s=1){const v=edgeCurve.getPoint(t%1);return[v.x*s,v.z*s];}
function floor(k,g,outline,y,mat){const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z))),o=k.mesh(g,new THREE.ShapeGeometry(shape),mat,0,y,0);o.rotation.x=-Math.PI/2;return o;}
export function raffles(k){
 const g=new THREE.Group(),p={land:k.mat('#9cab8b',.98),water:k.mat('#648780',.43,.14),stone:k.mat('#c5c4b5',.86),silver:k.mat('#bec7c5',.57,.24),dark:k.mat('#3e555b',.48,.25),garden:k.mat('#647c59',.95),soil:k.mat('#8e9580',.97),crystal:k.mat('#789498',.30,.26),belly:k.mat('#8e9f9f',.57,.3)};
 p.land.userData.landscape=true;p.water.userData.water=true;p.crystal.transparent=true;p.crystal.opacity=.68;p.crystal.depthWrite=false;p.crystal.userData.night={color:new THREE.Color('#d4d8bc'),intensity:.18};p.belly.userData.night={color:new THREE.Color('#b7c3ba'),intensity:.06};
 disc(k,g,.97,.85,ground,p.land);disc(k,g,.75,.64,.018,p.water);
 // Curved shopping podium and terraced quays follow the real confluence point.
 for(const [s,y]of [[1.10,.031],[1.05,.055],[1,.162]]){
  skin(k,g,(u,v)=>{const a=podium(u,s);return[a[0],.020+v*(y-.020),a[1]];},2,128,p.stone);
  floor(k,g,Array.from({length:128},(_,i)=>podium(i/128,s)),y,p.stone);
 }
 const shop=k.glass('#526b70','#f4d39d',60);shop.userData.night.intensity=1.0;
 skin(k,g,(u,v)=>{const a=podium(u,1.003);return[a[0],.063+v*.079,a[1]];},5,128,shop);
 for(const y of [.06,.096,.145,.16])loop(k,g,t=>podium(t,1.009),y,p.silver,.0028);
 for(let i=0;i<96;i++){const a=podium(i/96,1.012);k.beam(g,[a[0],.062,a[1]],[a[0],.145,a[1]],.0017,p.stone,5);}
 for(let i=0;i<12;i++){const y=.031+(i+1)*.0108,z=.745-i*.014;k.box(g,.25,y-.020,.015,p.stone,0,(y+.020)/2,z);}
 k.box(g,.25,.006,.055,p.stone,0,.162,.558);
 // Six shorter towers and two taller towers keep independent facades and lights.
 const specs=[[-.45,.07,1.0,.17],[-.15,.07,1.0,.18],[.15,.07,1.0,.18],[.45,.07,1.0,.17],[-.205,-.26,1.43,.19],[.205,-.26,1.43,.19],[-.60,-.28,1.0,.16],[.60,-.28,1.0,.16]];
 specs.forEach(([x,z,h,w],i)=>{
  const facade=k.glass(i>5?'#566f72':'#4b626b','#e8d3aa',110+i*9);facade.userData.night.intensity=.88;
  const frame=k.mat('#c4cdca',.56,.25,'#dfc2a2');frame.userData.night.intensity=.23;frame.userData.pulse={speed:.38,phase:i*.68};frame.userData.rafflesTower=i;
  const depth=i>5?.16:.19,bend=i<4?.092:.045;
  const compile=facade.onBeforeCompile;
  facade.onBeforeCompile=s=>{compile(s);s.fragmentShader=s.fragmentShader.replace('vec2 cell=vec2((vCity.x+vCity.z)*100.0,vCity.y*106.0);',`float level=(vCity.y-.163)/${h.toFixed(5)};float front=step(abs(vCity.x-(${x.toFixed(5)})),${(w*.48).toFixed(5)});float along=mix((vCity.z-(${z.toFixed(5)})-${bend.toFixed(5)}*level*level)/${depth.toFixed(5)},(vCity.x-(${x.toFixed(5)}))/${w.toFixed(5)},front);vec2 cell=vec2((along+.5)*5.0,level*40.0);`).replace('totalEmissiveRadiance*=pane*(occupied*.28+(.50+.50*occupied)*pulse*sweep)*mechanical*cityNight;','totalEmissiveRadiance*=pane*occupied*(.72+.28*pulse)*cityNight;');};facade.customProgramCacheKey=()=>`raffles-windows-${i}`;
  const point=(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),n=Math.max(Math.abs(c),Math.abs(s));return[x+c/n*w/2*(1-.035*v),.163+h*v,z+s/n*depth/2+bend*v*v];};
  skin(k,g,point,40,32,facade);
  // Wider structural ribs and recessed glazing replace the former uniform grid.
  for(let j=0;j<=40;j++){const v=j/40;k.line(g,Array.from({length:33},(_,a)=>point(a/32,v)),j%10===0?.005:.0027,frame,true);}
  for(const a of [1/8,3/8,5/8,7/8])k.line(g,Array.from({length:41},(_,j)=>point(a,j/40)),.0058,frame);
  for(const side of [-1,1]){
   for(const q of [-.28,.28]){const line=[];for(let j=0;j<=40;j++){const v=j/40;line.push([x+q*w*(1-.035*v),.163+h*v,z+side*depth/2+bend*v*v]);}k.line(g,line,.0021,p.silver);}
   for(const v of [.28,.55,.80]){
    const y=.163+h*v,zz=z+side*(depth/2+.002)+bend*v*v;k.box(g,w*.96,.038,.004,p.dark,x,y,zz);
    for(let b=0;b<3;b++)k.beam(g,[x-w*.45+b*w*.3,y-.016,zz+side*.003],[x-w*.15+b*w*.3,y+.016,zz+side*.003],.003,frame,5);
   }
  }
  k.box(g,w*.97,.009,depth*.99,p.silver,x,.163+h,z+bend);k.box(g,w*.82,.007,depth*.76,p.dark,x,.169+h,z+bend);
 });
 // Crystal: a glazed conservatory with a deep lower belly and open end gardens.
 const section=(x,a,r=1)=>[x,1.223+Math.sin(a)*.091*r,.162+Math.cos(a)*.123*r+.022*Math.sin(Math.PI*x/1.4)];
 p.crystal.userData.crystalShell=true;p.belly.userData.crystalBelly=true;
 skin(k,g,(u,v)=>section(-.57+1.14*v,u*TAU),44,56,p.crystal);
 skin(k,g,(u,v)=>section(-.705+1.41*v,Math.PI+u*Math.PI),18,60,p.belly);
 const rib=k.mat('#bdc8c7',.48,.3,'#f0dbb2');rib.userData.night.intensity=.64;rib.userData.pulse={speed:.37,phase:.8};
 for(let j=0;j<=50;j++){const x=-.705+j/50*1.41;k.line(g,Array.from({length:65},(_,i)=>section(x,i/64*TAU,1.015)),.0018,rib,true);}
 for(const angle of [.18,Math.PI-.18,Math.PI*1.08,Math.PI*1.92])k.line(g,Array.from({length:61},(_,i)=>section(-.705+i/60*1.41,angle,1.016)),.0015,p.silver);
 const deck=k.mat('#baae93',.86,0);deck.userData.night={color:new THREE.Color('#e2c393'),intensity:.20};
 k.box(g,1.40,.008,.204,deck,0,1.196,.162);
 for(const side of [-1,1]){
  for(let i=0;i<4;i++){const x=side*(.59+i*.027),a=section(x,0);k.box(g,.016,.015,.07,p.garden,x,1.211,a[2]-.095);}
  for(const z of [.092,.225]){k.box(g,.10,.004,.002,p.silver,side*.65,1.230,z);for(let i=0;i<6;i++)k.box(g,.001,.029,.001,p.silver,side*(.60+i*.019),1.216,z);}
 }
 for(const side of [-1,1])for(const [x,z]of [[side*.63,.12],[side*.67,.17],[side*.62,.20]]){k.cyl(g,.002,.003,.023,p.dark,x,1.218,z,6);const crown=k.mesh(g,new THREE.IcosahedronGeometry(.014,1),p.garden,x,1.238,z);crown.scale.set(.8,1.3,.8);}
 // Short transparent bridges link the conservatory to the two taller towers.
 for(const x of [-.205,.205]){k.box(g,.087,.006,.28,p.silver,x,1.192,-.055);k.box(g,.087,.055,.28,p.crystal,x,1.222,-.055);k.box(g,.09,.004,.28,p.silver,x,1.253,-.055);}
 // Roof park, visible skylights and separate planted beds belong to this podium.
 for(const [x,z,w,d]of [[-.34,-.18,.12,.18],[.34,-.18,.12,.18],[-.45,.30,.14,.09],[.45,.30,.14,.09],[-.18,.40,.12,.09],[.18,.40,.12,.09]]){k.box(g,w,.009,d,p.soil,x,.168,z);k.box(g,w*.86,.014,d*.78,p.garden,x,.177,z);}
 for(const x of [-.31,.31]){const roof=k.mesh(g,new THREE.SphereGeometry(.068,24,12,0,TAU,0,Math.PI/2),p.crystal,x,.168,-.36);roof.scale.set(1,.22,1.5);}
 const warm=k.mat('#c7ae82',.65,0,'#f3ce93');warm.userData.night.intensity=.65;warm.userData.pulse={speed:.43,phase:2};
 for(let i=0;i<14;i++){const a=podium(.12+i*.054,1.075);k.cyl(g,.0025,.003,.030,p.dark,a[0],.070,a[1],7);k.ball(g,.004,warm,a[0],.088,a[1]);}
 sign(k,g,'来福士',.17,.035,0,.113,.575,{background:'#c2c0af',color:'#385154'});
 g.userData={towers:8,openCrystalGardens:true};return finish(k,g);
}
