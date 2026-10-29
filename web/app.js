import {preferenceWarnings,canRespondToPlan} from './travel-preflight.js';
import {selectPlace} from './travel-place-selection.js';
import {createPlanetLoader} from './planet-loader.js';
import {readScenery,setupScenery} from './planet-wardrobe.js';
import {memberSummary,memberResponses} from './travel-members.js';
import {setupMusic} from './travel-music.js';
import {createDraftStore} from './travel-drafts.js';
const drafts=createDraftStore();
const currentCity=document.body.dataset.city==='上海'?'上海':'杭州',isShanghai=currentCity==='上海';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={room:null,user:null,ai:false,places:[],tags:[],panel:null,route:0,view:'travel',poll:null,memberFilter:null,syncFailed:false,panelEpoch:0,ready:false,connecting:false,connectionError:''};
// A pending action belongs to the view that started it. A newer view may
// start its own action; finishing the old one must not unlock the new one.
let pendingRequest=null,pendingPoll=null;
const pendingMutations=new Map(),localGenerations=new Map(),generationErrors=new Map();
const activeGeneration=r=>r&&!r.closed&&!r.final?(localGenerations.get(r.id)||r.generation):null;
const isBusy=()=>pendingRequest?.route===state.route&&pendingRequest?.panel===state.panelEpoch;
function beginRequest(){
  const owner={route:state.route,panel:state.panelEpoch};pendingRequest=owner;
  return {isCurrent:()=>owner.route===state.route&&owner.panel===state.panelEpoch,
    finish(){if(pendingRequest===owner)pendingRequest=null;}};
}
const baseURL=new URL('./',location.href.split('#')[0]);
const cityURL=(city,hash='')=>new URL(city==='上海'?'shanghai-trip.html':'./',baseURL).href+hash;
function redirectCity(city,hash=location.hash){if((city||'杭州')===currentCity)return false;location.replace(cityURL(city,hash));return true;}
const soundIcon='<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
$('#sound').innerHTML=soundIcon;$('#more').innerHTML='<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>';
$('#planet').addEventListener('planetviewchange',({detail:v})=>{const button=$('#rotate-planet');button.setAttribute('aria-pressed',String(v.autoRotate));button.setAttribute('aria-label',v.autoRotate?'暂停自转':'开始自转');button.title=v.autoRotate?'暂停自转':'开始自转';$('#planet-zoom').value=Math.round(v.zoom*100)+'%';$('#zoom-in').disabled=v.zoom>=v.max-.001;$('#zoom-out').disabled=v.zoom<=v.min+.001;});
const planet=createPlanetLoader({canvas:$('#planet'),onPick:id=>placePanel(id),onInspect:id=>scenery?.inspect(id),selection:isShanghai?[]:readScenery(),load:attempt=>import((isShanghai?'./planet-shanghai.js':'./planet.js')+(attempt?'?attempt='+attempt:''))});
const byId=id=>state.places.find(p=>p.id===id);
const dateLabel=(date,days)=>{const d=new Date(date+'T12:00:00'),end=new Date(d);end.setDate(end.getDate()+days-1);return `${d.getMonth()+1} 月 ${d.getDate()} 日${days>1?' — '+(end.getMonth()!==d.getMonth()?end.getMonth()+1+' 月 ':'')+end.getDate()+' 日':''}`;};
const nextSaturday=()=>{const d=new Date();d.setDate(d.getDate()+((6-d.getDay()+7)%7||7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function toast(text){$('#notice').textContent=text;$('#notice').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#notice').classList.remove('visible'),4500);}
async function api(path,body){let response;try{response=await fetch(new URL('api'+path,baseURL),{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}catch{throw new Error('网络暂时断开，请联网后重试。当前页面里已填写的内容仍保留。');}let data;try{data=await response.json();}catch{throw new Error('服务暂时没有响应，请稍后重试。已填写的内容仍保留。');}if(!response.ok){const error=new Error(data.error?.message||'操作没有完成，请重试。');error.code=data.error?.code;throw error;}return data;}
function showError(error){if(error.code==='VIEW_CHANGED')return;const target=$('#panel-error');if(target){target.textContent=error.message;target.scrollIntoView({block:'nearest'});}else toast(error.message);}
function openPanel(title,html,name){const wasScenery=state.panel==='scenery';state.panelEpoch++;state.panel=name;$('#sheet').dataset.panel=name;document.body.classList.toggle('scenery-editing',name==='scenery');if(name!=='scenery')document.body.classList.remove('scenery-inspecting');$('#sheet-title').textContent=title;$('#sheet-content').innerHTML=html;if($('#sheet').open&&wasScenery!==(name==='scenery'))$('#sheet').close();if(!$('#sheet').open){if(name==='scenery')$('#sheet').show();else $('#sheet').showModal();}$('#sheet-content').scrollTop=0;planet.pause(name!=='scenery');planet.setEditing(name==='scenery');}
function closePanel(save=true){if(save&&state.panel==='ideas')saveDraft();state.panelEpoch++;$('#sheet').close();state.panel=null;document.body.classList.remove('scenery-editing','scenery-inspecting');planet.pause(false);planet.setEditing(false);}
$('#close-sheet').onclick=closePanel;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.panel==='scenery'){e.preventDefault();closePanel();$('#decorate-planet').focus();}});$('#sheet').addEventListener('cancel',()=>{if(state.panel==='ideas')saveDraft();state.panel=null;document.body.classList.remove('scenery-editing','scenery-inspecting');planet.pause(false);planet.setEditing(false);});
$('#sheet').addEventListener('click',e=>{if(e.target===$('#sheet')){const r=$('#sheet').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}});
const scenery=isShanghai?null:setupScenery({planet,openPanel,toast});
document.querySelectorAll('[data-overview]').forEach(button=>button.onclick=()=>planet.focusOverview(button.dataset.overview));
$('#night-planet').onclick=()=>planet.toggleNight();
$('#planet').addEventListener('planetthemechange',({detail:v})=>{const b=$('#night-planet');b.setAttribute('aria-pressed',String(v.night));b.setAttribute('aria-label',v.night?'切换到白天':'切换到夜晚');b.textContent=v.night?'☀ 白天':'☾ 夜晚';});
$('#reset-planet').onclick=()=>planet.reset();$('#zoom-in').onclick=()=>planet.zoomBy(1.2);$('#zoom-out').onclick=()=>planet.zoomBy(1/1.2);$('#rotate-planet').onclick=()=>planet.toggleRotation();$('#back').onclick=()=>{closePanel();location.hash='#travel';};$('#more').onclick=()=>state.room?settingsPanel():aboutPanel();
setupMusic({audio:$('#music'),button:$('#sound'),notify:toast});
function avatar(m,ready=false){return `<button class="avatar" style="background:${esc(m.color)}" data-action="member" data-id="${esc(m.id)}" aria-label="查看${esc(m.nickname)}的想法" ${ready?'data-ready="✓"':''}>${esc(m.nickname.slice(0,1))}</button>`;}
function renderOrbit(room){
  let orbit=$('#member-orbit');if(!orbit){orbit=document.createElement('div');orbit.id='member-orbit';orbit.className='member-orbit';$('#planet-stage').append(orbit);}
  $('#planet-stage').classList.toggle('with-members',Boolean(room));
  if(!room){orbit.innerHTML='';return;}
  const activeId=orbit.contains(document.activeElement)?document.activeElement.dataset.id:null;
  const html=room.members.map((m,i)=>{const summary=memberSummary(room,m,id=>byId(id)?.name),y=room.members.length<=2?43:room.members.length<=4?25+Math.floor(i/2)*40:16+Math.floor(i/2)*30;return `<button class="orbit-node orbit-${i}${room.members.length>4&&i>=3?' orbit-wide-only':''}" style="--orbit-y:${y}%" data-action="member" data-id="${esc(m.id)}" data-status="${summary.kind}" title="${esc(m.nickname)}：${esc(summary.detail||summary.text)}" aria-label="${esc(m.nickname)}${m.id===room.me?'（我）':''}：${esc(summary.detail||summary.text)}，查看想法与反馈"><span class="orbit-avatar" style="background:${esc(m.color)}">${esc(m.nickname.slice(0,1))}</span><span class="orbit-copy"><small>${esc(m.nickname)}${m.id===room.me?' · 我':''}</small><span>${esc(summary.text)}</span></span></button>`;}).join('')+(room.members.length>4?`<button class="orbit-node orbit-3 orbit-more" data-action="opinions">还有 ${room.members.length-3} 位旅伴 →</button>`:'');
  if(orbit.innerHTML!==html){orbit.innerHTML=html;if(activeId)[...orbit.querySelectorAll('[data-id]')].find(b=>b.dataset.id===activeId)?.focus({preventScroll:true});}
}
function render(){
  const r=state.room;$('#back-label').textContent=r?'返回首页':'一起去';$('#back .arrow').hidden=!r;
  renderOrbit(r);
  if(!state.ready){$('#heading').innerHTML=`<h1>${currentCity}，慢慢来。</h1>`;$('#members').innerHTML='';$('#action-area').innerHTML=`<button class="primary" data-action="retry" ${state.connecting?'disabled':''}>${state.connecting?'正在连接…':'重新连接'}</button>${state.connectionError?`<p class="action-note" role="status">${esc(state.connectionError)}</p>`:''}`;return;}
  if(!r){
    $('#heading').innerHTML=`<h1>${currentCity}，慢慢来。</h1>`;
    $('#members').innerHTML='';
    $('#action-area').innerHTML='<button class="primary" data-action="create">发起一趟旅行 <span>＋</span></button><div class="action-links"><button class="text-button" data-action="join">加入朋友的旅行</button><button class="text-button" data-action="mytrips">我的旅行</button></div>';return;
  }
  const me=r.members.find(m=>m.id===r.me),allReady=r.summary.missing.length===0,stale=r.proposals.some(p=>p.inputRevision!==r.inputRevision||p.estimationVersion!==2),agreed=r.proposals.filter(p=>p.canFinalize?.ok);
  let stage=r.closed?'旅行已关闭':r.final?(r.final.acceptanceVerified===false?'历史定稿待复核':'已一起决定'):activeGeneration(r)?'正在整理方案':r.proposals.length&&!stale?'看看哪一份都能接受':`${r.summary.submitted}/${r.members.length} 人写下了想法`;
  $('#heading').innerHTML=`<p class="eyebrow"><span class="status-dot"></span>${esc(stage)}</p><h1 class="trip-title">${esc(r.title)}</h1><p class="subline">${esc(dateLabel(r.startDate,r.days))} · ${r.days} 天 · ${esc(r.city||currentCity)}</p>`;
  $('#members').innerHTML=`<button class="orbit-caption" data-action="opinions">${r.members.length} 位旅伴</button>`+(!r.closed&&!r.final&&r.hostId===r.me&&r.members.length<6?'<button class="avatar-add" data-action="invite" aria-label="邀请旅伴">＋</button>':'');
  let action='ideas',label=me?.preferences?'调整我的想法':'写下我的想法',note='想去哪里、不想太累，都可以说。';
  if(r.closed){action=r.final?'final':r.proposals.length?'plans':'opinions';label=r.final?'查看已定稿行程':r.proposals.length?'查看已保存的方案':'查看已保存的想法';note=r.final?(r.final.acceptanceVerified===false?'旅行已关闭。这份历史定稿存在未明确接受的记录。':'旅行已关闭，定稿行程仍可查看和复制。'):r.proposals.length?'旅行已关闭，保存的方案尚未定稿，仅供查看。':'旅行在生成方案前关闭，已保存的想法仍可查看。';}
  else if(r.final){action='final';label='查看我们的行程';note=r.final.acceptanceVerified===false?'历史确认待复核，请发起人重新开启讨论。':'每位旅伴都明确接受了这份安排。';}
  else if(activeGeneration(r)){action='generate';label='查看整理进度';note='可以先查看或修改想法，完成后再一起确认。';}
  else if(r.proposals.length&&!stale){action='plans';label=agreed.length&&r.hostId===r.me?(agreed.length===1?'确认这份共同方案':'选一份，确认定稿'):'看看两种安排';note=agreed.length?(r.hostId===r.me?'所有旅伴已明确接受，最后由你定稿。':'已达成一致，等发起人定稿。'):'两份都能接受，也可以分别确认。';}
  else if(me?.preferences&&r.summary.conflicts.length){action='opinions';label='先商量一下分歧';note=`${r.summary.conflicts.length} 处必去与不去的限制冲突，先看看原因。`;}
  else if(allReady&&r.hostId===r.me&&r.members.length===1&&!r.proposals.length){action='invite';label='邀请朋友，一起商量';note='你的想法已提交，可以发邀请给朋友，也可以先自己出方案。';}
  else if(allReady&&r.hostId===r.me){action='generate';label=stale?'按新想法再出方案':'一起出个方案';note=state.ai?'AI 整理取舍，最后由大家决定。':'基础排程可用，AI 连接仍在准备中。';}
  else if(me?.preferences){action='opinions';label='看看大家的想法';note=allReady?'想法已齐，等发起人整理成方案。':r.summary.missing.length===1?`还在等 ${r.summary.missing[0].nickname} 的想法。`:`还在等 ${r.summary.missing.length} 位旅伴写下想法。`;}
  $('#action-area').innerHTML=`<button class="primary" data-action="${action}" title="${esc(note)}">${esc(label)} <span>→</span></button><div class="action-links">${action!=='ideas'&&!r.final&&!r.closed?'<button class="text-button" data-action="ideas">我的想法</button>':''}${action!=='opinions'?'<button class="text-button" data-action="opinions">大家的想法</button>':''}${r.closed&&r.final&&r.proposals.length?'<button class="text-button" data-action="plans">其他方案</button>':''}${action==='invite'?'<button class="text-button" data-action="generate">先自己出方案</button>':r.hostId===r.me&&!r.final&&!r.closed?'<button class="text-button" data-action="invite">邀请旅伴</button>':''}</div>`;
}
function aboutPanel(){openPanel('一起去 · '+currentCity,`<div class="product-menu"><button class="secondary full-width" data-action="catalog">浏览景点目录</button><button class="secondary full-width" data-action="create">发起一趟旅行</button><button class="secondary full-width" data-action="join">加入朋友的旅行</button><button class="secondary full-width" data-action="mytrips">我的旅行</button></div><details class="product-data"><summary>数据与行程说明</summary><p>旅行内容仅成员可见，个人预算仅本人可查看；共同可行预算用于排程。提交的想法会与旅伴分享，未提交草稿保存在当前浏览器。</p><p>星球为艺术化示意。行程费用、路程和时间为估算，营业、预约和票价请在出发前核实。</p></details>`,'about');}
function createPanel(placeId=null){openPanel('发起一趟'+currentCity+'旅行',`<form id="create-form">${placeId?`<input type="hidden" name="selectedPlace" value="${esc(placeId)}"><p class="inline-message">创建后会先把「${esc(byId(placeId)?.name)}」选入你的草稿，提交后才会分享。</p>`:''}<label class="field"><span>怎么称呼你</span><input name="nickname" maxlength="16" required value="${esc(state.user?.nickname||'')}" placeholder="旅伴能认出的名字" autocomplete="nickname"></label><label class="field"><span>给旅行起个名字</span><input name="title" maxlength="32" value="一起去${currentCity}" required></label><div class="row"><label class="field"><span>出发日期</span><input type="date" name="startDate" value="${nextSaturday()}" required></label><label class="field"><span>玩几天</span><select name="days"><option value="1">1 天</option><option value="2" selected>2 天</option><option value="3">3 天</option></select></label></div><p class="error-text" id="panel-error" role="alert"></p><button class="primary full" type="submit">创建旅行</button></form>`,'create');}
function joinPanel(){openPanel('加入朋友的旅行','<form id="join-form"><label class="field"><span>粘贴朋友发来的邀请</span><textarea name="invite" required placeholder="粘贴完整邀请链接"></textarea></label><p class="error-text" id="panel-error" role="alert"></p><button class="primary full" type="submit">打开邀请</button></form>','join');}
async function invitePreview(id,token){
  openPanel('正在打开邀请','<p class="empty" role="status" aria-busy="true">正在读取邀请…</p>','invite-loading');
  $('#close-sheet').focus({preventScroll:true});
  const seq=state.route,epoch=state.panelEpoch,current=()=>seq===state.route&&epoch===state.panelEpoch&&state.panel==='invite-loading';
  try{
    const {invite}=await api(`/rooms/${id}/invite?token=${encodeURIComponent(token)}`);if(!current())return;
    if(!invite?.id||!Array.isArray(invite.members))throw new Error('邀请信息没有加载完整，请重试。');
    if(redirectCity(invite.city,'#join/'+id+'/'+token))return;
    const summary=`<p class="about-name">${esc(invite.title)}</p><p class="muted">${esc(dateLabel(invite.startDate,invite.days))} · ${invite.days} 天</p>`;
    if(invite.joined){openPanel('继续这趟旅行',summary+`<p class="muted">你已经加入这趟旅行，可以直接查看${invite.final?'已定稿的行程':'大家的想法'}。</p><button class="primary full section-gap" data-action="open-room" data-id="${esc(id)}">打开这趟旅行</button>`,'invite-member');return;}
    openPanel('朋友邀请你一起去',summary+`<p class="muted">${invite.members.map(m=>esc(m.nickname)).join('、')} 已经在这里。</p><form id="accept-invite" data-id="${esc(id)}" data-token="${esc(token)}"><label class="field"><span>怎么称呼你</span><input name="nickname" maxlength="16" required value="${esc(state.user?.nickname||'')}" placeholder="旅伴能认出的名字"></label><p class="tiny">加入后，你的想法会向这次旅行的成员展示。可以先看大家的意见，再写下自己的想法。</p><p class="error-text" id="panel-error" role="alert"></p><button class="primary full" type="submit" ${invite.final?'disabled':''}>${invite.final?'旅行已经定稿':'加入这趟旅行'}</button></form>`,'accept-invite');
  }catch(error){
    if(!current())return;
    const retry=!['INVITE_INVALID','NOT_FOUND'].includes(error.code);
    openPanel('暂时无法加入',`<p class="error-text" role="alert">${esc(error.message)}</p>${retry?`<button class="primary full section-gap" data-action="retry-invite" data-id="${esc(id)}" data-token="${esc(token)}">重新读取邀请</button>`:''}<button class="${retry?'text-button':'secondary'} full-width section-gap" data-action="join">换一个邀请</button>`,'invite-error');
  }
}
function invitePanel(){const r=state.room;if(!r?.inviteToken){toast('请让发起人分享邀请。');return;}const url=cityURL(r.city,'#join/'+r.id+'/'+r.inviteToken);openPanel('叫上旅伴，一起商量',`<p class="muted">把邀请发到微信群，朋友打开后填写昵称就能加入。</p><div class="invite-link">${esc(url)}</div><div class="form-actions"><button class="primary" data-action="copy-invite">复制邀请</button><button class="secondary" data-action="share-invite">分享</button></div><p class="tiny section-gap">仅邀请加入的成员可以查看旅行。邀请被转发后，持有邀请的人也能加入，最多 6 人；可在更多选项中撤销旧邀请。</p><button class="secondary full-width section-gap" data-action="${r.members.find(m=>m.id===r.me)?.preferences?'cancel':'ideas'}">${r.members.find(m=>m.id===r.me)?.preferences?'返回旅行，查看进展':'继续写我的想法'} →</button>`,'invite');}
const defaultPrefs=()=>({text:'',tags:[],wants:[],must:[],avoid:[],budget:state.room.days*250,maxWalk:5,startHour:9,pace:'relaxed',diet:''});
const draftKey=()=>`travel-draft:${state.user.id}:${state.room.id}`;
function readDraft(){return drafts.read(draftKey());}
function showDraftStatus(status){
  const message=$('#draft-message'),retry=$('[data-action=retry-draft]');if(!message)return;
  const text={saved:'草稿已保存到本机，尚未提交。提交修改后，大家需重新确认方案。',session:'草稿仅在当前页面保留，刷新或关闭网页会丢失。请重试保存或先提交。',unavailable:'本机旧草稿未能读取，请核对当前内容。', 'clear-failed':'想法已提交，但本机旧草稿未能清理，下次打开请核对。',empty:'确认提交后，旅伴才会看到这些想法；修改后需重新确认方案。'}[status];
  if(message.textContent!==text)message.textContent=text;
  if(status==='session'&&$('#draft-status').dataset.state&&$('#draft-status').dataset.state!=='session')toast('本机保存失败，草稿暂存在当前页面；请勿刷新或关闭网页。');
  $('#draft-status').dataset.state=status;retry.hidden=!['session','unavailable','clear-failed'].includes(status);
}
function collectPrefs(){const form=$('#ideas-form');if(!form)return null;const data=Object.fromEntries(new FormData(form));for(const group of ['tags','wants','must','avoid'])data[group]=$$(`[data-group="${group}"].selected`).map(n=>n.dataset.value);return data;}
function updatePreferenceSummaries(p){
  const warningBox=$('#preference-warnings');if(warningBox){
    const warnings=preferenceWarnings(p,state.places,state.room);
    warningBox.hidden=!warnings.length;
    const html=warnings.length?`<strong>这些选择可能排不进去</strong><p>按你目前填写的限制检查；想去的地点可能被省略，必去项目则会阻止生成。</p>${warnings.map(w=>`<p>${esc(w.text)} <button type="button" class="text-button" data-action="${w.target==='place'?'place':w.target==='limits'?'adjust-budget':'adjust-limits'}" ${w.id?`data-id="${esc(w.id)}"`:''}>${w.target==='place'?'查看说明':w.target==='limits'?'调整预算与节奏':'调整必去项目'} →</button></p>`).join('')}`:'';
    if(warningBox.innerHTML!==html)warningBox.innerHTML=html;
  }
  const notes=$('#selected-visit-notes');if(notes)notes.innerHTML=(p.wants||[]).filter(id=>byId(id)?.visitNote||byId(id)?.costNote).map(id=>{const place=byId(id);return `<details><summary>${esc(place.name)} · ${place.exclusiveDay?'单独一天':'入场须知'}</summary><p>${esc(place.visitNote)} ${esc(place.costNote)}</p></details>`;}).join('');
  const pace={relaxed:'轻松一点',balanced:'刚刚好',full:'多逛一点'};
  const limits=$('#preference-limits-summary'),restrictions=$('#preference-restrictions-summary');
  if(limits)limits.textContent=`${p.budget!==''?'当地活动 ¥'+p.budget+' / 人':'当地预算待填写'} · 每天 ≤ ${p.maxWalk} km · ${p.startHour}:00 后 · ${pace[p.pace]||'节奏待选'}`;
  if(restrictions){const parts=[];for(const [key,label] of [['must','必去'],['avoid','不去']])if(p[key]?.length)parts.push(label+'：'+p[key].map(id=>byId(id)?.name||id).join('、'));if(p.diet)parts.push(p.diet);restrictions.textContent=parts.join('；')||'必去、不去、饮食限制（选填）';}
}
function saveDraft(){if(state.panel!=='ideas')return;const data=collectPrefs();if(data){updatePreferenceSummaries(data);if(state.room)showDraftStatus(drafts.write(draftKey(),data));}}
const editingNotice='<div id="editing-notice" class="inline-message" role="status" hidden><p id="editing-message"></p><button type="button" class="text-button" id="editing-next"></button></div>';
function editingBlock(form){
  const r=state.room;if(!r||!form)return null;
  if(r.closed)return {message:'这次旅行已关闭，当前内容不能再提交。已填写的内容仍在这里。',action:'opinions',label:'查看已保存的想法'};
  if(r.final)return {message:'行程已经定稿，现在不能提交修改。发起人开启新一轮讨论后，可以继续。',action:'final',label:'查看已定稿行程'};
  if(form.id==='vote-reason'){
    const p=r.proposals.find(p=>p.id===form.dataset.id);
    if(!p||p.inputRevision!==r.inputRevision||p.version!==Number(form.dataset.version))return {message:'方案已经更新，不能再向旧方案提交反馈。请看过当前方案后再决定。',action:'plans',label:'查看当前方案'};
  }
  const pending=pendingMutations.get(r.id);
  if(pending&&(pending.route!==state.route||pending.panel!==state.panelEpoch))return {message:'上一次修改仍在提交，可以继续编辑，完成后再提交。',waiting:true};
  return null;
}
function refreshEditingPanel(){
  if(!['ideas','vote-reason'].includes(state.panel))return null;
  const form=$('#ideas-form')||$('#vote-reason'),notice=$('#editing-notice');if(!form||!notice)return null;
  const block=editingBlock(form),message=block?.message||'',previous=notice.dataset.message;
  if(block&&previous!==undefined&&previous!==message)toast(message);
  notice.hidden=!block;notice.dataset.message=message;
  $('#editing-message').textContent=message;
  const next=$('#editing-next');next.hidden=!block?.action;next.textContent=block?.label||'';next.dataset.action=block?.action||'';
  form.dataset.blocked=String(Boolean(block));
  for(const button of form.querySelectorAll('[type=submit],[data-action=extract]'))button.disabled=isBusy()||Boolean(block&&!(block.waiting&&button.dataset.action==='extract'));
  return block;
}
function ideasPanel(extraction,currentDraft){const r=state.room;if(!r||r.closed||r.final){toast('这份行程当前不能修改。');return;}const me=r.members.find(m=>m.id===r.me),draft=readDraft(),p={...defaultPrefs(),...(me.preferences||{}),...(draft.data||{}),...(currentDraft||{})};
  if(extraction){for(const key of ['tags','wants','must','avoid'])if(extraction[key]?.length)p[key]=extraction[key];for(const key of ['budget','maxWalk','startHour','pace','diet'])if(extraction[key]!=null&&extraction[key]!=='')p[key]=extraction[key];}
  const chips=(values,group,selected)=>values.map(t=>{const id=typeof t==='string'?t:t.id,name=typeof t==='string'?t:t.name;return `<button type="button" class="chip ${selected?.includes(id)?'selected':''}" data-group="${group}" data-value="${esc(id)}" aria-pressed="${selected?.includes(id)?'true':'false'}">${esc(name)}</button>`;}).join('');
  openPanel('这一趟，你想怎么过？',`<form id="ideas-form">${editingNotice}<label class="field"><span>随便说说你的想法</span><textarea name="text" maxlength="1000" placeholder="比如：想看看${isShanghai?'外滩':'西湖'}，吃点好吃的，别安排太早。">${esc(p.text)}</textarea><small>原话会分享给旅伴。预算请填在下方的专用字段。</small></label>${state.ai?'<button class="small-button" type="button" data-action="extract">帮我整理一下</button>':'<span class="tiny">也可以直接选下面的偏好。</span>'}<p id="extract-notice" class="tiny" role="status" hidden></p><p id="submit-notice" class="tiny" role="status" hidden></p>${extraction?`<div class="inline-message" id="extract-result">${esc(extraction.summary)}${extraction.questions?.map(q=>`<br>待补充：${esc(q)}`).join('')||''}<br>请检查整理结果，确认后再提交。</div>`:''}<p class="section-title">喜欢的旅行感觉</p><div class="chips">${chips(state.tags,'tags',p.tags)}</div><p class="section-title">想去的地方 <span class="tiny">可多选，也可以暂不选</span></p><p class="tiny">本次只安排下方 ${state.places.length} 个去处，目录外地点暂不纳入方案。${isShanghai?'外观与入园项目已分别标注。迪士尼和天文馆各需单独一天；门票、预约与交通请先看地点说明。':''}</p><div class="chips">${chips(state.places,'wants',p.wants)}</div><button type="button" class="text-button" data-action="catalog">查看景点说明与入场要求 →</button><div id="preference-warnings" class="preference-warnings" role="status" hidden></div><div id="selected-visit-notes" class="tiny"></div><details id="preference-limits" class="ideas-options" ${extraction&&['budget','maxWalk','startHour','pace'].some(key=>extraction[key]!=null&&extraction[key]!=='')?'open':''}><summary><span><strong>预算与节奏</strong><small id="preference-limits-summary"></small></span></summary><div class="ideas-options-body"><div class="row"><label class="field"><span>当地活动预算 / 人</span><input type="number" name="budget" min="50" max="10000" step="1" required value="${esc(p.budget)}"><small>这 ${r.days} 天合计，含吃饭和市内交通；不含住宿、往返${currentCity}交通。个人金额仅自己可见。</small></label><label class="field"><span>每天最多走多远</span><select name="maxWalk">${[3,5,8,12].map(n=>`<option value="${n}" ${Number(p.maxWalk)===n?'selected':''}>约 ${n} 公里</option>`).join('')}</select><small>作为排程上限，实际路况仍需核实。</small></label></div><div class="row"><label class="field"><span>最早几点出门</span><select name="startHour">${[8,9,10,11].map(n=>`<option value="${n}" ${Number(p.startHour)===n?'selected':''}>${n}:00</option>`).join('')}</select></label><label class="field"><span>想要的节奏</span><select name="pace"><option value="relaxed" ${p.pace==='relaxed'?'selected':''}>轻松一点</option><option value="balanced" ${p.pace==='balanced'?'selected':''}>刚刚好</option><option value="full" ${p.pace==='full'?'selected':''}>多逛一点</option></select></label></div></div></details><details id="preference-restrictions" class="ideas-options" ${p.must?.length||p.avoid?.length||p.diet?'open':''}><summary><span><strong>还有必须满足的事</strong><small id="preference-restrictions-summary"></small></span></summary><div class="ideas-options-body"><p class="field-label">一定要去</p><div class="chips">${chips(state.places,'must',p.must)}</div><p class="field-label section-gap">这次不去</p><div class="chips">${chips(state.places,'avoid',p.avoid)}</div><label class="field section-gap"><span>饮食或其他限制</span><input name="diet" maxlength="120" value="${esc(p.diet)}" placeholder="比如不吃辣，想留出午休时间"></label></div></details><p class="error-text" id="panel-error" role="alert"></p><div class="form-actions"><button class="primary" type="submit">确认，把想法放上去</button></div><p id="draft-status" class="tiny" role="status"><span id="draft-message"></span> <button type="button" class="text-button" data-action="retry-draft" hidden>重试本机保存</button></p></form>`,'ideas');
  updatePreferenceSummaries(p);showDraftStatus(draft.status);refreshEditingPanel();
  $('#ideas-form').addEventListener('invalid',e=>{const section=e.target.closest('details');if(section)section.open=true;},true);
}
function opinionsPanel(memberId){const r=state.room;if(!r)return;state.memberFilter=memberId||null;const members=memberId?r.members.filter(m=>m.id===memberId):r.members;let html=r.closed?`<p class="inline-message">旅行已关闭，以下是已保存的想法。${r.final?'<br><button class="text-button" data-action="final">查看已定稿行程 →</button>':r.proposals.length?'<br><button class="text-button" data-action="plans">查看已保存的方案 →</button>':''}</p>`:'';if(!memberId&&r.summary.commonTags.length)html+=`<p class="field-label">大家提到的旅行感觉</p><div class="chips">${r.summary.commonTags.map(t=>`<span class="mini-tag">${esc(t.tag)} · ${t.count} 人</span>`).join('')}</div>`;
  if(memberId&&members[0]){const responses=memberResponses(r,members[0]);if(responses.length)html+=`<section class="member-feedback" aria-label="当前方案反馈"><p class="section-title">${esc(members[0].nickname)}的当前反馈</p>${responses.map(response=>`<div class="member-response" data-status="${response.value||'waiting'}"><span class="response-letter">${response.letter}</span><div><strong>${esc(response.label)}</strong><small>${esc(response.title)}</small>${response.reason?`<p>${esc(response.reason)}</p>`:''}</div></div>`).join('')}<button class="text-button" data-action="plans">查看两份方案 →</button></section>`;else if(!r.closed&&!r.final&&r.proposals.length)html+='<p class="inline-message">意见已更新，正在等待新方案，旧反馈不再用于确认。</p>';}
  if(!memberId&&r.summary.conflicts.length){const mine=r.members.find(m=>m.id===r.me)?.preferences;html+=r.summary.conflicts.map(c=>`<div class="inline-message conflict-card"><strong>${esc(c.title)}</strong><p>${esc(c.detail)}</p>${!r.closed&&!r.final&&(mine?.must?.includes(c.placeId)||mine?.avoid?.includes(c.placeId))?'<button class="small-button" data-action="adjust-limits">调整我的限制</button>':''}</div>`).join('');}
  html+=members.map(m=>`<div class="opinion"><div class="person-row"><span class="avatar small" style="background:${esc(m.color)}">${esc(m.nickname.slice(0,1))}</span><div><strong>${esc(m.nickname)}${m.id===r.me?' · 我':''}</strong><small>${m.preferences?'已写下想法':'还没写想法'}</small></div></div>${m.preferences?`<p>${esc(m.preferences.text||'先选了一些旅行偏好。')}</p><div class="tag-line">${m.preferences.tags.map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}<span class="mini-tag">${m.preferences.startHour}:00 后出门</span><span class="mini-tag">每天 ≤ ${m.preferences.maxWalk} km</span></div>${m.preferences.wants.length?`<p class="muted">想去：${m.preferences.wants.map(id=>esc(byId(id)?.name)).join('、')}</p>`:''}${m.preferences.must.length?`<p class="tiny">必去：${m.preferences.must.map(id=>esc(byId(id)?.name)).join('、')}</p>`:''}${m.preferences.avoid.length?`<p class="tiny">不去：${m.preferences.avoid.map(id=>esc(byId(id)?.name)).join('、')}</p>`:''}${m.preferences.diet?`<p class="tiny">其他限制：${esc(m.preferences.diet)}</p>`:''}`:''}</div>`).join('');
  if(!memberId){html+=r.closed||r.final?(r.comments.length?'<p class="section-title">补充记录</p>':''):'<p class="section-title">再补充一句</p>';html+=r.comments.map(c=>`<p class="comment"><strong>${esc(r.members.find(m=>m.id===c.memberId)?.nickname||'已退出的旅伴')}</strong><br>${esc(c.text)}</p>`).join('');if(!r.closed&&!r.final)html+='<form id="comment-form"><label class="field"><textarea name="text" maxlength="500" required placeholder="针对这趟旅行补充一点想法…"></textarea></label><p class="error-text" id="panel-error" role="alert"></p><button class="secondary full-width" type="submit">补充想法</button></form>';}
  openPanel(memberId?'旅伴的想法':'每个人的想法',html,'opinions');
}
function rememberIdeasReturn(){
  if(state.panel==='ideas'){saveDraft();state.ideasReturn={roomId:state.room.id,scroll:$('#sheet-content').scrollTop};}
  else if(!['place','catalog'].includes(state.panel))state.ideasReturn=null;
}
function returnToIdeas(){
  const view=state.ideasReturn;state.ideasReturn=null;
  if(!view||view.roomId!==state.room?.id)return;
  ideasPanel();if(state.panel==='ideas'){$('#sheet-content').scrollTop=view.scroll;$('#ideas-form [data-action=catalog]').focus({preventScroll:true});}
}
function ideasBackLink(){return state.ideasReturn&&state.room&&state.ideasReturn.roomId===state.room.id&&!state.room.closed&&!state.room.final?'<button class="text-button itinerary-back" data-action="return-ideas">← 返回我的想法（草稿已保留）</button>':'';}
function catalogPanel(){
  if(!state.ready){toast('请先完成连接，再查看景点。');return;}
  rememberIdeasReturn();
  openPanel(currentCity+'景点目录',`${ideasBackLink()}<p class="muted">先看游览范围和入场要求，再放进旅行想法。星球是微缩示意，行程按实际地点估算。</p><div class="destination-list">${state.places.map(p=>`<button class="destination-card" data-action="place" data-id="${esc(p.id)}"><strong>${esc(p.name)}</strong><span>${esc(p.short)}</span><small>${p.exclusiveDay?'单独一天':p.minutes+' 分钟'} · ${p.walk} km${p.cost?' · 门票预留 ¥'+p.cost:''}</small></button>`).join('')}</div>`,'catalog');
}
function addPlaceToIdeas(id){
  const place=byId(id),room=state.room;if(!place||!room||room.final||room.closed){toast('当前旅行不能修改，请先开启讨论。');return;}
  const me=room.members.find(m=>m.id===room.me),draft=readDraft();
  const current={...defaultPrefs(),...(me.preferences||{}),...(draft.data||{}),...(collectPrefs()||{})};
  const removed=current.avoid?.includes(id);ideasPanel(null,selectPlace(current,id));saveDraft();
  toast('已选中「'+place.name+'」，提交后旅伴才能看到。'+(removed?'已取消该地点的「不去」。':''));
}
function placePanel(id,returnView=null){const p=byId(id);if(!p)return;rememberIdeasReturn();state.placeReturn=returnView;openPanel(p.name,`${returnView?'<button class="text-button itinerary-back" data-action="return-itinerary">← 返回当天行程</button>':'<button class="text-button itinerary-back" data-action="catalog">← 景点目录</button>'}${!returnView?ideasBackLink():''}<p class="muted">${esc(p.description)}</p><div class="tag-line">${p.tags.map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div><p class="section-title">安排时参考</p><p class="muted">${p.exclusiveDay?'单独安排一天；':''}游览约 ${p.minutes} 分钟，景点内步行约 ${p.walk} 公里。均为规划估算。</p>${p.visitNote?`<div class="inline-message">${esc(p.visitNote)}${p.closedWeekdays?.length?'<br>节假日与临时调整以官方公告为准。':''}</div>`:p.reservation?'<div class="inline-message">涉及票务或游船，出发前请核实开放、票价与预约。</div>':''}${p.costNote?`<p class="muted">${esc(p.costNote)}</p>`:''}<a class="text-button" href="${esc(p.source)}" target="_blank" rel="noopener">查看官方介绍与规则 ↗</a>${state.room?(!state.room.final&&!state.room.closed?`<div class="form-actions"><button class="primary" data-action="add-place" data-id="${esc(id)}">放进我的想法</button></div>`:'<p class="tiny">旅行已定稿或关闭，当前仅能查看。</p>'):`<div class="form-actions"><button class="primary" data-action="create-from-place" data-id="${esc(id)}">从这里发起旅行</button></div>`}`,'place');}
function proposal(id){return state.room.proposals.find(p=>p.id===id)||state.room.history.flatMap(h=>h.proposals||[h.proposal]).find(p=>p.id===id)||(state.room.final?.proposal?.id===id?state.room.final.proposal:null);}
function plansPanel(){
  const r=state.room;if(!r)return;if(!r.proposals.length){if(r.closed){if(r.final)itineraryPanel(null,true);else opinionsPanel();}else generatePanel();return;}
  const readOnly=r.closed||Boolean(r.final),intro=r.closed?(r.final?'旅行已关闭，已标出最终采用的方案。其余方案仅供查看。':'旅行已关闭，以下方案尚未定稿，仅供查看。'):r.final?'行程已经定稿，已标出最终采用的方案。其他方案保留供查看。':'「更喜欢」只记录偏好；「可以接受」才计入定稿。两份都能接受，也可以分别确认。';
  let html=`<p class="tiny compare-note">${intro}</p>`;
  if(r.proposals.some(p=>p.inputRevision!==r.inputRevision||p.estimationVersion!==2))html+=`<div class="inline-message error">${r.closed?'关闭前的想法已变化，以下旧方案没有据此更新，不能视为最终行程。':'想法或交通预算规则已更新。以下是旧方案，请重新整理后再确认。'}</div>`;
  html+='<div class="plan-comparison">'+r.proposals.map((p,i)=>{
    const letter=i?'B':'A',stale=p.inputRevision!==r.inputRevision||p.estimationVersion!==2,stored=r.votes[r.me]?.[p.id],vote=!stale&&stored?.version===p.version?stored:null;
    return `<article class="plan-card" aria-labelledby="plan-title-${esc(p.id)}">
      <div class="plan-overview"><span class="plan-index">方案 ${letter} · 第 ${p.version} 版</span>${p.mode==='basic'?' <span class="mode-label">基础排程</span>':''}${r.final?.proposal.id===p.id?' <span class="mini-tag">已定稿</span>':''}
      <h3 id="plan-title-${esc(p.id)}">${esc(p.title)}</h3><p class="plan-reason">${esc(p.reason)}</p></div>
      <div class="plan-metrics"><div>约 ¥${p.budget}<small>每人当地活动费用</small></div><div>约 ${p.walk} km<small>${r.days} 天总步行</small></div></div>
      <div class="plan-places"><div class="tag-line">${p.included.slice(0,5).map(id=>`<span class="mini-tag">${esc(byId(id)?.name)}</span>`).join('')}${p.included.length>5?`<span class="mini-tag">＋${p.included.length-5}</span>`:''}</div>
      <button class="text-button" data-action="plan" data-id="${p.id}">展开每天怎么走 →</button>${p.omitted.length?`<p class="tiny">这份暂未纳入：${p.omitted.map(id=>esc(byId(id)?.name)+(p.omissionReasons?.[id]?'（'+esc(p.omissionReasons[id])+'）':'')).join('；')}</p>`:''}</div>
      <div class="plan-decision">${!r.closed&&!r.final?`<div class="vote-options" role="group" aria-label="我对方案 ${letter} 的回应">${[['prefer','更喜欢这份'],['accept','可以接受'],['change','需要修改']].map(([value,label])=>`<button data-action="vote" data-id="${p.id}" data-value="${value}" aria-pressed="${vote?.value===value}" class="${vote?.value===value?'selected':''}" ${stale?'disabled':''}>${label}</button>`).join('')}</div>`:''}
      <div class="accept-status"><span>${r.closed?'关闭时 ':''}${p.accepted||0}/${r.members.length} 人可以接受</span><button class="text-button" data-action="responses" data-id="${p.id}">看反馈</button></div>
      ${r.hostId===r.me&&!r.final&&!r.closed?`<button class="${p.canFinalize?.ok?'primary':'secondary'} full" data-action="finalize" data-id="${p.id}" ${p.canFinalize?.ok?'':'disabled'}>就定这份</button>${!p.canFinalize?.ok?`<p class="tiny finalize-note">${esc(p.canFinalize?.reason)}</p>`:''}`:''}</div>
    </article>`;
  }).join('')+'</div>';
  if(r.hostId===r.me&&!r.final&&!r.closed)html+='<button class="secondary full-width" data-action="revise">根据大家反馈，调整方案</button>';
  openPanel(readOnly?'已保存的方案':'哪份安排，大家都能接受？',html,'plans');
}
function mapSvg(p){const stops=p.days.flatMap(d=>d.stops),points=stops.map(s=>byId(s.placeId));if(!points.length)return '';const minX=Math.min(...points.map(p=>p.lng))-.008,maxX=Math.max(...points.map(p=>p.lng))+.008,minY=Math.min(...points.map(p=>p.lat))-.006,maxY=Math.max(...points.map(p=>p.lat))+.006;
  const xy=p=>[(p.lng-minX)/(maxX-minX)*370+25,205-(p.lat-minY)/(maxY-minY)*175];const coords=points.map(xy);return `<div class="map-preview" role="img" aria-label="地点相对位置示意，不是导航路线"><svg viewBox="0 0 420 230"><rect width="420" height="230" fill="#e9eee1"/>${isShanghai?'':'<path d="M120 30Q265 5 300 110T170 205Q80 160 120 30Z" fill="#ccdeda" opacity=".65"/>'}<polyline points="${coords.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#8fa689" stroke-width="2" stroke-dasharray="5 5"/>${coords.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="10" fill="#56785d"/><text x="${x}" y="${y+3}" font-size="9" text-anchor="middle" fill="#fff">${i+1}</text><text x="${Math.max(45,Math.min(370,x))}" y="${y-16}" text-anchor="middle" font-size="10" fill="#466045">${esc(points[i].name)}</text>`).join('')}<text x="15" y="220" font-size="9" fill="#88937e">地点示意 · 连线不代表实际道路</text></svg></div>`;}
function itineraryDate(startDate,day){const d=new Date(startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+day-1);return {iso:d.toISOString().slice(0,10),short:`${d.getUTCMonth()+1} 月 ${d.getUTCDate()} 日`,full:`${d.getUTCFullYear()} 年 ${d.getUTCMonth()+1} 月 ${d.getUTCDate()} 日 · 周${'日一二三四五六'[d.getUTCDay()]}`};}
function showItineraryDay(day,{focus=false}={}){
  const view=state.itinerary,section=$(`#itinerary-day-${day}`);if(!view||!section||!['final','itinerary'].includes(state.panel))return;
  view.day=day;
  $$('.itinerary-day').forEach(el=>{el.hidden=el!==section;});
  $$('[data-action=itinerary-day]').forEach(button=>{const active=Number(button.dataset.id)===day;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus({preventScroll:true});});
  $('#sheet-content').scrollTop=0;
}
function itineraryDecision(room,plan){
  const stored=room.votes[room.me]?.[plan.id],vote=stored?.version===plan.version?stored:null;
  const waiting=room.members.filter(m=>{const v=room.votes[m.id]?.[plan.id];return v?.version!==plan.version||v.value!=='accept';});
  return `<section class="itinerary-decision" aria-label="回应完整方案"><strong>看完全部 ${plan.days.length} 天，再回应这份安排</strong><div class="vote-options" role="group" aria-label="我对完整方案的回应">${[['prefer','更喜欢这份'],['accept','可以接受'],['change','需要修改']].map(([value,label])=>`<button data-action="vote" data-id="${esc(plan.id)}" data-version="${plan.version}" data-value="${value}" aria-pressed="${vote?.value===value}" class="${vote?.value===value?'selected':''}">${label}</button>`).join('')}</div><p class="decision-progress" role="status">${plan.accepted||0}/${room.members.length} 人可以接受${waiting.length?' · 等待 '+waiting.map(m=>esc(m.id===room.me?'你':m.nickname)).join('、')+' 明确接受':room.hostId===room.me?' · 可以由你定稿':' · 等待发起人定稿'}</p>${room.hostId===room.me&&plan.canFinalize?.ok?`<button class="primary full-width" data-action="finalize" data-id="${esc(plan.id)}">大家已接受，就定这份</button>`:''}</section>`;
}
function budgetDetails(d){const c=d.costBreakdown;if(!c)return '';return `<details class="day-budget"><summary>当天费用预留 ¥${c.total} / 人 · 查看明细</summary><dl><div><dt>门票预留</dt><dd>¥${c.tickets}</dd></div><div><dt>餐饮与饮水</dt><dd>¥${c.meals}</dd></div><div><dt>市内交通</dt><dd>¥${c.transport}</dd></div><div><dt>机动金</dt><dd>¥${c.contingency}</dd></div></dl><p>不含住宿、购物、出租车及往返城市交通；机动金已计入总预算。票价与花费需按出行日期核实。</p></details>`;}
function itineraryPanel(id,isFinal=false,archived=false,selectedDay=1){
  const r=state.room;if(!r)return;isFinal=!archived&&(isFinal||r.final?.proposal.id===id);const p=isFinal?r.final?.proposal:proposal(id);if(!p)return;
  const day=p.days.some(d=>d.day===selectedDay)?selectedDay:p.days[0].day;
  state.itinerary={roomId:r.id,id:p.id,isFinal,archived,day};
  const status=r.closed?(archived?'旅行已关闭。这是之前保存的方案，不代表本次定稿。':isFinal?(r.final.acceptanceVerified===false?'旅行已关闭。这份历史定稿保留原记录，部分成员没有明确接受。':`旅行已关闭。这份行程已由 ${r.final.memberIds.length} 位旅伴接受并定稿，仍可查看和复制。`):r.final?'旅行已关闭。这份未被定稿，最终行程采用另一份方案。':p.inputRevision!==r.inputRevision?'旅行已关闭。关闭前的想法已变化，这份旧方案尚未定稿。':'旅行已关闭，这份方案尚未定稿，仅供查看。'):archived?'这是之前保存的方案，旧确认不适用于当前行程。':isFinal?(r.final.acceptanceVerified===false?'历史确认待复核：部分反馈未明确接受，请发起人重新开启讨论。':`这份行程已由 ${r.final.memberIds.length} 位旅伴接受并定稿。`):r.final?'这份未被定稿，当前行程采用另一份方案。':p.inputRevision!==r.inputRevision?'大家的想法已变化，这是旧方案，请返回方案比较查看最新安排。':'方案待共同确认，尚未定稿。';
  let html=`${p.estimationVersion!==2?'<p class="inline-message">这是按旧交通与预算规则保存的行程。原记录保留，请重新讨论并生成后再用于出行。</p>':''}<div class="itinerary-toolbar"><div class="itinerary-overview"><span>${esc(dateLabel(r.startDate,p.days.length))} · ${p.days.length} 天</span>${isFinal?`<button class="secondary" data-action="copy-plan" data-id="${esc(p.id)}" title="复制全部 ${p.days.length} 天的完整行程">复制行程</button>`:''}</div>${p.days.length>1?`<div class="itinerary-tabs" role="tablist" aria-label="选择行程日期">${p.days.map(d=>{const date=itineraryDate(r.startDate,d.day);return `<button type="button" role="tab" id="itinerary-tab-${d.day}" data-action="itinerary-day" data-id="${d.day}" aria-controls="itinerary-day-${d.day}" aria-selected="${d.day===day}" tabindex="${d.day===day?0:-1}"><span>第 ${d.day} 天</span><small>${date.short}</small></button>`;}).join('')}</div>`:''}</div><p class="itinerary-status" role="status">${esc(status)}</p><p class="itinerary-description">${esc(p.subtitle||p.title)}</p>`;
  html+=p.days.map(d=>{const date=itineraryDate(r.startDate,d.day);return `<section class="itinerary-day" id="itinerary-day-${d.day}" ${p.days.length>1?`role="tabpanel" aria-labelledby="itinerary-tab-${d.day}"`:`aria-labelledby="itinerary-date-${d.day}"`} ${d.day===day?'':'hidden'}><h3 class="day-title" id="itinerary-date-${d.day}"><time datetime="${date.iso}">${date.full}</time><small>步行约 ${d.walk} km</small></h3>${d.originAssumption?`<p class="tiny day-origin">按${esc(d.originAssumption)}出发和返回 · 交通共预留 ${d.transitMinutes} 分钟。未绑定实际住处，请出发前核实。</p>`:''}${budgetDetails(d)}${[...d.stops.map((x,i)=>({...x,kind:'place',number:i+1})),...(d.breaks||[]).map(x=>({...x,restKind:x.kind,kind:'rest'}))].sort((a,b)=>(a.startMinute??0)-(b.startMinute??0)).map(stop=>{if(stop.kind==='rest')return `<div class="stop stop-rest"><span class="stop-time">${esc(stop.time)}</span><div class="stop-copy"><strong>${esc(stop.title)}</strong><p>约 ${stop.minutes} 分钟${stop.restKind==='transport'?` · ${esc(stop.transit?.mode||'交通预留')}${Number.isFinite(stop.transit?.distanceKm)?' · 直线约 '+stop.transit.distanceKm+' km':''}${stop.transit?' · 步行 '+stop.transit.walk+' km · 预留 ¥'+stop.transit.cost:''}`:stop.restKind==='entry'?' · 客流高峰可能更久':stop.restKind==='wait'?'':' · 餐饮已计入当地活动预算'}</p></div></div>`;const place=byId(stop.placeId);return `<div class="stop"><span class="stop-time">${esc(stop.time)}</span><div class="stop-copy"><button class="itinerary-place" data-action="place" data-id="${esc(place.id)}"><span class="stop-number" aria-hidden="true">${stop.number}</span><strong>${esc(place.name)} ↗</strong></button><p>游览约 ${stop.minutes} 分钟${stop.includesLunch?'（含 60 分钟午休）':''}${stop.transit?` · 从上一站${esc(stop.transit.mode)}约 ${stop.transit.minutes} 分钟`:''}</p><p>${esc(place.short)}</p></div></div>`;}).join('')}<p class="tiny day-end">${d.endTime?'约 '+esc(d.endTime)+(d.originAssumption?' 返回'+esc(d.originAssumption)+'，之后自由安排。':' 结束安排，剩下的时间自由走走。'):'午间留出约 1 小时用餐休息。'}</p><details class="itinerary-map"><summary>查看当天地点示意</summary>${mapSvg({days:[d]})}</details></section>`;}).join('');
  html+=`${p.visitNotes?.length?`<details class="visit-checklist"><summary>出发前核验 · 门票与预约尚未确认</summary>${p.visitNotes.map(note=>`<p><strong>${esc(byId(note.placeId)?.name)}</strong><br>${esc(note.text)} <a href="${esc(note.source)}" target="_blank" rel="noopener">官方规则 ↗</a></p>`).join('')}</details>`:''}<p class="tiny itinerary-estimate">${esc(p.estimateNote)}</p>${canRespondToPlan(r,p,archived)?itineraryDecision(r,p):''}${!isFinal?(archived?'<button class="secondary full-width" data-action="history">回到旧方案</button>':'<button class="secondary full-width" data-action="plans">返回方案比较</button>'):''}`;
  openPanel(isFinal?'我们的'+currentCity+'行程':p.title,html,isFinal?'final':'itinerary');
}
function restoreItinerary(view){
  if(!view||state.room?.id!==view.roomId)return;
  if(!proposal(view.id)){openPanel('行程已更新','<p class="muted">这份安排已不在当前记录中，请重新查看。</p><button class="secondary full-width" data-action="plans">查看当前方案</button>','itinerary-missing');return;}
  const isFinal=!view.archived&&state.room.final?.proposal.id===view.id;
  itineraryPanel(view.id,isFinal,view.archived||view.isFinal&&!isFinal,view.day);
  if(view.mapOpen)$('.itinerary-day:not([hidden]) .itinerary-map').open=true;
  if(view.focusPlace){const button=$$('.itinerary-day:not([hidden]) [data-action=place]').find(el=>el.dataset.id===view.focusPlace);button?.focus({preventScroll:true});}
  if(Number.isFinite(view.scroll))$('#sheet-content').scrollTop=view.scroll;
}
document.addEventListener('keydown',e=>{const tab=e.target.closest('[data-action=itinerary-day]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-action=itinerary-day]'),i=tabs.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;showItineraryDay(Number(tabs[next].dataset.id),{focus:true});});
function responsesPanel(id){const r=state.room,p=r.proposals.find(p=>p.id===id);state.responseId=id;const current=p&&p.inputRevision===r.inputRevision,label={accept:'可以接受',prefer:'更喜欢这份',change:'需要修改'};
  const html=(r.closed?'<p class="inline-message">旅行已关闭，以下是关闭时保存的反馈，不能再修改。</p>':'')+(current?`<p class="muted">${esc(p.title)} · 第 ${p.version} 版 · ${p.accepted||0}/${r.members.length} 人可以接受</p>${r.members.map(m=>{const stored=r.votes[m.id]?.[id],v=stored?.version===p.version?stored:null;return `<div class="opinion"><div class="person-row"><span class="avatar small" style="background:${esc(m.color)}">${esc(m.nickname.slice(0,1))}</span><div><strong>${esc(m.nickname)}</strong><small>${label[v?.value]||(r.closed?'关闭时未回应':'还没有回应')}</small></div></div>${v?.reason?`<p>${esc(v.reason)}</p>`:''}</div>`;}).join('')}`:`<div class="inline-message">${r.closed?'关闭前的想法已变化，这份旧方案的反馈不再代表最终确认。':'这份反馈属于旧方案，不能用于当前确认。请回到两份方案查看最新安排。'}</div>`);
  openPanel(r.closed?'已保存的反馈':'大家对这份的反馈',html+'<button class="secondary full-width section-gap" data-action="plans">回到两份方案</button>','responses');
}
function voteReasonPanel(id){const p=state.room?.proposals.find(p=>p.id===id);if(!p){plansPanel();toast('方案已更新，请查看当前安排。');return;}openPanel('哪一处需要调整？',`<form id="vote-reason" data-id="${esc(id)}" data-version="${p.version}">${editingNotice}<label class="field"><span>说具体一点，方便大家一起改</span><textarea name="reason" maxlength="300" required placeholder="比如第二天下午想少走一点，或一定要保留坐船。">${esc(state.room.votes[state.room.me]?.[id]?.reason||'')}</textarea></label><p class="error-text" id="panel-error" role="alert"></p><button class="primary full" type="submit">告诉大家</button></form>`,'vote-reason');refreshEditingPanel();}
function generationState(r){
  const active=activeGeneration(r),waiting=r.closed?'这次旅行已经关闭。':r.final?'这份行程已经定稿，需先开启新一轮讨论。':active?(active.inputRevision!==r.inputRevision?'大家的想法已变化，这次整理结束后需要重新生成。':'正在整理两份安排，可以关闭面板，先看看大家的想法。'):r.hostId!==r.me?`当前发起人是${r.members.find(m=>m.id===r.hostId)?.nickname||'其他旅伴'}，由发起人整理方案。`:r.summary.missing.length?`还在等${r.summary.missing.map(m=>m.nickname).join('、')}写下想法。`:'';
  return {active,waiting};
}
function refreshGenerationPanel(){
  if(state.panel!=='generate'||!state.room)return;
  const r=state.room,form=$('#generate-form');if(!form)return;
  const {active,waiting}=generationState(r),blocked=Boolean(waiting||r.summary.conflicts.length||isBusy()),ready=!active&&r.planVersion>Number(form.dataset.version)&&r.proposals.every(p=>p.inputRevision===r.inputRevision);
  $('#generation-summary').textContent=`${r.summary.submitted}/${r.members.length} 位旅伴已经写好想法。${state.ai?'AI 会参考大家的偏好与限制，给出两份有不同取舍的方案。':'当前可使用基础排程，按地点、预算和步行上限安排；这不是 AI 生成。'}`;
  const origin=r.city==='上海'?'人民广场周边':'湖滨市区';
  const context=`<p class="inline-message">本轮按${origin}的住处出发，计入首末接驳，最晚 18:00 返回。费用包含门票、餐饮、公共交通和机动金；实际住处不同、节假日拥挤或需要打车时，请另核交通与预算。</p>`+(waiting?`<p class="inline-message" role="status" ${active?'aria-busy="true"':''}>${esc(waiting)}</p>`:'')+r.summary.conflicts.map(c=>`<div class="inline-message"><strong>${esc(c.title)}</strong><p>${esc(c.detail)}</p><button class="small-button" data-action="opinions">看看这处分歧</button></div>`).join('')+(ready?'<p class="inline-message" role="status">两份安排已准备好。</p><button class="primary full" data-action="plans">查看两种安排 →</button>':'');
  if($('#generation-context').innerHTML!==context)$('#generation-context').innerHTML=context;
  $('#generation-note').textContent=active?'本次只使用开始整理时的内容，之后的修改需要再次生成。':state.generateRevise?'新方案生成后，旧确认会清空，大家需要重新接受。':'AI 不会替任何人同意。两份方案都可以继续修改。';
  for(const button of form.querySelectorAll('[type=submit]'))button.disabled=blocked;
  const submit=form.querySelector('[type=submit]:not([data-mode])');submit.classList.toggle('primary',!ready);submit.classList.toggle('secondary',ready);submit.textContent=active?'正在整理…':ready?'按补充内容再整理':state.ai?'整理两份方案':'生成基础方案';
  const basic=form.querySelector('[data-mode=basic]');if(basic){basic.hidden=Boolean(active);$('#basic-explanation').hidden=Boolean(active);}
  const failure=generationErrors.get(r.id);if(failure&&r.planVersion>failure.planVersion)generationErrors.delete(r.id);
  if(generationErrors.has(r.id)&&!active)$('#panel-error').textContent=generationErrors.get(r.id).message;
  else if(active||failure)$('#panel-error').textContent='';
}
function generatePanel(revise=false){const r=state.room;if(!r)return;state.generateRevise=revise;
  openPanel(revise?'这一轮，想调整哪里？':'把想法整理成两种安排',`<p class="muted" id="generation-summary"></p><div id="generation-context"></div><form id="generate-form" data-version="${r.planVersion}"><label class="field"><span>${revise?'这次重点改什么':'还有要一起考虑的吗？'}</span><textarea name="feedback" maxlength="1000" placeholder="选填，比如保留大家认可的${isShanghai?'外滩':'西湖'}散步，第二天轻松一点。"></textarea></label><p class="tiny" id="generation-note"></p><p class="error-text" id="panel-error" role="alert"></p><button class="primary full full-width" type="submit">${state.ai?'整理两份方案':'生成基础方案'}</button>${state.ai?'<button class="text-button full-width" type="submit" data-mode="basic">先用基础排程</button><p class="tiny" id="basic-explanation">基础排程按已确认的地点和限制安排，不理解自由文字。</p>':''}</form>`,'generate');refreshGenerationPanel();
}
async function myTrips(){
  const retryFocused=state.panel==='mytrips'&&$('#sheet-content').contains(document.activeElement);
  openPanel('我的旅行','<p class="empty" role="status" aria-busy="true">正在找回你的旅行…</p>','mytrips');
  if(retryFocused)$('#close-sheet').focus({preventScroll:true});
  const epoch=state.panelEpoch,seq=state.route,current=()=>state.panel==='mytrips'&&state.panelEpoch===epoch&&state.route===seq;
  try{
    const {rooms}=await api('/rooms');if(!current())return;
    if(!Array.isArray(rooms))throw new Error('旅行列表没有加载完整，请重试。');
    $('#sheet-content').innerHTML=(rooms.length?rooms.map(r=>`<button class="room-list" data-action="open-room" data-id="${esc(r.id)}"><span class="place-icon">↗</span><span><strong>${esc(r.title)}</strong><small>${esc(dateLabel(r.startDate,r.days))} · ${esc(r.city||'杭州')} · ${r.members} 人 · ${{closed:'已关闭',final:'已定稿',confirm:'待确认',ideas:'收集想法'}[r.status]}</small></span><span class="chevron">→</span></button>`).join(''):'<p class="empty">还没有旅行。<br>发起一趟，或者加入朋友的邀请。</p>')+'<button class="primary full section-gap" data-action="create">发起新旅行</button>'+(!rooms.length?'<button class="text-button full-width section-gap" data-action="join">加入朋友的旅行</button>':'');
  }catch(error){
    if(!current())return;
    $('#sheet-content').innerHTML=`<p class="error-text" role="alert">${esc(error.message)}</p><button class="primary full section-gap" data-action="mytrips">重新加载旅行</button>`;
  }
}
function settingsPanel(){const r=state.room;openPanel('这趟旅行',`<p class="muted">${esc(r.title)} · ${r.members.length} 位旅伴</p>${r.closed?'<p class="inline-message">旅行已关闭，成员仍可查看已保存的内容。</p>':''}${r.members.map(m=>`<div class="member-list-item"><span class="avatar small" style="background:${esc(m.color)}">${esc(m.nickname.slice(0,1))}</span>${esc(m.nickname)}<small>${m.id===r.hostId?'发起人':''}</small>${r.hostId===r.me&&m.id!==r.me&&!r.closed?`<button class="small-button" data-action="transfer" data-id="${m.id}">转交管理</button>`:''}</div>`).join('')}<hr class="divider">${r.hostId===r.me&&!r.closed?`${r.final?'<button class="secondary full-width" data-action="reopen">开启新一轮讨论</button>':'<button class="secondary full-width" data-action="rotate-invite">撤销旧邀请，生成新邀请</button>'}<button class="text-button danger-button full-width section-gap" data-action="close-trip">关闭这次旅行</button>`:!r.closed&&!r.final?'<button class="text-button danger-button full-width" data-action="leave">退出这次旅行</button>':''}<button class="text-button full-width" data-action="history">之前的方案</button><button class="text-button full-width" data-action="about">数据说明</button>`,'settings');}
function confirmPanel(title,description,action,id=''){openPanel(title,`<p class="muted">${esc(description)}</p><p class="error-text" id="panel-error" role="alert"></p><div class="form-actions"><button class="secondary" data-action="cancel">先不改</button><button class="primary" data-action="${action}" data-id="${esc(id)}">确认</button></div>`,'confirm');}
function historyPanel(){const r=state.room;openPanel('之前的方案',r.history.length?r.history.slice().reverse().map(h=>`<div class="opinion"><strong>${h.proposal?'曾经定稿':'讨论中的旧方案'}</strong>${(h.proposals||[h.proposal]).map(p=>`<button class="room-list" data-action="history-plan" data-id="${p.id}"><span><strong>${esc(p.title)}</strong><small>第 ${p.version} 版 · 查看完整安排</small></span><span class="chevron">→</span></button>`).join('')}<p class="tiny">${esc(new Date(h.savedAt||h.confirmedAt).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}))} 保存 · ${r.closed?'历史记录仅供查看':'旧版确认不适用于当前方案'}</p></div>`).join(''):`<p class="empty">${r.closed?'这次旅行没有保存过其他版本。':'还没有旧版本。修改方案时，会把之前的安排留在这里。'}</p>`,'history');}
async function mutation(action,input={}){
  const roomId=state.room.id,seq=state.route,epoch=state.panelEpoch,planVersion=state.room.planVersion;
  if(pendingMutations.has(roomId))throw new Error('上一次修改仍在提交，请等完成后再试。');
  // Long generation is revision-checked by the server and must not stop edits.
  const generating=action==='generate';if(generating&&activeGeneration(state.room))throw new Error('这次旅行正在整理方案，请稍候。');
  const owner={route:seq,panel:epoch};if(!generating)pendingMutations.set(roomId,owner);
  else{generationErrors.delete(roomId);if(state.panel==='generate')$('#generate-form').dataset.version=state.room.planVersion;localGenerations.set(roomId,{startedAt:Date.now(),inputRevision:state.room.inputRevision});render();refreshGenerationPanel();}
  let generationRejected=false;
  try{
  const changed=()=>{const e=new Error('');e.code='VIEW_CHANGED';return e;};
  let result;
  try{result=await api(`/rooms/${roomId}/${action}`,input);}
  catch(error){
    if(generating){
      if(error.code==='GENERATING'){generationRejected=true;await syncRoom(roomId,seq,{allowBusy:true});}
      else{generationErrors.set(roomId,{message:error.message,planVersion});if(state.room?.id===roomId)state.room.generation=null;}
    }
    if(seq!==state.route||state.room?.id!==roomId||epoch!==state.panelEpoch)throw changed();
    if(['CLOSED','FINAL_LOCKED','STALE_PLAN','NO_PLAN','HOST_ONLY','INPUT_CHANGED'].includes(error.code))await syncRoom(roomId,seq,{allowBusy:true});
    if(seq!==state.route||state.room?.id!==roomId||epoch!==state.panelEpoch)throw changed();
    throw error;
  }
  if(seq!==state.route||state.room?.id!==roomId)throw changed();
  if(result.room&&result.room.revision>=state.room.revision){state.room=result.room;render();}
  if(epoch!==state.panelEpoch)throw changed();return result;
  }finally{if(pendingMutations.get(roomId)===owner)pendingMutations.delete(roomId);if(generating){localGenerations.delete(roomId);if(state.room?.id===roomId){if(!generationRejected)state.room.generation=null;render();refreshGenerationPanel();}}refreshEditingPanel();}
}
async function copy(text,returnAction='invite'){
  const epoch=state.panelEpoch,roomId=state.room?.id;
  try{await navigator.clipboard.writeText(text);toast('已复制，可以发给旅伴。');}
  catch{if(epoch!==state.panelEpoch||roomId!==state.room?.id)return;
    openPanel('手动复制',`<p class="muted">浏览器未允许自动复制。已选中文字，请按 Ctrl+C（Mac 使用 ⌘C）复制。</p><label class="field"><span>${returnAction==='final'?'完整行程':'邀请链接'}</span><textarea id="manual-copy" readonly rows="7">${esc(text)}</textarea></label><button class="secondary full-width" data-action="${returnAction}">${returnAction==='final'?'返回行程':'返回邀请'} →</button>`,'copy');
    $('#manual-copy').focus();$('#manual-copy').select();
  }
}
async function handleAction(button){const action=button.dataset.action,id=button.dataset.id;
  if(action==='return-ideas')return returnToIdeas();
  if(action==='adjust-budget'){const section=$('#preference-limits');if(section){section.open=true;section.scrollIntoView({block:'start'});section.querySelector('[name=budget]').focus({preventScroll:true});}return;}
  if(action==='add-place')return addPlaceToIdeas(id);
  if(action==='create-from-place')return createPanel(id);
  if(action==='retry-draft')return saveDraft();
  if(action==='retry-invite')return invitePreview(id,button.dataset.token);
  if(action==='itinerary-day')return showItineraryDay(Number(id));
  if(action==='return-itinerary')return restoreItinerary(state.placeReturn);
  if(action==='adjust-limits'){ideasPanel();const limits=$('#preference-restrictions');if(limits){limits.open=true;limits.scrollIntoView({block:'start'});limits.querySelector('summary').focus({preventScroll:true});}return;}
  if(action==='retry')return start();if(action==='retry-room'){closePanel();return route();}
  if(action==='history-plan')return itineraryPanel(id,false,true);
  const direct={enter:()=>{location.hash='#travel';},create:()=>createPanel(),catalog:catalogPanel,join:joinPanel,about:aboutPanel,mytrips:myTrips,ideas:()=>ideasPanel(),opinions:()=>opinionsPanel(),member:()=>opinionsPanel(id),place:()=>placePanel(id,['final','itinerary'].includes(state.panel)?{...state.itinerary,scroll:$('#sheet-content').scrollTop,focusPlace:id,mapOpen:$('.itinerary-day:not([hidden]) .itinerary-map')?.open}:null),invite:invitePanel,plans:plansPanel,plan:()=>itineraryPanel(id),responses:()=>responsesPanel(id),final:()=>itineraryPanel(null,true),generate:()=>generatePanel(),revise:()=>generatePanel(true),history:historyPanel,cancel:closePanel,'open-room':()=>{closePanel();location.hash='#trip/'+id;}};
  if(direct[action])return direct[action]();
  if(isBusy())return;
  if(action==='copy-invite'||action==='share-invite'){const r=state.room,url=cityURL(r.city,'#join/'+r.id+'/'+r.inviteToken);if(action==='share-invite'&&navigator.share){try{await navigator.share({title:r.title,text:'一起商量'+currentCity+'怎么玩',url});}catch(e){if(e.name!=='AbortError')await copy(url);}}else await copy(url);return;}
  if(action==='copy-plan'){
    const roomId=state.room?.id,epoch=state.panelEpoch;if(!roomId)return;
    button.disabled=true;button.textContent='正在确认…';
    try{
      const {room}=await api('/rooms/'+roomId);
      if(state.room?.id!==roomId||state.panelEpoch!==epoch||state.panel!=='final')return;
      if(room.revision>=state.room.revision){const changed=room.revision!==state.room.revision;state.room=room;if(changed){render();refreshLivePanel();}}
      const final=state.room.final;if(!final?.copyText||final.proposal.id!==id){toast('行程已重新讨论或变更，旧定稿没有复制。');return;}
      await copy(final.copyText,'final');
    }catch{if(state.room?.id===roomId&&state.panelEpoch===epoch)toast('没能确认最新行程，本次未复制。请稍后重试。');}finally{if(button.isConnected){button.disabled=false;button.textContent='复制行程';}}
    return;
  }
  if(action==='extract'){const block=refreshEditingPanel();if(block&&!block.waiting)return;}
  if(action==='vote'&&!canRespondToPlan(state.room,proposal(id))){plansPanel();toast('方案已更新，请看过当前版本后再回应。');return;}
  if(action==='vote'&&button.dataset.value==='change')return voteReasonPanel(id);
  if(action==='finalize')return confirmPanel('就按这份，一起出发？','所有旅伴已明确接受。定稿后，大家看到同一份最终行程。','do-finalize',id);
  if(action==='reopen')return confirmPanel('重新开始讨论？','保留这次定稿，开启新一轮讨论。修改后的方案需要全员重新接受。','do-reopen');
  if(action==='rotate-invite')return confirmPanel('让旧邀请失效？','已加入的旅伴不受影响。新朋友需要使用新的邀请。','do-rotate');
  if(action==='close-trip')return confirmPanel('关闭这次旅行？','停止加入和修改，成员仍可查看已保存的内容。关闭后不能继续协商。','do-close');
  if(action==='leave')return confirmPanel('退出这次旅行？','你将不再能查看房间。成员变化后，其他旅伴需要重新确认方案。','do-leave');
  if(action==='transfer')return confirmPanel('转交发起人权限？','对方将负责邀请、整理方案和定稿。你的成员身份保留。','do-transfer',id);
  const request=beginRequest(),old=button.innerHTML;button.disabled=true;button.innerHTML='<span class="loading-inline"></span> 稍等一下';refreshEditingPanel();
  try{
    if(action==='extract'){
      saveDraft();const data=collectPrefs(),snapshot=JSON.stringify(data),roomId=state.room.id,epoch=state.panelEpoch;
      $('#extract-result')?.remove();const notice=$('#extract-notice');notice.hidden=true;notice.textContent='';
      const {extraction}=await api('/extract',{text:data.text,roomId});
      if(state.room?.id===roomId&&state.panel==='ideas'&&state.panelEpoch===epoch){
        if(JSON.stringify(collectPrefs())!==snapshot){notice.hidden=false;notice.textContent='已保留你刚修改的内容，本次整理结果未应用。可以重新整理。';saveDraft();}
        else{ideasPanel(extraction,data);saveDraft();}
      }
    }
    else if(action==='vote'){const view=state.panel==='itinerary'?{...state.itinerary,scroll:$('#sheet-content').scrollTop}:null;await mutation('vote',{proposalId:id,version:Number(button.dataset.version||proposal(id).version),value:button.dataset.value});if(view)restoreItinerary(view);else plansPanel();toast(button.dataset.value==='accept'?'已接受这份完整方案；全员接受后由发起人定稿。':'已记下偏好；「可以接受」才计入共同确认。');}
    else if(action==='do-finalize'){await mutation('finalize',{proposalId:id});closePanel();toast('这一趟，大家一起决定好了。');}
    else if(action==='do-reopen'){await mutation('reopen');closePanel();toast('新一轮讨论已开启，旧行程已保存。');}
    else if(action==='do-rotate'){await mutation('rotateInvite');invitePanel();}
    else if(action==='do-close'){await mutation('close');closePanel();}
    else if(action==='do-transfer'){await mutation('transfer',{memberId:id});settingsPanel();}
    else if(action==='do-leave'){await mutation('leave');state.room=null;closePanel();location.hash='#travel';}
  }catch(e){if(request.isCurrent())showError(e);}finally{request.finish();if(button.isConnected){button.disabled=false;button.innerHTML=old;}refreshEditingPanel();refreshGenerationPanel();}
}
function setChipSelected(chip,selected){if(!chip)return;chip.classList.toggle('selected',selected);chip.setAttribute('aria-pressed',String(selected));}
document.addEventListener('click',e=>{const chip=e.target.closest('[data-group]');if(chip){setChipSelected(chip,!chip.classList.contains('selected'));const group=chip.dataset.group,id=chip.dataset.value;if(group==='wants'&&chip.classList.contains('selected'))setChipSelected($(`[data-group="avoid"][data-value="${id}"]`),false);if(group==='must'&&chip.classList.contains('selected')){setChipSelected($(`[data-group="avoid"][data-value="${id}"]`),false);setChipSelected($(`[data-group="wants"][data-value="${id}"]`),true);}if(group==='avoid'&&chip.classList.contains('selected')){setChipSelected($(`[data-group="must"][data-value="${id}"]`),false);setChipSelected($(`[data-group="wants"][data-value="${id}"]`),false);}saveDraft();return;}const b=e.target.closest('[data-action]');if(b)handleAction(b).catch(showError);});
document.addEventListener('input',e=>{if(e.target.closest('#ideas-form'))saveDraft();});
document.addEventListener('submit',async e=>{const form=e.target;if(!(form instanceof HTMLFormElement))return;e.preventDefault();if(isBusy())return;if(['ideas-form','vote-reason'].includes(form.id)&&refreshEditingPanel()){$('#editing-notice').scrollIntoView({block:'nearest'});return;}const request=beginRequest(),btn=form.querySelector('[type=submit]'),original=btn?.innerHTML;const data=Object.fromEntries(new FormData(form));if(btn){btn.disabled=true;btn.innerHTML='<span class="loading-inline"></span> 正在整理';}const err=$('#panel-error');if(err)err.textContent='';refreshEditingPanel();
  const requestView=state.route,requestPanel=state.panelEpoch;const ensureFormView=()=>{if(requestView!==state.route||requestPanel!==state.panelEpoch){const error=new Error('');error.code='VIEW_CHANGED';throw error;}};
  try{
    if(form.id==='create-form'){const {room}=await api('/rooms',{...data,city:currentCity});ensureFormView();state.room=room;state.user.nickname=data.nickname;state.pendingInvite=room.id;if(byId(data.selectedPlace))state.pendingPlace={roomId:room.id,id:data.selectedPlace};closePanel();location.hash='#trip/'+room.id;}
    else if(form.id==='join-form'){const match=data.invite.match(/#join\/([a-z0-9-]+)\/([\w-]+)/);if(!match)throw new Error('没有识别到邀请，请复制朋友发来的完整链接。');closePanel();const destination='#join/'+match[1]+'/'+match[2];if(location.hash===destination)route();else location.hash=destination;}
    else if(form.id==='accept-invite'){const {room}=await api(`/rooms/${form.dataset.id}/join`,{token:form.dataset.token,nickname:data.nickname});ensureFormView();state.room=room;closePanel();location.hash='#trip/'+room.id;}
    else if(form.id==='ideas-form'){
      const pref=collectPrefs(),snapshot=JSON.stringify(pref),key=draftKey(),notice=$('#submit-notice');saveDraft();notice.hidden=true;
      await mutation('preferences',pref);
      if(JSON.stringify(collectPrefs())!==snapshot){saveDraft();notice.textContent='上次点击时的内容已提交。之后的修改还没提交，请再次确认。';notice.hidden=false;}
      else{const cleared=drafts.clear(key);closePanel(false);toast(cleared?'你的想法，旅伴都能看到了。':'想法已提交，但本机旧草稿未能清理，下次打开请核对。');}
    }
    else if(form.id==='comment-form'){await mutation('comment',data);opinionsPanel();}
    else if(form.id==='generate-form'){await mutation('generate',{...data,mode:e.submitter?.dataset.mode==='basic'?'basic':state.ai?'ai':'basic'});plansPanel();}
    else if(form.id==='vote-reason'){await mutation('vote',{proposalId:form.dataset.id,version:Number(form.dataset.version),value:'change',reason:data.reason});plansPanel();}
  }catch(error){if(request.isCurrent())showError(error);}finally{request.finish();if(btn?.isConnected){btn.disabled=false;btn.innerHTML=original;}refreshEditingPanel();refreshGenerationPanel();}
});
function refreshLivePanel(){
  if(state.panel==='generate'){refreshGenerationPanel();return;}
  if(['ideas','vote-reason'].includes(state.panel)){refreshEditingPanel();return;}
  if(!['plans','opinions','responses','generate','final','itinerary','settings'].includes(state.panel))return;
  const content=$('#sheet-content'),scroll=content.scrollTop,active=document.activeElement;
  const focus=active&&content.contains(active)?{action:active.dataset.action,id:active.dataset.id,value:active.dataset.value,name:active.name,start:active.selectionStart,end:active.selectionEnd,summary:active.matches('summary')}:null;
  const fields=[...content.querySelectorAll('input[name],textarea[name]')].map(e=>({name:e.name,value:e.value}));
  const mapOpen=$('.itinerary-day:not([hidden]) .itinerary-map')?.open;
  if(['final','itinerary'].includes(state.panel))restoreItinerary({...state.itinerary,scroll});else if(state.panel==='plans')plansPanel();else if(state.panel==='opinions')opinionsPanel(state.memberFilter);else if(state.panel==='responses')responsesPanel(state.responseId);else if(state.panel==='settings')settingsPanel();else generatePanel(state.generateRevise);
  if(mapOpen&&$('.itinerary-day:not([hidden]) .itinerary-map'))$('.itinerary-day:not([hidden]) .itinerary-map').open=true;
  for(const field of fields){const el=[...content.querySelectorAll('[name]')].find(e=>e.name===field.name);if(el)el.value=field.value;}
  if(focus){const el=focus.summary?$('.itinerary-day:not([hidden]) summary'):[...content.querySelectorAll('button,input,textarea')].find(e=>focus.name?e.name===focus.name:e.dataset.action===focus.action&&e.dataset.id===focus.id&&e.dataset.value===focus.value);if(el){el.focus({preventScroll:true});if(typeof focus.start==='number')el.setSelectionRange(focus.start,focus.end);}else if(['final','itinerary'].includes(state.panel))($('.itinerary-tabs [aria-selected=true]')||$('#close-sheet')).focus({preventScroll:true});else $('#close-sheet').focus({preventScroll:true});}
  content.scrollTop=scroll;
}
async function syncRoom(id,seq,{allowBusy=false}={}){
  if(document.hidden||isBusy()&&!allowBusy&&!localGenerations.has(id)||(pendingPoll?.id===id&&pendingPoll?.seq===seq)||!navigator.onLine)return;
  const owner={id,seq};pendingPoll=owner;
  try{const {room}=await api('/rooms/'+id);if(seq!==state.route||state.room?.id!==id)return;if(state.syncFailed){state.syncFailed=false;toast('已重新同步旅伴的想法。');}if(room.revision>state.room.revision||room.revision===state.room.revision&&JSON.stringify(room.generation)!==JSON.stringify(state.room.generation)){state.room=room;render();refreshLivePanel();}}
  catch(e){if(seq!==state.route)return;if(!state.syncFailed){state.syncFailed=true;toast('暂时没能同步旅伴的更新，正在重试。已填内容仍保留。');}}
  finally{if(pendingPoll===owner)pendingPoll=null;}
}
async function route({keepScenery=false}={}){const seq=++state.route,hash=location.hash||'#travel';state.ideasReturn=null;if(!(keepScenery&&state.panel==='scenery'&&['#travel','#portfolio'].includes(hash)))closePanel();clearInterval(state.poll);state.room=null;state.syncFailed=false;$('#more').disabled=false;$('#main').classList.remove('loading-page');state.view='travel';render();
  const trip=hash.match(/^#trip\/([a-z0-9-]+)$/),invite=hash.match(/^#join\/([a-z0-9-]+)\/([\w-]+)$/);
  if(hash==='#about'){state.view='travel';render();aboutPanel();return;}
  if(!state.ready)return start();
  if(invite)return invitePreview(invite[1],invite[2]);
  if(trip){$('#main').classList.add('loading-page');$('#more').disabled=true;$('#heading').innerHTML='<p class="eyebrow">一起去</p><h1>正在打开旅行</h1><p class="subline">找回大家的想法…</p>';$('#action-area').innerHTML='<button class="primary" disabled>稍等一下</button>';try{const {room}=await api('/rooms/'+trip[1]);if(seq!==state.route)return;if(redirectCity(room.city))return;state.room=room;render();if(state.pendingInvite===room.id){state.pendingInvite=null;if(state.pendingPlace?.roomId===room.id){const id=state.pendingPlace.id;state.pendingPlace=null;addPlaceToIdeas(id);}else invitePanel();}state.poll=setInterval(()=>syncRoom(trip[1],seq),4500);}catch(e){if(seq===state.route){render();openPanel('暂时无法打开旅行',`<p class="error-text">${esc(e.message)}</p><button class="primary full" data-action="retry-room">重新打开旅行</button><button class="text-button full-width" data-action="mytrips">查看我的旅行</button>`,'room-error');}}finally{if(seq===state.route){$('#main').classList.remove('loading-page');$('#more').disabled=false;}}}
}
window.addEventListener('hashchange',route);window.addEventListener('offline',()=>toast('网络断开了，可以先写想法；提交需等网络恢复。'));window.addEventListener('online',()=>{if(!state.ready)start();else{toast('网络恢复了，可以继续提交。');if(state.room)syncRoom(state.room.id,state.route);}});window.addEventListener('beforeunload',saveDraft);
async function start(){if(state.connecting)return;state.connecting=true;state.connectionError='';state.view='travel';render();try{const status=await api('/status');const catalog=await api('/catalog?city='+encodeURIComponent(currentCity));if(!status?.user?.id||!Array.isArray(catalog?.places)||!catalog.places.length||!Array.isArray(catalog.tags))throw new Error('旅行资料没有加载完整，请重新连接。');state.user=status.user;state.ai=Boolean(status.ai);state.places=catalog.places;state.tags=catalog.tags;state.ready=true;await route({keepScenery:true});}catch(e){state.ready=false;state.connectionError=e.message;}finally{state.connecting=false;if(!state.ready)render();}}
start();planet.start();
