import * as THREE from 'three';
import {palette,site,disc,grove,finish,TAU} from './suzhou-kit.js';

function masonry(k,color,{plaster=false}={}){
 const m=k.mat(color,.97,.02);m.userData.night={color:new THREE.Color('#d8af70'),intensity:plaster?.38:.28};m.userData.tigerMasonry=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 tigerPos;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntigerPos=position;');s.fragmentShader='varying vec3 tigerPos;\n'+s.fragmentShader;
 s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vec2((tigerPos.x+tigerPos.z)*86.0,tigerPos.y*150.0);q.x+=mod(floor(q.y),2.0)*.5;vec2 f=fract(q),fw=max(fwidth(q),vec2(.006));float seam=max(1.0-smoothstep(.04-fw.x*.5,.04+fw.x*.5,min(f.x,1.0-f.x)),1.0-smoothstep(.055-fw.y*.5,.055+fw.y*.5,min(f.y,1.0-f.y)));
 float visible=1.0-smoothstep(.45,.9,max(fw.x,fw.y));float noise=sin(tigerPos.x*67.0+sin(tigerPos.z*47.0)+tigerPos.y*43.0)*cos(tigerPos.y*71.0-tigerPos.z*61.0);float chips=smoothstep(.08,.52,noise);
 diffuseColor.rgb*=mix(1.0,.84+.12*noise-.13*seam,visible);
 ${plaster?'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.21,.19,.15),chips*.62);':'diffuseColor.rgb*=.91+.06*sin(tigerPos.y*41.0+tigerPos.x*17.0);'}
 `);s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 totalEmissiveRadiance*=.34+.66*exp(-fract((tigerPos.y-.080)/.151)*3.0);`);
 };m.customProgramCacheKey=()=> 'tiger-aged-masonry-'+plaster;return m;
}
function lobed(w,h,bottom=0){
 const path=new THREE.Path();path.moveTo(-w/2,bottom);path.lineTo(-w/2,bottom+h*.61);path.bezierCurveTo(-w*.53,bottom+h*.76,-w*.38,bottom+h*.81,-w*.29,bottom+h*.80);path.bezierCurveTo(-w*.33,bottom+h*.91,-w*.17,bottom+h*.94,-w*.12,bottom+h*.91);path.quadraticCurveTo(0,bottom+h*1.13,w*.12,bottom+h*.91);path.bezierCurveTo(w*.17,bottom+h*.94,w*.33,bottom+h*.91,w*.29,bottom+h*.80);path.bezierCurveTo(w*.38,bottom+h*.81,w*.53,bottom+h*.76,w/2,bottom+h*.61);path.lineTo(w/2,bottom);path.closePath();return path;
}
function panel(k,g,p,w,h,depth,opening){
 const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();shape.holes.push(lobed(opening,h*.90,.002));
 const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});k.mesh(g,geo,p.brick,0,0,-depth);
 const top=lobed(opening,h*.90,.002).getPoints(60);k.line(g,top.filter(a=>a.y>.005).map(a=>[a.x,a.y,.001]),.0022,p.pale);
 // Red-brown grilles are behind the opening, with an actual dark recess.
 for(let i=-2;i<=2;i++)k.box(g,.0015,h*.65,.002,p.grille,i*opening*.155,h*.35,-.019);
 k.box(g,opening*.86,.0018,.002,p.grille,0,h*.41,-.018);k.box(g,opening,.003,.030,p.brick,0,.001,-.013);
 for(const s of [-1,1]){const width=(w-opening)/2-.012,x=s*(opening/2+width/2+.006);k.box(g,width,h*.84,.002,p.plaster,x,h*.45,.001);k.box(g,.007,.010,.003,p.dark,s*w*.30,h*.72,.003);}
}
function oct(k,g,r,y,h,mat){const o=k.cyl(g,r,r,h,mat,0,y+h/2,0,8);o.rotation.y=Math.PI/8;return o;}
function brackets(k,g,p,w,y){
 for(const x of [-w*.41,0,w*.41]){
  for(let j=0;j<3;j++){const high=y+j*.007,span=.010+j*.009;k.box(g,span,.004,.010+j*.006,p.brick,x,high,.004+j*.003);for(const sign of [-1,1])k.box(g,.005,.006,.009,p.pale,x+sign*span*.37,high+.004,.006+j*.003);}
  k.box(g,.023,.003,.027,p.brick,x,y+.022,.010);
 }
}
export function tiger(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.59,.55);p.brick=masonry(k,'#776e5b');p.plaster=masonry(k,'#c2b89d',{plaster:true});p.pale=masonry(k,'#b2a88f');p.dark=k.mat('#36362c',.99);p.dark.userData.night={color:new THREE.Color('#967f53'),intensity:.015};p.grille=k.mat('#57392e',.9);p.grille.userData.night={color:new THREE.Color('#8e6941'),intensity:.015};
 disc(k,g,.46,.42,.024,p.stone);oct(k,g,.283,.024,.032,p.brick);oct(k,g,.275,.056,.012,p.pale);
 // Tilt belongs to the whole existing brick structure; the forecourt stays level.
 const tower=new THREE.Group();tower.position.y=.068;tower.rotation.z=-.041;g.add(tower);
 const heights=[.169,.157,.151,.145,.139,.133,.127];let y=0;
 for(let floor=0;floor<7;floor++){
  const r=.218-floor*.0117,h=heights[floor],apothem=r*Math.cos(Math.PI/8),w=2*r*Math.sin(Math.PI/8),wallY=y+.047,wallH=h-.086;
  oct(k,tower,r,y,.048,p.brick);oct(k,tower,r*.69,wallY,wallH,p.dark);
  for(let side=0;side<8;side++){
   const a=side*TAU/8,face=new THREE.Group();face.position.set(Math.sin(a)*apothem,wallY,Math.cos(a)*apothem);face.rotation.y=a;tower.add(face);panel(k,face,p,w+.001,wallH,.026,w*(floor===0?.34:.31));
   for(const sign of [-1,1])k.cyl(face,.0035,.0044,wallH+.007,p.pale,sign*w*.48,wallH/2,.001,10);
   k.box(face,w+.003,.006,.011,p.pale,0,wallH+.003,.002);brackets(k,face,p,w,wallH+.011);
   // Thin layered dentils replace large wooden-style roof overhangs.
   for(let j=0;j<8;j++){const o=k.box(face,.005,.004,.008,p.brick,(j/7-.5)*w*.96,wallH+.031,.012);o.rotation.y=Math.PI/4;}
   if(floor%2===1&&side%2===0)for(const sign of [-1,1])for(let j=0;j<4;j++)k.box(face,.0013,wallH*.42,.003,p.brick,sign*w*.32+(j-1.5)*.003,wallH*.34,.005);
  }
  for(let j=0;j<3;j++)oct(k,tower,r+.003+j*.002,y+h-.012+j*.004,.004,p.brick);
  y+=h;
 }
 // The surviving summit is compact. It is not a restored gold finial or a wide timber roof.
 oct(k,tower,.149,y,.032,p.plaster);const cap=k.cyl(tower,.041,.149,.045,p.brick,0,y+.0545,0,8);cap.rotation.y=Math.PI/8;oct(k,tower,.042,y+.077,.016,p.brick);k.cyl(tower,.0007,.0012,.050,p.dark,0,y+.118,0,8);
 // A low protective wall and a level approach identify the conserved tower base.
 for(let i=1;i<8;i++){const a=i*TAU/8,face=new THREE.Group();face.rotation.y=a;tower.add(face);k.box(face,.204,.046,.020,p.brick,0,-.020,.258);k.box(face,.216,.008,.027,p.pale,0,.006,.258);}
 for(let i=0;i<6;i++){const high=.025+(i+1)*.007;k.box(g,.20,high-.018,i===5?.055:.023,p.pale,0,(high+.018)/2,.395-i*.023);}
 grove(k,g,ground,[[-.43,-.18,.17],[.43,-.17,.18],[-.39,.27,.12],[.38,.29,.13]]);
 return finish(k,g,{lamps:[[-.26,.027,.24],[.26,.027,.24]],visitors:[[-.09,.025,.44],[.10,.025,.45]]});
}
