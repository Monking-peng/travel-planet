import * as THREE from 'three';
import {palette,site,paving,steps,grove,finish,archPane,gable,pyramid,cross,masonry,clockFace,lit,sign,TAU} from './qingdao-kit.js';
export {church} from './qingdao-church.js';
export function station(k){
 const g=new THREE.Group(),p=palette(k),h=site(k,g,.69,.48);paving(k,g,p,.60,.34);
 k.box(g,1.04,.25,.29,p.wall,0,.16,-.03);const roof=new THREE.Group();roof.position.z=-.03;roof.rotation.y=Math.PI/2;g.add(roof);gable(k,roof,p,.32,1.10,.12,.285);
 // The clock is offset beside the gabled entrance, as on the historic east facade.
 const x=-.19,z=.035;k.box(g,.19,.57,.20,p.wall,x,.32,z);masonry(k,g,p,.19,.57,.20,x,.035,z);pyramid(k,g,p,.235,.26,.605,x,z);
 for(const y of [.32,.56,.60])k.box(g,.207,.01,.215,p.pale,x,y,z);
 for(const [a,b]of [[0,1],[1,0],[-1,0],[0,-1]]){const q=new THREE.Group();q.position.set(x+a*.105,.61,z+b*.105);q.rotation.y=Math.atan2(a,b);g.add(q);const ped=new THREE.Shape();ped.moveTo(-.104,0);ped.lineTo(.104,0);ped.lineTo(0,.153);ped.closePath();k.mesh(q,new THREE.ShapeGeometry(ped),p.wall);clockFace(k,q,p,0,.058,.003,.041);}
 k.cyl(g,.004,.006,.055,p.gold,x,.890,z,8);const star=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*TAU,r=i%2?.007:.017;i?star.lineTo(Math.sin(a)*r,Math.cos(a)*r):star.moveTo(Math.sin(a)*r,Math.cos(a)*r);}star.closePath();k.mesh(g,new THREE.ExtrudeGeometry(star,{depth:.003,bevelEnabled:false}),p.red,x,.927,z);
 for(const dx of [-.043,.043])for(const y of [.155,.215])archPane(k,g,p,x+dx,y,.138,.021,.045);
 const doorX=.125;k.box(g,.255,.29,.018,p.wall,doorX,.181,.129);const ped=new THREE.Shape();ped.moveTo(-.143,0);ped.lineTo(.143,0);ped.lineTo(.110,.045);ped.lineTo(.085,.045);ped.lineTo(.085,.10);ped.lineTo(.060,.10);ped.lineTo(0,.19);ped.lineTo(-.060,.10);ped.lineTo(-.085,.10);ped.lineTo(-.085,.045);ped.lineTo(-.110,.045);ped.closePath();k.mesh(g,new THREE.ExtrudeGeometry(ped,{depth:.018,bevelEnabled:false}),p.wall,doorX,.326,.120);
 for(const dx of [-.086,0,.086]){archPane(k,g,p,doorX+dx,.034,.151,.056,.123,{door:true});archPane(k,g,p,doorX+dx,.204,.151,.030,.080);}
 for(const xx of [-.46,-.355,.35,.455]){archPane(k,g,p,xx,.044,.119,.055,.099,{door:true});archPane(k,g,p,xx,.177,.119,.035,.063);}
 for(const xx of [-.435,-.34,.34,.435]){k.box(g,.052,.033,.025,p.wall,xx,.325,.090);gable(k,g,p,.063,.040,.027,.341,xx,.09);}
 sign(k,g,'青岛站',.115,.027,.125,.294,.154,{background:'#d2c5a5',color:'#404c46'});grove(k,g,h,[[-.58,-.24,.12],[.58,-.24,.13]]);
 return finish(k,g,{lamps:[[-.47,.024,.27],[.47,.024,.27]],visitors:[[-.10,.024,.24],[.14,.024,.27],[.2,.024,.27]]});
}
export {huashi} from './qingdao-huashi.js';
