import * as THREE from 'three';

// Soft, curling wisps emerge from the vessel; edge alpha avoids solid tubes.
// Geometry-only material also survives the model export without a texture.
export function createIncenseSmoke(){
  const root=new THREE.Group();root.name='lingyin-incense-smoke';
  const positions=[],colors=[],indices=[],tone=new THREE.Color('#b8beb4');
  for(let strand=0;strand<3;strand++)for(let plane=0;plane<2;plane++){
    const start=positions.length/3,angle=plane*Math.PI/2+strand*.7;
    for(let row=0;row<=32;row++){
      const t=row/32,y=.172*t,x=Math.sin(t*7+strand*.7)*t*.020+strand*.002,z=Math.cos(t*6+strand)*t*.009;
      const width=.002+.012*t;
      for(let col=0;col<=6;col++){
        const side=col/3-1;
        positions.push(x+Math.cos(angle)*width*side,y,z+Math.sin(angle)*width*side);
        colors.push(tone.r,tone.g,tone.b,.30*(1-side*side)**2*Math.sin(Math.PI*Math.min(1,t*1.06))**.65);
        if(row&&col){const i=start+row*7+col;indices.push(i,i-1,i-7,i-1,i-8,i-7);}
      }
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const mesh=new THREE.Mesh(geometry,material);mesh.name='incense-soft-wisps';root.add(mesh);return root;
}
