import * as THREE from 'three';
import {palette,site,siteHeight,sign,finish,TAU} from './dali-kit.js';
export function lakeRadius(x,z){const a=Math.atan2((z-.17)/.16,(x-.06)/.25),shape=1+.065*Math.sin(a*3+.4)+.035*Math.cos(a*5-.5);return Math.hypot((x-.06)/.25,(z-.17)/.16)/shape;}
export function mountainHeight(x,z){
 const radial=Math.hypot(x/.78,z/.67),edge=1-THREE.MathUtils.smoothstep(radial,.75,1),r=lakeRadius(x,z);
 const ridgeZ=-.255+.055*Math.sin(x*7+.7),outline=Math.max(0,1-(Math.abs(x)/.72)**3),peaks=.28+.055*Math.sin(x*18+.3)+.035*Math.cos(x*31);
 const ridge=outline*peaks*Math.exp(-(((z-ridgeZ)/.137)**2)),grain=.006*Math.sin(x*74+z*32)*Math.cos(z*57-x*19)+.004*Math.cos(x*133-z*86);
 const basin=.026+.028*THREE.MathUtils.smoothstep(r,.86,1.12),blend=THREE.MathUtils.smoothstep(r,1.03,1.50);
 const ground=.036+ridge+.012*Math.sin(x*21+z*17)**2+grain;
 return siteHeight(x,z,.78,.67)+(basin*(1-blend)+ground*blend)*edge;
}
export const MOUNTAIN_ROUTE=[[-.57,.32],[-.46,.20],[-.52,.03],[-.35,-.04],[-.29,.075],[-.23,.14],[-.24,.35],[-.08,.43],[.22,.42],[.37,.26]];
const segmentDistance=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=THREE.MathUtils.clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
export function cangshan(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.68);
 const terrain=k.mat('#ffffff',.99);terrain.userData.landscape=true;terrain.userData.cangshanTerrain=true;
 const geo=new THREE.PlaneGeometry(1.56,1.34,156,134);geo.rotateX(-Math.PI/2);const a=geo.attributes.position,colors=[],c=new THREE.Color();
 for(let i=0;i<a.count;i++){
  const x=a.getX(i),z=a.getZ(i),y=mountainHeight(x,z),e=.003,slope=Math.hypot((mountainHeight(x+e,z)-mountainHeight(x-e,z))/(2*e),(mountainHeight(x,z+e)-mountainHeight(x,z-e))/(2*e));a.setY(i,y);
  const mottled=.5+.5*Math.sin(x*37+z*19)*Math.cos(x*23-z*41),crag=THREE.MathUtils.smoothstep(slope,.75,1.9)*THREE.MathUtils.smoothstep(y,.15,.30);
  c.set('#62724a').lerp(new THREE.Color('#8b9161'),mottled*.43).lerp(new THREE.Color('#8d9489'),crag*.80);colors.push(c.r,c.g,c.b);
 }
 const old=geo.index.array,ix=[];for(let i=0;i<old.length;i+=3)if([old[i],old[i+1],old[i+2]].every(n=>Math.hypot(a.getX(n)/.78,a.getZ(n)/.67)<1))ix.push(old[i],old[i+1],old[i+2]);geo.setIndex(ix);geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();terrain.vertexColors=true;k.mesh(g,geo,terrain).name='cangshan-ridge';
 const water=k.mat('#658b90',.49,.10);water.userData.landscape=true;water.userData.water=true;const vertices=[.06,.052,.17],indices=[];
 for(let i=0;i<=160;i++){const aa=i/160*TAU,shape=1+.065*Math.sin(aa*3+.4)+.035*Math.cos(aa*5-.5);vertices.push(.06+Math.cos(aa)*.25*shape*1.04,.052,.17+Math.sin(aa)*.16*shape*1.04);if(i)indices.push(0,i+1,i);}
 const waterGeo=new THREE.BufferGeometry();waterGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));waterGeo.setIndex(indices);waterGeo.computeVertexNormals();k.mesh(g,waterGeo,water);
 const rocks=[k.mat('#929a8d'),k.mat('#798678'),k.mat('#a0a496')];rocks.forEach(m=>m.userData.landscape=true);
 for(let i=0;i<42;i++){const x=-.61+i/41*1.2,z=-.25+.055*Math.sin(x*7+.7)+.05*Math.sin(i*2.3),y=mountainHeight(x,z),r=.023+.012*(.5+.5*Math.sin(i*5));const o=k.mesh(g,new THREE.DodecahedronGeometry(r,0),rocks[i%3],x,y+r*.10,z);o.scale.set(1.2,.7+(i%4)*.21,.65);o.rotation.set(i*.21,Math.sin(i*4),-.3+Math.sin(i*2)*.5);}
 // Low alpine scrub follows the slope and leaves the wet shore and trail clear.
 const greens=['#526a46','#6d7d51','#798451','#5d7654'].map(v=>{const m=k.mat(v,.99);m.userData.landscape=true;return m;});
 const blossoms=['#d6d4ba','#d9cda6','#bfada5'].map(v=>{const m=k.mat(v,.99);m.userData.landscape=true;return m;});
 for(let i=0;i<720;i++){
  const angle=i*2.399963,rad=Math.sqrt((i+.5)/720)*.94,x=Math.cos(angle)*.76*rad,z=Math.sin(angle)*.65*rad,r=lakeRadius(x,z),y=mountainHeight(x,z);
  if(r<1.15||y>.29||MOUNTAIN_ROUTE.slice(1).some((b,j)=>segmentDistance(x,z,MOUNTAIN_ROUTE[j],b)<.037)||Math.hypot((x-.36)/.10,(z-.26)/.07)<1)continue;
  const size=.018+.012*(.5+.5*Math.sin(i*3.1)),o=k.mesh(g,new THREE.IcosahedronGeometry(size,0),greens[i%4],x,y+size*.23,z);o.scale.set(1.4,.56,1);o.rotation.y=i*1.3;
  if(i%3===0&&z>-.17)for(let j=0;j<3;j++){const aa=j/3*TAU+i,f=k.mesh(g,new THREE.IcosahedronGeometry(.0037,0),blossoms[(i+j)%3],x+Math.cos(aa)*size*.7,y+size*.70,z+Math.sin(aa)*size*.6);f.scale.set(1.4,.55,1.4);}
 }
 const planks=k.mat('#b0b3a4',.96),rail=k.mat('#c7c9bd',.93);planks.userData.cangshanDeck=true;planks.userData.landscape=true;rail.userData.landscape=true;
 const points=[];for(let i=1;i<MOUNTAIN_ROUTE.length;i++){const aa=new THREE.Vector2(...MOUNTAIN_ROUTE[i-1]),bb=new THREE.Vector2(...MOUNTAIN_ROUTE[i]),n=Math.ceil(aa.distanceTo(bb)/.012);for(let j=0;j<n;j++){const q=aa.clone().lerp(bb,j/n);points.push([q.x,q.y]);}}points.push(MOUNTAIN_ROUTE.at(-1));
 const railPoints=[[],[]];
 for(let i=1;i<points.length;i++){
  const aa=new THREE.Vector2(...points[i-1]),bb=new THREE.Vector2(...points[i]),delta=bb.clone().sub(aa),mid=aa.clone().add(bb).multiplyScalar(.5),angle=Math.atan2(delta.x,delta.y),normal=[Math.cos(angle),-Math.sin(angle)];
  const samples=[aa,bb,mid],top=Math.ceil(Math.max(...samples.flatMap(q=>[-1,0,1].map(s=>mountainHeight(q.x+normal[0]*s*.023,q.y+normal[1]*s*.023))))/.006)*.006+.011;
  const b=k.box(g,.047,.012,delta.length()+.004,planks,mid.x,top-.006,mid.y);b.rotation.y=angle;
  for(let side=0;side<2;side++){const s=side?1:-1,xx=mid.x+s*.022*normal[0],zz=mid.y+s*.022*normal[1];railPoints[side].push([xx,top+.031,zz]);if(i%3===0){const ground=mountainHeight(xx,zz);k.cyl(g,.0015,.0018,top+.033-ground,rail,xx,(top+.033+ground)/2,zz,6);}}
 }
 for(const pts of railPoints){k.line(g,pts,.0015,rail);k.line(g,pts.map(p=>[p[0],p[1]-.014,p[2]]),.001,rail);}
 const x=.37,z=.26,y=Math.ceil(Math.max(...[-.055,0,.055].flatMap(dx=>[-.035,0,.035].map(dz=>mountainHeight(x+dx,z+dz))))/.006)*.006+.012;
 k.box(g,.13,.015,.085,planks,x,y-.0075,z);for(const dx of [-.052,.052])for(const dz of [-.033,.033]){const base=mountainHeight(x+dx,z+dz);k.box(g,.006,y-base,.006,rail,x+dx,(base+y)/2,z+dz);}
 k.box(g,.040,.10,.010,p.wood,x+.035,y+.050,z-.018);sign(k,g,'洗马潭',.036,.035,x+.035,y+.061,z-.012,{background:'#d7d5bf',color:'#4c3933'});
 return finish(k,g,{visitors:[[x-.025,y+.001,z+.014]]});
}
