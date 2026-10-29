// Small architectural details share the same paint palette and physical scale.
function helpers(k){
  const {THREE,C,mesh,orb,box,cyl,put,line}=k;
  const vec=(x,y,z=0)=>new THREE.Vector3(x,y,z);
  function ring(radius,tube,color){return mesh(new THREE.TorusGeometry(radius,tube,6,32),color);}
  function pot(g,x,y,z,s=1){const p=new THREE.Group();put(p,cyl(.024,.019,.035,C.clay,10),0,.017);put(p,cyl(.025,.025,.007,C.ivory,10),0,.034);put(p,orb(.032,C.leaf,[1,.9,1]),0,.057);put(p,orb(.018,C.light),-.015,.071,.008);p.scale.setScalar(s);put(g,p,x,y,z);}
  function rail(g,x,y,z,w){put(g,box(w,.009,.009,C.ivory,.002),x,y+.055,z);for(let i=0;i<=4;i++)put(g,box(.005,.055,.005,C.ivory,.001),x-w/2+i*w/4,y+.028,z);}
  function seat(g,x,y,z,turn=0){const b=new THREE.Group();for(let i=0;i<3;i++)put(b,box(.12,.012,.014,C.wood,.003),0,.06,-.02+i*.02);for(const x1 of [-.043,.043])put(b,box(.012,.06,.05,C.ink,.003),x1,.025);put(b,box(.12,.045,.01,C.wood,.003),0,.092,-.034);b.rotation.y=turn;put(g,b,x,y,z);}
  function roof(radius,height,sides=8){
    const g=new THREE.BufferGeometry(),v=[],indices=[],segments=sides*8,profile=[[.12,1],[.45,.5],[.78,.18],[1,.08],[1.055,.16]];
    for(let j=0;j<profile.length;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,[r,h]=profile[j],polygon=Math.cos(Math.PI/sides)/Math.cos(((a+Math.PI/sides)%(2*Math.PI/sides))-Math.PI/sides);v.push(Math.cos(a)*radius*r*polygon,height*h+(j>1?Math.pow(Math.max(0,Math.cos(a*sides)),6)*height*.12:0),Math.sin(a)*radius*r*polygon);}
    for(let j=0;j<profile.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
    g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();const group=new THREE.Group();group.add(mesh(g,C.roof));
    for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides;group.add(line(profile.map(([r,h])=>vec(Math.cos(a)*radius*r,height*h+.004,Math.sin(a)*radius*r)),C.deep,.004));}
    return group;
  }
  function gable(w,h,d,color=C.roof){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.lineTo(w/2,-.022);shape.lineTo(0,h-.022);shape.lineTo(-w/2,-.022);shape.closePath();const roof=mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,steps:1}),color);roof.position.z=-d/2;return roof;}
  function frame(g,x,y,z,w,h){put(g,box(w,h,.009,C.glass,.002),x,y,z);for(const dx of [-w/2,w/2,0])put(g,box(.006,h+.008,.012,C.ivory,.002),x+dx,y,z+.005);for(const dy of [-h/2,h/2])put(g,box(w+.01,.006,.012,C.ivory,.002),x,y+dy,z+.005);}
  return {vec,ring,pot,rail,seat,roof,gable,frame};
}

