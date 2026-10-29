import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {Box3,Group,Vector3} from 'three';
import {createPlanet,createBase,createPlacedPiece,consolidate} from '../web/planet-scene.js';
import {packWebNormals} from './pack-web-normals.mjs';
import {COMPONENTS,PRESETS,MAX_COMPONENTS,DEFAULT_COMPONENTS,LEGACY_DEFAULT,PREVIOUS_DEFAULT,restorePreviousSelection,restoreSelection,normalizeSelection,toggleComponent,focusAngles,inspectionView} from '../web/planet-options.js';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(r=>{this.result=r;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(r=>{this.result='data:'+blob.type+';base64,'+Buffer.from(r).toString('base64');this.onloadend?.();});}};
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function measureInspectionBounds(){
const INSPECTION_BOUNDS={};
for(const c of COMPONENTS){const wrapper=new Group(),piece=createPlacedPiece(c.id),view=focusAngles(c.id);wrapper.add(piece);wrapper.rotation.set(view.x,view.y,view.z);wrapper.updateMatrixWorld(true);const bounds=new Box3(),vertex=new Vector3();piece.children[0].traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++)bounds.expandByPoint(vertex.fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld));});INSPECTION_BOUNDS[c.id]=[bounds.min.toArray(),bounds.max.toArray()];piece.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
return INSPECTION_BOUNDS;
}
const model=createPlanet();
if(process.argv.includes('--web-only'))packWebNormals(model);
const result=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});
const INSPECTION_BOUNDS=measureInspectionBounds();
async function writeWebAssets(){
  await fs.mkdir(path.join(root,'web/assets'),{recursive:true});
  await fs.writeFile(path.join(root,'web/assets/hangzhou.glb'),Buffer.from(result));
  await fs.writeFile(path.join(root,'web/planet-inspection-bounds.js'),'// Generated from the visible model surfaces by tools/generate-planet.mjs.\nexport const INSPECTION_BOUNDS='+JSON.stringify(INSPECTION_BOUNDS)+';\n');
}
if(process.argv.includes('--web-only')){await writeWebAssets();console.log(JSON.stringify({target:'web',bytes:result.byteLength,nativeAssetsChanged:false}));process.exit(0);}
// Native uses individually selectable GLBs. The merged model remains available as a fallback.
const packageNames=['scenery','scenery-extra','scenery-more'];
const directories=packageNames.map(name=>path.join(root,'miniprogram',name,'assets'));
let previewBytes=0;for(const name of await fs.readdir(directories[0]))if(name.endsWith('.png'))previewBytes+=(await fs.stat(path.join(directories[0],name))).size;
const usage=[previewBytes+32768,32768,32768],assets=[];
// A test may tighten this budget, but can never relax the production limit.
const budget=Math.min(2*1024*1024,Number(process.env.SCENERY_TEST_BUDGET_BYTES||2*1024*1024));
if(!Number.isSafeInteger(budget)||budget<=0)throw new Error('Invalid scenery asset budget');
for(const [id,model] of [['base',createBase()],...COMPONENTS.map(c=>[c.id,createPlacedPiece(c.id)])]){
  const data=await new GLTFExporter().parseAsync(consolidate(model),{binary:true,onlyVisible:true});
  assets.push({id,data});
}
// Plan large assets first; catalogue order must not depend on packaging order.
const packing=[assets[0],...assets.slice(1).sort((a,b)=>b.data.byteLength-a.data.byteLength)];
for(const asset of packing){asset.index=asset.id==='base'?0:usage.indexOf(Math.min(...usage));usage[asset.index]+=asset.data.byteLength;}
if(usage.some(n=>n>budget))throw new Error('Scenery asset group exceeds conservative 2 MiB budget: '+JSON.stringify({usage,assets:assets.map(a=>({id:a.id,bytes:a.data.byteLength}))}));
const nativeComponents=COMPONENTS.map(c=>({...c,src:'/'+packageNames[assets.find(a=>a.id===c.id).index]+'/assets/'+c.id+'.glb'}));
const values={COMPONENTS:nativeComponents,PRESETS,MAX_COMPONENTS,DEFAULT_COMPONENTS,LEGACY_DEFAULT,PREVIOUS_DEFAULT,INSPECTION_BOUNDS};
const source=Object.entries(values).map(([k,v])=>'const '+k+'='+JSON.stringify(v)+';').join('\n')+'\n'+normalizeSelection.toString()+'\n'+restoreSelection.toString()+'\n'+restorePreviousSelection.toString()+'\n'+toggleComponent.toString()+'\n'+focusAngles.toString()+'\n'+inspectionView.toString()+'\nmodule.exports={COMPONENTS,PRESETS,MAX_COMPONENTS,DEFAULT_COMPONENTS,LEGACY_DEFAULT,PREVIOUS_DEFAULT,restorePreviousSelection,restoreSelection,normalizeSelection,toggleComponent,focusAngles,inspectionView};\n';
// No generated files are changed until every export, size and camera bound is
// ready. In particular, a budget rejection cannot leave stale asset references.
for(const dir of directories)await fs.mkdir(dir,{recursive:true});
await writeWebAssets();
await fs.rm(path.join(root,'miniprogram/assets/hangzhou.glb'),{force:true});
console.log(JSON.stringify({asset:'hangzhou.glb',bytes:result.byteLength}));
for(const {id,data,index} of assets){for(const dir of directories)await fs.rm(path.join(dir,id+'.glb'),{force:true});await fs.writeFile(path.join(directories[index],id+'.glb'),Buffer.from(data));console.log(JSON.stringify({asset:id,bytes:data.byteLength,group:index}));}
await fs.writeFile(path.join(root,'miniprogram/utils/scenery.js'),source);
