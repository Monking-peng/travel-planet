import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {palette,site,skin,disc,band,palms,lit,finish,TAU} from './sanya-kit.js';
export const CDF_CENTERS=[-.295,.295];
export function cdfOutline(cx,a){const r=.225+.070*Math.cos(2*a);return [cx+Math.sin(a)*r,Math.cos(a)*r*1.18];}
export const cdfRoofHeight=z=>.205+.018*Math.cos(z*8);
export function cdfCanopy(u,v,side){const x=(u-.5)*(.36+.10*v),t=Math.sin(u*Math.PI),z=side*(.13+.18*v+.010*Math.cos(u*TAU));return [x,cdfRoofHeight(z)+.118*t+.007*Math.sin(v*Math.PI)*t,z];}
export function dutyfree(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,p);disc(k,g,.70,.54,.022,p.paving);p.paving.userData.cdfCourt=true;
 const trim=lit(k,'#cad9dd',.44,.3,'#72b9e3'),glass=k.mat('#668983',.47,.13),roof=k.mat('#dfe4df',.83,.03),frame=k.mat('#abbdb5',.85,.02),dark=k.mat('#5d7273',.85,.04),warm=lit(k,'#849287',.44,.9,'#ead5a4');glass.userData.night={color:new THREE.Color('#e6cc9c'),intensity:.22};roof.side=THREE.DoubleSide;roof.userData.cdfRoof=true;glass.userData.cdfFacade=true;
 const blue=lit(k,'#95b0b8',.92,.6,'#569edc');
 for(const cx of CDF_CENTERS){
  const rim=Array.from({length:160},(_,i)=>cdfOutline(cx,i/160*TAU)),shape=new THREE.Shape();shape.moveTo(...rim[0]);for(const q of rim.slice(1))shape.lineTo(...q);shape.closePath();
  for(const z of [-.17,.17]){const hole=new THREE.Path();hole.absellipse(cx,z,.091,.110,0,TAU,true);shape.holes.push(hole);}
  const flat=new THREE.ShapeGeometry(shape,80),geo=new TessellateModifier(.025,9).modify(flat),a=geo.attributes.position;flat.dispose();for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getY(i);a.setXYZ(i,x,cdfRoofHeight(z),z);}geo.computeVertexNormals();k.mesh(g,geo,roof);
  skin(k,g,(u,v)=>{const [x,z]=cdfOutline(cx,u*TAU);return [x,.025+v*(cdfRoofHeight(z)-.030),z];},6,160,glass);
  for(let j=0;j<8;j++)k.line(g,rim.map(([x,z])=>[x,.043+j*.021,z]),.0009,frame,true);
  for(const dy of [-.016,-.008,0])k.line(g,rim.map(([x,z])=>[x,cdfRoofHeight(z)+dy,z]),.0017,dy===0?trim:frame,true);
  for(let j=0;j<108;j++){
   const aa=j/108*TAU,[x,z]=cdfOutline(cx,aa),[nx,nz]=cdfOutline(cx,aa+.001),angle=Math.atan2(nz-z,nx-x);
   k.beam(g,[x,.025,z],[x,cdfRoofHeight(z)-.008,z],.0009,frame);
   for(let level=0;level<7;level++)if(Math.sin(j*9.4+level*4.9)>.30){const o=k.box(g,.008,.014,.001,warm,x,.050+level*.021,z);o.rotation.y=-angle;}
   for(let row=0;row<3;row++){const q=k.mesh(g,new THREE.SphereGeometry(.0021,5,4),blue,x,cdfRoofHeight(z)-.003-row*.006,z);q.scale.y=.75;}
  }
  // Four shallow glazed domes retain a dense diagonal panel structure.
  for(const z of [-.17,.17]){
   const domeGlass=k.mat('#789c98',.47,.10);domeGlass.side=THREE.DoubleSide;domeGlass.userData.cdfDome=true;domeGlass.userData.night={color:new THREE.Color('#dce2b9'),intensity:.30};
   const pt=(u,v)=>{const aa=u*TAU;return [cx+Math.cos(aa)*.091*v,.210+.036*Math.sqrt(Math.max(0,1-v*v)),z+Math.sin(aa)*.110*v];};skin(k,g,pt,15,80,domeGlass);
   for(let row=0;row<7;row++)for(let j=0;j<32;j++){
    const u0=(j+(row%2)*.5)/32,u1=u0+1/32,v0=.08+row*.12,v1=v0+.12;
    if((j+row*3)%7<2)skin(k,g,(u,v)=>{const q=pt(u0+(u1-u0)*u,v0+(v1-v0)*v);q[1]+=.001;return q;},1,1,roof);
    const q=[pt(u0,v0),pt(u0+1/64,v1),pt(u1,v0)];q.forEach(p=>p[1]+=.0015);k.line(g,q,.00065,frame);
   }
   for(const rr of [.32,.56,.80,1])k.line(g,Array.from({length:81},(_,i)=>pt(i/80,rr)),.0007,frame,true);
   band(k,g,a=>[cx+Math.cos(a)*.092,.211,z+Math.sin(a)*.111],trim,.0018);
  }
 }
 // High front and rear arch canopies make one flowing ring, leaving the central court open.
 for(const side of [-1,1]){
  const mat=roof.clone();k.materials.push(mat);mat.userData={cdfCanopy:true};skin(k,g,(u,v)=>cdfCanopy(u,v,side),24,72,mat);
  for(const v of [0,.16,.84,1])k.line(g,Array.from({length:73},(_,i)=>cdfCanopy(i/72,v,side)),.0015,trim);
  for(let j=1;j<36;j++){const u=j/36;for(let row=0;row<5;row++){const v=.18+row*.16,q=cdfCanopy(u,v,side);q[1]+=.002;k.mesh(g,new THREE.SphereGeometry(.0024,5,4),blue,...q);}}
  for(const x of [-.17,.17]){const target=cdfCanopy((x/.61+.5),.28,side);k.beam(g,[x*.82,.025,side*.21],target,.0038,p.white);}
 }
 // Paving remains open below the canopy and connects to the central plaza.
 for(const side of [-1,1]){k.box(g,.27,.006,.34,p.paving,0,.025,side*.31);for(const x of [-.10,.10])k.line(g,[[x,.029,side*.16],[x,.029,side*.47]],.001,frame);}
 for(const x of [-.19,.19]){const zz=.03; k.box(g,.012,.115,.16,dark,x,.085,zz);for(const z of [-.01,.04,.09])k.box(g,.002,.10,.002,p.pale,x+(x>0?-.008:.008),.084,z);}
 palms(k,g,p,ground,[[-.59,-.32,.19],[.59,-.32,.20],[-.59,.32,.19],[.59,.32,.20]]);
 return finish(k,g,{lamps:[[-.12,.029,.45],[.12,.029,.45],[-.12,.029,-.45],[.12,.029,-.45]],visitors:[[-.055,.029,.35],[.065,.029,.29],[-.06,.024,.04],[.07,.024,-.035]]});
}
