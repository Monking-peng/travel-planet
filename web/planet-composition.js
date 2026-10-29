import {Group} from 'three';
import {createPlanet,createPlanetAsync,createPlacedPiece,consolidate} from './planet-scene.js';
import {normalizeSelection} from './planet-options.js';

// Retain the landscape and already-built pieces while editing. Detached pieces
// are absent from both drawing and raycasting; the cache is bounded by the catalog.
export function createEditablePlanet(selection){
  return editablePlanet(createPlanet(selection),selection);
}
export async function createEditablePlanetAsync(selection){
  return editablePlanet(await createPlanetAsync(selection),selection);
}
function editablePlanet(root,selection){
  const pieces=new Map();
  let selected=normalizeSelection(selection),disposed=false;
  for(const mesh of root.children){
    const id=mesh.userData.componentId;if(!id)continue;
    if(!pieces.has(id))pieces.set(id,[]);
    pieces.get(id).push(mesh);
  }
  function setComponents(ids){
    if(disposed)return [];
    const next=normalizeSelection(ids),wanted=new Set(next);
    // Build missing pieces before touching the visible selection.
    for(const id of next)if(!pieces.has(id)){
      const group=new Group();group.add(createPlacedPiece(id));consolidate(group);
      pieces.set(id,[...group.children]);group.clear();
    }
    for(const id of selected)if(!wanted.has(id))for(const mesh of pieces.get(id))root.remove(mesh);
    for(const id of next)for(const mesh of pieces.get(id))if(mesh.parent!==root)root.add(mesh);
    selected=next;return [...selected];
  }
  function dispose(){
    if(disposed)return;disposed=true;
    const geometries=new Set(),materials=new Set();
    const collect=mesh=>{if(mesh.geometry)geometries.add(mesh.geometry);for(const material of [mesh.material].flat())if(material)materials.add(material);};
    root.traverse(collect);for(const meshes of pieces.values())for(const mesh of meshes)collect(mesh);
    root.removeFromParent();root.clear();pieces.clear();
    for(const geometry of geometries)geometry.dispose();
    for(const material of materials)material.dispose();
  }
  return {root,setComponents,dispose};
}
