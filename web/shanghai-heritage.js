import * as THREE from 'three';

const R=1.85;
export const sag=(x,z)=>Math.sqrt(Math.max(.001,R*R-x*x-z*z))-R;

// Ground-level surfaces follow the globe; each building retains its own vertical walls.
export function groundPatch(k,g,outline,material,lift=.008){
  const shape=new THREE.Shape(outline.map(p=>new THREE.Vector2(...p)));
  const flat=new THREE.ShapeGeometry(shape,12),p=flat.attributes.position,vertices=[];
  function tri(a,b,c,depth=0){
    if(depth<5&&Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(b[0]-c[0],b[1]-c[1]),Math.hypot(c[0]-a[0],c[1]-a[1]))>.05){
      const mid=(u,v)=>[(u[0]+v[0])/2,(u[1]+v[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);tri(a,ab,ca,depth+1);tri(ab,b,bc,depth+1);tri(ca,bc,c,depth+1);tri(ab,bc,ca,depth+1);
    }else for(const [x,z] of [c,b,a])vertices.push(x,sag(x,z)+lift,z);
  }
  for(let i=0;i<flat.index.count;i+=3){const v=[0,1,2].map(j=>{const n=flat.index.getX(i+j);return [p.getX(n),p.getY(n)];});tri(...v);}
  flat.dispose();const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();return k.mesh(g,geo,material);
}
export function groundRect(k,g,x,z,w,d,material,lift=.008){
  // Fine subdivisions prevent a large courtyard from cutting through the spherical land.
  const geo=new THREE.PlaneGeometry(w,d,Math.ceil(w/.035),Math.ceil(d/.035));geo.rotateX(-Math.PI/2);geo.translate(x,0,z);
  const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,sag(p.getX(i),p.getZ(i))+lift);geo.computeVertexNormals();return k.mesh(g,geo,material);
}
export function at(g,x,z,y=0,rotation=0){const n=new THREE.Group();n.position.set(x,sag(x,z)+y,z);n.rotation.y=rotation;g.add(n);return n;}

export function tiledRoof(k,g,w,d,y,rise,roof,ridge,light){
  const verts=[],indices=[],N=22,M=12;
  const point=(u,v)=>{const x=(u-.5)*w,s=Math.abs(v),hip=Math.max(0,(Math.abs(x)-w*.26)/(w*.24));return [x,y+rise*(1-s)**1.6*(1-hip*.75)+.010*s**7+.010*hip**6,v*d/2];};
  for(const side of [-1,1]){
    const off=verts.length/3;
    for(let j=0;j<=M;j++)for(let i=0;i<=N;i++)verts.push(...point(i/N,side*j/M));
    for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=off+j*(N+1)+i,b=a+N+1;indices.push(...(side===1?[a,b,a+1,a+1,b,b+1]:[a,a+1,b,a+1,b+1,b]));}
    for(let i=0;i<=N;i++)k.line(g,Array.from({length:7},(_,j)=>point(i/N,side*j/6)),.0007,ridge);
    k.line(g,Array.from({length:N+1},(_,i)=>point(i/N,side)),.0017,light||ridge);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();k.mesh(g,geo,roof);
  k.line(g,[[-w*.30,y+rise+.013,0],[-w*.23,y+rise+.003,0],[w*.23,y+rise+.003,0],[w*.30,y+rise+.013,0]],.0026,ridge);
  for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])k.line(g,[[x*.76,y+.006,z*.76],[x,y+.019,z],[x*1.035,y+.031,z*1.035]],.0022,ridge);
}

export function hall(k,g,{x=0,z=0,w=.22,d=.14,h=.12,levels=1,rotation=0,raised=.015},m){
  const a=at(g,x,z,0,rotation);k.box(a,w+.022,raised,d+.025,m.stone,0,raised/2);
  for(let level=0;level<levels;level++){
    const y=raised+level*h;
    k.box(a,w*.88,h*.83,d*.78,m.wall,0,y+h*.42);
    for(const side of [-1,1])for(let i=-3;i<=3;i++){
      k.box(a,w/11,h*.41,.003,m.window,i*w/8,y+h*.46,side*(d*.40+.002));
      k.box(a,.002,h*.41,.004,m.wood,i*w/8,y+h*.46,side*(d*.40+.004));
      for(const dy of [-.10,.10])k.box(a,w/11,.0017,.004,m.wood,i*w/8,y+h*(.46+dy),side*(d*.40+.004));
      k.cyl(a,.0028,.0032,h*.86,m.wood,i*w/8,y+h*.43,side*d*.48,8);
      k.box(a,w/9,.005,.010,m.wood,i*w/8,y+h*.84,side*d*.48);
    }
    k.box(a,w,.007,d*.94,m.wood,0,y+h*.82);
    for(const side of [-1,1]){
      k.box(a,w,.002,.003,m.light,0,y+h*.83,side*d*.48);
      for(let j=-2;j<=2;j++)k.box(a,.003,h*.39,d/10,m.window,side*w*.445,y+h*.46,j*d/7);
    }
    tiledRoof(k,a,w+.045,d+.045,y+h*.86,h*.31,m.roof,m.ridge,m.light);
  }
  for(let i=0;i<4;i++)k.box(a,w*.45,.003,d*.12,m.stone,0,.002+i*.003,d*.57-i*.006);
  return a;
}

export function gardenTree(k,g,x,z,h,m,trunk){
  const a=at(g,x,z);k.cyl(a,.004,.006,h,trunk,0,h/2,0,7);
  for(let i=0;i<3;i++){const o=k.mesh(a,new THREE.IcosahedronGeometry(.027,1),m,(i-1)*.015,h+.006+(i%2)*.015,Math.sin(i*4)*.014);o.scale.set(1.15,.85,1);}
}
