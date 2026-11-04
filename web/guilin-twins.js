import * as THREE from 'three';
import {palette,site,lake,skin,lit,finish,TAU} from './guilin-kit.js';

function oct(k,g,r,h,y,m){const o=k.cyl(g,r/Math.cos(Math.PI/8),r/Math.cos(Math.PI/8),h,m,0,y,0,8);o.rotation.y=Math.PI/8;return o;}
function facet(g,a,r,y){const f=new THREE.Group();f.rotation.y=a;f.position.set(Math.sin(a)*r,y,Math.cos(a)*r);g.add(f);return f;}
function rails(k,g,p,r,y,stone=false){
 const w=2*r*Math.tan(Math.PI/8);
 for(let side=0;side<8;side++){
  const f=facet(g,side/8*TAU,r,y),m=stone?p.stone:p.trim;
  for(const yy of [.006,.028])k.box(f,w,.0028,.004,m,0,yy,0);
  for(const x of [-w/2,w/2]){k.box(f,.004,.037,.005,m,x,.016,0);k.ball(f,.003,m,x,.036,0);}
  for(let j=0;j<3;j++){const x=(j-1)*w*.29,b=w*.105;for(const s of [-1,1]){k.box(f,.0015,.017,.002,m,x+s*b,.017,0);k.box(f,b*2,.0015,.002,m,x,.017+s*.007,0);}k.line(f,[[x-b*.6,.017,0],[x,.023,0],[x+b*.6,.017,0],[x,.011,0]],.00065,m,true);}
 }
}
function bracket(k,f,p,x,y){for(let j=0;j<3;j++){k.box(f,.006+j*.005,.0026,.009+j*.005,p.trim,x,y+j*.003,.005+j*.002);k.box(f,.003,.005,.006,p.frame,x,y+j*.003-.002,.003+j*.002);}}
function roof(k,g,p,r,inner,h,y,top=false){
 const pt=(u,v)=>{const a=u*TAU,s=TAU/8,d=((a+s/2)%s)-s/2,outer=r/Math.cos(d),rad=inner+(outer-inner)*v,corner=(Math.abs(d)/(s/2))**6;return [Math.sin(a)*rad,y+h*(1-v)**1.55+.013*v**6*corner,Math.cos(a)*rad];};
 skin(k,g,pt,12,128,p.tile);k.line(g,Array.from({length:128},(_,i)=>pt(i/128,1)),.0017,p.edge,true);
 for(let i=0;i<96;i++)k.line(g,Array.from({length:10},(_,j)=>{const a=pt(i/96,.02+.98*j/9);a[1]+=.0011;return a;}),.00085,p.rib);
 for(let side=0;side<8;side++){
  const a=(side+.5)/8*TAU,rad=r/Math.cos(Math.PI/8),x=Math.sin(a)*rad,z=Math.cos(a)*rad;
  k.line(g,[[x*.76,y+.012,z*.76],[x*.94,y+.013,z*.94],[x*1.03,y+.028,z*1.03]],.002,p.trim);
  k.ball(g,.0028,p.trim,x*1.02,y+.031,z*1.02);
  for(let b=0;b<3;b++){const t=.61+b*.10;k.ball(g,.0024,p.trim,x*t,y+h*(1-t)**1.4+.004,z*t);}
 }
}
function tower(k,parent,{x,z,moon=false}){
 const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);const tone=moon?'#c7eaf0':'#ffc564';
 const p={tile:k.mat(moon?'#3b625e':'#695d40',.78,moon?.15:.30),rib:k.mat(moon?'#58776a':'#92815a',.72,.22),frame:k.mat(moon?'#9d8267':'#b19352',.72,.25),trim:lit(k,moon?'#bab8a4':'#baa06a',.18,tone),edge:lit(k,moon?'#9eb8b2':'#af8d47',.64,tone),stone:k.mat('#bdb9a7',.95),shadow:k.mat('#4a4639',.95)};
 p.tile.userData.night={color:new THREE.Color(tone),intensity:moon?.055:.075};
 const heights=moon?[.106,.084,.084,.081,.079,.077,.074]:[.110,.074,.074,.074,.074,.074,.074,.074,.074],radii=moon?[.130,.110,.106,.100,.093,.083,.069]:[.153,.121,.117,.113,.109,.104,.098,.090,.076];
 const scale=moon?1.13:1.14;g.scale.setScalar(scale);
 for(const [r,y,h]of [[moon?.169:.191,.029,.026],[moon?.158:.18,.048,.012],[moon?.155:.176,.058,.009]])oct(k,g,r,h,y,p.stone);
 rails(k,g,p,moon?.158:.18,.058,true);let y=.065;
 for(let level=0;level<heights.length;level++){
  const h=heights[level],r=radii[level],inner=r*.70,window=lit(k,moon?'#36504c':'#484b39',moon?.38:.33,tone);window.userData.pulse={speed:.34,phase:level*.59+(moon?1.2:0)};
  oct(k,g,r*.99,.007,y+.003,p.frame);oct(k,g,inner,h-.005,y+h/2,p.shadow);
  for(let side=0;side<8;side++){
   const a=side/8*TAU,f=facet(g,a,inner,y),w=2*inner*Math.tan(Math.PI/8),outer=facet(g,a,r*.94,y),ow=2*r*.94*Math.tan(Math.PI/8);
   for(let part=0;part<3;part++){
    const xx=(part-1)*w*.28,ww=w*.24;k.box(f,ww,h*.65,.002,window,xx,h*.42,.001);
    for(const sx of [-1,1])k.box(f,.0017,h*.69,.004,p.frame,xx+sx*ww*.51,h*.42,.003);
    for(const yy of [h*.10,h*.36,h*.73])k.box(f,ww,.0016,.004,p.trim,xx,yy,.003);
    for(const sx of [-1,1])k.line(f,[[xx,h*.49,.004],[xx+sx*ww*.36,h*.58,.004],[xx,h*.67,.004]],.00065,p.trim);
   }
   k.box(f,w,.009,.006,p.trim,0,h*.87,.001);for(let j=-1;j<=1;j++){const o=k.mesh(f,new THREE.BoxGeometry(.005,.005,.002),p.frame,j*w*.28,h*.87,.005);o.rotation.z=Math.PI/4;}
   for(const xx of [-ow/2,ow/2]){k.cyl(outer,.0025,.0032,h,p.frame,xx,h/2,0,8);bracket(k,outer,p,xx,h-.012);}
   k.box(outer,ow,.005,.008,p.frame,0,h-.005,.001);bracket(k,outer,p,0,h-.012);
   if(level===0&&side===0){k.box(f,w*.39,h*.63,.004,p.shadow,0,h*.33,.004);k.box(f,.002,h*.61,.006,p.trim,0,h*.33,.006);}
  }
  rails(k,g,p,r*.94,y+.001);roof(k,g,p,r*1.16,level===heights.length-1?0:r*.53,level===heights.length-1?.060:.030,y+h,level===heights.length-1);
  y+=h+.014;
 }
 const top=y+.046;k.cyl(g,.002,.003,.095,p.trim,0,top+.047,0,12);for(let j=0;j<8;j++)k.cyl(g,.010-j*.0009,.010-j*.0009,.004,p.trim,0,top+.010+j*.008,0,14);k.ball(g,.004,p.trim,0,top+.078,0);k.cyl(g,0,.003,.022,p.trim,0,top+.091,0,12);
 for(let side=0;side<8;side++){const a=(side+.5)/8*TAU;k.beam(g,[0,top+.044,0],[Math.sin(a)*.080,top-.044,Math.cos(a)*.080],.00055,p.trim,5);}
 return g;
}
function lakeMaterial(k){
 const m=k.mat('#4d7978',.84,.015),time={value:0};m.userData.landscape=true;m.userData.water=true;m.userData.waterTime=time;m.userData.night={color:new THREE.Color('#ffffff'),intensity:.66};
 m.onBeforeCompile=s=>{s.uniforms.twinsWaterTime=time;s.vertexShader='varying vec3 vTwinsWater; varying vec3 vTwinsEye;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vTwinsWater=position;vec3 eyeDelta=cameraPosition-modelMatrix[3].xyz;vTwinsEye=vec3(dot(eyeDelta,modelMatrix[0].xyz),dot(eyeDelta,modelMatrix[1].xyz),dot(eyeDelta,modelMatrix[2].xyz));`);
  s.fragmentShader=`varying vec3 vTwinsWater; varying vec3 vTwinsEye; uniform float twinsWaterTime;
 float towerShimmer(vec2 center,float width){vec2 dir=normalize(vTwinsEye.xz-center+vec2(.0001));vec2 d=vTwinsWater.xz-center;float along=dot(d,dir),across=dot(d,vec2(-dir.y,dir.x));float wave=sin(along*170.-twinsWaterTime*.8)+.45*sin(along*281.+twinsWaterTime*.6);float taper=max(.008,width*(1.-max(0.,along)*1.5));float strip=1.-smoothstep(taper*.25,taper,abs(across+wave*.006));float fade=smoothstep(.05,.16,along)*(1.-smoothstep(.18,.44,along));float ripple=.35+.65*pow(.5+.5*sin(along*310.+twinsWaterTime*.65+sin(across*90.)),3.);return strip*fade*ripple;}
 `+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float waterRipple=sin(vTwinsWater.z*260.+sin(vTwinsWater.x*71.)+twinsWaterTime*.4);diffuseColor.rgb*=.985+.015*waterRipple;`).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 totalEmissiveRadiance*=vec3(1.,.53,.13)*towerShimmer(vec2(.24,.07),.14)+vec3(.40,.78,1.)*towerShimmer(vec2(-.28,-.10),.11);`);
 };m.customProgramCacheKey=()=> 'guilin-tower-water-glints-v1';return m;
}
export function twins(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.65);p.water=lakeMaterial(k);lake(k,g,p,.75,.59);
 tower(k,g,{x:.24,z:.07});tower(k,g,{x:-.28,z:-.10,moon:true});finish(k,g);
 for(const [x,z,tone,intensity]of [[.24,.07,'#ffc776',.048],[-.28,-.10,'#d0eef5',.030]]){const l=new THREE.SpotLight(tone,0,1.6,.54,.90,2);l.position.set(x,.44,z+.40);l.target.position.set(x,.46,z);l.userData.nightIntensity=intensity;g.add(l,l.target);}
 return g;
}

