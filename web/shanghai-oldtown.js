import * as THREE from 'three';

// Locally authored geometry, observed from the photographs listed in SHANGHAI_PLAN.md.
function plate(k,g,points,y,h,material){
  const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});geo.rotateX(-Math.PI/2);return k.mesh(g,geo,material,0,y,0);
}
function edgeGroup(g,a,b){
  const o=new THREE.Group();o.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);o.rotation.y=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);g.add(o);return o;
}

export function waibaidu(k){
  const g=new THREE.Group(),steel=k.mat('#7d9396',.53,.4),dark=k.mat('#596f72',.63,.3),deck=k.mat('#8b8e84'),stone=k.mat('#b6b5a3'),light=k.mat('#d5c7a3',.5,.2,'#e7bd70');
  light.userData.night.intensity=1.15;
  k.box(g,.078,.009,.28,deck,0,.043);
  for(const x of [-.041,.041])k.box(g,.012,.006,.28,stone,x,.050);
  for(const z of [-.136,0,.136]){k.box(g,.10,.036,.018,stone,0,.018,z);k.box(g,.105,.006,.023,stone,0,.037,z);}
  // Two independent camelback trusses, with a lowered joint over the central pier.
  for(const start of [-.132,0]){
    const top=[.055,.086,.099,.104,.104,.099,.086,.055],step=.132/7;
    for(const x of [-.032,.032]){
      for(let j=0;j<7;j++){
        const a=start+j*step,b=a+step;
        k.beam(g,[x,top[j],a],[x,top[j+1],b],.0018,steel);
        k.beam(g,[x,.052,a],[x,.052,b],.0018,dark);
        k.beam(g,[x,.052,a],[x,top[j+1],b],.0011,steel);
        k.beam(g,[x,top[j],a],[x,.052,b],.0011,steel);
      }
      for(let j=0;j<8;j++)k.beam(g,[x,.052,start+j*step],[x,top[j],start+j*step],.0014,steel);
    }
    for(let j=1;j<7;j++){
      const z=start+j*step;k.beam(g,[-.032,top[j],z],[.032,top[j],z],.0012,steel);
      if(j<6){k.beam(g,[-.032,top[j],z],[.032,top[j+1],z+step],.0009,dark);k.beam(g,[.032,top[j],z],[-.032,top[j+1],z+step],.0009,dark);}
    }
  }
  for(const x of [-.047,.047]){
    k.beam(g,[x,.063,-.14],[x,.063,.14],.0012,steel);k.beam(g,[x,.056,-.14],[x,.056,.14],.0009,light);
    for(let z=-.14;z<=.141;z+=.014)k.beam(g,[x,.051,z],[x,.064,z],.0008,steel);
  }
  for(let z=-.12;z<.14;z+=.034)k.box(g,.0015,.001,.013,stone,0,.048,z);
  for(const side of [-1,1]){
    const p=[[-.039,.047,side*.14],[.039,.047,side*.14],[-.039,-.008,side*.205],[.039,-.008,side*.205]],geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(p.flat(),3));geo.setIndex(side>0?[0,2,1,1,2,3]:[0,1,2,1,3,2]);geo.computeVertexNormals();k.mesh(g,geo,deck);
  }
  return k.merge(g);
}

