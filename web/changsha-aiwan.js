import * as THREE from 'three';
import {hill,bollards,glow,skin} from './shenzhen-forms.js';

function crown(k,g,p,w,y,h,lower=false){
 const point=(u,v)=>{const s=Math.floor(u*4)%4,t=u*4%1*2-1,r=lower?.42+v*.58:v;let x,z;if(s===0){x=t*w/2;z=w/2;}else if(s===1){x=w/2;z=-t*w/2;}else if(s===2){x=-t*w/2;z=-w/2;}else{x=-w/2;z=t*w/2;}return [x*r,y+h*(1-r)**1.5+.044*r**6*Math.abs(t)**6,z*r];};
 skin(k,g,point,24,128,p.tile);
 skin(k,g,(u,v)=>{const q=point(u,v);q[1]-=.007;return q;},24,128,p.red);
 k.line(g,Array.from({length:128},(_,i)=>point(i/128,1)),.0034,p.rib,true);
 k.line(g,Array.from({length:128},(_,i)=>{const q=point(i/128,1);q[1]-=.006;return q;}),.0014,p.edge,true);
 for(let i=0;i<112;i++){
  const u=i/112;k.line(g,Array.from({length:21},(_,j)=>{const q=point(u,.015+.985*j/20);q[1]+=.0024;return q;}),.0016,p.rib);
  const q=point(u,1);k.ball(g,.0027,p.rib,q[0],q[1]-.001,q[2]);
 }
 for(let i=0;i<4;i++){
  const u=i/4,q=point(u,1);k.line(g,Array.from({length:18},(_,j)=>{const a=point(u,.02+.98*j/17);a[1]+=.005;return a;}),.0038,p.rib);
  k.line(g,[q,[q[0]*1.025,q[1]+.020,q[2]*1.025],[q[0]*1.014,q[1]+.047,q[2]*1.014]],.003,p.rib);
  k.ball(g,.004,p.ochre,q[0]*1.014,q[1]+.048,q[2]*1.014);
 }
}
function band(k,g,p,w,y,z){
 k.box(g,w,.025,.014,p.blue,0,y,z);
 for(const yy of [-.010,.010])k.box(g,w,.0015,.016,p.gold,0,y+yy,z);
 for(let j=-4;j<=4;j++){const x=j*w/10;for(const s of [-1,1])k.line(g,[[x-.012,y,z+s*.0001+.008],[x,y+.008,z+.008],[x+.012,y,z+.008],[x,y-.008,z+.008]],.0008,p.gold,true);}
 k.box(g,w*.40,.015,.001,p.red,0,y,z+.0085);for(const yy of [-.008,.008])k.box(g,w*.41,.001,.002,p.gold,0,y+yy,z+.009);
 for(const x of [-w*.43,w*.43]){k.box(g,.025,.025,.019,p.blue,x,y-.021,z);k.line(g,[[x-.013,y-.010,z+.01],[x,y-.031,z+.01],[x+.013,y-.010,z+.01]],.0015,p.gold);}
}
function grille(k,g,p,w,h,y,z){
 for(const x of [-w/2,w/2])k.box(g,.006,h,.006,p.wood,x,y,z);
 for(const dy of [-h/2,h/2])k.box(g,w+.008,.006,.006,p.wood,0,y+dy,z);
 for(let i=0;i<7;i++)for(let j=0;j<3;j++){
  const x=(i-3)*w/7,yy=y+(j-1)*h/3,s=w/7*.38;
  k.line(g,[[x-s,yy+s,z],[x,yy+s,z],[x,yy-s,z],[x+s,yy-s,z]],.0015,p.wood);
  k.line(g,[[x-s,yy-s,z],[x-s,yy,z],[x+s,yy,z],[x+s,yy+s,z]],.0015,p.wood);
 }
}
function sign(k,g,z,back=false){
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=512;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#913b36';ctx.fillRect(0,0,512,192);ctx.strokeStyle='#af7953';ctx.lineWidth=5;ctx.strokeRect(6,6,500,180);ctx.fillStyle='#d6b773';ctx.font='108px KaiTi, STKaiti, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('爱晚亭',256,103,468);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,roughness:.88});m.userData.night={color:new THREE.Color('#ffe3b4'),intensity:.14};k.materials.push(m);const o=k.mesh(g,new THREE.PlaneGeometry(.156,.055),m,0,.581,z);if(back)o.rotation.y=Math.PI;
}
function autumn(k,g,x,y,z,s,p,index){
 k.beam(g,[x,y,z],[x+.008,y+s*.78,z],.0037,p.bark,6);
 for(let j=0;j<5;j++){const a=j*2.4,o=k.mesh(g,new THREE.IcosahedronGeometry(s*.31,1),p.leaves[(index+j)%p.leaves.length],x+Math.cos(a)*s*.26,y+s*(.70+(j%3)*.12),z+Math.sin(a)*s*.24);o.scale.set(1,.85,1);}
}
export function aiwan(k){
 const g=new THREE.Group(),b=new THREE.Group(),p={stone:k.mat('#b6bab0',.93),red:k.mat('#853e37',.85),wood:k.mat('#403c35',.9),tile:k.mat('#42776d',.65,.15),rib:k.mat('#639387',.64,.10),blue:k.mat('#78959a',.9),gold:k.mat('#baa574',.86),ochre:k.mat('#a89468',.86),edge:glow(k,'#d8c7a3',.18),bark:k.mat('#75654c',.94),leaves:['#a45737','#be743c','#8f773e','#62805b'].map(c=>k.mat(c,.96))};
 const elevation=hill(k,g,.72,.67,.17,'#758869');g.add(b);p.tile.userData.aiwanRoof=true;
 const y=.18,foundation=new THREE.BoxGeometry(.45,1,.45,18,1,18),a=foundation.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i);a.setY(i,a.getY(i)>0?.1925:elevation(x,z)-(2.15-Math.sqrt(2.15**2-x*x-z*z))+.008);}foundation.computeVertexNormals();k.mesh(b,foundation,p.stone);
 for(const x of [-.175,.175])for(const z of [-.175,.175]){k.box(b,.020,.248,.020,p.stone,x,y+.136,z);k.box(b,.028,.012,.028,p.stone,x,y+.018,z);}
 for(const x of [-.115,.115])for(const z of [-.115,.115]){k.cyl(b,.010,.0105,.322,p.red,x,y+.171,z,14);k.cyl(b,.014,.014,.016,p.stone,x,y+.021,z,12);}
 // Four painted beams remain open below; their geometric decoration is a miniature interpretation.
 for(let i=0;i<4;i++){const f=new THREE.Group();f.rotation.y=i*Math.PI/2;b.add(f);band(k,f,p,.35,.430,.175);
  for(let j=0;j<14;j++)k.box(f,.006,.012,.030,p.red,(j/13-.5)*.37,.452,.174);
  grille(k,f,p,.228,.104,.582,.119);
  for(const x of [-.118,.118])k.box(f,.008,.111,.008,p.red,x,.582,.119);
  if(i%2){for(let j=0;j<=6;j++){const x=(j/6-.5)*.35;k.box(f,.007,.050,.016,p.stone,x,.218,.182);}for(const yy of [.196,.239])k.box(f,.35,.010,.020,p.stone,0,yy,.182);}
 }
 crown(k,b,p,.535,.465,.122,true);crown(k,b,p,.387,.638,.112);
 k.cyl(b,.009,.014,.010,p.rib,0,.755,0,12);for(let i=0;i<5;i++){const o=k.ball(b,.011-i*.0013,p.rib,0,.766+i*.014,0);o.scale.y=.72;}k.cyl(b,0,.004,.024,p.rib,0,.835,0,10);
 // Ceiling coffer and a small floral center sit above the clear central walking space.
 k.box(b,.23,.006,.23,p.blue,0,.506,0);for(const x of [-.10,-.075,.075,.10]){k.box(b,.003,.006,.21,p.gold,x,.502,0);k.box(b,.21,.006,.003,p.gold,0,.502,x);}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,o=k.ball(b,.015,p.gold,Math.sin(a)*.025,.498,Math.cos(a)*.025);o.scale.set(.65,.15,1.3);o.rotation.y=a;}const center=k.ball(b,.012,p.ochre,0,.497,0);center.scale.y=.20;
 sign(k,b,.124);sign(k,b,-.124,true);
 const stairMat=p.stone.clone();k.materials.push(stairMat);stairMat.userData.aiwanSteps=true;
 b.traverse(o=>{if(o.material)o.material.userData.aiwanRigid=true;});
 // The approach climbs from the hillside and reaches the raised pavilion platform.
 const initial=elevation(0,.61)-(2.15-Math.sqrt(2.15**2-.61**2))+.018;
 for(let i=0;i<16;i++){const z=.61-i*.026,sag=2.15-Math.sqrt(2.15**2-z*z),ground=elevation(0,z)-sag,top=Math.max(ground+.018,initial+i/15*(.193-initial)),height=top-ground+.012;k.box(g,.15,height,.027,stairMat,0,top-height/2+sag,z);}
 for(let i=0;i<27;i++){const a=i*2.399,r=.32+(i%5)*.064,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z>.18&&Math.abs(x)<.12)continue;autumn(k,g,x,elevation(x,z),z,.13+(i%3)*.022,p,i);}
 bollards(k,g,[[-.12,.58],[.12,.58],[-.22,.30],[.22,.30]],'#edc389');k.merge(g);
 for(const x of [-.14,.14]){const l=new THREE.PointLight('#efcf9d',0,.5,2);l.userData.nightIntensity=.012;l.position.set(x,.42,.13);g.add(l);}return g;
}
