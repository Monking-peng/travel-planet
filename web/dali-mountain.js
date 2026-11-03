import * as THREE from 'three';
import {palette,site,siteHeight,disc,sign,railing,finish,TAU} from './dali-kit.js';
export function mountainHeight(x,z){
 const radius=Math.hypot(x/.78,z/.67),edge=1-THREE.MathUtils.smoothstep(radius,.74,1);
 const ridge=(.37*Math.exp(-(((x+.25)/.27)**2)-((z+.28)/.15)**2)+.28*Math.exp(-(((x-.24)/.24)**2)-((z+.23)/.14)**2))*(1+.10*Math.sin(x*25+z*8));
 const lake=Math.hypot((x-.055)/.255,(z-.18)/.165),rim=THREE.MathUtils.smoothstep(lake,.92,1.35);
 const value=.018+ridge+.035*Math.exp(-(((x-.05)/.45)**2)-((z-.16)/.32)**2)+ridge*.06*Math.sin(x*39-z*17)**2;
 return siteHeight(x,z,.78,.67)+(value*rim+.035*(1-rim))*edge;
}
export function cangshan(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.79,.68);
 const terrain=k.mat('#ffffff',.99);terrain.userData.landscape=true;const geo=new THREE.PlaneGeometry(1.56,1.34,104,90);geo.rotateX(-Math.PI/2);const a=geo.attributes.position,colors=[],c=new THREE.Color();
 for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i);a.setY(i,mountainHeight(x,z));const rough=.5+.5*Math.sin(x*23+z*11)*Math.cos(x*13-z*19);c.set('#586e4d').lerp(new THREE.Color('#7f8d65'),rough*.65).lerp(new THREE.Color('#92968b'),THREE.MathUtils.smoothstep(a.getY(i),.16,.39)*.65);colors.push(c.r,c.g,c.b);}
 // Keep only the rounded mountain footprint, rather than a rectangular tile.
 const old=geo.index.array,indices=[];for(let i=0;i<old.length;i+=3){let inside=true;for(let j=0;j<3;j++){const n=old[i+j];if(Math.hypot(a.getX(n)/.78,a.getZ(n)/.67)>1)inside=false;}if(inside)indices.push(old[i],old[i+1],old[i+2]);}geo.setIndex(indices);geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();terrain.vertexColors=true;const mesh=k.mesh(g,geo,terrain);mesh.name='cangshan-ridge';
 const rock=k.mat('#858d80',.98);rock.userData.landscape=true;for(let i=0;i<36;i++){const x=-.57+(i%12)*.098,z=-.32+Math.floor(i/12)*.075+.018*Math.sin(i*3),y=mountainHeight(x,z);if(y<.12)continue;const b=k.mesh(g,new THREE.DodecahedronGeometry(.026,0),rock,x,y+.012,z);b.scale.set(.7+.5*Math.sin(i)**2,1.2+Math.cos(i*2)**2,.65);b.rotation.z=Math.sin(i*3)*.35;}
 const water=k.mat('#5b8792',.50,.1);water.userData.landscape=true;water.userData.water=true;disc(k,g,.231,.139,.058,water,.055,.18);
 const route=[[-.57,.32],[-.46,.20],[-.52,.03],[-.35,-.04],[-.29,.075],[-.23,.14],[-.24,.35],[-.08,.43],[.22,.42],[.37,.26]];
 const points=[];for(let i=1;i<route.length;i++){const aa=new THREE.Vector2(...route[i-1]),bb=new THREE.Vector2(...route[i]),n=Math.ceil(aa.distanceTo(bb)/.014);for(let j=0;j<n;j++){const q=aa.clone().lerp(bb,j/n);points.push([q.x,mountainHeight(q.x,q.y)+.012,q.y]);}}points.push([route.at(-1)[0],mountainHeight(...route.at(-1))+.012,route.at(-1)[1]]);
 const planks=k.mat('#b6b6a4',.95),rail=k.mat('#d0cebb',.9);for(let i=1;i<points.length;i++){const aa=new THREE.Vector3(...points[i-1]),bb=new THREE.Vector3(...points[i]),delta=bb.clone().sub(aa),mid=aa.clone().add(bb).multiplyScalar(.5);const b=k.box(g,.042,.006,delta.length()+.002,planks,mid.x,mid.y,mid.z);b.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());if(i%3===0)for(const s of [-1,1]){const xx=mid.x+s*.022*Math.cos(b.rotation.y),zz=mid.z-s*.022*Math.sin(b.rotation.y);k.cyl(g,.0015,.0015,.029,rail,xx,mid.y+.014,zz,5);}}
 for(const side of [-1,1])k.line(g,points.map((p,i)=>{const n=points[Math.min(i+1,points.length-1)],last=points[Math.max(0,i-1)],a=Math.atan2(n[0]-last[0],n[2]-last[2]);return [p[0]+side*.021*Math.cos(a),p[1]+.030,p[2]-side*.021*Math.sin(a)];}),.0015,rail);
 const x=.34,z=.26,y=mountainHeight(x,z)+.018;k.box(g,.13,.008,.075,planks,x,y,z);k.box(g,.039,.10,.010,p.wood,x,y+.052,z);sign(k,g,'洗马潭',.036,.035,x,y+.063,z+.006,{background:'#d7d5bf',color:'#4c3933'});
 return finish(k,g,{visitors:[[-.25,mountainHeight(-.25,.30)+.021,.30],[.34,y+.005,.28]]});
}
