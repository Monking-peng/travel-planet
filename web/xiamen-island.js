import * as THREE from 'three';
import {palette,site,paving,steps,grove,sign,finish,hip,skin,TAU,edge,window,railing,palm,granite,sea,hall} from './xiamen-kit.js';

export {bagua} from './xiamen-bagua.js';
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
