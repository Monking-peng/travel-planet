const VOLUME=.28,FADE_IN=600,FADE_OUT=220;

// Latest user intent wins over delayed play promises. A fade schedules work
// only while its volume is changing; ordinary playback adds no JS timer.
export function setupMusic({audio,button,notify=()=>{},visibility=globalThis.document,clock={now:()=>performance.now(),every:fn=>setInterval(fn,20),clear:id=>clearInterval(id)}}){
  let wanted=false,revision=0,state='idle',fade=null,disposed=false,introduced=false;
  const labels={idle:'播放轻松配乐',loading:'取消加载配乐',playing:'暂停配乐',pausing:'恢复配乐',error:'重试播放配乐'};
  function status(next){state=next;button.dataset.state=next;button.setAttribute('aria-pressed',String(wanted));button.setAttribute('aria-busy',String(next==='loading'));button.setAttribute('aria-label',labels[next]);button.title=labels[next];}
  function cancelFade(){if(fade){clock.clear(fade.timer);fade=null;}}
  function finishFade(){if(!fade)return;const active=fade;cancelFade();audio.volume=active.target;active.done?.();}
  function fadeTo(target,duration,done){
    cancelFade();const from=audio.volume,start=clock.now();
    if(visibility?.hidden||Math.abs(from-target)<.0001){audio.volume=target;done?.();return;}
    const active={target,done,timer:null};fade=active;
    active.timer=clock.every(()=>{
      if(fade!==active)return;
      const t=Math.min(1,(clock.now()-start)/duration),smooth=t*t*(3-2*t);
      audio.volume=from+(target-from)*smooth;if(t===1)finishFade();
    });
  }
  function fail(){
    if(disposed||!wanted||state==='error')return;
    wanted=false;revision++;cancelFade();audio.volume=0;audio.pause();status('error');
    notify('配乐暂时无法播放，点音符可重试。');
  }
  function playing(){
    if(disposed||!wanted||audio.paused||state==='playing')return;
    status('playing');fadeTo(VOLUME,FADE_IN);
    if(!introduced){introduced=true;notify('湖边的小调 · 点音符可暂停');}
  }
  function paused(){
    if(disposed||!audio.paused)return;
    if(audio.error){fail();return;}
    if(wanted){wanted=false;revision++;cancelFade();audio.volume=0;status('idle');}
  }
  async function toggle(){
    if(disposed)return;
    if(wanted){
      wanted=false;revision++;cancelFade();
      if(state==='loading'||audio.paused){audio.pause();audio.volume=0;status('idle');return;}
      status('pausing');fadeTo(0,FADE_OUT,()=>{if(!wanted){audio.pause();status('idle');}});return;
    }
    wanted=true;const current=++revision;cancelFade();
    if(!audio.paused&&!audio.error){status('playing');fadeTo(VOLUME,FADE_IN);return;}
    status('loading');audio.volume=0;if(audio.error)audio.load();
    try{
      await audio.play();
      if(disposed||current!==revision||!wanted){if(!wanted)audio.pause();return;}
      playing();
    }catch{if(!disposed&&current===revision&&wanted)fail();}
  }
  const waiting=()=>{if(wanted&&!disposed){cancelFade();status('loading');}};
  const visibilityChange=()=>{if(visibility?.hidden)finishFade();};
  const click=()=>{void toggle();};
  const events={playing,waiting,pause:paused,ended:paused,error:fail};
  audio.volume=0;status('idle');button.addEventListener('click',click);
  for(const [name,handler] of Object.entries(events))audio.addEventListener(name,handler);
  visibility?.addEventListener('visibilitychange',visibilityChange);
  return {toggle,get state(){return state;},destroy(){
    if(disposed)return;disposed=true;wanted=false;revision++;cancelFade();audio.volume=0;audio.pause();status('idle');
    button.removeEventListener('click',click);for(const [name,handler] of Object.entries(events))audio.removeEventListener(name,handler);
    visibility?.removeEventListener('visibilitychange',visibilityChange);
  }};
}
