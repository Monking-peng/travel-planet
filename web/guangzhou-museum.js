import * as THREE from 'three';
import {plaza,bollards,glow} from './shenzhen-forms.js';
import {tree} from './wuhan-architecture.js';

// Rocco's completed facade photographs guide the red reveals and suspended square mass.
function face(k,g,{width,z,rotation=0,gray,red,glass,seam,back=false}){
  const f=new THREE.Group(),y0=.164,y1=.535,depth=.046;
  const shape=new THREE.Shape();shape.moveTo(-width/2,y0);shape.lineTo(width/2,y0);shape.lineTo(width/2,y1);shape.lineTo(-width/2,y1);shape.closePath();
  const holes=[];
  const add=(points)=>{points=points.map(([x,y])=>[x,Math.min(y,.517)]);const p=new THREE.Path();p.moveTo(...points[0]);points.slice(1).forEach(v=>p.lineTo(...v));p.closePath();shape.holes.push(p);holes.push(points);};
  const L=(x,y,w,h,flip=1)=>{const q=[[0,0],[.32,0],[.32,.72],[1,.72],[1,1],[0,1]].map(([u,v])=>[x+u*w*flip,y+v*h]);add(q);};
  const w=width;
  L(-w*.43,.34,w*.11,.16);L(-w*.28,.20,w*.10,.095);L(-w*.12,.38,w*.11,.155);L(w*.14,.33,w*.12,.17);L(w*.28,.19,w*.12,.14);L(w*.46,.40,w*.09,.135,-1);
  L(-w*.40,.21,w*.09,.095);L(w*.02,.19,w*.09,.075);
  if(!back)add([[-.08,.275],[.13,.275],[.13,.355],[.045,.355],[.045,.425],[-.08,.425]]);
  else L(w*.04,.30,w*.10,.15);
  const cap=new THREE.ShapeGeometry(shape);k.mesh(f,cap,gray,0,0,depth);k.mesh(f,cap.clone(),gray,0,0,-.043);
  k.box(f,width,.004,depth,gray,0,y0,depth/2);k.box(f,width,.004,depth,gray,0,y1,depth/2);
  // Each cut has actual depth, red jambs and recessed glazing, not a painted black square.
  for(const points of holes){
    const sh=new THREE.Shape();sh.moveTo(...points[0]);points.slice(1).forEach(p=>sh.lineTo(...p));sh.closePath();k.mesh(f,new THREE.ShapeGeometry(sh),glass,0,0,-.042);
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],verts=[a[0],a[1],depth,b[0],b[1],depth,b[0],b[1],-.041,a[0],a[1],-.041],gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));gg.setIndex([0,1,2,0,2,3]);gg.computeVertexNormals();k.mesh(f,gg,red);
    }
  }
  // Fine panel joints stop at the cutouts.
  const inside=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  for(let row=0;row<23;row++){
    const yy=y0+(row+.5)*(y1-y0)/23,step=.027;
    for(let col=0;col<Math.ceil(width/step);col++){
      const xx=-width/2+(col+.5)*step;if(xx+step/2>width/2)continue;
      if(holes.some(p=>inside(xx,yy,p)||inside(xx-step*.48,yy,p)||inside(xx+step*.48,yy,p)))continue;
      k.box(f,step-.001,.00055,.0008,seam,xx,yy,depth+.0007);
      if((row+col)%2===0)k.box(f,.0005,.013,.0008,seam,xx-step/2,yy+.0065,depth+.0007);
    }
  }
  f.position.z=z;f.rotation.y=rotation;g.add(f);return holes;
}
function slope(k,g,x,z,w,d,h,mat){
  const pos=[],idx=[],nx=16,nz=20;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/nz;pos.push(x+(u-.5)*w,.016+h*Math.sin(v*Math.PI)**.7*(.7+.3*Math.cos((u-.5)*Math.PI)),z+(v-.5)*d);}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,mat);
}
export function museum(k){
  const g=new THREE.Group(),paving=plaza(k,g,.66,.53,'#bcbcab'),gray=k.mat('#777f80',.74,.22),red=k.mat('#922f37',.74,.10,'#d04437'),seam=k.mat('#5d696a',.80),dark=k.mat('#273c41',.34,.24,'#d4d4b6'),black=k.mat('#3e4949',.72),frame=k.mat('#a5b3ae',.55,.25),grass=k.mat('#698065',.96),stone=k.mat('#969c92',.88),warm=glow(k,'#f6d7a4',.75);
  red.side=THREE.DoubleSide;red.userData.night.intensity=.32;dark.userData.night.intensity=.20;
  // Only the suspended building stays rigid. Its surrounding ground still follows the globe.
  for(const m of [gray,red,seam,dark,black,frame,warm])m.userData.museumRigid=true;
  gray.userData.museumShell=true;dark.userData.museumGlass=true;
  const front=face(k,g,{width:1.04,z:.334,gray,red,glass:dark,seam});
  face(k,g,{width:1.04,z:-.334,rotation:Math.PI,gray,red,glass:dark,seam,back:true});
  for(const side of [-1,1]){
    const wall=new THREE.Group();face(k,wall,{width:.67,z:0,rotation:side*Math.PI/2,gray,red,glass:dark,seam,back:true});wall.position.x=side*.475;g.add(wall);
  }
  // A square roof frame surrounds a real recessed glazed atrium.
  k.box(g,1.04,.014,.174,gray,0,.528,.293);k.box(g,1.04,.014,.174,gray,0,.528,-.293);
  for(const side of [-1,1])k.box(g,.233,.014,.412,gray,side*.404,.528,0);
  k.box(g,.564,.006,.412,dark,0,.506,0);
  for(const side of [-1,1]){k.box(g,.568,.027,.006,red,0,.518,side*.208);k.box(g,.006,.027,.416,red,side*.285,.518,0);}
  for(let i=0;i<20;i++)k.box(g,.002,.003,.408,frame,-.277+i*.0292,.511,0);
  for(let i=0;i<14;i++)k.box(g,.56,.003,.002,frame,0,.511,-.196+i*.0302);
  // The dark underside and recessed ground entrance make the upper box read as a cantilever.
  k.box(g,1.038,.010,.758,black,0,.159,0);k.box(g,.32,.138,.27,dark,0,.080,-.015);
  for(const x of [-.23,.23])k.box(g,.048,.13,.24,gray,x,.079,-.04);
  k.box(g,.28,.004,.004,warm,0,.138,.124);
  for(let i=0;i<10;i++)k.box(g,.002,.10,.004,frame,-.14+i*.031,.078,.123);
  // Projecting glazed display balcony on the principal elevation.
  k.box(g,.21,.012,.14,black,.025,.271,.39);k.box(g,.21,.012,.14,gray,.025,.349,.39);
  const balcony=k.mat('#a2b8b1',.30,.15,'#d4e2d4');balcony.userData.night.intensity=.24;balcony.userData.museumRigid=true;
  k.box(g,.21,.066,.003,balcony,.025,.310,.461);
  for(const side of [-1,1])k.box(g,.003,.066,.13,balcony,.025+side*.106,.310,.395);
  for(let i=0;i<=7;i++)k.box(g,.0015,.070,.003,frame,.025+(i/7-.5)*.21,.310,.464);
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#e5e9df';ctx.font='48px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText('广东省博物馆',256,58);ctx.font='20px sans-serif';ctx.fillText('GUANGDONG MUSEUM',256,96);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:.8});label.userData.museumRigid=true;k.materials.push(label);k.mesh(g,new THREE.PlaneGeometry(.18,.045),label,.025,.305,.467);
  }
  // Sculpted ground folds form a low approach, retaining a clear route beneath the suspended box.
  slope(k,g,-.40,.34,.19,.34,.073,grass);slope(k,g,.40,.34,.19,.34,.073,grass);
  for(let i=0;i<16;i++)k.box(g,.34,.003*(i+1),.019,paving,0,.0015*(i+1),.50-i*.019);
  for(const side of [-1,1]){
    for(let i=0;i<15;i++){const z=.49-i*.020;k.box(g,.005,.003*(i+1),.020,stone,side*.179,.0015*(i+1),z);}
    k.box(g,.002,.001,.29,warm,side*.174,.053,.35);
  }
  for(const [x,z]of [[-.54,-.33],[.54,-.31],[-.55,.25],[.55,.26]])tree(k,g,x,.014,z,.055);
  bollards(k,g,[[-.24,.43],[.24,.43],[-.54,-.35],[.54,-.35]]);
  k.merge(g);g.userData.recesses=front;g.userData.atrium={w:.564,d:.412,y:.506};
  for(const [x,y,z]of [[-.29,.40,.32],[.30,.37,.32],[0,.12,.19]]){const l=new THREE.PointLight('#df6950',0,.47,2);l.position.set(x,y,z);l.userData.nightIntensity=.004;g.add(l);}
  return g;
}
