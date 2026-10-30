import * as THREE from 'three';

// Landscape connections on the miniature globe, not real street navigation.
export function createShundeWaterfront(k,{radius,channelX,landmarks}){
  const g=new THREE.Group();g.name='shunde-riverside-walks';
  const stone=k.mat('#b8b7a6',.98),edge=k.mat('#d1cbbb',.98),metal=k.mat('#596b5b',.88),lamp=k.mat('#dec693',.6,.1,'#f0d8a9');lamp.userData.night.intensity=.65;
  const samples=[],connections=[];
  const bank=(a,side,lift=.014)=>{const x=channelX(a)+side*.145,r=Math.sqrt(radius*radius-x*x);return new THREE.Vector3(x,Math.cos(a)*r,Math.sin(a)*r).normalize().multiplyScalar(radius+lift);};
  function ribbon(points,width,mat){
    const pos=[],idx=[];points.forEach((v,i)=>{const n=v.clone().normalize(),t=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize(),cross=new THREE.Vector3().crossVectors(t,n).normalize().multiplyScalar(width/2);for(const s of [-1,1])pos.push(...v.clone().addScaledVector(cross,s).normalize().multiplyScalar(v.length()).toArray());if(i){const j=(i-1)*2;idx.push(j,j+1,j+2,j+1,j+3,j+2);}});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();mat.side=THREE.DoubleSide;k.mesh(g,geo,mat);samples.push(...points.map(v=>v.toArray()));
  }
  for(const side of [-1,1]){
    const route=Array.from({length:361},(_,i)=>bank(i/360*Math.PI*2,side));ribbon(route,.052,edge);ribbon(route.map(v=>v.clone().normalize().multiplyScalar(radius+.015)),.040,stone);
    for(let i=0;i<44;i++){
      const a=i/44*Math.PI*2,p=bank(a,side),post=new THREE.Group();post.position.copy(p);post.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p.clone().normalize());k.cyl(post,.002,.003,.035,metal,side*.021,.018,0,6);k.box(post,.008,.004,.008,lamp,side*.021,.037,0);g.add(post);
    }
  }
  // End each branch at an existing forecourt/park path; do not cross ponds.
  for(const [id,x,z]of [['qinghui',.61,.43],['huagai',.60,.51],['shunfeng',-.80,.15],['hem',-.57,.32],['fengjian',.58,.40],['theatre',-.67,.18],['bijiang',.51,.30],['baolin',-.48,.45]]){
    const model=landmarks.get(id);model.updateWorldMatrix(true,true);const local=new THREE.Vector3(x,Math.sqrt(radius*radius-x*x-z*z)-radius,z),start=model.localToWorld(local).normalize(),a=Math.atan2(start.z,start.y),end=bank(a,Math.sign(start.x)).normalize(),route=[];
    for(let i=0;i<=60;i++)route.push(start.clone().lerp(end,i/60).normalize().multiplyScalar(radius+.014));ribbon(route,.035,stone);connections.push({id,start:route[0].toArray(),end:route.at(-1).toArray()});
  }
  k.merge(g);g.userData={samples,connections};g.traverse(o=>{if(o.isMesh){o.castShadow=o.material===metal;o.receiveShadow=true;}});return g;
}
