// the_stellarc_dynamic.js - HYBRID BAD MOTHERFUCKER
const CommandProcessor = require('./dominus_core/command_processor');
const AgentGenerator = require('./synthetica_engine/agent_generator');
const TaskManager = require('./orchestration_layer/task_manager');
const UCIServer = require('./uci_backend/server');
const { ToolRegistry, Tool } = require('./toolRegistry');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { ToolLearner } = require('./learning_system/tool_learner');
const { ToolGeneratorAgent } = require('./learning_system/tool_generator_agent');

// ADD MY BAD MOTHERFUCKER AGENTS (wrapped as tools below)
const AzureCommander = require('./agents/azure_commander');
const BusinessBuilder = require('./agents/business_builder');
const CodeExecution = require('./agents/code_execution');
const DeploymentAutomator = require('./agents/deployment_automator');

class TheStellarcDynamic {
    constructor() {
        console.log("\uD83D\uDE80 INITIALIZING STELLARC DYNAMIC - BAD MOTHERFUCKER EDITION");
        
        // YOUR CORE ARCHITECTURE
        this.commandProcessor = new CommandProcessor();
        this.taskManager = new TaskManager();
        this.uci = new UCIServer(3000);

        // Tool registry and tool-backed agent generator
        this.toolRegistry = new ToolRegistry();
        this._registerTools();
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
        this.agentGenerator = new AgentGenerator(OPENAI_API_KEY, this.toolRegistry);

        // Learning system
        this.toolLearner = new ToolLearner();
        this.toolGenerator = new ToolGeneratorAgent(this.toolRegistry, OPENAI_API_KEY);
        
        // (Optional) keep direct agents for fast-path execution
        this.specializedAgents = {
            'infrastructure': new AzureCommander(),
            'business': new BusinessBuilder(), 
            'code': new CodeExecution(),
            'deployment': new DeploymentAutomator()
        };
        
        console.log("✅ HYBRID ORCHESTRATOR ONLINE - READY FOR DIRECTIVES");
    }

    async executeDirective(directive) {
        console.log(`\n[DIRECTIVE RECEIVED]: "${directive}"`);

        // 1. USE YOUR DOMINUS CORE FOR STRATEGIC DECONSTRUCTION
        this.uci.logStatus('Dominus Core analyzing directive...');
        const strategicPlan = await this.commandProcessor.deconstruct(directive);
        
        // 2. USE YOUR SYNTHETICA ENGINE FOR AGENT FLEET (tool-calling agents)
        this.uci.logStatus('Synthetica Engine synthesizing agent fleet...');
        const agentTeam = this.agentGenerator.synthesizeTeam(strategicPlan.required_agents);
        
        // 3. ORCHESTRATION LAYER RUNS TASKS THROUGH AGENTS
        await this.taskManager.orchestrate(agentTeam, strategicPlan.tasks);

        // 4. Optionally run direct specialized agents for deliverables aggregation
        this.uci.logStatus('Direct agents producing deliverables...');
        const started = Date.now();
        const results = await this._executeWithSpecializedAgents(strategicPlan, agentTeam);
        const durationMs = Date.now() - started;

        // 5. Learning: record directive outcome and consider tool generation
        try {
            const success = true; // heuristic placeholder
            const toolsUsed = []; // future: collect from Agent executions
            await this.toolLearner.recordCommand(String(directive), success, durationMs, toolsUsed);
            const { gaps, recommendations } = await this.toolLearner.analyzeGaps();
            if ((gaps || []).length) {
                this.uci.logStatus(`Learning detected gaps: ${gaps.map(g=>g[0]).join(', ')}`);
            }
        } catch (e) {
            console.warn('Learning system failed:', e?.message || e);
        }
        
        return this._deliverFinalProduct(results);
    }

    async _executeWithSpecializedAgents(strategicPlan, agentTeam) {
        const results = {};
        
        // INFRASTRUCTURE COMMANDS → AZURE COMMANDER
        if (strategicPlan.tags.includes('infrastructure')) {
            results.infrastructure = await this.specializedAgents.infrastructure.execute(
                strategicPlan.description
            );
        }
        
        // BUSINESS COMMANDS → BUSINESS BUILDER  
        if (strategicPlan.tags.includes('business') || strategicPlan.tags.includes('monetize')) {
            results.business = await this.specializedAgents.business.execute(
                strategicPlan.description
            );
        }
        
        // CODE GENERATION → CODE EXECUTION
        if (strategicPlan.tags.includes('development') || strategicPlan.tags.includes('build')) {
            results.code = await this.specializedAgents.code.execute(
                strategicPlan.description
            );
        }
        
        // DEPLOYMENT → DEPLOYMENT AUTOMATOR
        if (strategicPlan.tags.includes('deployment')) {
            results.deployment = await this.specializedAgents.deployment.execute(
                strategicPlan.description
            );
        }
        
        return results;
    }

