import {LANDMARKS} from './shanghai-landmarks.js';

export const MODULE_STORAGE_KEY='travel-shanghai-landmarks-v1';
export function parseRemovedModules(raw){
  try{const ids=JSON.parse(raw);return new Set(Array.isArray(ids)?ids.filter(id=>LANDMARKS.some(item=>item.id===id)):[]);}catch{return new Set();}
}

// Browser-local landscape choices never enter the trip API or a city's catalog.
export function mountModulePanel({model,canvas,resetView}){
  const trigger=document.querySelector('#manage-landmarks');
  if(!trigger)return()=>{};
  const dialog=document.createElement('dialog');dialog.className='landmark-manager';dialog.id='landmark-manager';
  dialog.setAttribute('aria-labelledby','landmark-manager-title');dialog.setAttribute('aria-describedby','landmark-manager-note');
  dialog.innerHTML='<header class="lm-header"><div><p>上海 · 景观</p><h2 id="landmark-manager-title">管理景点</h2></div><button type="button" class="lm-close" aria-label="关闭景点管理" autofocus>×</button></header><p id="landmark-manager-note" class="lm-note">整组添加或移除，包含所属灯光与景观。仅保存在当前浏览器，不影响旅行行程。</p><div class="lm-list"></div><footer class="lm-footer"><span class="lm-count" role="status" aria-live="polite"></span><button type="button" class="lm-reset">恢复默认</button></footer>';
  const list=dialog.querySelector('.lm-list'),rows=new Map();
  for(const item of LANDMARKS){
    const row=document.createElement('div');row.className='lm-row';
    const label=document.createElement('div'),name=document.createElement('strong'),area=document.createElement('span');name.textContent=item.name;area.textContent=item.area;label.append(name,area);
    const button=document.createElement('button');button.type='button';button.dataset.module=item.id;row.append(label,button);list.append(row);rows.set(item.id,{row,button,item});
  }
  document.body.append(dialog);trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',dialog.id);
  const cleanups=[],listen=(object,event,fn)=>{object.addEventListener(event,fn);cleanups.push(()=>object.removeEventListener(event,fn));};
  function sync(message=''){
    for(const [id,{row,button,item}] of rows){const active=model.landmarks.has(id);row.dataset.present=String(active);button.textContent=active?'移除':'添加';button.setAttribute('aria-label',`${active?'移除':'添加'}${item.name}`);}
    for(const button of document.querySelectorAll('[data-landmark],[data-overview]')){
      const id=button.dataset.landmark??button.dataset.overview;if(id==='overview')continue;
      button.disabled=!model.landmarks.has(id);button.title=button.disabled?'已移除，可在「管理景点」中添加':'';
    }
    canvas.dataset.moduleCount=String(model.landmarks.size);
    dialog.querySelector('.lm-count').textContent=message||`已放置 ${model.landmarks.size} / ${LANDMARKS.length} 个景点`;
    dialog.querySelector('.lm-reset').disabled=model.landmarks.size===LANDMARKS.length;
  }
  function save(){
    try{localStorage.setItem(MODULE_STORAGE_KEY,JSON.stringify(LANDMARKS.filter(item=>!model.landmarks.has(item.id)).map(item=>item.id)));return '';}
    catch{return '本次调整已生效，浏览器未能保存。';}
  }
  function apply(removed){
    for(const {id} of LANDMARKS)model.setLandmarkEnabled(id,!removed.has(id));
    if(canvas.dataset.focus!=='overview'&&!model.landmarks.has(canvas.dataset.focus))resetView();sync();
  }
  let saved=null;try{saved=localStorage.getItem(MODULE_STORAGE_KEY);}catch{}apply(parseRemovedModules(saved));
  listen(trigger,'click',()=>{sync();dialog.showModal();});
  listen(dialog.querySelector('.lm-close'),'click',()=>dialog.close());
  listen(dialog,'close',()=>trigger.focus({preventScroll:true}));
  listen(list,'click',event=>{
    const button=event.target.closest('button[data-module]');if(!button)return;
    const id=button.dataset.module;model.setLandmarkEnabled(id,!model.landmarks.has(id));
    if(canvas.dataset.focus===id&&!model.landmarks.has(id))resetView();sync(save());
  });
  listen(dialog.querySelector('.lm-reset'),'click',()=>{apply(new Set());sync(save());dialog.querySelector('.lm-close').focus();});
  listen(window,'storage',event=>{if(event.key===MODULE_STORAGE_KEY||event.key===null)apply(parseRemovedModules(event.newValue));});
  // The travel shell enables its controls after its asynchronous scene mount.
  listen(canvas,'planetready',()=>sync());
  return()=>{cleanups.forEach(fn=>fn());dialog.close();dialog.remove();};
}
