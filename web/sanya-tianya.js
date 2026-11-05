import * as THREE from 'three';
import {palette,site,skin,disc,palms,texturedStone,finish,TAU} from './sanya-kit.js';
import {noise} from './guilin-kit.js';

// The broad weathered faces and the incised joint distinguish the two named
// granite boulders from rounded decorative rocks. Dimensions are model units.
function granite(k,g,{id,x,z,y=.038,rx,ry,rz,seed,split=false,taper=0}){
 const geometry=new THREE.SphereGeometry(1,112,80),p=geometry.attributes.position,colors=[];
 const power=(v,e)=>Math.sign(v)*Math.abs(v)**e;
 for(let i=0;i<p.count;i++){
  const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i),t=(power(Y,.56)+1)/2;
  const n=noise(X*3+seed,Y*4,Z*4)-.5;
  let xx=power(X,.52)*rx*(1+n*.22)*(1-taper*t)+rx*.09*t;
  let zz=power(Z,.55)*rz*(1+n*.20);
  let yy=y+Math.max(0,(t-.075)/.925)*ry*2*(.88+.12*noise(X*4+seed,0,Z*5)+(!split?.11*X:0));
  // A deep diagonal seam cuts the front face and continues across the crest.
  const seam=split?Math.exp(-(((xx/rx-.18-.14*t)/.047)**2)):0;
  if(Z>0)zz-=rz*.42*seam;
  yy-=ry*.12*seam*THREE.MathUtils.smoothstep(t,.72,.96);
  const crease=(split?.010:.004)*Math.exp(-(((t-.46-.08*X)/.018)**2));
  if(Z>0)zz-=crease*(.35+.65*Math.abs(X));
  p.setXYZ(i,x+xx,yy,z+zz);
  const streak=noise(xx*95+seed,yy*3,zz*56),patch=noise(xx*29,yy*23+seed,zz*33);
  const weather=THREE.MathUtils.smoothstep(t+.13*(streak-.5),.10,.46);
  const c=new THREE.Color('#c2b49a').lerp(new THREE.Color('#454943'),weather*(.78+.21*streak));
  c.lerp(new THREE.Color('#c7c2af'),Math.max(0,streak-.49)*.49);
  c.multiplyScalar(.88+.20*patch-.22*seam*(Z>0?1:.1));colors.push(c.r,c.g,c.b);
 }
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const mat=texturedStone(k,'#ffffff');mat.vertexColors=true;mat.userData.landscape=true;mat.userData.coastalGranite=id;mat.userData.night={color:new THREE.Color('#b5ad96'),intensity:.045};
 return k.mesh(g,geometry,mat);
}

// Ray projection keeps every letter on the uneven stone, including oblique
// views; a free-floating rectangular sign would detach from the rock surface.
function inscription(k,g,rock,text,{x,y,w,h,vertical=false}){
 if(typeof document==='undefined')return;
 const canvas=document.createElement('canvas');canvas.width=vertical?256:1024;canvas.height=vertical?1024:256;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#a23d30';ctx.textAlign='center';ctx.textBaseline='middle';
 const chars=[...text];ctx.font='bold '+(vertical?205:208)+'px "KaiTi","STKaiti",serif';
 chars.forEach((c,i)=>ctx.fillText(c,vertical?128:(i+.5)*canvas.width/chars.length,vertical?(i+.5)*canvas.height/chars.length:132,vertical?220:canvas.width/chars.length*.94));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const mat=k.mat('#ffffff',.98);mat.map=texture;mat.transparent=true;mat.depthWrite=false;mat.polygonOffset=true;mat.polygonOffsetFactor=-1;mat.polygonOffsetUnits=-1;mat.userData.rockInscription=text;
 rock.updateMatrixWorld(true);const ray=new THREE.Raycaster(),positions=[],uv=[],idx=[],NX=48,NY=16;
 for(let j=0;j<=NY;j++)for(let i=0;i<=NX;i++){
  const xx=x+(i/NX-.5)*w,yy=y+(j/NY-.5)*h;ray.set(new THREE.Vector3(xx,yy,.7),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(rock,false)[0];positions.push(xx,yy,hit?hit.point.z+.0006:.7);uv.push(i/NX,j/NY);
 }
 for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+NX+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(idx);geometry.computeVertexNormals();k.mesh(g,geometry,mat);
}

export function tianya(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p,{sea:true});
 const sand=k.mat('#c9b995',.99);sand.userData.landscape=true;
 const beach=(x,z)=>{const r=Math.hypot(x/.67,(z+.015)/.43),t=THREE.MathUtils.smoothstep(r,.67,1);return THREE.MathUtils.lerp(.036,h(x,z)+.009,t);};
 disc(k,g,.67,.43,(x,z)=>beach(x,z-.015),sand,0,-.015);
 const wet=k.mat('#a9a88c',.96);wet.userData.landscape=true;
 // The gently irregular intertidal margin follows the curved island ground.
 skin(k,g,(u,v)=>{const a=.10+u*Math.PI*.87,r=.90+v*.09+.009*Math.sin(u*29);const x=Math.cos(a)*.67*r,z=-.015+Math.sin(a)*.43*r;return [x,beach(x,z)+.0015,z];},4,100,wet);
 const main=granite(k,g,{id:'tianya',x:-.24,z:-.055,rx:.285,ry:.221,rz:.194,seed:4,split:true});
 const cape=granite(k,g,{id:'haijiao',x:.31,z:-.15,rx:.285,ry:.190,rz:.181,seed:13,taper:.34});
 granite(k,g,{id:'shore-rock',x:-.55,z:-.125,rx:.083,ry:.130,rz:.099,seed:10,taper:.22});
 granite(k,g,{id:'shore-rock',x:.53,z:-.24,rx:.067,ry:.096,rz:.086,seed:15,taper:.12});
 // The original horizontal stone inscriptions read right to left.
 inscription(k,g,main,'涯天',{x:-.323,y:.285,w:.126,h:.074});
 inscription(k,g,main,'空天闊海',{x:-.325,y:.151,w:.126,h:.034});
 inscription(k,g,cape,'角海',{x:.324,y:.295,w:.105,h:.055});
 // Palms stay behind the inscriptions and leave the sandy approach open.
 palms(k,g,p,beach,[[-.43,-.31,.23],[-.22,-.36,.25],[.04,-.35,.23],[.47,-.32,.22]]);
 return finish(k,g,{visitors:[[-.30,.037,.25],[-.13,.037,.22],[.07,.037,.21]]});
}
