import * as THREE from 'three';
import {tree,stairs,plaque} from './wuhan-architecture.js';

// Architectural sketches from the photographs listed in 武汉地标与参考.md.
export function gude(k){
  const g=new THREE.Group(),stone=k.mat('#ae9672',.85,0,'#d89745'),edge=k.mat('#dbc79f'),shade=k.mat('#3d4b48'),glass=k.mat('#5a655e',.4,.2,'#ffd397'),paving=k.mat('#c3b9a0');
  stone.userData.night.intensity=.23;glass.userData.night.intensity=.85;
  k.box(g,.65,.036,.65,paving,0,-.014,.06);k.box(g,.47,.22,.41,stone,0,.125,-.05);
  function arch(target,x,y,z,w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h*.58);s.quadraticCurveTo(-w*.46,h*.82,0,h);s.quadraticCurveTo(w*.46,h*.82,w/2,h*.58);s.lineTo(w/2,0);s.closePath();k.mesh(target,new THREE.ShapeGeometry(s),shade,x,y,z);const pts=[[-w/2,0],[-w/2,h*.58],[-w*.32,h*.86],[0,h],[w*.32,h*.86],[w/2,h*.58],[w/2,0]].map(([xx,yy])=>[x+xx,y+yy,z+.002]);k.line(target,pts,.003,edge);}
  for(const sign of [-1,1]){
    const face=new THREE.Group();for(let i=0;i<7;i++){const x=(i-3)*.067;arch(face,x,.043,.209,.035,.126);const rose=k.mesh(face,new THREE.TorusGeometry(.015,.003,6,24),edge,x,.203,.209);k.mesh(face,new THREE.CircleGeometry(.012,24),glass,x,.203,.210);for(let a=0;a<8;a++)k.beam(face,[x,.203,.211],[x+Math.cos(a*Math.PI/4)*.012,.203+Math.sin(a*Math.PI/4)*.012,.211],.0012,edge);k.box(face,.009,.20,.014,edge,x+.026,.135,.216);}
    // Detailed front and rear elevations, with the principal pointed openings facing the court.
    face.position.z=-.05;face.rotation.y=sign<0?Math.PI:0;g.add(face);
  }
  for(const x of [-.24,.24])for(let i=0;i<6;i++){const z=-.23+i*.072;k.box(g,.015,.20,.012,edge,x,.135,z);k.box(g,.004,.125,.038,shade,x*1.006,.105,z+.024);}
  for(const y of [.035,.231,.246])k.box(g,.51,.010,.45,edge,0,y,-.05);
  for(let i=0;i<18;i++)for(const z of [-.279,.179]){k.box(g,.012,.026,.012,stone,(i-8.5)*.028,.267,z);k.ball(g,.009,edge,(i-8.5)*.028,.285,z);}
  for(let iz=-1;iz<=1;iz++)for(let ix=-1;ix<=1;ix++){const x=ix*.184,z=-.05+iz*.17,h=ix===0&&iz===0?.13:.105;k.cyl(g,.027,.039,.047,stone,x,.269,z,8);const profile=[[.027,0],[.032,.015],[.033,.032],[.026,h*.62],[.014,h*.82],[.003,h]].map(p=>new THREE.Vector2(...p));k.cyl(g,.021,.021,.042,shade,x,.312,z,8);for(let a=0;a<8;a++){const t=a*Math.PI/4;k.cyl(g,.0025,.003,.045,edge,x+.024*Math.cos(t),.314,z+.024*Math.sin(t),6);}k.cyl(g,.033,.033,.007,edge,x,.337,z,12);k.mesh(g,new THREE.LatheGeometry(profile,24),stone,x,.340,z);for(let a=0;a<12;a++){const t=a*Math.PI/6;k.line(g,profile.map(p=>[x+(p.x+.001)*Math.cos(t),.340+p.y,z+(p.x+.001)*Math.sin(t)]),.0015,edge);}for(let j=0;j<5;j++)k.cyl(g,.029-j*.005,.031-j*.005,.004,edge,x,.35+j*h*.15,z,12);k.beam(g,[x,.34+h,z],[x,.37+h,z],.0015,shade);}
  // Central pediment and courtyard incense vessel.
  const ped=new THREE.Shape();ped.moveTo(-.086,0);ped.lineTo(0,.086);ped.lineTo(.086,0);ped.closePath();k.mesh(g,new THREE.ExtrudeGeometry(ped,{depth:.012,bevelEnabled:false}),stone,0,.247,.17);
  k.cyl(g,.028,.020,.042,shade,0,.025,.27,12);k.cyl(g,.035,.035,.007,edge,0,.049,.27,12);plaque(k,g,'古德寺',.098,.028,0,.251,.192);stairs(k,g,.23,.085,.029,paving,0,.247);
  for(const x of [-.29,.29])for(let i=0;i<4;i++)tree(k,g,x,-.015,-.20+i*.14,.085);
  return k.merge(g);
}

