/* No graphics imports: this dialog must be usable before the city modules. */
(()=>{
  const intro=document.getElementById('scene-intro');
  if(!intro||typeof intro.showModal!=='function')return;
  const scene=document.querySelector('#planet-stage,canvas#destination,canvas#shanghai,canvas#wuhan');
  if(!scene)return;
  const status=intro.querySelector('.intro-status'),retry=intro.querySelector('[data-intro-action=retry]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let finished=false,closing=false,slowTimer,closeTimer;
  const observer=new MutationObserver(sync);
  function clean(){
    finished=true;clearTimeout(slowTimer);clearTimeout(closeTimer);observer.disconnect();
    removeEventListener('error',scriptError,true);removeEventListener('pagehide',leave);
  }
  function close(){if(finished)return;intro.dataset.phase='closed';intro.close();clean();}
  function fail(message){
    if(finished||closing)return;clearTimeout(slowTimer);intro.dataset.phase='error';
    status.textContent=message;retry.hidden=false;
  }
  function sync(){
    if(finished||closing)return;
    if(scene.dataset.state==='ready'){
      closing=true;clearTimeout(slowTimer);intro.dataset.phase='ready';status.textContent='已准备好，出发吧';
      if(reduced.matches){close();return;}
      // Readiness comes from the renderer, never from elapsed time or window.load.
      closeTimer=setTimeout(close,480);return;
    }
    if(['failed','error'].includes(scene.dataset.state)){fail('城市景观暂时没有打开，可以重试或先进入页面。');return;}
    if(intro.dataset.phase==='slow')return;
    status.textContent=scene.dataset.phase==='building'?'正在搭建城市地标':scene.dataset.phase==='rendering'?'正在点亮城市景观':'正在准备城市景观';
  }
  function scriptError(event){
    if(event.target instanceof HTMLScriptElement&&event.target.type==='module')fail('景观资源没有载入，请检查网络后重试。');
    else if(event.error)fail('城市景观暂时没有打开，可以重试或先进入页面。');
  }
  function leave(){close();}
  intro.addEventListener('close',clean,{once:true});
  intro.querySelector('[data-intro-action=skip]').addEventListener('click',close);
  retry.addEventListener('click',()=>location.reload());
  addEventListener('error',scriptError,true);addEventListener('pagehide',leave);
  observer.observe(scene,{attributes:true,attributeFilter:['data-state','data-phase']});
  intro.showModal();intro.dataset.phase='loading';
  slowTimer=setTimeout(()=>{if(finished||closing)return;intro.dataset.phase='slow';status.textContent='加载比平时久一些，可以继续等待，或先进入页面。';retry.hidden=false;},15000);
  sync();
})();
