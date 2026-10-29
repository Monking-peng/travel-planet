import * as THREE from 'three';
import {roof,stairs,plaque,tree} from './wuhan-architecture.js';

export function hankouArtMuseum(k){
 const g=new THREE.Group(),stone=k.mat('#c9c5b7',.88),trim=k.mat('#e4dcc9',.86),glass=k.mat('#3d555a',.45,.15,'#e5bb83'),dark=k.mat('#757b73',.9),banner=k.mat('#7a8884');glass.userData.night.intensity=.35;
 k.box(g,.86,.045,.61,stone,0,-.017);k.box(g,.72,.285,.30,stone,0,.149,-.045);
 // Recessed central colonnade, side piers and a continuous classical cornice.
 k.box(g,.52,.214,.014,dark,0,.143,.113);
 for(const x of [-.30,.30]){k.box(g,.118,.285,.33,stone,x,.149,-.035);for(let j=0;j<3;j++)k.box(g,.032,.051,.004,glass,x,.061+j*.077,.133);}
 for(let i=0;i<6;i++){const x=(i-2.5)*.078;k.cyl(g,.011,.014,.208,trim,x,.149,.145,16);k.box(g,.035,.010,.033,trim,x,.043,.145);k.box(g,.033,.009,.032,trim,x,.255,.145);for(const s of [-1,1]){k.ball(g,.006,trim,x+s*.012,.248,.145);}}
 for(const y of [.024,.271,.286,.310])k.box(g,.76,.009,.345,trim,0,y,-.026);
 k.box(g,.73,.029,.32,stone,0,.296,-.037);
 for(let i=0;i<14;i++){k.box(g,.012,.008,.014,trim,(i-6.5)*.052,.267,.148);k.box(g,.015,.018,.008,dark,(i-6.5)*.05,.294,.129);}
 for(const x of [-.156,-.078,.078,.156])k.box(g,.049,.14,.002,banner,x,.167,.121);
 const arch=new THREE.Shape();arch.moveTo(-.035,0);arch.lineTo(-.035,.060);arch.absarc(0,.060,.035,Math.PI,0,true);arch.lineTo(.035,0);arch.closePath();k.mesh(g,new THREE.ShapeGeometry(arch),glass,0,.025,.153);
 for(const side of [-1,1])for(let j=0;j<3;j++)for(let i=0;i<6;i++)k.box(g,.003,.043,.027,glass,side*.362,.062+j*.076,-.16+i*.047);
 stairs(k,g,.32,.11,.028,stone,0,.24,9);
 const sign=k.mesh(g,new THREE.IcosahedronGeometry(.13,1),k.mat('#ac957b',.96),0,.034,.31);sign.scale.set(2.1,.35,.37);plaque(k,g,'武汉美术馆',.26,.035,0,.048,.361);
 const bronze=k.mat('#898274',.7,.28),water=k.mat('#628385',.42,.2);k.cyl(g,.082,.088,.014,stone,-.29,.009,.25,32);k.cyl(g,.073,.073,.002,water,-.29,.018,.25,32);k.cyl(g,.003,.008,.029,bronze,-.29,.032,.25,10);
 return k.merge(g);
}

export function baotong(k){
 const g=new THREE.Group(),red=k.mat('#995d45',.94,0,'#b98351'),grey=k.mat('#626a62',.93),stone=k.mat('#b5af97',.95),yellow=k.mat('#c5aa61',.95),wood=k.mat('#694738',.92),window=k.mat('#3c3730',.95),gold=k.mat('#b69259',.7,.15);red.userData.night.intensity=.13;
 red.onBeforeCompile=s=>{s.vertexShader='varying vec3 vBrick;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBrick=position;');s.fragmentShader='varying vec3 vBrick;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec2 brick=vec2((vBrick.x+vBrick.z)*145.+mod(floor(vBrick.y*170.),2.)*.5,vBrick.y*170.);float joint=step(.90,fract(brick.y))+step(.95,fract(brick.x));diffuseColor.rgb*=1.-joint*.13;');};red.customProgramCacheKey=()=>"hongshan-brick";
 const mound=k.mesh(g,new THREE.SphereGeometry(.39,40,20,0,Math.PI*2,0,Math.PI/2),k.mat('#71866a',.98),0,-.075,-.045);mound.scale.set(1,.30,.85);
 k.cyl(g,.155,.18,.055,stone,.045,.031,-.115,8);
 for(let f=0;f<7;f++){const y=.058+f*.093,r=.127-f*.007;const body=k.cyl(g,r*.87,r*.92,.078,red,.045,y+.039,-.115,8);body.rotation.y=Math.PI/8;
  for(let side=0;side<8;side++){const a=side*Math.PI/4,x=.045+Math.sin(a)*r*.86,z=-.115+Math.cos(a)*r*.86;const p=k.box(g,.016,.032,.003,window,x,y+.041,z);p.rotation.y=a;for(const off of [-.30,.30]){const b=a+off;k.cyl(g,.0028,.0035,.079,grey,.045+Math.sin(b)*r*.97,y+.041,-.115+Math.cos(b)*r*.97,6);}k.beam(g,[.045+Math.sin(a-.34)*r*1.01,y+.023,-.115+Math.cos(a-.34)*r*1.01],[.045+Math.sin(a+.34)*r*1.01,y+.023,-.115+Math.cos(a+.34)*r*1.01],.0025,grey);}
  const roof=k.cyl(g,r*.90,r*1.18,.018,grey,.045,y+.083,-.115,8);roof.rotation.y=Math.PI/8;
  for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;k.beam(g,[.045+Math.sin(a)*r*.88,y+.072,-.115+Math.cos(a)*r*.88],[.045+Math.sin(a)*r*1.18,y+.078,-.115+Math.cos(a)*r*1.18],.003,stone);}
 }
 for(let i=0;i<5;i++)k.ball(g,.018-i*.0025,gold,.045,.72+i*.025,-.115);k.cyl(g,.001,.002,.045,gold,.045,.841,-.115,8);
 // The ochre boundary wall and named gate anchor the tower's wooded temple setting.
 for(const x of [-.21,.21]){k.box(g,.20,.105,.025,yellow,x,.038,.21);roof(k,g,.22,.065,.020,.095,grey,grey,x,.21);}
 for(const x of [-.09,.09])k.box(g,.026,.135,.045,yellow,x,.056,.21);k.box(g,.21,.042,.045,yellow,0,.121,.21);roof(k,g,.26,.095,.034,.148,grey,grey,0,.21);plaque(k,g,'宝通禅寺',.13,.031,0,.123,.235);stairs(k,g,.16,.12,.030,stone,0,.32);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;if(Math.sin(a)>.55)continue;tree(k,g,Math.cos(a)*.30,-.023,Math.sin(a)*.28-.03,.080+(i%4)*.016);}
 return k.merge(g);
}
