import * as THREE from 'three';
import {glow} from './shenzhen-forms.js';

function ellipse(k,g,rx,rz,y,material,rings=32,segments=160){
  const p=[],idx=[];for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=j/rings;p.push(Math.cos(a)*rx*r,y,Math.sin(a)*rz*r);}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;if(j>0)idx.push(a,a+1,b);idx.push(a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return k.mesh(g,geo,material);
}
const point=(a,t,lift=0)=>[Math.cos(a)*Math.sin(t)*(.50+lift),.031+Math.cos(t)*(.220+lift),Math.sin(a)*Math.sin(t)*(.339+lift)];
const edge=t=>.43+.44*Math.sin(t)**.7+.045*Math.sin(2*t);
function patch(k,g,start,end,material){
  const p=[],n=[],idx=[],rows=48,cols=48;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const t=j/rows*Math.PI/2,a=start(t)+(end(t)-start(t))*i/cols,q=point(a,t);p.push(...q);
    const norm=new THREE.Vector3(Math.cos(a)*Math.sin(t)/.50,Math.cos(t)/.220,Math.sin(a)*Math.sin(t)/.339).normalize();n.push(...norm.toArray());
  }
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;if(j>0)idx.push(a,a+1,b);idx.push(a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geo.setIndex(idx);k.mesh(g,geo,material);
}
export function theatre(k){
  const g=new THREE.Group(),stone=k.mat('#c2c4b6',.9),water=k.mat('#365e66',.24,.20),metal=k.mat('#a2aaa9',.42,.52),glass=k.mat('#73969c',.19,.22,'#b9cfd0'),seam=k.mat('#647b80',.58,.25),silver=k.mat('#b8c4bd',.52,.3),gold=k.mat('#bc9d53',.60,.28,'#edc57e'),base=k.mat('#3c565a',.70),warm=glow(k,'#f3d7a2',.68),star=glow(k,'#e9f2e7',.86);
  for(const m of [metal,glass,water])m.userData.preserveSmooth=true;
  metal.userData.ncpaShell=true;glass.userData.ncpaCurtain=true;water.userData.ncpaPool=true;glass.transparent=true;glass.opacity=.63;glass.depthWrite=false;glass.userData.night.intensity=.09;gold.userData.night.intensity=.55;
  ellipse(k,g,.68,.535,.014,stone);ellipse(k,g,.62,.477,.026,water);
  // The wide northern and southern glass curtains taper smoothly into the titanium shell.
  for(const center of [Math.PI/2,Math.PI*1.5])patch(k,g,t=>center-edge(t),t=>center+edge(t),glass);
  patch(k,g,t=>Math.PI/2+edge(t),t=>Math.PI*1.5-edge(t),metal);
  patch(k,g,t=>Math.PI*1.5+edge(t),t=>Math.PI*2.5-edge(t),metal);
  for(const center of [Math.PI/2,Math.PI*1.5]){
    for(let col=0;col<=28;col++)k.line(g,Array.from({length:49},(_,j)=>{const t=j/48*Math.PI/2;return point(center+(col/28*2-1)*edge(t),t,.0006);}),col%7===0?.0010:.00055,silver);
    for(let row=2;row<=35;row++){const t=row/35*Math.PI/2;k.line(g,Array.from({length:49},(_,j)=>point(center+(j/48*2-1)*edge(t),t,.0007)),.00065,seam);}
  }
  for(const center of [Math.PI,Math.PI*2]){
    for(let row=2;row<=37;row++){const t=row/37*Math.PI/2,half=Math.PI/2-edge(t);k.line(g,Array.from({length:49},(_,j)=>point(center+(j/48*2-1)*half,t,.0006)),.00045,seam);}
    // Sparse pin lights sit on the opaque shell, leaving the glazed volume as the main night focus.
    for(let row=2;row<=11;row++)for(let col=0;col<11;col++){
      const t=(row+.16*(col%3))/12*Math.PI/2,half=Math.PI/2-edge(t),a=center+((col+.4*(row%2))/11*2-1)*half;
      if((row*7+col*3)%4!==0)continue;const q=point(a,t,.0015);k.ball(g,.0014,star,...q);
    }
  }
  // A warm interior volume and galleries are visible through clear glass rather than a flat illuminated triangle.
  const hall=k.cyl(g,.215,.24,.162,gold,0,.111,-.015,96);hall.scale.z=.66;
  const hallRoof=k.ball(g,1,gold,0,.191,-.015);hallRoof.scale.set(.215,.030,.142);
  for(let i=0;i<44;i++){const a=i/44*Math.PI*2;k.beam(g,[Math.cos(a)*.236,.037,-.015+Math.sin(a)*.156],[Math.cos(a)*.212,.192,-.015+Math.sin(a)*.140],.0011,silver,4);}
  for(const side of [-1,1])for(const yy of [.055,.103,.151]){
    k.box(g,.43,.004,.035,base,0,yy,side*.19);k.box(g,.43,.001,.002,warm,0,yy+.004,side*.209);
    for(let i=0;i<=14;i++)k.box(g,.0012,.022,.0012,silver,-.215+i*.43/14,yy+.012,side*.209);
  }
  // Water covers the visitor tunnel. Its parallel glazed-roof ribs are visible below the waterline.
  const tunnel=k.mat('#91aaa4',.68,.08);tunnel.userData.ncpaTunnel=true;
  for(const side of [-1,1]){
    k.box(g,.18,.002,.15,tunnel,0,.025,side*.401);
    for(let i=0;i<=9;i++)k.box(g,.0012,.001,.15,stone,-.09+i*.02,.027,side*.401);
    for(let i=0;i<=4;i++)k.box(g,.18,.001,.0012,stone,0,.027,side*(.326+i*.0375));
    k.box(g,.20,.004,.060,stone,0,.016,side*.505);
  }
  k.merge(g);g.userData.shellProfile={rx:.50,rz:.339,height:.220,base:.031};
  for(const z of [-.20,.20]){const light=new THREE.PointLight('#e8c480',0,.65,2);light.position.set(0,.13,z);light.userData.nightIntensity=.005;g.add(light);}
  return g;
}
