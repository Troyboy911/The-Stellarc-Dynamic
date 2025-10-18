const Agent = require('../Agent');

class AgentGenerator {
    constructor(openaiApiKey, toolRegistry) {
        this.openaiApiKey = openaiApiKey;
        this.toolRegistry = toolRegistry;
        // Map high-level tags to tool names available for that role
        this.tagToolsMap = {
            infrastructure: ['deployAzureInfrastructure'],
            business: ['generateBusinessModel', 'createFile'],
            development: ['generateCode', 'createFile', 'runCommand'],
            deployment: ['prepareDeployment'],
            intelligence: ['marketAnalysisScraper', 'leadExtractionAutomation', 'contentResearchHarvester', 'socialSentimentAnalyzer', 'browserWorkflowAutomator']
        };
        this.tagGoals = {
            infrastructure: 'Provision and configure cloud infrastructure as requested.',
            business: 'Design monetization and go-to-market assets for the directive.',
            development: 'Produce application source code and supporting files.',
            deployment: 'Prepare CI/CD or deployment artifacts.',
            intelligence: 'Gather market intelligence, extract leads, and automate browser workflows compliantly.'
        };
    }

    synthesizeTeam(requiredAgents = []) {
        return requiredAgents.map(tag => {
            const toolNames = this.tagToolsMap[tag] || [];
            const tools = this.toolRegistry.getTools(toolNames);
            const role = `${tag}-agent`;
            const goal = this.tagGoals[tag] || 'Execute assigned tasks effectively.';
            return new Agent(role, goal, tools, this.openaiApiKey);
        });
    }
}

module.exports = AgentGenerator;
