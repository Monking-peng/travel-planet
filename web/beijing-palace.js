import * as THREE from 'three';
import {stairs,rail,plaque} from './wuhan-architecture.js';

// Forms and palette follow the Palace Museum's Wumen/courtyard photographs.
// This is a deliberately compressed ensemble, not a surveying model.
function palette(k){
  const p={red:k.mat('#80352f',.91,0),shadow:k.mat('#3a2924',.96,0),stone:k.mat('#d1cfc3',.94,0),paving:k.mat('#b2b2a5',.99,0),joint:k.mat('#92978d',1,0),tile:k.mat('#a77b39',.78,.08),ridge:k.mat('#b18c4d',.76,.07),teal:k.mat('#315a54',.92,0),blue:k.mat('#34505d',.9,0),gold:k.mat('#bd9c61',.8,.08),water:k.mat('#4e8586',.4,.12)};
  p.tile.userData.preserveSmooth=true;p.ridge.userData.preserveSmooth=true;
  for(const name of ['tile','ridge'])p[name].userData.night={color:new THREE.Color('#d9ae65'),intensity:.17};
  p.red.userData.night={color:new THREE.Color('#9d5940'),intensity:.055};
  return p;
}
function surfaceMesh(k,g,rows,cols,point,mat){
  const v=[],indices=[];
  for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++)v.push(...point(c/cols,r/rows));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c;indices.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(indices);geo.computeVertexNormals();mat.side=THREE.DoubleSide;k.mesh(g,geo,mat);
}
function roof(k,g,p,w,d,h,y,x=0,z=0){
  const spine=Math.max(0,(w-d)*.5);
  const at=(side,end,u,r,lift=0)=>{
    const yy=y+h*Math.pow(1-r,1.24)+h*.20*Math.pow(r,5)*Math.pow(Math.abs(u),5)+lift;
    return end?[x+side*(spine+(w*.5-spine)*r),yy,z+u*d*.5*r]:[x+u*(spine+(w*.5-spine)*r),yy,z+side*d*.5*r];
  };
  for(const end of [false,true])for(const side of [-1,1]){
    surfaceMesh(k,g,10,24,(u,r)=>at(side,end,u*2-1,r),p.tile);
    // Fine raised tile rolls, rather than a bright wire outline over the roof.
    const count=Math.max(12,Math.round((end?d:w)/.014));
    for(let i=1;i<count;i++){const u=i/count*2-1;surfaceMesh(k,g,7,1,(v,r)=>at(side,end,u+(v-.5)*.007,r,.0011),p.ridge);}
    k.line(g,Array.from({length:17},(_,i)=>at(side,end,i/8-1,1,.001)),.0021,p.ridge);
  }
  k.box(g,spine*2+.015,.006,.008,p.ridge,x,y+h+.002,z);
  for(const side of [-1,1]){const fin=k.mesh(g,new THREE.SphereGeometry(.008,10,8),p.ridge,x+side*(spine+.005),y+h+.008,z);fin.scale.set(.55,1.35,.65);}
}
function hall(k,g,p,{x=0,z=0,w=.42,d=.22,h=.13,y=.035,double=false,bays=9,name=''}){
  k.box(g,w+.035,.014,d+.035,p.stone,x,y-.007,z);
  k.box(g,w*.90,h*.90,d*.65,p.shadow,x,y+h*.45,z);
  for(const side of [-1,1]){
    for(let i=0;i<=bays;i++){
      const xx=x+(i/bays-.5)*w*.96;k.cyl(g,.0037,.0047,h,p.red,xx,y+h/2,z+side*d*.48,10);
      k.box(g,.012,.006,.020,p.teal,xx,y+h-.008,z+side*d*.46);
      k.box(g,.020,.004,.026,p.gold,xx,y+h-.001,z+side*d*.46);
      if(i===bays)continue;
      const bx=xx+w*.48/bays,bw=w*.70/bays;
      k.box(g,bw,h*.80,.004,p.red,bx,y+h*.43,z+side*d*.34);
      k.box(g,bw*.78,h*.43,.004,p.shadow,bx,y+h*.57,z+side*(d*.34+.003));
      for(let j=0;j<3;j++)k.box(g,.0012,h*.41,.0012,p.gold,bx+(j-1)*bw*.22,y+h*.57,z+side*(d*.34+.006));
      k.box(g,bw*.78,.0016,.0018,p.gold,bx,y+h*.59,z+side*(d*.34+.006));
    }
    k.box(g,w,.015,.008,p.teal,x,y+h-.004,z+side*d*.47);
    k.box(g,w,.002,.009,p.gold,x,y+h+.004,z+side*d*.47);
  }
  roof(k,g,p,w*1.15,d*1.22,h*.47,y+h+.007,x,z);
  if(double){k.box(g,w*.79,.037,d*.62,p.red,x,y+h+.054,z);k.box(g,w*.85,.010,d*.74,p.teal,x,y+h+.075,z);roof(k,g,p,w*1.04,d*1.08,h*.49,y+h+.080,x,z);}
  if(name)plaque(k,g,name,w*.22,.020,x,y+h*.83,z+d*.485);
}
function court(k,g,p,w,d,z=0){
  k.box(g,w,.015,d,p.paving,0,.0075,z);
  for(let i=1;i<Math.ceil(d/.052);i++)k.box(g,w,.0006,.0008,p.joint,0,.0158,z-d/2+i*d/Math.ceil(d/.052));
  for(let i=1;i<Math.ceil(w/.065);i++)k.box(g,.0008,.0006,d,p.joint,-w/2+i*w/Math.ceil(w/.065),.0158,z);
  k.box(g,.088,.0018,d,p.stone,0,.017,z);
}
function gate(k,g,p,{w,d,h,z,holes}){
  const shape=new THREE.Shape();shape.moveTo(-w/2,.018);shape.lineTo(w/2,.018);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
  for(const [x,r,top] of holes){const a=new THREE.Path();a.moveTo(x-r,.019);a.lineTo(x-r,top);a.absarc(x,top,r,Math.PI,0,true);a.lineTo(x+r,.019);a.closePath();shape.holes.push(a);}
  k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:12}),p.red,0,0,z-d/2);
  k.box(g,w+.018,.013,d+.018,p.stone,0,h+.006,z);
  const bal=new THREE.Group();bal.position.set(0,h+.012,z);rail(k,bal,w+.012,d+.012,0,p.stone);g.add(bal);
}
function bridge(k,g,p,x,z,w=.045,d=.12){
  for(let i=0;i<15;i++){const zz=z+(i/14-.5)*d,y=.025+.012*Math.sin(i/14*Math.PI);k.box(g,w,.009,d/14+.001,p.stone,x,y,zz);for(const s of [-1,1]){k.cyl(g,.0015,.002,.020,p.stone,x+s*w*.49,y+.014,zz,6);k.box(g,.003,.003,d/14+.003,p.stone,x+s*w*.49,y+.024,zz);}}
}
export function palace(k){
  const g=new THREE.Group(),p=palette(k);g.name='forbidden-city';court(k,g,p,1.10,1.78);
  for(const x of [-.555,.555]){k.box(g,.025,.098,1.80,p.red,x,.058,0);k.box(g,.036,.008,1.82,p.tile,x,.110,0);k.box(g,.055,.005,1.91,p.water,x+Math.sign(x)*.052,.009,0);}
  for(const z of [-.89,.89]){for(const side of [-1,1]){const w=z>0?.19:.50,x=z>0?side*.465:side*.31;k.box(g,w,.09,.024,p.red,x,.054,z);k.box(g,w+.01,.008,.033,p.tile,x,.103,z);}}
  // Four turret groups and the U-shaped Wumen podium enclose the palace.
  for(const x of [-.55,.55])for(const z of [-.88,.88])hall(k,g,p,{x,z,w:.14,d:.13,h:.059,y:.107,double:true,bays:3});
  gate(k,g,p,{w:.67,d:.15,h:.15,z:.73,holes:[[-.19,.019,.065],[0,.029,.071],[.19,.019,.065]]});
  hall(k,g,p,{z:.73,w:.64,d:.16,h:.095,y:.163,double:true,name:'午门'});
  for(const x of [-.39,.39]){
    k.box(g,.13,.145,.30,p.red,x,.087,.78);
    const wing=new THREE.Group();wing.position.set(x,0,.78);wing.rotation.y=Math.PI/2;g.add(wing);hall(k,wing,p,{w:.29,d:.12,h:.055,y:.162,bays:7});
    hall(k,g,p,{x,z:.89,w:.14,d:.13,h:.060,y:.163,double:true,bays:3});
  }
  // The inner Golden Water River crosses the first court; five bridges span it.
  const river=[];for(let i=0;i<=40;i++){const x=(i/40-.5)*1.04;river.push([x,.021,.47+.025*Math.cos(x*9)]);}
  surfaceMesh(k,g,1,40,(t,v)=>{const a=river[Math.round(t*40)];return [a[0],a[1],a[2]+(v-.5)*.064];},p.water);
  for(const x of [-.19,-.095,0,.095,.19])bridge(k,g,p,x,.47+.025*Math.cos(x*9),x===0?.058:.041);
  hall(k,g,p,{z:.32,w:.50,d:.095,h:.065,y:.032,name:'太和门'});
  // Three principal halls sit on successive marble terraces, with space between.
  for(const [z,w,d,h,dbl] of [[.06,.53,.24,.15,true],[-.21,.24,.16,.083,false],[-.43,.40,.18,.105,true]]){
    for(let j=0;j<3;j++){const ww=w+.13-j*.025,dd=d+.11-j*.018,yy=.028+j*.019;k.box(g,ww,.019,dd,p.stone,0,yy,z);const b=new THREE.Group();b.position.z=z;rail(k,b,ww-.008,dd-.008,yy+.010,p.stone);g.add(b);}
    stairs(k,g,.103,.094,.077,p.stone,0,z+d/2+.07,10);hall(k,g,p,{z,w,d,h,y:.086,double:dbl,name:z===.06?'太和殿':''});
  }
  // Continuous galleries and specific inner-palace courts, not city filler.
  for(const x of [-.455,.455]){
    const side=new THREE.Group();side.position.set(x,0,-.10);side.rotation.y=Math.PI/2;g.add(side);hall(k,side,p,{w:.94,d:.105,h:.052,y:.025,bays:21});
    for(const z of [-.63,-.77])hall(k,g,p,{x:x*.61,z,w:.20,d:.085,h:.045,y:.025,bays:5});
  }
  hall(k,g,p,{z:-.65,w:.29,d:.11,h:.075,y:.036,double:true,name:'乾清宫'});
  hall(k,g,p,{z:-.81,w:.22,d:.075,h:.043,y:.025,bays:5});
  g.userData={ensemble:'forbidden-city',courts:5,bridges:5,footprint:[1.27,1.98]};return k.merge(g);
}
export function tiananmen(k){
  const g=new THREE.Group(),p=palette(k);court(k,g,p,1.16,.90,.02);
  gate(k,g,p,{w:1.02,d:.20,h:.21,z:-.18,holes:Array.from({length:5},(_,i)=>[(i-2)*.14,i===2?.033:.023,.078])});
  hall(k,g,p,{z:-.18,w:.86,d:.215,h:.106,y:.230,double:true,bays:9});
  k.box(g,1.13,.007,.072,p.water,0,.020,.065);
  for(let i=-3;i<=3;i++)bridge(k,g,p,i*.132,.065,i===0?.074:.052,.16);
  for(const x of [-.46,.46]){
    k.box(g,.047,.014,.047,p.stone,x,.025,.24);k.cyl(g,.008,.011,.12,p.stone,x,.091,.24,12);
    for(let j=0;j<7;j++){const a=j*.8;k.ball(g,.0038,p.stone,x+Math.cos(a)*.009,.045+j*.014,.24+Math.sin(a)*.009);}
    k.box(g,.043,.009,.014,p.stone,x,.137,.24);k.ball(g,.008,p.stone,x,.16,.24);
  }
  k.box(g,.048,.064,.003,p.gold,0,.151,-.077);k.box(g,.038,.054,.004,k.mat('#a68b69',.94,0),0,.151,-.075);
  // Restrained ceremonial banners, kept separate from the masonry and colonnade.
  for(const x of [-.27,.27])k.box(g,.28,.029,.003,p.red,x,.160,-.076);
  k.cyl(g,.0015,.002,.23,p.stone,0,.13,.34,10);k.box(g,.048,.029,.001,p.red,.024,.23,.34);
  g.userData={ensemble:'tiananmen',bridges:7,facadeBays:9};return k.merge(g);
}
