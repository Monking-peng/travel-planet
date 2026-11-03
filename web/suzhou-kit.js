import * as THREE from 'three';
import {hip} from './chongqing-kit.js';
import {skin,glow,people,bollards} from './shenzhen-forms.js';
import {lattice} from './shunde-kit.js';
export {site,disc,pond,paving,steps,grove,bamboo,sign} from './chengdu-kit.js';
export {archWall,moonWall,bridge,balcony} from './shunde-kit.js';
export {hip,skin,lattice};
export const TAU=Math.PI*2;
export function palette(k){return {wall:k.mat('#e0dfd2',.93),pale:k.mat('#d0cdbb',.92),stone:k.mat('#9c9e92',.97),wood:k.mat('#423c32',.90),tile:k.mat('#4b514e',.9),leaf:k.mat('#597350',.97),water:k.mat('#548478',.38,.13),gold:k.mat('#b49654',.48,.35),warm:glow(k,'#efc38f',.8,.55,.35)};}
export function lit(k,color='#615846',strength=.32){const m=k.mat(color,.86);m.userData.night={color:new THREE.Color('#efcb95'),intensity:strength};return m;}
export function edgeLight(k,roof){const m=k.mat(roof.color,.85);m.userData.night={color:new THREE.Color('#f1c695'),intensity:.48};return m;}
export function hall(k,g,p,{x=0,z=0,y=.035,w=.36,d=.20,h=.14,wall=p.wall,roof=p.tile}={}){
 k.box(g,w+.025,.018,d+.035,p.stone,x,y-.009,z);k.box(g,w,h,d*.84,wall,x,y+h/2,z);
 const pane=lit(k),bays=Math.max(3,Math.round(w/.065));
 for(const side of [-1,1]){for(let i=0;i<bays;i++){const xx=x+((i+.5)/bays-.5)*w*.92,zz=z+side*d*.426;k.box(g,w*.80/bays,h*.79,.003,p.wood,xx,y+h*.43,zz);k.box(g,w*.67/bays,h*.59,.003,pane,xx,y+h*.50,zz+side*.002);lattice(k,g,xx,y+h*.50,zz+side*.004,w*.67/bays,h*.59,p.wood);}
 for(let i=0;i<=bays;i++){const xx=x+(i/bays-.5)*w*.97;k.cyl(g,.003,.004,h,p.wood,xx,y+h/2,z+side*d*.49,6);}
 k.box(g,w,.009,.006,p.wood,x,y+h-.007,z+side*d*.49);}
 hip(k,g,w*1.14,d*1.22,h*.42,y+h,roof,edgeLight(k,roof),x,z);
}
export function path(k,g,p,points,width=.045,y=.026){for(let i=1;i<points.length;i++){const a=new THREE.Vector2(...points[i-1]),b=new THREE.Vector2(...points[i]),delta=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5);const o=k.box(g,width,.012,delta.length()+.008,p.pale,mid.x,y,mid.y);o.rotation.y=Math.atan2(delta.x,delta.y);}}
export function polygonRoof(k,g,p,{n=6,r=.17,h=.09,y=.20}={}){
 const point=(u,v)=>{const a=u*TAU,sector=TAU/n,local=((a+sector/2)%sector)-sector/2,rad=r*Math.cos(sector/2)/Math.cos(local),t=.001+.999*v;return [Math.sin(a)*rad*t,y+h*(1-t)**1.35+.018*t**7*(Math.abs(local)/(sector/2))**6,Math.cos(a)*rad*t];};
 skin(k,g,point,10,96,p.tile);k.line(g,Array.from({length:96},(_,i)=>point(i/96,1)),.002,edgeLight(k,p.tile),true);
 for(let i=0;i<48;i++)k.line(g,Array.from({length:8},(_,j)=>{const a=point(i/48,.07+.93*j/7);a[1]+=.001;return a;}),.0007,p.tile);
 k.ball(g,.007,p.gold,0,y+h+.009,0);
}
export function stoneRock(k,g,p,{x=0,z=0,y=.025,h=.34,w=.15,holes=true}={}){
 // Sample a weathered volume instead of extruding a flat outline. Subtracted
 // tunnels remain open through the complete stone, from both garden viewpoints.
 const lobes=[[-.10,.08,0,.34,.14,.29],[.07,.23,.02,.25,.20,.24],[-.07,.43,-.02,.30,.23,.25],[-.13,.66,0,.31,.24,.27],[-.06,.84,0,.43,.17,.32],[.15,.91,.02,.22,.09,.23]];
 const field=(a,b,c)=>{let d=Infinity;for(const [cx,cy,cz,rx,ry,rz]of lobes)d=Math.min(d,Math.hypot((a-cx)/rx,(b-cy)/ry,(c-cz)/rz)-1);d+=.018*Math.sin(a*19+b*18+c*21)+.010*Math.cos(a*37-c*22+b*29);if(holes)for(const [cx,cy,rx,ry]of [[-.05,.72,.12,.085],[.01,.39,.075,.075]])d=Math.max(d,1-Math.hypot((a-cx+.035*c)/rx,(b-cy)/ry));return d;};
 const NX=30,NY=54,NZ=22,points=[],values=[],positions=[],normals=[],index=(i,j,l)=>(j*(NZ+1)+l)*(NX+1)+i;
 for(let j=0;j<=NY;j++)for(let l=0;l<=NZ;l++)for(let i=0;i<=NX;i++){const q=[-.62+1.24*i/NX,-.035+1.08*j/NY,-.39+.78*l/NZ];points.push(q);values.push(field(...q));}
 const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
 const grad=q=>{const e=.001;return new THREE.Vector3((field(q[0]+e,q[1],q[2])-field(q[0]-e,q[1],q[2]))/w,(field(q[0],q[1]+e,q[2])-field(q[0],q[1]-e,q[2]))/h,(field(q[0],q[1],q[2]+e)-field(q[0],q[1],q[2]-e))/w).normalize();};
 const emit=(a,b,c)=>{const av=new THREE.Vector3(a[0]*w,a[1]*h,a[2]*w),bv=new THREE.Vector3(b[0]*w,b[1]*h,b[2]*w),cv=new THREE.Vector3(c[0]*w,c[1]*h,c[2]*w);if(bv.clone().sub(av).cross(cv.clone().sub(av)).dot(grad(a))<0)[b,c]=[c,b];for(const q of [a,b,c]){positions.push(q[0]*w,q[1]*h,q[2]*w);normals.push(...grad(q));}};
 for(let j=0;j<NY;j++)for(let l=0;l<NZ;l++)for(let i=0;i<NX;i++){
  const cube=[index(i,j,l),index(i+1,j,l),index(i+1,j+1,l),index(i,j+1,l),index(i,j,l+1),index(i+1,j,l+1),index(i+1,j+1,l+1),index(i,j+1,l+1)];
  for(const t of tetra){const cut=[];for(const [a,b]of pairs){const ia=cube[t[a]],ib=cube[t[b]],va=values[ia],vb=values[ib];if((va<0)===(vb<0))continue;const f=va/(va-vb);cut.push(points[ia].map((v,n)=>v+(points[ib][n]-v)*f));}if(cut.length===3)emit(...cut);else if(cut.length===4){const scale=q=>new THREE.Vector3(q[0]*w,q[1]*h,q[2]*w),center=cut.reduce((v,q)=>v.add(scale(q)),new THREE.Vector3()).multiplyScalar(.25),normal=grad(cut[0]),u=scale(cut[0]).sub(center).normalize(),v=normal.clone().cross(u);cut.sort((a,b)=>{const aa=scale(a).sub(center),bb=scale(b).sub(center);return Math.atan2(aa.dot(v),aa.dot(u))-Math.atan2(bb.dot(v),bb.dot(u));});emit(cut[0],cut[1],cut[2]);emit(cut[0],cut[2],cut[3]);}}
 }
 const rock=k.mat('#7c8275',.99);rock.userData.taihuRock=true;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));k.mesh(g,geo,rock,x,y,z);
 for(let i=0;i<5;i++){const a=i*2.4,o=k.mesh(g,new THREE.DodecahedronGeometry(w*.20,0),p.stone,x+Math.sin(a)*w*.24,y+w*.09,z+Math.cos(a)*w*.13);o.scale.set(1.3,.65,.7);}
}
export function finish(k,g,{lamps=[],visitors=[]}={}){
 for(const [x,y,z]of lamps){const child=new THREE.Group();child.position.y=y-.0065;g.add(child);bollards(k,child,[[x,z]]);}
 const levels=new Map();for(const [x,y,z]of visitors){if(!levels.has(y))levels.set(y,[]);levels.get(y).push([x,z]);}for(const [y,points]of levels){const child=new THREE.Group();child.position.y=y-.0115;g.add(child);people(k,child,points);}
 return k.merge(g);
}
