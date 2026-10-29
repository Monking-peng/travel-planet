import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {addDetails,createExtraPiece} from './planet-detail.js';
import {createArchitecture} from './planet-architecture.js';
import {createLandmark} from './planet-landmarks.js';
import {createWestLakePiece} from './planet-westlake.js';

// One palette and one scale for every piece: painted miniature buildings around a lake.
const R=1.42, C={land:'#b5c8a3',grass:'#99b892',deep:'#336f60',leaf:'#5c9477',light:'#87b38c',water:'#72b9bd',ripple:'#c2e4df',sand:'#ede2c7',ivory:'#fff0d9',stone:'#c6c7af',clay:'#c77f64',roof:'#52756a',glass:'#589597',glassLight:'#93c4c3',ink:'#345c58',gold:'#cfaa68',wood:'#a47b58',road:'#d1d1bb'};
const N=new THREE.Vector3(0,.75,1).normalize(),U=new THREE.Vector3(1,0,0),V=new THREE.Vector3().crossVectors(N,U),UP=new THREE.Vector3(0,1,0);
function material(color){const glass=color===C.glass||color===C.glassLight;return new THREE.MeshStandardMaterial({color,roughness:glass?.24:color===C.gold?.32:.78,metalness:glass?.12:color===C.gold?.48:0});}
function mesh(geometry,color){const m=new THREE.Mesh(geometry,material(color));m.castShadow=true;m.receiveShadow=true;return m;}
function orb(r,color,scale=[1,1,1]){const m=mesh(new THREE.SphereGeometry(r,20,12),color);m.scale.set(...scale);return m;}
function box(w,h,d,color,r=.012){return mesh(r<=.004||Math.min(w,h,d)<.028?new THREE.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),color);}
function cyl(rt,rb,h,color,s=12){return mesh(new THREE.CylinderGeometry(rt,rb,h,s),color);}
function put(g,o,x=0,y=0,z=0){o.position.set(x,y,z);g.add(o);return o;}
function surface(x,y,r=R){return N.clone().multiplyScalar(Math.sqrt(Math.max(.01,r*r-x*x-y*y))).addScaledVector(U,x).addScaledVector(V,y);}
function plant(o,x,y,height=0){const p=surface(x,y,R+height);o.position.copy(p);o.quaternion.setFromUnitVectors(UP,p.clone().normalize());return o;}
function line(points,color,r=.008){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(8,points.length*3),r,5,false),color);}
function path(points,color,r=.008,height=.025){return line(points.map(([x,y])=>surface(x,y,R+height)),color,r);}
function patch(rx,ry,cx,cy,color,height=.008){
  const vertices=[],indices=[],segments=64,rings=7;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2,q=j/rings,w=1+.05*Math.sin(t*3)+.025*Math.cos(t*5);vertices.push(...surface(cx+Math.cos(t)*rx*q*w,cy+Math.sin(t)*ry*q*w,R+height).toArray());}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const normals=[];for(let i=0;i<vertices.length;i+=3){const len=Math.hypot(vertices[i],vertices[i+1],vertices[i+2]);normals.push(vertices[i]/len,vertices[i+1]/len,vertices[i+2]/len);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setIndex(indices);return mesh(g,color);
}
function tree(s=1,tone=0){const g=new THREE.Group();g.userData.vegetation=true;put(g,cyl(.015,.022,.19,C.wood,7),0,.09);put(g,orb(.10,tone?C.deep:C.leaf,[.92,1.32,.92]),0,.23);put(g,orb(.07,C.light),-.043,.27,.02);g.scale.setScalar(s);return g;}
function pine(s=1){const g=new THREE.Group();g.userData.vegetation=true;put(g,cyl(.012,.018,.22,C.wood,6),0,.1);for(let i=0;i<3;i++)put(g,cyl(.018,.11-i*.024,.18,i%2?C.leaf:C.deep,8),0,.17+i*.085);g.scale.setScalar(s);return g;}
function plaza(w,d){return put(new THREE.Group(),box(w,.035,d,C.sand,.018),0,.018).parent;}
function windows(g,w,h,d,rows=4,cols=3){for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const x=-w*.34+col*w*.68/Math.max(1,cols-1),y=.07+row*(h-.12)/Math.max(1,rows-1);put(g,box(w*.14,.035,.012,row%3===0?C.gold:C.ink,.003),x,y,d/2+.003);}}
function bridge(){
  const g=new THREE.Group(),s=new THREE.Shape();s.moveTo(-.34,0);s.lineTo(-.34,.10);s.quadraticCurveTo(0,.30,.34,.10);s.lineTo(.34,0);s.lineTo(.22,0);s.quadraticCurveTo(0,.20,-.22,0);s.closePath();
  put(g,mesh(new THREE.ExtrudeGeometry(s,{depth:.17,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008,curveSegments:14}),C.ivory),0,0,-.085);
  for(const z of [-.09,.09]){const pts=[];for(let i=0;i<=8;i++){const x=-.33+i*.0825,y=.11+.095*(1-(x/.34)**2);put(g,cyl(.009,.012,.07,C.stone,6),x,y+.023,z);pts.push(new THREE.Vector3(x,y+.065,z));}g.add(line(pts,C.ivory,.012));}
  g.userData.placeId='duanqiao';return g;
}
function pagoda(){const g=plaza(.36,.36);for(let i=0;i<5;i++){const r=.135-i*.015,y=.085+i*.105;put(g,cyl(r,r,.09,C.ivory,8),0,y);put(g,cyl(r*.63,r*1.38,.045,C.roof,8),0,y+.059);for(let k=0;k<8;k++){const a=k*Math.PI/4;const w=put(g,box(.022,.045,.009,C.wood,.003),Math.sin(a)*(r-.001),y,Math.cos(a)*(r-.001));w.rotation.y=a;}}put(g,cyl(0,.025,.11,C.gold,8),0,.63);g.userData.placeId='leifeng';return g;}
function pavilion(){const g=plaza(.3,.28);for(const x of [-.095,.095])for(const z of [-.085,.085])put(g,cyl(.011,.013,.19,C.clay,6),x,.12,z);put(g,box(.22,.035,.2,C.ivory),0,.21);const roof=put(g,cyl(.025,.225,.11,C.roof,4),0,.27);roof.rotation.y=Math.PI/4;put(g,orb(.019,C.gold),0,.34);return g;}
function towers(){const g=new THREE.Group();for(const [x,z] of [[-.12,0],[.09,-.065],[.055,.12]]){const t=new THREE.Group();put(t,cyl(.036,.045,.04,C.stone),0,.02);put(t,orb(.035,C.ivory,[1,1.2,1]),0,.066);put(t,cyl(.008,.05,.035,C.stone,8),0,.108);put(t,orb(.009,C.gold),0,.134);put(g,t,x,0,z);}return g;}
function mountains(){const g=new THREE.Group();[[-.16,.0,.22,.29],[.08,-.07,.21,.40],[.27,.04,.16,.23]].forEach(([x,z,w,h],i)=>{put(g,orb(1,i===1?'#739a7c':'#92b38b',[w,h,w*.8]),x,.04,z);});put(g,pine(.8),-.24,.08,.15);put(g,tree(.55),.25,.02,.14);return g;}
function tea(){
  const g=plaza(.44,.34),tones=['#577f5c','#608863','#527c59','#658b63'];
  // Low continuous hedges keep open picking aisles between planted rows.
  for(let row=0;row<4;row++){
    const z=-.116+row*.070,base=new THREE.Color(tones[row]),light=new THREE.Color('#8da970'),shade=new THREE.Color('#466e50');
    put(g,box(.404,.006,.055,'#908369',.002),0,.038,z);
    const surface=(u,a,lift=0)=>{
      const end=Math.max(0,(Math.abs(u)-.86)/.14),cap=Math.sqrt(Math.max(.0025,1-end*end));
      const wave=1+.075*Math.sin(u*37+row*.7)+.035*Math.sin(u*71+row);
      return new THREE.Vector3(u*.192,.055+Math.cos(a)*(.028*cap*wave+lift),z+.003*Math.sin(u*4+row*.8)+Math.sin(a)*(.026*cap+lift));
    };
    const positions=[],colors=[],indices=[],columns=13,segments=28;
    for(let j=0;j<=segments;j++)for(let k=0;k<columns;k++){
      const u=-1+j*2/segments,a=k*Math.PI/6,tone=base.clone().lerp(Math.cos(a)>0?light:shade,Math.abs(Math.cos(a))*.20+.025*Math.sin(u*23+row));
      positions.push(...surface(u,a).toArray());colors.push(...tone.toArray());
    }
    for(let j=0;j<segments;j++)for(let k=0;k<12;k++){const a=j*columns+k,b=a+columns;indices.push(a,a+1,b,a+1,b+1,b);}
    for(const end of [0,segments]){
      const center=positions.length/3;positions.push((end?1:-1)*.192,.055,z+.003*Math.sin((end?1:-1)*4+row*.8));colors.push(...base.toArray());
      for(let k=0;k<12;k++){const a=end*columns+k;indices.push(...(end?[center,a,a+1]:[center,a+1,a]));}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const normals=geometry.attributes.normal;
    for(let j=0;j<=segments;j++){const a=j*columns,b=a+12,n=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);}
    const hedge=mesh(geometry,'#ffffff');hedge.name='tea-hedge-row';hedge.material.vertexColors=true;g.add(hedge);
    const leaves=[],leafColors=[],leafIndices=[];
    for(let j=0;j<17;j++)for(let k=0;k<3;k++){
      const u=-.83+j*.103+(k-1)*.012,a=(k-1)*.58+.13*Math.sin(j*2+row),length=.030+.005*Math.sin(j+row),start=leaves.length/3;
      const tone=base.clone().lerp(light,.30+.12*Math.sin(j*1.7+k+row));
      for(const [du,da] of [[-length,0],[0,.07],[length,0],[0,-.07]]){leaves.push(...surface(u+du,a+da,.0014).toArray());leafColors.push(...tone.toArray());}
      leafIndices.push(start,start+1,start+2,start,start+2,start+3);
    }
    const leafGeometry=new THREE.BufferGeometry();leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute(leaves,3));leafGeometry.setAttribute('color',new THREE.Float32BufferAttribute(leafColors,3));leafGeometry.setIndex(leafIndices);leafGeometry.computeVertexNormals();
    const tips=mesh(leafGeometry,'#ffffff');tips.name='tea-leaf-tips';tips.material.vertexColors=true;tips.material.side=THREE.DoubleSide;g.add(tips);
  }
  put(g,tree(.65),.2,.02,-.12);return g;
}
function bamboo(){const g=new THREE.Group();for(let i=0;i<7;i++){const x=Math.sin(i*2.4)*.13,z=Math.cos(i*2.4)*.11,h=.22+(i%3)*.075;put(g,cyl(.009,.012,h,C.deep,6),x,h/2,z);for(let j=0;j<3;j++){const leaf=put(g,orb(1,j%2?C.leaf:C.light,[.065,.025,.018]),x+(j%2?-.03:.03),h*.45+j*.07,z);leaf.rotation.z=j%2?-.4:.4;}}return g;}
function boat(){const g=new THREE.Group();put(g,orb(1,C.clay,[.15,.04,.065]),0,.035);put(g,box(.16,.018,.075,C.ivory),0,.065);put(g,cyl(.006,.008,.23,C.wood,6),0,.16);const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(0,.2);shape.lineTo(.125,.02);shape.closePath();const sail=mesh(new THREE.ExtrudeGeometry(shape,{depth:.005,bevelEnabled:false}),C.ivory);put(g,sail,.01,.08);g.rotation.y=-.35;return g;}
function twinTowers(){
  const g=plaza(.53,.37);
  [[-.13,0,.68,.18],[.12,-.045,.9,.19]].forEach(([x,z,h,w])=>{const tower=new THREE.Group();put(tower,box(w,h,.18,C.glass,.022),0,h/2+.035);put(tower,box(w*.84,.025,.155,C.ivory),0,h+.043);for(let i=1;i<=9;i++)put(tower,box(w+.008,.011,.188,C.glassLight,.003),0,.045+i*(h-.025)/9);for(const dx of [-w*.35,0,w*.35])put(tower,box(.009,h-.045,.188,C.ivory,.002),dx,h/2+.025);put(tower,box(.04,.075,.04,C.ink),.035,h+.085);put(g,tower,x,0,z);});
  put(g,tree(.65),.24,.02,.11);put(g,box(.22,.07,.14,C.ivory),0,.07,.13);return g;
}
function apartments(){const g=plaza(.45,.34);[[-.12,.34,.19,C.ivory],[.085,.47,.2,C.clay]].forEach(([x,h,w,c])=>{const b=new THREE.Group();put(b,box(w,h,.21,c),0,h/2+.03);put(b,box(w+.025,.028,.23,C.ivory),0,h+.04);windows(b,w,h,.21,4,2);for(let i=1;i<4;i++)put(b,box(w+.025,.024,.07,C.sand),0,.08+i*.08,.13);put(b,box(.11,.035,.12,C.grass),0,h+.07);put(g,b,x,0);});put(g,tree(.65),-.21,.02,.08);return g;}
function cafe(){const g=plaza(.44,.38);put(g,box(.31,.19,.24,C.ivory),0,.13,-.025);put(g,box(.35,.055,.28,C.clay),0,.25,-.025);put(g,box(.20,.11,.01,C.ink),-.025,.125,.1);put(g,box(.055,.125,.012,C.wood),.105,.11,.1);for(let i=0;i<7;i++){const awning=put(g,box(.045,.025,.1,i%2?C.ivory:C.clay,.004),-.135+i*.045,.205,.135);awning.rotation.x=.18;}put(g,box(.13,.035,.015,C.deep),0,.28,.125);for(const x of [-.11,.1]){put(g,cyl(.05,.05,.018,C.gold,10),x,.07,.23);put(g,cyl(.007,.009,.06,C.wood,6),x,.035,.23);put(g,box(.035,.02,.035,C.clay),x+.055,.035,.22);}put(g,tree(.7),-.22,0,-.08);return g;}
function gallery(){const g=plaza(.43,.36);put(g,cyl(.15,.17,.16,C.ivory,24),0,.11);put(g,cyl(.165,.165,.032,C.glassLight,24),0,.16);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const petal=put(g,orb(1,C.ivory,[.075,.20,.045]),Math.sin(a)*.09,.23,Math.cos(a)*.09);petal.rotation.set(Math.cos(a)*.58,0,-Math.sin(a)*.58);}put(g,cyl(.05,.07,.05,C.gold),0,.22);return g;}
function wheel(){const g=plaza(.39,.27);for(const x of [-.1,.1]){const support=put(g,box(.022,.29,.025,C.ivory),x/2,.15,.025);support.rotation.z=x>0?.35:-.35;}put(g,mesh(new THREE.TorusGeometry(.19,.012,6,32),C.ivory),0,.32);for(let i=0;i<8;i++){const a=i*Math.PI/4;const p=new THREE.Vector3(Math.cos(a)*.19,.32+Math.sin(a)*.19,0);g.add(line([new THREE.Vector3(0,.32,0),p],C.gold,.004));put(g,box(.055,.058,.048,i%2?C.clay:C.glassLight,.009),p.x,p.y-.025,0);}put(g,orb(.026,C.gold),0,.32,.02);return g;}
function tram(){const g=plaza(.46,.20);for(const z of [-.06,.06])put(g,box(.44,.009,.009,C.wood,.002),0,.043,z);put(g,box(.33,.13,.14,C.clay,.03),0,.12);put(g,box(.32,.023,.14,C.ivory),0,.19);for(let i=0;i<5;i++){put(g,box(.041,.055,.008,C.glassLight,.005),-.12+i*.06,.135,.073);put(g,box(.041,.055,.008,C.glassLight,.005),-.12+i*.06,.135,-.073);}for(const x of [-.10,.10])for(const z of [-.065,.065]){const tire=put(g,cyl(.022,.022,.02,C.ink,10),x,.06,z);tire.rotation.x=Math.PI/2;}return g;}
const FACTORIES={bridge,pagoda,pavilion,towers,mountains,tea,bamboo,boat,twinTowers,apartments,cafe,gallery,wheel,tram};
const KIT={THREE,C,mesh,orb,box,cyl,put,line,plaza,tree,pine};
export function createPiece(id,{vegetation=false}={}){const f=FACTORIES[id];const o=createWestLakePiece(id,KIT)||createLandmark(id,KIT)||createArchitecture(id,KIT)||(f?addDetails(id,f(),KIT):createExtraPiece(id,KIT));if(id==='twinTowers')o.scale.setScalar(.85);o.name=id;o.userData.componentId=id;if(!vegetation){const plants=[];o.traverse(n=>{if(n.userData.vegetation)plants.push(n);});for(const n of plants){n.removeFromParent();n.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});}}return o;}