export function wukang(k){
  const g=new THREE.Group(),brick=k.mat('#ad6550',.94,0),stone=k.mat('#c6bdaa',.88,0),cornice=k.mat('#e0d6bc'),glass=k.mat('#536d6e',.4,.23,'#e1b67b'),iron=k.mat('#526260',.6,.3);
  glass.userData.night.intensity=.48;
  // Rounded thirty-degree prow, tapering into two long street facades.
  const outline=[[0,.247],[.014,.242],[.023,.226],[.134,-.24],[-.134,-.24],[-.023,.226],[-.014,.242]];
  const pavement=outline.map(([x,z])=>[x*1.15,z*1.08]);plate(k,g,pavement,-.018,.024,k.mat('#cbc4b1'));
  plate(k,g,outline,.064,.205,brick);plate(k,g,outline.map(([x,z])=>[x*.77,z*.82]),0,.065,stone);
  for(const y of [.063,.078,.244,.267,.278])plate(k,g,outline.map(([x,z])=>[x*1.025,z*1.015]),y,.006,y>.24?cornice:stone);
  plate(k,g,outline.map(([x,z])=>[x*.94,z*.97]),.274,.012,k.mat('#8c8d80'));
  for(const [a,b] of [[outline[2],outline[3]],[outline[4],outline[5]]]){
    const edge=edgeGroup(g,a,b),length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=14,spacing=length/count;
    for(let col=0;col<count;col++){
      const x=-length/2+(col+.5)*spacing;
      // The arcade is physically open below the arch, not a dark painted window.
      const arch=new THREE.Shape(),w=spacing*.96,h=.064,r=spacing*.34;
      arch.moveTo(-w/2,0);arch.lineTo(-w/2,h);arch.lineTo(w/2,h);arch.lineTo(w/2,0);arch.lineTo(r,0);arch.lineTo(r,.029);arch.quadraticCurveTo(0,.063,-r,.029);arch.lineTo(-r,0);arch.closePath();
      k.mesh(edge,new THREE.ExtrudeGeometry(arch,{depth:.005,bevelEnabled:false}),stone,x,0,0);
      k.box(edge,spacing*.60,.012,.002,glass,x,.052,.006);
      for(let row=0;row<6;row++){
        const y=.094+row*.0285;
        k.box(edge,.017,.020,.003,cornice,x,y,.002);
        k.box(edge,.014,.017,.004,glass,x,y,.004);
        k.box(edge,.001,.017,.001,stone,x,y,.0065);k.box(edge,.014,.001,.001,stone,x,y,.0065);
        if(row>0&&row<5&&col%3===1){k.box(edge,.023,.002,.012,stone,x,y-.012,.007);k.box(edge,.023,.006,.001,iron,x,y-.008,.013);for(const s of [-1,1])k.box(edge,.003,.023,.006,brick,x+s*.014,y,.006);}
      }
    }
  }
  // Rounded tip balconies and parapet are the most visible silhouette from the junction.
  for(let row=0;row<7;row++){
    const y=.084+row*.0276;
    k.box(g,.027,.019,.003,glass,0,y+.009,.246);
    k.box(g,.033,.0025,.015,cornice,0,y-.003,.245);
    k.box(g,.033,.006,.001,iron,0,y+.001,.253);
    for(const x of [-.015,.015])k.box(g,.002,.025,.007,stone,x,y+.008,.247);
  }
  for(const x of [-.084,0,.084])k.box(g,.023,.016,.027,stone,x,.289,-.20);
  return k.merge(g);
}

