import * as THREE from 'three';
import {palette,site,paving,grove,sign,finish,skin,TAU,edge} from './xiamen-kit.js';

function face(k,g,points,m){const pos=[];for(let i=1;i<points.length-1;i++)pos.push(...points[0],...points[i],...points[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();m.side=THREE.DoubleSide;return k.mesh(g,geo,m);}
function tile(k){const m=k.mat('#a74932',.91,.015);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 baguaTile;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbaguaTile=position;');s.fragmentShader='varying vec3 baguaTile;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 t=vec2(baguaTile.x+baguaTile.z,baguaTile.y)*180.0;
 float joint=step(.055,fract(t.x))*step(.045,fract(t.y));
 float variation=fract(sin(dot(floor(t),vec2(12.989,78.233)))*43758.5453);
 diffuseColor.rgb*=mix(.77,.94+variation*.07,joint);`);};m.customProgramCacheKey=()=> 'bagua-red-tile-v1';return m;}
function column(k,g,p,x,y,z,h){
 k.box(g,.024,.009,.024,p.pale,x,y+.0045,z);k.cyl(g,.012,.013,.005,p.pale,x,y+.011,z,16);k.cyl(g,.0077,.010,h-.030,p.pale,x,y+h/2,z,20);k.cyl(g,.010,.008,.006,p.pale,x,y+h-.014,z,16);k.cyl(g,.013,.010,.005,p.pale,x,y+h-.0085,z,16);k.box(g,.026,.005,.026,p.pale,x,y+h-.003,z);
}
function balustrade(k,g,p,a,b,y){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),length=av.distanceTo(bv);for(const dy of [.004,.032])k.beam(g,[a[0],y+dy,a[2]],[b[0],y+dy,b[2]],.003,p.pale);const n=Math.max(2,Math.round(length/.014));for(let i=0;i<=n;i++){const q=av.clone().lerp(bv,i/n);k.cyl(g,.0018,.0018,.026,p.pale,q.x,y+.018,q.z,8);k.ball(g,.0031,p.pale,q.x,y+.018,q.z);}}
function shutter(k,g,p,x,y,z,w=.048,h=.108,rotation=0,open=false){const f=new THREE.Group();f.position.set(x,y,z);f.rotation.y=rotation;g.add(f);k.box(f,w+.008,h+.009,.006,p.pale,0,0,0);k.box(f,w,h,.007,p.glass,0,0,.002);
 for(const side of [-1,1]){const panel=new THREE.Group();panel.position.set(side*w*.25,0,.007);if(open){panel.position.x=side*w*.48;panel.rotation.y=side*.78;}f.add(panel);const pw=w*.48;k.box(panel,pw,h,.003,p.shutter);for(const x2 of [-pw/2,pw/2])k.box(panel,.002,h,.005,p.wood,x2,0,.002);for(let i=0;i<=4;i++)k.box(panel,pw,.003,.005,p.wood,0,(i/4-.5)*h,.002);for(let i=0;i<24;i++){const o=k.box(panel,pw-.004,.0018,.0036,p.slats,0,(i/24-.48)*h,.002);o.rotation.x=-.25;}}
 k.box(f,w+.014,.004,.012,p.pale,0,-h/2-.005,.002);k.box(f,w+.012,.004,.009,p.pale,0,h/2+.006,.002);
}
function cornice(k,g,p,w,d,y){for(const [h,scale,dy,mat]of [[.010,1,-.008,p.pale],[.004,1.012,0,p.shadow],[.009,1.024,.007,p.pale],[.003,1.031,.014,p.stone]])k.box(g,w*scale,h,d*scale,mat,0,y+dy,0);for(const side of [-1,1]){for(let i=0;i<38;i++)k.box(g,.008,.007,.009,p.pale,(i/37-.5)*(w-.018),y-.016,side*(d/2+.001));for(let i=0;i<28;i++)k.box(g,.009,.007,.008,p.pale,side*(w/2+.001),y-.016,(i/27-.5)*(d-.018));}}
function hipRoof(k,g,p,w,d,y,h){const out=[[-w/2,y,-d/2],[w/2,y,-d/2],[w/2,y,d/2],[-w/2,y,d/2]],inner=[[-.195,y+h,-.165],[.195,y+h,-.165],[.195,y+h,.165],[-.195,y+h,.165]];for(let i=0;i<4;i++){const j=(i+1)%4;face(k,g,[out[i],inner[i],inner[j],out[j]],p.tile);k.beam(g,out[i],inner[i],.0023,p.red);k.beam(g,out[i],out[j],.0022,p.red);}
 // Shallow dormer windows sit on each roof slope, rather than a flat red slab.
 for(const side of [-1,1]){const f=new THREE.Group();f.rotation.y=side===1?0:Math.PI;g.add(f);k.box(f,.096,.022,.022,p.pale,0,y+.021,.253);k.box(f,.076,.011,.003,p.glass,0,y+.021,.266);face(k,f,[[-.059,y+.035,.242],[.059,y+.035,.242],[0,y+.055,.242]],p.pale);face(k,f,[[-.065,y+.034,.267],[0,y+.056,.267],[0,y+.056,.225],[-.065,y+.034,.225]],p.tile);face(k,f,[[0,y+.056,.267],[.065,y+.034,.267],[.065,y+.034,.225],[0,y+.056,.225]],p.tile);}
}
function octagonalTier(k,g,p,r,y,h){const vertices=Array.from({length:8},(_,i)=>[Math.sin(Math.PI/8+i*TAU/8)*r,Math.cos(Math.PI/8+i*TAU/8)*r]);
 for(let i=0;i<8;i++){const a=vertices[i],b=vertices[(i+1)%8];face(k,g,[[a[0],y,a[1]],[a[0],y+h,a[1]],[b[0],y+h,b[1]],[b[0],y,b[1]]],p.pale);const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;shutter(k,g,p,x,y+h/2,z,.025,h*.71,Math.atan2(x,z));}
 for(let i=0;i<8;i++){const a=vertices[i],b=vertices[(i+1)%8];k.beam(g,[a[0],y+h+.023,a[1]],[b[0],y+h+.023,b[1]],.0028,p.pale);for(let j=0;j<5;j++)k.box(g,.003,.013,.003,p.pale,a[0]+(b[0]-a[0])*j/5,y+h+.017,a[1]+(b[1]-a[1])*j/5);}
 for(const [radius,yy,thick,mat]of [[r+.005,y+.001,.006,p.shadow],[r+.012,y+h+.004,.010,p.pale],[r+.015,y+h+.011,.004,p.terrace]]){const o=k.cyl(g,radius,radius,thick,mat,0,yy,0,8);o.rotation.y=Math.PI/8;}
}
function drum(k,g,p){const y=.535,h=.088,r=.126;for(let i=0;i<8;i++){const angle=i*TAU/8,f=new THREE.Group();f.position.set(Math.sin(angle)*r*Math.cos(Math.PI/8),y,Math.cos(angle)*r*Math.cos(Math.PI/8));f.rotation.y=angle;g.add(f);const w=2*r*Math.sin(Math.PI/8);
  // Three arched lights per drum face with a recessed dark interior.
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();for(const x of [-.028,0,.028]){const hole=new THREE.Path(),rr=.009;hole.moveTo(x-rr,.012);hole.lineTo(x-rr,.057);hole.absarc(x,.057,rr,Math.PI,0,true);hole.lineTo(x+rr,.012);hole.closePath();shape.holes.push(hole);const glassShape=new THREE.Shape();glassShape.moveTo(-rr,0);glassShape.lineTo(rr,0);glassShape.lineTo(rr,.045);glassShape.absarc(0,.045,rr,0,Math.PI,false);glassShape.closePath();k.mesh(f,new THREE.ShapeGeometry(glassShape),p.glass,x,.012,-.004);k.box(f,.0015,.052,.003,p.wood,x,.037,.001);}
  k.mesh(f,new THREE.ExtrudeGeometry(shape,{depth:.004,bevelEnabled:false,curveSegments:16}),p.pale);for(const x of [-w*.46,w*.46])column(k,f,p,x,.005,.005,.076);k.box(f,w+.004,.006,.016,p.pale,0,.083,.003);
 }
 for(const [radius,yy,hh]of [[.136,.532,.010],[.140,.626,.012],[.136,.635,.006]]){const o=k.cyl(g,radius,radius,hh,p.pale,0,yy,0,8);o.rotation.y=Math.PI/8;}
 const dome=(u,v)=>{const a=u*TAU,local=((a+Math.PI/8)%(Math.PI/4))-Math.PI/8,radius=.139*Math.cos(Math.PI/8)/Math.cos(local)*Math.cos(v*Math.PI/2);return [Math.sin(a)*radius,.640+Math.sin(v*Math.PI/2)*.119,Math.cos(a)*radius];};skin(k,g,dome,30,96,p.dome);
 for(let i=0;i<8;i++)k.line(g,Array.from({length:24},(_,j)=>dome((i+.5)/8,j/23)),.0016,p.rib);k.cyl(g,.004,.005,.008,p.shadow,0,.762,0,12);k.beam(g,[0,.766,0],[0,.797,0],.001,p.stone);k.ball(g,.0022,p.gold,0,.798,0);
}
export function bagua(k){const g=new THREE.Group(),p=palette(k),ground=site(k,g,.69,.59);paving(k,g,p,.55,.46);p.pale.color.set('#d6d1bc');p.brick.color.set('#a56350');p.red.color.set('#8d3f2f');p.tile=tile(k);p.dome=k.mat('#ad372b',.82,.02);p.rib=k.mat('#873727',.86);p.shadow=k.mat('#79776a',.94);p.terrace=k.mat('#b7b4a8',.94);p.shutter=k.mat('#773f31',.91);p.slats=k.mat('#824b38',.90);p.glass=edge(k,'#373b35','#e4c79c',.16);p.glass.roughness=.52;for(const m of [p.pale,p.brick])m.userData.baguaMasonry=true;
 k.box(g,.81,.055,.64,p.stone,0,.053,0);k.box(g,.835,.013,.655,p.pale,0,.084,0);
 for(const side of [-1,1])for(let i=0;i<7;i++){const x=(i/6-.5)*.73;k.box(g,.037,.022,.003,p.shadow,x,.054,side*.321);for(const xx of [-.013,0,.013])k.box(g,.0015,.022,.004,p.stone,x+xx,.054,side*.323);}
 // Inset occupied block and four porticoes leave actual depth behind the columns.
 k.box(g,.65,.281,.45,p.pale,0,.232,0);for(const x of [-.337,.337])for(const z of [-.242,.242])k.box(g,.132,.281,.145,p.brick,x,.232,z);
 for(const y of [.094,.240]){const h=.132;for(const side of [-1,1]){for(const x of [-.266,-.1596,-.0532,.0532,.1596,.266])column(k,g,p,x,y,side*.310,h);for(const z of [-.165,-.055,.055,.165])column(k,g,p,side*.399,y,z,h);
  for(let i=0;i<5;i++)shutter(k,g,p,(i-2)*.1064,y+.062,side*.227,.055,.114,side===1?0:Math.PI,i%2===1);for(const x of [-.338,.338]){shutter(k,g,p,x,y+.061,side*.317,.066,.113,side===1?0:Math.PI);for(const xx of [x-.060,x+.060])k.box(g,.009,h,.008,p.pale,xx,y+h/2,side*.318);}
  for(let i=0;i<3;i++)shutter(k,g,p,side*.327,y+.063,(i-1)*.110,.052,.111,side*Math.PI/2,i===1);for(const z of [-.246,.246])shutter(k,g,p,side*.405,y+.061,z,.071,.111,side*Math.PI/2);
  k.box(g,.542,.007,.084,p.floor||p.red,0,y-.003,side*.269);k.box(g,.073,.007,.35,p.red,side*.364,y-.003,0);
  if(y>.2){balustrade(k,g,p,[-.266,0,side*.310],[.266,0,side*.310],y);balustrade(k,g,p,[side*.399,0,-.165],[side*.399,0,.165],y);}
 }}
 cornice(k,g,p,.82,.64,.235);cornice(k,g,p,.82,.64,.383);
 for(const side of [-1,1]){for(let i=0;i<=12;i++)k.box(g,.008,.020,.008,p.pale,(i/12-.5)*.81,.413,side*.320);k.box(g,.836,.006,.010,p.pale,0,.426,side*.320);for(let i=0;i<=9;i++)k.box(g,.008,.020,.008,p.pale,side*.410,.413,(i/9-.5)*.63);k.box(g,.010,.006,.65,p.pale,side*.410,.426,0);}
 hipRoof(k,g,p,.79,.61,.400,.067);octagonalTier(k,g,p,.244,.467,.052);drum(k,g,p);
 for(let i=0;i<10;i++){const h=.061*(i+1)/10;k.box(g,.205,h,.014,p.stone,0,.021+h/2,.465-i*.014);for(const side of [-1,1])k.box(g,.014,h+.018,.014,p.pale,side*.110,.021+(h+.018)/2,.465-i*.014);}
 for(const side of [-1,1])k.beam(g,[side*.110,.050,.469],[side*.110,.104,.328],.003,p.pale);
 sign(k,g,'八卦楼',.071,.020,0,.205,.231,{background:'#d6d1bc',color:'#514c3d'});
 grove(k,g,(x,z)=>ground(x,z)+.018,[[-.53,-.29,.17],[.53,-.29,.17],[-.47,.36,.10],[.47,.36,.10]]);
 finish(k,g,{lamps:[[-.30,.024,.39],[.30,.024,.39]],visitors:[[-.19,.024,.39],[.20,.024,.42],[.05,.024,.48]]});
 for(const x of [-.28,.28]){const l=new THREE.SpotLight('#e5d9ba',0,1.15,.72,.8,2);l.position.set(x,.26,.64);l.target.position.set(x,.26,.24);l.userData.nightIntensity=.065;g.add(l,l.target);}return g;
}
