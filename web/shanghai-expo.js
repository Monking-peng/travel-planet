import * as THREE from 'three';

// Reference-led silhouettes. Distances are compressed for this miniature city.
export function artMuseum(k){
  const g=new THREE.Group(),red=k.mat('#a52f24',.73,.08,'#df4628'),shade=k.mat('#5d211d'),trim=k.mat('#c33e29',.65,.12,'#ff673b'),glass=k.mat('#344b50',.35,.3,'#d7ad6c'),pave=k.mat('#bdbdb0');
  red.userData.night.intensity=.28;trim.userData.night.intensity=.65;glass.userData.night.intensity=.3;
  // Four paired piers and the open ground floor support the cantilevered dougong crown.
  for(const x of [-.09,.09])for(const z of [-.07,.07]){
    k.box(g,.039,.118,.037,red,x,.074,z);k.box(g,.013,.112,.039,glass,x,.074,z+.001);
  }
  for(let i=0;i<7;i++){
    const w=.235+i*.026,d=.20+i*.025,y=.136+i*.017;
    k.box(g,w,.012,d,red,0,y);k.box(g,w-.013,.004,d-.013,shade,0,y-.008);
    for(let j=-4;j<=4;j++){
      k.box(g,.010,.010,d+.011,trim,j*w/10,y-.004);
      k.box(g,w+.011,.010,.010,trim,0,y-.004,j*d/10);
    }
    if(i<6)k.box(g,w-.045,.009,d-.045,glass,0,y+.009);
  }
  k.box(g,.409,.009,.374,red,0,.251);
  for(let i=0;i<12;i++)for(const side of [-1,1]){
    k.box(g,.30-i*.004,.0025,.008,pave,0,.0025+i*.0018,side*(.166-i*.007));
  }
  for(const side of [-1,1]){
    k.box(g,.075,.033,.25,pave,side*.25,.0165);k.box(g,.078,.004,.254,glass,side*.25,.035);
    for(let i=0;i<12;i++)k.box(g,.078,.025,.002,trim,side*.25,.018,-.11+i*.020);
  }
  k.box(g,.35,.004,.09,pave,0,.001,.21);
  return k.merge(g);
}

export function expoArena(k){
  const g=new THREE.Group(),shell=k.mat('#e0ddd0',.55,.24,'#b4b6da'),seam=k.mat('#adb5b2',.7,.2),glass=k.mat('#344e57',.28,.36,'#8ab9d9'),rim=k.mat('#d6d9cb',.45,.25,'#accbeb'),stone=k.mat('#b9b9a7'),lawn=k.mat('#85966b');
  shell.userData.night.intensity=.11;glass.userData.night.intensity=.65;rim.userData.night.intensity=.85;rim.userData.pulse={phase:3,speed:.7,min:.55};rim.userData.night.alternateColor=new THREE.Color('#b7a0df');
  const radial=1.35,profile=[[.13,.038],[.19,.060],[.25,.100],[.282,.145],[.284,.157],[.264,.175],[.215,.195],[.13,.210],[0,.215]];
  const geo=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),96);geo.scale(radial,1,1);k.mesh(g,geo,shell);
  const band=k.cyl(g,.284,.282,.012,glass,0,.151,0,96);band.scale.x=radial;
  for(const y of [.144,.158]){const o=k.ring(g,.285,.0016,rim,y);o.scale.x=radial;}
  // Continuous glass edge and fine radial panel seams follow the suspended bowl.
  for(let i=0;i<64;i++){
    const a=i*Math.PI/32;k.line(g,profile.slice(4).map(([r,y])=>[Math.sin(a)*r*radial,y+.0008,Math.cos(a)*r]),.00045,seam);
    k.beam(g,[Math.sin(a)*.283*radial,.145,Math.cos(a)*.283],[Math.sin(a)*.285*radial,.158,Math.cos(a)*.285],.0007,seam);
  }
  for(const [r,y] of [[.13,.210],[.215,.195],[.264,.175]]){const o=k.ring(g,r,.0005,seam,y+.001);o.scale.x=radial;}
  // Broad glazed concourse and inclined supports ground the shell in a terraced slope.
  const podium=k.cyl(g,.20,.22,.037,glass,0,.022,0,64);podium.scale.x=radial;
  for(let i=0;i<48;i++){const a=i*Math.PI/24;k.beam(g,[Math.sin(a)*.216*radial,.004,Math.cos(a)*.216],[Math.sin(a)*.202*radial,.040,Math.cos(a)*.202],.0016,shell);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;k.beam(g,[Math.sin(a)*.16*radial,.015,Math.cos(a)*.16],[Math.sin(a)*.22*radial,.081,Math.cos(a)*.22],.012,shell,8);}
  for(let i=0;i<4;i++){const p=k.cyl(g,.235+i*.017,.244+i*.017,.006,stone,0,.013-i*.005,0,72);p.scale.set(radial,1,1);}
  for(const side of [-1,1]){
    k.box(g,.15,.045,.034,glass,0,.024,side*.24);k.box(g,.17,.005,.05,shell,0,.050,side*.24);
    for(let j=-4;j<=4;j++)k.box(g,.002,.042,.036,shell,j*.016,.024,side*.24);
    for(let i=0;i<9;i++)k.box(g,.17,.003,.012,stone,0,.025-i*.003,side*(.268+i*.010));
  }
  const slope=k.mesh(g,new THREE.SphereGeometry(.25,48,12,0,Math.PI*2,0,Math.PI/2),lawn,0,-.065);slope.scale.set(1.65,.28,1.45);
  return k.merge(g);
}
