import * as THREE from 'three';

// Compact broadleaf trees for larger woodland parcels. Folded leaf clusters
// retain a broken silhouette at normal zoom without duplicating heavy willows.
export function woodlandTree(radius,height,seed,leafCount=92){
  let state=17;for(const c of seed)state=(Math.imul(state,31)+c.charCodeAt(0))>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const root=new THREE.Group();root.name='woodland-tree';
  const wood=new THREE.MeshStandardMaterial({color:'#8e7e61',roughness:.88});
  const twig=(a,b,r)=>{
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r*.60,r,a.distanceTo(b),5),wood);
    o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());o.castShadow=true;root.add(o);
  };
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  twig(v(0,0,0),v(0,height*.86,0),.0034);
  twig(v(0,height*.38,0),v(-radius*.53,height*.87,radius*.12),.0018);
  twig(v(0,height*.45,0),v(radius*.48,height*.79,-radius*.26),.0018);
  const positions=[],colors=[],indices=[],dark=new THREE.Color('#537357'),light=new THREE.Color('#91a879'),phase=random()*6.28;
  for(let i=0;i<leafCount;i++){
    const y=1-2*(i+.5)/leafCount,a=phase+i*2.39996+(random()-.5)*.45,ring=Math.sqrt(1-y*y),lobes=.87+.11*Math.sin(a*3+phase);
    const center=v(Math.cos(a)*radius*ring*lobes,height*(.94+y*.30),Math.sin(a)*radius*ring*lobes);
    const n=v(Math.cos(a)*ring,.5+y*.30,Math.sin(a)*ring).normalize();
    const along=v(-Math.sin(a),.10*Math.cos(a*4),Math.cos(a));along.addScaledVector(n,-along.dot(n)).normalize();
    const across=n.clone().cross(along),length=radius*(.29+random()*.08),width=radius*(.21+random()*.05),start=positions.length/3;
    const color=dark.clone().lerp(light,.13+random()*.45+Math.max(0,y)*.17);
    for(const p of [center.clone().addScaledVector(along,-length),center.clone().addScaledVector(across,width).addScaledVector(n,radius*.04),center.clone().addScaledVector(along,length),center.clone().addScaledVector(across,-width).addScaledVector(n,radius*.04)]){
      positions.push(...p.toArray());colors.push(...color.toArray());
    }
    indices.push(start,start+1,start+2,start,start+2,start+3);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  const canopy=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.88,side:THREE.DoubleSide}));
  canopy.name='woodland-leaf-canopy';canopy.castShadow=true;canopy.receiveShadow=true;root.add(canopy);return root;
}

// Closed, softly lobed crowns. Colour variation is stored in geometry so the
// same foliage can be exported to the native GLBs without a browser-only shader.
export function foliage(rx,ry,rz,color,seed=0,segments=14){
  const geometry=new THREE.SphereGeometry(1,segments,Math.max(6,Math.round(segments*.7))),pos=geometry.attributes.position,colors=[];
  const base=new THREE.Color(color),light=new THREE.Color('#b0c594'),shade=new THREE.Color('#557c60');
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),a=Math.atan2(z,x),latitude=Math.asin(Math.max(-1,Math.min(1,y)));
    const lobes=1+.095*Math.sin(a*5+seed)*Math.cos(latitude)**2+.055*Math.cos(a*3+latitude*4+seed);
    pos.setXYZ(i,x*rx*lobes,y*ry*(1+.04*Math.sin(a*4+seed)*(1-y*y)),z*rz*lobes);
    const tone=base.clone().lerp(y>0?light:shade,Math.abs(y)*.20+.045*Math.sin(a*3+seed)*(1-y*y));colors.push(...tone.toArray());
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  // Sphere seams and poles duplicate vertices; share their lighting normals.
  const normals=geometry.attributes.normal,{widthSegments,heightSegments}=geometry.parameters,columns=widthSegments+1;
  const averageNormals=indices=>{
    const n=new THREE.Vector3();
    for(const i of indices)n.add(new THREE.Vector3().fromBufferAttribute(normals,i));
    n.normalize();for(const i of indices)normals.setXYZ(i,n.x,n.y,n.z);
  };
  for(let row=1;row<heightSegments;row++)averageNormals([row*columns,row*columns+widthSegments]);
  for(const row of [0,heightSegments])averageNormals(Array.from({length:columns},(_,i)=>row*columns+i));
  normals.needsUpdate=true;
  const o=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.9}));
  o.castShadow=true;o.receiveShadow=true;return o;
}

