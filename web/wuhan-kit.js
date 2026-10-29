import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function makeKit(clock) {
  const materials=[];
  function mat(color,roughness=.72,metalness=.08,night=null){
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness});
    if(night)m.userData.night={color:new THREE.Color(night),intensity:.18};
    materials.push(m);return m;
  }
  function glass(color,light,seed){
    const m=mat(color,.31,.34);m.userData.night={color:new THREE.Color(light),intensity:1.35};
    m.onBeforeCompile=s=>{
      s.uniforms.cityTime=clock.time;s.uniforms.cityNight=clock.night;
      s.vertexShader='varying vec3 vCity;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCity = position;');
      s.fragmentShader='uniform float cityTime; uniform float cityNight; varying vec3 vCity;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        vec2 cell=vec2((vCity.x+vCity.z)*100.0,vCity.y*106.0);
        vec2 f=fract(cell);
        float pane=step(.19,f.x)*step(f.x,.82)*step(.20,f.y)*step(f.y,.76);
        float rnd=fract(sin(dot(floor(cell),vec2(12.9898,78.233))+${seed.toFixed(1)})*43758.5453);
        float pulse=.25+.75*(.5+.5*sin(cityTime*1.5-floor(cell.y)*.23+${seed.toFixed(1)}));
        float sweep=.15+.85*smoothstep(-.25,.75,sin(vCity.y*13.0-cityTime*1.65+${seed.toFixed(1)}));
        float occupied=step(.58,rnd);
        float mechanical=1.0-step(.91,fract(vCity.y*7.0));
        totalEmissiveRadiance*=pane*(occupied*.28+(.50+.50*occupied)*pulse*sweep)*mechanical*cityNight;
        diffuseColor.rgb*=mix(.72,1.0,pane);
      `);
    };
    m.customProgramCacheKey=()=>`wuhan-windows-${seed}`;return m;
  }
  function mesh(g,geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;}
  const box=(g,w,h,d,m,x=0,y=0,z=0)=>mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(g,rt,rb,h,m,x=0,y=0,z=0,n=24)=>mesh(g,new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z);
  const ball=(g,r,m,x=0,y=0,z=0)=>mesh(g,new THREE.SphereGeometry(r,32,20),m,x,y,z);
  function beam(g,a,b,r,m,n=6){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const o=cyl(g,r,r,av.distanceTo(bv),m,0,0,0,n);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize());return o;}
  function line(g,points,r,m,closed=false){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);return mesh(g,new THREE.TubeGeometry(c,Math.max(16,points.length*2),r,4,closed),m);}
  const ring=(g,r,t,m,y=0)=>{const o=mesh(g,new THREE.TorusGeometry(r,t,5,64),m,0,y,0);o.rotation.x=Math.PI/2;return o;};
  function merge(g){
    g.updateMatrixWorld(true);const buckets=new Map(),old=[];
    g.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);if(!o.material.map)geo.deleteAttribute('uv');const a=buckets.get(o.material)||[];a.push(geo);buckets.set(o.material,a);old.push(o.geometry);});
    g.clear();for(const [m,geos] of buckets){const mixed=geos.some(x=>!x.index)&&geos.some(x=>x.index),compatible=mixed?geos.map(x=>x.index?x.toNonIndexed():x):geos;const geo=mergeGeometries(compatible);const o=mesh(g,geo,m);o.castShadow=true;o.receiveShadow=true;new Set([...geos,...compatible]).forEach(x=>x.dispose());}old.forEach(x=>x.dispose());return g;
  }
  return {mat,glass,mesh,box,cyl,ball,beam,line,ring,merge,materials};
}
