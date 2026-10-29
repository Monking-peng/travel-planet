import * as THREE from 'three';
import {at,sag} from './shanghai-heritage.js';
export function parkAttractions(k,g,{border,cream,warm}){
  // Fantasia Carousel: blue concave roof, gold ribs, crown, open columns and Pegasus figures.
  const carousel=at(g,.78,.48,.032),gold=k.mat('#b9974f',.42,.38,'#edbc65'),blue=k.mat('#6c8baa',.55,.12,'#7f8fc6'),wine=k.mat('#86515d',.7,0);
  gold.userData.night.intensity=.8;blue.userData.night.intensity=.32;blue.userData.pulse={phase:1.6,speed:.5,min:.65};
  k.cyl(carousel,.157,.167,.016,border,0,.008,0,48);k.cyl(carousel,.13,.13,.009,gold,0,.022,0,48);
  const profile=[[.165,.140],[.148,.150],[.105,.177],[.071,.222],[.066,.230],[.066,.248],[.050,.273],[.015,.288]];
  k.mesh(carousel,new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),64),blue);
  for(const [r,y] of [[.166,.14],[.159,.15],[.067,.231],[.067,.248]])k.ring(carousel,r,.003,gold,y);
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8,dx=Math.sin(a),dz=Math.cos(a);
    k.cyl(carousel,.003,.004,.117,gold,dx*.137,.080,dz*.137,8);
    k.line(carousel,profile.map(([r,y])=>[dx*r,y+.001,dz*r]),.0018,gold);
    k.ball(carousel,.005,warm,dx*.157,.137,dz*.157);
    const horse=new THREE.Group();horse.position.set(dx*.098,.066,dz*.098);horse.rotation.y=a;
    const body=k.ball(horse,.010,cream);body.scale.set(.65,.8,1.6);k.beam(horse,[0,0,.008],[0,.018,.014],.004,cream);k.ball(horse,.005,cream,0,.020,.017);
    for(const x of [-.005,.005])for(const z of [-.008,.008])k.beam(horse,[x,-.004,z],[x,-.020,z+.004],.002,cream);
    for(const side of [-1,1]){const wing=k.ball(horse,.010,cream,side*.010,.008,0);wing.scale.set(1.4,.25,.65);wing.rotation.z=side*.4;}
    k.cyl(horse,.001,.001,.103,gold,0,.018,0,6);carousel.add(horse);
    const drape=k.ball(carousel,.020,wine,dx*.143,.132,dz*.143);drape.scale.set(1,.35,1);
  }
  k.cyl(carousel,.004,.009,.029,gold,0,.302,0,8);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.line(carousel,[[0,.307,0],[Math.sin(a)*.015,.321,Math.cos(a)*.015],[Math.sin(a)*.010,.335,Math.cos(a)*.010],[0,.332,0]],.002,gold);}k.ball(carousel,.005,gold,0,.341);
  // Grimshaw / WDI's canopy is a broad, open wave of inflated ETFE pillows.
  // Two rising crests and a dipped edge replace the former narrow oval tube.
  const tron=at(g,-.86,-.08,.038),fabric=k.mat('#b6cbd2',.48,.16,'#1465d8'),steel=k.mat('#aabcc2',.48,.32),cyan=k.mat('#74c4dc',.38,.16,'#228fff');
  fabric.side=THREE.DoubleSide;fabric.userData.night.intensity=.55;fabric.userData.pulse={phase:1.5,speed:.6,min:.68};
  cyan.userData.night.intensity=1.20;cyan.userData.pulse={phase:3,speed:.8,min:.48};cyan.userData.night.alternateColor=new THREE.Color('#31bcd4');
  const floor=(x,z)=>sag(-.86+x,-.08+z)-sag(-.86,-.08);
  const canopyPoint=(u,v,pillow=false)=>{
    const z=-.38+u*.77,center=.060*Math.sin(u*Math.PI*2-.4),half=.15+.065*(.5+.5*Math.cos(u*Math.PI*2-.5));
    const x=center+v*half,crest=.10+.17*Math.sin(u*Math.PI*1.75+.15)**2,arch=.09*(1-v*v),dip=.049*v*Math.sin(u*Math.PI*2+.2);
    const quilt=pillow?.006*Math.sin(u*16*Math.PI)**2*Math.sin((v+1)*3*Math.PI)**2:0;
    return [x,floor(x,z)+crest+arch+dip+quilt,z];
  };
  const vertices=[],indices=[],N=96,M=36;
  for(let i=0;i<=N;i++)for(let j=0;j<=M;j++){
    vertices.push(...canopyPoint(i/N,j/M*2-1,true));
    if(i<N&&j<M){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,a+1,b,b+1);}
  }
  const canopy=new THREE.BufferGeometry();canopy.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));canopy.setIndex(indices);canopy.computeVertexNormals();k.mesh(tron,canopy,fabric);
  for(let i=0;i<=16;i++)k.line(tron,Array.from({length:25},(_,j)=>canopyPoint(i/16,j/12-1)),.0011,steel);
  for(let j=0;j<=6;j++){const edge=j===0||j===6;k.line(tron,Array.from({length:97},(_,i)=>canopyPoint(i/96,j/3-1)),edge?.0022:.0008,edge?cyan:steel);}
  // Warm-white slender supports sit on the actual curved park ground.
  for(const u of [.04,.26,.52,.76,.97])for(const v of [-1,1]){
    const top=canopyPoint(u,v),x=top[0]+v*.018,z=top[2];
    k.beam(tron,[x,floor(x,z),z],top,.0035,steel,10);
    k.beam(tron,[x,floor(x,z)+.025,z],canopyPoint(Math.max(0,u-.065),v*.65),.0018,steel);
  }
  // Discrete pillow lights, not opaque bands painted over the roof.
  for(let i=0;i<16;i++)for(let j=0;j<6;j++){
    const point=canopyPoint((i+.5)/16,(j+.5)/3-1,true);point[1]+=.0015;k.ball(tron,.0018,cyan,...point);
  }
  const track=k.mat('#347b9d',.38,.32,'#43bbed');track.userData.night.intensity=.65;
  const rail=u=>{const a=u*Math.PI*2;return [.12*Math.cos(a)+.028*Math.sin(a*2),.079+.028*Math.sin(a*2),.32*Math.sin(a)];};
  for(const side of [-1,1])k.line(tron,Array.from({length:97},(_,i)=>{const p=rail(i/96);p[0]+=side*.008;p[1]+=floor(p[0],p[2]);return p;}),.002,track,true);
  for(let i=0;i<38;i++){const p=rail(i/38),y=p[1]+floor(p[0],p[2]);k.beam(tron,[p[0]-.014,y,p[2]],[p[0]+.014,y,p[2]],.0015,steel);}
  // Low, curved boarding hall anchors the rear edge without a separate filler block.
  const station=k.mat('#75929d',.55,.25),entry=at(g,-.86,-.48,.035);
  k.box(entry,.30,.071,.10,station,0,.035);k.box(entry,.27,.039,.002,track,0,.034,.051);k.box(entry,.32,.006,.115,steel,0,.074);
}
