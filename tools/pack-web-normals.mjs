import {Int16BufferAttribute} from 'three';

// Export only: normalized signed shorts retain unit normals to 1/32767.
// GLTFExporter declares KHR_mesh_quantization; runtime geometry is untouched.
export function packWebNormals(root){
  root.traverse(object=>{
    if(!object.isMesh)return;
    const normal=object.geometry.getAttribute('normal');
    if(!normal)return;
    const packed=new Int16Array(normal.count*3);
    for(let i=0;i<normal.count;i++)for(let j=0;j<3;j++){
      const value=normal.getComponent(i,j);
      if(!Number.isFinite(value)||Math.abs(value)>1.0001)throw new Error('Invalid export normal');
      packed[i*3+j]=Math.round(Math.max(-1,Math.min(1,value))*32767);
    }
    object.geometry.setAttribute('normal',new Int16BufferAttribute(packed,3,true));
  });
  return root;
}
