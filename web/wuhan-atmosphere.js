import * as THREE from 'three';

export function surfaceDetail(material,clock,water=false){
  material.onBeforeCompile=s=>{
    s.uniforms.wuhanTime=clock.time;s.uniforms.wuhanNight=clock.night;
    s.vertexShader='varying vec3 vWuhanSurface;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWuhanSurface=position;');
    s.fragmentShader='varying vec3 vWuhanSurface; uniform float wuhanTime; uniform float wuhanNight;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float grain=fract(sin(dot(floor(vWuhanSurface.xz*510.0),vec2(127.1,311.7)))*43758.5453);
      ${water?`float ripples=pow(.5+.5*sin(vWuhanSurface.z*230.0+sin(vWuhanSurface.x*73.0+wuhanTime*.8)*2.0-wuhanTime*1.4),15.0);
      diffuseColor.rgb*=.76+.24*grain;diffuseColor.rgb+=vec3(.004,.009,.012)*ripples;`:`float terrain=sin(vWuhanSurface.x*14.0+sin(vWuhanSurface.z*9.0))*.5+.5;
      diffuseColor.rgb*=.89+.025*grain+.10*terrain;`}
    `);
  };
  material.customProgramCacheKey=()=>water?'wuhan-water-detail':'wuhan-ground-detail';
}

// Reflections are attached to their corresponding building, not left behind after removal.
export function addRiverReflections(k,modules,{surface,riverX,clock}){
  const palette={customs:['#ffc16a',-.83,.33],greenland:['#7ccfff',-1.10,.43],crane:['#ffa843',1.04,.28],bridge:['#ffd491',.58,.33],han:['#f25673',-.28,.21]};
  for(const [id,[color,z,length]] of Object.entries(palette)){
    const g=modules.get(id);if(!g)continue;g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert();
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:clock.time,night:clock.night,tint:{value:new THREE.Color(color)}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float night;uniform vec3 tint;
      void main(){float x=vUv.x-.5;float wave=sin(vUv.y*147.+time*1.3+sin(x*37.-time)*2.);float taper=pow(max(0.,1.-abs(x)*2.),1.4)*pow(max(0.,1.-abs(vUv.y-.5)*2.),.8);float bars=smoothstep(.15,.82,wave);gl_FragColor=vec4(tint*1.6,taper*bars*.36*night);}`});k.materials.push(mat);
    const v=[],uv=[],idx=[];for(let j=0;j<=32;j++)for(let i=0;i<=8;i++){const zz=z+(j/32-.5)*length,xx=riverX(zz)+(i/8-.5)*.38;v.push(...surface(xx,zz,.030).applyMatrix4(inverse));uv.push(i/8,j/32);if(j<32&&i<8){const a=j*9+i;idx.push(a,a+1,a+9,a+1,a+10,a+9);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const m=k.mesh(g,geo,mat);m.userData.nightOnly=true;m.userData.reflection=true;m.raycast=()=>{};m.renderOrder=2;
  }
}

export function buildingIllumination(k,g,id){
  const mset=new Set();g.traverse(o=>{if(o.material)mset.add(o.material);});
  for(const m of mset){if(!m.isMeshStandardMaterial||m.userData.night)continue;const c=m.color,hsl={};c.getHSL(hsl);
    if(hsl.l>.34&&hsl.s<.50)m.userData.night={color:new THREE.Color(['greenland','station','han'].includes(id)?'#9abac9':'#e9b36a'),intensity:.13};
  }
}
