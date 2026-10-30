import * as THREE from 'three';
import {skin,glow,palm,bollards,people} from './shenzhen-forms.js';

// Minghua is the permanently moored passenger liner at Shekou Sea World.
// Its own enclosed fountain pool is part of this removable landmark.
const poolOutline=[[-.80,-.19],[-.66,-.31],[-.24,-.32],[.36,-.30],[.70,-.22],[.80,-.05],[.77,.16],[.64,.27],[.57,.39],[.27,.43],[.10,.36],[-.16,.43],[-.43,.39],[-.56,.29],[-.75,.25],[-.82,.08]];
function pond(k,g,outline,y,material){
  const curve=new THREE.CatmullRomCurve3(outline.map(([x,z])=>new THREE.Vector3(x,y,z)),true,'catmullrom',.25),points=curve.getPoints(160),shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.z)));
  const geo=new THREE.ShapeGeometry(shape,64);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);k.mesh(g,geo,material);return points;
}
function deck(k,g,length,width,x,y,z,material){
  const shape=new THREE.Shape(),a=x-length/2,b=x+length/2,r=width/2;
  shape.moveTo(a+r,-z-r);shape.lineTo(b-r,-z-r);shape.quadraticCurveTo(b,-z-r,b,-z);shape.quadraticCurveTo(b,-z+r,b-r,-z+r);shape.lineTo(a+r,-z+r);shape.quadraticCurveTo(a,-z+r,a,-z);shape.quadraticCurveTo(a,-z-r,a+r,-z-r);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.006,bevelEnabled:false,curveSegments:12});geo.rotateX(-Math.PI/2);geo.translate(0,y,0);return k.mesh(g,geo,material);
}
function shipSign(k,g){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,768,160);ctx.fillStyle='#ad302d';ctx.font='bold 106px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('海 上 世 界',384,82,746);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.MeshStandardMaterial({map,emissiveMap:map,transparent:true,alphaTest:.1,roughness:.75,side:THREE.DoubleSide});mat.userData.night={color:new THREE.Color('#e56143'),intensity:.45};mat.userData.rigidVessel=true;k.materials.push(mat);
  k.mesh(g,new THREE.PlaneGeometry(.30,.063),mat,-.16,.392,.021);
}
export function minghua(k){
  const g=new THREE.Group(),white=k.mat('#e8e5d8',.73,.08,'#e7d7b8'),warmWhite=k.mat('#d6d4c6',.77),wood=k.mat('#a68f73',.92),ivory=k.mat('#c5b78c',.72),dark=k.mat('#34515a',.56,.22,'#eed8b0'),port=k.mat('#344b50',.60),trim=k.mat('#859a9b',.60,.25),pool=k.mat('#468d91',.48,.1),stone=k.mat('#b2b7a6',.95),edge=k.mat('#dfd4b7',.8),waterJet=glow(k,'#8bd6df',.34,1.4,.73),warm=glow(k,'#efd3a4',.62),fountain=glow(k,'#bbafe8',.62,2.1,.6);
  white.userData.night.intensity=.045;dark.userData.night.intensity=.38;
  // Keep the vessel straight while its lowest hull meets the spherical pool.
  // Poolside vegetation is deliberately excluded from this deformation rule.
  for(const material of [white,warmWhite,wood,ivory,dark,port,trim,warm])material.userData.rigidVessel=true;
  const outer=poolOutline.map(([x,z])=>[x*1.07,(z-.03)*1.10+.03]);pond(k,g,outer,.009,stone);const perimeter=pond(k,g,poolOutline,.014,pool);k.line(g,perimeter.map(p=>[p.x,.022,p.z]),.006,edge,true);
  // Smooth hull sections preserve the pointed bow (+x) and rounded stern.
  const sections=[[-.65,.010],[-.62,.068],[-.56,.105],[-.42,.117],[.12,.120],[.37,.105],[.53,.062],[.65,.001]];
  const halfWidth=x=>{for(let i=1;i<sections.length;i++)if(x<=sections[i][0]){const [a,wa]=sections[i-1],[b,wb]=sections[i];return THREE.MathUtils.lerp(wa,wb,(x-a)/(b-a));}return .001;};
  const top=x=>.174+.035*Math.pow(Math.max(0,(x-.30)/.35),1.25)+.016*Math.pow(Math.max(0,(-x-.40)/.25),1.2),cz=-.075;
  const hull=(u,v,side)=>{const x=-.65+1.30*u,w=halfWidth(x)*(.73+.27*Math.sin(v*Math.PI/2));return [x,.031+v*(top(x)-.031),cz+side*w];};
  for(const side of [-1,1])skin(k,g,(u,v)=>hull(u,v,side),12,110,white);
  skin(k,g,(u,v)=>{const x=-.65+u*1.30;return [x,top(x),cz+(v*2-1)*halfWidth(x)];},12,110,wood);
  for(const side of [-1,1]){
    k.line(g,Array.from({length:111},(_,i)=>{const x=-.65+i/110*1.3;return [x,.043,cz+side*halfWidth(x)*.77];}),.0028,trim);
    for(let row=0;row<2;row++)for(let i=0;i<29;i++){const x=-.56+i*.038,y=.088+row*.043,v=(y-.031)/(top(x)-.031),z=cz+side*(halfWidth(x)*(.73+.27*Math.sin(v*Math.PI/2))+.0015),p=k.cyl(g,.0031,.0031,.002,port,x,y,z,12);p.rotation.x=Math.PI/2;}
    // Promenade openings sit between the decks, rather than a luminous solid wall.
    for(let row=0;row<2;row++)for(let i=0;i<22;i++){const x=-.47+i*.039;k.box(g,.027,.024,.0028,dark,x,.201+row*.040,cz+side*.108);k.box(g,.022,.002,.003,warm,x,.192+row*.040,cz+side*.110);}
  }
  deck(k,g,1.10,.235,-.06,.175,cz,white);k.box(g,.91,.079,.211,white,-.055,.218,cz);
  // Window meshes lie just outside the walls; upper levels step back at both ends.
  deck(k,g,1.04,.245,-.07,.256,cz,white);k.box(g,.72,.043,.166,white,-.06,.281,cz);deck(k,g,.89,.204,-.10,.302,cz,white);
  for(const side of [-1,1])for(let i=0;i<18;i++){const x=-.39+i*.040;k.box(g,.028,.027,.003,dark,x,.282,cz+side*.084);k.box(g,.023,.003,.003,warm,x,.273,cz+side*.086);}
  // Glazed bridge toward the bow, open aft terraces, lifeboats and access stairs.
  k.box(g,.135,.044,.167,white,.31,.282,cz);for(let i=0;i<4;i++){k.box(g,.026,.026,.003,dark,.26+i*.033,.287,cz+.085);k.box(g,.003,.026,.033,dark,.379,.287,cz+(i-1.5)*.038);}deck(k,g,.18,.188,.31,.305,cz,white);
  deck(k,g,.59,.143,-.08,.333,cz,wood);k.box(g,.30,.026,.112,white,-.02,.319,cz);
  for(const x of [-.53,-.44])for(const z of [-.13,-.025]){const t=k.cyl(g,.014,.014,.005,wood,x,.198,z,12);k.cyl(g,.0017,.0017,.016,trim,x,.188,z,6);}
  for(const x of [-.25,.04,.17])for(const side of [-1,1]){const boat=k.ball(g,.022,white,x,.293,cz+side*.11);boat.scale.set(1.75,.47,.51);k.box(g,.055,.003,.023,wood,x,.298,cz+side*.11);}
  function railPath(points){k.line(g,points.map(([x,y,z])=>[x,y+.018,z]),.0013,warmWhite);k.line(g,points.map(([x,y,z])=>[x,y+.009,z]),.00085,trim);points.forEach(([x,y,z],i)=>{if(i%3===0)k.cyl(g,.001,.001,.019,white,x,y+.0095,z,5);});}
  for(const side of [-1,1])for(const [a,b,y,z] of [[-.56,.39,.263,.116],[-.43,.27,.309,.096],[-.35,.19,.339,.067]])railPath(Array.from({length:40},(_,i)=>[a+(b-a)*i/39,y,cz+side*z]));
  for(const side of [-1,1])railPath(Array.from({length:20},(_,i)=>{const x=.39+i/19*.25;return [x,top(x)+.005,cz+side*halfWidth(x)];}));
  for(let i=0;i<12;i++){const x=-.49+i*.009;k.box(g,.010,.005,.047,white,x,.199+i*.005,cz+.073);}
  // Pale funnel and masts, with fine rigging in the actual liner silhouette.
  const funnel=k.cyl(g,.026,.029,.091,ivory,-.11,.383,cz,24);funnel.scale.z=.68;const cap=k.cyl(g,.027,.027,.006,dark,-.11,.430,cz,24);cap.scale.z=.68;
  for(const [x,h,base] of [[-.30,.19,.337],[.20,.14,.337]]){k.cyl(g,.002,.003,h,ivory,x,base+h/2,cz,8);k.beam(g,[x-.042,base+h*.77,cz],[x+.042,base+h*.77,cz],.0018,ivory);for(const side of [-1,1])k.beam(g,[x,base+h*.92,cz],[x+side*.105,base+.004,cz+side*.052],.00065,trim);}
  shipSign(k,g);
  // The three connected circular fountains are inside the enclosed pool.
  const rings=[[-.52,.22,.089],[-.03,.215,.071],[.43,.16,.051]];
  k.line(g,[[-.57,.021,.22],[-.28,.021,.23],[-.03,.021,.215],[.19,.021,.22],[.43,.021,.16]],.012,trim);
  rings.forEach(([x,z,r],j)=>{
    for(const radius of [r,r*.80]){const ring=k.ring(g,radius,.0023,trim,.022);ring.position.x=x;ring.position.z=z;}
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2,xx=x+Math.cos(a)*r*.90,zz=z+Math.sin(a)*r*.90;k.ball(g,.0028,j===1?fountain:warm,xx,.026,zz);if(i%2===0){const tip=.040+.020*Math.sin(a*3+j)**2;k.line(g,[[xx,.027,zz],[x+Math.cos(a)*r*.91,tip, z+Math.sin(a)*r*.91],[x+Math.cos(a)*r*.78,.030,z+Math.sin(a)*r*.78]],.0012,waterJet);}}
  });
  // Low public promenade around the pool; no invented mall blocks.
  for(const [x,z] of [[-.70,.31],[-.34,.43],[.12,.42],[.61,.34],[.78,.07]])palm(k,g,x,.015,z,.11);
  bollards(k,g,[[-.76,.29],[-.44,.42],[-.22,.43],[.31,.44],[.65,.29],[.79,.15]]);
  people(k,g,[[-.62,.33],[-.59,.34],[-.31,.44],[-.26,.45],[.23,.45],[.27,.44],[.59,.35],[.63,.33],[.76,.13]]);
  const gangway=k.box(g,.18,.008,.036,wood,.63,.029,-.19);gangway.rotation.y=-.55;
  return k.merge(g);
}
