import * as THREE from 'three';
import {plaza,bollards,people,glow} from './shenzhen-forms.js';
import {tree} from './wuhan-architecture.js';
const sag=(x,z)=>2.15-Math.sqrt(2.15**2-x*x-z*z);
const quad=(p,a,b,c,d)=>p.push(...a,...b,...c,...a,...c,...d);
function face(k,g,p,m){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.computeVertexNormals();m.side=THREE.DoubleSide;return k.mesh(g,geo,m);}
function groundBox(k,g,w,d,x,z,top,m){
 const geo=new THREE.BoxGeometry(w,1,d,24,1,18),a=geo.attributes.position;
 for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)>0?top:.006-sag(a.getX(i)+x,a.getZ(i)+z));
 geo.computeVertexNormals();k.mesh(g,geo,m,x,0,z);
}
function lettering(k,g,m){
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#dce0d8';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#4e5854';ctx.font='34px "Microsoft YaHei",sans-serif';ctx.fillText('谢子龙影像艺术馆',24,63);ctx.font='19px sans-serif';ctx.fillText('XIE ZILONG PHOTOGRAPHY MUSEUM',24,107);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.MeshStandardMaterial({map:texture,roughness:.95});sign.userData.xieRigid=true;k.materials.push(sign);k.mesh(g,new THREE.PlaneGeometry(.23,.048),sign,-.325,.485,.147);
}
export function xie(k){
 const g=new THREE.Group(),b=new THREE.Group(),upper=new THREE.Group();g.add(b);b.add(upper);
 const white=k.mat('#dce0d8',.95,.015),joint=k.mat('#c0c7bf',.95),dark=k.mat('#5a6660',.85),glass=k.mat('#4c6563',.43,.12),water=k.mat('#64877e',.38,.12),edge=k.mat('#b8c2b8',.91),warm=glow(k,'#e4d1ac',.28);
 glass.userData.night={color:new THREE.Color('#d4c7a6'),intensity:.36};water.userData.groundSurface=true;water.userData.xieWater=true;
 white.userData.xieConcrete=true;
 groundBox(k,b,1.24,.57,0,-.17,.031,white);
 groundBox(k,b,.98,.42,-.025,.23,.025,edge);k.box(b,.96,.005,.40,water,-.025,.029,.23);
 const earth=k.mat('#a6b199',.98);earth.userData.groundSurface=true;const bank=[];const at=(a,r)=>{const x=Math.cos(a)*.76*r,z=Math.sin(a)*.62*r,t=Math.max(0,(r-.90)/.10);return[x,.024*(1-t)+(.007-sag(x,z))*t,z];};for(let j=0;j<64;j++)for(let i=0;i<20;i++)quad(bank,at(j/64*Math.PI*2,i/20),at((j+1)/64*Math.PI*2,i/20),at((j+1)/64*Math.PI*2,(i+1)/20),at(j/64*Math.PI*2,(i+1)/20));face(k,b,bank,earth);
 // Upper gallery is a level concrete volume. Long windows are recessed into actual slots.
 k.box(upper,.96,.225,.026,white,0,.4175,.13);
 k.box(upper,.96,.028,.026,white,0,.234,.13);
 for(const [x,w]of [[-.435,.09],[-.23,.065],[.385,.19]])k.box(upper,w,.057,.026,white,x,.2765,.13);
 for(const[x,w]of[[-.325,.13],[.05,.48]]){
  k.box(upper,w,.035,.005,glass,x,.2765,.112);
  for(let i=1;i<Math.ceil(w/.037);i++)k.box(upper,.0018,.034,.006,joint,x-w/2+i*.037,.2765,.116);
 }
 // Side entrance cuts back as a tall triangle instead of an applied black triangle.
 const p=[];
quad(p,[-.48,.22,-.41],[-.48,.53,-.41],[-.48,.53,-.38],[-.48,.22,-.38]);
p.push(-.48,.22,-.38,-.48,.53,-.38,-.48,.22,-.36);
quad(p,[-.48,.22,-.04],[-.48,.53,-.38],[-.48,.53,.13],[-.48,.22,.13]);
// Sloping inner plane and side returns create a real triangular reveal.
p.push(-.48,.53,-.38,-.35,.22,-.36,-.35,.22,-.04);
p.push(-.48,.53,-.38,-.48,.22,-.36,-.35,.22,-.36);
p.push(-.48,.53,-.38,-.35,.22,-.04,-.48,.22,-.04);
const door=k.box(upper,.004,.052,.037,glass,-.363,.247,-.21);door.rotation.z=-.38;

 quad(p,[.48,.22,.13],[.48,.53,.13],[.48,.53,-.41],[.48,.22,-.41]);
 quad(p,[-.48,.22,-.41],[.48,.22,-.41],[.48,.53,-.41],[-.48,.53,-.41]);
 face(k,upper,p,white);
 // Hollow roof courtyard, low parapets and a small inner cone are visible from above.
 const roof=k.mat('#d7ddd4',.95);roof.userData.xieRoof=true;
 k.box(upper,.96,.014,.20,roof,0,.526,-.31);k.box(upper,.96,.014,.14,roof,0,.526,.06);
 k.box(upper,.245,.014,.20,roof,-.3575,.526,-.11);k.box(upper,.245,.014,.20,roof,.3575,.526,-.11);
 for(const z of [-.41,.14])k.box(upper,.976,.019,.012,white,0,.541,z);
 for(const x of [-.485,.485])k.box(upper,.012,.019,.55,white,x,.541,-.135);
 k.box(upper,.49,.010,.20,dark,0,.275,-.11);
 for(const z of [-.213,-.007])k.box(upper,.49,.235,.012,white,0,.404,z);
 for(const x of [-.24,.24])k.box(upper,.012,.235,.20,white,x,.404,-.11);
 const cone=k.cyl(upper,.008,.080,.21,white,-.135,.388,-.105,32);cone.scale.z=.72;
 k.box(upper,.27,.008,.035,white,.09,.402,-.105);
 k.box(upper,.038,.16,.13,glass,.18,.394,-.211);
 // Back facade has one tall glazed recess and a modest ground-floor ribbon window.
 k.box(upper,.075,.18,.006,glass,-.28,.418,-.425);
 for(let i=1;i<5;i++)k.box(upper,.077,.002,.007,joint,-.28,.328+i*.035,-.429);
 // Fair-faced concrete formwork joints stay fine and quiet at normal viewing distance.
 for(let row=0;row<5;row++){
  const y=.333+row*.042;k.box(upper,.96,.0006,.001,joint,0,y,.144);k.box(upper,.96,.0006,.001,joint,0,y,-.424);
  k.box(upper,.001,.0006,.54,joint,.481,y,-.135);
 }
 for(let row=0;row<5;row++)for(let col=0;col<18;col++)k.ball(upper,.0007,joint,-.45+col*.052,.348+row*.038,.144);
 lettering(k,upper,white);
 // Recessed gallery below the cantilever and an off-centre pier define the water entrance.
 groundBox(k,b,.15,.29,.31,-.01,.227,white);
 k.box(b,.88,.16,.19,glass,0,.129,-.285);for(let i=0;i<14;i++)k.box(b,.002,.16,.008,joint,-.425+i*.065,.129,-.385);
 for(let i=0;i<14;i++)k.box(b,.002,.16,.008,joint,-.425+i*.065,.129,-.186);
 k.box(b,.91,.014,.22,white,0,.218,-.28);
 for(const[x,w]of[[-.50,.26],[.49,.25]]){
  k.box(b,w,.03,.40,white,x,.184,-.16);k.box(b,w,.025,.40,white,x,.044,-.16);
  k.box(b,w-.02,.115,.008,glass,x,.113,.025);
  for(let i=1;i<6;i++)k.box(b,.002,.114,.009,joint,x-w/2+i*w/6,.113,.031);
 }
 k.box(b,.95,.010,.54,white,0,.219,-.135);
 // The low narrow bridge is clear of the pier and crosses the shallow pool.
 const bridge=k.mat('#d6dace',.93);bridge.userData.xieBridge=true;
 k.box(b,.065,.012,.48,bridge,.10,.046,.20);
 k.box(b,.28,.016,.16,white,.105,.046,-.10);
 // Exterior stair reaches the raised terrace; the curved ramp is a separate route.
 const step=k.mat('#d7dcd2',.94);step.userData.xieStep=true;
 for(let i=0;i<16;i++){const x=-.30+i*.031,y=.056+i*.0105;k.box(b,.032,y-.03,.115,step,x,(y+.03)/2,-.075);}
 k.box(b,.16,.012,.15,white,.215,.214,-.08);
 const stairRail=k.box(b,.50,.035,.007,white,-.067,.156,-.139);stairRail.rotation.z=Math.atan(.168/.496);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.43,.19,-.08),new THREE.Vector3(-.62,.145,-.22),new THREE.Vector3(-.64,.095,-.42),new THREE.Vector3(-.40,.026,-.40)]),ramp=[],outer=[];
 for(let i=0;i<=40;i++){const t=i/40,a=curve.getPoint(t),v=curve.getTangent(t),n=new THREE.Vector3(-v.z,0,v.x).normalize();outer.push([a.x+n.x*.043,a.y+.035,a.z+n.z*.043]);if(i<40){const b=curve.getPoint((i+1)/40),v2=curve.getTangent((i+1)/40),n2=new THREE.Vector3(-v2.z,0,v2.x).normalize();quad(ramp,[a.x-n.x*.045,a.y,a.z-n.z*.045],[a.x+n.x*.045,a.y,a.z+n.z*.045],[b.x+n2.x*.045,b.y,b.z+n2.z*.045],[b.x-n2.x*.045,b.y,b.z-n2.z*.045]);}}
 face(k,b,ramp,white);const parapet=[];
 for(let i=0;i<40;i++)quad(parapet,outer[i],[outer[i][0],outer[i][1]-.035,outer[i][2]],[outer[i+1][0],outer[i+1][1]-.035,outer[i+1][2]],outer[i+1]);face(k,b,parapet,white);
 for(const t of [.16,.45,.75]){const a=curve.getPoint(t),bottom=.008-sag(a.x,a.z);k.cyl(b,.005,.005,a.y-bottom,white,a.x,(a.y+bottom)/2,a.z,10);}
 // A leaning pale plane marks the pool, as in the architect's water-court photographs.
 const sculpture=k.box(b,.14,.15,.012,white,-.37,.096,.29);sculpture.rotation.x=-.34;sculpture.rotation.z=.28;
 k.box(b,.69,.002,.003,warm,-.06,.213,.119);k.box(b,.003,.002,.42,warm,.067,.053,.20);
 const visitors=new THREE.Group();b.add(visitors);visitors.position.y=.039;people(k,visitors,[[.10,.38],[.10,.21]]);
 b.traverse(o=>{if(o.material)o.material.userData.xieRigid=true;});
 const base=plaza(k,g,.76,.62,'#abb59d');base.userData.groundSurface=true;
 for(const[x,z]of[[-.62,.34],[.61,.35]])tree(k,g,x,.014,z,.09);
 bollards(k,g,[[-.59,.47],[.56,.47],[-.58,-.49]],'#ded0b5');
 return k.merge(g);
}
