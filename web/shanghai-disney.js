import * as THREE from 'three';
import {disneyPark} from './shanghai-disney-park.js';

// Photographed Shanghai silhouette: rose masonry, slate roofs, asymmetric Renaissance towers.
function castle(k){
  const g=new THREE.Group();
  const brick=k.mat('#bc8b7d',.88,.01,'#c7869c'),stone=k.mat('#d6c6ab',.79,.02,'#d1ad96'),trim=k.mat('#eee0bf',.7,.08),roof=k.mat('#426079',.58,.18,'#636fba'),copper=k.mat('#507870',.6,.24,'#609eaa'),gold=k.mat('#c4a15c',.4,.46,'#ffd899'),glass=k.mat('#405366',.38,.2,'#ffd6a0');
  brick.userData.night.intensity=.16;stone.userData.night.intensity=.23;roof.userData.night.intensity=.38;copper.userData.night.intensity=.26;gold.userData.night.intensity=.85;glass.userData.night.intensity=1.15;
  for(const [m,phase] of [[brick,0],[stone,1],[roof,2.4]]){m.userData.pulse={phase,speed:.42,min:.65};m.userData.night.alternateColor=new THREE.Color(m===roof?'#b286dd':'#edb9a3');}
  // Subtle masonry remains crisp at close range, with no texture downloads or DOM dependency.
  brick.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vCastle; varying vec3 nCastle;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCastle=position; nCastle=normal;');
    s.fragmentShader='varying vec3 vCastle; varying vec3 nCastle;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 uv=vec2(abs(nCastle.z)>.5?vCastle.x:vCastle.z,vCastle.y);
      uv*=vec2(68.,140.); uv.x+=mod(floor(uv.y),2.)*.5;
      vec2 f=fract(uv),a=max(fwidth(uv),vec2(.025));
      float mortar=(1.-smoothstep(.045,.045+a.x,f.x))+(1.-smoothstep(.07,.07+a.y,f.y));
      float grain=fract(sin(dot(floor(uv),vec2(13.14,71.97)))*43758.54);
      diffuseColor.rgb*=mix(.92,1.06,grain); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.65,.55,.44),clamp(mortar,0.,1.)*.30);
    `);
  };brick.customProgramCacheKey=()=> 'shanghai-castle-masonry-v2';
  function archShape(w,h){const s=new THREE.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);s.closePath();return s;}
  function window(parent,x,y,z,w=.025,h=.055,rot=0){
    const a=new THREE.Group();a.position.set(x,y,z);a.rotation.y=rot;parent.add(a);
    k.mesh(a,new THREE.ShapeGeometry(archShape(w,h),10),glass);
    const pts=[[-w/2,0,.002],[-w/2,h-w/2,.002],...Array.from({length:13},(_,i)=>{const t=Math.PI-i/12*Math.PI;return [Math.cos(t)*w/2,h-w/2+Math.sin(t)*w/2,.002];}),[w/2,0,.002]];
    k.line(a,pts,.0017,trim);k.box(a,w+.008,.004,.008,trim,0,-.002,.001);k.box(a,.002,h-.005,.003,trim,0,h/2,.002);k.box(a,w,.002,.003,trim,0,h*.42,.002);
  }
  function finial(a,y,r=.004){k.cyl(a,.0009,.0017,.032,gold,0,y+.016,0,8);k.ball(a,r,gold,0,y+.033);k.beam(a,[-.009,y+.030,0],[.009,y+.030,0],.001,gold);}
  function roofCone(a,r,h,y,material=roof,bulb=false){
    const profile=bulb?[[r,0],[r*1.07,h*.12],[r*.9,h*.33],[r*.47,h*.60],[r*.25,h*.77],[.001,h]]:[[r*1.13,0],[r*1.11,.008],[r*.75,h*.25],[r*.42,h*.58],[r*.14,h*.89],[.001,h]];
    k.mesh(a,new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32),material,0,y);
    for(let i=1;i<17;i++){const t=i/17;let j=1;while(j<profile.length-1&&profile[j][1]<t*h)j++;const v=THREE.MathUtils.lerp(profile[j-1][0],profile[j][0],(t*h-profile[j-1][1])/(profile[j][1]-profile[j-1][1]));k.ring(a,v+.0002,.0006,material,y+t*h);}
    for(let i=0;i<8;i++){const t=i*Math.PI/4;k.line(a,profile.map(([rr,yy])=>[Math.sin(t)*rr,y+yy,Math.cos(t)*rr]),.0008,bulb?gold:trim);}
    finial(a,y+h);
  }
  function turret(x,z,r,h,rh,kind='cone'){
    const a=new THREE.Group();a.position.set(x,0,z);g.add(a);
    k.cyl(a,r,r*1.04,h,brick,0,h/2,0,24);
    for(const y of [.025,h*.40,h*.69,h-.015])k.cyl(a,r*1.08,r*1.08,.007,stone,0,y,0,24);
    for(let i=0;i<8;i++){const t=i*Math.PI/4;for(const y of [h*.22,h*.56])window(a,Math.sin(t)*(r+.001),y,Math.cos(t)*(r+.001),r*.42,h*.18,t);}
    k.cyl(a,r*1.15,r*1.07,.025,stone,0,h-.003,0,16);
    for(let i=0;i<12;i++){const t=i*Math.PI/6;k.box(a,.008,.023,.008,trim,Math.sin(t)*r*1.08,h+.014,Math.cos(t)*r*1.08);}
    roofCone(a,r*1.04,rh,h+.02,kind==='bulb'?copper:roof,kind==='bulb');return a;
  }
  function pitched(a,w,d,y,h){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w*.31,h*.80);shape.lineTo(0,h);shape.lineTo(-w*.31,h*.80);shape.closePath();
    k.mesh(a,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),roof,0,y,-d/2);
    for(let i=1;i<12;i++){const t=i/12,ww=w*(1-t*.70);k.box(a,ww,.001,.002,roof,0,y+t*h,d/2+.001);}
    k.box(a,w*1.06,.012,d*1.04,stone,0,y);
    k.beam(a,[0,y+h,-d/2],[0,y+h,d/2],.0025,gold);
  }
  function facadeWing(x,z,w,d,h){
    const a=new THREE.Group();a.position.set(x,0,z);g.add(a);k.box(a,w,h,d,brick,0,h/2);
    for(const y of [.025,.12,...(h>.35?[.28]:[]),h-.025,h])k.box(a,w+.012,.009,d+.013,stone,0,y);
    for(const side of [-1,1]){
      for(let i=0;i<6;i++){const xx=(i-2.5)*(w-.045)/5;window(a,xx,.15,side*(d/2+.002),.026,.065,side===1?0:Math.PI);window(a,xx,.043,side*(d/2+.002),.022,.049,side===1?0:Math.PI);}
      if(h>.35)for(let i=0;i<5;i++)window(a,(i-2)*(w-.05)/4,.31,side*(d/2+.002),.024,h-.34,side===1?0:Math.PI);
      for(const xx of [-w/2+.008,w/2-.008])for(let j=0;j<Math.floor(h/.018);j++)k.box(a,.015,.013,.008,trim,xx,.014+j*.018,side*(d/2+.005));
    }
    pitched(a,w+.025,d+.025,h+.005,.13);
    for(let i=0;i<4;i++)for(const side of [-1,1]){
      const xx=(i-1.5)*w/4,zz=side*(d/2+.01);k.box(a,.039,.042,.023,stone,xx,h+.038,zz);window(a,xx,h+.025,zz+side*.013,.021,.031,side===1?0:Math.PI);
      const dormer=k.cyl(a,0,.031,.043,roof,xx,h+.079,zz,4);dormer.rotation.y=Math.PI/4;
    }
    return a;
  }
  // Lower courtyard wings are wide and low; taller towers step back behind them.
  facadeWing(-.275,-.015,.32,.235,.26);facadeWing(.275,-.035,.32,.25,.28);
  facadeWing(-.10,-.21,.30,.19,.43);facadeWing(.19,-.23,.20,.18,.49);
  const front=new THREE.Shape();front.moveTo(-.19,0);front.lineTo(.19,0);front.lineTo(.19,.28);front.lineTo(-.19,.28);front.closePath();
  const hole=new THREE.Path();hole.moveTo(-.046,0);hole.lineTo(-.046,.087);hole.absarc(0,.087,.046,Math.PI,0,true);hole.lineTo(.046,0);hole.closePath();front.holes.push(hole);
  k.mesh(g,new THREE.ExtrudeGeometry(front,{depth:.10,bevelEnabled:false,curveSegments:24}),brick,0,0,.07);
  for(const y of [.17,.275])k.box(g,.40,.011,.115,stone,0,y,.12);
  const portal=[[-.051,0,.174],[-.051,.087,.174],...Array.from({length:17},(_,i)=>{const t=Math.PI-i/16*Math.PI;return [Math.cos(t)*.051,.087+Math.sin(t)*.051,.174];}),[.051,0,.174]];k.line(g,portal,.005,trim);
  for(const x of [-.145,.145]){window(g,x,.055,.172,.033,.077);window(g,x,.19,.172,.031,.060);}
  // Carved frontispiece is narrow, layered, and open to the bridge underneath.
  const fa=new THREE.Group();fa.position.z=.175;g.add(fa);k.box(fa,.17,.17,.018,stone,0,.255);
  const ped=new THREE.Shape();ped.moveTo(-.084,.34);ped.quadraticCurveTo(-.045,.342,-.038,.377);ped.quadraticCurveTo(0,.407,.038,.377);ped.quadraticCurveTo(.045,.342,.084,.34);ped.closePath();k.mesh(fa,new THREE.ExtrudeGeometry(ped,{depth:.015,bevelEnabled:false}),trim);
  for(const x of [-.045,0,.045])window(fa,x,.215,.012,.031,.080);
  for(const x of [-.079,.079]){k.box(fa,.009,.18,.025,trim,x,.255);const pinnacle=new THREE.Group();pinnacle.position.x=x;fa.add(pinnacle);roofCone(pinnacle,.010,.045,.35);}
  k.mesh(fa,new THREE.CircleGeometry(.015,24),roof,0,.363,.018);k.mesh(fa,new THREE.TorusGeometry(.018,.0025,6,32),gold,0,.363,.020);
  k.box(fa,.20,.009,.043,trim,0,.182,.014);for(let i=-8;i<=8;i++)k.cyl(fa,.0013,.002,.025,trim,i*.011,.199,.034,6);k.box(fa,.20,.004,.005,trim,0,.214,.034);
  // Different tower profiles are essential: cones, lanterns, domes, and needle spires.
  turret(-.43,.055,.048,.31,.17);turret(.43,.045,.052,.33,.18);
  turret(-.365,-.17,.045,.47,.18);turret(.365,-.18,.043,.42,.15,'bulb');
  turret(-.17,.08,.026,.37,.16);turret(.17,.08,.029,.39,.17);
  turret(-.18,-.31,.038,.67,.155,'bulb');turret(.30,-.31,.028,.59,.16);
  turret(-.035,-.18,.044,.58,.23);
  // Main off-centre stone tower: arcaded crown, narrow shaft and gold peony.
  const a=new THREE.Group();a.position.set(.12,0,-.18);g.add(a);
  k.box(a,.128,.52,.12,brick,0,.26);for(const y of [.20,.35,.48,.52])k.box(a,.145,.012,.139,stone,0,y);
  k.box(a,.090,.215,.085,stone,0,.6275);
  for(const side of [-1,1])for(const xx of [-.047,.047])k.box(a,.009,.25,.10,trim,xx,.622);
  for(const side of [-1,1]){window(a,0,.55,side*.045,.027,.15,side===1?0:Math.PI);for(const x of [-.035,.035])k.box(a,.004,.19,.008,trim,x,.63,side*.048);}
  k.cyl(a,.072,.053,.035,stone,0,.754,0,8);k.cyl(a,.053,.060,.064,stone,0,.802,0,8);
  for(let i=0;i<8;i++){const t=i*Math.PI/4;window(a,Math.sin(t)*.056,.775,Math.cos(t)*.056,.021,.045,t);}
  k.cyl(a,.059,.064,.009,trim,0,.838,0,8);roofCone(a,.059,.19,.843);
  for(let i=0;i<4;i++){const t=i*Math.PI/2,mini=new THREE.Group();mini.position.set(Math.sin(t)*.045,.83,Math.cos(t)*.045);a.add(mini);k.cyl(mini,.006,.007,.058,trim,0,.029,0,8);roofCone(mini,.008,.060,.058);}
  for(let i=0;i<5;i++){const t=i*Math.PI*2/5;const petal=k.ball(a,.006,gold,Math.sin(t)*.005,1.073,Math.cos(t)*.005);petal.scale.y=1.8;}
  // Terrace balustrades and fine gold ridge ornaments, not a solid battlement wall.
  for(const side of [-1,1])for(let j=0;j<24;j++){const x=side*(.195+j*.010);k.cyl(g,.0013,.002,.022,trim,x,.023,.208,6);}
  for(const x of [-.315,.315])k.box(g,.25,.004,.006,trim,x,.036,.208);
  return k.merge(g);
}
export function disney(k){return disneyPark(k,castle(k));}
