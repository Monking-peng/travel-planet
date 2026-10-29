import * as THREE from 'three';
import {groundPatch,sag,gardenTree} from './shanghai-heritage.js';

// Three interlocking orbital volumes, observed in Ennead's roof and exterior photographs.
// The apertures are geometry, not dark discs pasted over a solid roof.
export function astronomy(k){
  const g=new THREE.Group(),silver=k.mat('#c7cece',.51,.35),seam=k.mat('#849a9f',.52,.3),glass=k.mat('#486a77',.32,.32,'#b7d8e9'),stone=k.mat('#d3d2c7'),water=k.mat('#527e89',.35,.25),grass=k.mat('#8f9c7b'),light=k.mat('#d7e4df',.48,.15,'#d2e8ff');
  glass.userData.night.intensity=.38;light.userData.night.intensity=1.1;
  light.userData.pulse={speed:.38,phase:1,min:.88};
  const plaza=Array.from({length:88},(_,i)=>{const a=i/88*Math.PI*2;return [.78*Math.cos(a),.60*Math.sin(a)];});
  groundPatch(k,g,plaza,stone,.009);
  groundPatch(k,g,Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2;return [.64*Math.cos(a),.48*Math.sin(a)];}),grass,.014);
  function orbit(cx,cz,rx,rz,y,inner,material,tilt=0,holeX=0,holeZ=0){
    const shape=new THREE.Shape();shape.absellipse(cx,-cz,rx,rz,0,Math.PI*2,false,0);
    const hole=new THREE.Path();hole.absellipse(cx+holeX,-cz-holeZ,inner,inner,0,Math.PI*2,true,0);shape.holes.push(hole);
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.024,bevelEnabled:false,curveSegments:80});geo.rotateX(-Math.PI/2);
    const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+y+tilt*(p.getX(i)-cx));geo.computeVertexNormals();k.mesh(g,geo,material);
  }
  function loop(cx,cz,rx,rz,y,material,r=.0017,tilt=0){return k.line(g,Array.from({length:89},(_,i)=>{const a=i/88*Math.PI*2;return [cx+rx*Math.cos(a),y+tilt*rx*Math.cos(a),cz+rz*Math.sin(a)];}),r,material);}
  // Lower crescent wraps the half-buried planetarium sphere.
  orbit(.19,.08,.40,.39,.095,.145,silver,0,.09,.05);
  const shell=k.cyl(g,.363,.345,.115,glass,.19,.036,.08,80);shell.scale.z=1.05;
  for(let i=0;i<88;i++){const a=i/88*Math.PI*2,x=.19+.366*Math.cos(a),z=.08+.384*Math.sin(a);k.beam(g,[x,-.018,z],[x,.100,z],.0013,seam);}
  loop(.19,.08,.40,.39,.122,light,.003);loop(.19,.08,.40,.39,.095,seam,.002);
  for(let i=0;i<45;i++){const a=i/45*Math.PI*2;if(Math.cos(a)<-.1)continue;k.beam(g,[.28+.148*Math.cos(a),.123,.13+.148*Math.sin(a)],[.19+.393*Math.cos(a),.123,.08+.383*Math.sin(a)],.0009,seam);}
  k.mesh(g,new THREE.SphereGeometry(.151,48,28),glass,.28,.157,.13);
  const facets=new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(.152,3));
  // Thin metal triangular mullions define the sphere without an opaque wire cage.
  const coords=facets.attributes.position;for(let i=0;i<coords.count;i+=2){const a=new THREE.Vector3().fromBufferAttribute(coords,i),b=new THREE.Vector3().fromBufferAttribute(coords,i+1);if(a.y<-.045&&b.y<-.045)continue;k.beam(g,[a.x+.28,a.y+.157,a.z+.13],[b.x+.28,b.y+.157,b.z+.13],.00065,seam);}
  facets.dispose();
  // Raised elliptical wing: a separate roof opening above the entrance plaza.
  const cx=-.20,cz=-.10,rx=.43,rz=.315;
  orbit(cx,cz,rx,rz,.205,.058,silver,-.11,-.25,.12);
  loop(cx,cz,rx,rz,.230,light,.003,-.11);
  loop(cx,cz,rx,rz,.204,seam,.002,-.11);
  const innerGlass=k.cyl(g,.225,.185,.17,glass,-.12,.09,-.16,64);innerGlass.scale.z=.88;
  for(let i=0;i<46;i++){const a=i/46*Math.PI*2;k.beam(g,[-.12+.226*Math.cos(a),.035,-.16+.20*Math.sin(a)],[-.12+.226*Math.cos(a),.19,-.16+.20*Math.sin(a)],.0012,seam);}
  // Sunlight oculus: the bottom of the aperture stays open down to a reflecting pool.
  const pool=Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;return [-.45+.075*Math.cos(a),.02+.075*Math.sin(a)];});groundPatch(k,g,pool,water,.025);
  loop(-.45,.02,.058,.058,.261,seam,.002);
  for(let i=0;i<45;i++){const a=i/45*Math.PI*2;const outer=[cx+rx*Math.cos(a),.231-.11*rx*Math.cos(a),cz+rz*Math.sin(a)],inner=[-.12+.22*Math.cos(a),.231-.11*(.08+.22*Math.cos(a)),-.16+.20*Math.sin(a)];if(a>2&&a<3.5)continue;k.beam(g,inner,outer,.0006,seam);}
  // Central inverted dome: concentric slopes descend into a glass skylight bowl.
  const bowl=new THREE.Group();bowl.position.set(-.12,0,-.16);g.add(bowl);
  const profile=[new THREE.Vector2(.105,.245),new THREE.Vector2(.135,.252),new THREE.Vector2(.180,.285),new THREE.Vector2(.205,.325)];
  const bowlGeo=new THREE.LatheGeometry(profile,80),bowlMat=k.mat('#64818d',.45,.25,'#bed7e5');bowlMat.side=THREE.DoubleSide;bowlMat.userData.night.intensity=.45;k.mesh(bowl,bowlGeo,bowlMat);
  const rimMat=k.mat('#bec9ca',.53,.3);rimMat.side=THREE.DoubleSide;k.mesh(bowl,new THREE.LatheGeometry([new THREE.Vector2(.205,.325),new THREE.Vector2(.235,.332),new THREE.Vector2(.265,.292)],80),rimMat);
  k.ring(bowl,.236,.0033,silver,.333);k.ring(bowl,.265,.0031,light,.292);k.cyl(bowl,.103,.103,.004,glass,0,.243,0,64);
  for(let j=1;j<=4;j++){const t=j/4;k.ring(bowl,.105+.10*t,.001,seam,.245+.08*t*t);}
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2;k.line(bowl,Array.from({length:9},(_,j)=>{const t=j/8,r=.105+.10*t;return [r*Math.cos(a),.245+.08*t*t,r*Math.sin(a)];}),.0008,silver);}
  // Curved pedestrian approach and low observatory garden, rather than an isolated platform.
  for(const rad of [.68,.72])k.line(g,Array.from({length:78},(_,i)=>{const a=i/77*Math.PI*1.65-.65;const x=rad*Math.cos(a),z=rad*.77*Math.sin(a);return [x,sag(x,z)+.018,z];}),.002,light);
  for(let i=0;i<7;i++)k.box(g,.22,.009,.026,stone,-.48,.004+i*.009,.30-i*.022);
  const leaf=k.mat('#68816a'),trunk=k.mat('#817663');for(const a of [.1,.4,.7,1.5,1.8,2.1,3.8,4.1,4.4])gardenTree(k,g,.72*Math.cos(a),.53*Math.sin(a),.042,leaf,trunk);
  return k.merge(g);
}
