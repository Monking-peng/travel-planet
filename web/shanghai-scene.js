import * as THREE from 'three';
import {createDisneyFireworks} from './shanghai-fireworks.js';
import {makeKit,createLandmark,LANDMARKS} from './shanghai-landmarks.js';

import {addPudongGround} from './shanghai-pudong.js';

export const RADIUS=1.85;
export const riverX=z=>-.06+.18*Math.sin(z*2.2);
export const CREEK_NODES=[[-1.22,-1.18],[-1.0,-1.15],[-.78,-1.04],[-.60,-1.00],[-.48,-.9965],[-.15,-.95]];
export const surface=(x,z,lift=0)=>new THREE.Vector3(x,Math.sqrt(Math.max(.001,RADIUS*RADIUS-x*x-z*z))+lift,z);
function anchor(object,x,z,lift=.008,hemisphere=1){if(hemisphere===1){object.position.copy(surface(x,z,lift));object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),surface(x,z).normalize());return object;}const normal=surface(x,z);normal.y*=hemisphere;normal.normalize();object.position.copy(normal).multiplyScalar(RADIUS+lift);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);return object;}

export function createShanghaiScene(){
  const clock={time:{value:0},night:{value:0}},k=makeKit(clock),root=new THREE.Group(),landmarks=new Map(),modules=new Map(),connections=[];
  const landscape=new THREE.Group();root.add(landscape);
  const ground=k.mat('#aebaa2',.97,0),water=k.mat('#619da4',.34,.28),paving=k.mat('#d9d5c1',.92,0),asphalt=k.mat('#929b96',.92,0),lineMat=k.mat('#e8e3ce',.9,0);
  k.mesh(landscape,new THREE.SphereGeometry(RADIUS,112,80),ground);
  function strip(points,width,material,lift=.009,target=landscape){
    const positions=[],index=[];
    for(let i=0;i<points.length;i++){
      const [x,z]=points[i],prev=points[Math.max(0,i-1)],next=points[Math.min(i+1,points.length-1)],dx=next[0]-prev[0],dz=next[1]-prev[1],length=Math.hypot(dx,dz)||1;
      for(const s of [-1,1]){const xx=x+s*dz/length*width/2,zz=z-s*dx/length*width/2;positions.push(...surface(xx,zz,lift));}
      if(i){const n=i*2;index.push(n-2,n,n-1,n-1,n,n+1);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(index);geometry.computeVertexNormals();return k.mesh(target,geometry,material);
  }
  const river=Array.from({length:401},(_,i)=>{const z=-1.76+i/400*3.52;return [riverX(z),z];});
  function riverRibbon(width,material,lift){
    const positions=[],indices=[],steps=512;
    for(let i=0;i<=steps;i++){
      // The river occupies the city-facing arc, not a water ring through the reverse-side park.
      const t=i/steps,theta=-1.48+t*3.50,center=riverX(RADIUS*Math.sin(theta)),end=Math.min(t,1-t),taper=Math.sin(Math.min(1,end/.055)*Math.PI/2);
      for(const sign of [-1,1]){const x=center+sign*width/2*taper,r=Math.sqrt((RADIUS+lift)**2-x*x);positions.push(x,r*Math.cos(theta),r*Math.sin(theta));}
      if(i){const n=i*2;indices.push(n-2,n,n-1,n-1,n,n+1);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=k.mesh(landscape,geometry,material);mesh.userData.riverSurface=true;
  }
  riverRibbon(.40,paving,.012);riverRibbon(.32,water,.019);
  for(const side of [-1,1]){
    const bank=river.map(([x,z])=>[x+side*.225,z]).filter(([x,z])=>Math.hypot(x,z)<1.77);strip(bank,.036,asphalt,.025);
    strip(bank,.002,lineMat,.028);
  }
  // Suzhou Creek enters from the west; it does not cut across the Huangpu.
  const creekNodes=CREEK_NODES,creek=[];for(let i=1;i<creekNodes.length;i++)for(let j=0;j<16;j++){const t=j/15;creek.push([THREE.MathUtils.lerp(creekNodes[i-1][0],creekNodes[i][0],t),THREE.MathUtils.lerp(creekNodes[i-1][1],creekNodes[i][1],t)]);}strip(creek,.11,paving,.011);strip(creek,.083,water,.016);
  const lampMetal=k.mat('#777c6d',.65,.25),lampGlow=k.mat('#ecdfb4',.3,.1,'#ffd190');lampGlow.userData.night.intensity=2.4;
  for(let z=-1.45;z<1.46;z+=.13)for(const side of [-1,1]){
    const x=riverX(z)+side*.19,g=new THREE.Group();k.cyl(g,.0025,.0032,.04,lampMetal,0,.02,0,6);k.ball(g,.006,lampGlow,0,.043);landscape.add(anchor(g,x,z));
  }
  for(const info of LANDMARKS){const model=createLandmark(info.id,k);anchor(model,info.x,info.z,.008,info.hemisphere??1);if(!info.grounded)model.quaternion.slerp(new THREE.Quaternion(),.7);const container=new THREE.Group();container.name=`landmark-module:${info.id}`;container.userData.moduleId=info.id;container.add(model);root.add(container);modules.set(info.id,{container,model});landmarks.set(info.id,model);}

  // The independent reverse-side park needs light from its outward hemisphere.
  const park=landmarks.get('disney');root.updateMatrixWorld(true);
  const fireworks=createDisneyFireworks();fireworks.root.position.copy(park.position);fireworks.root.quaternion.copy(park.quaternion);modules.get('disney').container.add(fireworks.root);
  const parkSun=new THREE.DirectionalLight('#fff0d8',2.2);
  parkSun.position.copy(park.localToWorld(new THREE.Vector3(-2,4,3)));
  parkSun.target.position.copy(park.localToWorld(new THREE.Vector3(0,0,-.2)));
  parkSun.castShadow=true;parkSun.shadow.mapSize.set(1024,1024);parkSun.shadow.camera.left=-1.6;parkSun.shadow.camera.right=1.6;parkSun.shadow.camera.top=1.6;parkSun.shadow.camera.bottom=-1.6;parkSun.shadow.camera.near=.1;parkSun.shadow.camera.far=9;parkSun.shadow.normalBias=.009;parkSun.shadow.bias=-.0002;
  modules.get('disney').container.add(parkSun,parkSun.target);
  const parkLights=[];
  for(const [x,y,z,color,power,range] of [[-.52,.20,-.05,'#ffca91',.30,1.4],[.53,.25,-.03,'#d3b8ff',.25,1.4],[0,.18,.6,'#ffcf98',.23,1.2],[-.86,.15,-.08,'#57afff',.14,.85],[.78,.19,.48,'#ffce8e',.10,.8],[0,.13,1.02,'#ffcf98',.08,.8]]){
    const light=new THREE.PointLight(color,0,range,2);light.position.copy(park.localToWorld(new THREE.Vector3(x,y,z)));light.userData.nightPower=power;modules.get('disney').container.add(light);parkLights.push(light);
  }
  // Outward daylight for the newly occupied flank; no extra shadow map or business state.
  const museum=landmarks.get('astronomy'),museumSun=new THREE.DirectionalLight('#e5eff3',1.55);
  museumSun.position.copy(museum.localToWorld(new THREE.Vector3(-2,4,2)));
  museumSun.target.position.copy(museum.position);modules.get('astronomy').container.add(museumSun,museumSun.target);
  const precinctSun=new THREE.DirectionalLight('#f3e9d9',1.25);
  precinctSun.position.set(-3,-4,6);precinctSun.target.position.set(0,-.4,1.1);root.add(precinctSun,precinctSun.target);
  for(const [id,offset,color,power,range] of [['astronomy',[-.36,.25,.3],'#cadfe9',.12,.95],['cathedral',[0,.23,.43],'#efc98c',.12,1.1],['nanpu',[0,.30,0],'#c3d4e4',.07,.8],['artMuseum',[0,.30,.4],'#ffe0ba',.10,1.2],['expoArena',[0,.3,.3],'#aac7e6',.08,1.2]]){
    const light=new THREE.PointLight(color,0,range,2);light.position.copy(landmarks.get(id).localToWorld(new THREE.Vector3(...offset)));light.userData.nightPower=power;modules.get(id).container.add(light);parkLights.push(light);
  }
  function street(points,width=.030){
    const samples=[];for(let i=1;i<points.length;i++)for(let j=0;j<20;j++){const t=j/19;samples.push([THREE.MathUtils.lerp(points[i-1][0],points[i][0],t),THREE.MathUtils.lerp(points[i-1][1],points[i][1],t)]);}
    strip(samples,width+.018,paving,.012);strip(samples,width,asphalt,.016);
  }
  // Separate heritage and Expo precincts wrap onto both flanks. Connections follow
  // the spherical surface instead of old flat-map roads through relocated plots.
  function globePath(ids,nodes,width=.026){
    const connection=new THREE.Group();connection.name=`connection:${ids.join(':')}`;root.add(connection);connections.push({ids,object:connection});
    const points=nodes.map(n=>n.isVector3?n.clone().normalize():surface(n[0],n[1]).setY(surface(n[0],n[1]).y*(n[2]??1)).normalize());
    const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
    const samples=curve.getPoints(100).map(p=>p.normalize());
    for(const [w,mat,lift] of [[width+.012,paving,.012],[width,asphalt,.016]]){
      const vertices=[],indices=[];
      for(let i=0;i<samples.length;i++){
        const normal=samples[i],tangent=samples[Math.min(i+1,samples.length-1)].clone().sub(samples[Math.max(0,i-1)]),side=new THREE.Vector3().crossVectors(normal,tangent).normalize();
        for(const sign of [-1,1])vertices.push(...normal.clone().addScaledVector(side,sign*w/(RADIUS*2)).normalize().multiplyScalar(RADIUS+lift));
        if(i){const n=i*2;indices.push(n-2,n,n-1,n-1,n,n+1);}
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const road=k.mesh(connection,geo,mat);road.material.side=THREE.DoubleSide;
    }
    for(let i=16;i<samples.length;i+=38){const g=new THREE.Group();k.cyl(g,.002,.0028,.034,lampMetal,0,.017,0,6);k.ball(g,.005,lampGlow,0,.037);g.position.copy(samples[i]).multiplyScalar(RADIUS+.022);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),samples[i]);connection.add(g);}
    k.merge(connection);
  }
  const gate=(id,x,z)=>landmarks.get(id).localToWorld(new THREE.Vector3(x,Math.sqrt(RADIUS*RADIUS-x*x-z*z)-RADIUS,z)).normalize();
  globePath(['jingan','wukang'],[gate('jingan',0,.47),[-1.28,-1.16],gate('wukang',0,-.35)]);
  globePath(['wukang','huxinting'],[gate('wukang',0,.355),[-1.79,-.15],gate('huxinting',-.58,.05)]);
  globePath(['huxinting','cathedral'],[gate('huxinting',-.58,.20),[-1.76,.30,-1],gate('cathedral',.40,.15)]);
  globePath(['expoArena','artMuseum'],[gate('expoArena',.48,0),[1.06,1.40,-1],gate('artMuseum',-.37,.08)],.032);
  globePath(['artMuseum','astronomy'],[gate('artMuseum',.37,0),[1.77,.32,-1],gate('astronomy',0,.60)],.028);
  const pudongTrees=addPudongGround({k,landscape,surface,anchor,strip,street,riverX,lampMetal,lampGlow,landmarkInfo:LANDMARKS,moduleRoot:id=>modules.get(id).container});

  const leaves=[k.mat('#5e815c'),k.mat('#759064'),k.mat('#91a777')],trunk=k.mat('#81745b');
  const trees=[...pudongTrees];
  // Plant only at the retained riverfront. Named gardens carry their own groves.
  trees.forEach(([x,z],i)=>{const g=new THREE.Group(),h=.033+(i%4)*.006;k.cyl(g,.003,.004,h,trunk,0,h/2,0,6);const canopy=k.mesh(g,new THREE.IcosahedronGeometry(.025+(i%3)*.003,1),leaves[i%3],0,h+.016);canopy.scale.y=1.2;landscape.add(anchor(g,x,z));});
  const jackets=[k.mat('#b4795b'),k.mat('#5f7b88'),k.mat('#dbcdac'),k.mat('#536351')],skin=k.mat('#ccb494');
  for(let i=0;i<56;i++){const z=-.78+i*.031,x=riverX(z)-.18-(i%3)*.014,g=new THREE.Group();k.cyl(g,.003,.004,.012,jackets[i%4],0,.006,0,6);k.ball(g,.0034,skin,0,.015);landscape.add(anchor(g,x,z));}
  const trim=k.mat('#ddd3bc'),windows=k.mat('#697f7d',.42,.18,'#c1aa78');
  for(const z of [-1.22,.05,.88]){
    const g=new THREE.Group();g.name='river-cruise';
    const hull=new THREE.Shape();hull.moveTo(0,-.074);hull.quadraticCurveTo(.025,-.049,.025,-.020);hull.lineTo(.023,.055);hull.quadraticCurveTo(0,.064,-.023,.055);hull.lineTo(-.025,-.020);hull.quadraticCurveTo(-.025,-.049,0,-.074);
    const body=k.mesh(g,new THREE.ExtrudeGeometry(hull,{depth:.014,bevelEnabled:false,curveSegments:8}),trim,0,.014);body.rotation.x=Math.PI/2;
    k.box(g,.032,.012,.057,windows,0,.021,.004);k.box(g,.035,.003,.062,trim,0,.029,.004);
    k.cyl(g,.001,.001,.025,lampMetal,0,.036,-.018,6);
    for(const side of [-1,1])k.beam(g,[side*.020,.018,-.041],[side*.020,.018,.050],.0011,trim);
    landscape.add(anchor(g,riverX(z),z,.041));
  }

  // Readable small ripples and elongated light reflections, without bloom covering silhouettes.
  const ripple=k.mat('#b1d0c7',.37,.1);for(let i=0;i<42;i++){const z=-1.65+i*.079,x=riverX(z)+Math.sin(i*4.1)*.085;strip([[x-.019,z],[x+.018,z+.003]],.002,ripple,.038);}
  const reflectionMats=[];
  for(let i=0;i<96;i++){
    const z=-.78+(i%24)*.064,x=riverX(z)+((i%4)-1.5)*.041,mat=new THREE.MeshBasicMaterial({color:z<-.25&&i%3===2?'#ff372c':i%2===0?'#ffc176':'#70a9ed',transparent:true,opacity:0,depthWrite:false});
    reflectionMats.push(mat);const o=new THREE.Mesh(new THREE.PlaneGeometry(.018+(i%5)*.010,.0035),mat);o.rotation.x=-Math.PI/2;const g=new THREE.Group();g.add(o);modules.get(['pearl','peace','jinmao','tower'][i%4]).container.add(anchor(g,x,z,.040));
  }
  // Merge static meshes by material; retain separately selectable landmarks.
  k.merge(landscape);
  let night=false;
  function setNight(value){night=Boolean(value);fireworks.setNight(night&&landmarks.has('disney'));parkSun.intensity=night?.14:2.2;museumSun.intensity=night?.12:1.55;precinctSun.intensity=night?.10:1.25;parkLights.forEach(l=>{l.intensity=night?l.userData.nightPower:0;});clock.night.value=night?1:0;for(const m of k.materials){const n=m.userData.night;if(n){m.emissive.copy(n.color);m.emissiveIntensity=night?n.intensity:0;if(n.surfaceColor)m.color.copy(night?n.surfaceColor:m.userData.dayColor);}}ground.color.set(night?'#52665f':'#aebaa2');water.color.set(night?'#213c58':'#619da4');}
  function update(time,reduced){
    clock.time.value=reduced?0:time;fireworks.update(time,reduced);
    for(const m of k.materials){
      const pulse=m.userData.pulse,n=m.userData.night;if(!pulse||!n)continue;
      const cycle=reduced?.5:.5+.5*Math.sin(time*pulse.speed+pulse.phase);
      m.emissiveIntensity=night?n.intensity*(reduced?1:(pulse.min??.58)+(1-(pulse.min??.58))*cycle):0;
      m.emissive.copy(n.color);if(n.alternateColor&&!reduced&&night)m.emissive.lerp(n.alternateColor,cycle);
    }
    reflectionMats.forEach((m,i)=>{m.opacity=night?(reduced?.27:.16+.20*(.5+.5*Math.sin(time*.95+i*.7))):0;});
  }
  // Each module owns its whole scene subtree. Removed modules stay cached for
  // bounded, reversible editing; all cached resources are released on teardown.
  function setLandmarkEnabled(id,enabled){
    const module=modules.get(id);if(!module)return false;
    if(Boolean(enabled)===landmarks.has(id))return false;
    if(enabled){root.add(module.container);landmarks.set(id,module.model);}
    else{module.container.removeFromParent();landmarks.delete(id);}
    for(const {ids,object} of connections){if(ids.every(key=>landmarks.has(key)))root.add(object);else object.removeFromParent();}
    if(id==='disney')fireworks.setNight(night&&Boolean(enabled));
    return true;
  }
  function dispose(){
    parkSun.shadow.map?.dispose();const geometries=new Set(),materials=new Set();
    const collect=o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)materials.add(m);};
    root.traverse(collect);modules.forEach(({container})=>container.traverse(collect));connections.forEach(({object})=>object.traverse(collect));
    k.materials.forEach(m=>materials.add(m));reflectionMats.forEach(m=>materials.add(m));
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  }
  setNight(false);return {root,landmarks,setNight,update,dispose,fireworks,setLandmarkEnabled};
}
