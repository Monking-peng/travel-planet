import * as THREE from 'three';

// Curved hip roofs: low eave, lifted corners and a rising central ridge.
export function roof(k,g,w,d,h,y,mat,trim,x=0,z=0){
  const v=[],idx=[],rings=10,N=64;
  function point(r,t){r=THREE.MathUtils.clamp(r,0,1);const side=Math.floor(t*4)%4,u=(t*4)%1*2-1;let xx,zz;if(side===0){xx=u*w/2;zz=d/2;}else if(side===1){xx=w/2;zz=-u*d/2;}else if(side===2){xx=-u*w/2;zz=-d/2;}else{xx=-w/2;zz=u*d/2;}const ridge=Math.max(0,w-d)*.42,rise=h*(1-r)**1.35+.018*r**5*Math.abs(u)**7;return [x+xx*r+(1-r)*Math.sign(xx)*ridge,y+rise,z+zz*r];}
  for(let j=0;j<=rings;j++)for(let i=0;i<=N;i++)v.push(...point(.08+.92*j/rings,i/N));
  for(let j=0;j<rings;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,a+1,b,a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,mat);mat.side=THREE.DoubleSide;
  k.line(g,Array.from({length:N},(_,i)=>point(1,i/N)),.0024,trim,true);
  for(let i=0;i<N;i+=2)k.line(g,Array.from({length:9},(_,j)=>{const p=point(.12+.88*j/8,i/N);p[1]+=.0015;return p;}),.0008,mat);
  const ridge=Math.max(.008,(w-d)*.42);k.line(g,[[x-ridge,y+h,z],[x,y+h+.002,z],[x+ridge,y+h,z]],.003,mat);
}
export function stairs(k,g,w,depth,height,mat,x=0,z=0,n=8){for(let i=0;i<n;i++)k.box(g,w,height/n*(i+1),depth/n,mat,x,height/n*(i+1)/2,z-i*depth/n);}
export function plaque(k,g,text,w,h,x,y,z){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#302b26';ctx.fillRect(0,0,512,160);ctx.strokeStyle='#d7ae55';ctx.lineWidth=8;ctx.strokeRect(9,9,494,142);ctx.fillStyle='#edd18a';ctx.font='bold 90px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,83,470);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,roughness:.8});k.materials.push(m);m.userData.night={color:new THREE.Color('#f2cb8e'),intensity:.25};k.mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);
}
export function hall(k,g,{x=0,z=0,w=.35,d=.24,h=.14,base=0,roofColor='#665c49',name='',double=false}){
  const red=k.mat('#795044'),wall=k.mat('#d4c7a5'),tile=k.mat(roofColor,.78),trim=k.mat('#b8aa80',.6,.1,'#f3c781');trim.userData.night.intensity=.45;
  k.box(g,w+.04,.022,d+.04,wall,x,base+.011,z);k.box(g,w*.78,h*.82,d*.76,wall,x,base+.022+h*.41,z);
  for(const sx of [-1,1])for(let i=0;i<5;i++){const xx=x+(i/4-.5)*w*.9;k.cyl(g,.005,.006,h,red,xx,base+h/2+.022,z+sx*d*.44,8);k.box(g,.027,h*.56,.003,k.mat('#544639'),xx,base+h*.5+.018,z+sx*d*.385);}
  roof(k,g,w*1.22,d*1.25,h*.45,base+h+.02,tile,trim,x,z);if(double)roof(k,g,w*1.02,d*1.03,h*.42,base+h*1.48,tile,trim,x,z);
  if(name)plaque(k,g,name,w*.38,.033,x,base+h*.85,z+d*.49);
}
const woodlandMaterials=new WeakMap();
export function tree(k,g,x,y,z,size=.07,pink=false){if(!woodlandMaterials.has(k))woodlandMaterials.set(k,[k.mat('#79624a'),k.mat('#587b59',.95),k.mat('#c59fa7',.95)]);const [bark,green,blossom]=woodlandMaterials.get(k),leaf=pink?blossom:green;k.cyl(g,.004,.008,size*.9,bark,x,y+size*.4,z,6);for(let j=0;j<4;j++){const a=j*2.4;const m=k.mesh(g,new THREE.IcosahedronGeometry(size*.42,1),leaf,x+Math.cos(a)*size*.22,y+size*(.82+(j%2)*.12),z+Math.sin(a)*size*.22);m.scale.set(1,1.1,1);}}
export function rail(k,g,w,d,y,mat){for(const side of [-1,1]){k.box(g,w,.004,.004,mat,0,y+.026,side*d/2);k.box(g,.004,.004,d,mat,side*w/2,y+.026);for(let i=0;i<=12;i++){k.box(g,.003,.028,.003,mat,(i/12-.5)*w,y+.014,side*d/2);k.box(g,.003,.028,.003,mat,side*w/2,y+.014,(i/12-.5)*d);}}}
