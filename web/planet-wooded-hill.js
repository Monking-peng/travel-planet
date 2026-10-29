import * as THREE from 'three';
import {woodlandTree} from './planet-nature.js';

// Forested relief is real geometry. Roots are seated on its triangulated skin.
export function createWoodedHill(parcel,radius=1.42){
  const root=new THREE.Group();root.name='wooded-hill:'+parcel.id;
  const [w,d]=parcel.size,H=parcel.height??.14,segments=48,rings=12,p=[],ix=[],colors=[];
  const base=(x,z)=>Math.sqrt((radius+.006)**2-x*x-z*z)-(radius+.014);
  const height=(x,z)=>{const q=(x/(w/2))**2+(z/(d/2))**2;return base(x,z)+H*Math.max(0,1-q)**1.35*(1+.23*Math.sin(x/w*8+z/d*4));};
  const shade=new THREE.Color('#819a6b'),light=new THREE.Color('#a1b582');
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,t=j/rings,x=Math.cos(a)*w/2*t,z=Math.sin(a)*d/2*t,y=height(x,z);
    p.push(x,y,z);colors.push(...shade.clone().lerp(light,.25+.55*t).toArray());
    if(j&&i){const n=j*(segments+1)+i;ix.push(n,n-1,n-segments-1,n-1,n-segments-2,n-segments-1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(ix);geometry.computeVertexNormals();
  // The polar grid duplicates its centre and seam. Derive normals from the
  // height field so those copies share lighting, including the unused pole.
  const normals=geometry.attributes.normal,epsilon=.0001;
  for(let i=0;i<p.length/3;i++){
    const x=p[i*3],z=p[i*3+2],n=new THREE.Vector3(-(height(x+epsilon,z)-height(x-epsilon,z))/(2*epsilon),1,-(height(x,z+epsilon)-height(x,z-epsilon))/(2*epsilon)).normalize();normals.setXYZ(i,n.x,n.y,n.z);
  }
  const terrain=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.96}));terrain.name='wooded-hill-terrain';terrain.receiveShadow=true;terrain.castShadow=true;root.add(terrain);
  terrain.updateMatrixWorld(true);
  const count=parcel.trees??18;
  for(let i=0;i<count;i++){
    const a=i*2.399963+H*17,t=Math.sqrt((i+.5)/count)*.80,x=Math.cos(a)*w/2*t,z=Math.sin(a)*d/2*t;
    const r=Math.min(w,d)*(.20+.016*Math.sin(i*3.1)),h=(.078+.014*Math.sin(i*1.7+.3))*Math.min(1,w/.16);
    const tree=woodlandTree(r,h,parcel.id+':'+i,64);tree.name='hill-tree';
    const hit=new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0)).intersectObject(terrain)[0];
    if(!hit)throw new Error('Missing forest terrain at '+parcel.id);
    tree.position.set(x,hit.point.y-.0003,z);root.add(tree);
  }
  // A few partially buried rocks articulate the steep shoulders below leaves.
  for(const [i,a] of [1.2,2.8,4.4].entries()){
    const x=Math.cos(a)*w*.34,z=Math.sin(a)*d*.34,rock=new THREE.Mesh(new THREE.IcosahedronGeometry(.021,1),new THREE.MeshStandardMaterial({color:'#8c9680',roughness:1}));
    rock.name='wooded-hill-rock';rock.scale.set(1.25,1.4,.8);rock.position.set(x,height(x,z)+.006,z);rock.rotation.y=i;rock.castShadow=true;root.add(rock);
  }
  return root;
}
