import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hip,skin,TAU,edge,window,railing,palm,granite,sea,hall} from './xiamen-kit.js';

export function bagua(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.63,.53);paving(k,g,p,.48,.39);
 const terra=k.mat('#a7462b',.88);k.box(g,.66,.044,.42,p.stone,0,.045,0);k.box(g,.57,.28,.31,p.brick,0,.20,-.018);
 for(const y of [.075,.215,.355]){k.box(g,.68,.014,.43,p.pale,0,y,0);for(const z of [-.216,.216])k.box(g,.68,.004,.009,edge(k,p.pale.color),0,y-.002,z);}
 for(const y of [.078,.218])for(const s of [-1,1]){
  for(let i=0;i<7;i++){const x=(i/6-.5)*.61;k.cyl(g,.009,.011,.13,p.pale,x,y+.065,s*.192,12);k.cyl(g,.013,.013,.009,p.pale,x,y+.121,s*.192,12);}
  for(let i=0;i<6;i++)window(k,g,p,(i/5-.5)*.49,y+.065,s*.161,.048,.095);
  for(const x of [-.307,.307])for(const z of [-.09,0,.09])k.cyl(g,.009,.011,.13,p.pale,x,y+.065,z,12);
 }
 for(const s of [-1,1])railing(k,g,p,[[-.32,.226,s*.204],[.32,.226,s*.204]],.032);
 skin(k,g,(u,v)=>{const a=u*TAU,c=Math.cos(a),s=Math.sin(a),norm=Math.max(Math.abs(c),Math.abs(s)),x=c/norm*.305,z=s/norm*.18;return [x*v+THREE.MathUtils.clamp(x,-.12,.12)*(1-v),.36+.07*(1-v),z*v];},8,96,terra);
 k.cyl(g,.128,.128,.105,p.pale,0,.455,0,8);k.cyl(g,.136,.136,.012,p.pale,0,.511,0,8);
 const dark=edge(k,'#4c3f35','#f1cd91',.26);for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8,face=new THREE.Group();face.position.set(Math.sin(a)*.120,.465,Math.cos(a)*.120);face.rotation.y=a;g.add(face);for(const x of [-.030,0,.030]){k.box(face,.019,.063,.003,dark,x,0,0);k.mesh(face,new THREE.CircleGeometry(.0095,20,0,Math.PI),dark,x,.031,.001);}for(const x of [-.045,.045])k.cyl(face,.003,.003,.087,p.pale,x,0,0,8);}
 const dome=(u,v)=>{const a=u*TAU,local=((a+Math.PI/8)%(Math.PI/4))-Math.PI/8,r=.131*Math.cos(Math.PI/8)/Math.cos(local)*Math.cos(v*Math.PI/2);return [Math.sin(a)*r,.519+Math.sin(v*Math.PI/2)*.144,Math.cos(a)*r];};skin(k,g,dome,24,96,terra);
 for(let i=0;i<8;i++)k.line(g,Array.from({length:18},(_,j)=>dome((i+.5)/8,j/17)),.0018,k.mat('#884e32',.88));k.beam(g,[0,.66,0],[0,.713,0],.0015,p.gold);k.ball(g,.003,p.gold,0,.714,0);
 steps(k,g,p,0,.32,.22,9,.052,.10);sign(k,g,'八卦楼',.075,.026,0,.313,.164);
 grove(k,g,(x,z)=>ground(x,z)+.018,[[-.47,-.2,.19],[.46,-.16,.18],[-.37,.30,.12],[.37,.29,.13]]);
 return finish(k,g,{lamps:[[-.29,.025,.31],[.29,.025,.31]],visitors:[[-.08,.025,.35],[.14,.025,.30],[.23,.025,.31]]});
}
export function sunlight(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.64,.56);p.stone=k.mat('#b6b5a5',.98);
 granite(k,g,p,{x:-.15,y:.005,z:-.02,rx:.24,ry:.42,rz:.23,seed:2});granite(k,g,p,{x:.18,y:.005,z:.02,rx:.21,ry:.34,rz:.23,seed:4});
 const geo=new THREE.SphereGeometry(1,56,40),a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),yy=Math.min(.95,(y+1)/2),t=(y+1)/2,n=1+.025*Math.sin(z*7+x*9);a.setXYZ(i,x*.23*n*(.9+.1*Math.sin(t*4)),.06+yy*.59,z*.20*n);}
 geo.computeVertexNormals();p.stone.userData.sunlightRock=true;k.mesh(g,geo,p.stone);
 const fissure=k.mat('#98998d',.99);for(let i=0;i<7;i++){const x=-.16+i*.052;k.line(g,[[x,.11,.173],[x+.011,.24,.189],[x-.004,.39,.167],[x+.007,.50,.113]],.001,fissure);}
 k.box(g,.136,.012,.105,p.pale,0,.623,-.005);railing(k,g,p,[[-.07,.63,-.061],[.07,.63,-.061],[.07,.63,.049],[-.07,.63,.049],[-.07,.63,-.061]],.034);
 // A narrow stone stair follows the boulder rather than floating to its summit.
 const path=[[-.28,.06,.20],[-.19,.19,.20],[.14,.37,.17],[.13,.49,.085],[.04,.62,.03]],front=q=>[q.x,q.y,Math.max(q.z,.20*Math.sqrt(Math.max(0,1-(q.x/.23)**2-((q.y-.06)/.59*2-1)**2))+.018)];
 for(let j=1;j<path.length;j++){const av=new THREE.Vector3(...path[j-1]),bv=new THREE.Vector3(...path[j]),N=12,rail=[];for(let i=0;i<=N;i++){const q=front(av.clone().lerp(bv,i/N));rail.push([q[0],q[1]+.007,q[2]+.025]);if(i<N){k.box(g,.043,.013,.043,p.pale,...q);k.box(g,.039,.026,.055,p.stone,q[0],q[1]-.016,q[2]-.014);}}railing(k,g,p,rail,.027);}
 grove(k,g,(x,z)=>ground(x,z)+.018,Array.from({length:15},(_,i)=>{const a=i/15*TAU;return [Math.sin(a)*.43,Math.cos(a)*.34,.12+.045*Math.sin(i*3)**2];}));sign(k,g,'日光岩',.08,.028,-.25,.14,.245,{background:'#aaa997',color:'#8b3e2b'});
 return finish(k,g,{visitors:[[0,.632,.02],[.05,.632,-.02],[-.30,.025,.28]]});
}
export function shuzhuang(k){
 const g=new THREE.Group(),p=palette(k),ground=site(k,g,.66,.55);paving(k,g,p,.47,.40);sea(k,g,p,.57,.32,0,.13);
 // Shoreward garden buildings stay on land; the 44 Bridge is an elevated sea walk.
 k.box(g,.68,.025,.22,p.pale,-.04,.031,-.24);hall(k,g,p,{x:-.13,z:-.25,w:.37,d:.20,h:.15});hall(k,g,p,{x:.23,z:-.25,w:.20,d:.16,h:.13});
 const pts=[[-.40,.075,-.14],[-.41,.075,.04],[-.29,.075,.16],[-.30,.075,.30],[-.10,.075,.34],[.05,.075,.25],[.24,.075,.29],[.39,.075,.16],[.40,.075,-.14]];
 const bridgeMat=p.stone;bridgeMat.userData.shuzhuangBridge=true;
 for(let j=1;j<pts.length;j++){const a=new THREE.Vector3(...pts[j-1]),b=new THREE.Vector3(...pts[j]),v=b.clone().sub(a),c=a.clone().add(b).multiplyScalar(.5),o=k.box(g,.052,.014,v.length()+.008,bridgeMat,c.x,c.y,c.z);o.rotation.y=Math.atan2(v.x,v.z);const perp=new THREE.Vector3(v.z,0,-v.x).normalize().multiplyScalar(.024);for(const side of [-1,1])railing(k,g,p,[a.clone().addScaledVector(perp,side).add(new THREE.Vector3(0,.007,0)).toArray(),b.clone().addScaledVector(perp,side).add(new THREE.Vector3(0,.007,0)).toArray()],.032);const n=Math.ceil(v.length()/.065);for(let i=0;i<n;i++){const q=a.clone().lerp(b,(i+.5)/n);k.cyl(g,.006,.008,.048,p.stone,q.x,.047,q.z,8);}}
 for(const [x,z,rx,ry]of [[-.42,-.10,.11,.09],[.40,-.05,.12,.10],[.36,.17,.07,.07],[-.31,.18,.06,.05]])granite(k,g,p,{x,y:.02,z,rx,ry,rz:rx*.85});
 const pavilion=new THREE.Group();pavilion.position.set(.24,.082,.29);g.add(pavilion);for(const x of [-.038,.038])for(const z of [-.038,.038])k.cyl(pavilion,.003,.004,.09,p.red,x,.045,z,8);hip(k,pavilion,.115,.115,.048,.09,p.tile,edge(k,p.tile.color));
 for(const [x,z]of [[-.40,-.28],[.39,-.25]])palm(k,g,p,x,.025,z,.19);
 return finish(k,g,{lamps:[[-.40,.025,-.16],[.40,.025,-.17]],visitors:[[0,.082,.28],[-.30,.082,.29],[.15,.025,-.12]]});
}
