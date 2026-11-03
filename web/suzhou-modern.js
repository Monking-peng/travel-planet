import * as THREE from 'three';
import {palette,site,disc,grove,path,sign,finish,lit} from './suzhou-kit.js';

export {museum} from './suzhou-museum.js';

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
