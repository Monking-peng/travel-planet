import * as THREE from 'three';
import {palette,site,disc,steps,grove,finish,granite,lit,TAU} from './quanzhou-kit.js';
// Smoothly joined stone volumes keep the seated figure a single carving.
function sage(k,g,p){
 const lobes=[
  [0,.055,.025,.30,.075,.18],[-.08,.095,.13,.22,.065,.12],
  [0,.220,-.02,.162,.175,.13],[-.115,.245,-.005,.113,.105,.115],[.115,.245,-.005,.113,.105,.115],[-.17,.22,.06,.075,.10,.09],[-.225,.135,.02,.095,.12,.13],[.24,.10,.025,.095,.09,.14],
  [.205,.145,.095,.092,.139,.115],[-.20,.205,.105,.092,.060,.105],
  [-.175,.185,.18,.095,.033,.055],[.19,.255,.16,.072,.030,.052],
  [0,.403,.020,.077,.073,.067],[0,.466,.006,.077,.049,.066],
  [-.082,.395,.020,.025,.049,.030],[.082,.395,.020,.025,.049,.030],[-.085,.426,.020,.025,.012,.027],[.085,.426,.020,.025,.012,.027],[-.031,.430,.071,.030,.006,.009],[.031,.430,.071,.030,.006,.009],
  [0,.396,.080,.018,.027,.022],[0,.37,.072,.030,.025,.019],
  [0,.300,.107,.048,.069,.029],[0,.238,.111,.027,.038,.022],[-.019,.381,.084,.021,.008,.017],[.019,.381,.084,.021,.008,.017]
 ];
 for(let i=0;i<5;i++){lobes.push([-.222+i*.014,.179,.211,.008,.021,.019]);lobes.push([.161+i*.013,.247,.199,.008,.021,.018]);}
 const ell=(x,y,z,a)=>{const [cx,cy,cz,rx,ry,rz]=a;return (Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz)-1)*Math.min(rx,ry,rz);};
 const smooth=(a,b,r)=>{const h=Math.max(r-Math.abs(a-b),0)/r;return Math.min(a,b)-h*h*r*.25;};
 const field=(x,y,z)=>{
  let d=1;for(let i=0;i<lobes.length;i++)d=smooth(d,ell(x,y,z,lobes[i]),i>=lobes.length-10?.0025:(lobes[i][1]>.36?.004:.014));
  const coat=THREE.MathUtils.smoothstep(y,.065,.12)*(1-THREE.MathUtils.smoothstep(y,.31,.38))*THREE.MathUtils.smoothstep(z,.07,.13);
  d+=.0018*coat*Math.sin(Math.atan2(x,.43-y)*36+y*21);
  const beard=THREE.MathUtils.smoothstep(y,.22,.26)*(1-THREE.MathUtils.smoothstep(y,.345,.37))*THREE.MathUtils.smoothstep(z,.109,.13)*(1-THREE.MathUtils.smoothstep(Math.abs(x),.027,.050));
  d+=.0011*beard*Math.sin(x*225+y*12);
  for(const sx of [-1,1]){
   d=Math.max(d,-ell(x,y,z,[sx*.031,.417,.084,.023,.007,.012]));
   d=Math.max(d,-ell(x,y,z,[sx*.086,.403,.048,.017,.028,.021]));
   d=Math.max(d,-ell(x,y,z,[sx*.009,.390,.099,.006,.005,.009]));
  }
  d=Math.max(d,-ell(x,y,z,[0,.372,.103,.027,.0065,.020]));

  return d;
 };
 const NX=92,NY=112,NZ=62,pts=[],val=[],pos=[],nor=[],index=(i,j,l)=>(j*(NZ+1)+l)*(NX+1)+i;
 for(let j=0;j<=NY;j++)for(let l=0;l<=NZ;l++)for(let i=0;i<=NX;i++){const q=[-.34+.68*i/NX,-.025+.56*j/NY,-.17+.43*l/NZ];pts.push(q);val.push(field(...q));}
 const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],normalCache=new Map(),grad=q=>{const key=q.map(v=>Math.round(v*1e6)).join(',');if(normalCache.has(key))return normalCache.get(key);const e=.0002;const n=new THREE.Vector3(field(q[0]+e,q[1],q[2])-field(q[0]-e,q[1],q[2]),field(q[0],q[1]+e,q[2])-field(q[0],q[1]-e,q[2]),field(q[0],q[1],q[2]+e)-field(q[0],q[1],q[2]-e)).normalize();normalCache.set(key,n);return n;};
 const emit=(a,b,c)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),cv=new THREE.Vector3(...c);if(bv.sub(av).cross(cv.sub(av)).dot(grad(a))<0)[b,c]=[c,b];for(const q of [a,b,c]){pos.push(...q);nor.push(...grad(q));}};
 for(let j=0;j<NY;j++)for(let l=0;l<NZ;l++)for(let i=0;i<NX;i++){const cube=[index(i,j,l),index(i+1,j,l),index(i+1,j+1,l),index(i,j+1,l),index(i,j,l+1),index(i+1,j,l+1),index(i+1,j+1,l+1),index(i,j+1,l+1)];for(const t of tetra){const cut=[];for(const [a,b]of pairs){const ia=cube[t[a]],ib=cube[t[b]],va=val[ia],vb=val[ib];if((va<0)===(vb<0))continue;const f=va/(va-vb);cut.push(pts[ia].map((v,n)=>v+(pts[ib][n]-v)*f));}if(cut.length===3)emit(...cut);else if(cut.length===4){const center=cut.reduce((v,q)=>v.add(new THREE.Vector3(...q)),new THREE.Vector3()).multiplyScalar(.25),normal=grad(cut[0]),u=new THREE.Vector3(...cut[0]).sub(center).normalize(),v=normal.clone().cross(u);cut.sort((a,b)=>{const aa=new THREE.Vector3(...a).sub(center),bb=new THREE.Vector3(...b).sub(center);return Math.atan2(aa.dot(v),aa.dot(u))-Math.atan2(bb.dot(v),bb.dot(u));});emit(cut[0],cut[1],cut[2]);emit(cut[0],cut[2],cut[3]);}}}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));const stone=stoneFinish(k);stone.userData.laojunSculpture=true;stone.userData.laojunBody=true;k.mesh(g,ge,stone,0,.065,0);
 const detail=stoneFinish(k),edge=stoneFinish(k);
 // The low carved armrest has two legs and an open underside.
 for(const y of [.210,.218,.225])k.box(g,.225,.005,.105,edge,-.184,y,.17);
 const front=new THREE.Shape();front.moveTo(-.112,0);front.lineTo(.112,0);front.lineTo(.089,-.041);front.quadraticCurveTo(.049,-.052,.018,-.021);front.lineTo(0,-.008);front.lineTo(-.018,-.021);front.quadraticCurveTo(-.049,-.052,-.089,-.041);front.closePath();
 k.mesh(g,new THREE.ExtrudeGeometry(front,{depth:.006,bevelEnabled:false,curveSegments:18}),detail,-.184,.209,.217);
 for(const x of [-.267,-.100]){const foot=k.box(g,.027,.112,.032,edge,x,.145,.170);foot.rotation.z=x<-.18?-.12:.12;}
 for(const x of [-.267,-.217,-.151,-.101]){const flower=k.mesh(g,new THREE.TorusGeometry(.009,.0011,5,18),edge,x,.196,.224);for(let i=0;i<6;i++){const a=i/6*TAU;const petal=k.ball(g,.003,detail,x+Math.cos(a)*.006,.196+Math.sin(a)*.006,.224);petal.scale.z=.5;}}

}
function stoneFinish(k){
 const m=lit(k,'#787b75',.035);m.roughness=.99;m.metalness=0;m.userData.laojunSculpture=true;
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 sageP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsageP=position;');
  s.fragmentShader='varying vec3 sageP; float sageHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float grain=sageHash(floor(sageP*730.));float patches=sageHash(floor(sageP*92.));
   float streak=.5+.5*sin(sageP.x*87.+sin(sageP.y*13.)*1.4+sageP.z*33.);
   diffuseColor.rgb*=.90+.10*grain+.05*patches;
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.18,smoothstep(.88,.99,patches)*.45);
   float beard=(1.-smoothstep(.025,.056,abs(sageP.x)))*smoothstep(.113,.135,sageP.z)*smoothstep(.30,.34,sageP.y)*(1.-smoothstep(.425,.445,sageP.y));
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.10,1.01,.86),beard*.65);
   diffuseColor.rgb*=.97+.03*streak;
  `);
 };m.customProgramCacheKey=()=> 'quanzhou-sage-weathered-granite';return m;
}
export function laojun(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.66,.57);p.pale=k.mat('#9da28d',.99);disc(k,g,.47,.43,.020,p.pale);granite(k,g,p,{x:0,z:0,y:.024,rx:.34,ry:.065,rz:.24});sage(k,g,p);
 for(const [x,z,rx,ry]of [[-.38,-.24,.15,.19],[.35,-.23,.16,.20],[0,-.36,.20,.23]])granite(k,g,p,{x,z,y:.016,rx,ry,rz:.15});
 const points=[[-.48,-.04,.21],[-.52,-.18,.18],[-.43,-.32,.25],[-.27,-.42,.20],[-.13,-.46,.27],[.06,-.44,.22],[.24,-.42,.25],[.40,-.33,.22],[.49,-.17,.26],[.50,.02,.17],[-.35,-.40,.13],[.16,-.49,.15],[.44,-.26,.15]];grove(k,g,h,points);
 const shrubs=k.mat('#627a4f',.99);for(let i=0;i<15;i++){const x=(i/14-.5)*.70,o=k.mesh(g,new THREE.DodecahedronGeometry(.025+(i%3)*.002,1),shrubs,x,.043,.365+.008*Math.sin(i*1.9));o.scale.set(1.3,.65,1);}
 for(const x of [-.34,.34]){k.box(g,.013,.045,.013,p.wood,x,.046,.29);k.beam(g,[x,.066,.29],[x,.066,.40],.002,p.wood);}for(let i=0;i<=12;i++){const x=(i/12-.5)*.68;k.box(g,.006,.050,.006,p.wood,x,.048,.40);}k.box(g,.68,.004,.005,p.wood,0,.074,.40);
 steps(k,g,p,0,.47,.32,3,.014,.05);
 return finish(k,g,{lamps:[[-.38,.023,.33],[.38,.023,.33]],visitors:[[-.13,.023,.45],[.12,.023,.44]]});
}
