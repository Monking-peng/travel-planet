const test=require('node:test'),assert=require('node:assert/strict');

class Target{
  constructor(){this.events=new Map();this.dataset={};this.attributes={};}
  addEventListener(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
  removeEventListener(name,fn){this.events.get(name)?.delete(fn);}
  emit(name){for(const fn of this.events.get(name)||[])fn();}
  setAttribute(name,value){this.attributes[name]=value;}
}
async function harness(){
  const {setupMusic}=await import('../web/travel-music.js');
  const audio=new Target(),button=new Target(),visibility=new Target(),notices=[],requests=[],jobs=new Map();let time=0,id=0;
  Object.assign(audio,{volume:1,paused:true,error:null,loads:0});visibility.hidden=false;
  audio.play=()=>{audio.paused=false;return new Promise((resolve,reject)=>requests.push({resolve:()=>{audio.emit('playing');resolve();},reject}));};
  audio.pause=()=>{audio.paused=true;audio.emit('pause');};audio.load=()=>{audio.error=null;audio.loads++;};
  const clock={now:()=>time,every:fn=>{jobs.set(++id,fn);return id;},clear:id=>jobs.delete(id)};
  const control=setupMusic({audio,button,visibility,notify:text=>notices.push(text),clock});
  return {audio,button,visibility,notices,requests,jobs,control,step:ms=>{time+=ms;for(const fn of [...jobs.values()])fn();}};
}

test('Music waits for an explicit request, fades in and out, and leaves no steady playback timer',async()=>{
  const h=await harness();assert.equal(h.requests.length,0);assert.equal(h.audio.volume,0);assert.equal(h.button.attributes['aria-pressed'],'false');
  const starting=h.control.toggle();assert.equal(h.control.state,'loading');h.requests[0].resolve();await starting;
  h.step(120);assert.ok(h.audio.volume>0&&h.audio.volume<.28);h.step(480);assert.equal(h.audio.volume,.28);assert.equal(h.jobs.size,0);
  await h.control.toggle();h.step(100);assert.ok(h.audio.volume>0&&h.audio.volume<.28);assert.equal(h.audio.paused,false);
  h.step(120);assert.equal(h.audio.volume,0);assert.equal(h.audio.paused,true);assert.equal(h.control.state,'idle');assert.equal(h.jobs.size,0);h.control.destroy();
});

test('Cancelling a pending music request or rejecting an older request does not report a playback error',async()=>{
  const h=await harness(),first=h.control.toggle();await h.control.toggle();h.requests[0].reject(new Error('AbortError'));await first;
  assert.equal(h.control.state,'idle');assert.equal(h.audio.paused,true);assert.equal(h.notices.length,0);
  const old=h.control.toggle();await h.control.toggle();const latest=h.control.toggle();h.requests[2].resolve();await latest;
  h.requests[1].reject(new Error('late abort'));await old;h.step(600);
  assert.equal(h.control.state,'playing');assert.equal(h.audio.volume,.28);assert.equal(h.notices.length,1);h.control.destroy();
});

test('A media error resets the toggle once and an explicit retry reloads the failed source',async()=>{
  const h=await harness(),pending=h.control.toggle();h.audio.error={code:4};h.audio.emit('error');h.requests[0].reject(new Error('Unsupported source'));await pending;
  assert.equal(h.control.state,'error');assert.equal(h.audio.paused,true);assert.equal(h.audio.volume,0);assert.equal(h.notices.length,1);assert.equal(h.button.attributes['aria-pressed'],'false');
  const retry=h.control.toggle();assert.equal(h.audio.loads,1);h.requests[1].resolve();await retry;h.step(600);
  assert.equal(h.control.state,'playing');assert.equal(h.audio.volume,.28);h.control.destroy();
});

test('Changing tabs completes a requested pause and an external pause updates the visible toggle',async()=>{
  const h=await harness(),start=h.control.toggle();h.requests[0].resolve();await start;h.step(600);
  await h.control.toggle();h.step(50);h.visibility.hidden=true;h.visibility.emit('visibilitychange');
  assert.equal(h.audio.paused,true);assert.equal(h.jobs.size,0);assert.equal(h.control.state,'idle');
  h.visibility.hidden=false;const again=h.control.toggle();h.requests[1].resolve();await again;h.step(600);h.audio.pause();
  assert.equal(h.control.state,'idle');assert.equal(h.button.attributes['aria-pressed'],'false');h.control.destroy();
});

test('Disposing pending music prevents delayed success from restarting sound or changing the button',async()=>{
  const h=await harness(),pending=h.control.toggle();h.control.destroy();h.requests[0].resolve();await pending;
  assert.equal(h.audio.paused,true);assert.equal(h.audio.volume,0);assert.equal(h.control.state,'idle');assert.equal(h.notices.length,0);assert.equal(h.jobs.size,0);
  assert.equal(h.button.events.get('click').size,0);assert.equal(h.audio.events.get('playing').size,0);
});
