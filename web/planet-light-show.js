// One clock drives the waterfront facades. Position comes from the merged
// globe geometry, so the light pattern stays on the building while orbiting.
// No textures, extra geometry, realtime lights or per-frame allocations.
export function createWaterfrontLightShow(){
  const time={value:0},active={value:0},materials=new Map();let elapsed=0,presented=0;
  function register(material){
    const kind=material.userData.nightProfile?.animation;
    if(!kind||materials.has(material))return;
    const compile=material.onBeforeCompile,key=material.customProgramCacheKey;
    materials.set(material,{compile,key});
    material.onBeforeCompile=function(shader,renderer){
      compile.call(this,shader,renderer);
      shader.uniforms.waterfrontTime=time;shader.uniforms.waterfrontActive=active;
      shader.vertexShader='varying vec3 vWaterfrontPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterfrontPosition = position;');
      shader.fragmentShader='uniform float waterfrontTime;\nuniform float waterfrontActive;\nvarying vec3 vWaterfrontPosition;\n'+shader.fragmentShader;
      if(kind==='reflection'){
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
          float longitude = atan(vWaterfrontPosition.x, vWaterfrontPosition.z);
          float latitude = asin(clamp(normalize(vWaterfrontPosition).y,-1.0,1.0));
          float ripple = 0.5 + 0.5 * sin(latitude * 230.0 + longitude * 41.0 - waterfrontTime * 1.8);
          float swell = 0.5 + 0.5 * sin(longitude * 25.0 + waterfrontTime * 0.72);
          diffuseColor.a *= mix(1.0,0.38 + 0.80 * ripple + 0.22 * swell,waterfrontActive);
        `);
        return;
      }
      const lotus=kind==='lotus';
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float angle = atan(vWaterfrontPosition.x, vWaterfrontPosition.z);
        float height = length(vWaterfrontPosition) - 1.434;
        // Architectural cells give neighbouring windows different timing.
        // Smooth pulses retain a lit baseline: no hard on/off or white flash.
        float zone = floor(angle * 34.0);
        float floorId = floor(height * 95.0);
        float seed = fract(sin(zone * 12.9898 + floorId * 78.233) * 43758.5453);
        float phase = 6.2831853 * seed;
        float wave = 0.5 + 0.5 * sin(angle * ${lotus?'65.0':'10.0'} + height * ${lotus?'42.0':'27.0'} - waterfrontTime * ${lotus?'1.35':'1.65'});
        float pulse = smoothstep(0.10,0.94,sin(waterfrontTime * (1.5 + seed * 0.75) + phase));
        float wash = 0.5 + 0.5 * sin(waterfrontTime * 0.55 + angle * 6.0);
        vec3 hue = mix(${lotus?'vec3(0.36,0.08,1.0), vec3(0.90,0.15,0.66)':'vec3(0.08,0.54,1.0), vec3(0.57,0.13,1.0)'}, wash);
        float energy = max(max(totalEmissiveRadiance.r,totalEmissiveRadiance.g),totalEmissiveRadiance.b);
        // Preserve warm office windows/crowns among the blue-violet ribbons.
        float warm = smoothstep(0.06,0.30,(totalEmissiveRadiance.r-totalEmissiveRadiance.b)/max(energy,0.001));
        float blend = ${lotus?'0.64':'mix(0.60,0.08,warm)'};
        float brightness = ${lotus?'0.50 + 0.95 * wave':'mix(0.24 + 0.70 * wave + 0.72 * pulse,0.58 + 0.56 * pulse,warm)'};
        vec3 show = mix(totalEmissiveRadiance,hue * energy,blend) * brightness;
        totalEmissiveRadiance = mix(totalEmissiveRadiance,show,waterfrontActive);
      `);
    };
    material.customProgramCacheKey=()=>key.call(material)+'|waterfront-show-v2|'+kind;
    material.needsUpdate=true;
  }
  return {
    register,
    // Advance only when the scene is actually visible. Reduced motion shows
    // the designed static palette; pausing rotation does not stop the show.
    update(dt,enabled,reduced){
      const next=enabled&&!reduced?1:0,changed=active.value!==next;active.value=next;
      if(!next){elapsed=presented=time.value=0;return changed;}
      elapsed+=Math.min(Math.max(dt,0),.05);
      if(changed||elapsed-presented>=1/30){time.value=elapsed;presented=elapsed;return true;}
      return false;
    },
    get state(){return {seconds:time.value,active:Boolean(active.value),materials:materials.size};},
    dispose(){for(const [m,old] of materials){m.onBeforeCompile=old.compile;m.customProgramCacheKey=old.key;m.needsUpdate=true;}materials.clear();}
  };
}
