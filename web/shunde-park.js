import * as THREE from 'three';
import {roof,plaque,rail} from './wuhan-architecture.js';
import {shunfengGate} from './shunde-streets.js';
import {palette,hall,bridge} from './shunde-kit.js';

const lakeCenter=[-.08,-.20],lakeSize=[.62,.49],towerCenter=[.53,-.58];
export function parkHeight(x,z){
  const d=Math.hypot(x-towerCenter[0],z-towerCenter[1]),rim=Math.max(0,1-(x/.96)**8)*Math.max(0,1-((z+.03)/1.02)**8);
  const lakeR=Math.hypot((x-lakeCenter[0])/lakeSize[0],(z-lakeCenter[1])/lakeSize[1]),shore=THREE.MathUtils.smoothstep(lakeR,1.02,1.20);
  return Math.max(0,.21*Math.exp(-((Math.max(0,d-.13)/.19)**2))*rim*shore);
}
export function shunfeng(k){
  const g=new THREE.Group(),p=palette(k),soil=k.mat('#ffffff',.99),leaves=['#4b704d','#658257','#7b925e'].map(c=>k.mat(c,.98));soil.vertexColors=true;soil.userData.terrainTint=true;
  const low=new THREE.Color('#91a18a'),high=new THREE.Color('#71875c'),pos=[],col=[],idx=[];
  // Dense regular radial subdivisions keep the low hill and its shoreline joined.
  for(let j=0;j<=64;j++)for(let i=0;i<=128;i++){
    const a=i/128*Math.PI*2,r=j/64,x=Math.cos(a)*r*.96,z=-.03+Math.sin(a)*r*1.02,h=parkHeight(x,z),c=low.clone().lerp(high,Math.min(1,h/.10));pos.push(x,h+.002,z);col.push(c.r,c.g,c.b);if(j&&i){const n=j*129+i;idx.push(n-130,n-129,n-1,n-129,n,n-1);}
  }
  const ground=new THREE.BufferGeometry();ground.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ground.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ground.setIndex(idx);ground.computeVertexNormals();k.mesh(g,ground,soil);
  const lakeEdge=a=>{const r=1+.04*Math.sin(a*3);return [lakeCenter[0]+Math.cos(a)*lakeSize[0]*r,lakeCenter[1]+Math.sin(a)*lakeSize[1]*r];};
  const waterGeo=new THREE.BufferGeometry(),wp=[],wi=[];
  for(let j=0;j<=24;j++)for(let i=0;i<=128;i++){const edge=lakeEdge(i/128*Math.PI*2),r=j/24;wp.push(lakeCenter[0]+(edge[0]-lakeCenter[0])*r,.020,lakeCenter[1]+(edge[1]-lakeCenter[1])*r);if(j&&i){const n=j*129+i;wi.push(n-130,n-129,n-1,n-129,n,n-1);}}
  waterGeo.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));waterGeo.setIndex(wi);waterGeo.computeVertexNormals();k.mesh(g,waterGeo,p.water);
  const paths=[],crossings=[];
  function path(points,width=.038,{overWater=false,closed=false}={}){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),closed,'centripetal'),route=curve.getPoints(100);paths.push(route.map(v=>[v.x,v.z]));
    for(let i=0;i<route.length-1;i++){const a=route[i],b=route[i+1],x=(a.x+b.x)/2,z=(a.z+b.z)/2,y=overWater?.048:parkHeight(x,z)+.014,m=k.box(g,width,.012,a.distanceTo(b)+.001,p.stone,x,y,z);m.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);if(i%14===0){k.cyl(g,.002,.003,.03,p.wood,x+width*.8,y+.012,z,6);k.box(g,.006,.004,.006,p.warm,x+width*.8,y+.030,z);}}
  }
  // Five bridges are on the entrance side of the gate, before the lakeside court.
  const gate=shunfengGate(k);gate.scale.setScalar(.70);gate.position.set(0,.018,.55);g.add(gate);
  k.box(g,1.00,.018,.23,p.stone,0,.020,.56);
  k.box(g,1.06,.009,.16,p.water,0,.020,.78);
  for(let i=0;i<5;i++){const x=(i-2)*.20,b=new THREE.Group();bridge(k,b,p,{w:.080,length:.25,rise:.038,y:.024});b.rotation.y=Math.PI/2;b.position.set(x,0,.78);g.add(b);crossings.push({x,z:.78});}
  k.box(g,1.08,.012,.075,p.stone,0,.026,.925);
  path([[-.49,.54],[-.66,.42],[-.78,.16],[-.81,-.24],[-.70,-.60],[-.30,-.79],[.11,-.81],[.43,-.81],[.78,-.67],[.81,-.30],[.66,.05],[.46,.28],[.49,.54]],.043);
  path([[-.49,.54],[0,.43],[.49,.54]],.075);
  path([[.79,-.66],[.72,-.52],[.62,-.43],[.53,-.45]],.036);
  // Qinglong pavilion: one tall central hall and four lower side pavilions.
  const pavilion=new THREE.Group(),px=-.40,pz=-.25;
  k.box(pavilion,.34,.030,.34,p.stone,0,.028,0);rail(k,pavilion,.34,.34,.045,p.wall);
  const amber=k.mat('#bd8642',.8),temple={...p,tile:amber,wall:k.mat('#e6deca'),wood:k.mat('#765042')};
  hall(k,pavilion,temple,{w:.17,d:.17,h:.12,y:.043,double:true});roof(k,pavilion,.15,.15,.048,.30,amber,p.green);k.ball(pavilion,.006,p.green,0,.352,0);
  for(const [x,z]of [[-.125,0],[.125,0],[0,-.125],[0,.125]])hall(k,pavilion,temple,{x,z,w:.092,d:.09,h:.055,y:.041});
  for(const s of [-1,1]){roof(k,pavilion,.25,.045,.016,.113,amber,p.green,0,s*.125);const link=new THREE.Group();roof(k,link,.25,.045,.016,.113,amber,p.green);link.rotation.y=Math.PI/2;link.position.x=s*.125;pavilion.add(link);}
  pavilion.position.set(px,0,pz);g.add(pavilion);path([[-.80,pz],[-.63,pz],[px-.17,pz]],.065,{overWater:true});
  // White angular water crossing remains straight-segmented, with real piers.
  const zig=[[-.30,-.79],[-.30,-.62],[-.15,-.48],[.02,-.61],[.18,-.46],[.34,-.31],[.53,-.20],[.75,-.12]];
  const bridgeSamples=[];
  for(let i=0;i<zig.length-1;i++){
    const [x1,z1]=zig[i],[x2,z2]=zig[i+1],len=Math.hypot(x2-x1,z2-z1),count=Math.ceil(len/.024),dx=(x2-x1)/len,dz=(z2-z1)/len;
    const at=t=>{const x=x1+(x2-x1)*t,z=z1+(z2-z1)*t;const d=Math.min(Math.hypot(x-zig[0][0],z-zig[0][1]),Math.hypot(x-zig.at(-1)[0],z-zig.at(-1)[1])),deck=.024+.024*THREE.MathUtils.smoothstep(d,0,.08);return new THREE.Vector3(x,Math.max(deck,parkHeight(x,z)+.020),z);};
    for(let j=0;j<count;j++){
      const a=at(j/count),b=at((j+1)/count),v=a.clone().add(b).multiplyScalar(.5),deck=k.box(g,.044,.012,a.distanceTo(b)+.002,p.wall,...v.toArray());deck.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize());bridgeSamples.push(v.toArray());
      for(const sign of [-1,1]){
        const cross=new THREE.Vector3(dz*sign*.022,.031,-dx*sign*.022);k.beam(g,a.clone().add(cross).toArray(),b.clone().add(cross).toArray(),.0018,p.wall,4);
        if(j%2===0)k.box(g,.003,.030,.003,p.wall,a.x+cross.x,a.y+.015,a.z+cross.z);
      }
      if(j%4===0){const h=Math.max(.012,v.y-parkHeight(v.x,v.z));k.box(g,.010,h,.010,p.stone,v.x,v.y-h/2-.004,v.z);}
    }
  }
  // Qingyun pagoda: seven tapering octagonal storeys, white wall panels,
  // red pilasters, narrow grey-green eaves and dark open balcony rails.
  const tower=new THREE.Group(),baseY=parkHeight(...towerCenter)+.013,towerTile=k.mat('#667361',.86),red=k.mat('#9c4b44',.88),ivory=k.mat('#ddd8c7',.96),iron=k.mat('#3d4944',.80),warm=k.mat('#d5b571',.7,.05,'#f0c782');warm.userData.night.intensity=.58;
  k.cyl(tower,.116,.123,.025,p.stone,0,.012,0,8);
  for(let level=0;level<7;level++){
    const y=.026+level*.064,r=.092-level*.0045;k.cyl(tower,r,r,.054,red,0,y+.027,0,8);
    for(let side=0;side<8;side++){
      const a=(side+.5)*Math.PI/4,face=new THREE.Group();face.rotation.y=a;face.position.set(Math.sin(a)*r*.925,y+.026,Math.cos(a)*r*.925);
      k.box(face,r*.60,.043,.002,ivory,0,0,0);k.box(face,.010,.027,.002,iron,0,-.002,.0015);
      k.box(face,r*.74,.003,.004,iron,0,-.008,.017);for(let j=0;j<5;j++)k.box(face,.0017,.018,.002,iron,(j-2)*r*.145,-.017,.017);tower.add(face);
    }
    k.cyl(tower,r*1.12,r*1.16,.008,p.wall,0,y+.052,0,8);
    const profile=[[0,y+.082],[r*.36,y+.077],[r*.70,y+.066],[r*1.20,y+.062],[r*1.20,y+.058]].reverse().map(v=>new THREE.Vector2(...v));k.mesh(tower,new THREE.LatheGeometry(profile,8),towerTile);
    const rim=Array.from({length:8},(_,i)=>[Math.sin(i*Math.PI/4)*r*1.18,y+.059,Math.cos(i*Math.PI/4)*r*1.18]);k.line(tower,rim,.001,warm,true);
  }
  k.cyl(tower,.013,.025,.025,red,0,.493,0,12);k.cyl(tower,.002,.008,.081,iron,0,.545,0,12);for(let i=0;i<7;i++)k.cyl(tower,.014-i*.0015,.014-i*.0015,.003,iron,0,.51+i*.009,0,16);
  tower.position.set(towerCenter[0],baseY,towerCenter[1]);g.add(tower);
  plaque(k,g,'顺峰山公园',.19,.025,0,.309,.600);
  const trees=[];
  for(let i=0;i<520;i++){
    const x=-.90+((i*.61803398875)%1)*1.80,z=-1.0+((i*.41421356237)%1)*1.90,water=((x-lakeCenter[0])/.71)**2+((z-lakeCenter[1])/.56)**2<1;
    if((x/.91)**2+((z+.03)/.97)**2>1||water||(Math.abs(x)<.57&&z>.36)||Math.hypot(x-towerCenter[0],z-towerCenter[1])<.145||paths.some(route=>route.some(([px,pz])=>Math.hypot(x-px,z-pz)<.055))||bridgeSamples.some(([px,,pz])=>Math.hypot(x-px,z-pz)<.075))continue;
    const y=parkHeight(x,z),s=.067+(i%5)*.009;k.cyl(g,.0025,.004,s*.64,p.wood,x,y+s*.30,z,6);
    for(let j=0;j<4;j++){const a=j*2.4,m=k.mesh(g,new THREE.IcosahedronGeometry(s*.40,1),leaves[i%3],x+Math.cos(a)*s*.18,y+s*(.70+(j%2)*.12),z+Math.sin(a)*s*.18);m.scale.y=1.15;}
    trees.push([x,y,z]);
  }
  // Bald cypress clusters belong to the pavilion shoreline, as in the aerial.
  for(const side of [-1,1])for(let i=0;i<6;i++){const x=px+side*(.19+i*.012),z=pz+(i-2.5)*.054;k.cyl(g,.002,.003,.10,p.wood,x,.071,z,5);const m=k.mesh(g,new THREE.IcosahedronGeometry(.025,1),leaves[i%3],x,.105,z);m.scale.y=2.2;}
  g.userData={bridges:crossings,tower:{x:towerCenter[0],z:towerCenter[1],baseY,storeys:7},lake:{center:lakeCenter,size:lakeSize,y:.020},pavilion:{x:px,z:pz},trees,paths,zig,bridgeSamples};return k.merge(g);
}
