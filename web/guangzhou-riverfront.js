import * as THREE from 'three';
import {skin,glow,bollards,people} from './shenzhen-forms.js';

function strip(k,g,points,width,material){
  const p=[],index=[];
  points.forEach((v,i)=>{const t=new THREE.Vector3(...points[Math.min(i+1,points.length-1)]).sub(new THREE.Vector3(...points[Math.max(0,i-1)])).normalize();for(const side of [-1,1])p.push(v[0]-t.z*width/2*side,v[1],v[2]+t.x*width/2*side);if(i){const a=(i-1)*2;index.push(a,a+1,a+2,a+1,a+3,a+2);}});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setIndex(index);geometry.computeVertexNormals();material.side=THREE.DoubleSide;return k.mesh(g,geometry,material);
}
const points=(fn,n=100)=>Array.from({length:n+1},(_,i)=>fn(i/n));

// The distinctive single leaning arch, curved deck and forked bank approaches.
// The model is a pedestrian crossing, not a generic road or suspension bridge.
export function haixin(k){
  const g=new THREE.Group(),white=k.mat('#d2d9d2',.60,.2),edge=k.mat('#c2cac5',.56,.2),deck=k.mat('#beac91',.88),steel=k.mat('#91a6a5',.58,.28),wood=k.mat('#987e59',.88),green=k.mat('#64856a',.96),flower=k.mat('#c28798',.91),warm=glow(k,'#efd1a0',.78),pale=glow(k,'#d9e5de',.56);
  const curve=t=>[-.48+.96*t,.105+.028*Math.sin(Math.PI*t),-.090*Math.sin(Math.PI*t)];
  const arch=t=>[-.48+.96*t,.100+.325*4*t*(1-t),.055+Math.sin(Math.PI*t)*.075];
  const path=points(curve,96);strip(k,g,path,.11,deck);
  for(const side of [-1,1]){
    const rail=path.map(([x,y,z])=>[x,y+.025,z+side*.055]);k.line(g,rail,.0020,wood);k.line(g,path.map(([x,y,z])=>[x,y-.003,z+side*.055]),.0024,warm);
    for(let i=0;i<=96;i+=3){const [x,y,z]=path[i];k.beam(g,[x,y,z+side*.055],[x,y+.024,z+side*.055],.001,steel,5);}
  }
  k.line(g,points(arch,96),.012,white);k.line(g,points(t=>{const p=arch(t);return [p[0],p[1]+.009,p[2]];},96),.0018,pale);
  for(let i=1;i<32;i++){const t=i/32,a=arch(t),b=curve(t);k.beam(g,a,[b[0],b[1]+.004,b[2]+.032],.0011,steel,5);}
  // Split curved ramps continue to each riverbank, leaving the middle clear.
  for(const side of [-1,1])for(const branch of [-1,1]){
    const c=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.40,.115,-.025),new THREE.Vector3(side*.56,.080,branch*.15),new THREE.Vector3(side*.62,.025,branch*.32)]),p=c.getPoints(60).map(v=>v.toArray());strip(k,g,p,.058,white);
    for(const edgeSide of [-1,1])k.line(g,p.map(([x,y,z],i)=>{const t=c.getTangent(i/60);return [x-t.z*.026*edgeSide,y+.022,z+t.x*.026*edgeSide];}),.0016,warm);
    for(const i of [14,30,46]){const [x,y,z]=p[i];k.cyl(g,.007,.011,Math.max(.008,y-.012),white,x,(y+.012)/2,z,8);}
  }
  for(const x of [-.46,.46])k.cyl(g,.020,.029,.10,white,x,.055,.02,12);
  // Low flower boats and narrow benches sit beside, not across, the clear path.
  for(const t of [.16,.36,.60,.80]){const [x,y,z]=curve(t);const planter=k.mesh(g,new THREE.SphereGeometry(.023,12,8),white,x,y+.008,z+.026);planter.scale.set(1.8,.30,.45);const plants=k.mesh(g,new THREE.IcosahedronGeometry(.016,1),green,x,y+.016,z+.026);plants.scale.set(2,.4,.45);for(let j=-1;j<=1;j++)k.mesh(g,new THREE.IcosahedronGeometry(.004,0),flower,x+j*.017,y+.021,z+.027);k.box(g,.043,.004,.008,wood,x,y+.014,z-.039);}
  for(let i=0;i<17;i++){const [x,y,z]=curve(.05+i/17*.9);k.cyl(g,.0028,.0038,.013,i%3?steel:wood,x,y+.012,z-.01);k.mesh(g,new THREE.SphereGeometry(.0036,8,6),deck,x,y+.022,z-.01);}
  k.merge(g);g.userData.deckSamples=[.34,.50,.66].map(curve);g.userData.archSamples=points(arch,12);g.userData.approachEnds=[[-.62,-.32],[-.62,.32],[.62,-.32],[.62,.32]];return g;
}

