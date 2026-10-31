import * as THREE from 'three';

export function nest(k){
  const g=new THREE.Group(),steel=k.mat('#a9ada9',.52,.42),red=k.mat('#76392e',.8,.06,'#d95632'),dark=k.mat('#434b4c'),stone=k.mat('#cecabd');red.userData.night.intensity=.42;
  const plaza=k.cyl(g,.57,.57,.018,stone,0,.009,0,96);plaza.scale.z=.78;
  // Bowl and open centre; the structural skin is a separate lattice.
  for(let i=0;i<9;i++){
    const y=.022+i*.018,r=.24+i*.018,o=k.mesh(g,new THREE.RingGeometry(r-.018,r,96),red,0,y,0);o.rotation.x=-Math.PI/2;o.scale.y=.75;
  }
  const inside=k.cyl(g,.24,.24,.008,dark,0,.022,0,64);inside.scale.z=.72;
  const shape=(a,t)=>{const r=.47-.10*t+.036*Math.sin(t*Math.PI);return [Math.cos(a)*r,.035+t*(.22+.045*Math.cos(a*2)),Math.sin(a)*r*.74];};
  for(let i=0;i<48;i++){
    const a=i/48*Math.PI*2,lean=(i%3-1)*.26;
    k.line(g,Array.from({length:14},(_,j)=>shape(a+lean*j/13,j/13)),.0050,steel);
    k.line(g,Array.from({length:14},(_,j)=>shape(a+.32-.72*j/13,j/13)),.0045,steel);
    if(i%2===0)k.line(g,Array.from({length:14},(_,j)=>shape(a+.65*j/13,.10+.85*j/13)),.0034,steel);
  }
  for(const t of [0,.59,1])k.line(g,Array.from({length:97},(_,i)=>shape(i/96*Math.PI*2,t)),.0035,steel,true);
  const roofVertices=[],roofIndices=[];
  for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;for(const r of [.235,.375])roofVertices.push(Math.cos(a)*r,.238+.045*Math.cos(a*2),Math.sin(a)*r*.74);if(i<96){const n=i*2;roofIndices.push(n,n+2,n+1,n+1,n+2,n+3);}}
  const roofGeometry=new THREE.BufferGeometry();roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roofVertices,3));roofGeometry.setIndex(roofIndices);roofGeometry.computeVertexNormals();const membrane=k.mat('#8b8f8c',.72,.12);membrane.side=THREE.DoubleSide;k.mesh(g,roofGeometry,membrane);
  // Wide criss-crossing roof stays open over the stadium's centre.
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;const pts=[];for(let j=0;j<13;j++){const u=j/12,r=.37-.095*Math.sin(u*Math.PI),angle=a+u*.42;pts.push([Math.cos(angle)*r,.25+.045*Math.cos(angle*2)+.012*Math.sin(u*Math.PI),Math.sin(angle)*r*.74]);}k.line(g,pts,.0034,steel);}
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2,door=k.box(g,.018,.035,.006,dark,Math.cos(a)*.47,.035,Math.sin(a)*.348);door.rotation.y=-a+Math.PI/2;}
  return k.merge(g);
}

function slantedVolume(k,g,a,b,w,d,mat,ribs){
  const v=[];for(const p of [a,b])for(const [x,z] of [[-1,-1],[1,-1],[1,1],[-1,1]])v.push(p[0]+x*w/2,p[1],p[2]+z*d/2);
  const ix=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();k.mesh(g,geo,mat);
  for(const s of [-1,1])for(let i=0;i<=18;i++){
    const t=i/18,c=a.map((x,j)=>x+(b[j]-x)*t);
    k.beam(g,[c[0]-w/2,c[1],c[2]+s*d/2],[c[0]+w/2,c[1],c[2]+s*d/2],.0008,ribs,4);
    if(i<16&&i%2===0){const u=(i+3)/18,e=a.map((x,j)=>x+(b[j]-x)*u);for(const dir of [-1,1])k.beam(g,[c[0]+dir*w/2,c[1],c[2]+s*d/2+.001*s],[e[0]-dir*w/2,e[1],e[2]+s*d/2+.001*s],.0019,ribs,4);}
  }
}
export function cctv(k){
  const g=new THREE.Group(),stone=k.mat('#bbbeb5'),glass=k.glass('#65818a','#e3dbc0',83),ribs=k.mat('#394d55',.57,.35);glass.side=THREE.DoubleSide;glass.userData.night.intensity=.6;
  k.box(g,.72,.02,.52,stone,0,.01,0);
  const outer=[[-.30,.025],[-.18,.79],[.23,.68],[.31,.025]],inner=[[-.125,.14],[-.045,.54],[.105,.48],[.155,.14]];
  const shape=new THREE.Shape();outer.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const hole=new THREE.Path();inner.forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();shape.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:false,steps:8}),pos=geo.attributes.position;
  // The two legs occupy different depths; the upper cantilever joins them in 3D.
  const skew=(x,y)=>-.07+y*.13-x*.55;for(let i=0;i<pos.count;i++)pos.setZ(i,pos.getZ(i)+skew(pos.getX(i),pos.getY(i)));geo.computeVertexNormals();k.mesh(g,geo,glass);
  const contains=(poly,x,y)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
  const valid=(x,y)=>contains(outer,x,y)&&!contains(inner,x,y);
  for(const side of [0,.19])for(const slope of [-1.7,1.7])for(let c=-1.4;c<1.5;c+=.12){let run=[];for(let i=0;i<=240;i++){const x=-.32+i*.65/240,y=slope*x+c;if(valid(x,y)){run.push([x,y,skew(x,y)+side+(side? .001:-.001)]);}else if(run.length){if(run.length>1)k.beam(g,run[0],run.at(-1),.0018,ribs,4);run=[];}}if(run.length>1)k.beam(g,run[0],run.at(-1),.0018,ribs,4);}
  for(const poly of [outer,inner])for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];for(const side of [0,.19])k.beam(g,[...a,skew(...a)+side],[...b,skew(...b)+side],.0025,ribs,4);}
  return k.merge(g);
}
