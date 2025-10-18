// scrapers/market_researcher.js
const { fetch } = require('undici');
const cheerio = require('cheerio');

class MarketResearcher {
  async analyzeCompetitors({ competitors = [], sources = [], topic = '' } = {}) {
    const results = [];
    const targets = [...sources];
    // If competitors given, try visiting their homepages
    for (const c of competitors) {
      if (/^https?:\/\//.test(c)) targets.push(c);
      else targets.push(`https://www.google.com/search?q=${encodeURIComponent(c + ' ' + topic)}`);
    }
    for (const url of targets.slice(0, 5)) {
      try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);
        const title = $('title').first().text();
        results.push({ url, title });
      } catch (e) {
        results.push({ url, error: String(e?.message || e) });
      }
    }
    return results;
  }
}

module.exports = MarketResearcher;
