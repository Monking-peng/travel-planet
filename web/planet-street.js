import * as THREE from 'three';

// Street furniture shares a miniature scale with the roughly 0.047-high people.
export function createStreetProp(prop){
  const g=new THREE.Group();g.name='street:'+prop.id;g.userData.streetPropId=prop.id;
  const mesh=(geometry,color)=>{const o=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.88}));o.castShadow=true;o.receiveShadow=true;return o;};
  const box=(w,h,d,color)=>mesh(new THREE.BoxGeometry(w,h,d),color);
  const add=(o,x=0,y=0,z=0)=>{o.position.set(x,y,z);g.add(o);return o;};
  if(prop.type==='bench'){
    for(let i=0;i<4;i++)add(box(.060,.003,.006,'#96785a'),0,.0135,-.01275+i*.00825);
    add(box(.060,.016,.0045,'#96785a'),0,.022,-.01725);
    for(const x of [-.0225,.0225])add(box(.004,.012,.021,'#4c7d65'),x,.006,0);
  }else if(prop.type==='lamp'){
    add(mesh(new THREE.CylinderGeometry(.002,.003,.095,8),'#536e61'),0,.047,0);
    add(box(.025,.004,.016,'#536e61'),.008,.095,0);add(box(.021,.005,.011,'#f2dfac'),.008,.091,0);
  }else if(prop.type==='visitor'){
    const posed=Boolean(prop.pose);
    // Closed triangular sleeves/legs leave enough geometry for more people
    // and readable gestures, instead of adding identical standing figures.
    const limb=(w,h,d,color)=>{
      if(!posed)return box(w,h,d,color);
      const ring=[[-w/2,-d/2],[w/2,-d/2],[0,d/2]],p=[],ix=[];
      for(let k=0;k<3;k++){
        const a=ring[k],b=ring[(k+1)%3],n=p.length/3;
        p.push(a[0],-h/2,a[1],b[0],-h/2,b[1],b[0],h/2,b[1],a[0],h/2,a[1]);ix.push(n,n+1,n+2,n,n+2,n+3);
      }
      for(const sign of [-1,1]){const n=p.length/3;for(const [x,z] of ring)p.push(x,sign*h/2,z);ix.push(...(sign>0?[n,n+2,n+1]:[n,n+1,n+2]));}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();return mesh(geo,color);
    };
    add(mesh(new THREE.SphereGeometry(.0055,8,posed?4:6),'#d8b594'),0,.034,0);
    if(posed){
      const coat=new THREE.BoxGeometry(.014,.017,.010),p=coat.attributes.position;
      for(let i=0;i<p.count;i++)if(p.getY(i)>0){p.setX(i,p.getX(i)*.72);p.setZ(i,p.getZ(i)*.8);}
      coat.computeVertexNormals();add(mesh(coat,prop.color),0,.020,0);
    }else add(mesh(new THREE.CylinderGeometry(.005,.007,.017,8),prop.color),0,.020,0);
    for(const sign of [-1,1]){
      const leg=add(limb(.003,.014,.004,'#5b6e64'),sign*.003,.007,prop.pose==='walk'?sign*.0025:0);
      if(prop.pose==='walk')leg.rotation.x=sign*.24;
      const arm=add(limb(.0025,.014,.003,prop.color),sign*.007,prop.pose==='photo'?.028:.019,prop.pose==='photo'?.006:0);
      arm.rotation.z=sign*(prop.pose==='photo'?1.0:prop.pose==='talk'?.55:.10);
      if(prop.pose==='walk')arm.rotation.x=-sign*.38;
      if(prop.pose==='wave'&&sign===1){arm.position.y=.030;arm.rotation.z=-.55;}
    }
    if(prop.pose==='photo')add(box(.007,.004,.0016,'#405861'),0,.033,.011);
    g.scale.setScalar(1.2);
  }else if(prop.type==='railing'){
    for(let i=0;i<7;i++)add(box(.004,.031,.006,'#b7b89e'),0,.015,-.075+i*.025);
    add(box(.007,.005,.16,'#d8cbae'),0,.032,0);
  }else throw new Error('Unknown street prop: '+prop.type);
  return g;
}