export function qintaiTheatre(k){
  const g=new THREE.Group(),silver=k.mat('#bcbdb2',.48,.35,'#e4ad58'),glass=k.mat('#315761',.3,.45,'#c2ba92'),dark=k.mat('#536b6c'),paving=k.mat('#bcb9a6'),light=k.mat('#e1cc98',.4,.1,'#ffd492');glass.userData.night.intensity=.34;silver.userData.night.intensity=.16;light.userData.night.intensity=1.9;
  k.box(g,.91,.04,.73,paving,0,-.015,.03);k.box(g,.68,.22,.40,glass,0,.143,-.06);k.box(g,.75,.04,.47,silver,0,.035,-.06);
  // Pair of monumental splayed fins; roofs rise towards the ends like a qin.
  for(const x of [-.34,.34]){const s=new THREE.Shape();s.moveTo(x*.68,.04);s.lineTo(x- .07,.41);s.lineTo(x+.07,.41);s.lineTo(x*.68+.045,.04);s.closePath();k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.46,bevelEnabled:false}),silver,0,0,-.31);}
  const v=[],idx=[],N=48;for(let j=0;j<=12;j++)for(let i=0;i<=N;i++){const x=(i/N-.5)*.89,z=(j/12-.5)*.56-.06,y=.28+.15*Math.pow(Math.abs(x/.445),1.65)+.012*Math.cos(j/12*Math.PI);v.push(x,y,z);}for(let j=0;j<12;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;idx.push(a,a+1,a+N+1,a+1,a+N+2,a+N+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();silver.side=THREE.DoubleSide;k.mesh(g,geo,silver);
  for(let i=0;i<25;i++){const x=(i/24-.5)*.86;k.line(g,Array.from({length:9},(_,j)=>[x,.284+.15*Math.pow(Math.abs(x/.445),1.65)+.012*Math.cos(j/8*Math.PI),-.34+j/8*.56]),.0015,dark);}
  for(const z of [-.264,.144])for(let i=0;i<31;i++)k.box(g,.002,.21,.003,silver,(i/30-.5)*.65,.145,z);
  for(const z of [-.34,.22])k.line(g,Array.from({length:41},(_,i)=>{const x=(i/40-.5)*.89;return [x,.287+.15*Math.pow(Math.abs(x/.445),1.65),z];}),.003,light);
  stairs(k,g,.48,.16,.052,paving,0,.39,14);plaque(k,g,'琴台大剧院',.18,.028,0,.22,.151);
  for(const x of [-.42,.42])for(let j=0;j<5;j++)tree(k,g,x,-.02,-.24+j*.13,.060);
  return k.merge(g);
}

export function wuhanStation(k){
  const g=new THREE.Group(),silver=k.mat('#d4d6cf',.55,.3,'#8cacc6'),glass=k.mat('#34535e',.30,.4,'#cfc1a0'),structure=k.mat('#a5b6b7'),paving=k.mat('#b8b6a4'),road=k.mat('#687577'),white=k.mat('#e4dec9'),light=k.mat('#e4d5b2',.4,0,'#ffe2ae');glass.userData.night.intensity=.32;silver.userData.night.intensity=.12;light.userData.night.intensity=1.5;
  k.box(g,1.18,.04,.88,paving,0,-.016,.055);k.box(g,1.06,.10,.55,glass,0,.087,-.06);k.box(g,1.12,.018,.66,silver,0,.028,-.06);
  function point(b,u,t){const x=(b-4)*.118+(u-.5)*.118,z=(t-.5)*.67-.06;const center=Math.exp(-x*x/.018);return [x,.17+.105*center+.045*Math.sin(u*Math.PI)+.045*(1-Math.pow(2*t-1,2)),-.06+(t-.5)*(.67+.045*Math.cos(b))];}
  for(let b=0;b<9;b++){const v=[],idx=[],N=12,M=28;for(let j=0;j<=M;j++)for(let i=0;i<=N;i++)v.push(...point(b,i/N,j/M));for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;idx.push(a,a+1,a+N+1,a+1,a+N+2,a+N+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();silver.side=THREE.DoubleSide;k.mesh(g,geo,silver);for(const t of [0,1])k.line(g,Array.from({length:17},(_,i)=>point(b,i/16,t)),.0026,light);for(let u=0;u<=1;u+=.25)k.line(g,Array.from({length:29},(_,i)=>{const p=point(b,u,i/28);p[1]+=.001;return p;}),.001,structure);for(const t of [0,1]){const p=point(b,.5,t);k.beam(g,[(b-4)*.118,.04,p[2]],[p[0]-.045,p[1]-.015,p[2]],.003,structure);k.beam(g,[(b-4)*.118,.04,p[2]],[p[0]+.045,p[1]-.015,p[2]],.003,structure);}}
  for(let i=0;i<41;i++)k.box(g,.0017,.10,.003,structure,(i/40-.5)*1.05,.086,.217);
  k.box(g,1.12,.003,.068,road,0,.008,.34);for(let i=0;i<30;i++)k.box(g,.018,.001,.002,white,(i-14.5)*.036,.010,.34);
  for(const x of [-.40,-.28,.28,.40])for(let j=0;j<3;j++)tree(k,g,x,.004,.41+j*.045,.035);
  plaque(k,g,'武汉站',.16,.034,0,.165,.276);stairs(k,g,.27,.08,.034,paving,0,.29,8);
  return k.merge(g);
}

export function xinhai(k){
  const g=new THREE.Group(),red=k.mat('#a64632',.82,.03,'#c96a3f'),stone=k.mat('#93998b'),glass=k.mat('#354d52',.35,.3,'#e3bb7a'),line=k.mat('#bc654d'),lamp=k.mat('#d5c3a4',.5,0,'#ffd397');red.userData.night.intensity=.17;glass.userData.night.intensity=.65;lamp.userData.night.intensity=1.5;
  const outline=[[-.48,.24],[-.18,.24],[-.075,-.10],[.075,-.10],[.18,.24],[.48,.24],[.30,-.14],[0,-.39],[-.30,-.14]];
  const contour=outline.map(([x,z])=>new THREE.Vector2(x,z)),triangles=THREE.ShapeUtils.triangulateShape(contour,[]),v=[],idx=[];
  for(const y of [.095,.245])for(const [x,z] of outline){const scale=y<.1?.87:1;v.push(x*scale,y,z*scale);}
  for(const t of triangles){idx.push(...t.map(i=>i+outline.length));idx.push(t[2],t[1],t[0]);}for(let i=0;i<outline.length;i++){const j=(i+1)%outline.length,n=outline.length;idx.push(i,j,i+n,j,j+n,i+n);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();red.side=THREE.DoubleSide;k.mesh(g,geo,red);
  k.box(g,.90,.07,.60,glass,0,.040,-.035);k.box(g,1.04,.035,.91,stone,0,-.016,.04);
  // Sloping folded red wings and a sunken central approach, matching the south building.
  for(const sign of [-1,1]){k.line(g,[[sign*.075,.249,-.10],[sign*.18,.249,.24],[sign*.48,.249,.24]],.002,lamp);for(let i=0;i<13;i++){const x=sign*(.19+i*.019);k.line(g,[[x,.248,.21],[x*.57,.248,-.18]],.0008,line);}const skylight=k.box(g,.042,.004,.22,glass,sign*.20,.249,-.02);skylight.rotation.y=sign*-.37;for(let i=0;i<7;i++)k.box(g,.065,.003,.009,line,sign*.19,.254,-.09+i*.025);}
  stairs(k,g,.27,.17,.045,stone,0,.43,12);plaque(k,g,'辛亥革命博物院',.25,.026,0,.083,.269);
  for(const x of [-.48,.48])for(let i=0;i<6;i++)tree(k,g,x,-.015,-.30+i*.13,.062);
  const merged=k.merge(g);merged.scale.setScalar(.88);return merged;
}
