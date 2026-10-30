import * as THREE from 'three';
import {glow} from './shenzhen-forms.js';

// Landscape follows the sphere. These are shared mountains and riverside public
// spaces, not anonymous buildings or parts left behind by a removed landmark.
export function createChangshaLandscape(k,{radius,landmarks,channelX,terrain}){
  const group=new THREE.Group();group.name='changsha-connected-landscape';
  const project=(x,z,height=0,side=1)=>new THREE.Vector3(x,side*Math.sqrt(Math.max(.001,radius*radius-x*x-z*z)),z).normalize().multiplyScalar(radius+height);
  const caps=[];landmarks.forEach(model=>{
    const normal=model.position.clone().normalize();let angle=0;
    model.updateWorldMatrix(true,true);model.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);angle=Math.max(angle,normal.angleTo(v));}});
    caps.push({normal,angle});
  });
  const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
  const clearance=p=>Math.min(...caps.map(c=>p.angleTo(c.normal)-c.angle));
  const ridgeHeight=(x,z)=>{
    if(x*x+z*z>radius*radius-.04)return 0;
    const field=.42*Math.exp(-(((x+1.62)/.58)**2)-((z+.10)/1.08)**2)+.21*Math.exp(-(((x+1.33)/.40)**2)-((z+.59)/.53)**2)+.14*Math.exp(-(((x+1.20)/.50)**2)-((z-1.45)/.60)**2);
    return field*smooth(clearance(project(x,z).normalize())/.14)*smooth((-x-.43)/.30);
  };
  // Deform the existing terrain itself; an overlay sheet leaves a hard dark
  // outline and can cover a courtyard despite the buildings remaining separate.
  const vertices=terrain.geometry.attributes.position,colors=[],low=new THREE.Color('#91a18a'),high=new THREE.Color('#67815d');
  for(let i=0;i<vertices.count;i++){
    const v=new THREE.Vector3().fromBufferAttribute(vertices,i),h=v.y>0?ridgeHeight(v.x,v.z):0,color=low.clone().lerp(high,smooth(h/.24));
    v.normalize().multiplyScalar(radius+h);vertices.setXYZ(i,v.x,v.y,v.z);colors.push(color.r,color.g,color.b);
  }
  terrain.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));vertices.needsUpdate=true;terrain.geometry.computeVertexNormals();terrain.material.vertexColors=true;
  // Dense, irregular woodland is confined to the actual mountain slopes.
  const leaves=['#4d7457','#5e7f59','#71865b','#476c51','#878b55'].map(c=>k.mat(c,.96)),bark=k.mat('#6d6451');
  for(let i=0;i<720;i++){
    const x=-2.02+((i*.61803398875)%1)*1.42,z=-1.70+((i*.41421356237)%1)*3.35;
    if(x*x+z*z>radius*radius-.10)continue;
    const h=ridgeHeight(x,z),p=project(x,z,h+.003),n=p.clone().normalize();
    if(h<.014||clearance(n)<.038)continue;
    const s=.071+(i%5)*.010,tree=new THREE.Group();tree.position.copy(p);tree.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);
    k.cyl(tree,.0025,.0035,s*.65,bark,0,s*.32,0,6);
    for(let j=0;j<5;j++){const crown=k.mesh(tree,new THREE.IcosahedronGeometry(s*.44,1),leaves[(i+j)%leaves.length],Math.cos(j*2.4)*s*.24,s*(.69+(j%3)*.10),Math.sin(j*2.4)*s*.24);crown.scale.y=.95;}
    group.add(tree);
  }
  const stone=k.mat('#acaf99',.95),edge=k.mat('#c5c4ac',.9),metal=k.mat('#596a62',.8),light=glow(k,'#efd0a0',.78);
  function ribbon(points,width,mat){
    const p=[],idx=[];for(let i=0;i<points.length;i++){
      const v=points[i],n=v.clone().normalize(),t=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize(),cross=new THREE.Vector3().crossVectors(t,n).normalize().multiplyScalar(width/2);
      for(const side of [-1,1]){const q=v.clone().addScaledVector(cross,side).normalize().multiplyScalar(v.length());p.push(q.x,q.y,q.z);}
      if(i){const a=(i-1)*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();mat.side=THREE.DoubleSide;return k.mesh(group,geo,mat);
  }
  // Continuous bank walks remain outside the water and connect both hemispheres.
  for(const side of [-1,1]){
    const points=[];for(let i=0;i<=320;i++){const a=i/320*Math.PI*2,x=channelX(a)+side*.267,yz=Math.sqrt(radius*radius-x*x);points.push(new THREE.Vector3(x,Math.cos(a)*yz,Math.sin(a)*yz).normalize().multiplyScalar(radius+.008));}
    ribbon(points,.054,edge);ribbon(points.map(v=>v.clone().normalize().multiplyScalar(radius+.010)),.041,stone);
    for(let i=0;i<54;i++){
      const a=i/54*Math.PI*2,x=channelX(a)+side*.297,yz=Math.sqrt(radius*radius-x*x),v=new THREE.Vector3(x,Math.cos(a)*yz,Math.sin(a)*yz).normalize(),g=new THREE.Group();g.position.copy(v).multiplyScalar(radius+.012);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v);
      k.cyl(g,.002,.003,.037,metal,0,.0185,0,6);k.box(g,.009,.006,.008,light,0,.040,0);group.add(g);
    }
  }
  // Each entrance meets its nearest river walk; endpoints use the real module
  // transform instead of guessed world coordinates that can cross the water.
  landmarks.forEach((model,id)=>{
    if(id==='juzhouBridge')return;
    const p=model.localToWorld(new THREE.Vector3(0,0,id==='yuelu'?.68:id==='meixi'?.72:.51)).normalize(),a=Math.atan2(p.z,p.y),x=channelX(a)+Math.sign(p.x)*.267,yz=Math.sqrt(radius*radius-x*x),end=new THREE.Vector3(x,Math.cos(a)*yz,Math.sin(a)*yz).normalize();
    const route=[];for(let i=0;i<=56;i++){const n=p.clone().lerp(end,i/56).normalize(),q=n.clone().multiplyScalar(radius),h=n.y>0?ridgeHeight(q.x,q.z):0;route.push(n.multiplyScalar(radius+h+.011));}
    ribbon(route,.036,stone);
  });
  // A loop walk and ordered grove give the long, low island its aerial character.
  for(const side of [-1,1]){
    const points=[];for(let i=1;i<90;i++){const a=-.65+i/90*1.40,w=.19*Math.pow(Math.sin(i/90*Math.PI),.65),x=channelX(a)+side*w*.34,yz=Math.sqrt(radius*radius-x*x);points.push(new THREE.Vector3(x,Math.cos(a)*yz,Math.sin(a)*yz).normalize().multiplyScalar(radius+.020));}
    ribbon(points,.012,edge);
  }
  for(let i=0;i<42;i++){
    const t=(i+.5)/42,a=-.62+t*1.32,w=.19*Math.pow(Math.sin(t*Math.PI),.65),x=channelX(a)+Math.sin(i*2.4)*w*.15,yz=Math.sqrt(radius*radius-x*x),n=new THREE.Vector3(x,Math.cos(a)*yz,Math.sin(a)*yz).normalize();
    if(Math.abs(a+.07)<.15)continue;
    const g=new THREE.Group();g.position.copy(n).multiplyScalar(radius+.021);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);
    k.cyl(g,.002,.0025,.025,bark,0,.012,0,5);const crown=k.mesh(g,new THREE.IcosahedronGeometry(.022+(i%3)*.003,1),leaves[i%3],0,.039,0);crown.scale.y=1.2;group.add(g);
  }
  // Shared lights need no per-frame shadow maps; actual landmark lamps remain
  // owned by their removable modules.
  k.merge(group);group.traverse(o=>{if(o.isMesh){o.castShadow=o.material!==stone&&o.material!==edge;o.receiveShadow=true;o.material.envMapIntensity=.18;}});
  return group;
}
