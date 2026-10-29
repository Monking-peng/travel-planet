import * as THREE from 'three';
import {sag,groundPatch,groundRect,at,gardenTree} from './shanghai-heritage.js';
import {parkAttractions} from './shanghai-disney-attractions.js';

// A curated park composition on its own hemisphere, rather than a literal resort survey.
export const CASTLE_TRANSFORM={x:1,y:1,z:1,offsetZ:-.33,lift:.055};
export function disneyPark(k,castle){
  const g=new THREE.Group(),lawn=k.mat('#78936a',1,0),meadow=k.mat('#829a6f'),hedge=k.mat('#365d43'),leaf=k.mat('#557c52'),lightLeaf=k.mat('#6e8b53'),bark=k.mat('#786551'),paving=k.mat('#c9b595'),border=k.mat('#e0d2b7'),water=k.mat('#528f92',.30,.19),rock=k.mat('#a39983'),pink=k.mat('#c47796'),cream=k.mat('#ead7ad'),lavender=k.mat('#8e8aba');
  const warm=k.mat('#ddc494',.55,.12,'#ffd69a');warm.userData.night.intensity=1.2;
  const ellipse=(x,z,rx,rz,n=72)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [x+Math.cos(a)*rx,z+Math.sin(a)*rz];});
  const terrain=(points,mat,lift=.026)=>groundPatch(k,g,points,mat,lift);
  const path=(points,width,mat=paving,lift=.034,closed=false)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),closed,'centripetal'),pts=curve.getPoints(120),v=[],ix=[];
    for(let i=0;i<pts.length;i++){const tangent=curve.getTangent(i/(pts.length-1));for(const sign of [-1,1]){const x=pts[i].x+sign*tangent.z*width/2,z=pts[i].z-sign*tangent.x*width/2;v.push(x,sag(x,z)+lift,z);}if(i){const n=i*2;ix.push(n-2,n,n-1,n-1,n,n+1);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();k.mesh(g,geo,mat);return curve;
  };
  const outline=Array.from({length:100},(_,i)=>{const a=i/100*Math.PI*2,r=1+.045*Math.sin(a*3)+.027*Math.cos(a*7);return [Math.cos(a)*1.24*r,.02+Math.sin(a)*1.18*r];});terrain(outline,lawn);
  // Water curls behind the castle and opens into two landscaped garden coves.
  const moat=[[-.63,-.83],[-.34,-.99],[.12,-.98],[.53,-.83],[.68,-.55],[.64,-.22],[.49,.045],[.30,.14],[-.31,.17],[-.60,.05],[-.73,-.20],[-.73,-.53]];
  const smoothOutline=points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),true).getPoints(120).map(v=>[v.x,v.z]);
  terrain(smoothOutline(moat),water,.035);
  terrain(smoothOutline([[-.52,-.72],[-.28,-.83],[.33,-.79],[.53,-.57],[.52,-.15],[.35,.015],[-.35,.03],[-.55,-.16]]),border,.047);
  castle.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,t=CASTLE_TRANSFORM;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),zz=z+t.offsetZ;p.setXYZ(i,x,sag(x,zz)+y+t.lift,zz);}o.geometry.computeVertexNormals();});g.add(castle);
  // Natural stone embankments are varied in height and partly softened by low planting.
  for(let i=0;i<75;i++){const a=i/75*Math.PI*2,x=Math.cos(a)*(.56+.018*Math.sin(i)),z=-.37+Math.sin(a)*.43;if(z>-.01&&Math.abs(x)<.14)continue;const o=k.mesh(g,new THREE.DodecahedronGeometry(.022+(i%5)*.005,1),rock,x,sag(x,z)+.048,z);o.scale.set(1.2,.6+(i%3)*.16,.8);o.rotation.set(i*.3,i*.7,0);}
  // Broad stone bridge with open railings leads into the real archway.
  groundRect(k,g,0,.035,.18,.36,border,.058);
  for(const x of [-.095,.095]){
    k.line(g,Array.from({length:25},(_,i)=>{const z=-.14+i*.015;return [x,sag(x,z)+.095,z];}),.003,border);
    for(let i=0;i<25;i++){const z=-.14+i*.015;k.cyl(g,.0015,.002,.035,cream,x,sag(x,z)+.078,z,6);}
    for(const z of [-.14,.22]){k.box(g,.018,.050,.018,border,x,sag(x,z)+.079,z);k.ball(g,.006,warm,x,sag(x,z)+.108,z);}
  }
  // Curved circulation creates four connected gardens with clear views of the castle.
  path([[0,.22],[0,.42],[-.02,.72],[0,1.16]],.145,border);
  path([[0,.22],[0,.42],[-.02,.72],[0,1.16]],.115,paving,.039);
  path([[-1.06,.35],[-.78,.61],[-.38,.73],[0,.76],[.39,.77],[.78,.64],[.96,.37]],.076);
  path([[-1.06,.35],[-1.10,-.15],[-.91,-.73],[-.46,-1.01],[.13,-1.08],[.67,-.92],[1.05,-.52],[1.09,-.04],[.96,.37]],.063);
  path([[-.83,.57],[-.61,.40],[-.38,.29],[0,.32],[.41,.27],[.69,.04],[.90,-.19]],.066);
  path([[-.80,-.61],[-.81,-.16],[-.70,.12],[-.51,.30]],.045);
  // Forecourt: circular mosaic, radial gardens, layered flowers and trimmed hedges.
  terrain(ellipse(0,.55,.21,.18),border,.042);terrain(ellipse(0,.55,.17,.14),paving,.046);
  terrain(ellipse(0,.55,.105,.086),border,.050);terrain(ellipse(0,.55,.081,.064),paving,.054);
  function flowerBed(x,z,rx,rz,color){terrain(ellipse(x,z,rx+.012,rz+.012,40),border,.038);terrain(ellipse(x,z,rx,rz,40),meadow,.047);terrain(ellipse(x,z,rx*.90,rz*.87,40),color,.053);for(let i=0;i<45;i++){const a=i*2.39996,r=Math.sqrt((i+.5)/45),xx=x+Math.cos(a)*rx*.79*r,zz=z+Math.sin(a)*rz*.73*r;k.mesh(g,new THREE.IcosahedronGeometry(.004+(i%3)*.001,0),i%4?color:cream,xx,sag(xx,zz)+.061,zz);}}
  flowerBed(-.30,.48,.12,.12,pink);flowerBed(.31,.49,.13,.12,lavender);
  flowerBed(-.34,.90,.19,.095,cream);flowerBed(.35,.92,.19,.095,pink);
  flowerBed(-.64,.82,.11,.09,lavender);flowerBed(.65,.88,.11,.085,cream);
  // A planted water garden and fountain provide a destination beside the arrival avenue.
  terrain(ellipse(-.56,.16,.16,.105),border,.041);terrain(ellipse(-.56,.16,.14,.088),water,.047);
  const fountain=at(g,-.56,.16,.05);k.cyl(fountain,.025,.039,.018,border,0,.009,0,32);k.cyl(fountain,.006,.011,.075,border,0,.05,0,16);k.cyl(fountain,.048,.016,.013,border,0,.086,0,40);
  const foam=k.mat('#c9dfd5',.28,.1,'#bce8e2');foam.userData.night.intensity=.30;
  for(let i=0;i<10;i++){const a=i*Math.PI/5;k.line(fountain,Array.from({length:20},(_,j)=>{const t=j/19;return [Math.cos(a)*t*.069,.09+Math.sin(t*Math.PI)*.025-t*.065,Math.sin(a)*t*.069];}),.0013,foam);}
  parkAttractions(k,g,{border,cream,warm});
  // A small Adventure Isle rafting cove, based on the pale layered rock and raft photograph.
  const coveX=.86,coveZ=-.55;terrain(ellipse(coveX,coveZ,.28,.26),water,.038);
  const cliffMats=[k.mat('#aca18a'),k.mat('#b9ad91'),k.mat('#998f78')];
  for(let i=0;i<36;i++){const a=Math.PI+i/35*Math.PI,x=coveX+Math.cos(a)*(.23+(i%3)*.012),z=coveZ+Math.sin(a)*.23,h=.035+.065*(1+Math.sin(i*.69));const o=k.mesh(g,new THREE.DodecahedronGeometry(.050,1),cliffMats[i%3],x,sag(x,z)+h*.44,z);o.scale.set(1.2,h/.065,.84);o.rotation.set(i*.21,i*.8,i*.13);}
  for(let j=0;j<5;j++){const x=.86+(j-2)*.009,z=-.76,base=sag(x,z);k.line(g,[[x,base+.14,z],[x,base+.10,z+.015],[x,base+.09,z+.040],[x,base+.05,z+.07],[x,base+.043,z+.11]],.003,foam);}
  for(let i=0;i<16;i++){const a=i*Math.PI/8,x=coveX+Math.cos(a)*.225,z=coveZ+Math.sin(a)*.22;if(z>coveZ-.04)terrain(ellipse(x,z,.029,.020,12),hedge,.044);}
  const raft=at(g,.80,-.51,.051),rubber=k.mat('#414d4c'),raftBlue=k.mat('#547f95');k.cyl(raft,.043,.047,.016,rubber,0,.008,0,32);k.ring(raft,.032,.009,raftBlue,.021);for(let i=0;i<8;i++){const a=i*Math.PI/4;k.box(raft,.013,.018,.008,cream,Math.sin(a)*.029,.032,Math.cos(a)*.029);}
  // Planting forms groves and garden rooms, not a uniform ring of identical trees.
  const groves=[[-.55,-1.00,.20,.12],[.19,-1.06,.26,.11],[-1.12,-.48,.10,.24],[-1.12,.16,.10,.16],[1.12,-.13,.11,.18],[.80,-.89,.18,.12],[-.79,.93,.16,.10],[.83,.91,.15,.10]];
  let seed=0;
  for(const [cx,cz,rx,rz] of groves)for(let i=0;i<20;i++){const a=i*2.39996,rr=Math.sqrt((i+.5)/20),x=cx+Math.cos(a)*rx*rr,z=cz+Math.sin(a)*rz*rr;if(Math.hypot(x,z)>1.38)continue;gardenTree(k,g,x,z,.027+(seed++%5)*.010,[leaf,hedge,lightLeaf][seed%3],bark);}
  for(const [x,z] of [[-.44,.99],[.45,1.01],[-.95,.65],[1.02,.59],[-.78,.28],[.56,.24],[.52,.79],[-.51,.73]])gardenTree(k,g,x,z,.045,leaf,bark);
  for(const side of [-1,1]){
    for(let j=0;j<10;j++){const x=side*(.25+j*.033),z=1.07-.04*Math.sin(j/9*Math.PI);terrain(ellipse(x,z,.014,.018,12),j%2?pink:cream,.05);}
  }
  // Curved bench groups, warm lampposts and irregular visitor groups animate the gardens.
  function lamp(x,z){const a=at(g,x,z,.04);k.cyl(a,.002,.003,.048,bark,0,.024,0,8);k.box(a,.010,.013,.010,warm,0,.054);k.cyl(a,0,.009,.007,bark,0,.064,0,4);}
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2,x=Math.cos(a)*1.08,z=.02+Math.sin(a)*1.03;lamp(x,z);}
  for(let i=0;i<9;i++)for(const side of [-1,1])lamp(side*.094,.27+i*.098);
  for(const [x,z] of [[-.20,.73],[.22,.76],[-.66,.49],[.68,.75],[-.90,.33],[.94,.10]]){const a=at(g,x,z,.04);for(const y of [.018,.035])k.box(a,.060,.005,.014,bark,0,y,y===.035?-.008:0);for(const xx of [-.024,.024])k.box(a,.004,.02,.006,border,xx,.01);}
  const jackets=[pink,lavender,cream,k.mat('#41677b'),k.mat('#bd945a')];
  for(let i=0;i<88;i++){const t=i/88,x=(i%5-2)*.019+Math.sin(i*8.3)*.008,z=.25+t*.84;if(z>.42&&z<.67&&Math.abs(x)<.075)continue;const a=at(g,x,z,.047);k.cyl(a,.003,.004,.015,jackets[i%5],0,.008,0,6);k.ball(a,.0036,cream,0,.020);}
  for(let i=0;i<42;i++){const x=-.96+i*.047,z=.71+Math.sin(x*3)*.03+(i%3)*.013,a=at(g,x,z,.043);k.cyl(a,.003,.004,.014,jackets[i%5],0,.007,0,6);k.ball(a,.0036,cream,0,.019);}
  return k.merge(g);
}
