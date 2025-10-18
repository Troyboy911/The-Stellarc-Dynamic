# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Common commands
- Quick run a directive (PowerShell):

```sh path=null start=null
node -e "const O=require('./the_stellarc_dynamic');(async()=>{const o=new O();const d=process.argv.slice(1).join(' ')||'hello';const r=await o.executeDirective(d);console.log(JSON.stringify(r,null,2));})();" "Build and deploy a simple web service to Azure with a monetization plan"
```

- Start baseline (does not execute a directive): npm start
- Programmatic usage:

```js path=null start=null
const TheStellarcDynamic = require('./the_stellarc_dynamic');
(async () => {
  const orchestrator = new TheStellarcDynamic();
  const result = await orchestrator.executeDirective('Build and deploy a simple web service to Azure with a monetization plan');
  console.log(JSON.stringify(result, null, 2));
})();
```

- Build: not required (plain Node.js/CommonJS)
- Lint: not configured
- Tests: not configured
- Install deps: npm install
- Configure OpenAI: set OPENAI_API_KEY before running directives that use tool-calling agents

Architecture overview (big picture)
- Orchestrator (the_stellarc_dynamic.js)
  - Wires subsystems, exposes executeDirective(directive)
  - Routes based on tags, aggregates agent outputs into deliverables
- Dominus Core planner (dominus_core/command_processor.js)
  - Heuristic deconstruction of natural language → { description, required_agents, tags, tasks }
  - Tag routing keywords:
    - infrastructure: infra|azure|cloud|kubernetes|terraform
    - business: business|monetize|revenue|pricing|market
    - development: dev|code|build|feature|api|service
    - deployment: deploy|release|pipeline|ci|cd
- Synthetica Engine (synthetica_engine/agent_generator.js)
  - Produces tool-calling Agent instances per tag using a ToolRegistry
- Specialized Agents (agents/*)
  - azure_commander, business_builder, code_execution, deployment_automator are wrapped as callable tools in ToolRegistry so Agents can invoke them via OpenAI function-calling
- Orchestration Layer (orchestration_layer/task_manager.js)
  - Iterates tasks and simulates progress logging
- UCI Backend (uci_backend/server.js)
  - logStatus(message) prints [UCI:3000] timestamped status; no network server
- Tooling (toolRegistry.js, Agent.js)
  - ToolRegistry registers tools; Agent uses OpenAI function-calling to invoke them during tasks
- Intelligence Engine (intelligence_engine/, scrapers/)
  - ScraperSquad coordinates scrapers (market research, leads, content, social) and optional BrowserAgent (Playwright)
  - Tools registered: marketAnalysisScraper, leadExtractionAutomation, contentResearchHarvester, socialSentimentAnalyzer, browserWorkflowAutomator
  - Optional install for browser workflows: npm install playwright

Delivery contract
- executeDirective returns:
  - status: "MISSION_ACCOMPLISHED"
  - deliverables: { infrastructure, application, business_model, deployment_scripts }
  - next_actions: ordered list of follow-ups

Extension points
- Add a new capability:
  1) Update dominus_core/command_processor.js to emit a new tag from keywords
  2) Implement agents/<new_agent>.js with async execute(description) returning a normalized object
  3) Register it in specializedAgents within the_stellarc_dynamic.js and extend routing in _executeWithSpecializedAgents

Repository layout (high-level)
- the_stellarc_dynamic.js — orchestrator
- agents/ — infra, business, code, deployment implementations
- dominus_core/ — directive parsing and plan
- synthetica_engine/ — team synthesis
- orchestration_layer/ — workflow coordination
- uci_backend/ — status logging
- README.md — minimal usage example

Notes
- npm start loads the module but does not run a directive; use the one-liner or programmatic snippet for real runs.
- Chat UI: npm run start:ui then open http://localhost:4000 and send directives via the web chat.
- Deploy (Docker): docker build -t stellarc-chat . && docker run -p 4000:4000 stellarc-chat. In EasyPanel, deploy from Dockerfile and expose 4000.
- When tests/lint are introduced, add their commands here (include how to run a single test).
