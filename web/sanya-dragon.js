import * as THREE from 'three';
import {palette,site,skin,lit,finish,TAU} from './sanya-kit.js';

const bridgePoint=t=>[(-.50+t)*1.12,.385-.126*Math.sin(Math.PI*t)+t*.035,.015-.055*t];
export function dragon(k){
 const g=new THREE.Group(),p=palette(k),base=site(k,g,p),land=k.mat('#52714a',.99);land.userData.landscape=true;land.userData.dragonGround=true;
 const slope=(x,z)=>base(x,z)+(.49*Math.exp(-(((x+.50)/.25)**2)-(z/.43)**2)+.535*Math.exp(-(((x-.50)/.25)**2)-((z+.055)/.40)**2))*(1-THREE.MathUtils.smoothstep(Math.hypot(x/.72,z/.55),.70,1));
 const ground=(x,z)=>{let y=slope(x,z);for(const t of [0,1]){const q=bridgePoint(t),blend=Math.exp(-(((x-q[0])/.074)**4)-((z-q[2])/.075)**4);y=THREE.MathUtils.lerp(y,q[1]-.007,blend);}return y;};
 skin(k,g,(u,v)=>{const a=u*TAU,x=Math.cos(a)*.72*v,z=Math.sin(a)*.55*v;return [x,ground(x,z),z];},48,144,land);
 // The valley stays physically lower than the bridge; clustered canopy follows each slope.
 const leaves=['#3e613e','#526c3d','#617c43','#426e47','#6b804d'].map(c=>{const m=k.mat(c,.98);m.userData.landscape=true;m.userData.dragonCanopy=true;return m;});
 const bark=k.mat('#675a40',.99),leafGeometry=new THREE.IcosahedronGeometry(1,1);
 for(let i=0;i<250;i++){
  const a=i*2.399963,r=Math.sqrt((i+.5)/250),x=Math.cos(a)*.675*r,z=Math.sin(a)*.505*r;
  const bridgeZ=.015-(x+.56)/1.12*.055;
  if(Math.abs(z-bridgeZ)<.155)continue;
  const y=ground(x,z),size=.038+.020*(.5+.5*Math.sin(i*9.13)),height=.060+.045*(.5+.5*Math.cos(i*3.7));
  if(Math.abs(x)<.22&&y+height+size>.205)continue;
  const trunkTop=[x+.007*Math.sin(i),y+height*.68,z];k.beam(g,[x,y-.003,z],trunkTop,.0032,bark);
  for(let j=0;j<4;j++){
   const angle=j*2.4+i,rr=j===0?0:size*.60,cx=x+Math.cos(angle)*rr,cz=z+Math.sin(angle)*rr,cy=y+height-(j===0?0:.012);
   k.beam(g,trunkTop,[cx,cy-.01,cz],.0018,bark);
   const m=k.mesh(g,leafGeometry.clone(),leaves[(i+j)%leaves.length],cx,cy,cz);m.scale.set(size*(j===0?1.2:.9),size*.69,size);m.rotation.y=angle;
  }
 }
 leafGeometry.dispose();
 const timber=k.mat('#8b785f',.98);timber.userData.suspensionDeck=true;
 const support=k.mat('#6e6656',.95),rope=k.mat('#b1aa8c',.95),wire=k.mat('#9a9b87',.82,.15);
 const ropeGlow=lit(k,'#b1aa8c',.07,null,'#e5cda1');
 for(let i=0;i<76;i++){
  const t=(i+.5)/76,q=bridgePoint(t),next=bridgePoint(Math.min(1,t+.002)),m=k.box(g,1.12/76-.0006,.006,.097,timber,...q);m.rotation.z=Math.atan2(next[1]-q[1],next[0]-q[0]);
  if(i%4===0)for(const side of [-1,1])k.ball(g,.0013,wire,q[0],q[1]+.0034,q[2]+side*.039);
 }
 for(const side of [-1,1]){
  const points=(height,offset=.055)=>Array.from({length:97},(_,i)=>{const q=bridgePoint(i/96);return[q[0],q[1]+height,q[2]+side*offset];});
  k.line(g,points(-.008),.0038,support);k.line(g,points(.073),.0028,ropeGlow);k.line(g,points(.104,.060),.0013,wire);
  // Three staggered diamond rows describe a fine safety net rather than one oversized zigzag.
  for(let i=0;i<76;i++)for(let row=0;row<3;row++){
   const a=bridgePoint(i/76),b=bridgePoint((i+1)/76),middle=bridgePoint((i+.5)/76),low=.003+row*.023,high=low+.023;
   k.line(g,[[a[0],a[1]+low+.0115,a[2]+side*.055],[middle[0],middle[1]+high,middle[2]+side*.055],[b[0],b[1]+low+.0115,b[2]+side*.055],[middle[0],middle[1]+low,middle[2]+side*.055]],.00055,rope,true);
  }
  for(let i=0;i<=38;i++){const q=bridgePoint(i/38);k.beam(g,[q[0],q[1]-.006,q[2]+side*.055],[q[0],q[1]+.105,q[2]+side*.060],.0009,wire);}
 }
 const path=k.mat('#b7ad90',.99);path.userData.dragonApproach=true;
 for(const t of [0,1]){
  const q=bridgePoint(t),dir=t===0?-1:1;
  k.box(g,.068,.018,.132,p.stone,q[0],q[1]-.012,q[2]);
  for(const side of [-1,1]){
   k.cyl(g,.006,.008,.137,p.wood,q[0],q[1]+.041,q[2]+side*.071,12);
   k.ball(g,.007,p.stone,q[0],q[1]+.112,q[2]+side*.071);
   const anchor=[q[0]+dir*.030,ground(q[0]+dir*.030,q[2]+side*.092)+.006,q[2]+side*.092];
   k.beam(g,[q[0],q[1]+.098,q[2]+side*.065],anchor,.0023,wire);
   k.box(g,.027,.014,.026,p.stone,anchor[0],anchor[1]-.006,anchor[2]);
  }
  // The last plank meets a solid sloped landing without a vertical floating slab.
  skin(k,g,(u,v)=>{const x=q[0]+dir*(u*.033),z=q[2]+(v-.5)*.120,blend=THREE.MathUtils.smoothstep(u,0,.5);return[x,THREE.MathUtils.lerp(q[1]+.003,ground(x,z)+.008,blend),z];},8,20,path);
 }
 // A compact stone landing turns into the slope, without a steep plank ramp down the outer hill.
 for(const t of [0,1]){const q=bridgePoint(t);for(let i=1;i<=7;i++){const z=q[2]-.045-i*.014,x=q[0]-(t===0?-1:1)*.008*i,y=ground(x,z);k.box(g,.074,.010,.018,path,x,y+.005,z);}}
 const visitors=[.10,.19,.25,.38,.49,.64,.71,.84,.92].map((t,i)=>{const q=bridgePoint(t);return[q[0],q[1]+.004,q[2]+(i%2?-.020:.020)];});
 return finish(k,g,{visitors});
}
