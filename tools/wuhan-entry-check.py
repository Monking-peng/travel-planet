from pathlib import Path
import os,subprocess,shutil,threading,queue,re,time,json,datetime
from playwright.sync_api import sync_playwright,expect
r=Path(__file__).resolve().parents[1];out=r/'test-results/wuhan-entry';out.mkdir(parents=True,exist_ok=True)
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
  # Start from the URL users actually open, including its mobile navigation.
  a.goto(base+'wuhan.html',wait_until='networkidle');expect(a.locator('#wuhan')).to_have_attribute('data-state','ready',timeout=45000)
  for width,height in [(1440,960),(768,1024),(390,844),(320,740)]:
   a.set_viewport_size({'width':width,'height':height});shot(a,'map-entry-'+str(width))
   for selector in ['.wuhan-travel-entry .trip-entry','.wuhan-travel-entry [href$="#join"]','.wuhan-travel-entry [href$="#mytrips"]']:
    node=a.locator(selector);box=node.bounding_box();assert box['x']>=0 and box['x']+box['width']<=width and box['height']>=44,selector
  a.set_viewport_size({'width':390,'height':844});a.locator('#night').click();shot(a,'map-entry-night-390');a.locator('#night').click()
  a.locator('.wuhan-travel-entry .trip-entry').click();expect(a.locator('#sheet-title')).to_have_text('武汉景点目录');expect(a.locator('.destination-card')).to_have_count(16)
  a.locator('.destination-card[data-id=wh-crane]').click();a.locator('[data-action=choose-trip-for-place]').click();expect(a.locator('#sheet-content')).to_contain_text('还没有可以添加景点的武汉旅行');shot(a,'no-existing-trip')
  close(a)
  a.goto(base+'wuhan-trip.html#join',wait_until='networkidle');expect(a.locator('#join-form')).to_be_visible();shot(a,'join-shortcut')
  a.goto(base+'wuhan-trip.html#mytrips',wait_until='networkidle');expect(a.locator('#sheet-title')).to_have_text('我的旅行');expect(a.locator('#sheet-content')).to_contain_text('还没有旅行')
  # Setup is isolated and disposable. No real trip or remote service is used.
  def create(city,title):
   response=a.request.post(base+'api/rooms',data={'city':city,'title':title,'nickname':'地图验收','startDate':(datetime.date.today()+datetime.timedelta(days=20)).isoformat(),'days':2})
   assert response.status==201;return response.json()['room']
  wh=create('武汉','已有武汉旅行');sh=create('上海','上海旅行不能混入');closed=create('武汉','已关闭的武汉旅行')
  assert a.request.post(base+'api/rooms/'+closed['id']+'/close',data={}).ok
  a.goto(base+'wuhan-trip.html#trip/'+wh['id'],wait_until='networkidle');a.locator('#action-area [data-action=ideas]').click()
  a.locator('[name=text]').fill('这份未提交的草稿和预算要保留');a.locator('#preference-limits summary').click();a.locator('[name=budget]').fill('650');a.locator('[name=maxWalk]').select_option('8');chip(a,'wants','wh-customs').click();close(a)
  before=a.request.get(base+'api/rooms/'+wh['id']).json()['room'];count=len(a.request.get(base+'api/rooms').json()['rooms'])
  a.goto(base+'wuhan.html',wait_until='networkidle');a.locator('[data-landmark=crane]').click();a.locator('#plan-place').click();expect(a.locator('#sheet-title')).to_have_text('黄鹤楼公园（日场）')
  # A failed list fetch must keep the destination and offer retry.
  a.route('**/api/rooms',lambda route:route.abort());a.locator('[data-action=choose-trip-for-place]').click();expect(a.locator('[role=alert]')).to_contain_text('网络暂时断开');a.unroute('**/api/rooms')
  a.locator('[data-action=choose-trip-for-place]').click();expect(a.locator('[data-action=select-trip-for-place]')).to_have_count(1);expect(a.locator('[data-action=select-trip-for-place]')).to_contain_text('已有武汉旅行');shot(a,'choose-existing-trip')
  a.locator('[data-action=select-trip-for-place]').click();expect(a.locator('#ideas-form')).to_be_visible()
  expect(a.locator('[name=text]')).to_have_value('这份未提交的草稿和预算要保留');expect(a.locator('[name=budget]')).to_have_value('650');expect(chip(a,'wants','wh-crane')).to_have_attribute('aria-pressed','true');expect(chip(a,'wants','wh-customs')).to_have_attribute('aria-pressed','true');shot(a,'selected-into-existing-draft')
  after=a.request.get(base+'api/rooms/'+wh['id']).json()['room'];assert before['revision']==after['revision'];assert len(a.request.get(base+'api/rooms').json()['rooms'])==count
  a.locator('#ideas-form [type=submit]').click();expect(a.locator('#sheet')).not_to_be_visible();after=a.request.get(base+'api/rooms/'+wh['id']).json()['room'];assert set(after['members'][0]['preferences']['wants'])=={'wh-crane','wh-customs'}
  # The host can close a room while the picker is open. Re-fetch before editing.
  a.goto(base+'wuhan-trip.html#place/wh-eastlake',wait_until='networkidle');a.locator('[data-action=choose-trip-for-place]').click();expect(a.locator('[data-action=select-trip-for-place]')).to_have_count(1)
  assert a.request.post(base+'api/rooms/'+wh['id']+'/close',data={}).ok
  a.locator('[data-action=select-trip-for-place]').click();expect(a.locator('#heading')).to_contain_text('旅行已关闭');expect(a.locator('#ideas-form')).to_have_count(0);expect(a.locator('#notice')).to_contain_text('当前旅行不能修改')
  # No WebGL must not prevent access to the catalog or invitation forms.
  b.route('**/planet-wuhan.js*',lambda route:route.abort());b.goto(base+'wuhan-trip.html#catalog',wait_until='networkidle');expect(b.locator('.destination-card')).to_have_count(16);close(b)
  b.goto(base+'wuhan-trip.html#join',wait_until='networkidle');expect(b.locator('#join-form')).to_be_visible()
  report['checks']+=['Visible Wuhan map actions at 1440/768/390/320, no overflow and 44px touch targets','Catalog, join and my-trips deep links open the right panel','An external map choice enters only an open same-city trip; original draft and private budget survive','List failure retries without losing the destination; choosing a trip creates no room and writes no preferences until explicit submission','A room closed during selection is re-read and remains read only','Catalog and invitation forms remain usable when the 3D module fails']
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

