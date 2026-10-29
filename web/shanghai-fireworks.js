import * as THREE from 'three';

export const FIREWORK_INTERVAL=60;
export const FIREWORK_DURATION=18;
// A miniature interpretation of the castle show's gold cascades and coloured aerial shells.
// Deterministic choreography, no downloaded film, music, timers or full-screen flashes.
const CUES=[
 [1.4,-.30,1.65,-.66,'#ffce7b',.38,3.2],
 [3.2,.40,1.66,-.68,'#ff80c1',.34,2.5],
 [4.3,-.52,1.49,-.70,'#8dbfff',.31,2.8],
 [6.2,.06,1.93,-.73,'#ffdf9e',.42,3.7],
 [7.6,-.48,1.72,-.66,'#c499ff',.32,2.8],
 [7.9,.48,1.75,-.68,'#ffa9d7',.32,2.8],
 [10.1,-.20,1.77,-.80,'#ffce79',.43,3.7],
 [10.7,.35,1.94,-.73,'#b7d5ff',.36,3.0],
 [12.6,-.57,1.63,-.73,'#ffda91',.38,3.6],
 [12.8,0,2.03,-.75,'#ffdba1',.46,3.8],
 [13.0,.58,1.67,-.73,'#ffcf8b',.38,3.5]
];
export function createDisneyFireworks(){
  const root=new THREE.Group();root.name='disney-fireworks';
  const max=8000,positions=new Float32Array(max*3),colors=new Float32Array(max*3),strength=new Float32Array(max),sizes=new Float32Array(max);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('strength',new THREE.BufferAttribute(strength,1).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('sparkSize',new THREE.BufferAttribute(sizes,1).setUsage(THREE.DynamicDrawUsage));geo.setDrawRange(0,0);
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,vertexColors:true,toneMapped:false,
    vertexShader:`attribute float strength; attribute float sparkSize; varying vec3 vColor; varying float vStrength;
      void main(){vColor=color;vStrength=strength;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(sparkSize*230./max(.4,-p.z),1.1,8.);}`,
    fragmentShader:`varying vec3 vColor; varying float vStrength;
      void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=exp(-d*d*3.)*vStrength;gl_FragColor=vec4(vColor*2.2,a);}`});
  const points=new THREE.Points(geo,material);points.frustumCulled=false;points.raycast=()=>{};root.add(points);
  const glow=new THREE.PointLight('#ffcf94',0,2.3,2);glow.position.set(0,1.1,-.40);root.add(glow);
  const cues=CUES.map((v,j)=>({time:v[0],x:v[1],y:v[2],z:v[3],color:new THREE.Color(v[4]),radius:v[5],life:v[6],seed:j}));
  const directions=Array.from({length:112},(_,i)=>{const y=1-(i+.5)/112*2,a=i*2.399963,r=Math.sqrt(1-y*y);return [Math.cos(a)*r,y,Math.sin(a)*r];});
  let night=false,start=null;
  const state={active:false,phase:0,cycle:0,particleCount:0};
  function setNight(value){if(Boolean(value)!==night)start=null;night=Boolean(value);if(!night){root.visible=false;glow.intensity=0;state.active=false;state.particleCount=0;geo.setDrawRange(0,0);}}
  function update(time,reduced){
    if(!night||reduced){root.visible=false;glow.intensity=0;state.active=false;state.particleCount=0;return;}
    if(start===null||time<start)start=time;
    const elapsed=Math.max(0,time-start),phase=elapsed%FIREWORK_INTERVAL;state.phase=phase;state.cycle=Math.floor(elapsed/FIREWORK_INTERVAL);state.active=phase<FIREWORK_DURATION;
    root.visible=state.active;if(!state.active){state.particleCount=0;geo.setDrawRange(0,0);glow.intensity=0;return;}
    let n=0,light=0;
    const put=(x,y,z,color,alpha,size)=>{if(n>=max||alpha<=.003)return;positions[n*3]=x;positions[n*3+1]=y;positions[n*3+2]=z;colors[n*3]=color.r;colors[n*3+1]=color.g;colors[n*3+2]=color.b;strength[n]=alpha;sizes[n]=size;n++;};
    for(const cue of cues){
      const age=phase-cue.time;
      if(age<0&&age> -1.05){
        const t=1+age/1.05;for(let i=0;i<24;i++){const u=Math.max(0,t-i*.012);put(cue.x*(.65+.35*u),.10+(cue.y-.10)*u,cue.z,cue.color,(1-i/25)*.75,.058*(1-i/40));}
      }
      if(age<0||age>cue.life)continue;
      light+=.10*Math.exp(-age*2.4);
      for(let i=0;i<directions.length;i++){
        const dir=directions[i],variation=.87+.13*Math.sin(i*13.3+cue.seed),speed=cue.radius*.98*variation;
        for(let tail=0;tail<5;tail++){
          const t=age-tail*.040;if(t<0)continue;
          const spread=(1-Math.exp(-t*.82))/.82,fall=.075*t*t,fade=Math.pow(Math.max(0,1-t/cue.life),1.4);
          const shimmer=.83+.17*Math.sin(i*3.71+t*4.1);
          put(cue.x+dir[0]*speed*spread,cue.y+dir[1]*speed*spread-fall,cue.z+dir[2]*speed*spread,cue.color,fade*(1-tail*.17)*shimmer,tail===0?.085:.065);
        }
      }
    }
    state.particleCount=n;geo.setDrawRange(0,n);for(const attr of Object.values(geo.attributes))attr.needsUpdate=true;
    glow.intensity=Math.min(.23,light);
  }
  root.visible=false;
  return {root,state,setNight,update,dispose(){geo.dispose();material.dispose();}};
}
