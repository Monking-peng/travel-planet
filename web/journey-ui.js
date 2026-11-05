/* Shared city navigation. Existing routes remain the source of truth. */
(()=>{
  const nav=document.querySelector('.travel-links,.city-switch');
  if(!nav)return;
  const links=[...nav.querySelectorAll('a')];
  if(links.length<5)return;
  const names=links.map(a=>a.textContent.replace(/旅行|地图|\s|↗/g,''));
  const current=links.findIndex(a=>a.hasAttribute('aria-current'));
  links.forEach((a,i)=>a.textContent=names[i]);
  nav.classList.add('journey-navigation');
  const modal=document.createElement('dialog');modal.id='city-picker';modal.className='city-picker';modal.setAttribute('aria-labelledby','city-picker-title');
  modal.innerHTML='<div class="city-picker-head"><div><p>下一站，想去哪里？</p><h2 id="city-picker-title">城市旅行图鉴</h2></div><button type="button" class="city-picker-close" aria-label="关闭城市选择">×</button></div><nav class="city-grid" aria-label="全部城市"></nav>';
  const grid=modal.querySelector('.city-grid');
  links.forEach((a,i)=>{
    const route=new URL(a.href),slug=route.pathname.split('/').pop().replace('.html','').replace('-trip','')||'hangzhou';
    const tile=a.cloneNode(true);tile.className='city-tile';
    const img=document.createElement('img');img.src='./assets/arrivals/'+(slug==='index'?'hangzhou':slug)+'.webp';img.alt='';img.width=170;img.height=140;img.loading='lazy';
    const label=document.createElement('span');label.textContent=names[i];const arrow=document.createElement('span');arrow.className='city-tile-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    tile.replaceChildren(img,label,arrow);grid.append(tile);
    if(i>3)a.hidden=true;
  });
  const trigger=document.createElement('button');trigger.type='button';trigger.className='city-picker-trigger';trigger.textContent=current>3?names[current]+' · 换城市':'更多城市';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','city-picker');
  trigger.innerHTML+='<span aria-hidden="true">＋</span>';
  nav.append(trigger);document.body.append(modal);
  function close(){modal.close();trigger.focus({preventScroll:true});}
  trigger.onclick=()=>modal.showModal();modal.querySelector('.city-picker-close').onclick=close;
  modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
  // Native dialog handles Escape and restores focus to the opener.
  const heading=document.querySelector('.scene-heading');
  if(heading){const label=document.createElement('span');label.className='scene-guide-label';label.textContent='城市旅行图鉴';heading.prepend(label);}
})();
