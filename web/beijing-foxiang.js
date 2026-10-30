import * as THREE from 'three';
import {plaque} from './wuhan-architecture.js';

const STEP=Math.PI/4;
function octPoint(a,r){const mid=(Math.floor(a/STEP)+.5)*STEP,rr=r*Math.cos(STEP/2)/Math.cos(a-mid);return [Math.sin(a)*rr,Math.cos(a)*rr];}

// Eight planar faces, open columned balconies, painted beams and four orange
// tiled roofs with dark green rims distinguish Foxiang from a circular pagoda.
export function foxiang(k){
  const g=new THREE.Group(),p={red:k.mat('#8d3329',.9),stone:k.mat('#d3c9ab',.94),wall:k.mat('#8c3029',.92),dark:k.mat('#2c302a',.92),green:k.mat('#305b52',.85),blue:k.mat('#274f63',.88),gold:k.mat('#b49b53',.85),tile:k.mat('#b7762f',.86),light:k.mat('#d5b77b',.80,.05,'#edce95')};
  p.light.userData.night.intensity=.26;
  p.tile.userData.night={color:p.tile.color.clone(),intensity:.12};
  function panel(side,r,y,w,h,mat){const a=(side+.5)*STEP,[x,z]=octPoint(a,r),m=k.box(g,w,h,.003,mat,x,y,z);m.rotation.y=a;return m;}
  function octRing(r,y,mat,width=.0016){const pts=Array.from({length:9},(_,i)=>[Math.sin(i*STEP)*r,y,Math.cos(i*STEP)*r]);for(let i=0;i<8;i++)k.beam(g,pts[i],pts[i+1],width,mat,5);}
  function tiledRoof(r,inner,y,h,top=false){
    const positions=[],indices=[];
    const height=t=>y+h*Math.pow(1-t,1.8)+.010*Math.pow(t,7);
    for(let side=0;side<8;side++){
      const base=positions.length/3;
      for(let row=0;row<=18;row++)for(let col=0;col<=10;col++){
        const t=row/18,rr=inner+(r-inner)*t,a=(side+col/10)*STEP,[x,z]=octPoint(a,rr),corner=Math.pow(Math.abs(col/5-1),3)*.007*Math.pow(t,3);
        positions.push(x,height(t)+corner,z);
        if(row&&col){const n=base+row*11+col;indices.push(n-12,n-1,n-11,n-11,n-1,n);}
      }
      // Dense tile courses follow each straight octagonal eave face.
      for(let col=0;col<=14;col++){
        const a=(side+col/14)*STEP,pts=[];
        for(let row=0;row<=18;row++){const t=row/18,[x,z]=octPoint(a,inner+(r-inner)*t),corner=Math.pow(Math.abs(col/7-1),3)*.007*Math.pow(t,3);pts.push([x,height(t)+corner+.0007,z]);}
        k.line(g,pts,col===0||col===14?.0016:.00085,col===0||col===14?p.green:p.tile);
      }
      const a=side*STEP,b=(side+1)*STEP,points=[];
      for(let j=0;j<=16;j++){const t=j/16,[x,z]=octPoint(a+(b-a)*t,r);points.push([x,y+.010+.007*Math.pow(Math.abs(t*2-1),3),z]);}
      k.line(g,points,.003,p.green);
      const glowPoints=points.map(([x,yy,z])=>[x*.97,yy-.008,z*.97]);k.line(g,glowPoints,.0011,p.light);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const mat=p.tile;mat.userData.foxiangRoof=true;k.mesh(g,geo,mat);
    // A small octagonal cap closes the top where roof ridges meet the finial.
    if(top){k.cyl(g,inner,inner,.004,p.green,0,y+h-.001,0,8);k.cyl(g,.005,.009,.016,p.green,0,y+h+.007,0,8);k.cyl(g,.0055,.0065,.018,p.gold,0,y+h+.023,0,12);k.ball(g,.006,p.gold,0,y+h+.034,0);}
  }
  const levels=[{floor:.036,top:.145,core:.110,outer:.145},{floor:.183,top:.252,core:.102,outer:.133},{floor:.289,top:.342,core:.100,outer:.112}];
  for(let level=0;level<3;level++){
    const q=levels[level];k.cyl(g,q.outer,q.outer,.008,p.green,0,q.floor,0,8);k.cyl(g,q.core,q.core,q.top-q.floor,p.wall,0,(q.floor+q.top)/2,0,8);
    for(let side=0;side<8;side++){
      const width=2*q.core*Math.sin(STEP/2),mid=(side+.5)*STEP;
      panel(side,q.core+.001,(q.floor+q.top)/2,width*.75,(q.top-q.floor)*.70,p.dark);
      for(let i=-2;i<=2;i++){
        const [x,z]=octPoint(mid,q.core+.003),offset=i*width*.13,m=k.box(g,.0012,(q.top-q.floor)*.66,.0017,p.gold,x+Math.cos(mid)*offset,(q.floor+q.top)/2,z-Math.sin(mid)*offset);m.rotation.y=mid;
      }
      for(const f of [.29,.50,.71])panel(side,q.core+.004,q.floor+(q.top-q.floor)*f,width*.72,.0012,p.gold);
      const a=side*STEP,b=(side+1)*STEP,pa=octPoint(a,q.outer),pb=octPoint(b,q.outer);
      for(const t of [0,.5]){
        const x=THREE.MathUtils.lerp(pa[0],pb[0],t),z=THREE.MathUtils.lerp(pa[1],pb[1],t);
        k.cyl(g,.0027,.0033,q.top-q.floor-.003,p.red,x,(q.top+q.floor)/2,z,8);
        for(let j=0;j<3;j++){const a=mid,m=k.box(g,.010+j*.005,.003,.009+j*.004,j===1?p.gold:p.green,x,q.top-.013+j*.003,z);m.rotation.y=a;}
      }
      const span=2*q.outer*Math.sin(STEP/2);panel(side,q.outer,q.top-.010,span,.016,p.blue);panel(side,q.outer+.002,q.top-.011,span*.96,.002,p.gold);
      for(const t of [-.31,0,.31]){
        const [x,z]=octPoint(mid,q.outer+.004),diamond=k.box(g,.006,.006,.001,p.gold,x+Math.cos(mid)*span*t,q.top-.010,z-Math.sin(mid)*span*t);diamond.rotation.set(0,mid,Math.PI/4);
      }
      if(level<2){
        // Balustrades and their painted fascia are outside the recessed doors.
        panel(side,q.outer+.001,q.floor-.006,span,.015,p.blue);panel(side,q.outer+.003,q.floor-.005,span*.95,.004,p.gold);
        for(let i=0;i<=7;i++){const t=i/7,x=THREE.MathUtils.lerp(pa[0],pb[0],t),z=THREE.MathUtils.lerp(pa[1],pb[1],t);k.cyl(g,.0009,.0012,.021,p.red,x,q.floor+.013,z,5);}
        k.beam(g,[pa[0],q.floor+.023,pa[1]],[pb[0],q.floor+.023,pb[1]],.0014,p.red,5);
      }
    }
  }
  for(const [r,inner,y,h,top]of [[.178,.119,.018,.033,false],[.173,.103,.145,.043,false],[.153,.101,.252,.040,false],[.142,.006,.342,.066,true]])tiledRoof(r,inner,y,h,top);
  for(const [r,y]of [[.145,.024],[.133,.173],[.112,.279]])octRing(r,y,p.green,.002);
  plaque(k,g,'佛香阁',.042,.027,0,.324,.103);
  // The lowest eave covers an entrance storey, rather than resting on the plinth.
  for(const child of g.children)child.position.y+=.08;
  k.cyl(g,.148,.151,.012,p.stone,0,.006,0,8);
  k.cyl(g,.124,.124,.081,p.wall,0,.052,0,8);
  for(let side=0;side<8;side++){
    const a=side*STEP,[x,z]=octPoint(a,.145);k.cyl(g,.0032,.004,.083,p.red,x,.054,z,8);
    panel(side,.126,.051,.063,.066,p.dark);
    for(const f of [.031,.049,.067])panel(side,.129,f,.063,.0013,p.gold);
  }
  g.userData={levels:levels.map(q=>({...q,floor:q.floor+.08,top:q.top+.08})),top:.522,roofs:4};return k.merge(g);
}
