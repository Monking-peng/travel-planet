import * as THREE from 'three';
import {MarchingCubes} from 'three/addons/objects/MarchingCubes.js';
import {noise} from './guilin-kit.js';
import {palette,site,skin,ellipse,texturedStone,railing,finish,TAU} from './sanya-kit.js';
function face(k,g,mat,{x=0,y=0,z=0,s=1}={}){
 const head=ellipse(k,g,mat,x,y,z,.026*s,.039*s,.027*s);const shade=k.mat('#acae9e',.99);
 ellipse(k,g,mat,x,y-.002*s,z+.027*s,.005*s,.012*s,.008*s);
 for(const side of [-1,1]){
  k.line(g,[[x+side*.006*s,y+.008*s,z+.026*s],[x+side*.014*s,y+.010*s,z+.023*s],[x+side*.020*s,y+.007*s,z+.019*s]],.0014*s,mat);
  k.line(g,[[x+side*.007*s,y+.004*s,z+.027*s],[x+side*.014*s,y+.003*s,z+.024*s],[x+side*.018*s,y+.004*s,z+.020*s]],.00075*s,shade);
  ellipse(k,g,mat,x+side*.026*s,y-.004*s,z,.006*s,.014*s,.008*s);
 }
 k.line(g,[[x-.009*s,y-.018*s,z+.022*s],[x,y-.019*s,z+.026*s],[x+.009*s,y-.018*s,z+.022*s]],.0009*s,shade);return head;
}
function sleeve(k,g,mat,points,r){const curve=new THREE.CatmullRomCurve3(points.map(q=>new THREE.Vector3(...q)));return k.mesh(g,new THREE.TubeGeometry(curve,24,r,12,false),mat);}
function figure(k,parent,stone,{back=false}={}){
 const g=new THREE.Group();g.position.set(-.16,-.006,back?-.104:.104);g.scale.set(1.12,1.19,1.08);if(back)g.rotation.y=Math.PI;parent.add(g);
 // A clothed waist, shoulders and bent knees keep the figure part of the carving.
 const torso=new THREE.LatheGeometry([[.023,.16],[.041,.18],[.036,.22],[.031,.25],[.040,.30],[.047,.327],[.028,.35],[.013,.364]].map(a=>new THREE.Vector2(...a)),32);
 const body=k.mesh(g,torso,stone);body.scale.z=.67;
 const head=new THREE.Group();head.position.set(0,.405,.004);head.rotation.y=back?-.16:.12;g.add(head);face(k,head,stone,{s:1.03});
 const hair=texturedStone(k,'#a6a18d');ellipse(k,head,hair,0,.016,-.006,.028,.030,.024);
 for(let i=0;i<7;i++)k.line(head,[[-.024+i*.008,.028,-.012],[-.020+i*.006,.040,-.004],[-.019+i*.006,.028,.014]],.0014,hair);
 k.cyl(g,.012,.014,.025,stone,0,.365,0,12);
 for(const [side,offset]of [[-1,.010],[1,-.008]]){
  sleeve(k,g,stone,[[side*.021,.186,0],[side*.027,.112,.015+offset],[side*.016,.027,.014]],.017);
  ellipse(k,g,stone,side*.018,.014,.027,.018,.013,.034);
  k.line(g,[[side*.029,.181,.021],[side*.032,.143,.024],[side*.025,.126,.030]],.0012,hair);
 }
 if(!back){
  sleeve(k,g,stone,[[-.042,.328,0],[-.065,.282,.020],[-.075,.335,.032],[-.033,.377,.036]],.014);
  sleeve(k,g,stone,[[.043,.328,0],[.065,.288,.013],[.070,.365,.020],[.047,.378,.028]],.013);
  for(const x of [-.029,.049])ellipse(k,g,stone,x,.377,.036,.019,.006,.010);
  k.beam(g,[-.038,.378,.018],[.235,.389,-.007],.0035,stone);
 }else{
  sleeve(k,g,stone,[[-.041,.328,0],[-.059,.273,.018],[-.048,.221,.028]],.013);
  sleeve(k,g,stone,[[.042,.328,0],[.061,.287,.023],[.019,.257,.039]],.013);
  ellipse(k,g,stone,.012,.258,.040,.019,.007,.009);
  skin(k,g,(u,t)=>{const a=u*TAU,r=.038+.008*(1-t);return [Math.sin(a)*r,.126+t*.08,Math.cos(a)*r*.73];},8,48,stone);
 }
 for(let i=0;i<3;i++)k.line(g,[[(-.025+i*.024),.18,.026],[(-.023+i*.022),.22,.029],[(-.020+i*.019),.27,.027]],.0010,hair);
}
export function luhuitou(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,p),stone=texturedStone(k,'#c1bba5');stone.userData.night={color:new THREE.Color('#e9d4ac'),intensity:.085};
 const land=k.mat('#6c8253',.99);land.userData.landscape=true;
 const hill=(x,z)=>{const r=Math.hypot(x/.70,z/.55),t=THREE.MathUtils.smoothstep(r,.70,1);return THREE.MathUtils.lerp(.018+.125*Math.max(0,1-r*r)**1.4,h(x,z)+.002,t);};
 skin(k,g,(u,v)=>{const a=u*TAU,x=Math.cos(a)*.70*v,z=Math.sin(a)*.55*v;return [x,hill(x,z),z];},40,120,land);
 const court=texturedStone(k,'#bbb8a5');court.userData.deerApproach=true;
 k.box(g,.77,.016,.54,court,0,.146,0);
 for(let i=0;i<3;i++)k.box(g,.65-i*.020,.032,.37-i*.014,stone,0,.170+i*.032,-.02);
 const joint=k.mat('#928e7d',.99);
 for(const side of [-1,1])for(let row=0;row<3;row++){
  const y=.156+row*.032,w=.65-row*.020,z=-.02+side*(.37-row*.014)/2;
  k.box(g,w,.0015,.001,joint,0,y,z+side*.0007);
  for(let i=0;i<7;i++)k.box(g,.0012,.030,.001,joint,-w/2+(i+.5+(row%2)*.5)*w/7,y+.016,z+side*.0007);
 }
 const carved=new THREE.Group();carved.position.set(0,.252,-.02);g.add(carved);
 const rock=texturedStone(k,'#bcb7a2');rock.userData.deerCarving=true;rock.userData.night={color:new THREE.Color('#e9d4ac'),intensity:.07};
 const original=rock.onBeforeCompile;rock.onBeforeCompile=s=>{original(s);s.fragmentShader=s.fragmentShader.replace('#include <dithering_fragment>',`float row=floor(vSanyaStone.y/.049);float horizontal=1.-smoothstep(.0007,.0014,abs(mod(vSanyaStone.y+.0245,.049)-.0245));float vertical=1.-smoothstep(.0006,.0012,abs(mod(vSanyaStone.x+mod(row,2.)*.047+.047,.094)-.047));float face=smoothstep(.065,.085,abs(vSanyaStone.z));gl_FragColor.rgb*=1.-.10*max(horizontal,vertical)*face;\n#include <dithering_fragment>`);};rock.customProgramCacheKey=()=> 'luhuitou-carved-granite-joints';
 const outline=new THREE.Shape();outline.moveTo(-.29,0);outline.quadraticCurveTo(-.22,.10,-.18,.24);outline.lineTo(-.15,.46);outline.lineTo(.090,.47);outline.lineTo(.125,.506);outline.quadraticCurveTo(.066,.53,.065,.56);outline.lineTo(.091,.625);outline.quadraticCurveTo(.11,.670,.16,.65);outline.quadraticCurveTo(.263,.61,.263,.52);outline.quadraticCurveTo(.27,.42,.205,.34);outline.quadraticCurveTo(.255,.14,.285,0);outline.closePath();
 const polygon=outline.getPoints(16),N=78,volume=new MarchingCubes(N,rock,false,false,100000);volume.isolation=0;
 const planar=(x,y)=>{let inside=false,d=Infinity;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const A=polygon[i],B=polygon[j],dx=B.x-A.x,dy=B.y-A.y,t=THREE.MathUtils.clamp(((x-A.x)*dx+(y-A.y)*dy)/(dx*dx+dy*dy||1),0,1);d=Math.min(d,Math.hypot(x-A.x-t*dx,y-A.y-t*dy));if(((A.y>y)!==(B.y>y))&&x<(B.x-A.x)*(y-A.y)/(B.y-A.y)+A.x)inside=!inside;}const outer=inside?-d:d,hole=(Math.hypot((x-.167)/.052,(y-.535)/.042)-1)*.042;return Math.max(outer,-hole);};
 const slices=[];for(let iy=0;iy<N;iy++)for(let ix=0;ix<N;ix++){const x=(ix/N*2-1)*.4,y=(iy/N*2-1)*.4+.36,depth=.069+.045*Math.exp(-(((x-.16)/.09)**2+((y-.31)/.20)**2))+.020*Math.exp(-(((x+.08)/.14)**2+((y-.20)/.18)**2))+.012*(noise(x*24+7,y*29,4)-.5)+.005*(noise(x*61,y*53+5,8)-.5);slices.push([x,y,planar(x,y),depth]);}
 for(let iz=0;iz<N;iz++)for(let iy=0;iy<N;iy++)for(let ix=0;ix<N;ix++){const [x,y,sd,depth]=slices[iy*N+ix],z=(iz/N*2-1)*.4,roundDepth=depth*Math.sqrt(THREE.MathUtils.clamp(-sd/.040,0,1)),dz=Math.abs(z)-roundDepth,edge=Math.hypot(Math.max(sd,0),Math.max(dz,0))+Math.min(Math.max(sd,dz),0)-.006;volume.field[iz*N*N+iy*N+ix]=-edge;}
 volume.update();const solid=new THREE.BufferGeometry(),positions=volume.geometry.attributes.position.array.slice(0,volume.count*3),normals=volume.geometry.attributes.normal.array.slice(0,volume.count*3);for(let i=0;i<positions.length;i+=3){positions[i]*=.4;positions[i+1]=positions[i+1]*.4+.36;positions[i+2]*=.4;}solid.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));solid.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));solid.normalizeNormals();volume.geometry.dispose();k.mesh(carved,solid,rock);
 // The long, tapered muzzle hangs into the opening; ears point in different directions.
 const head=ellipse(k,carved,stone,.107,.611,0,.031,.046,.060);head.rotation.z=-.33;
 const nose=ellipse(k,carved,stone,.073,.563,.003,.020,.043,.043);nose.rotation.z=-.34;
 for(const [x,y,a]of [[.127,.688,-.08],[.083,.669,.78]]){const ear=ellipse(k,carved,stone,x,y,0,.013,.056,.018);ear.rotation.z=a;}
 for(const side of [-1,1]){
  k.line(carved,[[.085,.609,side*.047],[.103,.613,side*.053],[.112,.608,side*.052]],.0015,joint);
  k.line(carved,[[.055,.546,side*.021],[.074,.542,side*.031]],.0012,joint);
  // Two emerging forelegs remain attached to the granite base.
  sleeve(k,carved,rock,[[.175,.387,side*.065],[.182,.25,side*.091],[.205,.075,side*.075]],.022);
 }
 figure(k,carved,stone);figure(k,carved,stone,{back:true});
 // Broad stair flight and small grouped crowns follow the mountain edge.
 for(let i=0;i<10;i++){const top=.024+(i+1)*.013;const z=.48-i*.023;k.box(g,.43,.014,.025,court,0,top-.007,z);}
 for(const x of [-.239,.239])railing(k,g,p,[[x,.025,.492],[x,.154,.258]],.026);
 const foliage=['#496743','#5a7549','#708359','#547041'].map(c=>{const m=k.mat(c,.99);m.userData.landscape=true;return m;});
 for(let i=0;i<42;i++){const a=(i/42)*TAU,x=Math.cos(a)*(.47+.09*Math.sin(i*11)**2),z=Math.sin(a)*(.36+.07*Math.cos(i*7)**2);if(z>.23&&Math.abs(x)<.33)continue;const y=hill(x,z),ht=.08+.034*(.5+.5*Math.sin(i*8));k.cyl(g,.0035,.005,ht,p.wood,x,y+ht/2,z,6);for(let j=0;j<3;j++){const q=i*4+j*TAU/3,m=k.mesh(g,new THREE.IcosahedronGeometry(.034+(i%3)*.004,1),foliage[(i+j)%4],x+Math.sin(q)*.019,y+ht-.014+j*.009,z+Math.cos(q)*.019);m.scale.y=.82;}}
 return finish(k,g,{lamps:[[-.34,.154,.19],[.34,.154,.19]],visitors:[[-.27,.154,.16],[.28,.154,.12]]});
}
