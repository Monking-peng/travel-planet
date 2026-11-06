import * as THREE from 'three';

// Five-star red flag, 3:2 proportions. Generate a small texture without a DOM
// dependency so the very same geometry can be validated in the scene tests.
function flagTexture(){
  const width=240,height=160,pixels=new Uint8Array(width*height*4);
  const centers=[[5,5,3],[10,2,1],[12,4,1],[12,7,1],[10,9,1]];
  const stars=centers.map(([x,y,r],i)=>{
    const angle=i?Math.atan2(5-y,5-x):-Math.PI/2;
    return Array.from({length:10},(_,j)=>{const a=angle+j*Math.PI/5,rr=r*(j%2?.381966:1);return [x+Math.cos(a)*rr,y+Math.sin(a)*rr];});
  });
  const inside=(x,y,points)=>{let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
    const [ax,ay]=points[i],[bx,by]=points[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;
  }return hit;};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const gold=stars.some(s=>inside((x+.5)/width*30,(height-y-.5)/height*20,s)),o=(y*width+x)*4;
    pixels.set(gold?[255,217,56,255]:[202,31,38,255],o);
  }
  const texture=new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}
export function createCeremonialFlag(k){
  const width=.075,height=.050,geo=new THREE.PlaneGeometry(width,height,28,16);
  geo.translate(width/2,.267-height/2,.34);
  const material=k.mat('#ffffff',.91,0,'#b55340');material.map=flagTexture();material.emissiveMap=material.map;material.side=THREE.DoubleSide;material.userData.night.intensity=.30;
  const flag=new THREE.Mesh(geo,material);flag.name='ceremonial-flag';flag.userData.flag=true;flag.frustumCulled=false;return flag;
}
export function updateCeremonialFlag(flag,time,reduced=false){
  if(!flag)return;
  const position=flag.geometry.attributes.position,uv=flag.geometry.attributes.uv;
  const rest=flag.userData.flagRest||(flag.userData.flagRest=position.array.slice()),t=reduced?0:time;
  if(flag.userData.flagTime===t)return;flag.userData.flagTime=t;
  for(let i=0;i<position.count;i++){
    const u=uv.getX(i),v=uv.getY(i),envelope=Math.pow(u,1.25);
    const wave=.0065*envelope*(Math.sin(u*8.5-t*2.8)+.28*Math.sin(u*18+v*3-t*4.2));
    position.setXYZ(i,rest[i*3],rest[i*3+1]-.002*u+.0015*envelope*Math.sin(u*10-t*2.8+v),rest[i*3+2]+wave);
  }
  position.needsUpdate=true;flag.geometry.computeVertexNormals();
}