export function huxinting(k){
  const g=new THREE.Group(),wood=k.mat('#844334',.82,0),roof=k.mat('#3f4442',.9,.05),ridge=k.mat('#5d625e',.86,.05),stone=k.mat('#d7d1bc'),window=k.mat('#6c7870',.45,.12,'#e8b16b'),lantern=k.mat('#b43b2c',.64,0,'#ff6833'),water=k.mat('#688f82',.36,.18),edgeLight=k.mat('#b9a278',.65,.1,'#ddb06d');
  window.userData.night.intensity=.75;lantern.userData.night.intensity=1.2;edgeLight.userData.night.intensity=1.1;
  lantern.userData.pulse={phase:1.2,speed:.8,min:.72};edgeLight.userData.pulse={phase:.3,speed:.7,min:.70};
  const uplight=k.mat('#855541',.76,0,'#e99744');uplight.userData.night.intensity=.55;
  uplight.userData.pulse={phase:2.7,speed:.7,min:.78};
  const pond=[[-.23,-.17],[-.08,-.20],[.18,-.17],[.25,-.04],[.23,.16],[.09,.22],[-.12,.21],[-.25,.09]];
  function poolSurface(points,lift,material){
    const contour=points.map(([x,z])=>new THREE.Vector2(x,z)),faces=THREE.ShapeUtils.triangulateShape(contour,[]),pos=[];
    function triangle(a,b,c,n){
      if(n){const mid=(v,w)=>[(v[0]+w[0])/2,(v[1]+w[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);triangle(a,ab,ca,n-1);triangle(ab,b,bc,n-1);triangle(ca,bc,c,n-1);triangle(ab,bc,ca,n-1);return;}
      for(const [x,z] of [a,c,b])pos.push(x,lift+Math.sqrt(1.85**2-x*x-z*z)-1.85,z);
    }
    for(const [a,b,c] of faces)triangle(points[a],points[b],points[c],3);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();k.mesh(g,geo,material);
  }
  poolSurface(pond,.006,stone);poolSurface(pond.map(([x,z])=>[x*.96,z*.96]),.007,water);
  function tiledRoof(group,w,d,y,rise){
    const positions=[],indices=[],N=18,M=10;
    function p(u,v){const x=(u-.5)*w,z=v*d/2,s=Math.abs(v),hip=Math.max(0,(Math.abs(x)-w*.27)/(w*.23));return [x,y+rise*(1-s)**2*(1-hip*.7)+.009*s**6+.009*hip**5,z];}
    for(const side of [-1,1]){
      const off=positions.length/3;
      for(let j=0;j<=M;j++)for(let i=0;i<=N;i++)positions.push(...p(i/N,side*j/M));
      for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=off+j*(N+1)+i,b=a+N+1;indices.push(...(side===1?[a,b,a+1,a+1,b,b+1]:[a,a+1,b,a+1,b+1,b]));}
      for(let i=0;i<=N;i++)k.line(group,Array.from({length:7},(_,j)=>p(i/N,side*j/6)),.0008,ridge);
      k.line(group,Array.from({length:N+1},(_,i)=>p(i/N,side)),.0015,edgeLight);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();k.mesh(group,geo,roof);
    k.line(group,[[-w*.3,y+rise+.010,0],[-w*.21,y+rise+.003,0],[w*.21,y+rise+.003,0],[w*.3,y+rise+.010,0]],.0024,ridge);
    for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])k.line(group,[[x*.80,y+.006,z*.80],[x,y+.018,z],[x*1.04,y+.030,z*1.04]],.002,ridge);
  }
  // Raised two-storey rectangular hall and adjoining polygonal pavilion.
  const hall=new THREE.Group();hall.position.set(.048,0,-.034);g.add(hall);
  for(const x of [-.070,0,.070])for(const z of [-.047,.047])k.box(hall,.008,.040,.008,stone,x,.023,z);
  k.box(hall,.164,.009,.115,stone,0,.044);
  for(const y of [.050,.135]){
    k.box(hall,.144,.072,.096,wood,0,y+.036);
    for(const side of [-1,1])for(let i=-4;i<=4;i++){
      k.box(hall,.011,.037,.002,window,i*.015,y+.042,side*.049);
      for(const dy of [-.009,.009])k.box(hall,.011,.0015,.003,wood,i*.015,y+.042+dy,side*.051);
      k.box(hall,.0015,.037,.003,wood,i*.015,y+.042,side*.051);
    }
    for(const side of [-1,1])for(let i=-2;i<=2;i++)k.box(hall,.002,.038,.012,window,side*.073,y+.042,i*.018);
    k.box(hall,.153,.013,.102,wood,0,y+.007);
    // Warm light under the cornice; red columns and timber remain legible.
    for(const side of [-1,1]){
      k.box(hall,.150,.003,.002,edgeLight,0,y+.068,side*.051);
      for(const x of [-.068,-.034,0,.034,.068])k.box(hall,.003,.063,.003,uplight,x,y+.033,side*.052);
    }
    for(const side of [-1,1]){
      for(const dy of [.001,.014])k.box(hall,.147,.0015,.002,stone,0,y+dy,side*.053);
      for(let i=-4;i<=4;i++){k.box(hall,.008,.0015,.003,stone,i*.016,y+.008,side*.054);k.box(hall,.0015,.009,.003,stone,i*.016+.004,y+.005,side*.054);k.box(hall,.0015,.009,.003,stone,i*.016-.004,y+.010,side*.054);}
    }
  }
  tiledRoof(hall,.192,.142,.121,.026);tiledRoof(hall,.204,.150,.212,.043);
  for(const x of [-.062,.062]){
    k.line(hall,[[x,.241,-.067],[x,.247,-.045],[x,.276,-.018],[x,.279,0],[x,.276,.018],[x,.247,.045],[x,.241,.067]],.003,ridge);
    k.line(hall,[[x,.245,-.064],[x,.256,-.035],[x,.282,0],[x,.256,.035],[x,.245,.064]],.0012,stone);
  }
  const pavilion=new THREE.Group();pavilion.position.set(-.086,0,-.018);g.add(pavilion);
  const poly=Array.from({length:6},(_,i)=>[Math.sin(i*Math.PI/3)*.062,Math.cos(i*Math.PI/3)*.062]);
  plate(k,pavilion,poly,.044,.008,stone);
  poly.forEach(([x,z])=>k.box(pavilion,.007,.043,.007,stone,x*.85,.023,z*.85));
  for(const y of [.052,.132]){
    plate(k,pavilion,poly.map(([x,z])=>[x*.82,z*.82]),y,.067,wood);
    for(let i=0;i<6;i++){
      const f=edgeGroup(pavilion,poly[i].map(v=>v*.83),poly[(i+1)%6].map(v=>v*.83));
      for(let j=-1;j<=1;j++){k.box(f,.012,.033,.003,window,j*.015,y+.038);k.box(f,.0015,.033,.004,wood,j*.015,y+.038);}
      k.box(f,.045,.003,.006,stone,0,y+.010,.004);
    }
  }
  // Hexagonal upturned eaves retain the pavilion's pointed crown.
  for(const [y,rise,r] of [[.118,.029,.076],[.201,.055,.080]]){
    const pos=[],idx=[];
    for(let row=0;row<=6;row++)for(let i=0;i<=48;i++){const t=row/6,a=i/48*Math.PI*2,flute=1+.06*Math.cos(a*6);pos.push(Math.sin(a)*r*t*flute,y+rise*(1-t)**2+.014*t**6,Math.cos(a)*r*t*flute);}
    for(let row=0;row<6;row++)for(let i=0;i<48;i++){const a=row*49+i,b=a+49;idx.push(a,b,a+1,a+1,b,b+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(pavilion,geo,roof);
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2;k.line(pavilion,Array.from({length:7},(_,j)=>{const t=j/6;return [Math.sin(a)*r*t*(1+.06*Math.cos(a*6)),y+rise*(1-t)**2+.014*t**6,Math.cos(a)*r*t*(1+.06*Math.cos(a*6))];}),.0008,ridge);}
    for(let i=0;i<6;i++){const a=i*Math.PI/3;k.line(pavilion,[[Math.sin(a)*r*.8,y+.005,Math.cos(a)*r*.8],[Math.sin(a)*r*1.06,y+.014,Math.cos(a)*r*1.06],[Math.sin(a)*r*1.10,y+.032,Math.cos(a)*r*1.10]],.002,edgeLight);}
  }
  for(const [y,r] of [[.132,.076],[.215,.080]]){
    k.line(pavilion,Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2,flute=1+.06*Math.cos(a*6);return [Math.sin(a)*r*flute,y,Math.cos(a)*r*flute];}),.0013,edgeLight,true);
  }
  k.cyl(pavilion,.003,.006,.021,stone,0,.266,0,8);k.ball(pavilion,.004,edgeLight,0,.278);
  // Nine changes of direction form a walkable zigzag approach, above the pond.
  const path=[[-.245,.10],[-.19,.10],[-.19,.16],[-.12,.16],[-.12,.10],[-.045,.10],[-.045,.16],[.035,.16],[.035,.10],[.11,.10],[.11,.028]];
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],f=edgeGroup(g,a,b),len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    k.box(f,len+.015,.006,.022,stone,0,.037);
    for(const s of [-1,1]){k.box(f,len+.015,.002,.002,stone,0,.054,s*.011);for(let x=-len/2;x<=len/2+.001;x+=.014)k.box(f,.002,.018,.002,stone,x,.045,s*.011);}
    k.box(g,.005,.035,.005,stone,a[0],.018,a[1]);
    k.box(f,len,.0015,.0015,edgeLight,0,.035,.011);
  }
  for(const [x,z] of [[.124,.012],[-.12,.036]]){k.beam(g,[x,.144,z],[x,.206,z],.001,wood);for(let j=0;j<3;j++){const o=k.ball(g,.0055,lantern,x,.156+j*.017,z);o.scale.y=1.22;}}
  for(let i=0;i<9;i++){const a=i*.7,o=k.mesh(g,new THREE.IcosahedronGeometry(.012+(i%3)*.003,0),ridge,Math.cos(a)*.20,.010,Math.sin(a)*.16);o.scale.set(1,1.7,.8);}
  // Enlarge the named garden, preserving ground contact on the spherical map.
  // Removing the old local sag before scaling avoids a floating enlarged pond.
  k.merge(g);
  const footprint=1.65,heightScale=1.45,radius=1.85;
  g.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),oldSag=Math.sqrt(radius*radius-x*x-z*z)-radius;
      const xx=x*footprint,zz=z*footprint,newSag=Math.sqrt(radius*radius-xx*xx-zz*zz)-radius;
      p.setXYZ(i,xx,(p.getY(i)-oldSag)*heightScale+newSag,zz);
    }
    p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();
  });
  return g;
}
