import * as THREE from 'three';
import {roof,plaque} from './wuhan-architecture.js';

function brick(k,color){
 const m=k.mat(color,.97);m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 smallBrick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsmallBrick=position;');
  s.fragmentShader='varying vec3 smallBrick;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float row=floor(smallBrick.y*180.0);float lines=step(.075,fract(smallBrick.y*180.0))*step(.035,fract((smallBrick.x+smallBrick.z)*73.0+mod(row,2.0)*.5));
 float wear=fract(sin(dot(floor(smallBrick*vec3(73.,180.,73.)),vec3(17.1,49.3,31.7)))*5718.3);
 diffuseColor.rgb*=mix(.86,1.,lines)*mix(.93,1.03,wear);`);
 };m.customProgramCacheKey=()=> 'small-goose-brick-203';return m;
}
function towerFloor(k,g,p,w,top,y,h,i){
 for(let side=0;side<4;side++){
  const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(top/2,h);shape.lineTo(-top/2,h);shape.closePath();
  const opening=side%2===0,r=i===0?.027:.011,cy=i===0?.071:h*.40,b=i===0?0:.001;
  if(opening){const a=new THREE.Path();a.moveTo(-r,b);a.lineTo(-r,cy);a.absarc(0,cy,r,Math.PI,0,true);a.lineTo(r,b);a.closePath();shape.holes.push(a);}
  k.mesh(f,new THREE.ExtrudeGeometry(shape,{depth:.014,bevelEnabled:false,curveSegments:16}),p.brick,0,y,w/2-.014);
  if(opening){
   k.box(f,r*2.1,cy+r,.003,p.dark,0,y+(cy+r)/2,w/2-.025);
   for(let j=-2;j<=2;j++)k.box(f,.0015,cy*.52,.002,p.wood,j*r*.35,y+cy*.27,w/2-.014);
   for(let j=0;j<=12;j++){const a=j/12*Math.PI;const v=k.box(f,.005,.008,.003,p.rim,Math.cos(a)*(r+.003),y+cy+Math.sin(a)*(r+.003),w/2+.0005);v.rotation.z=a-Math.PI/2;}
   if(i>=5&&i<=10)for(const sx of [-1,1])for(let step=0;step<3;step++)k.box(f,.027-step*.006,.004,.009,p.rim,sx*w*.24,y+.003+step*.004,w/2+.006);
  }
  // Paired diagonal brick teeth under the seven stepped corbel courses.
  const count=Math.max(12,Math.round(top/.010));for(let row=0;row<2;row++)for(let j=0;j<count;j++){
   const tooth=k.box(f,.006,.003,.006,p.rim,((j+.5)/count-.5)*(top+.006),y+h+.003+row*.005,top/2+.002);tooth.rotation.y=Math.PI/4;
  }
 }
 for(let j=0;j<7;j++){const ew=top+.012+j*.005;k.box(g,ew,.0036,ew,p.eave,0,y+h+.012+j*.0036,0);}
}
function temple(k,g,p,{x=0,z=0,w=.34,d=.18,h=.085}){
 const f=new THREE.Group();f.position.set(x,.014,z);g.add(f);if(w<d){[w,d]=[d,w];f.rotation.y=Math.PI/2;}
 k.box(f,w+.025,.009,d+.025,p.stone,0,.0045,0);
 const door=w*.19,side=(w*.88-door)/2;
 for(const sign of [-1,1])k.box(f,side,h,d*.70,p.wall,sign*(door+side)/2,h/2+.009,0);
 for(const sign of [-1,1])for(let i=0;i<5;i++){
  const xx=(i/4-.5)*w*.88;if(i!==2)k.cyl(f,.003,.0035,h,p.red,xx,h/2+.009,sign*d*.45,8);
  if(i===2)continue;k.box(f,w*.14,h*.75,.004,p.wood,xx,h*.42+.009,sign*d*.355);
  for(let j=-1;j<=1;j++)k.box(f,.0015,h*.60,.0015,p.red,xx+j*w*.034,h*.44+.009,sign*d*.359);
 }
 for(const sign of [-1,1])for(const side of [-1,1])k.cyl(f,.003,.0035,h,p.red,side*door/2,h/2+.009,sign*d*.45,8);
 k.box(f,w*.9,.012,.012,p.red,0,h+.006,d*.45);
 // Parallel tile courses follow each slope; side halls rotate the whole roof.
 const rw=w*1.18,rd=d*1.2,rh=.045,ry=h+.014;
 const point=(u,t,sign)=>[u*(rw/2-Math.max(0,1-t*4)*rd*.19),ry+rh*Math.pow(1-t,1.35)+.009*t**5*Math.abs(u)**7,sign*rd/2*t];
 for(const sign of [-1,1]){
  const pos=[],idx=[],nx=32,nz=16;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)pos.push(...point(i/nx*2-1,j/nz,sign));
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();p.tile.side=THREE.DoubleSide;k.mesh(f,geo,p.tile);
  for(let i=0;i<=36;i++)k.line(f,Array.from({length:13},(_,j)=>{const v=point(i/18-1,j/12,sign);v[1]+=.001;return v;}),.00065,p.ridge);
  k.line(f,Array.from({length:33},(_,i)=>point(i/16-1,1,sign)),.002,p.ridge);
 }
 k.line(f,[[-rw/2+rd*.19,ry+rh,0],[0,ry+rh+.002,0],[rw/2-rd*.19,ry+rh,0]],.003,p.ridge);
}
function grove(k,g,p,x,z,size){
 k.cyl(g,.007,.012,size*.7,p.bark,x,.014+size*.35,z,8);
 for(let i=0;i<5;i++){const a=i*Math.PI*.4,r=i===4?0:size*.32,yy=.014+size*(i===4?1.0:.77);k.beam(g,[x,size*.5,z],[x+Math.cos(a)*r,yy-.02,z+Math.sin(a)*r],.003,p.bark);const leaf=k.mesh(g,new THREE.IcosahedronGeometry(size*.40,2),i%2?p.leaf:p.leafLight,x+Math.cos(a)*r,yy,z+Math.sin(a)*r);leaf.scale.y=.8;}
}
export function smallPagoda(k){
 const first=k.materials.length,g=new THREE.Group(),p={brick:brick(k,'#a39982'),eave:brick(k,'#8f8977'),rim:brick(k,'#9a8e75'),stone:k.mat('#8c8c7f'),dark:k.mat('#333631'),wood:k.mat('#604333'),red:k.mat('#835d42'),wall:k.mat('#c4b89c'),tile:k.mat('#656d68'),ridge:k.mat('#8e9180'),bark:k.mat('#686251'),leaf:k.mat('#526c45'),leafLight:k.mat('#65784a'),path:k.mat('#b4b19d'),iron:k.mat('#535b51')};
 for(const [name,m]of Object.entries(p))m.userData.night={color:new THREE.Color(name.startsWith('leaf')?'#496246':'#e9c28c'),intensity:name==='brick'?.11:name==='eave'?.06:.045};
 const pos=[],idx=[],N=128,R=24;for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const r=j/R,a=i/N*Math.PI*2,x=.65*r*Math.cos(a),z=.76*r*Math.sin(a),sag=2.15-Math.sqrt(2.15**2-x*x-z*z);pos.push(x,.012-sag*THREE.MathUtils.smoothstep(r,.89,1),z);}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;if(j)idx.push(a,a+1,b);idx.push(a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,k.mat('#8d9d75'));
 const tower=new THREE.Group();tower.position.z=-.12;g.add(tower);k.box(tower,.50,.064,.50,p.eave,0,.046,0);k.box(tower,.51,.005,.51,p.stone,0,.0805,0);
 let y=.083;const heights=[.164,.080,.073,.067,.060,.054,.047,.041,.035,.029,.025,.022,.018];
 for(let i=0;i<13;i++){const w=.32-.175*Math.pow(i/12,1.4);towerFloor(k,tower,p,w,w-.004,y,heights[i],i);y+=heights[i]+.034;}
 // Four broken corner piers surround the open crown; no reconstructed spire.
 k.box(tower,.075,.005,.075,p.dark,0,y-.009,0);
 for(const sx of [-1,1])for(const sz of [-1,1])for(let row=0;row<5;row++){
  const w=.052-row*.006;k.box(tower,w,.005,w,p.eave,sx*.053,y+row*.005,sz*.053);
 }
 for(const s of [-1,1])for(let j=0;j<9;j++){
  k.box(tower,.0009,.028,.001,p.iron,(j/8-.5)*.084,y+.014,s*.042);k.box(tower,.001,.028,.0009,p.iron,s*.042,y+.014,(j/8-.5)*.084);
 }
 for(const s of [-1,1]){k.box(tower,.086,.001,.001,p.iron,0,y+.027,s*.042);k.box(tower,.001,.001,.086,p.iron,s*.042,y+.027,0);}
 k.cyl(tower,.0006,.0007,.062,p.iron,0,y+.025,0,8);
 // North and south stairs and low brick parapets frame the surviving entrances.
 for(const s of [-1,1]){
  for(let i=0;i<7;i++){const top=.013+(i+1)*.010; k.box(tower,.081,top-.012,.022,p.stone,0,(top+.012)/2,s*(.380-i*.020));}
  for(const x of [-.153,.153])k.box(tower,.194,.033,.012,p.eave,x,.0995,s*.244);
  k.box(tower,.012,.033,.50,p.eave,s*.244,.0995,0);
 }
 const gate=new THREE.Group();gate.position.set(0,.083,.272);tower.add(gate);
 for(const s of [-1,1]){k.box(gate,.014,.124,.018,p.stone,s*.052,.062,0);k.box(gate,.023,.012,.035,p.stone,s*.052,.006,0);}
 k.box(gate,.118,.020,.020,p.stone,0,.117,0);k.line(gate,[[-.074,.135,0],[-.065,.130,0],[.065,.130,0],[.074,.135,0]],.004,p.stone);plaque(k,gate,'万汇沾恩',.072,.013,0,.118,.0105);
 const north=new THREE.Group();north.rotation.y=Math.PI;north.position.y=.083;tower.add(north);
 for(const s of [-1,1])k.box(north,.018,.100,.035,p.brick,s*.041,.050,.174);
 k.box(north,.100,.025,.037,p.brick,0,.112,.174);roof(k,north,.132,.072,.020,.130,p.tile,p.ridge,0,.174);
 temple(k,g,p,{z:.43,w:.32,d:.17});temple(k,g,p,{z:-.59,w:.30,d:.16,h:.075});
 for(const x of [-.38,.38])temple(k,g,p,{x,z:.34,w:.13,d:.35,h:.065});
 for(let j=0;j<12;j++)k.box(g,.073,.001,.036,p.path,0,.014,.69-j*.038);
 for(const [x,z,size]of [[-.42,-.35,.19],[.40,-.35,.18],[-.43,.06,.19],[.44,.05,.17],[-.26,.54,.16],[.25,.55,.17],[-.40,-.62,.15],[.40,-.62,.15]])grove(k,g,p,x,z,size);
 const glow=k.mat('#e8ca89',.8,0,'#ffd6a0');glow.userData.night.intensity=.65;
 for(const x of [-.28,.28])for(const z of [.24,.55,-.49]){k.box(g,.015,.033,.015,p.iron,x,.029,z);k.box(g,.012,.008,.012,glow,x,.041,z);}
 for(const m of k.materials.slice(first))m.userData.smallPagodaRigid=true;
 g.userData={storeys:13,brokenCrown:true,northSouthWindows:true};return k.merge(g);
}
