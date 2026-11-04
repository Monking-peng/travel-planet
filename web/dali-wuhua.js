import * as THREE from 'three';
import {palette,site,paving,grove,roof,lit,sign,archOpening,finish,lattice,lantern} from './dali-kit.js';

export function wuhua(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.72,.61);paving(k,g,p,.61,.51);
 const stone=k.mat('#8c938b',.97),seam=k.mat('#b9bcb0',.96),carved=k.mat('#a5aa9e',.96),blue=lit(k,'#455d7b',.07,'#8dacc1'),green=lit(k,'#587466',.07),cream=k.mat('#b9bba9',.92),wood=k.mat('#493e32',.92),red=k.mat('#82473e',.91),warm=lit(k,'#bba372',.85),tile=k.mat('#626861',.95),pane=lit(k,'#403e32',.18),windowGrid=k.mat('#878875',.94);stone.userData.wuhuaWall=true;
 const floor=k.mat('#a3a699',.95);floor.userData.wuhuaPaving=true;
 k.box(g,.29,.006,1.04,floor,0,.025,0);
 archOpening(k,g,stone,{w:.90,h:.29,opening:.24,rise:.246,d:.46,y:.026});
 const spring=.026+.246-.12;
 for(const z of [-.232,.232]){
  for(let j=1;j<12;j++){const y=.026+j*.024,opening=y<spring?.12:y<spring+.12?Math.sqrt(.12**2-(y-spring)**2):0;
   if(opening){for(const s of [-1,1])k.box(g,.45-opening,.0008,.0008,seam,s*(.45+opening)/2,y,z);}
   else k.box(g,.9,.0008,.0008,seam,0,y,z);
   for(let i=0;i<14;i++){const x=-.45+(i+.5+(j%2)*.5)*.063;if(Math.abs(x)<.448&&Math.abs(x)>opening+.009)k.box(g,.0007,.023,.0008,seam,x,y-.012,z);}
  }
  for(let i=0;i<48;i++){const a=i/47*Math.PI,x=Math.cos(a)*.131,y=spring+Math.sin(a)*.131;const o=k.box(g,.009,.022,.009,carved,x,y,z);o.rotation.z=a-Math.PI/2;}
  for(const x of [-.131,.131])k.box(g,.022,spring-.026,.009,carved,x,(spring+.026)/2,z);
  for(let i=0;i<20;i++){const a=i/19*Math.PI,x=Math.cos(a)*.144,y=spring+Math.sin(a)*.144;const o=k.mesh(g,new THREE.TorusGeometry(.0037,.0007,4,12,Math.PI*1.65),cream,x,y,z+Math.sign(z)*.006);o.rotation.z=a;}
 }
 for(const x of [-.451,.451])for(let j=0;j<12;j++){const y=.032+j*.024;k.box(g,.001,.0007,.46,seam,x,y,0);for(let i=0;i<7;i++)k.box(g,.001,.023,.0007,seam,x,y+.012,-.23+(i+.5+(j%2)*.5)*.06);}
 // Recessed arch lighting remains inside the tunnel rather than closing it.
 for(const z of [-.17,0,.17]){const pts=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI;pts.push([Math.cos(a)*.119,spring+Math.sin(a)*.119,z]);}k.line(g,pts,.0012,warm);}
 k.box(g,.95,.020,.51,carved,0,.326,0);k.box(g,.99,.013,.55,carved,0,.3425,0);
 for(const z of [-.245,.245])for(let i=0;i<15;i++){const x=-.435+i*.062;k.box(g,.014,.022,.030,carved,x,.311,z);k.box(g,.026,.007,.035,carved,x,.322,z);k.box(g,.036,.003,.007,warm,x,.329,z);}
 const balustrade=(parent,w,d,y)=>{
  for(const side of [-1,1])for(const axis of [0,1]){const length=axis?d:w,count=Math.round(length/.065);for(let j=0;j<=count;j++){const at=(j/count-.5)*length,x=axis?side*w/2:at,z=axis?at:side*d/2;k.box(parent,.009,.061,.009,carved,x,y+.0305,z);k.ball(parent,.005,carved,x,y+.064,z);if(j<count){const mid=at+length/count/2;for(const yy of [.009,.030,.047])k.box(parent,axis?.006:length/count-.009,yy===.030?.022:.005,axis?length/count-.009:.006,carved,axis?side*w/2:mid,y+yy,axis?mid:side*d/2);}}}
 };balustrade(g,.96,.52,.349);
 const beamPattern=(parent,w,y,z)=>{
  k.box(parent,w,.026,.017,blue,0,y,z);for(const yy of [-.013,.013])k.box(parent,w,.0015,.018,cream,0,y+yy,z);
  const n=Math.max(3,Math.round(w/.11));for(let i=0;i<n;i++){const x=((i+.5)/n-.5)*w,ww=w/n*.83;k.box(parent,ww,.017,.0015,cream,x,y,z+.010);k.box(parent,ww-.004,.013,.002,red,x,y,z+.011);for(const s of [-1,1])k.line(parent,[[x+s*ww*.42,y-.007,z+.013],[x+s*ww*.33,y,z+.013],[x+s*ww*.42,y+.007,z+.013]],.0008,cream);}
 };
 const brackets=(parent,w,d,y)=>{
  for(const side of [-1,1])for(const axis of [0,1]){const length=axis?d:w,n=Math.round(length/.055);for(let i=0;i<=n;i++){const at=(i/n-.5)*length,x=axis?side*w/2:at,z=axis?at:side*d/2;
    for(let j=0;j<4;j++){const offset=j*.007,xx=x+(axis?side*offset:0),zz=z+(axis?0:side*offset);k.box(parent,.013+j*.008,.005,.015+j*.010,j%2?green:blue,xx,y+j*.010,zz);k.box(parent,.007,.006,.009,cream,xx,y+j*.010-.005,zz);}
   }}
 };
 for(let level=0;level<3;level++){
  const sizes=[[.66,.38,.350,.126,.86,.59,.08],[.51,.31,.568,.106,.70,.50,.071],[.40,.26,.764,.092,.56,.43,.082]][level], [w,d,y,h,rw,rd,rh]=sizes;
  const b=new THREE.Group();g.add(b);b.position.y=y;
  k.box(b,w*.82,h,d*.69,red,0,h/2,0);k.box(b,w+.025,.009,d+.025,wood,0,.0045,0);
  for(const side of [-1,1]){
   const face=new THREE.Group();face.rotation.y=side<0?Math.PI:0;b.add(face);
   for(let i=0;i<5;i++){const x=(i-2)*w*.151;k.box(face,w*.12,h*.74,.004,pane,x,h*.43,d*.35+.003);lattice(k,face,x,h*.43,d*.35+.006,w*.115,h*.72,windowGrid);}
   for(let i=0;i<=4;i++){const x=(i/4-.5)*w;k.cyl(face,.0057,.0072,h,red,x,h/2,d*.49,12);for(const yy of [h*.21,h*.84]){k.cyl(face,.0073,.0073,.015,blue,x,yy,d*.49,12);k.box(face,.009,.004,.001,cream,x,yy,d*.49+.008);}}
   beamPattern(face,w+.025,h-.010,d*.49);
   if(level<2)for(const i of [0,2,4])lantern(k,face,p,(i/4-.5)*w,h-.027,d*.61,.011);
  }
  for(const side of [-1,1]){const face=new THREE.Group();face.rotation.y=side*Math.PI/2;b.add(face);beamPattern(face,d,h-.010,w*.50);for(const z of [-d*.25,0,d*.25])k.cyl(b,.005,.006,h,red,side*w*.50,h/2,z,10);}
  brackets(b,w,d,h+.005);
  for(const side of [-1,1]){k.box(b,w+.035,.0025,.003,warm,0,h+.020,side*(d/2+.014));k.box(b,.003,.0025,d+.035,warm,side*(w/2+.014),h+.020,0);}
  for(const side of [-1,1])for(let j=0;j<3;j++){const z=(j-1)*d*.21;const q=new THREE.Group();q.rotation.y=side*Math.PI/2;b.add(q);k.box(q,d*.16,h*.60,.003,pane,z,h*.44,w*.412);lattice(k,q,z,h*.44,w*.416,d*.15,h*.59,windowGrid);}

  const rp={...p,tile,pale:carved};roof(k,b,rp,rw,rd,rh,h+.043);
  // Rafters and layered fascia show the depth of the overhanging roof.
  for(const side of [-1,1])for(let i=0;i<Math.round(rw/.015);i++){const x=(i/(Math.round(rw/.015)-1)-.5)*rw*.94,corner=Math.abs(x/(rw/2))**8,yy=h+.043+.035*corner;k.beam(b,[x,yy-.006,side*rd*.43],[x,yy+.001,side*rd*.50],.0016,wood,5);}
 }
 // Pyramidal crown and vase-shaped finial visible in the real roof silhouette.
 const top=.979;const profile=[[.010,0],[.014,.006],[.011,.015],[.015,.022],[.019,.039],[.017,.052],[.009,.056],[0,.058]];
 k.mesh(g,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,top+y)),24),tile);k.cyl(g,.001,.0015,.011,carved,0,top+.0635,0,8);
 sign(k,g,'樓華五',.17,.053,0,.680,.191,{background:'#292d28',color:'#c7b27d'});
 sign(k,g,'理大',.125,.048,0,.303,.246,{background:'#30342f',color:'#b9a47a'});
 for(const side of [-1,1])for(let j=0;j<3;j++){const x=side*.19,z=.33+j*.062;k.cyl(g,.018,.012,.014,p.pale,x,.034,z,12);for(let n=0;n<7;n++){const a=n*2.4;k.ball(g,.006,k.mat(n%2?'#a3a06f':'#bc8d9e',.93),x+Math.sin(a)*.013,.046,z+Math.cos(a)*.013);}}
 grove(k,g,ground,[[-.55,.17,.21],[.55,-.22,.19]]);
 return finish(k,g,{lamps:[[-.31,.024,.42],[.31,.024,.42]],visitors:[[-.055,.029,.32],[.032,.029,.19],[.085,.029,.40],[-.26,.349,.21],[.24,.349,.20]]});
}
