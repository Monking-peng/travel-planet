from pathlib import Path
import os,subprocess,shutil,threading,queue,re,json,datetime
from playwright.sync_api import sync_playwright,expect
r=Path(__file__).resolve().parents[1];out=r/'test-results/mobile';out.mkdir(parents=True,exist_ok=True)
report={'at':datetime.datetime.now().astimezone().isoformat(),'checks':[],'errors':[],'writes':[],'inspected':False}
env={**os.environ,'PORT':'0','HOST':'127.0.0.1','TRAVEL_DB':':memory:','TRAVEL_AI_KEY':'','TRAVEL_AI_BASE_URL':'','TRAVEL_AI_MODEL':'','COOKIE_SECURE':'false','COOKIE_PATH':'/','TRUST_PROXY':'false'}
s=subprocess.Popen([shutil.which('node'),'server/index.cjs'],cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
 q=queue.Queue();threading.Thread(target=lambda:[q.put(x) for x in s.stdout],daemon=True).start()
 while True:
  m=re.search(r'http://127\.0\.0\.1:(\d+)',q.get(timeout=20))
  if m:base=m.group(0)+'/';break
 with sync_playwright() as p:
  b=p.chromium.launch(channel=os.environ.get('BROWSER_CHANNEL','msedge'),headless=True,args=['--mute-audio'])
  for route,sel,canvasId in [('wuhan-trip.html','#planet-stage','#planet'),('wuhan.html','#wuhan','#wuhan'),('shanghai.html','#shanghai','#shanghai'),('shanghai-trip.html','#planet-stage','#planet'),('','#planet-stage','#planet')]:
   c=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,reduced_motion='reduce');page=c.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)));page.on('request',lambda q:report['writes'].append(q.url) if q.method not in ['GET','HEAD','OPTIONS'] else None)
   page.goto(base+route,wait_until='networkidle');expect(page.locator(sel)).to_have_attribute('data-state','ready',timeout=90000)
   name=route.replace('.html','') or 'hangzhou';canvas=page.locator(canvasId)
   def shot(label):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name+label
    page.screenshot(path=str(out/(name+'-'+label+'.png')),full_page=True)
   shot('390-day')
   page.locator('#night' if route in ['wuhan.html','shanghai.html'] else '#night-planet').click();expect(canvas).to_have_attribute('data-night','true');shot('390-night')
   if route in ['wuhan.html','shanghai.html','shanghai-trip.html','wuhan-trip.html']:
    isTravel=route in ['shanghai-trip.html','wuhan-trip.html'];id='university' if route in ['wuhan.html','wuhan-trip.html'] else 'disney';nav=f'[data-overview={id}]' if isTravel else f'[data-landmark={id}]'
    page.locator(nav).click();expect(canvas).to_have_attribute('data-focus',id);canvas.scroll_into_view_if_needed();shot('390-focus')
    page.locator('#manage-landmarks').click();expect(page.locator('#landmark-manager')).to_be_visible();assert page.locator('#landmark-manager').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight+1')
    page.locator(f'[data-module={id}]').click();expect(canvas).to_have_attribute('data-module-count','16');expect(canvas).to_have_attribute('data-focus','overview');shot('390-manager');page.locator('.lm-close').click()
    page.reload(wait_until='networkidle');expect(canvas).to_have_attribute('data-module-count','16',timeout=90000);page.locator('#manage-landmarks').click();page.locator('.lm-reset').click();page.locator('.lm-close').click();expect(canvas).to_have_attribute('data-module-count','17')
    report['checks'].append(name+': focus, night, full-module remove, reload persistence and restore')
   # Real touch input: a two-finger zoom followed by a drag must not select a building.
   canvas.scroll_into_view_if_needed();box=canvas.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2;cdp=c.new_cdp_session(page)
   previous=canvas.get_attribute('data-focus');before=canvas.screenshot()
   def touches(kind,pts):cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':px,'y':py,'id':i,'radiusX':2,'radiusY':2,'force':1} for i,px,py in pts]})
   touches('touchStart',[(1,x-25,y),(2,x+25,y)])
   for step in range(1,6):touches('touchMove',[(1,x-25-step*4,y),(2,x+25+step*4,y)]);page.wait_for_timeout(40)
   touches('touchEnd',[]);page.wait_for_timeout(150)
   touches('touchStart',[(1,x,y)])
   for step in range(1,7):touches('touchMove',[(1,x+step*10,y-step*5)]);page.wait_for_timeout(40)
   touches('touchEnd',[]);page.wait_for_timeout(200)
   assert canvas.get_attribute('data-focus')==previous
   if route in ['','shanghai-trip.html','wuhan-trip.html']:expect(page.locator('#sheet')).not_to_be_visible()
   assert before!=canvas.screenshot();report['checks'].append(name+': CDP touch pinch and drag change image without accidental selection')
   if not route:
    page.locator('#decorate-planet').click();page.locator('[data-inspect=boat]').click();shot('390-inspection')
    page.locator('#inspection-return').click();page.locator('[data-piece=boat]').click();page.locator('[data-piece=boat]').click();page.locator('#close-sheet').click()
    report['checks'].append('Hangzhou decoration inspection, add/remove and return fit the touch viewport')
   for width,height in [(320,740),(844,390),(768,1024),(1440,960)]:
    page.set_viewport_size({'width':width,'height':height});page.locator('#overview' if route in ['wuhan.html','shanghai.html'] else '#reset-planet').click();page.evaluate('window.scrollTo(0,0)');shot(str(width))
   c.close()
  b.close()
 assert not report['errors'] and not report['writes']
 report['complete']=True
finally:
 s.terminate();s.wait(timeout=10)
 (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k not in ['generatedPlans','roomId']},ensure_ascii=True))
