// Architectural silhouettes are built as complete miniature buildings, with
// recessed glazing, roof edges and a common scale rather than stacked blocks.
// Hangzhou Grand Theatre: a swept titanium shell, inclined crescent glazing
// and an inverted-cone auditorium. This is a miniature interpretation.
export function createGrandTheatre(THREE,w=.44,d=.26,radius=1.42){
  const g=new THREE.Group();g.name='hangzhou-grand-theatre';
  const stone=new THREE.MeshStandardMaterial({color:'#d8d9ce',roughness:.84});
  const silver=new THREE.MeshStandardMaterial({color:'#c9d4d5',roughness:.42,metalness:.34,side:THREE.DoubleSide});
  const glass=new THREE.MeshStandardMaterial({color:'#89a7ac',roughness:.47,metalness:.08,side:THREE.DoubleSide});
  const trim=new THREE.MeshStandardMaterial({color:'#a9b8b9',roughness:.52,metalness:.22});
  const warm=new THREE.MeshStandardMaterial({color:'#b2a17e',roughness:.72});
  const add=(geo,mat,name)=>{const o=new THREE.Mesh(geo,mat);o.name=name;o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
  const vec=(x,y,z)=>new THREE.Vector3(x,y,z),base=.004,rx=w*.48,height=w*.38;
  const surface=(name,rows,cols,sample,mat)=>{
    const positions=[],indices=[];
    for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++)positions.push(...sample(i/rows,j/cols).toArray());
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
    if(name==='theatre-titanium-crescent')for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
    return add(geo,mat,name);
  };
  const line=(name,points,r=.0011,mat=trim)=>{
    const path=new THREE.CatmullRomCurve3(points);
    return add(new THREE.TubeGeometry(path,Math.max(1,points.length-1),r,3,false),mat,name);
  };
  // A curved skirt meets the globe; the public forecourt itself remains level.
  const outline=[];
  for(let j=0;j<4;j++)for(let k=0;k<=5;k++){
    const a=(j+k/5)*Math.PI/2,corner=.022;
    outline.push([(j===0||j===3?1:-1)*(w/2-corner)+Math.cos(a)*corner,
      (j<2?1:-1)*(d/2-corner)+Math.sin(a)*corner]);
  }
  const positions=[0,-.002,0],indices=[],count=outline.length;
  for(const [x,z] of outline)positions.push(x,-.002,z);
  for(const [x,z] of outline)positions.push(x,Math.sqrt((radius+.006)**2-x*x-z*z)-(radius+.014),z);
  for(let i=0;i<count;i++){const a=i+1,b=(i+1)%count+1;indices.push(0,b,a,a,b,a+count,b,b+count,a+count);}
  const footing=new THREE.BufferGeometry();footing.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));footing.setIndex(indices);footing.computeVertexNormals();
  const podium=add(footing,stone,'theatre-curved-forecourt');podium.material.side=THREE.DoubleSide;
  const edge=t=>{const a=-Math.PI/2+Math.PI*t,c=Math.cos(a);return vec(rx*Math.sin(a),base+.012+height*c,d*(.11-.18*c));};
  const roof=(t,u)=>{
    const a=-Math.PI/2+Math.PI*t,c=Math.cos(a),front=edge(t);
    return vec(front.x,base+.012+height*c*Math.sin(u*Math.PI/2),
      -d*.46*c-d*.03+(front.z+d*.46*c+d*.03)*u);
  };
  surface('theatre-titanium-crescent',32,6,roof,silver);
  const facade=(t,u)=>{const p=edge(t);return vec(p.x*(.92+.08*u),base+(p.y-base)*u,p.z+d*.055*(1-u));};
  surface('theatre-inclined-glass',32,3,facade,glass);
  line('theatre-silver-crown',Array.from({length:33},(_,i)=>edge(i/32)),.0022,silver);
  // Continuous roof seams and the glass lattice make the silhouette readable
  // at close range without turning the shell into a stack of separate slabs.
  for(let i=1;i<12;i++)line('theatre-roof-seam',Array.from({length:7},(_,j)=>roof(i/12,j/6)),.00065);
  for(let i=1;i<16;i++)line('theatre-glass-mullion',[facade(i/16,0),facade(i/16,1)],.0008);
  for(let j=1;j<4;j++)line('theatre-glass-transom',Array.from({length:33},(_,i)=>facade(i/32,j/4)),.0007);
  const cx=w*.055,cz=d*.10,top=w*.157,bottom=w*.108,cy=base+w*.172;
  for(let i=0;i<3;i++){
    const step=add(new THREE.CylinderGeometry(top+.016-i*.004,top+.016-i*.004,.004,32),stone,'theatre-circular-steps');
    step.position.set(cx,base+i*.004,cz);
  }
  const auditorium=add(new THREE.CylinderGeometry(top,bottom,w*.25,32,1),glass,'theatre-inverted-cone');
  auditorium.position.set(cx,cy,cz);
  for(let i=0;i<=3;i++){
    const u=i/3,r=bottom+(top-bottom)*u;
    const ring=add(new THREE.TorusGeometry(r,.0016,3,32),i===3?silver:warm,'theatre-auditorium-ring');
    ring.rotation.x=Math.PI/2;ring.position.set(cx,cy-w*.125+u*w*.25,cz);
  }
  const lid=add(new THREE.CylinderGeometry(top+.003,top+.003,.005,32),silver,'theatre-round-roof');
  lid.position.set(cx,cy+w*.125+.001,cz);
  for(let i=0;i<20;i++){
    const a=i*Math.PI/10,s=Math.sin(a),c=Math.cos(a);
    line('theatre-auditorium-fin',[vec(cx+s*bottom,cy-w*.125,cz+c*bottom),vec(cx+s*top,cy+w*.125,cz+c*top)],.0008);
  }
  const door=add(new THREE.BoxGeometry(w*.075,.035,.004),warm,'theatre-entrance');
  door.position.set(-w*.16,.017,d*.06);
  // Four broad approach steps lead out to the river-bank path.
  for(let i=0;i<4;i++){
    const step=add(new THREE.BoxGeometry(w*.23,.003,d*.04),stone,'theatre-entry-step');
    step.position.set(-w*.16,-.001+i*.002,d*.44-i*d*.04);
  }
  return g;
}

