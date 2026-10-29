import * as THREE from 'three';

// A compressed streetscape informed by Lujiazui Central Green, not a survey map.
export function addPudongGround({k,landscape,surface,anchor,strip,street,riverX,lampMetal,lampGlow,landmarkInfo,moduleRoot}){
  const stone=k.mat('#c8c7b6',.94,0),brick=k.mat('#ba8d71',.96,0),lawn=k.mat('#829c72',1,0),pond=k.mat('#638d86',.36,.12);
  const poolLight=k.mat('#a9b0a0',.9,0,'#afbe91');poolLight.userData.night.intensity=.09;
  const edgeLight=k.mat('#cac5ac',.6,.1,'#ffd6a0');edgeLight.userData.night.intensity=.7;
  const sample=(points,closed=false,count=64)=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),closed,'centripetal').getPoints(count).map(p=>[p.x,p.z]);
  const ellipse=(x,z,rx,rz)=>Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return [x+Math.cos(a)*rx,z+Math.sin(a)*rz];});
  function patch(points,material,lift,target=landscape){
    const contour=points.map(([x,z])=>new THREE.Vector2(x,z));
    if(contour[0].distanceTo(contour.at(-1))<.0001)contour.pop();
    const vertices=[];
    function triangle(a,b,c,depth=0){
      if(depth<5&&Math.max(a.distanceTo(b),b.distanceTo(c),c.distanceTo(a))>.055){
        const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
        triangle(a,ab,ca,depth+1);triangle(ab,b,bc,depth+1);triangle(ca,bc,c,depth+1);triangle(ab,bc,ca,depth+1);return;
      }
      for(const p of [a,c,b])vertices.push(...surface(p.x,p.y,lift));
    }
    for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(contour,[]))triangle(contour[a],contour[b],contour[c]);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();k.mesh(target,geometry,material);
  }
  function lamp(x,z,short=false){
    const g=new THREE.Group(),h=short?.019:.043;k.cyl(g,.002,.003,h,lampMetal,0,h/2,0,6);k.box(g,.009,.004,.009,lampGlow,0,h+.003);landscape.add(anchor(g,x,z));
  }
  // Complete the street perimeter and connect both ends to the riverside road.
  const north=[riverX(-1.01)+.225,-1.01],south=[riverX(.97)+.225,.97];
  const outer=sample([north,[.53,-1.01],[1.25,-.94],[1.55,-.65],[1.60,-.08],[1.48,.52],[1.25,.92],[.71,.97],south],false,120);
  street(outer,.044);
  const cross=sample([[riverX(-.38)+.225,-.38],[.48,-.38],[.72,-.35],[.83,-.15],[.86,.15],[1.10,.25],[1.57,.28]],false,65);street(cross,.035);
  street(sample([[.42,-.98],[.43,-.48],[.34,-.12],[.35,.27],[.53,.37],[.72,.45],[.76,.73],[.73,.97]],false,70),.027);
  // Oval forecourts keep each landmark free-standing and lead into the street network.
  for(const [id,rx,rz,exit] of [
    ['pearl',.215,.21,[[.39,-.77],[.43,-.68]]],
    ['jinmao',.157,.155,[[.72,.03],[.86,.09]]],
    ['swfc',.152,.15,[[1.08,-.32],[.83,-.15]]],
    ['tower',.187,.177,[[.85,.64],[.76,.73]]],
  ]){const {x,z}=landmarkInfo.find(item=>item.id===id),target=moduleRoot?.(id)??landscape;patch(ellipse(x,z,rx,rz),stone,.010,target);strip(ellipse(x,z,rx*.96,rz*.96),.003,edgeLight,.018,target);strip(sample(exit),.027,stone,.020,target);}
  for(let i=4;i<outer.length-4;i+=8){const [x,z]=outer[i];lamp(x+.033,z);}
  for(let i=7;i<cross.length-3;i+=10){const [x,z]=cross[i];lamp(x,z+.033);}
  // Two narrow crossing bands read as a city street, without covering the whole block.
  for(const [x,z,turn] of [[.43,-.38,0],[.86,.15,1],[.73,.97,0]])for(let i=-2;i<=2;i++){
    const dx=turn?i*.008:0,dz=turn?0:i*.008;strip([[x+dx-(turn?0:.015),z+dz-(turn?.015:0)],[x+dx+(turn?0:.015),z+dz+(turn?.015:0)]],.0038,stone,.027);
  }

  const shift=([x,z])=>[x+.22,z-.04];
  const parkPatch=(points,m,lift)=>patch(points.map(shift),m,lift);
  const parkStrip=(points,w,m,lift)=>strip(points.map(shift),w,m,lift);
  const parkAnchor=(g,x,z,lift)=>anchor(g,x+.22,z-.04,lift);
  const parkLamp=(x,z,short)=>lamp(x+.22,z-.04,short);
  strip([[riverX(-1.21)+.225,-1.21],[riverX(-1.17)+.445,-1.21]],.026,stone,.022);
  const cx=.68,cz=-1.12,park=ellipse(cx,cz,.40,.28);parkPatch(park,lawn,.010);
  const loop=ellipse(cx,cz,.355,.235);parkStrip(loop,.022,brick,.020);
  parkStrip(sample([[.68,-.86],[.69,-.94],[.89,-1.02],[.97,-1.19]]),.024,brick,.022);
  parkStrip(sample([[riverX(-1.17)+.225,-1.17],[.22,-1.17],[.30,-1.16],[.40,-1.03],[.53,-.97]]),.026,stone,.022);
  const shore=sample([[-.16,-.06],[-.12,-.20],[-.02,-.24],[.09,-.18],[.10,-.06],[.16,.01],[.10,.08],[.04,.10],[.03,.17],[-.06,.13],[-.07,.02]].map(([x,z])=>[cx+x*.84,cz+z*.84]),true,80);
  parkPatch(shore,pond,.021);parkStrip(shore,.009,stone,.025);
  const terrace=ellipse(.62,-.97,.098,.058);parkPatch(terrace,stone,.022);
  parkStrip(sample([[.34,-1.03],[.48,-.96],[.62,-.97],[.83,-.96],[.97,-1.04]]),.018,brick,.024);
  // The real lakeside shelter is a white tensile canopy with an open underside.
  const fabric=k.mat('#e4e4d6',.85,.02,'#e4d8b1');fabric.side=THREE.DoubleSide;fabric.userData.night.intensity=.13;
  const shelter=new THREE.Group(),vertices=[],indices=[],n=14,w=.16,d=.12;
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
    const u=i/n,v=j/n,corners=(1-u)*(1-v)*.075+u*(1-v)*.026+u*v*.068+(1-u)*v*.026;
    vertices.push((u-.5)*w,Math.max(.019,corners-.058*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)),(v-.5)*d);
    if(i<n&&j<n){const a=j*(n+1)+i;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
  }
  const canopy=new THREE.BufferGeometry();canopy.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));canopy.setIndex(indices);canopy.computeVertexNormals();k.mesh(shelter,canopy,fabric);
  for(const [x,z,h] of [[-w/2,-d/2,.075],[w/2,-d/2,.026],[w/2,d/2,.068],[-w/2,d/2,.026]])k.beam(shelter,[x,0,z],[x,h,z],.0016,stone);
  landscape.add(parkAnchor(shelter,.62,-.965,.025));
  for(let i=2;i<loop.length-1;i+=7){const [x,z]=loop[i];parkLamp(x,z,true);}
  parkStrip(shore.filter((_,i)=>i>=30&&i<=51),.003,edgeLight,.028);
  parkPatch(ellipse(.62,-.97,.04,.025),poolLight,.027);

  const trees=[];
  for(let i=0;i<46;i++){
    const a=i/46*Math.PI*2,rx=.385+.012*Math.sin(i*2.7),rz=.267+.008*Math.sin(i*1.9);
    // Leave the north entrance and the west river connection open.
    if(Math.abs(Math.cos(a))<.13&&Math.sin(a)>.8||Math.cos(a)<-.93&&Math.abs(Math.sin(a))<.24)continue;
    trees.push([cx+Math.cos(a)*rx,cz+Math.sin(a)*rz]);
  }
  for(const [x,z] of [[.42,-1.31],[.45,-1.34],[.96,-1.29],[.99,-1.26],[.94,-1.09],[.92,-1.12],[.36,-1.0]])trees.push([x,z]);
  const seat=k.mat('#8b7562'),jackets=[k.mat('#647a87'),k.mat('#ab785f'),k.mat('#d1bea1')],skin=k.mat('#c8ad94');
  for(const [x,z] of [[.38,-1.16],[.86,-1.31],[.93,-1.0]]){
    const g=new THREE.Group();k.box(g,.035,.005,.012,seat,0,.011);k.box(g,.035,.012,.003,seat,0,.018,-.006);for(const dx of [-.012,.012])k.box(g,.003,.009,.010,lampMetal,dx,.005);landscape.add(parkAnchor(g,x,z,.025));
  }
  for(let i=0;i<18;i++){
    const [x,z]=loop[(i*3+5)%64],g=new THREE.Group();k.cyl(g,.003,.0036,.012,jackets[i%3],0,.006,0,6);k.ball(g,.0033,skin,0,.015);landscape.add(parkAnchor(g,x+(i%2)*.008,z,.025));
  }
  return trees.map(shift);
}
