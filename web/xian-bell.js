import * as THREE from 'three';
import {colors,terrace,archWall,finish} from './xian-kit.js';
import {plaque} from './wuhan-architecture.js';

function facade(k,g,p,{width,y,height,core,upper=false}){
  k.box(g,core,height-.014,core,p.wall,0,y+(height-.014)/2,0);
  for(let side=0;side<4;side++){
    const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);
    for(let bay=-1;bay<=1;bay++){
      const x=bay*core/3,w=core*.24,z=core/2+.001;
      k.box(f,w,height*.76,.004,p.dark,x,y+height*.42,z);
      // Recessed two-leaf doors, with solid carved lower panels and an upper lattice.
      for(const half of [-1,1]){
        k.box(f,w*.43,height*.29,.005,p.red,x+half*w*.24,y+height*.20,z+.003);
        k.box(f,w*.33,height*.20,.001,p.paint,x+half*w*.24,y+height*.20,z+.006);
        for(let n=0;n<4;n++)k.box(f,.0013,height*.36,.002,p.red,x+half*w*.24+(n/3-.5)*w*.34,y+height*.53,z+.005);
        for(let n=0;n<3;n++)k.box(f,w*.40,.0015,.002,p.red,x+half*w*.24,y+height*(.37+n*.16),z+.005);
      }
      for(const s of [-1,1])k.box(f,.004,height*.83,.008,p.red,x+s*w*.53,y+height*.43,z+.003);
    }
    for(const x of [-width/2,-width/6,width/6,width/2]){
      k.cyl(f,.0055,.0065,height,p.red,x,y+height/2,width/2,10);
      k.cyl(f,.008,.009,.008,p.pale,x,y+.004,width/2,10);
    }
    paintedBand(k,f,p,width,y+height-.018,width/2,.028);
    brackets(k,f,p,width,y+height+.001,width/2,17);
    if(upper){
      k.box(f,width+.014,.010,.038,p.paint,0,y-.004,width/2);
      k.box(f,width,.003,.003,p.red,0,y+.028,width/2+.014);
      k.box(f,width,.003,.003,p.red,0,y+.009,width/2+.014);
      for(let i=0;i<=24;i++)k.box(f,.0025,.029,.003,p.red,(i/24-.5)*width,y+.015,width/2+.014);
      paintedBand(k,f,p,width,y-.023,width/2+.014,.027);
    }
  }
}
function paintedBand(k,g,p,w,y,z,h){
  k.box(g,w,h,.009,p.paint,0,y,z);
  for(const s of [-1,1]){k.box(g,w,.002,.010,p.gold,0,y+s*h*.44,z+.001);k.box(g,w,.001,.011,p.green,0,y+s*h*.28,z+.002);}
  for(let i=0;i<9;i++){
    const x=(i/8-.5)*w*.92;
    const lozenge=k.mesh(g,new THREE.CircleGeometry(h*.21,4),p.gold,x,y,z+.0051);lozenge.scale.x=2.0;
    const inset=k.mesh(g,new THREE.CircleGeometry(h*.14,4),p.blue,x,y,z+.0054);inset.scale.x=2;
    if(i%2===0){k.mesh(g,new THREE.CircleGeometry(h*.07,12),p.pale,x,y,z+.0057);}
  }
}
function brackets(k,g,p,w,y,z,count){
  for(let i=0;i<count;i++){
    const x=(i/(count-1)-.5)*w;
    k.box(g,.006,.008,.010,p.red,x,y-.007,z);
    for(let j=0;j<3;j++){
      const yy=y+j*.004,zz=z+j*.004;
      k.box(g,.010+j*.004,.003,.006,p.blue,x,yy,zz);
      k.box(g,.003,.004,.016+j*.007,p.paint,x,yy+.001,zz);
      for(const s of [-1,1])k.box(g,.003,.005,.006,p.gold,x+s*(.004+j*.002),yy+.002,zz);
    }
  }
}
function tiledRoof(k,g,p,{w,y,h,inner=0}){
  const N=192,rings=22,positions=[],indices=[];
  function point(r,t,lift=0){const side=Math.floor(t*4)%4,u=(t*4)%1*2-1,a=w*.5*r;let x,z;if(side===0){x=a*u;z=a;}else if(side===1){x=a;z=-a*u;}else if(side===2){x=-a*u;z=-a;}else{x=-a;z=a*u;}
    return [x,y+h*Math.pow(1-r,1.35)+.021*Math.pow(r,5)*Math.pow(Math.abs(u),7)+lift,z];}
  for(let j=0;j<=rings;j++)for(let i=0;i<=N;i++)positions.push(...point(inner+(1-inner)*j/rings,i/N));
  for(let j=0;j<rings;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;indices.push(a,a+1,b,a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();p.tile.side=THREE.DoubleSide;k.mesh(g,geo,p.tile);
  // Narrow rounded tile ribs and transverse lap seams follow the curved roof.
  for(let i=0;i<N;i++)k.line(g,Array.from({length:9},(_,j)=>point(Math.max(inner,.045)+(1-Math.max(inner,.045))*j/8,i/N,.0007)),.00045,p.rib);
  for(let j=1;j<12;j++){const r=inner+(1-inner)*j/12;k.line(g,Array.from({length:65},(_,i)=>point(r,i/64,.0002)),.0002,p.seam,true);}
  for(let i=0;i<4;i++)k.line(g,Array.from({length:13},(_,j)=>point(inner+(1-inner)*j/12,i/4+.25,.0025)),.0024,p.ridge);
  k.line(g,Array.from({length:96},(_,i)=>point(1,i/96)),.0025,p.edge,true);
  for(let i=0;i<4;i++){const a=point(1,i/4+.25);k.cyl(g,.002,.0035,.009,p.gold,a[0],a[1]-.010,a[2],8);k.beam(g,[a[0],a[1]-.014,a[2]],[a[0],a[1]-.022,a[2]],.0006,p.gold);}
}
function base(k,g,p){
  const w=.72,h=.18,r=.06,spring=.065;
  for(let side=0;side<4;side++){
    const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);
    archWall(k,f,{w,h,d:.03,z:w/2-.015,y:.018,openings:[{r,spring,bottom:0}],mat:p.stone});
    for(let i=0;i<17;i++){const a=i/16*Math.PI;const x=Math.cos(a)*.067,yy=.018+spring+Math.sin(a)*.067;const stone=k.box(f,.010,.015,.004,p.arch,x,yy,w/2+.001);stone.rotation.z=a-Math.PI/2;}
    for(const s of [-1,1])k.box(f,.014,spring,.005,p.arch,s*.067,spring/2+.018,w/2+.001);
    k.box(f,w+.014,.010,.018,p.pale,0,.203,w/2-.002);
    k.box(f,w+.008,.003,.008,p.pale,0,.233,w/2-.003);
    for(let i=0;i<=22;i++){
      const x=(i/22-.5)*w;k.box(f,.004,.030,.006,p.pale,x,.219,w/2-.003);
      if(i<22)k.box(f,w/22-.007,.015,.003,p.pale,x+w/44,.218,w/2-.003);
    }
    // Cornice dentils beneath the stone platform.
    for(let i=0;i<36;i++)k.box(f,.009,.005,.010,p.arch,(i/35-.5)*w,.192,w/2+.001);
  }
  for(const x of [-1,1])for(const z of [-1,1])k.box(g,(w-.15)/2,h,(w-.15)/2,p.stone,x*(w+.15)/4,h/2+.018,z*(w+.15)/4);
  k.box(g,w,.012,w,p.pale,0,.202,0);
}
export function bell(k){
  const g=new THREE.Group(),p=colors(k);
  p.tile=k.mat('#2b513b',.54,.08);p.rib=k.mat('#35553c',.52,.08);p.seam=k.mat('#2b4934',.76);p.ridge=k.mat('#50714b',.49,.12);
  p.red=k.mat('#944b39',.79);p.wall=k.mat('#cec7ab',.94);p.paint=k.mat('#2e514d',.88);p.blue=k.mat('#355763',.86);p.green=k.mat('#5a7356',.86);p.gold=k.mat('#b39b60',.69,.15);p.pale=k.mat('#c9c5ad',.91);p.arch=k.mat('#b5af94',.94);p.dark=k.mat('#282e29',.94);
  p.stone.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 bellStone;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbellStone=position;');shader.fragmentShader='varying vec3 bellStone;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float course=floor(bellStone.y*120.0);
 float line=step(.085,fract(bellStone.y*120.0))*step(.045,fract((bellStone.x+bellStone.z)*52.0+mod(course,2.0)*.5));
 diffuseColor.rgb*=mix(.90,1.0,line);`);};p.stone.customProgramCacheKey=()=> 'bell-stone-v2';
  p.edge=k.mat('#9caa72',.63);p.edge.userData.night={color:new THREE.Color('#ffd697'),intensity:.35};
  for(const key of ['stone','red','wall','paint','blue','gold','pale','arch'])p[key].userData.night={color:new THREE.Color('#efbd73'),intensity:key==='stone'?.16:key==='red'?.09:key==='wall'?.17:.20};
  for(const key of ['tile','rib','ridge'])p[key].userData.night={color:new THREE.Color('#8fbd86'),intensity:.05};
  terrace(k,g,p,.56,.53);base(k,g,p);
  // Four low floral parterres follow the traffic-island corners instead of loose blocks.
  const flower=k.mat('#b4536b',.97),leaf=k.mat('#607449',.97);
  for(let corner=0;corner<4;corner++){
    const bed=new THREE.Group();bed.rotation.y=corner*Math.PI/2;g.add(bed);
    for(let row=0;row<3;row++){const pts=[];for(let i=0;i<=24;i++){const a=.20+(Math.PI/2-.40)*i/24;pts.push([Math.cos(a)*(.46+row*.011),.024,Math.sin(a)*(.44+row*.011)]);}k.line(bed,pts,row===0?.009:.0055,row===0?leaf:flower);}
  }
  facade(k,g,p,{width:.44,core:.34,y:.218,height:.134});
  tiledRoof(k,g,p,{w:.60,y:.370,h:.16,inner:.62});
  facade(k,g,p,{width:.40,core:.30,y:.452,height:.073,upper:true});
  tiledRoof(k,g,p,{w:.54,y:.545,h:.12,inner:.63});
  k.box(g,.34,.040,.34,p.paint,0,.590,0);
  for(let side=0;side<4;side++){const f=new THREE.Group();f.rotation.y=side*Math.PI/2;g.add(f);paintedBand(k,f,p,.35,.588,.176,.032);brackets(k,f,p,.35,.606,.178,15);}
  tiledRoof(k,g,p,{w:.48,y:.628,h:.105});
  k.cyl(g,.010,.026,.018,p.ridge,0,.739,0,16);k.cyl(g,.016,.020,.011,p.gold,0,.751,0,16);k.cyl(g,.011,.015,.035,p.gold,0,.774,0,12);k.ball(g,.006,p.gold,0,.794,0);
  plaque(k,g,'钟楼',.080,.028,0,.321,.177);
  const frame=new THREE.Group();frame.position.set(-.285,0,.25);for(const x of [-.032,.032])k.cyl(frame,.004,.005,.068,p.red,x,.245,0,8);k.box(frame,.083,.009,.014,p.red,0,.283,0);
  const profile=[[.013,.268],[.017,.264],[.020,.254],[.022,.235],[.025,.232],[.024,.226],[.017,.226],[.015,.254]].map(([r,y])=>new THREE.Vector2(r,y));k.mesh(frame,new THREE.LatheGeometry(profile,24),p.gold);g.add(frame);
  g.userData={roofTiers:3,crossPassages:true,outerColonnade:true};finish(k,g,p,{visitors:[[-.42,.12],[.43,.10],[.18,.46]]});
  for(const side of [-1,1]){const light=new THREE.SpotLight('#ffe0ad',0,1.5,Math.PI*.27,.8,2);light.position.set(side*.46,.18,.43);light.target.position.set(0,.42,0);light.userData.nightIntensity=.16;g.add(light,light.target);}
  return g;
}