export function addDetails(id,g,k){
  const {THREE,C,mesh,orb,box,cyl,put,line}=k,{vec,ring,pot,rail,seat,roof,frame}=helpers(k);
  if(id==='bridge'){
    for(const z of [-.096,.096]){
      for(let i=0;i<11;i++){const x=-.30+i*.06,y=.108+.096*(1-(x/.34)**2);put(g,box(.004,.035,.006,C.stone,.001),x,y-.018,z);}
      for(let i=0;i<9;i++){const x=-.33+i*.0825,y=.11+.095*(1-(x/.34)**2);put(g,orb(.014,C.ivory),x,y+.065,z);}
      const arch=[];for(let i=0;i<=14;i++){const x=-.22+i*.44/14;arch.push(vec(x,.101*(1-(x/.22)**2)+.012,z));}g.add(line(arch,C.stone,.008));
    }
    for(let i=1;i<15;i++){const x=-.33+i*.044,y=.1+.1*(1-(x/.34)**2);put(g,box(.003,.003,.15,C.stone,.001),x,y+.004);}
  }
  if(id==='pagoda'){
    for(const old of [...g.children])if(old.geometry?.type==='CylinderGeometry'&&old.material.color.getHexString()===C.roof.slice(1)){g.remove(old);old.geometry.dispose();old.material.dispose();}
    for(let i=0;i<5;i++){
      const r=.135-i*.015,y=.085+i*.105;put(g,roof(r*1.38,.05,8),0,y+.044);
      const balcony=put(g,ring(r*1.04,.004,C.gold),0,y-.017);balcony.rotation.x=Math.PI/2;
      for(let j=0;j<8;j++){const a=j*Math.PI/4;put(g,cyl(.004,.004,.058,C.wood,6),Math.sin(a)*r,y-.003,Math.cos(a)*r);const mullion=put(g,box(.004,.047,.011,C.ivory,.001),Math.sin(a)*r,y,Math.cos(a)*r);mullion.rotation.y=a;}
    }
    put(g,cyl(0,.019,.085,C.gold,10),0,.644);for(let j=0;j<3;j++)put(g,cyl(.014-j*.003,.014-j*.003,.008,C.gold,10),0,.62+j*.025);
    for(let i=0;i<3;i++)put(g,box(.15+i*.035,.012,.055,C.stone,.003),0,.035-i*.012,.18+i*.025);
  }
  if(id==='pavilion'){
    for(const old of [...g.children])if(old.geometry?.type==='CylinderGeometry'&&old.geometry.parameters.radialSegments===4){g.remove(old);old.geometry.dispose();old.material.dispose();}
    const r=put(g,roof(.225,.11,4),0,.215);r.rotation.y=Math.PI/4;
    for(const x of [-.095,.095])for(const z of [-.085,.085]){put(g,box(.035,.015,.03,C.gold,.003),x,.183,z);put(g,cyl(.021,.023,.025,C.ivory,8),x,.04,z);}
    rail(g,0,.05,-.09,.18);seat(g,0,.015,-.045);put(g,cyl(.012,.012,.026,C.gold,8),0,.205);
  }
  if(id==='towers')for(const [x,z] of [[-.12,0],[.09,-.065],[.055,.12]]){const water=put(g,ring(.06,.003,C.ripple),x,.005,z);water.rotation.x=Math.PI/2;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;put(g,orb(.008,C.ink,[1,1,.3]),x+Math.sin(a)*.034,.068,z+Math.cos(a)*.034);}}
  if(id==='mountains'){for(let i=0;i<7;i++){put(g,orb(.018,C.stone,[1.3,.65,1]),-.25+i*.07,.04,.19+Math.sin(i)*.02);}put(g,k.pine(.4),.22,.03,.2);}
  if(id==='tea'){put(g,cyl(.028,.021,.032,C.wood,12),-.2,.05,.12);put(g,box(.035,.024,.008,C.ivory,.002),.22,.14,.12);put(g,box(.006,.12,.006,C.wood,.001),.22,.08,.12);}
  if(id==='bamboo')for(let i=0;i<7;i++){const x=Math.sin(i*2.4)*.13,z=Math.cos(i*2.4)*.11,h=.22+(i%3)*.075;for(let j=1;j<5;j++)put(g,cyl(.012,.012,.006,C.light,7),x,j*h/5,z);}
  if(id==='boat'){
    for(let i=0;i<6;i++)put(g,box(.002,.003,.058,C.wood,.001),-.07+i*.027,.077);
    g.add(line([vec(0,.28),vec(-.13,.065)],C.ivory,.002));g.add(line([vec(0,.28),vec(.13,.065)],C.ivory,.002));
    const buoy=put(g,ring(.018,.006,C.ivory),-.08,.065,.057);buoy.rotation.x=.3;put(g,box(.065,.008,.012,C.wood,.002),.075,.085,.045);
  }
  if(id==='twinTowers'){
    for(const [x,z,h,w] of [[-.13,0,.68,.18],[.12,-.045,.9,.19]]){
      for(let j=0;j<2;j++)put(g,box(.012,h*.8,.006,C.ripple,.002),x-w*.2+j*w*.38,h*.48,z+.097);
      for(let i=1;i<7;i++)put(g,box(.188,.006,.008,C.glassLight,.002),x,.075+i*(h-.12)/7,z-.096);
      put(g,box(w*.7,.018,.13,C.grass,.004),x,h+.064,z);for(const dx of [-.05,.05])pot(g,x+dx,h+.07,z-.025,.65);
      put(g,cyl(.004,.006,.13,C.gold,6),x+.04,h+.17,z);
    }
    frame(g,0,.085,.207,.12,.075);for(let i=0;i<4;i++)put(g,box(.20,.009,.01,C.stone,.002),0,.039,.21+i*.019);
  }
  if(id==='apartments')for(const [x,h,w] of [[-.12,.34,.19],[.085,.47,.2]]){
    for(let i=1;i<4;i++){const y=.08+i*.08;rail(g,x,y+.012,.162,w+.01);pot(g,x-.055,y+.013,.125,.5);}
    for(const dx of [-.07,.07])for(const z of [-.065,.065])put(g,box(.008,.07,.008,C.wood,.002),x+dx,h+.10,z);
    for(let j=0;j<5;j++)put(g,box(.17,.009,.012,C.wood,.003),x,h+.14,-.065+j*.033);
    frame(g,x,.09,.111,.07,.085);
  }
  if(id==='cafe'){
    for(const x of [-.1,-.025,.05])put(g,box(.006,.105,.012,C.ivory,.002),x,.125,.11);
    put(g,box(.006,.018,.008,C.gold,.002),.118,.105,.112);
    const board=put(g,box(.048,.07,.008,C.deep,.004),-.19,.075,.22);board.rotation.x=-.12;
    for(let i=0;i<3;i++)put(g,box(.032-i*.005,.003,.003,C.ivory,.001),-.19,.09-i*.013,.227);
    for(const x of [-.11,.1]){put(g,cyl(.009,.007,.016,C.ivory,10),x,.089,.23);put(g,cyl(.007,.007,.002,C.wood,10),x,.097,.23);const handle=put(g,ring(.005,.002,C.ivory),x+.011,.089,.23);handle.rotation.y=.2;put(g,box(.035,.035,.008,C.clay,.003),x+.055,.058,.203);}
    pot(g,.2,.02,.17,.9);for(let i=0;i<9;i++)put(g,box(.003,.004,.24,'#ae6e57',.001),-.14+i*.035,.28,-.025);
  }
  if(id==='gallery'){for(let j=0;j<12;j++){const a=j*Math.PI/6;put(g,box(.007,.07,.007,C.ivory,.001),Math.sin(a)*.167,.13,Math.cos(a)*.167);}for(let i=0;i<3;i++)put(g,box(.17+i*.04,.012,.042,C.stone,.003),0,.05-i*.014,.17+i*.03);pot(g,.2,.02,.12,.9);}
  if(id==='wheel'){
    const rear=put(g,ring(.19,.008,C.gold),0,.32,-.038);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*.19,y=.32+Math.sin(a)*.19;put(g,box(.036,.022,.006,C.glass,.002),x,y-.02,.026);put(g,box(.055,.01,.052,C.ivory,.003),x,y+.006);put(g,cyl(.006,.006,.04,C.gold,6),x,y+.026);}
    put(g,box(.09,.035,.09,C.clay,.005),.14,.055,.06);frame(g,.14,.06,.108,.05,.035);
  }
  if(id==='tram'){
    for(const x of [-.171,.171]){put(g,box(.008,.055,.095,C.glass,.003),x,.132);for(const z of [-.047,.047])put(g,orb(.009,C.ivory),x,.092,z);put(g,box(.02,.012,.10,C.ivory,.003),x,.067);}
    g.add(line([vec(-.04,.207),vec(0,.245),vec(.05,.207),vec(.005,.185),vec(-.04,.207)],C.ink,.003));put(g,box(.08,.006,.012,C.gold,.001),0,.247);
    for(const x of [-.10,.10])for(const z of [-.076,.076]){const hub=put(g,cyl(.01,.01,.004,C.stone,10),x,.06,z);hub.rotation.x=Math.PI/2;}
    for(let i=0;i<9;i++)put(g,box(.017,.008,.16,C.wood,.002),-.2+i*.05,.038);
  }
  return g;
}

