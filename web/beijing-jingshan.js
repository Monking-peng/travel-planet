import * as THREE from 'three';
import {roof,plaque,rail} from './wuhan-architecture.js';
import {hall} from './beijing-heritage.js';

const peaks=[[-.53,.135],[-.28,.225],[0,.305],[.28,.225],[.53,.135]];
function rawHeight(x,z){
  const rim=Math.max(0,1-(x/.73)**8)*Math.max(0,1-((z-.015)/.46)**8);
  const ridge=Math.max(...peaks.map(([cx,h])=>h*Math.exp(-(((x-cx)/.205)**2))));
  const northCourt=z<-.25&&Math.abs(x)<.29?0:1;
  return Math.max(0,ridge*Math.exp(-(((z-.04)/.21)**2))*rim*northCourt);
}
export function jingshanHeight(x,z){
  let y=rawHeight(x,z);
  for(const [cx] of peaks){const r=cx===0?.15:.098,d=Math.hypot(x-cx,z-.04),t=THREE.MathUtils.clamp((r+.065-d)/.065,0,1);y=THREE.MathUtils.lerp(y,rawHeight(cx,.04),t*t*(3-2*t));}
  return y;
}
export function jingshan(k){
  const g=new THREE.Group(),p={red:k.mat('#963d32',.87),stone:k.mat('#d3ceb8',.94),tile:k.mat('#c49135',.7,.12),gold:k.mat('#c5a15b',.6,.15),trim:k.mat('#356d67',.81),dark:k.mat('#443b32',.94)};
  const blue=k.mat('#286e7a',.68,.12),purple=k.mat('#6d5369',.73),green=k.mat('#437567',.74),bark=k.mat('#74634b',.97),leaves=['#3f6047','#527253','#63805a','#70875a'].map(c=>k.mat(c,.98));
  const lit=k.mat('#e4bc74',.5,.1,'#f6ce86');lit.userData.night.intensity=.65;
  const terrace=k.mat('#a9a791',.95),paths=[],footings=[];
  // A continuous, uniformly subdivided surface bends cleanly with the globe.
  const geo=new THREE.BufferGeometry(),positions=[],indices=[],colors=[],low=new THREE.Color('#8f9c79'),high=new THREE.Color('#657e55');
  for(let j=0;j<=60;j++)for(let i=0;i<=120;i++){const a=i/120*Math.PI*2,r=j/60,x=Math.cos(a)*r*.74,z=Math.sin(a)*r*.60,h=jingshanHeight(x,z),c=low.clone().lerp(high,Math.min(1,h/.11));positions.push(x,h+.002,z);colors.push(c.r,c.g,c.b);if(j&&i){const n=j*121+i;indices.push(n-122,n-121,n-1,n-121,n,n-1);}}
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const soil=k.mat('#ffffff',.99);soil.vertexColors=true;soil.userData.terrainTint=true;k.mesh(g,geo,soil);
  function walkway(points,width=.032){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z))),samples=curve.getPoints(90);paths.push(samples.map(v=>[v.x,v.z]));
    for(let i=0;i<samples.length-1;i++){const a=samples[i],b=samples[i+1],x=(a.x+b.x)/2,z=(a.z+b.z)/2,y=jingshanHeight(x,z)+.009,step=k.box(g,width,.012,a.distanceTo(b)+.001,p.stone,x,y,z);step.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);}
  }
  function terraceAt(name,x,z,r,shape=4){
    const y=jingshanHeight(x,z)+.012,base=new THREE.Group();base.position.set(x,y,z);g.add(base);
    const h=Math.max(.028,y-jingshanHeight(x+r*.65,z+r*.65)+.01);
    if(shape===4){k.box(base,r*2,h,r*2,terrace,0,-h/2+.012,0);k.box(base,r*2.05,.012,r*2.05,p.stone,0,.013,0);rail(k,base,r*2,r*2,.02,p.stone);}
    else{k.cyl(base,r,r,h,terrace,0,-h/2+.012,0,shape);k.cyl(base,r*1.03,r*1.03,.012,p.stone,0,.013,0,shape);}
    footings.push({name,x,z,y,r});return base;
  }
  function squarePavilion(base){
    const sizes=[.24,.195,.148],ys=[.132,.200,.259];
    k.box(base,.105,.10,.105,p.red,0,.073,0);
    for(const s of [-1,1])for(let i=0;i<4;i++){
      const v=(i/3-.5)*.188;k.cyl(base,.004,.005,.107,p.red,v,.078,s*.094,8);k.cyl(base,.004,.005,.107,p.red,s*.094,.078,v,8);
      for(let j=0;j<3;j++){k.box(base,.014+j*.006,.004,.018+j*.006,p.trim,v,.123+j*.004,s*.092);k.box(base,.018+j*.006,.004,.014+j*.006,p.trim,s*.092,.123+j*.004,v);}
    }
    sizes.forEach((w,i)=>{k.box(base,w*.76,.022,w*.76,p.trim,0,ys[i]-.012,0);roof(k,base,w,w,i===2?.054:.042,ys[i],p.tile,green);if(i<2)k.box(base,w*.63,.044,w*.63,p.red,0,ys[i]+.044,0);for(const s of [-1,1])k.box(base,w*.82,.002,.003,lit,0,ys[i]-.003,s*w*.45);});
    k.cyl(base,.004,.008,.016,p.gold,0,.318,0,12);k.ball(base,.007,p.gold,0,.331,0);plaque(k,base,'万春亭',.065,.024,0,.117,.103);
  }
  function roundPavilion(base,r,segments,tile,edge){
    k.cyl(base,r*.64,r*.64,.078,p.red,0,.060,0,8);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.sin(a)*r*.81,z=Math.cos(a)*r*.81;k.cyl(base,.003,.004,.085,p.red,x,.064,z,6);const lintel=k.box(base,r*.48,.013,.008,p.trim,x,.110,z);lintel.rotation.y=a;}
    for(const [rr,y,h] of [[r,.112,.042],[r*.75,.170,.045]]){
      const profile=[[0,y+h],[rr*.14,y+h*.95],[rr*.36,y+h*.65],[rr*.7,y+h*.22],[rr,y+.006],[rr*.98,y]].map(v=>new THREE.Vector2(...v));k.mesh(base,new THREE.LatheGeometry([...profile].reverse(),segments),tile);
      const rim=Array.from({length:segments},(_,i)=>[Math.sin(i/segments*Math.PI*2)*rr,y+.006,Math.cos(i/segments*Math.PI*2)*rr]);k.line(base,rim,.002,edge,true);
      for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2;k.line(base,profile.slice(1).map(v=>[Math.sin(a)*v.x,v.y+.0008,Math.cos(a)*v.x]),.0007,tile);}
      k.cyl(base,rr*.66,rr*.66,.016,p.trim,0,y-.007,0,8);if(y<.15)k.cyl(base,rr*.55,rr*.55,.028,p.red,0,y+.035,0,8);
      k.ring(base,rr*.84,.0015,lit,y-.009);
    }
    k.ball(base,.006,p.gold,0,.22,0);
  }
  const names=['富览亭','辑芳亭','万春亭','观妙亭','周赏亭'];
  peaks.forEach(([x],i)=>{const center=i===2,base=terraceAt(names[i],x,.04,center?.15:.098,center?4:8);if(center)squarePavilion(base);else roundPavilion(base,i===0||i===4?.084:.092,i===0||i===4?40:8,i===0||i===4?blue:green,i===0||i===4?purple:p.tile);});
  // Qiwang Tower stands at the southern foot; Shouhuang is north of the hill.
  k.box(g,.34,.018,.16,p.stone,0,.015,.435);hall(k,g,p,{z:.435,w:.24,d:.11,h:.061,y:.028,double:true,name:'绮望楼'});
  k.box(g,.53,.016,.27,p.stone,0,.014,-.405);
  hall(k,g,p,{z:-.48,w:.31,d:.11,h:.077,y:.030,double:true,name:'寿皇殿'});
  hall(k,g,p,{z:-.30,w:.24,d:.067,h:.040,y:.025});
  for(const x of [-.225,.225]){hall(k,g,p,{x,z:-.40,w:.060,d:.16,h:.040,y:.025});k.box(g,.012,.045,.27,p.red,x*1.18,.033,-.405);}
  walkway([[-.32,.49],[-.55,.32],[-.62,.17],[-.53,.04],[-.28,.04],[0,.04],[.28,.04],[.53,.04],[.63,.17],[.55,.32],[.32,.49]]);
  walkway([[0,.55],[0,.515]],.07);
  for(const s of [-1,1])walkway([[s*.33,.49],[s*.53,.42],[s*.67,.22],[s*.67,-.12],[s*.48,-.28],[s*.34,-.43],[s*.34,-.54]]);
  walkway([[0,-.54],[0,-.56]],.06);
  for(const side of [-1,1]){walkway([[side*.17,.49],[side*.25,.51],[side*.33,.49]],.038);walkway([[side*.34,-.54],[side*.31,-.565],[0,-.565]],.03);}
  // Deliberate grove around the hill, with clear pavilions, courts and paths.
  let treeCount=0;
  for(let i=0;i<570;i++){
    const x=-.69+((i*.61803398875)%1)*1.38,z=-.53+((i*.41421356237)%1)*1.05;
    if((x/.68)**2+(z/.53)**2>1||(Math.abs(x)<.315&&z<-.245)||(Math.abs(x)<.20&&z>.32)||footings.some(f=>Math.hypot(x-f.x,z-f.z)<f.r+.035)||paths.some(route=>route.some(([px,pz])=>Math.hypot(px-x,pz-z)<.038)))continue;
    const y=jingshanHeight(x,z),s=.052+(i%5)*.009,leaf=leaves[i%4];k.cyl(g,.0025,.004,s*.62,bark,x,y+s*.28,z,6);
    for(let j=0;j<4;j++){const a=j*2.4,c=k.mesh(g,new THREE.IcosahedronGeometry(s*.39,1),leaf,x+Math.cos(a)*s*.20,y+s*(.70+(j%2)*.15),z+Math.sin(a)*s*.20);c.scale.y=i%3===0?1.55:1.06;}
    treeCount++;
  }
  for(const s of [-1,1])for(let i=0;i<9;i++){const x=s*(.28+i*.039),z=.31-i*.006,y=jingshanHeight(x,z);k.cyl(g,.002,.0025,.028,bark,x,y+.014,z,6);k.box(g,.007,.004,.007,lit,x,y+.030,z);}
  g.userData={pavilions:footings,treeCount,paths};return k.merge(g);
}
