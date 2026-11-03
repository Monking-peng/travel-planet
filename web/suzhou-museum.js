import * as THREE from 'three';
import {palette,site,disc,bamboo,sign,finish,lit} from './suzhou-kit.js';

function face(k,g,points,mat){const geo=new THREE.BufferGeometry();const pos=[];for(let i=1;i<points.length-1;i++)pos.push(...points[0],...points[i],...points[i+1]);geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();mat.side=THREE.DoubleSide;return k.mesh(g,geo,mat);}
function stoneRoof(k){const m=k.mat('#5e6260',.88,.03);m.onBeforeCompile=s=>{s.vertexShader='varying vec3 museumRoof;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmuseumRoof=position;');s.fragmentShader='varying vec3 museumRoof;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 diamond=vec2(museumRoof.x+museumRoof.z,museumRoof.x-museumRoof.z)*95.0;
 vec2 gap=fract(diamond);float joint=step(.055,gap.x)*step(.055,gap.y);
 float grain=fract(sin(dot(floor(diamond),vec2(12.98,78.23)))*43758.5);
 diffuseColor.rgb*=mix(.78,.96+grain*.05,joint);`);};m.customProgramCacheKey=()=> 'suzhou-slate-diamond-v1';return m;}
function strip(k,g,a,b,w,h,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av),o=k.box(g,w,h,d.length(),mat,...av.add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d.normalize());return o;}
function hipped(k,g,p,x,z,w,d,y,h,glazed=false){const ridge=w*.25,pts=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-ridge,h,0],[ridge,h,0]].map(v=>[v[0]+x,v[1]+y,v[2]+z]);
 for(const ids of [[0,4,5,1],[1,5,2],[2,5,4,3],[3,4,0]])face(k,g,ids.map(i=>pts[i]),glazed?p.glass:p.roof);
 for(const [a,b]of [[0,1],[1,2],[2,3],[3,0],[4,5],[0,4],[1,5],[2,5],[3,4]])strip(k,g,pts[a],pts[b],glazed?.002:.006,.003,p.edge);
 if(glazed)for(const side of [-1,1])for(let i=1;i<8;i++){const xx=x+(i/8-.5)*w*.95;strip(k,g,[xx,y+.001,z+side*d/2],[THREE.MathUtils.clamp(xx,x-ridge,x+ridge),y+h+.001,z],.0018,.002,p.frame);}
}
function aperture(k,g,p,{x=0,z=0,y=.035,w=.12,h=.10,rotation=0}={}){const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;g.add(group);k.box(group,w+.012,h+.012,.007,p.edge,0,h/2,0);k.box(group,w,h,.008,p.glass,0,h/2,.001);for(let i=0;i<=4;i++)k.box(group,.0018,h,.009,p.frame,(i/4-.5)*w,h/2,.003);k.box(group,w,.002,.009,p.frame,0,h*.70,.003);}
function diamond(k,g,p,x,y,z,size=.018,rotation=0){const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;g.add(group);const trim=k.box(group,size,size,.006,p.edge);trim.rotation.z=Math.PI/4;const glass=k.box(group,size*.68,size*.68,.007,p.glass,0,0,.001);glass.rotation.z=Math.PI/4;}
function wall(k,g,p,w,h,d,x,y,z){k.box(g,w,h,d,p.wall,x,y+h/2,z);k.box(g,w+.002,.009,d+.002,p.edge,x,y+.005,z);k.box(g,w+.004,.006,d+.004,p.edge,x,y+h,z);for(const sx of [-1,1])for(const sz of [-1,1])k.box(g,.006,h,.006,p.edge,x+sx*w/2,y+h/2,z+sz*d/2);}
function lantern(k,g,p,x,z,w,d,y,h=.075){
 const t=.006;k.box(g,w,h,t,p.wall,x,y+h/2,z-d/2);k.box(g,w,h,t,p.wall,x,y+h/2,z+d/2);for(const side of [-1,1])k.box(g,t,h,d,p.wall,x+side*w/2,y+h/2,z);
 for(const side of [-1,1]){k.box(g,w+.004,.006,.008,p.edge,x,y+h,z+side*d/2);k.box(g,.008,.006,d+.004,p.edge,x+side*w/2,y+h,z);diamond(k,g,p,x,y+h*.51,z+side*(d/2+.004),.016,side===1?0:Math.PI);}
 hipped(k,g,p,x,z,w*.90,d*.90,y+.014,.025,true);
}
function pavilion(k,g,p,{x,z,w,d,h=.16,lanternTop=false}){
 wall(k,g,p,w,h,d,x,.027,z);hipped(k,g,p,x,z,w+.012,d+.012,.027+h,.065);
 for(const side of [-1,1])aperture(k,g,p,{x,z:z+side*(d/2+.005),y:.046,w:w*.67,h:h*.57,rotation:side<0?Math.PI:0});
 if(lanternTop)lantern(k,g,p,x,z,w*.46,d*.44,.027+h+.040,.065);
}
function octagon(k,g,p,x,z,r,y,h){const vertices=Array.from({length:8},(_,i)=>{const a=Math.PI/8+i*Math.PI/4;return [x+Math.sin(a)*r,z+Math.cos(a)*r];});
 for(let i=0;i<8;i++){const [ax,az]=vertices[i],[bx,bz]=vertices[(i+1)%8],mid=[(ax+bx)/2,(az+bz)/2],len=Math.hypot(bx-ax,bz-az),angle=Math.atan2(bx-ax,bz-az);const panel=k.box(g,.006,i%2?.026:h,len,p.wall,mid[0],i%2?y+h-.013:y+h/2,mid[1]);panel.rotation.y=angle;k.box(g,.006,h,.006,p.edge,ax,y+h/2,az);strip(k,g,[ax,y+h,az],[bx,y+h,bz],.007,.005,p.edge);strip(k,g,[ax,y+.006,az],[bx,y+.006,bz],.008,.010,p.edge);
  if(i%2===1)aperture(k,g,p,{x:mid[0]+(mid[0]-x)*.025,z:mid[1]+(mid[1]-z)*.025,y:y+.014,w:len*.86,h:h*.82,rotation:Math.atan2(mid[0]-x,mid[1]-z)});
 }
 const outer=vertices.map(a=>[a[0],y+h,a[1]]),inner=vertices.map(a=>[x+(a[0]-x)*.48,y+h+.075,z+(a[1]-z)*.48]);
 for(let i=0;i<8;i++){const j=(i+1)%8;face(k,g,[outer[i],inner[i],inner[j],outer[j]],p.roof);strip(k,g,outer[i],inner[i],.005,.003,p.edge);strip(k,g,inner[i],inner[j],.005,.003,p.edge);}
 lantern(k,g,p,x,z,r*.78,r*.78,y+h+.072,.065);
}
function glazedLink(k,g,p,x,z,w,d,y=.145){hipped(k,g,p,x,z,w,d,y,.029,true);for(const side of [-1,1])for(let i=0;i<=6;i++)k.box(g,.003,y-.027,.003,p.frame,x+(i/6-.5)*w,(y+.027)/2,z+side*d/2);}
function bridge(k,g,p,points,w=.036){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];strip(k,g,[a[0],.043,a[1]],[b[0],.043,b[1]],w,.010,p.pale);const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=dz/len,nz=-dx/len;for(const side of [-1,1]){const off=side*w*.47;strip(k,g,[a[0]+nx*off,.058,a[1]+nz*off],[b[0]+nx*off,.058,b[1]+nz*off],.0018,.002,p.frame);const n=Math.max(2,Math.ceil(len/.035));for(let j=0;j<=n;j++)k.box(g,.0014,.014,.0014,p.frame,a[0]+dx*j/n+nx*off,.051,a[1]+dz*j/n+nz*off);}}
}
function mountain(k,g,p){
 const shapes=[[-.41,.028,[[-.06,0],[-.049,.023],[-.02,.046],[.005,.040],[.019,.021],[.058,0]]],[-.31,.031,[[-.065,0],[-.041,.041],[-.028,.088],[-.005,.071],[.013,.039],[.056,.015],[.063,0]]],[-.22,.045,[[-.065,0],[-.052,.039],[-.023,.130],[-.012,.145],[.009,.113],[.022,.069],[.070,.008],[.070,0]]],[-.10,.027,[[-.070,0],[-.034,.039],[-.010,.078],[.019,.095],[.038,.063],[.074,0]]],[.015,.032,[[-.070,0],[-.040,.049],[-.015,.069],[.014,.066],[.029,.035],[.064,0]]],[.12,.040,[[-.060,0],[-.036,.019],[-.007,.100],[.017,.082],[.025,.048],[.070,0]]],[.235,.026,[[-.064,0],[-.033,.043],[-.017,.071],[.004,.060],[.025,.021],[.066,0]]],[.34,.032,[[-.060,0],[-.018,.027],[.004,.049],[.029,.028],[.063,0]]]];
 const colors=['#797c72','#94978b','#696f65','#8b8f82'];for(let i=0;i<shapes.length;i++){const [x,zShift,points]=shapes[i],shape=new THREE.Shape();points.forEach(([a,b],n)=>n?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();const mat=k.mat(colors[i%colors.length],.98);mat.userData.night={color:new THREE.Color('#c9c7b8'),intensity:.035};const mesh=k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.016,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1}),mat,x,.034,-.403+zShift);mesh.rotation.y=(i%3-1)*.13;for(let j=0;j<4;j++){const a=(j-1.5)*.014;k.beam(g,[x+a,.041,-.382+zShift],[x+a*.5,.067+.011*(i%3),-.380+zShift],.0006,p.rockVein);}}
}
export function museum(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.72,.70);p.wall.color.set('#e2e2d9');p.edge=k.mat('#404a49',.85,.04);p.frame=k.mat('#697675',.68,.08);p.roof=stoneRoof(k);p.glass=lit(k,'#758d8b',.23);p.glass.roughness=.31;p.glass.metalness=.16;p.rockVein=k.mat('#a7aaa0',.97);p.water.color.set('#3e6659');p.water.roughness=.25;p.water.metalness=.24;p.water.userData.water=true;
 for(const m of [p.wall,p.edge,p.roof])m.userData.museumOpaque=true;disc(k,g,.62,.59,.021,p.pale);
 k.box(g,.86,.008,.48,p.water,0,.027,-.147);for(const x of [-.435,.435])k.box(g,.011,.023,.50,p.edge,x,.030,-.147);
 wall(k,g,p,.99,.203,.020,0,.028,-.421);mountain(k,g,p);
 bridge(k,g,p,[[-.43,.08],[-.25,.08],[-.17,-.044],[.17,-.044],[.25,-.18],[.43,-.18]]);
 bridge(k,g,p,[[-.17,-.044],[-.17,.045]]);k.cyl(g,.065,.065,.012,p.pale,-.17,.043,.073,8);
 // Small groups of lily pads retain the wide open reflecting pool.
 const lily=k.mat('#67845d',.95);for(const [cx,cz,n]of [[-.29,-.22,23],[.13,-.29,26],[.29,.015,19]])for(let i=0;i<n;i++){const a=i*2.399,r=.046*Math.sqrt((i+.5)/n),o=k.mesh(g,new THREE.CircleGeometry(.0037+(i%3)*.0007,7),lily,cx+Math.sin(a)*r,.032,cz+Math.cos(a)*r);o.rotation.x=-Math.PI/2;}
 // Two galleries and their glazed links are parts of the museum, not filler houses.
 for(const side of [-1,1]){pavilion(k,g,p,{x:side*.49,z:-.245,w:.17,d:.27,h:.17});pavilion(k,g,p,{x:side*.49,z:.135,w:.17,d:.24,h:.15,lanternTop:true});const link=new THREE.Group();link.position.set(side*.49,0,-.045);link.rotation.y=Math.PI/2;g.add(link);glazedLink(k,link,p,0,0,.13,.12,.15);}
 octagon(k,g,p,0,.275,.202,.028,.196);
 for(const side of [-1,1]){pavilion(k,g,p,{x:side*.31,z:.405,w:.19,d:.15,h:.112,lanternTop:true});glazedLink(k,g,p,side*.30,.255,.23,.065,.13);wall(k,g,p,.23,.10,.010,side*.31,.027,.535);}
 // Open entrance gate and glazed canopy preserve the view toward the central hall.
 for(const side of [-1,1])wall(k,g,p,.17,.135,.018,side*.205,.027,.564);
 for(const x of [-.122,.122])k.box(g,.013,.166,.025,p.edge,x,.110,.564);k.box(g,.256,.013,.026,p.edge,0,.192,.564);hipped(k,g,p,0,.564,.292,.10,.201,.026,true);hipped(k,g,p,0,.564,.244,.082,.243,.018,true);
 sign(k,g,'苏州博物馆',.105,.022,.205,.10,.576,{background:'#e2e2d9',color:'#303d3b'});
 const court=new THREE.Group();g.add(court);court.position.z=.493;k.box(court,.22,.003,.11,p.pale,0,.025,0);for(let i=-4;i<=4;i++)k.box(court,.22,.001,.0008,p.stone,0,.027,i*.011);
 for(const side of [-1,1]){bamboo(k,g,side*.58,-.39,.16);bamboo(k,g,side*.59,.25,.14);}
 finish(k,g,{lamps:[[-.37,.028,.47],[.37,.028,.47]],visitors:[[-.19,.050,.075],[.03,.050,-.044],[.04,.027,.52]]});
 for(const x of [-.32,.32]){const light=new THREE.SpotLight('#e8e4d1',0,1.0,.7,.8,2);light.position.set(x,.14,-.04);light.target.position.set(x,.14,-.40);light.userData.nightIntensity=.075;g.add(light,light.target);}return g;
}
