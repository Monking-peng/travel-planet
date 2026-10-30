import * as THREE from 'three';

export function skin(k,g,point,rows,columns,material,close=true){
  const vertices=[],indices=[];
  for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++)vertices.push(...point(col/columns,row/rows));
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const i=row*(columns+1)+col;indices.push(i,i+columns+1,i+1,i+1,i+columns+1,i+columns+2);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();material.side=THREE.DoubleSide;
  return k.mesh(g,geometry,material);
}
export function glow(k,color,intensity=.65,phase=null,speed=.7){const m=k.mat(color,.48,.20,color);m.userData.night.intensity=intensity;if(phase!==null)m.userData.pulse={phase,speed};return m;}
export function plaza(k,g,rx,rz,color='#c7c7b4'){const m=k.mat(color,.91),base=k.cyl(g,rx,rx,.013,m,0,.0065,0,72);base.scale.z=rz/rx;return m;}
export function palm(k,g,x,y,z,s=.12){
  k.beam(g,[x,y,z],[x+.012,y+s,z],.004,k.mat('#7d7153'),6);
  const leaf=k.mat('#3e7560',.9);for(let i=0;i<7;i++){const a=i/7*Math.PI*2,pts=[];for(let j=0;j<5;j++){const t=j/4;pts.push([x+.012+Math.cos(a)*s*.57*t,y+s+.028*Math.sin(t*Math.PI)-.035*t*t,z+Math.sin(a)*s*.57*t]);}k.line(g,pts,.007,leaf);}
}
export function bollards(k,g,points,color='#f8d5a2'){
  const body=k.mat('#465b5d',.7,.2),lamp=glow(k,color,.85);
  for(const [x,z] of points){k.cyl(g,.003,.004,.037,body,x,.025,z,8);k.ball(g,.004,lamp,x,.044,z);}
}
export function people(k,g,points){
  const skinMat=k.mat('#d7ab8a'),clothes=['#984e45','#31576a','#d4cdb8','#b27b3b'].map(c=>k.mat(c));
  points.forEach(([x,z],i)=>{k.cyl(g,.004,.005,.015,clothes[i%4],x,.029,z,6);k.ball(g,.0042,skinMat,x,.041,z);for(const s of [-1,1])k.cyl(g,.0014,.0016,.011,clothes[(i+1)%4],x+s*.002,.017,z,5);});
}
export function hill(k,g,rx,rz,height,color='#608367'){
  const ground=k.mat(color,.98);skin(k,g,(u,v)=>{const a=u*Math.PI*2,r=v;return [Math.cos(a)*rx*r,height*Math.pow(Math.max(0,1-r*r),1.65),Math.sin(a)*rz*r];},28,72,ground);
  return (x,z)=>height*Math.pow(Math.max(0,1-(x/rx)**2-(z/rz)**2),1.65);
}
