from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "renders"
OUT.mkdir(exist_ok=True)
URL = "http://127.0.0.1:4173/"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

viewports = {
    "desktop": {"width": 1440, "height": 1000},
    "mobile": {"width": 390, "height": 844},
}

results = {}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True)
    for name, viewport in viewports.items():
        page = browser.new_page(viewport=viewport, device_scale_factor=1)
        errors = []
        page.on("console", lambda msg: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(f"pageerror:{exc}"))
        page.goto(URL, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(800)
        metrics = page.evaluate("""() => {
          const de = document.documentElement;
          const offenders = [...document.querySelectorAll('body *')].map(el => {
            const r = el.getBoundingClientRect();
            return {tag: el.tagName, cls: el.className || '', left:r.left, right:r.right, width:r.width};
          }).filter(x => x.right > de.clientWidth + 1 || x.left < -1).slice(0,20);
          return {innerWidth, clientWidth:de.clientWidth, scrollWidth:de.scrollWidth, scrollHeight:de.scrollHeight, offenders};
        }""")
        page.screenshot(path=str(OUT / f"amy-redesign-{name}-full.png"), full_page=True)
        page.locator(".hero").screenshot(path=str(OUT / f"amy-redesign-{name}-hero.png"))
        results[name] = {"metrics": metrics, "errors": errors}
        page.close()
    browser.close()

(OUT / "render-metrics.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
print(json.dumps(results, indent=2))
