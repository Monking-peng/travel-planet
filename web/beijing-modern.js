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

function clip(poly,nx,ny,c){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*ny-c,db=b[0]*nx+b[1]*ny-c;if(da<=0)out.push(a);if((da<0)!==(db<0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
function foamFace(k,g,w,h,origin,u,v,normal,materials,seed){
  const points=[],cols=Math.round(w/.078),rows=Math.max(3,Math.round(h/.078));for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)points.push([(x+.5+.28*Math.sin(x*7+y*11+seed))*w/cols-w/2,(y+.5+.27*Math.cos(x*13+y*3+seed))*h/rows-h/2]);
  const rim=k.mat('#bdced0',.47,.22);
  points.forEach((p,i)=>{let cell=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];for(let j=0;j<points.length&&cell.length;j++){if(i===j)continue;const q=points[j];cell=clip(cell,q[0]-p[0],q[1]-p[1],(q[0]*q[0]+q[1]*q[1]-p[0]*p[0]-p[1]*p[1])/2);}if(cell.length<3)return;
    const map=(a,b,lift)=>origin.map((n,j)=>n+u[j]*a+v[j]*b+normal[j]*lift),vertices=[...map(p[0],p[1],.008)],idx=[],n=cell.length;
    for(const r of [.33,.68,1])cell.forEach(([a,b])=>vertices.push(...map(p[0]+(a-p[0])*r,p[1]+(b-p[1])*r,.008*Math.sqrt(1-r*r))));
    for(let j=0;j<n;j++){const next=(j+1)%n;idx.push(0,1+j,1+next);for(let ring=0;ring<2;ring++){const a=1+ring*n+j,b=1+ring*n+next;idx.push(a,a+n,b,b,a+n,b+n);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(idx);geo.computeVertexNormals();const mat=materials[i%materials.length];mat.side=THREE.DoubleSide;k.mesh(g,geo,mat);
    cell.forEach((a,j)=>k.beam(g,map(...a,.001),map(...cell[(j+1)%cell.length],.001),.0012,rim,4));
  });
}
export function watercube(k){
  const g=new THREE.Group(),base=k.mat('#cccbbf'),blue=['#96b8c2','#7da6b7','#a1c3cb','#6e98b0'].map((color,i)=>{const m=k.mat(color,.37,.17,'#45a5e0');m.userData.night.intensity=.5+i*.09;m.userData.pulse={speed:.32,phase:i*.7};return m;});
  k.box(g,.74,.019,.67,base,0,.009,0);k.box(g,.65,.207,.58,k.mat('#3b647a',.3,.2),0,.126,0);
  for(const s of [-1,1]){
    foamFace(k,g,.65,.21,[0,.13,s*.292],[1,0,0],[0,1,0],[0,0,s],blue,s+2);
    foamFace(k,g,.58,.21,[s*.327,.13,0],[0,0,1],[0,1,0],[s,0,0],blue,s+5);
  }
  foamFace(k,g,.65,.58,[0,.237,0],[1,0,0],[0,0,1],[0,1,0],blue,9);
  const glass=k.glass('#416676','#b9ecff',37);k.box(g,.18,.035,.006,glass,0,.035,.302);for(let i=0;i<6;i++)k.box(g,.002,.035,.008,base,(i/5-.5)*.18,.035,.306);
  return k.merge(g);
}

export function theatre(k){
  const g=new THREE.Group(),stone=k.mat('#c7c7ba'),water=k.mat('#507d89',.29,.2),metal=k.mat('#a3afb4',.40,.57),glass=k.mat('#567d8d',.25,.4,'#b8d6db'),seam=k.mat('#758d98',.55,.28);glass.userData.night.intensity=.42;
  const ground=k.cyl(g,.66,.66,.014,stone,0,.007,0,96);ground.scale.z=.77;const pool=k.cyl(g,.60,.60,.013,water,0,.019,0,96);pool.scale.z=.73;
  const point=(a,t)=>[Math.cos(a)*Math.sin(t)*.48,.024+Math.cos(t)*.218,Math.sin(a)*Math.sin(t)*.325];
  for(let sector=0;sector<72;sector++){
    const verts=[],idx=[];for(let row=0;row<=24;row++)for(let col=0;col<2;col++)verts.push(...point((sector+col)/72*Math.PI*2,row/24*Math.PI/2));
    for(let j=0;j<24;j++){const a=j*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geom.setIndex(idx);geom.computeVertexNormals();const angle=(sector+.5)/72*Math.PI*2,glazed=Math.abs(Math.cos(angle))<.31;
    const m=glazed?glass:metal;m.side=THREE.DoubleSide;k.mesh(g,geom,m);
    if(sector%3===0)k.line(g,Array.from({length:25},(_,j)=>point(sector/72*Math.PI*2,j/24*Math.PI/2)),.0009,seam);
  }
  for(let j=2;j<24;j+=2)k.line(g,Array.from({length:96},(_,i)=>point(i/96*Math.PI*2,j/24*Math.PI/2)),.0008,seam,true);
  for(const s of [-1,1]){k.box(g,.18,.004,.09,stone,0,.028,s*.42);k.box(g,.14,.005,.04,k.mat('#304c58'),0,.024,s*.41);}
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
