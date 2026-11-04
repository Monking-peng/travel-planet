import * as THREE from 'three';
import {disc,finish} from './chengdu-kit.js';
const TAU=Math.PI*2;
function ground(x,z){const t=THREE.MathUtils.smoothstep(Math.hypot(x/1.16,z/1.08),.78,1),sag=2.15-Math.sqrt(Math.max(.001,2.15**2-x*x-z*z));return .014*(1-t)-sag*t+.002;}
function sheet(k,g,m,point,rows=24,cols=180){
 const vertices=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)vertices.push(...point(i/cols,j/rows));
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();m.side=THREE.DoubleSide;return k.mesh(g,geo,m);
}
const outline=new THREE.CatmullRomCurve3(Array.from({length:15},(_,i)=>{const wing=Math.floor(i/3),j=i%3,a=wing*TAU/5+[-.18,.18,Math.PI/5][j],r=[.65,.65,.43][j]*[1,.96,1.04,.94,1.02][wing];return new THREE.Vector3(Math.sin(a)*r*1.12,0,Math.cos(a)*r*.94);}),true,'catmullrom',.48);
function edge(a,factor=1){const q=outline.getPoint(((a/TAU+1/30)%1+1)%1);return[q.x*factor,q.z*factor];}
function inner(a){return [Math.sin(a)*.115*(.90+.35*Math.cos(a)),.025+Math.cos(a)*.15];}
function roof(a,v,offset=0){
 const e=edge(a),c=inner(a),t=Math.pow(v,1.7),r=Math.hypot(e[0]/1.12,e[1]/.94),height=.200+.147*THREE.MathUtils.smoothstep(r,.43,.64)+.012*Math.sin(a*2+.6);
 return [THREE.MathUtils.lerp(c[0],e[0],v),THREE.MathUtils.lerp(.276,height,t)+.010*Math.sin(v*Math.PI)-offset,THREE.MathUtils.lerp(c[1],e[1],v)];
}
function facade(a,t){const q=roof(a,.88,.014);return [q[0],THREE.MathUtils.lerp(.032,q[1],t),q[2]];}
export function tianfu(k){
 const g=new THREE.Group(),p={land:k.mat('#8fa580',.98),water:k.mat('#526e6b',.46,.10),roof:k.mat('#dce1dc',.74,.12),seam:k.mat('#a9b7b3',.68,.18),soffit:k.mat('#99764d',.83),edge:k.mat('#4e6864',.52,.22),stone:k.mat('#c5c9bc',.88),floor:k.mat('#ad997a',.86),wall:k.mat('#c5b89c',.82),frame:k.mat('#657875',.50,.25),glass:k.mat('#637a77',.32,.12),light:k.mat('#e3c08a',.79)};
 p.land.userData.landscape=true;p.water.userData.water=true;p.roof.userData.museumRoof=true;p.roof.userData.night={color:new THREE.Color('#e7e4ce'),intensity:.025};p.soffit.userData.night={color:new THREE.Color('#e3b77b'),intensity:.14};
 p.glass.transparent=true;p.glass.opacity=.30;p.glass.depthWrite=false;p.glass.userData.night={color:new THREE.Color('#e9c18b'),intensity:.035};p.floor.userData.night={color:new THREE.Color('#e9c18b'),intensity:.20};p.wall.userData.night={color:new THREE.Color('#e9c18b'),intensity:.45};p.light.userData.night={color:new THREE.Color('#f5cd91'),intensity:1.05};
 p.roof.userData.preserveSmooth=true;p.soffit.userData.preserveSmooth=true;
 disc(k,g,1.16,1.08,ground,p.land);
 // Flat water wraps three sides; the rear peninsula stays on dry land.
 sheet(k,g,p.water,(u,v)=>{const a=-2.57+u*5.14,c=edge(a,1.01),l=Math.hypot(c[0],c[1]),e=[c[0]/l*.87,c[1]/l*.81];return[THREE.MathUtils.lerp(c[0],e[0],v),.018,THREE.MathUtils.lerp(c[1],e[1],v)];},12,200);
 // A continuous pale promenade follows the occupied wings and rejoins the entry.
 sheet(k,g,p.stone,(u,v)=>{const a=u*TAU,q=edge(a,1.045+v*.13);return[q[0],.025,q[1]];},3,200);
 sheet(k,g,p.stone,(u,v)=>{const a=u*TAU,c=inner(a),q=edge(a,1.06);return[THREE.MathUtils.lerp(c[0],q[0],v),.028,THREE.MathUtils.lerp(c[1],q[1],v)];},16,180);
 for(const y of [.029,.143])sheet(k,g,y<.1?p.stone:p.floor,(u,v)=>{const a=u*TAU,c=inner(a),q=facade(a,0);return[THREE.MathUtils.lerp(c[0],q[0],v),y,THREE.MathUtils.lerp(c[1],q[2],v)];},12,180);
 for(let i=0;i<5;i++){
  const center=i*TAU/5;
  sheet(k,g,p.wall,(u,v)=>{const q=roof(center-.43+u*.86,.56);return[q[0],.032+v*.212,q[2]];},4,24);
  sheet(k,g,p.light,(u,v)=>roof(center-.31+u*.62,.61+v*.19,.017),5,22);
  // Separate lit exhibition walls preserve dark framing and visible interiors.
  for(const side of [-1,1]){const q=roof(center+side*.27,.65);const wall=k.box(g,.044,.076,.008,p.wall,q[0],.086,q[2]);wall.rotation.y=center;}
 }
 sheet(k,g,p.wall,(u,v)=>{const a=-Math.PI*.8+u*Math.PI*1.6,r=.055+v*.030;return[Math.sin(a)*r,.035+u*.108,.39+Math.cos(a)*r];},3,48);
 for(const radius of [.054,.086])sheet(k,g,p.wall,(u,v)=>{const a=-Math.PI*.8+u*Math.PI*1.6;return[Math.sin(a)*radius,.035+u*.108+v*.019,.39+Math.cos(a)*radius];},2,48);
 // Five broad asymmetric-looking wings surround an open sunken central court.
 sheet(k,g,p.roof,(u,v)=>roof(u*TAU,v),32,240);
 sheet(k,g,p.soffit,(u,v)=>roof(u*TAU,v,.008),32,240);
 sheet(k,g,p.edge,(u,v)=>roof(u*TAU,1,.008*v),1,240);
 for(let j=1;j<=24;j++)k.line(g,Array.from({length:181},(_,i)=>roof(i/180*TAU,j/24,-.00045)),.00042,p.seam,true);
 for(let i=0;i<45;i++){
  const a=i/45*TAU;for(let j=1;j<24;j+=3){const v=(j+(i%3))/24;if(v>=1)continue;k.line(g,[roof(a,v,-.0006),roof(a,v+.024,-.0006)],.00032,p.seam);}
 }
 // Glass volumes reach the soffit rather than leaving an unsupported roof canopy.
 sheet(k,g,p.glass,(u,v)=>facade(u*TAU,v),12,200);
 for(let i=0;i<150;i++){const a=i/150*TAU;k.beam(g,facade(a,0),facade(a,1),.00115,p.frame,5);}
 for(const y of [.145,.075])k.line(g,Array.from({length:201},(_,i)=>{const q=facade(i/200*TAU,0);return[q[0],y,q[2]];}),y>.1?.0024:.0008,p.frame,true);
 // The central roof opening has visible glazing, a lower court and a gallery ring.
 sheet(k,g,p.glass,(u,v)=>{const a=u*TAU,c=inner(a);return[c[0],.030+v*.237,c[1]];},8,96);
 for(let i=0;i<40;i++){const a=i/40*TAU,c=inner(a);k.beam(g,[c[0],.030,c[1]],[c[0],.267,c[1]],.001,p.frame,5);}
 sheet(k,g,p.stone,(u,v)=>{const c=inner(u*TAU);return[c[0]*v,.016,.025+(c[1]-.025)*v];},8,96);
 for(const a of [.50,1.76,3.02,4.28,5.54]){const q=roof(a,.64,.012);k.cyl(g,.005,.007,q[1]-.029,p.stone,q[0],(.029+q[1])/2,q[2],12);}
 // A single broad entrance apron connects the main door and the shore path.
 k.box(g,.23,.009,.40,p.stone,0,.026,-.60);
 for(let i=0;i<6;i++)k.box(g,.225,.0008,.001,p.frame,0,.031,-.59-i*.037);
 sheet(k,g,p.stone,(u,v)=>{const x=(u-.5)*.23,z=-.80-v*.25;return[x,ground(x,z)+.0145*(1-v)+.004*v,z];},24,5);
 const door=facade(0,0);for(const x of [-.033,.033]){k.box(g,.061,.105,.004,p.glass,x,.082,door[2]+.002);k.box(g,.002,.109,.006,p.frame,x,.082,door[2]+.006);}
 const rear=facade(Math.PI,0);for(const x of [-.032,.032]){k.box(g,.060,.105,.005,p.glass,x,.082,rear[2]-.002);k.box(g,.002,.109,.006,p.frame,x,.082,rear[2]-.006);}
 for(let i=0;i<5;i++){
  const a=.16+i*TAU/5,q=edge(a,1.14),lamp=k.mat('#c1a774',.7,0,'#edc891');lamp.userData.night.intensity=.75;lamp.userData.pulse={speed:.46,phase:i*1.2};k.cyl(g,.003,.004,.031,p.frame,q[0],.042,q[1],8);k.ball(g,.0045,lamp,q[0],.060,q[1]);
 }
 g.userData={openCentralCourt:true,occupiedPetalWings:true,connectedPromenade:true};return finish(k,g,{visitors:[[.06,-.73],[-.06,-.68],[.52,.39],[-.57,.12]],lamps:[]});
}
