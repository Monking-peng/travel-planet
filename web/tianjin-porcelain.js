import * as THREE from 'three';
import {palette,site,paving,steps,finish,hip,skin,lit,vase as plainVase,TAU} from './tianjin-kit.js';
function vase(...args){const o=plainVase(...args);o.geometry.setAttribute('vaseUv',o.geometry.attributes.uv.clone());return o;}
function quad(k,g,points,mat){const [a,b,c,d]=points.map(p=>new THREE.Vector3(...p));return skin(k,g,(u,v)=>a.clone().lerp(b,u).lerp(d.clone().lerp(c,u),v).toArray(),1,1,mat);}
function mosaic(k){
 const m=k.mat('#d6d5c8',.64,.04);m.userData.porcelainStone=true;
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vChip; varying vec3 vChipNormal;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvChip=position;vChipNormal=normal;');s.fragmentShader='varying vec3 vChip; varying vec3 vChipNormal;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 an=abs(vChipNormal);vec2 q=an.z>an.x&&an.z>an.y?vChip.xy:an.y>an.x?vChip.xz:vChip.zy;q*=310.;vec2 cell=floor(q),f=fract(q);float first=9.,second=9.,tone=0.;
 for(int iy=-1;iy<=1;iy++)for(int ix=-1;ix<=1;ix++){vec2 n=vec2(float(ix),float(iy));vec2 id=cell+n;vec2 rnd=fract(sin(vec2(dot(id,vec2(127.1,311.7)),dot(id,vec2(269.5,183.3))))*43758.5453);vec2 d=n+.15+.7*rnd-f;float dist=dot(d,d);if(dist<first){second=first;first=dist;tone=rnd.x;}else second=min(second,dist);}
 vec3 chip=mix(vec3(.82,.82,.74),vec3(.48,.55,.58),step(.68,tone));chip=mix(chip,vec3(.56,.40,.31),step(.98,tone));float edge=smoothstep(.012,.065,second-first);diffuseColor.rgb*=mix(vec3(.74,.73,.64),chip,edge)*1.08;`);};m.customProgramCacheKey=()=> 'porcelain-irregular-shards-v1';return m;
}
function glaze(k,red=false){const m=k.mat('#e3e0cf',.38,.08);m.onBeforeCompile=s=>{s.vertexShader='attribute vec2 vaseUv; varying vec2 vVase;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvVase=vaseUv;');s.fragmentShader='varying vec2 vVase;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 p=vec2(vVase.x*4.,vVase.y*2.);vec2 c=fract(p)-.5;float a=atan(c.y,c.x),r=length(c);float flower=1.-smoothstep(.22+.07*cos(a*5.),.27+.07*cos(a*5.),r);float vine=1.-smoothstep(.025,.055,abs(c.x-.25*sin(c.y*8.+floor(p.y))));float band=1.-smoothstep(.008,.024,min(abs(vVase.y-.10),abs(vVase.y-.76)));float ink=max(band,max(flower*.90,vine*.65));diffuseColor.rgb*=mix(vec3(1.),${red?'vec3(.55,.16,.14)':'vec3(.10,.23,.43)'},ink);`);};m.customProgramCacheKey=()=> 'porcelain-vase-floral-'+red;return m;}
function arch(w,h,Path=THREE.Shape){const s=new Path();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);s.closePath();return s;}
function shift(path,x,y){for(const c of path.curves){for(const key of ['v0','v1','v2','v3'])if(c[key]?.isVector2)c[key].add(new THREE.Vector2(x,y));if(c.isEllipseCurve){c.aX+=x;c.aY+=y;}}return path;}
function grille(k,g,p,x,y,z,w,h,arched=true){
 const frame=arched?arch(w+.009,h+.006):new THREE.Shape().moveTo(-(w+.009)/2,0).lineTo((w+.009)/2,0).lineTo((w+.009)/2,h+.006).lineTo(-(w+.009)/2,h+.006).closePath();
 const hole=arched?arch(w,h,THREE.Path):new THREE.Path().moveTo(-w/2,0).lineTo(w/2,0).lineTo(w/2,h).lineTo(-w/2,h).closePath();frame.holes.push(shift(hole,0,.003));k.mesh(g,new THREE.ExtrudeGeometry(frame,{depth:.006,bevelEnabled:false}),p.mosaic,x,y-.003,z+.002);
 k.mesh(g,arched?new THREE.ShapeGeometry(arch(w,h)):new THREE.PlaneGeometry(w,h),p.glass,x,arched?y:y+h/2,z);
 const size=.0085,dy=size*1.73;for(let row=0;row<Math.ceil(h/dy);row++)for(let col=0;col<Math.ceil(w/(size*1.5));col++){const xx=-w/2+size+col*size*1.5,yy=size+row*dy+(col%2)*dy*.5;if(xx+size>w/2||yy+size>h)continue;if(arched&&yy+size>h-w/2&&xx*xx+(yy+size-h+w/2)**2>(w/2)**2)continue;const pts=Array.from({length:6},(_,i)=>[x+xx+Math.cos(i*TAU/6)*size,y+yy+Math.sin(i*TAU/6)*size,z+.009]);k.line(g,pts,.0011,p.ivory,true);}
 k.box(g,w+.015,.004,.018,p.mosaic,x,y-.004,z+.002);
}
function plate(k,g,p,x,y,z,r=.007){k.mesh(g,new THREE.CircleGeometry(r,16),p.ivory,x,y,z);k.mesh(g,new THREE.TorusGeometry(r*.65,.00075,4,16),p.blue,x,y,z+.001);k.ball(g,r*.18,p.blue,x,y,z+.001);}
function statue(k,g,p,x,y,z,h=.047){const q=new THREE.Group();q.position.set(x,y,z);g.add(q);k.box(q,h*.55,h*.10,h*.45,p.stone,0,h*.05,0);k.cyl(q,h*.10,h*.27,h*.52,p.stone,0,h*.35,0,9);k.ball(q,h*.12,p.stone,0,h*.68,0);k.cyl(q,0,h*.11,h*.18,p.stone,0,h*.85,0,8);k.beam(q,[-h*.18,h*.53,0],[-h*.03,h*.30,h*.09],h*.05,p.stone);k.beam(q,[h*.18,h*.53,0],[h*.05,h*.30,h*.09],h*.05,p.stone);}
function cornice(k,g,p,points,y,{vases=false}={}){k.line(g,points.map(([x,z])=>[x,y,z]),.009,p.mosaic);k.line(g,points.map(([x,z])=>[x,y-.014,z-.004]),.003,p.ivory);for(let i=0;i<points.length-1;i++){const a=new THREE.Vector2(...points[i]),b=new THREE.Vector2(...points[i+1]),count=Math.max(1,Math.round(a.distanceTo(b)/.023));for(let j=0;j<count;j++){const v=a.clone().lerp(b,j/count);if(vases)vase(k,g,p.glaze,v.x,y+.006,v.y,.023,.006);else{k.beam(g,[v.x,y-.008,v.y-.009],[v.x,y-.031,v.y-.016],.004,p.ivory);}}}}
export function porcelain(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.66,.57);paving(k,g,p,.56,.48);Object.assign(p,{mosaic:mosaic(k),glaze:glaze(k),redGlaze:glaze(k,true),ivory:k.mat('#d5d2bd',.66),blue:k.mat('#476578',.50),orange:k.mat('#b65c3e',.92),glass:lit(k,'#384b4c',.025),stone:k.mat('#b3b0a0',.94)});
 // The decorated French-style villa has an open side gallery and a rounded bay, not three equal boxes.
 const core=k.mat('#b65c3e',.94);core.userData.porcelainCore=true;
 k.box(g,.48,.485,.27,core,.025,.292,-.115);k.box(g,.47,.018,.29,p.mosaic,.025,.054,-.115);
 const curved=[[-.242,-.225],[-.242,.043],[-.222,.085],[-.173,.111],[-.115,.116],[-.055,.091],[.013,.054],[.269,.054],[.269,-.225]];
 const face=curved.slice(1,-1);
 for(let level=0;level<3;level++){
  const y=.060+level*.162;
  // Narrow front segments follow the projecting bay; each window sits in front of its wall.
  for(let j=0;j<face.length-1;j++){const [ax,az]=face[j],[bx,bz]=face[j+1],w=Math.hypot(bx-ax,bz-az),q=new THREE.Group();q.position.set((ax+bx)/2,y,(az+bz)/2);q.rotation.y=-Math.atan2(bz-az,bx-ax);g.add(q);k.box(q,w,.151,.020,p.orange,0,.075,-.01);const n=Math.max(1,Math.round(w/.083));for(let i=0;i<n;i++){const x=(i+.5)*w/n-w/2;grille(k,q,p,x,.022,.003,Math.min(w/n*.73,.056),.112);}
   for(const x of [-w/2,w/2]){k.cyl(q,.005,.006,.152,p.mosaic,x,.075,.009,12);for(let h=0;h<5;h++)plate(k,q,p,x,.019+h*.027,.016,.004);}
  }
  cornice(k,g,p,curved,y+.157);for(let j=0;j<12;j++)plate(k,g,p,-.232+j*.045,y+.144,.070,.0046);
  if(level===2){k.box(g,.050,.106,.012,p.mosaic,.056,y+.076,.073);statue(k,g,p,.056,y+.026,.085,.080);}
 }
 // The open polygonal balcony projects to the left; its rail has slender ceramic balusters.
 const balcony=[[-.242,-.145],[-.398,-.145],[-.438,-.075],[-.438,.105],[-.377,.155],[-.242,.155]];
 for(const y of [.222,.384]){
  const shape=new THREE.Shape();balcony.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:false});geo.rotateX(Math.PI/2);k.mesh(g,geo,p.mosaic,0,y,0);cornice(k,g,p,balcony,y+.002);
  for(let i=1;i<balcony.length-1;i++){const [x,z]=balcony[i];k.cyl(g,.006,.009,.15,p.mosaic,x,y-.075,z,12);k.box(g,.023,.008,.025,p.ivory,x,y-.010,z);}
  for(let i=1;i<balcony.length-1;i++){const a=new THREE.Vector2(...balcony[i]),b=new THREE.Vector2(...balcony[i+1]),n=Math.ceil(a.distanceTo(b)/.021);k.line(g,[[a.x,y+.053,a.y],[b.x,y+.053,b.y]],.0035,p.mosaic);for(let j=0;j<=n;j++){const v=a.clone().lerp(b,j/n);k.cyl(g,.0025,.0035,.044,p.ivory,v.x,y+.027,v.y,8);vase(k,g,p.glaze,v.x,y+.018,v.y,.020,.004);}}
 }
 for(const xz of [[-.43,.105],[-.28,.155]])statue(k,g,p,...[xz[0],.439,xz[1]],.055);
 // Mansard-like attic, ceramic vase tiles, inset rectangular screens and an octagonal bay roof.
 const lower=[[-.245,.544,-.238],[.285,.544,-.238],[.285,.544,.067],[-.245,.544,.067]],upper=[[-.211,.646,-.199],[.248,.646,-.199],[.248,.646,.024],[-.211,.646,.024]];
 for(let i=0;i<4;i++)quad(k,g,[lower[i],lower[(i+1)%4],upper[(i+1)%4],upper[i]],p.mosaic);
 k.box(g,.459,.012,.223,p.mosaic,.0185,.651,-.0875);
 for(let j=0;j<3;j++){const x=.002+j*.083;const w=new THREE.Group();w.position.set(x,.558,.064);w.rotation.x=-.36;g.add(w);k.box(w,.068,.072,.007,p.orange,0,.036,-.003);grille(k,w,p,0,.006,.002,.052,.059,false);}
 for(let row=0;row<4;row++)for(let i=0;i<24;i++){const y=.554+row*.023,z=.068-row*.010,x=-.236+i*.022;if(x>-.04&&x<.213)continue;vase(k,g,(i+row)%9===0?p.redGlaze:p.glaze,x,y,z,.025,.0055);}
 cornice(k,g,p,[[-.245,.068],[.285,.068]],.545,{vases:true});cornice(k,g,p,[[-.211,.026],[.248,.026]],.654,{vases:true});
 const bay=new THREE.Group();bay.position.set(-.152,.0,.012);g.add(bay);const roof=[];for(let i=0;i<8;i++){const a=i*TAU/8;roof.push([Math.sin(a)*.122,.548,Math.cos(a)*.12]);}for(let i=0;i<8;i++)quad(k,bay,[roof[i],roof[(i+1)%8],[(roof[(i+1)%8][0])*.67,.656,roof[(i+1)%8][2]*.67],[roof[i][0]*.67,.656,roof[i][2]*.67]],p.mosaic);
 for(let i=0;i<20;i++){const a=i*TAU/20;vase(k,bay,p.glaze,Math.sin(a)*.083,.643,Math.cos(a)*.081,.029,.0055);}
 for(let j=0;j<3;j++)k.cyl(g,.015+j*.010,.022+j*.010,.017,p.mosaic,-.152,.709-j*.023,.012,24);k.ball(g,.020,p.mosaic,-.152,.735,.012);k.cyl(g,0,.006,.045,p.ivory,-.152,.769,.012,8);
 // Hand-shaped roof lettering and dragon outline remain attached to the roof.
 const letters=[[[.050,.080],[.027,.099],[.003,.082],[-.003,.044],[.014,.014],[.050,.025]],[[.060,.012],[.077,.115],[.068,.057],[.090,.069],[.101,.057],[.091,.010]],[[.111,.012],[.123,.060]],[[.134,.014],[.142,.061],[.149,.026],[.168,.063],[.181,.060],[.174,.013]],[[.211,.061],[.194,.053],[.190,.021],[.202,.011],[.218,.037],[.224,.061],[.218,.016],[.233,.014]]];
 for(const line of letters)k.line(g,line.map(v=>[v[0]*1.14-.035,.660+v[1],-.055]),.008,p.mosaic);k.ball(g,.007,p.mosaic,.105,.741,-.055);
 const dragon=[[.235,.762,-.06],[.285,.741,-.04],[.283,.669,-.01],[.335,.632,.013],[.345,.559,.04],[.300,.511,.05],[.35,.461,.06],[.300,.404,.08],[.355,.35,.06],[.31,.29,.07]];k.line(g,dragon,.010,p.mosaic);k.ball(g,.016,p.mosaic,.239,.762,-.06).scale.set(1.4,.7,.8);for(const x of [.23,.249])k.beam(g,[x,.770,-.06],[x-.01,.787,-.066],.002,p.ivory);k.ball(g,.002,p.blue,.239,.767,-.043);
 // Side and rear surfaces keep ceramic cornices and screened openings without invented extra wings.
 for(const [x,angle]of [[.267,Math.PI/2],[-.219,-Math.PI/2]]){const s=new THREE.Group();s.position.set(x,.06,-.10);s.rotation.y=angle;g.add(s);for(let floor=0;floor<3;floor++)for(const xx of [-.075,.035])grille(k,s,p,xx,.022+floor*.162,.004,.050,.106);}
 const rear=new THREE.Group();rear.rotation.y=Math.PI;rear.position.set(.025,.06,-.252);g.add(rear);for(let floor=0;floor<3;floor++)for(const x of [-.17,-.055,.06,.175])grille(k,rear,p,x,.023+floor*.162,.004,.052,.108);
 // Tall undulating vase boundary: a broad center crest and two low shoulders.
 const top=x=>.178+.10*Math.exp(-(((Math.abs(x)-.30)/.07)**2))+.19*Math.exp(-((x/.14)**2));
 for(const side of [-1,1])for(let i=0;i<17;i++){const x=side*(.114+i*.020),h=top(x)-.04;for(let row=0;row<4;row++)vase(k,g,(i+row)%13===0?p.redGlaze:p.glaze,x,.031+row*h/4,.326,h/4,.0097);}
 const crest=Array.from({length:121},(_,i)=>{const x=(i/120-.5)*.89;return [x,top(x),.326];});k.line(g,crest,.012,p.mosaic);
 const gate=arch(.222,.283);const hole=arch(.177,.236,THREE.Path);gate.holes.push(shift(hole,0,.002));k.mesh(g,new THREE.ExtrudeGeometry(gate,{depth:.018,bevelEnabled:false}),p.mosaic,0,.029,.318);k.line(g,Array.from({length:40},(_,i)=>{const a=i/39*Math.PI;return [Math.cos(a)*.0885,.029+.1475+Math.sin(a)*.0885,.338];}),.002,p.ivory);
 for(const x of [-.059,.059]){k.box(g,.003,.20,.004,p.wood,x,.133,.320);for(let j=0;j<5;j++)k.mesh(g,new THREE.TorusGeometry(.015,.0012,4,20),p.wood,x,.067+j*.028,.321);}
 for(const x of [-.106,.106])for(let j=0;j<14;j++)plate(k,g,p,x,.04+j*.016,.339,.0045);
 for(const x of [-.44,.44]){k.box(g,.048,.018,.05,p.stone,x,.033,.35);statue(k,g,p,x,.042,.35,.045);}statue(k,g,p,0,.375,.325,.045);
 steps(k,g,p,0,.390,.29,2,.017,.025);
 finish(k,g,{lamps:[[-.43,.023,.40],[.43,.023,.40]],visitors:[[-.21,.023,.43],[.19,.023,.43]]});
 for(const x of [-.28,.24]){const light=new THREE.SpotLight('#e6d9bc',0,.9,1.04,1,1.5);light.position.set(x,.52,.47);light.target.position.set(x*.5,.34,-.03);light.userData.nightIntensity=.034;g.add(light,light.target);}return g;
}
