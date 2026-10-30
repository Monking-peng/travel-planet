import * as THREE from 'three';
import {tree} from './wuhan-architecture.js';
import {plaza,bollards,people,glow} from './shenzhen-forms.js';

function pointed(k,g,x,y,z,w,h,d,mat){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(-w/2,h*.65);shape.quadraticCurveTo(-w*.42,h*.86,0,h);shape.quadraticCurveTo(w*.42,h*.86,w/2,h*.65);shape.lineTo(w/2,0);shape.closePath();return k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:12}),mat,x,y,z);}
function cross(k,g,x,y,z,m,s=1){k.box(g,.004*s,.055*s,.004*s,m,x,y,z);k.box(g,.030*s,.004*s,.004*s,m,x,y+.011*s,z);}
export function cathedral(k){
  const g=new THREE.Group(),stone=plaza(k,g,.65,.68),wall=k.mat('#b2afa1',.90,.06,'#e8b97f'),edge=k.mat('#cec9b9',.85,.06,'#ead2ab'),shadow=k.mat('#5c6969'),wood=k.mat('#754b43'),tile=k.mat('#76796a',.88),stained=k.mat('#54484b',.42,.16,'#e0b99e'),light=glow(k,'#e0c7a0',.85);stained.userData.night.intensity=.24;stoneWash(wall);edge.userData.night.intensity=.28;
  roofJoints(tile);
  k.box(g,.72,.028,1.08,stone,0,.031,0);k.box(g,.49,.40,.90,wall,0,.245,-.04);
  // Long gabled nave and two independent octagonal spires.
  const s=new THREE.Shape();s.moveTo(-.265,0);s.lineTo(.265,0);s.lineTo(0,.22);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.93,bevelEnabled:false}),tile,0,.445,-.51);
  for(const x of [-.30,.30]){
    k.box(g,.20,.69,.25,wall,x,.393,.38);
    for(const y of [.23,.48,.72]){k.box(g,.226,.014,.27,edge,x,y,.38);k.box(g,.218,.002,.003,light,x,y+.007,.517);}
    for(const dx of [-.086,.086]){k.box(g,.020,.71,.03,edge,x+dx,.40,.518);for(const y of [.26,.51,.73])k.cyl(g,0,.018,.065,edge,x+dx,y+.030,.518,4).rotation.y=Math.PI/4;}
    for(const y of [.30,.54]){pointed(k,g,x,y,.510,.12,.16,.003,shadow);pointed(k,g,x,y+.012,.515,.093,.135,.003,stained);for(const dx of [-.025,.025])k.box(g,.003,.13,.005,edge,x+dx,y+.074,.520);}
    k.cyl(g,.075,.104,.08,wall,x,.77,.38,8);k.cyl(g,0,.098,.34,wall,x,.976,.38,8);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;k.beam(g,[x+Math.cos(a)*.098,.807,.38+Math.sin(a)*.098],[x,1.146,.38],.002,edge,4);}
    cross(k,g,x,1.173,.38,shadow,.75);
  }
  k.box(g,.43,.43,.035,wall,0,.267,.493);
  const face=new THREE.Shape();face.moveTo(-.23,0);face.lineTo(.23,0);face.lineTo(0,.18);face.closePath();k.mesh(g,new THREE.ExtrudeGeometry(face,{depth:.035,bevelEnabled:false}),wall,0,.481,.475);cross(k,g,0,.689,.494,edge,.8);
  const rose=k.mesh(g,new THREE.CircleGeometry(.099,64),stained,0,.399,.515);k.mesh(g,new THREE.TorusGeometry(.103,.007,6,64),edge,0,.399,.521);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;k.beam(g,[0,.399,.526],[Math.cos(a)*.096,.399+Math.sin(a)*.096,.526],.002,edge,4);const petal=k.mesh(g,new THREE.TorusGeometry(.018,.0015,4,24),edge,Math.cos(a)*.065,.399+Math.sin(a)*.065,.528);petal.scale.set(.7,1,1);petal.rotation.z=a;}
  k.mesh(g,new THREE.TorusGeometry(.031,.002,4,40),edge,0,.399,.527);
  for(const x of [-.30,0,.30]){const w=x===0?.16:.116,h=x===0?.24:.20;pointed(k,g,x,.047,.525,w+.034,h+.025,.012,edge);pointed(k,g,x,.047,.539,w,h,.003,shadow);k.box(g,w*.88,h*.59,.004,wood,x,.047+h*.295,.545);k.box(g,.003,h*.59,.005,edge,x,.047+h*.295,.55);}
  for(const x of [-.30,.30]){
    for(let row=0;row<26;row++){const y=.054+row*.025;k.box(g,.20,.0009,.001,shadow,x,y,.506);for(const s of [-1,1])k.box(g,.001,.0009,.25,shadow,x+s*.101,y,.38);}
    for(const y of [.50,.74]){const top=new THREE.Shape();top.moveTo(-.080,0);top.lineTo(.080,0);top.lineTo(0,.078);top.closePath();k.mesh(g,new THREE.ExtrudeGeometry(top,{depth:.012,bevelEnabled:false}),edge,x,y,.516);}
    for(const dx of [-.080,.080])for(const z of [.28,.48]){k.cyl(g,.009,.012,.070,edge,x+dx,.77,z,6);k.cyl(g,0,.012,.045,edge,x+dx,.8275,z,6);}
  }
  for(const x of [-.30,0,.30]){const w=x===0?.19:.145;for(let i=0;i<3;i++){const z=.55+i*.003,ww=w+i*.012;const pts=[[x-ww/2,.05,z],[x-ww/2,.19,z],[x-ww*.35,.25,z],[x,.31,z],[x+ww*.35,.25,z],[x+ww/2,.19,z],[x+ww/2,.05,z]];k.line(g,pts,.002,edge);}}
  for(let i=0;i<18;i++)k.cyl(g,0,.006,.025,edge,(i-8.5)*.023,.306,.525,4);
  const clock=k.mesh(g,new THREE.CircleGeometry(.029,32),shadow,-.30,.672,.533);k.mesh(g,new THREE.TorusGeometry(.030,.002,4,32),edge,-.30,.672,.535);k.beam(g,[-.30,.672,.539],[-.30,.691,.539],.0015,edge,4);k.beam(g,[-.30,.672,.539],[-.283,.664,.539],.0015,edge,4);
  for(let i=0;i<5;i++)k.box(g,.78,.006*(i+1),.022,stone,0,.003*(i+1),.625-i*.022);
  sideAisles(k,g,{wall,edge,shadow,stained,tile,light});
  facadeDetails(k,g,{wall,edge,shadow,stained});
  for(const x of [-.50,.50])tree(k,g,x,.018,-.27,.11);bollards(k,g,[[-.48,.46],[.48,.46],[-.48,-.46],[.48,-.46]]);people(k,g,[[-.12,.61],[.10,.62],[.15,.61]]);
  const model=k.merge(g);
  for(const x of [-.30,.30]){
    const wash=new THREE.SpotLight('#ffce8e',0,1.6,.48,.65,2);wash.position.set(x,.08,.68);wash.target.position.set(x,.73,.48);wash.userData.nightIntensity=.095;model.add(wash,wash.target);
  }
  return model;
}


