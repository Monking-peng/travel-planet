"""Headless browser acceptance for the new city viewers; isolated memory service."""
from pathlib import Path
import os,sys,subprocess,shutil,threading,queue,re,json,datetime
from playwright.sync_api import sync_playwright,expect

root=Path(__file__).resolve().parents[1]
city=sys.argv[1] if len(sys.argv)>1 else 'beijing'
configs={'beijing':{'count':12,'focus':'heaven','first':'palace','night':['palace','tiananmen','jingshan','drum','heaven','summer','wall','nest','watercube','cctv'],'routes':['','shanghai-trip.html','wuhan-trip.html','shanghai.html','wuhan.html','shenzhen.html']},'shenzhen':{'count':13,'focus':'cocoon','first':'pingan','night':['pingan','bamboo','diwang','civic','culture','cocoon','lianhua','kk100','wheel','window','dapeng','minghua','talent'],'routes':['','shanghai-trip.html','wuhan-trip.html','shanghai.html','wuhan.html','beijing.html']}}
configs['shunde']={'count':8,'focus':'qinghui','first':'qinghui','night':['qinghui','shunfeng','hem','huagai','fengjian','theatre','bijiang','baolin'],'routes':['','shanghai-trip.html','wuhan-trip.html','shanghai.html','wuhan.html','beijing.html','shenzhen.html']}
configs['guangzhou']={'count':11,'focus':'shamian','first':'canton','night':['canton','twins','opera','museum','memorial','chen','cathedral','rams','haixin','huacheng','shamian'],'routes':['','shanghai-trip.html','wuhan-trip.html','shanghai.html','wuhan.html','beijing.html','shenzhen.html','shunde.html']}
configs['changsha']={'count':10,'focus':'dufu','first':'dufu','night':['juzizhou','dufu','yuelu','aiwan','tianxin','juzhouBridge','ifs','museum','meixi','xie'],'routes':['','shanghai-trip.html','wuhan-trip.html','shanghai.html','wuhan.html','beijing.html','shenzhen.html','shunde.html','guangzhou.html']}
assert city in configs, 'Unknown city viewer'
config=configs[city];count=config['count'];focus=config['focus'];first=config['first']
out=root/'test-results'/('destination-'+city);out.mkdir(parents=True,exist_ok=True)
report={'startedAt':datetime.datetime.now().astimezone().isoformat(),'city':city,'errors':[],'writes':[],'checks':[],'inspected':False}
env={**os.environ,'PORT':'0','HOST':'127.0.0.1','TRAVEL_DB':':memory:','TRAVEL_AI_KEY':'','TRAVEL_AI_BASE_URL':'','TRAVEL_AI_MODEL':'','COOKIE_SECURE':'false','COOKIE_PATH':'/','TRUST_PROXY':'false'}
server=subprocess.Popen([shutil.which('node'),'server/index.cjs'],cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
    q=queue.Queue();threading.Thread(target=lambda:[q.put(x) for x in server.stdout],daemon=True).start()
    while True:
        m=re.search(r'http://127\.0\.0\.1:\d+',q.get(timeout=20))
        if m:base=m.group(0)+'/';break
    with sync_playwright() as p:
        browser=p.chromium.launch(channel=os.environ.get('BROWSER_CHANNEL','msedge'),headless=True,args=['--mute-audio'])
        context=browser.new_context(viewport={'width':1440,'height':960},device_scale_factor=1,has_touch=True,reduced_motion='reduce')
        page=context.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)));page.on('request',lambda r:report['writes'].append(r.url) if r.method not in ['GET','HEAD','OPTIONS'] else None)
        def ready():expect(page.locator('#destination')).to_have_attribute('data-state','ready',timeout=90000)
        def shot(name):
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
            page.screenshot(path=str(out/(name+'.png')),full_page=True)
        page.goto(base+city+'.html',wait_until='networkidle');ready();canvas=page.locator('#destination')
        ids=page.locator('[data-landmark]').evaluate_all('(els)=>els.map(e=>e.dataset.landmark)');assert len(ids)==count
        shot('desktop-overview')
        for id in ids:
            page.locator('[data-landmark='+id+']').click();expect(canvas).to_have_attribute('data-focus',id);expect(page.locator('#detail')).to_be_visible();shot('desktop-'+id)
        report['checks'].append('Every named landmark has a reachable focused view and source link on both hemispheres')
        page.locator('#night').click();expect(canvas).to_have_attribute('data-night','true');page.locator('#overview').click();shot('desktop-night')
        for id in config['night']:
            page.locator('[data-landmark='+id+']').click();shot('night-'+id)
        page.emulate_media(reduced_motion='no-preference');page.wait_for_timeout(800);before=canvas.screenshot();page.wait_for_timeout(1800);assert before!=canvas.screenshot();page.emulate_media(reduced_motion='reduce')
        page.set_viewport_size({'width':390,'height':844});page.locator('[data-landmark='+focus+']').click();shot('390-'+focus+'-night')
        page.locator('#manage-landmarks').click();expect(page.locator('#landmark-manager')).to_be_visible();assert page.locator('#landmark-manager').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight+1')
        page.locator('[data-module='+focus+']').click();expect(canvas).to_have_attribute('data-module-count',str(count-1));expect(canvas).to_have_attribute('data-focus','overview');shot('390-manager');page.locator('.lm-close').click()
        page.reload(wait_until='networkidle');ready();expect(canvas).to_have_attribute('data-module-count',str(count-1));expect(canvas).to_have_attribute('data-night','true');expect(page.locator('[data-landmark='+focus+']')).to_be_disabled()
        page.locator('#manage-landmarks').click();page.locator('.lm-reset').click();page.locator('.lm-close').click();expect(canvas).to_have_attribute('data-module-count',str(count));page.locator('[data-landmark='+focus+']').click();expect(canvas).to_have_attribute('data-focus',focus)
        report['checks'].append('Whole-module removal returns to overview, persists with night mode on reload, and restores all city modules')
        page.locator('#overview').click();canvas.scroll_into_view_if_needed();box=canvas.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2;cdp=context.new_cdp_session(page);before=canvas.screenshot()
        def touches(kind,points):cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':px,'y':py,'id':i,'radiusX':2,'radiusY':2,'force':1} for i,px,py in points]})
        touches('touchStart',[(1,x-25,y),(2,x+25,y)])
        for i in range(1,7):touches('touchMove',[(1,x-25-i*4,y),(2,x+25+i*4,y)]);page.wait_for_timeout(40)
        touches('touchEnd',[]);touches('touchStart',[(1,x,y)])
        for i in range(1,7):touches('touchMove',[(1,x+i*12,y-i*8)]);page.wait_for_timeout(40)
        touches('touchEnd',[]);page.wait_for_timeout(100);assert before!=canvas.screenshot();expect(canvas).to_have_attribute('data-focus','overview')
        canvas.focus();before=canvas.screenshot()
        for i in range(55):canvas.press('ArrowUp')
        page.wait_for_timeout(200);assert before!=canvas.screenshot();canvas.press('0');expect(canvas).to_have_attribute('data-focus','overview')
        report['checks'].append('Actual touch pinch and drag plus keyboard orbit change the view without accidental landmark selection; overview resets')
        for width,height in [(320,740),(390,844),(844,390),(768,1024),(1000,700)]:
            page.set_viewport_size({'width':width,'height':height});page.locator('#overview').click();page.evaluate('scrollTo(0,0)');shot(str(width)+'-overview')
            if width==320:
                page.locator('[data-landmark='+first+']').click();shot('320-'+first)
                assert page.locator('.scene-controls button').evaluate_all('(els)=>Math.max(...els.map(e=>e.getBoundingClientRect().top))-Math.min(...els.map(e=>e.getBoundingClientRect().top))<2'), 'Small-screen controls should share one row'
                assert page.locator('.city-switch [aria-current=page]').evaluate('(e)=>{const r=e.getBoundingClientRect(),n=e.parentElement.getBoundingClientRect();return r.left>=n.left-1&&r.right<=n.right+1}'), 'Current city should be visible in the scrolled navigation'
        page.evaluate("document.querySelector('#destination').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
        expect(canvas).to_have_attribute('data-state','error');expect(page.locator('#retry')).to_be_visible();page.locator('#retry').click();ready();assert page.locator('#landmark-manager').count()==1
        report['checks'].append('320/390/768/844/1000 layouts fit; real WebGL loss presents retry and a clean single-manager recovery')
        for route in config['routes']:
            page.goto(base+route,wait_until='domcontentloaded');link=page.locator('a[href="./'+city+'.html"]');expect(link).to_have_count(1);expect(link).to_be_visible();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        report['checks'].append('Existing city entries link to this destination without changing their travel or map route')
        context.close();browser.close()
    assert not report['errors'] and not report['writes'];report['complete']=True
finally:
    server.terminate();server.wait(timeout=10);report['finishedAt']=datetime.datetime.now().astimezone().isoformat();(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=True))
