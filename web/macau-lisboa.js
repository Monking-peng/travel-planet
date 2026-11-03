import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {palette,site,finish,extrude,polygon,TAU} from './macau-kit.js';

// The widest petal sits below the crown. The closed profile tapers at the
// waist and steps inward above the shoulder, rather than opening like a fan.
const PROFILE=[[.43,.153],[.50,.143],[.60,.136],[.70,.142],[.78,.16],[.86,.20],[.94,.267],
 [1.05,.385],[1.072,.346],[1.15,.372],[1.172,.321],[1.24,.348],[1.262,.295],
 [1.32,.320],[1.338,.275],[1.405,.298]];
function widthAt(y){
 for(let i=1;i<PROFILE.length;i++){const a=PROFILE[i-1],b=PROFILE[i];if(y<=b[0])return THREE.MathUtils.lerp(a[1],b[1],THREE.MathUtils.clamp((y-a[0])/(b[0]-a[0]),0,1));}
 return PROFILE.at(-1)[1];
}
function depthAt(x,y){return (.112+.040*Math.sin(THREE.MathUtils.clamp((y-.43)/.975,0,1)*Math.PI))*(1-.15*(x/widthAt(y))**2);}
function clockShader(k,s){s.uniforms.lisboaTime=k.clock?.time||{value:0};s.uniforms.lisboaNight=k.clock?.night||{value:0};}
function facade(k){
 const m=k.mat('#c6ba86',.46,.35);m.userData.night={color:new THREE.Color('#eddaaa'),intensity:.28};
 m.onBeforeCompile=s=>{clockShader(k,s);s.vertexShader='varying vec3 vLisboa;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLisboa=position;');
  s.fragmentShader='uniform float lisboaTime;uniform float lisboaNight;varying vec3 vLisboa;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float row=vLisboa.y*78.;float edge=abs(fract(row)-.5);float aa=min(.18,fwidth(row)*.5);float horizontal=smoothstep(.45-aa,.49+aa,edge);
   float vertical=smoothstep(.43,.49,abs(fract(vLisboa.x*55.)-.5));
   float mechanical=step(.702,vLisboa.y)*(1.-step(.715,vLisboa.y))+step(1.175,vLisboa.y)*(1.-step(1.188,vLisboa.y));
   diffuseColor.rgb*=mix(vec3(.90,.91,.83),vec3(1.),.5+.5*sin(row*.9));
   diffuseColor.rgb*=1.-.32*horizontal-.10*vertical;diffuseColor.rgb*=1.-.56*mechanical;`);
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float pane=step(.17,fract(vLisboa.x*76.))*step(fract(vLisboa.x*76.),.82)*step(.20,fract(vLisboa.y*78.))*step(fract(vLisboa.y*78.),.76);
   float occupied=step(.82,fract(sin(dot(floor(vLisboa.xy*vec2(76.,78.)),vec2(12.98,78.23)))*43758.5));
   totalEmissiveRadiance*=lisboaNight*pane*occupied*(.75+.25*sin(lisboaTime*.32+vLisboa.y*4.));`);
 };m.customProgramCacheKey=()=> 'lisboa-curtain-wall-v2';return m;
}
function contourLight(k){
 const m=k.mat('#c2c2ac',.44,.35);m.userData.night={color:new THREE.Color('#d8deff'),intensity:1.65};
 m.onBeforeCompile=s=>{clockShader(k,s);s.vertexShader='varying vec3 vLisboa;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLisboa=position;');s.fragmentShader='uniform float lisboaTime;uniform float lisboaNight;varying vec3 vLisboa;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float wave=.5+.5*sin(vLisboa.y*3.6-lisboaTime*.38);vec3 hue=mix(vec3(.34,.52,1.),vec3(1.,.76,.38),smoothstep(.30,.85,wave));
   totalEmissiveRadiance*=lisboaNight*hue*(.78+.22*sin(lisboaTime*.45+vLisboa.y*5.));`);
 };m.customProgramCacheKey=()=> 'lisboa-petal-lights-v2';return m;
}
function podium(k,g){
 const source=new THREE.SphereGeometry(1,72,30).toNonIndexed(),a=source.attributes.position,n=source.attributes.normal;
 const pos=[],norm=[],colors=[],bary=[],tile=[];
 const shades=['#b6ac7e','#d0c89b','#e4dcb8','#bbc1ad','#a89c74','#d8cfa0','#9b956f'].map(c=>new THREE.Color(c));
 for(let i=0;i<a.count;i+=3){
  const pts=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,i+j));
  const center=pts.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).multiplyScalar(1/3);
  // Leave an actual opening in the front skin for the recessed lobby.
  if(center.y<-.82||(center.z>.44&&center.y<-.44&&Math.abs(center.x)<.19))continue;
  const band=Math.sin(Math.atan2(center.z,center.x)*7+center.y*9),rnd=(Math.sin(i*12.98)*43758.5)%1;
  const c=band<-.88&&center.y<.5?new THREE.Color('#547d80'):shades[Math.floor(Math.abs(rnd)*shades.length)].clone();
  c.multiplyScalar(.78+.22*THREE.MathUtils.smoothstep(center.y,-.9,.6));
  for(let j=0;j<3;j++){const p=pts[j];pos.push(p.x*.535,.28+p.y*.25,p.z*.36);const normal=new THREE.Vector3().fromBufferAttribute(n,i+j).divide(new THREE.Vector3(.535,.25,.36)).normalize();norm.push(...normal);colors.push(c.r,c.g,c.b);bary.push(j===0?1:0,j===1?1:0,j===2?1:0);tile.push(i/3);}
 }
 source.dispose();const geometry=new THREE.BufferGeometry();
 for(const [key,data,size]of [['position',pos,3],['normal',norm,3],['color',colors,3],['barycentric',bary,3],['tileIndex',tile,1]])geometry.setAttribute(key,new THREE.Float32BufferAttribute(data,size));
 const m=k.mat('#ffffff',.32,.42);m.vertexColors=true;m.userData.night={color:new THREE.Color('#f5e6ca'),intensity:.95};
 m.onBeforeCompile=s=>{clockShader(k,s);s.vertexShader='attribute vec3 barycentric;attribute float tileIndex;varying vec3 vBary;varying vec3 vPodium;varying float vTile;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBary=barycentric;vTile=tileIndex;vPodium=position;');s.fragmentShader='uniform float lisboaTime;uniform float lisboaNight;varying vec3 vBary;varying vec3 vPodium;varying float vTile;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 grid=smoothstep(vec3(0.),fwidth(vBary)*.95,vBary);float joint=1.-min(grid.x,min(grid.y,grid.z));diffuseColor.rgb*=1.-joint*.52;`);
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float wash=.5+.5*sin(vPodium.x*8.+vPodium.y*13.-lisboaTime*.45);
   vec3 tint=mix(vec3(.95,.66,.35),vec3(.60,.25,.76),smoothstep(.35,.80,wash));
   float sparkle=.5+.5*sin(lisboaTime*.6+vTile*2.399);
   totalEmissiveRadiance*=lisboaNight*(joint*.54+.035*sparkle)*tint;`);
 };m.customProgramCacheKey=()=> 'lisboa-triangle-glass-v2';k.mesh(g,geometry,m);
 const plinth=k.mat('#344a4c',.44,.27);const belt=k.mesh(g,new THREE.CylinderGeometry(.317,.321,.066,64,1,true,.38,TAU-.76),plinth,0,.052,0);belt.scale.z=.673;
}
function curvedSign(k,g){
 if(typeof document==='undefined')return;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='bold 81px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffffff';ctx.fillText('GRAND LISBOA',512,65,980);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const m=k.mat('#57452a',.64);m.map=tex;m.emissiveMap=tex;m.transparent=true;m.alphaTest=.1;m.userData.night={color:new THREE.Color('#fff2c9'),intensity:1.0};
 const geo=new THREE.PlaneGeometry(.48,.036,40,1),a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i),y=1.325+a.getY(i)+.04*(x/.24)**2;a.setXYZ(i,x,y,depthAt(x,y)+.008);}geo.computeVertexNormals();k.mesh(g,geo,m);
}
export function lisboa(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,p);const gold=facade(k),trim=k.mat('#a49a69',.43,.42),shadow=k.mat('#5d604f',.55,.24),light=contourLight(k);
 podium(k,g);
 const shape=new THREE.Shape();shape.moveTo(-PROFILE[0][1],PROFILE[0][0]);
 for(const [y,w]of PROFILE)shape.lineTo(w,y);
 shape.quadraticCurveTo(0,1.302,-.298,1.405);
 for(const [y,w]of PROFILE.slice(0,-1).reverse())shape.lineTo(-w,y);shape.closePath();
 const body=extrude(k,g,shape,gold,.22),original=body.geometry;body.geometry=new TessellateModifier(.035,8).modify(original);original.dispose();const positions=body.geometry.attributes.position,faceNormals=body.geometry.attributes.normal.clone();
 // Warp only depth: both front and back have a gently convex, continuous
 // curtain wall. The perimeter remains closed in side and rear views.
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),side=positions.getZ(i)/.22;positions.setZ(i,.11+(side*2-1)*depthAt(x,y));}body.geometry.computeVertexNormals();
 const normals=body.geometry.attributes.normal;
 for(let i=0;i<positions.count;i++){const face=faceNormals.getZ(i);if(Math.abs(face)<.99)continue;const x=positions.getX(i),y=positions.getY(i),e=.0002,dx=(depthAt(x+e,y)-depthAt(x-e,y))/(2*e),dy=(depthAt(x,y+e)-depthAt(x,y-e))/(2*e),n=new THREE.Vector3(-dx,-dy,Math.sign(face)).normalize();normals.setXYZ(i,n.x,n.y,n.z);}
 for(const face of [-1,1]){
  const tips=[[.382,1.048,.129,.465],[.369,1.148,.103,.47],[.345,1.238,.074,.49],[.317,1.318,.047,.74],[.294,1.399,.025,1.03]];
  for(const side of [-1,1])for(const [endX,endY,startX,startY]of tips){
   const curve=new THREE.CubicBezierCurve(new THREE.Vector2(startX,startY),new THREE.Vector2(startX*.80,startY+(endY-startY)*.68),new THREE.Vector2(endX*.73,endY-.095),new THREE.Vector2(endX,endY));
   const points=curve.getPoints(48).map(q=>[q.x*side,q.y,face*(depthAt(q.x,q.y)+.003)]);
   k.line(g,points,.0038,shadow);k.line(g,points.map(([x,y,z])=>[x,y,z+face*.0028]),.00175,light);
  }
  const outline=PROFILE.map(([y,x])=>[x,y,face*(depthAt(x,y)+.001)]);
  for(const side of [-1,1])for(let i=1;i<outline.length;i++)k.beam(g,outline[i-1].map((v,n)=>n===0?v*side:v),outline[i].map((v,n)=>n===0?v*side:v),.0018,trim);
  k.line(g,Array.from({length:49},(_,i)=>{const x=(i/48*2-1)*.298,y=1.3535+.0515*(x/.298)**2;return [x,y,face*(depthAt(x,y)+.002)];}),.0024,trim);
 }
 // Open-work crown and a visible name band finish the top, without a tall
 // generic antenna or a solid conical cap replacing the small dome.
 const crown=k.mat('#b5a58b',.48,.36);crown.userData.night={color:new THREE.Color('#c2abdd'),intensity:.40};
 for(let i=0;i<18;i++){const a=i/18*TAU;k.line(g,Array.from({length:17},(_,j)=>{const t=j/16,r=.042*Math.cos(t*Math.PI/2);return [Math.cos(a)*r,1.365+.075*t,Math.sin(a)*r];}),.001,crown);}
 for(const y of [1.385,1.41,1.43]){const t=(y-1.365)/.075;k.ring(g,.042*Math.cos(t*Math.PI/2),.001,crown,y);}
 k.cyl(g,.007,.011,.028,trim,0,1.45,0,12);for(let i=0;i<6;i++){const a=i/6*TAU;k.line(g,[[0,1.462,0],[Math.cos(a)*.012,1.49,Math.sin(a)*.012],[Math.cos(a)*.008,1.518,Math.sin(a)*.008],[0,1.54,0]],.001,crown);}
 curvedSign(k,g);
 // The ground floor is recessed behind a pointed entrance, with gold blades
 // rising against the mirrored podium instead of a black box stuck to it.
 const entrance=new THREE.Shape();entrance.moveTo(-.13,.022);entrance.lineTo(.13,.022);entrance.quadraticCurveTo(.12,.16,0,.215);entrance.quadraticCurveTo(-.12,.16,-.13,.022);
 const opening=new THREE.Path();opening.moveTo(-.08,.028);opening.lineTo(.08,.028);opening.quadraticCurveTo(.08,.105,0,.166);opening.quadraticCurveTo(-.08,.105,-.08,.028);opening.closePath();entrance.holes.push(opening);extrude(k,g,entrance,trim,.022,.347);
 for(const side of [-1,1])for(const inset of [0,.014]){const c=new THREE.QuadraticBezierCurve3(new THREE.Vector3(side*(.12-inset),.028,.361),new THREE.Vector3(side*(.11-inset),.15,.361),new THREE.Vector3(0,.202-inset,.361));k.line(g,c.getPoints(28),.0013,p.warm);}
 k.box(g,.17,.115,.012,p.dark,0,.084,.24);k.box(g,.24,.012,.12,p.pale,0,.022,.33);
 for(const x of [-.40,-.28,.28,.40]){const side=Math.sign(x),y=.20+(Math.abs(x)>.35?.075:0),z=.36*Math.sqrt(1-(x/.535)**2)+.018;polygon(k,g,[[x-side*.05,.035,z+.016],[x+side*.037,y,z-.028],[x+side*.015,.075,z+.012]],trim);k.beam(g,[x-side*.05,.035,z+.018],[x+side*.037,y,z-.026],.0025,light);}
 for(const x of [-.20,.20]){k.beam(g,[x,.026,.40],[x,.19,.40],.0015,p.steel);k.box(g,.035,.023,.001,p.red,x+.018,.176,.40);}
 finish(k,g,{lamps:[[-.52,.025,.26],[.52,.025,.26]],visitors:[[-.22,.026,.42],[-.18,.026,.44],[.19,.026,.42],[.25,.026,.39]]});
 const foyerLight=new THREE.PointLight('#ffdda3',0,.48,2);foyerLight.position.set(0,.10,.43);foyerLight.userData.nightIntensity=.012;g.add(foyerLight);return g;
}
