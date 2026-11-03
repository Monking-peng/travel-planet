import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,granite,lit,TAU} from './quanzhou-kit.js';
// Smoothly joined stone volumes keep the seated figure a single carving.
function sage(k,g,p){
 const lobes=[
  [0,.055,.025,.30,.075,.18],[-.08,.095,.13,.22,.065,.12],
  [0,.220,-.02,.145,.175,.12],[-.11,.255,.008,.085,.125,.105],[.11,.255,.005,.085,.125,.105],[-.17,.22,.06,.075,.10,.09],
  [.205,.145,.095,.092,.139,.115],[-.20,.205,.105,.092,.060,.105],
  [-.175,.185,.18,.095,.033,.055],[.19,.255,.16,.072,.030,.052],
  [0,.403,.020,.075,.073,.064],[0,.459,.006,.069,.041,.061],[-.033,.382,.066,.036,.030,.023],[.033,.382,.066,.036,.030,.023],
  [-.065,.39,.014,.018,.055,.023],[.065,.39,.014,.018,.055,.023],
  [0,.396,.080,.018,.027,.022],[0,.37,.072,.030,.025,.019],
  [0,.315,.101,.048,.082,.027],[0,.247,.105,.029,.036,.019]
 ];
 const ell=(x,y,z,a)=>{const [cx,cy,cz,rx,ry,rz]=a;return (Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz)-1)*Math.min(rx,ry,rz);};
 const smooth=(a,b,r)=>{const h=Math.max(r-Math.abs(a-b),0)/r;return Math.min(a,b)-h*h*r*.25;};
 const field=(x,y,z)=>{let d=1;for(const a of lobes)d=smooth(d,ell(x,y,z,a),.016);const coat=THREE.MathUtils.smoothstep(y,.07,.15)*(1-THREE.MathUtils.smoothstep(y,.32,.38))*THREE.MathUtils.smoothstep(z,.065,.12);d+=.0028*coat*Math.sin(Math.atan2(x,.43-y)*32);const beard=THREE.MathUtils.smoothstep(y,.235,.26)*(1-THREE.MathUtils.smoothstep(y,.345,.37))*THREE.MathUtils.smoothstep(z,.10,.12)*(1-THREE.MathUtils.smoothstep(Math.abs(x),.025,.050));d+=.0018*beard*Math.sin(x*610);for(const sx of [-1,1])d=Math.max(d,-ell(x,y,z,[sx*.029,.416,.068,.018,.007,.008]));return d;};
 const NX=56,NY=66,NZ=38,pts=[],val=[],pos=[],nor=[],index=(i,j,l)=>(j*(NZ+1)+l)*(NX+1)+i;
 for(let j=0;j<=NY;j++)for(let l=0;l<=NZ;l++)for(let i=0;i<=NX;i++){const q=[-.34+.68*i/NX,-.025+.56*j/NY,-.17+.43*l/NZ];pts.push(q);val.push(field(...q));}
 const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],grad=q=>{const e=.0002;return new THREE.Vector3(field(q[0]+e,q[1],q[2])-field(q[0]-e,q[1],q[2]),field(q[0],q[1]+e,q[2])-field(q[0],q[1]-e,q[2]),field(q[0],q[1],q[2]+e)-field(q[0],q[1],q[2]-e)).normalize();};
 const emit=(a,b,c)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),cv=new THREE.Vector3(...c);if(bv.sub(av).cross(cv.sub(av)).dot(grad(a))<0)[b,c]=[c,b];for(const q of [a,b,c]){pos.push(...q);nor.push(...grad(q));}};
 for(let j=0;j<NY;j++)for(let l=0;l<NZ;l++)for(let i=0;i<NX;i++){const cube=[index(i,j,l),index(i+1,j,l),index(i+1,j+1,l),index(i,j+1,l),index(i,j,l+1),index(i+1,j,l+1),index(i+1,j+1,l+1),index(i,j+1,l+1)];for(const t of tetra){const cut=[];for(const [a,b]of pairs){const ia=cube[t[a]],ib=cube[t[b]],va=val[ia],vb=val[ib];if((va<0)===(vb<0))continue;const f=va/(va-vb);cut.push(pts[ia].map((v,n)=>v+(pts[ib][n]-v)*f));}if(cut.length===3)emit(...cut);else if(cut.length===4){const center=cut.reduce((v,q)=>v.add(new THREE.Vector3(...q)),new THREE.Vector3()).multiplyScalar(.25),normal=grad(cut[0]),u=new THREE.Vector3(...cut[0]).sub(center).normalize(),v=normal.clone().cross(u);cut.sort((a,b)=>{const aa=new THREE.Vector3(...a).sub(center),bb=new THREE.Vector3(...b).sub(center);return Math.atan2(aa.dot(v),aa.dot(u))-Math.atan2(bb.dot(v),bb.dot(u));});emit(cut[0],cut[1],cut[2]);emit(cut[0],cut[2],cut[3]);}}}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));const stone=lit(k,'#7c7e70',.035);stone.roughness=.99;stone.userData.laojunSculpture=true;k.mesh(g,ge,stone,0,.065,0);
 const detail=k.mat('#717566',.99),fine=k.mat('#848575',.98);
 for(const side of [-1,1]){k.line(g,[[side*.013,.489,.076],[side*.031,.491,.077],[side*.049,.484,.065]],.0022,fine);k.line(g,[[side*.014,.479,.076],[side*.03,.478,.077],[side*.046,.480,.065]],.0008,detail);k.line(g,[[side*.008,.443,.105],[side*.030,.441,.100],[side*.042,.426,.087]],.0027,fine);}
 for(let band=0;band<3;band++)k.line(g,Array.from({length:32},(_,i)=>{const a=i/31*TAU;return [Math.sin(a)*.068,.521+band*.005+.007*Math.sin(a),Math.cos(a)*.060+.006];}),.0018,detail,true);
 for(let i=0;i<5;i++){const x=-.218+i*.014;k.line(g,[[x,.274,.222],[x,.258,.229],[x+.002,.248,.220]],.0023,fine);}
 for(let i=0;i<4;i++){const x=.16+i*.013;k.line(g,[[x,.326,.194],[x,.312,.210],[x,.301,.205]],.0023,fine);}
 k.box(g,.19,.022,.095,p.stone,-.18,.211,.18);k.box(g,.035,.12,.035,p.stone,-.248,.147,.18);
}
export function laojun(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.66,.57);paving(k,g,p,.47,.43);granite(k,g,p,{x:0,z:0,y:.024,rx:.34,ry:.065,rz:.24});sage(k,g,p);
 for(const [x,z,rx,ry]of [[-.38,-.24,.15,.19],[.35,-.23,.16,.20],[0,-.36,.20,.23]])granite(k,g,p,{x,z,y:.016,rx,ry,rz:.15});
 const points=[];for(let i=0;i<18;i++){const a=-1.75+i/17*3.5;points.push([Math.sin(a)*.50,-Math.cos(a)*.42,.17+(i%3)*.016]);}grove(k,g,h,points);
 for(const x of [-.34,.34]){k.box(g,.013,.045,.013,p.wood,x,.046,.29);k.beam(g,[x,.066,.29],[x,.066,.40],.002,p.wood);}for(let i=0;i<=12;i++){const x=(i/12-.5)*.68;k.box(g,.006,.050,.006,p.wood,x,.048,.40);}k.box(g,.68,.004,.005,p.wood,0,.074,.40);
 steps(k,g,p,0,.47,.32,3,.014,.05);
 return finish(k,g,{lamps:[[-.38,.023,.33],[.38,.023,.33]],visitors:[[-.13,.023,.45],[.12,.023,.44]]});
}