function roofJoints(material){
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 vCathedralRoof;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCathedralRoof=position.xz;');
    shader.fragmentShader='varying vec2 vCathedralRoof;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 tile=vCathedralRoof*vec2(67.,54.);tile.x+=mod(floor(tile.y),2.)*.5;
      vec2 seam=abs(fract(tile)-.5)/max(fwidth(tile),vec2(.015));
      diffuseColor.rgb*=mix(.84,1.,smoothstep(.12,.48,min(seam.x,seam.y)));
    `);
  };material.customProgramCacheKey=()=> 'cathedral-roof-joints-v1';
}
function stoneWash(material){
  material.userData.night.intensity=.58;
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vCathedral;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCathedral=position;');
    shader.fragmentShader='varying vec3 vCathedral;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float front=exp(-pow((abs(vCathedral.x)-.30)*15.,2.))*smoothstep(.42,.51,vCathedral.z);
      float bay=pow(.5+.5*cos((vCathedral.z+.45)*36.96),6.);
      float side=bay*smoothstep(.23,.37,abs(vCathedral.x));
      float wash=max(front,side)*(.85-.28*smoothstep(.3,1.2,vCathedral.y));
      totalEmissiveRadiance*=.07+wash;
    `);
  };material.customProgramCacheKey=()=> 'cathedral-stone-wash-v1';
}
function prism(k,g,points,depth,mat,z){
  const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
  return k.mesh(g,new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16}),mat,0,0,z);
}
function sideAisles(k,g,{wall,edge,shadow,stained,tile,light}){
  // Lower side aisles, raised clerestory and genuine open flying buttresses.
  for(const side of [-1,1]){
    const aisle=new THREE.Group();g.add(aisle);aisle.rotation.y=side<0?Math.PI:0;aisle.position.z=-.04;
    k.box(aisle,.15,.23,.88,wall,.320,.160,0);
    prism(k,aisle,[[.24,.277],[.406,.277],[.24,.362]],.90,tile,-.45);
    for(let i=0;i<5;i++){
      const z=side*(-.40+i*.17);
      const window=new THREE.Group();aisle.add(window);window.position.set(.399,.085,z);window.rotation.y=Math.PI/2;
      pointed(k,window,0,0,0,.080,.158,.003,shadow);pointed(k,window,0,.010,.004,.063,.140,.003,stained);
      for(const dx of [-.020,0,.020])k.box(window,.0025,.105,.006,edge,dx,.063,.010);
      const arch=[[-.044,0,.010],[-.044,.106,.010],[-.029,.143,.010],[0,.171,.010],[.029,.143,.010],[.044,.106,.010],[.044,0,.010]];k.line(window,arch,.003,edge);
      const upper=new THREE.Group();aisle.add(upper);upper.position.set(.249,.355,z);upper.rotation.y=Math.PI/2;
      pointed(k,upper,0,0,0,.066,.075,.003,shadow);pointed(k,upper,0,.006,.004,.053,.063,.003,stained);k.box(upper,.003,.050,.004,edge,0,.031,.009);
    }
    for(let i=0;i<5;i++){
      const z=side*(-.475+i*.17);
      k.box(aisle,.062,.030,.054,edge,.427,.026,z);
      k.box(aisle,.038,.28,.032,edge,.427,.180,z);
      k.box(aisle,.054,.014,.048,edge,.427,.326,z);
      k.cyl(aisle,.008,.013,.066,edge,.427,.365,z,6);k.cyl(aisle,0,.015,.055,edge,.427,.426,z,4).rotation.y=Math.PI/4;
      const arch=new THREE.Shape();arch.moveTo(.412,.292);arch.quadraticCurveTo(.365,.418,.249,.445);arch.lineTo(.249,.482);arch.quadraticCurveTo(.380,.458,.442,.305);arch.closePath();
      k.mesh(aisle,new THREE.ExtrudeGeometry(arch,{depth:.024,bevelEnabled:false,curveSegments:18}),wall,0,0,z-.012);
      k.box(aisle,.030,.004,.018,light,.433,.322,z);
      k.box(aisle,.025,.065,.024,edge,.251,.458,z);k.cyl(aisle,0,.014,.044,edge,.251,.511,z,4).rotation.y=Math.PI/4;
    }
  }
  for(const x of [-.266,.266])k.box(g,.009,.013,.93,edge,x,.449,-.045);
}
function facadeDetails(k,g,{wall,edge,shadow,stained}){
  const glassColors=['#854b48','#4e5c72','#b29764','#657b75'],glass=glassColors.map(c=>{const m=k.mat(c,.44,.12,c);m.userData.night.intensity=.30;return m;});
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2,b=(i+1)/24*Math.PI*2,p=[];for(const [rr,t] of [[.033,a],[.095,a],[.095,b],[.033,b]])p.push(Math.cos(t)*rr,.399+Math.sin(t)*rr,.516);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();k.mesh(g,geo,glass[i%glass.length]);
  }
  k.mesh(g,new THREE.CircleGeometry(.021,32),shadow,0,.588,.512);k.mesh(g,new THREE.TorusGeometry(.025,.003,5,32),edge,0,.588,.518);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.beam(g,[-.30+Math.sin(a)*.024,.672+Math.cos(a)*.024,.538],[-.30+Math.sin(a)*.027,.672+Math.cos(a)*.027,.538],.0008,edge,4);}
  for(const x of [-.30,.30])for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    for(let j=0;j<6;j++){const y=.837+j*.045,r=.098*(1-(y-.807)/.339);k.ball(g,.0038,edge,x+Math.sin(a)*r,y,.38+Math.cos(a)*r);}
    if(i%2===0)for(const y of [.86,.94,1.02]){
      const q=new THREE.Group();g.add(q);q.position.set(x,0,.38);q.rotation.y=a;
      const rr=.098*(1-(y+.020-.807)/.339);pointed(k,q,0,y,rr+.001,.009,.032,.002,shadow);
    }
  }
}
