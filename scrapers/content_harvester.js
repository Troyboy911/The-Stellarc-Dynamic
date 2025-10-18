// scrapers/content_harvester.js
const { fetch } = require('undici');
const cheerio = require('cheerio');

class ContentHarvester {
  async harvest({ urls = [], topic = '' } = {}) {
    const out = [];
    for (const url of urls.slice(0, 5)) {
      try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);
        const title = $('title').first().text();
        const meta = $('meta[name="description"]').attr('content') || '';
        out.push({ url, title, description: meta });
      } catch (e) {
        out.push({ url, error: String(e?.message || e) });
      }
    }
    return out;
  }
}

module.exports = ContentHarvester;
