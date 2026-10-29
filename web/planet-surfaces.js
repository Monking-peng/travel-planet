import * as THREE from 'three';
import {PLANET_RADIUS,normalAt} from './planet-layout.js';

// Two staggered courses follow the causeway's actual spherical centreline.
export function causewayStonePaving(normals,width){
  const path=new THREE.CatmullRomCurve3(normals),length=path.getLength()*PLANET_RADIUS,positions=[],colors=[],indices=[];
  const span=.026,count=Math.ceil(length/span),tone=new THREE.Color('#b0b4aa');
  for(let lane=0;lane<2;lane++)for(let i=-1;i<count;i++){
    const start=Math.max(0,(i+lane*.5)/count)+.0004/length,end=Math.min(1,(i+1+lane*.5)/count)-.0004/length;if(end<=start)continue;
    const color=tone.clone().multiplyScalar(.87+((i*17+lane*7+31)%13)*.013),offset=positions.length/3;
    for(const t of [start,(start+end)/2,end]){
      const n=path.getPoint(t).normalize(),side=path.getTangent(t).cross(n).normalize();
      for(const x of [-width/2+lane*width/2+.00035,-width/2+(lane+1)*width/2-.00035]){
        positions.push(...n.clone().multiplyScalar(PLANET_RADIUS).addScaledVector(side,x).normalize().multiplyScalar(PLANET_RADIUS+.0103).toArray());colors.push(...color.toArray());
      }
    }
    indices.push(offset,offset+1,offset+2,offset+1,offset+3,offset+2,offset+2,offset+3,offset+4,offset+3,offset+5,offset+4);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.97,side:THREE.DoubleSide}));m.name='sudi-stone-slabs';m.receiveShadow=true;return m;
}

// Cut each paving slab against the same geographic boundary as the promenade.
// There is no rectangular overlay spilling into the lake or the adjacent lawn.
function clip(points,axis,edge,greater){
  const result=[];
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],inside=p=>greater?p[axis]>=edge:p[axis]<=edge;
    if(inside(a))result.push(a);
    if(inside(a)!==inside(b)){const t=(edge-a[axis])/(b[axis]-a[axis]);result.push(a.map((v,j)=>v+(b[j]-v)*t));}
  }
  return result;
}
function cutLawn(polygon,outline){
  // The reserved lawns are convex. Peel off the outside of each edge, so
  // rounded corners leave paving all the way to the actual grass boundary.
  if(polygon.length<3)return [];
  if([0,1].some(axis=>Math.max(...polygon.map(p=>p[axis]))<=Math.min(...outline.map(p=>p[axis]))||Math.min(...polygon.map(p=>p[axis]))>=Math.max(...outline.map(p=>p[axis]))))return [polygon];
  const area=points=>points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1];},0);
  const winding=Math.sign(area(outline)),pieces=[];let remaining=polygon;
  for(let edge=0;edge<outline.length&&remaining.length>=3;edge++){
    const a=outline[edge],b=outline[(edge+1)%outline.length];
    const distance=p=>winding*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]));
    const half=inside=>{
      const result=[];
      for(let i=0;i<remaining.length;i++){
        const p=remaining[i],q=remaining[(i+1)%remaining.length],dp=distance(p),dq=distance(q),keepP=inside?dp>=0:dp<=0,keepQ=inside?dq>=0:dq<=0;
        if(keepP)result.push(p);
        if(keepP!==keepQ){const t=dp/(dp-dq);result.push(p.map((v,k)=>v+(q[k]-v)*t));}
      }
      return result;
    };
    const outside=half(false);
    if(outside.length>=3&&Math.abs(area(outside))>1e-10)pieces.push(outside);
    remaining=half(true);
  }
  return pieces;
}
export function promenadePaving(surface,lawns=[]){
  const outline=surface.outline,triangles=THREE.ShapeUtils.triangulateShape(outline.map(p=>new THREE.Vector2(...p)),[]).map(t=>t.map(i=>outline[i]));
  const xs=outline.map(p=>p[0]),ys=outline.map(p=>p[1]),positions=[],normals=[],colors=[],indices=[];
  const base=new THREE.Color('#dcd3c0'),width=2.8,height=1.6,gap=.050;
  let row=0;
  for(let y=Math.min(...ys);y<Math.max(...ys);y+=height,row++){
    let column=0;
    for(let x=Math.min(...xs)-(row%2)*width/2;x<Math.max(...xs);x+=width,column++){
      const tone=base.clone().multiplyScalar(.97+((row*37+column*19)%11)/220);
      for(const triangle of triangles){
        let polygon=clip(triangle,0,x+gap,true);polygon=clip(polygon,0,x+width-gap,false);polygon=clip(polygon,1,y+gap,true);polygon=clip(polygon,1,y+height-gap,false);
        let pieces=[polygon];for(const lawn of lawns)pieces=pieces.flatMap(p=>cutLawn(p,lawn.outline));
        for(const polygon of pieces){if(polygon.length<3)continue;
        const start=positions.length/3;
        for(const geo of polygon){const n=normalAt(...geo);positions.push(...n.map(v=>v*(PLANET_RADIUS+.0058)));normals.push(...n);colors.push(...tone.toArray());}
        for(let i=1;i<polygon.length-1;i++)indices.push(start,start+i,start+i+1);
        }
      }
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.92,side:THREE.DoubleSide}));mesh.name='hubin-stone-paving';mesh.receiveShadow=true;return mesh;
}

// Quiet variation in the panes: cooler reflected sky above, a warmer interior
// below. These are opaque painted miniature windows, not real transparency.
export function paintedWindow(width,height){
  const geometry=new THREE.PlaneGeometry(width,height,1,2),colors=[];
  for(const color of ['#68968d','#54837a','#876f51'])for(let i=0;i<2;i++)colors.push(...new THREE.Color(color).toArray());
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const pane=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.32,metalness:.04,envMapIntensity:.3}));pane.receiveShadow=true;return pane;
}
