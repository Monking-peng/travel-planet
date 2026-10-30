import * as THREE from 'three';
import {skin,glow,plaza,bollards,people} from './shenzhen-forms.js';

// Futian's paired cultural buildings face the same central public axis.
// The concert hall has warm gold tree columns; the library uses silver-white.
function pavilion(k,parent,library){
  const g=new THREE.Group();parent.add(g);
  g.position.set(library?-.275:.275,0,-.045);
  g.rotation.y=library?Math.PI/2:-Math.PI/2;
  const color=library?'#dce5de':'#efce8d';
  const stone=k.mat('#b0b3a4',.87),dark=k.mat('#343e42',.76,.15);
  const frame=k.mat(library?'#b5c8cb':'#8c9e9f',.42,.48);
  const roof=k.mat(library?'#78969b':'#6e8b94',.35,.40,color);roof.userData.night.intensity=library?.13:.22;
  const glass=k.mat('#88a5ad',.22,.19,color);glass.transparent=true;glass.opacity=.28;glass.depthWrite=false;glass.side=THREE.DoubleSide;glass.userData.night.intensity=.15;
  const tree=glow(k,library?'#d1d9d0':'#cda44e',library?.42:.62);
  const floor=k.mat(library?'#babcae':'#b0a17d',.87,.05,color);floor.userData.night.intensity=.13;
  const warm=glow(k,color,.72),edge=glow(k,color,.30);
  const mirror=library?1:-1;
  // A low glass entrance edge rises into three separate folded roof peaks.
  const xs=[-.18,-.065,.012,.075,.145,.18];
  const front=[.19,.105,.137,.095,.108,.083],ridge=[.285,.11,.260,.10,.220,.15];
  const point=(i,row)=>[xs[i]*mirror,row===0?front[i]:row===1?ridge[i]:.218,row===0?.156:row===1?(i===0?.13:-.025):-.190];
  function patch(a,b,c,d,material,grid=true){
    const pt=(u,v)=>a.map((n,i)=>(n*(1-u)+b[i]*u)*(1-v)+(c[i]*(1-u)+d[i]*u)*v);
    skin(k,g,pt,4,5,material);
    if(!grid)return;
    for(let row=0;row<=7;row++){const v=row/7;k.beam(g,pt(0,v),pt(1,v),.00065,frame,5);}
    for(let col=0;col<=4;col++){const u=col/4;k.beam(g,pt(u,0),pt(u,1),.00065,frame,5);}
  }
  k.box(g,.34,.010,.34,floor,0,.025,-.01);
  // The solid auditorium / reading-room mass sits behind the glazed foyer.
  k.box(g,.375,.193,.085,dark,0,.121,-.204);
  for(let j=0;j<12;j++)k.box(g,.376,.0008,.0008,frame,0,.045+j*.014,-.248);
  k.box(g,.378,.003,.087,frame,0,.219,-.204);
  for(let i=0;i<xs.length-1;i++){
    patch(point(i,0),point(i+1,0),point(i,1),point(i+1,1),roof);
    patch(point(i,1),point(i+1,1),point(i,2),point(i+1,2),roof);
    const a=point(i,0),b=point(i+1,0);
    patch([a[0],.031,a[2]],[b[0],.031,b[2]],a,b,glass,false);
    k.beam(g,a,b,.0012,frame,6);
    for(let n=0;n<=5;n++){const t=n/5,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;k.beam(g,[x,.031,.157],[x,y,.157],.0009,frame,5);}
  }
  for(let row=1;row<=11;row++){
    const y=.031+row*.015;
    for(let i=0;i<xs.length-1;i++){
      const a=point(i,0),b=point(i+1,0);
      if(y>Math.max(a[1],b[1]))continue;
      let from=a[0],to=b[0];
      if(y>a[1])from=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);
      if(y>b[1])to=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);
      k.beam(g,[from,y,.1575],[to,y,.1575],.0007,frame,5);
    }
  }
  // Leaning side glazing and square stone end piers are visible in the photos.
  for(const side of [-1,1]){
    const index=side<0?0:xs.length-1,x=xs[index]*mirror,top=point(index,1);
    patch([x*1.05,.031,-.19],[x*1.05,.031,.156],[x,.218,-.19],top,glass,false);
    const triangle=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([...top,x,front[index],.156,x*1.05,.031,.156],3));triangle.computeVertexNormals();k.mesh(g,triangle,glass);
    for(let i=0;i<=20;i++){const t=i/20,z=-.19+t*.346,endZ=-.19+t*(top[2]+.19),y=.218+(top[1]-.218)*t;k.beam(g,[x*1.05,.031,z],[x,y,endZ],.0009,frame,5);}
    k.box(g,.013,top[1]-.055,.012,stone,x,.031+(top[1]-.055)/2,top[2]+.003);
    k.beam(g,[x,.218,-.19],top,.003,stone,6);
  }
  // Branching structural columns show through the glass, not a window texture.
  for(const [x,z,h] of [[-.11,.08,.155],[.025,.07,.145],[.12,.05,.125]]){
    const xx=x*mirror;
    k.cyl(g,.003,.004,h*.63,tree,xx,.031+h*.315,z,8);
    for(const dx of [-.035,.035])for(const dz of [-.022,.022])k.beam(g,[xx,.031+h*.58,z],[xx+dx,.031+h,z+dz],.0022,tree,6);
  }
  const entryX=.085*mirror;
  k.box(g,.10,.047,.006,dark,entryX,.0545,.161);
  for(const dx of [-.032,0,.032]){k.box(g,.028,.043,.007,glass,entryX+dx,.055,.164);k.box(g,.001,.044,.001,frame,entryX+dx-.015,.055,.169);}
  k.box(g,.122,.004,.061,stone,entryX,.082,.180);
  k.box(g,.110,.0015,.004,edge,entryX,.080,.208);
  for(const x of [entryX-.05,entryX+.05])k.cyl(g,.0014,.0014,.049,frame,x,.056,.200,6);
  // Warm / cool interior bands remain restrained instead of lighting the roof solidly.
  for(const x of [-.14,-.035,.075])k.box(g,.045,.0018,.002,warm,x*mirror,.039,.146);
  return g;
}

