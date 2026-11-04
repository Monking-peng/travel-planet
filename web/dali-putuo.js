import * as THREE from 'three';
import {palette,site,sea,roof,lit,lattice,finish,TAU} from './dali-kit.js';

export function putuo(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.72,.62);sea(k,g,p,.71,.61);
 const rock=k.mat('#858477',.99),stone=k.mat('#aaa99b',.98),mortar=k.mat('#77796d',.99),blue=k.mat('#617787',.95),cream=k.mat('#d0cab2',.97),red=lit(k,'#864633',.12),wood=k.mat('#3c3c32',.98),tile=k.mat('#74776d',.97),warm=lit(k,'#d0b58a',.50);
 const rp={...p,tile,pale:cream};
 const island=(rx,rz,x,z,top)=>{const positions=[],indices=[],N=96;for(let j=0;j<3;j++)for(let i=0;i<=N;i++){const a=i/N*TAU,r=1+.035*Math.sin(a*7)+.028*Math.sin(a*11),scale=j===0?1.09:j===1?1:.90;positions.push(x+Math.cos(a)*rx*r*scale,j===0?.027:j===1?top*.77:top,z+Math.sin(a)*rz*r*scale);}for(let j=0;j<2;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;indices.push(a,b,a+1,a+1,b,b+1);}const center=positions.length/3;positions.push(x,top,z);for(let i=0;i<N;i++)indices.push(center,2*(N+1)+i+1,2*(N+1)+i);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return k.mesh(g,geo,rock);};
 island(.335,.248,-.075,-.012,.156);island(.245,.14,.27,.08,.054);
 // Broken limestone edges and the low landing replace the circular concrete-looking drum.
 for(let i=0;i<64;i++){const a=i/64*TAU,x=-.075+Math.cos(a)*.335,z=-.012+Math.sin(a)*.248;const o=k.mesh(g,new THREE.DodecahedronGeometry(.027,0),i%3?rock:stone,x,.049+(i%3)*.019,z);o.scale.set(1.3,.8+Math.sin(i*4)**2,1.05);o.rotation.set(i*.5,i*.7,i*.2);}
 for(let j=0;j<4;j++)for(let i=0;i<16;i++){const a=.16+(i+(j%2)*.5)/16*2.73,x=-.075+Math.cos(a)*.31,z=-.012+Math.sin(a)*.234;const b=k.mesh(g,new THREE.DodecahedronGeometry(.021,0),i%4?stone:rock,x,.060+j*.023,z);b.scale.set(1.42,.65,1);b.rotation.y=-a;}
 k.box(g,.31,.008,.16,stone,.29,.058,.08);
 // A short shore stair reaches a clear opening in the upper stone parapet.
 for(let j=0;j<8;j++){const x=.355-j*.022,top=.062+(j+1)*.012;k.box(g,.023,top-.035,.075,stone,x,.035+(top-.035)/2,.154);}
 k.box(g,.096,.009,.075,stone,.15,.1535,.154);
 const panel=(x,z,a)=>{const face=new THREE.Group();face.position.set(x,.157,z);face.rotation.y=a;g.add(face);const shape=new THREE.Shape();shape.moveTo(-.024,0);shape.lineTo(.024,0);shape.lineTo(.024,.048);shape.lineTo(-.024,.048);shape.closePath();const hole=new THREE.Path();hole.absellipse(0,.025,.012,.009,0,TAU,true);shape.holes.push(hole);k.mesh(face,new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:false,curveSegments:16}),stone,0,0,-.004);k.box(face,.052,.006,.013,stone,0,.051,0);for(const xx of [-.025,.025]){k.box(face,.006,.057,.012,stone,xx,.028,0);k.ball(face,.005,stone,xx,.059,0);}};
 for(let i=0;i<10;i++){const a=.61+(i/9)*2.25;panel(-.075+Math.cos(a)*.302,-.012+Math.sin(a)*.223,-a+Math.PI/2);}
 const temple=new THREE.Group();temple.position.set(-.085,.156,-.045);temple.scale.y=.78;g.add(temple);
 // Lower shrine: actual open front, side-wall medallions and blue-white painted plaster.
 k.box(temple,.29,.014,.25,stone,0,.007,0);k.box(temple,.29,.18,.018,blue,0,.104,-.116);
 for(const s of [-1,1]){k.box(temple,.018,.18,.23,p.wall,s*.136,.104,0);k.box(temple,.022,.017,.25,blue,s*.136,.186,0);k.box(temple,.024,.010,.25,cream,s*.136,.030,0);
  const face=new THREE.Group();face.position.x=s*.146;face.rotation.y=s*Math.PI/2;temple.add(face);k.box(face,.205,.135,.002,blue,0,.110,0);k.box(face,.183,.119,.003,cream,0,.110,.002);const disk=k.mesh(face,new THREE.CircleGeometry(.047,40),blue,0,.110,.005);disk.scale.x=.72;const rim=k.mesh(face,new THREE.TorusGeometry(.048,.0025,6,40),stone,0,.110,.006);rim.scale.x=.72;
  // A small hand-built landscape medallion suggests the painted panel without redistributing a photograph.
  k.line(face,[[-.018,.084,.008],[.006,.092,.008],[-.006,.108,.008],[.020,.121,.008],[.008,.137,.008]],.002,cream);for(const y of [.075,.145])k.box(face,.18,.003,.005,stone,0,y,.005);
 }
 for(const x of [-.118,.118]){k.cyl(temple,.006,.008,.19,red,x,.108,.104,10);k.box(temple,.024,.023,.026,stone,x,.024,.104);for(let j=0;j<3;j++)k.box(temple,.016+j*.010,.005,.025+j*.012,j%2?cream:blue,x,.180+j*.007,.104);}
 for(const x of [-.091,.091]){k.box(temple,.046,.155,.008,wood,x,.099,.081);lattice(k,temple,x,.099,.086,.039,.143,p.wood);}k.box(temple,.24,.024,.022,blue,0,.201,.102);k.box(temple,.22,.003,.026,cream,0,.194,.103);k.box(temple,.18,.002,.003,warm,0,.209,.095);
 roof(k,temple,rp,.43,.37,.075,.218,0,-.008);
 // Upper storey has pale blue panels, red corner pilasters and dark timber windows.
 k.box(temple,.215,.154,.19,blue,0,.325,-.02);for(const s of [-1,1])for(const z of [-.107,.067]){k.box(temple,.022,.147,.012,red,s*.098,.325,z);k.box(temple,.009,.142,.014,cream,s*.084,.325,z);}
 for(const side of [-1,1]){const face=new THREE.Group();face.position.z=-.02;face.rotation.y=side<0?Math.PI:0;temple.add(face);for(const x of [-.059,.059]){k.box(face,.048,.109,.005,cream,x,.329,.097);k.box(face,.041,.101,.006,wood,x,.329,.101);lattice(k,face,x,.329,.105,.036,.094,p.wood);}k.box(face,.047,.122,.007,wood,0,.319,.102);k.box(face,.214,.015,.017,blue,0,.404,.103);}
 for(const s of [-1,1]){const face=new THREE.Group();face.position.set(s*.109,0,-.02);face.rotation.y=s*Math.PI/2;temple.add(face);const med=k.mesh(face,new THREE.CircleGeometry(.026,32),cream,0,.329,.003);med.scale.x=.8;const rim=k.mesh(face,new THREE.TorusGeometry(.027,.002,6,32),red,0,.329,.004);rim.scale.x=.8;}
 roof(k,temple,rp,.34,.31,.078,.420,0,-.02);
 for(const [w,d,y]of [[.43,.37,.218],[.34,.31,.420]]){for(const side of [-1,1])for(const s of [-1,1]){const x=s*w*.37,z=-.02+side*d*.28;k.line(temple,[[x,y+.031,z],[x+s*.018,y+.049,z+side*.012],[x+s*.020,y+.071,z+side*.016],[x+s*.009,y+.079,z+side*.014]],.003,stone);k.ball(temple,.005,stone,x+s*.010,y+.081,z+side*.014);}
  for(const side of [-1,1]){const shape=new THREE.Shape();shape.moveTo(-w*.18,y+.050);shape.lineTo(0,y+.091);shape.lineTo(w*.18,y+.050);shape.closePath();const face=k.mesh(temple,new THREE.ShapeGeometry(shape),cream,0,0,-.02+side*d*.09);if(side<0)face.rotation.y=Math.PI;k.line(temple,[[-w*.18,y+.052,-.02+side*d*.09],[0,y+.093,-.02+side*d*.09],[w*.18,y+.052,-.02+side*d*.09]],.003,stone);}
 }
 k.cyl(temple,.005,.007,.021,stone,0,.507,-.02,10);
 for(let i=0;i<3;i++){k.ball(temple,.009-i*.002,stone,0,.520+i*.016,-.02);k.cyl(temple,.002,.004,.014,wood,0,.530+i*.016,-.02,8);}k.cyl(temple,.001,.003,.018,stone,0,.572,-.02,8);
 // Two distinctive island trees: branching old trunk to the left and a leafy wind-shaped tree behind.
 const tree=(x,z,h,leafy)=>{const root=new THREE.Vector3(x,.154,z);k.beam(g,root.toArray(),[x+.017,.154+h*.70,z-.008],.009,p.wood,8);for(let i=0;i<8;i++){const a=i*2.399,y=.154+h*(.45+.035*i),end=[x+Math.sin(a)*h*.35,y+h*.25,z+Math.cos(a)*h*.28];k.line(g,[[x+.012,y-.03,z],[x+Math.sin(a)*h*.14,y+.012,z+Math.cos(a)*h*.10],end],.0038,p.wood);for(let j=0;j<3;j++){const t=a+j*.8;k.line(g,[end,[end[0]+Math.sin(t)*.04,end[1]+.028,end[2]+Math.cos(t)*.035]],.0015,p.wood);}if(leafy||i%3===0){const crown=k.ball(g,leafy?.044:.024,p.leaf,...end);crown.scale.set(1.4,.55,.8);}}};
 tree(-.31,-.06,.34,false);tree(.12,-.13,.31,true);
 for(let i=0;i<4;i++){const x=.23+i*.067;k.cyl(g,.009,.007,.013,stone,x,.069,-.015,8);k.cyl(g,.0016,.002,.025,p.wood,x,.087,-.015,6);k.ball(g,.014,p.leaf,x,.106,-.015);}
 for(let i=0;i<5;i++){const x=-.43+i*.14,y=.40+Math.sin(i*2)*.04,z=.36;k.line(g,[[x-.018,y,z],[x,y-.005,z+.002],[x+.018,y,z]],.0015,p.pale);}
 return finish(k,g,{lamps:[[-.19,.156,.15],[.10,.156,.15]],visitors:[[-.04,.158,.14],[.43,.062,.10]]});
}
