// Small architectural forms share the same dimensions and palette as the city.
// Roofs are closed shells with real eaves, rather than flat cones or leaf-shaped spheres.
export function createLandmark(id,k){
  const {THREE,C,mesh,box,cyl,orb,put,line,plaza}=k;
  const vector=(x,y,z)=>new THREE.Vector3(x,y,z);
  function roof(radius,height,sides){
    const count=sides*8,profile=[[.10,1],[.38,.66],[.72,.21],[.94,.06],[1.04,.13]],v=[],ix=[];
    for(let layer=0;layer<2;layer++)for(let j=0;j<profile.length;j++)for(let i=0;i<=count;i++){
      const a=i/count*Math.PI*2,sector=2*Math.PI/sides,polygon=Math.cos(Math.PI/sides)/Math.cos((a%sector)-Math.PI/sides),[r,h]=profile[j];
      const corner=Math.pow(Math.max(0,Math.cos(a*sides)),6),lift=j>1?corner*height*.16:0;
      v.push(Math.sin(a)*radius*r*polygon,height*h+lift-layer*.012,Math.cos(a)*radius*r*polygon);
    }
    const stride=count+1,layerSize=profile.length*stride;
    for(let j=0;j<profile.length-1;j++)for(let i=0;i<count;i++){
      const a=j*stride+i,b=a+stride;ix.push(a,b,a+1,b,b+1,a+1);
      const c=a+layerSize,d=b+layerSize;ix.push(c,c+1,d,d,c+1,d+1);
    }
    for(const row of [0,profile.length-1])for(let i=0;i<count;i++){
      const a=row*stride+i,b=a+layerSize;
      if(row===0)ix.push(a,a+1,b,b,a+1,b+1);else ix.push(a,b,a+1,b,b+1,a+1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geometry.setIndex(ix);geometry.computeVertexNormals();
    const g=new THREE.Group();g.add(mesh(geometry,C.roof));
    for(let i=0;i<sides;i++){
      const a=i*Math.PI*2/sides;
      g.add(line(profile.map(([r,h],j)=>vector(Math.sin(a)*radius*r,height*h+(j>1?height*.16:0)+.003,Math.cos(a)*radius*r)),C.deep,.0035));
    }
    return g;
  }
  function octagon(r,h,color,y){const o=cyl(r,r,h,color,8);o.rotation.y=Math.PI/8;o.position.y=y;return o;}
  function balcony(g,r,y){
    const points=[];
    for(let i=0;i<=8;i++){
      const a=i*Math.PI/4+Math.PI/8,x=Math.sin(a)*r,z=Math.cos(a)*r;points.push(vector(x,y+.045,z));
      if(i<8)put(g,cyl(.0035,.0045,.045,C.wood,6),x,y+.022,z);
    }
    g.add(line(points,C.gold,.003));
  }
  if(id==='pagoda'){
    const g=new THREE.Group();g.userData.placeId='leifeng';
    for(let i=0;i<3;i++)g.add(octagon(.205-i*.019,.018,C.stone,.009+i*.018));
    for(let i=0;i<5;i++){
      const radius=.130-i*.010,y=.06+i*.121;
      g.add(octagon(radius*1.21,.013,C.sand,y+.007));
      g.add(octagon(radius,.082,C.wood,y+.053));
      for(let j=0;j<8;j++){
        const a=j*Math.PI/4,wall=new THREE.Group();
        put(wall,box(radius*.48,.055,.008,C.ink,.003),0,y+.054,radius*Math.cos(Math.PI/8)+.003);
        put(wall,box(.004,.056,.011,C.ivory,.001),0,y+.054,radius*Math.cos(Math.PI/8)+.009);
        put(wall,box(radius*.5,.005,.014,C.sand,.001),0,y+.080,radius*Math.cos(Math.PI/8)+.004);
        wall.rotation.y=a;g.add(wall);
        const corner=a+Math.PI/8;put(g,cyl(.005,.006,.083,C.clay,8),Math.sin(corner)*radius,y+.053,Math.cos(corner)*radius);
      }
      balcony(g,radius*1.16,y+.014);
      const eaves=put(g,roof(radius*1.55,.061,8),0,y+.086);eaves.rotation.y=Math.PI/8;
    }
    put(g,cyl(.011,.022,.035,C.gold,12),0,.685);
    put(g,cyl(0,.012,.072,C.gold,12),0,.735);
    for(let i=0;i<3;i++)put(g,cyl(.017-i*.003,.017-i*.003,.005,C.gold,12),0,.693+i*.018);
    // Extend the risers into the curved terrain so the treads cannot float.
    for(let i=0;i<6;i++){const top=i<3?.049-i*.012:.009-(i-3)*.016,bottom=-.08;put(g,box(.15+i*.021,top-bottom,.041,C.stone,.003),0,(top+bottom)/2,.18+i*.025);}
    return g;
  }
  if(id==='pavilion'){
    const g=plaza(.34,.32);put(g,box(.28,.025,.26,C.stone,.006),0,.048);
    for(const x of [-.103,.103])for(const z of [-.094,.094]){
      put(g,cyl(.015,.019,.023,C.ivory,10),x,.071,z);
      put(g,cyl(.009,.011,.185,C.clay,10),x,.168,z);
      put(g,box(.035,.012,.033,C.gold,.003),x,.251,z);
    }
    for(const z of [-.096,.096])put(g,box(.242,.019,.019,C.wood,.004),0,.254,z);
    for(const x of [-.105,.105])put(g,box(.018,.019,.222,C.wood,.004),x,.254);
    for(const z of [-.082,.082])put(g,box(.19,.014,.031,C.wood,.004),0,.10,z);
    for(const x of [-.083,.083])put(g,box(.032,.014,.17,C.wood,.004),x,.10);
    const eaves=put(g,roof(.252,.10,4),0,.262);eaves.rotation.y=Math.PI/4;
    put(g,cyl(.004,.004,.025,C.gold,8),0,.235);put(g,orb(.020,C.clay,[1,1.2,1]),0,.208);
    put(g,orb(.015,C.gold,[1,1.3,1]),0,.374);
    for(let i=0;i<2;i++){const top=.0415-i*.013,bottom=-.06;put(g,box(.12+i*.035,top-bottom,.045,C.stone,.003),0,(top+bottom)/2,.174+i*.032);}
    return g;
  }
  if(id==='gallery'){
    const g=plaza(.52,.46);
    put(g,cyl(.183,.195,.024,C.sand,48),0,.050);
    put(g,cyl(.181,.181,.135,C.glass,48),0,.126);
    for(let i=0;i<24;i++){const a=i*Math.PI/12;put(g,cyl(.0035,.0035,.135,C.ivory,6),Math.sin(a)*.183,.126,Math.cos(a)*.183);}
    put(g,cyl(.193,.193,.015,C.ivory,48),0,.197);
    for(let petal=0;petal<7;petal++){
      const vertices=[],indices=[],nu=12,nv=8;
      for(let layer=0;layer<2;layer++)for(let u=0;u<=nu;u++)for(let v=0;v<=nv;v++){
        const t=u/nu,s=(v/nv-.5)*2,a=petal*Math.PI*2/7+s*Math.PI/7*.99,r=.048+.197*t;
        const h=.31-.10*t+.105*Math.sin(Math.PI*t)-.025*s*s*Math.sin(Math.PI*t)-layer*.01;
        vertices.push(Math.sin(a)*r,h,Math.cos(a)*r);
      }
      const stride=nv+1,half=(nu+1)*stride;
      for(let u=0;u<nu;u++)for(let v=0;v<nv;v++){const a=u*stride+v,b=a+stride;indices.push(a,b,a+1,b,b+1,a+1);const c=a+half,d=b+half;indices.push(c,c+1,d,d,c+1,d+1);}
      for(let v=0;v<nv;v++){const a=nu*stride+v,b=a+half;indices.push(a,b,a+1,b,b+1,a+1);}
      for(let u=0;u<nu;u++)for(const v of [0,nv]){const a=u*stride+v,b=a+stride,c=a+half,d=b+half;indices.push(a,c,b,b,c,d);}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();g.add(mesh(geometry,C.ivory));
    }
    put(g,cyl(.049,.049,.012,C.glassLight,32),0,.309);
    for(let i=0;i<3;i++){
      const top=.055-i*.012,bottom=-.08;
      const step=put(g,box(.17+i*.04,top-bottom,.039,C.stone,.003),0,(top+bottom)/2,.20+i*.029);
      step.name='gallery-existing-step';
    }
    return g;
  }
  return null;
}
