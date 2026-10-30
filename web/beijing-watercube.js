import * as THREE from 'three';

function clip(poly,nx,ny,c){
  const out=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*ny-c,db=b[0]*nx+b[1]*ny-c;
    if(da<=0)out.push(a);
    if((da<0)!==(db<0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
  }
  return out;
}

// Each shared polygon edge is straight; its membrane rises smoothly behind it.
// The cell index varies only the subtle blue tint, not the pressure profile.
export function foamFace(k,g,w,h,origin,u,v,normal,materials,seed){
  const points=[],cols=Math.round(w/.076),rows=Math.max(3,Math.round(h/.073)),depth=.0038;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)points.push([(x+.5+.33*Math.sin(x*7+y*11+seed))*w/cols-w/2,(y+.5+.32*Math.cos(x*13+y*3+seed))*h/rows-h/2]);
  const rim=k.mat('#648795',.64,.08),map=(a,b,lift)=>origin.map((n,j)=>n+u[j]*a+v[j]*b+normal[j]*lift);
  const outward=new THREE.Vector3(...u).cross(new THREE.Vector3(...v)).dot(new THREE.Vector3(...normal))>0;
  points.forEach((p,i)=>{
    let cell=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
    for(let j=0;j<points.length&&cell.length;j++){
      if(i===j)continue;const q=points[j];cell=clip(cell,q[0]-p[0],q[1]-p[1],(q[0]*q[0]+q[1]*q[1]-p[0]*p[0]-p[1]*p[1])/2);
    }
    if(cell.length<3)return;
    const edge=[];
    cell.forEach((a,j)=>{const b=cell[(j+1)%cell.length];for(let n=0;n<5;n++)edge.push([a[0]+(b[0]-a[0])*n/5,a[1]+(b[1]-a[1])*n/5]);});
    const center=cell.reduce((sum,a)=>[sum[0]+a[0]/cell.length,sum[1]+a[1]/cell.length],[0,0]);
    const area=(a,b,q)=>(b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]);
    const pressure=q=>Math.pow(cell.reduce((value,a,j)=>value*Math.max(0,area(a,cell[(j+1)%cell.length],q)/area(a,cell[(j+1)%cell.length],center)),1),.75);
    const samples=[center],vertices=[],colors=[],indices=[],n=edge.length,rings=10;
    for(let ring=1;ring<=rings;ring++){
      const t=ring/rings;edge.forEach(([a,b])=>samples.push([center[0]+(a-center[0])*t,center[1]+(b-center[1])*t]));
    }
    const weights=samples.map(pressure),peak=Math.max(...weights);
    samples.forEach(([x,y],j)=>{const fullness=weights[j]/peak,tone=.86+.14*fullness;vertices.push(...map(x,y,depth*fullness));colors.push(tone,tone,tone);});
    const tri=(a,b,c)=>indices.push(...(outward?[a,b,c]:[a,c,b]));
    for(let j=0;j<n;j++){
      const next=(j+1)%n;tri(0,1+j,1+next);
      for(let ring=0;ring<rings-1;ring++){const a=1+ring*n+j,b=1+ring*n+next;tri(a,a+n,b);tri(b,a+n,b+n);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=k.mesh(g,geo,materials[i%materials.length]);mesh.userData.cushionNormal=normal;
    cell.forEach((a,j)=>k.beam(g,map(...a,.0002),map(...cell[(j+1)%cell.length],.0002),.00055,rim,5));
  });
}

export function watercube(k){
  const g=new THREE.Group(),base=k.mat('#c9cbc3'),blue=['#9dbdcb','#91b2c4','#a5c3ce','#97b7c9'].map((color,i)=>{
    const m=k.mat(color,.56,.09,'#57b7f2');m.vertexColors=true;m.userData.night.intensity=.60+i*.045;m.userData.pulse={speed:.32,phase:i*.7};m.userData.cushion=true;
    m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance *= .24+.76*pow(clamp((1.0-vColor.r)/.14,0.0,1.0),2.0);');};
    m.customProgramCacheKey=()=> 'watercube-cushion-edge-v2';return m;
  });
  k.box(g,.74,.019,.67,base,0,.009,0);k.box(g,.65,.207,.58,k.mat('#53738b',.55,.08),0,.126,0);
  for(const s of [-1,1]){
    foamFace(k,g,.65,.21,[0,.13,s*.292],[1,0,0],[0,1,0],[0,0,s],blue,s+2);
    foamFace(k,g,.58,.21,[s*.327,.13,0],[0,0,1],[0,1,0],[s,0,0],blue,s+5);
  }
  foamFace(k,g,.65,.58,[0,.237,0],[1,0,0],[0,0,1],[0,1,0],blue,9);
  const glass=k.mat('#385c70',.36,.18,'#d0e2df'),frame=k.mat('#a3b5b8',.64,.12),canopy=k.mat('#c6cfd0',.77),entryLight=k.mat('#d9ddd0',.7,.05,'#e8dfc1');glass.userData.night.intensity=.32;entryLight.userData.night.intensity=.65;
  for(const z of [-.302,.302]){
    k.box(g,.48,.034,.006,glass,0,.036,z);
    for(let i=0;i<=16;i++)k.box(g,.0013,.034,.008,frame,(i/16-.5)*.48,.036,z);
    k.box(g,.27,.008,.054,canopy,0,.065,z);k.box(g,.25,.001,.043,entryLight,0,.060,z);
    for(const x of [-.122,.122])k.box(g,.003,.04,.003,frame,x,.039,z+(z>0?.023:-.023));
  }
  return k.merge(g);
}
