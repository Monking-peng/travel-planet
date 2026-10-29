import * as THREE from 'three';
export function greenland(k){const g=new THREE.Group(),glass=k.glass('#6e858b','#72b8e9',81),metal=k.mat('#b9c7c9',.33,.6),edge=k.mat('#a1bdc9',.4,.3,'#9fd5ff'),dark=k.mat('#34464e',.4,.35);edge.userData.night.intensity=1.2;edge.userData.pulse={speed:.58,phase:1.2};
  const H=1.30,N=72,J=64;
  const point=(t,a)=>{const r=.150*(1-.26*t)*(1+.13*Math.cos(3*a));return [Math.cos(a)*r,t*H,Math.sin(a)*r];};
  const v=[],idx=[];for(let j=0;j<=J;j++)for(let i=0;i<=N;i++)v.push(...point(j/J,i/N*Math.PI*2));for(let j=0;j<J;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,b,a+1,a+1,b,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();k.mesh(g,geo,glass);
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2;k.line(g,Array.from({length:34},(_,j)=>point(j/33,a)),i%24===0?.0028:.0006,i%24===0?edge:metal);}
  for(let j=1;j<101;j++)k.line(g,Array.from({length:72},(_,i)=>point(j/101,i/72*Math.PI*2)),.00055,metal,true);
  for(const t of [.32,.65,.92]){k.line(g,Array.from({length:72},(_,i)=>point(t,i/72*Math.PI*2)),.004,dark,true);for(let j=0;j<3;j++){const a=j*Math.PI*2/3,p=point(t,a+.9);k.box(g,.024,.040,.025,dark,p[0],p[1],p[2]);}}
  // Finished, truncated crown and helipad; never the unbuilt 636 m pointed design.
  k.cyl(g,.11,.118,.012,dark,0,H-.006,0,48);k.cyl(g,.069,.069,.003,metal,0,H+.002,0,48);k.ring(g,.06,.0015,edge,H+.004);
  for(const x of [-.014,.014])k.box(g,.003,.001,.041,edge,x,H+.005);k.box(g,.028,.001,.003,edge,0,H+.005);
  k.cyl(g,.20,.22,.045,metal,0,-.006,0,48);k.cyl(g,.185,.185,.040,glass,0,.03,0,48);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.cyl(g,.003,.003,.05,metal,Math.cos(a)*.184,.034,Math.sin(a)*.184,6);}
  return k.merge(g);
}
