import * as THREE from 'three';
import {ConvexGeometry} from 'three/addons/geometries/ConvexGeometry.js';
import {glow} from './shenzhen-forms.js';

// Sculpted geometry interpreted from front and rear photographs. This is an
// original miniature of Li Ming / Hu Jianguo's Youth Mao Zedong Art Sculpture,
// not a scan, photographic cutout or a generic standing statue.
const bell=(v,c,s)=>Math.exp(-(((v-c)/s)**2));
function skinGeometry(){
  const positions=[],indices=[],rows=72,columns=128;
  for(let j=0;j<=rows;j++){
    const y=-1+2*j/rows;
    const profile=[[-1,.42],[-.82,.66],[-.55,.85],[-.18,1],[.30,.98],[.65,.93],[.86,.79],[1,.56]];
    const hi=profile.findIndex(q=>q[0]>=y),lo=Math.max(0,hi-1),t=hi===lo?0:(y-profile[lo][0])/(profile[hi][0]-profile[lo][0]);
    const w=.061*(profile[lo][1]+(profile[hi][1]-profile[lo][1])*t);
    for(let i=0;i<=columns;i++){
      const a=i/columns*Math.PI*2,x=Math.sin(a)*w,front=Math.max(0,Math.cos(a)),u=x/.056;
      let z=.043*Math.cos(a)*(1-.14*y);
      if(front>0){
        // Brow, orbital recess, cheek, nose bridge/tip, philtrum and chin are
        // continuous surface displacements, so the profile remains coherent.
        let relief=.0085*bell(y,.44,.105)*(bell(u,-.43,.25)+bell(u,.43,.25));
        relief-=.010*bell(y,.23,.15)*(bell(u,-.44,.24)+bell(u,.44,.24));
        relief+=.0085*bell(y,-.08,.27)*(bell(u,-.56,.25)+bell(u,.56,.25));
        relief+=.017*bell(u,0,.145)*bell(y,.12,.43)+.016*bell(u,0,.23)*bell(y,-.16,.12);
        relief+=.006*(bell(u,-.22,.105)+bell(u,.22,.105))*bell(y,-.19,.065);
        relief-=.0025*bell(u,0,.10)*bell(y,-.33,.10);
        relief+=.0048*bell(u,0,.36)*bell(y,-.49,.055)+.006*bell(u,0,.35)*bell(y,-.40,.055);
        relief+=.006*bell(u,0,.49)*bell(y,-.75,.17);
        z+=relief*Math.pow(front,.3);
      }
      positions.push(x,.248+y*.092,z+.025);
      if(j&&i){const a=(j-1)*(columns+1)+i-1,b=a+columns+1;indices.push(a,a+1,b,a+1,b+1,b);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function rockMaterial(k,color){
  const m=k.mat(color,.97,.01);m.userData.sculptureStone=true;m.userData.preserveSmooth=true;
  m.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vGranite;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGranite=position;');
    s.fragmentShader='varying vec3 vGranite;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float grain=fract(sin(dot(floor(vGranite*4800.0),vec3(12.9898,78.233,45.164)))*43758.5453);
      float row=floor(vGranite.y*225.0);
      float horizontal=1.0-smoothstep(.018,.07,abs(fract(vGranite.y*225.0)-.5));
      float vertical=1.0-smoothstep(.012,.045,abs(fract(vGranite.x*110.0+mod(row,2.0)*.5)-.5));
      diffuseColor.rgb*=.94+.10*grain-.080*max(horizontal,vertical);
    `);
  };m.customProgramCacheKey=()=> 'juzizhou-granite-1';return m;
}
function shoulderGeometry(){
  const p=[],idx=[],nx=112,nz=32;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
    const x=(i/nx-.5)*.88,z=(j/nz-.5)*.22,t=Math.abs(x)/.44;
    const ridge=.055+.030*(x/.44+1)/2+.035*bell(x,0,.12)+.008*bell(x,.32,.12);
    const edge=Math.sin(j/nz*Math.PI),shoulder=(1+.035*Math.sin(x*43)+.018*Math.sin(x*97));
    const h=.012+ridge*Math.pow(edge,.70)*shoulder+.006*Math.sin(x*87+z*55)*edge+.003*Math.sin(z*330+x*43)*edge;
    p.push(x,h,z-.007);
    if(j&&i){const a=(j-1)*(nx+1)+i-1,b=a+nx+1;idx.push(a,b,a+1,a+1,b,b+1);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return geo;
}
export function juzizhou(k){
  const g=new THREE.Group(),stone=rockMaterial(k,'#a99d93'),hair=rockMaterial(k,'#9e9286'),shadow=k.mat('#756d63',1),paving=k.mat('#b9b7a2',.97),green=k.mat('#7d9365',.97),lamp=glow(k,'#ffe2ae',.85);
  paving.userData.groundSurface=true;green.userData.groundSurface=true;stone.side=THREE.DoubleSide;
  // Low, rounded forecourt and open grass leave the sculpture as the focal point.
  const court=k.cyl(g,.54,.54,.012,paving,0,.006,.04,80);court.scale.z=.58;
  const lawn=k.cyl(g,.505,.505,.003,green,0,.014,.035,80);lawn.scale.z=.54;
  const sculpture=new THREE.Group();g.add(sculpture);sculpture.position.z=-.025;sculpture.scale.y=1;
  k.mesh(sculpture,shoulderGeometry(),stone);
  const neck=k.cyl(sculpture,.041,.060,.094,stone,0,.145,-.003,40);neck.scale.z=.85;
  // Collar folds are broad, angular stone ridges merging into the shoulders.
  for(const side of [-1,1]){const points=[[side*.09,.087,.055],[side*.070,.139,.028],[side*.042,.163,.005],[side*.036,.123,.070],[side*.010,.095,.084],[side*.055,.075,-.048],[side*.045,.148,-.025]];k.mesh(sculpture,new ConvexGeometry(points.map(p=>new THREE.Vector3(...p))),stone);}
  const head=new THREE.Group();sculpture.add(head);head.position.y=-.013;head.rotation.y=-.10;
  k.mesh(head,skinGeometry(),stone);
  // Closed, sculpted hair mass with a face opening. The asymmetric stone
  // silhouette is broad at the left temple and folded high above the forehead.
  const back=k.mesh(head,new THREE.SphereGeometry(1,64,40),hair,-.013,.265,-.040);back.scale.set(.085,.110,.051);
  const outer=[[-.060,.180],[-.094,.204],[-.123,.247],[-.134,.282],[-.111,.311],[-.092,.345],[-.059,.374],[-.025,.380],[-.005,.357],[.012,.384],[.046,.376],[.073,.348],[.083,.310],[.079,.257],[.067,.212],[.045,.182]];
  const inner=[[-.036,.181],[-.051,.219],[-.052,.272],[-.045,.321],[-.023,.338],[.009,.341],[.038,.327],[.050,.291],[.051,.238],[.036,.183]];
  const outerCurve=new THREE.CatmullRomCurve3(outer.map(([x,y])=>new THREE.Vector3(x,y,0)),true,'centripetal');
  const innerCurve=new THREE.CatmullRomCurve3(inner.map(([x,y])=>new THREE.Vector3(x,y,0)),true,'centripetal');
  // Sample both rings by nearest angle about the face, then loft a convex,
  // irregular stone surface. This avoids a flat plaque or separate hair tubes.
  function radial(curve,angle){let best=null,score=1e9;for(const q of curve){const a=Math.atan2(q.y-.265,q.x),d=Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)));if(d<score){best=q;score=d;}}return best;}
  const hp=[],hi=[],n=160,steps=18,outerSamples=outerCurve.getPoints(320),innerSamples=innerCurve.getPoints(320);
  for(let j=0;j<=steps;j++)for(let i=0;i<=n;i++){
    const angle=i/n*Math.PI*2,inside=radial(innerSamples,angle),outside=radial(outerSamples,angle),v=j/steps,p=inside.clone().lerp(outside,v);
    const top=THREE.MathUtils.smoothstep(p.y,.318,.355),horizontal=Math.sin(p.y*155+p.x*20+v*2),vertical=Math.sin(p.x*145+p.y*15);
    const wave=(1-top)*horizontal+top*vertical+.25*Math.sin(p.x*211+p.y*190);
    const z=.017+.027*Math.sin(v*Math.PI)+.012*wave*Math.sin(v*Math.PI)+.010*bell(p.y,.35,.035);
    hp.push(p.x,p.y,z);
    if(j&&i){const a=(j-1)*(n+1)+i-1,b=a+n+1;hi.push(a,b,a+1,a+1,b,b+1);}
  }
  const hairGeo=new THREE.BufferGeometry();hairGeo.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));hairGeo.setIndex(hi);hairGeo.computeVertexNormals();hair.side=THREE.DoubleSide;k.mesh(head,hairGeo,hair);
  // Closed outer edge descends into the rounded rear mass.
  const outline=outerCurve.getPoints(160),sideP=[],sideI=[];
  for(let i=0;i<outline.length;i++){const p=outline[i];sideP.push(p.x,p.y,.018,p.x*.94,p.y,-.055);if(i){const a=(i-1)*2;sideI.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const sideGeo=new THREE.BufferGeometry();sideGeo.setAttribute('position',new THREE.Float32BufferAttribute(sideP,3));sideGeo.setIndex(sideI);sideGeo.computeVertexNormals();k.mesh(head,sideGeo,hair);
  // Eyelids and a shallow mouth seam, never painted black eyes or lipstick.
  for(const side of [-1,1]){
    const cx=side*.024;
    const pupil=k.mesh(head,new THREE.SphereGeometry(1,16,12),shadow,cx,.269,.0645);pupil.scale.set(.0018,.0025,.0006);
    const eye=k.mesh(head,new THREE.SphereGeometry(1,24,12),stone,cx,.269,.0615);eye.scale.set(.010,.0045,.003);
    k.line(head,[[cx-.013,.268,.060],[cx-.006,.274,.064],[cx+.002,.275,.064],[cx+.012,.268,.060]],.0018,stone);
    k.line(head,[[cx-.012,.268,.060],[cx,.265,.061],[cx+.012,.268,.060]],.0013,stone);
    const ear=k.mesh(head,new THREE.SphereGeometry(1,24,16),stone,side*.058,.240,.011);ear.scale.set(.008,.019,.009);
    const nostril=k.mesh(head,new THREE.SphereGeometry(1,16,8),shadow,side*.008,.230,.091);nostril.scale.set(.0035,.0017,.0013);
  }
  k.line(head,[[-.019,.206,.071],[-.009,.207,.078],[0,.207,.080],[.009,.207,.078],[.019,.206,.071]],.00085,shadow);
  // Low shrubs frame the shoulder ends and keep the foreground face unobscured.
  const leaves=k.mat('#526e4b',.98),flower=k.mat('#a95858',.96);
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2,x=Math.cos(a)*.463,z=Math.sin(a)*.183+.015;if(z>.10&&Math.abs(x)<.25)continue;const bush=k.mesh(g,new THREE.IcosahedronGeometry(.016,1),i%6===0?flower:leaves,x,.029,z);bush.scale.set(1.2,.8,1);}
  for(const x of [-.29,-.18,.18,.29]){k.box(g,.013,.003,.013,shadow,x,.019,.16);k.box(g,.008,.001,.007,lamp,x,.021,.16);}
  const metal=k.mat('#5b655d'),clothes=['#8c6c5d','#60767a','#c1af94'].map(c=>k.mat(c));
  for(let i=0;i<13;i++){const x=-.31+(i*.054)% .62,z=.19+(i%3)*.014;k.cyl(g,.0024,.0031,.012,clothes[i%3],x,.025,z,6);k.ball(g,.0029,stone,x,.033,z);k.box(g,.004,.007,.003,metal,x,.017,z);}
  g.scale.setScalar(.58);k.merge(g);g.scale.setScalar(1);
  for(const x of [-.20,0,.20]){const l=new THREE.PointLight('#ffe0b8',0,.42,2);l.position.set(x*.58,.045,.17);l.userData.nightIntensity=.002;g.add(l);}
  g.userData.islandSculpture=true;return g;
}
