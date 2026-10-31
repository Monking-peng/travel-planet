import * as THREE from 'three';
import {glow,plaza,bollards,people} from './shenzhen-forms.js';
import {tree} from './wuhan-architecture.js';

// Museum-supplied photographs: four eccentric discs, continuous fins and a water approach.
function disc(k,g,r,x,z,y,t,m,hole=null){
  const s=new THREE.Shape();s.absarc(x,z,r,0,Math.PI*2,false);
  if(hole){const p=new THREE.Path();p.absarc(hole.x,hole.z,hole.r,0,Math.PI*2,true);s.holes.push(p);}
  const geo=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:96});geo.rotateX(Math.PI/2);geo.translate(0,y,0);return k.mesh(g,geo,m);
}
function arc(k,g,r,x,z,y,a,b,m,width=.002){
  const q=Array.from({length:65},(_,i)=>{const t=a+(b-a)*i/64;return [x+r*Math.cos(t),y,z+r*Math.sin(t)];});k.line(g,q,width,m);
}
function arcWall(k,g,r,a,b,h,m){
  const shape=new THREE.Shape();shape.absarc(0,-.015,r,a,b,false);shape.absarc(0,-.015,r-.009,b,a,true);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:64});geo.rotateX(Math.PI/2);geo.translate(0,.021+h,0);k.mesh(g,geo,m);
}
export function hem(k){
  const g=new THREE.Group(),paving=plaza(k,g,.67,.62,'#afb6a9'),concrete=k.mat('#bbbdb3',.86,.05),fin=k.mat('#aeb8b5',.60,.23),wall=k.mat('#c6c9bc',.85),glass=k.mat('#415d61',.23,.27,'#dbcda5'),garden=k.mat('#5d7659',.95),water=k.mat('#304d51',.40,.18),warm=glow(k,'#efdbb2',.46),seam=k.mat('#9ea69d',.9);
  glass.userData.night.intensity=.58;water.userData.preserveSmooth=true;water.userData.hemPool=true;
  const positions=[],indices=[],nr=24,na=128;
  for(let row=0;row<=nr;row++)for(let col=0;col<=na;col++){const a=col/na*Math.PI*2,r=.60*row/nr;positions.push(Math.cos(a)*r,.027,-.005+Math.sin(a)*r*.91);}
  for(let row=0;row<nr;row++)for(let col=0;col<na;col++){const a=row*(na+1)+col,b=a+na+1;if(row>0)indices.push(a,a+1,b);indices.push(a+1,b+1,b);}
  const waterGeometry=new THREE.BufferGeometry();waterGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));waterGeometry.setIndex(indices);waterGeometry.computeVertexNormals();k.mesh(g,waterGeometry,water);

  // The courtyard is water, with a single straight entry bridge and no radial seams.
  k.box(g,.094,.012,.39,concrete,0,.040,.37);k.box(g,.10,.006,.13,paving,0,.033,.58);
  for(let i=0;i<15;i++)k.box(g,.092,.0007,.001,seam,0,.0465,.19+i*.026);
  for(const side of [-1,1])k.box(g,.0015,.0015,.38,warm,side*.047,.047,.37);
  const atrium={x:.025,z:-.065,r:.087},floors=[{r:.245,x:-.012,y:.038},{r:.285,x:.012,y:.125},{r:.325,x:.04,y:.212},{r:.367,x:.065,y:.299}],z=-.07;
  // Floors keep a real central void; recessed glazing sits behind deep aluminium fins.
  concrete.userData.hemSlab=true;
  for(let level=0;level<floors.length;level++){
    const f=floors[level],height=.076,outer=f.r-.010;
    disc(k,g,f.r,f.x,z,f.y,.009,concrete,atrium);
    k.mesh(g,new THREE.CylinderGeometry(outer-.010,outer-.010,height,128,1,true),glass,f.x,f.y+height/2+.002,z);
    const n=Math.round(2*Math.PI*outer/.0085);
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2,front=level===0&&Math.abs(a-Math.PI/2)<.16;
      if(front)continue;
      k.box(g,.0019,height,.012,fin,f.x+Math.cos(a)*outer,f.y+height/2+.002,z+Math.sin(a)*outer).rotation.y=Math.PI/2-a;
    }
    // Plain lit gallery walls replace the former skyscraper-window shader.
    for(const side of [-1,1])k.box(g,.20,.048,.004,wall,f.x,f.y+.033,z+side*.12);
    arc(k,g,outer-.015,f.x,z,f.y+.073,0,Math.PI*2,warm,.0012);
    for(let j=0;j<10;j++){const a=j/10*Math.PI*2;k.beam(g,[f.x+Math.cos(a)*.15,f.y+.004,z+Math.sin(a)*.15],[f.x+Math.cos(a)*.19,f.y+.078,z+Math.sin(a)*.19],.0033,concrete,6);}
  }
  disc(k,g,.375,.065,z,.389,.012,concrete,atrium);
  arc(k,g,.373,.065,z,.390,0,Math.PI*2,fin,.0014);
  // Recessed square gallery and deep overhanging roof, as in the museum's courtyard photographs.
  k.box(g,.43,.091,.33,glass,-.345,.081,-.12);k.box(g,.47,.012,.37,concrete,-.345,.135,-.12);
  for(let i=0;i<51;i++)k.box(g,.0018,.092,.012,fin,-.554+i*.0083,.081,.049);
  for(let i=0;i<37;i++)k.box(g,.012,.092,.0018,fin,-.561,.081,-.28+i*.0088);
  k.box(g,.43,.0016,.002,warm,-.345,.127,.056);
  // Two offset helical ramps are visible through the shallow glazed roof lantern.
  const stair=k.mat('#c1c2b8',.84),rail=k.mat('#969e99',.60,.22);
  for(const phase of [0,Math.PI]){
    const edge=[];for(let i=0;i<112;i++){
      const a=phase+i/112*Math.PI*3,yy=.043+i/112*.326,rr=.059;
      k.box(g,.031,.004,.009,stair,atrium.x+Math.cos(a)*rr,yy,atrium.z+Math.sin(a)*rr).rotation.y=-a;
      edge.push([atrium.x+Math.cos(a)*.076,yy+.015,atrium.z+Math.sin(a)*.076]);
    }k.line(g,edge,.0012,rail);
  }
  const sky=k.mat('#b9d3d0',.13,.13);sky.transparent=true;sky.opacity=.25;sky.depthWrite=false;sky.side=THREE.DoubleSide;sky.userData.hemSkylight=true;
  k.mesh(g,new THREE.ConeGeometry(.085,.047,72,1,true),sky,atrium.x,.414,atrium.z);
  arc(k,g,.086,atrium.x,atrium.z,.391,0,Math.PI*2,fin,.002);
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;k.beam(g,[atrium.x+Math.cos(a)*.085,.391,atrium.z+Math.sin(a)*.085],[atrium.x,.438,atrium.z],.0013,fin,4);}
  // Curved landscape walls and concentrated planting frame the approach rather than filling the water.
  for(const [r,a,b,h]of [[.625,.08,1.31,.065],[.625,1.83,2.68,.065],[.56,3.34,4.69,.075]])arcWall(k,g,r,a,b,h,concrete);
  const treeSpots=[];
  for(let i=0;i<23;i++){
    const a=2.80+i/22*Math.PI*.94,r=.51+(i%3)*.025,x=Math.cos(a)*r,zz=-.015+Math.sin(a)*r;
    if(x<-.35&&zz>-.31)continue;
    const patch=k.cyl(g,.037,.041,.011,garden,x,.019,zz,12);patch.scale.z=.8;tree(k,g,x,.024,zz,.064+(i%4)*.009);treeSpots.push([x,zz]);
  }
  // Silver branching sculpture is an abstract nod to the garden work, not a copied mesh.
  const sculpture=k.mat('#b2bfc0',.30,.6),root=[.40,.028,.32];
  k.beam(g,root,[.42,.144,.31],.0035,sculpture,6);
  for(let i=0;i<7;i++){
    const a=i*2.399,r=.043+i*.005,start=[.42,.10+i*.006,.31],mid=[.42+Math.cos(a)*r,.14+i*.008,.31+Math.sin(a)*r];
    k.beam(g,start,mid,.0018,sculpture,5);
    for(const t of [-1,1])k.beam(g,mid,[mid[0]+Math.cos(a+t*.8)*.035,mid[1]+.024,mid[2]+Math.sin(a+t*.8)*.035],.0009,sculpture,4);
  }
  bollards(k,g,[[-.12,.56],[.12,.56],[-.55,.27],[.55,.22]]);people(k,g,[[-.022,.54],[.023,.51],[-.37,.49],[.50,.28]]);
  k.merge(g);g.userData.atrium=atrium;g.userData.floors=floors;g.userData.treeSpots=treeSpots;
  for(const [x,y,zz,power]of [[.025,.36,-.065,.004],[-.32,.11,.05,.003]]){const light=new THREE.PointLight('#eddbb8',0,.5,2);light.position.set(x,y,zz);light.userData.nightIntensity=power;g.add(light);}
  return g;
}
