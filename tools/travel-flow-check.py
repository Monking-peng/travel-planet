from pathlib import Path
import os,subprocess,shutil,threading,queue,re,time,json,datetime
from playwright.sync_api import sync_playwright,expect
r=Path(__file__).resolve().parents[1];out=r/'test-results/travel-flow';out.mkdir(parents=True,exist_ok=True)
report={'startedAt':datetime.datetime.now().astimezone().isoformat(),'checks':[],'errors':[],'environment':'isolated in-memory service','realPaidModelCalled':False,'complete':False};server=None
try:
 env={**os.environ,'PORT':'0','HOST':'127.0.0.1','TRAVEL_DB':':memory:','TRAVEL_AI_KEY':'','TRAVEL_AI_BASE_URL':'','TRAVEL_AI_MODEL':'','COOKIE_SECURE':'false','COOKIE_PATH':'/','TRUST_PROXY':'false'}
 server=subprocess.Popen([shutil.which('node'),'server/index.cjs'],cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
 q=queue.Queue();threading.Thread(target=lambda:[q.put(x) for x in server.stdout],daemon=True).start();deadline=time.monotonic()+15;base=None
 while time.monotonic()<deadline:
  line=q.get(timeout=max(.1,deadline-time.monotonic()));m=re.search(r'http://127\.0\.0\.1:(\d+)',line)
  if m:base=m.group(0)+'/';break
 assert base
 with sync_playwright() as p:
  browser=p.chromium.launch(channel=os.environ.get('BROWSER_CHANNEL','msedge'),headless=True,args=['--mute-audio']);ca=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');cb=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');a,b=ca.new_page(),cb.new_page()
  for page in [a,b]:page.on('pageerror',lambda e:report['errors'].append(str(e)))
  def shot(page,name):
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
   if page.locator('#sheet').is_visible():assert page.locator('#sheet-content').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),name
   page.screenshot(path=str(out/(name+'.png')))
  def close(page):page.locator('#close-sheet').click()
  def chip(page,group,id):return page.locator(f'[data-group="{group}"][data-value="{id}"]')
  a.goto(base+'shanghai-trip.html',wait_until='networkidle');expect(a.locator('#planet-stage')).to_have_attribute('data-state','ready',timeout=45000)
  a.locator('[data-action=catalog]').click();expect(a.locator('.destination-card')).to_have_count(17);shot(a,'catalog')
  a.locator('.destination-card[data-id=sh-disney]').click();expect(a.locator('#sheet-title')).to_have_text('上海迪士尼乐园');shot(a,'disney-detail')
  a.locator('[data-action=create-from-place]').click();a.locator('[name=nickname]').fill('验收甲');a.locator('[name=title]').fill('功能验收 · 上海两日');a.locator('[name=startDate]').fill((datetime.date.today()+datetime.timedelta(days=20-datetime.date.today().weekday())).isoformat());a.locator('#create-form [type=submit]').click()
  expect(a.locator('#ideas-form')).to_be_visible(timeout=15000);expect(chip(a,'wants','sh-disney')).to_have_attribute('aria-pressed','true')
  room_id=a.url.split('#trip/')[1];report['roomId']=room_id
  expect(a.locator('#preference-warnings')).to_be_visible();expect(a.locator('#preference-warnings')).to_contain_text('1130');expect(a.locator('#preference-warnings')).to_contain_text('9.6 km')
  a.locator('#preference-warnings').scroll_into_view_if_needed();shot(a,'selection-limit-warning')
  a.locator('[name=text]').fill('保留我的原话，不自动改预算。')
  a.locator('[data-action=adjust-budget]').click();expect(a.locator('#preference-limits')).to_have_attribute('open','')
  expect(a.locator('[name=budget]')).to_have_value('500');a.locator('[name=budget]').fill('1400');a.locator('[name=maxWalk]').select_option('12');a.locator('[name=startHour]').select_option('8');expect(a.locator('#preference-warnings')).not_to_be_visible()
  a.locator('#preference-restrictions summary').click();chip(a,'must','sh-disney').click();chip(a,'wants','sh-bund').click()
  a.locator('#ideas-form [data-action=catalog]').click();expect(a.locator('[data-action=return-ideas]')).to_be_visible()
  a.locator('.destination-card[data-id=sh-pearl]').click();a.locator('[data-action=return-ideas]').click()
  expect(a.locator('[name=text]')).to_have_value('保留我的原话，不自动改预算。');expect(a.locator('[name=budget]')).to_have_value('1400');expect(chip(a,'must','sh-disney')).to_have_attribute('aria-pressed','true')
  shot(a,'returned-draft');a.locator('#ideas-form [type=submit]').click();expect(a.locator('#sheet')).not_to_be_visible(timeout=15000)
  expect(a.locator('#action-area > [data-action=invite]')).to_have_text('邀请朋友，一起商量 →');expect(a.locator('#action-area [data-action=generate]')).to_have_text('先自己出方案')
  shot(a,'invite-next-step');a.locator('#action-area > [data-action=invite]').click();invite=a.locator('.invite-link').inner_text()
  a.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}})")
  a.locator('[data-action=copy-invite]').click();expect(a.locator('#manual-copy')).to_have_value(invite)
  assert a.locator('#manual-copy').evaluate('(e)=>e.selectionEnd-e.selectionStart')==len(invite)
  shot(a,'manual-invite-copy');a.locator('#sheet [data-action=invite]').click();a.locator('#sheet [data-action=cancel]').click();expect(a.locator('#sheet')).not_to_be_visible()
  report['checks'].append('Selection warnings, private budget unchanged until edited, catalog/detail return with draft intact, invitation next step and clipboard fallback')
  b.goto(invite,wait_until='networkidle');b.locator('[name=nickname]').fill('验收乙');b.locator('#accept-invite [type=submit]').click();expect(b.locator('#sheet')).not_to_be_visible(timeout=15000)
  b.locator('#action-area [data-action=ideas]').click();b.locator('[name=text]').fill('想去外滩，接受迪士尼单独一天。');chip(b,'wants','sh-bund').click();b.locator('#preference-limits summary').click();b.locator('[name=budget]').fill('1500');b.locator('[name=maxWalk]').select_option('12');b.locator('[name=startHour]').select_option('8')
  cb.set_offline(True);b.locator('#ideas-form [type=submit]').click();expect(b.locator('#panel-error')).not_to_be_empty(timeout=15000);expect(b.locator('[name=text]')).to_have_value('想去外滩，接受迪士尼单独一天。');cb.set_offline(False);b.locator('#ideas-form [type=submit]').click();expect(b.locator('#sheet')).not_to_be_visible(timeout=15000)
  a.locator('#action-area [data-action=generate]').click(timeout=20000);a.locator('#generate-form [type=submit]').click();expect(a.locator('.plan-card')).to_have_count(2,timeout=30000)
  view=a.request.get(base+'api/rooms/'+room_id).json()['room'];assert all('sh-disney' in item['included'] for item in view['proposals']);assert 'budget' not in next(m for m in view['members'] if m['id']!=view['me'])['preferences']
  a.locator('.plan-card').first.locator('[data-action=plan]').click();a.locator('[data-action=itinerary-day][data-id="2"]').click();a.locator('.itinerary-decision').scroll_into_view_if_needed();shot(a,'read-and-respond')
  report['generatedPlans']=view['proposals']
  for day in [1,2]:
   a.locator(f'[data-action=itinerary-day][data-id="{day}"]').click();expect(a.locator('.itinerary-day:visible .day-origin')).to_contain_text('人民广场')
   a.locator('.itinerary-day:visible .day-budget summary').click();expect(a.locator('.itinerary-day:visible .day-budget')).to_contain_text('机动金');a.locator('.itinerary-day:visible .day-budget').scroll_into_view_if_needed();shot(a,f'day-{day}-costs-and-travel')
   assert a.locator('#sheet-content').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
  a.locator('[data-action=itinerary-day][data-id="2"]').click()
  report['checks'].append('Both daily itineraries show city-center origin, full access and transfer time, per-person ticket/meal/transit/contingency costs; no horizontal overflow')
  a.locator('.itinerary-decision [data-value=prefer]').click();expect(a.locator('.itinerary-decision [data-value=prefer]')).to_have_attribute('aria-pressed','true');expect(a.locator('#sheet [data-action=finalize]')).to_have_count(0)
  expect(a.locator('[data-action=itinerary-day][data-id="2"]')).to_have_attribute('aria-selected','true')
  b.locator('#action-area [data-action=plans]').click(timeout=15000);b.locator('.plan-card').first.locator('[data-action=plan]').click();b.locator('.itinerary-decision [data-value=change]').click();b.locator('[name=reason]').fill('请保留外滩，出门别再提前。');b.locator('#vote-reason [type=submit]').click();expect(b.locator('.plan-card').first.locator('[data-value=change]')).to_have_attribute('aria-pressed','true')
  close(b);b.locator('#action-area [data-action=ideas]').click();b.locator('[name=text]').fill('更新：迪士尼之外想去外滩。');b.locator('#ideas-form [type=submit]').click();expect(b.locator('#sheet')).not_to_be_visible()
  expect(a.locator('.itinerary-decision')).to_have_count(0,timeout=15000);expect(a.locator('.itinerary-status')).to_contain_text('旧方案');shot(a,'stale-plan-no-response')
  a.locator('#sheet [data-action=plans]').click();a.locator('[data-action=revise]').click();a.locator('#generate-form [type=submit]').click();expect(a.locator('.plan-card')).to_have_count(2,timeout=30000)
  a.locator('.plan-card').first.locator('[data-action=plan]').click();a.locator('.itinerary-decision [data-value=accept]').click();expect(a.locator('.decision-progress')).to_contain_text('1/2');expect(a.locator('#sheet [data-action=finalize]')).to_have_count(0)
  b.locator('#action-area [data-action=plans]').click(timeout=15000);b.locator('.plan-card').first.locator('[data-action=plan]').click();b.locator('.itinerary-decision [data-value=accept]').click()
  expect(a.locator('#sheet [data-action=finalize]')).to_be_enabled(timeout=15000);expect(a.locator('.decision-progress')).to_contain_text('2/2')
  a.set_viewport_size({'width':320,'height':740});a.locator('.itinerary-decision').scroll_into_view_if_needed();shot(a,'desktop-1000-ready-to-confirm')
  assert a.locator('#sheet').evaluate('(e)=>e.getBoundingClientRect().right<=innerWidth && e.getBoundingClientRect().bottom<=innerHeight')
  a.locator('#sheet [data-action=finalize]').click();a.locator('[data-action=do-finalize]').click();a.locator('#action-area [data-action=final]').click();expect(a.locator('.itinerary-decision')).to_have_count(0)
  a.set_viewport_size({'width':390,'height':844});shot(a,'final-agreed-itinerary')
  a.locator('[data-action=copy-plan]').click();expect(a.locator('#manual-copy')).to_contain_text('迪士尼');expect(a.locator('#manual-copy')).to_contain_text('第 2 天');expect(a.locator('#manual-copy')).to_contain_text('机动金');expect(a.locator('#manual-copy')).to_contain_text('返回人民广场');shot(a,'manual-final-copy');a.locator('#sheet [data-action=final]').click();expect(a.locator('#sheet')).to_have_attribute('data-panel','final')
  close(a);a.locator('#more').click();a.locator('[data-action=history]').click();a.locator('[data-action=history-plan]').first.click();expect(a.locator('.itinerary-decision')).to_have_count(0)
  report['checks']+=['Second independent user joins via invitation; offline submission retains input and retries successfully','Generation includes mandatory Disney; individual budgets stay private','Daily view permits preference, change with reason, acceptance; preference is not consent','Guest edits invalidate the open plan; response controls disappear; regenerating requires fresh consent','Only two explicit acceptances enable host finalization; history and final are read only','Complete final itinerary can be manually copied and returned to; 320px mobile layout stays within viewport']
  ca.close();cb.close();browser.close()
 report['complete']=True;assert not report['errors']
except Exception as e:
 report['failure']=str(e)
 try:shot(a,'failure')
 except Exception:pass
 raise
finally:
 if server:server.terminate();server.wait(timeout=10)
 report['finishedAt']=datetime.datetime.now().astimezone().isoformat();(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k not in ['generatedPlans','roomId']},ensure_ascii=True))

