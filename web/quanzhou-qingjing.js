import * as THREE from 'three';
import {palette,site,skin,sign,finish,hip,TAU} from './quanzhou-kit.js';

function stone(k,color='#919583'){
 const m=k.mat(color,.98),tex=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);tex.needsUpdate=true;m.map=tex;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 qjP; varying vec3 qjN;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nqjP=position; qjN=normal;');s.fragmentShader='varying vec3 qjP; varying vec3 qjN;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 uv=abs(qjN.y)>.8?qjP.xz:(abs(qjN.z)>abs(qjN.x)?qjP.xy:qjP.zy);vec2 grid=vec2(uv.x/.059+mod(floor(uv.y/.023),2.0)*.5,uv.y/.023);vec2 aa=max(fwidth(grid),vec2(.012));vec2 d=min(fract(grid),1.0-fract(grid));float joint=1.0-smoothstep(.015,.015+max(aa.x,aa.y),min(d.x,d.y));float shade=fract(sin(dot(floor(grid),vec2(12.9898,78.233)))*43758.5453);float grain=fract(sin(dot(qjP,vec3(1134.7,2801.5,615.1)))*3437.23);diffuseColor.rgb*=mix(.95,1.05,shade)*mix(.95,1.02,grain);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.66,joint*.40);`);};m.customProgramCacheKey=()=> 'qingjing-dressed-stone';return m;
}
function archShape(w,h,r,spring,rise){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();const hole=new THREE.Path();hole.moveTo(-r,.001);hole.lineTo(-r,spring);hole.quadraticCurveTo(-r*.96,spring+rise*.45,0,spring+rise);hole.quadraticCurveTo(r*.96,spring+rise*.45,r,spring);hole.lineTo(r,.001);hole.closePath();s.holes.push(hole);return s;
}
function arch(k,g,p,{x=0,y=.025,z=0,w=.31,h=.55,d=.035,r=.088,spring=.29,rise=.16,trim=true}={}){
 const a=k.mesh(g,new THREE.ExtrudeGeometry(archShape(w,h,r,spring,rise),{depth:d,bevelEnabled:false,curveSegments:24}),p.stone,x,y,z-d/2);
 if(trim)for(const side of [-1,1]){const c=new THREE.QuadraticBezierCurve3(new THREE.Vector3(x+side*r,y+spring,z+d/2+.001),new THREE.Vector3(x+side*r*.96,y+spring+rise*.45,z+d/2+.001),new THREE.Vector3(x,y+spring+rise,z+d/2+.001));k.line(g,c.getPoints(32).map(v=>v.toArray()),.0028,p.edge);for(let j=0;j<=8;j++){const v=c.getPoint(j/8),n=c.getTangent(j/8);k.beam(g,v.toArray(),[v.x-n.y*.012*side,v.y+n.x*.012*side,v.z],.0006,p.joint,4);}}
 return a;
}
function shallowBand(k,g,p,w,x,y,z){
 k.box(g,w,.026,.003,p.edge,x,y,z);for(const dy of [-.014,.014])k.box(g,w+.004,.0016,.005,p.joint,x,y+dy,z);
 // Small stone-relief strokes suggest the carved band without inventing a readable inscription.
 for(let i=0,n=Math.round(w/.014);i<n;i++){const xx=x+(i/n-.5)*w+.005;const a=[[-.003,-.006],[.002,-.008],[.004,-.003],[.002,.002],[.004,.009]];k.line(g,a.map(([dx,dy])=>[xx+dx,y+dy,z+.002]),.00065,p.engraving);}
}
function gate(k,g,p){
 const a=new THREE.Group();a.position.set(.14,0,.27);g.add(a);
 arch(k,a,p,{z:.065,w:.31,h:.56,d:.045,r:.087,spring:.303,rise:.172});
 arch(k,a,p,{z:-.005,w:.307,h:.55,d:.038,r:.073,spring:.205,rise:.13});
 arch(k,a,p,{z:-.080,w:.30,h:.535,d:.042,r:.063,spring:.155,rise:.116});
 for(const x of [-.135,.135])k.box(a,.040,.526,.20,p.stone,x,.288,-.005);
 k.box(a,.31,.05,.24,p.stone,0,.558,-.017);
 k.box(a,.298,.235,.004,p.weathered,0,.444,-.104);
 // Recessed canopy follows the front pointed arch, not a solid panel over the passage.
 skin(k,a,(u,v)=>{const ang=(u-.5)*Math.PI;return [Math.sin(ang)*.086,.326+Math.cos(ang)*.164,-.030+v*.075];},20,32,p.stone);
 for(let row=0;row<3;row++)for(let j=0;j<7;j++){const x=(j-3)*.021,yy=.373+row*.035;const pts=[[x-.008,yy, .058],[x-.008,yy+.014,.058],[x,yy+.025,.058],[x+.008,yy+.014,.058],[x+.008,yy,.058]];k.line(a,pts,.0009,p.edge);}
 shallowBand(k,a,p,.287,0,.533,.091);shallowBand(k,a,p,.26,0,.320,-.103);
 for(const x of [-.156,.156])k.box(a,.007,.015,.252,p.edge,x,.592,-.017);for(const z of [-.143,.106])k.box(a,.326,.015,.009,p.edge,0,.592,z);
 for(let i=0;i<8;i++)for(const z of [-.141,.104]){const x=(i/7-.5)*.30;k.box(a,.025,.024,.014,p.stone,x,.611,z);k.box(a,.014,.009,.001,p.joint,x,.613,z+(z>0?.008:-.008));}
 for(let i=1;i<=4;i++)for(const x of [-.156,.156])k.box(a,.016,.024,.025,p.stone,x,.611,.105-i*.049);
 // Four stepped returns flank the north exit while leaving its centre clear.
 for(const side of [-1,1])for(let i=0;i<6;i++){const h=.026+i*.008;k.box(a,.048,h-.024,.029,p.stone,side*(.101+i*.028),(h+.024)/2,-.15);}
 const board=k.mat('#3b5655',.95);const shp=new THREE.Shape();shp.moveTo(-.064,0);shp.quadraticCurveTo(-.056,.046,0,.078);shp.quadraticCurveTo(.056,.046,.064,0);shp.closePath();k.mesh(a,new THREE.ShapeGeometry(shp,24),board,0,.235,.018);
 for(const side of [-1,1]){k.box(a,.012,.012,.022,p.edge,side*.061,.230,.009);k.box(a,.020,.006,.025,p.edge,side*.058,.239,.009);}
}
function windowWall(k,g,p,{x,z,w,rotation=0,n=7}={}){
 const a=new THREE.Group();a.position.set(x,0,z);a.rotation.y=rotation;g.add(a);const bottom=.073,top=.241,wallTop=.31;
 k.box(a,w,.047,.036,p.stone,0,.0495,0);k.box(a,w,wallTop-top,.036,p.stone,0,(wallTop+top)/2,0);
 for(let i=0;i<=n;i++)k.box(a,.022,top-bottom,.036,p.stone,(i/n-.5)*w,(top+bottom)/2,0);
 for(let i=0;i<n;i++){const xx=((i+.5)/n-.5)*w;for(let j=0;j<5;j++)k.box(a,.0011,.145,.002,p.iron,xx+(j-2)*w/n*.16,.151,.001);k.box(a,w/n-.024,.0016,.002,p.iron,xx,.128,.002);}
 k.box(a,w+.01,.008,.045,p.edge,0,.314,0);
}
function niche(k,g,p,x,z,r=.035){
 const a=new THREE.Group();a.position.set(x,0,z);g.add(a);arch(k,a,p,{w:r*2+.024,h:.205,y:.059,d:.012,r,spring:.088,rise:.051});k.box(a,r*2+.026,.205,.014,p.recess,0,.161,-.015);shallowBand(k,a,p,r*2+.017,0,.258,.008);
}
function prayerHall(k,g,p){
 const x=-.27,z=-.025,w=.50,d=.59;k.box(g,w,.007,d,p.grass,x,.027,z);
 windowWall(k,g,p,{x,z:.28,w,n:7});windowWall(k,g,p,{x:-.53,z,w:d,rotation:Math.PI/2,n:6});
 k.box(g,w,.285,.034,p.stone,x,.168,-.33);
 for(let i=0;i<4;i++)niche(k,g,p,-.447+i*.125,-.309,.041);
 const side=new THREE.Group();side.position.set(-.02,0,-.025);side.rotation.y=-Math.PI/2;g.add(side);
 for(const [zz,ww]of [[-.222,.145],[.20,.19]])k.box(side,ww,.285,.034,p.stone,zz,.168,0);
 for(const xx of [-.10,.075]){arch(k,side,p,{x:xx,z:0,y:.027,w:.13,h:.285,d:.034,r:.038,spring:.12,rise:.054});}
 shallowBand(k,g,p,w, x,.278,-.309);
 for(const xx of [-.43,-.25,-.07])for(const zz of [-.20,.045]){k.box(g,.042,.006,.042,p.edge,xx,.034,zz);k.cyl(g,.019,.020,.025,p.stone,xx,.0495,zz,24);k.cyl(g,.010,.012,.205,p.stone,xx,.163,zz,24);k.cyl(g,.011,.010,.004,p.edge,xx,.267,zz,24);}
}
function mingShan(k,g,p){
 const a=new THREE.Group();a.position.set(-.245,0,-.46);g.add(a);const b=.055,w=.44,d=.17,h=.118;
 k.box(a,w+.035,.03,d+.02,p.stone,0,.040,0);k.box(a,w,.115,.018,p.red,0,b+h/2,-.071);for(const x of [-.215,.215])k.box(a,.012,.115,d,p.brick,x,b+h/2,0);
 for(const x of [-.15,-.077,.077,.15]){k.box(a,.060,.103,.007,p.red,x,.107,.014);for(let i=0;i<5;i++)k.box(a,.0014,.060,.009,p.edge,x+(i-2)*.009,.125,.020);k.box(a,.054,.002,.010,p.edge,x,.095,.021);}
 for(const x of [-.20,-.063,.063,.20]){k.cyl(a,.006,.007,h,p.edge,x,b+h/2,.073,12);k.box(a,.022,.009,.022,p.wood,x,b+h,.073);k.box(a,.029,.006,.025,p.red,x,b+h+.008,.073);}
 k.box(a,w,.015,.018,p.wood,0,b+h,.073);hip(k,a,w+.07,d+.07,.066,b+h+.012,p.tile,p.edge);k.beam(a,[-.17,.25,0],[.17,.25,0],.0025,p.edge);
 for(const side of [-1,1])k.line(a,[[side*.17,.25,0],[side*.215,.26,0],[side*.239,.279,0]],.0025,p.edge);
 for(let i=0;i<4;i++){const top=.026+(i+1)*.029/4;k.box(a,.126,top-.024,.018,p.stone,0,(top+.024)/2,.155-i*.018);}
 sign(k,a,'認主獨尊',.099,.021,0,.165,.087,{background:'#3b4331',color:'#b0a36a'});
}
function pavilion(k,g,p){
 const a=new THREE.Group();a.position.set(.385,0,-.08);g.add(a);k.box(a,.184,.024,.175,p.stone,0,.036,0);
 for(const x of [-.07,.07])for(const z of [-.06,.06])k.box(a,.011,.15,.011,p.edge,x,.123,z);
 for(const z of [-.06,.06])k.box(a,.167,.015,.019,p.edge,0,.196,z);for(const x of [-.07,.07])k.box(a,.018,.016,.15,p.edge,x,.196,0);
 hip(k,a,.218,.20,.037,.207,p.stone,p.edge);for(const x of [-.037,.037]){k.box(a,.056,.116,.014,p.stone,x,.107,0);k.box(a,.063,.010,.021,p.edge,x,.053,0);for(let j=0;j<6;j++)k.box(a,.001,.073,.001,p.engraving,x+(j-2.5)*.007,.110,.008);}
}
export function qingjing(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.73,.70);p.stone=stone(k);p.stone.userData.pointedPortal=true;p.edge=k.mat('#b5b29c',.98);p.joint=k.mat('#655f50',.99);p.recess=stone(k,'#939580');p.weathered=stone(k,'#777c6c');p.engraving=k.mat('#7c7c69',.99);p.iron=k.mat('#595b51',.9);p.tile=k.mat('#a77851',.95);p.grass=k.mat('#6d8050',1);p.grass.userData.landscape=true;
 k.box(g,1.14,.008,1.18,p.stone,0,.020,-.015);gate(k,g,p);prayerHall(k,g,p);mingShan(k,g,p);pavilion(k,g,p);
 k.box(g,.26,.13,.024,p.stone,.405,.090,.28);sign(k,g,'清净寺',.055,.023,.415,.122,.294,{background:'#4e665f',color:'#e8e0c4'});
 for(const [x,z]of [[.39,-.39],[.51,.15]]){k.cyl(g,.033,.025,.036,p.joint,x,.042,z,16);for(let i=0;i<14;i++){const a=i*TAU/14;k.line(g,[[x,.064,z],[x+Math.sin(a)*.026,.102,z+Math.cos(a)*.026],[x+Math.sin(a)*.064,.078,z+Math.cos(a)*.064]],.0022,p.leaf);}}
 g.traverse(o=>{if(o.material&&!o.material.userData.landscape)o.material.userData.qingjingStructure=true;if(o.material?.map&&o.geometry&&!o.geometry.attributes.uv)o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(o.geometry.attributes.position.count*2),2));});
 return finish(k,g,{lamps:[[-.48,.025,.42],[.38,.025,.43],[.36,.025,-.30],[-.45,.025,-.42]],visitors:[[.11,.025,.43],[.22,.025,.45],[.23,.025,-.20],[-.16,.025,-.38]]});
}
