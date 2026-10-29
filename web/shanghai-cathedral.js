import * as THREE from 'three';
import {groundPatch,groundRect,gardenTree} from './shanghai-heritage.js';

// Xujiahui's red brick, paired slate spires, lancet windows and cruciform nave.
export function cathedral(k){
  const g=new THREE.Group(),brick=k.mat('#914b3b',.94,0),cream=k.mat('#d6c6ac'),roof=k.mat('#596765',.83,.12),dark=k.mat('#394b4e',.50,.15),warm=k.mat('#c2af88',.7,.05,'#e7b66a');
  warm.userData.night.intensity=.62;
  const blue=k.mat('#52758c',.45,.15,'#648dc4'),red=k.mat('#a54840',.5,.1,'#d96f54'),gold=k.mat('#a99051',.5,.1,'#e7c779');for(const m of [blue,red,gold])m.userData.night.intensity=.8;
  groundPatch(k,g,[[-.40,-.44],[.40,-.44],[.44,.25],[.32,.48],[-.32,.48],[-.44,.25]],k.mat('#cac5b7'),.01);
  groundRect(k,g,0,.32,.48,.19,cream,.016);
  function pitched(x,z,w,d,y,h,parent=g){
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});k.mesh(parent,geo,roof,x,y,z-d/2);
    for(let i=0;i<12;i++){const zz=z-d/2+i*d/11;k.beam(parent,[x-w/2,y,zz],[x,y+h,zz],.0006,dark);k.beam(parent,[x,y+h,zz],[x+w/2,y,zz],.0006,dark);}
    k.beam(parent,[x,y+h,z-d/2],[x,y+h,z+d/2],.002,cream);
  }
  function lancet(parent,x,y,z,w,h,mat){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h*.65);shape.quadraticCurveTo(w*.42,h*.88,0,h);shape.quadraticCurveTo(-w*.42,h*.88,-w/2,h*.65);shape.closePath();
    k.mesh(parent,new THREE.ShapeGeometry(shape,8),mat,x,y,z);
    k.line(parent,[[x-w/2,y,z+.001],[x-w/2,y+h*.65,z+.001],[x-w*.32,y+h*.85,z+.001],[x,y+h,z+.001],[x+w*.32,y+h*.85,z+.001],[x+w/2,y+h*.65,z+.001],[x+w/2,y,z+.001]],.0022,cream);
  }
  k.box(g,.27,.235,.60,brick,0,.13,-.05);pitched(0,-.05,.29,.64,.247,.10);
  k.box(g,.51,.16,.16,brick,0,.095,-.16);const transept=new THREE.Group();transept.position.z=-.16;transept.rotation.y=Math.PI/2;g.add(transept);pitched(0,0,.19,.54,.175,.075,transept);
  // Side aisles and repeating buttresses; tall nave rises clearly above both aisles.
  for(const side of [-1,1]){
    k.box(g,.10,.12,.52,brick,side*.17,.067,-.05);pitched(side*.17,-.05,.12,.55,.127,.036);
    for(let i=0;i<6;i++){
      const z=.15-i*.086;k.box(g,.024,.185,.021,cream,side*.23,.095,z);k.box(g,.032,.035,.032,brick,side*.23,.021,z);
      const a=new THREE.Group();a.position.set(side*.222,0,z-.037);a.rotation.y=side*Math.PI/2;g.add(a);lancet(a,0,.045,0,.038,.073,blue);k.box(a,.002,.067,.002,cream,0,.082,.002);
      const b=new THREE.Group();b.position.set(side*.136,0,z-.037);b.rotation.y=side*Math.PI/2;g.add(b);lancet(b,0,.175,0,.029,.047,gold);
      k.beam(g,[side*.23,.17,z],[side*.137,.235,z],.0035,cream);
    }
  }
  // Front gable, rose window and three pointed portals.
  const front=.264;k.box(g,.30,.22,.031,brick,0,.125,front);
  const face=new THREE.Shape();face.moveTo(-.15,0);face.lineTo(.15,0);face.lineTo(0,.115);face.closePath();k.mesh(g,new THREE.ExtrudeGeometry(face,{depth:.033,bevelEnabled:false}),brick,0,.235,front-.016);
  for(const x of [-.09,0,.09]){lancet(g,x,.018,front+.017,.060,.092,dark);k.box(g,.002,.063,.003,cream,x,.05,front+.021);lancet(g,x,.118,front+.019,.024,.046,gold);}
  const rose=new THREE.Group();rose.position.set(0,.208,front+.019);g.add(rose);
  const disk=k.mesh(rose,new THREE.CircleGeometry(.035,48),blue);
  const rim=k.mesh(rose,new THREE.TorusGeometry(.036,.003,5,48),cream);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i+1)/12*Math.PI*2;const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.001,.031*Math.cos(a),.031*Math.sin(a),.001,.031*Math.cos(b),.031*Math.sin(b),.001],3));geom.computeVertexNormals();k.mesh(rose,geom,i%2?red:gold);k.beam(rose,[0,0,.003],[.033*Math.cos(a),.033*Math.sin(a),.003],.0012,cream);}
  for(const side of [-1,1])k.beam(g,[side*.15,.235,front+.02],[0,.35,front+.02],.004,cream);
  for(const side of [-1,1]){
    const x=side*.204,z=.215;k.box(g,.102,.385,.11,brick,x,.20,z);
    for(const y of [.032,.14,.267,.365,.396])k.box(g,.112,.010,.12,cream,x,y,z);
    for(const sx of [-1,1])for(const sz of [-1,1]){k.box(g,.012,.35,.012,cream,x+sx*.05,.19,z+sz*.054);k.cyl(g,0,.009,.038,roof,x+sx*.052,.418,z+sz*.057,4);}
    lancet(g,x,.284,z+.056,.047,.074,dark);lancet(g,x,.172,z+.056,.029,.067,blue);lancet(g,x,.05,z+.056,.025,.065,gold);
    for(let y=.289;y<.337;y+=.007)k.box(g,.040,.0025,.002,cream,x,y,z+.059);
    // Steep eight-sided slate spire, with seams and a cross above each tower.
    k.cyl(g,0,.077,.235,roof,x,.519,z,8);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;k.beam(g,[x+.077*Math.sin(a),.401,z+.077*Math.cos(a)],[x,.637,z],.0016,cream);}
    k.beam(g,[x,.63,z],[x,.685,z],.0018,cream);k.beam(g,[x-.014,.672,z],[x+.014,.672,z],.0018,cream);
    for(const sx of [-1,1])k.box(g,.003,.345,.004,warm,x+sx*.047,.204,z+.061);
  }
  const mortar=k.mat('#aa7760',.95,0);
  for(let row=0;row<48;row++){
    const y=.024+row*.0076;
    for(const x of [-.204,.204]){
      if((y>.05&&y<.122)||(y>.172&&y<.24)||(y>.284&&y<.358))continue;k.box(g,.098,.00055,.001,mortar,x,y,.271);
      for(let col=0;col<7;col++){const xx=x-.045+col*.014+(row%2)*.007;if(xx>x+.047)continue;k.box(g,.0006,.006,.001,mortar,xx,y+.003,.271);}
    }
  }
  // Recessed windows remain in front of the brick joints.
  k.beam(g,[0,.345,front],[0,.386,front],.0017,cream);k.beam(g,[-.012,.373,front],[.012,.373,front],.0017,cream);
  for(let i=0;i<5;i++)k.box(g,.55,.005,.025,cream,0,.001+i*.004,.36-i*.02);
  const leaves=k.mat('#6f8765'),trunk=k.mat('#7c725b');for(const x of [-.34,.34])for(const z of [-.32,-.16,.0,.16])gardenTree(k,g,x,z,.052,leaves,trunk);
  for(const x of [-.29,.29])for(const z of [.35,-.28]){k.cyl(g,.002,.003,.045,dark,x,.008,z);k.ball(g,.006,warm,x,.035,z);}
  return k.merge(g);
}
