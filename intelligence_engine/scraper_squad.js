// intelligence_engine/scraper_squad.js
const { DataProcessor } = require('./data_processor');
const { ComplianceChecker } = require('./compliance_checker');
const MarketResearcher = require('../scrapers/market_researcher');
const LeadMiner = require('../scrapers/lead_miner');
const ProductAnalyzer = require('../scrapers/product_analyzer');
const ContentHarvester = require('../scrapers/content_harvester');
const SocialListener = require('../scrapers/social_listener');

class ScraperSquad {
  constructor() {
    this.agents = {
      market_researcher: new MarketResearcher(),
      lead_miner: new LeadMiner(),
      product_analyzer: new ProductAnalyzer(),
      content_harvester: new ContentHarvester(),
      social_listener: new SocialListener(),
    };
    this.processor = new DataProcessor();
    this.compliance = new ComplianceChecker();
  }

  async analyzeIntelNeeds(directive) {
    const lower = String(directive?.topic || directive || '').toLowerCase();
    const plan = { tasks: [], sources: [] };
    if (/competitor|market|pricing|feature/.test(lower)) plan.tasks.push('market_research');
    if (/lead|customer|prospect|contact/.test(lower)) plan.tasks.push('lead_mining');
    if (/content|article|blog|news|paper|research/.test(lower)) plan.tasks.push('content');
    if (/social|twitter|reddit|sentiment/.test(lower)) plan.tasks.push('social');
    return plan;
  }

  async deployScrapingAgents(plan, args = {}) {
    const out = { results: {}, sources: [] };
    for (const task of plan.tasks) {
      if (task === 'market_research') out.results.market = await this.agents.market_researcher.analyzeCompetitors(args);
      if (task === 'lead_mining') out.results.leads = await this.agents.lead_miner.findPotentialCustomers(args);
      if (task === 'content') out.results.content = await this.agents.content_harvester.harvest(args);
      if (task === 'social') out.results.social = await this.agents.social_listener.listen(args);
    }
    return out;
  }

  async processRawData(bundle) {
    return this.processor.normalize(bundle?.results || {});
  }

  async executeReconnaissance(params = {}) {
    await this.compliance.validate(params?.targets || [], params?.purpose || 'intelligence');
    const plan = await this.analyzeIntelNeeds(params);
    const raw = await this.deployScrapingAgents(plan, params);
    const data = await this.processRawData(raw);
    return { data, sources: raw.sources || [], status: 'INTEL_COMPLETE' };
  }

  // Convenience wrappers used by tools
  async analyzeCompetitors(params = {}) { return this.agents.market_researcher.analyzeCompetitors(params); }
  async findLeads(params = {}) { return this.agents.lead_miner.findPotentialCustomers(params); }
  async harvestContent(params = {}) { return this.agents.content_harvester.harvest(params); }
  async listenSocial(params = {}) { return this.agents.social_listener.listen(params); }
}

module.exports = { ScraperSquad };