export function cultureCenter(k){
  const g=new THREE.Group(),stone=plaza(k,g,.555,.37,'#c7c8b7');
  const paving=k.mat('#a9b0a7',.95),lawn=k.mat('#789271',.97),metal=k.mat('#59706b',.68,.3);
  pavilion(k,g,true);pavilion(k,g,false);
  // The two entrances look across a clear central axis, with the elevated link behind.
  k.box(g,.098,.005,.54,paving,0,.017,.035);
  k.box(g,.20,.010,.049,stone,0,.095,-.205);
  for(const x of [-.075,.075])k.box(g,.009,.073,.027,stone,x,.0525,-.205);
  for(const z of [-.229,-.181])k.beam(g,[-.10,.115,z],[.10,.115,z],.0013,metal,6);
  for(let i=0;i<=10;i++)for(const z of [-.229,-.181])k.beam(g,[-.10+i*.02,.101,z],[-.10+i*.02,.115,z],.0008,metal,5);
  const pool=k.mat('#427980',.26,.28);pool.userData.night={color:new THREE.Color('#426d77'),intensity:.11};
  // Side water courts are enclosed ornamental basins, separate from the bay.
  for(const x of [-.31,.31]){
    k.box(g,.297,.009,.062,stone,x,.019,.166);
    k.box(g,.282,.002,.049,pool,x,.024,.166);
    for(const z of [.133,.199])k.box(g,.303,.004,.004,stone,x,.026,z);
  }
  for(const x of [-.28,.28])for(const z of [.262,.315]){
    k.box(g,.29,.007,.032,lawn,x,.018,z);
    for(let j=0;j<4;j++){const xx=x-.105+j*.07;k.cyl(g,.0017,.0026,.036,metal,xx,.040,z,5);const crown=k.ball(g,.023,lawn,xx,.067,z);crown.scale.y=.75;}
  }
  bollards(k,g,[[-.065,.28],[.065,.28],[-.065,.14],[.065,.14],[-.50,.08],[.50,.08]]);
  people(k,g,[[-.023,.265],[.022,.23],[-.13,.07],[.14,.085],[-.16,.22],[.21,.22],[-.025,-.10],[.03,-.06]]);
  // Merge opaque structural parts while preserving transparent facades separately.
  k.merge(g);
  g.userData.culturalPair={library:'west',concertHall:'east',centralAxisWidth:.098};
  for(const [x,color] of [[-.275,'#c9dfeb'],[.275,'#ffe0a2']]){
    const lamp=new THREE.PointLight(color,0,.34,2);lamp.position.set(x,.08,.02);lamp.userData.nightIntensity=.0015;g.add(lamp);
  }
  return g;
}
