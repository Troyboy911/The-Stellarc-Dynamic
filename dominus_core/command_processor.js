class CommandProcessor {
    async deconstruct(directive) {
        // Heuristic planner that infers tags and tasks from keywords
        const lower = String(directive || '').toLowerCase();
        const tags = [];
        if (/(infra|azure|cloud|kubernetes|terraform)/.test(lower)) tags.push('infrastructure');
        if (/(business|monetize|revenue|pricing|market)/.test(lower)) tags.push('business');
        if (/(dev|code|build|feature|api|service)/.test(lower)) tags.push('development');
        if (/(deploy|release|pipeline|ci|cd)/.test(lower)) tags.push('deployment');
        if (/(research|analy[sz]e|find|monitor|scrape|leads?|competitor|intel|browser)/.test(lower)) tags.push('intelligence');

        const tasks = [
            { id: 'analyze', description: 'Analyze directive and outline steps', assignee: 'orchestrator' },
            ...(tags.includes('intelligence') ? [{ id: 'intelligence', description: 'Gather market intel / leads / web data', assignee: 'intelligence' }] : []),
            { id: 'execute', description: 'Execute with specialized agents', assignee: 'agents' },
            { id: 'assemble', description: 'Assemble final deliverables', assignee: 'orchestrator' }
        ];

        return {
            description: directive,
            required_agents: Array.from(new Set(tags)),
            tags,
            tasks
        };
    }
}

module.exports = CommandProcessor;
