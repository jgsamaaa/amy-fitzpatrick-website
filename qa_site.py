from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import urlopen
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "renders" / "pages"
OUT.mkdir(parents=True, exist_ok=True)
BASE = "http://127.0.0.1:4173/"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PAGES = ["index.html","services.html","properties.html","property.html","portfolio.html","project.html","stays.html","stay-carolina-house.html","stay-carolina-north.html","stay-carolina-south.html","stay-charleston.html","meet.html","contact.html"]
VIEWPORTS = {"desktop":{"width":1440,"height":1000},"mobile":{"width":390,"height":844}}
results = {"pages":{},"links":{},"interactions":{}}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True)
    for viewport_name, viewport in VIEWPORTS.items():
        for filename in PAGES:
            page = browser.new_page(viewport=viewport, device_scale_factor=1)
            errors=[]
            page.on("console", lambda msg, errors=errors: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
            page.on("pageerror", lambda exc, errors=errors: errors.append(f"pageerror:{exc}"))
            response=page.goto(urljoin(BASE,filename),wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            page.wait_for_timeout(300)
            metrics=page.evaluate("""() => {
              const de=document.documentElement;
              const broken=[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'));
              const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
              const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
              return {title:document.title,status:document.readyState,innerWidth,clientWidth:de.clientWidth,scrollWidth:de.scrollWidth,scrollHeight:de.scrollHeight,brokenImages:broken,duplicateIds:[...new Set(duplicateIds)]};
            }""")
            page.screenshot(path=str(OUT/f"{Path(filename).stem}-{viewport_name}.png"),full_page=True)
            results["pages"][f"{filename}:{viewport_name}"]={"http":response.status if response else None,"metrics":metrics,"errors":errors}
            if filename=="stays.html" and viewport_name=="desktop":
                days=page.locator('.calendar-day:not([disabled]):not(.muted)')
                days.nth(0).click(); days.nth(3).click()
                results['interactions']['stayCalendar']={
                    'start':page.locator('#calendar-start').inner_text(),
                    'end':page.locator('#calendar-end').inner_text(),
                    'href':page.locator('[data-date-link]').get_attribute('href')
                }
                page.locator('.stay-choice').nth(2).click()
                results['interactions']['staySelector']=page.locator('[data-calendar-property]').inner_text()
            if filename=="contact.html" and viewport_name=="desktop":
                day=page.locator('.calendar-day:not([disabled]):not(.muted)').first
                day.click()
                results['interactions']['consultationCalendar']=page.locator('#calendar-start').inner_text()
                page.locator('input[name="intent"][value="buyer"]').check()
                results['interactions']['contactIntent']=page.locator('input[name="intent"][value="buyer"]').is_checked()
            if filename=="portfolio.html" and viewport_name=="desktop":
                page.locator('.filter-btn[data-filter="renovation"]').click()
                results['interactions']['portfolioFilter']={
                    'visible':page.locator('.project-card:not([hidden])').count(),
                    'hidden':page.locator('.project-card[hidden]').count()
                }
            if filename=="services.html" and viewport_name=="mobile":
                page.locator('.menu-toggle').click()
                results['interactions']['mobileMenu']={
                    'expanded':page.locator('.menu-toggle').get_attribute('aria-expanded'),
                    'open':page.locator('.mobile-panel').evaluate("el=>el.classList.contains('open')")
                }
            page.close()
    browser.close()

# Validate every authored local link from every page.
from html.parser import HTMLParser
class LinkParser(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=='a':
            href=dict(attrs).get('href')
            if href: self.links.append(href)
for filename in PAGES:
    parser=LinkParser(); parser.feed((ROOT/filename).read_text(encoding='utf-8'))
    checks=[]
    for href in sorted(set(parser.links)):
        parsed=urlparse(href)
        if parsed.scheme in ('http','https','mailto','tel') or href.startswith('#'): continue
        target=urljoin(BASE,href)
        try:
            with urlopen(target,timeout=10) as r: status=r.status
        except Exception as exc:
            status=f"ERROR:{exc}"
        checks.append({'href':href,'status':status})
    results['links'][filename]=checks

(ROOT/'renders'/'site-qa.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
