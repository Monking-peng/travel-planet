import * as THREE from 'three';
import {glow} from './shenzhen-forms.js';

// A compressed plan of Talent Park: enclosed lake, northern inlet and east
// peninsula, star-column bridge on the east and the curved pi boardwalk south.
const lakeOutline=[[-.42,-.34],[-.28,-.49],[-.06,-.53],[.15,-.49],[.30,-.37],[.43,-.34],[.44,-.21],[.28,-.27],[.18,-.39],[.07,-.40],[.025,-.30],[.12,-.20],[.26,-.10],[.31,.10],[.35,.28],[.20,.41],[-.04,.48],[-.29,.44],[-.43,.29],[-.46,.07]];
const border=[[-.52,-.36],[-.34,-.60],[-.04,-.64],[.31,-.59],[.55,-.40],[.59,-.08],[.57,.30],[.40,.54],[.04,.62],[-.32,.58],[-.57,.36],[-.59,.02]];
function curve(points,y=0,closed=false){return new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,y,z)),closed,'catmullrom',.23);}
function patch(k,g,outline,y,material){
  const points=curve(outline,y,true).getPoints(180),shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.z))),geo=new THREE.ShapeGeometry(shape,40);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);k.mesh(g,geo,material);return points;
}
function ribbon(k,g,path,width,material){
  const pos=[],indices=[];
  for(let i=0;i<path.length;i++){
    const p=path[i],t=path[Math.min(path.length-1,i+1)].clone().sub(path[Math.max(0,i-1)]).normalize(),cross=new THREE.Vector3(-t.z,0,t.x).multiplyScalar(width/2);
    for(const side of [-1,1])pos.push(p.x+cross.x*side,p.y,p.z+cross.z*side);
    if(i){const a=(i-1)*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();material.side=THREE.DoubleSide;return k.mesh(g,geo,material);
}
function lawnHill(k,g,x,z,rx,rz,h,mat){
  const pos=[],idx=[];for(let row=0;row<=14;row++)for(let col=0;col<=48;col++){
    const a=col/48*Math.PI*2,r=row/14;pos.push(x+Math.cos(a)*rx*r,.009+h*(1-r*r)**2,z+Math.sin(a)*rz*r);
    if(row&&col){const i=row*49+col;idx.push(i,i-49,i-1,i-1,i-49,i-50);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();mat.side=THREE.DoubleSide;k.mesh(g,geo,mat);
  return (xx,zz)=>.009+h*Math.max(0,1-((xx-x)/rx)**2-((zz-z)/rz)**2)**2;
}
export function talentPark(k){
  const g=new THREE.Group(),grass=k.mat('#7f9b6c',.99),hillGrass=k.mat('#779565',.98),water=k.mat('#3f7079',.50,.10),sand=k.mat('#c3c3a8',.97),stone=k.mat('#8c9b91',.94),walk=k.mat('#c3c7b7',.92),track=k.mat('#668f9a',.84),deck=k.mat('#7e8781',.85),rail=k.mat('#a2b6b4',.59,.28),dark=k.mat('#536c70',.68,.25),wood=k.mat('#9c8768',.91),bark=k.mat('#7b785f',.96),leaves=['#527657','#638563','#78956b'].map(c=>k.mat(c,.99)),pink=k.mat('#a6a28b',.94),light=glow(k,'#e7d2a2',.8),blueLight=glow(k,'#abd8df',.45,1.2,.52);
  for(const material of [grass,water,sand,walk,track])material.userData.landSurface=true;
  for(const material of [grass,water])material.userData.conformingSurface=true;
  patch(k,g,border,.008,grass);
  const edge=patch(k,g,lakeOutline,.014,water);
  ribbon(k,g,edge.map(p=>new THREE.Vector3(p.x,.017,p.z)),.018,sand);
  // A pebbled lower waterline and pale running route follow the actual shore.
  for(let i=0;i<edge.length;i+=2){const p=edge[i],rock=k.mesh(g,new THREE.DodecahedronGeometry(.006+(i%3)*.001,0),stone,p.x,.020,p.z);rock.scale.set(1.7,.42,.8);rock.rotation.y=i*.71;}
  const run=curve([[-.51,.32],[-.53,.01],[-.47,-.32],[-.28,-.55],[-.04,-.58],[.30,-.52],[.50,-.33],[.52,.05],[.48,.31],[.29,.49],[.02,.55],[-.31,.51]],.019,true).getPoints(180);
  ribbon(k,g,run,.035,walk);ribbon(k,g,run.map(p=>new THREE.Vector3(p.x,.020,p.z)),.016,track);
  const hillside=lawnHill(k,g,.29,-.29,.25,.20,.057,hillGrass);
  const southernHill=lawnHill(k,g,.25,.48,.23,.12,.030,hillGrass);
  // Low rounded crowns stay in the park's actual east and north groves.
  function tree(x,z,y,h,i){
    k.cyl(g,.0028,.0038,h*.75,bark,x,y+h*.375,z,6);
    for(let j=0;j<3;j++){const a=j/3*Math.PI*2+i*.9,o=k.mesh(g,new THREE.IcosahedronGeometry(h*.25,1),leaves[(i+j)%3],x+Math.cos(a)*h*.10,y+h*(.72+j*.045),z+Math.sin(a)*h*.10);o.scale.set(1.2,1.05,.95);}
  }
  for(let i=0;i<34;i++){
    const a=i*2.399,r=Math.sqrt((i+.6)/34),x=.29+Math.cos(a)*.19*r,z=-.29+Math.sin(a)*.12*r;
    tree(x,z,hillside(x,z),.068+(i%4)*.008,i);
  }
  for(let i=0;i<23;i++){const a=i*2.399,r=Math.sqrt((i+.5)/23),x=.29+Math.cos(a)*.18*r,z=.49+Math.sin(a)*.075*r;tree(x,z,southernHill(x,z),.068+(i%3)*.008,i+34);}
  for(let i=0;i<15;i++){const x=-.39+i*.054,z=-.57+Math.sin(i*.7)*.012;tree(x,z,.011,.065+(i%3)*.012,i+57);}
  for(let i=0;i<8;i++)tree(-.54+Math.sin(i)*.012,-.27+i*.074,.011,.070+(i%3)*.006,i+72);
  // Reeds define the wet edge, not a ring of unrelated trees.
  for(let i=0;i<50;i++){const a=2.65+i/49*.9,x=Math.cos(a)*.445,z=.10+Math.sin(a)*.34;for(let j=0;j<3;j++)k.beam(g,[x+j*.003,.017,z],[x+j*.003-.004,.035+(i%4)*.003,z+.006],.0008,leaves[j],4);}
  function boardwalk(points,width,pi=false){
    const c=curve(points,.052),p=c.getPoints(100);ribbon(k,g,p,width,deck);
    for(const side of [-1,1]){
      const r=p.map((v,i)=>{const t=c.getTangent(i/100),n=new THREE.Vector3(-t.z,0,t.x);return [v.x+n.x*width/2*side,.082,v.z+n.z*width/2*side];});
      k.line(g,r,.0016,rail);k.line(g,r.map(([x,y,z])=>[x,.061,z]),.0011,rail);
      for(let i=0;i<=100;i+=4){const [x,,z]=r[i];k.cyl(g,.0012,.0013,.031,rail,x,.0665,z,5);}
      if(pi)k.line(g,r.map(([x,,z],i)=>[x,.069+.008*Math.sin(i*.30),z]),.0012,rail);
      k.line(g,r.map(([x,,z])=>[x,.055,z]),.0011,light);
    }
    for(let i=0;i<=100;i+=4){const v=p[i],t=c.getTangent(i/100),n=new THREE.Vector3(-t.z,0,t.x);k.beam(g,[v.x-n.x*width/2,.053,v.z-n.z*width/2],[v.x+n.x*width/2,.053,v.z+n.z*width/2],.0005,wood,4);}
    for(let i=0;i<=100;i+=10){const v=p[i];k.cyl(g,.004,.005,.039,dark,v.x,.0315,v.z,6);}
    return c;
  }
  const pi=boardwalk([[-.41,.31],[-.28,.43],[-.07,.47],[.15,.43],[.27,.34]],.052,true);
  // East star bridge: staggered steel columns with little round light openings.
  const stars=boardwalk([[.30,-.16],[.272,-.03],[.275,.14],[.28,.28],[.27,.34]],.061);
  for(let i=0;i<15;i++){
    const p=stars.getPoint(.05+i/14*.9),side=i%2?1:-1,x=p.x+side*.016,z=p.z,h=.075+(i%4)*.018;
    k.cyl(g,.0048,.0048,h,dark,x,.052+h/2,z,12);k.cyl(g,.0049,.0049,h*.22,rail,x,.052+h*.41,z,12);
    for(let row=0;row<7;row++)for(let col=0;col<4;col++){const a=col/4*Math.PI+row*.7;const dot=k.mesh(g,new THREE.SphereGeometry(.0011,6,4),i%3?light:blueLight,x+Math.cos(a)*.0049,.057+row/7*h,z+Math.sin(a)*.0049);dot.scale.y=.85;}
  }
  // Small, specific viewing terraces and descending shore steps.
  for(const [x,z,angle] of [[-.425,.08,-.14],[-.32,-.43,.55]]){
    const terrace=new THREE.Group();terrace.position.set(x,0,z);terrace.rotation.y=angle;
    for(let i=0;i<3;i++)k.box(terrace,.105,.006,.030,walk,0,.035-i*.006,i*.024);
    k.box(terrace,.10,.005,.014,wood,0,.058,-.01);for(const dx of [-.035,.035])k.box(terrace,.004,.024,.008,dark,dx,.043,-.01);g.add(terrace);
  }
  // Selective path lighting leaves the lake and planted interior calm at night.
  for(let i=0;i<run.length;i+=12){const p=run[i];k.cyl(g,.0017,.002,.031,dark,p.x,.032,p.z);k.box(g,.006,.005,.006,light,p.x,.049,p.z);}
  for(let i=0;i<13;i++){const p=run[(i*13+7)%run.length],shirt=i%2?pink:dark;k.cyl(g,.0028,.0035,.011,shirt,p.x,.029,p.z,6);k.mesh(g,new THREE.SphereGeometry(.0031,8,6),sand,p.x,.038,p.z);}
  // A curved low lawn sign, painted geometry rather than a copied photograph.
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=180;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,180);ctx.font='bold 116px "Microsoft YaHei", sans-serif';ctx.fillStyle='#d5c5a2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('深圳人才公园',512,88,990);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.1,roughness:.9,side:THREE.DoubleSide});k.materials.push(mat);k.mesh(g,new THREE.PlaneGeometry(.27,.047),mat,-.12,.049,-.565);
  }
  k.merge(g);g.userData.parkFeatures=['enclosed-lake','north-inlet','east-peninsula','star-bridge','pi-boardwalk','shore-steps','blue-running-path'];
  g.userData.waterSamples=[[-.20,0],[-.10,.25],[.08,-.05]];
  g.userData.bridgeSamples=[pi.getPoint(.5).toArray(),stars.getPoint(.5).toArray()];return g;
}