export function huacheng(k){
  const g=new THREE.Group(),paving=k.mat('#c3c3b0',.96),grass=k.mat('#78906b',.99),stone=k.mat('#929b89',.94),water=k.mat('#4d7774',.54,.14),wood=k.mat('#8c7b61',.92),bark=k.mat('#746953',.96),leaf=k.mat('#55785c',.98),pink=k.mat('#b67d92',.98),warm=glow(k,'#e4cd99',.6),cool=glow(k,'#b7cddc',.38);
  // A broad axial promenade with garden islands, reflecting water and trees.
  skin(k,g,(u,v)=>{const a=u*Math.PI*2;return [Math.cos(a)*.47*v,.013,Math.sin(a)*.43*v];},32,128,paving);
  for(const side of [-1,1]){
    skin(k,g,(u,v)=>{const a=u*Math.PI*2;return [Math.cos(a)*.32*v,.017,side*.25+Math.sin(a)*.115*v];},16,80,grass);
    for(let i=0;i<11;i++){
      const x=-.34+i*.065,z=side*(.21+.015*Math.sin(i)),h=.11+(i%3)*.012;
      k.cyl(g,.003,.004,h,bark,x,.018+h/2,z,8);
      // The photographed avenue is planted with palms: arching fans, not balls.
      for(let fan=0;fan<7;fan++){
        const angle=fan*Math.PI*2/7+i*.41,dx=Math.cos(angle),dz=Math.sin(angle);
        const frond=points(t=>[x+dx*.043*t,.018+h+.018*Math.sin(t*Math.PI)-.016*t,z+dz*.043*t],12);
        k.line(g,frond,.0009,leaf);
        for(let j=2;j<11;j++){const t=j/12,v=frond[j],w=.013*Math.sin(t*Math.PI);for(const s of [-1,1])k.beam(g,v,[v[0]-dz*w*s+dx*.008,v[1]-.007,v[2]+dx*w*s+dz*.008],.0017,leaf,3);}
      }
      k.box(g,.013,.003,.009,warm,x,.021,z-side*.022);
      for(let j=0;j<3;j++)k.mesh(g,new THREE.IcosahedronGeometry(.007,0),pink,x+j*.008-.008,.025,side*.15);
    }
    const walk=points(t=>[-.43+.86*t,.022,side*(.13+.015*Math.sin(t*Math.PI))],64);strip(k,g,walk,.025,stone);k.line(g,walk.map(([x,y,z])=>[x,y+.002,z+side*.013]),.0013,cool);
    for(const x of [-.27,.23]){k.box(g,.10,.006,.018,wood,x,.041,side*.115);for(const dx of [-.033,.033])k.box(g,.006,.020,.012,stone,x+dx,.029,side*.115);}
  }
  // Floating garden lake is located at the planted end, leaving a clear axis.
  skin(k,g,(u,v)=>{const a=u*Math.PI*2;return [.235+Math.cos(a)*.125*v,.023,Math.sin(a)*.078*v];},16,96,water);
  skin(k,g,(u,v)=>{const a=u*Math.PI*2;return [.26+Math.cos(a)*.047*v,.027,Math.sin(a)*.038*v];},8,48,grass);
  for(let i=0;i<9;i++){const a=i*2.4,r=.008+i*.003;k.mesh(g,new THREE.DodecahedronGeometry(.012,0),leaf,.26+Math.cos(a)*r,.038,Math.sin(a)*r);}
  const path=points(t=>[-.43+.86*t,.024,0],80);strip(k,g,path.filter(p=>p[0]<.08),.10,paving);
  // Square fountain jets, fine paving joints, and restrained ground lighting.
  for(let i=0;i<5;i++)for(let j=0;j<3;j++){const x=-.22+i*.038,z=(j-1)*.030;k.cyl(g,.002,.002,.016+((i+j)%3)*.008,cool,x,.025+(.016+((i+j)%3)*.008)/2,z,6);}
  for(let i=0;i<17;i++){const x=-.43+i*.052;if(x>.09&&x<.38)continue;k.box(g,.001,.001,.20,stone,x,.024,0);}
  bollards(k,g,[[-.40,-.10],[-.40,.10],[.39,-.12],[.39,.12]],'#e4cfaa');people(k,g,[[-.32,.03],[-.28,.05],[.01,-.03],[.055,.08],[-.12,-.11],[.36,.10]]);
  k.merge(g);g.userData.axisDirection='river-to-city';return g;
}

