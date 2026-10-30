import * as THREE from 'three';
import {bollards,people,glow} from './shenzhen-forms.js';

// The two volumes share a rounded, asymmetric perimeter, with different stone colors.
// Control points follow the broad roof/front relationship in the exterior photographs.
const outline=[[-.46,.18,.36,.04,.45],[-.14,.31,.42,.02,.66],[.30,.30,.32,.02,.94],[.48,.06,.23,.14,.68],[.29,-.31,.25,.24,.39],[-.37,-.27,.33,.22,.36]];
const mix=(a,b,t)=>a+(b-a)*t;
function contour(t){
  const n=outline.length,q=((t%1)+1)%1*n,i=Math.floor(q),f=q-i;
  const b=outline[i],c=outline[(i+1)%n],d=outline[(i+2)%n];
  return b.map((v,j)=>{if(f<.8)return mix(mix(v,c[j],.10),mix(c[j],v,.10),f/.8);const t=(f-.8)/.2;return (1-t)**2*mix(c[j],v,.10)+2*t*(1-t)*c[j]+t*t*mix(c[j],d[j],.10);});
}
function stonePanels(material){
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vOperaPanel;varying vec3 vOperaNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOperaPanel=position;vOperaNormal=normal;');
    shader.fragmentShader='varying vec3 vOperaPanel;varying vec3 vOperaNormal;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 pn=abs(normalize(vOperaNormal));
      vec2 grid=(pn.y>.58?vOperaPanel.xz:(pn.x>.72?vOperaPanel.zy:vOperaPanel.xy))*39.0;
      vec3 lineDistance=abs(fract(vec3(grid.x,grid.y,grid.x+grid.y))-.5);
      vec3 thickness=max(fwidth(vec3(grid.x,grid.y,grid.x+grid.y)),vec3(.01));
      float seam=min(min(lineDistance.x/thickness.x,lineDistance.y/thickness.y),lineDistance.z/thickness.z);
      diffuseColor.rgb*=mix(.88,1.0,smoothstep(.12,.42,seam));
    `);
  };material.customProgramCacheKey=()=> 'opera-stone-panels-v1';
}
function patch(k,g,point,cols,rows,material){
  const p=[],ix=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)p.push(...point(i/cols,j/rows));
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i;ix.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();
  return k.mesh(g,geo,material);
}
function lattice(k,g,point,cols,rows,material,radius){
  const edge=(a,b)=>k.line(g,Array.from({length:4},(_,j)=>point(mix(a[0],b[0],j/3),mix(a[1],b[1],j/3))),radius,material);
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
    const a=[i/cols,j/rows],b=[(i+1)/cols,j/rows],c=[i/cols,(j+1)/rows],d=[(i+1)/cols,(j+1)/rows];
    edge(a,b);edge(a,c);edge((i+j)%2?a:b,(i+j)%2?d:c);
    if(j===rows-1)edge(c,d);if(i===cols-1)edge(b,d);
  }
}
function boulder(k,parent,{x,z,s,stone,glass,frame,light,small=false}){
  const g=new THREE.Group();parent.add(g);
  const wall=(u,v)=>{const [px,pz,h]=contour(u),flare=.82+.18*Math.sin(v*Math.PI/2);return [px*flare,.035+h*v,pz*flare];};
  const band=(u,v)=>{const c=contour(u);return wall(u,mix(c[3],c[4],v));};
  const lower=(u,v)=>wall(u,contour(u)[3]*v),upper=(u,v)=>wall(u,mix(contour(u)[4],1,v));
  // One surface per band avoids the former overlapping coplanar triangles.
  patch(k,g,lower,72,4,stone);patch(k,g,band,72,12,glass);patch(k,g,upper,72,10,stone);
  lattice(k,g,band,48,6,frame,.00095);
  for(const v of [0,1])k.line(g,Array.from({length:97},(_,i)=>band(i/96,v)),.0015,frame,true);
  const top=(u,t)=>{const p=wall(u,1),x=mix(p[0],-.09,t),z=mix(p[2],-.055,t),roofPlane=.425+.06*x-.04*z;return [x,mix(p[1],roofPlane,Math.min(1,t/.56)),z];};
  // A single centre vertex closes the roof without degenerate radial quads.
  const verts=[-.09,.4218,-.055],indices=[],rings=14,cols=96;
  for(let j=0;j<rings;j++)for(let i=0;i<=cols;i++)verts.push(...top(i/cols,j/rings));
  for(let j=0;j<rings-1;j++)for(let i=0;i<cols;i++){const a=1+j*(cols+1)+i,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
  for(let i=0;i<cols;i++){const a=1+(rings-1)*(cols+1)+i;indices.push(a,a+1,0);}
  const roof=new THREE.BufferGeometry();roof.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));roof.setIndex(indices);roof.computeVertexNormals();k.mesh(g,roof,stone);
  // Roof vents remain small and subordinate to the two continuous stone shells.
  for(const u of [.56,.78]){
    const p=top(u,.56),vent=k.box(g,.056,.003,.017,frame,p[0],p[1]+.002,p[2]);vent.rotation.y=u*Math.PI*2;
  }
  // Inner gallery bands make the glass read as a facade with depth, not a luminous slab.
  const inner=k.mat('#c6d1cf',.65,.15,'#d9edf2');inner.userData.night.intensity=.30;
  for(const v of [.22,.46,.70]){
    const pts=Array.from({length:45},(_,i)=>{const p=band(i/44,v);return [p[0]*.96,p[1],p[2]*.96];});k.line(g,pts,.0016,inner,true);
  }
  const base=Array.from({length:97},(_,i)=>{const p=wall(i/96,0);return [p[0]*1.008,p[1]-.002,p[2]*1.008];});k.line(g,base,.0016,light,true);
  g.position.set(x,.008,z);g.scale.set(s,s*(small?.89:1),s);g.rotation.y=small?-.12:0;
  return g;
}
function paving(k,g,points,mat,y=.037){
  const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);return k.mesh(g,geo,mat);
}
function poolAndRim(k,g,base,water){
  // The paving ends at the pool rather than sharing a second disc beneath it.
  // Short radial cells follow the planet without the spokes of a long triangle fan.
  patch(k,g,(u,v)=>{const a=u*Math.PI*2;return [Math.cos(a)*mix(.70,.77,v),.013,Math.sin(a)*mix(.532,.59,v)];},96,4,base);
  const p=[0,.019,0],ix=[],rings=24,cols=96;
  for(let j=1;j<=rings;j++)for(let i=0;i<=cols;i++){const a=i/cols*Math.PI*2,r=j/rings;p.push(Math.cos(a)*.70*r,.019,Math.sin(a)*.532*r);}
  for(let i=0;i<cols;i++)ix.push(0,i+2,i+1);
  for(let j=0;j<rings-1;j++)for(let i=0;i<cols;i++){const a=1+j*(cols+1)+i,b=a+cols+1;ix.push(a,b+1,b,a,a+1,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();k.mesh(g,geo,water);
}
export function opera(k){
  const g=new THREE.Group(),base=k.mat('#c5c9bf',.91),water=k.mat('#597d7c',.36,.22),stone=k.mat('#7f8787',.88,.08),white=k.mat('#c7cdc6',.86,.06),frame=k.mat('#748b91',.5,.35),glass=k.mat('#709ca3',.25,.26,'#bddde8'),edge=glow(k,'#f0ddb0',.62);
  glass.userData.night.intensity=.48;
  for(const m of [stone,white,glass])m.userData.operaSurface=true;
  stonePanels(stone);stonePanels(white);water.userData.operaPool=true;
  poolAndRim(k,g,base,water);
  boulder(k,g,{x:.23,z:-.045,s:.91,stone,glass,frame,light:edge});
  boulder(k,g,{x:-.48,z:-.115,s:.47,stone:white,glass,frame,light:edge,small:true});
  // The dry promenade meets both entrances and the outer plaza; water stays beside it.
  const walk=[[-.56,.45],[-.43,.52],[.20,.49],[.27,.42],[-.05,.34],[-.19,.22],[-.24,-.26],[-.32,-.29],[-.31,.18]];
  paving(k,g,walk,base,.041);
  paving(k,g,[[-.44,.49],[.19,.46],[.20,.55],[-.43,.58]],base,.020);
  const outlineLight=[[-.54,.043,.46],[-.43,.043,.50],[.19,.043,.475],[.25,.043,.424]];k.line(g,outlineLight,.0018,edge);
  for(let i=0;i<5;i++)paving(k,g,[[-.42,.50+i*.012],[.16,.47+i*.012],[.16,.484+i*.012],[-.42,.514+i*.012]],base,.039-i*.004);
  const lobby=k.mat('#647b7e',.42,.2,'#ddd6bd');lobby.userData.night.intensity=.30;
  k.box(g,.090,.029,.020,lobby,-.20,.057,.21);k.box(g,.12,.005,.034,base,-.20,.075,.22);
  const visitors=new THREE.Group();g.add(visitors);visitors.position.y=.028;
  bollards(k,visitors,[[-.51,.43],[-.37,.45],[-.12,.41],[.16,.44]],'#f0ddb0');people(k,visitors,[[-.42,.44],[-.37,.43],[-.27,.36],[-.24,.31],[-.11,.41],[.06,.43]]);
  const model=k.merge(g);model.userData.walkSamples=[[-.43,.041,.45],[-.27,.041,.33],[-.27,.041,.10],[-.27,.041,-.16]];return model;
}
