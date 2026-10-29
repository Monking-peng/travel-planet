import * as THREE from 'three';
export function addLandmarkLife(k,g,id){
  const spaces={crane:[.21,.29],customs:[.24,.23],qingchuan:[.22,.21],guqintai:[.21,.12],museum:[.36,.26],han:[.23,.27],gude:[.21,.23],qintai:[.28,.27],station:[.32,.30],xinhai:[.25,.31],artmuseum:[.32,.25],baotong:[.16,.29]};
  const sp=spaces[id];if(!sp)return;
  const skin=k.mat('#b99576'),dark=k.mat('#3f5956'),colors=['#b66850','#638987','#af9f6f','#d7cdb7'].map(c=>k.mat(c));const people=new THREE.Group();
  for(let i=0;i<8;i++){const x=(i/7-.5)*sp[0]*1.5,z=sp[1]+(i%3)*.017;if(id==='university'&&Math.abs(x)<.10)continue;const y=id==='museum'?.016:.035;k.cyl(people,.0045,.0055,.018,colors[i%4],x,y+.018,z,6);k.ball(people,.005,skin,x,y+.032,z);for(const s of [-1,1])k.cyl(people,.0018,.0018,.012,dark,x+s*.0025,y+.005,z,5);}
  k.merge(people);g.add(people);
  if(['crane','customs','qingchuan','gude','qintai','station','artmuseum','baotong'].includes(id)){const light=new THREE.PointLight('#ffce8d',0,.8,2);light.position.set(0,.15,sp[1]+.05);light.userData.nightIntensity=.055;g.add(light);}
  // Soft light pools belong to their landmark, so hiding a building also removes its light.
  const pixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,r=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5);pixels.set([255,198,110,Math.round(Math.max(0,1-r)**2*145)],i);}
  const tex=new THREE.DataTexture(pixels,32,32);tex.needsUpdate=true;const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});k.materials.push(m);
  for(const s of [-1,1]){const glow=k.mesh(g,new THREE.PlaneGeometry(.24,.24),m,s*sp[0]*.65,.025,sp[1]);glow.rotation.x=-Math.PI/2;glow.userData.nightOnly=true;glow.raycast=()=>{};glow.visible=false;}
}