export function createArchitecture(id,k){
  const {THREE,C,mesh,box,cyl,orb,put,line,plaza,tree}=k;
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  function arch(w,h,depth,color){
    const r=w/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(-r,h-r);s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();
    const o=mesh(new THREE.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:false,curveSegments:12}),color);o.position.z=-depth/2;return o;
  }
  function planter(g,x,y,z,w=.10){put(g,box(w,.025,.04,C.clay,.006),x,y+.012,z);put(g,box(w*.9,.023,.035,C.leaf,.01),x,y+.032,z);}
  function railing(g,w,y,z){put(g,box(w,.007,.007,C.gold,.002),0,y+.046,z);for(let i=0;i<=6;i++)put(g,box(.004,.045,.004,C.ink,.001),-w/2+i*w/6,y+.022,z);}
  function window(g,x,y,z,w,h){put(g,arch(w+.016,h+.008,.012,C.sand),x,y-.008,z);put(g,arch(w,h,.016,C.glass),x,y,z+.007);put(g,box(.006,h-.008,.008,C.ivory,.001),x,y+h/2,z+.018);put(g,box(w+.024,.009,.034,C.ivory,.002),x,y,z+.006);}
  function tower(w,d,h){
    const b=new THREE.Group();
    // Chamfered corners, a continuous glass skin and a shaped crown read at
    // normal size; the recessed lobby and fins remain visible when zoomed in.
    put(b,box(w,h,d,C.glass,.032),0,h/2+.055);
    put(b,box(w*.60,h*.92,.008,C.glassLight,.002),-w*.06,h*.48+.06,d/2+.002);
    put(b,box(.008,h*.92,d*.58,C.ink,.002),w/2+.001,h*.48+.06,-d*.05);
    for(let j=1;j<=8;j++)put(b,box(w+.006,.009,d+.006,C.glassLight,.004),0,.06+j*(h-.06)/8);
    for(const x of [-w*.43,w*.43])put(b,box(.016,h+.024,d*.94,C.ivory,.004),x,h/2+.06);
    for(const z of [-d*.50,d*.50])for(const x of [-w*.17,w*.17])put(b,box(.007,h*.94,.009,C.ivory,.002),x,h/2+.06,z);
    put(b,box(w+.022,.026,d+.022,C.ivory,.012),0,h+.064);
    put(b,box(w*.73,.035,d*.74,C.deep,.012),0,h+.083);
    put(b,box(w*.54,.014,d*.55,C.grass,.008),0,h+.107);
    put(b,box(w*.29,.057,d*.28,C.ivory,.008),w*.12,h+.12,-d*.1);
    put(b,box(w*.55,.062,.014,C.ink,.003),0,.079,d/2+.012);
    put(b,box(w*.66,.012,d*.27,C.sand,.004),0,.119,d*.57);
    return b;
  }
  if(id==='twinTowers'){
    const g=plaza(.59,.43);
    put(g,tower(.225,.205,.61),-.145,.008,.025);
    put(g,tower(.22,.215,.79),.13,.008,-.055);
    put(g,box(.135,.045,.085,C.ivory,.008),0,.26,-.025);
    put(g,box(.13,.028,.087,C.glassLight,.005),0,.267,-.025);
    for(let i=0;i<3;i++)put(g,box(.27-i*.02,.009,.025,C.stone,.003),0,.034+i*.009,.23-i*.018);
    planter(g,-.24,.04,.16,.09);planter(g,.24,.04,.12,.09);
    return g;
  }
  if(id==='apartments'){
    const g=plaza(.49,.39);
    for(const [x,w,h,col] of [[-.115,.21,.37,C.ivory],[.105,.20,.49,'#d99b7e']]){
      const b=new THREE.Group();put(b,box(w,h,.24,col,.014),0,h/2+.035);
      put(b,box(w+.018,.021,.258,C.sand,.005),0,h+.035);
      for(let j=0;j<3;j++){
        const y=.07+j*(h-.08)/3;
        for(const dx of [-.045,.045])window(b,dx,y,.126,.054,.084);
        if(j>0){put(b,box(w+.023,.014,.075,C.ivory,.003),0,y-.004,.155);railing(b,w+.007,y,.193);planter(b,-.055,y+.005,.168,.05);}
      }
      for(const angle of [Math.PI/2,Math.PI,-Math.PI/2]){
        const face=new THREE.Group(),depth=angle===Math.PI?.126:w/2+.006;
        for(let j=0;j<3;j++)for(const dx of [-.047,.047])window(face,dx,.07+j*(h-.08)/3,depth,.053,.084);
        face.rotation.y=angle;b.add(face);
      }
      put(b,box(w*.82,.015,.20,C.grass,.005),0,h+.052);
      for(const dx of [-.073,.073])for(const z of [-.075,.075])put(b,box(.009,.072,.009,C.wood,.002),dx,h+.085,z);
      for(let j=0;j<6;j++)put(b,box(.175,.009,.013,C.wood,.003),0,h+.125,-.08+j*.032);
      put(g,b,x,0,0);
    }
    return g;
  }
  if(id==='cafe'){
    const g=plaza(.49,.64);put(g,box(.35,.225,.26,C.ivory,.014),0,.148,-.04);
    put(g,box(.37,.025,.28,C.sand,.006),0,.262,-.04);
    const roofShape=new THREE.Shape();roofShape.moveTo(-.203,0);roofShape.lineTo(0,.105);roofShape.lineTo(.203,0);roofShape.lineTo(.203,-.022);roofShape.lineTo(0,.083);roofShape.lineTo(-.203,-.022);roofShape.closePath();
    put(g,mesh(new THREE.ExtrudeGeometry(roofShape,{depth:.30,steps:1,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2}),C.clay),0,.28,-.19);
    for(let i=0;i<11;i++){const z=-.184+i*.029;g.add(line([v(-.201,.282,z),v(0,.385,z),v(.201,.282,z)],'#ac6b53',.003));}
    for(const x of [-.108,0,.108]){window(g,x,.064,.096,.078,.153);put(g,box(.075,.006,.008,C.ivory,.001),x,.15,.116);}
    for(const side of [-1,1]){const face=new THREE.Group();for(const x of [-.06,.06])window(face,x,.10,.181,.067,.105);face.rotation.y=side*Math.PI/2;face.position.z=-.04;g.add(face);}
    const rear=new THREE.Group();for(const x of [-.095,.095])window(rear,x,.09,.137,.075,.12);rear.rotation.y=Math.PI;rear.position.z=-.04;g.add(rear);
    for(let i=0;i<9;i++){const awning=put(g,box(.039,.018,.105,i%2?C.ivory:C.deep,.003),-.156+i*.039,.237,.147);awning.rotation.x=.18;put(g,box(.039,.027,.012,i%2?C.ivory:C.deep,.003),-.156+i*.039,.211,.198);}
    put(g,box(.08,.038,.013,C.wood,.004),.115,.302,.118);put(g,orb(.012,C.ivory,[1,1,.5]),.115,.302,.128);
    put(g,box(.045,.065,.052,C.clay,.007),-.115,.351,-.09);put(g,box(.055,.012,.06,C.sand,.004),-.115,.387,-.09);
    for(const x of [-.12,.10]){
      put(g,cyl(.045,.045,.012,C.wood,20),x,.092,.28);put(g,cyl(.006,.012,.08,C.ink,8),x,.05,.28);
      for(const dx of [-.064,.064]){put(g,box(.031,.012,.032,C.clay,.004),x+dx,.05,.28);put(g,box(.029,.038,.008,C.clay,.004),x+dx,.071,.262);for(const z of [.27,.29])put(g,cyl(.003,.003,.042,C.ink,6),x+dx,.028,z);}
      put(g,cyl(.008,.006,.014,C.ivory,12),x,.105,.28);
    }
    planter(g,-.20,.035,.15,.085);planter(g,.20,.035,.15,.085);return g;
  }
  if(id==='skyline'){
    const g=plaza(.47,.39);
    for(let j=0;j<3;j++){
      const w=.33-j*.07,d=.27-j*.038,y=.04+j*.18,x=j*.027;
      put(g,box(w,.185,d,C.glass,.015),x,y+.092);
      for(const dy of [.018,.165])put(g,box(w+.014,.015,d+.014,C.ivory,.006),x,y+dy);
      for(let i=0;i<5;i++)put(g,box(.008,.14,d+.012,C.sand,.002),x-w*.43+i*w*.215,y+.09);
      put(g,box(w*.77,.012,d*.77,C.grass,.006),x,y+.19);
      for(const dx of [-w*.30,w*.30])planter(g,x+dx,y+.19,-d*.31,.055);
    }
    put(g,box(.075,.035,.07,C.ivory,.008),.06,.618,-.015);return g;
  }
  return null;
}
