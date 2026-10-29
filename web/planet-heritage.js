import * as THREE from 'three';
import {PLANET_RADIUS as R} from './planet-layout.js';
import {woodlandTree} from './planet-nature.js';
import {createStreetProp} from './planet-street.js';
import {HERITAGE_GLYPHS} from './planet-heritage-glyphs.js';

// Fixed Hangzhou landmarks replace anonymous housing in the artistic atlas.
export function createHeritageLandmark(parcel){
  const root=new THREE.Group(),liu=parcel.id==='garden-lane',prefix=liu?'liuhe':'chenghuang';root.name=prefix;
  const materials=new Map(),mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.84}));return materials.get(c);};
  const add=(geo,c,name,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat(c));o.name=prefix+'-'+name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
  const box=(n,x,y,z,w,h,d,c)=>add(new THREE.BoxGeometry(w,h,d),c,n,x,y,z);
  const tube=(n,pts,r,c)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),Math.max(4,pts.length*2),r,4,false),c,n);
  const ground=(x,z)=>Math.sqrt((R+.005)**2-x*x-z*z)-(R+.004);
  const wood=liu?'#97714f':'#965b4b',roof=liu?'#697568':'#596e62',stone='#c7c5b0',dark='#495a50';
  const w=parcel.width,d=parcel.depth,p=[],ix=[];
  for(let j=0;j<=12;j++)for(let i=0;i<=20;i++){const x=(i/20-.5)*w,z=(j/12-.5)*d;p.push(x,ground(x,z),z);if(j&&i){const n=j*21+i;ix.push(n,n-1,n-21,n-1,n-22,n-21);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();add(geo,'#9eaf83','garden-ground');
  function squareRoof(name,x,z,y,a,b,rise){
    const pos=[],index=[],N=32,K=5;
    const sample=(i,t)=>{const theta=i/N*Math.PI*2,c=Math.cos(theta),s=Math.sin(theta),den=Math.max(Math.abs(c),Math.abs(s)),corner=Math.min(Math.abs(c),Math.abs(s))/den;return [x+c/den*(a*.12+a*.38*t),y+rise*(1-t)**1.5+.009*t**5*corner**5,z+s/den*b/2*t];};
    for(let j=0;j<=K;j++)for(let i=0;i<N;i++)pos.push(...sample(i,j/K));
    for(let j=0;j<K;j++)for(let i=0;i<N;i++){const n=j*N+i,m=j*N+(i+1)%N;index.push(n,m,n+N,m,m+N,n+N);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(index);g.computeVertexNormals();const o=add(g,roof,name);o.material=mat(roof).clone();o.material.side=THREE.DoubleSide;
    for(let i=0;i<N;i+=2)tube(name+'-tile',Array.from({length:6},(_,j)=>sample(i,j/5)),.0007,'#8c9b7c');
    tube(name+'-ridge',[[x-a*.16,y+rise+.006,z],[x,y+rise+.003,z],[x+a*.16,y+rise+.006,z]],.002,'#a5a17c');
  }
  if(liu){
    // Thirteen visible eaves, with seven open galleries alternating with
    // solid brick levels, retain Liuhe's characteristic octagonal rhythm.
    add(new THREE.CylinderGeometry(.080,.092,.016,8),stone,'podium',0,.006,0);
    for(let k=0;k<13;k++){
      const radius=.059-k*.0016,y=.014+k*.025;
      add(new THREE.CylinderGeometry(radius,radius+.001,.026,8),k%2?'#b4a084':'#a48763','storey-'+k,0,y+.013,0);
      const rim=radius+.018,positions=[],indices=[],steps=5;
      for(let j=0;j<=steps;j++)for(let i=0;i<=8;i++){const a=i/8*Math.PI*2,t=j/steps,r=radius*.85+(rim-radius*.85)*t;positions.push(Math.sin(a)*r,y+.027+.014*(1-t)**1.6+.003*t**4,Math.cos(a)*r);if(j&&i){const n=j*9+i;indices.push(n,n-9,n-1,n-1,n-9,n-10);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const eave=add(g,roof,'eave-'+k);eave.material=mat(roof).clone();eave.material.side=THREE.DoubleSide;
      for(let side=0;side<8;side++){
        const angle=(side+.5)*Math.PI/4,r=radius*Math.cos(Math.PI/8),x=Math.sin(angle)*r,z=Math.cos(angle)*r;
        const win=box('arched-window',x,y+.015,z,.012,k%2?.008:.016,.0014,dark);win.rotation.y=angle;
        if(k%2===0){
          for(const offset of [-.23,.23]){const a=angle+offset;add(new THREE.CylinderGeometry(.0012,.0015,.023,5),wood,'gallery-post',Math.sin(a)*(radius+.009),y+.016,Math.cos(a)*(radius+.009));}
          const rail=box('gallery-rail',Math.sin(angle)*(radius+.010),y+.007,Math.cos(angle)*(radius+.010),radius*.70,.002,.002,wood);rail.rotation.y=angle;
        }
      }
    }
    add(new THREE.ConeGeometry(.043,.036,8),roof,'crown',0,.359,0);
    add(new THREE.SphereGeometry(.006,8,6),'#b4a16b','finial',0,.381,0);
    box('door',0,.023,.060,.018,.025,.003,dark);
  }else{
    box('podium',0,.008,0,.290,.024,.212,stone);
    for(let k=0;k<7;k++){
      const a=.216-k*.013,b=.150-k*.007,y=.021+k*.034;
      box('storey-'+k,0,y+.014,0,a*.85,.028,b*.79,wood);
      for(const side of [-1,1]){
        for(let j=-2;j<=2;j++){
          box('lattice-window',j*a*.16,y+.016,side*b*.400,a*.105,.019,.002,dark);
          box('window-mullion',j*a*.16,y+.016,side*(b*.400+.0012),.0013,.019,.001,wood);
          add(new THREE.CylinderGeometry(.0018,.002,.030,5),wood,'gallery-pillar',j*a*.21,y+.015,side*b*.58);
          box('balustrade-post',j*a*.21,y+.007,side*b*.65,.002,.012,.002,stone);
        }
        box('balustrade',0,y+.013,side*b*.65,a*1.12,.002,.002,stone);
        box('side-gallery',side*a*.56,y+.013,0,.002,.002,b*1.3,stone);
      }
      box('gallery-floor',0,y+.001,0,a*1.16,.004,b*1.36,stone);
      if([0,1,3,5,6].includes(k))squareRoof('eave-'+k,0,0,y+.030,a*1.38,b*1.55,k===6?.037:.023);
    }
    // Four subsidiary tops and a gourd finial distinguish the wider pavilion.
    for(const sx of [-1,1])for(const sz of [-1,1])squareRoof('corner-roof',sx*.077,sz*.049,.177,.079,.068,.027);
    add(new THREE.SphereGeometry(.005,8,6),'#bcab6d','gourd-lower',0,.300,0);add(new THREE.SphereGeometry(.0032,8,6),'#bcab6d','gourd-upper',0,.307,0);
  }
  const end=liu?.12:.17,start=liu?.075:.11;
  const pathPositions=[],pathIndices=[],outer=parcel.entrance[1],half=liu?.025:.034;
  for(let i=0;i<=4;i++){
    const z=end+(outer-end)*i/4,y=Math.sqrt((R+.009)**2-z*z)-(R+.004);pathPositions.push(-half,y,z,half,y,z);
    if(i){const n=i*2;pathIndices.push(n-2,n,n-1,n-1,n,n+1);}
  }
  const pathGeometry=new THREE.BufferGeometry();pathGeometry.setAttribute('position',new THREE.Float32BufferAttribute(pathPositions,3));pathGeometry.setIndex(pathIndices);pathGeometry.computeVertexNormals();add(pathGeometry,stone,'street-connection');
  for(let k=0;k<5;k++){const z=end-(end-start)*k/4,top=.002+k*.003;box('entrance-step',0,(ground(0,z)+top)/2,z,liu?.050:.068,top-ground(0,z),.014,stone);}
  const title=liu?'六和塔':'城隍阁',pz=liu?.063:.066,py=liu?.051:.120;
  box('plaque',0,py,pz,.043,.017,.003,'#3f5146');
  for(const [i,c] of [...title].entries()){
    const path=new THREE.ShapePath();for(const contour of HERITAGE_GLYPHS[c]){path.moveTo(...contour[0]);for(const q of contour.slice(1))path.lineTo(...q);path.currentPath.closePath();}
    const glyph=add(new THREE.ShapeGeometry(path.toShapes(false),3),'#e3ce88','plaque-character',-.014+i*.014,py-.006,pz+.002);glyph.scale.setScalar(.013);glyph.userData.character=c;
  }
  for(const [i,x,z] of [[0,-w*.37,-d*.22],[1,w*.37,-d*.25],[2,-w*.36,d*.23],[3,w*.37,d*.24]]){const tree=woodlandTree(.031,.090+(i%2)*.013,prefix+i);tree.position.set(x,ground(x,z),z);root.add(tree);}
  for(const [i,x] of [-.04,.04].entries()){const person=createStreetProp({id:prefix+i,type:'visitor',color:i?'#859c8d':'#b99a73'});person.scale.setScalar(.72);person.position.set(x,ground(x,end),end);root.add(person);}
  return root;
}