export function createExtraPiece(id,k){
  const {THREE,C,mesh,orb,box,cyl,put,line,plaza,tree,pine}=k,{vec,ring,pot,rail,seat,roof,gable,frame}=helpers(k);
  let g;
  if(id==='goldenBall'){
    g=plaza(.48,.42);put(g,cyl(.22,.235,.055,C.ivory,32),0,.06);put(g,cyl(.17,.18,.05,C.glass,32),0,.105);
    const shell=put(g,mesh(new THREE.SphereGeometry(.235,40,28),'#d8a02f'),0,.32);
    shell.material.roughness=.43;shell.material.metalness=.32;
    shell.material.emissive.set('#70400b');shell.material.emissiveIntensity=.07;
    shell.name='conference-gold-shell';
    for(let i=-3;i<=3;i++){const y=i*.052,r=Math.sqrt(.235**2-(i*.052)**2);const band=put(g,ring(r+.0017,.0022,'#b48329'),0,.32+y);band.rotation.x=Math.PI/2;band.castShadow=false;}
    for(let i=0;i<12;i++){const a=i*Math.PI/6,points=[];for(let j=0;j<=20;j++){const t=-Math.PI*.43+j/20*Math.PI*.86;points.push(vec(Math.cos(t)*.238*Math.sin(a),.32+Math.sin(t)*.238,Math.cos(t)*.238*Math.cos(a)));}const seam=line(points,'#c29238',.0015);seam.castShadow=false;g.add(seam);}
    frame(g,0,.102,.183,.075,.07);for(const x of [-.15,.15])pot(g,x,.045,.19,.8);return g;
  }
  if(id==='skyline'){
    g=plaza(.4,.36);
    for(let i=0;i<3;i++){const w=.30-i*.055,h=.19,y=.04+i*.18;put(g,box(w,h,.25-i*.027,i%2?C.ivory:C.glass),i*.025,y+h/2);for(let j=0;j<4;j++)frame(g,i*.025-w*.34+j*w*.225,y+.09,.13-i*.014,w*.14,.12);put(g,box(w+.022,.018,.26-i*.027,C.sand,.004),i*.025,y+h);pot(g,i*.025-w*.33,y+h+.01,-.04,.7);}
    put(g,box(.16,.025,.18,C.grass),.05,.61);rail(g,.05,.625,.09,.15);put(g,box(.05,.055,.07,C.ivory),.07,.646,-.025);return g;
  }
  if(id==='courtyard'){
    g=plaza(.48,.4);put(g,box(.4,.035,.33,C.stone,.004),0,.04);for(const x of [-.15,.15]){put(g,box(.095,.15,.27,C.ivory),x,.13);put(g,gable(.14,.075,.30),x,.21);frame(g,x,.13,.142,.05,.08);}
    put(g,box(.30,.18,.11,C.ivory),0,.15,-.12);put(g,gable(.36,.08,.145),0,.25,-.12);put(g,box(.085,.12,.009,C.wood,.002),0,.12,-.058);frame(g,-.095,.15,-.057,.055,.07);frame(g,.095,.15,-.057,.055,.07);
    for(const x of [-.15,.15])put(g,box(.1,.12,.026,C.ivory),x,.11,.165);put(g,box(.13,.014,.04,C.roof,.003),0,.175,.165);put(g,box(.009,.12,.014,C.wood,.002),-.055,.105,.17);put(g,box(.009,.12,.014,C.wood,.002),.055,.105,.17);
    for(let j=0;j<4;j++)put(g,box(.055,.006,.036,C.sand,.003),0,.061,.11-j*.045);pot(g,.09,.06,-.015,.8);put(g,orb(.045,C.light,[1,1.4,1]),-.10,.105,.015);
    for(const x of [-.035,.035]){put(g,orb(.014,C.clay,[1,1.25,1]),x,.146,.19);put(g,cyl(.002,.002,.025,C.gold,5),x,.168,.19);}return g;
  }
  if(id==='clockTower'){
    g=plaza(.34,.33);put(g,box(.18,.43,.18,C.ivory),0,.25);put(g,box(.21,.028,.21,C.sand),0,.47);put(g,box(.20,.13,.20,C.clay),0,.55);put(g,roof(.19,.13,4),0,.62);put(g,cyl(0,.018,.09,C.gold,8),0,.78);
    for(let i=0;i<4;i++){const face=new THREE.Group();const dial=put(face,cyl(.048,.048,.007,C.ivory,24),0,0);dial.rotation.x=Math.PI/2;put(face,ring(.05,.005,C.gold));for(let j=0;j<12;j++){const a=j*Math.PI/6;const mark=put(face,box(.003,.009,.003,C.ink,.001),Math.sin(a)*.037,Math.cos(a)*.037,.007);mark.rotation.z=-a;}const hour=put(face,box(.006,.028,.004,C.ink,.001),-.009,.008,.01);hour.rotation.z=.8;const minute=put(face,box(.004,.038,.004,C.ink,.001),.011,.01,.012);minute.rotation.z=-.8;face.position.set(Math.sin(i*Math.PI/2)*.104,.55,Math.cos(i*Math.PI/2)*.104);face.rotation.y=i*Math.PI/2;g.add(face);}
    frame(g,0,.14,.096,.075,.15);for(const x of [-.055,.055])frame(g,x,.34,.096,.038,.09);put(g,box(.22,.022,.22,C.stone),0,.045);pot(g,.13,.025,.09,.8);return g;
  }
  if(id==='greenhouse'){
    g=plaza(.45,.39);put(g,box(.34,.065,.31,C.clay),0,.065);put(g,box(.32,.13,.29,C.glassLight),0,.16);const s=new THREE.Shape();s.moveTo(-.16,0);for(let i=0;i<=24;i++){const a=Math.PI-i*Math.PI/24;s.lineTo(Math.cos(a)*.16,Math.sin(a)*.13);}s.closePath();put(g,mesh(new THREE.ExtrudeGeometry(s,{depth:.30,bevelEnabled:false,steps:1}),C.glassLight),0,.22,-.15);
    for(let j=0;j<6;j++){const z=-.15+j*.06,pts=[];for(let i=0;i<=16;i++){const a=Math.PI-i*Math.PI/16;pts.push(vec(Math.cos(a)*.165,.22+Math.sin(a)*.135,z));}g.add(line(pts,C.ivory,.005));for(const x of [-.165,.165])put(g,box(.008,.14,.008,C.ivory,.002),x,.155,z);}
    for(const z of [-.154,.154])for(const x of [-.10,0,.10])put(g,box(.007,.22,.007,C.ivory,.002),x,.20,z);
    frame(g,0,.15,.16,.075,.16);for(const x of [-.20,.20])for(const z of [-.09,.11])pot(g,x,.02,z,.9);put(g,box(.12,.022,.06,C.sand),0,.043,.19);return g;
  }
  if(id==='camping'){
    g=plaza(.50,.38);put(g,box(.46,.009,.33,C.grass),0,.04);const tent=new THREE.Group(),s=new THREE.Shape();s.moveTo(-.14,0);s.lineTo(0,.25);s.lineTo(.14,0);s.closePath();put(tent,mesh(new THREE.ExtrudeGeometry(s,{depth:.23,bevelEnabled:true,bevelSize:.005,bevelThickness:.005,bevelSegments:2}),C.clay),0,0,-.13);
    const door=new THREE.Shape();door.moveTo(-.075,.005);door.lineTo(0,.19);door.lineTo(.075,.005);door.closePath();put(tent,mesh(new THREE.ExtrudeGeometry(door,{depth:.004,bevelEnabled:false}),C.ink),0,0,.105);tent.add(line([vec(-.14,0,.115),vec(0,.25,.115),vec(.14,0,.115)],C.ivory,.006));put(tent,box(.01,.03,.25,C.ivory,.003),0,.24);put(g,tent,-.05,.045,-.02);
    for(const x of [-.22,.17])g.add(line([vec(-.05,.29,.08),vec(x,.05,.17)],C.ivory,.002));put(g,pine(.6),.20,.04,-.12);seat(g,.17,.04,.1,-.4);put(g,box(.10,.007,.08,C.ivory,.003),-.15,.052,.14);for(let j=0;j<3;j++)put(g,box(.01,.003,.08,C.clay,.001),-.18+j*.03,.057,.14);
    const lantern=put(g,cyl(.014,.017,.037,C.gold,10),.07,.071,.17);put(g,cyl(.02,.02,.007,C.ink,10),.07,.094,.17);return g;
  }
  if(id==='lotusPier'){
    g=new THREE.Group();put(g,orb(1,C.water,[.25,.012,.18]),0,.002);
    for(let j=0;j<7;j++)put(g,box(.032,.018,.14,C.wood,.003),-.13+j*.034,.045,.09);
    for(const x of [-.14,.08])for(const z of [.02,.15])put(g,cyl(.008,.012,.085,C.wood,7),x,.048,z);rail(g,-.03,.058,.16,.23);
    for(let j=0;j<6;j++){const x=-.20+j*.074,z=-.06+(j%2)*.035;const leaf=put(g,cyl(.04,.04,.004,j%2?C.leaf:C.deep,16),x,.018,z);if(j%2===0){for(let i=0;i<6;i++){const a=i*Math.PI/3;const petal=put(g,orb(1,'#deb4a8',[.013,.027,.008]),x+Math.sin(a)*.013,.035,z+Math.cos(a)*.013);petal.rotation.set(Math.cos(a)*.6,0,-Math.sin(a)*.6);}put(g,orb(.008,C.gold),x,.043,z);}}
    const buoy=put(g,ring(.022,.007,C.ivory),.08,.068,.165);buoy.rotation.y=.2;return g;
  }
  if(id==='fountain'){
    g=plaza(.40,.38);put(g,cyl(.17,.18,.035,C.ivory,32),0,.052);put(g,cyl(.145,.145,.012,C.water,32),0,.072);const rim=put(g,ring(.16,.012,C.sand),0,.077);rim.rotation.x=Math.PI/2;put(g,cyl(.018,.03,.16,C.ivory,16),0,.14);put(g,cyl(.07,.025,.025,C.ivory,24),0,.22);put(g,cyl(.055,.055,.008,C.water,24),0,.236);put(g,orb(.015,C.gold),0,.258);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;g.add(line([vec(0,.26),vec(Math.sin(a)*.065,.30,Math.cos(a)*.065),vec(Math.sin(a)*.12,.083,Math.cos(a)*.12)],C.ripple,.004));}
    seat(g,0,.025,-.21);pot(g,.18,.025,.14,.7);pot(g,-.18,.025,.14,.7);return g;
  }
  throw new Error('Unknown scenery component: '+id);
}