    _deliverFinalProduct(results) {
        // COMBINE ALL OUTPUTS INTO DEPLOYABLE PACKAGE
        return {
            status: "MISSION_ACCOMPLISHED",
            deliverables: {
                infrastructure: results.infrastructure?.terraform_files,
                application: results.code?.source_code, 
                business_model: results.business?.monetization_plan,
                deployment_scripts: results.infrastructure?.deployment_scripts || results.deployment?.scripts
            },
            next_actions: [
                "1. Run: terraform apply",
                "2. Deploy application",
                "3. Configure payments", 
                "4. Launch marketing"
            ]
        };
    }

    _registerTools() {
        const azure = new AzureCommander();
        const business = new BusinessBuilder();
        const code = new CodeExecution();
        const deploy = new DeploymentAutomator();

        // Tool: createFile
        this.toolRegistry.register(new Tool(
            'createFile',
            'Creates a file with the given content',
            {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'The file path to write' },
                    content: { type: 'string', description: 'The file content' }
                },
                required: ['path', 'content']
            },
            async ({ path, content }) => {
                await fs.writeFile(path, content);
                return { success: true, path };
            }
        ));

        // Tool: runCommand (use carefully)
        this.toolRegistry.register(new Tool(
            'runCommand',
            'Runs a shell command and returns stdout/stderr',
            {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'Command to execute' }
                },
                required: ['command']
            },
            async ({ command }) => {
                return new Promise((resolve, reject) => {
                    exec(command, { windowsHide: true }, (error, stdout, stderr) => {
                        if (error) return reject(new Error(stderr || error.message));
                        resolve({ stdout, stderr });
                    });
                });
            }
        ));

        // Tool: deployAzureInfrastructure → wraps AzureCommander
        this.toolRegistry.register(new Tool(
            'deployAzureInfrastructure',
            'Generates Terraform and deployment scripts for Azure infra from a description',
            {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Infra description / directive' }
                },
                required: ['description']
            },
            async ({ description }) => {
                return await azure.execute(description);
            }
        ));

        // Tool: generateBusinessModel → wraps BusinessBuilder
        this.toolRegistry.register(new Tool(
            'generateBusinessModel',
            'Creates a monetization plan from a description',
            {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Business directive' }
                },
                required: ['description']
            },
            async ({ description }) => {
                return await business.execute(description);
            }
        ));

        // Tool: generateCode → wraps CodeExecution
        this.toolRegistry.register(new Tool(
            'generateCode',
            'Generates source code from a description',
            {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Code directive' }
                },
                required: ['description']
            },
            async ({ description }) => {
                return await code.execute(description);
            }
        ));

        // Tool: prepareDeployment → wraps DeploymentAutomator
        this.toolRegistry.register(new Tool(
            'prepareDeployment',
            'Prepares CI/CD or deployment artifacts',
            {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Deployment directive' }
                },
                required: ['description']
            },
            async ({ description }) => {
                return await deploy.execute(description);
            }
        ));

        // Intelligence tools
        const { ScraperSquad } = require('./intelligence_engine/scraper_squad');
        const { BrowserAgent } = require('./intelligence_engine/browser_agent');
        const squad = new ScraperSquad();
        const browserAgent = new BrowserAgent();

        this.toolRegistry.register(new Tool(
            'marketAnalysisScraper',
            'Collects competitor and market intelligence from provided targets/sources',
            {
                type: 'object',
                properties: {
                    competitors: { type: 'array', items: { type: 'string' } },
                    sources: { type: 'array', items: { type: 'string' } },
                    topic: { type: 'string' }
                },
                required: []
            },
            async (args) => squad.analyzeCompetitors(args || {})
        ));

        this.toolRegistry.register(new Tool(
            'leadExtractionAutomation',
            'Find and extract potential customer leads from given criteria',
            {
                type: 'object',
                properties: {
                    industry: { type: 'string' },
                    companySize: { type: 'string' },
                    techStack: { type: 'array', items: { type: 'string' } }
                },
                required: []
            },
            async (args) => squad.findLeads(args || {})
        ));

        this.toolRegistry.register(new Tool(
            'contentResearchHarvester',
            'Harvest content/articles for a given topic from provided urls',
            {
                type: 'object',
                properties: {
                    urls: { type: 'array', items: { type: 'string' } },
                    topic: { type: 'string' }
                },
                required: []
            },
            async (args) => squad.harvestContent(args || {})
        ));

        this.toolRegistry.register(new Tool(
            'socialSentimentAnalyzer',
            'Analyze social content for sentiment around a topic',
            {
                type: 'object',
                properties: {
                    keywords: { type: 'array', items: { type: 'string' } }
                },
                required: []
            },
            async (args) => squad.listenSocial(args || {})
        ));

        this.toolRegistry.register(new Tool(
            'browserWorkflowAutomator',
            'Execute a headless browser workflow (login, extract, click, etc.)',
            {
                type: 'object',
                properties: {
                    steps: { type: 'array', items: { type: 'object' } }
                },
                required: ['steps']
            },
            async ({ steps }) => browserAgent.executeWorkflow(steps)
        ));
    }
}

// ENHANCE YOUR AGENT GENERATOR WITH MY AGENT TEMPLATES
module.exports = TheStellarcDynamic;