export function willow(width,depth,seed='willow'){
  let value=2166136261;for(const c of String(seed)){value^=c.charCodeAt(0);value=Math.imul(value,16777619);}
  const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  const root=new THREE.Group(),height=.130*(.94+random()*.12),rx=width*.43,rz=depth*.43,phase=random()*Math.PI*2;
  root.name='weeping-willow';
  const wood=new THREE.MeshStandardMaterial({color:'#73705a',roughness:.95});
  const twig=new THREE.MeshStandardMaterial({color:'#7c975f',roughness:.95});
  const leaf=new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.9,side:THREE.DoubleSide});
  const branch=(points,radius,segments=7,sides=4,curveKind='catmull')=>{
      const curve=curveKind==='cubic'?new THREE.CubicBezierCurve3(points[0],points[1],points[2],points[3]):new THREE.CatmullRomCurve3(points),geometry=new THREE.TubeGeometry(curve,segments,radius,sides,false),position=geometry.attributes.position;
    for(let i=0;i<=segments;i++){
      const center=curve.getPointAt(i/segments),taper=1-i/segments*.72;
      for(let j=0;j<=sides;j++){const n=i*(sides+1)+j;position.setXYZ(n,center.x+(position.getX(n)-center.x)*taper,center.y+(position.getY(n)-center.y)*taper,center.z+(position.getZ(n)-center.z)*taper);}
    }
    geometry.computeVertexNormals();
    const o=new THREE.Mesh(geometry,radius<.001?twig:wood);
    o.castShadow=true;o.receiveShadow=true;root.add(o);return curve;
  };
  const lean=new THREE.Vector3(Math.cos(phase)*.006,height*.53,Math.sin(phase)*.004);
  branch([new THREE.Vector3(0,0,0),new THREE.Vector3(-.002,height*.23,.001),lean],.0039,10,7);
  const positions=[],colors=[],indices=[],light=new THREE.Color('#a9c584'),dark=new THREE.Color('#608754');
  const lance=(a,b,c,d,color)=>{
    const start=positions.length/3;
    for(const p of [a,b,c,d]){positions.push(...p.toArray());colors.push(...color.toArray());}
    indices.push(start,start+1,start+2,start,start+2,start+3);
  };
  // The crown is entirely made of leaves on arched, hanging shoots. No solid
  // crown lobes: the branch forks and the sky remain visible through the veil.
  for(let i=0;i<6;i++){
    const a=phase+i*Math.PI/3+(random()-.5)*.38,shoulder=.84+random()*.14;
    const fork=lean.clone();fork.y-=i%3*.006;
    const limb=branch([fork,new THREE.Vector3(Math.cos(a)*rx*.27,height*(shoulder-.20),Math.sin(a)*rz*.27),new THREE.Vector3(Math.cos(a+.04)*rx*.57,height*shoulder,Math.sin(a+.04)*rz*.57),new THREE.Vector3(Math.cos(a+.10)*rx*.86,height*(shoulder-.13),Math.sin(a+.10)*rz*.86)],.00190,24,5,'cubic');
    for(let k=0;k<8;k++){
      const layer=k%4,angle=a+(Math.floor(k/4)-.5)*.42+(random()-.5)*.22,r=.55+layer*.17+random()*.06;
      const drop=(layer>1?.09:.24)+random()*(layer>1?.20:.22),sweep=(random()-.5)*.16;
      const origin=limb.getPoint(.30+layer*.17);
            const p1=new THREE.Vector3(Math.cos(angle)*rx*r,height*(shoulder-.025-layer*.055+random()*.035),Math.sin(angle)*rz*r);
            const p2=new THREE.Vector3(Math.cos(angle+sweep*.4)*rx*(r+.04),height*(drop+(shoulder-drop)*.50),Math.sin(angle+sweep*.4)*rz*(r+.04));
            const p3=new THREE.Vector3(Math.cos(angle+sweep)*rx*(r-.07),height*drop,Math.sin(angle+sweep)*rz*(r-.07));
            const endY=height*drop,fall=origin.y-endY;
            p1.y=Math.min(p1.y,origin.y-fall*.12);
            p2.y=Math.max(endY,Math.min(p2.y,origin.y-fall*.56,p1.y));
            const curve=branch([origin,p1,p2,p3],.00032,8,3,'cubic');
      const count=32+Math.floor(random()*7);
      for(let j=0;j<count;j++){
        // Alternating leaf azimuth and uneven spacing prevent flat, comb-like
        // sprays. A shallow fold gives each lance two softly lit surfaces.
        const t=.045+(j+.25*(random()-.5))/(count-1)*.92,p=curve.getPoint(Math.max(0,t));
        const length=((.00585+random()*.00195)*(.85+.15*Math.sin(t*Math.PI)))*1.25,azimuth=angle+j*2.39996+k*.43+(random()-.5)*.55;
        const outward=new THREE.Vector3(Math.cos(azimuth),0,Math.sin(azimuth)),across=new THREE.Vector3(-Math.sin(azimuth),0,Math.cos(azimuth));
        const end=p.clone().addScaledVector(outward,length*.36);end.y-=length*.90;
        const center=p.clone().lerp(end,.40).addScaledVector(outward,-length*.045),side=across.multiplyScalar((.000684+random()*.000252)*1.25);
        const left=center.clone().add(side),right=center.clone().sub(side);
        const color=dark.clone().lerp(light,.34+random()*.42);
        lance(p,left,end,right,color);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const sprays=new THREE.Mesh(geometry,leaf);sprays.castShadow=true;sprays.receiveShadow=true;root.add(sprays);
  // Canopy variation stays inside the garden's allocated footprint.
  const bounds=new THREE.Box3().setFromObject(root);
  root.scale.x=Math.min(1,width/(2*Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x))));
  root.scale.z=Math.min(1,depth/(2*Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z))));
  root.scale.y=Math.min(1,Math.min(width,depth)/.10);
  return root;
}
