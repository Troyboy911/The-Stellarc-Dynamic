// intelligence_engine/browser_agent.js
class BrowserAgent {
  async executeWorkflow(steps = []) {
    // Try to use Playwright if available; otherwise provide guidance
    let playwright;
    try {
      playwright = require('playwright');
    } catch (e) {
      throw new Error('playwright not installed. Run: npm install playwright (or use non-browser tools)');
    }

    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];

    for (const step of steps) {
      const { type, url, selector, value } = step || {};
      if (type === 'goto' && url) await page.goto(url, { waitUntil: 'networkidle' });
      else if (type === 'click' && selector) await page.click(selector);
      else if (type === 'type' && selector) await page.fill(selector, String(value ?? ''));
      else if (type === 'waitFor' && selector) await page.waitForSelector(selector, { timeout: 15000 });
      else if (type === 'extract' && selector) {
        const text = await page.locator(selector).first().innerText().catch(() => '');
        results.push({ selector, text });
      }
    }

    await browser.close();
    return { results };
  }
}

module.exports = { BrowserAgent };
