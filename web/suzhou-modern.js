import * as THREE from 'three';
import {palette,site,disc,grove,path,sign,finish,lit} from './suzhou-kit.js';

function straightRoof(k,g,p,x,y,z,w,d,h){
 const geo=new THREE.BufferGeometry(),v=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w*.25,h,0],[w*.25,h,0]],indices=[0,4,5,0,5,1,1,5,2,2,5,4,2,4,3,3,4,0];geo.setAttribute('position',new THREE.Float32BufferAttribute(v.flat(),3));geo.setIndex(indices);const flat=geo.toNonIndexed();geo.dispose();flat.computeVertexNormals();k.mesh(g,flat,p.tile,x,y,z);
 for(const [a,b]of [[0,1],[1,2],[2,3],[3,0],[4,5],[0,4],[1,5],[2,5],[3,4]])k.beam(g,v[a].map((q,i)=>q+[x,y,z][i]),v[b].map((q,i)=>q+[x,y,z][i]),.002,p.stone);
}
function gallery(k,g,p,{x,z,w,d,h=.14}){
 k.box(g,w,h,d,p.wall,x,.026+h/2,z);k.box(g,w+.004,.008,d+.004,p.tile,x,.030,z);straightRoof(k,g,p,x,.026+h,z,w+.015,d+.018,.065);
 const pane=lit(k,'#657b78',.36);
 for(const s of [-1,1]){k.box(g,w*.75,h*.55,.005,p.tile,x,.032+h*.45,z+s*(d/2+.001));k.box(g,w*.69,h*.48,.005,pane,x,.032+h*.45,z+s*(d/2+.004));for(let i=0;i<7;i++)k.box(g,.002,h*.50,.007,p.tile,x+(i/6-.5)*w*.70,.032+h*.45,z+s*(d/2+.007));}
}
export function museum(k){
 const g=new THREE.Group(),p=palette(k),height=site(k,g,.68,.61);disc(k,g,.53,.46,.022,p.pale);
 k.box(g,.68,.008,.46,p.water,0,.027,-.04);
 k.box(g,.80,.20,.025,p.wall,0,.125,-.32);k.box(g,.82,.009,.035,p.tile,0,.229,-.32);
 const rock=k.mat('#8e9188',.98);for(let i=0;i<11;i++){const shape=new THREE.Shape(),x=(i-5)*.061,h=.035+.065*(.5+.5*Math.sin(i*1.9));shape.moveTo(-.06,0);shape.lineTo(-.015,h);shape.lineTo(.015,h*.72);shape.lineTo(.05,0);shape.closePath();k.mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.014,bevelEnabled:false}),rock,x,.035,-.292+(i%3)*.01);}
 path(k,g,p,[[-.38,.13],[-.18,.13],[-.12,-.01],[.18,-.01],[.24,-.16],[.38,-.16]],.033,.043);
 k.cyl(g,.055,.055,.012,p.pale,-.14,.043,.18,8);
 gallery(k,g,p,{x:-.42,z:-.02,w:.17,d:.51,h:.14});gallery(k,g,p,{x:.42,z:-.02,w:.17,d:.51,h:.14});
 gallery(k,g,p,{x:0,z:.34,w:.34,d:.20,h:.20});gallery(k,g,p,{x:-.31,z:.34,w:.23,d:.15,h:.12});gallery(k,g,p,{x:.31,z:.34,w:.23,d:.15,h:.12});
 // Geometric lantern above the central hall, with a recessed pyramidal skylight.
 k.box(g,.13,.065,.12,p.wall,0,.321,.34);const glass=lit(k,'#7e9694',.30);straightRoof(k,g,{...p,tile:glass},0,.354,.34,.115,.105,.048);
 for(const x of [-.065,.065])k.box(g,.005,.073,.125,p.tile,x,.321,.34);
 for(const side of [-1,1]){const o=k.box(g,.022,.022,.002,p.tile,0,.323,.34+side*.061);o.rotation.z=Math.PI/4;}
 sign(k,g,'苏州博物馆',.116,.020,0,.204,.442,{background:'#dfded2',color:'#414b46'});
 grove(k,g,height,[[-.52,-.32,.18],[.52,-.31,.19],[-.55,.27,.15],[.53,.31,.14]]);
 return finish(k,g,{lamps:[[-.25,.03,.22],[.25,.03,.22]],visitors:[[-.18,.051,.13],[.10,.051,-.01],[.04,.025,.48]]});
}

export function orient(k){
 const g=new THREE.Group(),p=palette(k);site(k,g,.58,.49);disc(k,g,.39,.32,.021,p.pale);
 const shell=k.glass('#73919b','#f1d4a3',170);shell.roughness=.68;shell.metalness=.10;shell.userData.night.intensity=.56;shell.userData.orientArch=true;
 // The pointed inner arch is part of the silhouette, not a dark panel on a solid slab.
 const s=new THREE.Shape();s.moveTo(-.25,0);s.lineTo(-.25,1.07);s.quadraticCurveTo(-.24,1.27,-.15,1.29);s.lineTo(.15,1.29);s.quadraticCurveTo(.24,1.27,.25,1.07);s.lineTo(.25,0);s.lineTo(.085,0);s.lineTo(.085,.70);s.quadraticCurveTo(.075,.96,0,1.10);s.quadraticCurveTo(-.075,.96,-.085,.70);s.lineTo(-.085,0);s.closePath();
 k.mesh(g,new THREE.ExtrudeGeometry(s,{depth:.20,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,curveSegments:48}),shell,0,.035,-.10);
 const silver=k.mat('#b6c0bd',.66,.12),light=lit(k,'#a3b6b7',.43);light.userData.pulse={speed:.65,phase:1.3};
 for(let i=1;i<54;i++){const y=i*1.275/54,outer=y<1.07?.253:.15+.10*Math.sqrt(Math.max(0,1-((y-1.07)/.22)**2)),inner=y<.70?.086:y<1.10?.086*Math.sqrt((1.10-y)/.40):0;for(const side of [-1,1]){const w=outer-inner;if(w>.008)for(const z of [-.110,.110])k.box(g,w,.0026,.003,silver,side*(inner+w/2),.035+y,z);}}
 for(const side of [-1,1]){const points=[[side*.246,.05,.113],[side*.246,1.09,.113],[side*.22,1.25,.113],[side*.15,1.325,.113]];k.line(g,points,.0022,light);for(let j=0;j<5;j++)k.box(g,.002,1.02,.004,silver,side*(.10+j*.031),.56,.112);}
 k.box(g,.56,.023,.26,p.stone,0,.031,0);k.box(g,.57,.004,.27,p.pale,0,.046,0);
 return finish(k,g,{lamps:[[-.31,.03,.20],[.31,.03,.20]],visitors:[[-.14,.025,.23],[.04,.025,.26]]});
}
