import * as THREE from 'three';

const landBase=new THREE.Color('#99b48c'),landLush=new THREE.Color('#608d75');
export function landColorAt(x,y,z){
  const variation=(Math.sin(x*7+y*4)+Math.sin(z*9-y*3)+2)/4;
  return landBase.clone().lerp(landLush,variation*.22);
}

// Fine surface relief is evaluated only when the scene is drawn. It is static,
// attached to the globe, and fades below pixel size instead of shimmering.
export function waterMaterial(){
  const material=new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.40,metalness:0,envMapIntensity:.08,side:THREE.DoubleSide});
  material.customProgramCacheKey=()=> 'west-lake-water-v2';
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLakeSurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLakeSurface=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vLakeSurface;
float lakeWave(float phase){return sin(phase)*(1.-smoothstep(.7,3.,fwidth(phase)));}
float lakeRelief(vec3 p){
  float a=p.x*112.+p.y*29.+sin(p.y*23.-p.x*17.)*1.2;
  float b=p.x*173.+p.y*46.+sin(p.x*19.+p.y*11.)*1.7;
  return .00016*lakeWave(a)+.00005*lakeWave(b);
}
`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
float height=lakeRelief(vLakeSurface);
vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition);
vec3 r1=cross(dy,normal),r2=cross(normal,dx);
float determinant=dot(dx,r1);
vec3 gradient=sign(determinant)*(dFdx(height)*r1+dFdy(height)*r2);
normal=normalize(abs(determinant)*normal-gradient);
`);
  };
  return material;
}
