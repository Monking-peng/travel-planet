// Travel forms initialize independently of the heavy graphics module. Keep
// current panel state while it loads, so a late scene cannot close an editor.
export function createPlanetLoader({canvas,onPick,onInspect,selection,load=()=>import('./planet.js')}){
  let instance=null,pending=null,disposed=false,paused=false,editing=false,inspecting=false,attempt=0;
  const stage=canvas.closest('.planet-stage'),fallback=document.querySelector('#planet-fallback'),hint=document.querySelector('#planet-hint'),retry=document.querySelector('#retry-planet');
  const controls=[...document.querySelectorAll('.planet-controls button, .planet-viewpoints button')];
  function state(value){
    stage.dataset.state=value;canvas.setAttribute('aria-busy',String(value==='loading'));canvas.tabIndex=value==='ready'?0:-1;
    fallback.hidden=value==='ready';controls.forEach(b=>b.disabled=value!=='ready');
    hint.firstChild.textContent=value==='loading'?'正在载入星球… ':value==='failed'?'星球暂时无法互动，旅行功能仍可使用。 ':'';
    hint.hidden=value==='ready';
    retry.hidden=value!=='failed';
  }
  const controller={
    failed:false,
    reset(){instance?.reset();},zoomBy(n){instance?.zoomBy(n);},toggleRotation(){instance?.toggleRotation();},toggleNight(){instance?.toggleNight();},focusComponent(id){instance?.focusComponent(id);},focusOverview(id){instance?.focusOverview(id);},
    pause(value){paused=Boolean(value);instance?.pause(paused);},
    setEditing(value){editing=Boolean(value);instance?.setEditing(editing);},
    setInspection(value){inspecting=Boolean(value);instance?.setInspection(inspecting);},
    setComponents(ids){selection=[...ids];instance?.setComponents(selection);},
    destroy(){disposed=true;instance?.destroy();retry.onclick=null;canvas.removeEventListener('planeterror',runtimeError);},
    async start(){
      if(pending||disposed)return pending;
      controller.failed=false;state('loading');
      pending=(async()=>{
        try{
          // On retry, change only the entry URL; local module dependencies keep
          // their identities. A failed attempt never blocks the travel API.
          const module=await load(attempt++);
          if(disposed)return;
          await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
          if(disposed)return;
          const builtSelection=[...selection],next=await module.mountPlanet(canvas,onPick,builtSelection,{onInspect});
          if(disposed){next.destroy();return;}
          if(next.failed){next.destroy();throw new Error('3D unavailable');}
          instance=next;
          if(selection.join(',')!==builtSelection.join(','))next.setComponents(selection);
          instance.pause(paused);instance.setEditing(editing);instance.setInspection(inspecting);
          // Draw the complete scene before replacing the matching still image.
          await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
          if(disposed)return;
          state('ready');canvas.dispatchEvent(new CustomEvent('planetready'));
        }catch{
          instance?.destroy();instance=null;controller.failed=true;
          if(!disposed)state('failed');
        }finally{pending=null;}
      })();return pending;
    }
  };
  retry.onclick=()=>controller.start();
  const runtimeError=()=>{instance?.destroy();instance=null;controller.failed=true;if(!disposed)state('failed');};
  canvas.addEventListener('planeterror',runtimeError);
  return controller;
}
