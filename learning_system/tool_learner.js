// learning_system/tool_learner.js
const fs = require('fs').promises;
const path = require('path');

class ToolLearner {
  constructor() {
    this.commandHistory = [];
    this.gapPatterns = new Map();
    this.successMetrics = new Map();
    this.dataPath = path.join(__dirname, '../data/learning_metrics.json');
  }

  async recordCommand(directive, success, executionTime, toolsUsed = []) {
    const record = {
      directive,
      success,
      executionTime,
      toolsUsed,
      timestamp: new Date().toISOString(),
      patterns: this.extractPatterns(directive)
    };
    
    this.commandHistory.push(record);
    await this.updateMetrics(record);
    await this.persistData();
  }

  extractPatterns(directive) {
    const lower = directive.toLowerCase();
    const patterns = [];
    
    // Business patterns
    if (/shopify|ecommerce|store/.test(lower)) patterns.push('shopify_automation');
    if (/discord|bot/.test(lower)) patterns.push('discord_bot');
    if (/tiktok|analytics/.test(lower)) patterns.push('tiktok_analytics');
    if (/crypto|trading/.test(lower)) patterns.push('crypto_trading');
    if (/email|outreach/.test(lower)) patterns.push('email_automation');
    if (/crm|leads/.test(lower)) patterns.push('crm_automation');
    if (/dashboard|analytics/.test(lower)) patterns.push('dashboard_creation');
    if (/api|integration/.test(lower)) patterns.push('api_integration');
    if (/payment|stripe/.test(lower)) patterns.push('payment_processing');
    if (/saas|subscription/.test(lower)) patterns.push('saas_builder');
    
    return patterns;
  }

  async analyzeGaps() {
    const recentCommands = this.commandHistory.slice(-100);
    const failurePatterns = recentCommands.filter(cmd => !cmd.success);
    const gaps = new Map();
    
    // Analyze patterns in failed commands
    for (const failure of failurePatterns) {
      for (const pattern of failure.patterns) {
        gaps.set(pattern, (gaps.get(pattern) || 0) + 1);
      }
    }
    
    // Identify high-demand patterns without existing tools
    const highDemandGaps = Array.from(gaps.entries())
      .filter(([pattern, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      gaps: highDemandGaps,
      recommendations: this.generateToolRecommendations(highDemandGaps)
    };
  }

  generateToolRecommendations(gaps) {
    const recommendations = [];
    
    for (const [pattern, demand] of gaps) {
      switch (pattern) {
        case 'shopify_automation':
          recommendations.push({
            name: 'shopify_store_creator',
            description: 'Create and configure Shopify stores with products, themes, and apps',
            priority: demand,
            estimatedDev: '3-5 days'
          });
          break;
        case 'discord_bot':
          recommendations.push({
            name: 'discord_bot_generator',
            description: 'Generate Discord bots with commands, slash commands, and webhooks',
            priority: demand,
            estimatedDev: '2-4 days'
          });
          break;
        case 'tiktok_analytics':
          recommendations.push({
            name: 'tiktok_analytics_dashboard',
            description: 'Create TikTok analytics dashboard with trending content analysis',
            priority: demand,
            estimatedDev: '4-6 days'
          });
          break;
        case 'crypto_trading':
          recommendations.push({
            name: 'crypto_trading_bot',
            description: 'Build automated crypto trading strategies with risk management',
            priority: demand,
            estimatedDev: '5-7 days'
          });
          break;
        default:
          recommendations.push({
            name: `${pattern}_tool`,
            description: `Automated tool for ${pattern.replace('_', ' ')} workflows`,
            priority: demand,
            estimatedDev: '3-5 days'
          });
      }
    }
    
    return recommendations;
  }

  async updateMetrics(record) {
    // Update success rates per tool
    for (const tool of record.toolsUsed) {
      if (!this.successMetrics.has(tool)) {
        this.successMetrics.set(tool, { successes: 0, failures: 0, avgTime: 0 });
      }
      const metrics = this.successMetrics.get(tool);
      if (record.success) {
        metrics.successes++;
      } else {
        metrics.failures++;
      }
      metrics.avgTime = (metrics.avgTime + record.executionTime) / 2;
    }
  }

  async getToolPerformance() {
    const performance = [];
    for (const [tool, metrics] of this.successMetrics.entries()) {
      const total = metrics.successes + metrics.failures;
      const successRate = total > 0 ? (metrics.successes / total) * 100 : 0;
      performance.push({
        tool,
        successRate,
        totalUses: total,
        avgExecutionTime: metrics.avgTime
      });
    }
    return performance.sort((a, b) => b.successRate - a.successRate);
  }

  async persistData() {
    try {
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      await fs.writeFile(this.dataPath, JSON.stringify({
        commandHistory: this.commandHistory.slice(-1000), // Keep last 1000 commands
        successMetrics: Object.fromEntries(this.successMetrics),
        lastUpdated: new Date().toISOString()
      }, null, 2));
    } catch (e) {
      console.warn('Failed to persist learning data:', e.message);
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const parsed = JSON.parse(data);
      this.commandHistory = parsed.commandHistory || [];
      this.successMetrics = new Map(Object.entries(parsed.successMetrics || {}));
    } catch (e) {
      console.log('No existing learning data found, starting fresh');
    }
  }
}

module.exports = { ToolLearner };