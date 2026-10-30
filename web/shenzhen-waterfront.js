import * as THREE from 'three';
import {glow} from './shenzhen-forms.js';

export function createWaterfront(k,{radius,shorelineZ,landmarks}){
  const g=new THREE.Group();g.name='shenzhen-coastal-greenway';
  const paving=k.mat('#b9baa7',.95),kerb=k.mat('#ded3b7',.90),green=k.mat('#6f8b71',.98),bark=k.mat('#85755b',.9),leaves=k.mat('#46745c',.95),metal=k.mat('#4c6667',.72,.18),lamp=glow(k,'#f2cfa0',.70);
  const caps=[];landmarks.forEach(model=>{model.updateWorldMatrix(true,true);const normal=model.position.clone().normalize();let angle=0;model.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)angle=Math.max(angle,normal.angleTo(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld)));});caps.push({id:model.name,normal,angle});});
  const at=(a,inset,lift=.012)=>{const z=shorelineZ(a)-inset,r=Math.sqrt(radius*radius-z*z);return new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,z).normalize().multiplyScalar(radius+lift);};
  function ribbon(points,width,material){
    const p=[],idx=[];for(let i=0;i<points.length;i++){const v=points[i],n=v.clone().normalize(),t=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize(),cross=new THREE.Vector3().crossVectors(t,n).normalize().multiplyScalar(width/2);for(const side of [-1,1]){const q=v.clone().addScaledVector(cross,side).normalize().multiplyScalar(v.length());p.push(q.x,q.y,q.z);}if(i){const a=(i-1)*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();material.side=THREE.DoubleSide;return k.mesh(g,geo,material);
  }
  const coast=Array.from({length:361},(_,i)=>at(i/360*Math.PI*2,.048));
  ribbon(coast,.065,kerb);ribbon(coast.map(p=>p.clone().normalize().multiplyScalar(radius+.013)),.050,paving);
  ribbon(Array.from({length:361},(_,i)=>at(i/360*Math.PI*2,.108,.008)),.045,green);
  // Lamps and palms belong to the narrow coastal greenway, not the city interior.
  for(let i=0;i<58;i++){
    const a=i/58*Math.PI*2,n=at(a,.094).normalize(),p=n.clone().multiplyScalar(radius+.010);
    if(caps.some(c=>n.angleTo(c.normal)<c.angle+.015))continue;
    const item=new THREE.Group();item.position.copy(p);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);
    k.cyl(item,.0023,.0033,.046,metal,0,.023,0,7);k.box(item,.011,.005,.009,lamp,0,.048,0);
    if(i%2===0){const x=.025,h=.09+(i%3)*.009;k.beam(item,[x,0,0],[x+.007,h,0],.003,bark,6);for(let j=0;j<7;j++){const a=j/7*Math.PI*2;k.line(item,Array.from({length:5},(_,s)=>{const t=s/4;return [x+.007+Math.cos(a)*.045*t,h+.013*Math.sin(t*Math.PI)-.024*t*t,Math.sin(a)*.045*t];}),.0045,leaves);}}
    g.add(item);
  }
  // Link only the waterfront districts. Test each route against other modules
  // before adding it, so a removed/repositioned landmark cannot leave a path
  // cutting through an unrelated building.
  const connections=[];
  for(const id of ['civic','cocoon','diwang','wheel','window','minghua','talent']){
    const cap=caps.find(c=>c.id===id);if(!cap)continue;
    const a=Math.atan2(cap.normal.y,cap.normal.x),end=at(a,.048).normalize(),model=landmarks.get(id);let start=cap.normal.clone(),nearest=Infinity;
    model.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const p=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld);if(p.length()>radius+.025)continue;const angle=p.angleTo(end);if(angle<nearest){nearest=angle;start=p.normalize();}}});
    const distance=start.angleTo(end);if(distance<.002)continue;
    const axis=new THREE.Vector3().crossVectors(start,end).normalize(),points=[];let clear=true;for(let i=0;i<=60;i++){const n=start.clone().applyAxisAngle(axis,distance*i/60);if(caps.some(c=>c!==cap&&n.angleTo(c.normal)<c.angle+.012)){clear=false;break;}points.push(n.multiplyScalar(radius+.014));}
    if(clear){ribbon(points,.038,paving);connections.push({id,start:start.toArray(),end:end.toArray()});}
  }
  const districtLinks=[];
  function facingGround(model,toward){
    let nearest=Infinity,point=model.position.clone().normalize();
    model.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.length()>radius+.025)continue;const distance=v.angleTo(toward);if(distance<nearest){nearest=distance;point=v.normalize();}}});return point;
  }
  // The park is part of the Houhai waterfront district. Short walking links
  // meet the actual edges of the Spring Bamboo and Spring Cocoon forecourts.
  for(const from of ['bamboo','cocoon']){
    const to='talent',a=landmarks.get(from),b=landmarks.get(to);if(!a||!b)continue;
    const start=facingGround(a,b.position),end=facingGround(b,a.position),angle=start.angleTo(end),axis=new THREE.Vector3().crossVectors(start,end).normalize(),points=[];let clear=true;
    for(let i=0;i<=40;i++){const n=start.clone().applyAxisAngle(axis,angle*i/40);if(caps.some(c=>![from,to].includes(c.id)&&n.angleTo(c.normal)<c.angle+.012)){clear=false;break;}points.push(n.multiplyScalar(radius+.015));}
    if(!clear)continue;
    ribbon(points.map(p=>p.clone().normalize().multiplyScalar(radius+.009)),.069,green);ribbon(points,.034,paving);
    for(const i of [10,30]){
      const p=points[i],n=p.clone().normalize(),t=points[i+1].clone().sub(points[i-1]).normalize(),side=new THREE.Vector3().crossVectors(t,n).normalize().multiplyScalar(.024),q=p.clone().add(side).normalize().multiplyScalar(radius+.014),item=new THREE.Group();item.position.copy(q);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);k.cyl(item,.002,.0026,.026,metal,0,.013,0,6);k.box(item,.007,.004,.007,lamp,0,.029,0);g.add(item);
    }
    districtLinks.push({from,to,start:start.toArray(),end:end.toArray()});
  }
  k.merge(g);g.userData.connections=connections;g.userData.districtLinks=districtLinks;g.traverse(o=>{if(o.isMesh){o.castShadow=o.material!==paving&&o.material!==kerb&&o.material!==green;o.receiveShadow=true;o.material.envMapIntensity=.18;}});return g;
}
