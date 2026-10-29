import {buildImmediately,buildResponsively} from './planet-build.js';
import * as THREE from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {DEFAULT_COMPONENTS,normalizeSelection} from './planet-options.js';
import {createLandscape as createBase,createLandscapeSteps,createPlacedPiece} from './planet-layout-scene.js';
export {createBase,createPlacedPiece};
export {createPiece} from './planet-pieces.js';
const textureSlots=['map','lightMap','aoMap','emissiveMap','bumpMap','normalMap','displacementMap','roughnessMap','metalnessMap','alphaMap','envMap'];
function canBakeColor(m){return m.type==='MeshStandardMaterial'&&!m.transparent&&!m.alphaTest&&!m.alphaHash&&!m.alphaToCoverage&&!m.premultipliedAlpha&&!m.stencilWrite&&!m.dithering&&m.blending===THREE.NormalBlending&&!m.clippingPlanes&&!m.wireframe&&m.onBeforeCompile===THREE.Material.prototype.onBeforeCompile&&m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey&&!textureSlots.some(k=>m[k])&&[m.color.r,m.color.g,m.color.b].every(n=>n>=0&&n<=1);}
function bakeColor(geometry,material){
  const source=material.vertexColors?geometry.attributes.color:null;
  if(source?.array instanceof Float32Array&&!source.normalized&&material.color.r===1&&material.color.g===1&&material.color.b===1)return;
  const size=source?.itemSize===4?4:3,values=new Float32Array(geometry.attributes.position.count*size),rgb=[material.color.r,material.color.g,material.color.b];
  for(let i=0;i<geometry.attributes.position.count;i++){for(let j=0;j<3;j++)values[i*size+j]=(source?source.getComponent(i,j):1)*rgb[j];if(size===4)values[i*size+3]=source.getW(i);}
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(values,size));
}
function* mergeReferencedVerticesSteps(geometry){
  const attributes=Object.entries(geometry.attributes),index=geometry.index,count=geometry.attributes.position.count;
  // Keep the library path for uncommon attribute layouts. Our scene uses
  // plain position/normal/colour buffers, so large foliage batches can yield.
  if(Object.keys(geometry.morphAttributes).length||attributes.some(([,a])=>a.isInterleavedBufferAttribute||a.itemSize>4))return mergeVertices(geometry,1e-5);
  const temporary=attributes.map(([name,a])=>[name,new a.constructor(new a.array.constructor(a.count*a.itemSize),a.itemSize,a.normalized)]);
  const seen=new Uint8Array(count),remap=new Uint32Array(count),length=index?index.count:count,triangles=new Uint32Array(length),hashToIndex=new Map();
  const multiplier=Math.pow(10,Math.log10(1/1e-5)),additive=1e-5*.5*multiplier;let nextIndex=0;
  for(let i=0;i<length;i++){
    const id=index?index.getX(i):i;
    if(!seen[id]){
      seen[id]=1;let hash='';
      for(const [,a] of attributes)for(let j=0;j<a.itemSize;j++)hash+=`${Math.trunc(a.getComponent(id,j)*multiplier+additive)},`;
      let mapped=hashToIndex.get(hash);
      if(mapped===undefined){
        mapped=nextIndex++;hashToIndex.set(hash,mapped);
        for(let n=0;n<attributes.length;n++){const a=attributes[n][1],target=temporary[n][1];for(let j=0;j<a.itemSize;j++)target.setComponent(mapped,j,a.getComponent(id,j));}
      }
      remap[id]=mapped;
    }
    triangles[i]=remap[id];if((i&4095)===4095)yield;
  }
  const result=geometry.clone();
  for(const [name,a] of temporary){result.setAttribute(name,new a.constructor(a.array.slice(0,nextIndex*a.itemSize),a.itemSize,a.normalized));yield;}
  result.setIndex(new THREE.BufferAttribute(nextIndex>65535?triangles:new Uint16Array(triangles),1));return result;
}
// Plain colours become vertex colours, so one piece can share draw calls.
// Optical materials, custom shaders and selectable identities remain distinct.
export function consolidate(root){return buildImmediately(consolidateSteps(root));}
function* consolidateSteps(root){
  root.updateMatrixWorld(true);const groups=new Map(),original=[];
  const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const o of meshes){let p=o,placeId='',componentId='';while(p){placeId ||= p.userData.placeId||'';componentId ||= p.userData.componentId||'';if(p===root)break;p=p.parent;}
    const m=o.material,bake=canBakeColor(m),geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);geometry.deleteAttribute('uv');if(bake)bakeColor(geometry,m);
    const key=[m.type,bake?'vertex-palette':m.color.getHexString(),placeId,componentId,o.castShadow,o.receiveShadow,bake||m.vertexColors,geometry.attributes.color?.itemSize,m.roughness,m.metalness,m.side,m.shadowSide,m.visible,m.envMapIntensity,m.transparent,m.opacity,m.depthWrite,m.depthTest,m.depthFunc,m.colorWrite,m.flatShading,m.fog,m.toneMapped,m.blending,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits,m.emissive?.getHexString(),m.emissiveIntensity,JSON.stringify(m.userData.nightProfile||null),m.customProgramCacheKey()].join(':');
    let entry=groups.get(key);if(!entry){const material=bake?m.clone():m;if(bake){material.color.set('#ffffff');material.vertexColors=true;}entry={material,placeId,componentId,castShadow:o.castShadow,receiveShadow:o.receiveShadow,geometries:[]};groups.set(key,entry);}
    if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));entry.geometries.push(geometry);original.push(o);yield;
  }root.clear();root.position.set(0,0,0);root.quaternion.identity();root.scale.setScalar(1);const retained=new Set([...groups.values()].map(g=>g.material));
  for(const g of groups.values()){const merged=mergeGeometries(g.geometries,false),geometry=yield* mergeReferencedVerticesSteps(merged);merged.dispose();
    // Vertex colours are bounded linear RGB. Normalized bytes preserve the
    // palette within 1/255 while keeping the native scenery package below 2 MiB.
    const color=geometry.attributes.color;
    if(color){const bytes=new Uint8Array(color.count*color.itemSize);for(let i=0;i<color.count;i++)for(let j=0;j<color.itemSize;j++)bytes[i*color.itemSize+j]=Math.round(THREE.MathUtils.clamp(color.getComponent(i,j),0,1)*255);geometry.setAttribute('color',new THREE.Uint8BufferAttribute(bytes,color.itemSize,true));}
    const o=new THREE.Mesh(geometry,g.material);o.castShadow=g.castShadow;o.receiveShadow=g.receiveShadow;o.userData={placeId:g.placeId,componentId:g.componentId};o.name=g.componentId||'landscape';root.add(o);g.geometries.forEach(x=>x.dispose());yield;}
  const disposed=new Set();for(const o of original){o.geometry.dispose();if(!retained.has(o.material)&&!disposed.has(o.material)){o.material.dispose();disposed.add(o.material);}}return root;
}
function* createPlanetSteps(selection=DEFAULT_COMPONENTS){
  const root=new THREE.Group();root.name='HangzhouPlanet';
  root.add(yield* createLandscapeSteps());
  for(const id of normalizeSelection(selection)){root.add(createPlacedPiece(id));yield;}
  yield* consolidateSteps(root);root.rotation.set(-.35,-.20,.25);return root;
}
export function createPlanet(selection){return buildImmediately(createPlanetSteps(selection));}
export function createPlanetAsync(selection){return buildResponsively(createPlanetSteps(selection));}
