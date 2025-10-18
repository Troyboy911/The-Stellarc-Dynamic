// intelligence_engine/data_processor.js
class DataProcessor {
  normalize(results = {}) {
    return {
      market: results.market || [],
      leads: results.leads || [],
      content: results.content || [],
      social: results.social || [],
      summary: this._summary(results)
    };
  }

  _summary(results) {
    const keys = Object.keys(results);
    return {
      sections: keys,
      counts: Object.fromEntries(keys.map(k => [k, Array.isArray(results[k]) ? results[k].length : 0]))
    };
  }
}

module.exports = { DataProcessor };