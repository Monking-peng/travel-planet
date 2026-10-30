import * as THREE from 'three';

// Short sphere-following landscape links preserve the compressed north/south
// order. They are viewing-map paths, not real street or travel routing data.
export function createBeijingAxis(k,{radius,landmarks}){
  const g=new THREE.Group();g.name='beijing-axis-landscape';
  const stone=k.mat('#c4c1aa',.98),edge=k.mat('#aaa991',.96),pole=k.mat('#59624e',.88),lamp=k.mat('#e9cb8d',.5,.1,'#f6d599');lamp.userData.night.intensity=.70;
  const points=[],connections=[];
  const local=(id,x,z)=>{const model=landmarks.get(id);model.updateWorldMatrix(true,true);return model.localToWorld(new THREE.Vector3(x,Math.sqrt(radius*radius-x*x-z*z)-radius,z)).normalize();};
  function link(a,b,width=.062){
    const route=[];for(let i=0;i<=80;i++)route.push(a.clone().lerp(b,i/80).normalize().multiplyScalar(radius+.014));
    for(let i=0;i<route.length-1;i++){
      const v=route[i],next=route[i+1],normal=v.clone().normalize(),tangent=next.clone().sub(v).normalize(),across=new THREE.Vector3().crossVectors(tangent,normal).normalize().multiplyScalar(width/2),verts=[];
      for(const p of [v.clone().sub(across),v.clone().add(across),next.clone().sub(across),next.clone().add(across)])verts.push(...p.normalize().multiplyScalar(radius+.014).toArray());
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex([0,1,2,1,3,2]);geo.computeVertexNormals();stone.side=THREE.DoubleSide;k.mesh(g,geo,stone);
      if(i%6===0){const bar=new THREE.Group();bar.position.copy(v);bar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);bar.rotateY(Math.atan2(tangent.x,tangent.z));k.box(bar,width,.0015,.002,edge,0,.001,0);g.add(bar);}
      if(i%16===0)for(const sign of [-1,1]){const pos=v.clone().addScaledVector(across,sign*1.3).normalize().multiplyScalar(radius+.013),item=new THREE.Group();item.position.copy(pos);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),pos.clone().normalize());k.cyl(item,.002,.0025,.032,pole,0,.016,0,6);k.box(item,.007,.004,.007,lamp,0,.034,0);g.add(item);}
    }
    points.push(...route.map(v=>v.toArray()));return [route[0].toArray(),route.at(-1).toArray()];
  }
  for(const [from,fx,fz,to,tx,tz] of [
    ['tiananmen',0,-.40,'palace',0,.67],
    ['palace',0,-.67,'jingshan',0,.56],
    ['jingshan',0,-.56,'drum',0,.40],
  ])connections.push({from,to,ends:link(local(from,fx,fz),local(to,tx,tz))});
  // North-west and north-east exits meet the surrounding park edge, avoiding
  // new fictitious streets that cut through Beihai lake or other landmarks.
  k.merge(g);g.userData={connections,points};g.traverse(o=>{if(o.isMesh){o.castShadow=o.material===pole;o.receiveShadow=true;}});return g;
}
