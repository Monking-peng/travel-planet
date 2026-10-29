import {COMPONENTS,PRESETS,MAX_COMPONENTS,restoreSelection,restorePreviousSelection,normalizeSelection,toggleComponent} from './planet-options.js';
const KEY='travel-planet-scenery-v3';
export function readScenery(){try{const current=localStorage.getItem(KEY);if(current!==null)return normalizeSelection(JSON.parse(current));const previous=localStorage.getItem('travel-planet-scenery-v2'),selected=previous===null?restoreSelection(JSON.parse(localStorage.getItem('travel-planet-scenery-v1'))):restorePreviousSelection(JSON.parse(previous));try{localStorage.setItem(KEY,JSON.stringify(selected));}catch{}return selected;}catch{return normalizeSelection(null);}}
export function setupScenery({planet,openPanel,toast}){
  let selected=readScenery(),filter='全部',inspected='',pickerScroll=0;
  const query=s=>document.querySelector(s);
  function inspectPiece(id){
    const item=COMPONENTS.find(c=>c.id===id);if(!item||!selected.includes(id))return;
    if(!document.body.classList.contains('scenery-inspecting'))pickerScroll=query('#sheet-content').scrollTop;
    inspected=id;document.body.classList.add('scenery-inspecting');query('#scenery-picker').hidden=true;query('#scenery-inspection').hidden=false;query('#sheet-title').textContent=item.name;query('#sheet-title').setAttribute('aria-live','polite');
    const items=COMPONENTS.filter(c=>selected.includes(c.id));query('#inspection-position').textContent=`${items.findIndex(c=>c.id===id)+1} / ${items.length}`;
    for(const button of document.querySelectorAll('[data-inspection-step]'))button.disabled=items.length<2;
    query('#sheet-content').scrollTop=0;planet.setInspection(true);planet.focusComponent(id);query('#inspection-return').focus({preventScroll:true});
  }
  function returnToPicker(){
    document.body.classList.remove('scenery-inspecting');query('#scenery-picker').hidden=false;query('#scenery-inspection').hidden=true;query('#sheet-title').textContent='装扮星球';query('#sheet-title').removeAttribute('aria-live');planet.setInspection(false);planet.focusComponent(inspected);query('#sheet-content').scrollTop=pickerScroll;query(`[data-inspect="${inspected}"]`)?.focus({preventScroll:true});
  }
  function sync(){
    planet.setComponents(selected);
    let saved=true;try{localStorage.setItem(KEY,JSON.stringify(selected));}catch{saved=false;}
    document.querySelectorAll('[data-piece]').forEach(b=>{const chosen=selected.includes(b.dataset.piece);b.setAttribute('aria-pressed',String(chosen));b.textContent=chosen?'✓':'＋';b.closest('.scenery-piece').classList.toggle('selected',chosen);});
    document.querySelectorAll('[data-scenery-preset]').forEach(b=>{const p=PRESETS.find(p=>p.id===b.dataset.sceneryPreset);b.setAttribute('aria-pressed',String(p.items.length===selected.length&&p.items.every(id=>selected.includes(id))));});
    const count=document.querySelector('#scenery-count');if(count)count.textContent=`已放 ${selected.length} 件 · 共 ${MAX_COMPONENTS} 件可选`;
    const status=document.querySelector('#scenery-status');if(status){status.hidden=saved;status.textContent=saved?'':'本次预览已更新 · 浏览器未能保存，刷新后会还原';}
  }
  function drawGrid(){const grid=document.querySelector('#scenery-grid');if(!grid)return;grid.innerHTML=COMPONENTS.filter(c=>filter==='全部'||c.category===filter).map(c=>`<div class="scenery-piece ${selected.includes(c.id)?'selected':''}"><button type="button" class="piece-inspect" data-inspect="${c.id}" aria-label="近看${c.name}"><img src="./assets/scenery/${c.id}.png?v=${c.id==='goldenBall'?27:26}" alt="" width="120" height="100"><span>${c.name}</span></button><button type="button" class="piece-mark" data-piece="${c.id}" aria-label="${c.name}" aria-pressed="${selected.includes(c.id)}" title="添加或移除${c.name}">${selected.includes(c.id)?'✓':'＋'}</button></div>`).join('');}
  function openPicker(){
    if(planet.failed){toast('当前设备无法显示 3D 星球，旅行功能仍可使用。');return;}
    filter='全部';inspected='';pickerScroll=0;document.body.classList.remove('scenery-inspecting');planet.setInspection(false);query('#sheet-title').removeAttribute('aria-live');
    openPanel('装扮星球',`<div id="scenery-picker"><div class="scenery-presets">${PRESETS.map(p=>`<button type="button" data-scenery-preset="${p.id}" aria-pressed="false"><strong>${p.name}</strong></button>`).join('')}</div><div class="scenery-bar"><div class="scenery-filters" aria-label="组件分类">${['全部','杭州风景','自然','城市'].map(c=>`<button type="button" data-scenery-filter="${c}" aria-pressed="${c===filter}">${c}</button>`).join('')}</div><span id="scenery-count" role="status"></span></div><div class="scenery-grid" id="scenery-grid"></div><p class="scenery-status" id="scenery-status" role="status" hidden></p></div><div id="scenery-inspection" class="scenery-inspection" hidden><button id="inspection-return" class="inspection-return" type="button">← 全部景物</button><div class="inspection-tools"><button id="inspection-reset" class="inspection-reset" type="button">回到景物</button></div><div class="inspection-navigation" role="group" aria-label="浏览已放置景物"><button type="button" data-inspection-step="-1" aria-label="上一个景物">‹</button><span id="inspection-position"></span><button type="button" data-inspection-step="1" aria-label="下一个景物">›</button></div></div>`,'scenery');
    planet.reset();drawGrid();sync();
  }
  document.querySelector('#decorate-planet').onclick=openPicker;
  document.addEventListener('click',e=>{
    const piece=e.target.closest('[data-piece]'),inspect=e.target.closest('[data-inspect]'),preset=e.target.closest('[data-scenery-preset]'),tab=e.target.closest('[data-scenery-filter]'),step=e.target.closest('[data-inspection-step]');
    if(e.target.closest('#inspection-return'))returnToPicker();
    if(e.target.closest('#inspection-reset')&&document.body.classList.contains('scenery-inspecting')&&selected.includes(inspected))planet.focusComponent(inspected);
    if(step){const items=COMPONENTS.filter(c=>selected.includes(c.id)),index=items.findIndex(c=>c.id===inspected);if(items.length)inspectPiece(items[(index+Number(step.dataset.inspectionStep)+items.length)%items.length].id);step.focus({preventScroll:true});}
    if(inspect){const id=inspect.dataset.inspect;if(!selected.includes(id)){toast('先点右上角的 ＋ 添加，再靠近看。');return;}inspectPiece(id);}
    if(piece){const result=toggleComponent(selected,piece.dataset.piece);selected=result.selected;sync();if(selected.includes(piece.dataset.piece))planet.focusComponent(piece.dataset.piece);}
    if(preset){selected=[...PRESETS.find(p=>p.id===preset.dataset.sceneryPreset).items];sync();planet.reset();}
    if(tab){filter=tab.dataset.sceneryFilter;document.querySelectorAll('[data-scenery-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===tab)));drawGrid();}
  });
  return {inspect(id){if(!selected.includes(id)||planet.failed)return;openPicker();inspectPiece(id);}};
}