export function createRiverbanks(k,{radius,channelX,landmarks}){
  const g=new THREE.Group();g.name='guangzhou-riverfront';const paving=k.mat('#b7bca8',.96),green=k.mat('#708968',.99),metal=k.mat('#58716a',.85),lamp=glow(k,'#e8cfa5',.58);
  const at=(a,offset,lift=.012)=>{const x=channelX(a)+offset,r=Math.sqrt(radius*radius-x*x);return new THREE.Vector3(x,Math.cos(a)*r,Math.sin(a)*r).normalize().multiplyScalar(radius+lift);};
  function ribbon(path,w,mat){const p=[],idx=[];path.forEach((v,i)=>{const tangent=path[Math.min(i+1,path.length-1)].clone().sub(path[Math.max(0,i-1)]).normalize(),cross=new THREE.Vector3().crossVectors(tangent,v.clone().normalize()).multiplyScalar(w/2);for(const s of [-1,1])p.push(...v.clone().addScaledVector(cross,s).toArray());if(i){const a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();mat.side=THREE.DoubleSide;k.mesh(g,geo,mat);}
  for(const side of [-1,1]){
    const path=Array.from({length:361},(_,i)=>at(i/360*Math.PI*2,side*.298));ribbon(path,.064,paving);ribbon(path.map(p=>p.clone().normalize().multiplyScalar(radius+.008)),.098,green);
    for(let i=0;i<120;i+=2){const a=i/120*Math.PI*2,p=at(a,side*.333,.014),item=new THREE.Group();item.position.copy(p);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p.clone().normalize());k.cyl(item,.002,.003,.032,metal,0,.016,0,6);k.box(item,.007,.005,.007,lamp,0,.034,0);g.add(item);}
  }
  const caps=[];landmarks.forEach((m,id)=>{if(id==='haixin')return;m.updateMatrixWorld(true);let angle=0;const n=m.position.clone().normalize();m.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)angle=Math.max(angle,n.angleTo(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld)));});caps.push({id,n,angle});});
  const connections=[];
  for(const cap of caps){
    const model=landmarks.get(cap.id),a=Math.atan2(cap.n.z,cap.n.y),end=at(a,Math.sign(cap.n.x)*.298).normalize();let start=cap.n.clone(),nearest=Infinity;
    model.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.length()>radius+.028)continue;const distance=v.angleTo(end);if(distance<nearest){nearest=distance;start=v.normalize();}}});
    const angle=start.angleTo(end),axis=new THREE.Vector3().crossVectors(start,end).normalize(),path=[];let clear=true;
    for(let i=0;i<=48;i++){const n=start.clone().applyAxisAngle(axis,angle*i/48);if(caps.some(c=>c!==cap&&n.angleTo(c.n)<c.angle+.008)){clear=false;break;}path.push(n.multiplyScalar(radius+.015));}
    if(clear){ribbon(path,.036,paving);connections.push(cap.id);}
  }
  function nearestGround(model,toward){
    let found,nearest=Infinity;
    model.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.length()>radius+.029)continue;const d=v.angleTo(toward);if(d<nearest){nearest=d;found=v.normalize();}}});return found;
  }
  function connect(start,end,w=.040){
    const angle=start.angleTo(end),axis=new THREE.Vector3().crossVectors(start,end).normalize(),path=Array.from({length:49},(_,i)=>start.clone().applyAxisAngle(axis,angle*i/48).multiplyScalar(radius+.016));
    ribbon(path,w,paving);return path;
  }
  const districtLinks=[];
  const square=landmarks.get('huacheng');
  if(square)for(const id of ['twins','opera','museum']){
    const other=landmarks.get(id);if(!other)continue;
    const a=nearestGround(square,other.position),b=nearestGround(other,square.position);
    if(!a||!b)continue;
    const path=connect(a,b,id==='twins'?.065:.043);
    districtLinks.push({from:'huacheng',to:id,points:[path[0].toArray(),path.at(-1).toArray()]});
  }
  const bridge=landmarks.get('haixin'),bridgeLinks=[];
  if(bridge)for(const [x,z]of bridge.userData.approachEnds){
    const sag=radius-Math.sqrt(radius*radius-x*x-z*z),start=new THREE.Vector3(x,.016-sag,z).applyMatrix4(bridge.matrixWorld).normalize(),end=at(Math.atan2(start.z,start.y),Math.sign(start.x)*.298).normalize();
    const path=connect(start,end,.058);bridgeLinks.push({points:[path[0].toArray(),path.at(-1).toArray()]});
  }
  k.merge(g);g.userData.connections=connections;g.userData.districtLinks=districtLinks;g.userData.bridgeLinks=bridgeLinks;g.traverse(o=>{if(o.isMesh){o.castShadow=o.material===metal;o.receiveShadow=true;}});return g;
}
